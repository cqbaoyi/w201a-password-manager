/**
 * Crypto utilities for password manager
 * Uses Web Crypto API for secure encryption/decryption
 */

import {
  PBKDF2_ITERATIONS,
  KEY_LENGTH,
  IV_LENGTH,
  SALT_LENGTH,
} from '../constants/config';
import type { PasswordEntry, EncryptedPasswordEntry } from '../types';

/**
 * Generate a random salt for key derivation
 * @returns Random salt
 */
export function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
}

/**
 * Generate a random IV for encryption
 * @returns Random IV
 */
export function generateIV(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(IV_LENGTH));
}

/**
 * Derive encryption key from master password using PBKDF2
 * @param masterPassword - The master password
 * @param salt - Salt for key derivation
 * @returns Derived encryption key
 */
export async function deriveKey(masterPassword: string, salt: Uint8Array): Promise<CryptoKey> {
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
 * @param data - Data to encrypt
 * @param key - Encryption key
 * @param iv - Initialization vector
 * @returns Base64 encoded encrypted data
 */
export async function encryptData(data: string, key: CryptoKey, iv: Uint8Array): Promise<string> {
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
 * @param encryptedData - Base64 encoded encrypted data
 * @param key - Decryption key
 * @param iv - Initialization vector
 * @returns Decrypted data
 */
export async function decryptData(encryptedData: string, key: CryptoKey, iv: Uint8Array): Promise<string> {
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
 * @param entry - Password entry to encrypt
 * @param key - Encryption key
 * @returns Encrypted password entry
 */
export async function encryptPasswordEntry(entry: PasswordEntry, key: CryptoKey): Promise<EncryptedPasswordEntry> {
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
 * @param encryptedEntry - Encrypted password entry
 * @param key - Decryption key
 * @returns Decrypted password entry
 */
export async function decryptPasswordEntry(encryptedEntry: EncryptedPasswordEntry, key: CryptoKey): Promise<PasswordEntry> {
  const iv = base64ToUint8Array(encryptedEntry.iv);
  
  const password = await decryptData(encryptedEntry.password, key, iv);
  const notes = encryptedEntry.notes ? await decryptData(encryptedEntry.notes, key, iv) : '';

  return {
    ...encryptedEntry,
    password,
    notes,
    iv: undefined // Remove IV from decrypted entry
  } as PasswordEntry;
}

/**
 * Verify master password by attempting to decrypt vault
 * @param masterPassword - Master password to verify
 * @param vaultSalt - Base64 encoded vault salt
 * @param vaultData - Encrypted vault data
 * @returns True if password is correct
 */
export async function verifyMasterPassword(
  masterPassword: string,
  vaultSalt: string,
  vaultData: EncryptedPasswordEntry[]
): Promise<boolean> {
  try {
    const salt = base64ToUint8Array(vaultSalt);
    const key = await deriveKey(masterPassword, salt);
    
    // Try to decrypt the first entry to verify the key
    if (vaultData.length > 0) {
      await decryptPasswordEntry(vaultData[0], key);
    }
    
    return true;
  } catch {
    return false;
  }
}

/**
 * Convert ArrayBuffer to Base64 string
 * @param buffer - ArrayBuffer to convert
 * @returns Base64 string
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Convert Base64 string to ArrayBuffer
 * @param base64 - Base64 string to convert
 * @returns ArrayBuffer
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Convert Base64 string to Uint8Array
 * @param base64 - Base64 string to convert
 * @returns Uint8Array
 */
function base64ToUint8Array(base64: string): Uint8Array {
  return new Uint8Array(base64ToArrayBuffer(base64));
}

