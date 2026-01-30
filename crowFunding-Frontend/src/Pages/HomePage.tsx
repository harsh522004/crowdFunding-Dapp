import {  useState } from 'react';
import CampaignCard from '../components/CampaignCard';
import SkeletonCard from '../components/SkeletonCard';
import EmptyState from '../components/EmptyState';
import { mockCampaigns } from '../data/mockCampaigns';
import { useNavigate } from 'react-router-dom';
// import type { CampaignDTO , Campaign} from '../types/campaign';
// import { useReadContract } from 'wagmi';
// import { factoryABI } from '../contracts/ABI/FactoryABI';
// import { CONTRACTS, SEPOLIA_CHAIN_ID } from '../contracts/config';
// import useCampaignDetails from '../hooks/useCampaignDetails';

function HomePage() {
  const navigate = useNavigate();
  const [isLoading] = useState(false); // Will be true when fetching from blockchain in Phase 4
  // const {data , isLoading , error} = useReadContract({
  //     abi: factoryABI,
  //     address: CONTRACTS.factory as `0x${string}`,
  //     functionName: 'getAllCampaigns',
  //     chainId : SEPOLIA_CHAIN_ID
  //   })

  //   const campaignAddresses = data as `0x${string}`[] | undefined;
  //   const [mockCampaigns , setMockCampaigns] = useState<CampaignDTO[]>([]);

  //   // Fetch campaign details for each address
  //   useEffect( () => {
  //     if(campaignAddresses && campaignAddresses.length > 0) {
  //       Promise.all(
  //         campaignAddresses.map( async (address) => {
  //           const res = useCampaignDetails(address); // Replace with actual API or method to fetch campaign details
  //           return res.data;
  //         })
  //       ).then( campaignsData => {
  //         setMockCampaigns(campaignsData);
  //       });
  //     }
  //   }, [campaignAddresses]);


  const handleViewDetails = (campaignAddress: string) => {
    // Find the campaign data to pass to detail page
    const campaign = mockCampaigns.find(c => c.address === campaignAddress);

    navigate(`/campaign/${campaignAddress}`, {
      state: { campaign } // Pass campaign data via router state
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
        ) : mockCampaigns.length > 0 ? (
          // Campaigns Available
          <ul className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 animate-fadeIn">
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
