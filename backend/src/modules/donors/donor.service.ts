import { DonorProfile, IDonorProfile } from '../../models/DonorProfile';
import { User } from '../../models/User';
import { AppError } from '../../middleware/errorHandler';
import { CreateDonorProfileDto } from './donor.dto';
import { MatchingService } from '../../services/matching.service';
import { config } from '../../config/env';

export class DonorService {
  static async createProfile(userId: string, dto: CreateDonorProfileDto) {
    const existing = await DonorProfile.findOne({ userId });
    if (existing) throw new AppError('Donor profile already exists', 409, 'PROFILE_EXISTS');

    await User.updateOne({ _id: userId }, { role: 'USER' });

    let nextEligibleDate: Date | undefined;
    const lastDonationDate = dto.lastDonationDate ? new Date(dto.lastDonationDate) : undefined;
    if (lastDonationDate) {
      nextEligibleDate = MatchingService.calculateNextEligibleDate(lastDonationDate, config.eligibilityGapDays);
    }

    return DonorProfile.create({
      userId,
      dateOfBirth: new Date(dto.dateOfBirth),
      gender: dto.gender,
      bloodGroup: dto.bloodGroup,
      availability: dto.availability ?? true,
      lastDonationDate,
      nextEligibleDate,
      preferredContact: dto.preferredContact ?? 'IN_APP',
      state: dto.state,
      city: dto.city,
      area: dto.area,
      pincode: dto.pincode,
      latitude: dto.latitude ?? undefined,
      longitude: dto.longitude ?? undefined,
    });
  }

  static async getMyProfile(userId: string) {
    const profile = await DonorProfile.findOne({ userId }).populate(
      'userId',
      'firstName lastName email phone'
    );
    if (!profile) throw new AppError('Donor profile not found', 404, 'NOT_FOUND');
    return profile;
  }

  static async updateProfile(userId: string, dto: Partial<CreateDonorProfileDto>) {
    const update: any = { ...dto };
    if (dto.lastDonationDate !== undefined) {
      const lastDate = dto.lastDonationDate ? new Date(dto.lastDonationDate) : null;
      update.lastDonationDate = lastDate;
      update.nextEligibleDate = lastDate
        ? MatchingService.calculateNextEligibleDate(lastDate, config.eligibilityGapDays)
        : null;
    }
    return DonorProfile.findOneAndUpdate({ userId }, update, { new: true });
  }

  static async updateAvailability(userId: string, availability: boolean) {
    const updated = await DonorProfile.findOneAndUpdate(
      { userId },
      { availability },
      { new: true, select: 'availability updatedAt' }
    );
    await User.updateOne(
      { _id: userId },
      { availability: availability ? 'AVAILABLE' : 'UNAVAILABLE' }
    );
    return updated;
  }

  static async searchDonors(query: {
    bloodGroup?: string;
    city?: string;
    area?: string;
    availability?: boolean;
    page: number;
    limit: number;
  }) {
    const filter: any = {};
    if (query.bloodGroup) filter.bloodGroup = query.bloodGroup;
    if (query.city) filter.city = { $regex: query.city, $options: 'i' };
    if (query.area) filter.area = { $regex: query.area, $options: 'i' };
    if (query.availability !== undefined) filter.availability = query.availability;

    const skip = (query.page - 1) * query.limit;
    const [donors, total] = await Promise.all([
      DonorProfile.find(filter)
        .populate({
          path: 'userId',
          match: { status: 'ACTIVE', deletedAt: null },
          select: 'id firstName lastName phone email',
        })
        .skip(skip)
        .limit(query.limit)
        .sort({ availability: -1, totalDonations: -1 })
        .select('-latitude -longitude -pincode -state')
        .lean(),
      DonorProfile.countDocuments(filter),
    ]);

    // Filter out donors whose user didn't match (inactive/deleted) and format user field
    const formatted = donors
      .filter((d: any) => d.userId != null)
      .map((d: any) => {
        const u = d.userId;
        return {
          ...d,
          id: d._id.toString(),
          user: {
            id: u._id?.toString() || u.id,
            firstName: u.firstName,
            lastName: u.lastName,
            fullName: `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Verified Donor',
            phone: u.phone,
            email: u.email,
          },
        };
      });

    return { donors: formatted, total };
  }

  static async getPublicProfile(donorId: string) {
    const profile = await DonorProfile.findById(donorId)
      .populate({
        path: 'userId',
        match: { status: 'ACTIVE', deletedAt: null },
        select: 'id firstName lastName phone email',
      })
      .select('-latitude -longitude -pincode -state')
      .lean();

    if (!profile || !(profile as any).userId) {
      throw new AppError('Donor not found', 404, 'NOT_FOUND');
    }

    const u = (profile as any).userId;
    return {
      ...profile,
      id: profile._id.toString(),
      user: {
        id: u._id?.toString() || u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        fullName: `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Verified Donor',
        phone: u.phone,
        email: u.email,
      },
    };
  }
}
