const ETHERSCAN_BASE = "https://sepolia.etherscan.io";

export const getAddressUrl = (address: string): string =>
  `${ETHERSCAN_BASE}/address/${address}`;

export const getTxUrl = (txHash: string): string =>
  `${ETHERSCAN_BASE}/tx/${txHash}`;
