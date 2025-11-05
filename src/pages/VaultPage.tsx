import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getVaultData, addPasswordEntry, updatePasswordEntry, deletePasswordEntry } from '../utils/storage';
import { decryptPasswordEntry, encryptPasswordEntry } from '../utils/crypto';
import { useAuth } from '../contexts/AuthContext';
import { WARNING_TIME } from '../constants/config';
import PasswordCard from '../components/PasswordCard';
import PasswordForm from '../components/PasswordForm';
import SessionExpiryModal from '../components/SessionExpiryModal';
import styles from '../components/PasswordVault.module.css';
import type { PasswordEntry } from '../types';

type SortBy = 'title' | 'username' | 'url' | 'created' | 'updated';

const VaultPage: React.FC = () => {
  const navigate = useNavigate();
  const { encryptionKey, logout, displayTimeRemaining, formatTimeRemaining, sessionTimeout } = useAuth();
  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);
  const [filteredPasswords, setFilteredPasswords] = useState<PasswordEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('title');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPassword, setEditingPassword] = useState<PasswordEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSessionModal, setShowSessionModal] = useState(false);

  const loadPasswords = useCallback(async () => {
    if (!encryptionKey) return;
    
    try {
      setIsLoading(true);
      const encryptedPasswords = getVaultData();
      const decryptedPasswords: PasswordEntry[] = [];

      for (const encryptedPassword of encryptedPasswords) {
        try {
          const decryptedPassword = await decryptPasswordEntry(encryptedPassword, encryptionKey);
          decryptedPasswords.push(decryptedPassword);
        } catch (error) {
          console.error('Error decrypting password:', error);
        }
      }

      setPasswords(decryptedPasswords);
    } catch (error) {
      console.error('Error loading passwords:', error);
      setError('Failed to load passwords');
    } finally {
      setIsLoading(false);
    }
  }, [encryptionKey]);

  const filterAndSortPasswords = useCallback(() => {
    let filtered = [...passwords];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(password => 
        password.title.toLowerCase().includes(query) ||
        password.username?.toLowerCase().includes(query) ||
        password.url?.toLowerCase().includes(query) ||
        password.notes?.toLowerCase().includes(query)
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'username':
          return (a.username || '').localeCompare(b.username || '');
        case 'url':
          return (a.url || '').localeCompare(b.url || '');
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'updated':
          return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime();
        default:
          return 0;
      }
    });

    setFilteredPasswords(filtered);
  }, [passwords, searchQuery, sortBy]);

  useEffect(() => {
    loadPasswords();
  }, [loadPasswords]);

  useEffect(() => {
    filterAndSortPasswords();
  }, [filterAndSortPasswords]);

  // Show session expiry modal when time remaining is low
  useEffect(() => {
    if (displayTimeRemaining && displayTimeRemaining <= WARNING_TIME && displayTimeRemaining > 0) {
      setShowSessionModal(true);
    } else {
      setShowSessionModal(false);
    }
  }, [displayTimeRemaining]);

  const handleAddPassword = async (passwordData: Partial<PasswordEntry>) => {
    if (!encryptionKey) return;
    
    try {
      const newPassword: PasswordEntry = {
        ...passwordData,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        title: passwordData.title || '',
        password: passwordData.password || '',
      } as PasswordEntry;

      const encryptedPassword = await encryptPasswordEntry(newPassword, encryptionKey);
      addPasswordEntry(encryptedPassword);
      setPasswords(prev => [...prev, newPassword]);
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding password:', error);
      setError('Failed to add password');
    }
  };

  const handleEditPassword = async (passwordData: Partial<PasswordEntry>) => {
    if (!editingPassword || !encryptionKey) return;
    
    try {
      const updatedPassword: PasswordEntry = {
        ...editingPassword,
        ...passwordData,
        updatedAt: Date.now()
      };

      const encryptedPassword = await encryptPasswordEntry(updatedPassword, encryptionKey);
      updatePasswordEntry(editingPassword.id, encryptedPassword);
      setPasswords(prev => 
        prev.map(pwd => pwd.id === editingPassword.id ? updatedPassword : pwd)
      );
      setEditingPassword(null);
    } catch (error) {
      console.error('Error updating password:', error);
      setError('Failed to update password');
    }
  };

  const handleDeletePassword = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this password?')) {
      return;
    }

    try {
      deletePasswordEntry(id);
      setPasswords(prev => prev.filter(pwd => pwd.id !== id));
    } catch (error) {
      console.error('Error deleting password:', error);
      setError('Failed to delete password');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value as SortBy);
  };

  const clearError = () => {
    setError(null);
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p>Loading passwords...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Password Vault</h1>
          <div className={styles.headerActions}>
            {displayTimeRemaining && displayTimeRemaining > 0 && (
              <div className={styles.sessionTimer}>
                Session expires in: {formatTimeRemaining(displayTimeRemaining)}
              </div>
            )}
            <button
              onClick={() => navigate('/settings')}
              className={styles.settingsButton}
              title="Settings"
            >
              ⚙️
            </button>
            <button 
              onClick={handleLogout}
              className={styles.logoutButton}
              title="Lock vault"
            >
              🔒 Lock
            </button>
          </div>
        </div>
      </header>

      {/* Search and Controls */}
      <div className={styles.controls}>
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search passwords..."
            value={searchQuery}
            onChange={handleSearchChange}
            className={styles.searchInput}
          />
          <span className={styles.searchIcon}>🔍</span>
        </div>
        
        <div className={styles.sortContainer}>
          <label htmlFor="sortSelect" className={styles.sortLabel}>
            Sort by:
          </label>
          <select
            id="sortSelect"
            value={sortBy}
            onChange={handleSortChange}
            className={styles.sortSelect}
          >
            <option value="title">Title</option>
            <option value="username">Username</option>
            <option value="url">URL</option>
            <option value="created">Date Created</option>
            <option value="updated">Last Updated</option>
          </select>
        </div>
      </div>

      {/* Add Password Button */}
      <div className={styles.addButtonContainer}>
        <button
          onClick={() => setShowAddForm(true)}
          className={styles.addButton}
        >
          ➕ Add Password
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className={styles.errorContainer}>
          <span className={styles.errorMessage}>{error}</span>
          <button onClick={clearError} className={styles.errorClose}>×</button>
        </div>
      )}

      {/* Password List */}
      <main className={styles.main}>
        {filteredPasswords.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🔐</div>
            <h2 className={styles.emptyTitle}>
              {searchQuery ? 'No passwords found' : 'No passwords yet'}
            </h2>
            <p className={styles.emptyDescription}>
              {searchQuery 
                ? 'Try adjusting your search terms'
                : 'Add your first password to get started'
              }
            </p>
          </div>
        ) : (
          <div className={styles.passwordGrid}>
            {filteredPasswords.map(password => (
              <PasswordCard
                key={password.id}
                password={password}
                onEdit={setEditingPassword}
                onDelete={handleDeletePassword}
              />
            ))}
          </div>
        )}
      </main>

      {/* Add/Edit Form Modal */}
      {(showAddForm || editingPassword) && (
        <PasswordForm
          password={editingPassword}
          onSave={editingPassword ? handleEditPassword : handleAddPassword}
          onCancel={() => {
            setShowAddForm(false);
            setEditingPassword(null);
          }}
          encryptionKey={encryptionKey!}
        />
      )}

      {/* Session Expiry Modal */}
      {displayTimeRemaining && (
        <SessionExpiryModal
          isOpen={showSessionModal}
          timeRemaining={displayTimeRemaining}
        />
      )}
    </div>
  );
};

export default VaultPage;

