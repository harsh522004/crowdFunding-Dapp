  import { useReadContract } from "wagmi";
import { masterABI } from "../../../contracts/ABI/MasterABI";
import { useAccount } from "wagmi";
import type { Address } from "viem/accounts";
import { SEPOLIA_CHAIN_ID } from "../../../contracts/config";

// write a type for a return value of useUserContribution
export type UseUserContributionReturn = {
  userContribution: string | null;
  isLoading: boolean;
  error: Error | null;
};

export function useUserContribution( contractAddress: Address) {
  const { address  }  = useAccount(); 
    const { data, isLoading, error }  = useReadContract({
    abi: masterABI,
    address: contractAddress,
    functionName: "getContributionOf",
    args: [ address as `0x${string}`],
    chainId: SEPOLIA_CHAIN_ID,
    query: {
      enabled: !!(contractAddress  && address ),
    },
  });
    let userContribution: string | null = null;
    if (data) {
        userContribution = data.toString(); // convert bigint to string if necessary
    }
    return { userContribution, isLoading, error } as UseUserContributionReturn;
}