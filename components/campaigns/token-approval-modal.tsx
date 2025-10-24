"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTokenApproval } from "@/hooks/use-token-approval";
import { useToast } from "@/hooks/use-toast";
import {
  Shield,
  CheckCircle,
  AlertTriangle,
  Loader2,
  ExternalLink,
  Copy,
  RefreshCw,
} from "lucide-react";

interface TokenApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApprovalComplete: () => void;
  approvalParams: {
    tokenAddress: string;
    spender: string;
    amount: bigint;
    symbol?: string;
    decimals?: number;
  };
}

export function TokenApprovalModal({
  isOpen,
  onClose,
  onApprovalComplete,
  approvalParams,
}: TokenApprovalModalProps) {
  const { toast } = useToast();
  const {
    currentAllowance,
    needsApproval,
    tokenSymbol,
    tokenDecimals,
    isPending,
    isConfirming,
    isConfirmed,
    hash,
    error,
    approve,
    formatAmount,
    refetchAllowance,
    setApproval,
  } = useTokenApproval();

  const [step, setStep] = useState<"info" | "approving" | "success">("info");
  const hasCompletedRef = useRef(false);

  // Set approval parameters when modal opens
  useEffect(() => {
    if (isOpen && approvalParams) {
      // The useTokenApproval hook will be initialized with these params
      console.log(
        "🔍 [APPROVAL_MODAL] Setting approval parameters:",
        approvalParams
      );
      setApproval(approvalParams);
      // Reset completion flag when opening
      hasCompletedRef.current = false;
    }
  }, [isOpen, approvalParams]);

  // Handle approval success
  useEffect(() => {
    if (isConfirmed && hash && !hasCompletedRef.current) {
      hasCompletedRef.current = true;
      setStep("success");
      toast({
        title: "Approval Successful!",
        description: "You can now support this campaign.",
      });

      // Call completion callback after a short delay
      setTimeout(() => {
        onApprovalComplete();
        onClose();
      }, 500);
    }
  }, [isConfirmed, hash]);

  // Handle approval errors
  useEffect(() => {
    if (error) {
      toast({
        title: "Approval Failed",
        description: error.message || "Something went wrong with the approval.",
        variant: "destructive",
      });
      setStep("info");
    }
  }, [error, toast]);

  const handleApprove = async () => {
    try {
      setStep("approving");
      await approve();
    } catch (err) {
      console.error("Error approving tokens:", err);
      setStep("info");
    }
  };

  const handleRefresh = async () => {
    await refetchAllowance();
    toast({
      title: "Allowance Refreshed",
      description: "Updated allowance information.",
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Address copied to clipboard",
    });
  };

  if (!isOpen) return null;

  const formattedAmount = formatAmount(
    approvalParams.amount,
    tokenDecimals || 18
  );
  const formattedAllowance = currentAllowance
    ? formatAmount(currentAllowance, tokenDecimals || 18)
    : "0";
  const approvalProgress =
    currentAllowance && approvalParams.amount
      ? Math.min(
          (Number(currentAllowance) / Number(approvalParams.amount)) * 100,
          100
        )
      : 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <CardTitle>Token Approval Required</CardTitle>
          </div>
          <CardDescription>
            You need to approve the contract to spend your tokens before
            supporting this campaign.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Approval Info */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Token:</span>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{tokenSymbol || "Token"}</Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(approvalParams.tokenAddress)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Amount to Approve:</span>
              <span className="font-mono text-sm">
                {formattedAmount} {tokenSymbol || "tokens"}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Current Allowance:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm">
                  {formattedAllowance} {tokenSymbol || "tokens"}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isPending || isConfirming}
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Approval Progress:</span>
                <span>{Math.round(approvalProgress)}%</span>
              </div>
              <Progress value={approvalProgress} className="h-2" />
            </div>
          </div>

          {/* Spender Address */}
          <div className="space-y-2">
            <span className="text-sm font-medium">Approving Spender:</span>
            <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
              <code className="text-xs flex-1 truncate">
                {approvalParams.spender}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(approvalParams.spender)}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              This address will be authorized to spend your tokens for this
              transaction.
            </p>
          </div>

          {/* Status Messages */}
          {needsApproval && step === "info" && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                You need to approve the contract to spend {formattedAmount}{" "}
                {tokenSymbol || "tokens"}
                before you can support this campaign.
              </AlertDescription>
            </Alert>
          )}

          {!needsApproval && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                You have sufficient allowance to support this campaign.
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isPending || isConfirming}
              className="flex-1"
            >
              Cancel
            </Button>

            {step === "info" && (
              <Button
                onClick={handleApprove}
                disabled={!needsApproval || isPending || isConfirming}
                className="flex-1"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Approving...
                  </>
                ) : isConfirming ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Confirming...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Approve Tokens
                  </>
                )}
              </Button>
            )}

            {step === "approving" && (
              <Button disabled className="flex-1">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isPending ? "Approving..." : "Confirming..."}
              </Button>
            )}

            {step === "success" && (
              <Button disabled className="flex-1">
                <CheckCircle className="mr-2 h-4 w-4" />
                Approved!
              </Button>
            )}
          </div>

          {/* Transaction Hash */}
          {hash && (
            <div className="space-y-2">
              <span className="text-sm font-medium">Transaction Hash:</span>
              <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                <code className="text-xs flex-1 truncate">{hash}</code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(hash)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
