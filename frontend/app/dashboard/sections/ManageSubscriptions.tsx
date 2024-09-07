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

interface Subscription {
  subscriptionId: number;
  name: string;
  amount: string;
  interval: string;
  nextPaymentDate?: string;
}

export const ManageSubscriptions: React.FC = () => {
  const { userAddress } = useWeb3Auth();
  const {
    getAllSubscriptionsForSubscriber,
    getAllSubscriptionsForProvider,
    updateSubscription,
    unsubscribeSubscription
  } = useContracts();

  const [subscribedSubscriptions, setSubscribedSubscriptions] = useState<Subscription[]>([]);
  const [createdSubscriptions, setCreatedSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      if (userAddress) {
        const subscribed = await getAllSubscriptionsForSubscriber(userAddress);
        const created = await getAllSubscriptionsForProvider(userAddress);
        setSubscribedSubscriptions(subscribed);
        setCreatedSubscriptions(created);
        setIsLoading(false);
      }
    };

    fetchSubscriptions();
  }, [userAddress, getAllSubscriptionsForSubscriber, getAllSubscriptionsForProvider]);

  const handleUnsubscribe = async (subscriptionId: number) => {
    try {
      await unsubscribeSubscription(subscriptionId);
      if (userAddress) {
        const subscribed = await getAllSubscriptionsForSubscriber(userAddress);
        setSubscribedSubscriptions(subscribed);
      }
    } catch (error) {
      console.error("Failed to unsubscribe:", error);
    }
  };

  const handleUpdate = async (subscriptionId: number, newName: string, newAmount: string, newInterval: string) => {
    try {
      const intervalAsNumber = Number(newInterval); // Convert string to number
      if (isNaN(intervalAsNumber)) {
        throw new Error("Invalid interval value");
      }
      await updateSubscription(subscriptionId, newName, newAmount, intervalAsNumber); // Pass the number instead of string
      if (userAddress) {
        const created = await getAllSubscriptionsForProvider(userAddress);
        setCreatedSubscriptions(created);
      }
    } catch (error) {
      console.error("Failed to update subscription:", error);
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
              View and manage subscriptions you're subscribed to
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Interval</TableHead>
                  <TableHead>Next Payment</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscribedSubscriptions.map((sub) => (
                    <TableRow key={sub.subscriptionId}>
                      <TableCell>{sub.name}</TableCell>
                      <TableCell>{sub.amount} ETH</TableCell>
                      <TableCell>{sub.interval}</TableCell>
                      <TableCell>{sub.nextPaymentDate}</TableCell>
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
              View and manage subscriptions you've created
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Interval</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {createdSubscriptions.map((sub) => (
                    <TableRow key={sub.subscriptionId}>
                      <TableCell>{sub.name}</TableCell>
                      <TableCell>{sub.amount} ETH</TableCell>
                      <TableCell>{sub.interval}</TableCell>
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
  const [interval, setInterval] = useState<string>(subscription.interval);

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
              <Label htmlFor="interval">Interval (seconds)</Label>
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