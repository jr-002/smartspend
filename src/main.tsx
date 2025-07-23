import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { setupGlobalErrorHandlers } from './lib/error-handler'

// Set up global error handlers
setupGlobalErrorHandlers()

createRoot(document.getElementById("root")!).render(<App />);
