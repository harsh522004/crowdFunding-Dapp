import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { formatEtherToWei } from "../../../utils/formatters";
import type { Address } from "viem/accounts";
import { masterABI } from "../../../contracts/ABI/MasterABI";
import type { TransactionState } from "../../../components/TransactionButton";

export type ContributionInput = {
    campaignAddress : Address ;
    amountInEth : string;
}

export function useCampaignContribution(){
    const {writeContract, data : txHash, isPending , error : writeError} = useWriteContract();
    const {isLoading : isConfirming, isSuccess} = useWaitForTransactionReceipt({
        hash : txHash,
    });

    const contributeToCampaign = (inputData : ContributionInput)  => {
        const { campaignAddress, amountInEth } = inputData;
        const amountInWei = formatEtherToWei(amountInEth);
        console.log("Contributing to campaign:", { campaignAddress, amountInEth, amountInWei });
        writeContract({
            address : campaignAddress as Address,
            abi : masterABI,
            functionName : "contribute",
            value : amountInWei,
        });
        return { campaignAddress, amountInEth };
    }

    const getTxState = (): TransactionState => {
            if (isSuccess) return 'success';
            if (writeError) return 'error';
            if (isConfirming) return 'pending';
            if (isPending) return 'preparing';
            return 'idle';
        };
    return { contributeToCampaign,  txState :  getTxState(), isPending, isConfirming, isSuccess, writeError: writeError?.message };
}