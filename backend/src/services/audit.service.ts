import { AuditLog } from '../models/AuditLog';

interface AuditLogParams {
  action: string;
  performedById: string;
  targetUserId?: string;
  targetResource?: string;
  targetId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
}

export class AuditService {
  static async log(params: AuditLogParams) {
    try {
      await AuditLog.create(params);
    } catch (err) {
      console.error('Audit log error:', err);
    }
  }
}

export const AUDIT_ACTIONS = {
  ADMIN_LOGIN: 'ADMIN_LOGIN',
  USER_CREATED: 'USER_CREATED',
  USER_UPDATED: 'USER_UPDATED',
  USER_SUSPENDED: 'USER_SUSPENDED',
  USER_ACTIVATED: 'USER_ACTIVATED',
  USER_DEACTIVATED: 'USER_DEACTIVATED',
  BLOOD_REQUEST_CREATED: 'BLOOD_REQUEST_CREATED',
  BLOOD_REQUEST_UPDATED: 'BLOOD_REQUEST_UPDATED',
  REPORT_REVIEWED: 'REPORT_REVIEWED',
  ADMIN_PERMISSION_CHANGED: 'ADMIN_PERMISSION_CHANGED',
  ADMIN_ACCOUNT_CREATED: 'ADMIN_ACCOUNT_CREATED',
  ADMIN_ACCOUNT_DISABLED: 'ADMIN_ACCOUNT_DISABLED',
  DONOR_PROFILE_UPDATED: 'DONOR_PROFILE_UPDATED',
  EMERGENCY_REQUEST_CREATED: 'EMERGENCY_REQUEST_CREATED',
} as const;
