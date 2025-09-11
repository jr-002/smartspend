// Offline functionality manager
import { toast } from '@/hooks/use-toast';
import { logger } from './environment-config';

interface OfflineAction {
  id: string;
  type: string;
  data: Record<string, unknown>;
  timestamp: number;
  retries: number;
}

class OfflineManager {
  private isOnline: boolean = navigator.onLine;
  private pendingActions: OfflineAction[] = [];
  private maxRetries = 3;
  private storageKey = 'smartspend_offline_actions';

  constructor() {
    this.initializeEventListeners();
    this.loadPendingActions();
    this.processPendingActions();
  }

  private initializeEventListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      logger.info('Connection restored');
      toast({
        title: "Connection Restored",
        description: "Syncing offline changes...",
      });
      this.processPendingActions();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      logger.info('Connection lost');
      toast({
        title: "Offline Mode",
        description: "Changes will be synced when connection is restored.",
        variant: "destructive",
      });
    });
  }

  private loadPendingActions() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.pendingActions = JSON.parse(stored);
      }
    } catch (error) {
      logger.error('Failed to load pending actions:', error);
      this.pendingActions = [];
    }
  }

  private savePendingActions() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.pendingActions));
    } catch (error) {
      logger.error('Failed to save pending actions:', error);
    }
  }

  public queueAction(type: string, data: Record<string, unknown>): string {
    const action: OfflineAction = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      timestamp: Date.now(),
      retries: 0,
    };

    this.pendingActions.push(action);
    this.savePendingActions();

    if (this.isOnline) {
      this.processPendingActions();
    }

    return action.id;
  }

  private async processPendingActions() {
    if (!this.isOnline || this.pendingActions.length === 0) {
      return;
    }

    const actionsToProcess = [...this.pendingActions];
    const successfulActions: string[] = [];

    for (const action of actionsToProcess) {
      try {
        await this.executeAction(action);
        successfulActions.push(action.id);
        logger.info(`Offline action synced: ${action.type}`);
      } catch (error) {
        action.retries++;
        logger.error(`Failed to sync action ${action.type}:`, error);

        if (action.retries >= this.maxRetries) {
          successfulActions.push(action.id); // Remove failed actions after max retries
          logger.error(`Action ${action.type} failed after ${this.maxRetries} retries`);
        }
      }
    }

    // Remove successful actions
    this.pendingActions = this.pendingActions.filter(
      action => !successfulActions.includes(action.id)
    );
    this.savePendingActions();

    if (successfulActions.length > 0) {
      toast({
        title: "Sync Complete",
        description: `${successfulActions.length} offline changes synced successfully.`,
      });
    }
  }

  private async executeAction(action: OfflineAction): Promise<void> {
    // This would integrate with your actual API calls
    // For now, we'll simulate the API calls
    switch (action.type) {
      case 'CREATE_TRANSACTION':
        // await createTransaction(action.data);
        break;
      case 'UPDATE_BUDGET':
        // await updateBudget(action.data);
        break;
      case 'CREATE_SAVINGS_GOAL':
        // await createSavingsGoal(action.data);
        break;
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  public isOffline(): boolean {
    return !this.isOnline;
  }

  public getPendingActionsCount(): number {
    return this.pendingActions.length;
  }

  public clearPendingActions(): void {
    this.pendingActions = [];
    this.savePendingActions();
  }
}

export const offlineManager = new OfflineManager();

// Service Worker registration
export const registerServiceWorker = async (): Promise<void> => {
  if ('serviceWorker' in navigator && 'caches' in window) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              toast({
                title: "App Updated",
                description: "A new version is available. Refresh to update.",
              });
            }
          });
        }
      });

      logger.info('Service Worker registered:', registration);
    } catch (error) {
      logger.error('Service Worker registration failed:', error);
    }
  }
};