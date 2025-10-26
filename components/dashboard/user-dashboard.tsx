"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  Users,
  Target,
  Clock,
  ExternalLink,
  Plus,
  Wallet,
  Trophy,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Coins,
  Calendar,
  Eye,
  Zap,
  Shield,
  Sparkles,
  Activity,
  Gift,
  Rocket,
  BarChart3,
  PieChart,
  Settings,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Stats = {
  totalSupported: number;
  totalSpent: string;
  campaignsCreated: number;
  totalRaised: string;
  nftCount: number;
  portfolioValue: string;
};

type Supported = {
  id: string;
  name: string;
  image: string;
  pricePaid: string;
  tokenId: string;
  status: string;
  currentValue: string;
  supportDate: string;
  priceChange: string;
};

type Created = {
  id: string;
  name: string;
  image: string;
  supporters: number;
  minRequired: number;
  totalRaised: string;
  status: string;
  endDate: Date;
};

async function fetchDashboard(address: string) {
  const res = await fetch(`/api/user-dashboard?address=${address}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load dashboard");
  return (await res.json()) as {
    userStats: Stats;
    supportedCampaigns: Supported[];
    createdCampaigns: Array<Omit<Created, "endDate"> & { endDate: string }>;
  };
}

export function UserDashboard() {
  const { address } = useAccount();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [supported, setSupported] = useState<Supported[]>([]);
  const [created, setCreated] = useState<Created[]>([]);

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      if (!address) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await fetchDashboard(address);
        if (!isMounted) return;
        setStats(data.userStats);
        setSupported(data.supportedCampaigns);
        const mapped = data.createdCampaigns.map((c) => ({
          id: c.id,
          name: c.name,
          image: c.image,
          supporters: c.supporters,
          minRequired: c.minRequired,
          totalRaised: c.totalRaised,
          status: c.status,
          endDate: new Date(c.endDate),
        }));
        setCreated(mapped);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    run();
    return () => {
      isMounted = false;
    };
  }, [address]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 rounded-2xl p-6 sm:p-8 lg:p-10 border border-primary/10">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold">
                  <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                    Dashboard
                  </span>
                </h1>
                <p className="text-muted-foreground">
                  Manage your campaigns and NFT receipts
                </p>
              </div>
            </div>

            {/* User Info */}
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12 border-2 border-primary/20">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {address ? address.slice(2, 4).toUpperCase() : "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">
                  {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Connect Wallet"}
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="w-3 h-3" />
                  <span>Verified Creator</span>
                </div>
              </div>
            </div>
          </div>

          <Link href="/create">
            <Button className="h-12 px-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group">
              <Rocket className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
              Create Product
              <ArrowUpRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 pt-2">
        <Card className="group bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <Badge variant="outline" className="text-xs border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400">
                <TrendingUp className="w-3 h-3 mr-1" />
                +12%
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Supported</p>
              <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                {stats?.totalSupported ?? 0}
              </p>
              <p className="text-xs text-muted-foreground">+2 this month</p>
            </div>
          </CardContent>
        </Card>

        <Card className="group bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-800/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Wallet className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <Badge variant="outline" className="text-xs border-green-200 dark:border-green-800 text-green-600 dark:text-green-400">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                +8%
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-green-600 dark:text-green-400">Total Spent</p>
              <p className="text-3xl font-bold text-green-900 dark:text-green-100">
                {stats?.totalSpent ?? "0"}
              </p>
              <p className="text-xs text-muted-foreground">
                {stats?.totalSpent && "~ $" + (parseFloat(stats.totalSpent) * 2000).toFixed(0) + " USD"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="group bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-pink-800/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <Badge variant="outline" className="text-xs border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400">
                <Zap className="w-3 h-3 mr-1" />
                Active
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Products Created</p>
              <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                {stats?.campaignsCreated ?? 0}
              </p>
              <p className="text-xs text-muted-foreground">1 active campaign</p>
            </div>
          </CardContent>
        </Card>

        <Card className="group bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20 border-orange-200 dark:border-orange-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-900/30 dark:to-amber-800/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Trophy className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <Badge variant="outline" className="text-xs border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                +31%
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Portfolio Value</p>
              <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                {stats?.portfolioValue ?? "0"}
              </p>
              <p className="text-xs text-muted-foreground">
                +31.2% this month
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

    {/* Enhanced Tabs */}
      <div className="pt-4">
        <Tabs defaultValue="supported" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-muted/50 backdrop-blur-sm p-1 rounded-2xl border border-border/50 max-w-md mx-auto">
          <TabsTrigger
            value="supported"
            className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-lg transition-all duration-300 font-medium"
          >
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              <span>NFT Receipts</span>
            </div>
          </TabsTrigger>
          <TabsTrigger
            value="created"
            className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-lg transition-all duration-300 font-medium"
          >
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              <span>Created</span>
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="supported" className="space-y-6 mt-8">
          <Card className="border-2 border-primary/10 hover:border-primary/20 transition-all duration-300">
            <CardHeader className="pb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                    <Star className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold">
                      NFT Receipt Collection
                    </CardTitle>
                    <CardDescription className="text-base">
                      Your proof-of-support NFTs from backed campaigns
                    </CardDescription>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  <Sparkles className="w-3 h-3 mr-1" />
                  {supported.length} Receipts
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                // Loading Skeletons
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="flex items-center justify-between p-6 rounded-xl bg-muted/50">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-muted rounded-xl" />
                          <div className="space-y-2">
                            <div className="h-4 w-32 bg-muted rounded" />
                            <div className="h-3 w-24 bg-muted rounded" />
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <div className="h-8 w-20 bg-muted rounded" />
                          <div className="h-8 w-20 bg-muted rounded" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : supported.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No NFT Receipts Yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Start supporting campaigns to collect unique NFT receipts!
                  </p>
                  <Link href="/">
                    <Button>
                      <Zap className="w-4 h-4 mr-2" />
                      Discover Campaigns
                    </Button>
                  </Link>
                </div>
              ) : (
                supported.map((campaign) => (
                  <div
                    key={campaign.id}
                    className="group p-6 rounded-2xl bg-gradient-to-r from-muted/50 to-background hover:from-primary/5 hover:to-primary/10 border border-border/50 hover:border-primary/20 transition-all duration-300 hover:shadow-lg"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
                      <div className="flex items-center space-x-4">
                        <div className="relative group-hover:scale-105 transition-transform duration-300">
                          <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded-xl overflow-hidden shadow-lg">
                            <Image
                              src={campaign.image}
                              alt={campaign.name}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="absolute -top-1 -right-1">
                            <Badge
                              className={cn(
                                "text-xs px-2 py-1 font-semibold border",
                                campaign.status === "active"
                                  ? "bg-green-100 text-green-800 border-green-200"
                                  : "bg-gray-100 text-gray-800 border-gray-200"
                              )}
                            >
                              {campaign.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                            {campaign.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            NFT #{campaign.tokenId}
                          </p>
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            <span>
                              {format(new Date(campaign.supportDate), "MMM dd, yyyy")}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-6">
                        <div className="text-center sm:text-right">
                          <p className="text-sm text-muted-foreground mb-1">Purchase Price</p>
                          <p className="font-bold text-lg">
                            {campaign.pricePaid} {campaign.pricePaid.includes('ETH') ? '' : 'ETH'}
                          </p>
                        </div>
                        <div className="text-center sm:text-right">
                          <p className="text-sm text-muted-foreground mb-1">
                            Current Value
                          </p>
                          <div className="flex flex-col sm:flex-row items-center sm:items-center space-y-1 sm:space-x-2">
                            <p className={cn(
                              "font-bold text-lg",
                              campaign.priceChange?.startsWith('+')
                                ? "text-emerald-600"
                                : campaign.priceChange?.startsWith('-')
                                ? "text-red-600"
                                : "text-muted-foreground"
                            )}>
                              {campaign.currentValue} {campaign.currentValue.includes('ETH') ? '' : 'ETH'}
                            </p>
                            <Badge
                              className={cn(
                                "text-xs px-2 py-1",
                                campaign.priceChange?.startsWith('+')
                                  ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                  : campaign.priceChange?.startsWith('-')
                                  ? "bg-red-100 text-red-700 border-red-200"
                                  : "bg-muted/50 text-muted-700 border-muted"
                              )}
                            >
                              {campaign.priceChange}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="hover:bg-primary/10 group transition-all duration-300"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white transition-all duration-300 group"
                          >
                            <Gift className="w-4 h-4 mr-1" />
                            Trade
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="created" className="space-y-6 mt-8">
          <Card className="border-2 border-primary/10 hover:border-primary/20 transition-all duration-300">
            <CardHeader className="pb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 flex items-center justify-center">
                    <Target className="w-7 h-7 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold">
                      Created Products
                    </CardTitle>
                    <CardDescription className="text-base">
                      Products you've launched and their current performance
                    </CardDescription>
                  </div>
                </div>
                <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                  <Rocket className="w-3 h-3 mr-1" />
                  {created.length} Products
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                // Loading Skeletons
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="p-6 rounded-xl bg-muted/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-muted rounded-xl" />
                            <div className="space-y-2">
                              <div className="h-5 w-40 bg-muted rounded" />
                              <div className="h-4 w-32 bg-muted rounded" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="h-4 w-20 bg-muted rounded" />
                            <div className="h-8 w-16 bg-muted rounded" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : created.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Rocket className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No Products Created Yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Launch your first product and start your crowdfunding journey!
                  </p>
                  <Link href="/create">
                    <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Product
                    </Button>
                  </Link>
                </div>
              ) : (
                created.map((campaign) => (
                  <div
                    key={campaign.id}
                    className="p-6 rounded-2xl bg-gradient-to-r from-muted/50 to-background hover:from-purple-500/5 hover:to-purple-500/10 border border-border/50 hover:border-purple-500/20 transition-all duration-300 hover:shadow-lg"
                  >
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-6 lg:space-y-0">
                      <div className="flex items-center space-x-6">
                        <div className="relative group-hover:scale-105 transition-transform duration-300">
                          <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-2xl overflow-hidden shadow-lg">
                            <Image
                              src={campaign.image}
                              alt={campaign.name}
                              width={80}
                              height={80}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="absolute -top-2 -right-2">
                            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-lg">
                              {campaign.status === "active" ? "Active" : campaign.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex-1 space-y-4">
                          <div>
                            <h3 className="font-bold text-xl mb-2 group-hover:text-purple-600 transition-colors">
                              {campaign.name}
                            </h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div className="flex items-center space-x-2">
                                <Users className="w-4 h-4 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                  {campaign.supporters}/{campaign.minRequired} supporters
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Coins className="w-4 h-4 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                  {campaign.totalRaised} raised
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Progress Section */}
                          <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Campaign Progress</span>
                              <span className="font-medium">
                                {Math.round((campaign.supporters / campaign.minRequired) * 100)}%
                              </span>
                            </div>
                            <Progress
                              value={(campaign.supporters / campaign.minRequired) * 100}
                              className="h-3"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>{campaign.supporters} supporters</span>
                              <span>{campaign.minRequired} goal</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                        <div className="text-center sm:text-right">
                          <Badge
                            variant="outline"
                            className={cn(
                              "mb-3 font-semibold",
                              campaign.endDate.getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000
                                ? "border-orange-200 bg-orange-50 text-orange-700"
                                : "border-gray-200 bg-gray-50 text-gray-700"
                            )}
                          >
                            <Clock className="w-3 h-3 mr-1 inline" />
                            {Math.ceil(
                              (campaign.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                            )}{" "}
                            days left
                          </Badge>
                          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                            <Button variant="outline" size="sm" className="w-full sm:w-auto">
                              <ExternalLink className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            <Button size="sm" className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white">
                              <Settings className="w-4 h-4 mr-1" />
                              Manage
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
