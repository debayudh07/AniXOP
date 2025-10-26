import "dotenv/config";
import { ethers } from "hardhat";

/**
 * Deploy to Sepolia testnet
 * 
 * Prerequisites:
 * 1. Get Sepolia ETH from https://sepoliafaucet.com/
 * 2. Set up .env with:
 *    - SEPOLIA_RPC_URL
 *    - PRIVATE_KEY
 *    - ETHERSCAN_API_KEY (optional, for verification)
 * 
 * Usage:
 * npx hardhat run scripts/deploy-sepolia.ts --network sepolia
 */
async function main() {
  console.log("🌐 Deploying to Sepolia testnet...");
  
  // Check environment variables
  const privateKey = process.env.PRIVATE_KEY;
  const rpcUrl = process.env.SEPOLIA_RPC_URL;
  
  if (!privateKey) {
    throw new Error("❌ PRIVATE_KEY not found in environment variables.\n" +
      "Please create a .env file with your private key:\n" +
      "PRIVATE_KEY=your_private_key_here\n" +
      "SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY");
  }
  
  if (!rpcUrl || rpcUrl.includes("YOUR_API_KEY")) {
    throw new Error("❌ SEPOLIA_RPC_URL not configured correctly.\n" +
      "Please update your .env file with a valid Sepolia RPC URL.");
  }
  
  console.log("✅ Environment variables configured");
  console.log("📡 RPC URL:", rpcUrl.replace(/\/v2\/[^/]+/, "/v2/***"));
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);
  
  // Verify the account has the correct private key
  try {
    await ethers.provider.getBlockNumber();
  } catch (error) {
    throw new Error("❌ Cannot connect to Sepolia network.\n" +
      "Check your SEPOLIA_RPC_URL and try again.");
  }
  
  // Get account balance
  const balance = await ethers.provider.getBalance(deployer.address);
  const balanceEth = ethers.formatEther(balance);
  console.log("💰 Account balance:", balanceEth, "ETH");
  
  // Check if deployer has enough balance
  if (parseFloat(balanceEth) < 0.01) {
    throw new Error("⚠️ Insufficient Sepolia ETH balance. Get some from https://sepoliafaucet.com/");
  }
  
  console.log("\n✅ Sufficient balance confirmed");
  
  // Deploy the contract
  console.log("\n📦 Deploying DeFiSimulator contract...");
  const DeFiSimulator = await ethers.getContractFactory("DeFiSimulator");
  
  console.log("⏳ Waiting for deployment transaction...");
  const defiSimulator = await DeFiSimulator.deploy();
  
  // Wait for deployment to be mined
  console.log("⏳ Waiting for deployment confirmation...");
  await defiSimulator.waitForDeployment();
  
  const address = await defiSimulator.getAddress();
  const deploymentTransaction = defiSimulator.deploymentTransaction();
  
  console.log("\n✅ DeFiSimulator deployed successfully!");
  console.log("📍 Contract address:", address);
  console.log("🔗 View on Sepolia Etherscan:");
  console.log(`   https://sepolia.etherscan.io/address/${address}`);
  
  if (deploymentTransaction) {
    console.log("\n📝 Transaction Details:");
    console.log("   Transaction hash:", deploymentTransaction.hash);
    console.log("   Gas price:", ethers.formatUnits(deploymentTransaction.gasPrice || 0, "gwei"), "gwei");
    
    // Wait for a few confirmations
    console.log("\n⏳ Waiting for transaction confirmation...");
    const receipt = await deploymentTransaction.wait();
    console.log("✅ Transaction confirmed in block:", receipt?.blockNumber);
  }
  
  // Log initial state
  console.log("\n📊 Initial Contract State:");
  try {
    const [reserveA, reserveB] = await defiSimulator.getReserves();
    console.log("   Token A Reserves:", ethers.formatEther(reserveA));
    console.log("   Token B Reserves:", ethers.formatEther(reserveB));
    
    const price = await defiSimulator.getPrice();
    console.log("   Initial Price:", ethers.formatEther(price), "TokenB per TokenA");
    
    const owner = await defiSimulator.owner();
    console.log("   Owner:", owner);
  } catch (error) {
    console.log("   Could not read initial state:", error);
  }
  
  // Verify contract
  console.log("\n🔍 To verify the contract on Etherscan:");
  console.log(`   npx hardhat verify --network sepolia ${address}`);
  
  console.log("\n📝 Next Steps:");
  console.log("   1. Copy the contract address above");
  console.log("   2. Update backend/.env with:");
  console.log(`      DEFI_SIMULATOR_CONTRACT_ADDRESS=${address}`);
  console.log("   3. Update the ABI in backend/src/routes/simulator.ts");
  console.log("   4. Restart the backend server");
  
  console.log("\n✨ Deployment complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed!");
    console.error("\n📋 Error Details:");
    console.error("   ", error.message);
    
    if (error.message.includes("Must be authenticated")) {
      console.error("\n🔍 Common Solutions:");
      console.error("   1. Check your .env file exists in the contracts/ directory");
      console.error("   2. Verify PRIVATE_KEY is set correctly");
      console.error("   3. Make sure SEPOLIA_RPC_URL is valid and not expired");
      console.error("   4. Check you're using the correct network (Sepolia)");
      console.error("\n💡 Quick Fix:");
      console.error("   cd contracts");
      console.error("   cp .env.example .env");
      console.error("   # Edit .env and add your values");
      console.error("   npm run deploy:sepolia");
    } else if (error.message.includes("insufficient funds")) {
      console.error("\n💰 Get Sepolia ETH:");
      console.error("   https://www.alchemy.com/faucets/ethereum-sepolia");
      console.error("   https://sepoliafaucet.com/");
    }
    
    process.exit(1);
  });

