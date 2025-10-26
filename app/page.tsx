"use client";

import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { CampaignGrid } from "@/components/campaigns/campaign-grid";
import { SearchFilters } from "@/components/campaigns/search-filters";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, TrendingUp, Filter } from "lucide-react";
import Link from "next/link";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const { setFrameReady, isFrameReady } = useMiniKit();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-6 pb-24 md:pb-10">
        {/* Simple Header with CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              ProductStarter
            </h1>
            <p className="text-muted-foreground">
              An innovation discovery platform
            </p>
          </div>
          <Link href="/create">
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              <Plus className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
              Launch Product
            </Button>
          </Link>
        </div>

        {/* Campaigns Section */}
        <section className="space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {(searchTerm || selectedCategory || selectedStatus) && (
                <Badge variant="outline" className="text-sm px-3 py-1.5">
                  <Filter className="w-3 h-3 mr-1" />
                  {searchTerm && `Search: "${searchTerm}"`}
                  {searchTerm && selectedCategory && " • "}
                  {selectedCategory && `Category: ${selectedCategory}`}
                  {(searchTerm || selectedCategory) && selectedStatus && " • "}
                  {selectedStatus && `Status: ${selectedStatus}`}
                </Badge>
              )}
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mb-6">
            <SearchFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
            />
          </div>

          {/* Campaign Grid */}
          <CampaignGrid
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
          />
        </section>
      </main>

      <MobileNav />
    </div>
  );
}
