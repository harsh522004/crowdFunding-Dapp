// Hook to call Master abi Function : getContributionOf which needs contributor address as argument and returns the contribution amount. 
import { useReadContract } from "wagmi";
import { masterABI } from "../../../contracts/ABI/MasterABI";
import { useAccount } from "wagmi";
import type { Address } from "viem/accounts";
import { SEPOLIA_CHAIN_ID } from "../../../contracts/config";

export function useUserContribution( contractAddress: Address) {
  const { address } = useAccount(); 
    const { data, isLoading, error } = useReadContract({
    abi: masterABI,
    address: contractAddress,
    functionName: "getContributionOf",
    args: [address as `0x${string}`],
    chainId: SEPOLIA_CHAIN_ID,
  });
    let userContribution: string | null = null;
    if (data) {
        userContribution = data.toString(); // convert bigint to string if necessary
    }
    return { userContribution, isLoading, error };
}