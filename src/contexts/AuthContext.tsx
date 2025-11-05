import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { getSessionTimeout } from '../utils/storage';

interface AuthContextType {
  encryptionKey: CryptoKey | null;
  isAuthenticated: boolean;
  login: (key: CryptoKey) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const logout = useCallback(() => {
    setEncryptionKey(null);
    setIsAuthenticated(false);
  }, []);

  const login = useCallback((key: CryptoKey) => {
    setEncryptionKey(key);
    setIsAuthenticated(true);
  }, []);

  // Check for existing session on mount
  useEffect(() => {
    const existingTimeout = getSessionTimeout();
    if (existingTimeout && existingTimeout > Date.now()) {
      // Session still valid, but we need the user to re-enter password
      // for security reasons
      setIsAuthenticated(false);
    }
  }, []);

  const value: AuthContextType = {
    encryptionKey,
    isAuthenticated,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
