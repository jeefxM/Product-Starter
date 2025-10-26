"use client";

import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useChainId,
  usePublicClient,
} from "wagmi";
import CampaignNFTABI from "@/lib/ABI/CampaignNFTABI.json";
import { getGasConfig } from "@/lib/gas-utils";

export function useWithdrawCreatorFunds() {
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  const getWithdrawalInfo = async (campaignContractAddress: string) => {
    try {
      if (!publicClient) {
        throw new Error("Public client not available");
      }

      // Get withdrawal amount available
      const withdrawalAmount = await publicClient.readContract({
        address: campaignContractAddress as `0x${string}`,
        abi: CampaignNFTABI,
        functionName: "withdrawalAmount",
      });

      // Get total earned by creator
      const totalEarned = await publicClient.readContract({
        address: campaignContractAddress as `0x${string}`,
        abi: CampaignNFTABI,
        functionName: "totalEarnedByCreator",
      });

      // Get payment token
      const paymentToken = await publicClient.readContract({
        address: campaignContractAddress as `0x${string}`,
        abi: CampaignNFTABI,
        functionName: "paymentToken",
      });

      return {
        withdrawalAmount: withdrawalAmount as bigint,
        totalEarned: totalEarned as bigint,
        paymentToken: paymentToken as string,
      };
    } catch (err) {
      console.error("Error getting withdrawal info:", err);
      throw err;
    }
  };

  const withdrawFunds = async (campaignContractAddress: string) => {
    try {
      if (!campaignContractAddress) {
        throw new Error("Campaign contract address is required");
      }

      // Check if there are funds to withdraw
      const info = await getWithdrawalInfo(campaignContractAddress);

      if (info.withdrawalAmount === BigInt(0)) {
        throw new Error("No funds available to withdraw");
      }

      // Execute withdrawal
      const gasConfig = getGasConfig(chainId);

      writeContract({
        address: campaignContractAddress as `0x${string}`,
        abi: CampaignNFTABI,
        functionName: "withdrawCreatorsFunds",
        args: [],
        ...gasConfig,
      });

      return { hash };
    } catch (err) {
      console.error("Error withdrawing creator funds:", err);
      throw err;
    }
  };

  return {
    withdrawFunds,
    getWithdrawalInfo,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}



