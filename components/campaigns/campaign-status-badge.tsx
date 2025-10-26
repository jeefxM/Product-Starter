"use client";

import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";
import { useCampaignStatus } from "@/hooks/use-campaign-status";
import { useEffect } from "react";

interface CampaignStatusBadgeProps {
  contractAddress: string;
  currentStatus?: "LIVE" | "SUCCESS" | "FAILED";
  onStatusChange?: (newStatus: "LIVE" | "SUCCESS" | "FAILED") => void;
}

export function CampaignStatusBadge({
  contractAddress,
  currentStatus,
  onStatusChange,
}: CampaignStatusBadgeProps) {
  const { statusInfo, loading, error } = useCampaignStatus(contractAddress);

  // Update database status when blockchain status changes
  useEffect(() => {
    if (!statusInfo || !currentStatus || !onStatusChange) return;

    const determineNewStatus = () => {
      if (statusInfo.isSuccessful) return "SUCCESS";
      if (statusInfo.isFailed) return "FAILED";
      return "LIVE";
    };

    const newStatus = determineNewStatus();

    // Only update if status has changed
    if (newStatus !== currentStatus) {
      updateDatabaseStatus(contractAddress, newStatus);
      onStatusChange(newStatus);
    }
  }, [statusInfo, currentStatus, contractAddress, onStatusChange]);

  const updateDatabaseStatus = async (
    contractAddress: string,
    status: "LIVE" | "SUCCESS" | "FAILED"
  ) => {
    try {
      await fetch("/api/campaigns/update-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contractAddress,
          status,
        }),
      });
    } catch (error) {
      console.error("Error updating campaign status:", error);
    }
  };

  if (loading) {
    return (
      <Badge variant="outline" className="gap-1">
        <Loader2 className="w-3 h-3 animate-spin" />
        Loading...
      </Badge>
    );
  }

  if (!statusInfo) {
    // If we have an error, show error state
    if (error) {
      return (
        <Badge
          variant="outline"
          className="gap-1 bg-red-50 text-red-700 border-red-300 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
        >
          <Clock className="w-3 h-3" />
          Error
        </Badge>
      );
    }

    // If we have a current status from database, use that as fallback
    if (currentStatus) {
      const getStatusBadge = (status: string) => {
        switch (status) {
          case "SUCCESS":
            return (
              <Badge
                variant="outline"
                className="gap-1 bg-green-50 text-green-700 border-green-300 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
              >
                <CheckCircle className="w-3 h-3" />
                Success
              </Badge>
            );
          case "FAILED":
            return (
              <Badge
                variant="outline"
                className="gap-1 bg-red-50 text-red-700 border-red-300 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
              >
                <XCircle className="w-3 h-3" />
                Failed
              </Badge>
            );
          case "LIVE":
          default:
            return (
              <Badge
                variant="outline"
                className="gap-1 bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
              >
                <Clock className="w-3 h-3" />
                Live
              </Badge>
            );
        }
      };

      return getStatusBadge(currentStatus);
    }

    // If no status info and no current status, show unknown
    return (
      <Badge variant="outline" className="gap-1">
        <Clock className="w-3 h-3" />
        Unknown
      </Badge>
    );
  }

  if (statusInfo.isSuccessful) {
    return (
      <Badge
        variant="outline"
        className="gap-1 bg-green-50 text-green-700 border-green-300 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
      >
        <CheckCircle className="w-3 h-3" />
        Success
      </Badge>
    );
  }

  if (statusInfo.isFailed) {
    return (
      <Badge
        variant="outline"
        className="gap-1 bg-red-50 text-red-700 border-red-300 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
      >
        <XCircle className="w-3 h-3" />
        Failed
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="gap-1 bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
    >
      <Clock className="w-3 h-3" />
      Live
    </Badge>
  );
}
