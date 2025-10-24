"use client";

import { CampaignCard } from "./campaign-card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, Rocket, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";
import CampaignNFTABI from "@/lib/ABI/CampaignNFTABI.json";
import Link from "next/link";

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
            image: campaign.imageUrl || "/placeholder.svg?height=200&width=300",
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
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
        </div>
        <h3 className="text-2xl font-bold mb-3">Failed to load campaigns</h3>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          {error || "We encountered an error while loading campaigns. Please try again."}
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button onClick={fetchCampaigns} size="lg">
            <Loader2 className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          <Button variant="outline" size="lg" onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Skeleton Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-muted/50 rounded-xl overflow-hidden">
                <div className="h-48 bg-muted animate-pulse" />
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-muted rounded-full animate-pulse" />
                    <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-6 w-3/4 bg-muted rounded animate-pulse" />
                    <div className="h-4 w-full bg-muted rounded animate-pulse" />
                    <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <div className="h-8 w-20 bg-muted rounded animate-pulse" />
                      <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                    </div>
                    <div className="h-2 w-full bg-muted rounded animate-pulse" />
                    <div className="h-10 w-full bg-muted rounded animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Loading Indicator */}
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary mr-3" />
          <span className="text-lg font-medium">Loading amazing campaigns...</span>
        </div>
      </div>
    );
  }

  if (!campaigns || campaigns.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Rocket className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="text-2xl font-bold mb-3">No campaigns found</h3>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Be the first to launch a product campaign and start your journey today!
        </p>
        <Link href="/create">
          <Button size="lg" className="bg-gradient-to-r from-primary to-primary/80">
            <Plus className="w-4 h-4 mr-2" />
            Create Campaign
          </Button>
        </Link>
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
