import {
  useReadContracts,
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
} from "wagmi";
import type { Address } from "viem";
import { CONTRACTS, SEPOLIA_CHAIN_ID } from "../contracts/config";
import { factoryABI } from "../contracts/ABI/FactoryABI";
import karmaABI from "../contracts/Karma.json";
import type { TransactionState } from "../components/TransactionButton";

const erc20Abi = karmaABI.abi as readonly object[];

export type UseAdminPanelReturn = {
  isFactoryOwner: boolean;
  ownerAddress: Address | undefined;
  currentAllowance: bigint;
  isLoading: boolean;
  approveTokens: (amount: bigint) => void;
  txState: TransactionState;
  txHash: string | undefined;
  approveError: string | null;
};

export function useAdminPanel(): UseAdminPanelReturn {
  const { address: connectedAddress } = useAccount();

  const { data, isLoading } = useReadContracts({
    contracts: [
      {
        address: CONTRACTS.factory as Address,
        abi: factoryABI,
        functionName: "owner",
        chainId: SEPOLIA_CHAIN_ID,
      },
      {
        address: CONTRACTS.token as Address,
        abi: erc20Abi,
        functionName: "allowance",
        args: [connectedAddress, CONTRACTS.factory as Address],
        chainId: SEPOLIA_CHAIN_ID,
      },
    ],
    query: {
      enabled: !!connectedAddress,
      refetchInterval: 10000,
    },
  });

  const ownerAddress = data?.[0]?.result as Address | undefined;
  const currentAllowance = (data?.[1]?.result as bigint) ?? 0n;
  const isFactoryOwner =
    !!connectedAddress &&
    !!ownerAddress &&
    connectedAddress.toLowerCase() === ownerAddress.toLowerCase();

  const {
    writeContract,
    data: txHash,
    isPending,
    error: writeError,
  } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const approveTokens = (amount: bigint) => {
    writeContract({
      address: CONTRACTS.token as Address,
      abi: erc20Abi,
      functionName: "approve",
      args: [CONTRACTS.factory as Address, amount],
    });
  };

  const getTxState = (): TransactionState => {
    if (isSuccess) return "success";
    if (writeError) return "error";
    if (isConfirming) return "pending";
    if (isPending) return "preparing";
    return "idle";
  };

  return {
    isFactoryOwner,
    ownerAddress,
    currentAllowance,
    isLoading,
    approveTokens,
    txState: getTxState(),
    txHash,
    approveError: writeError?.message ?? null,
  };
}
