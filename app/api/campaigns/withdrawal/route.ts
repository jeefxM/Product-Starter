import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contractAddress, creatorAddress, amountWei, txHash, blockNumber } =
      body;

    if (!contractAddress || !creatorAddress || !amountWei || !txHash) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Find the campaign
    const campaign = await prisma.dRSeries.findUnique({
      where: {
        contractAddress: contractAddress,
      },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    // Record the withdrawal
    const withdrawal = await prisma.creatorWithdrawal.create({
      data: {
        drAddress: contractAddress,
        creatorAddress: creatorAddress,
        amountWei: BigInt(amountWei),
        txHash: txHash,
        blockNumber: blockNumber ? BigInt(blockNumber) : null,
        seriesId: campaign.id,
      },
    });

    return NextResponse.json({
      success: true,
      withdrawal: {
        id: withdrawal.id,
        drAddress: withdrawal.drAddress,
        creatorAddress: withdrawal.creatorAddress,
        amountWei: withdrawal.amountWei.toString(),
        txHash: withdrawal.txHash,
        createdAt: withdrawal.createdAt,
      },
    });
  } catch (error) {
    console.error("Error recording withdrawal:", error);
    return NextResponse.json(
      {
        error: "Failed to record withdrawal",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch withdrawals for a campaign
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contractAddress = searchParams.get("contractAddress");
    const creatorAddress = searchParams.get("creatorAddress");

    if (!contractAddress && !creatorAddress) {
      return NextResponse.json(
        { error: "Either contractAddress or creatorAddress is required" },
        { status: 400 }
      );
    }

    const whereClause: any = {};
    if (contractAddress) whereClause.drAddress = contractAddress;
    if (creatorAddress) whereClause.creatorAddress = creatorAddress;

    const withdrawals = await prisma.creatorWithdrawal.findMany({
      where: whereClause,
      include: {
        series: {
          select: {
            name: true,
            symbol: true,
            contractAddress: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      withdrawals: withdrawals.map((w) => ({
        id: w.id,
        drAddress: w.drAddress,
        creatorAddress: w.creatorAddress,
        amountWei: w.amountWei.toString(),
        txHash: w.txHash,
        blockNumber: w.blockNumber?.toString(),
        createdAt: w.createdAt,
        campaign: w.series,
      })),
    });
  } catch (error) {
    console.error("Error fetching withdrawals:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch withdrawals",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}



