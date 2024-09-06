"use client";
import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useRouter } from "next/navigation";
import { useContracts } from "@/util/useContracts";
import { useWeb3Auth } from "@/context/Web3AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Wallet, Clock, HandCoins, Loader } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Define blockchain options according to the `Types.Blockchain` enum in Solidity
const blockchainOptions = {
  BaseSepolia: 0,
  OP_Sepolia: 1,
};

const CreateSubscription: React.FC = () => {
  const { initializing, loggedIn, login, provider, checkAuthStatus } = useWeb3Auth();
  const [serviceProviderName, setServiceProviderName] = useState<string>("");
  const [serviceProviderAddress, setServiceProviderAddress] =
    useState<string>("");
  const [ethAmount, setEthAmount] = useState<string>("");
  const [intervalValue, setIntervalValue] = useState("1");
  const [intervalUnit, setIntervalUnit] = useState("days");
  const [customInterval, setCustomInterval] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [preferredBlockchain, setPreferredBlockchain] = useState<number>(
    blockchainOptions.BaseSepolia
  );
  const { getSubscriptionManagerContract } = useContracts();

  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  useEffect(() => {
    const checkAuth = async () => {
      if (!initializing) {
        const isAuthenticated = await checkAuthStatus();
        if (!isAuthenticated) {
          router.push("/auth?authRequired=true");
        }
        setIsCheckingAuth(false);
      }
    };
    checkAuth();
  }, [checkAuthStatus, initializing, router]);


  const calculateSeconds = () => {
    const value = parseInt(intervalValue);
    switch (intervalUnit) {
      case "seconds":
        return value;
      case "minutes":
        return value * 60;
      case "hours":
        return value * 3600;
      case "days":
        return value * 86400;
      case "weeks":
        return value * 604800;
      case "months":
        return value * 2592000; // Assuming 30 days per month
      default:
        return value;
    }
  };

  const handlePresetChange = (preset: string) => {
    setCustomInterval(preset === "custom");
    switch (preset) {
      case "daily":
        setIntervalValue("1");
        setIntervalUnit("days");
        break;
      case "weekly":
        setIntervalValue("1");
        setIntervalUnit("weeks");
        break;
      case "monthly":
        setIntervalValue("1");
        setIntervalUnit("months");
        break;
      case "custom":
        setIntervalValue("1");
        setIntervalUnit("days");
        break;
    }
  };

  const handleCreateSubscription = async () => {
    if (!provider || initializing) {
      alert("Please login first");
      await login();
      return;
    }

    setIsLoading(true);

    try {
      const contract = await getSubscriptionManagerContract();

      // Correctly format and pass the arguments to match Solidity's function signature
      const tx = await contract.createSubscription(
        serviceProviderName, // Argument 1: serviceProviderName (string)
        serviceProviderAddress, // Argument 2: serviceProviderAddress (address)
        ethers.parseUnits(ethAmount, "ether"), // Argument 3: amount (uint256), converted to Wei
        calculateSeconds(), // Argument 4: interval (uint256)
        preferredBlockchain // Argument 5: preferredBlockchain (enum, passed as an integer)
      );

      await tx.wait();
      alert("Subscription created successfully!");
    } catch (error) {
      console.error("Error creating subscription:", error);
      alert("Failed to create subscription.");
    } finally {
      setIsLoading(false);
    }
  };

  if (initializing || isCheckingAuth) {
    return (
        <p>
          Loading page...{" "}
          <Loader className="ml-2 h-5 w-5 inline animate-spin" />
        </p>
    );
  }

  return (
    <>
      <div className="pb-96">
        <Card className="w-full max-w-md mx-auto mt-10">
          <CardHeader>
            <CardTitle>Create Subscription</CardTitle>
            <CardDescription>Create a cross chain subscription</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {initializing ? (
              <p className="text-center">
                Loading Web3Auth{" "}
                <Loader className="ml-2 h-5 w-5 inline animate-spin" />
              </p>
            ) : !loggedIn ? (
              <Button onClick={login}>Login with Web3Auth</Button>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="service-name">Service Provider Name</Label>
                  <Input
                    id="service-name"
                    placeholder="Enter service provider name"
                    value={serviceProviderName}
                    onChange={(e) => setServiceProviderName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Service Provider Address</Label>
                  <div className="relative">
                    <Wallet className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="address"
                      placeholder="Enter recipient address"
                      value={serviceProviderAddress}
                      onChange={(e) =>
                        setServiceProviderAddress(e.target.value)
                      }
                      className="pl-8"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Payment Interval</Label>
                  <RadioGroup
                    defaultValue="daily"
                    onValueChange={handlePresetChange}
                  >
                    <div className="flex justify-between">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="daily" id="daily" />
                        <Label htmlFor="daily">Daily</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="weekly" id="weekly" />
                        <Label htmlFor="weekly">Weekly</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="monthly" id="monthly" />
                        <Label htmlFor="monthly">Monthly</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="custom" id="custom" />
                        <Label htmlFor="custom">Custom</Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
                {customInterval && (
                  <div className="space-y-2">
                    <Label htmlFor="interval">Custom Interval</Label>
                    <div className="flex space-x-2">
                      <div className="relative flex-1">
                        <Clock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="interval"
                          type="number"
                          min="1"
                          value={intervalValue}
                          onChange={(e) => setIntervalValue(e.target.value)}
                          className="pl-8"
                        />
                      </div>
                      <Select
                        value={intervalUnit}
                        onValueChange={setIntervalUnit}
                      >
                        <SelectTrigger className="w-[110px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="seconds">Seconds</SelectItem>
                          <SelectItem value="minutes">Minutes</SelectItem>
                          <SelectItem value="hours">Hours</SelectItem>
                          <SelectItem value="days">Days</SelectItem>
                          <SelectItem value="weeks">Weeks</SelectItem>
                          <SelectItem value="months">Months</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="eth-amount">Amount in ETH</Label>
                  <div className="relative">
                    <HandCoins className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="eth-amount"
                      placeholder="Enter ETH amount"
                      type="number"
                      value={ethAmount}
                      onChange={(e) => setEthAmount(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="blockchain">
                    Preferred Payment Blockchain
                  </Label>
                  <Select
                    value={preferredBlockchain.toString()}
                    onValueChange={(value) =>
                      setPreferredBlockchain(Number(value))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        value={blockchainOptions.BaseSepolia.toString()}
                      >
                        BaseSepolia
                      </SelectItem>
                      <SelectItem
                        value={blockchainOptions.OP_Sepolia.toString()}
                      >
                        OP_Sepolia
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </CardContent>
          {loggedIn && (
            <CardFooter>
              <Button
                className="w-full"
                onClick={handleCreateSubscription}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Confirm Subscription"
                )}
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </>
  );
};

export default CreateSubscription;
