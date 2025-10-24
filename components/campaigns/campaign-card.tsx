"use client";

import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Clock,
  Users,
  Target,
  TrendingUp,
  Gift,
  ArrowRight,
  ExternalLink,
  Shield,
  Star,
  Zap,
  Trophy,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useSupportCampaign } from "@/hooks/use-support-campaign";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState, useRef } from "react";
import { TokenApprovalModal } from "./token-approval-modal";
import { cn } from "@/lib/utils";

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
      <Card className="group overflow-hidden hover:shadow-xl transition-all duration-500 hover:-translate-y-2 bg-card/90 backdrop-blur border-2 border-transparent hover:border-primary/20">
        {/* Card Header with Image */}
        <div className="relative">
          <div className="relative h-56 overflow-hidden">
            <Image
              src={campaign.image || "/placeholder.svg"}
              alt={campaign.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* Floating Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              <Badge
                variant="secondary"
                className="bg-white/20 backdrop-blur-md text-white border-white/30 hover:bg-white/30 transition-all duration-300"
              >
                <Star className="w-3 h-3 mr-1" />
                {campaign.category}
              </Badge>
              {campaign.hasPerks && (
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-lg">
                  <Gift className="w-3 h-3 mr-1" />
                  Perks
                </Badge>
              )}
            </div>

            {/* Status Badge */}
            <div className="absolute top-4 right-4">
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
                {campaign.status === "funded" && <Trophy className="w-3 h-3 mr-1" />}
                {campaign.status === "ending-soon" && <Clock className="w-3 h-3 mr-1" />}
                {campaign.status === "active" && <Zap className="w-3 h-3 mr-1" />}
                {campaign.status === "ending-soon" ? "Ending Soon" : campaign.status}
              </Badge>
            </div>

            {/* Quick Actions */}
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Link href={`/campaign/${campaign.id}`}>
                <Button
                  size="sm"
                  className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white border-white/30 h-8 w-8 p-0"
                >
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Card Content */}
        <CardContent className="p-6">
          {/* Creator Info */}
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="h-8 w-8 border-2 border-background">
              <AvatarImage src={campaign.creatorAvatar || "/placeholder.svg"} />
              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                {campaign.creator.slice(2, 4).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {campaign.creator.slice(0, 6)}...{campaign.creator.slice(-4)}
              </p>
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-green-500" />
                <span className="text-xs text-muted-foreground">Verified Creator</span>
              </div>
            </div>
          </div>

          {/* Campaign Title */}
          <h3 className="font-bold text-xl mb-3 line-clamp-2 group-hover:text-primary transition-colors duration-300">
            {campaign.name}
          </h3>

          {/* Description */}
          <p className="text-muted-foreground text-sm mb-6 line-clamp-2 leading-relaxed">
            {campaign.description}
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <div className="text-lg font-bold text-primary">
                {campaign.currentPrice}
              </div>
              <div className="text-xs text-muted-foreground">
                {campaign.currency}
              </div>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <div className="text-lg font-bold">{campaign.supporters}</div>
              <div className="text-xs text-muted-foreground">Supporters</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <div className="text-lg font-bold">{Math.round(progress)}%</div>
              <div className="text-xs text-muted-foreground">Funded</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{campaign.supporters} supporters</span>
              <span>{campaign.minRequiredSales} goal</span>
            </div>
          </div>

          {/* Time Remaining */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 mb-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Time Remaining</span>
            </div>
            <span className="text-sm font-medium">
              {timeRemaining.replace("in ", "")}
            </span>
          </div>
        </CardContent>

        {/* Card Footer */}
        <CardFooter className="p-6 pt-0 space-y-3">
          <Button
            className="w-full h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group/btn"
            onClick={handleSupport}
            disabled={isPending || isConfirming}
          >
            {isPending || isConfirming ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                {isPending ? "Submitting..." : "Confirming..."}
              </>
            ) : (
              <>
                <TrendingUp className="mr-2 h-4 w-4 transition-transform group-hover/btn:scale-110" />
                Support Now
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
              </>
            )}
          </Button>

          <Link href={`/campaign/${campaign.id}`} className="w-full">
            <Button
              variant="outline"
              className="w-full h-10 font-medium transition-all duration-300 hover:bg-primary/5 group/link"
            >
              <ExternalLink className="mr-2 h-4 w-4 transition-transform group-hover/link:scale-110" />
              View Details
            </Button>
          </Link>
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
