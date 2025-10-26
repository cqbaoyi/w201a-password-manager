import React, { useState, useEffect, useCallback } from 'react';
import LoginScreen from './components/LoginScreen';
import PasswordVault from './components/PasswordVault';
import { getSessionTimeout, setSessionTimeout } from './utils/storage';
import './App.css';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [encryptionKey, setEncryptionKey] = useState(null);
  const [error, setError] = useState(null);
  const [sessionTimeout, setSessionTimeoutState] = useState(null);

  // Session management
  const SESSION_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
  const WARNING_TIME = 1 * 60 * 1000; // 1 minute warning

  const handleLogout = useCallback(() => {
    setEncryptionKey(null);
    setIsAuthenticated(false);
    setSessionTimeoutState(null);
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
    let timeoutId;
    let warningTimeoutId;

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
  }, [isAuthenticated, encryptionKey, SESSION_DURATION, WARNING_TIME, handleLogout]);

  // Reset session timeout on user activity
  useEffect(() => {
    if (!isAuthenticated) return;

    let lastActivity = Date.now();
    let resetTimeoutId;

    const resetSession = () => {
      const now = Date.now();
      // Only reset if it's been at least 1 second since last activity to prevent excessive resets
      if (now - lastActivity < 1000) return;
      
      lastActivity = now;
      const newTimeout = now + SESSION_DURATION;
      setSessionTimeout(newTimeout);
      setSessionTimeoutState(newTimeout);
    };

    // Throttled reset function to prevent excessive updates
    const throttledReset = () => {
      if (resetTimeoutId) clearTimeout(resetTimeoutId);
      resetTimeoutId = setTimeout(resetSession, 1000); // Reset at most once per second
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
  }, [isAuthenticated, SESSION_DURATION]);


  const handleLogin = (key) => {
    setEncryptionKey(key);
    setIsAuthenticated(true);
    setError(null);
  };

  const handleError = (errorMessage) => {
    setError(errorMessage);
    setTimeout(() => setError(null), 5000); // Auto-clear error after 5 seconds
  };

  const getTimeUntilTimeout = () => {
    if (!sessionTimeout) return null;
    const remaining = sessionTimeout - Date.now();
    return Math.max(0, remaining);
  };

  const formatTimeRemaining = (milliseconds) => {
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
        encryptionKey={encryptionKey} 
        onLogout={handleLogout}
        timeRemaining={getTimeUntilTimeout()}
        formatTime={formatTimeRemaining}
      />
    </div>
  );
};

export default App;