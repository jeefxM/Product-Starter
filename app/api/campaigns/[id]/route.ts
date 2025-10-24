import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const campaign = await prisma.dRSeries.findUnique({
      where: { id },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      campaign: {
        id: campaign.id,
        name: campaign.name,
        symbol: campaign.symbol,
        description: campaign.name,
        category: "Technology",
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
    console.error("Error fetching campaign:", error);
    return NextResponse.json(
      { error: "Failed to fetch campaign" },
      { status: 500 }
    );
  }
}
