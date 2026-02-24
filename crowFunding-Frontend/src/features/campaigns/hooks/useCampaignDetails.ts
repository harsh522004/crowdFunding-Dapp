import { useReadContract } from "wagmi";
import { masterABI } from "../../../contracts/ABI/MasterABI";
import { SEPOLIA_CHAIN_ID } from "../../../contracts/config";
import type { CampaignDetailsRaw, CampaignDetailsUI } from "../type";
import { mapCampaignDetails } from "../mapper";
import type { Address } from "viem";

export type UseCampaignDetailsReturn = {
  campaign: CampaignDetailsUI | null;
  raw: CampaignDetailsRaw | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
};

// Custom hook to fetch single campaign details by address
export function useCampaignDetails(
  campaignAddress: Address | undefined,
): UseCampaignDetailsReturn {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useReadContract({
    abi: masterABI,
    address: campaignAddress,
    functionName: "getCompaignDetails",
    args: [],
    chainId: SEPOLIA_CHAIN_ID,
    query: {
      enabled: !!campaignAddress, // Only fetch if address is provided
      refetchInterval: 5000, // Refetch every 5 seconds to get latest data
    },
  });

  let raw: CampaignDetailsRaw | null = null;
  let campaign: CampaignDetailsUI | null = null;

  if (data && campaignAddress) {
    // Destructure the tuple returned from contract
    const [
      creator,
      title,
      description,
      goal,
      deadline,
      totalRaised,
      state,
      withdrawn,
      rewardPerEth,
    ] = data as readonly [
      Address,
      string,
      string,
      bigint,
      bigint,
      bigint,
      number,
      boolean,
      bigint,
    ];

    raw = {
      creator,
      title,
      description,
      goal,
      deadline,
      totalRaised,
      state,
      withdrawn,
      rewardPerEth,
    };

    campaign = mapCampaignDetails(campaignAddress, raw);
  }

  return {
    campaign,
    raw,
    isLoading,
    error,
    refetch,
  };
}
