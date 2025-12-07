/**
 * Storage Provider Abstraction Layer
 * 
 * This module defines the interface that all storage providers must implement.
 * Providers can be localStorage, Google Drive, OneDrive, Dropbox, etc.
 * 
 * Philosophy: "Free as in freedom" - User owns their data, stored where they choose.
 */

/**
 * @typedef {Object} StorageProviderInfo
 * @property {string} id - Unique identifier for the provider (e.g., 'local', 'google-drive')
 * @property {string} name - Display name (e.g., 'Local Storage', 'Google Drive')
 * @property {string} icon - Icon identifier or URL
 * @property {string} description - Brief description of the provider
 * @property {boolean} requiresAuth - Whether the provider requires authentication
 * @property {boolean} supportsSync - Whether the provider supports real-time sync
 */

/**
 * @typedef {Object} SyncStatus
 * @property {'idle'|'syncing'|'synced'|'error'|'offline'} status - Current sync status
 * @property {Date|null} lastSynced - Last successful sync timestamp
 * @property {string|null} error - Error message if status is 'error'
 */

/**
 * @typedef {Object} BudgetData
 * @property {string} version - Data format version
 * @property {Date} exportedAt - When the data was last exported/saved
 * @property {string} provider - Provider ID that saved this data
 * @property {Object} data - The actual budget data
 * @property {Array} data.transactions - User's transactions
 * @property {Object} data.settings - User's settings
 * @property {Object} data.payPeriodConfig - Pay period configuration
 */

/**
 * Universal data format version
 * Increment when making breaking changes to data structure
 */
export const DATA_FORMAT_VERSION = '1.0';

/**
 * Create a standardized budget data object
 * @param {Object} data - The raw data to wrap
 * @param {string} providerId - The provider saving this data
 * @returns {BudgetData}
 */
export function createBudgetData(data, providerId) {
  return {
    version: DATA_FORMAT_VERSION,
    exportedAt: new Date().toISOString(),
    provider: providerId,
    data: {
      transactions: data.transactions || [],
      settings: data.settings || {},
      payPeriodConfig: data.payPeriodConfig || {
        type: 'bi-monthly',
        lastPayday: new Date().toISOString()
      }
    }
  };
}

/**
 * Validate and migrate budget data if needed
 * @param {Object} rawData - Data loaded from storage
 * @returns {BudgetData} - Validated and potentially migrated data
 */
export function validateAndMigrateBudgetData(rawData) {
  // Handle legacy data (pre-abstraction layer)
  if (!rawData.version) {
    console.log('[Storage] Migrating legacy data to new format');
    return createBudgetData({
      transactions: Array.isArray(rawData) ? rawData : (rawData.transactions || []),
      settings: rawData.settings || {},
      payPeriodConfig: rawData.payPeriodConfig || {}
    }, 'migrated');
  }

  // Future: Add migration logic for version upgrades
  // if (rawData.version === '1.0' && DATA_FORMAT_VERSION === '2.0') {
  //   return migrateV1toV2(rawData);
  // }

  return rawData;
}

/**
 * Abstract base class for storage providers
 * All providers must implement these methods
 */
export class StorageProvider {
  /**
   * Get provider information
   * @returns {StorageProviderInfo}
   */
  getInfo() {
    throw new Error('getInfo() must be implemented by provider');
  }

  /**
   * Check if the provider is available and ready
   * @returns {Promise<boolean>}
   */
  async isAvailable() {
    throw new Error('isAvailable() must be implemented by provider');
  }

  /**
   * Check if user is authenticated (for cloud providers)
   * @returns {Promise<boolean>}
   */
  async isAuthenticated() {
    throw new Error('isAuthenticated() must be implemented by provider');
  }

  /**
   * Authenticate with the provider (for cloud providers)
   * @returns {Promise<boolean>} - True if authentication successful
   */
  async authenticate() {
    throw new Error('authenticate() must be implemented by provider');
  }

  /**
   * Sign out from the provider
   * @returns {Promise<void>}
   */
  async signOut() {
    throw new Error('signOut() must be implemented by provider');
  }

  /**
   * Get user info (for cloud providers)
   * @returns {Promise<{name: string, email: string, avatar?: string}|null>}
   */
  async getUserInfo() {
    throw new Error('getUserInfo() must be implemented by provider');
  }

  /**
   * Load budget data from storage
   * @returns {Promise<BudgetData|null>}
   */
  async load() {
    throw new Error('load() must be implemented by provider');
  }

  /**
   * Save budget data to storage
   * @param {BudgetData} data - The data to save
   * @returns {Promise<boolean>} - True if save successful
   */
  async save(data) {
    throw new Error('save() must be implemented by provider');
  }

  /**
   * Delete all budget data from storage
   * @returns {Promise<boolean>} - True if delete successful
   */
  async delete() {
    throw new Error('delete() must be implemented by provider');
  }

  /**
   * Get current sync status
   * @returns {SyncStatus}
   */
  getSyncStatus() {
    throw new Error('getSyncStatus() must be implemented by provider');
  }

  /**
   * Subscribe to sync status changes
   * @param {function(SyncStatus): void} callback - Called when sync status changes
   * @returns {function(): void} - Unsubscribe function
   */
  onSyncStatusChange(callback) {
    throw new Error('onSyncStatusChange() must be implemented by provider');
  }

  /**
   * Export data as downloadable JSON file
   * @param {BudgetData} data - The data to export
   * @returns {void}
   */
  exportToFile(data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `peasant-budget-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Import data from a JSON file
   * @param {File} file - The file to import
   * @returns {Promise<BudgetData>}
   */
  async importFromFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const rawData = JSON.parse(e.target.result);
          const validatedData = validateAndMigrateBudgetData(rawData);
          resolve(validatedData);
        } catch (error) {
          reject(new Error(`Failed to parse import file: ${error.message}`));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read import file'));
      reader.readAsText(file);
    });
  }
}

/**
 * Provider registry - stores all available providers
 */
const providerRegistry = new Map();

/**
 * Register a storage provider
 * @param {string} id - Provider ID
 * @param {StorageProvider} provider - Provider instance
 */
export function registerProvider(id, provider) {
  if (providerRegistry.has(id)) {
    console.warn(`[Storage] Provider '${id}' is already registered, overwriting`);
  }
  providerRegistry.set(id, provider);
  console.log(`[Storage] Registered provider: ${id}`);
}

/**
 * Get a registered provider by ID
 * @param {string} id - Provider ID
 * @returns {StorageProvider|null}
 */
export function getProvider(id) {
  return providerRegistry.get(id) || null;
}

/**
 * Get all registered providers
 * @returns {Map<string, StorageProvider>}
 */
export function getAllProviders() {
  return providerRegistry;
}

/**
 * Get list of available providers with their info
 * @returns {Promise<Array<StorageProviderInfo & {id: string, available: boolean}>>}
 */
export async function getAvailableProviders() {
  const providers = [];
  
  for (const [id, provider] of providerRegistry) {
    const info = provider.getInfo();
    const available = await provider.isAvailable();
    providers.push({
      id,
      ...info,
      available
    });
  }
  
  return providers;
}
