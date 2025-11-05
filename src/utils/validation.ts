/**
 * Validation utilities for password manager
 * Input validation and sanitization helpers
 */

import {
  MIN_PASSWORD_LENGTH,
  MAX_PASSWORD_LENGTH,
  MAX_TITLE_LENGTH,
  MAX_USERNAME_LENGTH,
  MAX_PASSWORD_ENTRY_LENGTH,
  MAX_URL_LENGTH,
  MAX_NOTES_LENGTH,
  MAX_INPUT_LENGTH,
  MIN_SEARCH_QUERY_LENGTH,
  MAX_SEARCH_QUERY_LENGTH,
  MIN_PASSWORD_GEN_LENGTH,
  MAX_PASSWORD_GEN_LENGTH,
} from '../constants/config';
import type { ValidationResult, SearchValidationResult, PasswordEntry, PasswordConfig, ImportData } from '../types';

/**
 * Validate master password
 * @param password - Master password to validate
 * @returns Validation result
 */
export function validateMasterPassword(password: string): ValidationResult {
  const errors: string[] = [];
  
  if (!password || typeof password !== 'string') {
    errors.push('Master password is required');
    return { isValid: false, errors };
  }
  
  if (password.length < MIN_PASSWORD_LENGTH) {
    errors.push(`Master password must be at least ${MIN_PASSWORD_LENGTH} characters long`);
  }
  
  if (password.length > MAX_PASSWORD_LENGTH) {
    errors.push(`Master password must be less than ${MAX_PASSWORD_LENGTH} characters`);
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Master password must contain at least one lowercase letter');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Master password must contain at least one uppercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Master password must contain at least one number');
  }
  
  if (!/[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(password)) {
    errors.push('Master password must contain at least one special character');
  }
  
  // Check for common weak patterns
  if (isCommonPassword(password)) {
    errors.push('Master password is too common, please choose a stronger password');
  }
  
  if (hasRepeatedCharacters(password)) {
    errors.push('Master password should not have repeated characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate password entry data
 * @param entry - Password entry to validate
 * @returns Validation result
 */
export function validatePasswordEntry(entry: Partial<PasswordEntry>): ValidationResult {
  const errors: string[] = [];
  
  // Validate title
  if (!entry.title || typeof entry.title !== 'string' || entry.title.trim().length === 0) {
    errors.push('Title is required');
  } else if (entry.title.length > MAX_TITLE_LENGTH) {
    errors.push(`Title must be less than ${MAX_TITLE_LENGTH} characters`);
  }
  
  // Validate username
  if (entry.username && entry.username.length > MAX_USERNAME_LENGTH) {
    errors.push(`Username must be less than ${MAX_USERNAME_LENGTH} characters`);
  }
  
  // Validate password
  if (!entry.password || typeof entry.password !== 'string' || entry.password.length === 0) {
    errors.push('Password is required');
  } else if (entry.password.length > MAX_PASSWORD_ENTRY_LENGTH) {
    errors.push(`Password must be less than ${MAX_PASSWORD_ENTRY_LENGTH} characters`);
  }
  
  // Validate URL
  if (entry.url && entry.url.length > 0) {
    if (!isValidUrl(entry.url)) {
      errors.push('URL must be a valid URL format');
    } else if (entry.url.length > MAX_URL_LENGTH) {
      errors.push(`URL must be less than ${MAX_URL_LENGTH} characters`);
    }
  }
  
  // Validate notes
  if (entry.notes && entry.notes.length > MAX_NOTES_LENGTH) {
    errors.push(`Notes must be less than ${MAX_NOTES_LENGTH} characters`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate URL format
 * @param url - URL to validate
 * @returns True if valid URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Sanitize input string
 * @param input - Input to sanitize
 * @param maxLength - Maximum length
 * @returns Sanitized string
 */
export function sanitizeInput(input: string, maxLength: number = MAX_INPUT_LENGTH): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  // Remove control characters and trim
  // eslint-disable-next-line no-control-regex
  let sanitized = input.replace(/[\x00-\x1F\x7F]/g, '').trim();
  
  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  return sanitized;
}

/**
 * Check if password is common/weak
 * @param password - Password to check
 * @returns True if password is common
 */
function isCommonPassword(password: string): boolean {
  const commonPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123',
    'password123', 'admin', 'letmein', 'welcome', 'monkey',
    '1234567890', 'dragon', 'master', 'hello', 'freedom',
    'whatever', 'qazwsx', 'trustno1', 'jordan', 'jennifer',
    'zxcvbnm', 'asdfgh', 'hunter', 'buster', 'soccer',
    'harley', 'andrew', 'tigger', 'sunshine', 'iloveyou',
    '2000', 'charlie', 'robert', 'thomas', 'hockey',
    'ranger', 'daniel', 'starwars', 'klaster', '112233',
    'george', 'computer', 'michelle', 'jessica', 'pepper',
    '1234', '12345', '1234567', '12345678', '1234567890'
  ];
  
  return commonPasswords.includes(password.toLowerCase());
}

/**
 * Check if password has repeated characters
 * @param password - Password to check
 * @returns True if has repeated characters
 */
function hasRepeatedCharacters(password: string): boolean {
  return /(.)\1{2,}/.test(password);
}

/**
 * Validate search query
 * @param query - Search query to validate
 * @returns Validation result
 */
export function validateSearchQuery(query: string): SearchValidationResult {
  if (typeof query !== 'string') {
    return { isValid: false, errors: ['Search query must be a string'] };
  }
  
  const sanitized = sanitizeInput(query, MAX_SEARCH_QUERY_LENGTH);
  
  if (sanitized.length === 0) {
    return { isValid: true, query: '' };
  }
  
  if (sanitized.length < MIN_SEARCH_QUERY_LENGTH) {
    return { isValid: false, errors: [`Search query must be at least ${MIN_SEARCH_QUERY_LENGTH} characters`] };
  }
  
  return { isValid: true, query: sanitized };
}

/**
 * Validate password generation configuration
 * @param config - Generation configuration
 * @returns Validation result
 */
export function validatePasswordConfig(config: Partial<PasswordConfig>): ValidationResult {
  const errors: string[] = [];
  
  // Validate length
  if (typeof config.length !== 'number' || config.length < MIN_PASSWORD_GEN_LENGTH || config.length > MAX_PASSWORD_GEN_LENGTH) {
    errors.push(`Password length must be between ${MIN_PASSWORD_GEN_LENGTH} and ${MAX_PASSWORD_GEN_LENGTH} characters`);
  }
  
  // Validate character type options
  const charTypeOptions: (keyof PasswordConfig)[] = ['includeLowercase', 'includeUppercase', 'includeNumbers', 'includeSymbols'];
  const hasAtLeastOneType = charTypeOptions.some(option => config[option] === true);
  
  if (!hasAtLeastOneType) {
    errors.push('At least one character type must be selected');
  }
  
  // Validate boolean options
  const booleanOptions: (keyof PasswordConfig)[] = ['includeLowercase', 'includeUppercase', 'includeNumbers', 'includeSymbols', 'excludeAmbiguous'];
  booleanOptions.forEach(option => {
    if (config[option] !== undefined && typeof config[option] !== 'boolean') {
      errors.push(`${option} must be a boolean value`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate import data format
 * @param data - Import data to validate
 * @returns Validation result
 */
export function validateImportData(data: unknown): ValidationResult {
  const errors: string[] = [];
  
  if (!data || typeof data !== 'object') {
    errors.push('Import data must be an object');
    return { isValid: false, errors };
  }
  
  const importData = data as Partial<ImportData>;
  
  if (!importData.salt || typeof importData.salt !== 'string') {
    errors.push('Import data must contain a valid salt');
  }
  
  if (!Array.isArray(importData.data)) {
    errors.push('Import data must contain an array of password entries');
  } else {
    // Validate each entry
    importData.data.forEach((entry, index) => {
      if (!entry || typeof entry !== 'object') {
        errors.push(`Entry at index ${index} must be an object`);
        return;
      }
      
      const typedEntry = entry as Partial<ImportData['data'][0]>;
      
      if (!typedEntry.id || typeof typedEntry.id !== 'string') {
        errors.push(`Entry at index ${index} must have a valid ID`);
      }
      
      if (!typedEntry.title || typeof typedEntry.title !== 'string') {
        errors.push(`Entry at index ${index} must have a valid title`);
      }
      
      if (!typedEntry.password || typeof typedEntry.password !== 'string') {
        errors.push(`Entry at index ${index} must have a valid password`);
      }
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Format validation errors for display
 * @param errors - Array of error messages
 * @returns Formatted error message
 */
export function formatValidationErrors(errors: string[]): string {
  if (!Array.isArray(errors) || errors.length === 0) {
    return '';
  }
  
  if (errors.length === 1) {
    return errors[0];
  }
  
  return errors.map((error, index) => `${index + 1}. ${error}`).join('\n');
}

