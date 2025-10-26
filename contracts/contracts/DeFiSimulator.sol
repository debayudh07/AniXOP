// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title DeFiSimulator
 * @notice Educational contract for simulating various DeFi concepts
 * @dev This contract demonstrates AMM, Liquidity Pools, and token mechanisms
 */
contract DeFiSimulator {
    
    // State variables for simulations
    // User balances tracked separately for demonstration
    mapping(address => uint256) public userTokenA;
    mapping(address => uint256) public userTokenB;
    
    uint256 public totalSupplyA;
    uint256 public totalSupplyB;
    uint256 public reserveA = 1000 * 10**18; // Initial reserves (1000 tokens)
    uint256 public reserveB = 2000 * 10**18; // Initial reserves (2000 tokens)
    
    // Constants for exchange rate
    uint256 public constant INITIAL_K = 2000000 * 10**18; // k = x * y
    
    address public owner;
    bool public contractActive = true;
    
    event LiquidityAdded(address indexed user, uint256 amountA, uint256 amountB, uint256 timestamp);
    event TradeExecuted(address indexed user, address tokenIn, uint256 amountIn, uint256 amountOut, uint256 timestamp);
    event TokenMinted(address indexed to, uint256 amount, uint256 timestamp);
    event SimulationCompleted(string indexed concept, address indexed user, uint256 result, uint256 timestamp);
    
    constructor() {
        owner = msg.sender;
        totalSupplyA = 1000 * 10**18;
        totalSupplyB = 2000 * 10**18;
    }
    
    modifier onlyActive() {
        require(contractActive, "Contract is not active");
        _;
    }
    
    /**
     * @notice AMM Simulation - Calculate output amount using constant product formula
     * @param amountIn Amount of tokens to swap in
     * @return amountOut Amount of tokens to receive
     * @dev Uses the formula: k = x * y, where x and y are reserves
     */
    function simulateAMM(uint256 amountIn, bool isTokenA) external onlyActive returns (uint256 amountOut) {
        require(amountIn > 0, "Amount must be greater than 0");
        
        uint256 currentReserveIn;
        uint256 currentReserveOut;
        
        if (isTokenA) {
            currentReserveIn = reserveA;
            currentReserveOut = reserveB;
        } else {
            currentReserveIn = reserveB;
            currentReserveOut = reserveA;
        }
        
        require(currentReserveIn >= amountIn, "Insufficient reserves");
        require(amountIn < currentReserveIn, "Amount too large");
        
        // Constant product formula with simplified calculation to prevent overflow
        // Using: amountOut = (amountIn * reserveOut) / (reserveIn + amountIn)
        // Then apply 0.3% fee
        
        // Step 1: Calculate output without fee first (to avoid overflow in multiplication)
        // Check if multiplication would overflow
        require(currentReserveOut <= type(uint256).max / amountIn / 1000, "Reserve too large");
        
        // Calculate: (amountIn * reserveOut * 997) / (reserveIn * 1000 + amountIn * 997)
        // To avoid overflow, we calculate in parts
        
        uint256 k = currentReserveIn * currentReserveOut; // Constant product
        
        // New reserves after adding amountIn
        uint256 newReserveIn = currentReserveIn + amountIn;
        
        // New reserveOut using constant product: k = newReserveIn * newReserveOut
        require(k > newReserveIn, "Calculation underflow");
        uint256 newReserveOut = k / newReserveIn;
        
        // Calculate amountOut
        require(currentReserveOut >= newReserveOut, "Invalid calculation");
        amountOut = currentReserveOut - newReserveOut;
        
        // Apply 0.3% fee (997/1000)
        amountOut = (amountOut * 997) / 1000;
        
        // Ensure we don't take more than available
        require(amountOut <= currentReserveOut, "Insufficient output");
        require(amountOut > 0, "Amount out must be greater than 0");
        
        // Update reserves
        if (isTokenA) {
            reserveA += amountIn;
            require(reserveB >= amountOut, "Insufficient reserve B");
            reserveB -= amountOut;
        } else {
            reserveB += amountIn;
            require(reserveA >= amountOut, "Insufficient reserve A");
            reserveA -= amountOut;
        }
        
        emit TradeExecuted(msg.sender, isTokenA ? address(this) : address(this), amountIn, amountOut, block.timestamp);
        
        return amountOut;
    }
    
    /**
     * @notice Liquidity Pool Simulation - Add liquidity to the pool
     * @param amountA Amount of token A to add
     * @param amountB Amount of token B to add
     * @return lpTokens LP tokens minted
     * @dev Maintains 1:2 ratio (tokenA:tokenB)
     */
    function addLiquidity(uint256 amountA, uint256 amountB) external onlyActive returns (uint256 lpTokens) {
        require(amountA > 0 && amountB > 0, "Amounts must be greater than 0");
        require(amountB == amountA * 2, "Must maintain 1:2 ratio");
        
        reserveA += amountA;
        reserveB += amountB;
        totalSupplyA += amountA;
        totalSupplyB += amountB;
        
        // Calculate LP tokens (simple formula)
        lpTokens = amountA + amountB;
        
        emit LiquidityAdded(msg.sender, amountA, amountB, block.timestamp);
        
        return lpTokens;
    }
    
    /**
     * @notice Remove liquidity from the pool
     * @param lpTokens Amount of LP tokens to burn
     * @return amountA Amount of token A received
     * @return amountB Amount of token B received
     */
    function removeLiquidity(uint256 lpTokens) external onlyActive returns (uint256 amountA, uint256 amountB) {
        require(lpTokens > 0, "LP tokens must be greater than 0");
        
        // Calculate proportional amounts
        uint256 totalLPTokens = totalSupplyA + totalSupplyB;
        amountA = (lpTokens * reserveA) / totalLPTokens;
        amountB = (lpTokens * reserveB) / totalLPTokens;
        
        require(amountA <= reserveA && amountB <= reserveB, "Insufficient reserves");
        
        require(reserveA >= amountA, "Insufficient reserve A");
        require(reserveB >= amountB, "Insufficient reserve B");
        
        reserveA -= amountA;
        reserveB -= amountB;
        totalSupplyA -= amountA;
        totalSupplyB -= amountB;
        
        return (amountA, amountB);
    }
    
    /**
     * @notice Token Sniping Simulation - Simulate buying tokens early
     * @param amount Amount to invest
     * @return tokensReceived Tokens received
     * @dev Simulates the mechanics of token sniping
     */
    function simulateTokenSniping(uint256 amount) external onlyActive returns (uint256 tokensReceived) {
        require(amount > 0, "Amount must be greater than 0");
        
        // Lower price for early buyers (first 10 purchases)
        uint256 tokensToSend;
        
        if (reserveA < 100 ether) {
            // Early buying phase - 2x tokens
            tokensToSend = amount * 2;
        } else {
            // Normal buying phase
            tokensToSend = amount;
        }
        
        reserveA += amount;
        
        emit TokenMinted(msg.sender, tokensToSend, block.timestamp);
        
        return tokensToSend;
    }
    
    /**
     * @notice Get current price of token A in terms of token B
     * @return price Current price ratio
     */
    function getPrice() external view returns (uint256 price) {
        require(reserveA > 0, "No reserves");
        price = (reserveB * 1e18) / reserveA;
        return price;
    }
    
    /**
     * @notice Get user's total value in the pool
     * @param user Address to query
     * @return value Total value in wei
     */
    function getUserValue(address user) external view returns (uint256 value) {
        // Simple calculation without division to avoid issues
        return userTokenA[user] + userTokenB[user];
    }
    
    /**
     * @notice Complete a simulation scenario
     * @param concept Concept being simulated
     * @param result Result value
     */
    function completeSimulation(string memory concept, uint256 result) external onlyActive {
        emit SimulationCompleted(concept, msg.sender, result, block.timestamp);
    }
    
    /**
     * @notice Get reserves
     * @return _reserveA Reserve of token A
     * @return _reserveB Reserve of token B
     */
    function getReserves() external view returns (uint256 _reserveA, uint256 _reserveB) {
        return (reserveA, reserveB);
    }
    
    /**
     * @notice Reset simulation (only for testing)
     */
    function resetSimulation() external {
        require(msg.sender == owner, "Only owner can reset");
        reserveA = 1000 * 10**18;
        reserveB = 2000 * 10**18;
        totalSupplyA = 1000 * 10**18;
        totalSupplyB = 2000 * 10**18;
    }
    
    /**
     * @notice Emergency pause
     */
    function setActive(bool active) external {
        require(msg.sender == owner, "Only owner can modify");
        contractActive = active;
    }
}

