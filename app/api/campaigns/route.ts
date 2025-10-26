import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("API received data:", body);

    const {
      name,
      symbol,
      description,
      category,
      priceIncrement,
      startingPrice,
      startPrice,
      paymentToken,
      creatorAddress,
      contractAddress,
      timestamp,
      duration,
      fundingGoal,
      minRequiredSales,
      maxSupply,
      maxItems,
      imageUrl,
    } = body;

    // Validate required fields
    if (!name || !symbol || !creatorAddress) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate contract address
    if (!contractAddress) {
      return NextResponse.json(
        { error: "Contract address is required" },
        { status: 400 }
      );
    }

    // Parse price values (accept different field names for flexibility)
    const finalStartPrice = parseFloat(startingPrice || startPrice || "3.0");
    const finalPriceIncrement = parseFloat(priceIncrement || "0.3");
    const finalMaxItems = parseInt(maxSupply || maxItems || "1000");
    const finalMinRequiredSales = parseInt(
      minRequiredSales || fundingGoal || "10"
    );

    // Convert timestamp to Date (timestamp is in seconds, Date expects milliseconds)
    const endDate = timestamp
      ? new Date(Number(timestamp) * 1000)
      : duration
      ? new Date(Date.now() + Number(duration) * 24 * 60 * 60 * 1000)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    console.log("📝 Parsed campaign values:", {
      finalStartPrice,
      finalPriceIncrement,
      finalMaxItems,
      finalMinRequiredSales,
      endDate,
    });

    // Create or update campaign in database using upsert
    const campaign = await prisma.dRSeries.upsert({
      where: {
        contractAddress: contractAddress,
      },
      update: {
        name,
        symbol,
        maxItems: finalMaxItems,
        minRequiredSales: finalMinRequiredSales,
        startPrice: finalStartPrice,
        priceIncrement: finalPriceIncrement,
        presaleTimestamp: endDate,
        creatorAddress,
        paymentToken: paymentToken || "PYUSD",
        status: "LIVE",
        imageUrl: imageUrl || null,
      },
      create: {
        name,
        symbol,
        maxItems: finalMaxItems,
        minRequiredSales: finalMinRequiredSales,
        startPrice: finalStartPrice,
        priceIncrement: finalPriceIncrement,
        presaleTimestamp: endDate,
        creatorAddress,
        paymentToken: paymentToken || "PYUSD",
        contractAddress: contractAddress,
        status: "LIVE",
        imageUrl: imageUrl || null,
      },
    });

    return NextResponse.json({
      success: true,
      campaign: {
        id: campaign.id,
        name: campaign.name,
        symbol: campaign.symbol,
        description: description || campaign.name,
        category: category || "Technology",
        maxSupply: campaign.maxItems,
        minRequiredSales: campaign.minRequiredSales,
        startPrice: campaign.startPrice.toString(),
        priceIncrement: campaign.priceIncrement.toString(),
        paymentToken: campaign.paymentToken,
        creatorAddress: campaign.creatorAddress,
        contractAddress: campaign.contractAddress,
        status: campaign.status,
        createdAt: campaign.createdAt,
        endDate: campaign.presaleTimestamp,
        imageUrl: campaign.imageUrl,
      },
    });
  } catch (error) {
    console.error("Error creating campaign:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    const errorCode =
      error instanceof Error && "code" in error
        ? (error as any).code
        : "unknown";
    console.error("Error details:", errorMessage);
    console.error("Error code:", errorCode);
    return NextResponse.json(
      { error: `Failed to create campaign: ${errorMessage}` },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const campaigns = await prisma.dRSeries.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    // Debug logging - All campaigns from database
    console.log("🗄️ [API] All campaigns from database:", campaigns.length);
    campaigns.forEach((campaign, index) => {
      console.log(`🗄️ [API] Campaign ${index + 1}:`, {
        id: campaign.id,
        name: campaign.name,
        symbol: campaign.symbol,
        creatorAddress: campaign.creatorAddress,
        paymentToken: campaign.paymentToken,
        contractAddress: campaign.contractAddress,
        maxItems: campaign.maxItems,
        minRequiredSales: campaign.minRequiredSales,
        startPrice: campaign.startPrice,
        startPriceType: typeof campaign.startPrice,
        startPriceToString: campaign.startPrice.toString(),
        priceIncrement: campaign.priceIncrement,
        presaleTimestamp: campaign.presaleTimestamp,
        totalEverMinted: campaign.totalEverMinted,
        status: campaign.status,
        createdBlock: campaign.createdBlock,
        createdAt: campaign.createdAt,
        updatedAt: campaign.updatedAt,
      });
    });

    return NextResponse.json({
      success: true,
      campaigns: campaigns.map((campaign) => ({
        id: campaign.id,
        name: campaign.name,
        symbol: campaign.symbol,
        description: campaign.name, // Using name as description for now
        category: "Technology", // Default category
        maxSupply: campaign.maxItems,
        minRequiredSales: campaign.minRequiredSales,
        startPrice: campaign.startPrice.toString(),
        priceIncrement: campaign.priceIncrement.toString(),
        paymentToken: campaign.paymentToken,
        creatorAddress: campaign.creatorAddress,
        contractAddress: campaign.contractAddress,
        status: campaign.status,
        createdAt: campaign.createdAt,
        endDate: campaign.presaleTimestamp,
        imageUrl: campaign.imageUrl,
        totalEverMinted: campaign.totalEverMinted || 0,
      })),
    });
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return NextResponse.json(
      { error: "Failed to fetch campaigns" },
      { status: 500 }
    );
  }
}
