// Centralized error handling utility
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}

export class NetworkError extends AppError {
  constructor(message: string = 'Network error occurred') {
    super(message, 503);
  }
}

// Error handler for async operations
export const handleAsyncError = <T extends unknown[], R>(
  fn: (...args: T) => Promise<R>
) => {
  return async (...args: T): Promise<R | null> => {
    try {
      return await fn(...args);
    } catch (error) {
      console.error('Async operation failed:', error);
      
      if (error instanceof AppError) {
        throw error;
      }
      
      // Convert unknown errors to AppError
      throw new AppError(
        error instanceof Error ? error.message : 'Unknown error occurred'
      );
    }
  };
};

// Safe async wrapper that doesn't throw
export const safeAsync = <T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
  fallback: R
) => {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      console.error('Safe async operation failed, using fallback:', error);
      return fallback;
    }
  };
};

// Error logging utility
export const logError = (error: Error, context?: Record<string, unknown>) => {
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    context
  };
  
  console.error('Application Error:', errorInfo);
  
  // In production, send to monitoring service
  if (import.meta.env.PROD) {
    // Example: Sentry.captureException(error, { extra: errorInfo });
  }
};

// Global error handler for unhandled promise rejections
export const setupGlobalErrorHandlers = () => {
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    logError(
      event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
      { type: 'unhandledrejection' }
    );
  });

  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    logError(event.error, { type: 'global' });
  });
};