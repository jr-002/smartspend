// Enhanced monitoring and alerting system
import { captureException, captureMessage } from '@/lib/sentry';
import { supabase } from '@/integrations/supabase/client';

export interface MonitoringEvent {
  type: 'error' | 'warning' | 'info' | 'security' | 'performance';
  category: string;
  message: string;
  metadata?: Record<string, unknown>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  timestamp: number;
}

export interface PerformanceMetric {
  operation: string;
  duration: number;
  status: 'success' | 'error';
  metadata?: Record<string, unknown>;
}

export interface SecurityEvent {
  type: 'rate_limit_exceeded' | 'invalid_auth' | 'injection_attempt' | 'suspicious_activity';
  details: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
}

class EnhancedMonitor {
  private static instance: EnhancedMonitor;
  private performanceMetrics: Map<string, number> = new Map();
  private errorPatterns: Map<string, number> = new Map();
  private securityEvents: SecurityEvent[] = [];
  private alertThresholds = {
    errorRate: 10, // errors per minute
    slowOperation: 5000, // 5 seconds
    securityEvents: 5, // events per minute
  };

  static getInstance(): EnhancedMonitor {
    if (!EnhancedMonitor.instance) {
      EnhancedMonitor.instance = new EnhancedMonitor();
    }
    return EnhancedMonitor.instance;
  }

  // Enhanced error tracking with pattern detection
  trackError(error: Error, context: Record<string, unknown> = {}) {
    const errorKey = `${error.name}:${error.message.substring(0, 100)}`;
    const count = this.errorPatterns.get(errorKey) || 0;
    this.errorPatterns.set(errorKey, count + 1);

    // Log to monitoring service
    captureException(error, {
      tags: {
        category: (context.category as string) || 'general',
        severity: (context.severity as string) || 'medium',
      },
      extra: {
        ...context,
        errorCount: count + 1,
        timestamp: Date.now(),
      },
    });

    // Log locally for development
    console.error('Enhanced Monitor - Error tracked:', {
      error: error.message,
      context,
      count: count + 1,
    });

    // Check for error patterns
    if (count + 1 >= 5) {
      this.triggerAlert({
        type: 'error',
        category: 'error_pattern',
        message: `Repeated error detected: ${error.message}`,
        metadata: { errorKey, count: count + 1 },
        severity: 'high',
        timestamp: Date.now(),
      });
    }
  }

  // Performance monitoring with automatic alerts
  startTimer(operation: string): void {
    this.performanceMetrics.set(operation, performance.now());
  }

  endTimer(operation: string, metadata: Record<string, unknown> = {}): number {
    const startTime = this.performanceMetrics.get(operation);
    if (!startTime) {
      console.warn(`No start time found for operation: ${operation}`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.performanceMetrics.delete(operation);

    // Log performance metric locally
    console.log('Performance metric:', {
      operation,
      duration,
      status: 'success',
      metadata,
    });

    // Alert on slow operations
    if (duration > this.alertThresholds.slowOperation) {
      this.triggerAlert({
        type: 'performance',
        category: 'slow_operation',
        message: `Slow operation detected: ${operation}`,
        metadata: { duration, ...metadata },
        severity: duration > 10000 ? 'high' : 'medium',
        timestamp: Date.now(),
      });
    }

    return duration;
  }

  // Security event tracking
  trackSecurityEvent(event: SecurityEvent) {
    this.securityEvents.push({
      ...event,
      timestamp: Date.now(),
    } as SecurityEvent & { timestamp: number });

    // Clean old events (keep last hour)
    const oneHourAgo = Date.now() - 3600000;
    this.securityEvents = this.securityEvents.filter(
      e => ('timestamp' in e && typeof e.timestamp === 'number' && e.timestamp > oneHourAgo)
    );

    // Log security event
    captureMessage(`Security Event: ${event.type}`, {
      level: 'warning',
      extra: { ...event },
    });

    // Log locally for development
    console.warn('Security event tracked:', event);

    // Check for security alert thresholds
    const recentEvents = this.securityEvents.filter(
      e => ('timestamp' in e && typeof e.timestamp === 'number' && e.timestamp > Date.now() - 60000) // last minute
    );

    if (recentEvents.length >= this.alertThresholds.securityEvents) {
      this.triggerAlert({
        type: 'security',
        category: 'security_threshold',
        message: `High security event rate detected`,
        metadata: {
          eventCount: recentEvents.length,
          events: recentEvents.map(e => e.type),
        },
        severity: 'critical',
        timestamp: Date.now(),
      });
    }
  }

  // Performance metric tracking
  private trackPerformance(metric: PerformanceMetric) {
    // Log performance data locally
    console.log('Performance metric:', metric);
  }

  // Alert system
  private triggerAlert(event: MonitoringEvent) {
    console.warn(`🚨 ALERT [${event.severity.toUpperCase()}]:`, event);

    // Send to monitoring service
    captureMessage(`Alert: ${event.message}`, {
      level: event.severity === 'critical' ? 'error' : 'warning',
      tags: {
        alert: true,
        category: event.category,
        severity: event.severity,
      },
      extra: event.metadata,
    });

    // In production, this would integrate with:
    // - Slack/Discord notifications
    // - PagerDuty for critical alerts
    // - Email notifications for team
    // - SMS for critical security events
  }

  // Log events locally (database persistence would require migration)
  private logEvent(event: MonitoringEvent) {
    console.log('Monitoring event:', {
      type: event.type,
      category: event.category,
      message: event.message,
      severity: event.severity,
      timestamp: new Date(event.timestamp).toISOString(),
    });
  }

  // Get security event severity
  private getSecuritySeverity(eventType: string): 'low' | 'medium' | 'high' | 'critical' {
    switch (eventType) {
      case 'injection_attempt':
        return 'critical';
      case 'rate_limit_exceeded':
        return 'medium';
      case 'invalid_auth':
        return 'medium';
      case 'suspicious_activity':
        return 'high';
      default:
        return 'low';
    }
  }

  // User action tracking for behavior analysis
  trackUserAction(action: string, userId?: string, metadata?: Record<string, unknown>) {
    this.logEvent({
      type: 'info',
      category: 'user_action',
      message: `User action: ${action}`,
      metadata: {
        action,
        ...metadata,
      },
      severity: 'low',
      userId,
      timestamp: Date.now(),
    });
  }

  // API endpoint monitoring
  trackAPICall(
    endpoint: string,
    method: string,
    status: number,
    duration: number,
    userId?: string
  ) {
    const isError = status >= 400;
    const isSlowRequest = duration > 3000;

    this.logEvent({
      type: isError ? 'error' : 'info',
      category: 'api_call',
      message: `${method} ${endpoint}: ${status} (${duration}ms)`,
      metadata: {
        endpoint,
        method,
        status,
        duration,
        isError,
        isSlowRequest,
      },
      severity: isError ? 'medium' : 'low',
      userId,
      timestamp: Date.now(),
    });

    // Alert on API errors
    if (isError) {
      this.trackError(new Error(`API Error: ${status} on ${method} ${endpoint}`), {
        category: 'api_error',
        endpoint,
        method,
        status,
        duration,
      });
    }
  }

  // Get monitoring dashboard data (simplified for current implementation)
  getDashboardData() {
    // Return mock data since no database persistence
    return {
      recentEvents: [],
      metrics: {
        errorCount: this.errorPatterns.size,
        securityEventCount: this.securityEvents.length,
        criticalAlerts: 0,
        totalEvents: this.errorPatterns.size + this.securityEvents.length,
      },
    };
  }
}

export const enhancedMonitor = EnhancedMonitor.getInstance();

// Convenience functions
export const trackError = (error: Error, context?: Record<string, unknown>) => 
  enhancedMonitor.trackError(error, context);

export const trackSecurityEvent = (event: SecurityEvent) => 
  enhancedMonitor.trackSecurityEvent(event);

export const trackUserAction = (action: string, userId?: string, metadata?: Record<string, unknown>) => 
  enhancedMonitor.trackUserAction(action, userId, metadata);

export const trackAPICall = (endpoint: string, method: string, status: number, duration: number, userId?: string) => 
  enhancedMonitor.trackAPICall(endpoint, method, status, duration, userId);

export const startPerformanceTimer = (operation: string) => 
  enhancedMonitor.startTimer(operation);

export const endPerformanceTimer = (operation: string, metadata?: Record<string, unknown>) => 
  enhancedMonitor.endTimer(operation, metadata);
