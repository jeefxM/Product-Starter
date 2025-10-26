"use client";

import { useEffect, useState } from "react";
import { Confetti } from "./confetti";
import { Trophy, Sparkles, Heart, Share2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface CampaignSuccessCelebrationProps {
  campaignName: string;
  creatorName: string;
  creatorAvatar: string;
  totalRaised: string;
  currency: string;
  supporters: number;
  goal: number;
  className?: string;
}

export function CampaignSuccessCelebration({
  campaignName,
  creatorName,
  creatorAvatar,
  totalRaised,
  currency,
  supporters,
  goal,
  className,
}: CampaignSuccessCelebrationProps) {
  const { toast } = useToast();
  const [showConfetti, setShowConfetti] = useState(true);
  const [statsAnimated, setStatsAnimated] = useState(false);

  useEffect(() => {
    // Show confetti for 8 seconds then stop
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 8000);

    // Trigger stats animation after confetti
    const statsTimer = setTimeout(() => {
      setStatsAnimated(true);
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearTimeout(statsTimer);
    };
  }, []);

  const handleShare = () => {
    const text = `🎉 Exciting! ${campaignName} has been successfully funded with ${totalRaised} ${currency} from ${supporters} amazing supporters!`;

    if (navigator.share) {
      navigator.share({
        title: `${campaignName} - Successfully Funded!`,
        text: text,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(`${text} ${window.location.href}`);
      toast({
        title: "Success story copied!",
        description: "Share this amazing achievement with your network.",
      });
    }
  };

  const successPercentage = Math.round((supporters / goal) * 100);
  const overFunding = supporters > goal;

  return (
    <>
      {showConfetti && <Confetti />}

      <div className={cn("relative", className)}>
        <Card className="border-2 border-green-600 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 overflow-hidden">
          {/* Success Banner */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 to-emerald-400/10 animate-pulse" />

            <div className="relative z-10">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <Trophy className="w-16 h-16 text-yellow-500 animate-bounce" />
                  <Sparkles className="w-6 h-6 text-yellow-400 absolute -top-2 -right-2 animate-pulse" />
                </div>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Campaign Successfully Funded! 🎉
              </h1>

              <p className="text-lg text-white/90 mb-6">
                {campaignName} has achieved its goal thanks to {supporters}{" "}
                amazing supporters!
              </p>

              <Badge className="bg-white text-green-700 text-lg px-6 py-2 mb-6 font-bold">
                <CheckCircle className="w-5 h-5 mr-2" />
                {successPercentage}% Funded
                {overFunding && ` • ${supporters - goal} Over Goal!`}
              </Badge>
            </div>
          </div>

          <CardContent className="p-8">
            {/* Creator Message */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <Avatar className="h-16 w-16 border-4 border-green-200 dark:border-green-800">
                  <AvatarImage src={creatorAvatar} />
                  <AvatarFallback className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-lg font-semibold">
                    {creatorName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>

              <h3 className="text-xl font-semibold mb-2">
                Thank you from {creatorName}!
              </h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                This incredible achievement wouldn't be possible without your
                amazing support. Every contribution has helped bring this vision
                to life!
              </p>
            </div>

            {/* Success Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-white border-2 border-blue-500 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div
                    className={cn(
                      "text-3xl font-bold text-blue-700 mb-2 transition-all duration-1000",
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

              <Card className="bg-white border-2 border-purple-500 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div
                    className={cn(
                      "text-3xl font-bold text-purple-700 mb-2 transition-all duration-1000 delay-300",
                      statsAnimated
                        ? "scale-100 opacity-100"
                        : "scale-0 opacity-0"
                    )}
                  >
                    {supporters}
                  </div>
                  <p className="text-sm text-gray-600 font-medium">
                    Supporters
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white border-2 border-green-500 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div
                    className={cn(
                      "text-3xl font-bold text-green-700 mb-2 transition-all duration-1000 delay-500",
                      statsAnimated
                        ? "scale-100 opacity-100"
                        : "scale-0 opacity-0"
                    )}
                  >
                    {goal}
                  </div>
                  <p className="text-sm text-gray-600 font-medium">
                    Goal Achieved
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Call to Action */}
            <div className="text-center space-y-4">
              <p className="text-lg font-medium mb-4">
                Share this amazing success story!
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={handleShare}
                  size="lg"
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8"
                >
                  <Share2 className="w-5 h-5 mr-2" />
                  Share Success Story
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="border-green-500/50 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 px-8"
                  onClick={() => {
                    toast({
                      title: "Thank you for your support! 💚",
                      description:
                        "Your contribution has made this success possible.",
                    });
                  }}
                >
                  <Heart className="w-5 h-5 mr-2" />
                  Celebrate
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
