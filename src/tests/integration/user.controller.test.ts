import request from 'supertest';
import app from '../../app';
import { User } from '../../models/user.model';
import { setupTestDB, teardownTestDB, clearDatabase } from '../test-utils';

describe('UserController', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  describe('POST /users', () => {
    it('should create a new user', async () => {
      const response = await request(app)
        .post('/users')
        .send({
          name: 'Test User',
          email: 'test@example.com'
        })
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.name).toBe('Test User');
    });

    it('should return 400 for missing name', async () => {
      await request(app)
        .post('/users')
        .send({
          email: 'test@example.com'
        })
        .expect(400);
    });
  });

  describe('PUT /users/:userId/preferences', () => {
    it('should update notification preferences', async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com'
      });

      const response = await request(app)
        .put(`/users/${user._id}/preferences`)
        .send({
          preferences: [
            { eventType: 'task_created', methods: ['email'] }
          ]
        })
        .expect(200);

      expect(response.body.notificationPreferences).toHaveLength(1);
    });
  });
});