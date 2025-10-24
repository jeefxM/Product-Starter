"use client";

import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { CampaignGrid } from "@/components/campaigns/campaign-grid";
import { SearchFilters } from "@/components/campaigns/search-filters";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { useEffect } from "react";

export default function ExplorePage() {
  const { setFrameReady, isFrameReady } = useMiniKit();

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container py-6 pb-24 md:pb-10">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="h-8 w-8 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold">Explore Products</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Discover innovative products and support creators you believe in.
          </p>
        </div>

        {/* Search and Filters */}
        <SearchFilters />

        {/* Campaign Grid */}
        <CampaignGrid />
      </main>

      <MobileNav />
    </div>
  );
}
