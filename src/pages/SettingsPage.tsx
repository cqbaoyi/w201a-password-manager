import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSession } from '../contexts/SessionContext';
import styles from './SettingsPage.module.css';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { displayTimeRemaining, formatTimeRemaining } = useSession();

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Settings</h1>
          <div className={styles.headerActions}>
            <button
              onClick={() => navigate('/vault')}
              className={styles.backButton}
              title="Back to vault"
            >
              ← Back
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

      <main className={styles.main}>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Session Information</h2>
          <div className={styles.infoCard}>
            {displayTimeRemaining && displayTimeRemaining > 0 ? (
              <p className={styles.infoText}>
                Session expires in: <strong>{formatTimeRemaining(displayTimeRemaining)}</strong>
              </p>
            ) : (
              <p className={styles.infoText}>No active session</p>
            )}
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Vault Settings</h2>
          <div className={styles.infoCard}>
            <p className={styles.infoText}>
              Vault settings and configuration options will be available here.
            </p>
            <p className={styles.infoText}>
              Future features may include:
            </p>
            <ul className={styles.featureList}>
              <li>Session timeout duration</li>
              <li>Export/Import vault data</li>
              <li>Theme preferences</li>
              <li>Auto-lock settings</li>
            </ul>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Security</h2>
          <div className={styles.infoCard}>
            <p className={styles.infoText}>
              Your vault is encrypted locally using AES-GCM 256-bit encryption.
              Your master password is never stored or transmitted.
            </p>
            <button
              onClick={handleLogout}
              className={styles.lockButton}
            >
              🔒 Lock Vault Now
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;

