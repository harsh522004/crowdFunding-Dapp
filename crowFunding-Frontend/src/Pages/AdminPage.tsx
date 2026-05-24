import { useState } from "react";
import { useAccount } from "wagmi";
import { useNavigate } from "react-router-dom";
import { formatUnits, parseUnits } from "viem";
import type { Address } from "viem";
import { useAdminPanel } from "../hooks/useAdminPanel";
import { useTokenInfo } from "../features/campaigns/hooks";
import TransactionButton from "../components/TransactionButton";
import LoadingSpinner from "../components/LoadingSpinner";
import { shortenAddress } from "../utils/formatters";
import { getAddressUrl } from "../utils/etherscan";
import { CONTRACTS } from "../contracts/config";

function AdminPage() {
  const navigate = useNavigate();
  const { isConnected } = useAccount();
  const {
    isFactoryOwner,
    ownerAddress,
    currentAllowance,
    isLoading,
    approveTokens,
    txState,
    txHash,
    approveError,
  } = useAdminPanel();

  const { symbol: tokenSymbol } = useTokenInfo(CONTRACTS.token as Address);
  const [approveAmount, setApproveAmount] = useState("1000000");

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center bg-slate-800/50 border border-slate-700 rounded-xl p-8 max-w-sm">
          <p className="text-xl text-white mb-4">Connect Wallet</p>
          <p className="text-slate-400 text-sm">
            Connect your wallet to access the admin panel.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isFactoryOwner) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center bg-slate-800/50 border border-red-700/50 rounded-xl p-8 max-w-sm">
          <p className="text-2xl mb-3">🔒</p>
          <p className="text-xl text-white mb-2">Access Denied</p>
          <p className="text-slate-400 text-sm mb-4">
            This page is only accessible to the factory owner.
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const allowanceInTokens = Number(formatUnits(currentAllowance, 18));

  const getAllowanceStatus = () => {
    if (allowanceInTokens === 0)
      return { label: "Critical — No Allowance", color: "red" };
    if (allowanceInTokens < 1000) return { label: "Low", color: "amber" };
    return { label: "Sufficient", color: "green" };
  };
  const status = getAllowanceStatus();

  const statusStyles = {
    red: {
      card: "bg-red-500/10 border border-red-500/30",
      badge: "text-red-400 border-red-500/30 bg-red-500/10",
    },
    amber: {
      card: "bg-amber-500/10 border border-amber-500/30",
      badge: "text-amber-400 border-amber-500/30 bg-amber-500/10",
    },
    green: {
      card: "bg-green-500/10 border border-green-500/30",
      badge: "text-green-400 border-green-500/30 bg-green-500/10",
    },
  };
  const styles = statusStyles[status.color as keyof typeof statusStyles];

  const handleApprove = () => {
    try {
      const amount = parseUnits(approveAmount, 18);
      approveTokens(amount);
    } catch {
      // Invalid input — guarded by input validation below
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">Admin Panel</h1>
          <p className="text-slate-400 text-sm">
            Factory owner controls for token distribution
          </p>
        </div>

        {/* Owner Info */}
        <div className="bg-slate-800/50 border border-purple-700/50 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">👑</span>
            <h2 className="text-lg font-semibold text-white">Factory Owner</h2>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <a
              href={getAddressUrl(ownerAddress!)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-mono text-blue-400 hover:text-blue-300 underline"
            >
              {shortenAddress(ownerAddress!)}
            </a>
            <span className="px-2 py-0.5 text-xs bg-purple-500/20 text-purple-400 rounded">
              You
            </span>
          </div>
        </div>

        {/* Allowance Status */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Token Allowance Status
          </h2>
          <p className="text-xs text-slate-500 mb-4 leading-relaxed">
            The factory calls{" "}
            <code className="text-slate-300 bg-slate-900/50 px-1 rounded">
              transferFrom(owner, contributor, amount)
            </code>{" "}
            to distribute rewards. You must maintain sufficient allowance from
            your wallet to the factory contract.
          </p>

          <div className={`flex items-center justify-between p-4 rounded-lg mb-4 ${styles.card}`}>
            <div>
              <p className="text-xs text-slate-400 mb-1">Current Allowance</p>
              <p className="text-xl font-bold text-white">
                {allowanceInTokens.toLocaleString()} {tokenSymbol}
              </p>
            </div>
            <span
              className={`px-3 py-1 text-sm font-medium rounded-full border ${styles.badge}`}
            >
              {status.label}
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Approved:{" "}
            <span className="font-mono text-slate-300">
              {shortenAddress(ownerAddress!)}
            </span>{" "}
            →{" "}
            <a
              href={getAddressUrl(CONTRACTS.factory)}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-blue-400 hover:text-blue-300 underline"
            >
              Factory ({shortenAddress(CONTRACTS.factory)})
            </a>
          </p>
        </div>

        {/* Approve Form */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Approve Tokens
          </h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Amount to Approve ({tokenSymbol})
            </label>
            <div className="relative">
              <input
                type="number"
                value={approveAmount}
                onChange={(e) => setApproveAmount(e.target.value)}
                min="1"
                step="1000"
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                {tokenSymbol}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Recommended: enough to cover all active campaigns' potential
              rewards.
            </p>
          </div>

          <TransactionButton
            onClick={handleApprove}
            label={`Approve ${Number(approveAmount).toLocaleString()} ${tokenSymbol}`}
            txState={txState}
            txHash={txHash}
            error={approveError}
            disabled={!approveAmount || Number(approveAmount) <= 0}
            fullWidth
          />
        </div>
      </div>
    </div>
  );
}

export default AdminPage;
