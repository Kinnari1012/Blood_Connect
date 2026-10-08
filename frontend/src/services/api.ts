import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Attach access token from memory store
api.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401
let isRefreshing = false;
let failedQueue: Array<{ resolve: (v: unknown) => void; reject: (e: unknown) => void }> = [];

function processQueue(error: Error | null, token: string | null = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
}

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post('/api/auth/refresh', {}, { withCredentials: true });
        const newToken = res.data.data.accessToken;
        localStorage.setItem('accessToken', newToken);
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as Error, null);
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// Auth
export const authApi = {
  register: (data: unknown) => api.post('/auth/register', data),
  login: (data: unknown) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  refresh: () => api.post('/auth/refresh'),
  getMe: () => api.get('/auth/me'),
  changePassword: (data: unknown) => api.put('/auth/change-password', data),
};

// Donors
export const donorApi = {
  getAll: (params?: unknown) => api.get('/donors', { params }),
  createProfile: (data: unknown) => api.post('/donors/profile', data),
  getMyProfile: () => api.get('/donors/profile'),
  updateProfile: (data: unknown) => api.put('/donors/profile', data),
  updateAvailability: (availability: boolean) => api.put('/donors/availability', { availability }),
  search: (params: unknown) => api.get('/donors/search', { params }),
  getPublicProfile: (id: string) => api.get(`/donors/${id}/public`),
  getResponses: (params?: unknown) => api.get('/donors/responses', { params }),
};

// Requests
export const requestApi = {
  create: (data: unknown) => api.post('/requests', data),
  getAllRequests: (params?: unknown) => api.get('/requests', { params }),
  getMyRequests: (params?: unknown) => api.get('/requests/my', { params }),
  getById: (id: string) => api.get(`/requests/${id}`),
  cancel: (id: string) => api.delete(`/requests/${id}`),
  accept: (requestId: string) => api.post(`/requests/${requestId}/accept`),
  decline: (requestId: string) => api.post(`/requests/${requestId}/decline`),
  complete: (requestId: string) => api.post(`/requests/${requestId}/complete`),
  approve: (id: string) => api.post(`/requests/${id}/approve`),
  reject: (id: string, reason: string) => api.post(`/requests/${id}/reject`, { reason }),
  approveDonor: (requestId: string, responseId: string) => api.post(`/requests/${requestId}/responses/${responseId}/approve`),
  getDonations: (params?: unknown) => api.get('/donations', { params }),
  getMyDonations: (params?: unknown) => api.get('/donations/my', { params }),
};

// Notifications
export const notificationApi = {
  getAll: (params?: unknown) => api.get('/notifications', { params }),
  markRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};

// Reports
export const reportApi = {
  create: (data: unknown) => api.post('/reports', data),
  getAll: (params?: unknown) => api.get('/reports', { params }),
  getMy: () => api.get('/reports/my'),
  update: (id: string, data: unknown) => api.put(`/reports/${id}`, data),
};

// Admin
export const adminApi = {
  getUsers: (params?: unknown) => api.get('/admin/users', { params }),
  getUser: (id: string) => api.get(`/admin/users/${id}`),
  createUser: (data: unknown) => api.post('/admin/users', data),
  updateUserStatus: (id: string, data: unknown) => api.put(`/admin/users/${id}/status`, data),
  getAdmins: () => api.get('/admin/admins'),
  createAdmin: (data: unknown) => api.post('/admin/admins', data),
  updateAdminPermissions: (id: string, permissions: string[]) => api.put(`/admin/admins/${id}/permissions`, { permissions }),
  updateAdminStatus: (id: string, status: string) => api.put(`/admin/admins/${id}/status`, { status }),
};

// Analytics
export const analyticsApi = {
  getOverview: () => api.get('/analytics/overview'),
  getBloodGroups: () => api.get('/analytics/blood-groups'),
  getCities: () => api.get('/analytics/cities'),
  getRegistrations: () => api.get('/analytics/registrations'),
  getRequests: () => api.get('/analytics/requests'),
};

// Audit
export const auditApi = {
  getLogs: (params?: unknown) => api.get('/audit-logs', { params }),
};
