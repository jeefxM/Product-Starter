import type { PrivyClientConfig } from "@privy-io/react-auth";
import { mainnet, sepolia } from "viem/chains";

export const privyConfig: PrivyClientConfig = {
  embeddedWallets: {
    createOnLogin: "users-without-wallets",
    requireUserPasswordOnCreate: true,
    showWalletUIs: true,
  },
  loginMethods: ["wallet", "email", "sms"],
  appearance: {
    showWalletLoginFirst: true,
    theme: "light",
    accentColor: "#8b5cf6",
  },
  // Support the same chains as wagmi config
  supportedChains: [mainnet, sepolia],
};

// Privy App ID - should be passed to PrivyProvider separately
export const PRIVY_APP_ID = "cme0f4qel00dkl00b03gldell";
