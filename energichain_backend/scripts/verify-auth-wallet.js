const { ethers } = require("ethers");
const { sequelize } = require("../src/models");
const app = require("../src/app");

let baseUrl = process.env.APP_URL || "http://127.0.0.1:5000";
const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
const password = "ValidPassword123!";
let userIds = [];
let localServer = null;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
  });
  const body = await response.json().catch(() => ({}));
  return { status: response.status, ok: response.ok, body };
}

async function ensureServer() {
  try {
    await fetch(`${baseUrl}/auth/me`);
  } catch (err) {
    // If external server is not running, spin up app on an ephemeral port
    await sequelize.authenticate();
    await new Promise((resolve) => {
      localServer = app.listen(0, "127.0.0.1", () => {
        baseUrl = `http://127.0.0.1:${localServer.address().port}`;
        resolve();
      });
    });
  }
}

async function cleanup() {
  if (localServer) {
    await new Promise((resolve) => localServer.close(resolve));
  }
  if (userIds.length) {
    await sequelize.query('DELETE FROM "WalletBindings" WHERE "userId" IN (:userIds)', {
      replacements: { userIds },
    });
    await sequelize.query('DELETE FROM "Users" WHERE id IN (:userIds)', {
      replacements: { userIds },
    });
  }
  await sequelize.close();
}

async function main() {
  await ensureServer();
  const emailRaw = `  Test-User-${suffix}@Example.COM  `;
  const normalizedEmail = emailRaw.trim().toLowerCase();

  try {
    // 1. Validation tests
    const shortPass = await request("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name: "Short Pass", email: normalizedEmail, password: "123" }),
    });
    assert(shortPass.status === 400, "Short password (<6) was not rejected with 400.");

    const emptyName = await request("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name: "   ", email: normalizedEmail, password }),
    });
    assert(emptyName.status === 400, "Empty name was not rejected with 400.");

    // 2. Successful Signup with unnormalized raw email
    const signup = await request("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name: "Auth Test User", email: emailRaw, password }),
    });
    assert(signup.status === 201 && signup.body.token, "Signup failed.");
    userIds.push(signup.body.user.id);
    assert(signup.body.user.email === normalizedEmail, "Email was not normalized on signup.");

    // 3. Duplicate signup rejection
    const dupSignup = await request("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name: "Dup User", email: normalizedEmail, password }),
    });
    assert(dupSignup.status === 400, "Duplicate signup was not rejected.");

    // 4. Case-insensitive login test
    const loginUpper = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: `TEST-USER-${suffix}@EXAMPLE.com`, password }),
    });
    assert(loginUpper.status === 200 && loginUpper.body.token, "Case-insensitive login failed.");
    const token = loginUpper.body.token;

    // 5. Invalid token 401 test
    const invalidToken = await request("/auth/me", {
      headers: { Authorization: "Bearer malformed.token.here" },
    });
    assert(invalidToken.status === 401 && invalidToken.body.code === "TOKEN_INVALID", "Invalid token did not return 401 with code TOKEN_INVALID.");

    // 6. GET /auth/me returns user and walletAddress (null initially)
    const me = await request("/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert(me.status === 200 && me.body.user && me.body.walletAddress === null, "GET /auth/me did not return user and null walletAddress.");

    // 7. GET /auth/wallet/nonce challenge
    const nonceRes = await request("/auth/wallet/nonce", {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert(nonceRes.status === 200 && nonceRes.body.nonce && nonceRes.body.message, "Nonce generation failed.");
    const nonceMessage = nonceRes.body.message;

    // 8. Wallet signing with ethers.Wallet
    const testWallet = ethers.Wallet.createRandom();
    const signature = await testWallet.signMessage(nonceMessage);

    // 8a. Rejection when signature doesn't match wallet address
    const wrongWallet = ethers.Wallet.createRandom();
    const badBind = await request("/auth/wallet", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ walletAddress: wrongWallet.address, signature }),
    });
    assert(badBind.status === 403, "Mismatched wallet signature was not rejected with 403.");

    // 8b. Successful cryptographic binding
    // Re-request nonce since previous attempt may consume it
    const freshNonceRes = await request("/auth/wallet/nonce", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const freshSignature = await testWallet.signMessage(freshNonceRes.body.message);

    const goodBind = await request("/auth/wallet", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ walletAddress: testWallet.address, signature: freshSignature }),
    });
    assert(goodBind.status === 201 && goodBind.body.walletAddress === testWallet.address.toLowerCase(), "Cryptographic wallet binding failed.");

    // 9. Verify GET /auth/me now reflects the bound walletAddress
    const meAfter = await request("/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert(meAfter.body.walletAddress === testWallet.address.toLowerCase(), "GET /auth/me did not reflect new walletAddress.");

    // 10. Attempting to bind a second user to the SAME wallet (must return 409)
    const user2Email = `user2-${suffix}@example.com`;
    const signup2 = await request("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name: "User 2", email: user2Email, password }),
    });
    userIds.push(signup2.body.user.id);
    const token2 = signup2.body.token;

    const nonce2Res = await request("/auth/wallet/nonce", {
      headers: { Authorization: `Bearer ${token2}` },
    });
    const sig2 = await testWallet.signMessage(nonce2Res.body.message);

    const dupWalletBind = await request("/auth/wallet", {
      method: "POST",
      headers: { Authorization: `Bearer ${token2}` },
      body: JSON.stringify({ walletAddress: testWallet.address, signature: sig2 }),
    });
    assert(dupWalletBind.status === 409, "Duplicate wallet address across users was not rejected with 409.");

    // 11. Attempting to re-bind the first user to a DIFFERENT wallet (must return 409)
    const wallet3 = ethers.Wallet.createRandom();
    const nonce3Res = await request("/auth/wallet/nonce", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const sig3 = await wallet3.signMessage(nonce3Res.body.message);

    const rebindAttempt = await request("/auth/wallet", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ walletAddress: wallet3.address, signature: sig3 }),
    });
    assert(rebindAttempt.status === 409, "Rebinding existing user to different wallet was not rejected with 409.");

    console.log("AUTH_WALLET_TEST=PASS");
  } finally {
    await cleanup();
    console.log("AUTH_WALLET_TEST_DATA=REMOVED");
  }
}

main().catch((err) => {
  console.error("AUTH_WALLET_TEST=FAIL", err);
  process.exitCode = 1;
});
