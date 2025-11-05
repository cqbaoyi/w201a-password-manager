/**
 * Type definitions for password manager
 */

export interface PasswordEntry {
  id: string;
  title: string;
  username?: string;
  password: string;
  url?: string;
  notes?: string;
  createdAt: number;
  updatedAt?: number;
}

export interface EncryptedPasswordEntry {
  id: string;
  title: string;
  username?: string;
  password: string; // Encrypted
  url?: string;
  notes?: string; // Encrypted
  iv: string; // Base64 encoded IV
  createdAt: number;
  updatedAt?: number;
}

export interface PasswordConfig {
  length: number;
  includeLowercase: boolean;
  includeUppercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeAmbiguous?: boolean;
}

export interface PasswordStrength {
  length: number;
  hasLowercase: boolean;
  hasUppercase: boolean;
  hasNumbers: boolean;
  hasSymbols: boolean;
  hasRepeatedChars: boolean;
  hasSequentialChars: boolean;
  score: number;
  strength: 'weak' | 'medium' | 'strong' | 'very-strong';
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface SearchValidationResult {
  isValid: boolean;
  query?: string;
  errors?: string[];
}

export interface ImportData {
  salt: string;
  data: EncryptedPasswordEntry[];
}

