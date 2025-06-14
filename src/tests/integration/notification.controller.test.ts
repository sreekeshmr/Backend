import request from 'supertest';
import app from '../../app';
import { User } from '../../models/user.model';
import { Notification } from '../../models/notification.model';
import { Event } from '../../models/event.model'; 
import { setupTestDB, teardownTestDB, clearDatabase } from '../test-utils';
import mongoose from 'mongoose';

describe('NotificationController', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  describe('GET /users/:userId/notifications', () => {
    it('should retrieve user notifications', async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com'
      });

      // Create test event first
      const event = await Event.create({
        type: 'task_created',
        priority: 'high',
        data: { title: 'Test Event', description: 'Test Description' }
      });

      // Create test notification with required eventId
      await Notification.create({
        userId: user._id,
        eventId: event._id,
        eventType: 'task_created',
        title: 'Test Notification',
        description: 'Test Description',
        methods: ['email'],
        sentAt: new Date()
      });

      const response = await request(app)
        .get(`/users/${user._id}/notifications`)
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].title).toBe('Test Notification');
    });
  });

  describe('POST /users/:userId/notifications/bulk', () => {
    it('should send bulk notifications', async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        notificationPreferences: [
          { eventType: 'task_created', methods: ['email'] }
        ]
      });

      // Create test event first
      const event = await Event.create({
        type: 'task_created',
        priority: 'high',
        data: { title: 'Bulk Event', description: 'For bulk notifications' }
      });

      const response = await request(app)
        .post(`/users/${user._id}/notifications/bulk`)
        .send({
          notifications: [
            {
              eventType: 'task_created',
              eventId: event._id.toString(), // Include eventId
              title: 'Bulk Test',
              description: 'Test',
              methods: ['email']
            }
          ]
        })
        .expect(201);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].title).toBe('Bulk Test');
    });
  });
});