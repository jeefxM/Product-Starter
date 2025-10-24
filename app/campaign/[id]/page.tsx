import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { CampaignDetails } from "@/components/campaigns/campaign-details";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CampaignPage({ params }: PageProps) {
  const { id } = await params;

  // Fetch campaign data from database
  const campaign = await prisma.dRSeries.findUnique({
    where: { id },
  });

  if (!campaign) {
    notFound();
  }

  // Transform database data to match component expectations
  const campaignData = {
    id: campaign.id,
    name: campaign.name,
    creator: campaign.creatorAddress,
    description: `${campaign.name} - A digital receipt campaign`,
    longDescription: `This is a digital receipt campaign for ${campaign.name}. Supporters will receive NFT receipts that serve as proof of early backing and include exclusive perks.`,
    image: "/placeholder.svg?height=400&width=600",
    currentPrice: campaign.startPrice.toString(),
    currency: campaign.paymentToken,
    supporters: campaign.totalEverMinted,
    minRequiredSales: campaign.minRequiredSales,
    maxSupply: campaign.maxItems,
    endDate: campaign.presaleTimestamp,
    category: "Technology",
    status: (campaign.status === "SUCCESS"
      ? "funded"
      : campaign.status === "FAILED"
      ? "ending-soon"
      : "active") as "active" | "funded" | "ending-soon",
    totalRaised: (
      campaign.totalEverMinted * Number(campaign.startPrice)
    ).toString(),
    contractAddress: campaign.contractAddress, // Use the actual contract address from database
    creatorAvatar: "/placeholder.svg?height=80&width=80",
    creatorName: "Anonymous Creator",
    creatorBio: "Campaign creator",
    milestones: [
      {
        title: "Campaign Launch",
        completed: true,
        date: campaign.createdAt.toISOString().split("T")[0],
      },
      {
        title: "Minimum Sales Target",
        completed: campaign.totalEverMinted >= campaign.minRequiredSales,
        date: "TBD",
      },
      { title: "Campaign Completion", completed: false, date: "TBD" },
    ],
    supporters_list: [], // This would be populated from DRToken table in a real implementation
  };

  // Debug logging - Full campaign data from database
  console.log("🗄️ [DATABASE] Full campaign data from DB:", {
    id: campaign.id,
    name: campaign.name,
    symbol: campaign.symbol,
    creatorAddress: campaign.creatorAddress,
    paymentToken: campaign.paymentToken,
    contractAddress: campaign.contractAddress,
    maxItems: campaign.maxItems,
    minRequiredSales: campaign.minRequiredSales,
    startPrice: campaign.startPrice,
    priceIncrement: campaign.priceIncrement,
    presaleTimestamp: campaign.presaleTimestamp,
    totalEverMinted: campaign.totalEverMinted,
    status: campaign.status,
    createdBlock: campaign.createdBlock,
    createdAt: campaign.createdAt,
    updatedAt: campaign.updatedAt,
  });

  // Also log the raw database object
  console.log("🗄️ [DATABASE] Raw campaign object:", campaign);

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container py-8 pb-20 md:pb-8">
        <CampaignDetails campaign={campaignData} />
      </main>

      <MobileNav />
    </div>
  );
}
