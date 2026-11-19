const express = require("express");
const router = express.Router();

const { signup, login, me } = require("../controllers/authController");
const auth = require("../middleware/authMiddleware");
const { getWalletBinding, getWalletNonce, bindWallet } = require("../controllers/walletController");

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", auth, me);
router.get("/wallet", auth, getWalletBinding);
router.get("/wallet/nonce", auth, getWalletNonce);
router.post("/wallet", auth, bindWallet);

module.exports = router;
