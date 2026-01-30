import { useReadContract } from "wagmi";
import { factoryABI } from "../../../contracts/ABI/FactoryABI";
import { CONTRACTS, SEPOLIA_CHAIN_ID } from "../../../contracts/config";

// Declare return type of hook here :
export type UseCampaignAddressesReturn = {
  campaignAddresses: `0x${string}`[];
  isLoading: boolean;
  error: Error | null;
};

// Custom hook to fetch all campaign addresses from the factory contract
export function useCampaignAddresses(): UseCampaignAddressesReturn {
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
