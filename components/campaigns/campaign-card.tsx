"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, Users, Target, TrendingUp, Gift } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useSupportCampaign } from "@/hooks/use-support-campaign";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState, useRef } from "react";
import { TokenApprovalModal } from "./token-approval-modal";

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

interface CampaignCardProps {
  campaign: Campaign;
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  const { toast } = useToast();
  const { supportCampaign, isPending, isConfirming, isConfirmed, hash, error } =
    useSupportCampaign();

  // State for approval modal
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalParams, setApprovalParams] = useState<{
    tokenAddress: string;
    spender: string;
    amount: bigint;
    user: string;
  } | null>(null);
  // Guard against accidental double-clicks
  const isHandlingSupportRef = useRef(false);

  const progress = (campaign.supporters / campaign.minRequiredSales) * 100;
  const timeRemaining = formatDistanceToNow(campaign.endDate, {
    addSuffix: true,
  });

  const statusColors = {
    active: "bg-green-500",
    funded: "bg-blue-500",
    "ending-soon": "bg-orange-500",
  };

  const handleSupport = async () => {
    try {
      if (isHandlingSupportRef.current) return;
      isHandlingSupportRef.current = true;
      const result = await supportCampaign(campaign.contractAddress);

      // Check if the result indicates approval is needed
      if (result && typeof result === "object" && "needsApproval" in result) {
        console.log("🔍 [CAMPAIGN_CARD] Approval needed, showing modal");
        const params = result.approvalParams as {
          tokenAddress: string;
          spender: string;
          amount: bigint;
          user: string;
        };
        setApprovalParams(params);
        setShowApprovalModal(true);
      } else {
        // Normal transaction flow
        toast({
          title: "Transaction Submitted!",
          description:
            "Your support transaction is being processed. Please wait for confirmation.",
        });
      }
    } catch (error) {
      console.error("Error supporting campaign:", error);
      toast({
        title: "Error",
        description: "Failed to support campaign. Please try again.",
        variant: "destructive",
      });
    } finally {
      isHandlingSupportRef.current = false;
    }
  };

  const approvalHandledRef = useRef(false);
  const handleApprovalComplete = async () => {
    if (approvalHandledRef.current) return;
    approvalHandledRef.current = true;
    console.log("🔍 [CAMPAIGN_CARD] Approval completed, retrying support");
    setShowApprovalModal(false);
    setApprovalParams(null);

    // Retry the support after approval
    try {
      await supportCampaign(campaign.contractAddress);
      toast({
        title: "Transaction Submitted!",
        description:
          "Your support transaction is being processed. Please wait for confirmation.",
      });
    } catch (error) {
      console.error("Error supporting campaign after approval:", error);
      toast({
        title: "Error",
        description:
          "Failed to support campaign after approval. Please try again.",
        variant: "destructive",
      });
    } finally {
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
        description: `You've successfully supported ${campaign.name}! NFT receipt will be minted.`,
      });
    }
  }, [isConfirmed, hash, toast, campaign.name]);

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

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-card/90 backdrop-blur">
        <CardHeader className="p-0">
          <div className="relative">
            <Image
              src={campaign.image || "/placeholder.svg"}
              alt={campaign.name}
              width={300}
              height={200}
              className="w-full h-48 object-cover"
            />
            <div className="absolute top-3 left-3">
              <Badge
                variant="secondary"
                className="backdrop-blur bg-background/80 border"
              >
                {campaign.category}
              </Badge>
            </div>
            <div className="absolute top-3 right-3 flex flex-col gap-2">
              {campaign.hasPerks && (
                <Badge className="badge-gradient text-white border-0">
                  <Gift className="w-3 h-3 mr-1" />
                  Perks Included
                </Badge>
              )}
              <Badge className={`${statusColors[campaign.status]} text-white`}>
                {campaign.status === "ending-soon"
                  ? "Ending Soon"
                  : campaign.status}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={campaign.creatorAvatar || "/placeholder.svg"} />
              <AvatarFallback>{campaign.creator.slice(2, 4)}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">
              {campaign.creator.slice(0, 6)}...{campaign.creator.slice(-4)}
            </span>
          </div>

          <h3 className="font-semibold text-lg mb-2 line-clamp-1">
            {campaign.name}
          </h3>
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {campaign.description}
          </p>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-primary">
                {campaign.currentPrice} {campaign.currency}
              </span>
              <span className="text-sm text-muted-foreground">
                Current Price
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{campaign.supporters} supporters</span>
                <span>{campaign.minRequiredSales} needed</span>
              </div>
              <Progress value={progress} className="h-2"></Progress>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{campaign.supporters}</span>
              </div>
              <div className="flex items-center gap-1">
                <Target className="h-3 w-3" />
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span className="truncate">
                  {timeRemaining.replace("in ", "")}
                </span>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0 space-y-2">
          <div className="w-full space-y-2">
            <Button
              className="w-full btn-gradient"
              onClick={handleSupport}
              disabled={isPending || isConfirming}
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              {isPending
                ? "Submitting..."
                : isConfirming
                ? "Confirming..."
                : "Support Now"}
            </Button>
            <Link href={`/campaign/${campaign.id}`} className="w-full">
              <Button variant="outline" className="w-full">
                View Details
              </Button>
            </Link>
          </div>
        </CardFooter>
      </Card>

      {/* Token Approval Modal */}
      {showApprovalModal && approvalParams && (
        <TokenApprovalModal
          isOpen={showApprovalModal}
          onClose={() => setShowApprovalModal(false)}
          onApprovalComplete={handleApprovalComplete}
          approvalParams={approvalParams}
        />
      )}
    </>
  );
}
