/**
 * Encryption Module for Local Storage
 * 
 * Provides AES-GCM encryption for data at rest in localStorage.
 * Uses the Web Crypto API for secure, browser-native encryption.
 * 
 * Security Features:
 * - AES-256-GCM encryption (authenticated encryption)
 * - PBKDF2 key derivation with 100,000 iterations
 * - Random salt per encryption key
 * - Random IV per encryption operation
 * - No plaintext secrets in memory longer than necessary
 * 
 * DevSecOps Considerations:
 * - All crypto operations use Web Crypto API (not custom implementations)
 * - Key material is derived, not stored directly
 * - Graceful degradation if crypto unavailable
 * - Comprehensive logging for troubleshooting (without exposing secrets)
 * 
 * @module storage/encryption
 */

// Encryption configuration
const ENCRYPTION_CONFIG = {
  algorithm: 'AES-GCM',
  keyLength: 256,
  ivLength: 12,        // 96 bits for GCM
  saltLength: 16,      // 128 bits
  tagLength: 128,      // Authentication tag length in bits
  iterations: 100000,  // PBKDF2 iterations (OWASP recommended minimum)
  hash: 'SHA-256'
};

// Storage keys for encryption metadata
const ENCRYPTION_SALT_KEY = 'peasant-budget-encryption-salt';
const ENCRYPTION_CHECK_KEY = 'peasant-budget-encryption-check';
const ENCRYPTION_CHECK_VALUE = 'peasant-budget-encrypted';

/**
 * Logger for encryption operations
 * Follows SRE logging best practices - context without secrets
 */
const logger = {
  info: (message, context = {}) => {
    console.log(`[Encryption] ${message}`, {
      timestamp: new Date().toISOString(),
      ...context
    });
  },
  warn: (message, context = {}) => {
    console.warn(`[Encryption] ${message}`, {
      timestamp: new Date().toISOString(),
      ...context
    });
  },
  error: (message, error, context = {}) => {
    console.error(`[Encryption] ${message}`, {
      timestamp: new Date().toISOString(),
      error: error?.message || error,
      stack: error?.stack,
      ...context
    });
  }
};

/**
 * Check if Web Crypto API is available
 * @returns {boolean}
 */
export function isCryptoAvailable() {
  try {
    return !!(
      typeof window !== 'undefined' &&
      window.crypto &&
      window.crypto.subtle &&
      typeof window.crypto.subtle.encrypt === 'function'
    );
  } catch (e) {
    logger.warn('Crypto availability check failed', { error: e.message });
    return false;
  }
}

/**
 * Generate cryptographically secure random bytes
 * @param {number} length - Number of bytes
 * @returns {Uint8Array}
 */
function getRandomBytes(length) {
  return window.crypto.getRandomValues(new Uint8Array(length));
}

/**
 * Convert ArrayBuffer to Base64 string
 * @param {ArrayBuffer} buffer
 * @returns {string}
 */
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Convert Base64 string to ArrayBuffer
 * @param {string} base64
 * @returns {Uint8Array}
 */
function base64ToArrayBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Derive an encryption key from a passphrase using PBKDF2
 * @param {string} passphrase - User's passphrase
 * @param {Uint8Array} salt - Salt for key derivation
 * @returns {Promise<CryptoKey>}
 */
async function deriveKey(passphrase, salt) {
  const encoder = new TextEncoder();
  const passphraseKey = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: ENCRYPTION_CONFIG.iterations,
      hash: ENCRYPTION_CONFIG.hash
    },
    passphraseKey,
    {
      name: ENCRYPTION_CONFIG.algorithm,
      length: ENCRYPTION_CONFIG.keyLength
    },
    false, // Not extractable
    ['encrypt', 'decrypt']
  );
}

/**
 * Get or create the encryption salt
 * Salt is stored in localStorage and reused for the same device
 * @returns {Uint8Array}
 */
function getOrCreateSalt() {
  try {
    const storedSalt = localStorage.getItem(ENCRYPTION_SALT_KEY);
    
    if (storedSalt) {
      logger.info('Using existing encryption salt');
      return base64ToArrayBuffer(storedSalt);
    }

    // Generate new salt
    const newSalt = getRandomBytes(ENCRYPTION_CONFIG.saltLength);
    localStorage.setItem(ENCRYPTION_SALT_KEY, arrayBufferToBase64(newSalt));
    logger.info('Generated new encryption salt');
    return newSalt;
  } catch (error) {
    logger.error('Failed to get/create salt', error);
    throw new Error('Encryption initialization failed');
  }
}

/**
 * Encrypt data using AES-GCM
 * @param {string} plaintext - Data to encrypt (JSON string)
 * @param {string} passphrase - User's passphrase
 * @returns {Promise<string>} - Base64 encoded encrypted data with IV prefix
 */
export async function encrypt(plaintext, passphrase) {
  if (!isCryptoAvailable()) {
    throw new Error('Web Crypto API not available');
  }

  if (!passphrase || passphrase.length < 8) {
    throw new Error('Passphrase must be at least 8 characters');
  }

  const startTime = performance.now();

  try {
    const salt = getOrCreateSalt();
    const key = await deriveKey(passphrase, salt);
    const iv = getRandomBytes(ENCRYPTION_CONFIG.ivLength);
    const encoder = new TextEncoder();
    const data = encoder.encode(plaintext);

    const encryptedBuffer = await window.crypto.subtle.encrypt(
      {
        name: ENCRYPTION_CONFIG.algorithm,
        iv: iv,
        tagLength: ENCRYPTION_CONFIG.tagLength
      },
      key,
      data
    );

    // Combine IV + encrypted data
    const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encryptedBuffer), iv.length);

    const result = arrayBufferToBase64(combined);

    const duration = performance.now() - startTime;
    logger.info('Encryption successful', {
      inputSize: plaintext.length,
      outputSize: result.length,
      durationMs: Math.round(duration)
    });

    return result;
  } catch (error) {
    logger.error('Encryption failed', error, {
      inputSize: plaintext?.length
    });
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt data using AES-GCM
 * @param {string} ciphertext - Base64 encoded encrypted data with IV prefix
 * @param {string} passphrase - User's passphrase
 * @returns {Promise<string>} - Decrypted plaintext
 */
export async function decrypt(ciphertext, passphrase) {
  if (!isCryptoAvailable()) {
    throw new Error('Web Crypto API not available');
  }

  if (!passphrase) {
    throw new Error('Passphrase is required for decryption');
  }

  const startTime = performance.now();

  try {
    const salt = getOrCreateSalt();
    const key = await deriveKey(passphrase, salt);
    const combined = base64ToArrayBuffer(ciphertext);

    // Extract IV and encrypted data
    const iv = combined.slice(0, ENCRYPTION_CONFIG.ivLength);
    const encryptedData = combined.slice(ENCRYPTION_CONFIG.ivLength);

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: ENCRYPTION_CONFIG.algorithm,
        iv: iv,
        tagLength: ENCRYPTION_CONFIG.tagLength
      },
      key,
      encryptedData
    );

    const decoder = new TextDecoder();
    const result = decoder.decode(decryptedBuffer);

    const duration = performance.now() - startTime;
    logger.info('Decryption successful', {
      inputSize: ciphertext.length,
      outputSize: result.length,
      durationMs: Math.round(duration)
    });

    return result;
  } catch (error) {
    // Don't log the actual error for decryption failures (could be wrong passphrase)
    logger.warn('Decryption failed', {
      inputSize: ciphertext?.length,
      errorType: error.name
    });
    
    // Provide user-friendly error
    if (error.name === 'OperationError') {
      throw new Error('Invalid passphrase or corrupted data');
    }
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Check if encryption is enabled for this storage
 * @returns {boolean}
 */
export function isEncryptionEnabled() {
  try {
    return localStorage.getItem(ENCRYPTION_CHECK_KEY) === ENCRYPTION_CHECK_VALUE;
  } catch (e) {
    return false;
  }
}

/**
 * Mark encryption as enabled
 */
export function setEncryptionEnabled() {
  try {
    localStorage.setItem(ENCRYPTION_CHECK_KEY, ENCRYPTION_CHECK_VALUE);
    logger.info('Encryption enabled for this storage');
  } catch (error) {
    logger.error('Failed to set encryption flag', error);
  }
}

/**
 * Clear encryption settings (for disabling encryption)
 */
export function clearEncryptionSettings() {
  try {
    localStorage.removeItem(ENCRYPTION_CHECK_KEY);
    localStorage.removeItem(ENCRYPTION_SALT_KEY);
    logger.info('Encryption settings cleared');
  } catch (error) {
    logger.error('Failed to clear encryption settings', error);
  }
}

/**
 * Validate passphrase strength
 * @param {string} passphrase
 * @returns {{valid: boolean, errors: string[]}}
 */
export function validatePassphrase(passphrase) {
  const errors = [];

  if (!passphrase) {
    errors.push('Passphrase is required');
  } else {
    if (passphrase.length < 8) {
      errors.push('Passphrase must be at least 8 characters');
    }
    if (passphrase.length > 128) {
      errors.push('Passphrase must be less than 128 characters');
    }
    if (!/[a-z]/.test(passphrase)) {
      errors.push('Passphrase should contain lowercase letters');
    }
    if (!/[A-Z]/.test(passphrase)) {
      errors.push('Passphrase should contain uppercase letters');
    }
    if (!/[0-9]/.test(passphrase)) {
      errors.push('Passphrase should contain numbers');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    strength: calculatePassphraseStrength(passphrase)
  };
}

/**
 * Calculate passphrase strength score
 * @param {string} passphrase
 * @returns {'weak'|'fair'|'good'|'strong'}
 */
function calculatePassphraseStrength(passphrase) {
  if (!passphrase) return 'weak';

  let score = 0;
  
  // Length scoring
  if (passphrase.length >= 8) score += 1;
  if (passphrase.length >= 12) score += 1;
  if (passphrase.length >= 16) score += 1;
  
  // Character variety
  if (/[a-z]/.test(passphrase)) score += 1;
  if (/[A-Z]/.test(passphrase)) score += 1;
  if (/[0-9]/.test(passphrase)) score += 1;
  if (/[^a-zA-Z0-9]/.test(passphrase)) score += 1;

  if (score <= 2) return 'weak';
  if (score <= 4) return 'fair';
  if (score <= 6) return 'good';
  return 'strong';
}

/**
 * Get encryption health status for monitoring
 * @returns {Object}
 */
export function getEncryptionHealth() {
  return {
    cryptoAvailable: isCryptoAvailable(),
    encryptionEnabled: isEncryptionEnabled(),
    saltExists: !!localStorage.getItem(ENCRYPTION_SALT_KEY),
    algorithm: ENCRYPTION_CONFIG.algorithm,
    keyLength: ENCRYPTION_CONFIG.keyLength,
    iterations: ENCRYPTION_CONFIG.iterations
  };
}

export default {
  encrypt,
  decrypt,
  isCryptoAvailable,
  isEncryptionEnabled,
  setEncryptionEnabled,
  clearEncryptionSettings,
  validatePassphrase,
  getEncryptionHealth
};
