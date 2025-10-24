"use client";

import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { CampaignGrid } from "@/components/campaigns/campaign-grid";
import { SearchFilters } from "@/components/campaigns/search-filters";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, Clock, Target } from "lucide-react";
import Link from "next/link";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { useEffect } from "react";

export default function HomePage() {
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
        {/* Hero Section */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
            ProductStarter
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Launch innovative products and collect NFT receipts as proof of your
            early support. Join the future of product crowdfunding.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/create">
              <Button size="lg" className="btn-gradient">
                <Plus className="mr-2 h-5 w-5" />
                Launch Product
              </Button>
            </Link>
            <Link href="/explore">
              <Button variant="outline" size="lg">
                <TrendingUp className="mr-2 h-5 w-5" />
                Explore Products
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="text-center p-6 rounded-xl enhanced-card">
            <div className="text-3xl font-bold text-primary mb-2">$2.4M</div>
            <div className="text-sm text-muted-foreground">Total Funded</div>
          </div>
          <div className="text-center p-6 rounded-xl enhanced-card">
            <div className="text-3xl font-bold text-primary mb-2">1,247</div>
            <div className="text-sm text-muted-foreground">
              Products Launched
            </div>
          </div>
          <div className="text-center p-6 rounded-xl enhanced-card">
            <div className="text-3xl font-bold text-primary mb-2">15.8K</div>
            <div className="text-sm text-muted-foreground">
              NFT Receipts Minted
            </div>
          </div>
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
