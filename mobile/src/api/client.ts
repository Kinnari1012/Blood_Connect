import axios from 'axios';
import { API_BASE_URL } from '../constants/config';
import { Storage } from '../utils/storage';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await Storage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh`);
        const newToken = refreshResponse.data?.data?.accessToken;
        if (newToken) {
          await Storage.setToken(newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        }
      } catch {
        // If refresh fails, clear auth storage
        await Storage.removeToken();
        await Storage.removeUser();
      }
    }
    return Promise.reject(error);
  }
);
