import { UserRole, UserStatus } from '../models/User';

// Augment Express Request
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
}

export interface JwtPayload {
  userId: string;
  role: UserRole;
  type: 'access' | 'refresh';
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Blood group compatibility map
export const BLOOD_COMPATIBILITY: Record<string, string[]> = {
  'A_POS':  ['A_POS', 'A_NEG', 'O_POS', 'O_NEG'],
  'A_NEG':  ['A_NEG', 'O_NEG'],
  'B_POS':  ['B_POS', 'B_NEG', 'O_POS', 'O_NEG'],
  'B_NEG':  ['B_NEG', 'O_NEG'],
  'AB_POS': ['A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'AB_POS', 'AB_NEG', 'O_POS', 'O_NEG'],
  'AB_NEG': ['A_NEG', 'B_NEG', 'AB_NEG', 'O_NEG'],
  'O_POS':  ['O_POS', 'O_NEG'],
  'O_NEG':  ['O_NEG'],
};

export const BLOOD_GROUP_DISPLAY: Record<string, string> = {
  A_POS: 'A+', A_NEG: 'A-', B_POS: 'B+', B_NEG: 'B-',
  AB_POS: 'AB+', AB_NEG: 'AB-', O_POS: 'O+', O_NEG: 'O-',
};

export const ADMIN_PERMISSIONS = {
  MANAGE_DONORS: 'MANAGE_DONORS',
  MANAGE_SEEKERS: 'MANAGE_SEEKERS',
  MANAGE_REQUESTS: 'MANAGE_REQUESTS',
  MANAGE_EMERGENCY: 'MANAGE_EMERGENCY',
  MANAGE_REPORTS: 'MANAGE_REPORTS',
  VIEW_ANALYTICS: 'VIEW_ANALYTICS',
  SEND_NOTIFICATIONS: 'SEND_NOTIFICATIONS',
  VIEW_AUDIT_LOGS: 'VIEW_AUDIT_LOGS',
  SUSPEND_USERS: 'SUSPEND_USERS',
} as const;
