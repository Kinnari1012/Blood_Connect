import { Request, Response, NextFunction } from 'express';
import { RequestService } from './request.service';
import { createRequestSchema, updateRequestStatusSchema } from './request.dto';
import { z } from 'zod';

const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
});

export class RequestController {
  static async createRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = createRequestSchema.parse(req.body);
      const request = await RequestService.createRequest(req.user!.id, dto);
      res.status(201).json({ success: true, data: request, message: 'Blood request created' });
    } catch (err) { next(err); }
  }

  static async getMyRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit } = paginationSchema.parse(req.query);
      const result = await RequestService.getMyRequests(req.user!.id, page, limit);
      const { requests, total } = result;
      res.json({ success: true, data: requests, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
    } catch (err) { next(err); }
  }

  static async getRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const request = await RequestService.getRequestById(req.params.id as string, req.user!.id);
      res.json({ success: true, data: request });
    } catch (err) { next(err); }
  }

  static async cancelRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const request = await RequestService.cancelRequest(req.params.id as string, req.user!.id);
      res.json({ success: true, data: request, message: 'Request cancelled' });
    } catch (err) { next(err); }
  }

  static async acceptRequest(req: Request, res: Response, next: NextFunction) {
    try {
      await RequestService.respondToRequest(req.params.requestId as string, req.user!.id, 'ACCEPTED');
      res.json({ success: true, message: 'Request accepted. The requester has been notified.' });
    } catch (err) { next(err); }
  }

  static async declineRequest(req: Request, res: Response, next: NextFunction) {
    try {
      await RequestService.respondToRequest(req.params.requestId as string, req.user!.id, 'DECLINED');
      res.json({ success: true, message: 'Request declined.' });
    } catch (err) { next(err); }
  }

  static async completeRequest(req: Request, res: Response, next: NextFunction) {
    try {
      await RequestService.completeRequest(req.params.requestId as string, req.user!.id);
      res.json({ success: true, message: 'Donation marked as complete. Thank you!' });
    } catch (err) { next(err); }
  }

  static async approveRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const request = await RequestService.approveRequest(req.params.id as string, req.user!.id);
      res.json({ success: true, message: 'Blood request approved and donor matching triggered.', data: request });
    } catch (err) { next(err); }
  }

  static async rejectRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const { reason } = z.object({ reason: z.string().min(10) }).parse(req.body);
      const request = await RequestService.rejectRequest(req.params.id as string, req.user!.id, reason);
      res.json({ success: true, message: 'Blood request rejected.', data: request });
    } catch (err) { next(err); }
  }
  static async approveDonorResponse(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await RequestService.approveDonorResponse(req.params.id as string, req.params.responseId as string, req.user!.id);
      res.json({ success: true, message: 'Donor response approved.', data: response });
    } catch (err) { next(err); }
  }
}
