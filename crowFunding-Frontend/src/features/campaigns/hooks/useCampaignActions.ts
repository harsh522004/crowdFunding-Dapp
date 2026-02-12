import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import type { Address } from "viem";
import { masterABI } from "../../../contracts/ABI/MasterABI";
import type { TransactionState } from "../../../components/TransactionButton";

// Hook for finalizing a campaign after deadline
export function useFinalizeCampaign() {
  const { writeContract, data: txHash, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const finalizeCampaign = (campaignAddress: Address) => {
    console.log("Finalizing campaign:", campaignAddress);
    writeContract({
      address: campaignAddress,
      abi: masterABI,
      functionName: "finalize",
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
    finalizeCampaign,
    txState: getTxState(),
    txHash,
    isPending,
    isConfirming,
    isSuccess,
    error: writeError?.message,
  };
}

// Hook for creator to withdraw funds from successful campaign
export function useWithdrawCampaign() {
  const { writeContract, data: txHash, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const withdrawFunds = (campaignAddress: Address) => {
    console.log("Withdrawing funds from campaign:", campaignAddress);
    writeContract({
      address: campaignAddress,
      abi: masterABI,
      functionName: "withdraw",
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
    withdrawFunds,
    txState: getTxState(),
    txHash,
    isPending,
    isConfirming,
    isSuccess,
    error: writeError?.message,
  };
}

// Hook for contributors to get refund from failed campaign
export function useRefundCampaign() {
  const { writeContract, data: txHash, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const claimRefund = (campaignAddress: Address) => {
    console.log("Claiming refund from campaign:", campaignAddress);
    writeContract({
      address: campaignAddress,
      abi: masterABI,
      functionName: "refund",
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
    claimRefund,
    txState: getTxState(),
    txHash,
    isPending,
    isConfirming,
    isSuccess,
    error: writeError?.message,
  };
}
