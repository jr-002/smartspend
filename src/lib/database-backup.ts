// Database backup and recovery utilities
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface BackupData {
  timestamp: string;
  version: string;
  tables: {
    profiles: unknown[];
    transactions: unknown[];
    budgets: unknown[];
    savings_goals: unknown[];
    bills: unknown[];
    investments: unknown[];
    debts: unknown[];
    notifications: unknown[];
  };
  metadata: {
    totalRecords: number;
    backupSize: number;
    userId: string;
  };
}

export class DatabaseBackupManager {
  private static instance: DatabaseBackupManager;

  static getInstance(): DatabaseBackupManager {
    if (!DatabaseBackupManager.instance) {
      DatabaseBackupManager.instance = new DatabaseBackupManager();
    }
    return DatabaseBackupManager.instance;
  }

  async createUserDataBackup(userId: string): Promise<BackupData | null> {
    try {
      console.log('Creating backup for user:', userId);

      // Fetch all user data in parallel
      const [
        profileResult,
        transactionsResult,
        budgetsResult,
        savingsGoalsResult,
        billsResult,
        investmentsResult,
        debtsResult,
        notificationsResult
      ] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId),
        supabase.from('transactions').select('*').eq('user_id', userId),
        supabase.from('budgets').select('*').eq('user_id', userId),
        supabase.from('savings_goals').select('*').eq('user_id', userId),
        supabase.from('bills').select('*').eq('user_id', userId),
        supabase.from('investments').select('*').eq('user_id', userId),
        supabase.from('debts').select('*').eq('user_id', userId),
        supabase.from('notifications').select('*').eq('user_id', userId)
      ]);

      // Check for errors
      const results = [
        profileResult,
        transactionsResult,
        budgetsResult,
        savingsGoalsResult,
        billsResult,
        investmentsResult,
        debtsResult,
        notificationsResult
      ];

      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        console.error('Backup errors:', errors);
        throw new Error(`Failed to backup some data: ${errors.map(e => e.error?.message).join(', ')}`);
      }

      const backupData: BackupData = {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        tables: {
          profiles: profileResult.data || [],
          transactions: transactionsResult.data || [],
          budgets: budgetsResult.data || [],
          savings_goals: savingsGoalsResult.data || [],
          bills: billsResult.data || [],
          investments: investmentsResult.data || [],
          debts: debtsResult.data || [],
          notifications: notificationsResult.data || []
        },
        metadata: {
          totalRecords: results.reduce((sum, result) => sum + (result.data?.length || 0), 0),
          backupSize: JSON.stringify(results).length,
          userId
        }
      };

      console.log('Backup created successfully:', {
        totalRecords: backupData.metadata.totalRecords,
        backupSize: `${Math.round(backupData.metadata.backupSize / 1024)}KB`
      });

      return backupData;
    } catch (error) {
      console.error('Error creating backup:', error);
      toast({
        title: "Backup Failed",
        description: "Failed to create data backup. Please try again.",
        variant: "destructive"
      });
      return null;
    }
  }

  async exportUserData(userId: string): Promise<void> {
    const backup = await this.createUserDataBackup(userId);
    if (!backup) return;

    try {
      const dataStr = JSON.stringify(backup, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `smartspend-backup-${new Date().toISOString().split('T')[0]}.json`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);

      toast({
        title: "Export Complete",
        description: "Your data has been exported successfully.",
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive"
      });
    }
  }

  async validateBackupData(backupData: unknown): Promise<boolean> {
    try {
      if (!backupData || typeof backupData !== 'object') {
        return false;
      }

      const backup = backupData as Record<string, unknown>;
      
      // Check required structure
      const requiredFields = ['timestamp', 'version', 'tables', 'metadata'];
      for (const field of requiredFields) {
        if (!(field in backup)) {
          console.error(`Missing required field: ${field}`);
          return false;
        }
      }

      // Validate tables structure
      const tables = backup.tables as Record<string, unknown>;
      const requiredTables = ['profiles', 'transactions', 'budgets', 'savings_goals', 'bills'];
      
      for (const table of requiredTables) {
        if (!(table in tables) || !Array.isArray(tables[table])) {
          console.error(`Invalid table structure: ${table}`);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error validating backup data:', error);
      return false;
    }
  }

  async scheduleAutomaticBackup(userId: string): Promise<void> {
    // In a production environment, this would integrate with a backup service
    // For now, we'll create a local backup reminder
    
    const lastBackup = localStorage.getItem(`last-backup-${userId}`);
    const now = Date.now();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;

    if (!lastBackup || now - parseInt(lastBackup) > oneWeek) {
      toast({
        title: "Backup Reminder",
        description: "Consider backing up your financial data regularly for safety.",
      });
      
      localStorage.setItem(`last-backup-${userId}`, now.toString());
    }
  }
}

export const backupManager = DatabaseBackupManager.getInstance();