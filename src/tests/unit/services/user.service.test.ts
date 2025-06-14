import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user.model';
import { setupTestDB, teardownTestDB, clearDatabase } from '../../../tests/test-utils';
import mongoose from 'mongoose';

describe('UserService', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const user = await UserService.createUser('Test User', 'test@example.com', '+123456789');
      expect(user).toHaveProperty('_id');
      expect(user.name).toBe('Test User');
      expect(user.email).toBe('test@example.com');
    });

    it('should throw error for duplicate email', async () => {
      await UserService.createUser('Test User', 'test@example.com');
      await expect(UserService.createUser('Test User 2', 'test@example.com'))
        .rejects.toThrow();
    });
  });

  describe('updateNotificationPreferences', () => {
    it('should update user preferences', async () => {
      // Create a user first
      const user = await UserService.createUser('Test User', 'test@example.com');
      
      const preferences = [
        { eventType: 'task_created', methods: ['email', 'sms'] },
        { eventType: 'task_deleted', methods: ['in-app'] }
      ];
      
      // Use the created user's _id
      const updatedUser = await UserService.updateNotificationPreferences(
        user._id.toString(), // Use the instance's _id, not the model
        preferences
      );
      
      expect(updatedUser?.notificationPreferences).toHaveLength(2);
      expect(updatedUser?.notificationPreferences[0].eventType).toBe('task_created');
    });
  });
});