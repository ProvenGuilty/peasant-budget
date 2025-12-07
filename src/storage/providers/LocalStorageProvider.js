/**
 * LocalStorage Provider
 * 
 * Stores budget data in the browser's localStorage with optional encryption.
 * This is the baseline/fallback provider that works offline.
 * 
 * Features:
 * - Instant read/write (no network latency)
 * - Works offline
 * - No authentication required
 * - Data persists across browser sessions
 * - Cross-tab synchronization
 * - AES-256-GCM encryption at rest (optional, user-controlled)
 * 
 * Security:
 * - Data encrypted with user's passphrase
 * - PBKDF2 key derivation (100,000 iterations)
 * - Random IV per encryption operation
 * - Authentication tag prevents tampering
 * 
 * Limitations:
 * - Data is browser/device specific
 * - ~5-10MB storage limit
 * - No cross-device sync
 * - If passphrase is lost, data cannot be recovered
 */

import { 
  StorageProvider, 
  createBudgetData, 
  validateAndMigrateBudgetData,
  registerProvider 
} from '../StorageProvider.js';

import {
  encrypt,
  decrypt,
  isCryptoAvailable,
  isEncryptionEnabled,
  setEncryptionEnabled,
  clearEncryptionSettings,
  validatePassphrase,
  getEncryptionHealth
} from '../encryption.js';

const STORAGE_KEY = 'peasant-budget-data';
const PROVIDER_ID = 'local';

/**
 * Logger for LocalStorage operations
 * Follows SRE logging best practices
 */
const logger = {
  info: (message, context = {}) => {
    console.log(`[LocalStorage] ${message}`, {
      timestamp: new Date().toISOString(),
      ...context
    });
  },
  warn: (message, context = {}) => {
    console.warn(`[LocalStorage] ${message}`, {
      timestamp: new Date().toISOString(),
      ...context
    });
  },
  error: (message, error, context = {}) => {
    console.error(`[LocalStorage] ${message}`, {
      timestamp: new Date().toISOString(),
      error: error?.message || error,
      stack: error?.stack,
      ...context
    });
  }
};

class LocalStorageProvider extends StorageProvider {
  constructor() {
    super();
    this._syncStatus = {
      status: 'idle',
      lastSynced: null,
      error: null
    };
    this._listeners = new Set();
    
    // Encryption state
    this._passphrase = null;
    this._encryptionEnabled = false;
    
    // Listen for storage events from other tabs
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', this._handleStorageEvent.bind(this));
      
      // Check encryption status on init
      this._encryptionEnabled = isEncryptionEnabled();
      logger.info('Provider initialized', {
        encryptionEnabled: this._encryptionEnabled,
        cryptoAvailable: isCryptoAvailable()
      });
    }
  }

  /**
   * Set the encryption passphrase
   * Must be called before load/save if encryption is enabled
   * @param {string} passphrase
   */
  setPassphrase(passphrase) {
    this._passphrase = passphrase;
    logger.info('Passphrase set', { 
      hasPassphrase: !!passphrase,
      passphraseLength: passphrase?.length || 0
    });
  }

  /**
   * Clear the passphrase from memory
   */
  clearPassphrase() {
    this._passphrase = null;
    logger.info('Passphrase cleared from memory');
  }

  /**
   * Check if encryption is currently enabled
   * @returns {boolean}
   */
  isEncrypted() {
    return this._encryptionEnabled && isEncryptionEnabled();
  }

  /**
   * Enable encryption for this storage
   * @param {string} passphrase - User's passphrase
   * @returns {Promise<boolean>}
   */
  async enableEncryption(passphrase) {
    const validation = validatePassphrase(passphrase);
    if (!validation.valid) {
      logger.warn('Passphrase validation failed', { errors: validation.errors });
      throw new Error(validation.errors.join(', '));
    }

    if (!isCryptoAvailable()) {
      logger.error('Cannot enable encryption', new Error('Web Crypto API not available'));
      throw new Error('Encryption not available in this browser');
    }

    try {
      // Load existing data
      const existingData = await this._loadRaw();
      
      // Set passphrase and enable encryption
      this._passphrase = passphrase;
      this._encryptionEnabled = true;
      setEncryptionEnabled();

      // Re-save data encrypted
      if (existingData) {
        await this.save(existingData);
        logger.info('Existing data encrypted successfully');
      }

      logger.info('Encryption enabled', { 
        strength: validation.strength 
      });
      return true;
    } catch (error) {
      logger.error('Failed to enable encryption', error);
      this._encryptionEnabled = false;
      this._passphrase = null;
      throw error;
    }
  }

  /**
   * Disable encryption and decrypt data
   * @param {string} passphrase - Current passphrase to decrypt
   * @returns {Promise<boolean>}
   */
  async disableEncryption(passphrase) {
    try {
      // Set passphrase to decrypt
      this._passphrase = passphrase;

      // Load and decrypt existing data
      const existingData = await this.load();

      // Disable encryption
      this._encryptionEnabled = false;
      this._passphrase = null;
      clearEncryptionSettings();

      // Re-save data unencrypted
      if (existingData) {
        await this.save(existingData);
        logger.info('Data decrypted and saved');
      }

      logger.info('Encryption disabled');
      return true;
    } catch (error) {
      logger.error('Failed to disable encryption', error);
      throw error;
    }
  }

  /**
   * Get encryption health status
   * @returns {Object}
   */
  getEncryptionStatus() {
    return {
      enabled: this._encryptionEnabled,
      hasPassphrase: !!this._passphrase,
      ...getEncryptionHealth()
    };
  }

  /**
   * Load raw data without decryption (internal use)
   * @private
   */
  async _loadRaw() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    try {
      return JSON.parse(stored);
    } catch {
      // Might be encrypted, return as-is
      return stored;
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
    const encryptionStatus = this.isEncrypted() ? ' (Encrypted 🔒)' : '';
    return {
      id: PROVIDER_ID,
      name: `Local Storage${encryptionStatus}`,
      icon: 'hard-drive',
      description: 'Store data locally in your browser with optional encryption. Works offline, but data stays on this device only.',
      requiresAuth: false,
      supportsSync: false,
      supportsEncryption: true,
      encryptionEnabled: this._encryptionEnabled
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
    const startTime = performance.now();
    
    try {
      this._updateSyncStatus('syncing');
      
      const stored = localStorage.getItem(STORAGE_KEY);
      
      if (!stored) {
        logger.info('No existing data found');
        this._updateSyncStatus('synced');
        return null;
      }

      let rawData;

      // Check if data is encrypted
      if (this._encryptionEnabled && isEncryptionEnabled()) {
        if (!this._passphrase) {
          logger.warn('Encrypted data found but no passphrase set');
          this._updateSyncStatus('error', 'Passphrase required to decrypt data');
          throw new Error('Passphrase required to decrypt data');
        }

        try {
          const decrypted = await decrypt(stored, this._passphrase);
          rawData = JSON.parse(decrypted);
          logger.info('Data decrypted successfully', {
            encryptedSize: stored.length,
            decryptedSize: decrypted.length
          });
        } catch (decryptError) {
          logger.error('Decryption failed', decryptError);
          this._updateSyncStatus('error', 'Failed to decrypt data. Check your passphrase.');
          throw new Error('Failed to decrypt data. Check your passphrase.');
        }
      } else {
        // Unencrypted data
        rawData = JSON.parse(stored);
      }

      const validatedData = validateAndMigrateBudgetData(rawData);
      
      const duration = performance.now() - startTime;
      logger.info('Data loaded successfully', {
        version: validatedData.version,
        transactionCount: validatedData.data?.transactions?.length || 0,
        encrypted: this._encryptionEnabled,
        durationMs: Math.round(duration)
      });
      
      this._updateSyncStatus('synced');
      return validatedData;
    } catch (error) {
      logger.error('Failed to load data', error);
      this._updateSyncStatus('error', error.message);
      throw error;
    }
  }

  async save(data) {
    const startTime = performance.now();
    
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
      let dataToStore = serialized;

      // Encrypt if enabled
      if (this._encryptionEnabled && this._passphrase) {
        try {
          dataToStore = await encrypt(serialized, this._passphrase);
          logger.info('Data encrypted for storage', {
            plaintextSize: serialized.length,
            encryptedSize: dataToStore.length
          });
        } catch (encryptError) {
          logger.error('Encryption failed', encryptError);
          this._updateSyncStatus('error', 'Failed to encrypt data');
          throw new Error('Failed to encrypt data');
        }
      }

      localStorage.setItem(STORAGE_KEY, dataToStore);
      
      const duration = performance.now() - startTime;
      logger.info('Data saved successfully', {
        size: dataToStore.length,
        transactionCount: budgetData.data?.transactions?.length || 0,
        encrypted: this._encryptionEnabled && !!this._passphrase,
        durationMs: Math.round(duration)
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
