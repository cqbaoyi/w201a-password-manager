import React, { useState, useEffect, useCallback } from 'react';
import { getVaultData, addPasswordEntry, updatePasswordEntry, deletePasswordEntry } from '../utils/storage';
import { decryptPasswordEntry } from '../utils/crypto';
import PasswordCard from './PasswordCard';
import PasswordForm from './PasswordForm';
import styles from './PasswordVault.module.css';

const PasswordVault = ({ encryptionKey, onLogout, timeRemaining, formatTime }) => {
  const [passwords, setPasswords] = useState([]);
  const [filteredPasswords, setFilteredPasswords] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPassword, setEditingPassword] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPasswords = useCallback(async () => {
    try {
      setIsLoading(true);
      const encryptedPasswords = getVaultData();
      const decryptedPasswords = [];

      for (const encryptedPassword of encryptedPasswords) {
        try {
          const decryptedPassword = await decryptPasswordEntry(encryptedPassword, encryptionKey);
          decryptedPasswords.push(decryptedPassword);
        } catch (error) {
          console.error('Error decrypting password:', error);
          // Skip corrupted entries
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

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(password => 
        password.title.toLowerCase().includes(query) ||
        password.username?.toLowerCase().includes(query) ||
        password.url?.toLowerCase().includes(query) ||
        password.notes?.toLowerCase().includes(query)
      );
    }

    // Sort passwords
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'username':
          return (a.username || '').localeCompare(b.username || '');
        case 'url':
          return (a.url || '').localeCompare(b.url || '');
        case 'created':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'updated':
          return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
        default:
          return 0;
      }
    });

    setFilteredPasswords(filtered);
  }, [passwords, searchQuery, sortBy]);

  // Load and decrypt passwords
  useEffect(() => {
    loadPasswords();
  }, [loadPasswords]);

  // Filter and sort passwords
  useEffect(() => {
    filterAndSortPasswords();
  }, [filterAndSortPasswords]);

  const handleAddPassword = async (passwordData) => {
    try {
      const newPassword = {
        ...passwordData,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      // Encrypt the password
      const encryptedPassword = await encryptPasswordEntry(newPassword, encryptionKey);
      
      // Add to storage
      addPasswordEntry(encryptedPassword);
      
      // Update local state
      setPasswords(prev => [...prev, newPassword]);
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding password:', error);
      setError('Failed to add password');
    }
  };

  const handleEditPassword = async (id, updatedData) => {
    try {
      const updatedPassword = {
        ...updatedData,
        id,
        updatedAt: Date.now()
      };

      // Encrypt the updated password
      const encryptedPassword = await encryptPasswordEntry(updatedPassword, encryptionKey);
      
      // Update in storage
      updatePasswordEntry(id, encryptedPassword);
      
      // Update local state
      setPasswords(prev => 
        prev.map(pwd => pwd.id === id ? updatedPassword : pwd)
      );
      setEditingPassword(null);
    } catch (error) {
      console.error('Error updating password:', error);
      setError('Failed to update password');
    }
  };

  const handleDeletePassword = async (id) => {
    if (!window.confirm('Are you sure you want to delete this password?')) {
      return;
    }

    try {
      // Remove from storage
      deletePasswordEntry(id);
      
      // Update local state
      setPasswords(prev => prev.filter(pwd => pwd.id !== id));
    } catch (error) {
      console.error('Error deleting password:', error);
      setError('Failed to delete password');
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
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
            {timeRemaining && (
              <div className={styles.sessionTimer}>
                Session expires in: {formatTime(timeRemaining)}
              </div>
            )}
            <button 
              onClick={onLogout}
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
          encryptionKey={encryptionKey}
        />
      )}
    </div>
  );
};

// Helper function to encrypt password entry
const encryptPasswordEntry = async (entry, key) => {
  const { encryptPasswordEntry } = await import('../utils/crypto');
  return encryptPasswordEntry(entry, key);
};

export default PasswordVault;
