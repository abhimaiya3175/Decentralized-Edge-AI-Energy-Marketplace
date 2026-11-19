const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const { PythonShell } = require("python-shell");

const authRoutes = require("./routes/authRoutes");
const tradeRoutes = require("./routes/tradeRoutes");
const bookingRoutes = require("./routes/bookingRoutes");

const app = express();
const publicPath = path.join(__dirname, "..", "public");
const reactBuildPath = path.join(publicPath, "app");

const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5000",
  "http://127.0.0.1:5000",
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
}));
app.use(express.json());

// Serve the browser application independently of the process working directory.
// React is now the primary application. The old pages are kept only behind a
// compatibility route while their feature modules are migrated.
app.get(["/", "/index.html", "/login.html", "/signup.html", "/dashboard.html"], (req, res, next) => {
  res.sendFile(path.join(reactBuildPath, "index.html"), (error) => {
    if (error) next(error);
  });
});
app.get("/legacy/dashboard", (req, res) => res.sendFile(path.join(publicPath, "dashboard.html")));
app.use(express.static(publicPath));
// Serve Chart.js locally so dashboard visualizations do not depend on a CDN.
app.use(
  "/vendor/chart.js",
  express.static(path.join(__dirname, "..", "node_modules", "chart.js", "dist"))
);

// Production build of the React application. Legacy HTML pages remain
// reachable by their explicit filenames during the staged migration.
app.use("/app", express.static(reactBuildPath));

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

// Solar generation prediction endpoint
app.post("/predict", async (req, res) => {
  const { dateTime, irradiation, ambientTemp, moduleTemp, features } = req.body;

  let inputData;
  if (Array.isArray(features)) {
    inputData = {
      dateTime: new Date().toISOString(),
      irradiation: parseFloat(features[0] || 0),
      ambientTemp: parseFloat(features[1] || 25),
      moduleTemp: parseFloat(features[2] || 25),
    };
  } else {
    if (!dateTime || irradiation == null || ambientTemp == null || moduleTemp == null) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    inputData = {
      dateTime,
      irradiation: parseFloat(irradiation),
      ambientTemp: parseFloat(ambientTemp),
      moduleTemp: parseFloat(moduleTemp),
    };
  }

  const options = {
    mode: "text",
    pythonOptions: ["-u"],
    scriptPath: __dirname,
    args: [JSON.stringify(inputData)],
  };

  try {
    const output = await PythonShell.run("predict.py", options);
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
    console.error("Prediction error:", error);
    res.status(500).json({ error: "Prediction failed: " + error.message });
  }
});

// Independent Energy Consumption model endpoint
app.post("/api/energy-consumption/predict", async (req, res) => {
  const options = {
    mode: "text",
    pythonOptions: ["-u"],
    scriptPath: path.join(__dirname, "..", "model_train"),
    args: [JSON.stringify(req.body || {})],
  };

  try {
    const output = await PythonShell.run("predict_energy_consumption.py", options);
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

// Keep malformed JSON from falling through to Express's HTML error page,
// which can expose stack details to API consumers.
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && "body" in error) {
    return res.status(400).json({ error: "Request body must be valid JSON." });
  }
  next(error);
});

module.exports = app;
