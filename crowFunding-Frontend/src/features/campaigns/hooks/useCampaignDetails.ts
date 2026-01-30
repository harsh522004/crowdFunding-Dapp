import { useReadContract } from "wagmi";
import { masterABI } from "../../../contracts/ABI/MasterABI";
import { CONTRACTS, SEPOLIA_CHAIN_ID } from "../../../contracts/config";
import  type { CampaignDetailsRaw } from "../type";

export function useCampaignDetails() {
  const { data, isLoading, error } = useReadContract({
    abi: masterABI,
    address: CONTRACTS.master as `0x${string}`,
    functionName: "getCompaignDetails",
    args: [],
    chainId: SEPOLIA_CHAIN_ID,
  }); 

    let campaignDetails: CampaignDetailsRaw | null = null;
    if (data) {
      const [
        creator,        
        goal,
        deadline,
        totalRaised,
        state,  
        withdrawn,
        rewardPerEth,
      ] = data as readonly [
        `0x${string}`,
        bigint,
        bigint,
        bigint,
        number,
        boolean,
        bigint,
      ];
        campaignDetails = {
            creator,
            goal,
            deadline,
            totalRaised,
            state,
            withdrawn,
            rewardPerEth,
        };
    }

    return { campaignDetails, isLoading, error };
  
}
