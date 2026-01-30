import type { CampaignDetailsRaw, CampaignDetailsUI } from "./type";

// Return "UI" friendly campaign details from raw blockchain data
export const mapCampaignDetails = (
  address: string,
  raw: CampaignDetailsRaw,
): CampaignDetailsUI => {
  const statusMap: Record<number, CampaignDetailsUI["status"]> = {
    0: "Funding",
    1: "Successful",
    2: "Failed",
    3: "Withdrawn",
  };
  return {
    address,
    creator: raw.creator,
    goal: raw.goal.toString(),
    deadlineTimestamp: Number(raw.deadline),
    totalRaisedWei: raw.totalRaised.toString(),
    status: statusMap[raw.state],
    rewardRate: Number(raw.rewardPerEth),
  };
};
