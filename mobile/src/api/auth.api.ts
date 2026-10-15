import { apiClient } from './client';
import { ApiResponse, User } from '../types';

export interface LoginParams {
  identifier?: string;
  email?: string;
  password?: string;
  otp?: string;
  donorAvailability?: boolean;
}

export interface SendOtpResponse {
  identifier: string;
  expiresInSeconds?: number;
  devOtp?: string;
}

export const authApi = {
  async register(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    role?: 'DONOR' | 'USER' | string;
    bloodGroup?: string;
  }): Promise<ApiResponse<{ user: User; accessToken: string }>> {
    const res = await apiClient.post('/auth/register', data);
    return res.data;
  },

  async login(data: LoginParams): Promise<ApiResponse<{ user: User; accessToken: string }>> {
    const res = await apiClient.post('/auth/login', data);
    return res.data;
  },

  async sendOtp(data: {
    identifier: string;
    purpose?: string;
  }): Promise<ApiResponse<SendOtpResponse>> {
    const res = await apiClient.post('/auth/send-otp', data);
    return res.data;
  },

  async getMe(): Promise<ApiResponse<User>> {
    const res = await apiClient.get('/auth/me');
    return res.data;
  },

  async logout(): Promise<ApiResponse> {
    const res = await apiClient.post('/auth/logout');
    return res.data;
  },

  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<ApiResponse> {
    const res = await apiClient.put('/auth/change-password', data);
    return res.data;
  },

  async getSettings(): Promise<ApiResponse<any>> {
    const res = await apiClient.get('/auth/settings');
    return res.data;
  },

  async updateSettings(data: any): Promise<ApiResponse<any>> {
    const res = await apiClient.put('/auth/settings', data);
    return res.data;
  },
};

