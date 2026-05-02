import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying ShadowVaultDemo to Sepolia...");

  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);

  const balance = await deployer.getBalance();
  console.log("💰 Account balance:", ethers.utils.formatEther(balance), "ETH");

  const ShadowVaultDemo = await ethers.getContractFactory("ShadowVaultDemo");
  const shadowVaultDemo = await ShadowVaultDemo.deploy();

  await shadowVaultDemo.deployed();

  console.log("✅ ShadowVaultDemo deployed to:", shadowVaultDemo.address);
  console.log("🔗 View on Etherscan: https://sepolia.etherscan.io/address/" + shadowVaultDemo.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });