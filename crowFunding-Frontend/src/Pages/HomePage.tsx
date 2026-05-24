import { useState } from "react";
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
import type { CampaignDetailsUI } from "../features/campaigns/type";

type StatusFilter = "All" | CampaignDetailsUI["status"];

const FILTERS: StatusFilter[] = [
  "All",
  "Funding",
  "Successful",
  "Failed",
  "Withdrawn",
];

const filterTabStyles: Record<StatusFilter, string> = {
  All: "data-[active=true]:bg-slate-600 data-[active=true]:border-slate-500",
  Funding: "data-[active=true]:bg-blue-600 data-[active=true]:border-blue-500",
  Successful:
    "data-[active=true]:bg-green-600 data-[active=true]:border-green-500",
  Failed: "data-[active=true]:bg-red-600 data-[active=true]:border-red-500",
  Withdrawn:
    "data-[active=true]:bg-slate-500 data-[active=true]:border-slate-400",
};

function HomePage() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<StatusFilter>("All");

  const { campaigns, isLoading, error }: UseCampaignsForHomeReturn =
    useCampaignsForHome();

  const filtered =
    activeFilter === "All"
      ? campaigns
      : campaigns.filter((c) => c.status === activeFilter);

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
      <div
        id="campaigns"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
      >
        {/* Section header + filter tabs */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1">
              Campaigns
            </h2>
            <p className="text-slate-400 text-sm">
              {isLoading
                ? "Loading..."
                : `${filtered.length} campaign${filtered.length !== 1 ? "s" : ""}`}
            </p>
          </div>

          {/* Filter tabs */}
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((filter) => (
              <button
                key={filter}
                data-active={activeFilter === filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-700 text-white transition-all
                  ${activeFilter === filter ? "" : "bg-slate-800/50 hover:bg-slate-700"}
                  ${filterTabStyles[filter]}`}
              >
                {filter}
                {!isLoading && filter !== "All" && (
                  <span className="ml-1.5 opacity-60">
                    ({campaigns.filter((c) => c.status === filter).length})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <ul className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </ul>
        ) : filtered.length > 0 ? (
          <ul className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 animate-fadeIn">
            {filtered.map((campaign) => (
              <CampaignCard
                key={campaign.address}
                campaign={campaign}
                onMoreDetails={() => handleViewDetails(campaign.address)}
              />
            ))}
          </ul>
        ) : campaigns.length === 0 ? (
          <EmptyState
            icon="🚀"
            title="No Campaigns Yet"
            description="Be the first to create a crowdfunding campaign and start raising funds for your innovative project!"
            actionLabel="Create First Campaign"
            actionPath="/create"
          />
        ) : (
          <EmptyState
            icon="🔍"
            title={`No ${activeFilter} Campaigns`}
            description={`There are no campaigns with status "${activeFilter}" right now.`}
            actionLabel="Show All"
            onAction={() => setActiveFilter("All")}
          />
        )}
      </div>
    </div>
  );
}

export default HomePage;
