import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { formatEther } from "viem";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");

    if (!address) {
      return NextResponse.json({ error: "Missing address" }, { status: 400 });
    }

    const normalized = address as `0x${string}`; // stored as strings

    // Basic aggregates
    const [supportedCount, spentAgg, nftCount, createdCount, raisedAgg] =
      await Promise.all([
        prisma.dRToken.count({ where: { mintedByAddress: normalized } }),
        prisma.dRToken.aggregate({
          _sum: { mintPriceWei: true },
          where: { mintedByAddress: normalized },
        }),
        prisma.dRToken.count({ where: { currentOwner: normalized } }),
        prisma.dRSeries.count({ where: { creatorAddress: normalized } }),
        prisma.dRToken.aggregate({
          _sum: { mintPriceNetWei: true },
          where: { series: { creatorAddress: normalized } },
        }),
      ]);

    // Supported campaigns (tokens minted by the user)
    const supportedTokens = await prisma.dRToken.findMany({
      where: { mintedByAddress: normalized },
      orderBy: { mintedAt: "desc" },
      take: 20,
      include: {
        series: true,
      },
    });

    const supportedCampaigns = supportedTokens.map((t) => ({
      id: t.series?.id || t.id,
      name: t.series?.name || "Campaign",
      image: "/placeholder.svg?height=100&width=100",
      pricePaid: formatEther(BigInt(t.mintPriceWei)),
      tokenId: t.tokenId.toString(),
      status:
        t.series?.status === "SUCCESS"
          ? "funded"
          : t.series?.status === "FAILED"
          ? "ending-soon"
          : "active",
      currentValue: formatEther(BigInt(t.mintPriceNetWei)),
      supportDate: t.mintedAt.toISOString(),
      priceChange: "0%",
    }));

    // Created campaigns
    const createdSeries = await prisma.dRSeries.findMany({
      where: { creatorAddress: normalized },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const createdCampaigns = await Promise.all(
      createdSeries.map(async (s) => {
        const sum = await prisma.dRToken.aggregate({
          _sum: { mintPriceNetWei: true },
          where: { seriesId: s.id },
        });
        return {
          id: s.id,
          name: s.name,
          image: "/placeholder.svg?height=100&width=100",
          supporters: s.totalEverMinted,
          minRequired: s.minRequiredSales,
          totalRaised: formatEther(BigInt(sum._sum.mintPriceNetWei ?? 0)),
          status:
            s.status === "SUCCESS"
              ? "funded"
              : s.status === "FAILED"
              ? "ending-soon"
              : "active",
          endDate: s.presaleTimestamp,
        };
      })
    );

    const response = {
      success: true,
      userStats: {
        totalSupported: supportedCount,
        totalSpent: formatEther(BigInt(spentAgg._sum.mintPriceWei ?? 0)),
        campaignsCreated: createdCount,
        totalRaised: formatEther(BigInt(raisedAgg._sum.mintPriceNetWei ?? 0)),
        nftCount: nftCount,
        portfolioValue: formatEther(BigInt(spentAgg._sum.mintPriceWei ?? 0)),
      },
      supportedCampaigns,
      createdCampaigns,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("[API:user-dashboard] error", error);
    return NextResponse.json(
      { error: "Failed to load dashboard" },
      { status: 500 }
    );
  }
}
