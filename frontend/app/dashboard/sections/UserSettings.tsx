"use client";

import { useState } from "react";
import { Bell, Shield, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function UserSettings() {
  const [wallets, setWallets] = useState([
    { id: 1, address: "0x1234...5678", isPrimary: true },
    { id: 2, address: "0x5678...9012", isPrimary: false },
  ]);

  const [newWalletAddress, setNewWalletAddress] = useState("");

  const addWallet = () => {
    if (newWalletAddress) {
      setWallets([
        ...wallets,
        { id: Date.now(), address: newWalletAddress, isPrimary: false },
      ]);
      setNewWalletAddress("");
    }
  };

  const removeWallet = (id: number) => {
    setWallets(wallets.filter((wallet) => wallet.id !== id));
  };

  const setPrimaryWallet = (id: number) => {
    setWallets(
      wallets.map((wallet) => ({
        ...wallet,
        isPrimary: wallet.id === id,
      }))
    );
  };

  return (
    <Card className="w-full max-w-8xl mx-auto">
      <CardHeader>
        <CardTitle>Settings and Preferences</CardTitle>
        <CardDescription>
          Manage your account settings and preferences
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="wallets">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="wallets">
              <Wallet className="w-4 h-4 mr-2" />
              Linked Wallets
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
          </TabsList>
          <TabsContent value="wallets">
            <Card>
              <CardHeader>
                <CardTitle>Linked Wallets</CardTitle>
                <CardDescription>Manage your linked wallets</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {wallets.map((wallet) => (
                    <div
                      key={wallet.id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium">{wallet.address}</p>
                        {wallet.isPrimary && (
                          <span className="text-sm text-green-500">
                            Primary
                          </span>
                        )}
                      </div>
                      <div>
                        {!wallet.isPrimary && (
                          <Button
                            variant="outline"
                            className="mr-2"
                            onClick={() => setPrimaryWallet(wallet.id)}
                          >
                            Set as Primary
                          </Button>
                        )}
                        <Button
                          variant="destructive"
                          onClick={() => removeWallet(wallet.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center space-x-2">
                  <Input
                    placeholder="New wallet address"
                    value={newWalletAddress}
                    onChange={(e) => setNewWalletAddress(e.target.value)}
                  />
                  <Button onClick={addWallet}>Add Wallet</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Configure how you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-notifications">
                    Email Notifications
                  </Label>
                  <Switch id="email-notifications" />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="sms-notifications">SMS Notifications</Label>
                  <Switch id="sms-notifications" />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="payment-reminders">Payment Reminders</Label>
                  <Switch id="payment-reminders" />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="subscription-renewals">
                    Subscription Renewals
                  </Label>
                  <Switch id="subscription-renewals" />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="important-updates">Important Updates</Label>
                  <Switch id="important-updates" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
