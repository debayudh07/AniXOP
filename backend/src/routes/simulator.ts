import express, { Request, Response } from 'express';
import { ethers } from 'ethers';
import User from '../models/User';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Contract ABI (simplified - you'll generate the full ABI after deployment)
const CONTRACT_ABI = [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amountA",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amountB",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "name": "LiquidityAdded",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "string",
          "name": "concept",
          "type": "string"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "result",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "name": "SimulationCompleted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "name": "TokenMinted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "tokenIn",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amountIn",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amountOut",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "name": "TradeExecuted",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "INITIAL_K",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "amountA",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "amountB",
          "type": "uint256"
        }
      ],
      "name": "addLiquidity",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "lpTokens",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "concept",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "result",
          "type": "uint256"
        }
      ],
      "name": "completeSimulation",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "contractActive",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getPrice",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "price",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getReserves",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "_reserveA",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_reserveB",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "user",
          "type": "address"
        }
      ],
      "name": "getUserValue",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "lpTokens",
          "type": "uint256"
        }
      ],
      "name": "removeLiquidity",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "amountA",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "amountB",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "reserveA",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "reserveB",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "resetSimulation",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bool",
          "name": "active",
          "type": "bool"
        }
      ],
      "name": "setActive",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "amountIn",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "isTokenA",
          "type": "bool"
        }
      ],
      "name": "simulateAMM",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "amountOut",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "simulateTokenSniping",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "tokensReceived",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "totalSupplyA",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "totalSupplyB",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "userTokenA",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "userTokenB",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ];

// Sepolia testnet configuration
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || 'https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY';
const CONTRACT_ADDRESS = process.env.DEFI_SIMULATOR_CONTRACT_ADDRESS || ''; // Will be set after deployment
const PRIVATE_KEY = process.env.PRIVATE_KEY || '';

// Middleware to verify token
const authenticateToken = async (req: Request, res: Response, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  const jwt = require('jsonwebtoken');
  const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access denied',
      message: 'No token provided'
    });
  }

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token',
        message: 'User not found'
      });
    }
    (req as any).user = user;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      error: 'Invalid token',
      message: 'Token is invalid or expired'
    });
  }
};

// Connect to provider
function getProvider() {
  return new ethers.providers.JsonRpcProvider(SEPOLIA_RPC_URL);
}

function getContractSigner() {
  const provider = getProvider();
  const formattedKey = PRIVATE_KEY.startsWith('0x') ? PRIVATE_KEY : `0x${PRIVATE_KEY}`;
  const wallet = new ethers.Wallet(formattedKey, provider);
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);
}

// Get current reserves
router.get('/reserves', authenticateToken, async (req: Request, res: Response) => {
  try {
    const provider = getProvider();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    
    const [reserveA, reserveB] = await contract.getReserves();
    
    res.json({
      success: true,
      data: {
        reserveA: reserveA.toString(),
        reserveB: reserveB.toString(),
        price: (parseFloat(reserveB.toString()) / parseFloat(reserveA.toString())).toFixed(4)
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get reserves'
    });
  }
});

// Get price
router.get('/price', authenticateToken, async (req: Request, res: Response) => {
  try {
    const provider = getProvider();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    
    const price = await contract.getPrice();
    
    res.json({
      success: true,
      data: {
        price: parseFloat(price.toString()) / 1e18,
        formatted: `${parseFloat(price.toString()) / 1e18} TokenB per TokenA`
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get price'
    });
  }
});

// Simulate AMM trade
router.post('/simulate-amm', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { amountIn, isTokenA } = req.body;
    
    if (!amountIn || typeof isTokenA !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'Invalid parameters'
      });
    }

    const contract = getContractSigner();
    const amountInWei = ethers.utils.parseEther(amountIn.toString());
    
    const tx = await contract.simulateAMM(amountInWei, isTokenA, {
      gasLimit: 500000
    });
    
    const receipt = await tx.wait();
    
    // Get the result
    const eventSignature = ethers.utils.id("TradeExecuted(address,address,uint256,uint256,uint256)");
    const events = receipt.logs
      .filter((log: any) => log.topics[0] === eventSignature)
      .map((log: any) => {
        const decoded = contract.interface.parseLog(log);
        return {
          user: decoded.args[0],
          amountIn: decoded.args[2].toString(),
          amountOut: decoded.args[3].toString(),
          timestamp: decoded.args[4].toString()
        };
      });
    
    res.json({
      success: true,
      data: {
        transactionHash: tx.hash,
        events: events,
        message: 'AMM trade simulated successfully'
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to simulate AMM trade'
    });
  }
});

// Add liquidity
router.post('/add-liquidity', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { amountA, amountB } = req.body;
    
    if (!amountA || !amountB) {
      return res.status(400).json({
        success: false,
        error: 'Invalid parameters'
      });
    }

    const contract = getContractSigner();
    const amountAWei = ethers.utils.parseEther(amountA.toString());
    const amountBWei = ethers.utils.parseEther(amountB.toString());
    
    const tx = await contract.addLiquidity(amountAWei, amountBWei, {
      gasLimit: 500000
    });
    
    await tx.wait();
    
    res.json({
      success: true,
      data: {
        transactionHash: tx.hash,
        message: 'Liquidity added successfully'
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to add liquidity'
    });
  }
});

// Simulate token sniping
router.post('/simulate-sniping', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { amount } = req.body;
    
    if (!amount) {
      return res.status(400).json({
        success: false,
        error: 'Invalid parameters'
      });
    }

    const contract = getContractSigner();
    const amountWei = ethers.utils.parseEther(amount.toString());
    
    const tx = await contract.simulateTokenSniping(amountWei, {
      gasLimit: 500000
    });
    
    const receipt = await tx.wait();
    
    res.json({
      success: true,
      data: {
        transactionHash: tx.hash,
        message: 'Token sniping simulation completed'
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to simulate token sniping'
    });
  }
});

// Complete simulation
router.post('/complete-simulation', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { concept, result } = req.body;
    
    const contract = getContractSigner();
    
    const tx = await contract.completeSimulation(concept, result || 0, {
      gasLimit: 300000
    });
    
    await tx.wait();
    
    res.json({
      success: true,
      data: {
        transactionHash: tx.hash,
        message: 'Simulation completed'
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to complete simulation'
    });
  }
});

export default router;

