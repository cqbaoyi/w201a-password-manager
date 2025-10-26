/**
 * Crypto utilities for password manager
 * Uses Web Crypto API for secure encryption/decryption
 */

// Configuration
const PBKDF2_ITERATIONS = 100000;
const KEY_LENGTH = 256;
const IV_LENGTH = 12; // 96 bits for AES-GCM

/**
 * Generate a random salt for key derivation
 * @returns {Uint8Array} Random salt
 */
export function generateSalt() {
  return crypto.getRandomValues(new Uint8Array(16));
}

/**
 * Generate a random IV for encryption
 * @returns {Uint8Array} Random IV
 */
export function generateIV() {
  return crypto.getRandomValues(new Uint8Array(IV_LENGTH));
}

/**
 * Derive encryption key from master password using PBKDF2
 * @param {string} masterPassword - The master password
 * @param {Uint8Array} salt - Salt for key derivation
 * @returns {Promise<CryptoKey>} Derived encryption key
 */
export async function deriveKey(masterPassword, salt) {
  const passwordBuffer = new TextEncoder().encode(masterPassword);
  
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256'
    },
    keyMaterial,
    {
      name: 'AES-GCM',
      length: KEY_LENGTH
    },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt data using AES-GCM
 * @param {string} data - Data to encrypt
 * @param {CryptoKey} key - Encryption key
 * @param {Uint8Array} iv - Initialization vector
 * @returns {Promise<string>} Base64 encoded encrypted data
 */
export async function encryptData(data, key, iv) {
  const dataBuffer = new TextEncoder().encode(data);
  
  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv
    },
    key,
    dataBuffer
  );

  return arrayBufferToBase64(encryptedBuffer);
}

/**
 * Decrypt data using AES-GCM
 * @param {string} encryptedData - Base64 encoded encrypted data
 * @param {CryptoKey} key - Decryption key
 * @param {Uint8Array} iv - Initialization vector
 * @returns {Promise<string>} Decrypted data
 */
export async function decryptData(encryptedData, key, iv) {
  const encryptedBuffer = base64ToArrayBuffer(encryptedData);
  
  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv
    },
    key,
    encryptedBuffer
  );

  return new TextDecoder().decode(decryptedBuffer);
}

/**
 * Encrypt a password entry
 * @param {Object} entry - Password entry to encrypt
 * @param {CryptoKey} key - Encryption key
 * @returns {Promise<Object>} Encrypted password entry
 */
export async function encryptPasswordEntry(entry, key) {
  const iv = generateIV();
  
  const encryptedPassword = await encryptData(entry.password, key, iv);
  const encryptedNotes = entry.notes ? await encryptData(entry.notes, key, iv) : '';

  return {
    ...entry,
    password: encryptedPassword,
    notes: encryptedNotes,
    iv: arrayBufferToBase64(iv)
  };
}

/**
 * Decrypt a password entry
 * @param {Object} encryptedEntry - Encrypted password entry
 * @param {CryptoKey} key - Decryption key
 * @returns {Promise<Object>} Decrypted password entry
 */
export async function decryptPasswordEntry(encryptedEntry, key) {
  const iv = base64ToUint8Array(encryptedEntry.iv);
  
  const password = await decryptData(encryptedEntry.password, key, iv);
  const notes = encryptedEntry.notes ? await decryptData(encryptedEntry.notes, key, iv) : '';

  return {
    ...encryptedEntry,
    password,
    notes,
    iv: undefined // Remove IV from decrypted entry
  };
}

/**
 * Verify master password by attempting to decrypt vault
 * @param {string} masterPassword - Master password to verify
 * @param {string} vaultSalt - Base64 encoded vault salt
 * @param {Array} vaultData - Encrypted vault data
 * @returns {Promise<boolean>} True if password is correct
 */
export async function verifyMasterPassword(masterPassword, vaultSalt, vaultData) {
  try {
    const salt = base64ToUint8Array(vaultSalt);
    const key = await deriveKey(masterPassword, salt);
    
    // Try to decrypt the first entry to verify the key
    if (vaultData.length > 0) {
      await decryptPasswordEntry(vaultData[0], key);
    }
    
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Convert ArrayBuffer to Base64 string
 * @param {ArrayBuffer} buffer - ArrayBuffer to convert
 * @returns {string} Base64 string
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
 * @param {string} base64 - Base64 string to convert
 * @returns {ArrayBuffer} ArrayBuffer
 */
function base64ToArrayBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Convert Base64 string to Uint8Array
 * @param {string} base64 - Base64 string to convert
 * @returns {Uint8Array} Uint8Array
 */
function base64ToUint8Array(base64) {
  return new Uint8Array(base64ToArrayBuffer(base64));
}

