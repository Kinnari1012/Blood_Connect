import { z } from 'zod';

export const createDonorProfileSchema = z.object({
  dateOfBirth: z.string().refine(d => !isNaN(Date.parse(d)), 'Invalid date'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  bloodGroup: z.enum(['A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'AB_POS', 'AB_NEG', 'O_POS', 'O_NEG']),
  availability: z.boolean().default(true),
  lastDonationDate: z.string().optional().nullable(),
  preferredContact: z.enum(['CALL', 'WHATSAPP', 'IN_APP']).default('IN_APP'),
  state: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  area: z.string().max(100).optional(),
  pincode: z.string().max(10).optional(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
});

export const updateAvailabilitySchema = z.object({
  availability: z.boolean(),
});

export const searchDonorsSchema = z.object({
  bloodGroup: z.enum(['A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'AB_POS', 'AB_NEG', 'O_POS', 'O_NEG']).optional(),
  city: z.string().optional(),
  area: z.string().optional(),
  availability: z.boolean().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
});

export type CreateDonorProfileDto = z.infer<typeof createDonorProfileSchema>;
