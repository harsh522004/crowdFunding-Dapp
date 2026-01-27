import { NavLink } from "react-router-dom";
import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from 'wagmi';

function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { address, isConnected } = useAccount();
  return (
    <header className="border-b border-slate-700 bg-slate-900/95 backdrop-blur-md sticky top-0 z-50 shadow-lg shadow-black/20">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <span className="text-white font-bold text-lg">₿</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-white">CrowdFund</h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `text-sm font-medium transition-colors hover:text-blue-400 ${isActive ? 'text-blue-400' : 'text-slate-300'
                }`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/create"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors hover:text-blue-400 ${isActive ? 'text-blue-400' : 'text-slate-300'
                }`
              }
            >
              Create Campaign
            </NavLink>
            <NavLink
              to="/my-campaigns"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors hover:text-blue-400 ${isActive ? 'text-blue-400' : 'text-slate-300'
                }`
              }
            >
              My Campaigns
            </NavLink>
          </nav>

          {/* Desktop Connect Wallet Button */}
          <div className="hidden md:block">
            <ConnectButton chainStatus="icon" />

            {isConnected && (
              <p>Connected wallet: {address}</p>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <span className="text-2xl">✕</span>
            ) : (
              <span className="text-2xl">☰</span>
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="md:hidden pt-4 pb-2 border-t border-slate-700 mt-4 animate-slideDown">
            <div className="flex flex-col gap-3">
              <NavLink
                to="/"
                end
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'text-slate-300 hover:bg-slate-800'
                  }`
                }
              >
                Home
              </NavLink>
              <NavLink
                to="/create"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'text-slate-300 hover:bg-slate-800'
                  }`
                }
              >
                Create Campaign
              </NavLink>
              <NavLink
                to="/my-campaigns"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'text-slate-300 hover:bg-slate-800'
                  }`
                }
              >
                My Campaigns
              </NavLink>
              <div className="px-4 py-2">
                <ConnectButton chainStatus="icon" />
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}

export default Header;
