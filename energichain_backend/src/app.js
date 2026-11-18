const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const tradeRoutes = require("./routes/tradeRoutes");
const bookingRoutes = require("./routes/bookingRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Serve the browser application independently of the process working directory.
app.use(express.static(path.join(__dirname, "..", "public")));
// Serve Chart.js locally so dashboard visualizations do not depend on a CDN.
app.use(
  "/vendor/chart.js",
  express.static(path.join(__dirname, "..", "node_modules", "chart.js", "dist"))
);

app.use("/auth", authRoutes);
app.use("/trade", tradeRoutes);
app.use("/bookings", bookingRoutes);

module.exports = app;
