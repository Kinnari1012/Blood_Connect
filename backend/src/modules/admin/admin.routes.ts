import { Router, Request, Response, NextFunction } from 'express';
import { verifyToken } from '../../middleware/verifyToken';
import { requireRole, requirePermission } from '../../middleware/requireRole';
import { User } from '../../models/User';
import { DonorProfile } from '../../models/DonorProfile';
import { AuditService, AUDIT_ACTIONS } from '../../services/audit.service';
import { AppError } from '../../middleware/errorHandler';
import bcrypt from 'bcryptjs';
import { config } from '../../config/env';
import { z } from 'zod';

const router = Router();
router.use(verifyToken);
router.use(requireRole('ADMIN', 'SUPER_ADMIN'));

const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  role: z.enum(['USER', 'ADMIN', 'SUPER_ADMIN']).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING']).optional(),
});

const updateUserStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'DISABLED']),
  reason: z.string().optional(),
});

const createAdminSchema = z.object({
  firstName: z.string().min(2).max(255),
  lastName: z.string().min(2).max(255),
  email: z.string().email(),
  phone: z.string().regex(/^\+?[0-9]{10,15}$/),
  password: z.string().min(8),
});

const createUserSchema = z.object({
  firstName: z.string().min(2).max(255),
  lastName: z.string().min(2).max(255),
  email: z.string().email(),
  phone: z.string().regex(/^\+?[0-9]{10,15}$/),
  password: z.string().min(8),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
  dateOfBirth: z.string(),
  age: z.coerce.number(),
  weight: z.coerce.number(),
  address: z.string().optional(),
  city: z.string(),
  state: z.string().optional(),
  country: z.string().optional(),
  location: z.string().optional(),
  availability: z.boolean().default(true),
  status: z.enum(['ACTIVE', 'DISABLED']).default('ACTIVE'),
});

// List all users
router.get('/users', requirePermission('MANAGE_DONORS'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit, search, role, status } = paginationSchema.parse(req.query);
      const skip = (page - 1) * limit;

      const filter: any = { deletedAt: null };
      if (search) {
        filter.$or = [
          { fullName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { mobile: { $regex: search, $options: 'i' } },
        ];
      }
      if (role) filter.role = role;
      if (status) filter.status = status;

      const [users, total] = await Promise.all([
        User.find(filter)
          .select('-passwordHash')
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 })
          .lean(),
        User.countDocuments(filter),
      ]);

      // Attach donor profiles
      const userIds = users.map((u: any) => u._id);
      const donorProfiles = await DonorProfile.find({ userId: { $in: userIds } })
        .select('userId bloodGroup city availability')
        .lean();
      const profileMap = new Map(donorProfiles.map((p: any) => [p.userId.toString(), p]));

      const enriched = users.map((u: any) => ({
        ...u,
        id: u._id.toString(),
        donorProfile: profileMap.get(u._id.toString()) || null,
      }));

      res.json({ success: true, data: enriched, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
    } catch (err) { next(err); }
  }
);

// Get user by id
router.get('/users/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findOne({ _id: req.params.id as string, deletedAt: null })
      .select('-passwordHash').lean();
    if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');
    const donorProfile = await DonorProfile.findOne({ userId: user._id }).lean();
    res.json({ success: true, data: { ...user, id: (user._id as any).toString(), donorProfile } });
  } catch (err) { next(err); }
});

// Update user status
router.put('/users/:id/status', requirePermission('SUSPEND_USERS'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status, reason } = updateUserStatusSchema.parse(req.body);
      const userId = req.params.id as string;
      const target = await User.findById(userId);
      if (!target) throw new AppError('User not found', 404, 'NOT_FOUND');
      if (target.role === 'SUPER_ADMIN') throw new AppError('Cannot modify Super Admin accounts', 403, 'FORBIDDEN');

      await User.updateOne({ _id: userId }, { status });

      const action = status === 'DISABLED' ? AUDIT_ACTIONS.USER_DEACTIVATED : AUDIT_ACTIONS.USER_ACTIVATED;

      await AuditService.log({
        action, performedById: req.user!.id,
        targetUserId: userId,
        details: { reason, newStatus: status },
        ipAddress: req.ip,
      });

      res.json({ success: true, message: `User status updated to ${status}` });
    } catch (err) { next(err); }
  }
);

// Create user
router.post('/users', requireRole('ADMIN', 'SUPER_ADMIN'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = createUserSchema.parse(req.body);
      const existing = await User.findOne({ $or: [{ email: dto.email }, { phone: dto.phone }] });
      if (existing) throw new AppError('Email or phone already in use', 409, 'DUPLICATE');

      const passwordHash = await bcrypt.hash(dto.password, config.bcryptRounds);
      const user = await User.create({
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone,
        passwordHash,
        bloodGroup: dto.bloodGroup,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
        age: dto.age,
        weight: dto.weight,
        address: dto.address,
        city: dto.city,
        state: dto.state,
        country: dto.country,
        location: dto.location,
        availability: dto.availability ? 'true' : 'false',
        role: 'USER', // FORCE USER ROLE
        status: dto.status,
      });

      // We skip DonorProfile creation here because it requires fields not present in the admin UI like 'gender',
      // and blood group enums differ. The user can complete their donor profile later.

      await AuditService.log({
        action: AUDIT_ACTIONS.USER_CREATED,
        performedById: req.user!.id,
        targetUserId: user._id.toString(),
        ipAddress: req.ip,
      });

      res.status(201).json({
        success: true,
        data: { id: user._id.toString(), firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role, status: user.status },
        message: 'User account created',
      });
    } catch (err) { next(err); }
  }
);

// --- Admin management (Super Admin only) ---

// List admins
router.get('/admins', requireRole('SUPER_ADMIN'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const admins = await User.find({ role: { $in: ['ADMIN', 'SUPER_ADMIN'] }, deletedAt: null })
        .select('-passwordHash')
        .sort({ createdAt: -1 })
        .lean();
      res.json({ success: true, data: admins.map((a: any) => ({ ...a, id: a._id.toString() })) });
    } catch (err) { next(err); }
  }
);

// Create admin
router.post('/admins', requireRole('SUPER_ADMIN'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = createAdminSchema.parse(req.body);
      const existing = await User.findOne({ $or: [{ email: dto.email }, { phone: dto.phone }] });
      if (existing) throw new AppError('Email or phone already in use', 409, 'DUPLICATE');

      const passwordHash = await bcrypt.hash(dto.password, config.bcryptRounds);
      const admin = await User.create({
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone,
        passwordHash,
        role: 'ADMIN',
        status: 'ACTIVE',
      });

      await AuditService.log({
        action: AUDIT_ACTIONS.ADMIN_ACCOUNT_CREATED,
        performedById: req.user!.id,
        targetUserId: admin._id.toString(),
        ipAddress: req.ip,
      });

      res.status(201).json({
        success: true,
        data: { id: admin._id.toString(), firstName: admin.firstName, lastName: admin.lastName, email: admin.email, role: admin.role, status: admin.status },
        message: 'Admin account created',
      });
    } catch (err) { next(err); }
  }
);

// Admin status
router.put('/admins/:id/status', requireRole('SUPER_ADMIN'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status } = z.object({ status: z.enum(['ACTIVE', 'DISABLED']) }).parse(req.body);
      const adminId = req.params.id as string;
      const admin = await User.findById(adminId);
      if (!admin || admin.role !== 'ADMIN') throw new AppError('Admin not found', 404, 'NOT_FOUND');

      await User.updateOne({ _id: adminId }, { status });

      await AuditService.log({
        action: status === 'DISABLED' ? AUDIT_ACTIONS.ADMIN_ACCOUNT_DISABLED : AUDIT_ACTIONS.USER_ACTIVATED,
        performedById: req.user!.id,
        targetUserId: adminId,
        ipAddress: req.ip,
      });

      res.json({ success: true, message: `Admin account ${status === 'ACTIVE' ? 'activated' : 'deactivated'}` });
    } catch (err) { next(err); }
  }
);

export default router;
