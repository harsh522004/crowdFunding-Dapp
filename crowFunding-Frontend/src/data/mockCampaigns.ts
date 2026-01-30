export interface MockCampaign {
  address: string;
  creator: string;
  goal: string;
  deadlineTimestamp: number;
  totalRaisedWei: string;
  status: "Funding" | "Successful" | "Failed" | "Withdrawn";
  rewardRate: number;
}
export const mockCampaigns: MockCampaign[] = [
  {
    address: "0x1234567890abcdef1234567890abcdef12345678",
    creator: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
    goal: "1000000000000000000", // 1 ETH in wei
    deadlineTimestamp: 1711929600, // April 1, 2024
    totalRaisedWei: "500000000000000000", // 0.5 ETH in wei
    status: "Funding",

    rewardRate: 10,
  },
  {
    address: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
    creator: "0x1234567890abcdef1234567890abcdef12345678",
    goal: "2000000000000000000", // 2 ETH in wei
    deadlineTimestamp: 1704067200, // January 1, 2024
    totalRaisedWei: "2500000000000000000", // 2.5 ETH in wei
    status: "Successful",
    rewardRate: 15,
  },
  {
    address: "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
    creator: "0xfeedfeedfeedfeedfeedfeedfeedfeedfeedfeed",
    goal: "1500000000000000000", // 1.5 ETH in wei
    deadlineTimestamp: 1696118400, // October 1, 2023
    totalRaisedWei: "1000000000000000000", // 1 ETH in wei
    status: "Failed",
    rewardRate: 5,
  },
  {
    address: "0xfeedfeedfeedfeedfeedfeedfeedfeedfeedfeed",
    creator: "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
    goal: "3000000000000000000", // 3 ETH in wei
    deadlineTimestamp: 1688169600, // July 1, 2023
    totalRaisedWei: "3000000000000000000", // 3 ETH in wei
    status: "Withdrawn",
    rewardRate: 20,
  },
];
