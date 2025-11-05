/**
 * Password generator utility
 * Uses crypto.getRandomValues() for cryptographically secure randomness
 */

import {
  DEFAULT_PASSWORD_LENGTH,
  MIN_PASSWORD_GEN_LENGTH,
  MAX_PASSWORD_GEN_LENGTH,
} from '../constants/config';
import type { PasswordConfig, PasswordStrength } from '../types';

// Character sets for password generation
const CHARACTER_SETS = {
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
} as const;

// Default configuration
const DEFAULT_CONFIG: PasswordConfig = {
  length: DEFAULT_PASSWORD_LENGTH,
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
 * @param config - Password generation configuration
 * @returns Generated password
 */
export function generatePassword(config: Partial<PasswordConfig> = {}): string {
  const finalConfig: PasswordConfig = { ...DEFAULT_CONFIG, ...config };
  
  // Validate configuration
  if (finalConfig.length < MIN_PASSWORD_GEN_LENGTH || finalConfig.length > MAX_PASSWORD_GEN_LENGTH) {
    throw new Error(`Password length must be between ${MIN_PASSWORD_GEN_LENGTH} and ${MAX_PASSWORD_GEN_LENGTH} characters`);
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
 * @param length - String length
 * @param charSet - Character set to use
 * @returns Random string
 */
function generateRandomString(length: number, charSet: string): string {
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
 * @param password - Generated password
 * @param config - Configuration
 * @param charSet - Full character set
 * @returns Password with guaranteed character types
 */
function ensureCharacterTypes(password: string, config: PasswordConfig, charSet: string): string {
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
 * @param password - Password to check
 * @param charSet - Character set to check for
 * @returns True if password contains character from set
 */
function hasCharacterType(password: string, charSet: string): boolean {
  return charSet.split('').some(char => password.includes(char));
}

/**
 * Replace a random character in password with character from specific set
 * @param passwordArray - Password as character array
 * @param fullCharSet - Full character set
 * @param targetCharSet - Target character set
 */
function replaceRandomCharacter(passwordArray: string[], fullCharSet: string, targetCharSet: string): void {
  // Find a position that can be replaced (not from target set)
  const replaceablePositions: number[] = [];
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
 * @param password - Password to analyze
 * @returns Strength analysis
 */
export function calculatePasswordStrength(password: string): PasswordStrength {
  let score = 0;
  const analysis: PasswordStrength = {
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
 * @param password - Password to check
 * @returns True if has sequential characters
 */
function hasSequentialCharacters(password: string): boolean {
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

