// Simple event emitter for gamification events
// This avoids circular dependencies between hooks

type GamificationEventType = 
  | 'transaction_added'
  | 'savings_goal_created'
  | 'savings_goal_updated'
  | 'savings_goal_completed'
  | 'budget_created'
  | 'debt_payment'
  | 'debt_paid_off';

interface GamificationEventData {
  type: GamificationEventType;
  data?: Record<string, unknown>;
}

type EventListener = (event: GamificationEventData) => void;

class GamificationEventEmitter {
  private listeners: EventListener[] = [];

  subscribe(listener: EventListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  emit(event: GamificationEventData): void {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in gamification event listener:', error);
      }
    });
  }
}

export const gamificationEvents = new GamificationEventEmitter();

// Helper functions to emit events
export function emitTransactionAdded(): void {
  gamificationEvents.emit({ type: 'transaction_added' });
}

export function emitSavingsGoalCreated(): void {
  gamificationEvents.emit({ type: 'savings_goal_created' });
}

export function emitSavingsGoalUpdated(currentAmount: number, targetAmount: number): void {
  gamificationEvents.emit({ 
    type: 'savings_goal_updated',
    data: { currentAmount, targetAmount }
  });
}

export function emitSavingsGoalCompleted(): void {
  gamificationEvents.emit({ type: 'savings_goal_completed' });
}

export function emitBudgetCreated(): void {
  gamificationEvents.emit({ type: 'budget_created' });
}

export function emitDebtPayment(): void {
  gamificationEvents.emit({ type: 'debt_payment' });
}

export function emitDebtPaidOff(): void {
  gamificationEvents.emit({ type: 'debt_paid_off' });
}
