const crypto = require("crypto");
const { ethers } = require("ethers");
const { WalletBinding } = require("../models");

const WALLET_ADDRESS_PATTERN = /^0x[0-9a-fA-F]{40}$/;

// In-memory challenge-response nonce cache: userId -> { nonce, message, expiresAt }
const activeNonces = new Map();

exports.getWalletBinding = async (req, res) => {
  try {
    const binding = await WalletBinding.findOne({ where: { userId: req.user.id } });
    return res.json({ walletAddress: binding?.walletAddress || null });
  } catch (error) {
    console.error("Wallet binding lookup error:", error);
    return res.status(500).json({ msg: "Could not load wallet binding." });
  }
};

exports.getWalletNonce = async (req, res) => {
  try {
    const nonce = crypto.randomBytes(16).toString("hex");
    const message = `Bind wallet to EnergyChain account #${req.user.id}. Nonce: ${nonce}`;
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minute validity
    activeNonces.set(req.user.id, { nonce, message, expiresAt });
    return res.json({ nonce, message, expiresAt });
  } catch (error) {
    console.error("Nonce generation error:", error);
    return res.status(500).json({ msg: "Could not generate binding nonce." });
  }
};

exports.bindWallet = async (req, res) => {
  const walletAddress = String(req.body?.walletAddress || "").trim().toLowerCase();
  if (!WALLET_ADDRESS_PATTERN.test(walletAddress)) {
    return res.status(400).json({ msg: "A valid MetaMask wallet address is required." });
  }

  try {
    const existingForUser = await WalletBinding.findOne({ where: { userId: req.user.id } });
    if (existingForUser) {
      if (existingForUser.walletAddress !== walletAddress) {
        return res.status(409).json({ msg: "This EnergyChain account is already linked to a different MetaMask wallet." });
      }
      return res.status(200).json({ walletAddress: existingForUser.walletAddress, immutable: true });
    }

    const existingForWallet = await WalletBinding.findOne({ where: { walletAddress } });
    if (existingForWallet && existingForWallet.userId !== req.user.id) {
      return res.status(409).json({ msg: "This MetaMask wallet is already linked to a different EnergyChain account." });
    }

    // Cryptographic signature verification
    const signature = req.body?.signature;
    if (!signature || typeof signature !== "string") {
      return res.status(400).json({ msg: "Cryptographic wallet signature is required to prove ownership." });
    }

    const stored = activeNonces.get(req.user.id);
    if (!stored || stored.expiresAt < Date.now()) {
      activeNonces.delete(req.user.id);
      return res.status(400).json({ msg: "Binding challenge expired. Please request a new nonce.", code: "NONCE_EXPIRED" });
    }

    let recoveredAddress;
    try {
      recoveredAddress = ethers.verifyMessage(stored.message, signature).toLowerCase();
    } catch (sigErr) {
      return res.status(400).json({ msg: "Malformed cryptographic signature." });
    }

    if (recoveredAddress !== walletAddress) {
      return res.status(403).json({ msg: "Cryptographic signature does not match the specified wallet address." });
    }

    // Nonce consumed
    activeNonces.delete(req.user.id);

    const binding = await WalletBinding.create({ userId: req.user.id, walletAddress });
    return res.status(201).json({ walletAddress: binding.walletAddress, immutable: true });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ msg: "This MetaMask wallet is already linked to a different EnergyChain account." });
    }
    console.error("Wallet binding error:", error);
    return res.status(500).json({ msg: "Could not save wallet binding." });
  }
};
