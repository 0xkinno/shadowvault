import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying ShadowVault to Sepolia...");

  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);

  const balance = await deployer.getBalance();
  console.log("💰 Account balance:", ethers.utils.formatEther(balance), "ETH");

  const ShadowVault = await ethers.getContractFactory("ShadowVault");
  const shadowVault = await ShadowVault.deploy();

  await shadowVault.deployed();

  console.log("✅ ShadowVault deployed to:", shadowVault.address);
  console.log("🔗 View on Etherscan: https://sepolia.etherscan.io/address/" + shadowVault.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });