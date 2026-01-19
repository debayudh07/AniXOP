# AniXOP - DeFi Learning Platform

A comprehensive educational platform for learning DeFi (Decentralized Finance) concepts through interactive lessons, simulations, and on-chain smart contract interactions.

## 🌟 Overview

AniXOP is an interactive DeFi learning platform that combines theoretical knowledge with practical, hands-on experience. The platform features:

- **Interactive Learning Modules**: Comprehensive lessons on DeFi concepts like AMM, Liquidity Pools, Token Sniping, Yield Farming, and Impermanent Loss
- **On-Chain Simulations**: Smart contract-based simulations that demonstrate real DeFi mechanisms
- **AI-Powered Explanations**: Integration with Google's Gemini AI for personalized learning and synthesis
- **Progress Tracking**: User authentication and lesson progress tracking
- **Mobile-First Design**: Built with React Native and Expo for cross-platform mobile experience

## 🏗️ Architecture

The project consists of three main components:

### 1. **Mobile App** (`/app`)
- **Technology**: React Native, Expo Router, TypeScript
- **UI Framework**: NativeWind (Tailwind CSS for React Native), Gluestack UI
- **Features**:
  - User authentication and profile management
  - Interactive DeFi concept lessons
  - Real-time on-chain simulation execution
  - Progress tracking and lesson completion
  - Web3 wallet integration (WalletConnect/Reown)

### 2. **Backend API** (`/backend`)
- **Technology**: Node.js, Express, TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Features**:
  - User authentication with JWT
  - Lesson content generation using Gemini AI
  - Progress tracking and user management
  - DeFi simulation orchestration
  - RESTful API endpoints

### 3. **Smart Contracts** (`/contracts`)
- **Technology**: Solidity, Hardhat
- **Network**: Ethereum (Sepolia testnet support)
- **Features**:
  - DeFiSimulator contract for educational simulations
  - AMM (Automated Market Maker) demonstrations
  - Liquidity pool mechanics
  - Token sniping simulations

## 📋 Prerequisites

Before setting up the project, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB** (local or MongoDB Atlas account)
- **Expo CLI** (for mobile development)
- **Git**

For mobile development:
- **iOS**: macOS with Xcode
- **Android**: Android Studio with Android SDK

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/debayudh07/AniXOP.git
cd AniXOP
```

### 2. Setup Backend

```bash
cd backend
npm install

# Create .env file
cat > .env << EOF
PORT=3000
JWT_SECRET=your-secure-jwt-secret-key
MONGODB_URI=your-mongodb-connection-string
GEMINI_API_KEY=your-google-gemini-api-key
EOF

# Start development server
npm run dev
```

The backend API will be available at `http://localhost:3000`

### 3. Setup Smart Contracts

```bash
cd contracts
npm install

# Create .env file for contract deployment
cat > .env << EOF
SEPOLIA_RPC_URL=your-sepolia-rpc-url
PRIVATE_KEY=your-wallet-private-key
ETHERSCAN_API_KEY=your-etherscan-api-key
EOF

# Compile contracts
npm run compile

# Run tests
npm test

# Deploy to Sepolia (optional)
npm run deploy:sepolia
```

### 4. Setup Mobile App

```bash
cd app
npm install

# Create .env file (if needed)
# Configure API_BASE_URL in the code to point to your backend

# Start Expo development server
npm start
```

Then:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app for physical device testing

## 📱 Features

### Learning Modules

The platform covers essential DeFi concepts:

1. **Introduction to DeFi**: Basics of decentralized finance
2. **Automated Market Makers (AMM)**: How constant product formula works
3. **Liquidity Pools & LP Tokens**: Understanding liquidity provision
4. **Token Sniping**: MEV and front-running concepts
5. **Yield Farming**: Earning through DeFi protocols
6. **Impermanent Loss**: Risks of liquidity provision

### Interactive Simulations

Each lesson includes:
- **Theoretical Explanations**: AI-generated comprehensive content
- **Real-World Examples**: Practical scenarios and use cases
- **On-Chain Simulations**: Execute transactions on smart contracts
- **Visual Results**: See the impact of DeFi operations in real-time
- **AI Synthesis**: Get personalized explanations of simulation results

### User Management

- Secure authentication with JWT tokens
- Progress tracking across all lessons
- Ability to reset and retry lessons
- Profile management

## 🔌 API Documentation

### Authentication Endpoints

```
POST /api/auth/register - Register a new user
POST /api/auth/login - Login user
POST /api/auth/reset-lesson/:conceptId - Reset lesson progress
GET /api/auth/status - Check database status
```

### Learning Endpoints

```
POST /api/defi/concept/:id - Get lesson content
POST /api/learning/complete - Mark lesson as complete
```

### Simulation Endpoints

```
POST /api/simulator/execute - Execute on-chain simulation
POST /api/synthesize - Get AI synthesis of simulation results
```

For detailed API documentation, see [Backend README](./backend/README.md).

## 🛠️ Technology Stack

### Frontend (Mobile App)
- **Framework**: React Native 0.81.5, React 19
- **Routing**: Expo Router 6
- **Styling**: NativeWind, Tailwind CSS, Gluestack UI
- **Web3**: Wagmi, Viem, WalletConnect
- **State Management**: Valtio, React Query
- **Animations**: React Native Reanimated, Expo Linear Gradient

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT, bcryptjs
- **AI Integration**: Google Generative AI (Gemini)

### Smart Contracts
- **Language**: Solidity ^0.8.28
- **Framework**: Hardhat
- **Testing**: Chai, Hardhat Network Helpers
- **Libraries**: Ethers.js v6

## 📂 Project Structure

```
AniXOP/
├── app/                    # React Native mobile application
│   ├── app/               # Expo Router app directory
│   │   ├── (tabs)/       # Tab navigation screens
│   │   ├── concept/      # Lesson detail screens
│   │   ├── context/      # React contexts (Auth)
│   │   └── services/     # API and Gemini services
│   ├── components/        # Reusable UI components
│   └── assets/           # Images, fonts, and static files
│
├── backend/               # Express.js API server
│   └── src/
│       ├── config/       # Database and environment config
│       ├── models/       # Mongoose schemas
│       ├── routes/       # API route handlers
│       ├── services/     # Business logic
│       └── server.ts     # Express app entry point
│
├── contracts/             # Solidity smart contracts
│   ├── contracts/        # Smart contract source files
│   ├── scripts/          # Deployment scripts
│   ├── test/            # Contract tests
│   └── ignition/        # Hardhat Ignition modules
│
└── RESET_LESSON.md       # Guide for resetting lesson progress
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Smart Contract Tests
```bash
cd contracts
npm test

# With gas reporting
npm run test:gas

# With coverage
npx hardhat coverage
```

### Mobile App Tests
```bash
cd app
npm run lint
```

## 🔐 Security

- All passwords are hashed using bcryptjs
- JWT tokens for secure authentication
- MongoDB injection prevention through Mongoose
- Smart contracts follow security best practices
- Environment variables for sensitive data

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👥 Authors

- **Debayudh07** - [GitHub Profile](https://github.com/debayudh07)

## 🙏 Acknowledgments

- Google Gemini AI for educational content generation
- Expo and React Native community
- Hardhat and Ethereum development tools
- WalletConnect for Web3 integration

## 📧 Support

For questions, issues, or suggestions, please:
- Open an issue on GitHub
- Contact the maintainers

## 🗺️ Roadmap

Future enhancements planned:
- [ ] Additional DeFi concepts (Flash Loans, Staking, Governance)
- [ ] Multi-language support
- [ ] Gamification and achievements system
- [ ] Community features and discussions
- [ ] Mainnet support for real transactions
- [ ] Advanced analytics and insights

---

**Happy Learning! 🚀📚**

*Learn DeFi concepts through interactive, hands-on experience with AniXOP.*
