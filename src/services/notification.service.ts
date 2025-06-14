import { Notification, INotification } from '../models/notification.model';
import { User } from '../models/user.model';
import { Event } from '../models/event.model';
import { sendEmail, sendSMS, sendInAppNotification } from '../utils/logger';
import mongoose from 'mongoose';

export class NotificationService {
  static async getUserNotifications(
    userId: string,
    filters: {
      eventType?: string;
      priority?: string;
      startDate?: Date;
      endDate?: Date;
    } = {}
  ): Promise<INotification[]> {
    const query: any = { userId };

    if (filters.eventType) {
      query.eventType = filters.eventType;
    }

    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) query.createdAt.$gte = filters.startDate;
      if (filters.endDate) query.createdAt.$lte = filters.endDate;
    }

    return Notification.find(query)
      .sort({ createdAt: -1 })
      .populate('eventId')
      .exec();
  }

  static async sendBulkNotifications(
    userId: string,
    notifications: Array<{
      eventType: string;
      eventId: mongoose.Types.ObjectId | string;
      title: string;
      description: string;
      methods: string[];
    }>
  ): Promise<INotification[]> {
    const user = await User.findById(userId).exec();
    if (!user) throw new Error('User not found');

    const createdNotifications = [];

    for (const notif of notifications) {
      if (!notif.eventId) {
        throw new Error('eventId is required for each notification');
      }

      // Convert string eventId to ObjectId if needed
      const eventId = typeof notif.eventId === 'string' 
        ? new mongoose.Types.ObjectId(notif.eventId)
        : notif.eventId;

      const preference = user.notificationPreferences.find(
        pref => pref.eventType === notif.eventType
      );

      if (preference) {
        const allowedMethods = notif.methods.filter(method =>
          preference.methods.includes(method)
        );

        if (allowedMethods.length > 0) {
          const notification = new Notification({
            userId: user._id,
            eventId, // Now properly formatted
            eventType: notif.eventType,
            title: notif.title,
            description: notif.description,
            methods: allowedMethods,
            sentAt: new Date()
          });

          await notification.save();
          createdNotifications.push(notification);

          for (const method of allowedMethods) {
            switch (method) {
              case 'email':
                sendEmail(notification);
                break;
              case 'sms':
                sendSMS(notification);
                break;
              case 'in-app':
                sendInAppNotification(notification);
                break;
            }
          }
        }
      }
    }

    return createdNotifications;
  }

  static async sendPendingLowPriorityNotifications(): Promise<void> {
    const pendingNotifications = await Notification.find({
      sentAt: { $exists: false }
    }).exec();

    for (const notification of pendingNotifications) {
      notification.sentAt = new Date();
      await notification.save();

      for (const method of notification.methods) {
        switch (method) {
          case 'email':
            sendEmail(notification);
            break;
          case 'sms':
            sendSMS(notification);
            break;
          case 'in-app':
            sendInAppNotification(notification);
            break;
        }
      }
    }
  }
}