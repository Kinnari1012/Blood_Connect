import { BloodGroup } from '../types';

export const BLOOD_GROUPS: BloodGroup[] = ['A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'AB_POS', 'AB_NEG', 'O_POS', 'O_NEG'];

export const BLOOD_GROUP_DISPLAY: Record<BloodGroup, string> = {
  A_POS: 'A+', A_NEG: 'A-', B_POS: 'B+', B_NEG: 'B-',
  AB_POS: 'AB+', AB_NEG: 'AB-', O_POS: 'O+', O_NEG: 'O-',
};

export const BLOOD_GROUP_COLORS: Record<BloodGroup, string> = {
  A_POS: 'bg-red-100 text-red-800',
  A_NEG: 'bg-red-200 text-red-900',
  B_POS: 'bg-orange-100 text-orange-800',
  B_NEG: 'bg-orange-200 text-orange-900',
  AB_POS: 'bg-purple-100 text-purple-800',
  AB_NEG: 'bg-purple-200 text-purple-900',
  O_POS: 'bg-blue-100 text-blue-800',
  O_NEG: 'bg-blue-200 text-blue-900',
};

export const LANGUAGES = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'gu', label: 'Gujarati', nativeLabel: 'ગુજરાતી' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी' },
];

export const ADMIN_PERMISSIONS = [
  { key: 'MANAGE_DONORS', label: 'Manage Donors' },
  { key: 'MANAGE_SEEKERS', label: 'Manage Seekers' },
  { key: 'MANAGE_REQUESTS', label: 'Manage Requests' },
  { key: 'MANAGE_EMERGENCY', label: 'Manage Emergency' },
  { key: 'MANAGE_REPORTS', label: 'Manage Reports' },
  { key: 'VIEW_ANALYTICS', label: 'View Analytics' },
  { key: 'SEND_NOTIFICATIONS', label: 'Send Notifications' },
  { key: 'VIEW_AUDIT_LOGS', label: 'View Audit Logs' },
  { key: 'SUSPEND_USERS', label: 'Suspend Users' },
];

export const ROUTES = {
  SPLASH: '/',
  ONBOARDING: '/onboarding',
  LANGUAGE: '/language',
  LOGIN: '/login',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  REGISTER: '/register',
  SELECT_TYPE: '/select-type',
  HOME: '/dashboard',
  USERS: '/users',
  DONORS: '/donors',
  BLOOD_REQUESTS: '/blood-requests',
  BLOOD_DONATIONS: '/blood-donations',
  BLOOD_GROUPS: '/blood-groups',
  LOCATIONS: '/locations',
  REPORTS: '/reports',
  NOTIFICATIONS: '/notifications',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  FIND_BLOOD: '/find-blood',
  DONOR_REGISTER: '/donor/register',
  DONOR_PROFILE: '/donor/profile',
  DONOR_DASHBOARD: '/donor/dashboard',
  DONATION_HISTORY: '/donor/history',
  USER_DASHBOARD: '/user/dashboard',
  ADMIN_DASHBOARD: '/admin/dashboard',
  SUPER_ADMIN_DASHBOARD: '/super-admin/dashboard',
  ADMIN_MANAGEMENT: '/super-admin/admin-management',
  REQUEST_CREATE: '/requests/create',
  REQUEST_EMERGENCY: '/requests/emergency',
  REQUEST_DETAILS: '/requests/:id',
  PRIVACY: '/privacy',
  TERMS: '/terms',
  HELP: '/help',
};
