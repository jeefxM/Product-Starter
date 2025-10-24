"use client";

import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
  useAccount,
  useChainId,
} from "wagmi";
import { useEffect, useState } from "react";

// ERC20 ABI for token approval functions
const ERC20_ABI = [
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
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
  {
    inputs: [],
    name: "symbol",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

export function useTokenApproval() {
  const { address } = useAccount();
  const chainId = useChainId();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });
  const [approvalParams, setApprovalParams] = useState<{
    tokenAddress: string;
    spender: string;
    amount: bigint;
    symbol?: string;
    decimals?: number;
  } | null>(null);

  // Check current allowance
  const { data: currentAllowance, refetch: refetchAllowance } = useReadContract(
    {
      address: approvalParams?.tokenAddress as `0x${string}`,
      abi: ERC20_ABI,
      functionName: "allowance",
      args: approvalParams
        ? [address as `0x${string}`, approvalParams.spender as `0x${string}`]
        : undefined,
      query: {
        enabled: !!approvalParams && !!address,
      },
    }
  );

  // Get token symbol and decimals
  const { data: tokenSymbol } = useReadContract({
    address: approvalParams?.tokenAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "symbol",
    query: {
      enabled: !!approvalParams,
    },
  });

  const { data: tokenDecimals } = useReadContract({
    address: approvalParams?.tokenAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "decimals",
    query: {
      enabled: !!approvalParams,
    },
  });

  // Check if approval is needed
  const needsApproval =
    approvalParams && currentAllowance !== undefined
      ? currentAllowance < approvalParams.amount
      : false;

  // Set approval parameters
  const setApproval = (params: {
    tokenAddress: string;
    spender: string;
    amount: bigint;
  }) => {
    setApprovalParams(params);
  };

  // Approve tokens
  const approve = async () => {
    if (!approvalParams) {
      throw new Error("No approval parameters set");
    }

    console.log("🔍 [APPROVAL] Starting token approval transaction");
    console.log("🔍 [APPROVAL] Token:", approvalParams.tokenAddress);
    console.log("🔍 [APPROVAL] Spender:", approvalParams.spender);
    console.log("🔍 [APPROVAL] Amount:", approvalParams.amount);

    writeContract({
      address: approvalParams.tokenAddress as `0x${string}`,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [approvalParams.spender as `0x${string}`, approvalParams.amount],
    });
  };

  // Reset approval state
  const resetApproval = () => {
    setApprovalParams(null);
  };

  // Handle approval confirmation
  useEffect(() => {
    if (isConfirmed && hash) {
      console.log("✅ [APPROVAL] Approval transaction confirmed");
      // Refetch allowance to get updated value
      refetchAllowance();
    }
  }, [isConfirmed, hash, refetchAllowance]);

  // Format amount for display
  const formatAmount = (amount: bigint, decimals: number = 18) => {
    const divisor = BigInt(10 ** decimals);
    const wholePart = amount / divisor;
    const fractionalPart = amount % divisor;

    if (fractionalPart === 0n) {
      return wholePart.toString();
    }

    const fractionalStr = fractionalPart.toString().padStart(decimals, "0");
    const trimmedFractional = fractionalStr.replace(/0+$/, "");

    return trimmedFractional
      ? `${wholePart}.${trimmedFractional}`
      : wholePart.toString();
  };

  return {
    // State
    approvalParams,
    currentAllowance,
    needsApproval,
    tokenSymbol,
    tokenDecimals,

    // Actions
    setApproval,
    approve,
    resetApproval,

    // Transaction state
    isPending,
    isConfirming,
    isConfirmed,
    hash,
    error,

    // Utils
    formatAmount,
    refetchAllowance,
  };
}
