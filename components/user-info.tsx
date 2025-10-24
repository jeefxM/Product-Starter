"use client";

import { useAccount, useBalance, useEnsName } from "wagmi";
import { usePrivy } from "@privy-io/react-auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Wallet,
  Mail,
  User,
  Coins,
  ExternalLink,
  Copy,
  Zap,
  Shield,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

export function UserInfo() {
  const { authenticated, user } = usePrivy();
  const { address, isConnected, connector } = useAccount();
  const { data: balance } = useBalance({ address });
  const { data: ensName } = useEnsName({ address });

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast.success("Address copied to clipboard!");
    }
  };

  if (!authenticated || !isConnected) {
    return (
      <Card className="border-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl shadow-xl group hover:shadow-2xl transition-all duration-300">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 p-4 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-2xl w-fit">
            <User className="w-8 h-8 text-gray-500 dark:text-gray-400" />
          </div>
          <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Connect Your Wallet
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Connect your wallet to see detailed information about your account
            and transactions
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 rounded-xl">
            <p className="text-sm text-center text-gray-600 dark:text-gray-400">
              Use the "Connect Wallet" button in the header to get started
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl shadow-xl group hover:shadow-2xl transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse"></div>
          </div>
          <div>
            <CardTitle className="text-xl font-bold gradient-text">
              Connected Account
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Wallet & user information
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* User Information Section */}
        {user && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
              <Shield className="w-4 h-4 text-indigo-500" />
              <span>Privy Account</span>
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
                    <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      User ID
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Unique identifier
                    </p>
                  </div>
                </div>
                <Badge variant="secondary" className="font-mono text-xs">
                  {user.id?.slice(0, 8)}...
                </Badge>
              </div>

              {user.email && (
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                      <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Email
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Verified account
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    {user.email.address}
                  </p>
                </div>
              )}

              {user.phone && (
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                      <Zap className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Phone
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        SMS verified
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    {user.phone.number}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Wallet Information Section */}
        <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
            <Wallet className="w-4 h-4 text-purple-500" />
            <span>Wallet Details</span>
          </h3>

          <div className="space-y-3">
            <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 rounded-xl border border-indigo-100 dark:border-indigo-800">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Wallet Address
                </p>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyAddress}
                    className="h-7 w-7 p-0 hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 hover:bg-purple-100 dark:hover:bg-purple-900/50"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <p className="text-xs font-mono bg-white dark:bg-gray-800 p-2 rounded border break-all">
                {address}
              </p>
            </div>

            {ensName && (
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg">
                    <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      ENS Name
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Ethereum Name Service
                    </p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className="bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400"
                >
                  {ensName}
                </Badge>
              </div>
            )}

            {connector && (
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
                    <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Connector
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Wallet provider
                    </p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className="bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400"
                >
                  {connector.name}
                </Badge>
              </div>
            )}

            {balance && (
              <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/50 dark:to-green-950/50 rounded-xl border border-emerald-100 dark:border-emerald-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-emerald-500 rounded-lg">
                      <Coins className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Balance
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Current wallet balance
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                      {parseFloat(balance.formatted).toFixed(4)}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                      {balance.symbol}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Connected Wallets from Privy */}
        {user?.linkedAccounts &&
          user.linkedAccounts.filter((account) => account.type === "wallet")
            .length > 0 && (
            <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
                <Clock className="w-4 h-4 text-orange-500" />
                <span>Linked Wallets</span>
              </h3>
              <div className="space-y-2">
                {user.linkedAccounts
                  .filter((account) => account.type === "wallet")
                  .map((wallet, index) => (
                    <div
                      key={index}
                      className="p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl"
                    >
                      <p className="text-xs font-mono text-gray-600 dark:text-gray-400 break-all">
                        {wallet.address}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}
      </CardContent>
    </Card>
  );
}
