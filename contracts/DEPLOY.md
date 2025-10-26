# Deploy DeFi Simulator Contract to Sepolia

## Prerequisites
1. Get a Sepolia RPC URL from [Alchemy](https://www.alchemy.com/) or [Infura](https://www.infura.io/)
2. Get a private key with testnet ETH from [Sepolia Faucet](https://sepoliafaucet.com/)
3. (Optional) Get an Etherscan API key from [Etherscan](https://etherscan.io/apis) for contract verification

## Quick Start

### 1. Setup Environment

Create `.env` file:
```bash
cp .env.example .env
```

Fill in your values in `.env`:
```
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
PRIVATE_KEY=your_private_key_here

# Optional - for contract verification on Etherscan
ETHERSCAN_API_KEY=your_etherscan_key_here
```

**Notes:**
- The `0x` prefix in private key is optional - it will be added automatically
- ETHERSCAN_API_KEY is optional - only needed if you want to verify the contract

### 2. Install Dependencies

```bash
npm install
```

### 3. Compile Contract

```bash
npm run compile
```

### 4. Run Tests

```bash
npm test
```

### 5. Deploy to Sepolia

```bash
# Deploy to Sepolia testnet
npm run deploy:sepolia

# Or use the direct command
npx hardhat run scripts/deploy-sepolia.ts --network sepolia
```

### 6. After Deployment

Copy the contract address and update your backend `.env`:
```
DEFI_SIMULATOR_CONTRACT_ADDRESS=0x...your_contract_address
```

### 7. Verify Contract on Etherscan

```bash
npm run verify <CONTRACT_ADDRESS>

# Or directly
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

## Available Scripts

```bash
# Compile contracts
npm run compile

# Run tests
npm test

# Deploy to Sepolia
npm run deploy:sepolia

# Deploy locally (Hardhat)
npm run deploy:local

# Start local node
npm run node

# Clean artifacts
npm run clean
```

## Testing Locally

```bash
# Terminal 1: Start local Hardhat node
npm run node

# Terminal 2: Deploy to local network
npm run deploy:local
```

## Deployment Output

When you run the deployment script, you'll see:
- ✅ Contract address
- 🔗 Etherscan link
- 📊 Initial reserves and price
- 📝 Next steps

## Troubleshooting

### "Insufficient balance" error
- Get Sepolia ETH from [Alchemy Faucet](https://www.alchemy.com/faucets/ethereum-sepolia)

### "Invalid API key" error
- Check your SEPOLIA_RPC_URL is correct
- Make sure you're using Sepolia endpoints, not mainnet

### "Contract deployment failed"
- Ensure you have enough gas (0.01+ ETH)
- Check your private key format
- Verify network settings in hardhat.config.ts

