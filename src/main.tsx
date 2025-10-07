import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { setupGlobalErrorHandlers } from './lib/error-handler'
import { initSentry } from './lib/sentry'
import { registerServiceWorker } from './lib/offline-manager'
import { getPerformanceSetting } from './lib/environment-config'
import { resourceMonitor } from './lib/resource-monitor'
import { environmentValidator } from './lib/environment-validator'
import { initializeCSP } from './lib/content-security-policy'
import { sessionSecurity } from './lib/session-security'

// Initialize Sentry for error monitoring
initSentry()

// Initialize Content Security Policy
initializeCSP()

// Validate environment configuration (non-blocking for Lovable preview)
const envValidation = environmentValidator.validateEnvironment();
if (!envValidation.isValid && envValidation.errors.length > 0) {
  console.warn('⚠️ Environment validation warnings:', envValidation.errors);
  console.warn('This is normal in Lovable preview - Supabase credentials are configured differently');
}

// Set up global error handlers
setupGlobalErrorHandlers()

// Set up resource monitoring
window.addEventListener('beforeunload', () => {
  resourceMonitor.cleanup();
  sessionSecurity.cleanup();
});

// Monitor for resource exhaustion
window.addEventListener('error', (event) => {
  if (event.message.includes('resources') || event.message.includes('memory')) {
    console.error('Resource error detected:', event);
    resourceMonitor.cleanup();
  }
});

// Register service worker for offline functionality
if (getPerformanceSetting('serviceWorker')) {
  registerServiceWorker()
}

createRoot(document.getElementById("root")!).render(<App />);