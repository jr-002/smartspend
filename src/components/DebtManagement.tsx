
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { CreditCard, AlertTriangle, Calculator, TrendingDown, Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import { useDebts, NewDebt, Debt } from "@/hooks/useDebts";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency } from "@/utils/currencies";
import EmptyState from "./EmptyState";

const DebtManagement = () => {
  const { debts, loading, addDebt, updateDebtBalance, deleteDebt } = useDebts();
  const { profile } = useAuth();
  const [strategy, setStrategy] = useState<'snowball' | 'avalanche'>('avalanche');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newDebt, setNewDebt] = useState<NewDebt>({
    name: '',
    type: 'credit_card',
    balance: 0,
    original_amount: 0,
    interest_rate: 0,
    minimum_payment: 0,
    due_date: new Date().toISOString().split('T')[0],
    priority: 'medium',
  });

  const handleAddDebt = async () => {
    if (!newDebt.name || newDebt.balance <= 0) {
      return;
    }
    
    setIsSubmitting(true);
    const success = await addDebt({
      ...newDebt,
      original_amount: newDebt.original_amount || newDebt.balance,
    });
    
    if (success) {
      setNewDebt({
        name: '',
        type: 'credit_card',
        balance: 0,
        original_amount: 0,
        interest_rate: 0,
        minimum_payment: 0,
        due_date: new Date().toISOString().split('T')[0],
        priority: 'medium',
      });
      setIsDialogOpen(false);
    }
    setIsSubmitting(false);
  };

  const AddDebtDialog = () => (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add Debt
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Debt</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Debt Name</Label>
            <Input
              id="name"
              placeholder="e.g., Credit Card, Car Loan"
              value={newDebt.name}
              onChange={(e) => setNewDebt({ ...newDebt, name: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type">Debt Type</Label>
            <Select
              value={newDebt.type}
              onValueChange={(value) => setNewDebt({ ...newDebt, type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="credit_card">Credit Card</SelectItem>
                <SelectItem value="personal_loan">Personal Loan</SelectItem>
                <SelectItem value="car_loan">Car Loan</SelectItem>
                <SelectItem value="student_loan">Student Loan</SelectItem>
                <SelectItem value="mortgage">Mortgage</SelectItem>
                <SelectItem value="medical">Medical Debt</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="balance">Current Balance</Label>
              <Input
                id="balance"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={newDebt.balance || ''}
                onChange={(e) => setNewDebt({ ...newDebt, balance: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="original">Original Amount</Label>
              <Input
                id="original"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={newDebt.original_amount || ''}
                onChange={(e) => setNewDebt({ ...newDebt, original_amount: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="interest">Interest Rate (%)</Label>
              <Input
                id="interest"
                type="number"
                min="0"
                max="100"
                step="0.01"
                placeholder="0.00"
                value={newDebt.interest_rate || ''}
                onChange={(e) => setNewDebt({ ...newDebt, interest_rate: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minimum">Minimum Payment</Label>
              <Input
                id="minimum"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={newDebt.minimum_payment || ''}
                onChange={(e) => setNewDebt({ ...newDebt, minimum_payment: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="due_date">Due Date</Label>
              <Input
                id="due_date"
                type="date"
                value={newDebt.due_date}
                onChange={(e) => setNewDebt({ ...newDebt, due_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={newDebt.priority}
                onValueChange={(value: 'high' | 'medium' | 'low') => setNewDebt({ ...newDebt, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={handleAddDebt} 
            className="w-full" 
            disabled={isSubmitting || !newDebt.name || newDebt.balance <= 0}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              'Add Debt'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Debt Management</h2>
            <p className="text-muted-foreground">Track and manage your debts</p>
          </div>
          <AddDebtDialog />
        </div>
        
        <Card className="shadow-card bg-gradient-card border-0">
          <CardContent className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="text-muted-foreground">Loading debts...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (debts.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Debt Management</h2>
            <p className="text-muted-foreground">Track and manage your debts</p>
          </div>
          <AddDebtDialog />
        </div>
        
        <EmptyState type="debts" onAdd={() => setIsDialogOpen(true)} />
      </div>
    );
  }

  const totalDebt = debts.reduce((sum, debt) => sum + debt.balance, 0);
  const totalMinimumPayment = debts.reduce((sum, debt) => sum + debt.minimum_payment, 0);
  const totalOriginalAmount = debts.reduce((sum, debt) => sum + debt.original_amount, 0);
  const totalPaidOff = totalOriginalAmount - totalDebt;

  const getSortedDebts = () => {
    if (strategy === 'snowball') {
      return [...debts].sort((a, b) => a.balance - b.balance);
    } else {
      return [...debts].sort((a, b) => b.interest_rate - a.interest_rate);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Debt Management</h2>
          <p className="text-muted-foreground">Track and manage your debts</p>
        </div>
        <AddDebtDialog />
      </div>

      {/* Debt Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-card bg-gradient-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Debt</p>
                <p className="text-2xl font-bold text-destructive">
                  {formatCurrency(totalDebt, profile?.currency || "USD")}
                </p>
              </div>
              <CreditCard className="w-8 h-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card bg-gradient-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Payments</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(totalMinimumPayment, profile?.currency || "USD")}
                </p>
              </div>
              <Calculator className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card bg-gradient-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Paid Off</p>
                <p className="text-2xl font-bold text-success">
                  {formatCurrency(totalPaidOff, profile?.currency || "USD")}
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card bg-gradient-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Progress</p>
                <p className="text-2xl font-bold text-foreground">
                  {totalOriginalAmount > 0 ? ((totalPaidOff / totalOriginalAmount) * 100).toFixed(1) : 0}%
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card bg-gradient-card border-0">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-foreground">Debt Management</CardTitle>
        </CardHeader>
        
        <CardContent>
          <Tabs value={strategy} onValueChange={(value) => setStrategy(value as 'snowball' | 'avalanche')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="avalanche">Debt Avalanche</TabsTrigger>
              <TabsTrigger value="snowball">Debt Snowball</TabsTrigger>
            </TabsList>
            
            <TabsContent value="avalanche" className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Debt Avalanche Strategy</h3>
                <p className="text-sm text-blue-700">
                  Pay minimum on all debts, then put extra money toward the debt with the highest interest rate. 
                  This saves the most money on interest over time.
                </p>
              </div>
              
              <div className="space-y-4">
                {getSortedDebts().map((debt, index) => (
                  <DebtCard 
                    key={debt.id} 
                    debt={debt} 
                    rank={index + 1} 
                    currency={profile?.currency || "USD"}
                    onUpdate={updateDebtBalance}
                    onDelete={deleteDebt}
                  />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="snowball" className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2">Debt Snowball Strategy</h3>
                <p className="text-sm text-green-700">
                  Pay minimum on all debts, then put extra money toward the smallest debt first. 
                  This provides psychological wins and momentum.
                </p>
              </div>
              
              <div className="space-y-4">
                {getSortedDebts().map((debt, index) => (
                  <DebtCard 
                    key={debt.id} 
                    debt={debt} 
                    rank={index + 1} 
                    currency={profile?.currency || "USD"}
                    onUpdate={updateDebtBalance}
                    onDelete={deleteDebt}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

interface DebtCardProps {
  debt: Debt;
  rank: number;
  currency: string;
  onUpdate: (id: string, newBalance: number) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

const DebtCard = ({ debt, rank, currency, onUpdate, onDelete }: DebtCardProps) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [newBalance, setNewBalance] = useState(debt.balance);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const progressPercentage = ((debt.original_amount - debt.balance) / debt.original_amount) * 100;
  const payoffMonths = debt.minimum_payment > 0 ? Math.ceil(debt.balance / debt.minimum_payment) : 0;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-destructive text-destructive-foreground';
      case 'medium': return 'bg-warning text-warning-foreground';
      case 'low': return 'bg-success text-success-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handleUpdateBalance = async () => {
    setIsUpdating(true);
    const success = await onUpdate(debt.id, newBalance);
    if (success) {
      setIsEditOpen(false);
    }
    setIsUpdating(false);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete(debt.id);
    setIsDeleting(false);
  };

  return (
    <div className="p-6 border rounded-lg bg-card/50 hover:bg-card transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
            {rank}
          </div>
          <div>
            <h3 className="font-semibold text-lg text-foreground">{debt.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline">{debt.type}</Badge>
              <Badge className={getPriorityColor(debt.priority)}>
                {debt.priority} priority
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <div className="text-right mr-2">
            <p className="text-2xl font-bold text-foreground">{formatCurrency(debt.balance, currency)}</p>
            <p className="text-sm text-muted-foreground">
              {debt.interest_rate}% APR
            </p>
          </div>
          
          {/* Edit Button */}
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <Pencil className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Update Balance: {debt.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newBalance">New Balance</Label>
                  <Input
                    id="newBalance"
                    type="number"
                    min="0"
                    step="0.01"
                    value={newBalance}
                    onChange={(e) => setNewBalance(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <Button 
                  onClick={handleUpdateBalance} 
                  className="w-full" 
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Balance'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Delete Button */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Debt</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{debt.name}"? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-semibold text-foreground">
            {progressPercentage.toFixed(1)}% paid off
          </span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t">
          <div>
            <p className="text-sm font-medium text-foreground">Minimum Payment</p>
            <p className="text-lg font-bold text-foreground">{formatCurrency(debt.minimum_payment, currency)}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-foreground">Payoff Time</p>
            <p className="text-lg font-bold text-foreground">{payoffMonths} months</p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => setIsEditOpen(true)}
            >
              Update Balance
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebtManagement;
