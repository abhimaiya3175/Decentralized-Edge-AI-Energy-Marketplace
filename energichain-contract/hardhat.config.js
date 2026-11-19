require("@nomicfoundation/hardhat-toolbox");
const path = require("path");
const dotenv = require("dotenv");

// Resolve from this config file instead of the command's working directory so
// `npx hardhat ...` works consistently from either the repository root or the
// contract directory. Existing process environment values still take priority.
dotenv.config({ path: path.join(__dirname, ".env") });

/** @type import('hardhat/config').HardhatUserConfig */
const networks = {};
const rawSepoliaRpcUrl = process.env.SEPOLIA_RPC_URL?.trim();
const rawPrivateKey = process.env.PRIVATE_KEY?.trim();

function isValidHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function normalizePrivateKey(value) {
  if (!value) return undefined;
  const normalized = value.startsWith("0x") ? value : `0x${value}`;
  return /^0x[0-9a-fA-F]{64}$/.test(normalized) ? normalized : undefined;
}

const hasValidRpcUrl = isValidHttpUrl(rawSepoliaRpcUrl);
const privateKey = normalizePrivateKey(rawPrivateKey);

// Keep local tests credential-free. Sepolia is enabled only when both
// deployment secrets are supplied through the contract project's .env file.
if (hasValidRpcUrl && privateKey) {
  networks.sepolia = {
    url: rawSepoliaRpcUrl,
    accounts: [privateKey],
    chainId: 11155111,
  };
} else if (rawSepoliaRpcUrl || rawPrivateKey) {
  console.warn("Sepolia network disabled: set a valid http(s) SEPOLIA_RPC_URL and a 32-byte PRIVATE_KEY (64 hexadecimal characters, with or without 0x).");
}

module.exports = {
  solidity: "0.8.0",
  networks,
};
