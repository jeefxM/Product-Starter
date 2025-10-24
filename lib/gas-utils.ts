import { parseGwei } from "viem";

// Gas configuration for different networks
export const GAS_CONFIG = {
  sepolia: {
    maxFeePerGas: parseGwei("50"), // 50 gwei
    maxPriorityFeePerGas: parseGwei("2"), // 2 gwei
    gasLimit: 300000n, // 300k gas limit
  },
  mainnet: {
    maxFeePerGas: parseGwei("100"), // 100 gwei
    maxPriorityFeePerGas: parseGwei("5"), // 5 gwei
    gasLimit: 300000n, // 300k gas limit
  },
} as const;

// Get gas configuration for current network
export function getGasConfig(chainId: number) {
  console.log("🔧 [GAS_UTILS] Getting gas config for chain ID:", chainId);

  let config;
  switch (chainId) {
    case 11155111: // Sepolia
      config = GAS_CONFIG.sepolia;
      console.log("🔧 [GAS_UTILS] Using Sepolia gas config:", config);
      break;
    case 1: // Mainnet
      config = GAS_CONFIG.mainnet;
      console.log("🔧 [GAS_UTILS] Using Mainnet gas config:", config);
      break;
    default:
      config = GAS_CONFIG.sepolia; // Default to Sepolia for safety
      console.log(
        "🔧 [GAS_UTILS] Using default Sepolia gas config for unknown chain:",
        config
      );
      break;
  }

  console.log("🔧 [GAS_UTILS] Final gas config:", config);
  return config;
}

// Format gas price for display
export function formatGasPrice(gasPrice: bigint): string {
  const gwei = Number(gasPrice) / 1e9;
  return `${gwei.toFixed(2)} gwei`;
}

// Estimate transaction cost
export function estimateTransactionCost(
  gasLimit: bigint,
  gasPrice: bigint
): bigint {
  return gasLimit * gasPrice;
}
