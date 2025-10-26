import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contractAddress, status } = body;

    if (!contractAddress) {
      return NextResponse.json(
        { error: "Contract address is required" },
        { status: 400 }
      );
    }

    if (!["LIVE", "SUCCESS", "FAILED"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be LIVE, SUCCESS, or FAILED" },
        { status: 400 }
      );
    }

    // Update campaign status in database
    const campaign = await prisma.dRSeries.update({
      where: {
        contractAddress: contractAddress,
      },
      data: {
        status: status,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      campaign: {
        id: campaign.id,
        contractAddress: campaign.contractAddress,
        status: campaign.status,
        updatedAt: campaign.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error updating campaign status:", error);
    return NextResponse.json(
      {
        error: "Failed to update campaign status",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}



