import useCampaignAddresses from "./useCampaignAddresses";
import useCampaignDetailsBatch from "./useCampaignDetailsBatch";
import type { CampaignDetailsUI, CampaignDetailsRaw } from "../type";
import { mapCampaignDetails } from "../mapper";

// Custom hook to fetch and map campaign details for home page
function useCampaignsForHome(): {
  campaigns: CampaignDetailsUI[];
  isLoading: boolean;
  error: Error | null;
} {
  // 1. call useCampaignAddresses to get all campaign addresses
  const {
    campaignAddresses: addresses,
    isLoading: isLoadingAddresses,
    error: addressesError,
  } = useCampaignAddresses();

  // 2.  call useCampaignDetailsBatch to get campaign details for all addresses
  const {
    dataMap,
    isLoading: isLoadingDetails,
    error: detailsError,
  } = useCampaignDetailsBatch(addresses);

  // 3. map CampaignDetailsRaw to CampaignDetailsUI
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

export default useCampaignsForHome;
