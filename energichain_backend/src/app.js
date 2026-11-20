const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
const fs = require("fs");
const { PythonShell } = require("python-shell");

const auth = require("./middleware/authMiddleware");
const authRoutes = require("./routes/authRoutes");
const tradeRoutes = require("./routes/tradeRoutes");
const bookingRoutes = require("./routes/bookingRoutes");

const app = express();
const publicPath = path.join(__dirname, "..", "public");
const legacyPath = path.resolve(__dirname, "..", "..", "legacy");
const legacyPublicPath = path.join(legacyPath, "public");
const reactBuildPath = fs.existsSync(path.join(legacyPublicPath, "app"))
  ? path.join(legacyPublicPath, "app")
  : path.join(publicPath, "app");

// Trust reverse proxy (e.g. Next.js rewrite or nginx) to populate req.ip from X-Forwarded-For
app.set("trust proxy", 1);

// 1. Helmet Security Headers with explicit, minimal Content-Security-Policy
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          // 'unsafe-inline' is required for static legacy HTML pages (index.html, login.html,
          // signup.html, dashboard.html) containing inline <script> blocks.
          "'unsafe-inline'",
          "https://cdn.tailwindcss.com",
        ],
        styleSrc: [
          "'self'",
          // 'unsafe-inline' is required for inline <style> tags and Tailwind dynamic style injection
          "'unsafe-inline'",
          "https://fonts.googleapis.com",
        ],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: [
          "'self'",
          // WebSocket connection for real-time bilateral in-app chat
          "ws:",
          "wss:",
          // Ethereum RPC endpoints used by ethers provider / MetaMask
          "https://*.infura.io",
          "https://*.alchemy.com",
          "https://rpc.sepolia.org",
          "https://sepolia.infura.io",
          "https://ethereum-sepolia-rpc.publicnode.com",
        ],
        frameAncestors: ["'self'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        objectSrc: ["'none'"],
      },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// 2. Strict, Configurable CORS Allowlist
const defaultAllowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5000",
  "http://127.0.0.1:5000",
];

const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS
  ? process.env.CORS_ALLOWED_ORIGINS.split(",").map((s) => s.trim().toLowerCase())
  : defaultAllowedOrigins.map((s) => s.toLowerCase());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no Origin header (scripts, curl, native tools, server-to-server)
      if (!origin) {
        return callback(null, true);
      }
      const normalizedOrigin = origin.trim().toLowerCase();
      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }
      const corsError = new Error(`CORS origin not allowed: ${origin}`);
      corsError.statusCode = 403;
      corsError.code = "CORS_FORBIDDEN";
      return callback(corsError);
    },
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);

app.use(express.json({ limit: "256kb" }));

// 3. Configurable Auth Rate Limiting
// Differentiated limits: tighter for login to deter brute force (10 / 15m), higher for signup (20 / 15m)
const shouldSkipRateLimiting = () =>
  process.env.NODE_ENV === "test" && process.env.ENABLE_RATE_LIMIT_TEST !== "true";

const loginRateLimitMax = process.env.AUTH_LOGIN_RATE_LIMIT_MAX
  ? parseInt(process.env.AUTH_LOGIN_RATE_LIMIT_MAX, 10)
  : (shouldSkipRateLimiting() ? 10000 : 10);

const signupRateLimitMax = process.env.AUTH_SIGNUP_RATE_LIMIT_MAX
  ? parseInt(process.env.AUTH_SIGNUP_RATE_LIMIT_MAX, 10)
  : (shouldSkipRateLimiting() ? 10000 : 20);

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: loginRateLimitMax,
  skip: shouldSkipRateLimiting,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    msg: "Too many login attempts, please try again later.",
    code: "AUTH_RATE_LIMITED",
  },
});

const signupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: signupRateLimitMax,
  skip: shouldSkipRateLimiting,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    msg: "Too many account registration attempts, please try again later.",
    code: "AUTH_RATE_LIMITED",
  },
});

// Apply rate limiting specifically to credential endpoints
app.use("/auth/login", loginLimiter);
app.use("/auth/signup", signupLimiter);

// 4. Subprocess Concurrency & Execution Timeout Manager
let activeInferences = 0;
const MAX_CONCURRENT_INFERENCES = process.env.MAX_CONCURRENT_INFERENCES
  ? parseInt(process.env.MAX_CONCURRENT_INFERENCES, 10)
  : 5;
const INFERENCE_TIMEOUT_MS = process.env.INFERENCE_TIMEOUT_MS
  ? parseInt(process.env.INFERENCE_TIMEOUT_MS, 10)
  : 15000;

function runPythonInferenceWithLimit(script, options) {
  if (activeInferences >= MAX_CONCURRENT_INFERENCES) {
    const error = new Error("Inference service is currently at capacity. Please try again shortly.");
    error.statusCode = 503;
    error.code = "INFERENCE_BUSY";
    return Promise.reject(error);
  }

  activeInferences++;
  let killed = false;

  return new Promise((resolve, reject) => {
    let timer = null;
    let pyshell = null;
    let childPid = null;

    try {
      pyshell = new PythonShell(script, options);
      childPid = pyshell.childProcess ? pyshell.childProcess.pid : null;
    } catch (instError) {
      activeInferences = Math.max(0, activeInferences - 1);
      return reject(instError);
    }

    timer = setTimeout(() => {
      killed = true;
      activeInferences = Math.max(0, activeInferences - 1);
      if (pyshell) {
        try {
          if (pyshell.childProcess) {
            pyshell.childProcess.kill("SIGKILL");
          } else {
            pyshell.kill("SIGKILL");
          }
        } catch (kErr) {}
      }
      const timeoutError = new Error(`Inference execution timed out after ${INFERENCE_TIMEOUT_MS}ms`);
      timeoutError.statusCode = 504;
      timeoutError.code = "INFERENCE_TIMEOUT";
      timeoutError.childPid = childPid;
      reject(timeoutError);
    }, INFERENCE_TIMEOUT_MS);

    const output = [];
    pyshell.on("message", (message) => {
      output.push(message);
    });

    pyshell.on("error", (err) => {
      if (!killed) {
        clearTimeout(timer);
        activeInferences = Math.max(0, activeInferences - 1);
        reject(err);
      }
    });

    pyshell.on("close", () => {
      if (!killed) {
        clearTimeout(timer);
        activeInferences = Math.max(0, activeInferences - 1);
        resolve(output);
      }
    });
  });
}

app.runPythonInferenceWithLimit = runPythonInferenceWithLimit;
app.getActiveInferences = () => activeInferences;
app.MAX_CONCURRENT_INFERENCES = MAX_CONCURRENT_INFERENCES;

// Serve browser applications (Next.js is primary, legacy kept for compatibility)
app.get(["/", "/index.html", "/login.html", "/signup.html", "/dashboard.html"], (req, res, next) => {
  const targetIndex = path.join(reactBuildPath, "index.html");
  if (fs.existsSync(targetIndex)) {
    return res.sendFile(targetIndex, (error) => {
      if (error) next(error);
    });
  }
  const directHtml = path.join(legacyPublicPath, req.path === "/" ? "index.html" : req.path.replace(/^\//, ""));
  if (fs.existsSync(directHtml)) {
    return res.sendFile(directHtml);
  }
  res.sendFile(targetIndex, (error) => {
    if (error) next(error);
  });
});
app.get("/legacy/dashboard", (req, res) => {
  const legacyDash = path.join(legacyPublicPath, "dashboard.html");
  if (fs.existsSync(legacyDash)) {
    return res.sendFile(legacyDash);
  }
  return res.sendFile(path.join(publicPath, "dashboard.html"));
});
app.use(express.static(publicPath));
app.use("/legacy", express.static(legacyPublicPath));
app.use(
  "/vendor/chart.js",
  express.static(path.join(__dirname, "..", "node_modules", "chart.js", "dist"))
);
app.use(
  "/vendor/ethers",
  express.static(path.join(__dirname, "..", "node_modules", "ethers", "dist"))
);
app.use("/app", express.static(reactBuildPath));

// API Routers
app.use("/auth", authRoutes);
app.use("/trade", tradeRoutes);
app.use("/bookings", bookingRoutes);

// Legacy Sepolia snapshot endpoint
app.get("/config/legacy_sepolia_energyoffer_snapshot.json", (req, res) => {
  const localSnapshot = path.join(publicPath, "config", "legacy_sepolia_energyoffer_snapshot.json");
  if (fs.existsSync(localSnapshot)) {
    return res.sendFile(localSnapshot);
  }
  const migrationSnapshot = path.resolve(
    __dirname,
    "..",
    "..",
    "energichain-contract",
    "migrations",
    "legacy-sepolia-energyoffer-snapshot.json"
  );
  if (fs.existsSync(migrationSnapshot)) {
    return res.sendFile(migrationSnapshot);
  }
  res.status(404).json({ error: "Legacy snapshot file not found." });
});

// Solar generation prediction endpoint (Requires JWT Authentication)
app.post("/predict", auth, async (req, res) => {
  const { dateTime, irradiation, ambientTemp, moduleTemp, features } = req.body || {};

  let inputData;
  if (Array.isArray(features)) {
    if (features.length < 3 || features.length > 10 || !features.every((v) => Number.isFinite(Number(v)))) {
      return res.status(400).json({ error: "features array must contain 3-10 finite numbers", code: "VALIDATION_ERROR" });
    }
    inputData = {
      dateTime: new Date().toISOString(),
      irradiation: parseFloat(features[0] || 0),
      ambientTemp: parseFloat(features[1] || 25),
      moduleTemp: parseFloat(features[2] || 25),
    };
  } else {
    const irr = parseFloat(irradiation);
    const amb = parseFloat(ambientTemp);
    const mod = parseFloat(moduleTemp);
    if (!dateTime || isNaN(irr) || isNaN(amb) || isNaN(mod)) {
      return res.status(400).json({
        error: "dateTime, irradiation, ambientTemp, and moduleTemp are required finite numbers",
        code: "VALIDATION_ERROR",
      });
    }
    if (irr < 0 || irr > 2000 || amb < -50 || amb > 80 || mod < -50 || mod > 120) {
      return res.status(400).json({
        error: "Input telemetry parameters out of physical realistic bounds",
        code: "VALIDATION_ERROR",
      });
    }
    inputData = {
      dateTime,
      irradiation: irr,
      ambientTemp: amb,
      moduleTemp: mod,
    };
  }

  const options = {
    mode: "text",
    pythonOptions: ["-u"],
    scriptPath: __dirname,
    args: [JSON.stringify(inputData)],
  };

  try {
    const output = await runPythonInferenceWithLimit("predict.py", options);
    let results;
    try {
      results = JSON.parse(output[0]);
    } catch (parseErr) {
      throw new Error("Failed to parse Python output");
    }

    if (results.error) {
      const status = results.code === "MODEL_UNAVAILABLE" ? 503 : 400;
      return res.status(status).json({ error: results.error, code: results.code || "PREDICTION_ERROR" });
    }

    res.json(results);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message, code: error.code });
    }
    console.error("Prediction error:", error);
    res.status(500).json({ error: "Prediction failed: " + error.message, code: "PREDICTION_ERROR" });
  }
});

// Independent Energy Consumption model endpoint (Requires JWT Authentication)
app.post("/api/energy-consumption/predict", auth, async (req, res) => {
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    return res.status(400).json({ success: false, error: "Request body must be a valid JSON object", code: "VALIDATION_ERROR" });
  }
  if (Object.keys(req.body).length > 100) {
    return res.status(400).json({ success: false, error: "Request payload contains too many fields", code: "VALIDATION_ERROR" });
  }

  const options = {
    mode: "text",
    pythonOptions: ["-u"],
    scriptPath: path.join(__dirname, "..", "model_train"),
    args: [JSON.stringify(req.body || {})],
  };

  try {
    const output = await runPythonInferenceWithLimit("predict_energy_consumption.py", options);
    let result;
    try {
      result = JSON.parse(output[0]);
    } catch (parseError) {
      throw new Error("Failed to parse energy consumption prediction output");
    }

    if (!result.success) {
      const statusByCode = {
        MODEL_UNAVAILABLE: 503,
        MODEL_LOAD_FAILED: 503,
        VALIDATION_ERROR: 422,
        INFERENCE_FAILED: 500,
      };
      return res.status(statusByCode[result.code] || 500).json(result);
    }

    res.json(result);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ success: false, error: error.message, code: error.code });
    }
    console.error("Energy consumption prediction error:", error);
    res.status(500).json({
      success: false,
      error: "Energy consumption prediction is unavailable.",
      code: "PREDICTION_SERVICE_ERROR",
    });
  }
});

app.get(["/app", "/app/{*path}"], (req, res, next) => {
  res.sendFile(path.join(reactBuildPath, "index.html"), (error) => {
    if (error) next(error);
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error && (error.code === "CORS_FORBIDDEN" || (error.message && error.message.startsWith("CORS origin not allowed")))) {
    return res.status(403).json({ error: error.message, code: "CORS_FORBIDDEN" });
  }
  if (error instanceof SyntaxError && "body" in error) {
    return res.status(400).json({ error: "Request body must be valid JSON." });
  }
  next(error);
});

module.exports = app;
