import React, { useState, useEffect } from 'react';
import { generateSalt, deriveKey, verifyMasterPassword } from '../utils/crypto';
import { vaultExists, setVaultSalt, setVaultData, getVaultSalt, getVaultData } from '../utils/storage';
import { validateMasterPassword } from '../utils/validation';
import { calculatePasswordStrength } from '../utils/passwordGenerator';
import styles from './LoginScreen.module.css';

const LoginScreen = ({ onLogin, onError }) => {
  const [isNewVault, setIsNewVault] = useState(false);
  const [masterPassword, setMasterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [passwordStrength, setPasswordStrength] = useState(null);

  useEffect(() => {
    // Check if vault exists
    setIsNewVault(!vaultExists());
  }, []);

  useEffect(() => {
    // Calculate password strength for new vaults
    if (isNewVault && masterPassword) {
      const strength = calculatePasswordStrength(masterPassword);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(null);
    }
  }, [masterPassword, isNewVault]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setIsLoading(true);

    try {
      if (isNewVault) {
        await handleCreateVault();
      } else {
        await handleUnlockVault();
      }
    } catch (error) {
      console.error('Login error:', error);
      onError(error.message || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateVault = async () => {
    // Validate passwords
    const passwordValidation = validateMasterPassword(masterPassword);
    if (!passwordValidation.isValid) {
      setErrors(passwordValidation.errors);
      return;
    }

    if (masterPassword !== confirmPassword) {
      setErrors(['Passwords do not match']);
      return;
    }

    // Create new vault
    const salt = generateSalt();
    const key = await deriveKey(masterPassword, salt);
    
    // Store vault salt
    const saltBase64 = btoa(String.fromCharCode(...salt));
    setVaultSalt(saltBase64);
    
    // Initialize empty vault
    setVaultData([]);
    
    // Clear sensitive data
    setMasterPassword('');
    setConfirmPassword('');
    
    onLogin(key);
  };

  const handleUnlockVault = async () => {
    if (!masterPassword) {
      setErrors(['Master password is required']);
      return;
    }

    const vaultSalt = getVaultSalt();
    const vaultData = getVaultData();
    
    if (!vaultSalt || !Array.isArray(vaultData)) {
      setErrors(['Vault data is corrupted. Please create a new vault.']);
      return;
    }

    // Verify master password
    const isValid = await verifyMasterPassword(masterPassword, vaultSalt, vaultData);
    
    if (!isValid) {
      setErrors(['Incorrect master password']);
      return;
    }

    // Derive key for session
    const salt = new Uint8Array(atob(vaultSalt).split('').map(char => char.charCodeAt(0)));
    const key = await deriveKey(masterPassword, salt);
    
    // Clear sensitive data
    setMasterPassword('');
    setConfirmPassword('');
    
    onLogin(key);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const getPasswordStrengthColor = (strength) => {
    if (!strength) return '#e2e8f0';
    switch (strength) {
      case 'weak': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'strong': return '#10b981';
      case 'very-strong': return '#059669';
      default: return '#e2e8f0';
    }
  };

  const getPasswordStrengthWidth = (strength) => {
    if (!strength) return '0%';
    switch (strength) {
      case 'weak': return '25%';
      case 'medium': return '50%';
      case 'strong': return '75%';
      case 'very-strong': return '100%';
      default: return '0%';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            {isNewVault ? 'Create Vault' : 'Unlock Vault'}
          </h1>
          <p className={styles.subtitle}>
            {isNewVault 
              ? 'Set up your secure password vault' 
              : 'Enter your master password to access your passwords'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="masterPassword" className={styles.label}>
              Master Password
            </label>
            <div className={styles.passwordInput}>
              <input
                type={showPassword ? 'text' : 'password'}
                id="masterPassword"
                value={masterPassword}
                onChange={(e) => setMasterPassword(e.target.value)}
                className={styles.input}
                placeholder="Enter your master password"
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className={styles.toggleButton}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            
            {/* Master password requirements for new vaults */}
            {isNewVault && (
              <div className={styles.requirementsContainer}>
                <h4 className={styles.requirementsTitle}>Master Password Requirements:</h4>
                <ul className={styles.requirementsList}>
                  <li className={`${styles.requirement} ${masterPassword.length >= 8 ? styles.requirementMet : styles.requirementNotMet}`}>
                    <span className={styles.requirementIcon}>
                      {masterPassword.length >= 8 ? '✓' : '○'}
                    </span>
                    At least 8 characters long
                  </li>
                  <li className={`${styles.requirement} ${/[a-z]/.test(masterPassword) ? styles.requirementMet : styles.requirementNotMet}`}>
                    <span className={styles.requirementIcon}>
                      {/[a-z]/.test(masterPassword) ? '✓' : '○'}
                    </span>
                    Contains lowercase letters (a-z)
                  </li>
                  <li className={`${styles.requirement} ${/[A-Z]/.test(masterPassword) ? styles.requirementMet : styles.requirementNotMet}`}>
                    <span className={styles.requirementIcon}>
                      {/[A-Z]/.test(masterPassword) ? '✓' : '○'}
                    </span>
                    Contains uppercase letters (A-Z)
                  </li>
                  <li className={`${styles.requirement} ${/\d/.test(masterPassword) ? styles.requirementMet : styles.requirementNotMet}`}>
                    <span className={styles.requirementIcon}>
                      {/\d/.test(masterPassword) ? '✓' : '○'}
                    </span>
                    Contains numbers (0-9)
                  </li>
                  <li className={`${styles.requirement} ${/[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(masterPassword) ? styles.requirementMet : styles.requirementNotMet}`}>
                    <span className={styles.requirementIcon}>
                      {/[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(masterPassword) ? '✓' : '○'}
                    </span>
                    Contains special characters (!@#$%^&*)
                  </li>
                </ul>
              </div>
            )}

            {/* Password strength indicator for new vaults */}
            {isNewVault && passwordStrength && (
              <div className={styles.strengthIndicator}>
                <div className={styles.strengthBar}>
                  <div 
                    className={styles.strengthFill}
                    style={{
                      width: getPasswordStrengthWidth(passwordStrength?.strength),
                      backgroundColor: getPasswordStrengthColor(passwordStrength?.strength)
                    }}
                  />
                </div>
                <span className={styles.strengthText}>
                  Strength: {passwordStrength?.strength?.replace('-', ' ') || 'unknown'}
                </span>
              </div>
            )}
          </div>

          {isNewVault && (
            <div className={styles.inputGroup}>
              <label htmlFor="confirmPassword" className={styles.label}>
                Confirm Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={styles.input}
                placeholder="Confirm your master password"
                required
                autoComplete="new-password"
              />
            </div>
          )}

          {errors.length > 0 && (
            <div className={styles.errorContainer}>
              {errors.map((error, index) => (
                <div key={index} className={styles.error}>
                  {error}
                </div>
              ))}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || (isNewVault && masterPassword !== confirmPassword)}
            className={styles.submitButton}
          >
            {isLoading ? (
              <span className={styles.loading}>
                <span className={styles.spinner} />
                {isNewVault ? 'Creating Vault...' : 'Unlocking...'}
              </span>
            ) : (
              isNewVault ? 'Create Vault' : 'Unlock Vault'
            )}
          </button>
        </form>

        <div className={styles.footer}>
          <p className={styles.warning}>
            ⚠️ Your master password is not stored anywhere. If you forget it, 
            you will lose access to all your passwords permanently.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
