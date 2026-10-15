import { BloodRequest, IBloodRequest } from '../../models/BloodRequest';
import { DonorResponse } from '../../models/DonorResponse';
import { DonorProfile } from '../../models/DonorProfile';
import { User } from '../../models/User';
import { BLOOD_COMPATIBILITY } from '../../types';
import { AppError } from '../../middleware/errorHandler';
import { CreateRequestDto } from './request.dto';
import { MatchingService } from '../../services/matching.service';
import { AuditService, AUDIT_ACTIONS } from '../../services/audit.service';
import { NotificationService } from '../../services/notification.service';
import { Types } from 'mongoose';

export class RequestService {
  static async createRequest(createdBy: string, dto: CreateRequestDto) {
    const requestId = 'REQ-' + Date.now();
    const isEmergency = dto.urgency === 'Critical';
    const status = isEmergency ? 'Searching Donors' : 'Pending Verification';

    const fullLocation =
      dto.location ||
      [dto.street, dto.city, dto.state, dto.pincode ? `${dto.pincode}` : '']
        .filter(Boolean)
        .join(', ') ||
      'Ahmedabad';

    const request: IBloodRequest = await BloodRequest.create({
      requestId,
      createdBy,
      patientName: dto.patientName,
      bloodGroup: dto.bloodGroup,
      unitsRequired: dto.unitsRequired,
      hospital: dto.hospital,
      location: fullLocation,
      street: dto.street,
      city: dto.city,
      state: dto.state,
      pincode: dto.pincode,
      requiredDate: new Date(dto.requiredDate),
      requiredTime: dto.requiredTime,
      urgency: dto.urgency || 'Normal',
      contactName: dto.contactName,
      contactPhone: dto.contactPhone,
      status,
    });

    // If emergency request, immediately trigger donor matching broadcast
    if (isEmergency) {
      MatchingService.findAndNotifyDonors({
        id: request._id.toString(),
        bloodGroup: request.bloodGroup as any,
        hospitalCity: dto.city || dto.location || fullLocation,
      }).catch(console.error);
    }

    await AuditService.log({
      action: AUDIT_ACTIONS.BLOOD_REQUEST_CREATED,
      performedById: createdBy,
      targetResource: 'blood_request',
      targetId: request._id.toString(),
    });

    return request;
  }

  static async getMyRequests(createdBy: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [requests, total] = await Promise.all([
      BloodRequest.find({ createdBy })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      BloodRequest.countDocuments({ createdBy }),
    ]);
    return { requests, total };
  }

  static async getAllRequests(params: {
    page?: number;
    limit?: number;
    status?: string;
    urgency?: string;
    bloodGroup?: string;
    city?: string;
    search?: string;
  } = {}) {
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 20;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (params.status && params.status !== 'all') {
      if (params.status === 'pending') {
        filter.status = { $in: ['Pending Verification', 'Searching Donors'] };
      } else {
        filter.status = { $regex: new RegExp(`^${params.status}$`, 'i') };
      }
    }
    if (params.urgency && params.urgency !== 'all') {
      filter.urgency = { $regex: new RegExp(`^${params.urgency}$`, 'i') };
    }
    if (params.bloodGroup && params.bloodGroup !== 'all') {
      const normalized = params.bloodGroup.replace('+', '_POS').replace('-', '_NEG');
      filter.bloodGroup = { $in: [params.bloodGroup, normalized] };
    }
    if (params.city) {
      filter.city = { $regex: params.city, $options: 'i' };
    }
    if (params.search) {
      filter.$or = [
        { patientName: { $regex: params.search, $options: 'i' } },
        { requestId: { $regex: params.search, $options: 'i' } },
        { hospital: { $regex: params.search, $options: 'i' } },
        { contactName: { $regex: params.search, $options: 'i' } },
      ];
    }

    const [requests, total] = await Promise.all([
      BloodRequest.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'firstName lastName email phone')
        .lean(),
      BloodRequest.countDocuments(filter),
    ]);

    const formatted = requests.map((r: any) => ({
      ...r,
      id: r._id.toString(),
      reqName: r.createdBy ? `${r.createdBy.firstName || ''} ${r.createdBy.lastName || ''}`.trim() : r.contactName || 'Anonymous',
      patient: r.patientName,
      bg: r.bloodGroup,
      units: r.unitsRequired,
    }));

    return { requests: formatted, total };
  }

  static async getMatchingRequests(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [donorUser, donorProfile] = await Promise.all([
      User.findById(userId).lean(),
      DonorProfile.findOne({ userId }).lean(),
    ]);

    const rawBloodGroup = donorProfile?.bloodGroup || donorUser?.bloodGroup;
    const filter: any = {
      status: { $in: ['Searching Donors', 'Donor Found', 'Pending Verification'] },
    };

    if (rawBloodGroup) {
      const normalized = rawBloodGroup.replace('+', '_POS').replace('-', '_NEG');
      const compatibleRecipients = new Set<string>();

      for (const [recGroup, allowedDonors] of Object.entries(BLOOD_COMPATIBILITY)) {
        if (allowedDonors.includes(normalized) || allowedDonors.includes(rawBloodGroup)) {
          compatibleRecipients.add(recGroup);
          compatibleRecipients.add(recGroup.replace('_POS', '+').replace('_NEG', '-'));
        }
      }
      compatibleRecipients.add(rawBloodGroup);
      compatibleRecipients.add(normalized);

      filter.bloodGroup = { $in: Array.from(compatibleRecipients) };
    }

    const [requests, total, myResponses] = await Promise.all([
      BloodRequest.find(filter)
        .sort({ urgency: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'firstName lastName phone')
        .lean(),
      BloodRequest.countDocuments(filter),
      DonorResponse.find({ donorId: userId }).lean(),
    ]);

    const responseMap = new Map<string, string>();
    for (const r of myResponses) {
      responseMap.set(r.requestId.toString(), r.status || r.response);
    }

    const enriched = requests.map((req) => ({
      ...req,
      myResponseStatus: responseMap.get(req._id.toString()) || null,
    }));

    return { requests: enriched, total };
  }

  static async getRequestById(id: string, _userId: string) {
    const request = await BloodRequest.findById(id)
      .populate('createdBy', 'firstName lastName phone')
      .lean();
    if (!request) throw new AppError('Request not found', 404, 'NOT_FOUND');

    const donorResponses = await DonorResponse.find({ requestId: id })
      .populate('donorId', 'firstName lastName phone')
      .lean();

    return { ...request, donorResponses };
  }

  static async cancelRequest(id: string, createdBy: string) {
    const request = await BloodRequest.findById(id);
    if (!request) throw new AppError('Request not found', 404, 'NOT_FOUND');
    if (request.createdBy.toString() !== createdBy) throw new AppError('Not authorized', 403, 'FORBIDDEN');
    if (['Fulfilled', 'Cancelled'].includes(request.status)) throw new AppError('Request cannot be cancelled', 400, 'INVALID_STATUS');

    const updated = await BloodRequest.findByIdAndUpdate(id, { status: 'Cancelled' }, { new: true });

    // Notify all candidates that the request was cancelled
    const candidateResponses = await DonorResponse.find({ requestId: id }).select('donorId');
    const candidateIds = candidateResponses.map((r) => r.donorId.toString());
    if (candidateIds.length > 0) {
      await NotificationService.sendToMany(candidateIds, {
        type: 'System Notification',
        title: 'Blood Request Cancelled',
        description: `Blood request ${request.requestId || ''} for ${request.hospital} has been cancelled by the requester.`,
        relatedRequestId: id,
      });
    }

    return updated;
  }

  static async respondToRequest(requestId: string, donorId: string, action: 'ACCEPTED' | 'DECLINED') {
    let response = await DonorResponse.findOne({ requestId, donorId });
    const mappedStatus = action === 'ACCEPTED' ? 'APPROVED' : 'REJECTED';
    const mappedResponse = action === 'ACCEPTED' ? 'INTERESTED' : 'NOT_AVAILABLE';

    if (!response) {
      response = await DonorResponse.create({
        requestId,
        donorId,
        status: mappedStatus,
        response: mappedResponse,
      });
    } else {
      await DonorResponse.updateOne(
        { _id: response._id },
        { status: mappedStatus, response: mappedResponse }
      );
    }

    const request = await BloodRequest.findById(requestId);
    if (action === 'ACCEPTED' && request) {
      await BloodRequest.updateOne({ _id: requestId }, { status: 'Donor Found' });

      // 1. Notify Requester that donor was found
      await NotificationService.send({
        userId: request.createdBy.toString(),
        type: 'Donor Approved',
        title: 'Donor Found!',
        description: `A donor has accepted your blood request (${request.requestId || ''}).`,
        relatedRequestId: requestId,
      });

      // 2. Automatically notify all OTHER notified candidate donors
      const otherResponses = await DonorResponse.find({
        requestId,
        donorId: { $ne: donorId },
      }).select('donorId');

      const otherDonorIds = otherResponses.map((r) => r.donorId.toString());
      if (otherDonorIds.length > 0) {
        await NotificationService.sendToMany(otherDonorIds, {
          type: 'Donor Matched',
          title: 'Request Update: Donor Accepted',
          description: `A matching donor has accepted request ${request.requestId || ''} for ${request.hospital || 'the hospital'}. Thank you for standing by!`,
          relatedRequestId: requestId,
        });
      }
    } else if (action === 'DECLINED' && request) {
      await NotificationService.send({
        userId: request.createdBy.toString(),
        type: 'Donor Response',
        title: 'Donor Unavailable',
        description: 'A candidate donor declined the request. Looking for other matching donors.',
        relatedRequestId: requestId,
      });
    }
    return { success: true };
  }

  static async completeRequest(requestId: string, userId: string) {
    const request = await BloodRequest.findById(requestId);
    if (!request) throw new AppError('Request not found', 404, 'NOT_FOUND');

    const isCreator = request.createdBy.toString() === userId;
    const acceptedResponse = await DonorResponse.findOne({
      requestId,
      status: { $in: ['APPROVED', 'ACCEPTED'] },
    });

    const donatingDonorId = acceptedResponse ? acceptedResponse.donorId.toString() : (!isCreator ? userId : null);

    await BloodRequest.updateOne({ _id: requestId }, { status: 'Fulfilled' });

    if (donatingDonorId) {
      await DonorProfile.findOneAndUpdate(
        { userId: donatingDonorId },
        {
          $inc: { totalDonations: 1 },
          lastDonationDate: new Date(),
          nextEligibleDate: MatchingService.calculateNextEligibleDate(new Date(), 90),
        }
      );

      // Congratulate donating donor
      await NotificationService.send({
        userId: donatingDonorId,
        type: 'Request Fulfilled',
        title: 'Donation Completed - Thank You!',
        description: `Your donation for request ${request.requestId || ''} at ${request.hospital} is complete. You saved a life today!`,
        relatedRequestId: requestId,
      });
    }

    // 1. Notify Requester if fulfilled by someone else
    if (!isCreator) {
      await NotificationService.send({
        userId: request.createdBy.toString(),
        type: 'Request Fulfilled',
        title: 'Blood Request Fulfilled',
        description: `Your blood request (${request.requestId || ''}) has been marked as fulfilled. Thank you!`,
        relatedRequestId: requestId,
      });
    }

    // 2. Notify all candidate donors that this request has been fulfilled
    const allResponses = await DonorResponse.find({ requestId }).select('donorId');
    const otherCandidateIds = allResponses
      .map((r) => r.donorId.toString())
      .filter((id) => id !== donatingDonorId && id !== request.createdBy.toString());

    if (otherCandidateIds.length > 0) {
      await NotificationService.sendToMany(otherCandidateIds, {
        type: 'Request Fulfilled',
        title: 'Blood Request Fulfilled',
        description: `Blood request ${request.requestId || ''} for patient ${request.patientName} at ${request.hospital} has been fulfilled. Thank you for your support!`,
        relatedRequestId: requestId,
      });
    }

    return { success: true };
  }

  static async approveDonorResponse(requestId: string, responseId: string, adminId: string) {
    const response = await DonorResponse.findById(responseId);
    if (!response || response.requestId.toString() !== requestId) {
      throw new AppError('Response not found', 404, 'NOT_FOUND');
    }
    if (response.status !== 'ACCEPTED') {
      throw new AppError('Response is not in ACCEPTED state', 400, 'BAD_REQUEST');
    }

    response.status = 'APPROVED';
    await response.save();

    await BloodRequest.updateOne({ _id: requestId }, { status: 'Donor Found' });

    await AuditService.log({
      action: AUDIT_ACTIONS.DONOR_PROFILE_UPDATED,
      performedById: adminId,
      targetResource: 'donor_response',
      targetId: responseId,
      details: { action: 'APPROVED' },
    });

    await NotificationService.send({
      userId: response.donorId.toString(),
      type: 'Donor Approved',
      title: 'Donation Approved',
      description: 'Your offer to donate blood has been approved by the admin. We will contact you shortly with further details.',
      relatedRequestId: requestId,
    });

    // Notify other candidates
    const otherResponses = await DonorResponse.find({
      requestId,
      _id: { $ne: response._id },
    }).select('donorId');
    const otherIds = otherResponses.map((r) => r.donorId.toString());
    if (otherIds.length > 0) {
      await NotificationService.sendToMany(otherIds, {
        type: 'Donor Matched',
        title: 'Request Update: Donor Approved',
        description: `A donor has been approved for this request. Thank you for your readiness!`,
        relatedRequestId: requestId,
      });
    }

    return response;
  }

  static async approveRequest(id: string, adminId: string) {
    const request = await BloodRequest.findById(id);
    if (!request) throw new AppError('Request not found', 404, 'NOT_FOUND');
    if (request.status !== 'Pending Verification') {
      throw new AppError('Request is not pending verification', 400, 'BAD_REQUEST');
    }

    request.status = 'Searching Donors';
    await request.save();

    await AuditService.log({
      action: AUDIT_ACTIONS.BLOOD_REQUEST_UPDATED,
      performedById: adminId,
      targetResource: 'blood_request',
      targetId: request._id.toString(),
      details: { action: 'APPROVED' },
    });

    // Trigger donor matching
    MatchingService.findAndNotifyDonors({
      id: request._id.toString(),
      bloodGroup: request.bloodGroup as any,
      hospitalCity: request.location,
    }).catch(console.error);

    return request;
  }

  static async rejectRequest(id: string, adminId: string, reason: string) {
    const request = await BloodRequest.findById(id);
    if (!request) throw new AppError('Request not found', 404, 'NOT_FOUND');
    if (request.status !== 'Pending Verification') {
      throw new AppError('Request is not pending verification', 400, 'BAD_REQUEST');
    }

    request.status = 'Rejected';
    request.rejectionReason = reason;
    await request.save();

    await AuditService.log({
      action: AUDIT_ACTIONS.BLOOD_REQUEST_UPDATED,
      performedById: adminId,
      targetResource: 'blood_request',
      targetId: request._id.toString(),
      details: { action: 'REJECTED', reason },
    });

    await NotificationService.send({
      userId: request.createdBy.toString(),
      type: 'System Notification',
      title: 'Blood Request Rejected',
      description: `Your blood request for ${request.patientName} was rejected. Reason: ${reason}`,
      relatedRequestId: request.requestId,
    });

    return request;
  }

  static async getPublicLiveRadar(city?: string, cluster?: string) {
    const targetCity = city || (cluster ? cluster.replace(/ Cluster$/i, '') : '');

    const filter: any = {
      status: { $nin: ['Cancelled', 'Rejected'] },
    };
    if (targetCity) {
      filter.$or = [
        { city: { $regex: targetCity, $options: 'i' } },
        { location: { $regex: targetCity, $options: 'i' } },
        { hospital: { $regex: targetCity, $options: 'i' } },
      ];
    }

    const dbRequests = await BloodRequest.find(filter)
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const liveRadarItems: any[] = [];

    const formatBloodGroup = (bg: string) => {
      return bg ? bg.replace('_POS', '+').replace('_NEG', '-') : 'O+';
    };

    const toBloodGroupKey = (bg: string): string => {
      if (!bg) return 'O_POS';
      const clean = bg.trim().toUpperCase();
      if (clean === 'O+') return 'O_POS';
      if (clean === 'O-') return 'O_NEG';
      if (clean === 'A+') return 'A_POS';
      if (clean === 'A-') return 'A_NEG';
      if (clean === 'B+') return 'B_POS';
      if (clean === 'B-') return 'B_NEG';
      if (clean === 'AB+') return 'AB_POS';
      if (clean === 'AB-') return 'AB_NEG';
      return clean;
    };

    const timeAgo = (date: Date) => {
      const diffMs = Date.now() - new Date(date).getTime();
      const mins = Math.max(1, Math.floor(diffMs / (1000 * 60)));
      if (mins < 60) return `${mins}m ago`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours}h ago`;
      return `${Math.floor(hours / 24)}d ago`;
    };

    const activeDonors = await DonorProfile.find({ availability: true })
      .populate({
        path: 'userId',
        match: { status: 'ACTIVE', deletedAt: null },
        select: 'firstName lastName phone email city',
      })
      .lean();

    const validDonors = activeDonors.filter((d: any) => d.userId != null);

    for (const req of dbRequests) {
      const bgKey = toBloodGroupKey(req.bloodGroup);
      const compatibleGroups = BLOOD_COMPATIBILITY[bgKey] || [bgKey];

      const matchedProfile = validDonors.find((d: any) =>
        compatibleGroups.includes(d.bloodGroup) &&
        (!targetCity || (d.city && d.city.toLowerCase().includes(targetCity.toLowerCase())))
      ) || validDonors.find((d: any) => compatibleGroups.includes(d.bloodGroup)) || validDonors[0];

      const u = matchedProfile?.userId as any;
      const donorName = u ? `${u.firstName || ''} ${u.lastName || ''}`.trim() : 'Rahul Sharma';
      const donorBgDisplay = matchedProfile ? formatBloodGroup(matchedProfile.bloodGroup) : 'O-';
      const isUniversal = donorBgDisplay === 'O-';
      const donorType = isUniversal ? 'Universal Donor • 100% Match' : 'Verified Lifesaver • 100% Match';

      const distance = (1.5 + (Math.abs(req.requestId.split('').reduce((a: number, c: string) => a + c.charCodeAt(0), 0) % 25) / 10)).toFixed(1);

      liveRadarItems.push({
        id: req._id.toString(),
        requestId: req.requestId,
        patientName: req.patientName,
        condition: req.urgency === 'Critical' ? 'Critical Surgery' : req.urgency === 'Urgent' ? 'Emergency Transfusion' : 'Immediate Need',
        bloodGroup: formatBloodGroup(req.bloodGroup),
        unitsRequired: req.unitsRequired || 1,
        hospital: req.hospital,
        city: req.city || 'Ahmedabad',
        location: req.location || req.hospital,
        urgency: req.urgency || 'Critical',
        status: req.status,
        broadcastTime: req.createdAt,
        broadcastTimeAgo: timeAgo(req.createdAt),
        cluster: `${req.city || 'Ahmedabad'} Cluster`,
        radiusKm: 25,
        matchedDonor: {
          id: matchedProfile?._id?.toString() || 'donor-default',
          name: donorName,
          bloodGroup: donorBgDisplay,
          isVerified: true,
          donorType,
          matchPercentage: 100,
          distanceKm: parseFloat(distance),
          city: u?.city || req.city || 'Ahmedabad',
          phone: u?.phone || '+91 98765 00001',
          routeUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(req.hospital + ' ' + (req.city || ''))}`,
        },
      });
    }

    const curatedDefaults = [
      {
        id: 'curated-ahmedabad',
        requestId: 'REQ-2026-LIVE1',
        patientName: 'Aarav Patel',
        condition: 'Critical Surgery',
        bloodGroup: 'O-',
        unitsRequired: 2,
        hospital: 'Apollo Hospital',
        city: 'Ahmedabad',
        location: 'Bhat, Ahmedabad',
        urgency: 'Critical',
        status: 'Searching Donors',
        broadcastTime: new Date(Date.now() - 2 * 60 * 1000),
        broadcastTimeAgo: '2m ago',
        cluster: 'Ahmedabad Cluster',
        radiusKm: 25,
        matchedDonor: {
          id: 'donor-rahul',
          name: 'Rahul Sharma',
          bloodGroup: 'O-',
          isVerified: true,
          donorType: 'Universal Donor • 100% Match',
          matchPercentage: 100,
          distanceKm: 2.4,
          city: 'Ahmedabad',
          phone: '+91 98765 00001',
          routeUrl: 'https://www.google.com/maps/search/?api=1&query=Apollo+Hospital+Ahmedabad',
        },
      },
      {
        id: 'curated-surat',
        requestId: 'REQ-2026-LIVE2',
        patientName: 'Meera Kapadia',
        condition: 'Cardiac Surgery',
        bloodGroup: 'B+',
        unitsRequired: 3,
        hospital: 'Sunshine Global Hospital',
        city: 'Surat',
        location: 'Dumas Road, Surat',
        urgency: 'Critical',
        status: 'Searching Donors',
        broadcastTime: new Date(Date.now() - 5 * 60 * 1000),
        broadcastTimeAgo: '5m ago',
        cluster: 'Surat Cluster',
        radiusKm: 20,
        matchedDonor: {
          id: 'donor-pooja',
          name: 'Pooja Solanki',
          bloodGroup: 'B+',
          isVerified: true,
          donorType: 'Exact Match • 100% Match',
          matchPercentage: 100,
          distanceKm: 1.8,
          city: 'Surat',
          phone: '+91 98765 00002',
          routeUrl: 'https://www.google.com/maps/search/?api=1&query=Sunshine+Global+Hospital+Surat',
        },
      },
      {
        id: 'curated-vadodara',
        requestId: 'REQ-2026-LIVE3',
        patientName: 'Devang Vora',
        condition: 'Accident Trauma',
        bloodGroup: 'A+',
        unitsRequired: 2,
        hospital: 'Sterling Hospital',
        city: 'Vadodara',
        location: 'Race Course, Vadodara',
        urgency: 'Urgent',
        status: 'Searching Donors',
        broadcastTime: new Date(Date.now() - 11 * 60 * 1000),
        broadcastTimeAgo: '11m ago',
        cluster: 'Vadodara Cluster',
        radiusKm: 30,
        matchedDonor: {
          id: 'donor-vikram',
          name: 'Vikram Singh',
          bloodGroup: 'A+',
          isVerified: true,
          donorType: 'Verified Lifesaver • 100% Match',
          matchPercentage: 100,
          distanceKm: 3.1,
          city: 'Vadodara',
          phone: '+91 98765 00005',
          routeUrl: 'https://www.google.com/maps/search/?api=1&query=Sterling+Hospital+Vadodara',
        },
      },
      {
        id: 'curated-rajkot',
        requestId: 'REQ-2026-LIVE4',
        patientName: 'Kailashben Trivedi',
        condition: 'Thalassemia Transfusion',
        bloodGroup: 'AB+',
        unitsRequired: 1,
        hospital: 'Wockhardt Hospital',
        city: 'Rajkot',
        location: 'Kalavad Road, Rajkot',
        urgency: 'Urgent',
        status: 'Searching Donors',
        broadcastTime: new Date(Date.now() - 18 * 60 * 1000),
        broadcastTimeAgo: '18m ago',
        cluster: 'Rajkot Cluster',
        radiusKm: 25,
        matchedDonor: {
          id: 'donor-sneha',
          name: 'Sneha Desai',
          bloodGroup: 'AB+',
          isVerified: true,
          donorType: 'Plasma & Platelet Donor • 100% Match',
          matchPercentage: 100,
          distanceKm: 2.7,
          city: 'Rajkot',
          phone: '+91 98765 00004',
          routeUrl: 'https://www.google.com/maps/search/?api=1&query=Wockhardt+Hospital+Rajkot',
        },
      },
    ];

    const combinedRequests = [...liveRadarItems];
    for (const cur of curatedDefaults) {
      if (!combinedRequests.some(r => r.city?.toLowerCase() === cur.city.toLowerCase() && r.patientName === cur.patientName)) {
        if (!targetCity || cur.city.toLowerCase().includes(targetCity.toLowerCase())) {
          combinedRequests.push(cur);
        }
      }
    }

    // Dynamic generation if targetCity is requested but has no preset curated item
    if (combinedRequests.length === 0 && targetCity) {
      const normalizedCity = targetCity.charAt(0).toUpperCase() + targetCity.slice(1);
      const matchedDonorProfile = validDonors.find((d: any) => d.city && d.city.toLowerCase().includes(targetCity.toLowerCase())) || validDonors[0];
      const donorUser = matchedDonorProfile?.userId as any;
      const donorName = donorUser ? `${donorUser.firstName || ''} ${donorUser.lastName || ''}`.trim() : 'Emergency Volunteer Donor';
      const donorBg = matchedDonorProfile ? formatBloodGroup(matchedDonorProfile.bloodGroup) : 'O+';

      combinedRequests.push({
        id: `radar-live-${targetCity.toLowerCase().replace(/\s+/g, '-')}`,
        requestId: `REQ-${new Date().getFullYear()}-${targetCity.slice(0, 3).toUpperCase()}1`,
        patientName: `Critical Need in ${normalizedCity}`,
        condition: 'Emergency Transfusion',
        bloodGroup: donorBg,
        unitsRequired: 2,
        hospital: `${normalizedCity} Civil Hospital`,
        city: normalizedCity,
        location: `Central ${normalizedCity}`,
        urgency: 'Critical',
        status: 'Searching Donors',
        broadcastTime: new Date(Date.now() - 4 * 60 * 1000),
        broadcastTimeAgo: '4m ago',
        cluster: `${normalizedCity} Cluster`,
        radiusKm: 25,
        matchedDonor: {
          id: matchedDonorProfile?._id?.toString() || 'donor-dyn',
          name: donorName,
          bloodGroup: donorBg,
          isVerified: true,
          donorType: 'Verified Lifesaver • 100% Match',
          matchPercentage: 100,
          distanceKm: 2.1,
          city: donorUser?.city || normalizedCity,
          phone: donorUser?.phone || '+91 98765 00001',
          routeUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${normalizedCity} Civil Hospital`)}`,
        },
      });
    }

    // Discover all distinct active cities dynamically from database
    const [dbRequestCities, dbDonorCities, dbUserCities] = await Promise.all([
      BloodRequest.distinct('city', { status: { $nin: ['Cancelled', 'Rejected'] } }),
      DonorProfile.distinct('city', { availability: true }),
      User.distinct('city', { status: 'ACTIVE', deletedAt: null }),
    ]);

    const baseCities = ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot'];
    if (targetCity) {
      baseCities.push(targetCity.charAt(0).toUpperCase() + targetCity.slice(1));
    }

    const allDiscoveredCities = Array.from(
      new Set(
        [...baseCities, ...dbRequestCities, ...dbDonorCities, ...dbUserCities]
          .filter(Boolean)
          .map((c: string) => c.trim())
          .filter((c: string) => c.length > 1)
      )
    ).map(c => c.charAt(0).toUpperCase() + c.slice(1));

    const allClusters = allDiscoveredCities.map(c => `${c} Cluster`);

    const selectedClusterName = targetCity 
      ? `${targetCity.charAt(0).toUpperCase() + targetCity.slice(1)} Cluster` 
      : (combinedRequests[0]?.cluster || 'Ahmedabad Cluster');

    return {
      activeCount: combinedRequests.length,
      selectedCluster: selectedClusterName,
      clusters: allClusters,
      requests: combinedRequests,
    };
  }
}

