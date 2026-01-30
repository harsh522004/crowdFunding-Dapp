
import { useReadContract } from 'wagmi';
import { CONTRACTS, SEPOLIA_CHAIN_ID } from '../contracts/config';
import { masterABI } from '../contracts/ABI/MasterABI';
import type {  CampaignDTO } from '../types/campaign';


function useCampaignDetails(campaignAddress: string) : { data: CampaignDTO; isLoading : boolean ; error : any} {
  const {data , isLoading , error} = useReadContract({
    abi: masterABI,
    address: CONTRACTS.master as `0x${string}`,
    functionName: 'getCampaignDetails',
    args: [campaignAddress],
    chainId : SEPOLIA_CHAIN_ID
  })
    return {data : data as CampaignDTO , isLoading , error};
}

export default useCampaignDetails