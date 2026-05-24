# Sahyog — Decentralized Crowdfunding

**Live:** [crowdfunding-beige-seven.vercel.app](https://crowdfunding-beige-seven.vercel.app/)

Sahyog is a crowdfunding platform on Ethereum where anyone can create campaigns, contribute ETH, and earn KARMA token rewards — all secured by smart contracts, no middlemen.

---

## What it does

- **Create a campaign** — set a goal, deadline, and token reward rate. Deploys as a gas-efficient on-chain clone.
- **Contribute ETH** — back campaigns you believe in. KARMA tokens land in your wallet automatically.
- **Transparent outcomes** — goal reached? Creator withdraws. Goal missed? Contributors get a full refund. All enforced on-chain.
- **Wallet-native** — works with MetaMask, Rainbow, and any WalletConnect-compatible wallet.

---

## Tech Stack

| Layer | Stack |
|-------|-------|
| Smart Contracts | Solidity, OpenZeppelin, EIP-1167 Minimal Proxy, Hardhat |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS |
| Web3 | Wagmi v2, Viem v2, RainbowKit |
| Network | Ethereum Sepolia Testnet |
| Hosting | Vercel |

---

## Deployed Contracts (Sepolia)

| Contract | Address |
|----------|---------|
| Factory | [`0xa94e97DB9B154d1534dbF5e8086d83be5fE64fC0`](https://sepolia.etherscan.io/address/0xa94e97DB9B154d1534dbF5e8086d83be5fE64fC0) |
| KARMA Token | [`0x507B04Faf5e449AB219B1d4ED2835443a0938257`](https://sepolia.etherscan.io/address/0x507B04Faf5e449AB219B1d4ED2835443a0938257) |

---

## Run Locally

**Prerequisites:** Node.js 18+, a Web3 wallet, [Sepolia ETH](https://sepoliafaucet.com/)

```bash
# Clone
git clone https://github.com/harsh522004/crowdFunding-Dapp.git
cd crowdFunding-Dapp

# Install & run the frontend
cd crowFunding-Frontend
npm install
cp .env.example .env        # add your WalletConnect project ID
npm run dev
```

Open `http://localhost:5173`, connect your wallet on Sepolia, and you're in.

---

## About this project

This is my first Web3 project. I built it to answer the questions I had when I started learning blockchain development:

- How does a button click trigger a real transaction?
- How do you read live contract state in a React app?
- How does the factory + clone pattern save gas?

I learned Solidity, worked through the EIP-1167 proxy pattern, and built the entire frontend from scratch. The contracts are verified on Etherscan and live on Sepolia.

---

## Project Structure

```
crowdFunding-Dapp/
├── hardhat/              # Solidity contracts + deployment scripts
│   └── contracts/
│       ├── NewFactoryContract.sol
│       ├── NewMasterContract.sol
│       └── KarmaToken.sol
└── crowFunding-Frontend/ # React app
    └── src/
        ├── features/campaigns/   # hooks + types
        ├── components/           # reusable UI
        ├── Pages/                # route-level pages
        └── contracts/            # ABIs + config
```

---

> Deployed on Sepolia testnet. Not audited — don't use on mainnet.
