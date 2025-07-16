import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'budget' | 'bill' | 'goal' | 'investment' | 'spending' | 'system';
  priority: 'high' | 'medium' | 'low';
  read: boolean;
  data?: any;
  created_at: string;
  updated_at: string;
}

export interface NotificationSettings {
  budgetAlerts: boolean;
  billReminders: boolean;
  goalUpdates: boolean;
  investmentAlerts: boolean;
  spendingAlerts: boolean;
  weeklyReports: boolean;
  pushNotifications: boolean;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<NotificationSettings>({
    budgetAlerts: true,
    billReminders: true,
    goalUpdates: true,
    investmentAlerts: true,
    spendingAlerts: true,
    weeklyReports: false,
    pushNotifications: false,
  });
  const { user } = useAuth();

  const fetchNotifications = async () => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Mock notifications data until table is created
      const mockNotifications: Notification[] = [
        {
          id: '1',
          title: 'Budget Alert',
          message: 'You have exceeded 80% of your food budget for this month',
          type: 'budget',
          priority: 'high',
          read: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Bill Reminder',
          message: 'Your electricity bill is due in 3 days',
          type: 'bill',
          priority: 'medium',
          read: false,
          created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          updated_at: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: '3',
          title: 'Savings Goal Achievement',
          message: 'Congratulations! You reached 75% of your vacation savings goal',
          type: 'goal',
          priority: 'low',
          read: true,
          created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          updated_at: new Date(Date.now() - 172800000).toISOString()
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setNotifications(mockNotifications);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications');
      toast({
        title: "Error",
        description: "Failed to load notifications. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addNotification = async (notification: Omit<Notification, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create notifications.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const newNotification: Notification = {
        ...notification,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setNotifications(prev => [newNotification, ...prev]);
      
      toast({
        title: "Notification Created",
        description: notification.title,
      });
      return true;
    } catch (err) {
      console.error('Error adding notification:', err);
      toast({
        title: "Error",
        description: "Failed to create notification. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const markAsRead = async (id: string): Promise<boolean> => {
    try {
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, read: true, updated_at: new Date().toISOString() }
            : notification
        )
      );
      return true;
    } catch (err) {
      console.error('Error marking notification as read:', err);
      return false;
    }
  };

  const markAllAsRead = async (): Promise<boolean> => {
    try {
      setNotifications(prev => 
        prev.map(notification => ({ 
          ...notification, 
          read: true, 
          updated_at: new Date().toISOString() 
        }))
      );
      
      toast({
        title: "Success",
        description: "All notifications marked as read.",
      });
      return true;
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      toast({
        title: "Error",
        description: "Failed to mark notifications as read. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteNotification = async (id: string): Promise<boolean> => {
    try {
      setNotifications(prev => prev.filter(notification => notification.id !== id));
      
      toast({
        title: "Success",
        description: "Notification deleted successfully.",
      });
      return true;
    } catch (err) {
      console.error('Error deleting notification:', err);
      toast({
        title: "Error",
        description: "Failed to delete notification. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateSettings = async (newSettings: Partial<NotificationSettings>): Promise<boolean> => {
    try {
      setSettings(prev => ({ ...prev, ...newSettings }));
      
      toast({
        title: "Settings Updated",
        description: "Your notification preferences have been saved.",
      });
      return true;
    } catch (err) {
      console.error('Error updating notification settings:', err);
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  return {
    notifications,
    loading,
    error,
    settings,
    unreadCount: notifications.filter(n => !n.read).length,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    updateSettings,
    refetch: fetchNotifications,
  };
};