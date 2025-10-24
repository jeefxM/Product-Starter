"use client";

import { ConnectWalletButton } from "@/components/ui/connect-wallet-button";
import { Button } from "@/components/ui/button";
import { Plus, Home, User, TrendingUp, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "Discover", href: "/", icon: Home },
    { name: "Create", href: "/create", icon: Plus },
    { name: "Dashboard", href: "/dashboard", icon: User },
  ];

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-background/80 border-b border-border supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex h-16 lg:h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" prefetch className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="h-10 w-10 lg:h-12 lg:w-12 rounded-2xl bg-gradient-to-br from-blue-600 to-teal-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <span className="text-white font-bold text-lg lg:text-xl">
                  PS
                </span>
              </div>
              <div className="absolute -inset-1 bg-gradient-to-br from-blue-600 to-teal-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl lg:text-2xl bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                ProductStarter
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 -mt-1 hidden lg:block">
                Crowdfund Products
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  prefetch
                  className={cn(
                    "flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 group",
                    isActive
                      ? "bg-primary/10 text-primary shadow-lg"
                      : "text-foreground/70 hover:text-primary hover:bg-muted"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 transition-transform duration-300",
                      isActive ? "text-primary" : "group-hover:scale-110"
                    )}
                  />
                  <span>{item.name}</span>
                  {isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-3">
            <ConnectWalletButton compact />
          </div>
        </div>

        {/* Mobile Navigation */}
        {/* No top hamburger/menu on mobile; bottom nav is used */}
      </div>
    </header>
  );
}
