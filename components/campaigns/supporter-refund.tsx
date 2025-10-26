"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useClaimRefund } from "@/hooks/use-claim-refund";
import { useToast } from "@/hooks/use-toast";
import { formatUnits } from "viem";
import {
  DollarSign,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Loader2,
  XCircle,
} from "lucide-react";

interface SupporterRefundProps {
  contractAddress: string;
  paymentToken: string;
  campaignName: string;
}

interface TokenInfo {
  tokenId: bigint;
  holderInfo: {
    mintPrice: bigint;
    tokenId: bigint;
    paymentToken: string;
    mintPriceGross: bigint;
  };
}

export function SupporterRefund({
  contractAddress,
  paymentToken,
  campaignName,
}: SupporterRefundProps) {
  const { address } = useAccount();
  const { toast } = useToast();
  const {
    claimRefund,
    getUserTokens,
    isPending,
    isConfirming,
    isConfirmed,
    hash,
    error,
  } = useClaimRefund();

  const [userTokens, setUserTokens] = useState<TokenInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [claimingTokenId, setClaimingTokenId] = useState<bigint | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Fetch user's tokens
  useEffect(() => {
    if (!contractAddress || !address) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    const fetchTokens = async () => {
      try {
        setLoading(true);
        setFetchError(null);

        const tokens = await getUserTokens(contractAddress);

        if (isMounted) {
          setUserTokens(tokens);
          setRetryCount(0); // Reset retry count on success
        }
      } catch (err) {
        console.error("Error fetching user tokens:", err);
        if (isMounted) {
          const errorMessage =
            err instanceof Error ? err.message : "Failed to fetch tokens";
          setFetchError(errorMessage);

          // Auto-retry for certain errors
          if (
            retryCount < 2 &&
            (errorMessage.includes("timeout") ||
              errorMessage.includes("network") ||
              errorMessage.includes("connection") ||
              errorMessage.includes("HTTP request failed") ||
              errorMessage.includes("Failed to fetch"))
          ) {
            setTimeout(() => {
              if (isMounted) {
                setRetryCount((prev) => prev + 1);
              }
            }, 3000);
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchTokens();

    return () => {
      isMounted = false;
    };
  }, [contractAddress, address, getUserTokens, retryCount]);

  // Handle transaction confirmation
  useEffect(() => {
    if (isConfirmed && hash && claimingTokenId) {
      toast({
        title: "Refund Claimed! 💰",
        description: `You've successfully claimed your refund for token #${claimingTokenId}.`,
      });

      // Refresh token list
      getUserTokens(contractAddress)
        .then((tokens) => {
          setUserTokens(tokens);
          setClaimingTokenId(null);
        })
        .catch(console.error);
    }
  }, [
    isConfirmed,
    hash,
    toast,
    claimingTokenId,
    contractAddress,
    getUserTokens,
  ]);

  // Handle transaction errors
  useEffect(() => {
    if (error) {
      toast({
        title: "Refund Failed",
        description:
          (error as any)?.message || "Something went wrong with your refund.",
        variant: "destructive",
      });
      setClaimingTokenId(null);
    }
  }, [error, toast]);

  const handleClaimRefund = async (tokenId: bigint) => {
    try {
      setClaimingTokenId(tokenId);
      await claimRefund(contractAddress, tokenId);
    } catch (err) {
      console.error("Error initiating refund:", err);
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to initiate refund",
        variant: "destructive",
      });
      setClaimingTokenId(null);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <Card className="border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
            <XCircle className="h-5 w-5" />
            Campaign Failed - Refund Available
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
              <p className="text-red-600 dark:text-red-400">
                Loading your refundable tokens...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show error state
  if (fetchError) {
    return (
      <Card className="border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
            <XCircle className="h-5 w-5" />
            Campaign Failed - Refund Available
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-red-300 bg-red-100 dark:bg-red-900/20">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 dark:text-red-200">
              {fetchError.includes("HTTP request failed") ||
              fetchError.includes("Failed to fetch")
                ? "Network connection issue. Please check your internet connection and try again."
                : `Error loading refund information: ${fetchError}`}
            </AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button
              onClick={() => {
                setRetryCount(0);
                setFetchError(null);
                setLoading(true);
              }}
              variant="outline"
              className="w-full"
            >
              Retry Loading Tokens
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show message if user has no tokens
  if (!address) {
    return (
      <Card className="border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
            <XCircle className="h-5 w-5" />
            Campaign Failed - Refund Available
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-red-300 bg-red-100 dark:bg-red-900/20">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 dark:text-red-200">
              Please connect your wallet to view refund options.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (userTokens.length === 0) {
    return (
      <Card className="border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
            <XCircle className="h-5 w-5" />
            Campaign Failed - Refund Available
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-red-300 bg-red-100 dark:bg-red-900/20">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 dark:text-red-200">
              You don't have any tokens from this campaign to refund.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const totalRefundable = userTokens.reduce((sum, token) => {
    return sum + Number(token.holderInfo.mintPriceGross);
  }, 0);

  const totalRefundableFormatted = formatUnits(BigInt(totalRefundable), 6); // Assuming PYUSD (6 decimals)

  return (
    <Card className="border-2 border-red-500/20 bg-red-50/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-red-600" />
          Claim Your Refund
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
            {/* Info Alert */}
            <Alert className="bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800 dark:text-red-200">
                This campaign did not reach its funding goal. You can claim a
                full refund for your contribution.
              </AlertDescription>
            </Alert>

            {/* Total Refundable */}
            <div className="flex items-center justify-between p-4 bg-background rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                  <DollarSign className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Refundable
                  </p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {totalRefundableFormatted} {paymentToken}
                  </p>
                </div>
              </div>
            </div>

            {/* Token List */}
            <div className="space-y-3">
              <p className="text-sm font-medium">
                Your NFTs ({userTokens.length})
              </p>
              {userTokens.map((token) => (
                <div
                  key={token.tokenId.toString()}
                  className="flex items-center justify-between p-4 bg-background rounded-lg border"
                >
                  <div>
                    <p className="font-medium">
                      NFT #{token.tokenId.toString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Refund: {formatUnits(token.holderInfo.mintPriceGross, 6)}{" "}
                      {paymentToken}
                    </p>
                  </div>
                  <Button
                    onClick={() => handleClaimRefund(token.tokenId)}
                    disabled={
                      isPending ||
                      isConfirming ||
                      claimingTokenId === token.tokenId
                    }
                    variant="destructive"
                    size="sm"
                  >
                    {claimingTokenId === token.tokenId &&
                    (isPending || isConfirming) ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {isPending ? "Confirm..." : "Processing..."}
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Claim Refund
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>

            {/* Transaction Status */}
            {isConfirmed && hash && (
              <Alert className="bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 dark:text-green-200">
                  Refund claimed! View on{" "}
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
