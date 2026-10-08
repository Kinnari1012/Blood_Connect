import { Notification } from '../models/Notification';

export type NotificationType = 'New Blood Request' | 'Emergency Request' | 'Donor Matched' | 'Donor Response' | 'Donor Approved' | 'Donation Reminder' | 'Request Fulfilled' | 'Profile Updated' | 'System Notification';

interface SendParams {
  userId: string;
  type: NotificationType;
  title: string;
  description: string;
  relatedRequestId?: string;
}

export class NotificationService {
  static async send(params: SendParams) {
    return Notification.create({
      userId: params.userId,
      type: params.type,
      title: params.title,
      description: params.description,
      relatedRequestId: params.relatedRequestId,
    });
  }

  static async sendToMany(userIds: string[], params: Omit<SendParams, 'userId'>) {
    const docs = userIds.map(userId => ({
      userId,
      type: params.type,
      title: params.title,
      description: params.description,
      relatedRequestId: params.relatedRequestId,
    }));
    return Notification.insertMany(docs);
  }

  static async markRead(notificationId: string, userId: string) {
    return Notification.updateOne({ _id: notificationId, userId }, { read: true });
  }

  static async markAllRead(userId: string) {
    return Notification.updateMany({ userId, read: false }, { read: true });
  }

  static async getForUser(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [notifications, total] = await Promise.all([
      Notification.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Notification.countDocuments({ userId }),
    ]);
    return { notifications, total };
  }
}
