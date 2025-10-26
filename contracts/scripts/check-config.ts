import * as dotenv from "dotenv";
import { ethers } from "hardhat";

/**
 * Check your deployment configuration
 * Run this before deploying to verify everything is set up correctly
 */
async function main() {
  console.log("🔍 Checking deployment configuration...\n");
  
  // Load environment variables
  dotenv.config();
  
  // Check .env file exists
  try {
    require("fs").readFileSync(".env");
    console.log("✅ .env file found");
  } catch (error) {
    console.log("❌ .env file not found");
    console.log("📝 Create it with: cp .env.example .env");
    process.exit(1);
  }
  
  // Check variables
  const requiredVars = {
    "SEPOLIA_RPC_URL": !!process.env.SEPOLIA_RPC_URL,
    "PRIVATE_KEY": !!process.env.PRIVATE_KEY,
  };
  
  const optionalVars = {
    "ETHERSCAN_API_KEY": !!process.env.ETHERSCAN_API_KEY,
  };
  
  console.log("\n📋 Environment Variables:");
  
  console.log("\n✅ Required:");
  let allPassed = true;
  for (const [key, present] of Object.entries(requiredVars)) {
    if (present) {
      console.log(`   ✅ ${key}`);
    } else {
      console.log(`   ❌ ${key} - MISSING`);
      allPassed = false;
    }
  }
  
  console.log("\n📋 Optional:");
  for (const [key, present] of Object.entries(optionalVars)) {
    if (present) {
      console.log(`   ✅ ${key} - (for contract verification)`);
    } else {
      console.log(`   ⚠️  ${key} - (optional, skip to verify on Etherscan)`);
    }
  }
  
  if (!allPassed) {
    console.log("\n❌ Some required environment variables are missing");
    console.log("📝 Edit your .env file and add the missing values");
    process.exit(1);
  }
  
  // Validate values
  console.log("\n🔍 Validating configuration...");
  
  // Check private key format
  const privateKey = process.env.PRIVATE_KEY!;
  let formattedKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
  
  if (formattedKey.length !== 66) {
    console.log("⚠️  Private key seems invalid (should be 64 hex characters + 0x)");
  } else {
    console.log("✅ Private key format looks correct");
  }
  
  // Check RPC URL
  const rpcUrl = process.env.SEPOLIA_RPC_URL!;
  if (rpcUrl.includes("YOUR_API_KEY")) {
    console.log("❌ SEPOLIA_RPC_URL contains placeholder value");
    console.log("   Update it with your actual API key");
    process.exit(1);
  }
  
  console.log("✅ RPC URL configured");
  
  // Try to connect to the network
  console.log("\n🌐 Testing network connection...");
  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const blockNumber = await provider.getBlockNumber();
    console.log(`✅ Connected to Sepolia (Block: ${blockNumber})`);
  } catch (error) {
    console.log("❌ Cannot connect to Sepolia network");
    console.log("   Check your SEPOLIA_RPC_URL");
    process.exit(1);
  }
  
  const checks = { "ETHERSCAN_API_KEY": !!process.env.ETHERSCAN_API_KEY };
  
  // Check account balance
  console.log("\n💰 Checking account balance...");
  try {
    const [deployer] = await ethers.getSigners();
    const balance = await ethers.provider.getBalance(deployer.address);
    const balanceEth = ethers.formatEther(balance);
    
    console.log(`   Address: ${deployer.address}`);
    console.log(`   Balance: ${balanceEth} ETH`);
    
    if (parseFloat(balanceEth) < 0.01) {
      console.log("⚠️  Low balance! Get Sepolia ETH:");
      console.log("   https://www.alchemy.com/faucets/ethereum-sepolia");
    } else {
      console.log("✅ Sufficient balance for deployment");
    }
  } catch (error) {
    console.log("❌ Cannot check balance");
    console.log("   Error:", error);
    process.exit(1);
  }
  
  console.log("\n✨ Configuration check complete!");
  console.log("\n🚀 Ready to deploy:");
  console.log("   npm run deploy:sepolia");
  
  if (!checks.ETHERSCAN_API_KEY) {
    console.log("\n💡 Note: Without ETHERSCAN_API_KEY, you can still deploy");
    console.log("   but won't be able to verify the contract on Etherscan");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Configuration check failed:", error.message);
    process.exit(1);
  });

