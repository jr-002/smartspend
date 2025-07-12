import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Calendar, CreditCard, Zap, Wifi, Phone, Car } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Bill {
  id: string;
  name: string;
  provider: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  category: string;
  icon: React.ReactNode;
}

const BillPayments = () => {
  const [bills] = useState<Bill[]>([
    {
      id: "1",
      name: "Electricity Bill",
      provider: "EKEDC",
      amount: 12500,
      dueDate: "2025-01-20",
      status: "pending",
      category: "Utilities",
      icon: <Zap className="w-5 h-5" />
    },
    {
      id: "2",
      name: "Internet Subscription",
      provider: "MTN",
      amount: 8000,
      dueDate: "2025-01-18",
      status: "pending",
      category: "Internet",
      icon: <Wifi className="w-5 h-5" />
    },
    {
      id: "3",
      name: "Phone Bill",
      provider: "Airtel",
      amount: 3500,
      dueDate: "2025-01-15",
      status: "paid",
      category: "Mobile",
      icon: <Phone className="w-5 h-5" />
    },
    {
      id: "4",
      name: "Car Insurance",
      provider: "AIICO Insurance",
      amount: 45000,
      dueDate: "2025-01-25",
      status: "pending",
      category: "Insurance",
      icon: <Car className="w-5 h-5" />
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-success text-success-foreground';
      case 'pending': return 'bg-warning text-warning-foreground';
      case 'overdue': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const upcomingBills = bills.filter(bill => bill.status === 'pending' && getDaysUntilDue(bill.dueDate) <= 7);

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
          <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
            <CreditCard className="w-6 h-6" />
            Bill Payments & Reminders
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="grid gap-4">
            {bills.map((bill) => {
              const daysUntilDue = getDaysUntilDue(bill.dueDate);
              
              return (
                <div key={bill.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      {bill.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{bill.name}</h3>
                      <p className="text-sm text-muted-foreground">{bill.provider}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Due: {new Date(bill.dueDate).toLocaleDateString()}
                          {bill.status === 'pending' && (
                            <span className={`ml-2 ${daysUntilDue <= 3 ? 'text-destructive' : 'text-warning'}`}>
                              ({daysUntilDue > 0 ? `${daysUntilDue} days left` : 'Overdue'})
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold text-foreground">₦{bill.amount.toLocaleString()}</p>
                      <Badge className={getStatusColor(bill.status)}>
                        {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                      </Badge>
                    </div>
                    
                    {bill.status === 'pending' && (
                      <Button size="sm" className="bg-gradient-primary">
                        Pay Now
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-6 pt-6 border-t">
            <Button variant="outline" className="w-full">
              Add New Bill
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BillPayments;