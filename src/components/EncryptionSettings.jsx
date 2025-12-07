/**
 * Encryption Settings Component
 * 
 * Allows users to:
 * - Enable/disable encryption for local storage
 * - Set/change their passphrase
 * - View encryption status
 * 
 * Security considerations:
 * - Passphrase is never stored, only held in memory
 * - Clear warnings about data loss if passphrase is forgotten
 * - Strength indicator for passphrase
 */

import { useState, useEffect } from 'react';
import { 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff, 
  Shield, 
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Check,
  X,
  Loader2,
  Info
} from 'lucide-react';
import { validatePassphrase, isCryptoAvailable } from '../storage/encryption.js';

/**
 * Passphrase strength indicator
 */
function StrengthIndicator({ strength }) {
  const config = {
    weak: { color: 'bg-red-500', width: '25%', label: 'Weak' },
    fair: { color: 'bg-yellow-500', width: '50%', label: 'Fair' },
    good: { color: 'bg-blue-500', width: '75%', label: 'Good' },
    strong: { color: 'bg-green-500', width: '100%', label: 'Strong' }
  };

  const { color, width, label } = config[strength] || config.weak;

  return (
    <div className="mt-2">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-400">Strength</span>
        <span className={`${color.replace('bg-', 'text-')}`}>{label}</span>
      </div>
      <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} transition-all duration-300`}
          style={{ width }}
        />
      </div>
    </div>
  );
}

/**
 * Passphrase requirements checklist
 */
function RequirementsList({ passphrase }) {
  const requirements = [
    { test: (p) => p.length >= 8, label: 'At least 8 characters' },
    { test: (p) => /[a-z]/.test(p), label: 'Lowercase letter' },
    { test: (p) => /[A-Z]/.test(p), label: 'Uppercase letter' },
    { test: (p) => /[0-9]/.test(p), label: 'Number' },
  ];

  return (
    <div className="mt-3 space-y-1">
      {requirements.map(({ test, label }) => {
        const passed = passphrase && test(passphrase);
        return (
          <div 
            key={label}
            className={`flex items-center gap-2 text-xs ${passed ? 'text-green-400' : 'text-gray-500'}`}
          >
            {passed ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
            <span>{label}</span>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Main Encryption Settings Component
 */
export default function EncryptionSettings({ 
  provider, 
  onEncryptionChange,
  isOpen,
  onClose 
}) {
  const [passphrase, setPassphrase] = useState('');
  const [confirmPassphrase, setConfirmPassphrase] = useState('');
  const [currentPassphrase, setCurrentPassphrase] = useState('');
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const isEncrypted = provider?.isEncrypted?.() || false;
  const cryptoAvailable = isCryptoAvailable();
  const validation = validatePassphrase(passphrase);

  // Clear form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setPassphrase('');
      setConfirmPassphrase('');
      setCurrentPassphrase('');
      setShowPassphrase(false);
      setError(null);
      setSuccess(null);
    }
  }, [isOpen]);

  const handleEnableEncryption = async () => {
    setError(null);
    setSuccess(null);

    // Validate passphrase
    if (!validation.valid) {
      setError(validation.errors.join(', '));
      return;
    }

    // Check confirmation
    if (passphrase !== confirmPassphrase) {
      setError('Passphrases do not match');
      return;
    }

    setIsLoading(true);

    try {
      await provider.enableEncryption(passphrase);
      setSuccess('Encryption enabled successfully! Your data is now protected.');
      onEncryptionChange?.(true);
      
      // Clear form
      setPassphrase('');
      setConfirmPassphrase('');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisableEncryption = async () => {
    setError(null);
    setSuccess(null);

    if (!currentPassphrase) {
      setError('Enter your current passphrase to disable encryption');
      return;
    }

    setIsLoading(true);

    try {
      await provider.disableEncryption(currentPassphrase);
      setSuccess('Encryption disabled. Your data is now stored in plain text.');
      onEncryptionChange?.(false);
      
      // Clear form
      setCurrentPassphrase('');
    } catch (err) {
      setError('Invalid passphrase or decryption failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnlock = async () => {
    setError(null);

    if (!currentPassphrase) {
      setError('Enter your passphrase to unlock');
      return;
    }

    setIsLoading(true);

    try {
      provider.setPassphrase(currentPassphrase);
      // Try to load data to verify passphrase
      await provider.load();
      setSuccess('Data unlocked successfully!');
      onEncryptionChange?.(true, true); // true = encrypted, true = unlocked
      setCurrentPassphrase('');
    } catch (err) {
      provider.clearPassphrase();
      setError('Invalid passphrase');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-gray-900 rounded-xl shadow-2xl border border-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            {isEncrypted ? (
              <ShieldCheck className="w-5 h-5 text-green-400" />
            ) : (
              <Shield className="w-5 h-5 text-gray-400" />
            )}
            <h2 className="text-lg font-semibold text-white">
              {isEncrypted ? 'Encryption Enabled' : 'Enable Encryption'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Crypto availability check */}
          {!cryptoAvailable && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="flex items-start gap-2">
                <ShieldAlert className="w-5 h-5 text-red-400 mt-0.5" />
                <div>
                  <p className="text-sm text-red-400 font-medium">
                    Encryption Not Available
                  </p>
                  <p className="text-xs text-red-400/70 mt-1">
                    Your browser doesn't support the Web Crypto API. 
                    Please use a modern browser like Chrome, Firefox, or Safari.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Status */}
          <div className={`p-3 rounded-lg ${isEncrypted ? 'bg-green-500/10' : 'bg-gray-800'}`}>
            <div className="flex items-center gap-2">
              {isEncrypted ? (
                <>
                  <Lock className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-green-400">
                    Your data is encrypted with AES-256-GCM
                  </span>
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm text-yellow-400">
                    Your data is stored in plain text
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Warning */}
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
              <div>
                <p className="text-sm text-yellow-400 font-medium">
                  Important
                </p>
                <p className="text-xs text-yellow-400/70 mt-1">
                  {isEncrypted 
                    ? "If you forget your passphrase, your data cannot be recovered. There is no password reset."
                    : "Encryption protects your financial data from unauthorized access. Choose a strong passphrase you'll remember."
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Error/Success messages */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-sm text-green-400">{success}</p>
            </div>
          )}

          {/* Enable Encryption Form */}
          {!isEncrypted && cryptoAvailable && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Create Passphrase
                </label>
                <div className="relative">
                  <input
                    type={showPassphrase ? 'text' : 'password'}
                    value={passphrase}
                    onChange={(e) => setPassphrase(e.target.value)}
                    placeholder="Enter a strong passphrase"
                    className="w-full px-3 py-2 pr-10 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassphrase(!showPassphrase)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-white"
                  >
                    {showPassphrase ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passphrase && <StrengthIndicator strength={validation.strength} />}
                <RequirementsList passphrase={passphrase} />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Confirm Passphrase
                </label>
                <input
                  type={showPassphrase ? 'text' : 'password'}
                  value={confirmPassphrase}
                  onChange={(e) => setConfirmPassphrase(e.target.value)}
                  placeholder="Confirm your passphrase"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                />
                {confirmPassphrase && passphrase !== confirmPassphrase && (
                  <p className="text-xs text-red-400 mt-1">Passphrases do not match</p>
                )}
              </div>

              <button
                onClick={handleEnableEncryption}
                disabled={isLoading || !validation.valid || passphrase !== confirmPassphrase}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Lock className="w-4 h-4" />
                )}
                <span>Enable Encryption</span>
              </button>
            </div>
          )}

          {/* Disable Encryption Form */}
          {isEncrypted && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Current Passphrase
                </label>
                <div className="relative">
                  <input
                    type={showPassphrase ? 'text' : 'password'}
                    value={currentPassphrase}
                    onChange={(e) => setCurrentPassphrase(e.target.value)}
                    placeholder="Enter your passphrase"
                    className="w-full px-3 py-2 pr-10 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassphrase(!showPassphrase)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-white"
                  >
                    {showPassphrase ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleUnlock}
                  disabled={isLoading || !currentPassphrase}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Unlock className="w-4 h-4" />
                  )}
                  <span>Unlock</span>
                </button>

                <button
                  onClick={handleDisableEncryption}
                  disabled={isLoading || !currentPassphrase}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ShieldAlert className="w-4 h-4" />
                  )}
                  <span>Disable</span>
                </button>
              </div>
            </div>
          )}

          {/* Info */}
          <div className="flex items-start gap-2 text-xs text-gray-500">
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p>
              Encryption uses AES-256-GCM with PBKDF2 key derivation (100,000 iterations). 
              Your passphrase is never stored - only used to derive the encryption key.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
