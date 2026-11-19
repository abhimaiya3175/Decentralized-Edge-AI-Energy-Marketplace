const fs = require("fs");
const path = require("path");
const { ethers } = require("hardhat");

const SEPOLIA_CHAIN_ID = 11155111n;
const CONFIRMATION_FLAG = "CONFIRM_SEPOLIA_DEPLOYMENT";

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
}

async function main() {
  // This human gate ensures an ordinary `hardhat run` cannot deploy or
  // update the active dashboard address by accident.
  if (process.env[CONFIRMATION_FLAG] !== "true") {
    throw new Error(`Deployment blocked. After explicit approval, set ${CONFIRMATION_FLAG}=true and run this script on Sepolia.`);
  }

  const network = await ethers.provider.getNetwork();
  if (network.chainId !== SEPOLIA_CHAIN_ID) {
    throw new Error(`Deployment blocked: expected Sepolia (${SEPOLIA_CHAIN_ID}), received chain ${network.chainId}.`);
  }

  const [deployer] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  const balance = await ethers.provider.getBalance(deployerAddress);
  const EnergyOffer = await ethers.getContractFactory("EnergyOffer");
  const deployRequest = await EnergyOffer.getDeployTransaction();
  const gasEstimate = await ethers.provider.estimateGas({ ...deployRequest, from: deployerAddress });
  const feeData = await ethers.provider.getFeeData();
  const gasPrice = feeData.maxFeePerGas || feeData.gasPrice;
  if (!gasPrice) throw new Error("Deployment blocked: the current Sepolia gas price could not be determined.");
  const estimatedCost = gasEstimate * gasPrice;
  if (balance < estimatedCost) {
    throw new Error("Deployment blocked: deployer balance is below the estimated Sepolia gas cost.");
  }

  console.log(`Sepolia deployment preflight passed for ${deployerAddress}.`);
  console.log(`Estimated gas cost: ${ethers.formatEther(estimatedCost)} ETH.`);

  const contract = await EnergyOffer.deploy();
  const deploymentTransaction = contract.deploymentTransaction();
  const receipt = await deploymentTransaction.wait(1);
  const address = await contract.getAddress();
  const deployedCode = await ethers.provider.getCode(address);
  if (deployedCode === "0x") throw new Error("Deployment verification failed: no bytecode exists at the new address.");
  if (await contract.getOfferCount() !== 0n) throw new Error("Deployment verification failed: the new contract did not start empty.");

  const root = path.resolve(__dirname, "..", "..");
  const reportPath = path.join(__dirname, "..", "migrations", "sepolia-deployment-result.json");
  writeJson(reportPath, {
    chainId: Number(network.chainId), contract: "EnergyOffer", address,
    deploymentTransactionHash: deploymentTransaction.hash, deploymentBlockNumber: receipt.blockNumber,
    bytecodePresent: true, bytecodeLength: (deployedCode.length - 2) / 2, offerCountVerified: 0,
  });

  // The legacy address stays in contract_history.json. This occurs only after
  // the new deployment and its bytecode/function checks succeeded.
  const configPath = path.join(root, "energichain_backend", "public", "config", "contract_address.json");
  const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  config[String(SEPOLIA_CHAIN_ID)] = address;
  writeJson(configPath, config);

  console.log(`Deployment verified. New EnergyOffer address: ${address}`);
  console.log(`Deployment transaction: ${deploymentTransaction.hash}`);
  console.log(`Updated active dashboard configuration: ${configPath}`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
