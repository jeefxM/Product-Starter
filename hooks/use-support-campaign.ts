"use client";

import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useChainId,
  useAccount,
} from "wagmi";
import CampaignNFTABI from "@/lib/ABI/CampaignNFTABI.json";
import { getGasConfig } from "@/lib/gas-utils";

export function useSupportCampaign() {
  const chainId = useChainId();
  const { address } = useAccount();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  const checkAndApproveToken = async (campaignContractAddress: string) => {
    try {
      const { createPublicClient, http } = await import("viem");
      const { sepolia } = await import("viem/chains");

      const publicClient = createPublicClient({
        chain: chainId === 11155111 ? sepolia : sepolia,
        transport: http(),
      });

      if (!address) {
        throw new Error("No wallet connected");
      }

      // Get payment token address
      const paymentTokenAddress = await publicClient.readContract({
        address: campaignContractAddress as `0x${string}`,
        abi: CampaignNFTABI,
        functionName: "paymentToken",
      });

      // Get current mint price
      const currentPrice = await publicClient.readContract({
        address: campaignContractAddress as `0x${string}`,
        abi: CampaignNFTABI,
        functionName: "getCurrentPriceToMint",
      });

      // Get factory and treasury info
      const factoryAddress = await publicClient.readContract({
        address: campaignContractAddress as `0x${string}`,
        abi: CampaignNFTABI,
        functionName: "factory",
      });

      const [treasuryAddress, feePercentage] = await publicClient.readContract({
        address: factoryAddress as `0x${string}`,
        abi: [
          {
            inputs: [],
            name: "getPlatformFeeAndTreasury",
            outputs: [
              { internalType: "address", name: "treasury", type: "address" },
              { internalType: "uint24", name: "feePercentage", type: "uint24" },
            ],
            stateMutability: "view",
            type: "function",
          },
        ],
        functionName: "getPlatformFeeAndTreasury",
      });

      // Calculate amounts
      const feeValue =
        (BigInt(String(currentPrice)) * BigInt(feePercentage)) / BigInt(100);
      const mintPriceNet = BigInt(String(currentPrice)) - feeValue;
      const totalAmountNeeded = BigInt(String(currentPrice));

      // Check current allowance for campaign contract
      const contractAllowance = await publicClient.readContract({
        address: paymentTokenAddress as `0x${string}`,
        abi: [
          {
            inputs: [
              { internalType: "address", name: "owner", type: "address" },
              { internalType: "address", name: "spender", type: "address" },
            ],
            name: "allowance",
            outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            stateMutability: "view",
            type: "function",
          },
        ],
        functionName: "allowance",
        args: [
          address as `0x${string}`,
          campaignContractAddress as `0x${string}`,
        ],
      });

      // Campaign contract needs approval for FULL amount
      const needsApproval = BigInt(contractAllowance) < totalAmountNeeded;

      if (needsApproval) {
        return {
          needsApproval: true,
          tokenAddress: paymentTokenAddress,
          spender: campaignContractAddress,
          amount: totalAmountNeeded,
          mintPriceNet,
          feeValue,
          treasuryAddress,
        };
      }

      return { needsApproval: false };
    } catch (err) {
      console.error("Error checking token approval:", err);
      throw err;
    }
  };

  const supportCampaign = async (campaignContractAddress: string) => {
    try {
      if (!campaignContractAddress) {
        throw new Error("Campaign contract address is required");
      }

      // Check if approval is needed
      const approvalStatus = await checkAndApproveToken(
        campaignContractAddress
      );

      if (approvalStatus.needsApproval) {
        return {
          needsApproval: true,
          approvalParams: {
            tokenAddress: approvalStatus.tokenAddress,
            spender: approvalStatus.spender,
            amount: approvalStatus.amount,
          },
        };
      }

      // Execute mint
      const gasConfig = getGasConfig(chainId);

      writeContract({
        address: campaignContractAddress as `0x${string}`,
        abi: CampaignNFTABI,
        functionName: "mint",
        args: [],
        ...gasConfig,
      });

      return { needsApproval: false, hash };
    } catch (err) {
      console.error("Error supporting campaign:", err);
      throw err;
    }
  };

  return {
    supportCampaign,
    checkAndApproveToken,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}
