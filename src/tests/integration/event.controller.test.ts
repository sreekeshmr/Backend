import request from 'supertest';
import app from '../../app';
import { User } from '../../models/user.model';
import { Notification } from '../../models/notification.model';
import { Event } from '../../models/event.model';
import { setupTestDB, teardownTestDB, clearDatabase } from '../test-utils';

describe('EventController', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  describe('POST /events', () => {
    it('should create a high priority event and send notifications', async () => {
      // Create user with preferences
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        notificationPreferences: [
          { eventType: 'task_created', methods: ['email'] }
        ]
      });

      const response = await request(app)
        .post('/events')
        .send({
          type: 'task_created',
          priority: 'high',
          title: 'Urgent Task',
          description: 'This is urgent'
        })
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.priority).toBe('high');

      // Verify notification was created
      const notifications = await Notification.find({ userId: user._id });
      expect(notifications).toHaveLength(1);
      expect(notifications[0].title).toBe('Urgent Task');
    });

    it('should batch low priority notifications', async () => {
      // Create user with preferences
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        notificationPreferences: [
          { eventType: 'task_created', methods: ['email'] }
        ]
      });

      const response = await request(app)
        .post('/events')
        .send({
          type: 'task_created',
          priority: 'low',
          title: 'Regular Task',
          description: 'This can wait'
        })
        .expect(201);

      expect(response.body.priority).toBe('low');

      // Verify notification was created but not sent yet
      const notifications = await Notification.find({ userId: user._id });
      expect(notifications).toHaveLength(1);
      expect(notifications[0].sentAt).toBeUndefined();
    });

    it('should return 400 for invalid priority', async () => {
      await request(app)
        .post('/events')
        .send({
          type: 'task_created',
          priority: 'invalid',
          title: 'Test Task',
          description: 'Test Description'
        })
        .expect(400);
    });
  });

// src/tests/integration/event.controller.test.ts
describe('GET /events', () => {
  it('should retrieve all events in creation order', async () => {
    // Create test events with explicit timestamps
    await Event.create([
      {
        type: 'task_created',
        priority: 'high',
        data: { title: 'Task 1', description: 'First task' },
        createdAt: new Date('2023-01-01')
      },
      {
        type: 'task_deleted',
        priority: 'low',
        data: { title: 'Task 2', description: 'Second task' },
        createdAt: new Date('2023-01-02')
      }
    ]);

    const response = await request(app)
      .get('/events')
      .expect(200);

    expect(response.body).toHaveLength(2);
    expect(response.body[0].data.title).toBe('Task 1'); // Oldest first
    expect(response.body[1].data.title).toBe('Task 2'); // Newest last
  });
});
});