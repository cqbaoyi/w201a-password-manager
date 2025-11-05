import React, { useState, useEffect } from 'react';
import PasswordGenerator from './PasswordGenerator';
import { validatePasswordEntry } from '../utils/validation';
import styles from './PasswordForm.module.css';
import type { PasswordEntry } from '../types';

interface PasswordFormProps {
  password?: PasswordEntry | null;
  onSave: (passwordData: Partial<PasswordEntry>) => Promise<void>;
  onCancel: () => void;
  encryptionKey: CryptoKey;
}

interface FormData {
  title: string;
  username: string;
  password: string;
  url: string;
  notes: string;
}

const PasswordForm: React.FC<PasswordFormProps> = ({ password, onSave, onCancel, encryptionKey }) => {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    username: '',
    password: '',
    url: '',
    notes: ''
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);

  const isEditing = !!password;

  useEffect(() => {
    if (password) {
      setFormData({
        title: password.title || '',
        username: password.username || '',
        password: password.password || '',
        url: password.url || '',
        notes: password.notes || ''
      });
    }
  }, [password]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setIsLoading(true);

    try {
      // Validate form data
      const validation = validatePasswordEntry(formData);
      if (!validation.isValid) {
        setErrors(validation.errors);
        return;
      }

      // Call parent save handler
      await onSave(formData);
    } catch (error) {
      console.error('Error saving password:', error);
      setErrors(['Failed to save password. Please try again.']);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordGenerated = (generatedPassword: string) => {
    setFormData(prev => ({
      ...prev,
      password: generatedPassword
    }));
    setShowGenerator(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const clearForm = () => {
    setFormData({
      title: '',
      username: '',
      password: '',
      url: '',
      notes: ''
    });
    setErrors([]);
  };

  const handleCancel = () => {
    clearForm();
    onCancel();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {isEditing ? 'Edit Password' : 'Add New Password'}
          </h2>
          <button
            onClick={handleCancel}
            className={styles.closeButton}
            aria-label="Close form"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formContent}>
            {/* Title */}
            <div className={styles.inputGroup}>
              <label htmlFor="title" className={styles.label}>
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="e.g., Gmail, Facebook, Bank Account"
                required
                autoFocus
              />
            </div>

            {/* Username */}
            <div className={styles.inputGroup}>
              <label htmlFor="username" className={styles.label}>
                Username/Email
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="username@example.com"
              />
            </div>

            {/* Password */}
            <div className={styles.inputGroup}>
              <label htmlFor="password" className={styles.label}>
                Password *
              </label>
              <div className={styles.passwordContainer}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={styles.passwordInput}
                  placeholder="Enter password or generate one"
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className={styles.toggleButton}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              <button
                type="button"
                onClick={() => setShowGenerator(true)}
                className={styles.generateButton}
              >
                🎲 Generate Password
              </button>
            </div>

            {/* URL */}
            <div className={styles.inputGroup}>
              <label htmlFor="url" className={styles.label}>
                Website URL
              </label>
              <input
                type="url"
                id="url"
                name="url"
                value={formData.url}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="https://example.com"
              />
            </div>

            {/* Notes */}
            <div className={styles.inputGroup}>
              <label htmlFor="notes" className={styles.label}>
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                className={styles.textarea}
                placeholder="Additional notes or information"
                rows={3}
              />
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

          {/* Form Actions */}
          <div className={styles.actions}>
            <button
              type="button"
              onClick={handleCancel}
              className={styles.cancelButton}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.saveButton}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className={styles.loading}>
                  <span className={styles.spinner} />
                  {isEditing ? 'Updating...' : 'Saving...'}
                </span>
              ) : (
                isEditing ? 'Update Password' : 'Save Password'
              )}
            </button>
          </div>
        </form>

        {/* Password Generator Modal */}
        {showGenerator && (
          <PasswordGenerator
            onGenerate={handlePasswordGenerated}
            onClose={() => setShowGenerator(false)}
          />
        )}
      </div>
    </div>
  );
};

export default PasswordForm;

