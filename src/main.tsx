import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Import Capacitor for native features
import { Capacitor } from '@capacitor/core';

// Initialize app
const initApp = async () => {
  if (Capacitor.isNativePlatform()) {
    // Additional native initialization if needed
    console.log('Running as native app');
  }
  
  createRoot(document.getElementById("root")!).render(<App />);
};

initApp();
