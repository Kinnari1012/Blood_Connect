import { DonorProfile, BloodGroup } from '../models/DonorProfile';
import { DonorResponse } from '../models/DonorResponse';
import { SystemConfig } from '../models/SystemConfig';
import { BLOOD_COMPATIBILITY } from '../types';
import { config } from '../config/env';
import { NotificationService } from './notification.service';

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export interface MatchRequest {
  id: string;
  bloodGroup: BloodGroup;
  hospitalCity?: string | null;
  hospitalLatitude?: number | null;
  hospitalLongitude?: number | null;
}

export class MatchingService {
  static async findAndNotifyDonors(request: MatchRequest): Promise<string[]> {
    const compatibleGroups = BLOOD_COMPATIBILITY[request.bloodGroup] as BloodGroup[];
    const today = new Date();

    let eligibilityGapDays = config.eligibilityGapDays;
    try {
      const cfgRow = await SystemConfig.findOne({ key: 'ELIGIBILITY_GAP_DAYS' });
      if (cfgRow) eligibilityGapDays = parseInt(cfgRow.value, 10);
    } catch { /* use default */ }

    const maxNotify = config.maxDonorNotifyCount;

    // Find eligible donors
    const donors = await DonorProfile.find({
      bloodGroup: { $in: compatibleGroups },
      availability: true,
      $or: [
        { nextEligibleDate: { $exists: false } },
        { nextEligibleDate: null },
        { nextEligibleDate: { $lte: today } },
      ],
    }).populate('userId', 'status deletedAt').lean();

    // Filter active users only
    const activeDonors = donors.filter((d: any) => {
      const u = d.userId as any;
      return u && u.status === 'ACTIVE' && !u.deletedAt;
    });

    // Score donors
    const scored = activeDonors
      .map((donor: any) => {
        let score = 0;
        if (request.hospitalCity && donor.city?.toLowerCase() === request.hospitalCity.toLowerCase()) score += 50;
        if (
          request.hospitalLatitude != null && request.hospitalLongitude != null &&
          donor.latitude != null && donor.longitude != null
        ) {
          const dist = haversineKm(donor.latitude, donor.longitude, request.hospitalLatitude, request.hospitalLongitude);
          if (dist <= 10) score += 20;
          else if (dist <= 25) score += 10;
        }
        if (donor.bloodGroup === request.bloodGroup) score += 10;
        return { donor, score };
      })
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, maxNotify);

    if (scored.length === 0) return [];

    const donorUserIds = scored.map((s: any) => s.donor.userId._id?.toString() || s.donor.userId.toString());

    // Create donor response records (skip duplicates)
    for (const userId of donorUserIds) {
      await DonorResponse.updateOne(
        { requestId: request.id, donorId: userId },
        { $setOnInsert: { requestId: request.id, donorId: userId, status: 'NOTIFIED' } },
        { upsert: true }
      );
    }

    const bg = request.bloodGroup.replace('_', '').replace('POS', '+').replace('NEG', '-');
    await NotificationService.sendToMany(donorUserIds, {
      type: 'New Blood Request',
      title: 'Blood Donation Request',
      description: `A patient needs ${bg} blood. Your help could save a life.`,
      relatedRequestId: request.id,
    });

    return donorUserIds;
  }

  static calculateNextEligibleDate(lastDonationDate: Date, gapDays: number): Date {
    const next = new Date(lastDonationDate);
    next.setDate(next.getDate() + gapDays);
    return next;
  }
}
