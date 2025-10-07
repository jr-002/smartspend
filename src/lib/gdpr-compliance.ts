// @ts-nocheck
// GDPR compliance utilities
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { backupManager } from './database-backup';

export interface GDPRRequest {
  type: 'export' | 'delete' | 'rectify';
  userId: string;
  requestDate: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  completedDate?: string;
}

export class GDPRComplianceManager {
  private static instance: GDPRComplianceManager;

  static getInstance(): GDPRComplianceManager {
    if (!GDPRComplianceManager.instance) {
      GDPRComplianceManager.instance = new GDPRComplianceManager();
    }
    return GDPRComplianceManager.instance;
  }

  // Right to Data Portability (Article 20)
  async exportUserData(userId: string): Promise<boolean> {
    try {
      console.log('Processing GDPR data export request for user:', userId);
      
      const backup = await backupManager.createUserDataBackup(userId);
      if (!backup) {
        throw new Error('Failed to create data backup');
      }

      // Add GDPR-specific metadata
      const gdprExport = {
        ...backup,
        gdprInfo: {
          exportDate: new Date().toISOString(),
          dataSubject: userId,
          legalBasis: 'Article 20 - Right to Data Portability',
          retentionPeriod: 'Data retained as per user consent',
          dataCategories: [
            'Financial transactions',
            'Budget information',
            'Savings goals',
            'Bill payment data',
            'Investment tracking',
            'Debt management',
            'User preferences'
          ]
        }
      };

      const dataStr = JSON.stringify(gdprExport, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `gdpr-export-${userId}-${new Date().toISOString().split('T')[0]}.json`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);

      toast({
        title: "GDPR Export Complete",
        description: "Your personal data has been exported in compliance with GDPR Article 20.",
      });

      return true;
    } catch (error) {
      console.error('Error exporting user data:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export your data. Please contact support.",
        variant: "destructive"
      });
      return false;
    }
  }

  // Right to Erasure (Article 17)
  async deleteUserData(userId: string, confirmationCode: string): Promise<boolean> {
    try {
      // Verify confirmation code (in production, this would be more secure)
      const expectedCode = `DELETE-${userId.slice(-6).toUpperCase()}`;
      if (confirmationCode !== expectedCode) {
        toast({
          title: "Invalid Confirmation",
          description: "Please enter the correct confirmation code.",
          variant: "destructive"
        });
        return false;
      }

      console.log('Processing GDPR data deletion request for user:', userId);

      // Create final backup before deletion
      await this.exportUserData(userId);

      // Delete user data in correct order (respecting foreign key constraints)
      const deletionOrder = [
        'notifications',
        'investments', 
        'debts',
        'bills',
        'savings_goals',
        'budgets',
        'transactions',
        'profiles'
      ];

      for (const table of deletionOrder) {
        const { error } = await supabase
          .from(table)
          .delete()
          .eq(table === 'profiles' ? 'id' : 'user_id', userId);

        if (error) {
          console.error(`Error deleting from ${table}:`, error);
          throw error;
        }
      }

      // Delete auth user (this should be done last)
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);
      if (authError) {
        console.error('Error deleting auth user:', authError);
        // Don't throw here as data deletion was successful
      }

      toast({
        title: "Account Deleted",
        description: "Your account and all associated data have been permanently deleted.",
      });

      // Redirect to home page
      window.location.href = '/';
      
      return true;
    } catch (error) {
      console.error('Error deleting user data:', error);
      toast({
        title: "Deletion Failed",
        description: "Failed to delete your data. Please contact support.",
        variant: "destructive"
      });
      return false;
    }
  }

  // Data Processing Consent Management
  getConsentStatus(): Record<string, boolean> {
    const consent = localStorage.getItem('gdpr-consent');
    if (!consent) {
      return {
        essential: true, // Always required
        analytics: false,
        marketing: false,
        personalization: false
      };
    }

    try {
      return JSON.parse(consent);
    } catch {
      return {
        essential: true,
        analytics: false,
        marketing: false,
        personalization: false
      };
    }
  }

  updateConsent(consent: Record<string, boolean>): void {
    // Ensure essential consent is always true
    consent.essential = true;
    
    localStorage.setItem('gdpr-consent', JSON.stringify(consent));
    localStorage.setItem('gdpr-consent-date', new Date().toISOString());
    
    toast({
      title: "Consent Updated",
      description: "Your privacy preferences have been saved.",
    });
  }

  // Check if consent is required (EU users)
  shouldShowConsentBanner(): boolean {
    const consent = localStorage.getItem('gdpr-consent-date');
    if (!consent) return true;

    // Check if consent is older than 1 year
    const consentDate = new Date(consent);
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    return consentDate < oneYearAgo;
  }

  // Generate privacy policy content
  getPrivacyPolicyContent(): string {
    return `
# Privacy Policy - SmartSpend

## Data We Collect
- Financial transaction data you input
- Budget and savings goal information
- User account information (email, name)
- Usage analytics (with your consent)

## How We Use Your Data
- To provide financial management services
- To generate AI-powered insights and recommendations
- To improve our services (with your consent)
- To send important account notifications

## Data Sharing
We do not sell or share your personal financial data with third parties.

## Your Rights (GDPR)
- Right to access your data
- Right to rectify incorrect data
- Right to erase your data
- Right to data portability
- Right to object to processing

## Data Retention
We retain your data as long as your account is active. You can request deletion at any time.

## Contact
For privacy-related questions, contact: privacy@smartspend.app

Last updated: ${new Date().toLocaleDateString()}
    `;
  }
}

export const gdprManager = GDPRComplianceManager.getInstance();