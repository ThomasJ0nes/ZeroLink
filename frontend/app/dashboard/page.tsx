"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useWeb3Auth } from "@/context/Web3AuthContext";
import { Loader } from "lucide-react";
import { useContracts } from "@/util/useContracts";
import { ManageSubscriptions } from "./sections/ManageSubscriptions";

import {
  Bell,
  ChevronDown,
  Clock,
  History,
  Home,
  LogOut,
  Settings,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Actions from "./sections/Actions";
import PaymentHistory from "./sections/PaymentHistory";
import UserSettings from "./sections/UserSettings";

// Define the type for a Subscription
type Subscription = {
  id: number;
  user: string;
  amount: number;
  serviceProviderName: string;
  nextPayment: Date;
};

export default function DashboardPage() {
  const { user, userAddress, getBalance, logout, checkAuthStatus, initializing } = useWeb3Auth();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { fetchSubscriptionsByUser } = useContracts();
  const router = useRouter();
  const [activePage, setActivePage] = useState("dashboard");
  const [activeChain, setActiveChain] = useState("Sepolia");
  const [showNotifications, setShowNotifications] = useState(false);
  const [balance, setBalance] = useState<string | null>(null);
  const [activeSubscriptions, setActiveSubscription] = useState<Subscription[]>([]);

  const handleGetActiveSubscriptions = useCallback(async () => {
    const subscriptions = await fetchSubscriptionsByUser();
    console.log(subscriptions);
    setActiveSubscription(subscriptions);
  }, [fetchSubscriptionsByUser]);

  useEffect(() => {
    const checkAuth = async () => {
      if (!initializing) {
        const isAuthenticated = await checkAuthStatus();
        if (!isAuthenticated) {
          router.push("/auth?authRequired=true");
        } else {
          getBalance().then(setBalance);
        }
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [checkAuthStatus, getBalance, router, initializing]);

  useEffect(() => {
    if (user) {
      handleGetActiveSubscriptions();
    }
  }, [user, handleGetActiveSubscriptions]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    setTimeout(() => {
      router.push("/");
    }, 0);
  };

  if (initializing || isCheckingAuth) {
    return (
        <p>
          Loading dashboard...{" "}
          <Loader className="ml-2 h-5 w-5 text-purple-600 inline animate-spin"/>
        </p>
    )
  }

  if (!user && !isLoggingOut) {
    router.push("/auth?authRequired=true");
    return null;
  }

  const renderContent = () => {
    switch (activePage) {
      case "dashboard":
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle>Overview</CardTitle>
                  <CardDescription>
                    Summary of your active subscriptions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Service Provider</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Next Payment</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeSubscriptions.map(subscription => (
                        <TableRow key={subscription.id}>
                          <TableCell>{subscription.serviceProviderName}</TableCell>
                          <TableCell>{subscription.amount}</TableCell>
                          <TableCell>{subscription.nextPaymentDate}</TableCell>
                          <TableCell>
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                            Active
                          </span>
                          </TableCell>
                        </TableRow>
                      ))}

                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    <li className="flex items-center space-x-3">
                      <span className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500"></span>
                      <span>Upcoming payment for Netflix on 2023-07-15</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <span className="flex-shrink-0 w-2 h-2 rounded-full bg-green-500"></span>
                      <span>Successful payment for Spotify on 2023-06-20</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
            <div className="mt-8">
              <Actions />
            </div>
          </>
        );
      case "subscriptions":
        return <ManageSubscriptions />;
      case "history":
        return <PaymentHistory />;
      case "settings":
        return <UserSettings />;
      default:
        return null;
    }
  };

  return (
    <TooltipProvider>
      <div className="flex h-screen bg-gray-100">
        {/* Icon Sidebar */}
        <aside className={`bg-white shadow-md transition-all duration-300 ease-in-out`}>
          <div className="flex flex-col h-full">
            <div className="p-4"></div>
            <nav className="flex-1 px-2 py-4 space-y-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                      variant={activePage === "dashboard" ? "secondary" : "ghost"}
                      size="icon"
                      className="w-full"
                      onClick={() => setActivePage("dashboard")}
                  >
                    <Home className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Dashboard</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                      variant={activePage === "subscriptions" ? "secondary" : "ghost"}
                      size="icon"
                      className="w-full"
                      onClick={() => setActivePage("subscriptions")}
                  >
                    <Clock className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Subscriptions</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                      variant={activePage === "history" ? "secondary" : "ghost"}
                      size="icon"
                      className="w-full"
                      onClick={() => setActivePage("history")}
                  >
                    <History className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>History</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                      variant={activePage === "settings" ? "secondary" : "ghost"}
                      size="icon"
                      className="w-full"
                      onClick={() => setActivePage("settings")}
                  >
                    <Settings className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Settings</p>
                </TooltipContent>
              </Tooltip>
            </nav>
          </div>
        </aside>
       {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className=" shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">
                ZeroLink Dashboard
              </h1>
              <div className="flex items-center space-x-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      {activeChain}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                        onSelect={() => setActiveChain("Sepolia")}
                    >
                      Sepolia
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onSelect={() => setActiveChain("Optimism")}
                    >
                      Optimism
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowNotifications(!showNotifications)}
                    >
                      <Bell className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Notifications</p>
                  </TooltipContent>
                </Tooltip>
                <DropdownMenu>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <User className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>User Menu</p>
                    </TooltipContent>
                  </Tooltip>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-x-hidden overflow-y-auto ">
            <div className="container mx-auto px-2 py-8">
              <div className="mb-8">
                <h2 className="text-xl font-semibold">Welcome, {user?.name}</h2>
                <p><strong>Your wallet address:</strong> {userAddress}</p>
                <p><strong>Balance:</strong> {balance ? `${balance} ETH` : "Loading..."}</p>
              </div>
              {renderContent()}
            </div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
