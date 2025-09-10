import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { setupGlobalErrorHandlers } from './lib/error-handler'
import { initSentry } from './lib/sentry'
import { registerServiceWorker } from './lib/offline-manager'
import { getPerformanceSetting } from './lib/environment-config'

// Initialize Sentry for error monitoring
initSentry()

// Set up global error handlers
setupGlobalErrorHandlers()

// Register service worker for offline functionality
if (getPerformanceSetting('serviceWorker')) {
  registerServiceWorker()
}

createRoot(document.getElementById("root")!).render(<App />);
