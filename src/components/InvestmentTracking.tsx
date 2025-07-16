import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
<<<<<<< HEAD
import { TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3, Plus, Loader2, Trash2, Edit } from "lucide-react";
=======
import { TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3 } from "lucide-react";
import { UpdateValueDialog } from "@/components/ui/update-value-dialog";
>>>>>>> c224187 (chore: update project dependencies and add new components)
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, PieChart as RechartsPieChart, Cell } from "recharts";
import EmptyState from "./EmptyState";
import { formatCurrency } from "@/utils/currencies";
import { useInvestments, type NewInvestment } from "@/hooks/useInvestments";
import { useAuth } from "@/contexts/AuthContext";

const InvestmentTracking = () => {
<<<<<<< HEAD
  const { investments, loading, addInvestment, updateInvestmentValue, deleteInvestment } = useInvestments();
  const { profile } = useAuth();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [newInvestment, setNewInvestment] = useState<NewInvestment>({
    name: "",
    type: "",
    current_value: 0,
    initial_investment: 0,
    purchase_date: ""
  });

  const handleAddInvestment = async () => {
    if (!newInvestment.name || !newInvestment.type || !newInvestment.current_value || !newInvestment.initial_investment) {
      return;
=======
  const [updateDialogState, setUpdateDialogState] = useState<{
    isOpen: boolean;
    investmentId: string | null;
  }>({
    isOpen: false,
    investmentId: null
  });

  const [investments, setInvestments] = useState<Investment[]>([
    {
      id: "1",
      name: "Nigerian Stock Exchange",
      type: "Stocks",
      currentValue: 450000,
      initialInvestment: 400000,
      change: 50000,
      changePercent: 12.5,
      lastUpdated: "2025-01-15"
    },
    {
      id: "2",
      name: "Treasury Bills",
      type: "Government Bonds",
      currentValue: 520000,
      initialInvestment: 500000,
      change: 20000,
      changePercent: 4.0,
      lastUpdated: "2025-01-15"
    },
    {
      id: "3",
      name: "Mutual Funds",
      type: "Mutual Funds",
      currentValue: 180000,
      initialInvestment: 200000,
      change: -20000,
      changePercent: -10.0,
      lastUpdated: "2025-01-15"
    },
    {
      id: "4",
      name: "Real Estate Investment",
      type: "Real Estate",
      currentValue: 2500000,
      initialInvestment: 2200000,
      change: 300000,
      changePercent: 13.6,
      lastUpdated: "2025-01-15"
>>>>>>> c224187 (chore: update project dependencies and add new components)
    }

    setIsSubmitting(true);
    const success = await addInvestment(newInvestment);
    
    if (success) {
      setNewInvestment({ name: "", type: "", current_value: 0, initial_investment: 0, purchase_date: "" });
      setIsAddDialogOpen(false);
    }
    
    setIsSubmitting(false);
  };

  const handleDeleteInvestment = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this investment?")) {
      await deleteInvestment(id);
    }
  };

  const handleUpdateValue = async (id: string) => {
    const newValue = parseFloat(prompt("Enter new current value:") || "0");
    if (newValue > 0) {
      await updateInvestmentValue(id, newValue);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Investment Tracking</h2>
            <p className="text-muted-foreground">Track and manage your investment portfolio</p>
          </div>
        </div>
        
        <Card className="shadow-card bg-gradient-card border-0">
          <CardContent className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="text-muted-foreground">Loading investments...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (investments.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Investment Tracking</h2>
            <p className="text-muted-foreground">Track and manage your investment portfolio</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Investment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Investment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Investment Name</Label>
                  <Input
                    id="name"
                    value={newInvestment.name}
                    onChange={(e) => setNewInvestment({...newInvestment, name: e.target.value})}
                    placeholder="e.g., Apple Stock"
                  />
                </div>
                <div>
                  <Label htmlFor="type">Investment Type</Label>
                  <Input
                    id="type"
                    value={newInvestment.type}
                    onChange={(e) => setNewInvestment({...newInvestment, type: e.target.value})}
                    placeholder="e.g., Stocks, Bonds, Real Estate"
                  />
                </div>
                <div>
                  <Label htmlFor="initialInvestment">Initial Investment</Label>
                  <Input
                    id="initialInvestment"
                    type="number"
                    value={newInvestment.initial_investment || ""}
                    onChange={(e) => setNewInvestment({...newInvestment, initial_investment: parseFloat(e.target.value) || 0})}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="currentValue">Current Value</Label>
                  <Input
                    id="currentValue"
                    type="number"
                    value={newInvestment.current_value || ""}
                    onChange={(e) => setNewInvestment({...newInvestment, current_value: parseFloat(e.target.value) || 0})}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="purchaseDate">Purchase Date</Label>
                  <Input
                    id="purchaseDate"
                    type="date"
                    value={newInvestment.purchase_date}
                    onChange={(e) => setNewInvestment({...newInvestment, purchase_date: e.target.value})}
                  />
                </div>
                <Button 
                  onClick={handleAddInvestment} 
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Investment"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        <EmptyState type="investments" onAdd={() => setIsAddDialogOpen(true)} />
      </div>
    );
  }

  // Calculate portfolio metrics from real data
  const totalValue = investments.reduce((sum, inv) => sum + inv.current_value, 0);
  const totalInvestment = investments.reduce((sum, inv) => sum + inv.initial_investment, 0);
  const totalGain = totalValue - totalInvestment;
  const totalGainPercent = totalInvestment > 0 ? (totalGain / totalInvestment) * 100 : 0;

  // Generate allocation data from investments
  const typeGroups = investments.reduce((acc, inv) => {
    if (!acc[inv.type]) {
      acc[inv.type] = 0;
    }
    acc[inv.type] += inv.current_value;
    return acc;
  }, {} as Record<string, number>);

  const colors = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#6B7280'];
  const allocationData = Object.entries(typeGroups).map(([type, value], index) => ({
    name: type,
    value,
    color: colors[index % colors.length]
  }));

  // Generate portfolio performance data (simplified - could be enhanced with historical data)
  const portfolioData = [
    { month: 'Jul', value: totalValue * 0.85 },
    { month: 'Aug', value: totalValue * 0.90 },
    { month: 'Sep', value: totalValue * 0.88 },
    { month: 'Oct', value: totalValue * 0.92 },
    { month: 'Nov', value: totalValue * 0.96 },
    { month: 'Dec', value: totalValue * 0.98 },
    { month: 'Jan', value: totalValue },
  ];

  const handleUpdateValue = (id: string, newValue: number) => {
    setInvestments(prevInvestments => 
      prevInvestments.map(inv => {
        if (inv.id === id) {
          const change = newValue - inv.initialInvestment;
          const changePercent = (change / inv.initialInvestment) * 100;
          return {
            ...inv,
            currentValue: newValue,
            change,
            changePercent,
            lastUpdated: new Date().toISOString().split('T')[0]
          };
        }
        return inv;
      })
    );
  };

  const chartConfig = {
    value: {
      label: "Portfolio Value",
      color: "hsl(var(--primary))",
    },
  };

  return (
    <>
      <div className="space-y-6">
        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="shadow-card bg-gradient-card border-0">
            <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Portfolio</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(totalValue, profile?.currency || "USD")}</p>
              </div>
              <DollarSign className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card bg-gradient-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Invested</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(totalInvestment, profile?.currency || "USD")}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card bg-gradient-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Gain/Loss</p>
                <p className={`text-2xl font-bold ${totalGain >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {totalGain >= 0 ? '+' : ''}{formatCurrency(Math.abs(totalGain), profile?.currency || "USD")}
                </p>
              </div>
              {totalGain >= 0 ? 
                <TrendingUp className="w-8 h-8 text-success" /> : 
                <TrendingDown className="w-8 h-8 text-destructive" />
              }
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card bg-gradient-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Return Rate</p>
                <p className={`text-2xl font-bold ${totalGainPercent >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {totalGainPercent >= 0 ? '+' : ''}{totalGainPercent.toFixed(1)}%
                </p>
              </div>
              <PieChart className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-card bg-gradient-card border-0">
          <CardHeader>
            <CardTitle>Portfolio Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={portfolioData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-card bg-gradient-card border-0">
          <CardHeader>
            <CardTitle>Asset Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <RechartsPieChart data={allocationData} cx="50%" cy="50%" outerRadius={80}>
                    {allocationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </RechartsPieChart>
                </RechartsPieChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="mt-4 space-y-2">
              {allocationData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="text-sm font-medium">{formatCurrency(item.value, profile?.currency || "USD")}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Investment List */}
      <Card className="shadow-card bg-gradient-card border-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-foreground">Investment Holdings</CardTitle>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-primary gap-2">
                  <Plus className="w-4 h-4" />
                  Add Investment
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Investment</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {/* Same form content as above */}
                  <div>
                    <Label htmlFor="name">Investment Name</Label>
                    <Input
                      id="name"
                      value={newInvestment.name}
                      onChange={(e) => setNewInvestment({...newInvestment, name: e.target.value})}
                      placeholder="e.g., Apple Stock"
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Investment Type</Label>
                    <Input
                      id="type"
                      value={newInvestment.type}
                      onChange={(e) => setNewInvestment({...newInvestment, type: e.target.value})}
                      placeholder="e.g., Stocks, Bonds, Real Estate"
                    />
                  </div>
                  <div>
                    <Label htmlFor="initialInvestment">Initial Investment</Label>
                    <Input
                      id="initialInvestment"
                      type="number"
                      value={newInvestment.initial_investment || ""}
                      onChange={(e) => setNewInvestment({...newInvestment, initial_investment: parseFloat(e.target.value) || 0})}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="currentValue">Current Value</Label>
                    <Input
                      id="currentValue"
                      type="number"
                      value={newInvestment.current_value || ""}
                      onChange={(e) => setNewInvestment({...newInvestment, current_value: parseFloat(e.target.value) || 0})}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="purchaseDate">Purchase Date</Label>
                    <Input
                      id="purchaseDate"
                      type="date"
                      value={newInvestment.purchase_date}
                      onChange={(e) => setNewInvestment({...newInvestment, purchase_date: e.target.value})}
                    />
                  </div>
                  <Button 
                    onClick={handleAddInvestment} 
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      "Add Investment"
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {investments.map((investment) => {
              const change = investment.current_value - investment.initial_investment;
              const changePercent = investment.initial_investment > 0 ? (change / investment.initial_investment) * 100 : 0;
              
              return (
                <div key={investment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div>
                    <h3 className="font-semibold text-foreground">{investment.name}</h3>
                    <Badge variant="outline" className="mt-1">
                      {investment.type}
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-1">
                      Purchased: {new Date(investment.purchase_date).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-semibold">
                      {formatCurrency(investment.current_value, profile?.currency || "USD")}
                    </p>
                    <div className={`flex items-center gap-1 ${change >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {change >= 0 ? 
                        <TrendingUp className="w-4 h-4" /> : 
                        <TrendingDown className="w-4 h-4" />
                      }
                      <span>
                        {change >= 0 ? '+' : ''}{formatCurrency(Math.abs(change), profile?.currency || "USD")} 
                        ({changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%)
                      </span>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateValue(investment.id)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Update
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteInvestment(investment.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => setUpdateDialogState({
                      isOpen: true,
                      investmentId: investment.id
                    })}
                  >
                    Update Value
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      </div>

      <UpdateValueDialog
      open={updateDialogState.isOpen}
      onOpenChange={(open) => setUpdateDialogState(prev => ({ ...prev, isOpen: open }))}
      onSubmit={(value) => {
        if (updateDialogState.investmentId) {
          handleUpdateValue(updateDialogState.investmentId, value);
        }
      }}
      title="Update Investment Value"
      description="Enter the new current value of your investment"
      label="Current Value"
      defaultValue={investments.find(inv => inv.id === updateDialogState.investmentId)?.currentValue}
    />
    </>
  );
};

export default InvestmentTracking;