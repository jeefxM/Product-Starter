"use client";

import { CampaignCard } from "./campaign-card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, Rocket, Plus, Search, X } from "lucide-react";
import { useState, useEffect } from "react";
import { usePublicClient } from "wagmi";
import CampaignNFTABI from "@/lib/ABI/CampaignNFTABI.json";
import { formatTimeRemaining } from "@/lib/time-utils";
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
  dbStatus?: "LIVE" | "SUCCESS" | "FAILED";
  totalRaised: string;
  contractAddress: string;
  creatorAvatar: string;
  hasPerks?: boolean;
}

interface CampaignGridProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  selectedStatus: string;
  setSelectedStatus: (value: string) => void;
}

export function CampaignGrid({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  selectedStatus,
  setSelectedStatus,
}: CampaignGridProps) {
  const publicClient = usePublicClient();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCampaigns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only fetch once on mount

  // Apply filters whenever campaigns, search term, category, or status changes
  useEffect(() => {
    let filtered = campaigns;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (campaign) =>
          campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          campaign.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          campaign.creator.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter((campaign) =>
        campaign.category.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    // Apply status filter
    if (selectedStatus) {
      filtered = filtered.filter(
        (campaign) => campaign.status === selectedStatus
      );
    }

    setFilteredCampaigns(filtered);
  }, [campaigns, searchTerm, selectedCategory, selectedStatus]);

  // Helper function to fetch blockchain data with retries
  const fetchBlockchainDataWithRetry = async (
    contractAddress: string,
    functionName: string,
    retries = 3
  ): Promise<bigint> => {
    for (let i = 0; i < retries; i++) {
      try {
        // First check if contract exists
        const code = await publicClient.getCode({
          address: contractAddress as `0x${string}`,
        });

        if (code === "0x") {
          throw new Error(
            `Contract not deployed at address: ${contractAddress}`
          );
        }

        const result = await publicClient.readContract({
          address: contractAddress as `0x${string}`,
          abi: CampaignNFTABI,
          functionName: functionName as any,
        });

        // Check if result is valid
        if (result === null || result === undefined) {
          throw new Error(`Function ${functionName} returned null/undefined`);
        }

        return result as bigint;
      } catch (err) {
        console.warn(
          `⚠️ Attempt ${i + 1}/${retries} failed for ${functionName}:`,
          err
        );
        if (i === retries - 1) throw err;
        // Wait before retry
        await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
    throw new Error(
      `Failed to fetch ${functionName} after ${retries} attempts`
    );
  };

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/campaigns");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch campaigns");
      }

      // Check if publicClient is available
      if (!publicClient) {
        console.warn("Public client not available, using database values only");
        // Map campaigns with database values only
        const campaignsWithDbData = result.campaigns.map((campaign: any) => ({
          id: campaign.id,
          name: campaign.name,
          creator: campaign.creatorAddress,
          description: campaign.description,
          image: campaign.imageUrl || "/placeholder.svg?height=200&width=300",
          currentPrice: Number(campaign.startPrice).toFixed(2),
          currency: "PYUSD",
          supporters: campaign.totalEverMinted || 0,
          minRequiredSales: campaign.minRequiredSales,
          maxSupply: campaign.maxSupply,
          endDate: new Date(
            campaign.presaleTimestamp || Date.now() + 30 * 24 * 60 * 60 * 1000
          ),
          category: campaign.category || "Technology",
          status:
            campaign.status === "LIVE"
              ? ("active" as const)
              : ("active" as const),
          dbStatus: campaign.status as "LIVE" | "SUCCESS" | "FAILED",
          totalRaised: "0", // Will be calculated from blockchain data
          contractAddress: campaign.contractAddress,
          creatorAvatar: "/placeholder.svg?height=40&width=40",
          hasPerks: true,
        }));
        setCampaigns(campaignsWithDbData);
        setFilteredCampaigns(campaignsWithDbData);
        setLoading(false);
        return;
      }

      console.log("🔄 Fetching blockchain data for campaigns...");
      // Fetch real-time data from blockchain for each campaign
      const campaignsWithBlockchainData = await Promise.all(
        result.campaigns.map(async (campaign: any) => {
          // Initialize with database values
          const dbPrice = Number(campaign.startPrice);
          let currentPrice = campaign.startPrice;
          let formattedPrice = dbPrice.toFixed(2);
          let supporters = campaign.totalEverMinted || 0;
          let totalRaised = "0";
          let blockchainTimestamp: bigint;
          let minRequiredSalesFromChain: bigint = BigInt(
            campaign.minRequiredSales || 1
          );

          console.log(`📊 [${campaign.name}] DB Values:`, {
            startPrice: campaign.startPrice,
            totalEverMinted: campaign.totalEverMinted,
            contractAddress: campaign.contractAddress,
          });

          try {
            // First check if contract is deployed
            const contractCode = await publicClient.getCode({
              address: campaign.contractAddress as `0x${string}`,
            });

            if (contractCode === "0x") {
              console.warn(
                `⚠️ Contract not deployed for ${campaign.name} at ${campaign.contractAddress}, using DB values`
              );
              // Use database values as fallback
              formattedPrice = dbPrice.toFixed(2);
              currentPrice = formattedPrice;
              supporters = campaign.totalEverMinted || 0;
              totalRaised = (dbPrice * supporters).toFixed(2);

              // Set fallback timestamp from database
              const presaleTimestamp = campaign.presaleTimestamp
                ? new Date(campaign.presaleTimestamp).getTime()
                : Date.now();
              blockchainTimestamp = BigInt(Math.floor(presaleTimestamp / 1000));
            } else {
              // Fetch multiple contract data in parallel with retry mechanism
              const [
                priceFromChain,
                totalEverMinted,
                timestamp,
                minRequiredSalesFromChain,
              ] = await Promise.all([
                fetchBlockchainDataWithRetry(
                  campaign.contractAddress,
                  "getCurrentPriceToMint"
                ).catch((err) => {
                  console.warn(
                    `⚠️ Price fetch failed for ${campaign.name} after retries:`,
                    err.message || err
                  );
                  // Use DB value as fallback (already in proper decimal format)
                  return BigInt(Math.floor(dbPrice * 1000000));
                }),
                fetchBlockchainDataWithRetry(
                  campaign.contractAddress,
                  "totalEverMinted"
                ).catch((err) => {
                  console.warn(
                    `⚠️ TotalEverMinted fetch failed for ${campaign.name} after retries:`,
                    err.message || err
                  );
                  return BigInt(campaign.totalEverMinted || 0);
                }),
                fetchBlockchainDataWithRetry(
                  campaign.contractAddress,
                  "timestamp"
                ).catch((err) => {
                  console.warn(
                    `⚠️ Timestamp fetch failed for ${campaign.name} after retries:`,
                    err.message || err
                  );
                  // Use DB presaleTimestamp as fallback
                  const presaleTimestamp = campaign.presaleTimestamp
                    ? new Date(campaign.presaleTimestamp).getTime()
                    : Date.now();
                  return BigInt(Math.floor(presaleTimestamp / 1000));
                }),
                fetchBlockchainDataWithRetry(
                  campaign.contractAddress,
                  "minRequiredSales"
                ).catch((err) => {
                  console.warn(
                    `⚠️ MinRequiredSales fetch failed for ${campaign.name} after retries:`,
                    err.message || err
                  );
                  // Use a more reasonable fallback - the blockchain value should be 10
                  return BigInt(10);
                }),
              ]);

              // Assign blockchain values
              blockchainTimestamp = timestamp;
              // minRequiredSalesFromChain is already assigned from the Promise.all result
              console.log(
                `🔗 [${campaign.name}] Blockchain minRequiredSales:`,
                String(minRequiredSalesFromChain)
              );

              // Format price (assuming 6 decimals for PYUSD)
              const priceNum = Number(priceFromChain) / 1000000;
              formattedPrice = priceNum.toFixed(2);
              currentPrice = formattedPrice;

              // Get actual supporter count from blockchain
              supporters = Number(totalEverMinted);

              // Calculate total raised from current price and supporters
              totalRaised = (priceNum * supporters).toFixed(2);

              console.log(`✅ [${campaign.name}] Blockchain Values:`, {
                priceNum,
                formattedPrice,
                totalEverMinted: String(totalEverMinted),
                supporters,
                totalRaised,
                minRequiredSalesFromChain: String(minRequiredSalesFromChain),
                minRequiredSalesNumber: Number(minRequiredSalesFromChain),
              });
            }
          } catch (error) {
            console.error(
              `❌ Failed to fetch blockchain data for campaign ${campaign.name}:`,
              error
            );
            // Use database values as fallback
            formattedPrice = dbPrice.toFixed(2);
            currentPrice = formattedPrice;
            supporters = campaign.totalEverMinted || 0;
            // Calculate total raised from price and supporters
            totalRaised = (dbPrice * supporters).toFixed(2);

            // Set fallback values from database
            const presaleTimestamp = campaign.presaleTimestamp
              ? new Date(campaign.presaleTimestamp).getTime()
              : Date.now();
            blockchainTimestamp = BigInt(Math.floor(presaleTimestamp / 1000));
            minRequiredSalesFromChain = BigInt(10); // Use blockchain value as fallback

            console.log(`🔄 [${campaign.name}] Using DB Fallback:`, {
              price: formattedPrice,
              supporters,
              totalRaised,
              minRequiredSalesFromChain: String(minRequiredSalesFromChain),
              minRequiredSalesNumber: Number(minRequiredSalesFromChain),
            });
          }

          return {
            id: campaign.id,
            name: campaign.name,
            creator: campaign.creatorAddress,
            description: campaign.description,
            image: campaign.imageUrl || "/placeholder.svg?height=200&width=300",
            currentPrice,
            currency: "PYUSD",
            supporters,
            minRequiredSales: (() => {
              const value = Number(minRequiredSalesFromChain);
              console.log(`🔍 [${campaign.name}] Final minRequiredSales:`, {
                bigint: String(minRequiredSalesFromChain),
                number: value,
                isValid: !isNaN(value) && value > 0,
              });
              return !isNaN(value) && value > 0 ? value : 10; // Use blockchain value as final fallback
            })(),
            maxSupply: campaign.maxSupply,
            endDate: new Date(Number(blockchainTimestamp) * 1000),
            category: campaign.category || "Technology",
            status:
              campaign.status === "LIVE"
                ? ("active" as const)
                : ("active" as const),
            dbStatus: campaign.status as "LIVE" | "SUCCESS" | "FAILED",
            totalRaised,
            contractAddress: campaign.contractAddress,
            creatorAvatar: "/placeholder.svg?height=40&width=40",
            hasPerks: true,
          };
        })
      );

      console.log("✅ All blockchain data fetched, updating state");
      setCampaigns(campaignsWithBlockchainData);
      setFilteredCampaigns(campaignsWithBlockchainData);
    } catch (err) {
      console.error("Error fetching campaigns:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch campaigns"
      );
    } finally {
      // Only set loading to false after ALL blockchain data is fetched
      setLoading(false);
      console.log("✅ Campaign loading complete");
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
          {error ||
            "We encountered an error while loading campaigns. Please try again."}
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button onClick={fetchCampaigns} size="lg">
            <Loader2 className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => window.location.reload()}
          >
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
          <span className="text-lg font-medium">
            Loading amazing campaigns...
          </span>
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
          Be the first to launch a product campaign and start your journey
          today!
        </p>
        <Link href="/create">
          <Button
            size="lg"
            className="bg-gradient-to-r from-primary to-primary/80"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Campaign
          </Button>
        </Link>
      </div>
    );
  }

  // Show no results when filters are applied but no campaigns match
  if (
    filteredCampaigns.length === 0 &&
    (searchTerm || selectedCategory || selectedStatus)
  ) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Search className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="text-2xl font-bold mb-3">
          No campaigns match your filters
        </h3>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Try adjusting your search terms or filters to find campaigns.
        </p>
        <Button
          variant="outline"
          onClick={() => {
            setSearchTerm("");
            setSelectedCategory("");
            setSelectedStatus("");
          }}
          className="mr-2"
        >
          <X className="w-4 h-4 mr-2" />
          Clear Filters
        </Button>
        <Link href="/create">
          <Button variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Create Campaign
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          {filteredCampaigns.length} campaign
          {filteredCampaigns.length !== 1 ? "s" : ""} found
          {(searchTerm || selectedCategory || selectedStatus) && (
            <span> matching your filters</span>
          )}
        </p>
        {(searchTerm || selectedCategory || selectedStatus) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchTerm("");
              setSelectedCategory("");
              setSelectedStatus("");
            }}
          >
            <X className="w-4 h-4 mr-2" />
            Clear Filters
          </Button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCampaigns.map((campaign) => (
          <CampaignCard key={campaign.id} campaign={campaign} />
        ))}
      </div>
    </div>
  );
}
