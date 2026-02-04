
import  {
  useCampaignDetailsBatch,
  type UseCampaignDetailsBatchReturn,
} from "./index";
import type { CampaignDetailsUI, CampaignDetailsRaw } from "../type";
import { mapCampaignDetails } from "../mapper";
import type { Address } from "viem/accounts";
import { useReadContract } from "wagmi";
import { factoryABI } from "../../../contracts/ABI/FactoryABI";
import { CONTRACTS, SEPOLIA_CHAIN_ID } from "../../../contracts/config";

export type useMyCampaignsReturn = {
  campaigns: CampaignDetailsUI[];
  isLoading: boolean;
  error: Error | null;
};

// Custom hook to fetch and map campaign details for home page
export function useMyCampaigns(userAddress : Address): useMyCampaignsReturn {
  const { 
    data: addresses, isLoading: isLoadingAddresses, error: addressesError
   } = useReadContract({
      abi: factoryABI,
      address: CONTRACTS.factory as `0x${string}`,
      functionName: "getCampaignsOf",
      args: [userAddress],
      chainId: SEPOLIA_CHAIN_ID,
    });

  const {
    dataMap,
    isLoading: isLoadingDetails,
    error: detailsError,
  }: UseCampaignDetailsBatchReturn = useCampaignDetailsBatch(addresses as Address[] || []);

  const campaigns: CampaignDetailsUI[] =
    !isLoadingDetails && !isLoadingAddresses
      ? (addresses as Address[])
          .map((address: string) => {
            const rawDetails: CampaignDetailsRaw | undefined = dataMap[address];
            if (rawDetails) {
              return mapCampaignDetails(address, rawDetails);
            }
            return null;
          })
          // Filter out any null values in case of missing data
          .filter(
            (
              campaign: CampaignDetailsUI | null,
            ): campaign is CampaignDetailsUI => campaign !== null,
          )
      : [];

  const isLoading = isLoadingAddresses || isLoadingDetails;
  const error = addressesError || detailsError;

  return {
    campaigns,
    isLoading,
    error,
  };
}
