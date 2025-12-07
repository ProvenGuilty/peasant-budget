/**
 * LocalStorage Provider
 * 
 * Stores budget data in the browser's localStorage.
 * This is the baseline/fallback provider that works offline.
 * 
 * Features:
 * - Instant read/write (no network latency)
 * - Works offline
 * - No authentication required
 * - Data persists across browser sessions
 * - Cross-tab synchronization
 * 
 * Limitations:
 * - Data is browser/device specific
 * - ~5-10MB storage limit
 * - No cross-device sync
 */

import { 
  StorageProvider, 
  createBudgetData, 
  validateAndMigrateBudgetData,
  registerProvider 
} from '../StorageProvider.js';

const STORAGE_KEY = 'peasant-budget-data';
const PROVIDER_ID = 'local';

class LocalStorageProvider extends StorageProvider {
  constructor() {
    super();
    this._syncStatus = {
      status: 'idle',
      lastSynced: null,
      error: null
    };
    this._listeners = new Set();
    
    // Listen for storage events from other tabs
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', this._handleStorageEvent.bind(this));
    }
  }

  /**
   * Handle storage events from other tabs
   * @private
   */
  _handleStorageEvent(event) {
    if (event.key === STORAGE_KEY) {
      console.log('[LocalStorage] Data changed in another tab');
      this._updateSyncStatus('synced');
      // Notify listeners that data may have changed
      this._notifyListeners();
    }
  }

  /**
   * Update sync status and notify listeners
   * @private
   */
  _updateSyncStatus(status, error = null) {
    this._syncStatus = {
      status,
      lastSynced: status === 'synced' ? new Date() : this._syncStatus.lastSynced,
      error
    };
    this._notifyListeners();
  }

  /**
   * Notify all sync status listeners
   * @private
   */
  _notifyListeners() {
    for (const callback of this._listeners) {
      try {
        callback(this._syncStatus);
      } catch (error) {
        console.error('[LocalStorage] Error in sync status listener:', error);
      }
    }
  }

  getInfo() {
    return {
      id: PROVIDER_ID,
      name: 'Local Storage',
      icon: 'hard-drive',
      description: 'Store data locally in your browser. Works offline, but data stays on this device only.',
      requiresAuth: false,
      supportsSync: false
    };
  }

  async isAvailable() {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      console.warn('[LocalStorage] localStorage is not available:', e);
      return false;
    }
  }

  async isAuthenticated() {
    // localStorage doesn't require authentication
    return true;
  }

  async authenticate() {
    // No-op for localStorage
    return true;
  }

  async signOut() {
    // No-op for localStorage
  }

  async getUserInfo() {
    // localStorage doesn't have user info
    return null;
  }

  async load() {
    try {
      this._updateSyncStatus('syncing');
      
      const stored = localStorage.getItem(STORAGE_KEY);
      
      if (!stored) {
        console.log('[LocalStorage] No existing data found');
        this._updateSyncStatus('synced');
        return null;
      }

      const rawData = JSON.parse(stored);
      const validatedData = validateAndMigrateBudgetData(rawData);
      
      console.log('[LocalStorage] Loaded data:', {
        version: validatedData.version,
        transactionCount: validatedData.data?.transactions?.length || 0
      });
      
      this._updateSyncStatus('synced');
      return validatedData;
    } catch (error) {
      console.error('[LocalStorage] Failed to load data:', error);
      this._updateSyncStatus('error', error.message);
      return null;
    }
  }

  async save(data) {
    try {
      this._updateSyncStatus('syncing');
      
      // Ensure data is in the correct format
      const budgetData = data.version 
        ? data 
        : createBudgetData(data, PROVIDER_ID);
      
      // Update the export timestamp and provider
      budgetData.exportedAt = new Date().toISOString();
      budgetData.provider = PROVIDER_ID;
      
      const serialized = JSON.stringify(budgetData);
      localStorage.setItem(STORAGE_KEY, serialized);
      
      console.log('[LocalStorage] Saved data:', {
        size: serialized.length,
        transactionCount: budgetData.data?.transactions?.length || 0
      });
      
      this._updateSyncStatus('synced');
      return true;
    } catch (error) {
      console.error('[LocalStorage] Failed to save data:', error);
      this._updateSyncStatus('error', error.message);
      
      // Check if it's a quota error
      if (error.name === 'QuotaExceededError') {
        this._updateSyncStatus('error', 'Storage quota exceeded. Please export your data and clear old entries.');
      }
      
      return false;
    }
  }

  async delete() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      console.log('[LocalStorage] Data deleted');
      this._updateSyncStatus('idle');
      return true;
    } catch (error) {
      console.error('[LocalStorage] Failed to delete data:', error);
      this._updateSyncStatus('error', error.message);
      return false;
    }
  }

  getSyncStatus() {
    return { ...this._syncStatus };
  }

  onSyncStatusChange(callback) {
    this._listeners.add(callback);
    
    // Return unsubscribe function
    return () => {
      this._listeners.delete(callback);
    };
  }

  /**
   * Get storage usage information
   * @returns {{used: number, available: number, percentage: number}}
   */
  getStorageInfo() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const used = stored ? new Blob([stored]).size : 0;
      
      // localStorage typically has a 5-10MB limit
      // We'll estimate 5MB as the limit
      const limit = 5 * 1024 * 1024;
      
      return {
        used,
        available: limit - used,
        percentage: Math.round((used / limit) * 100)
      };
    } catch (error) {
      return { used: 0, available: 0, percentage: 0 };
    }
  }

  /**
   * Migrate legacy data from old localStorage keys
   * @returns {Promise<boolean>} - True if migration occurred
   */
  async migrateLegacyData() {
    try {
      // Check for old data format
      const oldTransactions = localStorage.getItem('peasant-budget-transactions');
      const oldPayType = localStorage.getItem('peasant-budget-pay-type');
      const oldPayConfig = localStorage.getItem('peasant-budget-pay-config');
      
      if (!oldTransactions && !oldPayType && !oldPayConfig) {
        return false; // No legacy data
      }

      console.log('[LocalStorage] Found legacy data, migrating...');
      
      const legacyData = {
        transactions: oldTransactions ? JSON.parse(oldTransactions) : [],
        settings: {},
        payPeriodConfig: {
          type: oldPayType ? JSON.parse(oldPayType) : 'bi-monthly',
          ...(oldPayConfig ? JSON.parse(oldPayConfig) : {})
        }
      };

      // Save in new format
      const budgetData = createBudgetData(legacyData, PROVIDER_ID);
      await this.save(budgetData);

      // Optionally remove old keys (commented out for safety)
      // localStorage.removeItem('peasant-budget-transactions');
      // localStorage.removeItem('peasant-budget-pay-type');
      // localStorage.removeItem('peasant-budget-pay-config');

      console.log('[LocalStorage] Legacy data migration complete');
      return true;
    } catch (error) {
      console.error('[LocalStorage] Legacy migration failed:', error);
      return false;
    }
  }
}

// Create singleton instance
const localStorageProvider = new LocalStorageProvider();

// Register the provider
registerProvider(PROVIDER_ID, localStorageProvider);

export default localStorageProvider;
export { LocalStorageProvider, PROVIDER_ID };
