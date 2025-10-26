/**
 * Validation utilities for password manager
 * Input validation and sanitization helpers
 */

/**
 * Validate master password
 * @param {string} password - Master password to validate
 * @returns {Object} Validation result
 */
export function validateMasterPassword(password) {
  const errors = [];
  
  if (!password || typeof password !== 'string') {
    errors.push('Master password is required');
    return { isValid: false, errors };
  }
  
  if (password.length < 8) {
    errors.push('Master password must be at least 8 characters long');
  }
  
  if (password.length > 128) {
    errors.push('Master password must be less than 128 characters');
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
 * @param {Object} entry - Password entry to validate
 * @returns {Object} Validation result
 */
export function validatePasswordEntry(entry) {
  const errors = [];
  
  // Validate title
  if (!entry.title || typeof entry.title !== 'string' || entry.title.trim().length === 0) {
    errors.push('Title is required');
  } else if (entry.title.length > 100) {
    errors.push('Title must be less than 100 characters');
  }
  
  // Validate username
  if (entry.username && entry.username.length > 255) {
    errors.push('Username must be less than 255 characters');
  }
  
  // Validate password
  if (!entry.password || typeof entry.password !== 'string' || entry.password.length === 0) {
    errors.push('Password is required');
  } else if (entry.password.length > 1000) {
    errors.push('Password must be less than 1000 characters');
  }
  
  // Validate URL
  if (entry.url && entry.url.length > 0) {
    if (!isValidUrl(entry.url)) {
      errors.push('URL must be a valid URL format');
    } else if (entry.url.length > 500) {
      errors.push('URL must be less than 500 characters');
    }
  }
  
  // Validate notes
  if (entry.notes && entry.notes.length > 2000) {
    errors.push('Notes must be less than 2000 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid URL
 */
export function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Sanitize input string
 * @param {string} input - Input to sanitize
 * @param {number} maxLength - Maximum length
 * @returns {string} Sanitized string
 */
export function sanitizeInput(input, maxLength = 1000) {
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
 * @param {string} password - Password to check
 * @returns {boolean} True if password is common
 */
function isCommonPassword(password) {
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
 * @param {string} password - Password to check
 * @returns {boolean} True if has repeated characters
 */
function hasRepeatedCharacters(password) {
  return /(.)\1{2,}/.test(password);
}

/**
 * Validate search query
 * @param {string} query - Search query to validate
 * @returns {Object} Validation result
 */
export function validateSearchQuery(query) {
  if (typeof query !== 'string') {
    return { isValid: false, errors: ['Search query must be a string'] };
  }
  
  const sanitized = sanitizeInput(query, 100);
  
  if (sanitized.length === 0) {
    return { isValid: true, query: '' };
  }
  
  if (sanitized.length < 2) {
    return { isValid: false, errors: ['Search query must be at least 2 characters'] };
  }
  
  return { isValid: true, query: sanitized };
}

/**
 * Validate password generation configuration
 * @param {Object} config - Generation configuration
 * @returns {Object} Validation result
 */
export function validatePasswordConfig(config) {
  const errors = [];
  
  // Validate length
  if (typeof config.length !== 'number' || config.length < 8 || config.length > 64) {
    errors.push('Password length must be between 8 and 64 characters');
  }
  
  // Validate character type options
  const charTypeOptions = ['includeLowercase', 'includeUppercase', 'includeNumbers', 'includeSymbols'];
  const hasAtLeastOneType = charTypeOptions.some(option => config[option] === true);
  
  if (!hasAtLeastOneType) {
    errors.push('At least one character type must be selected');
  }
  
  // Validate boolean options
  const booleanOptions = ['includeLowercase', 'includeUppercase', 'includeNumbers', 'includeSymbols', 'excludeAmbiguous'];
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
 * @param {Object} data - Import data to validate
 * @returns {Object} Validation result
 */
export function validateImportData(data) {
  const errors = [];
  
  if (!data || typeof data !== 'object') {
    errors.push('Import data must be an object');
    return { isValid: false, errors };
  }
  
  if (!data.salt || typeof data.salt !== 'string') {
    errors.push('Import data must contain a valid salt');
  }
  
  if (!Array.isArray(data.data)) {
    errors.push('Import data must contain an array of password entries');
  } else {
    // Validate each entry
    data.data.forEach((entry, index) => {
      if (!entry || typeof entry !== 'object') {
        errors.push(`Entry at index ${index} must be an object`);
        return;
      }
      
      if (!entry.id || typeof entry.id !== 'string') {
        errors.push(`Entry at index ${index} must have a valid ID`);
      }
      
      if (!entry.title || typeof entry.title !== 'string') {
        errors.push(`Entry at index ${index} must have a valid title`);
      }
      
      if (!entry.password || typeof entry.password !== 'string') {
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
 * @param {Array} errors - Array of error messages
 * @returns {string} Formatted error message
 */
export function formatValidationErrors(errors) {
  if (!Array.isArray(errors) || errors.length === 0) {
    return '';
  }
  
  if (errors.length === 1) {
    return errors[0];
  }
  
  return errors.map((error, index) => `${index + 1}. ${error}`).join('\n');
}
