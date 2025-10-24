"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PrivyProvider } from "@privy-io/react-auth";
// Make sure to import these from @privy-io/wagmi, not wagmi
import { WagmiProvider } from "@privy-io/wagmi";
import { config } from "@/lib/wagmi";
import { privyConfig, PRIVY_APP_ID } from "@/lib/privy-config";
import { ThemeProvider } from "@/components/theme-provider";
import { useState } from "react";
import { MiniKitProvider } from "@coinbase/onchainkit/minikit";
import { base } from "wagmi/chains";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <MiniKitProvider
      apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
      chain={base}
      config={{
        appearance: {
          mode: "auto",
          theme: "mini-app-theme",
          name: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME,
          logo: process.env.NEXT_PUBLIC_ICON_URL,
        },
      }}
    >
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <PrivyProvider appId={PRIVY_APP_ID} config={privyConfig}>
          <QueryClientProvider client={queryClient}>
            <WagmiProvider config={config}>{children}</WagmiProvider>
          </QueryClientProvider>
        </PrivyProvider>
      </ThemeProvider>
    </MiniKitProvider>
  );
}
