import { NavLink } from "react-router-dom";
import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useReadContract } from "wagmi";
import { CONTRACTS, SEPOLIA_CHAIN_ID } from "../contracts/config";
import { factoryABI } from "../contracts/ABI/FactoryABI";
import type { Address } from "viem";
import logoSrc from "../assets/Logo.png";


function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { address: connectedAddress, isConnected } = useAccount();

  const { data: ownerAddress } = useReadContract({
    address: CONTRACTS.factory as Address,
    abi: factoryABI,
    functionName: "owner",
    chainId: SEPOLIA_CHAIN_ID,
    query: { enabled: isConnected },
  });

  const isFactoryOwner =
    isConnected &&
    !!ownerAddress &&
    connectedAddress?.toLowerCase() === (ownerAddress as string).toLowerCase();
  return (
    <header className="border-b border-slate-700 bg-slate-900/95 backdrop-blur-md sticky top-0 z-50 shadow-lg shadow-black/20">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <NavLink to="/" className="flex items-center group">
            <img
              src={logoSrc}
              alt="Sahyog"
              className="h-9 w-auto group-hover:opacity-90 transition-opacity duration-200"
            />
          </NavLink>

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
            {isFactoryOwner && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors hover:text-purple-400 ${isActive ? 'text-purple-400' : 'text-slate-300'
                  }`
                }
              >
                Admin ⚙️
              </NavLink>
            )}
          </nav>

          {/* Desktop Connect Wallet Button */}
          <div className="hidden md:block">
            <ConnectButton chainStatus="icon" />
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
              {isFactoryOwner && (
                <NavLink
                  to="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                      ? 'bg-purple-500/20 text-purple-400'
                      : 'text-slate-300 hover:bg-slate-800'
                    }`
                  }
                >
                  Admin ⚙️
                </NavLink>
              )}
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
