"use client";

import React, { useState } from "react";

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
import Navbar from "@/components/navbar";

export default function Component() {
  const [activeChain, setActiveChain] = useState("Sepolia");
  const [showNotifications, setShowNotifications] = useState(false);
  const [activePage, setActivePage] = useState("dashboard");

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
                      <TableRow>
                        <TableCell>Netflix</TableCell>
                        <TableCell>$14.99</TableCell>
                        <TableCell>2023-07-15</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                            Active
                          </span>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Spotify</TableCell>
                        <TableCell>$9.99</TableCell>
                        <TableCell>2023-07-20</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                            Pending
                          </span>
                        </TableCell>
                      </TableRow>
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
    <>
      <Navbar />
      <TooltipProvider>
        <div className="flex h-screen bg-gray-100">
          {/* Icon Sidebar */}
          <aside
            className={`bg-white shadow-md transition-all duration-300 ease-in-out`}
          >
            <div className="flex flex-col h-full">
              <div className="p-4"></div>
              <nav className="flex-1 px-2 py-4 space-y-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={
                        activePage === "dashboard" ? "secondary" : "ghost"
                      }
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
                      variant={
                        activePage === "subscriptions" ? "secondary" : "ghost"
                      }
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
                      variant={
                        activePage === "settings" ? "secondary" : "ghost"
                      }
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
                      <DropdownMenuItem>
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
                {renderContent()}
              </div>
            </main>
          </div>
        </div>
      </TooltipProvider>
    </>
  );
}
