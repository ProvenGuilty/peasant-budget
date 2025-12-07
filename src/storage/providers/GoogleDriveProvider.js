/**
 * Google Drive Storage Provider
 * 
 * Stores budget data in the user's Google Drive.
 * Uses the Google Drive API with OAuth 2.0 authentication.
 * 
 * Features:
 * - Data stored in user's own Google Drive
 * - Cross-device sync
 * - User owns their data completely
 * - Uses App Data folder (hidden from user's Drive UI for cleanliness)
 * 
 * Requirements:
 * - Google Cloud Project with Drive API enabled
 * - OAuth 2.0 Client ID configured
 * - Environment variable: VITE_GOOGLE_CLIENT_ID
 */

import { 
  StorageProvider, 
  createBudgetData, 
  validateAndMigrateBudgetData,
  registerProvider 
} from '../StorageProvider.js';

const PROVIDER_ID = 'google-drive';
const FILE_NAME = 'peasant-budget-data.json';
const SCOPES = 'https://www.googleapis.com/auth/drive.appdata';

// Google API script URL
const GAPI_SCRIPT_URL = 'https://apis.google.com/js/api.js';
const GIS_SCRIPT_URL = 'https://accounts.google.com/gsi/client';

class GoogleDriveProvider extends StorageProvider {
  constructor() {
    super();
    this._syncStatus = {
      status: 'idle',
      lastSynced: null,
      error: null
    };
    this._listeners = new Set();
    this._gapiLoaded = false;
    this._gisLoaded = false;
    this._tokenClient = null;
    this._accessToken = null;
    this._fileId = null;
    this._user = null;
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
        console.error('[GoogleDrive] Error in sync status listener:', error);
      }
    }
  }

  /**
   * Load a script dynamically
   * @private
   */
  _loadScript(src) {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.defer = true;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      document.head.appendChild(script);
    });
  }

  /**
   * Initialize Google API client
   * @private
   */
  async _initGapi() {
    if (this._gapiLoaded) return;

    await this._loadScript(GAPI_SCRIPT_URL);
    
    // Wait for gapi to be available
    await new Promise((resolve) => {
      const checkGapi = () => {
        if (window.gapi && window.gapi.load) {
          resolve();
        } else {
          setTimeout(checkGapi, 50);
        }
      };
      checkGapi();
    });
    
    await new Promise((resolve, reject) => {
      window.gapi.load('client', {
        callback: resolve,
        onerror: reject
      });
    });

    await window.gapi.client.init({});
    
    this._gapiLoaded = true;
    console.log('[GoogleDrive] GAPI initialized');
  }

  /**
   * Initialize Google Identity Services
   * @private
   */
  async _initGis() {
    if (this._gisLoaded) return;

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    
    if (!clientId) {
      throw new Error('Google Client ID not configured. Set VITE_GOOGLE_CLIENT_ID environment variable.');
    }

    await this._loadScript(GIS_SCRIPT_URL);

    // Wait for google.accounts to be available
    await new Promise((resolve) => {
      const checkGis = () => {
        if (window.google && window.google.accounts && window.google.accounts.oauth2) {
          resolve();
        } else {
          setTimeout(checkGis, 50);
        }
      };
      checkGis();
    });

    this._tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPES,
      callback: (response) => {
        if (response.error) {
          console.error('[GoogleDrive] Token error:', response.error);
          this._updateSyncStatus('error', response.error);
          return;
        }
        this._accessToken = response.access_token;
        console.log('[GoogleDrive] Token received');
      }
    });

    this._gisLoaded = true;
    console.log('[GoogleDrive] GIS initialized');
  }

  /**
   * Make an authenticated API request
   * @private
   */
  async _apiRequest(url, options = {}) {
    if (!this._accessToken) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this._accessToken}`,
        ...options.headers
      }
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `API request failed: ${response.status}`);
    }

    return response;
  }

  /**
   * Find the budget data file in App Data folder
   * @private
   */
  async _findFile() {
    const response = await this._apiRequest(
      `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name='${FILE_NAME}'&fields=files(id,name,modifiedTime)`
    );
    
    const data = await response.json();
    
    if (data.files && data.files.length > 0) {
      this._fileId = data.files[0].id;
      console.log('[GoogleDrive] Found existing file:', this._fileId);
      return this._fileId;
    }
    
    return null;
  }

  /**
   * Create a new budget data file
   * @private
   */
  async _createFile(content) {
    const metadata = {
      name: FILE_NAME,
      parents: ['appDataFolder']
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', new Blob([JSON.stringify(content)], { type: 'application/json' }));

    const response = await this._apiRequest(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id',
      {
        method: 'POST',
        body: form
      }
    );

    const data = await response.json();
    this._fileId = data.id;
    console.log('[GoogleDrive] Created new file:', this._fileId);
    return this._fileId;
  }

  /**
   * Update existing file content
   * @private
   */
  async _updateFile(content) {
    if (!this._fileId) {
      throw new Error('No file ID set');
    }

    await this._apiRequest(
      `https://www.googleapis.com/upload/drive/v3/files/${this._fileId}?uploadType=media`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(content)
      }
    );

    console.log('[GoogleDrive] File updated');
  }

  /**
   * Read file content
   * @private
   */
  async _readFile() {
    if (!this._fileId) {
      return null;
    }

    const response = await this._apiRequest(
      `https://www.googleapis.com/drive/v3/files/${this._fileId}?alt=media`
    );

    return response.json();
  }

  getInfo() {
    return {
      id: PROVIDER_ID,
      name: 'Google Drive',
      icon: 'cloud',
      description: 'Store data in your Google Drive. Syncs across all your devices.',
      requiresAuth: true,
      supportsSync: true
    };
  }

  async isAvailable() {
    // Check if Google Client ID is configured
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    return !!clientId;
  }

  async isAuthenticated() {
    // Check if we have a valid access token
    if (!this._accessToken) {
      // Try to restore from localStorage
      const storedToken = localStorage.getItem('google_access_token');
      const tokenTime = localStorage.getItem('google_token_time');
      
      if (storedToken && tokenTime) {
        // Check if user opted into extended session (55 min), otherwise use short session (60 sec)
        const rememberSession = localStorage.getItem('google_remember_session') === 'true';
        const maxAge = rememberSession ? 55 * 60 * 1000 : 60 * 1000; // 55 min or 60 sec
        
        const tokenAge = Date.now() - parseInt(tokenTime, 10);
        
        if (tokenAge < maxAge) {
          this._accessToken = storedToken;
          console.log('[GoogleDrive] Restored token from storage, age:', Math.round(tokenAge / 1000), 'sec, extended:', rememberSession);
          return true;
        } else {
          // Token expired, clear it
          console.log('[GoogleDrive] Stored token expired after', rememberSession ? '55 min' : '60 sec');
          localStorage.removeItem('google_access_token');
          localStorage.removeItem('google_token_time');
        }
      }
      return false;
    }
    return true;
  }

  async authenticate() {
    try {
      this._updateSyncStatus('syncing');

      // Initialize APIs
      await this._initGapi();
      await this._initGis();

      // Request access token
      return new Promise((resolve) => {
        this._tokenClient.callback = async (response) => {
          if (response.error) {
            console.error('[GoogleDrive] Auth error:', response.error);
            this._updateSyncStatus('error', response.error);
            resolve(false);
            return;
          }

          this._accessToken = response.access_token;
          
          // Store token in localStorage (persists across sessions)
          localStorage.setItem('google_access_token', this._accessToken);
          localStorage.setItem('google_token_time', Date.now().toString());

          // Get user info
          try {
            const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
              headers: { 'Authorization': `Bearer ${this._accessToken}` }
            });
            const userData = await userResponse.json();
            this._user = {
              name: userData.name,
              email: userData.email,
              avatar: userData.picture
            };
          } catch (e) {
            console.warn('[GoogleDrive] Failed to get user info:', e);
          }

          this._updateSyncStatus('synced');
          console.log('[GoogleDrive] Authentication successful');
          resolve(true);
        };

        this._tokenClient.requestAccessToken({ prompt: 'consent' });
      });
    } catch (error) {
      console.error('[GoogleDrive] Authentication failed:', error);
      this._updateSyncStatus('error', error.message);
      return false;
    }
  }

  async signOut() {
    if (this._accessToken) {
      // Revoke the token
      try {
        await fetch(`https://oauth2.googleapis.com/revoke?token=${this._accessToken}`, {
          method: 'POST'
        });
      } catch (e) {
        console.warn('[GoogleDrive] Token revocation failed:', e);
      }
    }

    this._accessToken = null;
    this._fileId = null;
    this._user = null;
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('google_token_time');
    this._updateSyncStatus('idle');
    console.log('[GoogleDrive] Signed out');
  }

  async getUserInfo() {
    return this._user;
  }

  async load() {
    try {
      this._updateSyncStatus('syncing');

      // Find existing file
      await this._findFile();

      if (!this._fileId) {
        console.log('[GoogleDrive] No existing data found');
        this._updateSyncStatus('synced');
        return null;
      }

      // Read file content
      const rawData = await this._readFile();
      const validatedData = validateAndMigrateBudgetData(rawData);

      console.log('[GoogleDrive] Loaded data:', {
        version: validatedData.version,
        transactionCount: validatedData.data?.transactions?.length || 0
      });

      this._updateSyncStatus('synced');
      return validatedData;
    } catch (error) {
      console.error('[GoogleDrive] Failed to load data:', error);
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

      if (this._fileId) {
        // Update existing file
        await this._updateFile(budgetData);
      } else {
        // Create new file
        await this._createFile(budgetData);
      }

      console.log('[GoogleDrive] Saved data:', {
        transactionCount: budgetData.data?.transactions?.length || 0
      });

      this._updateSyncStatus('synced');
      return true;
    } catch (error) {
      console.error('[GoogleDrive] Failed to save data:', error);
      this._updateSyncStatus('error', error.message);
      return false;
    }
  }

  async delete() {
    try {
      if (!this._fileId) {
        console.log('[GoogleDrive] No file to delete');
        return true;
      }

      await this._apiRequest(
        `https://www.googleapis.com/drive/v3/files/${this._fileId}`,
        { method: 'DELETE' }
      );

      this._fileId = null;
      console.log('[GoogleDrive] Data deleted');
      this._updateSyncStatus('idle');
      return true;
    } catch (error) {
      console.error('[GoogleDrive] Failed to delete data:', error);
      this._updateSyncStatus('error', error.message);
      return false;
    }
  }

  getSyncStatus() {
    return { ...this._syncStatus };
  }

  onSyncStatusChange(callback) {
    this._listeners.add(callback);
    return () => {
      this._listeners.delete(callback);
    };
  }
}

// Create singleton instance
const googleDriveProvider = new GoogleDriveProvider();

// Register the provider
registerProvider(PROVIDER_ID, googleDriveProvider);

export default googleDriveProvider;
export { GoogleDriveProvider, PROVIDER_ID };
