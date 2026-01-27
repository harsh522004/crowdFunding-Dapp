import CampaignCard from '../components/CampaignCard';
import {mockCampaigns}  from '../data/mockCampaigns';
import { useNavigate } from 'react-router-dom';

function HomePage() {

  const navigate = useNavigate();

  const handleViewDetails = (campaignAddress : string) => {
    navigate(`/campaign/${campaignAddress}`);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Active Campaigns</h2>
          <p className="text-slate-400">Discover and support innovative projects</p>
        </div>

        {/* Campaign Grid */}
        {mockCampaigns.length > 0 ? (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {mockCampaigns.map((campaign) => {
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
          <div className="text-center py-16">
            <p className="text-slate-400 text-lg">No campaigns available yet</p>
            <button
              onClick={() => navigate('/create')}
              className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
            >
              Create First Campaign
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;
