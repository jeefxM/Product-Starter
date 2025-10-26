"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useWithdrawCreatorFunds } from "@/hooks/use-withdraw-creator-funds";
import { useToast } from "@/hooks/use-toast";
import { formatUnits } from "viem";
import {
  DollarSign,
  TrendingUp,
  Wallet,
  CheckCircle,
  Loader2,
  AlertCircle,
  Trophy,
  Sparkles,
  ArrowRight,
  Gift,
} from "lucide-react";

interface CreatorWithdrawalEnhancedProps {
  contractAddress: string;
  paymentToken: string;
  campaignName: string;
  isCreator: boolean;
}

export function CreatorWithdrawalEnhanced({
  contractAddress,
  paymentToken,
  campaignName,
  isCreator,
}: CreatorWithdrawalEnhancedProps) {
  const { address } = useAccount();
  const { toast } = useToast();
  const {
    withdrawFunds,
    getWithdrawalInfo,
    isPending,
    isConfirming,
    isConfirmed,
    hash,
    error,
  } = useWithdrawCreatorFunds();

  const [withdrawalAmount, setWithdrawalAmount] = useState<bigint>(BigInt(0));
  const [totalEarned, setTotalEarned] = useState<bigint>(BigInt(0));
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Fetch withdrawal info
  useEffect(() => {
    if (!contractAddress || !isCreator) {
      setLoading(false);
      return;
    }

    const fetchInfo = async () => {
      try {
        setLoading(true);
        setFetchError(null);
        const info = await getWithdrawalInfo(contractAddress);
        setWithdrawalAmount(info.withdrawalAmount);
        setTotalEarned(info.totalEarned);
      } catch (err) {
        console.error("Error fetching withdrawal info:", err);
        setFetchError(
          err instanceof Error ? err.message : "Failed to fetch withdrawal info"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchInfo();
    // Refresh every 30 seconds
    const interval = setInterval(fetchInfo, 30000);
    return () => clearInterval(interval);
  }, [contractAddress, isCreator, getWithdrawalInfo]);

  // Handle transaction confirmation
  useEffect(() => {
    if (isConfirmed && hash) {
      toast({
        title: "🎉 Withdrawal Successful!",
        description: `You've successfully withdrawn your funds from ${campaignName}.`,
      });

      // Record withdrawal in database
      recordWithdrawal(hash);

      // Refresh withdrawal info
      getWithdrawalInfo(contractAddress)
        .then((info) => {
          setWithdrawalAmount(info.withdrawalAmount);
          setTotalEarned(info.totalEarned);
        })
        .catch(console.error);
    }
  }, [
    isConfirmed,
    hash,
    toast,
    campaignName,
    contractAddress,
    getWithdrawalInfo,
  ]);

  // Handle transaction errors
  useEffect(() => {
    if (error) {
      toast({
        title: "Withdrawal Failed",
        description:
          (error as any)?.message ||
          "Something went wrong with your withdrawal.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const recordWithdrawal = async (txHash: string) => {
    try {
      const response = await fetch("/api/campaigns/withdrawal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contractAddress,
          creatorAddress: address,
          amountWei: withdrawalAmount.toString(),
          txHash,
        }),
      });

      if (!response.ok) {
        console.error("Failed to record withdrawal in database");
      }
    } catch (err) {
      console.error("Error recording withdrawal:", err);
    }
  };

  const handleWithdraw = async () => {
    try {
      await withdrawFunds(contractAddress);
    } catch (err) {
      console.error("Error initiating withdrawal:", err);
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to initiate withdrawal",
        variant: "destructive",
      });
    }
  };

  // Don't show anything if user is not the creator
  if (!isCreator) {
    return null;
  }

  // Format amounts for display
  const withdrawalAmountFormatted = formatUnits(withdrawalAmount, 6); // Assuming PYUSD (6 decimals)
  const totalEarnedFormatted = formatUnits(totalEarned, 6);

  return (
    <div className="space-y-6">
      {/* Main Withdrawal Card */}
      <Card className="border-2 border-yellow-500/50 bg-white shadow-xl">
        <CardContent className="p-6 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-yellow-500 mx-auto mb-3" />
                <p className="text-yellow-600 dark:text-yellow-400">
                  Loading your earnings...
                </p>
              </div>
            </div>
          ) : fetchError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{fetchError}</AlertDescription>
            </Alert>
          ) : (
            <>
              {/* Withdrawal Button */}
              {withdrawalAmount > BigInt(0) ? (
                <Button
                  onClick={handleWithdraw}
                  disabled={isPending || isConfirming}
                  className="w-full h-14 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  size="lg"
                >
                  {isPending || isConfirming ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                      {isPending
                        ? "Confirming in Wallet..."
                        : "Processing Withdrawal..."}
                    </>
                  ) : (
                    <>
                      <Wallet className="w-5 h-5 mr-3" />
                      Withdraw {withdrawalAmountFormatted} {paymentToken}
                      <ArrowRight className="w-5 h-5 ml-3" />
                    </>
                  )}
                </Button>
              ) : (
                <Alert className="bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800 dark:text-green-200">
                    {totalEarned > BigInt(0)
                      ? "All available funds have been successfully withdrawn."
                      : "Funds will be available for withdrawal once the campaign ends and all transactions are processed."}
                  </AlertDescription>
                </Alert>
              )}

              {/* Transaction Status */}
              {isConfirmed && hash && (
                <Alert className="bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800 dark:text-green-200">
                    <strong>Withdrawal Successful!</strong> View your
                    transaction on{" "}
                    <a
                      href={`https://sepolia.etherscan.io/tx/${hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline font-medium hover:text-green-700"
                    >
                      Etherscan
                    </a>
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
