import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { setupGlobalErrorHandlers } from './lib/error-handler'
import { initSentry } from './lib/sentry'
import { registerServiceWorker } from './lib/offline-manager'
import { getPerformanceSetting } from './lib/environment-config'
import { resourceMonitor } from './lib/resource-monitor'

// Initialize Sentry for error monitoring
initSentry()

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