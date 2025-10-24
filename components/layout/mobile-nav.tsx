"use client";

import { Button } from "@/components/ui/button";
import { Home, Plus, User, TrendingUp } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const pathname = usePathname();

  const navigation = [
    { name: "Discover", href: "/", icon: Home },
    { name: "Create", href: "/create", icon: Plus },
    { name: "Dashboard", href: "/dashboard", icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-t md:hidden">
      <div className="grid grid-cols-3 gap-1 p-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant={pathname === item.href ? "default" : "ghost"}
                size="lg"
                className={cn(
                  "w-full flex-col h-14 gap-1 rounded-xl",
                  pathname === item.href &&
                    "bg-primary text-primary-foreground shadow"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="text-xs">{item.name}</span>
              </Button>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
