import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  formatWeiToEther,
  shortenAddress,
  calculateProgressPercentage,
  formatTimestampToDate
} from "../utils/formatters";
import LoadingSpinner from "../components/LoadingSpinner";

// Define campaign status type
type CampaignStatus = 'Funding' | 'Successful' | 'Failed' | 'Withdrawn';

// Campaign interface
interface Campaign {
  address: string;
  creator: string;
  goal: string;
  deadlineTimestamp: number;
  totalRaisedWei: string;
  status: CampaignStatus;
  rewardRate: number;
  tokenAddress?: string;
  tokenSymbol?: string;
}

function CampaignDetailPage() {
  const { address } = useParams<{ address: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  // Get campaign from router state, or null if not passed
  const campaign = (location.state as { campaign?: Campaign })?.campaign;

  // If no campaign data, redirect back to home (in Phase 4, we'll fetch from blockchain)
  useEffect(() => {
    if (!campaign) {
      console.warn('No campaign data found, redirecting to home');
      navigate('/');
    }
  }, [campaign, navigate]);

  const [contributionAmount, setContributionAmount] = useState('');
  const [timeRemaining, setTimeRemaining] = useState('');
  const [isContributing, setIsContributing] = useState(false);

  // Mock connected wallet (will come from wallet context in Phase 3)
  const MOCK_CONNECTED_WALLET = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';
  const MOCK_USER_CONTRIBUTION = '1000000000000000000'; // 1 ETH

  // Early return if no campaign
  if (!campaign) {
    return null;
  }

  // Calculate if user is creator (mock - will use wallet context later)
  const isCreator = MOCK_CONNECTED_WALLET.toLowerCase() === campaign.creator.toLowerCase();

  // Calculate progress using utility function
  const displayProgress = Math.min(
    calculateProgressPercentage(campaign.totalRaisedWei, campaign.goal),
    100
  );

  // Calculate estimated reward
  const estimatedReward = contributionAmount
    ? (Number(contributionAmount) * campaign.rewardRate).toFixed(2)
    : '0';

  // Countdown timer
  useEffect(() => {
    const updateCountdown = () => {
      const now = Math.floor(Date.now() / 1000);
      const timeLeft = campaign.deadlineTimestamp - now;

      if (timeLeft <= 0) {
        setTimeRemaining('Ended');
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
  }, [campaign.deadlineTimestamp]);

  // Status badge styling
  const getStatusBadge = () => {
    const badges: Record<CampaignStatus, string> = {
      'Funding': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'Successful': 'bg-green-500/20 text-green-400 border-green-500/30',
      'Failed': 'bg-red-500/20 text-red-400 border-red-500/30',
      'Withdrawn': 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    };
    return badges[campaign.status];
  };

  const getProgressColor = () => {
    if (campaign.status === 'Successful' || displayProgress >= 100) return 'bg-green-500';
    if (campaign.status === 'Failed') return 'bg-red-500';
    return 'bg-blue-500';
  };

  const handleContribute = async () => {
    if (!contributionAmount || Number(contributionAmount) <= 0) {
      alert('Please enter a valid contribution amount');
      return;
    }

    setIsContributing(true);

    // Simulate transaction
    await new Promise(resolve => setTimeout(resolve, 2000));

    alert(`Contributed ${contributionAmount} ETH successfully!`);
    setContributionAmount('');
    setIsContributing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
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
            <span className={`px-4 py-2 text-sm font-medium rounded-full border ${getStatusBadge()} self-start whitespace-nowrap`}>
              {campaign.status}
            </span>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">

            {/* Campaign Stats Card */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Campaign Statistics</h2>

              {/* Progress Section */}
              <div className="mb-6">
                <div className="flex justify-between items-baseline mb-3">
                  <div>
                    <p className="text-4xl font-bold text-white">
                      {formatWeiToEther(campaign.totalRaisedWei)} ETH
                    </p>
                    <p className="text-sm text-slate-400 mt-1">
                      raised of {formatWeiToEther(campaign.goal)} ETH goal
                    </p>
                  </div>
                  <span className="text-2xl font-bold text-blue-400">{displayProgress}%</span>
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
                  <p className="text-sm font-mono text-slate-300">{shortenAddress(campaign.creator)}</p>
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
                  <p className="text-sm font-semibold text-slate-300">24</p>
                  <p className="text-xs text-slate-500 mt-1">Mock data</p>
                </div>

                <div className="bg-slate-900/50 rounded-lg p-4">
                  <p className="text-xs text-slate-500 mb-1">Your Contribution</p>
                  <p className="text-sm font-semibold text-slate-300">
                    {formatWeiToEther(MOCK_USER_CONTRIBUTION)} ETH
                  </p>
                  <p className="text-xs text-purple-400 mt-1">
                    +{Number(formatWeiToEther(MOCK_USER_CONTRIBUTION)) * campaign.rewardRate} {campaign.tokenSymbol || 'REWARD'}
                  </p>
                </div>
              </div>
            </div>

            {/* Contribution Section */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Contribute to Campaign</h2>

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
                      className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
                      ETH
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleContribute}
                  disabled={isContributing || !contributionAmount}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] disabled:scale-100 disabled:shadow-none flex items-center justify-center gap-2"
                >
                  {isContributing ? (
                    <>
                      <LoadingSpinner size="sm" color="white" />
                      Contributing...
                    </>
                  ) : (
                    'Contribute Now'
                  )}
                </button>

                <p className="text-xs text-center text-slate-500">
                  Note: Wallet connection coming in Phase 3
                </p>

                {/* Reward Calculator */}
                {contributionAmount && (
                  <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-400">You will receive</p>
                        <p className="text-2xl font-bold text-purple-400">
                          {estimatedReward} {campaign.tokenSymbol || 'REWARD'}
                        </p>
                      </div>
                      <div className="text-3xl">🎁</div>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      Reward Rate: {campaign.rewardRate} {campaign.tokenSymbol || 'REWARD'}/ETH
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Creator Actions (Conditional) */}
            {isCreator && (
              <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-700/50 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">👑</span>
                  <h2 className="text-xl font-semibold text-white">Creator Actions</h2>
                </div>

                <div className="space-y-3">
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                    <p className="text-xs text-blue-300 mb-1">ℹ️ Campaign Status</p>
                    <p className="text-sm text-slate-300">
                      {campaign.status === 'Funding'
                        ? 'Campaign is currently active and accepting contributions.'
                        : 'Campaign has ended. Check available actions below.'}
                    </p>
                  </div>

                  {campaign.status === 'Funding' && timeRemaining === 'Ended' && (
                    <button className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors">
                      Finalize Campaign
                    </button>
                  )}

                  {campaign.status === 'Successful' && (
                    <button className="w-full px-4 py-2.5 bg-green-600 hover:bg-green-500 text-white font-medium rounded-lg transition-colors">
                      Withdraw Funds ({formatWeiToEther(campaign.totalRaisedWei)} ETH)
                    </button>
                  )}

                  {campaign.status === 'Withdrawn' && (
                    <div className="text-center py-4">
                      <span className="text-4xl mb-2 block">✅</span>
                      <p className="text-sm text-slate-400">Funds have been withdrawn</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Refund Section (Conditional - for failed campaigns) */}
            {campaign.status === 'Failed' && BigInt(MOCK_USER_CONTRIBUTION) > 0n && (
              <div className="bg-slate-800/50 backdrop-blur-sm border border-red-700/50 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">🔄</span>
                  <h2 className="text-xl font-semibold text-white">Refund Available</h2>
                </div>

                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
                  <p className="text-sm text-red-300 mb-2">
                    This campaign failed to reach its goal. You can claim a refund.
                  </p>
                  <p className="text-lg font-semibold text-white">
                    Your Contribution: {formatWeiToEther(MOCK_USER_CONTRIBUTION)} ETH
                  </p>
                </div>

                <button className="w-full px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-medium rounded-lg transition-colors">
                  Claim Refund
                </button>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">

            {/* Token Info Card */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Reward Token</h3>

              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Token Symbol</p>
                  <p className="text-sm font-semibold text-purple-400">{campaign.tokenSymbol || 'REWARD'}</p>
                </div>

                <div>
                  <p className="text-xs text-slate-500 mb-1">Token Address</p>
                  <p className="text-xs font-mono text-slate-400 break-all">
                    {campaign.tokenAddress ? shortenAddress(campaign.tokenAddress) : 'N/A'}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-700">
                  <p className="text-xs text-slate-500 mb-1">Reward Rate</p>
                  <p className="text-lg font-bold text-white">
                    {campaign.rewardRate} {campaign.tokenSymbol || 'REWARD'}
                  </p>
                  <p className="text-xs text-slate-500">per 1 ETH contributed</p>
                </div>
              </div>
            </div>

            {/* Campaign Info Card */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">About Campaign</h3>

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
              <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>

              <div className="space-y-3">
                <div className="text-sm">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-slate-400">Contribution</span>
                    <span className="text-green-400">+0.5 ETH</span>
                  </div>
                  <p className="text-xs text-slate-500">2 hours ago</p>
                </div>

                <div className="text-sm border-t border-slate-700 pt-3">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-slate-400">Contribution</span>
                    <span className="text-green-400">+1.2 ETH</span>
                  </div>
                  <p className="text-xs text-slate-500">5 hours ago</p>
                </div>

                <div className="text-sm border-t border-slate-700 pt-3">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-slate-400">Contribution</span>
                    <span className="text-green-400">+0.3 ETH</span>
                  </div>
                  <p className="text-xs text-slate-500">1 day ago</p>
                </div>

                <p className="text-xs text-center text-slate-500 pt-2">
                  Mock data - Real activity in Phase 4
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CampaignDetailPage;
