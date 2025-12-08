import { supabase } from '@/integrations/supabase/client';

// Enhanced session security management
export interface SessionConfig {
  maxAge: number; // in milliseconds
  renewThreshold: number; // renew when this much time is left
  maxInactivity: number; // max idle time before logout
  requireReauth: string[]; // operations requiring re-authentication
}

export class SessionSecurityManager {
  private static instance: SessionSecurityManager;
  private config: SessionConfig;
  private lastActivity: number = Date.now();
  private sessionTimer: NodeJS.Timeout | null = null;
  private inactivityTimer: NodeJS.Timeout | null = null;

  static getInstance(): SessionSecurityManager {
    if (!SessionSecurityManager.instance) {
      SessionSecurityManager.instance = new SessionSecurityManager();
    }
    return SessionSecurityManager.instance;
  }

  constructor() {
    this.config = {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      renewThreshold: 2 * 60 * 60 * 1000, // 2 hours
      maxInactivity: 30 * 60 * 1000, // 30 minutes
      requireReauth: [
        'delete-account',
        'export-data',
        'change-password',
        'update-security-settings'
      ]
    };

    this.initializeActivityTracking();
    this.startSessionMonitoring();
  }

  private initializeActivityTracking(): void {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const updateActivity = () => {
      this.lastActivity = Date.now();
      this.resetInactivityTimer();
    };

    events.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });
  }

  private startSessionMonitoring(): void {
    // Check session validity every minute
    this.sessionTimer = setInterval(() => {
      this.checkSessionValidity();
    }, 60000);

    this.resetInactivityTimer();
  }

  private resetInactivityTimer(): void {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
    }

    this.inactivityTimer = setTimeout(() => {
      this.handleInactivityTimeout();
    }, this.config.maxInactivity);
  }

  private async checkSessionValidity(): Promise<void> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      // Only handle session issues if user was previously logged in
      // Don't redirect unauthenticated users - they haven't signed in yet
      if (error || !session) {
        // Check if user was previously authenticated by looking for auth storage
        const hasAuthHistory = localStorage.getItem('sb-gxvsmnmgrxovbsmdkdqf-auth-token');
        if (hasAuthHistory) {
          console.warn('Session expired, clearing auth state');
          this.handleSessionExpiry();
        }
        return;
      }

      // Check if session is about to expire by checking expires_at
      if (session.expires_at) {
        const expiresAt = new Date(session.expires_at * 1000).getTime();
        const timeUntilExpiry = expiresAt - Date.now();

        // Auto-renew if close to expiry
        if (timeUntilExpiry < this.config.renewThreshold) {
          await this.renewSession();
        }
      }
    } catch (error) {
      console.error('Error checking session validity:', error);
    }
  }

  private async renewSession(): Promise<void> {
    try {
      const { error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Failed to renew session:', error);
        this.handleSessionExpiry();
      } else {
        console.log('Session renewed successfully');
      }
    } catch (error) {
      console.error('Error renewing session:', error);
      this.handleSessionExpiry();
    }
  }

  private handleInactivityTimeout(): void {
    console.log('Session expired due to inactivity');
    
    // Show warning before logout
    const shouldLogout = confirm(
      'Your session has been inactive for 30 minutes. Would you like to continue or sign out for security?'
    );

    if (shouldLogout) {
      this.handleSessionExpiry();
    } else {
      this.lastActivity = Date.now();
      this.resetInactivityTimer();
    }
  }

  private handleSessionExpiry(): void {
    // Clear timers
    if (this.sessionTimer) clearInterval(this.sessionTimer);
    if (this.inactivityTimer) clearTimeout(this.inactivityTimer);

    // Clear local storage
    localStorage.removeItem('supabase.auth.token');
    
    // Redirect to login
    window.location.href = '/';
  }

  // Check if operation requires re-authentication
  requiresReauth(operation: string): boolean {
    return this.config.requireReauth.includes(operation);
  }

  // Get session status for UI
  getSessionStatus(): {
    isActive: boolean;
    timeUntilExpiry: number;
    timeUntilInactivity: number;
    lastActivity: number;
  } {
    const now = Date.now();
    const timeSinceActivity = now - this.lastActivity;
    
    return {
      isActive: timeSinceActivity < this.config.maxInactivity,
      timeUntilExpiry: this.config.maxAge - timeSinceActivity,
      timeUntilInactivity: this.config.maxInactivity - timeSinceActivity,
      lastActivity: this.lastActivity
    };
  }

  // Cleanup on app unmount
  cleanup(): void {
    if (this.sessionTimer) clearInterval(this.sessionTimer);
    if (this.inactivityTimer) clearTimeout(this.inactivityTimer);
  }
}

export const sessionSecurity = SessionSecurityManager.getInstance();