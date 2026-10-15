import { Donation } from '../../models/Donation';
import { User } from '../../models/User';
import { DonorProfile } from '../../models/DonorProfile';
import { AuditService, AUDIT_ACTIONS } from '../../services/audit.service';
import { AppError } from '../../middleware/errorHandler';

export class DonationService {
  static async getAllDonations(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  } = {}) {
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 50;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (params.status && params.status !== 'all') {
      filter.status = { $regex: new RegExp(`^${params.status}$`, 'i') };
    }

    const [donations, total] = await Promise.all([
      Donation.find(filter)
        .sort({ donationDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('donorId', 'firstName lastName email phone bloodGroup city')
        .populate('requestId', 'patientName hospital unitsRequired bloodGroup')
        .lean(),
      Donation.countDocuments(filter),
    ]);

    let formatted = donations.map((d: any) => {
      const donorUser = d.donorId;
      const donorName = donorUser ? `${donorUser.firstName || ''} ${donorUser.lastName || ''}`.trim() : 'Anonymous Donor';
      const bg = donorUser?.bloodGroup || d.requestId?.bloodGroup || 'O+';
      const formattedDate = d.donationDate
        ? new Date(d.donationDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
        : 'Recently';

      return {
        id: `DON-${d._id.toString().slice(-4).toUpperCase()}`,
        _id: d._id.toString(),
        donor: donorName,
        donorPhone: donorUser?.phone,
        donorEmail: donorUser?.email,
        bg: bg.replace('_POS', '+').replace('_NEG', '-'),
        date: formattedDate,
        rawDate: d.donationDate,
        location: d.hospital || 'Hospital Blood Bank',
        hospital: d.hospital,
        units: d.units || 1,
        status: d.status || 'Donation Completed',
        bloodComponent: d.bloodComponent || 'Whole Blood',
        notes: d.notes,
      };
    });

    if (params.search) {
      const s = params.search.toLowerCase();
      formatted = formatted.filter(
        (f) =>
          f.donor.toLowerCase().includes(s) ||
          f.id.toLowerCase().includes(s) ||
          f.location.toLowerCase().includes(s)
      );
    }

    return { donations: formatted, total: formatted.length };
  }

  static async getMyDonations(userId: string) {
    const donations = await Donation.find({ donorId: userId })
      .sort({ donationDate: -1 })
      .populate('requestId', 'patientName hospital unitsRequired bloodGroup')
      .lean();

    return donations.map((d: any) => ({
      id: `DON-${d._id.toString().slice(-4).toUpperCase()}`,
      _id: d._id.toString(),
      date: d.donationDate ? new Date(d.donationDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : '',
      location: d.hospital,
      units: d.units,
      bloodComponent: d.bloodComponent,
      status: d.status,
      notes: d.notes,
    }));
  }

  static async createDonation(data: {
    donor?: string;
    donorId?: string;
    requestId?: string;
    bloodGroup?: string;
    date?: string;
    donationDate?: string;
    location?: string;
    hospital?: string;
    units?: number;
    bloodComponent?: string;
    notes?: string;
    status?: string;
  }, authUserId: string) {
    let resolvedDonorId = data.donorId || authUserId;

    // If a donor name was entered manually by an admin, check if user exists or use current user
    if (data.donor && !data.donorId) {
      const parts = data.donor.trim().split(' ');
      const user = await User.findOne({
        $or: [
          { firstName: { $regex: new RegExp(`^${parts[0]}$`, 'i') } },
          { email: { $regex: new RegExp(`^${data.donor}$`, 'i') } }
        ]
      });
      if (user) {
        resolvedDonorId = user._id.toString();
      }
    }

    const dDate = data.donationDate ? new Date(data.donationDate) : data.date ? new Date(data.date) : new Date();

    const statusVal: 'Scheduled' | 'Donation Completed' | 'Cancelled' =
      (data.status as any) === 'Scheduled' || (data.status as any) === 'Cancelled'
        ? (data.status as any)
        : 'Donation Completed';

    const donation: any = await Donation.create({
      donorId: resolvedDonorId as any,
      requestId: (data.requestId as any) || undefined,
      donationDate: isNaN(dDate.getTime()) ? new Date() : dDate,
      status: statusVal,
      units: Number(data.units) || 1,
      bloodComponent: data.bloodComponent || 'Whole Blood',
      hospital: data.hospital || data.location || 'LifeLink Blood Center',
      notes: data.notes || (data.donor ? `Donor: ${data.donor}` : undefined),
    });

    // Update donor profile stats if donor exists
    await DonorProfile.findOneAndUpdate(
      { userId: resolvedDonorId },
      {
        $inc: { totalDonations: 1 },
        lastDonationDate: dDate,
      }
    );

    await AuditService.log({
      action: AUDIT_ACTIONS.DONOR_PROFILE_UPDATED,
      performedById: authUserId,
      targetResource: 'donation',
      targetId: donation._id.toString(),
      details: { units: donation.units, hospital: donation.hospital },
    });

    return donation;
  }
}
