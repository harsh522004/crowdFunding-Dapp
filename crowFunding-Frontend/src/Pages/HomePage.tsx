import CampaignCard from "../components/CampaignCard";
import SkeletonCard from "../components/SkeletonCard";
import EmptyState from "../components/EmptyState";
import HeroSection from "../components/HeroSection";
import HowItWorks from "../components/HowItWorks";
import { useNavigate } from "react-router-dom";
import {
  useCampaignsForHome,
  type UseCampaignsForHomeReturn,
} from "../features/campaigns/hooks";

function HomePage() {
  const navigate = useNavigate();
  const { campaigns, isLoading, error }: UseCampaignsForHomeReturn =
    useCampaignsForHome();

  const handleViewDetails = (campaignAddress: string) => {
    const campaign = campaigns.find((c) => c.address === campaignAddress);
    navigate(`/campaign/${campaignAddress}`, { state: { campaign } });
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
          <p className="text-red-400">Failed to load campaigns</p>
          <p className="text-sm text-slate-400 mt-2">{error.message}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <HeroSection />
      <HowItWorks />

      {/* Campaigns Section */}
      <div id="campaigns" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Active Campaigns
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Discover and support innovative projects
          </p>
        </div>

        {isLoading ? (
          <ul className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </ul>
        ) : campaigns.length > 0 ? (
          <ul className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 animate-fadeIn">
            {campaigns.map((campaign) => (
              <CampaignCard
                key={campaign.address}
                campaign={campaign}
                onMoreDetails={() => handleViewDetails(campaign.address)}
              />
            ))}
          </ul>
        ) : (
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
