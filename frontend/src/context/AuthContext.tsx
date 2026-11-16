import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Badge } from '../types';
import { api, getAuthToken, setAuthToken, removeAuthToken } from '../lib/api';

interface AuthContextType {
  user: User | null;
  badges: Badge[];
  unreadCount: number;
  loading: boolean;
  login: (identifier: string, pass: string) => Promise<any>;
  register: (payload: any) => Promise<any>;
  verifyOtp: (email: string, code: string) => Promise<any>;
  resendOtp: (email: string) => Promise<any>;
  sendLoginOtp: (identifier: string) => Promise<any>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    const token = getAuthToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const data = await api.getMe();
      setUser(data.user);
      setBadges(data.badges || []);
      setUnreadCount(data.unreadNotifications || 0);
    } catch (err) {
      console.error('Session expired or error fetching profile:', err);
      removeAuthToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (identifier: string, pass: string) => {
    const data = await api.login({ identifier, password: pass });
    if (data.token) {
      setAuthToken(data.token);
      setUser(data.user);
      await refreshUser();
    }
    return data;
  };

  const register = async (payload: any) => {
    const data = await api.register(payload);
    // If auto verified
    if (data.token) {
      setAuthToken(data.token);
      setUser(data.user);
      await refreshUser();
    }
    return data;
  };

  const verifyOtp = async (email: string, code: string) => {
    const data = await api.verifyOtp({ email, code });
    if (data.token) {
      setAuthToken(data.token);
      setUser(data.user);
      await refreshUser();
    }
    return data;
  };

  const resendOtp = async (email: string) => {
    return await api.resendOtp({ email });
  };

  const sendLoginOtp = async (identifier: string) => {
    return await api.sendLoginOtp({ identifier });
  };

  const logout = () => {
    removeAuthToken();
    setUser(null);
    setBadges([]);
    setUnreadCount(0);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        badges,
        unreadCount,
        loading,
        login,
        register,
        verifyOtp,
        resendOtp,
        sendLoginOtp,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
