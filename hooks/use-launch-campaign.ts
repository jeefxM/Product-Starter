"use client";

import {
  useWriteContract,
  useWaitForTransactionReceipt,
  usePublicClient,
} from "wagmi";
import { parseUnits, decodeEventLog } from "viem";
import { TOKENS } from "@/lib/wagmi";
import FactoryABI from "@/lib/ABI/FactoryABI.json";
import { useEffect, useRef, useState } from "react";

export function useLaunchCampaign() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    data: receipt,
  } = useWaitForTransactionReceipt({ hash });
  const publicClient = usePublicClient();

  const storedFormData = useRef<any>(null);
  const [createdCampaignId, setCreatedCampaignId] = useState<string | null>(null);

  // Validate contract address format
  const isValidContractAddress = (address: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  // Extract contract address from transaction receipt
  const extractContractAddress = async (txHash: string) => {
    try {
      if (!publicClient) {
        throw new Error("Public client not available");
      }

      console.log("Extracting contract address from transaction:", txHash);

      // Get the transaction receipt
      const receipt = await publicClient.getTransactionReceipt({
        hash: txHash as `0x${string}`,
      });

      if (!receipt) {
        throw new Error("Transaction receipt not found");
      }

      console.log("Transaction receipt:", receipt);

      // Look for the CampaignCreated event in the logs
      console.log(
        `Searching through ${receipt.logs.length} log entries for CampaignCreated event`
      );

      for (let i = 0; i < receipt.logs.length; i++) {
        const log = receipt.logs[i];
        console.log(`Checking log ${i}:`, {
          address: log.address,
          topics: log.topics,
          data: log.data,
        });

        try {
          // Decode the event log using the Factory ABI
          const decoded = decodeEventLog({
            abi: FactoryABI,
            data: log.data,
            topics: log.topics,
          });

          console.log("Decoded event:", decoded);

          // Check if this is the CampaignCreated event
          if (decoded.eventName === "CampaignCreated") {
            const campaignAddress = (decoded.args as any).campaignAddress;
            console.log(
              "✅ Found CampaignCreated event with address:",
              campaignAddress
            );

            // Validate the extracted address
            if (!isValidContractAddress(campaignAddress)) {
              throw new Error(
                `Invalid contract address format: ${campaignAddress}`
              );
            }

            return campaignAddress;
          }
        } catch (decodeError) {
          // This log doesn't match our event, continue to next
          console.log(
            `Log ${i} doesn't match CampaignCreated event:`,
            decodeError
          );
          continue;
        }
      }

      throw new Error("CampaignCreated event not found in transaction logs");
    } catch (err) {
      console.error("Error extracting contract address:", err);
      throw err;
    }
  };

  const launchCampaign = async (formData: {
    name: string;
    symbol: string;
    minRequiredSales: number;
    maxItems: number;
    presaleTimestamp: bigint;
    startPrice: string;
    priceIncrement: string;
    paymentToken: string;
    description?: string;
    category?: string;
    creatorAddress?: string;
    imageUrl?: string;
  }) => {
    try {
      console.log("Launching campaign with data:", formData);

      // Store form data for database save after transaction confirmation
      storedFormData.current = formData;

      // Get payment token info
      const token = TOKENS[formData.paymentToken as keyof typeof TOKENS];
      if (!token) {
        throw new Error(`Unsupported payment token: ${formData.paymentToken}`);
      }

      // Convert price values to wei using token decimals
      const startPriceWei = parseUnits(formData.startPrice, token.decimals);
      const priceIncrementWei = parseUnits(
        formData.priceIncrement,
        token.decimals
      );

      console.log("Price values converted:", {
        startPriceWei,
        priceIncrementWei,
      });
      console.log("Payment token:", {
        tokenAddress: token.address,
        token: formData.paymentToken,
      });

      // Factory contract address (Sepolia)
      const factoryAddress = "0x30b9f7D6F09d359a97f2C2fB369928c5b75aEC7E"; // TODO: Update with Sepolia factory address

      console.log("Factory address:", factoryAddress);

      writeContract({
        address: factoryAddress as `0x${string}`,
        abi: FactoryABI,
        functionName: "createCampaign",
        args: [
          {
            name: formData.name,
            symbol: formData.symbol,
            minRequiredSales: formData.minRequiredSales,
            timestamp: formData.presaleTimestamp,
            startPrice: startPriceWei,
            priceIncrement: priceIncrementWei,
            paymentToken: token.address,
          },
        ],
      });

      return hash;
    } catch (err) {
      console.error("Error launching campaign:", err);
      throw err;
    }
  };

  // Save campaign to database after transaction is confirmed
  const saveCampaignToDatabase = async (
    contractAddress: string,
    formData: any
  ) => {
    try {
      const requestData = {
        name: formData.name,
        symbol: formData.symbol,
        description: formData.description,
        category: formData.category,
        fundingGoal: formData.fundingGoal,
        maxSupply: formData.maxSupply,
        duration: formData.duration,
        startingPrice: formData.startingPrice,
        priceIncrement: formData.priceIncrement,
        paymentToken: formData.paymentToken,
        contractAddress,
        creatorAddress: formData.creatorAddress,
        imageUrl: formData.imageUrl,
      };

      console.log("Saving campaign to database with data:", requestData);
      console.log("Form data received:", formData);
      console.log("Creator address:", formData.creatorAddress);

      const response = await fetch("/api/campaigns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error:", errorData);
        throw new Error(
          `Failed to save campaign to database: ${
            errorData.error || response.statusText
          }`
        );
      }

      return await response.json();
    } catch (err) {
      console.error("Error saving campaign to database:", err);
      throw err;
    }
  };

  // Automatically save to database when transaction is confirmed
  useEffect(() => {
    if (isConfirmed && hash && storedFormData.current) {
      console.log("Transaction confirmed, extracting contract address...");

      // Extract the real contract address from the transaction receipt
      extractContractAddress(hash)
        .then((contractAddress) => {
          console.log("Extracted contract address:", contractAddress);
          console.log(
            "Saving campaign to database with real contract address:",
            contractAddress
          );

          return saveCampaignToDatabase(
            contractAddress,
            storedFormData.current
          );
        })
        .then((result) => {
          console.log("Campaign saved to database successfully!");
          console.log("Campaign ID:", result.id);
          setCreatedCampaignId(result.id); // Store the campaign ID
          storedFormData.current = null; // Clear stored data
        })
        .catch((error) => {
          console.error(
            "Failed to extract contract address or save campaign:",
            error
          );

          // Fallback: save with a placeholder address if extraction fails
          console.log(
            "Falling back to placeholder address due to extraction error"
          );
          const fallbackAddress = `0x${Date.now().toString(16)}${Math.random()
            .toString(16)
            .substr(2, 8)}`;

          saveCampaignToDatabase(fallbackAddress, storedFormData.current)
            .then((result) => {
              console.log("Campaign saved with fallback address");
              console.log("Campaign ID:", result.id);
              setCreatedCampaignId(result.id); // Store the campaign ID from fallback
              storedFormData.current = null;
            })
            .catch((fallbackError) => {
              console.error(
                "Failed to save campaign even with fallback:",
                fallbackError
              );
            });
        });
    }
  }, [isConfirmed, hash, extractContractAddress, saveCampaignToDatabase]);

  return {
    launchCampaign,
    saveCampaignToDatabase,
    isPending,
    isConfirming,
    isConfirmed,
    hash,
    error,
    createdCampaignId,
  };
}
