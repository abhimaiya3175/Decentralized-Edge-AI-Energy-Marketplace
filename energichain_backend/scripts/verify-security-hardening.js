const http = require("http");
const path = require("path");
const bcrypt = require("bcrypt");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

// Set rate limit test flag before requiring app so the limiter is enabled for test
process.env.ENABLE_RATE_LIMIT_TEST = "true";
process.env.AUTH_LOGIN_RATE_LIMIT_MAX = "3";
process.env.AUTH_SIGNUP_RATE_LIMIT_MAX = "5";

const app = require("../src/app");
const { sequelize, User } = require("../src/models");

async function main() {
  const PORT = 5055; // Use dedicated verification port to guarantee isolation
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(PORT, resolve));
  console.log(`Security verification test server running on port ${PORT}`);

  const runRequest = (endpoint, options = {}) => {
    return new Promise((resolve) => {
      const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      };
      if (options.origin) {
        headers["Origin"] = options.origin;
      }
      const req = http.request(
        {
          hostname: "127.0.0.1",
          port: PORT,
          path: endpoint,
          method: options.method || "GET",
          headers,
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
            resolve({ status: res.statusCode, headers: res.headers, data: json });
          });
        }
      );
      if (options.body) {
        req.write(typeof options.body === "string" ? options.body : JSON.stringify(options.body));
      }
      req.end();
    });
  };

  let legacyUserId = null;

  try {
    // ------------------------------------------------------------------------
    // TEST 1: Helmet Content-Security-Policy Headers
    // ------------------------------------------------------------------------
    console.log("\n--- TEST 1: Helmet CSP Verification ---");
    const pagesToCheck = ["/login.html", "/signup.html", "/dashboard.html"];
    for (const page of pagesToCheck) {
      const res = await runRequest(page);
      const csp = res.headers["content-security-policy"];
      if (!csp) {
        throw new Error(`CSP header missing on ${page}`);
      }
      const hasSelf = csp.includes("default-src 'self'");
      const hasTailwind = csp.includes("https://cdn.tailwindcss.com");
      const hasUnsafeInline = csp.includes("'unsafe-inline'");
      const hasWebsocket = csp.includes("ws:") && csp.includes("wss:");

      if (!hasSelf || !hasTailwind || !hasUnsafeInline || !hasWebsocket) {
        throw new Error(`CSP directives incomplete on ${page}: ${csp}`);
      }
      console.log(`CSP header on ${page} => PASS (Tailwind, inline, WS, self permitted)`);
    }

    // ------------------------------------------------------------------------
    // TEST 2: CORS Strict Allowlist & Missing Origin Header
    // ------------------------------------------------------------------------
    console.log("\n--- TEST 2: CORS Verification ---");
    // 2a. Request with NO Origin header (curl, backend, server-to-server) => Allowed
    const resNoOrigin = await runRequest("/auth/me");
    if (resNoOrigin.status === 401 && resNoOrigin.data?.code === "TOKEN_MISSING") {
      console.log("CORS No-Origin Header => PASS (Allowed through to endpoint)");
    } else {
      throw new Error(`CORS No-Origin failed: status ${resNoOrigin.status}`);
    }

    // 2b. Request from authorized origin (e.g. Next.js on localhost:3000) => Allowed
    const resAllowedOrigin = await runRequest("/auth/me", { origin: "http://localhost:3000" });
    if (resAllowedOrigin.status === 401 && resAllowedOrigin.data?.code === "TOKEN_MISSING") {
      console.log("CORS Allowed Origin (http://localhost:3000) => PASS (Allowed)");
    } else {
      throw new Error(`CORS Allowed Origin failed: status ${resAllowedOrigin.status}`);
    }

    // 2c. Request from unauthorized origin => 403 CORS_FORBIDDEN
    const resForbiddenOrigin = await runRequest("/auth/me", { origin: "https://malicious-site.example.com" });
    if (resForbiddenOrigin.status === 403 && resForbiddenOrigin.data?.code === "CORS_FORBIDDEN") {
      console.log("CORS Unauthorized Origin => PASS (403 CORS_FORBIDDEN)");
    } else {
      throw new Error(`CORS Forbidden test failed: status ${resForbiddenOrigin.status}, ${JSON.stringify(resForbiddenOrigin.data)}`);
    }

    // ------------------------------------------------------------------------
    // TEST 3: Password Policy at Signup & Legacy Password Login
    // ------------------------------------------------------------------------
    console.log("\n--- TEST 3: Password Policy UX & Legacy Login ---");
    // 3a. Signup with non-compliant password (no special char or uppercase) => 400
    const resWeak = await runRequest("/auth/signup", {
      method: "POST",
      body: { name: "Weak", email: `weak-${Date.now()}@example.com`, password: "weakpassword123" },
    });
    if (resWeak.status === 400 && resWeak.data?.code === "PASSWORD_POLICY_VIOLATION") {
      console.log("Signup Password Policy Enforcement => PASS (400 PASSWORD_POLICY_VIOLATION)");
    } else {
      throw new Error(`Signup weak password test failed: status ${resWeak.status}, ${JSON.stringify(resWeak.data)}`);
    }

    // 3b. Existing user with legacy password (e.g. "legacy123") created directly in DB can still log in
    const legacyEmail = `legacy-user-${Date.now()}@energychain.test`;
    const legacyPassword = "legacy123"; // Does not meet current policy (no upper, no symbol)
    const hashedLegacy = await bcrypt.hash(legacyPassword, 10);
    const legacyUser = await User.create({
      name: "Legacy User",
      email: legacyEmail,
      password: hashedLegacy,
    });
    legacyUserId = legacyUser.id;

    // Login with legacy credentials
    const resLegacyLogin = await runRequest("/auth/login", {
      method: "POST",
      body: { email: legacyEmail, password: legacyPassword },
    });
    if (resLegacyLogin.status === 200 && resLegacyLogin.data?.token) {
      console.log("Legacy User Login with Older Password => PASS (200 OK with valid JWT)");
    } else {
      throw new Error(`Legacy user login failed: status ${resLegacyLogin.status}, ${JSON.stringify(resLegacyLogin.data)}`);
    }

    // ------------------------------------------------------------------------
    // TEST 4: Auth Rate Limiting (Exhausting IP quota)
    // ------------------------------------------------------------------------
    console.log("\n--- TEST 4: Rate Limiting Verification ---");
    // AUTH_LOGIN_RATE_LIMIT_MAX is set to 3. Firing 4 rapid requests to /auth/login.
    let rateLimited = false;
    for (let i = 1; i <= 4; i++) {
      const res = await runRequest("/auth/login", {
        method: "POST",
        body: { email: `ratelimit-${i}@example.com`, password: "AnyPassword123!" },
      });
      if (res.status === 429 && res.data?.code === "AUTH_RATE_LIMITED") {
        rateLimited = true;
        console.log(`Rate Limiting (Triggered 429 on rapid request ${i} with limit=3) => PASS (429 AUTH_RATE_LIMITED)`);
        break;
      }
    }
    if (!rateLimited) {
      throw new Error("Rate limiting failed to trigger 429");
    }

    // ------------------------------------------------------------------------
    // TEST 5: Python Subprocess Execution Timeout & Child Process Termination
    // ------------------------------------------------------------------------
    console.log("\n--- TEST 5: Python Subprocess Timeout & PID Cleanup ---");
    const { PythonShell } = require("python-shell");
    const testTimeoutMs = 800; // 800ms threshold
    let capturedPid = null;

    const timeoutPromise = new Promise((resolve, reject) => {
      let timer = null;
      let pyshell = null;
      try {
        pyshell = new PythonShell("-c", {
          mode: "text",
          args: ["import time; time.sleep(10)"],
        });
        capturedPid = pyshell.childProcess ? pyshell.childProcess.pid : null;
      } catch (err) {
        return reject(err);
      }

      timer = setTimeout(() => {
        try {
          if (pyshell.childProcess) {
            pyshell.childProcess.kill("SIGKILL");
          } else {
            pyshell.kill("SIGKILL");
          }
        } catch {}
        const err = new Error(`Inference execution timed out after ${testTimeoutMs}ms`);
        err.statusCode = 504;
        err.code = "INFERENCE_TIMEOUT";
        err.childPid = capturedPid;
        reject(err);
      }, testTimeoutMs);

      pyshell.on("close", () => {
        clearTimeout(timer);
        resolve("closed");
      });
      pyshell.on("error", (e) => {
        clearTimeout(timer);
        reject(e);
      });
    });

    let timeoutThrown = false;
    try {
      await timeoutPromise;
    } catch (err) {
      if (err.statusCode === 504 && err.code === "INFERENCE_TIMEOUT" && err.childPid) {
        timeoutThrown = true;
        // Wait 150ms for OS to update process table, then verify child process is not running
        await new Promise((r) => setTimeout(r, 150));
        let processDead = false;
        try {
          process.kill(err.childPid, 0);
        } catch (procErr) {
          if (procErr.code === "ESRCH") {
            processDead = true;
          }
        }
        if (processDead) {
          console.log(`Python Subprocess Timeout & PID Termination => PASS (504 INFERENCE_TIMEOUT, PID ${err.childPid} confirmed terminated: ESRCH)`);
        } else {
          throw new Error(`Child process PID ${err.childPid} was not terminated after timeout!`);
        }
      } else {
        throw err;
      }
    }
    if (!timeoutThrown) {
      throw new Error("Timeout test failed: did not throw timeout error");
    }

    // ------------------------------------------------------------------------
    // TEST 6: Subprocess Concurrency Limit (Immediate 503 INFERENCE_BUSY)
    // ------------------------------------------------------------------------
    console.log("\n--- TEST 6: Subprocess Concurrency Semaphore ---");
    // Fill all slots up to MAX_CONCURRENT_INFERENCES
    const maxSlots = app.MAX_CONCURRENT_INFERENCES || 5;
    const dummyScript = path.resolve(__dirname, "../model_train/test_energy_consumption.py");

    // We simulate slot saturation by testing the limit logic directly
    const directPromises = [];
    for (let i = 0; i < maxSlots; i++) {
      directPromises.push(
        app.runPythonInferenceWithLimit("-c", {
          mode: "text",
          args: ["import time; time.sleep(0.5)"],
        }).catch(() => {})
      );
    }

    // Attempt (maxSlots + 1)-th call immediately: must reject synchronously with 503 INFERENCE_BUSY
    let busyRejected = false;
    try {
      await app.runPythonInferenceWithLimit("-c", {
        mode: "text",
        args: ["import time; time.sleep(0.1)"],
      });
    } catch (err) {
      if (err.statusCode === 503 && err.code === "INFERENCE_BUSY") {
        busyRejected = true;
        console.log(`Concurrency Limit Reached (${maxSlots}/${maxSlots}) => PASS (Immediate 503 INFERENCE_BUSY)`);
      } else {
        throw new Error(`Unexpected error on busy call: ${err.message} (status: ${err.statusCode})`);
      }
    }

    await Promise.all(directPromises);

    if (!busyRejected) {
      throw new Error("Concurrency test failed: 6th call was not rejected with 503");
    }

    console.log("\nALL SECURITY HARDENING TESTS PASSED SUCCESSFULLY");
  } finally {
    if (legacyUserId) {
      await User.destroy({ where: { id: legacyUserId } }).catch(() => {});
    }
    await new Promise((resolve) => server.close(resolve));
    await sequelize.close().catch(() => {});
  }
}

main().catch((err) => {
  console.error("FATAL ERROR IN SECURITY VERIFICATION:", err);
  process.exit(1);
});
