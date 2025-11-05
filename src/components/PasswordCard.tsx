import React, { useState } from 'react';
import CopyButton from './CopyButton';
import styles from './PasswordCard.module.css';
import type { PasswordEntry } from '../types';

interface PasswordCardProps {
  password: PasswordEntry;
  onEdit: (password: PasswordEntry) => void;
  onDelete: (id: string) => void;
}

const PasswordCard: React.FC<PasswordCardProps> = ({ password, onEdit, onDelete }) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(password);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(password.id);
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDomainFromUrl = (url: string): string => {
    try {
      const domain = new URL(url).hostname;
      return domain.replace('www.', '');
    } catch {
      return url;
    }
  };

  const getPasswordStrength = (password: string): { level: string; color: string } => {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(password)) score++;
    
    if (score <= 2) return { level: 'weak', color: '#ef4444' };
    if (score <= 4) return { level: 'medium', color: '#f59e0b' };
    if (score <= 5) return { level: 'strong', color: '#10b981' };
    return { level: 'very strong', color: '#059669' };
  };

  const strength = getPasswordStrength(password.password);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.titleContainer}>
          <h3 className={styles.title}>{password.title}</h3>
          {password.url && (
            <a 
              href={password.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.url}
              onClick={(e) => e.stopPropagation()}
            >
              {getDomainFromUrl(password.url)}
            </a>
          )}
        </div>
        <div className={styles.actions}>
          <button
            onClick={handleEdit}
            className={styles.actionButton}
            title="Edit password"
          >
            ✏️
          </button>
          <button
            onClick={handleDelete}
            className={styles.actionButton}
            title="Delete password"
          >
            🗑️
          </button>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.usernameContainer}>
          <span className={styles.label}>Username:</span>
          <span className={styles.username}>
            {password.username || 'No username'}
          </span>
          {password.username && (
            <CopyButton 
              text={password.username} 
              label="username"
              className={styles.copyButton}
            />
          )}
        </div>

        <div className={styles.passwordContainer}>
          <span className={styles.label}>Password:</span>
          <div className={styles.passwordInput}>
            <span className={styles.password}>
              {showPassword ? password.password : '•'.repeat(Math.min(password.password.length, 20))}
            </span>
            <button
              onClick={togglePasswordVisibility}
              className={styles.toggleButton}
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          <CopyButton 
            text={password.password} 
            label="password"
            className={styles.copyButton}
          />
        </div>

        <div className={styles.strengthContainer}>
          <span className={styles.strengthLabel}>Strength:</span>
          <div className={styles.strengthIndicator}>
            <div 
              className={styles.strengthBar}
              style={{ backgroundColor: strength.color }}
            />
            <span className={styles.strengthText}>{strength.level}</span>
          </div>
        </div>

        {password.notes && (
          <div className={styles.notesContainer}>
            <span className={styles.label}>Notes:</span>
            <p className={styles.notes}>{password.notes}</p>
            <CopyButton 
              text={password.notes} 
              label="notes"
              className={styles.copyButton}
            />
          </div>
        )}

        <div className={styles.metaContainer}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Created:</span>
            <span className={styles.metaValue}>{formatDate(password.createdAt)}</span>
          </div>
          {password.updatedAt && password.updatedAt !== password.createdAt && (
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Updated:</span>
              <span className={styles.metaValue}>{formatDate(password.updatedAt)}</span>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default PasswordCard;

