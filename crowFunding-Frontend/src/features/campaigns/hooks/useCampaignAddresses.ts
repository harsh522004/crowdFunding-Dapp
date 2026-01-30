import { useReadContract } from "wagmi";
import { factoryABI } from "../../../contracts/ABI/FactoryABI";
import { CONTRACTS, SEPOLIA_CHAIN_ID } from "../../../contracts/config";

// Custom hook to fetch all campaign addresses from the factory contract
function useCampaignAddresses(): {
  campaignAddresses: `0x${string}`[];
  isLoading: boolean;
  error: Error | null;
} {
  const { data, isLoading, error } = useReadContract({
    abi: factoryABI,
    address: CONTRACTS.factory as `0x${string}`,
    functionName: "getAllCampaigns",
    args: [],
    chainId: SEPOLIA_CHAIN_ID,
  });
  return {
    campaignAddresses: (data as `0x${string}`[]) || [],
    isLoading,
    error,
  };
}

export default useCampaignAddresses;
