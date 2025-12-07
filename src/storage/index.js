/**
 * Storage Module
 * 
 * Unified storage abstraction for peasant-budget.
 * Supports multiple storage providers (localStorage, Google Drive, OneDrive, etc.)
 * 
 * Usage:
 * 
 * 1. Wrap your app with StorageContextProvider:
 *    <StorageContextProvider>
 *      <App />
 *    </StorageContextProvider>
 * 
 * 2. Use the useStorage hook in components:
 *    const { transactions, addTransaction, syncStatus } = useStorage();
 */

// Core abstraction
export { 
  StorageProvider,
  createBudgetData,
  validateAndMigrateBudgetData,
  registerProvider,
  getProvider,
  getAllProviders,
  getAvailableProviders,
  DATA_FORMAT_VERSION
} from './StorageProvider.js';

// React context and hook
export { 
  StorageContextProvider, 
  useStorage 
} from './StorageContext.jsx';

// Providers
export { default as localStorageProvider } from './providers/LocalStorageProvider.js';
export { default as googleDriveProvider } from './providers/GoogleDriveProvider.js';

// Future providers will be exported here:
// export { default as oneDriveProvider } from './providers/OneDriveProvider.js';
// export { default as dropboxProvider } from './providers/DropboxProvider.js';
