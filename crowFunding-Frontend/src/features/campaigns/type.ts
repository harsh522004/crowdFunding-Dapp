// use standard viem types for blockchain data
import type { Address } from "viem";
export type CampaignDetailsRaw = {
  creator: Address; // address
  goal: bigint; // uint256
  deadline: bigint; // uint256 (timestamp)
  totalRaised: bigint; // uint256
  state: number; // uint8 (enum)
  withdrawn: boolean; // bool
  rewardPerEth: bigint; // uint256
};

// UI type for campaign details redner on Frontend
export type CampaignDetailsUI = {
  address: Address;
  creator: Address;
  goal: string;
  deadlineTimestamp: number;
  totalRaisedWei: string;
  status: "Funding" | "Successful" | "Failed" | "Withdrawn";
  rewardRate: number;
};
