import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  formatWeiToEther,
  shortenAddress,
  calculateProgressPercentage,
  formatTimestampToDate,
} from "../utils/formatters";

import type { Address } from "viem";
import { CONTRACTS } from "../contracts/config";
import { useAccount } from "wagmi";
import {
  useUserContribution,
  type UseUserContributionReturn,
  useCampaignContribution,
  useCampaignDetails,
  useFinalizeCampaign,
  useWithdrawCampaign,
  useRefundCampaign,
  useContributorsCount,
  useRecentContributions,
  type ContributionRecord,
} from "../features/campaigns/hooks";
import TransactionButton from "../components/TransactionButton";
import LoadingSpinner from "../components/LoadingSpinner";


// Define campaign status type
type CampaignStatus = "Funding" | "Successful" | "Failed" | "Withdrawn";


function CampaignDetailPage() {
  const { address } = useParams<{ address: Address }>();

  // Fetch campaign data directly from blockchain
  const { campaign, isLoading: isCampaignLoading, error: campaignError, refetch } = useCampaignDetails(address);

  // Transaction hooks
  const { contributeToCampaign, txState: contributionTxState, isSuccess: isContributionSuccess, writeError: contributionError } = useCampaignContribution();
  const { finalizeCampaign, txState: finalizeTxState, isSuccess: isFinalizeSuccess, error: finalizeError } = useFinalizeCampaign();
  const { withdrawFunds, txState: withdrawTxState, isSuccess: isWithdrawSuccess, error: withdrawError } = useWithdrawCampaign();
  const { claimRefund, txState: refundTxState, isSuccess: isRefundSuccess, error: refundError } = useRefundCampaign();

  // State hooks
  const [contributionAmount, setContributionAmount] = useState("");
  const [timeRemaining, setTimeRemaining] = useState("");
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Get connected wallet
  const { isConnected, address: connectedAddress } = useAccount();

  // Get user's contribution for current campaign (must be called before any early returns)
  const userContributionData: UseUserContributionReturn = useUserContribution(campaign?.address);

  // Get contributors count and recent contributions
  const { contributorsCount } = useContributorsCount(campaign?.address);
  const { contributions } = useRecentContributions(campaign?.address);

  // Countdown timer - must be called before any early returns
  useEffect(() => {
    if (!campaign) return;

    const updateCountdown = () => {
      const now = Math.floor(Date.now() / 1000);
      const timeLeft = campaign.deadlineTimestamp - now;

      if (timeLeft <= 0) {
        setTimeRemaining("Ended");
        return;
      }

      const days = Math.floor(timeLeft / (24 * 60 * 60));
      const hours = Math.floor((timeLeft % (24 * 60 * 60)) / (60 * 60));
      const minutes = Math.floor((timeLeft % (60 * 60)) / 60);
      const seconds = timeLeft % 60;

      setTimeRemaining(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [campaign]);

  // Refetch data and show toast on successful transactions
  useEffect(() => {
    if (isContributionSuccess) {
      setToast({ message: "Contribution successful! 🎉", type: 'success' });
      setContributionAmount("");
      refetch();
    }
  }, [isContributionSuccess, refetch]);

  useEffect(() => {
    if (isFinalizeSuccess) {
      setToast({ message: "Campaign finalized successfully!", type: 'success' });
      refetch();
    }
  }, [isFinalizeSuccess, refetch]);

  useEffect(() => {
    if (isWithdrawSuccess) {
      setToast({ message: "Funds withdrawn successfully! 💰", type: 'success' });
      refetch();
    }
  }, [isWithdrawSuccess, refetch]);

  useEffect(() => {
    if (isRefundSuccess) {
      setToast({ message: "Refund claimed successfully!", type: 'success' });
      refetch();
    }
  }, [isRefundSuccess, refetch]);

  // Auto-hide toast after 5 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Show loading state
  if (isCampaignLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Show error state
  if (campaignError || !campaign) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-400 mb-4">Error loading campaign</p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Calculate if user is creator
  const isCreator = isConnected &&
    connectedAddress?.toLowerCase() === campaign.creator.toLowerCase();

  // Calculate progress using utility function
  const displayProgress =
    calculateProgressPercentage(campaign.totalRaisedWei, campaign.goal);

  // Calculate estimated reward
  const estimatedReward = contributionAmount
    ? (Number(contributionAmount) * campaign.rewardRate).toFixed(2)
    : "0";

  // Status badge styling
  const getStatusBadge = () => {
    const badges: Record<CampaignStatus, string> = {
      Funding: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      Successful: "bg-green-500/20 text-green-400 border-green-500/30",
      Failed: "bg-red-500/20 text-red-400 border-red-500/30",
      Withdrawn: "bg-slate-500/20 text-slate-400 border-slate-500/30",
    };
    return badges[campaign.status];
  };

  const getProgressColor = () => {
    if (campaign.status === "Successful" || displayProgress >= 100)
      return "bg-green-500";
    if (campaign.status === "Failed") return "bg-red-500";
    return "bg-blue-500";
  };

  const handleContribute = () => {
    if (!contributionAmount || Number(contributionAmount) <= 0) {
      setToast({ message: "Please enter a valid contribution amount", type: 'error' });
      return;
    }

    contributeToCampaign({ campaignAddress: campaign.address, amountInEth: contributionAmount });
  };

  const handleFinalize = () => {
    finalizeCampaign(campaign.address);
  };

  const handleWithdraw = () => {
    withdrawFunds(campaign.address);
  };

  const handleRefund = () => {
    claimRefund(campaign.address);
  };

  // Check if campaign has ended
  const hasEnded = timeRemaining === "Ended";
  const canContribute = campaign.status === "Funding" && !hasEnded && !isCreator;
  const canFinalize = campaign.status === "Funding" && hasEnded && isCreator;
  const canWithdraw = campaign.status === "Successful" && isCreator;
  const canRefund = campaign.status === "Failed" && BigInt(userContributionData.userContribution || "0") > 0n;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg animate-slideIn ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          } text-white font-medium`}>
          {toast.message}
        </div>
      )}

      <div className="container mx-auto px-4 py-6 sm:py-8 lg:py-12">
        {/* Header Section */}
        <div className="mb-6 animate-fadeIn">
          <button
            onClick={() => window.history.back()}
            className="text-slate-400 hover:text-white mb-4 flex items-center gap-2 transition-all hover:gap-3 duration-200"
          >
            ← Back to Campaigns
          </button>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
                Campaign Details
              </h1>
              <p className="text-slate-400 font-mono text-xs sm:text-sm break-all">
                {address || campaign.address}
              </p>
            </div>
            <span
              className={`px-4 py-2 text-sm font-medium rounded-full border ${getStatusBadge()} self-start whitespace-nowrap`}
            >
              {campaign.status}
            </span>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Campaign Title & Description Card */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-3">
                {campaign.title}
              </h2>
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                {campaign.description}
              </p>
            </div>

            {/* Campaign Stats Card */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-6">
                Campaign Statistics
              </h2>

              {/* Progress Section */}
              <div className="mb-6">
                <div className="flex justify-between items-baseline mb-3">
                  <div>
                    <p className="text-4xl font-bold text-white">
                      {formatWeiToEther(campaign.totalRaisedWei, 2)} ETH
                    </p>
                    <p className="text-sm text-slate-400 mt-1">
                      raised of {formatWeiToEther(campaign.goal, 2)} ETH goal
                    </p>
                  </div>
                  <span className="text-2xl font-bold text-blue-400">
                    {displayProgress}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full ${getProgressColor()} transition-all duration-500 rounded-full`}
                    style={{ width: `${displayProgress}%` }}
                  />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/50 rounded-lg p-4">
                  <p className="text-xs text-slate-500 mb-1">Creator</p>
                  <p className="text-sm font-mono text-slate-300">
                    {shortenAddress(campaign.creator)}
                  </p>
                  {isCreator && (
                    <span className="inline-block mt-2 px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded">
                      You
                    </span>
                  )}
                </div>

                <div className="bg-slate-900/50 rounded-lg p-4">
                  <p className="text-xs text-slate-500 mb-1">Deadline</p>
                  <p className="text-sm font-semibold text-slate-300">
                    {formatTimestampToDate(campaign.deadlineTimestamp)}
                  </p>
                  <p className="text-xs text-blue-400 mt-1">{timeRemaining}</p>
                </div>

                <div className="bg-slate-900/50 rounded-lg p-4">
                  <p className="text-xs text-slate-500 mb-1">Contributors</p>
                  <p className="text-sm font-semibold text-slate-300">{contributorsCount}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {contributorsCount === 1 ? 'Unique contributor' : 'Unique contributors'}
                  </p>
                </div>

                <div className="bg-slate-900/50 rounded-lg p-4">
                  <p className="text-xs text-slate-500 mb-1">
                    Your Contribution
                  </p>
                  <p className="text-sm font-semibold text-slate-300">
                    {formatWeiToEther(userContributionData.userContribution || "0", 2)} ETH
                  </p>
                  <p className="text-xs text-purple-400 mt-1">
                    +
                    {Number(formatWeiToEther(userContributionData.userContribution || "0", 2)) *
                      campaign.rewardRate}{" "}
                    {"REWARD"}
                  </p>
                </div>
              </div>
            </div>

            {/* Contribution Section */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                {canContribute ? 'Contribute to Campaign' : 'Campaign Status'}
              </h2>

              {canContribute ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Contribution Amount (ETH)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={contributionAmount}
                        onChange={(e) => setContributionAmount(e.target.value)}
                        placeholder="0.0"
                        step="0.01"
                        min="0"
                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
                        ETH
                      </span>
                    </div>
                  </div>

                  <div className="w-full">
                    <TransactionButton
                      onClick={handleContribute}
                      label="Contribute Now"
                      txState={contributionTxState}
                      error={contributionError}
                      disabled={!contributionAmount || !isConnected}
                    />
                  </div>

                  {!isConnected && (
                    <p className="text-xs text-center text-amber-400">
                      ⚠️ Please connect your wallet to contribute
                    </p>
                  )}

                  {/* Reward Calculator */}
                  {contributionAmount && (
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-slate-400">
                            You will receive
                          </p>
                          <p className="text-2xl font-bold text-purple-400">
                            {estimatedReward} {"REWARD"}
                          </p>
                        </div>
                        <div className="text-3xl">🎁</div>
                      </div>
                      <p className="text-xs text-slate-500 mt-2">
                        Reward Rate: {campaign.rewardRate}{" "}
                        {"REWARD"}/ETH
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  {campaign.status === "Funding" && hasEnded && (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                      <p className="text-amber-400 font-medium">⏰ Campaign has ended</p>
                      <p className="text-sm text-slate-400 mt-2">Waiting for finalization...</p>
                    </div>
                  )}
                  {campaign.status === "Successful" && (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                      <p className="text-green-400 font-medium text-lg mb-2">✅ Campaign Successful!</p>
                      <p className="text-sm text-slate-400">Goal reached! Creator can withdraw funds.</p>
                    </div>
                  )}
                  {campaign.status === "Failed" && BigInt(userContributionData.userContribution || "0") === 0n && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                      <p className="text-red-400 font-medium text-lg mb-2">❌ Campaign Failed</p>
                      <p className="text-sm text-slate-400">Goal was not reached. Contributors can claim refunds.</p>
                    </div>
                  )}
                  {campaign.status === "Withdrawn" && (
                    <div className="bg-slate-500/10 border border-slate-500/30 rounded-lg p-4">
                      <p className="text-slate-400 font-medium text-lg mb-2">💰 Funds Withdrawn</p>
                      <p className="text-sm text-slate-400">Creator has withdrawn all funds.</p>
                    </div>
                  )}
                  {isCreator && campaign.status === "Funding" && !hasEnded && (
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                      <p className="text-blue-400 font-medium">🚀 Campaign is Active</p>
                      <p className="text-sm text-slate-400 mt-2">As the creator, you cannot contribute to your own campaign.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Creator Actions (Conditional) */}
            {isCreator && (
              <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-700/50 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">👑</span>
                  <h2 className="text-xl font-semibold text-white">
                    Creator Actions
                  </h2>
                </div>

                <div className="space-y-3">
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                    <p className="text-xs text-blue-300 mb-1">
                      ℹ️ Campaign Status
                    </p>
                    <p className="text-sm text-slate-300">
                      {campaign.status === "Funding"
                        ? "Campaign is currently active and accepting contributions."
                        : "Campaign has ended. Check available actions below."}
                    </p>
                  </div>

                  {canFinalize && (
                    <div className="w-full">
                      <TransactionButton
                        onClick={handleFinalize}
                        label="Finalize Campaign"
                        txState={finalizeTxState}
                        error={finalizeError}
                      />
                    </div>
                  )}

                  {canWithdraw && (
                    <div className="w-full">
                      <TransactionButton
                        onClick={handleWithdraw}
                        label={`Withdraw Funds (${formatWeiToEther(campaign.totalRaisedWei, 2)} ETH)`}
                        txState={withdrawTxState}
                        error={withdrawError}
                      />
                    </div>
                  )}

                  {campaign.status === "Withdrawn" && (
                    <div className="text-center py-4">
                      <span className="text-4xl mb-2 block">✅</span>
                      <p className="text-sm text-slate-400">
                        Funds have been withdrawn
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Refund Section (Conditional - for failed campaigns) */}
            {canRefund && (
              <div className="bg-slate-800/50 backdrop-blur-sm border border-red-700/50 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">🔄</span>
                  <h2 className="text-xl font-semibold text-white">
                    Refund Available
                  </h2>
                </div>

                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
                  <p className="text-sm text-red-300 mb-2">
                    This campaign failed to reach its goal. You can claim a
                    refund.
                  </p>
                  <p className="text-lg font-semibold text-white">
                    Your Contribution:{" "}
                    {formatWeiToEther(userContributionData.userContribution || "0", 4)} ETH
                  </p>
                </div>

                <div className="w-full">
                  <TransactionButton
                    onClick={handleRefund}
                    label="Claim Refund"
                    txState={refundTxState}
                    error={refundError}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Token Info Card */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Reward Token
              </h3>

              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Token Symbol</p>
                  <p className="text-sm font-semibold text-purple-400">
                    {"REWARD"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500 mb-1">Token Address</p>
                  <p className="text-xs font-mono text-slate-400 break-all">
                    {CONTRACTS.token
                      ? shortenAddress(CONTRACTS.token)
                      : "N/A"}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-700">
                  <p className="text-xs text-slate-500 mb-1">Reward Rate</p>
                  <p className="text-lg font-bold text-white">
                    {campaign.rewardRate} {"REWARD"}
                  </p>
                  <p className="text-xs text-slate-500">
                    per 1 ETH contributed
                  </p>
                </div>
              </div>
            </div>

            {/* Campaign Info Card */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                About Campaign
              </h3>

              <div className="space-y-4 text-sm text-slate-400">
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <p>All contributions are secured by smart contract</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <p>Automatic refund if campaign fails</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <p>Instant token rewards upon contribution</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <p>Transparent and verifiable on blockchain</p>
                </div>
              </div>
            </div>

            {/* Activity Card */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Recent Activity
              </h3>

              {contributions.length > 0 ? (
                <div className="space-y-3">
                  {contributions.map((contribution, index) => {
                    const timeAgo = (() => {
                      const now = Math.floor(Date.now() / 1000);
                      const diff = now - Number(contribution.timestamp);

                      if (diff < 60) return `${diff} seconds ago`;
                      if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
                      if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
                      return `${Math.floor(diff / 86400)} days ago`;
                    })();

                    return (
                      <div
                        key={index}
                        className={`text-sm ${index > 0 ? 'border-t border-slate-700 pt-3' : ''}`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <div>
                            <span className="text-slate-400">Contribution</span>
                            <p className="text-xs text-slate-500 font-mono mt-0.5">
                              {shortenAddress(contribution.contributor)}
                            </p>
                          </div>
                          <span className="text-green-400 font-semibold">
                            +{formatWeiToEther(contribution.amount.toString(), 3)} ETH
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">{timeAgo}</p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-slate-400">No contributions yet</p>
                  <p className="text-xs text-slate-500 mt-1">Be the first to contribute!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CampaignDetailPage;
