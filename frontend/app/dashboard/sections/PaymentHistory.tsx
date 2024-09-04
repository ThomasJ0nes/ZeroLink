import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { ArrowUpDown, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useContracts } from "@/util/useContracts";

// Define the type for a transaction
type Transaction = {
  id: number;
  date: Date;
  service: string;
  amount: number;
  blockchain: string;
  status: string;
  hash: string;
};

// Mock data for demonstration
const mockTransactions: Transaction[] = [
  {
    id: 1,
    date: new Date("2023-06-01"),
    service: "Netflix",
    amount: 0.005,
    blockchain: "Ethereum",
    status: "Completed",
    hash: "0x123...abc",
  },
  {
    id: 2,
    date: new Date("2023-06-15"),
    service: "Spotify",
    amount: 0.002,
    blockchain: "Optimism",
    status: "Pending",
    hash: "0x456...def",
  },
  {
    id: 3,
    date: new Date("2023-07-01"),
    service: "Amazon Prime",
    amount: 0.008,
    blockchain: "BSC",
    status: "Failed",
    hash: "0x789...ghi",
  },
  {
    id: 4,
    date: new Date("2023-07-15"),
    service: "Disney+",
    amount: 0.003,
    blockchain: "Sepolia",
    status: "Completed",
    hash: "0xabc...123",
  },
];

export default function PaymentHistory() {
  const { fetchPaymentHistory } = useContracts();

  const [allTransactions, setAllTransactions] =
    useState<Transaction[]>([]);
  const [transactions, setTransactions] =
    useState<Transaction[]>(mockTransactions);
  const [sortColumn, setSortColumn] = useState<keyof Transaction>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [blockchainFilter, setBlockchainFilter] = useState<string>("All");

  useEffect(() => {
    getPaymentHistory();
 }, []);

  const sortTransactions = (column: keyof Transaction) => {
    const direction =
      column === sortColumn && sortDirection === "asc" ? "desc" : "asc";
    const sorted = [...transactions].sort((a, b) => {
      if (a[column] < b[column]) return direction === "asc" ? -1 : 1;
      if (a[column] > b[column]) return direction === "asc" ? 1 : -1;
      return 0;
    });
    setTransactions(sorted);
    setSortColumn(column);
    setSortDirection(direction);
  };

  const filterTransactions = () => {
    let filtered = allTransactions;

    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      filtered = filtered.filter((t) => t.date >= filterDate);
    }

    if (statusFilter && statusFilter !== "All") {
      filtered = filtered.filter((t) => t.status === statusFilter);
    }

    if (blockchainFilter && blockchainFilter !== "All") {
      filtered = filtered.filter((t) => t.blockchain === blockchainFilter);
    }

    setTransactions(filtered);
  };

  const getPaymentHistory = async () => {
    const payments = await fetchPaymentHistory(); 
    console.log(payments);
    setAllTransactions(payments);
    setTransactions(payments);
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Payment History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4 mb-4">
          <Input
            type="date"
            placeholder="Filter by date"
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full sm:w-auto"
          />
          <Select onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Statuses</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Failed">Failed</SelectItem>
            </SelectContent>
          </Select>
          <Select onValueChange={setBlockchainFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by blockchain" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Blockchains</SelectItem>
              <SelectItem value="Ethereum">Ethereum</SelectItem>
              <SelectItem value="Optimism">Optimism</SelectItem>
              <SelectItem value="BSC">BSC</SelectItem>
              <SelectItem value="Sepolia">Sepolia</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={filterTransactions}>Apply Filters</Button>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">
                  <Button
                    variant="ghost"
                    onClick={() => sortTransactions("date")}
                  >
                    Date
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Service Name</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => sortTransactions("amount")}
                  >
                    Amount (ETH)
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Blockchain Used</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => sortTransactions("status")}
                  >
                    Status
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Transaction Hash</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">
                    {format(transaction.date, "yyyy-MM-dd")}
                  </TableCell>
                  <TableCell>{transaction.service}</TableCell>
                  <TableCell>{transaction.amount}</TableCell>
                  <TableCell>{transaction.blockchain}</TableCell>
                  <TableCell>{transaction.status}</TableCell>
                  <TableCell>
                    <a
                      href={`https://etherscan.io/tx/${transaction.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-500 hover:underline"
                    >
                      {transaction.hash.slice(0, 6)}...
                      {transaction.hash.slice(-4)}
                      <ExternalLink className="ml-1 h-4 w-4" />
                    </a>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
