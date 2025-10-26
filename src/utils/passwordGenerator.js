/**
 * Password generator utility
 * Uses crypto.getRandomValues() for cryptographically secure randomness
 */

// Character sets for password generation
const CHARACTER_SETS = {
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
};

// Default configuration
const DEFAULT_CONFIG = {
  length: 16,
  includeLowercase: true,
  includeUppercase: true,
  includeNumbers: true,
  includeSymbols: true,
  excludeAmbiguous: false
};

// Ambiguous characters to potentially exclude
const AMBIGUOUS_CHARS = '0O1lI|';

/**
 * Generate a cryptographically secure random password
 * @param {Object} config - Password generation configuration
 * @param {number} config.length - Password length (8-64)
 * @param {boolean} config.includeLowercase - Include lowercase letters
 * @param {boolean} config.includeUppercase - Include uppercase letters
 * @param {boolean} config.includeNumbers - Include numbers
 * @param {boolean} config.includeSymbols - Include symbols
 * @param {boolean} config.excludeAmbiguous - Exclude ambiguous characters
 * @returns {string} Generated password
 */
export function generatePassword(config = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  // Validate configuration
  if (finalConfig.length < 8 || finalConfig.length > 64) {
    throw new Error('Password length must be between 8 and 64 characters');
  }
  
  if (!finalConfig.includeLowercase && !finalConfig.includeUppercase && 
      !finalConfig.includeNumbers && !finalConfig.includeSymbols) {
    throw new Error('At least one character type must be selected');
  }
  
  // Build character set
  let charSet = '';
  if (finalConfig.includeLowercase) charSet += CHARACTER_SETS.lowercase;
  if (finalConfig.includeUppercase) charSet += CHARACTER_SETS.uppercase;
  if (finalConfig.includeNumbers) charSet += CHARACTER_SETS.numbers;
  if (finalConfig.includeSymbols) charSet += CHARACTER_SETS.symbols;
  
  // Remove ambiguous characters if requested
  if (finalConfig.excludeAmbiguous) {
    charSet = charSet.split('').filter(char => !AMBIGUOUS_CHARS.includes(char)).join('');
  }
  
  if (charSet.length === 0) {
    throw new Error('No valid characters available for password generation');
  }
  
  // Generate password
  const password = generateRandomString(finalConfig.length, charSet);
  
  // Ensure at least one character from each selected type
  return ensureCharacterTypes(password, finalConfig, charSet);
}

/**
 * Generate a random string using crypto.getRandomValues()
 * @param {number} length - String length
 * @param {string} charSet - Character set to use
 * @returns {string} Random string
 */
function generateRandomString(length, charSet) {
  const randomBytes = new Uint8Array(length);
  crypto.getRandomValues(randomBytes);
  
  let result = '';
  for (let i = 0; i < length; i++) {
    result += charSet[randomBytes[i] % charSet.length];
  }
  
  return result;
}

/**
 * Ensure password contains at least one character from each selected type
 * @param {string} password - Generated password
 * @param {Object} config - Configuration
 * @param {string} charSet - Full character set
 * @returns {string} Password with guaranteed character types
 */
function ensureCharacterTypes(password, config, charSet) {
  const passwordArray = password.split('');
  let needsUpdate = false;
  
  // Check and fix lowercase
  if (config.includeLowercase && !hasCharacterType(password, CHARACTER_SETS.lowercase)) {
    replaceRandomCharacter(passwordArray, charSet, CHARACTER_SETS.lowercase);
    needsUpdate = true;
  }
  
  // Check and fix uppercase
  if (config.includeUppercase && !hasCharacterType(password, CHARACTER_SETS.uppercase)) {
    replaceRandomCharacter(passwordArray, charSet, CHARACTER_SETS.uppercase);
    needsUpdate = true;
  }
  
  // Check and fix numbers
  if (config.includeNumbers && !hasCharacterType(password, CHARACTER_SETS.numbers)) {
    replaceRandomCharacter(passwordArray, charSet, CHARACTER_SETS.numbers);
    needsUpdate = true;
  }
  
  // Check and fix symbols
  if (config.includeSymbols && !hasCharacterType(password, CHARACTER_SETS.symbols)) {
    replaceRandomCharacter(passwordArray, charSet, CHARACTER_SETS.symbols);
    needsUpdate = true;
  }
  
  return needsUpdate ? passwordArray.join('') : password;
}

/**
 * Check if password contains at least one character from a character set
 * @param {string} password - Password to check
 * @param {string} charSet - Character set to check for
 * @returns {boolean} True if password contains character from set
 */
function hasCharacterType(password, charSet) {
  return charSet.split('').some(char => password.includes(char));
}

/**
 * Replace a random character in password with character from specific set
 * @param {Array} passwordArray - Password as character array
 * @param {string} fullCharSet - Full character set
 * @param {string} targetCharSet - Target character set
 */
function replaceRandomCharacter(passwordArray, fullCharSet, targetCharSet) {
  // Find a position that can be replaced (not from target set)
  const replaceablePositions = [];
  for (let i = 0; i < passwordArray.length; i++) {
    if (!targetCharSet.includes(passwordArray[i])) {
      replaceablePositions.push(i);
    }
  }
  
  // If all positions are from target set, replace a random one
  const position = replaceablePositions.length > 0 
    ? replaceablePositions[Math.floor(Math.random() * replaceablePositions.length)]
    : Math.floor(Math.random() * passwordArray.length);
  
  // Replace with random character from target set
  const randomBytes = new Uint8Array(1);
  crypto.getRandomValues(randomBytes);
  passwordArray[position] = targetCharSet[randomBytes[0] % targetCharSet.length];
}

/**
 * Calculate password strength score
 * @param {string} password - Password to analyze
 * @returns {Object} Strength analysis
 */
export function calculatePasswordStrength(password) {
  let score = 0;
  const analysis = {
    length: password.length,
    hasLowercase: /[a-z]/.test(password),
    hasUppercase: /[A-Z]/.test(password),
    hasNumbers: /\d/.test(password),
    hasSymbols: /[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(password),
    hasRepeatedChars: /(.)\1{2,}/.test(password),
    hasSequentialChars: hasSequentialCharacters(password),
    score: 0,
    strength: 'weak'
  };
  
  // Length scoring
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;
  if (password.length >= 20) score += 1;
  
  // Character type scoring
  if (analysis.hasLowercase) score += 1;
  if (analysis.hasUppercase) score += 1;
  if (analysis.hasNumbers) score += 1;
  if (analysis.hasSymbols) score += 1;
  
  // Penalty for repeated characters
  if (analysis.hasRepeatedChars) score -= 1;
  
  // Penalty for sequential characters
  if (analysis.hasSequentialChars) score -= 1;
  
  // Determine strength level
  if (score <= 2) analysis.strength = 'weak';
  else if (score <= 4) analysis.strength = 'medium';
  else if (score <= 6) analysis.strength = 'strong';
  else analysis.strength = 'very-strong';
  
  analysis.score = Math.max(0, score);
  return analysis;
}

/**
 * Check if password has sequential characters (abc, 123, etc.)
 * @param {string} password - Password to check
 * @returns {boolean} True if has sequential characters
 */
function hasSequentialCharacters(password) {
  const sequences = [
    'abcdefghijklmnopqrstuvwxyz',
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    '0123456789',
    'zyxwvutsrqponmlkjihgfedcba',
    'ZYXWVUTSRQPONMLKJIHGFEDCBA',
    '9876543210'
  ];
  
  return sequences.some(sequence => {
    for (let i = 0; i <= sequence.length - 3; i++) {
      const substr = sequence.substring(i, i + 3);
      if (password.toLowerCase().includes(substr.toLowerCase())) {
        return true;
      }
    }
    return false;
  });
}


