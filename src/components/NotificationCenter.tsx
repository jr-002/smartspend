import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Bell, Settings, AlertTriangle, TrendingUp, Target, CreditCard, Calendar } from "lucide-react";

interface Notification {
  id: string;
  type: 'budget' | 'bill' | 'goal' | 'investment' | 'spending';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
}

interface NotificationSettings {
  budgetAlerts: boolean;
  billReminders: boolean;
  goalUpdates: boolean;
  investmentAlerts: boolean;
  spendingAlerts: boolean;
  weeklyReports: boolean;
  pushNotifications: boolean;
}

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "budget",
      title: "Budget Alert",
      message: "You've spent 85% of your food budget for this month (₦42,500 of ₦50,000).",
      timestamp: "2025-01-15T10:30:00Z",
      read: false,
      priority: "high"
    },
    {
      id: "2",
      type: "bill",
      title: "Bill Due Soon",
      message: "Your electricity bill of ₦12,500 is due in 3 days.",
      timestamp: "2025-01-15T09:15:00Z",
      read: false,
      priority: "medium"
    },
    {
      id: "3",
      type: "goal",
      title: "Savings Goal Update",
      message: "Great progress! You're 65% toward your vacation goal.",
      timestamp: "2025-01-14T16:45:00Z",
      read: true,
      priority: "low"
    },
    {
      id: "4",
      type: "investment",
      title: "Portfolio Performance",
      message: "Your investments gained ₦15,000 this week (+2.1%).",
      timestamp: "2025-01-14T14:20:00Z",
      read: true,
      priority: "medium"
    },
    {
      id: "5",
      type: "spending",
      title: "Unusual Spending",
      message: "Your shopping expenses this week are 40% higher than usual.",
      timestamp: "2025-01-13T11:30:00Z",
      read: false,
      priority: "high"
    }
  ]);

  const [settings, setSettings] = useState<NotificationSettings>({
    budgetAlerts: true,
    billReminders: true,
    goalUpdates: true,
    investmentAlerts: true,
    spendingAlerts: true,
    weeklyReports: false,
    pushNotifications: true
  });

  const [showSettings, setShowSettings] = useState(false);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'budget': return <AlertTriangle className="w-5 h-5" />;
      case 'bill': return <CreditCard className="w-5 h-5" />;
      case 'goal': return <Target className="w-5 h-5" />;
      case 'investment': return <TrendingUp className="w-5 h-5" />;
      case 'spending': return <Calendar className="w-5 h-5" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-destructive text-destructive-foreground';
      case 'medium': return 'bg-warning text-warning-foreground';
      case 'low': return 'bg-success text-success-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'budget': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'bill': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'goal': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'investment': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'spending': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const updateSetting = (key: keyof NotificationSettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Card className="shadow-card bg-gradient-card border-0">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Bell className="w-6 h-6" />
            Notifications
            {unreadCount > 0 && (
              <Badge className="bg-destructive text-destructive-foreground">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              Mark All Read
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {showSettings ? (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground">Notification Preferences</h3>
            
            <div className="space-y-4">
              {Object.entries(settings).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-foreground">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {key === 'budgetAlerts' && 'Get notified when you approach budget limits'}
                      {key === 'billReminders' && 'Reminders for upcoming bill payments'}
                      {key === 'goalUpdates' && 'Updates on your savings goals progress'}
                      {key === 'investmentAlerts' && 'Investment performance and market updates'}
                      {key === 'spendingAlerts' && 'Unusual spending pattern notifications'}
                      {key === 'weeklyReports' && 'Weekly financial summary reports'}
                      {key === 'pushNotifications' && 'Enable push notifications on this device'}
                    </p>
                  </div>
                  <Switch
                    checked={value}
                    onCheckedChange={(checked) => updateSetting(key as keyof NotificationSettings, checked)}
                  />
                </div>
              ))}
            </div>
            
            <Button onClick={() => setShowSettings(false)} className="w-full">
              Done
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No notifications</h3>
                <p className="text-muted-foreground">
                  You're all caught up! We'll notify you when something important happens.
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-4 border rounded-lg transition-colors ${
                    notification.read 
                      ? 'bg-card/30 border-border/50' 
                      : 'bg-card border-primary/20 shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${getTypeColor(notification.type)}`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className={`font-semibold ${notification.read ? 'text-muted-foreground' : 'text-foreground'}`}>
                            {notification.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getTypeColor(notification.type)}>
                              {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                            </Badge>
                            <Badge className={getPriorityColor(notification.priority)}>
                              {notification.priority.charAt(0).toUpperCase() + notification.priority.slice(1)}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex gap-1">
                          {!notification.read && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                            >
                              Mark Read
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => clearNotification(notification.id)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            ×
                          </Button>
                        </div>
                      </div>
                      
                      <p className={`text-sm ${notification.read ? 'text-muted-foreground' : 'text-foreground'}`}>
                        {notification.message}
                      </p>
                      
                      <p className="text-xs text-muted-foreground">
                        {new Date(notification.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationCenter;