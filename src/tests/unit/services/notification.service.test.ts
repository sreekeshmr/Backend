import { NotificationService } from '../../../services/notification.service';
import { User } from '../../../models/user.model';
import { Notification } from '../../../models/notification.model';
import { Event } from '../../../models/event.model';
import { setupTestDB, teardownTestDB, clearDatabase } from '../../../tests/test-utils';
import mongoose, { Types } from 'mongoose';

describe('NotificationService', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  describe('getUserNotifications', () => {
    it('should retrieve notifications for a user with filters', async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com'
      });

      const event = await Event.create({
        type: 'task_created',
        priority: 'high',
        data: { title: 'Test Task', description: 'Test Description' }
      });

      await Notification.create([
        {
          userId: user._id,
          eventId: event._id,
          eventType: 'task_created',
          title: 'Test Task 1',
          description: 'Description 1',
          methods: ['email'],
          sentAt: new Date()
        },
        {
          userId: user._id,
          eventId: new Types.ObjectId(),
          eventType: 'task_deleted',
          title: 'Test Task 2',
          description: 'Description 2',
          methods: ['sms'],
          sentAt: new Date()
        }
      ]);

      const notifications = await NotificationService.getUserNotifications(user._id.toString());
      expect(notifications).toHaveLength(2);

      const filtered = await NotificationService.getUserNotifications(user._id.toString(), {
        eventType: 'task_created'
      });
      expect(filtered).toHaveLength(1);
      expect(filtered[0].eventType).toBe('task_created');
    });
  });

  describe('sendBulkNotifications', () => {
    it('should send bulk notifications respecting user preferences', async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        notificationPreferences: [
          { eventType: 'task_created', methods: ['email', 'in-app'] },
          { eventType: 'task_deleted', methods: ['sms'] }
        ]
      });

      const event = await Event.create({
        type: 'task_created',
        priority: 'high',
        data: { title: 'Dummy Event', description: 'For testing' }
      });

      // Explicitly type and cast the event IDs
      const notifications = [
        {
          eventType: 'task_created',
          eventId: event._id as Types.ObjectId,
          title: 'Bulk Test 1',
          description: 'Test 1',
          methods: ['email', 'sms']
        },
        {
          eventType: 'task_deleted',
          eventId: new Types.ObjectId(),
          title: 'Bulk Test 2',
          description: 'Test 2',
          methods: ['sms']
        }
      ];

      const result = await NotificationService.sendBulkNotifications(
        user._id.toString(),
        notifications
      );

      expect(result).toHaveLength(2);
      expect(result[0].methods).toEqual(['email']);
      expect(result[1].methods).toEqual(['sms']);
    });
  });

  describe('sendPendingLowPriorityNotifications', () => {
    it('should send all pending low priority notifications', async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        notificationPreferences: [
          { eventType: 'task_created', methods: ['email'] }
        ]
      });

      const event = await Event.create({
        type: 'task_created',
        priority: 'low',
        data: { title: 'Test Task', description: 'Test Description' }
      });

      await Notification.create({
        userId: user._id,
        eventId: event._id,
        eventType: 'task_created',
        title: 'Pending Task',
        description: 'Pending Description',
        methods: ['email']
      });

      await NotificationService.sendPendingLowPriorityNotifications();

      const updatedNotification = await Notification.findOne({
        userId: user._id
      });
      expect(updatedNotification?.sentAt).toBeDefined();
    });
  });
});