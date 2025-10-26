import "dotenv/config";
import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Starting DeFi Simulator deployment...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);
  
  // Get account balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");
  
  // Check if deployer has enough balance
  if (balance < ethers.parseEther("0.01")) {
    throw new Error("⚠️ Insufficient balance. Need at least 0.01 ETH");
  }
  
  // Deploy the contract
  console.log("\n📦 Deploying DeFiSimulator contract...");
  const DeFiSimulator = await ethers.getContractFactory("DeFiSimulator");
  const defiSimulator = await DeFiSimulator.deploy();
  
  // Wait for deployment
  await defiSimulator.waitForDeployment();
  const address = await defiSimulator.getAddress();
  
  console.log("\n✅ DeFiSimulator deployed successfully!");
  console.log("📍 Contract address:", address);
  console.log("🔗 View on Etherscan:");
  
  // Determine explorer URL based on network
  const network = await ethers.provider.getNetwork();
  let explorerUrl = "";
  
  if (network.chainId === 11155111n) {
    // Sepolia
    explorerUrl = `https://sepolia.etherscan.io/address/${address}`;
  } else if (network.chainId === 1n) {
    // Mainnet
    explorerUrl = `https://etherscan.io/address/${address}`;
  } else if (network.chainId === 1337n || network.chainId === 31337n) {
    explorerUrl = `Local network - Chain ID: ${network.chainId}`;
  }
  
  console.log(explorerUrl);
  
  // Log initial state
  console.log("\n📊 Initial Reserves:");
  const [reserveA, reserveB] = await defiSimulator.getReserves();
  console.log("  Token A Reserves:", ethers.formatEther(reserveA));
  console.log("  Token B Reserves:", ethers.formatEther(reserveB));
  
  const price = await defiSimulator.getPrice();
  console.log("💰 Initial Price:", ethers.formatEther(price), "TokenB per TokenA");
  
  // Save deployment info
  console.log("\n📝 Deployment Info:");
  console.log("  Network:", network.name);
  console.log("  Chain ID:", network.chainId);
  console.log("  Block Number:", await ethers.provider.getBlockNumber());
  
  // Verify contract
  console.log("\n🔍 To verify the contract, run:");
  console.log(`npx hardhat verify --network ${network.name} ${address}`);
  
  console.log("\n✨ Deployment complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });

