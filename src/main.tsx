import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ErrorBoundary } from '@/components/ErrorBoundary'

// Import Capacitor for native features
import { Capacitor } from '@capacitor/core';
import { CapacitorUpdater } from '@capgo/capacitor-updater';

// Initialize app
const initApp = async () => {
  if (Capacitor.isNativePlatform()) {
    // Additional native initialization if needed
    console.log('Running as native app');
  }

  createRoot(document.getElementById("root")!).render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );

  // Tell Capgo the app booted successfully so a freshly-applied live-update
  // bundle is committed. Without this call the plugin auto-rolls back to the
  // previous bundle after `appReadyTimeout`, protecting against broken updates.
  if (Capacitor.isNativePlatform()) {
    CapacitorUpdater.notifyAppReady().catch((err) => {
      console.error('CapacitorUpdater.notifyAppReady failed', err);
    });
  }
};

initApp();
