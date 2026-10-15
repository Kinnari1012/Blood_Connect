export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'DONOR' | 'SEEKER' | 'USER';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING' | 'DISABLED';

export type BloodGroup = 'A_POS' | 'A_NEG' | 'B_POS' | 'B_NEG' | 'AB_POS' | 'AB_NEG' | 'O_POS' | 'O_NEG';
export type BloodGroupDisplay = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type UrgencyLevel = 'Normal' | 'Urgent' | 'Critical';
export type RequestStatus = 
  | 'Pending Verification' 
  | 'Searching Donors' 
  | 'Donor Found' 
  | 'Partially Fulfilled' 
  | 'Fulfilled' 
  | 'Cancelled' 
  | 'Rejected';

export type ContactPreference = 'CALL' | 'WHATSAPP' | 'IN_APP';

export interface User {
  id: string;
  _id?: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  email: string;
  phone: string;
  mobile?: string;
  role: UserRole;
  status: UserStatus;
  bloodGroup?: string;
  dateOfBirth?: string;
  age?: number;
  weight?: number;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  location?: string;
  availability?: string | boolean;
  totalDonations?: number;
  lastDonationDate?: string;
  nextEligibleDate?: string;
  createdAt?: string;
  donorProfile?: DonorProfileSummary;
}

export interface DonorProfileSummary {
  bloodGroup: BloodGroup | string;
  availability: boolean;
  city?: string;
  area?: string;
  state?: string;
  pincode?: string;
  lastDonationDate?: string;
  nextEligibleDate?: string;
  totalDonations: number;
}

export interface DonorProfile extends DonorProfileSummary {
  id: string;
  _id?: string;
  userId: string;
  dateOfBirth: string;
  gender: Gender;
  preferredContact: ContactPreference;
  state?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    fullName?: string;
    phone: string;
    email: string;
  };
}

export interface BloodRequest {
  id: string;
  _id?: string;
  requestId: string;
  patientName: string;
  bloodGroup: string;
  unitsRequired: number;
  hospital: string;
  location: string;
  street?: string;
  city?: string;
  state?: string;
  pincode?: string;
  requiredDate: string;
  requiredTime: string;
  urgency: UrgencyLevel;
  status: RequestStatus;
  contactName: string;
  contactPhone: string;
  createdBy?: string | { id: string; firstName?: string; lastName?: string; fullName?: string };
  rejectionReason?: string;
  createdAt: string;
  donorResponses?: DonorResponse[];
  myResponseStatus?: string | null;
}

export interface DonorResponse {
  id: string;
  _id?: string;
  requestId: string;
  donorId: string | User;
  response: 'INTERESTED' | 'NOT_AVAILABLE';
  matchScore?: number;
  matchReason?: string;
  status: 'PENDING' | 'NOTIFIED' | 'ACCEPTED' | 'DECLINED' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  _id?: string;
  userId: string;
  type: string;
  title: string;
  body?: string;
  description?: string;
  read?: boolean;
  isRead?: boolean;
  relatedRequestId?: string;
  data?: Record<string, any>;
  createdAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
