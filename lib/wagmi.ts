import { createConfig } from "@privy-io/wagmi";
import { mainnet, sepolia } from "viem/chains";
import { http, fallback } from "wagmi";

// Token addresses on Sepolia testnet
export const TOKENS = {
  ETH: {
    address: "0x0000000000000000000000000000000000000000" as `0x${string}`, // Native ETH
    decimals: 18,
  },
  PYUSD: {
    address: "0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9" as `0x${string}`,
    decimals: 6,
  },
} as const;

export const config = createConfig({
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: fallback([
      http("https://eth.llamarpc.com"),
      http("https://rpc.ankr.com/eth"),
      http("https://ethereum.publicnode.com"),
    ]),
    [sepolia.id]: fallback([
      http("https://eth-sepolia.g.alchemy.com/v2/nQIUgnAxb_VZAKBbZZNVC"),
      // http("https://rpc.ankr.com/eth_sepolia"),
      // http("https://ethereum-sepolia.publicnode.com"),
      // http("https://sepolia.gateway.tenderly.co"),
    ]),
  },
});
