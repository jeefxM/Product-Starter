import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Rocket, Zap, Shield } from "lucide-react";
import Link from "next/link";
import { CreateCampaignForm } from "@/components/campaigns/create-campaign-form";

export default function CreateCampaignPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
        </div>

        {/* Animated Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/5 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative container py-12 lg:py-20">
          {/* Breadcrumb */}
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Campaigns
            </Link>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Header Section */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 backdrop-blur-sm border border-primary/20 rounded-full mb-6">
                <Rocket className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Campaign Creator</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                  Launch Your Product
                </span>
              </h1>

              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                Create a crowdfunding campaign and let supporters mint NFT receipts as proof of their early support
              </p>

              {/* Features */}
              <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span>Instant Deployment</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>Secure Smart Contracts</span>
                </div>
                <div className="flex items-center gap-2">
                  <Rocket className="w-4 h-4 text-purple-500" />
                  <span>NFT Receipts</span>
                </div>
              </div>
            </div>

            {/* Form Section */}
            <div className="bg-card/80 backdrop-blur-sm border-2 border-primary/20 rounded-2xl shadow-xl p-8 lg:p-12">
              <CreateCampaignForm />
            </div>

            {/* Help Section */}
            <div className="mt-12 text-center">
              <p className="text-muted-foreground mb-4">
                Need help launching your campaign?
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="outline" className="group">
                  <Rocket className="w-4 h-4 mr-2 transition-transform group-hover:scale-110" />
                  View Guide
                </Button>
                <Button variant="outline" className="group">
                  <Shield className="w-4 h-4 mr-2 transition-transform group-hover:scale-110" />
                  Get Support
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <MobileNav />
    </div>
  );
}
