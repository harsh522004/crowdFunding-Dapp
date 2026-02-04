import {
  useCampaignDetailsBatch, 
  type UseCampaignDetailsBatchReturn,
  useCampaignAddresses,
  type UseCampaignAddressesReturn,
} from "./index";
import type { CampaignDetailsUI, CampaignDetailsRaw } from "../type";
import { mapCampaignDetails } from "../mapper";

export type UseCampaignsForHomeReturn = {
  campaigns: CampaignDetailsUI[];
  isLoading: boolean;
  error: Error | null;
};

// Custom hook to fetch and map campaign details for home page
export function useCampaignsForHome(): UseCampaignsForHomeReturn {
  const {
    campaignAddresses: addresses,
    isLoading: isLoadingAddresses,
    error: addressesError,
  }: UseCampaignAddressesReturn = useCampaignAddresses();

  const {
    dataMap,
    isLoading: isLoadingDetails,
    error: detailsError,
  }: UseCampaignDetailsBatchReturn = useCampaignDetailsBatch(addresses);

  const campaigns: CampaignDetailsUI[] =
    !isLoadingDetails && !isLoadingAddresses
      ? addresses
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
