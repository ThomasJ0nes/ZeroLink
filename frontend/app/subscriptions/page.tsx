"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BNB, Ethereum, Polygon } from "@/public/icons/Icons";
import { useContracts } from "@/util/useContracts"; // Import the updated hook
import { useWeb3Auth } from "@/context/Web3AuthContext"; // Import to check wallet connection

type Subscription = {
  id: number;
  user: string;
  serviceProvider: string;
  amount: string;
  interval: string;
  nextPaymentDate: string;
  name: string;
  description: string;
  price: string;
  frequency: string;
  image: string;
  chains: string[];
  category: string;
};

export default function Component() {
  const { fetchAllSubscriptions } = useContracts();
  const { provider, loggedIn, login, initializing } = useWeb3Auth(); // Access provider and login status
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [selectedSubscription, setSelectedSubscription] =
    useState<Subscription | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceRange, setPriceRange] = useState("All");

  useEffect(() => {
    // Only fetch subscriptions if the wallet is connected and provider is available
    const loadSubscriptions = async () => {
      if (loggedIn && provider) {
        try {
          const subs = await fetchAllSubscriptions();
          setSubscriptions(subs);
        } catch (error) {
          console.error("Failed to load subscriptions:", error);
        }
      }
    };

    loadSubscriptions();
  }, [loggedIn, provider]); // Dependency array checks for wallet connection status

  // Extract categories dynamically from subscriptions
  const categories = [
    "All",
    ...new Set(subscriptions.map((sub) => sub.category)),
  ];

  const filteredSubscriptions = subscriptions.filter((sub) => {
    const price = parseFloat(sub.price.replace("$", "")); // Convert price to a number for comparison

    return (
      sub.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedCategory === "All" || sub.category === selectedCategory) &&
      (priceRange === "All" ||
        (priceRange === "Under $5" && price < 5) ||
        (priceRange === "$5 - $10" && price >= 5 && price <= 10) ||
        (priceRange === "Over $10" && price > 10))
    );
  });

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <section className="py-12 px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">
            Pay for Subscriptions on any Chain from any Chain
          </h1>
          <p className="text-xl mb-8">
            Pay for subscriptions on your preferred chain regardless if the
            subscriptions exist on a different chain.
          </p>
          {!loggedIn ? (
            <Button size="lg" onClick={login}>
              Connect Wallet / Sign Up
            </Button>
          ) : (
            <Button size="lg">Wallet Connected</Button>
          )}
        </section>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8 grid gap-4 md:grid-cols-4">
            <Input
              placeholder="Search subscriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="md:col-span-2"
            />
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger>
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Prices</SelectItem>
                <SelectItem value="Under $5">Under $5</SelectItem>
                <SelectItem value="$5 - $10">$5 - $10</SelectItem>
                <SelectItem value="Over $10">Over $10</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredSubscriptions.map((subscription) => (
              <Card key={subscription.id}>
                <CardHeader>
                  <img
                    alt={subscription.name}
                    className="w-full h-32 object-cover mb-4"
                    height="128"
                    src={subscription.image}
                    style={{ aspectRatio: "200/100", objectFit: "cover" }}
                    width="200"
                  />
                  <CardTitle>{subscription.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 mb-2">
                    {subscription.description}
                  </p>
                  <p className="font-bold">
                    {subscription.price}/{subscription.frequency}
                  </p>
                  <p className="text-sm text-gray-500 mb-2">
                    Payment Interval: {subscription.interval}
                  </p>
                  <div className="flex space-x-2 mt-2">
                    {subscription.chains.map((chain: string) => (
                      <span
                        key={chain}
                        className="inline-flex items-center bg-gray-200 rounded-full px-2 py-1 text-xs font-semibold text-gray-700"
                      >
                        {chain === "Ethereum" && (
                          <Ethereum className="w-4 h-4 mr-1" />
                        )}
                        {chain === "Polygon" && (
                          <Polygon className="w-4 h-4 mr-1" />
                        )}
                        {chain}
                      </span>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        className="w-full"
                        onClick={() => setSelectedSubscription(subscription)}
                      >
                        Subscribe
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-white">
                      <DialogHeader>
                        <DialogTitle>{selectedSubscription?.name}</DialogTitle>
                        <DialogDescription>
                          {selectedSubscription?.description}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="mt-4">
                        <p className="font-bold mb-2">
                          {selectedSubscription?.price}/
                          {selectedSubscription?.frequency}
                        </p>
                        <p className="text-sm text-gray-500 mb-2">
                          Interval: {selectedSubscription?.interval}
                        </p>
                        <p className="mb-2">Available payment chains:</p>
                        <div className="flex space-x-2">
                          {selectedSubscription?.chains.map((chain: string) => (
                            <span
                              key={chain}
                              className="inline-flex items-center bg-gray-200 rounded-full px-2 py-1 text-xs font-semibold text-gray-700"
                            >
                              {chain === "Ethereum" && (
                                <Ethereum className="w-4 h-4 mr-1" />
                              )}
                              {chain === "Polygon" && (
                                <Polygon className="w-4 h-4 mr-1" />
                              )}
                              {chain === "Binance" && (
                                <BNB className="w-4 h-4 mr-1" />
                              )}
                              {chain}
                            </span>
                          ))}
                        </div>
                      </div>
                      <Button className="mt-4 w-full">
                        Confirm Subscription
                      </Button>
                    </DialogContent>
                  </Dialog>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
