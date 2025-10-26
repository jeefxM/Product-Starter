"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  XCircle,
  AlertTriangle,
  Users,
  Target,
  TrendingDown,
  ArrowRight,
  RefreshCw,
  Share2,
  ExternalLink,
  Clock,
  Zap,
} from "lucide-react";
import { useState, useEffect } from "react";

interface CampaignFailureDisplayProps {
  campaignName: string;
  creatorName: string;
  creatorAvatar: string;
  totalRaised: string;
  currency: string;
  supporters: number;
  goal: number;
  className?: string;
}

export function CampaignFailureDisplay({
  campaignName,
  creatorName,
  creatorAvatar,
  totalRaised,
  currency,
  supporters,
  goal,
  className,
}: CampaignFailureDisplayProps) {
  const [statsAnimated, setStatsAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStatsAnimated(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const progressPercentage = (supporters / goal) * 100;
  const shortfall = goal - supporters;

  return (
    <div className={cn("w-full", className)}>
      {/* Failure Header */}
      <Card className="border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800 shadow-lg">
        <CardContent className="p-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <XCircle className="w-8 h-8 text-red-500 mr-3" />
            <h2 className="text-2xl font-bold text-red-700 dark:text-red-400">
              Campaign Failed
            </h2>
          </div>

          <p className="text-red-600 dark:text-red-300 mb-6">
            Unfortunately, this campaign did not reach its funding goal.
          </p>

          {/* Creator Info */}
          <div className="flex items-center justify-center mb-6">
            <Avatar className="w-12 h-12 mr-3">
              <AvatarImage src={creatorAvatar} alt={creatorName} />
              <AvatarFallback>{creatorName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="text-left">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Creator
              </p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">
                {creatorName}
              </p>
            </div>
          </div>

          {/* Failure Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-white border-2 border-red-500 shadow-lg">
              <CardContent className="p-6 text-center">
                <div
                  className={cn(
                    "text-3xl font-bold text-red-700 mb-2 transition-all duration-1000",
                    statsAnimated
                      ? "scale-100 opacity-100"
                      : "scale-0 opacity-0"
                  )}
                >
                  {totalRaised} {currency}
                </div>
                <p className="text-sm text-gray-600 font-medium">
                  Total Raised
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-2 border-orange-500 shadow-lg">
              <CardContent className="p-6 text-center">
                <div
                  className={cn(
                    "text-3xl font-bold text-orange-700 mb-2 transition-all duration-1000 delay-300",
                    statsAnimated
                      ? "scale-100 opacity-100"
                      : "scale-0 opacity-0"
                  )}
                >
                  {supporters}
                </div>
                <p className="text-sm text-gray-600 font-medium">Supporters</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-2 border-gray-500 shadow-lg">
              <CardContent className="p-6 text-center">
                <div
                  className={cn(
                    "text-3xl font-bold text-gray-700 mb-2 transition-all duration-1000 delay-500",
                    statsAnimated
                      ? "scale-100 opacity-100"
                      : "scale-0 opacity-0"
                  )}
                >
                  {goal}
                </div>
                <p className="text-sm text-gray-600 font-medium">Goal Needed</p>
              </CardContent>
            </Card>
          </div>

          {/* Progress Visualization */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Progress to Goal
              </span>
              <span className="text-sm font-bold text-red-600 dark:text-red-400">
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <Progress value={progressPercentage} className="h-3 mb-2" />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{supporters} supporters</span>
              <span>{goal} goal</span>
            </div>
          </div>

          {/* Shortfall Information */}
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center mb-2">
              <AlertTriangle className="w-5 h-5 text-orange-500 mr-2" />
              <span className="font-semibold text-orange-700 dark:text-orange-400">
                {shortfall} supporters short of goal
              </span>
            </div>
            <p className="text-sm text-orange-600 dark:text-orange-300">
              This campaign needed {goal} supporters but only reached{" "}
              {supporters}.
            </p>
          </div>

          {/* What Happens Next */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
              What Happens Next?
            </h3>
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-start">
                <RefreshCw className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>
                  Supporters can claim full refunds for their contributions
                </span>
              </div>
              <div className="flex items-start">
                <Clock className="w-4 h-4 text-gray-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>
                  Creator can try launching a new campaign with adjusted goals
                </span>
              </div>
              <div className="flex items-start">
                <Share2 className="w-4 h-4 text-purple-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Lessons learned can help improve future campaigns</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              className="flex-1 h-12 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group/btn"
              onClick={() => {
                // Handle refund action
                console.log("Navigate to refund page");
              }}
            >
              <RefreshCw className="mr-2 h-4 w-4 transition-transform group-hover/btn:scale-110" />
              Claim Refund
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
            </Button>

            <Button
              variant="outline"
              className="flex-1 h-12 font-medium transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-300 dark:border-gray-600 group/link"
              onClick={() => {
                // Handle view details action
                console.log("Navigate to campaign details");
              }}
            >
              <ExternalLink className="mr-2 h-4 w-4 transition-transform group-hover/link:scale-110" />
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
