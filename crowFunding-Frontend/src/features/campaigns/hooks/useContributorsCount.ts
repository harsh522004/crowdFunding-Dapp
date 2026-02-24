import { useReadContract } from "wagmi";
import { masterABI } from "../../../contracts/ABI/MasterABI";
import { SEPOLIA_CHAIN_ID } from "../../../contracts/config";
import type { Address } from "viem";

export type UseContributorsCountReturn = {
  contributorsCount: number;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
};

// Custom hook to fetch contributors count for a campaign
export function useContributorsCount(
  campaignAddress: Address | undefined,
): UseContributorsCountReturn {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useReadContract({
    abi: masterABI,
    address: campaignAddress,
    functionName: "getContributorsCount",
    args: [],
    chainId: SEPOLIA_CHAIN_ID,
    query: {
      enabled: !!campaignAddress,
      refetchInterval: 5000, // Refetch every 5 seconds
    },
  });

  return {
    contributorsCount: data ? Number(data) : 0,
    isLoading,
    error,
    refetch,
  };
}
