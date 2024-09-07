import React, { useState, useEffect } from "react";
import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useContracts } from "@/util/useContracts";
import { useWeb3Auth } from "@/context/Web3AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ethers } from "ethers";
import { useToast } from "@/components/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

interface Subscription {
  subscriptionId: number;
  name: string;
  amount: string;
  interval: string;
  nextPaymentDate?: string;
  provider?: string;
  user?: string;
  serviceProviderName?: string;
}

export const ManageSubscriptions: React.FC = () => {
  const { userAddress } = useWeb3Auth();
  const {
    fetchSubscriptionsByUser,
    fetchAllSubscriptions,
    getSubscriptionManagerContract,
    subscribeToSubscription,
  } = useContracts();

  const { toast } = useToast();

  const [subscribedSubscriptions, setSubscribedSubscriptions] = useState<Subscription[]>([]);
  const [createdSubscriptions, setCreatedSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      if (userAddress) {
        const subscribed = await fetchSubscriptionsByUser();
        const all = await fetchAllSubscriptions();

        console.log("All subscriptions:", all);

        const mappedSubscribed: Subscription[] = subscribed.map(sub => ({
          subscriptionId: sub.id,
          name: sub.serviceProviderName,
          amount: sub.amount,
          interval: "0",
          nextPaymentDate: sub.nextPaymentDate,
          user: sub.user,
          serviceProviderName: sub.serviceProviderName
        }));

        const mappedCreated: Subscription[] = all
            .filter(sub => sub.serviceProvider.toLowerCase() === userAddress.toLowerCase())
            .map(sub => ({
              subscriptionId: sub.id,
              name: sub.name,
              amount: sub.amount,
              interval: sub.interval,
              provider: sub.serviceProvider
            }));

        console.log("Created subscriptions:", mappedCreated);

        setSubscribedSubscriptions(mappedSubscribed);
        setCreatedSubscriptions(mappedCreated);
        setIsLoading(false);
      }
    };

    fetchSubscriptions();
  }, [userAddress, fetchSubscriptionsByUser, fetchAllSubscriptions]);

  const handleUnsubscribe = async (subscriptionId: number) => {
    try {
      const contract = await getSubscriptionManagerContract();
      const tx = await contract.unsubscribeSubscription(subscriptionId);
      await tx.wait();
      // Refresh subscriptions after unsubscribing
      const subscribed = await fetchSubscriptionsByUser();
      const mappedSubscribed: Subscription[] = subscribed.map(sub => ({
        subscriptionId: sub.id,
        name: sub.serviceProviderName,
        amount: sub.amount,
        interval: "0",
        nextPaymentDate: sub.nextPaymentDate,
        user: sub.user,
        serviceProviderName: sub.serviceProviderName
      }));
      setSubscribedSubscriptions(mappedSubscribed);

      toast({ title: "Unsubscribed", description: "You have successfully unsubscribed." });
    } catch (error) {
      console.error("Failed to unsubscribe:", error);
    }
  };

  const handleUpdate = async (subscriptionId: number, newName: string, newAmount: string, newInterval: string) => {
    try {
      const contract = await getSubscriptionManagerContract();
      const amountInWei = ethers.parseEther(newAmount);
      const intervalInSeconds = parseInt(newInterval) * 86400; // Convert days to seconds
      const tx = await contract.updateSubscription(subscriptionId, newName, amountInWei, intervalInSeconds);
      await tx.wait();
      // Refresh subscriptions after updating
      const all = await fetchAllSubscriptions();
      const mappedCreated: Subscription[] = all
          .filter(sub => sub.serviceProvider === userAddress)
          .map(sub => ({
            subscriptionId: sub.id,
            name: sub.name,
            amount: sub.amount,
            interval: sub.interval,
            provider: sub.serviceProvider
          }));
      setCreatedSubscriptions(mappedCreated);

      toast({ title: "Subscription Updated", description: "Your subscription was updated successfully." });
    } catch (error) {
      console.error("Failed to update subscription:", error);
    }
  };

  const handleSubscribe = async (subscriptionId: number, priceInUSDC: string) => {
    try {
      await subscribeToSubscription(subscriptionId, priceInUSDC, "optimismSepolia");
      // Refresh subscriptions after subscribing
      const subscribed = await fetchSubscriptionsByUser();
      const mappedSubscribed: Subscription[] = subscribed.map(sub => ({
        subscriptionId: sub.id,
        name: sub.serviceProviderName,
        amount: sub.amount,
        interval: "0",
        nextPaymentDate: sub.nextPaymentDate,
        user: sub.user,
        serviceProviderName: sub.serviceProviderName
      }));
      setSubscribedSubscriptions(mappedSubscribed);

      toast({ title: "Subscribed", description: "You have successfully subscribed." });
    } catch (error) {
      console.error("Failed to subscribe:", error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Subscribed Subscriptions</CardTitle>
            <CardDescription>
              View and manage subscriptions you&apos;re subscribed to
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Next Payment</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscribedSubscriptions.map((sub) => (
                    <TableRow key={sub.subscriptionId}>
                      <TableCell>{sub.name}</TableCell>
                      <TableCell>{ethers.formatEther(sub.amount)} ETH</TableCell>
                      <TableCell>{new Date(parseInt(sub.nextPaymentDate!) * 1000).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleUnsubscribe(sub.subscriptionId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Created Subscriptions</CardTitle>
            <CardDescription>
              View and manage subscriptions you&apos;ve created
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Interval</TableHead>
                  <TableHead>Update Subscription</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {createdSubscriptions.map((sub) => (
                    <TableRow key={sub.subscriptionId}>
                      <TableCell>{sub.name}</TableCell>
                      <TableCell>{sub.amount} ETH</TableCell>
                      <TableCell>{(parseInt(sub.interval) / 86400).toString()} days</TableCell>
                      <TableCell>
                        <UpdateSubscriptionDialog
                            subscription={sub}
                            onUpdate={handleUpdate}
                        />
                      </TableCell>
                    </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Toaster />
      </div>
  );
};

interface UpdateSubscriptionDialogProps {
  subscription: Subscription;
  onUpdate: (subscriptionId: number, name: string, amount: string, interval: string) => Promise<void>;
}

const UpdateSubscriptionDialog: React.FC<UpdateSubscriptionDialogProps> = ({ subscription, onUpdate }) => {
  const [name, setName] = useState<string>(subscription.name);
  const [amount, setAmount] = useState<string>(subscription.amount);
  const [interval, setInterval] = useState<string>((parseInt(subscription.interval) / 86400).toString());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(subscription.subscriptionId, name, amount, interval);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Subscription</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="amount">Amount (ETH)</Label>
            <Input
              id="amount"
              type="number"
              step="0.000000000000000001"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="interval">Interval (days)</Label>
            <Input
                id="interval"
                type="number"
                value={interval}
                onChange={(e) => setInterval(e.target.value)}
            />
          </div>
          <Button type="submit">Update</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};