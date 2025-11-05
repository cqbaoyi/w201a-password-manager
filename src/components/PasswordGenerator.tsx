import React, { useState, useEffect, useCallback } from 'react';
import { generatePassword, calculatePasswordStrength } from '../utils/passwordGenerator';
import { validatePasswordConfig } from '../utils/validation';
import { DEFAULT_PASSWORD_LENGTH, MIN_PASSWORD_GEN_LENGTH, MAX_PASSWORD_GEN_LENGTH } from '../constants/config';
import styles from './PasswordGenerator.module.css';
import type { PasswordConfig, PasswordStrength } from '../types';

interface PasswordGeneratorProps {
  onGenerate: (password: string) => void;
  onClose: () => void;
}

const PasswordGenerator: React.FC<PasswordGeneratorProps> = ({ onGenerate, onClose }) => {
  const [config, setConfig] = useState<PasswordConfig>({
    length: DEFAULT_PASSWORD_LENGTH,
    includeLowercase: true,
    includeUppercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeAmbiguous: false
  });
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [strength, setStrength] = useState<PasswordStrength | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const generateNewPassword = useCallback(() => {
    try {
      setErrors([]);
      const validation = validatePasswordConfig(config);
      
      if (!validation.isValid) {
        setErrors(validation.errors);
        return;
      }

      const password = generatePassword(config);
      setGeneratedPassword(password);
    } catch (error) {
      console.error('Error generating password:', error);
      setErrors([error instanceof Error ? error.message : 'Failed to generate password']);
    }
  }, [config]);

  // Generate initial password
  useEffect(() => {
    generateNewPassword();
  }, [generateNewPassword]);

  // Update strength when password changes
  useEffect(() => {
    if (generatedPassword) {
      const strengthAnalysis = calculatePasswordStrength(generatedPassword);
      setStrength(strengthAnalysis);
    }
  }, [generatedPassword]);

  const handleConfigChange = (key: keyof PasswordConfig, value: boolean | number) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }));
    
    // Clear errors when config changes
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handleLengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const length = parseInt(e.target.value, 10);
    handleConfigChange('length', length);
  };

  const handleCheckboxChange = (key: keyof PasswordConfig) => {
    handleConfigChange(key, !config[key]);
  };

  const handleUsePassword = () => {
    if (generatedPassword) {
      onGenerate(generatedPassword);
    }
  };

  const getStrengthColor = (strengthLevel: string): string => {
    switch (strengthLevel) {
      case 'weak': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'strong': return '#10b981';
      case 'very-strong': return '#059669';
      default: return '#e2e8f0';
    }
  };

  const getStrengthWidth = (strengthLevel: string): string => {
    switch (strengthLevel) {
      case 'weak': return '25%';
      case 'medium': return '50%';
      case 'strong': return '75%';
      case 'very-strong': return '100%';
      default: return '0%';
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>Password Generator</h2>
          <button
            onClick={onClose}
            className={styles.closeButton}
            aria-label="Close generator"
          >
            ×
          </button>
        </div>

        <div className={styles.content}>
          {/* Generated Password Display */}
          <div className={styles.passwordSection}>
            <label className={styles.label}>Generated Password</label>
            <div className={styles.passwordDisplay}>
              <input
                type="text"
                value={generatedPassword}
                readOnly
                className={styles.passwordInput}
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <button
                onClick={() => navigator.clipboard.writeText(generatedPassword)}
                className={styles.copyButton}
                title="Copy password"
              >
                📋
              </button>
            </div>
            
            {/* Strength Indicator */}
            {strength && (
              <div className={styles.strengthContainer}>
                <div className={styles.strengthBar}>
                  <div 
                    className={styles.strengthFill}
                    style={{
                      width: getStrengthWidth(strength.strength),
                      backgroundColor: getStrengthColor(strength.strength)
                    }}
                  />
                </div>
                <span className={styles.strengthText}>
                  {strength.strength.replace('-', ' ')} ({strength.score}/6)
                </span>
              </div>
            )}
          </div>

          {/* Configuration Options */}
          <div className={styles.configSection}>
            <h3 className={styles.sectionTitle}>Configuration</h3>
            
            {/* Length Slider */}
            <div className={styles.configGroup}>
              <label className={styles.configLabel}>
                Length: {config.length} characters
              </label>
              <input
                type="range"
                min={MIN_PASSWORD_GEN_LENGTH}
                max={MAX_PASSWORD_GEN_LENGTH}
                value={config.length}
                onChange={handleLengthChange}
                className={styles.slider}
              />
              <div className={styles.sliderLabels}>
                <span>{MIN_PASSWORD_GEN_LENGTH}</span>
                <span>{MAX_PASSWORD_GEN_LENGTH}</span>
              </div>
            </div>

            {/* Character Type Options */}
            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={config.includeLowercase}
                  onChange={() => handleCheckboxChange('includeLowercase')}
                  className={styles.checkbox}
                />
                <span className={styles.checkboxText}>Lowercase (a-z)</span>
              </label>

              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={config.includeUppercase}
                  onChange={() => handleCheckboxChange('includeUppercase')}
                  className={styles.checkbox}
                />
                <span className={styles.checkboxText}>Uppercase (A-Z)</span>
              </label>

              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={config.includeNumbers}
                  onChange={() => handleCheckboxChange('includeNumbers')}
                  className={styles.checkbox}
                />
                <span className={styles.checkboxText}>Numbers (0-9)</span>
              </label>

              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={config.includeSymbols}
                  onChange={() => handleCheckboxChange('includeSymbols')}
                  className={styles.checkbox}
                />
                <span className={styles.checkboxText}>Symbols (!@#$%^&*)</span>
              </label>

              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={config.excludeAmbiguous}
                  onChange={() => handleCheckboxChange('excludeAmbiguous')}
                  className={styles.checkbox}
                />
                <span className={styles.checkboxText}>Exclude ambiguous (0O1lI|)</span>
              </label>
            </div>
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className={styles.errorContainer}>
              {errors.map((error, index) => (
                <div key={index} className={styles.error}>
                  {error}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button
            onClick={generateNewPassword}
            className={styles.regenerateButton}
          >
            🎲 Generate New
          </button>
          <button
            onClick={handleUsePassword}
            disabled={!generatedPassword}
            className={styles.useButton}
          >
            Use This Password
          </button>
        </div>
      </div>
    </div>
  );
};

export default PasswordGenerator;

