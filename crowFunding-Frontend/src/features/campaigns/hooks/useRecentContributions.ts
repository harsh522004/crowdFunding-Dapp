import { useReadContract } from "wagmi";
import { masterABI } from "../../../contracts/ABI/MasterABI";
import { SEPOLIA_CHAIN_ID } from "../../../contracts/config";
import type { Address } from "viem";

export type ContributionRecord = {
  contributor: Address;
  amount: bigint;
  timestamp: bigint;
};

export type UseRecentContributionsReturn = {
  contributions: ContributionRecord[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
};

// Custom hook to fetch recent contributions for a campaign
export function useRecentContributions(
  campaignAddress: Address | undefined,
): UseRecentContributionsReturn {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useReadContract({
    abi: masterABI,
    address: campaignAddress,
    functionName: "getRecentContributions",
    args: [],
    chainId: SEPOLIA_CHAIN_ID,
    query: {
      enabled: !!campaignAddress,
      refetchInterval: 5000, // Refetch every 5 seconds
    },
  });

  // Map the raw data to our ContributionRecord type
  const contributions: ContributionRecord[] = data
    ? (data as readonly { contributor: Address; amount: bigint; timestamp: bigint }[]).map(
        (record) => ({
          contributor: record.contributor,
          amount: record.amount,
          timestamp: record.timestamp,
        })
      )
    : [];

  return {
    contributions,
    isLoading,
    error,
    refetch,
  };
}
