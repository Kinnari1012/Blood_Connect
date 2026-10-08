import { BloodRequest, IBloodRequest } from '../../models/BloodRequest';
import { DonorResponse } from '../../models/DonorResponse';
import { DonorProfile } from '../../models/DonorProfile';
import { AppError } from '../../middleware/errorHandler';
import { CreateRequestDto } from './request.dto';
import { MatchingService } from '../../services/matching.service';
import { AuditService, AUDIT_ACTIONS } from '../../services/audit.service';
import { NotificationService } from '../../services/notification.service';
import { Types } from 'mongoose';

export class RequestService {
  static async createRequest(createdBy: string, dto: CreateRequestDto) {
    const requestId = 'REQ-' + Date.now();
    const request: IBloodRequest = await BloodRequest.create({
      requestId,
      createdBy,
      patientName: dto.patientName,
      bloodGroup: dto.bloodGroup,
      unitsRequired: dto.unitsRequired,
      hospital: dto.hospital,
      location: dto.location,
      requiredDate: new Date(dto.requiredDate),
      requiredTime: dto.requiredTime,
      urgency: dto.urgency || 'Normal',
      contactName: dto.contactName,
      contactPhone: dto.contactPhone,
      status: 'Pending Verification',
    });

    // Matching is now deferred until an admin approves the request.

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

  static async getRequestById(id: string, _userId: string) {
    const request = await BloodRequest.findById(id)
      .populate('createdBy', 'firstName lastName phone')
      .lean();
    if (!request) throw new AppError('Request not found', 404, 'NOT_FOUND');

    const donorResponses = await DonorResponse.find({ requestId: id })
      .populate('donorId', 'firstName lastName')
      .lean();

    return { ...request, donorResponses };
  }

  static async cancelRequest(id: string, createdBy: string) {
    const request = await BloodRequest.findById(id);
    if (!request) throw new AppError('Request not found', 404, 'NOT_FOUND');
    if (request.createdBy.toString() !== createdBy) throw new AppError('Not authorized', 403, 'FORBIDDEN');
    if (['Fulfilled', 'Cancelled'].includes(request.status)) throw new AppError('Request cannot be cancelled', 400, 'INVALID_STATUS');
    return BloodRequest.findByIdAndUpdate(id, { status: 'Cancelled' }, { new: true });
  }

  static async respondToRequest(requestId: string, donorId: string, action: 'ACCEPTED' | 'DECLINED') {
    const response = await DonorResponse.findOne({ requestId, donorId });
    if (!response) throw new AppError('No matching request found', 404, 'NOT_FOUND');

    const mappedAction = action === 'ACCEPTED' ? 'APPROVED' : 'REJECTED';
    await DonorResponse.updateOne(
      { _id: response._id },
      { status: mappedAction }
    );

    const request = await BloodRequest.findById(requestId);
    if (action === 'ACCEPTED' && request) {
      await BloodRequest.updateOne({ _id: requestId }, { status: 'Donor Found' });
      await NotificationService.send({
        userId: request.createdBy.toString(),
        type: 'Donor Approved',
        title: 'Donor Found!',
        description: 'A donor has accepted your blood request.',
        relatedRequestId: requestId,
      });
    } else if (action === 'DECLINED' && request) {
      await NotificationService.send({
        userId: request.createdBy.toString(),
        type: 'Donor Response',
        title: 'Donor Unavailable',
        description: 'A donor has declined your request. We are looking for other donors.',
        relatedRequestId: requestId,
      });
    }
    return { success: true };
  }

  static async completeRequest(requestId: string, donorId: string) {
    const response = await DonorResponse.findOne({ requestId, donorId });
    if (!response) throw new AppError('No matching request found', 404, 'NOT_FOUND');
    if (response.status !== 'APPROVED') throw new AppError('Request not in accepted state', 400, 'INVALID_STATUS');

    await BloodRequest.updateOne({ _id: requestId }, { status: 'Fulfilled' });

    await DonorProfile.findOneAndUpdate(
      { userId: donorId },
      {
        $inc: { totalDonations: 1 },
        lastDonationDate: new Date(),
        nextEligibleDate: MatchingService.calculateNextEligibleDate(new Date(), 90),
      }
    );

    const request = await BloodRequest.findById(requestId);
    if (request) {
      await NotificationService.send({
        userId: request.createdBy.toString(),
        type: 'Request Fulfilled',
        title: 'Request Completed',
        description: 'Your blood request has been fulfilled. Thank you!',
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
      details: { action: 'APPROVED' }
    });

    await NotificationService.send({
      userId: response.donorId.toString(),
      type: 'Donor Approved',
      title: 'Donation Approved',
      description: 'Your offer to donate blood has been approved by the admin. We will contact you shortly with further details.',
      relatedRequestId: requestId,
    });

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
      details: { action: 'APPROVED' }
    });

    // Trigger donor matching
    MatchingService.findAndNotifyDonors({
      id: request._id.toString(),
      bloodGroup: request.bloodGroup as any,
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
      details: { action: 'REJECTED', reason }
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
}
