import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { CreateCampaignForm } from "@/components/campaigns/create-campaign-form";

export default function CreateCampaignPage() {
  return (
    <div className="min-h-screen">
      <Header />

      <main className="container py-6 pb-24 md:pb-10">
        <div className="max-w-2xl mx-auto">
          <Card className="enhanced-card">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                Launch Your Product
              </CardTitle>
              <CardDescription className="text-lg">
                Create a crowdfunding campaign and let supporters mint NFT
                receipts as proof of their early support
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CreateCampaignForm />
            </CardContent>
          </Card>
        </div>
      </main>

      <MobileNav />
    </div>
  );
}
