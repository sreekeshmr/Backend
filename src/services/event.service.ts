import { Event, IEvent, EventPriority } from '../models/event.model';
import { User } from '../models/user.model';
import { Notification } from '../models/notification.model';
import { sendEmail, sendSMS, sendInAppNotification } from '../utils/logger';

export class EventService {
  static async createEvent(
    type: string,
    priority: EventPriority,
    title: string,
    description: string
  ): Promise<IEvent> {
    const event = new Event({
      type,
      priority,
      data: { title, description }
    });
    return event.save();
  }

  static async processEvent(event: IEvent): Promise<void> {
    const users = await User.find({
      'notificationPreferences.eventType': event.type
    }).exec();

    for (const user of users) {
      const preferences = user.notificationPreferences.find(
        pref => pref.eventType === event.type
      );

      if (preferences) {
        // Check if notification already exists for this user and event
        const existingNotification = await Notification.findOne({
          userId: user._id,
          eventId: event._id
        }).exec();

        if (!existingNotification) {
          const notification = new Notification({
            userId: user._id,
            eventId: event._id,
            eventType: event.type,
            title: event.data.title,
            description: event.data.description,
            methods: preferences.methods,
            sentAt: event.priority === EventPriority.HIGH ? new Date() : undefined
          });

          await notification.save();

          if (event.priority === EventPriority.HIGH) {
            await this.sendImmediateNotifications(notification, preferences.methods);
          }
        }
      }
    }
  }

  private static async sendImmediateNotifications(
    notification: any,
    methods: string[]
  ): Promise<void> {
    for (const method of methods) {
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

// src/services/event.service.ts
static async getEvents(): Promise<IEvent[]> {
  return Event.find().sort({ createdAt: 1 }).exec(); // Ascending order (oldest first)
}
}

export { EventPriority };
