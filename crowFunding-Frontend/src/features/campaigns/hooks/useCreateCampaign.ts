import { useEffect, useState } from "react";
import { decodeEventLog, type Address } from "viem";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { CONTRACTS } from "../../../contracts/config";
import { factoryABI } from "../../../contracts/ABI/FactoryABI";
import { formatEtherToWei } from "../../../utils/formatters";
import type { TransactionState } from "../../../components/TransactionButton";


export type CreateCmpaignInput = {
    goalInEth : string;
    durationInDays : string;
    tokensPerEth : string ;
}

export function useCreateCampaign() {
    const [newCampaignAddress, setNewCampaignAddress] = useState<Address | null>(null);

    const { writeContract, data: txHash, isPending, error: writeError } = useWriteContract();
    const { isLoading: isConfirming, isSuccess, data: receipt } = useWaitForTransactionReceipt({
        hash: txHash,
    });

    const createCampaign = (inputData: CreateCmpaignInput) => {
        const durationInSeconds: bigint = BigInt(Number(inputData.durationInDays) * 24 * 60 * 60);
        const goalInEth = formatEtherToWei(inputData.goalInEth);
        const tokensPerEth: bigint = BigInt(inputData.tokensPerEth);
        
        writeContract({
            address: CONTRACTS.factory as Address,
            abi: factoryABI,
            functionName: "createClone",
            args: [goalInEth, durationInSeconds, tokensPerEth],
        });
    };

    useEffect(() => {
        if (isSuccess && receipt) {
            const campaignCreatedLog  = receipt.logs.find((log) => {
                try {
                    const decoded = decodeEventLog({
                        abi : factoryABI,
                        data : log.data,
                        topics : log.topics,
                    });
                    return decoded.eventName === "CampaignCreated";
                } catch (error) {                    
                    return false;
                }            
            });

            if (campaignCreatedLog) {
                const decoded = decodeEventLog({
                    abi : factoryABI,
                    data : campaignCreatedLog.data,
                    topics : campaignCreatedLog.topics,
                });
                const campaignAddress = decoded.args.compaign as Address;
                setNewCampaignAddress(campaignAddress);
            }
        }
    }, [isSuccess, receipt]);

    // Map wagmi states to TransactionButton's expected state
    const getTxState = (): TransactionState => {
        if (isSuccess) return 'success';
        if (writeError) return 'error';
        if (isConfirming) return 'pending';
        if (isPending) return 'preparing';
        return 'idle';
    };

    return {
        createCampaign,
        newCampaignAddress,
        txState: getTxState(),
        txHash,
        error: writeError?.message,
        isSuccess,
    };

}
