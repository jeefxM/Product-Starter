"use client";

import { useLogin, usePrivy, useLogout } from "@privy-io/react-auth";
import { useAccount, useDisconnect, useSwitchChain } from "wagmi";
import { Button } from "@/components/ui/button";
import {
  Wallet,
  LogOut,
  User,
  ChevronDown,
  Copy,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

export function ConnectWalletButton({
  compact = false,
}: {
  compact?: boolean;
}) {
  const { login } = useLogin();
  const { logout } = useLogout();
  const { ready, authenticated, user } = usePrivy();
  const { address, isConnected, chainId } = useAccount();
  const { switchChain } = useSwitchChain();

  // Show loading state while Privy is initializing
  if (!ready) {
    return compact ? (
      <div className="w-9 h-9 rounded-full skeleton" />
    ) : (
      <Button
        disabled
        className="relative overflow-hidden bg-gray-100 dark:bg-gray-800 text-gray-400"
      >
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin"></div>
          <span>Loading...</span>
        </div>
      </Button>
    );
  }

  // If not authenticated, show connect button
  if (!authenticated) {
    return compact ? (
      <Button
        onClick={login}
        size="icon"
        className="rounded-full btn-gradient"
        aria-label="Connect Wallet"
      >
        <Wallet className="w-4 h-4" />
      </Button>
    ) : (
      <Button
        onClick={login}
        className="relative overflow-hidden bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 border-0 group"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="relative flex items-center space-x-2">
          <Wallet className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
          <span>Connect Wallet</span>
        </div>
      </Button>
    );
  }

  // Format address for display
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast.success("Address copied to clipboard!");
    }
  };

  const switchToSepolia = async () => {
    try {
      await switchChain({ chainId: 11155111 }); // Ethereum Sepolia
      toast.success("Switched to Ethereum Sepolia!");
    } catch (error) {
      console.error("Error switching chain:", error);
      toast.error(
        "Failed to switch chain. Please switch manually in your wallet."
      );
    }
  };

  const getChainName = (chainId: number) => {
    switch (chainId) {
      case 11155111:
        return "Ethereum Sepolia";
      case 84532:
        return "Base Sepolia";
      default:
        return `Chain ${chainId}`;
    }
  };

  // Show connected state with user menu
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {compact ? (
          <button
            aria-label="Open account menu"
            className="relative inline-flex items-center justify-center w-10 h-10 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
          >
            <div className="relative">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-teal-600 text-white">
                  <User className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
            </div>
          </button>
        ) : (
          <Button
            variant="outline"
            className="relative overflow-hidden bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 border-indigo-200 dark:border-indigo-800 hover:from-indigo-100 hover:to-purple-100 dark:hover:from-indigo-900/50 dark:hover:to-purple-900/50 transition-all duration-300 shadow-sm hover:shadow-md group"
          >
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Avatar className="w-7 h-7 ring-2 ring-blue-200 dark:ring-blue-800">
                  <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-teal-500 text-white">
                    <User className="w-3 h-3" />
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse"></div>
              </div>
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {address
                    ? formatAddress(address)
                    : user?.email?.address || "Connected"}
                </span>
                {user?.email && address && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {user.email.address}
                  </span>
                )}
              </div>
              <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-indigo-500 transition-colors duration-300" />
            </div>
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-64 p-2 bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl border-gray-200/50 dark:border-gray-800/50 shadow-xl text-gray-900 dark:text-gray-100"
      >
        <div className="px-3 py-3 bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-950/50 dark:to-teal-950/50 rounded-lg mb-2">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10 ring-2 ring-blue-200 dark:ring-blue-800">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-teal-500 text-white">
                <User className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Account
              </p>
              {address && (
                <p className="text-xs text-gray-600 dark:text-gray-400 font-mono truncate">
                  {address}
                </p>
              )}
              {user?.email && (
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user.email.address}
                </p>
              )}
            </div>
          </div>
        </div>

        {address && (
          <>
            <DropdownMenuItem
              onClick={copyAddress}
              className="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
            >
              <Copy className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              <span className="text-sm dark:text-gray-100">Copy Address</span>
            </DropdownMenuItem>

            <DropdownMenuItem className="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors">
              <ExternalLink className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              <span className="text-sm dark:text-gray-100">
                View on Explorer
              </span>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="my-2 bg-gray-200 dark:bg-gray-800" />
          </>
        )}

        {/* Chain Information and Switch */}
        {isConnected && chainId && (
          <>
            <div className="px-3 py-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg mb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      chainId === 11155111 ? "bg-green-500" : "bg-orange-500"
                    }`}
                  ></div>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {getChainName(chainId)}
                  </span>
                </div>
                {chainId !== 11155111 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={switchToSepolia}
                    className="h-6 px-2 text-xs bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/50 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Switch
                  </Button>
                )}
              </div>
            </div>
          </>
        )}

        <DropdownMenuItem
          onClick={logout}
          className="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 cursor-pointer transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-medium">Disconnect</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
