import {formatEther} from "viem";
// Enum for campaign states
export const StateEnum = {
    Funding : 0,
    Successful : 1,
    Failed : 2,
    Withdrawn :3
} ;
// Type for campaign states
export type StateEnumType = typeof StateEnum[keyof typeof StateEnum];
// fuction to shorten addresses
export const shortenAddress = (address: string): string => {
  if (address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};
// function to format wei to ether
export const formatWeiToEther = (wei: string): string => {
  const ether = formatEther(BigInt(wei));
  return ether;
};
// function to format timestamp to readable date
export const formatTimestampToDate = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString();
}
// function to format deadline countdown
export const formatDeadlineCountdown = (timestamp: number): string => {
  const now = Date.now();
  const deadline = timestamp * 1000;
  const diff = deadline - now;
    if (diff <= 0) return 'Deadline passed';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${days}d ${hours}h ${minutes}m`;
    }

// function to calculate progress percentage
export const calculateProgressPercentage = (
  raisedWei: string,
  goalWei: string,
  decimals = 2
): number => {
  const raised = BigInt(raisedWei)
  const goal = BigInt(goalWei)

  if (goal === 0n) return 0

  const scale = 10n ** BigInt(decimals)
  const percentage =
    (raised * 100n * scale) / goal

  const value = Number(percentage) / Number(scale)
  const answer = Math.min(value, 100);
  console.log("Progress Percentage:", value);
  return answer;
}


// function to get enum value from string
export const getStateEnumValue = (state: string): StateEnumType | null => {
    switch(state) {
        case 'Funding': return StateEnum.Funding;
        case 'Successful': return StateEnum.Successful;
        case 'Failed': return StateEnum.Failed;
        case 'Withdrawn': return StateEnum.Withdrawn;
        default: return null;
    }
}