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

  // Pass the campaign ID to the client component for real-time data fetching
  return (
    <div className="min-h-screen">
      <Header />

      <main className="container py-8 pb-20 md:pb-8">
        <CampaignDetails campaignId={id} />
      </main>

      <MobileNav />
    </div>
  );
}
