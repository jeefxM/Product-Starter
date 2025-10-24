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
} from "lucide-react";
import Image from "next/image";
import { formatDistanceToNow, format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useSupportCampaign } from "@/hooks/use-support-campaign";
import { TokenApprovalModal } from "./token-approval-modal";

interface CampaignDetailsProps {
  campaign: {
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
  };
}

export function CampaignDetails({ campaign }: CampaignDetailsProps) {
  const { toast } = useToast();
  const { supportCampaign, isPending, isConfirming, isConfirmed, hash, error } =
    useSupportCampaign();

  // Approval modal state
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  // Guard against double-clicks triggering two transactions
  const isHandlingSupportRef = useRef(false);
  const [approvalParams, setApprovalParams] = useState<{
    tokenAddress: string;
    spender: string;
    amount: bigint;
    symbol?: string;
    decimals?: number;
  } | null>(null);

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
  const approvalHandledRef = useRef(false);

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
          error.message || "Something went wrong with your transaction.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

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

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <div className="relative rounded-lg overflow-hidden mb-6">
              <Image
                src={campaign.image || "/placeholder.svg"}
                alt={campaign.name}
                width={600}
                height={400}
                className="w-full h-64 lg:h-96 object-cover"
              />
              <div className="absolute top-4 left-4">
                <Badge variant="secondary" className="bg-white/90 text-black">
                  {campaign.category}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src={campaign.creatorAvatar || "/placeholder.svg"}
                />
                <AvatarFallback>
                  {campaign.creatorName.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{campaign.creatorName}</h3>
                <p className="text-sm text-muted-foreground">
                  {campaign.creator.slice(0, 6)}...{campaign.creator.slice(-4)}
                </p>
              </div>
            </div>

            <h1 className="text-3xl lg:text-4xl font-bold mb-4">
              {campaign.name}
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              {campaign.description}
            </p>
          </div>

          {/* Support Card */}
          <div className="lg:w-96">
            <Card className="sticky top-8 bg-white/80 dark:bg-black/40 backdrop-blur">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-3xl font-bold text-primary">
                      {campaign.currentPrice} {campaign.currency}
                    </CardTitle>
                    <CardDescription>Current mint price</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={handleShare}>
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{campaign.supporters} supporters</span>
                    <span>{campaign.minRequiredSales} needed</span>
                  </div>
                  <Progress value={progress} className="h-3" />
                  <div className="text-sm text-muted-foreground">
                    {Math.round(progress)}% funded
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">
                      {campaign.supporters}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Supporters
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {timeRemaining.replace("in ", "")}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Remaining
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Total Raised:</span>
                    <span className="font-semibold">
                      {campaign.totalRaised} ETH
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Max Supply:</span>
                    <span>{campaign.maxSupply} NFTs</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Next Price:</span>
                    <span>
                      {(parseFloat(campaign.currentPrice) + 0.001).toFixed(3)}{" "}
                      ETH
                    </span>
                  </div>
                </div>

                <Button
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
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
                  <TrendingUp className="mr-2 h-5 w-5" />
                  {isPending
                    ? "Submitting..."
                    : isConfirming
                    ? "Confirming..."
                    : !campaign.contractAddress ||
                      campaign.contractAddress === "undefined"
                    ? "Contract Not Deployed"
                    : campaign.contractAddress ===
                      "0x0000000000000000000000000000000000000000"
                    ? "Contract Not Deployed"
                    : "Support This Project"}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  You'll receive an NFT receipt as proof of support
                </p>

                {(!campaign.contractAddress ||
                  campaign.contractAddress === "undefined") && (
                  <p className="text-xs text-red-500 text-center mt-2">
                    ⚠️ Smart contract not yet deployed. Campaign may still be in
                    setup phase.
                  </p>
                )}

                {campaign.contractAddress ===
                  "0x0000000000000000000000000000000000000000" && (
                  <p className="text-xs text-yellow-600 text-center mt-2">
                    ⚠️ Smart contract not yet deployed. Campaign may still be in
                    setup phase.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="about" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
            <TabsTrigger value="supporters">Supporters</TabsTrigger>
            <TabsTrigger value="updates">Updates</TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  {campaign.longDescription
                    .split("\n")
                    .map((paragraph, index) => (
                      <p key={index} className="mb-4 last:mb-0">
                        {paragraph}
                      </p>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>About the Creator</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage
                      src={campaign.creatorAvatar || "/placeholder.svg"}
                    />
                    <AvatarFallback>
                      {campaign.creatorName.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg">
                      {campaign.creatorName}
                    </h3>
                    <p className="text-muted-foreground mb-2">
                      {campaign.creator.slice(0, 6)}...
                      {campaign.creator.slice(-4)}
                    </p>
                    <p className="text-sm">{campaign.creatorBio}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="milestones">
            <Card>
              <CardHeader>
                <CardTitle>Project Milestones</CardTitle>
                <CardDescription>
                  Track the progress of this campaign
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {campaign.milestones.map((milestone, index) => (
                    <div key={index} className="flex items-start gap-3">
                      {milestone.completed ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground mt-0.5" />
                      )}
                      <div className="flex-1">
                        <h4
                          className={`font-medium ${
                            milestone.completed
                              ? "text-green-700 dark:text-green-400"
                              : ""
                          }`}
                        >
                          {milestone.title}
                        </h4>
                        <p className="text-sm text-muted-foreground"></p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="supporters">
            <Card>
              <CardHeader>
                <CardTitle>Recent Supporters</CardTitle>
                <CardDescription>Latest NFT receipt holders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {campaign.supporters_list.map((supporter, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {supporter.address.slice(2, 4)}
                          </AvatarFallback>
                        </Avatar>
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
                        <p className="font-medium">{supporter.amount} ETH</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(supporter.timestamp), "MMM dd")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="updates">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Updates</CardTitle>
                <CardDescription>Latest news from the creator</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <p>No updates yet. Check back soon!</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
