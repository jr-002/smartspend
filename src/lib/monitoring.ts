import React from 'react';
import { captureException, captureMessage } from './sentry';

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startTimer(operation: string): void {
    this.metrics.set(operation, performance.now());
  }

  endTimer(operation: string): number {
    const startTime = this.metrics.get(operation);
    if (!startTime) {
      console.warn(`No start time found for operation: ${operation}`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.metrics.delete(operation);
    
    // Log slow operations
    if (duration > 5000) {
      captureMessage(`Slow operation detected: ${operation} took ${duration}ms`, 'warning');
    }

    return duration;
  }

  trackAPICall(endpoint: string, status: 'success' | 'error', duration?: number): void {
    const message = `API call to ${endpoint}: ${status}${duration ? ` (${duration}ms)` : ''}`;
    
    if (status === 'error') {
      captureMessage(message, 'error');
    } else if (duration && duration > 3000) {
      captureMessage(message, 'warning');
    }
  }

  trackUserAction(action: string, _metadata?: Record<string, unknown>): void {
    captureMessage(`User action: ${action}`, 'info');
    
    // Track performance-critical actions
    if (['ai_coach_query', 'risk_analysis', 'insights_generation'].includes(action)) {
      this.startTimer(action);
    }
  }
}

export const monitor = PerformanceMonitor.getInstance();

// Error boundary wrapper for components
export const withErrorTracking = <T extends Record<string, unknown>>(
  Component: React.ComponentType<T>
): React.ComponentType<T> => {
  return (props: T) => {
    try {
      return React.createElement(Component, props);
    } catch (error) {
      captureException(error);
      throw error;
    }
  };
};

// API call wrapper with monitoring
export const monitoredAPICall = async <T>(
  operation: string,
  apiCall: () => Promise<T>
): Promise<T> => {
  const startTime = performance.now();
  
  try {
    monitor.startTimer(operation);
    const result = await apiCall();
    const duration = monitor.endTimer(operation);
    monitor.trackAPICall(operation, 'success', duration);
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    monitor.trackAPICall(operation, 'error', duration);
    captureException(error);
    throw error;
  }
};