import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { authApi } from '../services/api';
import i18n from '../i18n';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (identifier: string, secret: string, isOtp?: boolean, donorAvailability?: boolean) => Promise<User>;
  sendOtp: (identifier: string) => Promise<any>;
  register: (data: unknown) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isUser: boolean;
  isDonor: boolean;
  isSeeker: boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      authApi.getMe()
        .then(res => {
          const userData = res.data.data;
          setUser(userData);
        })
        .catch(() => {
          localStorage.removeItem('accessToken');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (identifier: string, secret: string, isOtp = false, donorAvailability?: boolean) => {
    const payload: any = {
      identifier: identifier.trim(),
      ...(isOtp ? { otp: secret.trim() } : { password: secret }),
      ...(typeof donorAvailability === 'boolean' ? { donorAvailability } : {}),
    };
    const res = await authApi.login(payload);
    const { user: userData, accessToken } = res.data.data;
    localStorage.setItem('accessToken', accessToken);
    setUser(userData);
    return userData;
  };

  const sendOtp = async (identifier: string) => {
    const res = await authApi.sendOtp({ identifier: identifier.trim(), purpose: 'LOGIN' });
    return res.data;
  };

  const register = async (data: unknown) => {
    const res = await authApi.register(data);
    const { user: userData, accessToken } = res.data.data;
    localStorage.setItem('accessToken', accessToken);
    setUser(userData);
  };

  const logout = async () => {
    try { await authApi.logout(); } catch (e) {} // ignore network errors during logout
    localStorage.removeItem('accessToken');
    setUser(null);
    window.location.href = '/login'; // Force redirect to login page
  };

  const updateUser = (updatedUser: User) => setUser(updatedUser);

  const refreshUser = async () => {
    try {
      const res = await authApi.getMe();
      if (res.data?.data) {
        setUser(res.data.data);
      }
    } catch {}
  };

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isDonor = user?.role === 'DONOR' || (user?.role !== 'USER' && !!user?.donorProfile);
  const isSeeker = user?.role === 'USER' || user?.role === 'SEEKER';
  const isUser = isSeeker;
  const hasPermission = (p: string) => isSuperAdmin || true; // permissions simplified

  return (
    <AuthContext.Provider value={{
      user, loading, login, sendOtp, register, logout, updateUser, refreshUser,
      isAuthenticated: !!user,
      isAdmin, isSuperAdmin, isUser, isDonor, isSeeker, hasPermission,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
