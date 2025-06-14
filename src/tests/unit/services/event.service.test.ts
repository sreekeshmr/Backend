// Correct relative path (go up two levels to reach src)
import { EventService,EventPriority } from '../../../services/event.service';
import { User } from '../../../models/user.model';
import { setupTestDB, teardownTestDB, clearDatabase } from '../../test-utils';

describe('EventService', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  describe('createEvent', () => {
    it('should create a new event', async () => {
      const event = await EventService.createEvent(
        'task_created',
        EventPriority.HIGH,
        'Test Task',
        'Test Description'
      );
      
      expect(event).toHaveProperty('_id');
      expect(event.type).toBe('task_created');
      expect(event.priority).toBe(EventPriority.HIGH);
    });
  });

  describe('processEvent', () => {
    it('should send notifications for high priority events', async () => {
      // Setup user with preferences
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        notificationPreferences: [
          { eventType: 'task_created', methods: ['email'] }
        ]
      });

      const event = await EventService.createEvent(
        'task_created',
        EventPriority.HIGH,
        'Test Task',
        'Test Description'
      );

      await EventService.processEvent(event);

      // Verify notifications were created
      // (You would need to implement this check based on your notification model)
    });
  });
});