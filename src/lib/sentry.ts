import * as Sentry from "@sentry/react";

export const initSentry = () => {
  // Only initialize if DSN is provided (will be set via environment variable)
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  
  if (!dsn) {
    console.log('Sentry DSN not configured - monitoring disabled');
    return;
  }

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    tracesSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1.0,
    beforeSend(event) {
      // Filter out non-critical errors in development
      if (import.meta.env.MODE === 'development') {
        console.log('Sentry event:', event);
      }
      return event;
    },
  });
};

export const captureException = Sentry.captureException;
export const captureMessage = Sentry.captureMessage;
export const withErrorBoundary = Sentry.withErrorBoundary;
export const ErrorBoundary = Sentry.ErrorBoundary;