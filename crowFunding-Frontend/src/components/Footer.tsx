const GITHUB_URL = "https://github.com/harsh522004/crowdFunding-Dapp";
const CONTRACT_URL = "https://sepolia.etherscan.io/address/0x22Fc5B7F7aC04cA58B12D509b0c6eE9E7b6CB5fA";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-800 bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Brand */}
          <div className="text-center md:text-left">
            <p className="text-lg font-bold text-white">CrowdFund DApp</p>
            <p className="text-sm text-slate-400 mt-1">
              Decentralized crowdfunding on Ethereum Sepolia
            </p>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-white transition-colors"
            >
              GitHub
            </a>
            <a
              href={CONTRACT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-white transition-colors"
            >
              Contract
            </a>
          </div>

          {/* Network badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-full border border-slate-700">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-slate-300">Sepolia Testnet</span>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 text-center text-xs text-slate-600">
          Built with React, Wagmi &amp; Solidity &bull; Open source
        </div>
      </div>
    </footer>
  );
}
