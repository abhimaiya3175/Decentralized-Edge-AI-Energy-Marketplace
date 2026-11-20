const http = require("http");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const app = require("../src/app");
const { sequelize, User } = require("../src/models");

async function main() {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(5000, resolve));
  console.log("Smoke test server running on port 5000");

  let smokeUserId = null;

  const runRequest = async (name, path, options = {}) => {
    return new Promise((resolve) => {
      const req = http.request(
        {
          hostname: "127.0.0.1",
          port: 5000,
          path,
          method: options.method || "GET",
          headers: {
            "Content-Type": "application/json",
            ...(options.headers || {}),
          },
        },
        (res) => {
          let body = "";
          res.on("data", (chunk) => (body += chunk));
          res.on("end", () => {
            let json = null;
            try {
              json = JSON.parse(body);
            } catch {
              json = body;
            }
            resolve({ status: res.statusCode, data: json });
          });
        }
      );
      if (options.body) {
        req.write(typeof options.body === "string" ? options.body : JSON.stringify(options.body));
      }
      req.end();
    });
  };

  try {
    // 1. Contract Address JSON
    const resAddr = await runRequest("contract_address", "/config/contract_address.json");
    if (resAddr.status === 200 && resAddr.data["11155111"] === "0x1fD069E2a2eF49EE4FAf2c5C168c92f938118DA7") {
      console.log("SMOKE 1: Contract Address Config => PASS");
    } else {
      throw new Error(`SMOKE 1 FAILED: ${JSON.stringify(resAddr)}`);
    }

    // 2. Legacy Snapshot JSON
    const resSnapshot = await runRequest("legacy_snapshot", "/config/legacy_sepolia_energyoffer_snapshot.json");
    if (resSnapshot.status === 200 && Array.isArray(resSnapshot.data) && resSnapshot.data.length > 0) {
      console.log("SMOKE 2: Legacy Sepolia Snapshot => PASS");
    } else {
      throw new Error(`SMOKE 2 FAILED: ${JSON.stringify(resSnapshot)}`);
    }

    // 3. /auth/me without token -> 401 TOKEN_MISSING
    const resMe = await runRequest("auth_me_no_token", "/auth/me");
    if (resMe.status === 401 && resMe.data.code === "TOKEN_MISSING") {
      console.log("SMOKE 3: Unauthenticated /auth/me => PASS (401 TOKEN_MISSING)");
    } else {
      throw new Error(`SMOKE 3 FAILED: ${JSON.stringify(resMe)}`);
    }

    // 3a. /api/energy-consumption/predict without token -> 401 TOKEN_MISSING
    const resMLNoAuth = await runRequest("consumption_ml_no_auth", "/api/energy-consumption/predict", {
      method: "POST",
      body: { temperature: 25 },
    });
    if (resMLNoAuth.status === 401 && resMLNoAuth.data.code === "TOKEN_MISSING") {
      console.log("SMOKE 3a: Unauthenticated /api/energy-consumption/predict => PASS (401 TOKEN_MISSING)");
    } else {
      throw new Error(`SMOKE 3a FAILED: ${JSON.stringify(resMLNoAuth)}`);
    }

    // 3b. /predict without token -> 401 TOKEN_MISSING
    const resSolarNoAuth = await runRequest("solar_ml_no_auth", "/predict", {
      method: "POST",
      body: { features: [500, 25, 3.5, 40] },
    });
    if (resSolarNoAuth.status === 401 && resSolarNoAuth.data.code === "TOKEN_MISSING") {
      console.log("SMOKE 3b: Unauthenticated /predict => PASS (401 TOKEN_MISSING)");
    } else {
      throw new Error(`SMOKE 3b FAILED: ${JSON.stringify(resSolarNoAuth)}`);
    }

    // 3c. Obtain JWT token for authenticated ML tests
    const smokeEmail = `smoke-${Date.now()}-${Math.random().toString(16).slice(2)}@example.com`;
    const signupRes = await runRequest("smoke_signup", "/auth/signup", {
      method: "POST",
      body: {
        name: "Smoke Test User",
        email: smokeEmail,
        password: "SmokeTestPassword!42",
      },
    });
    if (signupRes.status !== 201 || !signupRes.data.token) {
      throw new Error(`Smoke user creation failed: ${JSON.stringify(signupRes)}`);
    }
    const token = signupRes.data.token;
    smokeUserId = signupRes.data.user.id;

    // 4. Authenticated Energy Consumption ML Prediction
    const resML = await runRequest("consumption_ml", "/api/energy-consumption/predict", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: {
        temperature: 28.5,
        humidity: 55,
        squareFootage: 1500,
        occupancy: 5,
        hvacUsage: 1,
        lightingUsage: "On",
        renewableEnergy: 12.5,
        dayOfWeek: "Monday",
        holiday: 0,
        timestamp: "2022-02-10T10:00:00",
      },
    });
    if (resML.status === 200 && resML.data.success && resML.data.prediction) {
      console.log(`SMOKE 4: Authenticated Consumption ML Prediction => PASS (${resML.data.prediction.energyConsumption} ${resML.data.prediction.unit})`);
    } else {
      throw new Error(`SMOKE 4 FAILED: ${JSON.stringify(resML)}`);
    }

    // 5. Authenticated Solar ML Endpoint (missing artifact returns structured 503)
    const resSolar = await runRequest("solar_ml", "/predict", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: {
        features: [500, 25, 3.5, 40],
      },
    });
    if (resSolar.status === 503 && resSolar.data.code === "MODEL_UNAVAILABLE") {
      console.log("SMOKE 5: Authenticated Solar ML Offline Graceful 503 => PASS (MODEL_UNAVAILABLE)");
    } else {
      throw new Error(`SMOKE 5 FAILED: ${JSON.stringify(resSolar)}`);
    }

    console.log("ALL SMOKE TESTS PASSED SUCCESSFULLY");
  } finally {
    if (smokeUserId) {
      try {
        await User.destroy({ where: { id: smokeUserId } });
      } catch (cleanupErr) {
        console.error("Smoke user cleanup error:", cleanupErr.message);
      }
    }
    server.close();
  }
}

main().catch((err) => {
  console.error("Smoke test failure:", err);
  process.exit(1);
});
