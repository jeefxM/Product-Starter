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
} from "lucide-react";

interface CreatorWithdrawalProps {
  contractAddress: string;
  paymentToken: string;
  campaignName: string;
  isCreator: boolean;
}

export function CreatorWithdrawal({
  contractAddress,
  paymentToken,
  campaignName,
  isCreator,
}: CreatorWithdrawalProps) {
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
        title: "Withdrawal Successful! 🎉",
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
    <Card className="border-2 border-green-500/20 bg-green-50/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-green-600" />
          Creator Funds
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : fetchError ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{fetchError}</AlertDescription>
          </Alert>
        ) : (
          <>
            {/* Total Earned */}
            <div className="flex items-center justify-between p-4 bg-background rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Earned</p>
                  <p className="text-2xl font-bold">
                    {totalEarnedFormatted} {paymentToken}
                  </p>
                </div>
              </div>
            </div>

            {/* Available to Withdraw */}
            <div className="flex items-center justify-between p-4 bg-background rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Available to Withdraw
                  </p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {withdrawalAmountFormatted} {paymentToken}
                  </p>
                </div>
              </div>
            </div>

            {/* Withdrawal Button */}
            {withdrawalAmount > BigInt(0) ? (
              <Button
                onClick={handleWithdraw}
                disabled={isPending || isConfirming}
                className="w-full"
                size="lg"
              >
                {isPending || isConfirming ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isPending ? "Confirm in Wallet..." : "Processing..."}
                  </>
                ) : (
                  <>
                    <Wallet className="w-4 h-4 mr-2" />
                    Withdraw Funds
                  </>
                )}
              </Button>
            ) : (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  {totalEarned > BigInt(0)
                    ? "All available funds have been withdrawn."
                    : "No funds available to withdraw yet. Funds will be available once the campaign ends successfully."}
                </AlertDescription>
              </Alert>
            )}

            {/* Transaction Status */}
            {isConfirmed && hash && (
              <Alert className="bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 dark:text-green-200">
                  Withdrawal successful! View on{" "}
                  <a
                    href={`https://sepolia.etherscan.io/tx/${hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-medium"
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
  );
}



