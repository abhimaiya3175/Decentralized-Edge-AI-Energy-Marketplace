const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });
const app = require("./app");
const { connectDB } = require("./models");

// Default to PORT 5000 so Express does not conflict with Next.js (PORT 3000)
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`EnergyChain backend running on PORT ${PORT}`);
    });
  } catch (error) {
    console.error("Backend startup failed:", error.message);
    process.exit(1);
  }
}

startServer();
