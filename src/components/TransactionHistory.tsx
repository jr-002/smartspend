import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Filter, Download, Edit3 } from "lucide-react";

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
}

const TransactionHistory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");

  // Mock transaction data
  const transactions: Transaction[] = [
    { id: "1", date: "2025-01-15", description: "Grocery Shopping - Shoprite", amount: -15420, category: "Food", type: "expense" },
    { id: "2", date: "2025-01-14", description: "Salary Payment", amount: 250000, category: "Income", type: "income" },
    { id: "3", date: "2025-01-13", description: "Uber Ride", amount: -2500, category: "Transportation", type: "expense" },
    { id: "4", date: "2025-01-12", description: "Netflix Subscription", amount: -2900, category: "Entertainment", type: "expense" },
    { id: "5", date: "2025-01-11", description: "Fuel - Total Station", amount: -8000, category: "Transportation", type: "expense" },
    { id: "6", date: "2025-01-10", description: "Freelance Project", amount: 45000, category: "Income", type: "income" },
  ];

  const categories = ["Food", "Transportation", "Entertainment", "Income", "Shopping", "Bills"];

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      "Food": "bg-orange-100 text-orange-800",
      "Transportation": "bg-blue-100 text-blue-800",
      "Entertainment": "bg-purple-100 text-purple-800",
      "Income": "bg-green-100 text-green-800",
      "Shopping": "bg-pink-100 text-pink-800",
      "Bills": "bg-red-100 text-red-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  const formatAmount = (amount: number) => {
    const formatted = Math.abs(amount).toLocaleString();
    return amount >= 0 ? `+₦${formatted}` : `-₦${formatted}`;
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || transaction.category === selectedCategory;
    const matchesType = selectedType === "all" || transaction.type === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  });

  return (
    <Card className="shadow-card bg-gradient-card border-0">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-2xl font-bold text-foreground">Transaction History</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">
                    {new Date(transaction.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell>
                    <Badge className={getCategoryColor(transaction.category)}>
                      {transaction.category}
                    </Badge>
                  </TableCell>
                  <TableCell className={`text-right font-semibold ${
                    transaction.amount >= 0 ? 'text-success' : 'text-foreground'
                  }`}>
                    {formatAmount(transaction.amount)}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <Edit3 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionHistory;