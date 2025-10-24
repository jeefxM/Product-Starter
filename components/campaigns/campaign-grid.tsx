"use client";

import { CampaignCard } from "./campaign-card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";
import CampaignNFTABI from "@/lib/ABI/CampaignNFTABI.json";

interface Campaign {
  id: string;
  name: string;
  creator: string;
  description: string;
  image: string;
  currentPrice: string;
  currency: string;
  supporters: number;
  minRequiredSales: number;
  maxSupply: number;
  endDate: Date;
  category: string;
  status: "active" | "funded" | "ending-soon";
  totalRaised: string;
  contractAddress: string;
  creatorAvatar: string;
  hasPerks?: boolean;
}

export function CampaignGrid() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/campaigns");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch campaigns");
      }

      // Create public client for blockchain calls
      const publicClient = createPublicClient({
        chain: sepolia,
        transport: http(),
      });

      // Fetch real-time prices from blockchain for each campaign
      const campaignsWithPrices = await Promise.all(
        result.campaigns.map(async (campaign: any) => {
          let currentPrice = campaign.startPrice;
          let formattedPrice = "0.1"; // Fallback

          try {
            // Get current price from blockchain
            const priceFromChain = await publicClient.readContract({
              address: campaign.contractAddress as `0x${string}`,
              abi: CampaignNFTABI,
              functionName: "getCurrentPriceToMint",
            });

            // Format price (assuming 6 decimals for PYUSD)
            const priceNum = Number(priceFromChain) / 1000000;
            formattedPrice = priceNum.toFixed(2);
            currentPrice = formattedPrice;
          } catch (error) {
            console.error(
              `Failed to fetch price for campaign ${campaign.name}:`,
              error
            );
            // Use startPrice as fallback
            const fallbackPrice = Number(campaign.startPrice) / 1000000;
            formattedPrice = fallbackPrice.toFixed(2);
            currentPrice = formattedPrice;
          }

          return {
            id: campaign.id,
            name: campaign.name,
            creator: campaign.creatorAddress,
            description: campaign.description,
            image: "/placeholder.svg?height=200&width=300",
            currentPrice,
            currency: "PYUSD", // Display name instead of contract address
            supporters: 0,
            minRequiredSales: campaign.minRequiredSales,
            maxSupply: campaign.maxSupply,
            endDate: new Date(
              campaign.endDate || Date.now() + 30 * 24 * 60 * 60 * 1000
            ),
            category: campaign.category || "Technology",
            status:
              campaign.status === "LIVE"
                ? ("active" as const)
                : ("active" as const),
            totalRaised: "0",
            contractAddress: campaign.contractAddress,
            creatorAvatar: "/placeholder.svg?height=40&width=40",
            hasPerks: true,
          };
        })
      );

      setCampaigns(campaignsWithPrices);
    } catch (err) {
      console.error("Error fetching campaigns:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch campaigns"
      );
    } finally {
      setLoading(false);
    }
  };

  // const loadMore = async () => {
  //   // For now, just show all campaigns
  //   // You can implement pagination later
  // };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Failed to load campaigns
        </h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={fetchCampaigns} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading campaigns...</span>
      </div>
    );
  }

  if (!campaigns || campaigns.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No campaigns found
        </h3>
        <p className="text-gray-600">
          Be the first to launch a product campaign!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map((campaign) => (
          <CampaignCard key={campaign.id} campaign={campaign} />
        ))}
      </div>
    </div>
  );
}
