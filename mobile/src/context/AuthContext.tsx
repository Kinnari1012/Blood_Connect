import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { authApi, LoginParams } from '../api/auth.api';
import { Storage } from '../utils/storage';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isDonor: boolean;
  isSeeker: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  hasOnboarded: boolean;
  login: (
    identifier: string,
    secret: string,
    isOtp?: boolean,
    donorAvailability?: boolean
  ) => Promise<User>;
  sendOtp: (identifier: string) => Promise<{ identifier: string; devOtp?: string; message?: string }>;
  register: (data: any) => Promise<User>;
  logout: () => Promise<void>;
  updateUser: (updated: User) => void;
  refreshUser: () => Promise<void>;
  finishOnboarding: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasOnboarded, setHasOnboarded] = useState<boolean>(false);

  useEffect(() => {
    bootstrapSession();
  }, []);

  const bootstrapSession = async () => {
    try {
      const onboarded = await Storage.getHasOnboarded();
      setHasOnboarded(onboarded);

      const token = await Storage.getToken();
      if (token) {
        // Fetch current user profile
        const res = await authApi.getMe();
        if (res.success && res.data) {
          setUser(res.data);
          await Storage.setUser(res.data);
        } else {
          // Fall back to cached user if available
          const cached = await Storage.getUser();
          if (cached) setUser(cached);
        }
      }
    } catch {
      // If network fails on launch, try using cached user
      const cached = await Storage.getUser();
      if (cached) setUser(cached);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (
    identifier: string,
    secret: string,
    isOtp: boolean = false,
    donorAvailability?: boolean
  ): Promise<User> => {
    const payload: LoginParams = {
      identifier: identifier.trim(),
      ...(isOtp ? { otp: secret.trim() } : { password: secret }),
      ...(typeof donorAvailability === 'boolean' ? { donorAvailability } : {}),
    };

    const res = await authApi.login(payload);
    if (!res.success || !res.data) {
      throw new Error(res.error?.message || 'Login failed');
    }
    const { user: userData, accessToken } = res.data;
    await Storage.setToken(accessToken);
    await Storage.setUser(userData);
    setUser(userData);
    return userData;
  };

  const sendOtp = async (identifier: string) => {
    const res = await authApi.sendOtp({ identifier: identifier.trim(), purpose: 'LOGIN' });
    if (!res.success || !res.data) {
      throw new Error(res.error?.message || 'Failed to send OTP');
    }
    return {
      identifier: res.data.identifier,
      devOtp: res.data.devOtp,
      message: res.message,
    };
  };

  const register = async (data: any): Promise<User> => {
    const res = await authApi.register(data);
    if (!res.success || !res.data) {
      throw new Error(res.error?.message || 'Registration failed');
    }
    const { user: userData, accessToken } = res.data;
    await Storage.setToken(accessToken);
    await Storage.setUser(userData);
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore network errors on logout
    }
    await Storage.removeToken();
    await Storage.removeUser();
    setUser(null);
  };

  const updateUser = (updated: User) => {
    setUser(updated);
    Storage.setUser(updated);
  };

  const refreshUser = async () => {
    try {
      const res = await authApi.getMe();
      if (res.success && res.data) {
        setUser(res.data);
        await Storage.setUser(res.data);
      }
    } catch (e) {
      console.warn('Could not refresh user session', e);
    }
  };

  const finishOnboarding = async () => {
    await Storage.setHasOnboarded(true);
    setHasOnboarded(true);
  };

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isAdmin = user?.role === 'ADMIN' || isSuperAdmin;
  const isDonor = user?.role === 'DONOR' || (user?.role !== 'USER' && !!user?.donorProfile);
  const isSeeker = user?.role === 'USER';

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isDonor,
        isSeeker,
        isAdmin,
        isSuperAdmin,
        hasOnboarded,
        login,
        sendOtp,
        register,
        logout,
        updateUser,
        refreshUser,
        finishOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}
