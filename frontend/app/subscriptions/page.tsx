"use client";
import * as React from "react";
import { useEffect, useState, useCallback } from "react";
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
import { Loader } from "lucide-react";
import { useContracts } from "@/util/useContracts"; // Import the updated hook
import { useWeb3Auth } from "@/context/Web3AuthContext"; // Import to check wallet connection
import NetworkSwitcherDropdown from "@/components/switchNetwork";

// Define the type for a Subscription
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
  const { fetchAllSubscriptions, subscribeToSubscription } = useContracts(); // Updated to include subscribeToSubscription
  const { provider, loggedIn, login, initializing, switchNetwork, getBalance } =
    useWeb3Auth(); // Access provider and login status
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [selectedSubscription, setSelectedSubscription] =
    useState<Subscription | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceRange, setPriceRange] = useState("All");
  const [loading, setLoading] = useState<boolean>(false); // Add loading state
  const [isSubscribing, setIsSubscribing] = useState<boolean>(false); // Add subscription loading state
  const [balance, setBalance] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch subscriptions if the wallet is connected and provider is available
    const loadSubscriptions = async () => {
      if (loggedIn && provider) {
        setLoading(true); // Set loading to true when fetch starts
        try {
          const subs = await fetchAllSubscriptions();
          setSubscriptions(subs);
        } catch (error) {
          console.error("Failed to load subscriptions:", error);
        } finally {
          setLoading(false); // Set loading to false when fetch completes
        }
      }
    };

    loadSubscriptions();
  }, [loggedIn, provider]); // Dependency array checks for wallet connection status

  const handleSubscribe = async () => {
    if (!selectedSubscription) return;

    try {
      setIsSubscribing(true);
      // Extract the price and remove any unwanted characters (like $)
      const priceInEther = selectedSubscription.price.replace("$", "").trim();

      // Call the subscribeToSubscription function in useContracts
      const result = await subscribeToSubscription(
        selectedSubscription.id,
        priceInEther,
        "optimismSepolia" // Replace with dynamic chain if necessary
      );

      if (result.success) {
        alert("Subscription successful!");
      }
    } catch (error) {
      console.error("Error subscribing:", error);
      alert("Subscription failed!");
    } finally {
      setIsSubscribing(false);
    }
  };

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
          {loading ? (
            <p>
              Loading subscriptions...{" "}
              <Loader className="ml-2 h-5 w-5 text-purple-600 inline animate-spin" />
            </p>
          ) : (
            <>
              <div className="mb-8 grid gap-4 md:grid-cols-4">
                <Input
                  placeholder="Search subscriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="md:col-span-2"
                />
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
                <NetworkSwitcherDropdown
                  onNetworkSwitch={() => getBalance().then(setBalance)}
                />
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {subscriptions.map((subscription) => (
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
                    </CardContent>
                    <CardFooter>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            className="w-full"
                            onClick={() =>
                              setSelectedSubscription(subscription)
                            }
                          >
                            Subscribe
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-white">
                          <DialogHeader>
                            <DialogTitle>
                              {selectedSubscription?.name}
                            </DialogTitle>
                            <DialogDescription>
                              {selectedSubscription?.description}
                            </DialogDescription>
                          </DialogHeader>
                          <Button
                            className="mt-4 w-full"
                            onClick={handleSubscribe}
                            disabled={isSubscribing}
                          >
                            {isSubscribing ? (
                              <Loader className="animate-spin h-5 w-5 mr-2" />
                            ) : (
                              "Confirm Subscription"
                            )}
                          </Button>
                        </DialogContent>
                      </Dialog>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
