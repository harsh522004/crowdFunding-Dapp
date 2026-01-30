import { useReadContracts } from "wagmi";
import { type UseReadContractsReturnType } from "wagmi";
import { masterABI } from "../../../contracts/ABI/MasterABI";
import { SEPOLIA_CHAIN_ID } from "../../../contracts/config";
import type { CampaignDetailsRaw } from "../type";

// Custom hook to fetch campaign details for a batch of campaign addresses
export default function useCampaignDetailsBatch(addresses: `0x${string}`[]): {
  dataMap: Record<string, CampaignDetailsRaw>;
  isLoading: boolean;
  error: Error | null;
} {
  const campaignDetailsQueries: UseReadContractsReturnType = useReadContracts({
    contracts: addresses.map((address) => ({
      abi: masterABI,
      address: address,
      functionName: "getCompaignDetails",
      args: [],
      chainId: SEPOLIA_CHAIN_ID,
    })),
  });

  // Create a map of address to campaign details
  const dataMap: Record<string, CampaignDetailsRaw> = {};

  if (campaignDetailsQueries.data) {
    campaignDetailsQueries.data.forEach((result, index) => {
      if (result.status === "success" && result.result) {
        const address = addresses[index];
        // Solidity returns tuple as array, so we need to destructure it
        const [
          creator,
          goal,
          deadline,
          totalRaised,
          state,
          withdrawn,
          rewardPerEth,
        ] = result.result as readonly [
          `0x${string}`,
          bigint,
          bigint,
          bigint,
          number,
          boolean,
          bigint,
        ];

        dataMap[address] = {
          creator,
          goal,
          deadline,
          totalRaised,
          state,
          withdrawn,
          rewardPerEth,
        };
      }
    });
  }

  return {
    dataMap,
    isLoading: campaignDetailsQueries.isLoading,
    error: campaignDetailsQueries.error,
  };
}
