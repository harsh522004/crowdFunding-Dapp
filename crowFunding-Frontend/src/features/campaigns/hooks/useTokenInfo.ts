import { useReadContracts } from "wagmi";
import type { Address } from "viem";
import { SEPOLIA_CHAIN_ID } from "../../../contracts/config";
import karmaABI from "../../../contracts/Karma.json";

export type UseTokenInfoReturn = {
  symbol: string;
  name: string;
  decimals: number;
  isLoading: boolean;
};

const erc20Abi = karmaABI.abi as readonly object[];

export function useTokenInfo(tokenAddress: Address | undefined): UseTokenInfoReturn {
  const { data, isLoading } = useReadContracts({
    contracts: [
      {
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "symbol",
        chainId: SEPOLIA_CHAIN_ID,
      },
      {
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "name",
        chainId: SEPOLIA_CHAIN_ID,
      },
      {
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "decimals",
        chainId: SEPOLIA_CHAIN_ID,
      },
    ],
    query: {
      enabled: !!tokenAddress,
    },
  });

  const symbol = (data?.[0]?.result as string) ?? "TOKEN";
  const name = (data?.[1]?.result as string) ?? "Reward Token";
  const decimals = (data?.[2]?.result as number) ?? 18;

  return { symbol, name, decimals, isLoading };
}
