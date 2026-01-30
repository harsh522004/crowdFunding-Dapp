import { useState } from "react";
import { useNavigate } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import SkeletonCard from "../components/SkeletonCard";
import CampaignCard from "../components/CampaignCard";

// Mock - will use wallet context and contract data in Phase 4
const MOCK_USER_CAMPAIGNS: any[] = []; // Empty for now to show empty state

function MyCampaignsPage() {
  const navigate = useNavigate();
  const [isLoading] = useState(false); // Will be true when fetching from blockchain

  const handleViewDetails = (campaignAddress: string) => {
    navigate(`/campaign/${campaignAddress}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-6 sm:py-8 lg:py-12">
        {/* Header */}
        <div className="mb-8 animate-fadeIn">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
            My Campaigns
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Manage and track your created campaigns
          </p>
        </div>

        {/* Content */}
        {isLoading ? (
          // Loading State
          <ul className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </ul>
        ) : MOCK_USER_CAMPAIGNS.length > 0 ? (
          // User's Campaigns
          <ul className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 animate-fadeIn">
            {MOCK_USER_CAMPAIGNS.map((campaign) => (
              <CampaignCard
                key={campaign.address}
                campaign={campaign}
                onMoreDetails={() => handleViewDetails(campaign.address)}
              />
            ))}
          </ul>
        ) : (
          // Empty State
          <EmptyState
            icon="📝"
            title="No Campaigns Created"
            description="You haven't created any campaigns yet. Start your first crowdfunding campaign and bring your ideas to life!"
            actionLabel="Create Your First Campaign"
            actionPath="/create"
          />
        )}

        {/* Info Card */}
        <div className="mt-8 max-w-2xl mx-auto bg-blue-500/10 border border-blue-500/30 rounded-xl p-6 animate-fadeIn">
          <div className="flex items-start gap-3">
            <span className="text-blue-400 text-2xl">💡</span>
            <div>
              <h3 className="text-lg font-semibold text-blue-300 mb-2">
                Campaign Creator Tips
              </h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">•</span>
                  <span>Monitor your campaign progress in real-time</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">•</span>
                  <span>Withdraw funds once your goal is reached</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">•</span>
                  <span>Contributors automatically receive reward tokens</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">•</span>
                  <span>All transactions are secured by smart contracts</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyCampaignsPage;
