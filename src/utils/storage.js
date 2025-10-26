/**
 * Storage utilities for password manager
 * Handles localStorage operations with error handling
 */

const STORAGE_KEYS = {
  VAULT_SALT: 'vault_salt',
  VAULT_DATA: 'vault_data',
  SESSION_TIMEOUT: 'session_timeout'
};

/**
 * Check if localStorage is available
 * @returns {boolean} True if localStorage is available
 */
function isLocalStorageAvailable() {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Get data from localStorage with error handling
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if key doesn't exist
 * @returns {*} Stored value or default value
 */
export function getStorageItem(key, defaultValue = null) {
  if (!isLocalStorageAvailable()) {
    console.warn('localStorage is not available');
    return defaultValue;
  }

  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage key "${key}":`, error);
    return defaultValue;
  }
}

/**
 * Set data in localStorage with error handling
 * @param {string} key - Storage key
 * @param {*} value - Value to store
 * @returns {boolean} True if successful
 */
export function setStorageItem(key, value) {
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
    if (error.name === 'QuotaExceededError') {
      throw new Error('Storage quota exceeded. Please export your data and clear some space.');
    }
    
    return false;
  }
}

/**
 * Remove data from localStorage
 * @param {string} key - Storage key
 * @returns {boolean} True if successful
 */
export function removeStorageItem(key) {
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
 * @returns {boolean} True if successful
 */
export function clearVaultData() {
  const success1 = removeStorageItem(STORAGE_KEYS.VAULT_SALT);
  const success2 = removeStorageItem(STORAGE_KEYS.VAULT_DATA);
  const success3 = removeStorageItem(STORAGE_KEYS.SESSION_TIMEOUT);
  
  return success1 && success2 && success3;
}

/**
 * Get vault salt from storage
 * @returns {string|null} Base64 encoded salt or null
 */
export function getVaultSalt() {
  return getStorageItem(STORAGE_KEYS.VAULT_SALT);
}

/**
 * Set vault salt in storage
 * @param {string} salt - Base64 encoded salt
 * @returns {boolean} True if successful
 */
export function setVaultSalt(salt) {
  return setStorageItem(STORAGE_KEYS.VAULT_SALT, salt);
}

/**
 * Get vault data from storage
 * @returns {Array} Array of encrypted password entries
 */
export function getVaultData() {
  return getStorageItem(STORAGE_KEYS.VAULT_DATA, []);
}

/**
 * Set vault data in storage
 * @param {Array} data - Array of encrypted password entries
 * @returns {boolean} True if successful
 */
export function setVaultData(data) {
  return setStorageItem(STORAGE_KEYS.VAULT_DATA, data);
}

/**
 * Add a password entry to vault
 * @param {Object} entry - Password entry to add
 * @returns {boolean} True if successful
 */
export function addPasswordEntry(entry) {
  const vaultData = getVaultData();
  vaultData.push(entry);
  return setVaultData(vaultData);
}

/**
 * Update a password entry in vault
 * @param {string} id - Entry ID to update
 * @param {Object} updatedEntry - Updated entry data
 * @returns {boolean} True if successful
 */
export function updatePasswordEntry(id, updatedEntry) {
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
 * @param {string} id - Entry ID to delete
 * @returns {boolean} True if successful
 */
export function deletePasswordEntry(id) {
  const vaultData = getVaultData();
  const filteredData = vaultData.filter(entry => entry.id !== id);
  
  if (filteredData.length === vaultData.length) {
    return false; // Entry not found
  }
  
  return setVaultData(filteredData);
}

/**
 * Get session timeout from storage
 * @returns {number} Session timeout timestamp
 */
export function getSessionTimeout() {
  return getStorageItem(STORAGE_KEYS.SESSION_TIMEOUT, 0);
}

/**
 * Set session timeout in storage
 * @param {number} timeout - Session timeout timestamp
 * @returns {boolean} True if successful
 */
export function setSessionTimeout(timeout) {
  return setStorageItem(STORAGE_KEYS.SESSION_TIMEOUT, timeout);
}

/**
 * Check if vault exists (has salt and data)
 * @returns {boolean} True if vault exists
 */
export function vaultExists() {
  const salt = getVaultSalt();
  const data = getVaultData();
  return salt !== null && Array.isArray(data);
}

