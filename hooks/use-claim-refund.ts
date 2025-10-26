"use client";

import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useChainId,
  usePublicClient,
  useAccount,
} from "wagmi";
import { useCallback } from "react";
import CampaignNFTABI from "@/lib/ABI/CampaignNFTABI.json";
import { getGasConfig } from "@/lib/gas-utils";

export function useClaimRefund() {
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const { address } = useAccount();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  const getUserTokens = useCallback(
    async (campaignContractAddress: string) => {
      try {
        if (!publicClient || !address) {
          throw new Error("Public client or address not available");
        }

        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(
            () => reject(new Error("Request timeout after 30 seconds")),
            30000
          );
        });

        const fetchPromise = async () => {
          // Get user's token balance with retry logic
          let balance;
          let retries = 3;

          while (retries > 0) {
            try {
              balance = await publicClient.readContract({
                address: campaignContractAddress as `0x${string}`,
                abi: CampaignNFTABI,
                functionName: "balanceOf",
                args: [address],
              });
              break; // Success, exit retry loop
            } catch (error) {
              retries--;

              if (retries === 0) {
                throw new Error(
                  `Failed to fetch balance after 3 attempts: ${
                    error instanceof Error ? error.message : "Unknown error"
                  }`
                );
              }

              // Wait before retry
              await new Promise((resolve) =>
                setTimeout(resolve, 1000 * (4 - retries))
              );
            }
          }

          const balanceNum = Number(balance);

          if (balanceNum === 0) {
            return [];
          }

          const tokens: bigint[] = [];

          // Get all token IDs owned by the user with retry logic
          for (let i = 0; i < balanceNum; i++) {
            let tokenId;
            let retries = 3;

            while (retries > 0) {
              try {
                tokenId = await publicClient.readContract({
                  address: campaignContractAddress as `0x${string}`,
                  abi: CampaignNFTABI,
                  functionName: "tokenOfOwnerByIndex",
                  args: [address, BigInt(i)],
                });
                break; // Success, exit retry loop
              } catch (error) {
                retries--;

                if (retries === 0) {
                  throw new Error(
                    `Failed to fetch token at index ${i} after 3 attempts: ${
                      error instanceof Error ? error.message : "Unknown error"
                    }`
                  );
                }

                // Wait before retry
                await new Promise((resolve) =>
                  setTimeout(resolve, 1000 * (4 - retries))
                );
              }
            }

            tokens.push(tokenId as bigint);
          }

          // Get holder info for each token with retry logic
          const tokenDetails = await Promise.all(
            tokens.map(async (tokenId) => {
              let holderInfo;
              let retries = 3;

              while (retries > 0) {
                try {
                  holderInfo = await publicClient.readContract({
                    address: campaignContractAddress as `0x${string}`,
                    abi: CampaignNFTABI,
                    functionName: "getHolderByTokenId",
                    args: [tokenId],
                  });
                  break; // Success, exit retry loop
                } catch (error) {
                  retries--;

                  if (retries === 0) {
                    throw new Error(
                      `Failed to fetch holder info for token ${tokenId} after 3 attempts: ${
                        error instanceof Error ? error.message : "Unknown error"
                      }`
                    );
                  }

                  // Wait before retry
                  await new Promise((resolve) =>
                    setTimeout(resolve, 1000 * (4 - retries))
                  );
                }
              }

              return {
                tokenId,
                holderInfo: holderInfo as {
                  mintPrice: bigint;
                  tokenId: bigint;
                  paymentToken: string;
                  mintPriceGross: bigint;
                },
              };
            })
          );

          return tokenDetails;
        };

        // Race between fetch and timeout
        const result = await Promise.race([fetchPromise(), timeoutPromise]);
        return result as any;
      } catch (err) {
        console.error("Error getting user tokens:", err);
        throw err;
      }
    },
    [publicClient, address]
  );

  const claimRefund = async (
    campaignContractAddress: string,
    tokenId: bigint
  ) => {
    try {
      if (!campaignContractAddress) {
        throw new Error("Campaign contract address is required");
      }

      // Execute claim refund
      const gasConfig = getGasConfig(chainId);

      writeContract({
        address: campaignContractAddress as `0x${string}`,
        abi: CampaignNFTABI,
        functionName: "claimRefund",
        args: [tokenId],
        ...gasConfig,
      });

      return { hash };
    } catch (err) {
      console.error("Error claiming refund:", err);
      throw err;
    }
  };

  return {
    claimRefund,
    getUserTokens,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}
