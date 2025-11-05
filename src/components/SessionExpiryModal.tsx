import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSession } from '../contexts/SessionContext';
import styles from './SessionExpiryModal.module.css';

interface SessionExpiryModalProps {
  isOpen: boolean;
  timeRemaining: number;
}

const SessionExpiryModal: React.FC<SessionExpiryModalProps> = ({ isOpen, timeRemaining }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { extendSession, formatTimeRemaining } = useSession();

  if (!isOpen) return null;

  const handleExtend = () => {
    extendSession();
  };

  const handleLock = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>Session Expiring Soon</h2>
        </div>
        <div className={styles.content}>
          <p className={styles.message}>
            Your session will expire in <strong>{formatTimeRemaining(timeRemaining)}</strong>.
          </p>
          <p className={styles.subMessage}>
            Would you like to extend your session or lock the vault now?
          </p>
        </div>
        <div className={styles.actions}>
          <button
            onClick={handleExtend}
            className={styles.extendButton}
          >
            Extend Session
          </button>
          <button
            onClick={handleLock}
            className={styles.lockButton}
          >
            Lock Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionExpiryModal;

