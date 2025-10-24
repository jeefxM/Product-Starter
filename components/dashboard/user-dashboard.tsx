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
  Coins,
  Calendar,
  Eye,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";

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
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Manage your campaigns and NFT receipts
          </p>
        </div>
        <Link href="/create">
          <Button className="btn-gradient text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 border-0 group px-6 py-3">
            <div className="flex items-center space-x-2">
              <Plus className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              <span>Create Product</span>
            </div>
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-teal-600 border-0 text-white group hover:from-blue-700 hover:to-teal-700 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-blue-100 text-sm font-medium">
                  Total Supported
                </p>
                <p className="text-3xl font-bold text-white">
                  {stats?.totalSupported ?? 0}
                </p>
                <p className="text-blue-200 text-xs">+2 this month</p>
              </div>
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm group-hover:bg-white/30 transition-colors duration-300">
                <Users className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-teal-600 border-0 text-white group hover:from-blue-700 hover:to-teal-700 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-emerald-100 text-sm font-medium">
                  Total Spent
                </p>
                <p className="text-3xl font-bold text-white">
                  {stats?.totalSpent ?? "0"} ETH
                </p>
                <p className="text-emerald-200 text-xs">≈ $4,851 USD</p>
              </div>
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm group-hover:bg-white/30 transition-colors duration-300">
                <Wallet className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-teal-600 border-0 text-white group hover:from-blue-700 hover:to-teal-700 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-cyan-100 text-sm font-medium">
                  Products Created
                </p>
                <p className="text-3xl font-bold text-white">
                  {stats?.campaignsCreated ?? 0}
                </p>
                <p className="text-cyan-200 text-xs">1 active</p>
              </div>
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm group-hover:bg-white/30 transition-colors duration-300">
                <Target className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-teal-600 border-0 text-white group hover:from-blue-700 hover:to-teal-700 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-blue-100 text-sm font-medium">
                  Portfolio Value
                </p>
                <p className="text-3xl font-bold text-white">
                  {stats?.portfolioValue ?? "0"} ETH
                </p>
                <div className="flex items-center space-x-1">
                  <ArrowUpRight className="w-3 h-3 text-blue-200" />
                  <p className="text-blue-200 text-xs">+31.2%</p>
                </div>
              </div>
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm group-hover:bg-white/30 transition-colors duration-300">
                <Trophy className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="supported" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-muted p-1 rounded-xl">
          <TabsTrigger
            value="supported"
            className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-300"
          >
            My Supports
          </TabsTrigger>
          <TabsTrigger
            value="created"
            className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-300"
          >
            My Products
          </TabsTrigger>
        </TabsList>

        <TabsContent value="supported" className="space-y-6 mt-8">
          <Card className="enhanced-card">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-teal-500 rounded-xl">
                  <Star className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">
                    NFT Receipt Collection
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Your proof-of-support NFTs from backed campaigns
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {(loading ? [] : supported).map((campaign) => (
                <div
                  key={campaign.id}
                  className="group p-6 rounded-2xl bg-muted hover:bg-primary/5 transition-all duration-300 hover:shadow-lg"
                >
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded-xl overflow-hidden">
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
                            variant={
                              campaign.status === "active"
                                ? "default"
                                : "secondary"
                            }
                            className="text-xs px-2 py-0.5"
                          >
                            {campaign.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                          {campaign.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          NFT #{campaign.tokenId}
                        </p>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {format(new Date(campaign.supportDate), "MMM dd")}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-3 lg:space-y-0 lg:space-x-6">
                      <div className="text-center lg:text-right">
                        <p className="text-sm text-muted-foreground">Paid</p>
                        <p className="font-semibold">
                          {campaign.pricePaid} ETH
                        </p>
                      </div>
                      <div className="text-center lg:text-right">
                        <p className="text-sm text-muted-foreground">
                          Current Value
                        </p>
                        <div className="flex items-center space-x-2">
                          <p className="font-semibold text-emerald-600">
                            {campaign.currentValue} ETH
                          </p>
                          <Badge
                            variant="outline"
                            className="text-emerald-700 border-emerald-200 bg-emerald-50"
                          >
                            {campaign.priceChange}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="hover:bg-primary/10"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="hover:bg-primary/10"
                        >
                          Trade
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="created" className="space-y-6 mt-8">
          <Card className="enhanced-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                My Products
              </CardTitle>
              <CardDescription>
                Products you've created and their current status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(loading ? [] : created).map((campaign) => (
                <div
                  key={campaign.id}
                  className="p-6 rounded-2xl bg-muted hover:bg-primary/5 transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-secondary rounded-xl overflow-hidden">
                        <Image
                          src={campaign.image}
                          alt={campaign.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">
                          {campaign.name}
                        </h3>
                        <div className="flex items-center space-x-4 mt-2">
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {campaign.supporters}/{campaign.minRequired}{" "}
                              supporters
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Coins className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {campaign.totalRaised} ETH raised
                            </span>
                          </div>
                        </div>
                        <Progress
                          value={
                            (campaign.supporters / campaign.minRequired) * 100
                          }
                          className="w-64 mt-3"
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="mb-2">
                        {Math.ceil(
                          (campaign.endDate.getTime() - Date.now()) /
                            (1000 * 60 * 60 * 24)
                        )}{" "}
                        days left
                      </Badge>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <ExternalLink className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button size="sm">Edit</Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
