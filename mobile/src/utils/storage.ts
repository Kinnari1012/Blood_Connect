import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';

const TOKEN_KEY = '@lifelink_access_token';
const USER_KEY = '@lifelink_user_data';
const ONBOARDED_KEY = '@lifelink_has_onboarded';

export const Storage = {
  async setToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } catch (e) {
      console.error('Failed to save auth token', e);
    }
  },

  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (e) {
      console.error('Failed to get auth token', e);
      return null;
    }
  },

  async removeToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
    } catch (e) {
      console.error('Failed to remove auth token', e);
    }
  },

  async setUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('Failed to save user data', e);
    }
  },

  async getUser(): Promise<User | null> {
    try {
      const data = await AsyncStorage.getItem(USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Failed to get user data', e);
      return null;
    }
  },

  async removeUser(): Promise<void> {
    try {
      await AsyncStorage.removeItem(USER_KEY);
    } catch (e) {
      console.error('Failed to remove user data', e);
    }
  },

  async setHasOnboarded(hasOnboarded: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(ONBOARDED_KEY, hasOnboarded ? 'true' : 'false');
    } catch (e) {
      console.error('Failed to save onboarding status', e);
    }
  },

  async getHasOnboarded(): Promise<boolean> {
    try {
      const val = await AsyncStorage.getItem(ONBOARDED_KEY);
      return val === 'true';
    } catch {
      return false;
    }
  },

  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
      await AsyncStorage.removeItem(USER_KEY);
    } catch (e) {
      console.error('Failed to clear storage', e);
    }
  },
};
