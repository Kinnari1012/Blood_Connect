export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'DONOR' | 'SEEKER' | 'USER';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING' | 'DISABLED';
export type BloodGroup = 'A_POS' | 'A_NEG' | 'B_POS' | 'B_NEG' | 'AB_POS' | 'AB_NEG' | 'O_POS' | 'O_NEG';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type EmergencyLevel = 'NORMAL' | 'URGENT' | 'CRITICAL';
export type RequestStatus = 'PENDING' | 'MATCHING' | 'DONOR_ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type DonorResponseStatus = 'NOTIFIED' | 'ACCEPTED' | 'DECLINED' | 'COMPLETED';
export type NotificationType = 'NEW_BLOOD_REQUEST' | 'EMERGENCY_REQUEST' | 'DONOR_ACCEPTED' | 'DONOR_DECLINED' | 'REQUEST_COMPLETED' | 'DONATION_REMINDER' | 'ACCOUNT_SECURITY' | 'SYSTEM';

export interface User {
  id: string;
  email: string;
  fullName: string;
  mobile: string;
  role: UserRole;
  status: UserStatus;
  language: string;
  lastLoginAt?: string;
  createdAt: string;
  permissions: string[];
  donorProfile?: DonorProfileSummary;
}

export interface DonorProfileSummary {
  bloodGroup: BloodGroup;
  availability: boolean;
  city?: string;
  area?: string;
  lastDonationDate?: string;
  nextEligibleDate?: string;
  totalDonations: number;
}

export interface DonorProfile extends DonorProfileSummary {
  id: string;
  userId: string;
  dateOfBirth: string;
  gender: Gender;
  preferredContact: 'CALL' | 'WHATSAPP' | 'IN_APP';
  state?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  user: { id: string; fullName: string };
}

export interface BloodRequest {
  id: string;
  requesterId: string;
  patientName: string;
  bloodGroup: BloodGroup;
  unitsRequired: number;
  hospitalName: string;
  hospitalAddress?: string;
  hospitalCity?: string;
  requiredDate: string;
  requiredTime?: string;
  emergencyLevel: EmergencyLevel;
  isEmergency: boolean;
  status: RequestStatus;
  notes?: string;
  createdAt: string;
  requester?: { id: string; fullName: string; mobile?: string };
  donorResponses?: DonorResponse[];
}

export interface DonorResponse {
  id: string;
  requestId: string;
  donorId: string;
  status: DonorResponseStatus;
  respondedAt?: string;
  donor?: { id: string; fullName: string };
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
}

export interface UserReport {
  id: string;
  reporterId: string;
  reportedUserId: string;
  category: string;
  description?: string;
  status: string;
  createdAt: string;
  reporter?: { id: string; fullName: string };
  reportedUser?: { id: string; fullName: string; role: string };
}

export interface AuditLog {
  id: string;
  action: string;
  performedById: string;
  targetUserId?: string;
  targetResource?: string;
  targetId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: string;
  performedBy?: { id: string; fullName: string; email: string; role: string };
  targetUser?: { id: string; fullName: string; email: string };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  meta?: PaginationMeta;
  error?: { code: string; message: string };
}

export interface AnalyticsOverview {
  totalUsers: number;
  totalDonors: number;
  totalSeekers: number;
  availableDonors: number;
  activeRequests: number;
  emergencyRequests: number;
  completedRequests: number;
  totalAdmins: number;
}
