import React, { useState, useEffect, useCallback } from 'react';
import LoginScreen from './components/LoginScreen';
import PasswordVault from './components/PasswordVault';
import { getSessionTimeout, setSessionTimeout } from './utils/storage';
import {
  SESSION_DURATION,
  WARNING_TIME,
  ACTIVITY_RESET_THROTTLE,
  DISPLAY_UPDATE_INTERVAL,
  ERROR_DISPLAY_DURATION,
} from './constants/config';
import './App.css';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sessionTimeout, setSessionTimeoutState] = useState<number | null>(null);
  const [displayTimeRemaining, setDisplayTimeRemaining] = useState<number | null>(null);

  const handleLogout = useCallback(() => {
    setEncryptionKey(null);
    setIsAuthenticated(false);
    setSessionTimeoutState(null);
    setDisplayTimeRemaining(null);
    setSessionTimeout(0);
  }, []);

  useEffect(() => {
    // Check for existing session on app load
    const existingTimeout = getSessionTimeout();
    if (existingTimeout && existingTimeout > Date.now()) {
      // Session still valid, but we need the user to re-enter password
      // for security reasons
      setIsAuthenticated(false);
    }
  }, []);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let warningTimeoutId: NodeJS.Timeout;

    if (isAuthenticated && encryptionKey) {
      // Set up session timeout
      const timeout = Date.now() + SESSION_DURATION;
      setSessionTimeout(timeout);
      setSessionTimeoutState(timeout);

      // Set up auto-lock
      timeoutId = setTimeout(() => {
        handleLogout();
      }, SESSION_DURATION);

      // Set up warning
      warningTimeoutId = setTimeout(() => {
        // Could show a warning modal here
      }, SESSION_DURATION - WARNING_TIME);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (warningTimeoutId) clearTimeout(warningTimeoutId);
    };
  }, [isAuthenticated, encryptionKey, handleLogout]);

  // Reset session timeout on user activity
  useEffect(() => {
    if (!isAuthenticated) return;

    let lastActivity = Date.now();
    let resetTimeoutId: NodeJS.Timeout;

    const resetSession = () => {
      const now = Date.now();
      // Only reset if it's been at least 1 second since last activity to prevent excessive resets
      if (now - lastActivity < ACTIVITY_RESET_THROTTLE) return;
      
      lastActivity = now;
      const newTimeout = now + SESSION_DURATION;
      setSessionTimeout(newTimeout);
      setSessionTimeoutState(newTimeout);
    };

    // Throttled reset function to prevent excessive updates
    const throttledReset = () => {
      if (resetTimeoutId) clearTimeout(resetTimeoutId);
      resetTimeoutId = setTimeout(resetSession, ACTIVITY_RESET_THROTTLE);
    };

    // Listen for user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      document.addEventListener(event, throttledReset, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, throttledReset, true);
      });
      if (resetTimeoutId) clearTimeout(resetTimeoutId);
    };
  }, [isAuthenticated]);

  // Update display time every second
  useEffect(() => {
    if (!isAuthenticated || !sessionTimeout) {
      setDisplayTimeRemaining(null);
      return;
    }

    const updateDisplayTime = () => {
      const remaining = sessionTimeout - Date.now();
      setDisplayTimeRemaining(Math.max(0, remaining));
    };

    // Update immediately
    updateDisplayTime();

    // Update every second
    const intervalId = setInterval(updateDisplayTime, DISPLAY_UPDATE_INTERVAL);

    return () => {
      clearInterval(intervalId);
    };
  }, [isAuthenticated, sessionTimeout]);

  const handleLogin = (key: CryptoKey) => {
    setEncryptionKey(key);
    setIsAuthenticated(true);
    setError(null);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setTimeout(() => setError(null), ERROR_DISPLAY_DURATION);
  };

  const getTimeUntilTimeout = (): number | null => {
    return displayTimeRemaining && displayTimeRemaining > 0 ? displayTimeRemaining : null;
  };

  const formatTimeRemaining = (milliseconds: number): string => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (error) {
    return (
      <div className="error-toast">
        <div className="error-content">
          <span className="error-icon">⚠️</span>
          <span className="error-message">{error}</span>
          <button 
            className="error-close"
            onClick={() => setError(null)}
            aria-label="Close error"
          >
            ×
          </button>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} onError={handleError} />;
  }

  return (
    <div className="app">
      <PasswordVault 
        encryptionKey={encryptionKey!} 
        onLogout={handleLogout}
        timeRemaining={getTimeUntilTimeout()}
        formatTime={formatTimeRemaining}
      />
    </div>
  );
};

export default App;

