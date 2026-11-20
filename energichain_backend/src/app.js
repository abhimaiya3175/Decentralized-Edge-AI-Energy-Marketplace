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
const reactBuildPath = path.join(publicPath, "app");

// 1. Helmet Security Headers (allow cross-origin assets for Next.js)
app.use(
  helmet({
    contentSecurityPolicy: false,
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
const authRateLimitMax = process.env.AUTH_RATE_LIMIT_MAX
  ? parseInt(process.env.AUTH_RATE_LIMIT_MAX, 10)
  : (process.env.NODE_ENV === "test" ? 10000 : 20);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: authRateLimitMax,
  skip: () => process.env.NODE_ENV === "test", // Disabled in test suite
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    msg: "Too many authentication requests, please try again later.",
    code: "AUTH_RATE_LIMITED",
  },
});

// Apply rate limiting specifically to credential endpoints
app.use("/auth/login", authLimiter);
app.use("/auth/signup", authLimiter);

// 4. Subprocess Concurrency & Execution Timeout Manager
let activeInferences = 0;
const MAX_CONCURRENT_INFERENCES = 5;
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

    try {
      pyshell = new PythonShell(script, options);
    } catch (instError) {
      activeInferences--;
      return reject(instError);
    }

    timer = setTimeout(() => {
      killed = true;
      try {
        pyshell.kill("SIGKILL");
      } catch {}
      activeInferences--;
      const timeoutError = new Error(`Inference execution timed out after ${INFERENCE_TIMEOUT_MS}ms`);
      timeoutError.statusCode = 504;
      timeoutError.code = "INFERENCE_TIMEOUT";
      reject(timeoutError);
    }, INFERENCE_TIMEOUT_MS);

    const output = [];
    pyshell.on("message", (message) => {
      output.push(message);
    });

    pyshell.on("error", (err) => {
      if (!killed) {
        clearTimeout(timer);
        activeInferences--;
        reject(err);
      }
    });

    pyshell.on("close", () => {
      if (!killed) {
        clearTimeout(timer);
        activeInferences--;
        resolve(output);
      }
    });
  });
}

// Serve browser applications (Next.js is primary, legacy kept for compatibility)
app.get(["/", "/index.html", "/login.html", "/signup.html", "/dashboard.html"], (req, res, next) => {
  res.sendFile(path.join(reactBuildPath, "index.html"), (error) => {
    if (error) next(error);
  });
});
app.get("/legacy/dashboard", (req, res) => res.sendFile(path.join(publicPath, "dashboard.html")));
app.use(express.static(publicPath));
app.use(
  "/vendor/chart.js",
  express.static(path.join(__dirname, "..", "node_modules", "chart.js", "dist"))
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
