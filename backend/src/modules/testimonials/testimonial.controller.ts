import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { TestimonialService } from './testimonial.service';

const createTestimonialSchema = z.object({
  authorName: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.string().optional().default('Verified Lifesaver'),
  city: z.string().min(2, 'City is required'),
  bloodGroup: z.string().min(1, 'Blood group is required'),
  content: z.string().min(10, 'Story must be at least 10 characters'),
  rating: z.coerce.number().min(1).max(5).default(5),
});

export class TestimonialController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const testimonials = await TestimonialService.getAll(true);
      res.json({ success: true, data: testimonials });
    } catch (err) {
      next(err);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createTestimonialSchema.parse(req.body);
      const userId = (req as any).user?.id;
      const testimonial = await TestimonialService.create(validated, userId);
      res.status(201).json({
        success: true,
        data: testimonial,
        message: 'Your hero story has been submitted successfully! Thank you for inspiring our community.',
      });
    } catch (err) {
      next(err);
    }
  }

  static async approve(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { isApproved } = req.body;
      const updated = await TestimonialService.approve(id as string, isApproved);
      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }
}
