/**
 * Storage Settings Component
 * 
 * Allows users to:
 * - View current storage provider
 * - Switch between providers
 * - Import/export data
 * - View sync status
 */

import { useState, useRef } from 'react';
import { 
  HardDrive, 
  Cloud, 
  Download, 
  Upload, 
  RefreshCw, 
  Check, 
  AlertCircle, 
  Loader2,
  LogOut,
  Settings,
  X,
  ChevronRight
} from 'lucide-react';
import { useStorage } from '../storage';

// Icon mapping for providers
const providerIcons = {
  'local': HardDrive,
  'google-drive': Cloud,
  'onedrive': Cloud,
  'dropbox': Cloud
};

/**
 * Sync Status Badge
 */
function SyncStatusBadge({ status }) {
  const statusConfig = {
    idle: { icon: Check, color: 'text-gray-400', label: 'Ready' },
    syncing: { icon: Loader2, color: 'text-blue-400', label: 'Syncing...', spin: true },
    synced: { icon: Check, color: 'text-green-400', label: 'Synced' },
    error: { icon: AlertCircle, color: 'text-red-400', label: 'Error' },
    offline: { icon: AlertCircle, color: 'text-yellow-400', label: 'Offline' }
  };

  const config = statusConfig[status.status] || statusConfig.idle;
  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-1.5 text-sm ${config.color}`}>
      <Icon className={`w-4 h-4 ${config.spin ? 'animate-spin' : ''}`} />
      <span>{config.label}</span>
      {status.lastSynced && status.status === 'synced' && (
        <span className="text-gray-500 text-xs">
          ({new Date(status.lastSynced).toLocaleTimeString()})
        </span>
      )}
    </div>
  );
}

/**
 * Provider Card
 */
function ProviderCard({ provider, isActive, onSelect, isLoading }) {
  const Icon = providerIcons[provider.id] || Cloud;
  
  return (
    <button
      onClick={() => onSelect(provider.id)}
      disabled={isLoading || !provider.available}
      className={`
        w-full p-4 rounded-lg border-2 text-left transition-all
        ${isActive 
          ? 'border-green-500 bg-green-500/10' 
          : 'border-gray-700 bg-gray-800 hover:border-gray-600'
        }
        ${!provider.available ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${isLoading ? 'opacity-50' : ''}
      `}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${isActive ? 'bg-green-500/20' : 'bg-gray-700'}`}>
          <Icon className={`w-5 h-5 ${isActive ? 'text-green-400' : 'text-gray-400'}`} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-white">{provider.name}</h3>
            {isActive && (
              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">
                Active
              </span>
            )}
            {!provider.available && (
              <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded">
                Not Configured
              </span>
            )}
          </div>
          <p className="text-sm text-gray-400 mt-1">{provider.description}</p>
          {provider.requiresAuth && (
            <p className="text-xs text-gray-500 mt-2">
              Requires sign-in
            </p>
          )}
        </div>
        {!isActive && provider.available && (
          <ChevronRight className="w-5 h-5 text-gray-500" />
        )}
      </div>
    </button>
  );
}

/**
 * Main Storage Settings Component
 */
export default function StorageSettings() {
  const {
    providerId,
    availableProviders,
    syncStatus,
    user,
    isLoading,
    switchProvider,
    signOut,
    exportData,
    importData,
    forceSync
  } = useStorage();

  const [isOpen, setIsOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [importError, setImportError] = useState(null);
  const fileInputRef = useRef(null);

  const handleProviderSelect = async (newProviderId) => {
    if (newProviderId === providerId) return;
    
    setIsSwitching(true);
    try {
      const success = await switchProvider(newProviderId);
      if (success) {
        console.log(`Switched to ${newProviderId}`);
      }
    } catch (error) {
      console.error('Failed to switch provider:', error);
    } finally {
      setIsSwitching(false);
    }
  };

  const handleImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportError(null);
    
    try {
      const success = await importData(file);
      if (success) {
        console.log('Data imported successfully');
      } else {
        setImportError('Failed to import data');
      }
    } catch (error) {
      setImportError(error.message);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const currentProvider = availableProviders.find(p => p.id === providerId);
  const CurrentIcon = providerIcons[providerId] || HardDrive;

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
      >
        <CurrentIcon className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-300 hidden sm:inline">
          {currentProvider?.name || 'Storage'}
        </span>
        <SyncStatusBadge status={syncStatus} />
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-gray-900 rounded-xl shadow-2xl border border-gray-800">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-gray-400" />
                <h2 className="text-lg font-semibold text-white">Storage Settings</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-6">
              {/* Current Status */}
              {user && (
                <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    {user.avatar && (
                      <img 
                        src={user.avatar} 
                        alt={user.name} 
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                    <div>
                      <p className="text-sm font-medium text-white">{user.name}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={signOut}
                    className="flex items-center gap-1 px-2 py-1 text-sm text-red-400 hover:bg-red-500/10 rounded transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}

              {/* Sync Status */}
              <div className="flex items-center justify-between">
                <SyncStatusBadge status={syncStatus} />
                <button
                  onClick={forceSync}
                  disabled={isLoading || syncStatus.status === 'syncing'}
                  className="flex items-center gap-1 px-2 py-1 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${syncStatus.status === 'syncing' ? 'animate-spin' : ''}`} />
                  Sync Now
                </button>
              </div>

              {syncStatus.error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-sm text-red-400">{syncStatus.error}</p>
                </div>
              )}

              {/* Provider Selection */}
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-3">Storage Provider</h3>
                <div className="space-y-2">
                  {availableProviders.map((provider) => (
                    <ProviderCard
                      key={provider.id}
                      provider={provider}
                      isActive={provider.id === providerId}
                      onSelect={handleProviderSelect}
                      isLoading={isSwitching || isLoading}
                    />
                  ))}
                </div>
              </div>

              {/* Import/Export */}
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-3">Data Management</h3>
                <div className="flex gap-2">
                  <button
                    onClick={exportData}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export</span>
                  </button>
                  <label className="flex-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json"
                      onChange={handleImport}
                      className="hidden"
                    />
                    <div className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors cursor-pointer">
                      <Upload className="w-4 h-4" />
                      <span>Import</span>
                    </div>
                  </label>
                </div>
                {importError && (
                  <p className="text-sm text-red-400 mt-2">{importError}</p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Export your data as JSON to backup or transfer to another device/provider.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-800">
              <p className="text-xs text-gray-500 text-center">
                Your data is stored in your chosen location. We never have access to it.
                <br />
                <span className="text-green-500">Free as in freedom 🗽</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
