import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Bell, Calendar, CreditCard, Zap, Wifi, Phone, Car, Plus, Loader2, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import EmptyState from "./EmptyState";
import { formatCurrency } from "@/utils/currencies";
import { useBills, type NewBill } from "@/hooks/useBills";
import { useAuth } from "@/contexts/AuthContext";

const BillPayments = () => {
  const { bills, loading, addBill, updateBillStatus, deleteBill } = useBills();
  const { profile } = useAuth();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [newBill, setNewBill] = useState<NewBill>({
    name: "",
    provider: "",
    amount: 0,
    due_date: "",
    category: ""
  });

  const categories = [
    "Utilities", "Internet", "Mobile", "Insurance", "Rent", "Mortgage", 
    "Subscription", "Healthcare", "Education", "Other"
  ];

  const handleAddBill = async () => {
    if (!newBill.name || !newBill.provider || !newBill.amount || !newBill.due_date || !newBill.category) {
      return;
    }

    setIsSubmitting(true);
    const success = await addBill(newBill);
    
    if (success) {
      setNewBill({ name: "", provider: "", amount: 0, due_date: "", category: "" });
      setIsAddDialogOpen(false);
    }
    
    setIsSubmitting(false);
  };

  const handleDeleteBill = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this bill?")) {
      await deleteBill(id);
    }
  };

  const handlePayBill = async (id: string) => {
    await updateBillStatus(id, 'paid');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-success text-success-foreground';
      case 'pending': return 'bg-warning text-warning-foreground';
      case 'overdue': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getDaysUntilDue = (due_date: string) => {
    const today = new Date();
    const due = new Date(due_date);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getIconForCategory = (category: string) => {
    switch (category.toLowerCase()) {
      case 'utilities': return <Zap className="w-5 h-5" />;
      case 'internet': return <Wifi className="w-5 h-5" />;
      case 'mobile': return <Phone className="w-5 h-5" />;
      case 'insurance': return <Car className="w-5 h-5" />;
      default: return <CreditCard className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Bill Payments & Reminders</h2>
            <p className="text-muted-foreground">Manage your recurring bills and payments</p>
          </div>
        </div>
        
        <Card className="shadow-card bg-gradient-card border-0">
          <CardContent className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="text-muted-foreground">Loading bills...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const upcomingBills = bills.filter(bill => bill.status === 'pending' && getDaysUntilDue(bill.due_date) <= 7);

  if (bills.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Bill Payments & Reminders</h2>
            <p className="text-muted-foreground">Manage your recurring bills and payments</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Bill
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Bill</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Bill Name</Label>
                  <Input
                    id="name"
                    value={newBill.name}
                    onChange={(e) => setNewBill({...newBill, name: e.target.value})}
                    placeholder="e.g., Electricity Bill"
                  />
                </div>
                <div>
                  <Label htmlFor="provider">Provider</Label>
                  <Input
                    id="provider"
                    value={newBill.provider}
                    onChange={(e) => setNewBill({...newBill, provider: e.target.value})}
                    placeholder="e.g., EKEDC"
                  />
                </div>
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={newBill.amount || ""}
                    onChange={(e) => setNewBill({...newBill, amount: parseFloat(e.target.value) || 0})}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={newBill.category} 
                    onValueChange={(value) => setNewBill({...newBill, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={newBill.due_date}
                    onChange={(e) => setNewBill({...newBill, due_date: e.target.value})}
                  />
                </div>
                <Button 
                  onClick={handleAddBill} 
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Bill"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        <EmptyState type="bills" onAdd={() => setIsAddDialogOpen(true)} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upcoming Bills Alert */}
      {upcomingBills.length > 0 && (
        <Alert className="border-warning bg-warning/10">
          <Bell className="h-4 w-4" />
          <AlertDescription>
            You have {upcomingBills.length} bill(s) due within the next 7 days.
          </AlertDescription>
        </Alert>
      )}

      <Card className="shadow-card bg-gradient-card border-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
              <CreditCard className="w-6 h-6" />
              Bill Payments & Reminders
            </CardTitle>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Bill
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Bill</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Bill Name</Label>
                    <Input
                      id="name"
                      value={newBill.name}
                      onChange={(e) => setNewBill({...newBill, name: e.target.value})}
                      placeholder="e.g., Electricity Bill"
                    />
                  </div>
                  <div>
                    <Label htmlFor="provider">Provider</Label>
                    <Input
                      id="provider"
                      value={newBill.provider}
                      onChange={(e) => setNewBill({...newBill, provider: e.target.value})}
                      placeholder="e.g., EKEDC"
                    />
                  </div>
                  <div>
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={newBill.amount || ""}
                      onChange={(e) => setNewBill({...newBill, amount: parseFloat(e.target.value) || 0})}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select 
                      value={newBill.category} 
                      onValueChange={(value) => setNewBill({...newBill, category: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={newBill.due_date}
                      onChange={(e) => setNewBill({...newBill, due_date: e.target.value})}
                    />
                  </div>
                  <Button 
                    onClick={handleAddBill} 
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      "Add Bill"
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid gap-4">
            {bills.map((bill) => {
              const daysUntilDue = getDaysUntilDue(bill.due_date);
              
              return (
                <div key={bill.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      {getIconForCategory(bill.category)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{bill.name}</h3>
                      <p className="text-sm text-muted-foreground">{bill.provider}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Due: {new Date(bill.due_date).toLocaleDateString()}
                          {bill.status === 'pending' && (
                            <span> ({daysUntilDue > 0 ? `${daysUntilDue} days left` : 'Overdue'})</span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold text-foreground">{formatCurrency(bill.amount, profile?.currency || "USD")}</p>
                      <Badge className={getStatusColor(bill.status)}>
                        {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                      </Badge>
                    </div>
                    
                    <div className="flex gap-2">
                      {bill.status === 'pending' && (
                        <Button 
                          size="sm" 
                          className="bg-gradient-primary"
                          onClick={() => handlePayBill(bill.id)}
                        >
                          Pay Now
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteBill(bill.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BillPayments;