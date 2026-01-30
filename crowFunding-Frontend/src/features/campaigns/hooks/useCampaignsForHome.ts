import useCampaignAddresses from "./useCampaignAddresses";
import useCampaignDetailsBatch from "./useCampaignDetailsBatch";
import type { CampaignDetailsUI, CampaignDetailsRaw } from "../type";
import { mapCampaignDetails } from "../mapper";

function useCampaignsForHome(): {
  campaigns: CampaignDetailsUI[];
  isLoading: boolean;
  error: Error | null;
} {
  // call useCampaignAddresses to get all campaign addresses
  const {
    campaignAddresses: addresses,
    isLoading: isLoadingAddresses,
    error: addressesError,
  } = useCampaignAddresses();

  // call useCampaignDetailsBatch to get campaign details for all addresses
  const {
    dataMap,
    isLoading: isLoadingDetails,
    error: detailsError,
  } = useCampaignDetailsBatch(addresses);
  // map CampaignDetailsRaw to CampaignDetailsUI
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
