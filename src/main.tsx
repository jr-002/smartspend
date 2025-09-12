import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { setupGlobalErrorHandlers } from './lib/error-handler'
import { initSentry } from './lib/sentry'
import { registerServiceWorker } from './lib/offline-manager'
import { getPerformanceSetting } from './lib/environment-config'
import { resourceMonitor } from './lib/resource-monitor'
import { environmentValidator } from './lib/environment-validator'

// Initialize Sentry for error monitoring
initSentry()

// Validate environment configuration before starting the app
const envValidation = environmentValidator.validateEnvironment();
environmentValidator.displayValidationResults(envValidation);

// If environment validation fails, show error UI and stop execution
if (!envValidation.isValid) {
  const errorUI = environmentValidator.createEnvironmentErrorUI(envValidation);
  document.body.appendChild(errorUI);
  
  // Log critical configuration errors
  console.error('🚨 CRITICAL: Application cannot start due to environment configuration errors');
  envValidation.errors.forEach(error => console.error(`  ❌ ${error}`));
  
  // Stop execution - do not render the app
  throw new Error('Environment validation failed - check console for details');
}

// Set up global error handlers
setupGlobalErrorHandlers()

// Set up resource monitoring
window.addEventListener('beforeunload', () => {
  resourceMonitor.cleanup();
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