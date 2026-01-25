// fuction to shorten addresses
export const shortenAddress = (address: string): string => {
  if (address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};
// function to format wei to ether
export const formatWeiToEther = (wei: string): string => {
  const ether = BigInt(wei) / BigInt(10 ** 18);
  return ether.toString();
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
export const calculateProgressPercentage = (raisedWei: string, goalWei: string): number => {
  const raised = BigInt(raisedWei);
  const goal = BigInt(goalWei);
    if (goal === BigInt(0)) return 0;
    const percentage = (raised * BigInt(100)) / goal;
    return Number(percentage);
}
// Enum for campaign states
export const StateEnum = {
    Funding : 0,
    Successful : 1,
    Failed : 2,
    Withdrawn :3
} ;
// Type for campaign states
export type StateEnumType = typeof StateEnum[keyof typeof StateEnum];
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