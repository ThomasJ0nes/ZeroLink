import {
  AlertCircle,
  Bell,
  CreditCard,
  Key,
  RefreshCw,
  ShieldAlert,
  Wallet,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Actions() {
  return (
    <div className="w-full mx-auto p-2 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Subscription Actions and Alerts
          </CardTitle>
          <CardDescription>
            Important actions and notifications for your blockchain-based
            subscriptions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <section>
            <h3 className="text-lg font-semibold mb-4">Pending Actions</h3>
            <ul className="space-y-3">
              <li className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center space-x-3">
                  <Wallet className="h-5 w-5 text-muted-foreground" />
                  <span>Confirm subscription payment transaction</span>
                </div>
                <Button size="sm">Confirm</Button>
              </li>
              <li className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  <span>Update payment method (wallet address)</span>
                </div>
                <Button size="sm">Update</Button>
              </li>
              <li className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center space-x-3">
                  <RefreshCw className="h-5 w-5 text-muted-foreground" />
                  <span>Retry failed payment due to network error</span>
                </div>
                <Button size="sm">Retry</Button>
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-4">
              Alerts and Notifications
            </h3>
            <div className="space-y-3">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Payment Failed</AlertTitle>
                <AlertDescription>
                  Your last subscription payment failed due to insufficient
                  funds. Please ensure your wallet has enough balance and try
                  again.
                </AlertDescription>
              </Alert>
              <Alert>
                <Bell className="h-4 w-4" />
                <AlertTitle>Subscription Expiring Soon</AlertTitle>
                <AlertDescription>
                  Your "Premium Content" subscription will expire in 3 days.
                  Renew now to maintain uninterrupted access to exclusive
                  blockchain content.
                </AlertDescription>
              </Alert>
              <Alert variant="destructive">
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>Security Recommendation</AlertTitle>
                <AlertDescription>
                  We've detected unusual activity on your account. Please review
                  your recent transactions and consider enabling two-factor
                  authentication for enhanced security.
                </AlertDescription>
              </Alert>
              <Alert variant="default">
                <Key className="h-4 w-4" />
                <AlertTitle>New Feature: Account Abstraction</AlertTitle>
                <AlertDescription>
                  We've implemented account abstraction for easier transactions.
                  Update your settings to enable automatic subscription renewals
                  without manual confirmations.
                </AlertDescription>
              </Alert>
            </div>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
