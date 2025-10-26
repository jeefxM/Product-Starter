"use client";

import { ConnectWalletButton } from "@/components/ui/connect-wallet-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Home, User, TrendingUp, Zap, Shield, Star, Bell, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function Header() {
  const pathname = usePathname();

  const navigation = [
    {
      name: "Discover",
      href: "/",
      icon: Home,
      description: "Explore campaigns"
    },
    {
      name: "Create",
      href: "/create",
      icon: Plus,
      description: "Launch a product",
      badge: "New"
    },
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: User,
      description: "Your activity"
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-background/95 border-b border-border/50 supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex h-14 sm:h-16 lg:h-20 items-center justify-between">
          {/* Logo - Mobile Optimized */}
          <Link href="/" prefetch className="flex items-center space-x-2 sm:space-x-3 group">
            <div className="relative">
              <div className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 rounded-xl lg:rounded-2xl bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <span className="text-white font-bold text-sm sm:text-base lg:text-lg">
                  PS
                </span>
              </div>
              <div className="absolute -inset-1 bg-gradient-to-br from-primary to-primary/60 rounded-xl lg:rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
              {/* Glow effect */}
              <div className="absolute -inset-2 bg-gradient-to-br from-primary/20 to-transparent rounded-xl lg:rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg sm:text-xl lg:text-2xl bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                ProductStarter
              </span>
              <span className="text-xs text-muted-foreground -mt-0.5 hidden sm:block">
                Web3 Crowdfunding
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  prefetch
                  className={cn(
                    "flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-300 group relative",
                    isActive
                      ? "bg-primary/10 text-primary shadow-lg border border-primary/20"
                      : "text-foreground/70 hover:text-primary hover:bg-muted/50 hover:scale-105"
                  )}
                >
                  <div className="relative">
                    <Icon
                      className={cn(
                        "h-4 w-4 transition-all duration-300",
                        isActive
                          ? "text-primary scale-110"
                          : "group-hover:scale-110 group-hover:text-primary"
                      )}
                    />
                    {isActive && (
                      <div className="absolute -inset-1 bg-primary/20 rounded-full animate-pulse"></div>
                    )}
                  </div>
                  <span>{item.name}</span>
                  {item.badge && (
                    <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 text-xs px-2 py-0.5 shadow-lg">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right side - Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Desktop Actions */}
            <div className="hidden sm:flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 rounded-lg hover:bg-primary/10 transition-all duration-300 group"
              >
                <Bell className="h-4 w-4 transition-transform group-hover:scale-110" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 rounded-lg hover:bg-primary/10 transition-all duration-300 group"
              >
                <Settings className="h-4 w-4 transition-transform group-hover:scale-110" />
              </Button>
            </div>

            {/* Wallet Button */}
            <ConnectWalletButton compact />
          </div>
        </div>

        {/* Mobile Navigation Hints */}
        <div className="hidden sm:block border-t border-border/30 px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Shield className="w-3 h-3" />
              <span className="hidden sm:inline">Secure Platform</span>
              <Star className="w-3 h-3" />
              <span className="hidden sm:inline">NFT Receipts</span>
            </div>
            <div className="flex items-center space-x-1">
              <Badge className="text-xs bg-green-500/10 text-green-600 border-green-500/20">
                <Zap className="w-3 h-3 mr-1" />
                Live
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
