/**
 * Storage Context
 * 
 * Provides storage functionality to the entire React app.
 * Manages the active storage provider, data loading/saving, and sync status.
 */

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { 
  getProvider, 
  getAllProviders, 
  getAvailableProviders,
  createBudgetData 
} from './StorageProvider.js';

// Import providers to register them
import './providers/LocalStorageProvider.js';
import './providers/GoogleDriveProvider.js';

const StorageContext = createContext(null);

// Key for storing the selected provider ID
const PROVIDER_PREFERENCE_KEY = 'peasant-budget-storage-provider';

/**
 * Storage Provider Component
 * Wraps the app and provides storage functionality
 */
export function StorageContextProvider({ children }) {
  // Current provider ID
  const [providerId, setProviderId] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(PROVIDER_PREFERENCE_KEY) || 'local';
    }
    return 'local';
  });

  // Current provider instance
  const [provider, setProvider] = useState(null);

  // Budget data state
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sync status
  const [syncStatus, setSyncStatus] = useState({
    status: 'idle',
    lastSynced: null,
    error: null
  });

  // Available providers
  const [availableProviders, setAvailableProviders] = useState([]);

  // User info (for cloud providers)
  const [user, setUser] = useState(null);

  // Debounce timer for auto-save
  const saveTimeoutRef = useRef(null);
  const pendingDataRef = useRef(null);

  // Initialize provider
  useEffect(() => {
    const initProvider = async () => {
      const providerInstance = getProvider(providerId);
      
      if (!providerInstance) {
        console.error(`[Storage] Provider '${providerId}' not found, falling back to local`);
        setProviderId('local');
        return;
      }

      setProvider(providerInstance);

      // Subscribe to sync status changes
      const unsubscribe = providerInstance.onSyncStatusChange((status) => {
        setSyncStatus(status);
      });

      // Check if authenticated (for cloud providers)
      if (providerInstance.getInfo().requiresAuth) {
        const isAuth = await providerInstance.isAuthenticated();
        if (isAuth) {
          const userInfo = await providerInstance.getUserInfo();
          setUser(userInfo);
        } else {
          setUser(null);
        }
      }

      return unsubscribe;
    };

    const cleanup = initProvider();
    return () => {
      cleanup?.then(unsubscribe => unsubscribe?.());
    };
  }, [providerId]);

  // Load available providers
  useEffect(() => {
    const loadProviders = async () => {
      const providers = await getAvailableProviders();
      setAvailableProviders(providers);
    };
    loadProviders();
  }, []);

  // Load data when provider changes
  useEffect(() => {
    if (!provider) return;

    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Check for legacy data migration (localStorage only)
        if (providerId === 'local' && provider.migrateLegacyData) {
          await provider.migrateLegacyData();
        }

        const loadedData = await provider.load();
        
        if (loadedData) {
          setData(loadedData);
          console.log('[Storage] Data loaded successfully');
        } else {
          // Initialize with empty data
          const emptyData = createBudgetData({
            transactions: [],
            settings: {},
            payPeriodConfig: {
              type: 'bi-monthly',
              lastPayday: new Date().toISOString()
            }
          }, providerId);
          setData(emptyData);
          console.log('[Storage] Initialized with empty data');
        }
      } catch (err) {
        console.error('[Storage] Failed to load data:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [provider, providerId]);

  /**
   * Save data with debouncing
   * @param {Object} newData - The data to save
   * @param {boolean} immediate - If true, save immediately without debounce
   */
  const saveData = useCallback(async (newData, immediate = false) => {
    if (!provider) return false;

    // Update local state immediately
    const budgetData = newData.version 
      ? newData 
      : createBudgetData(newData, providerId);
    
    setData(budgetData);
    pendingDataRef.current = budgetData;

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Save function
    const doSave = async () => {
      try {
        const dataToSave = pendingDataRef.current;
        if (!dataToSave) return true;

        const success = await provider.save(dataToSave);
        
        if (success) {
          pendingDataRef.current = null;
          console.log('[Storage] Data saved successfully');
        }
        
        return success;
      } catch (err) {
        console.error('[Storage] Failed to save data:', err);
        setError(err.message);
        return false;
      }
    };

    if (immediate) {
      return doSave();
    }

    // Debounce save (2 seconds)
    saveTimeoutRef.current = setTimeout(doSave, 2000);
    return true;
  }, [provider, providerId]);

  /**
   * Update transactions
   */
  const updateTransactions = useCallback((transactions) => {
    if (!data) return;
    
    const newData = {
      ...data,
      data: {
        ...data.data,
        transactions
      }
    };
    
    saveData(newData);
  }, [data, saveData]);

  /**
   * Add a transaction
   */
  const addTransaction = useCallback((transaction) => {
    if (!data) return;
    
    const newTransactions = [transaction, ...(data.data?.transactions || [])];
    updateTransactions(newTransactions);
  }, [data, updateTransactions]);

  /**
   * Delete a transaction
   */
  const deleteTransaction = useCallback((id) => {
    if (!data) return;
    
    const newTransactions = (data.data?.transactions || []).filter(t => t.id !== id);
    updateTransactions(newTransactions);
  }, [data, updateTransactions]);

  /**
   * Update settings
   */
  const updateSettings = useCallback((settings) => {
    if (!data) return;
    
    const newData = {
      ...data,
      data: {
        ...data.data,
        settings: {
          ...data.data?.settings,
          ...settings
        }
      }
    };
    
    saveData(newData);
  }, [data, saveData]);

  /**
   * Update pay period config
   */
  const updatePayPeriodConfig = useCallback((config) => {
    if (!data) return;
    
    const newData = {
      ...data,
      data: {
        ...data.data,
        payPeriodConfig: {
          ...data.data?.payPeriodConfig,
          ...config
        }
      }
    };
    
    saveData(newData);
  }, [data, saveData]);

  /**
   * Switch to a different storage provider
   */
  const switchProvider = useCallback(async (newProviderId) => {
    const newProvider = getProvider(newProviderId);
    
    if (!newProvider) {
      console.error(`[Storage] Provider '${newProviderId}' not found`);
      return false;
    }

    // Check if available
    const isAvailable = await newProvider.isAvailable();
    if (!isAvailable) {
      console.error(`[Storage] Provider '${newProviderId}' is not available`);
      return false;
    }

    // For cloud providers, check authentication
    if (newProvider.getInfo().requiresAuth) {
      const isAuth = await newProvider.isAuthenticated();
      if (!isAuth) {
        const authSuccess = await newProvider.authenticate();
        if (!authSuccess) {
          console.error(`[Storage] Failed to authenticate with '${newProviderId}'`);
          return false;
        }
      }
    }

    // Save current data to new provider
    if (data) {
      const success = await newProvider.save(data);
      if (!success) {
        console.error(`[Storage] Failed to migrate data to '${newProviderId}'`);
        return false;
      }
    }

    // Update provider preference
    localStorage.setItem(PROVIDER_PREFERENCE_KEY, newProviderId);
    setProviderId(newProviderId);

    console.log(`[Storage] Switched to provider: ${newProviderId}`);
    return true;
  }, [data]);

  /**
   * Export data to file
   */
  const exportData = useCallback(() => {
    if (!provider || !data) return;
    provider.exportToFile(data);
  }, [provider, data]);

  /**
   * Import data from file
   */
  const importData = useCallback(async (file) => {
    if (!provider) return false;

    try {
      const importedData = await provider.importFromFile(file);
      
      // Save imported data
      const success = await provider.save(importedData);
      
      if (success) {
        setData(importedData);
        console.log('[Storage] Data imported successfully');
        return true;
      }
      
      return false;
    } catch (err) {
      console.error('[Storage] Failed to import data:', err);
      setError(err.message);
      return false;
    }
  }, [provider]);

  /**
   * Force sync (for cloud providers)
   */
  const forceSync = useCallback(async () => {
    if (!provider || !data) return false;
    return saveData(data, true);
  }, [provider, data, saveData]);

  /**
   * Sign out from current provider
   */
  const signOut = useCallback(async () => {
    if (!provider) return;
    
    await provider.signOut();
    setUser(null);
    
    // Switch back to local storage
    await switchProvider('local');
  }, [provider, switchProvider]);

  // Context value
  const value = {
    // Provider info
    providerId,
    provider,
    availableProviders,
    
    // Data
    data: data?.data || null,
    transactions: data?.data?.transactions || [],
    settings: data?.data?.settings || {},
    payPeriodConfig: data?.data?.payPeriodConfig || {},
    
    // State
    isLoading,
    error,
    syncStatus,
    user,
    
    // Actions
    addTransaction,
    deleteTransaction,
    updateTransactions,
    updateSettings,
    updatePayPeriodConfig,
    saveData,
    
    // Provider management
    switchProvider,
    signOut,
    
    // Import/Export
    exportData,
    importData,
    
    // Sync
    forceSync
  };

  return (
    <StorageContext.Provider value={value}>
      {children}
    </StorageContext.Provider>
  );
}

/**
 * Hook to access storage context
 */
export function useStorage() {
  const context = useContext(StorageContext);
  
  if (!context) {
    throw new Error('useStorage must be used within a StorageContextProvider');
  }
  
  return context;
}

export default StorageContext;
