import { getAddressUrl } from "../utils/etherscan";
import { CONTRACTS } from "../contracts/config";

export default function Footer() {
  return (
    <footer className="border-t border-slate-700 bg-slate-900 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">₿</span>
              </div>
              <span className="text-white font-bold">CrowdFund</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Decentralized crowdfunding on Ethereum. Create campaigns, earn
              token rewards, secured by smart contracts.
            </p>
          </div>

          {/* Contracts */}
          <div>
            <h4 className="text-sm font-semibold text-slate-300 mb-3">
              Contracts (Sepolia)
            </h4>
            <ul className="space-y-2 text-xs text-slate-500">
              <li>
                <a
                  href={getAddressUrl(CONTRACTS.factory)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-400 transition-colors font-mono"
                >
                  Factory ↗
                </a>
              </li>
              <li>
                <a
                  href={getAddressUrl(CONTRACTS.token)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-400 transition-colors font-mono"
                >
                  Karma Token ↗
                </a>
              </li>
            </ul>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-slate-300 mb-3">
              Project
            </h4>
            <ul className="space-y-2 text-xs text-slate-500">
              <li>
                <a
                  href="https://github.com/harsh522004/crowdFunding-Dapp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-400 transition-colors"
                >
                  GitHub ↗
                </a>
              </li>
              <li>
                <a
                  href="https://sepolia.etherscan.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-400 transition-colors"
                >
                  Sepolia Etherscan ↗
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-6 text-center text-xs text-slate-600">
          Built on Ethereum · Sepolia Testnet · Open Source
        </div>
      </div>
    </footer>
  );
}
