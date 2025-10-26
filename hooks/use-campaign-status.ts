"use client";

import { useState, useEffect } from "react";
import { usePublicClient } from "wagmi";
import CampaignNFTABI from "@/lib/ABI/CampaignNFTABI.json";
import { isValidEthereumAddress } from "@/lib/utils";

interface CampaignStatusInfo {
  isSuccessful: boolean;
  isFailed: boolean;
  isLive: boolean;
  currentSupply: number;
  minRequiredSales: number;
  deadline: bigint;
  hasEnded: boolean;
}

export function useCampaignStatus(contractAddress?: string) {
  const publicClient = usePublicClient();
  const [statusInfo, setStatusInfo] = useState<CampaignStatusInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!contractAddress || !publicClient) {
      setLoading(false);
      return;
    }

    const fetchCampaignStatus = async () => {
      try {
        setLoading(true);
        setError(null);

        // Validate contract address format
        if (!contractAddress || !isValidEthereumAddress(contractAddress)) {
          throw new Error(`Invalid contract address: ${contractAddress}`);
        }

        // Check if contract exists by trying to get its code
        const contractCode = await publicClient.getBytecode({
          address: contractAddress as `0x${string}`,
        });

        if (!contractCode || contractCode === "0x") {
          throw new Error(`Contract not found at address: ${contractAddress}`);
        }

        // Fetch campaign data from contract
        const [totalEverMinted, minRequiredSales, timestamp] =
          await Promise.all([
            publicClient.readContract({
              address: contractAddress as `0x${string}`,
              abi: CampaignNFTABI,
              functionName: "totalEverMinted",
            }),
            publicClient.readContract({
              address: contractAddress as `0x${string}`,
              abi: CampaignNFTABI,
              functionName: "minRequiredSales",
            }),
            publicClient.readContract({
              address: contractAddress as `0x${string}`,
              abi: CampaignNFTABI,
              functionName: "timestamp",
            }),
          ]);

        const currentTime = BigInt(Math.floor(Date.now() / 1000));
        const hasEnded = currentTime > (timestamp as bigint);
        const currentSupplyNum = Number(totalEverMinted);
        const minRequiredSalesNum = Number(minRequiredSales);

        // Determine campaign status
        const isSuccessful =
          currentSupplyNum >= minRequiredSalesNum && hasEnded;
        const isFailed = currentSupplyNum < minRequiredSalesNum && hasEnded;
        const isLive = !hasEnded;

        setStatusInfo({
          isSuccessful,
          isFailed,
          isLive,
          currentSupply: currentSupplyNum,
          minRequiredSales: minRequiredSalesNum,
          deadline: timestamp as bigint,
          hasEnded,
        });
      } catch (err) {
        console.error("Error fetching campaign status:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch campaign status"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCampaignStatus();

    // Refresh status every 30 seconds
    const interval = setInterval(fetchCampaignStatus, 30000);
    return () => clearInterval(interval);
  }, [contractAddress, publicClient]);

  return { statusInfo, loading, error };
}
