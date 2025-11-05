/**
 * Application-wide constants
 * Centralized configuration values for the password manager
 */

// Session Management
export const SESSION_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
export const WARNING_TIME = 1 * 60 * 1000; // 1 minute warning
export const ACTIVITY_RESET_THROTTLE = 1000; // 1 second throttle for activity resets
export const DISPLAY_UPDATE_INTERVAL = 1000; // 1 second interval for display updates

// Crypto Configuration
export const PBKDF2_ITERATIONS = 100000;
export const KEY_LENGTH = 256;
export const IV_LENGTH = 12; // 96 bits for AES-GCM
export const SALT_LENGTH = 16;

// Password Validation
export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 128;
export const MAX_TITLE_LENGTH = 100;
export const MAX_USERNAME_LENGTH = 255;
export const MAX_PASSWORD_ENTRY_LENGTH = 1000;
export const MAX_URL_LENGTH = 500;
export const MAX_NOTES_LENGTH = 2000;
export const MAX_INPUT_LENGTH = 1000; // Default max input length

// Password Generation
export const DEFAULT_PASSWORD_LENGTH = 16;
export const MIN_PASSWORD_GEN_LENGTH = 8;
export const MAX_PASSWORD_GEN_LENGTH = 64;

// Storage Keys
export const STORAGE_KEYS = {
  VAULT_SALT: 'vault_salt',
  VAULT_DATA: 'vault_data',
  SESSION_TIMEOUT: 'session_timeout',
} as const;

