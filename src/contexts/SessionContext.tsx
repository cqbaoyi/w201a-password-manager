import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { getSessionTimeout, setSessionTimeout } from '../utils/storage';
import {
  SESSION_DURATION,
  WARNING_TIME,
  ACTIVITY_RESET_THROTTLE,
  DISPLAY_UPDATE_INTERVAL,
} from '../constants/config';
import { useAuth } from './AuthContext';

interface SessionContextType {
  sessionTimeout: number | null;
  displayTimeRemaining: number | null;
  extendSession: () => void;
  formatTimeRemaining: (milliseconds: number) => string;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};

interface SessionProviderProps {
  children: ReactNode;
}

export const SessionProvider: React.FC<SessionProviderProps> = ({ children }) => {
  const { isAuthenticated, logout } = useAuth();
  const [sessionTimeout, setSessionTimeoutState] = useState<number | null>(null);
  const [displayTimeRemaining, setDisplayTimeRemaining] = useState<number | null>(null);

  const extendSession = useCallback(() => {
    if (isAuthenticated) {
      const newTimeout = Date.now() + SESSION_DURATION;
      setSessionTimeout(newTimeout);
      setSessionTimeoutState(newTimeout);
    }
  }, [isAuthenticated]);

  // Check for existing session on mount
  useEffect(() => {
    const existingTimeout = getSessionTimeout();
    if (existingTimeout && existingTimeout > Date.now()) {
      // Session still valid, but we need the user to re-enter password
      // for security reasons - handled by AuthProvider
      setSessionTimeoutState(null);
    }
  }, []);

  // Set up session timeout when authenticated
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let warningTimeoutId: NodeJS.Timeout;

    if (isAuthenticated) {
      // Set up session timeout
      const timeout = Date.now() + SESSION_DURATION;
      setSessionTimeout(timeout);
      setSessionTimeoutState(timeout);

      // Set up auto-lock
      timeoutId = setTimeout(() => {
        logout();
      }, SESSION_DURATION);

      // Set up warning (could trigger modal here)
      warningTimeoutId = setTimeout(() => {
        // Warning time reached - modal can check this
      }, SESSION_DURATION - WARNING_TIME);
    } else {
      // Clear session when not authenticated
      setSessionTimeoutState(null);
      setDisplayTimeRemaining(null);
      setSessionTimeout(0);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (warningTimeoutId) clearTimeout(warningTimeoutId);
    };
  }, [isAuthenticated, logout]);

  // Reset session timeout on user activity
  useEffect(() => {
    if (!isAuthenticated) return;

    let lastActivity = Date.now();
    let resetTimeoutId: NodeJS.Timeout;

    const resetSession = () => {
      const now = Date.now();
      if (now - lastActivity < ACTIVITY_RESET_THROTTLE) return;
      
      lastActivity = now;
      const newTimeout = now + SESSION_DURATION;
      setSessionTimeout(newTimeout);
      setSessionTimeoutState(newTimeout);
    };

    const throttledReset = () => {
      if (resetTimeoutId) clearTimeout(resetTimeoutId);
      resetTimeoutId = setTimeout(resetSession, ACTIVITY_RESET_THROTTLE);
    };

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

    updateDisplayTime();
    const intervalId = setInterval(updateDisplayTime, DISPLAY_UPDATE_INTERVAL);

    return () => {
      clearInterval(intervalId);
    };
  }, [isAuthenticated, sessionTimeout]);

  const formatTimeRemaining = (milliseconds: number): string => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const value: SessionContextType = {
    sessionTimeout,
    displayTimeRemaining,
    extendSession,
    formatTimeRemaining,
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
};

