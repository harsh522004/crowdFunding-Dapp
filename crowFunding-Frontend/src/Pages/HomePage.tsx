import CampaignCard from "../components/CampaignCard";
import SkeletonCard from "../components/SkeletonCard";
import EmptyState from "../components/EmptyState";
import { useNavigate } from "react-router-dom";
import {
  useCampaignsForHome,
  type UseCampaignsForHomeReturn,
} from "../features/campaigns/hooks/useCampaignsForHome";

function HomePage() {
  const navigate = useNavigate();
  const { campaigns, isLoading }: UseCampaignsForHomeReturn =
    useCampaignsForHome();

  const handleViewDetails = (campaignAddress: string) => {
    // Find the campaign data to pass to detail page
    const campaign = campaigns.find((c) => c.address === campaignAddress);

    navigate(`/campaign/${campaignAddress}`, {
      state: { campaign }, // Pass campaign data via router state
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-6 sm:py-8 lg:py-12">
        {/* Header Section */}
        <div className="mb-8 animate-fadeIn">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
            Active Campaigns
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Discover and support innovative projects
          </p>
        </div>

        {/* Campaign Grid */}
        {isLoading ? (
          // Loading State - Skeleton Cards
          <ul className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </ul>
        ) : campaigns.length > 0 ? (
          // Campaigns Available
          <ul className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 animate-fadeIn">
            {campaigns.map((campaign) => {
              return (
                <CampaignCard
                  key={campaign.address}
                  address={campaign.address}
                  creator={campaign.creator}
                  goal={campaign.goal}
                  deadline={campaign.deadlineTimestamp}
                  totalRaised={campaign.totalRaisedWei}
                  status={campaign.status}
                  rewardRate={campaign.rewardRate}
                  onMoreDetails={() => handleViewDetails(campaign.address)}
                />
              );
            })}
          </ul>
        ) : (
          // Empty State
          <EmptyState
            icon="🚀"
            title="No Campaigns Yet"
            description="Be the first to create a crowdfunding campaign and start raising funds for your innovative project!"
            actionLabel="Create First Campaign"
            actionPath="/create"
          />
        )}
      </div>
    </div>
  );
}

export default HomePage;
