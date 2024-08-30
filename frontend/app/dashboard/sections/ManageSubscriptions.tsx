import React from "react";
import { Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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

export const ManageSubscriptions = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Subscriptions</CardTitle>
        <CardDescription>
          View and manage all your subscriptions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Next Payment</TableHead>
              <TableHead>Source Chain</TableHead>
              <TableHead>Payment Chain</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Netflix</TableCell>
              <TableCell>$14.99</TableCell>
              <TableCell>2023-07-15</TableCell>
              <TableCell>Sepolia</TableCell>
              <TableCell>BNB</TableCell>

              <TableCell>
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Netflix</TableCell>
              <TableCell>$14.99</TableCell>
              <TableCell>2023-07-15</TableCell>
              <TableCell>Sepolia</TableCell>
              <TableCell>BNB</TableCell>
              <TableCell>
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
