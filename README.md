# CrowdFunding DApp

A decentralized crowdfunding platform built on Ethereum that enables users to create campaigns, contribute with ETH, and earn ERC20 token rewards. Built with React, Solidity, and deployed on Sepolia testnet.

## Purpose

This is my first Web3 project, born from a deep curiosity to understand how frontends actually communicate with smart contracts. When I started, I had questions like: How does a button click trigger a blockchain transaction? How do we read contract state in real-time? How do we handle wallet connections?

Through this project, I gained hands-on experience with the complete Web3 development stack - from writing and deploying smart contracts to building a responsive frontend that seamlessly interacts with the blockchain. This journey transformed abstract concepts into practical knowledge.

## Learning Journey

### 1. Solidity Fundamentals
I started by learning Solidity basics and understanding how smart contracts work. My first practical experience was creating a simple crowdfunding contract to grasp core concepts like state management, payable functions, and event emissions.

### 2. Advanced Contract Patterns
I deepened my knowledge through [RiseIn](https://www.risein.com/)'s curriculum, where I learned about proxy patterns and gas optimization techniques. I then reimplemented my contracts using the EIP-1167 Minimal Proxy pattern (see [contracts](./hardhat/contracts/)), which significantly reduces deployment costs by creating clones instead of deploying full contract copies.

### 3. Building the DApp
With confidence in my contract skills, I wanted to create a real DApp where users could interact with ETH. Having a background in Angular, I saw this as an opportunity to learn React as well. After going through React basics, I started building.

### 4. AI as a Mentor
This project is an example of how AI can accelerate learning at each step. I followed a detailed roadmap (see [Roadmap.md](./context/Roadmap.md)), built features incrementally, and received thorough reviews throughout the process. The UI was entirely created with AI assistance, allowing me to focus on understanding Web3 concepts.

## Features

- **Campaign Creation**: Deploy new crowdfunding campaigns as gas-efficient proxy clones
- **ETH Contributions**: Users can contribute ETH to active campaigns
- **Token Rewards**: Contributors automatically receive ERC20 tokens based on contribution amount
- **Campaign Management**: Creators can withdraw funds from successful campaigns
- **Refund Mechanism**: Contributors get refunds if campaigns fail to meet goals
- **Wallet Integration**: Seamless connection with MetaMask and other wallets via RainbowKit
- **Real-time Updates**: Campaign status and contributions update in real-time
- **Responsive Design**: Works perfectly on desktop and mobile devices

## Tech Stack

### Smart Contracts
- **Solidity** - Contract development
- **[OpenZeppelin](https://www.openzeppelin.com/)** - Secure, audited contract libraries
- **[Hardhat](https://hardhat.org/docs/getting-started)** - Development environment for compilation, testing, and deployment
- **Remix IDE** - Initial development and testing
- **Etherscan** - Contract verification on Sepolia testnet

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **[Wagmi](https://wagmi.sh/react/api/hooks)** - React hooks for Ethereum
- **RainbowKit** - Wallet connection UI
- **Viem** - Ethereum interactions
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **date-fns** - Date formatting
- **Lucide React** - Icons

### Network
- **Sepolia Testnet** - Ethereum test network

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MetaMask or another Web3 wallet
- Sepolia testnet ETH (get from [Sepolia faucet](https://sepoliafaucet.com/))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/crowdFunding-Dapp.git
   cd crowdFunding-Dapp
   ```

2. **Install Hardhat dependencies**
   ```bash
   cd hardhat
   npm install
   ```

3. **Install Frontend dependencies**
   ```bash
   cd ../crowFunding-Frontend
   npm install
   ```

### Running the Application

1. **Start the frontend development server**
   ```bash
   cd crowFunding-Frontend
   npm run dev
   ```

2. **Open your browser**
   Navigate to `http://localhost:5173`

3. **Connect your wallet**
   - Make sure you're on Sepolia testnet
   - Click "Connect Wallet" and approve the connection

### Deploying Contracts (Optional)

If you want to deploy your own contracts:

1. **Set up environment variables**
   ```bash
   cd hardhat
   cp .env.example .env
   # Add your private key and Sepolia RPC URL
   ```

2. **Deploy contracts**
   ```bash
   npx hardhat run scripts/deploy.ts --network sepolia
   ```

3. **Verify contracts on Etherscan**
   ```bash
   npx hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS
   ```

4. **Update frontend config**
   Update contract addresses in `crowFunding-Frontend/src/contracts/config.ts`

## Next Steps

See [Remaning_Task.md](./context/Remaning_Task.md) for the complete list of planned improvements:

### UI Enhancements
- Update branding and logo
- Add copy-to-clipboard functionality for campaign addresses
- Display token holdings for current users
- Implement recent activity tracking per campaign

### Contract Improvements
- Add metadata support (logo, description) for tokens
- Add campaign metadata (title, description)

### Backend & Authentication
- Implement user authentication
- Store user activity in a database for better UX
- Build activity history and analytics

## Contributing

Contributions are welcome! This project is a learning resource, so improvements in code quality, documentation, or features are appreciated.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Resources

### Documentation
- [Project Details](./context/Project%20details.md) - Complete project specifications and architecture
- [Learning Roadmap](./context/Roadmap.md) - Step-by-step learning path followed
- [Remaining Tasks](./context/Remaning_Task.md) - Planned improvements and next steps

### Code
- [Smart Contracts](./hardhat/contracts/) - Solidity contracts (Factory, Master, Token)
- [Frontend Source](./crowFunding-Frontend/src/) - React components and Web3 hooks

## License

This project is open source and available under the MIT License.

## Acknowledgments

- [RiseIn](https://www.risein.com/) for comprehensive Web3 education
- [OpenZeppelin](https://www.openzeppelin.com/) for secure contract libraries
- The AI tools that served as mentors throughout this journey
- The Ethereum and Web3 developer community for excellent documentation

---

**Note**: This is a learning project deployed on Sepolia testnet. Do not use these contracts on mainnet without proper auditing.