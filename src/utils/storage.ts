/**
 * Storage utilities for password manager
 * Handles localStorage operations with error handling
 */

import { STORAGE_KEYS } from '../constants/config';
import type { EncryptedPasswordEntry } from '../types';

/**
 * Check if localStorage is available
 * @returns True if localStorage is available
 */
function isLocalStorageAvailable(): boolean {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get data from localStorage with error handling
 * @param key - Storage key
 * @param defaultValue - Default value if key doesn't exist
 * @returns Stored value or default value
 */
export function getStorageItem<T>(key: string, defaultValue: T): T {
  if (!isLocalStorageAvailable()) {
    console.warn('localStorage is not available');
    return defaultValue;
  }

  try {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage key "${key}":`, error);
    return defaultValue;
  }
}

/**
 * Set data in localStorage with error handling
 * @param key - Storage key
 * @param value - Value to store
 * @returns True if successful
 */
export function setStorageItem(key: string, value: unknown): boolean {
  if (!isLocalStorageAvailable()) {
    console.warn('localStorage is not available');
    return false;
  }

  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing to localStorage key "${key}":`, error);
    
    // Check if it's a quota exceeded error
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      throw new Error('Storage quota exceeded. Please export your data and clear some space.');
    }
    
    return false;
  }
}

/**
 * Remove data from localStorage
 * @param key - Storage key
 * @returns True if successful
 */
export function removeStorageItem(key: string): boolean {
  if (!isLocalStorageAvailable()) {
    return false;
  }

  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing localStorage key "${key}":`, error);
    return false;
  }
}

/**
 * Clear all vault data from localStorage
 * @returns True if successful
 */
export function clearVaultData(): boolean {
  const success1 = removeStorageItem(STORAGE_KEYS.VAULT_SALT);
  const success2 = removeStorageItem(STORAGE_KEYS.VAULT_DATA);
  const success3 = removeStorageItem(STORAGE_KEYS.SESSION_TIMEOUT);
  
  return success1 && success2 && success3;
}

/**
 * Get vault salt from storage
 * @returns Base64 encoded salt or null
 */
export function getVaultSalt(): string | null {
  return getStorageItem<string | null>(STORAGE_KEYS.VAULT_SALT, null);
}

/**
 * Set vault salt in storage
 * @param salt - Base64 encoded salt
 * @returns True if successful
 */
export function setVaultSalt(salt: string): boolean {
  return setStorageItem(STORAGE_KEYS.VAULT_SALT, salt);
}

/**
 * Get vault data from storage
 * @returns Array of encrypted password entries
 */
export function getVaultData(): EncryptedPasswordEntry[] {
  return getStorageItem<EncryptedPasswordEntry[]>(STORAGE_KEYS.VAULT_DATA, []);
}

/**
 * Set vault data in storage
 * @param data - Array of encrypted password entries
 * @returns True if successful
 */
export function setVaultData(data: EncryptedPasswordEntry[]): boolean {
  return setStorageItem(STORAGE_KEYS.VAULT_DATA, data);
}

/**
 * Add a password entry to vault
 * @param entry - Password entry to add
 * @returns True if successful
 */
export function addPasswordEntry(entry: EncryptedPasswordEntry): boolean {
  const vaultData = getVaultData();
  vaultData.push(entry);
  return setVaultData(vaultData);
}

/**
 * Update a password entry in vault
 * @param id - Entry ID to update
 * @param updatedEntry - Updated entry data
 * @returns True if successful
 */
export function updatePasswordEntry(id: string, updatedEntry: Partial<EncryptedPasswordEntry>): boolean {
  const vaultData = getVaultData();
  const index = vaultData.findIndex(entry => entry.id === id);
  
  if (index === -1) {
    return false;
  }
  
  vaultData[index] = { ...vaultData[index], ...updatedEntry, updatedAt: Date.now() };
  return setVaultData(vaultData);
}

/**
 * Delete a password entry from vault
 * @param id - Entry ID to delete
 * @returns True if successful
 */
export function deletePasswordEntry(id: string): boolean {
  const vaultData = getVaultData();
  const filteredData = vaultData.filter(entry => entry.id !== id);
  
  if (filteredData.length === vaultData.length) {
    return false; // Entry not found
  }
  
  return setVaultData(filteredData);
}

/**
 * Get session timeout from storage
 * @returns Session timeout timestamp
 */
export function getSessionTimeout(): number {
  return getStorageItem<number>(STORAGE_KEYS.SESSION_TIMEOUT, 0);
}

/**
 * Set session timeout in storage
 * @param timeout - Session timeout timestamp
 * @returns True if successful
 */
export function setSessionTimeout(timeout: number): boolean {
  return setStorageItem(STORAGE_KEYS.SESSION_TIMEOUT, timeout);
}

/**
 * Check if vault exists (has salt and data)
 * @returns True if vault exists
 */
export function vaultExists(): boolean {
  const salt = getVaultSalt();
  const data = getVaultData();
  return salt !== null && Array.isArray(data);
}

