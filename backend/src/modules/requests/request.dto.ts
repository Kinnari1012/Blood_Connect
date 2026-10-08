import { z } from 'zod';

export const createRequestSchema = z.object({
  patientName: z.string().min(2).max(255),
  bloodGroup: z.string(),
  unitsRequired: z.number().int().min(1).max(20),
  hospital: z.string().min(2).max(255),
  location: z.string().min(2).max(255),
  requiredDate: z.string().refine(d => !isNaN(Date.parse(d)), 'Invalid date'),
  requiredTime: z.string(),
  urgency: z.enum(['Normal', 'Urgent', 'Critical']).default('Normal'),
  contactName: z.string(),
  contactPhone: z.string(),
});

export const updateRequestStatusSchema = z.object({
  status: z.enum(['Searching Donors', 'Donor Found', 'Partially Fulfilled', 'Fulfilled', 'Cancelled']),
});

export type CreateRequestDto = z.infer<typeof createRequestSchema>;
