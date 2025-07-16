import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
  const [loading, setLoading] = useState(true);
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

      const { data, error: fetchError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setNotifications((data || []) as Notification[]);
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
      const { data, error: insertError } = await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          priority: notification.priority,
          read: notification.read,
          data: notification.data,
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      setNotifications(prev => [data as Notification, ...prev]);
      
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
    if (!user) return false;

    try {
      const { data, error: updateError } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, read: true, updated_at: data.updated_at }
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
    if (!user) return false;

    try {
      const { error: updateError } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (updateError) {
        throw updateError;
      }

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
    if (!user) return false;

    try {
      const { error: deleteError } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (deleteError) {
        throw deleteError;
      }

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