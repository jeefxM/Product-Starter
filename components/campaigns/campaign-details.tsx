"use client";

import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Clock,
  Users,
  Target,
  TrendingUp,
  Share2,
  Heart,
  CheckCircle,
  Circle,
  ExternalLink,
  Copy,
  Loader2,
  AlertCircle,
  Calendar,
  Trophy,
  Zap,
  Shield,
  Star,
  ArrowUpRight,
  Globe,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import { formatDistanceToNow, format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useSupportCampaign } from "@/hooks/use-support-campaign";
import { TokenApprovalModal } from "./token-approval-modal";
import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";
import CampaignNFTABI from "@/lib/ABI/CampaignNFTABI.json";
import { cn } from "@/lib/utils";

interface CampaignDetailsProps {
  campaignId: string;
}

interface Campaign {
  id: string;
  name: string;
  creator: string;
  description: string;
  longDescription: string;
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
  creatorName: string;
  creatorBio: string;
  milestones: Array<{
    title: string;
    completed: boolean;
    date: string;
  }>;
  supporters_list: Array<{
    address: string;
    amount: string;
    timestamp: string;
    tokenId: string;
  }>;
}

export function CampaignDetails({ campaignId }: CampaignDetailsProps) {
  const { toast } = useToast();
  const { supportCampaign, isPending, isConfirming, isConfirmed, hash, error } =
    useSupportCampaign();

  // State for campaign data
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [campaignError, setCampaignError] = useState<string | null>(null);

  // Approval modal state
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  // Guard against double-clicks triggering two transactions
  const isHandlingSupportRef = useRef(false);
  const approvalHandledRef = useRef(false);
  const [approvalParams, setApprovalParams] = useState<{
    tokenAddress: string;
    spender: string;
    amount: bigint;
    symbol?: string;
    decimals?: number;
  } | null>(null);

  // Fetch campaign data from database and blockchain
  useEffect(() => {
    fetchCampaignData();
  }, [campaignId]);

  // Handle transaction confirmation
  useEffect(() => {
    if (isConfirmed && hash) {
      toast({
        title: "Support Successful!",
        description: `You've successfully supported this campaign! NFT receipt will be minted.`,
      });
    }
  }, [isConfirmed, hash, toast]);

  // Handle transaction errors
  useEffect(() => {
    if (error) {
      toast({
        title: "Transaction Failed",
        description:
          (error as any)?.message ||
          "Something went wrong with your transaction.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const fetchCampaignData = async () => {
    try {
      setLoading(true);

      // First, get campaign data from database
      const response = await fetch(`/api/campaigns/${campaignId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch campaign data");
      }
      const result = await response.json();
      const dbCampaign = result.campaign;

      // Create public client for blockchain calls
      const publicClient = createPublicClient({
        chain: sepolia,
        transport: http(),
      });

      // Fetch real-time data from blockchain
      const [
        currentPrice,
        totalEverMinted,
        minRequiredSales,
        maxItems,
        timestamp,
        totalEarnedByCreator,
        startPrice,
        priceIncrement,
      ] = await Promise.all([
        publicClient.readContract({
          address: dbCampaign.contractAddress as `0x${string}`,
          abi: CampaignNFTABI,
          functionName: "getCurrentPriceToMint",
        }),
        publicClient.readContract({
          address: dbCampaign.contractAddress as `0x${string}`,
          abi: CampaignNFTABI,
          functionName: "totalEverMinted",
        }),
        publicClient.readContract({
          address: dbCampaign.contractAddress as `0x${string}`,
          abi: CampaignNFTABI,
          functionName: "minRequiredSales",
        }),
        publicClient.readContract({
          address: dbCampaign.contractAddress as `0x${string}`,
          abi: CampaignNFTABI,
          functionName: "totalSupply",
        }),
        publicClient.readContract({
          address: dbCampaign.contractAddress as `0x${string}`,
          abi: CampaignNFTABI,
          functionName: "timestamp",
        }),
        publicClient.readContract({
          address: dbCampaign.contractAddress as `0x${string}`,
          abi: CampaignNFTABI,
          functionName: "totalEarnedByCreator",
        }),
        publicClient.readContract({
          address: dbCampaign.contractAddress as `0x${string}`,
          abi: CampaignNFTABI,
          functionName: "startPrice",
        }),
        publicClient.readContract({
          address: dbCampaign.contractAddress as `0x${string}`,
          abi: CampaignNFTABI,
          functionName: "priceIncrement",
        }),
      ]);

      // Format price (assuming 6 decimals for PYUSD)
      const currentPriceNum = Number(currentPrice) / 1000000;
      const formattedCurrentPrice = currentPriceNum.toFixed(2);

      // Calculate next price
      const nextPriceNum = currentPriceNum + Number(priceIncrement) / 1000000;
      const formattedNextPrice = nextPriceNum.toFixed(3);

      // Calculate total raised
      const totalRaisedNum = Number(totalEarnedByCreator) / 1000000;
      const formattedTotalRaised = totalRaisedNum.toFixed(2);

      const progress =
        (Number(totalEverMinted) / Number(minRequiredSales)) * 100;
      const timeRemaining = formatDistanceToNow(
        new Date(Number(timestamp) * 1000),
        {
          addSuffix: true,
        }
      );

      const campaignData: Campaign = {
        id: dbCampaign.id,
        name: dbCampaign.name,
        creator: dbCampaign.creatorAddress,
        description: `${dbCampaign.name} - A digital receipt campaign`,
        longDescription: `This is a digital receipt campaign for ${dbCampaign.name}. Supporters will receive NFT receipts that serve as proof of early backing and include exclusive perks.`,
        image: dbCampaign.imageUrl || "/placeholder.svg?height=400&width=600",
        currentPrice: formattedCurrentPrice,
        currency: "PYUSD",
        supporters: Number(totalEverMinted),
        minRequiredSales: Number(minRequiredSales),
        maxSupply: Number(maxItems),
        endDate: new Date(Number(timestamp) * 1000),
        category: "Technology",
        status: progress >= 100 ? "funded" : "active",
        totalRaised: formattedTotalRaised,
        contractAddress: dbCampaign.contractAddress,
        creatorAvatar: "/placeholder.svg?height=80&width=80",
        creatorName: "Anonymous Creator",
        creatorBio: "Campaign creator",
        milestones: [
          {
            title: "Campaign Launch",
            completed: true,
            date: dbCampaign.createdAt.split("T")[0],
          },
          {
            title: "Minimum Sales Target",
            completed: Number(totalEverMinted) >= Number(minRequiredSales),
            date: "TBD",
          },
          { title: "Campaign Completion", completed: false, date: "TBD" },
        ],
        supporters_list: [],
      };

      setCampaign(campaignData);
    } catch (err) {
      console.error("Error fetching campaign data:", err);
      setCampaignError(
        err instanceof Error ? err.message : "Failed to fetch campaign data"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Loading Skeleton Header */}
        <div className="relative h-[400px] md:h-[500px] bg-muted/20 animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
            <div className="max-w-3xl space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-muted animate-pulse" />
                <div className="space-y-2">
                  <div className="h-6 w-32 bg-muted animate-pulse rounded" />
                  <div className="h-4 w-48 bg-muted animate-pulse rounded" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-12 w-3/4 bg-muted animate-pulse rounded" />
                <div className="h-6 w-full bg-muted animate-pulse rounded" />
                <div className="h-6 w-2/3 bg-muted animate-pulse rounded" />
              </div>
            </div>
          </div>
        </div>

        {/* Loading Skeleton Content */}
        <div className="max-w-7xl mx-auto mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Stats Cards Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-32 bg-muted/50 rounded-xl animate-pulse"
                  />
                ))}
              </div>

              {/* Progress Card Skeleton */}
              <div className="h-48 bg-muted/50 rounded-xl animate-pulse" />

              {/* Tabs Skeleton */}
              <div className="space-y-6">
                <div className="h-12 bg-muted/50 rounded-lg animate-pulse" />
                <div className="h-64 bg-muted/50 rounded-xl animate-pulse" />
              </div>
            </div>

            {/* Support Card Skeleton */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-6">
                <div className="h-96 bg-muted/50 rounded-xl animate-pulse" />
                <div className="h-20 bg-muted/50 rounded-xl animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Loading Indicator */}
        <div className="fixed bottom-8 right-8 bg-background border shadow-lg rounded-lg p-4 flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-sm font-medium">Loading campaign data...</span>
        </div>
      </div>
    );
  }

  if (campaignError || !campaign) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md w-full mx-auto text-center p-8">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>

          <h1 className="text-2xl font-bold mb-3">Campaign Not Found</h1>
          <p className="text-muted-foreground mb-8">
            {campaignError ||
              "We couldn't find the campaign you're looking for. It may have been removed or the link is incorrect."}
          </p>

          <div className="space-y-4">
            <Button onClick={fetchCampaignData} className="w-full" size="lg">
              Try Again
            </Button>
            <Button
              variant="outline"
              className="w-full"
              size="lg"
              onClick={() => window.history.back()}
            >
              Go Back
            </Button>
          </div>

          <div className="mt-8 pt-8 border-t">
            <p className="text-sm text-muted-foreground mb-4">Need help?</p>
            <div className="flex justify-center gap-4">
              <Button variant="ghost" size="sm">
                <ExternalLink className="w-4 h-4 mr-2" />
                Support
              </Button>
              <Button variant="ghost" size="sm">
                <Globe className="w-4 h-4 mr-2" />
                Browse Campaigns
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const progress = (campaign.supporters / campaign.minRequiredSales) * 100;
  const timeRemaining = formatDistanceToNow(campaign.endDate, {
    addSuffix: true,
  });

  const handleSupport = async () => {
    try {
      if (isHandlingSupportRef.current) return;
      isHandlingSupportRef.current = true;
      if (
        !campaign.contractAddress ||
        campaign.contractAddress === "undefined"
      ) {
        toast({
          title: "Contract Not Available",
          description:
            "This campaign's smart contract is not yet deployed. Please check back later.",
          variant: "destructive",
        });
        return;
      }

      // Try to support the campaign - this will check approval and return parameters if needed
      const result = await supportCampaign(campaign.contractAddress);

      // Check if the result indicates approval is needed
      if (
        result &&
        typeof result === "object" &&
        "needsApproval" in result &&
        result.needsApproval &&
        result.approvalParams
      ) {
        // Show approval modal
        setApprovalParams({
          tokenAddress: String(result.approvalParams.tokenAddress),
          spender: String(result.approvalParams.spender),
          amount: BigInt(String(result.approvalParams.amount)),
        });
        setShowApprovalModal(true);
      } else {
        // If no approval needed, the transaction should have been processed
        toast({
          title: "Transaction Submitted!",
          description:
            "Your support transaction is being processed. Please wait for confirmation.",
        });
      }
    } catch (error) {
      console.error("Error in handleSupport:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to support campaign. Please try again.",
        variant: "destructive",
      });
    } finally {
      isHandlingSupportRef.current = false;
    }
  };

  // Handle approval completion - Proceed to mint

  const handleApprovalComplete = async () => {
    try {
      if (approvalHandledRef.current) return;
      approvalHandledRef.current = true;
      setShowApprovalModal(false);

      // After approval, call supportCampaign again to execute the mint
      const result = await supportCampaign(campaign.contractAddress);

      // The transaction should be submitted now
      toast({
        title: "Transaction Submitted!",
        description:
          "Your support transaction is being processed. Please wait for confirmation.",
      });
    } catch (error) {
      console.error("Error after approval:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to support campaign after approval. Please try again.",
        variant: "destructive",
      });
    } finally {
      // allow new attempt only after we close/reopen modal or button click
      setTimeout(() => {
        approvalHandledRef.current = false;
      }, 1500);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link Copied!",
      description: "Campaign link copied to clipboard",
    });
  };

  return (
    <>
      {/* Approval Modal */}
      {approvalParams && (
        <TokenApprovalModal
          isOpen={showApprovalModal}
          onClose={() => setShowApprovalModal(false)}
          onApprovalComplete={handleApprovalComplete}
          approvalParams={approvalParams}
        />
      )}

      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="relative mb-8">
          {/* Campaign Image with Overlay */}
          <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
            <Image
              src={campaign.image || "/placeholder.svg"}
              alt={campaign.name}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

            {/* Floating Category Badge */}
            <div className="absolute top-6 left-6">
              <Badge className="bg-white/20 backdrop-blur-md text-white border-white/30 hover:bg-white/30 transition-all duration-300">
                <Star className="w-3 h-3 mr-1" />
                {campaign.category}
              </Badge>
            </div>

            {/* Status Badge */}
            <div className="absolute top-6 right-6">
              <Badge
                className={cn(
                  "backdrop-blur-md border transition-all duration-300",
                  campaign.status === "funded"
                    ? "bg-green-500/20 text-green-100 border-green-400/30"
                    : campaign.status === "ending-soon"
                    ? "bg-orange-500/20 text-orange-100 border-orange-400/30"
                    : "bg-blue-500/20 text-blue-100 border-blue-400/30"
                )}
              >
                {campaign.status === "funded" && (
                  <Trophy className="w-3 h-3 mr-1" />
                )}
                {campaign.status === "ending-soon" && (
                  <Clock className="w-3 h-3 mr-1" />
                )}
                {campaign.status === "active" && (
                  <Zap className="w-3 h-3 mr-1" />
                )}
                {campaign.status.replace("-", " ")}
              </Badge>
            </div>

            {/* Content Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
              <div className="max-w-3xl">
                <div className="flex items-center gap-4 mb-6">
                  <Avatar className="h-14 w-14 border-2 border-white/20">
                    <AvatarImage
                      src={campaign.creatorAvatar || "/placeholder.svg"}
                    />
                    <AvatarFallback className="bg-white/20 text-white">
                      {campaign.creatorName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-white">
                    <h3 className="font-semibold text-lg">
                      {campaign.creatorName}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-white/80">
                      <span>
                        {campaign.creator.slice(0, 6)}...
                        {campaign.creator.slice(-4)}
                      </span>
                      <Shield className="w-3 h-3" />
                      <span>Verified Creator</span>
                    </div>
                  </div>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                  {campaign.name}
                </h1>
                <p className="text-xl text-white/90 mb-6 max-w-2xl">
                  {campaign.description}
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleShare}
                    className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white border-white/30 transition-all duration-300 hover:scale-105"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Campaign
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white border-white/30 transition-all duration-300 hover:scale-105"
                    onClick={() => {
                      if (
                        campaign.contractAddress &&
                        campaign.contractAddress !== "undefined"
                      ) {
                        window.open(
                          `https://sepolia.etherscan.io/address/${campaign.contractAddress}`,
                          "_blank"
                        );
                      }
                    }}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Contract
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Campaign Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="group bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
                        Current Price
                      </p>
                      <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                        {campaign.currentPrice} {campaign.currency}
                      </p>
                    </div>
                    <div className="transition-transform duration-300 group-hover:scale-110">
                      <TrendingUp className="w-8 h-8 text-blue-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="group bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">
                        Total Raised
                      </p>
                      <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                        {campaign.totalRaised} {campaign.currency}
                      </p>
                    </div>
                    <div className="transition-transform duration-300 group-hover:scale-110">
                      <Trophy className="w-8 h-8 text-green-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="group bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-1">
                        Supporters
                      </p>
                      <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                        {campaign.supporters}
                      </p>
                    </div>
                    <div className="transition-transform duration-300 group-hover:scale-110">
                      <Users className="w-8 h-8 text-purple-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Progress Section */}
            <Card className="overflow-hidden">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Campaign Progress</h3>
                    <Badge variant="outline" className="text-sm">
                      {Math.round(progress)}% Funded
                    </Badge>
                  </div>
                  <Progress value={progress} className="h-4" />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">
                        Current Supporters
                      </span>
                      <p className="font-semibold text-lg">
                        {campaign.supporters}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-muted-foreground">Goal</span>
                      <p className="font-semibold text-lg">
                        {campaign.minRequiredSales}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{timeRemaining.replace("in ", "")} remaining</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Target className="w-4 h-4" />
                      <span>{campaign.maxSupply} max supply</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Tabs */}
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="grid w-full grid-cols-4 h-auto p-1 bg-muted/50">
                <TabsTrigger
                  value="about"
                  className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  About
                </TabsTrigger>
                <TabsTrigger
                  value="milestones"
                  className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  Milestones
                </TabsTrigger>
                <TabsTrigger
                  value="supporters"
                  className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  Supporters
                </TabsTrigger>
                <TabsTrigger
                  value="updates"
                  className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  Updates
                </TabsTrigger>
              </TabsList>

              <TabsContent value="about" className="mt-6 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="w-5 h-5" />
                      Project Description
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-gray dark:prose-invert max-w-none">
                      {campaign.longDescription
                        .split("\n")
                        .map((paragraph, index) => (
                          <p
                            key={index}
                            className="mb-4 last:mb-0 text-base leading-relaxed"
                          >
                            {paragraph}
                          </p>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      About the Creator
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start gap-6">
                      <Avatar className="h-20 w-20 border-2 border-muted">
                        <AvatarImage
                          src={campaign.creatorAvatar || "/placeholder.svg"}
                        />
                        <AvatarFallback className="text-lg">
                          {campaign.creatorName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold text-xl mb-2">
                          {campaign.creatorName}
                        </h3>
                        <div className="flex items-center gap-2 mb-3">
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {campaign.creator.slice(0, 6)}...
                            {campaign.creator.slice(-4)}
                          </code>
                          <Badge variant="secondary" className="text-xs">
                            <Shield className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                          {campaign.creatorBio}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="milestones" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="w-5 h-5" />
                      Project Milestones
                    </CardTitle>
                    <CardDescription>
                      Track the progress and achievements of this campaign
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {campaign.milestones.map((milestone, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-4 group"
                        >
                          <div className="relative">
                            {milestone.completed ? (
                              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 border-2 border-green-500">
                                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                              </div>
                            ) : (
                              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted border-2 border-muted-foreground/30">
                                <Circle className="h-5 w-5 text-muted-foreground" />
                              </div>
                            )}
                            {index < campaign.milestones.length - 1 && (
                              <div className="absolute top-10 left-5 w-0.5 h-6 bg-border transform -translate-x-1/2" />
                            )}
                          </div>
                          <div className="flex-1 pb-6">
                            <h4
                              className={cn(
                                "font-medium text-lg mb-1",
                                milestone.completed &&
                                  "text-green-700 dark:text-green-400"
                              )}
                            >
                              {milestone.title}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {milestone.date}
                            </p>
                            {milestone.completed && (
                              <Badge
                                variant="secondary"
                                className="mt-2 text-xs"
                              >
                                Completed
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="supporters" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Recent Supporters
                    </CardTitle>
                    <CardDescription>
                      Latest NFT receipt holders and backers
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {campaign.supporters_list.length > 0 ? (
                      <div className="space-y-4">
                        {campaign.supporters_list.map((supporter, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10">
                                <span className="text-sm font-semibold">
                                  {supporter.address.slice(2, 4).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium">
                                  {supporter.address.slice(0, 6)}...
                                  {supporter.address.slice(-4)}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  NFT #{supporter.tokenId}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">
                                {supporter.amount} {campaign.currency}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {format(
                                  new Date(supporter.timestamp),
                                  "MMM dd, yyyy"
                                )}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                          No supporters yet. Be the first!
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="updates" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Campaign Updates
                    </CardTitle>
                    <CardDescription>
                      Latest news and progress from the creator
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-2">
                        No updates yet
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Check back soon for the latest news from the creator
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Support Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Main Support Card */}
              <Card className="overflow-hidden border-2 border-primary/20 shadow-xl">
                <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Current Price
                      </p>
                      <p className="text-3xl font-bold text-primary">
                        {campaign.currentPrice}
                        <span className="text-lg text-muted-foreground ml-1">
                          {campaign.currency}
                        </span>
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-primary" />
                    </div>
                  </div>

                  {/* Price Change Indicator */}
                  <div className="flex items-center gap-2 text-sm">
                    <ArrowUpRight className="w-4 h-4 text-green-500" />
                    <span className="text-green-600 dark:text-green-400">
                      Next:{" "}
                      {(
                        parseFloat(campaign.currentPrice) +
                        Number(campaign.currentPrice) * 0.1
                      ).toFixed(2)}{" "}
                      {campaign.currency}
                    </span>
                  </div>
                </div>

                <CardContent className="p-6 space-y-6">
                  {/* Progress Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Campaign Progress
                      </span>
                      <Badge variant="outline">{Math.round(progress)}%</Badge>
                    </div>
                    <Progress value={progress} className="h-3" />
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-lg font-bold">
                          {campaign.supporters}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Supporters
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-lg font-bold">
                          {timeRemaining.replace("in ", "").split(" ")[0]}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Days Left
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Campaign Stats */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Total Raised
                      </span>
                      <span className="font-semibold">
                        {campaign.totalRaised} {campaign.currency}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Max Supply
                      </span>
                      <span className="font-semibold">
                        {campaign.maxSupply} NFTs
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Remaining
                      </span>
                      <span className="font-semibold">
                        {campaign.maxSupply - campaign.supporters} NFTs
                      </span>
                    </div>
                  </div>

                  <Separator />

                  {/* Main CTA Button */}
                  <Button
                    className="w-full h-14 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-lg font-semibold shadow-lg transition-all duration-300 hover:shadow-xl"
                    size="lg"
                    onClick={handleSupport}
                    disabled={
                      isPending ||
                      isConfirming ||
                      !campaign.contractAddress ||
                      campaign.contractAddress === "undefined" ||
                      campaign.contractAddress ===
                        "0x0000000000000000000000000000000000000000"
                    }
                  >
                    {isPending || isConfirming ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        {isPending ? "Submitting..." : "Confirming..."}
                      </>
                    ) : !campaign.contractAddress ||
                      campaign.contractAddress === "undefined" ||
                      campaign.contractAddress ===
                        "0x0000000000000000000000000000000000000000" ? (
                      <>
                        <AlertCircle className="mr-2 h-5 w-5" />
                        Contract Not Deployed
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-5 w-5" />
                        Support This Project
                      </>
                    )}
                  </Button>

                  {/* NFT Receipt Info */}
                  <div className="bg-primary/5 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm font-medium mb-1">NFT Receipt</p>
                        <p className="text-xs text-muted-foreground">
                          You'll receive a unique NFT as proof of your support,
                          with exclusive perks and benefits.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Warning Messages */}
                  {(!campaign.contractAddress ||
                    campaign.contractAddress === "undefined") && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                            Contract Pending
                          </p>
                          <p className="text-xs text-yellow-700 dark:text-yellow-300">
                            Smart contract is being deployed. Check back soon to
                            support this campaign.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleShare}
                      className="h-12"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                    <Button variant="outline" size="sm" className="h-12">
                      <Heart className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
