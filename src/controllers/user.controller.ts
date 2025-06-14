import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { NotificationPreference } from '../models/user.model';

export class UserController {
  static async registerUser(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, phone } = req.body;
      
      // Basic input validation
      if (!name || !email) {
        res.status(400).json({ message: 'Name and email are required' });
        return;
      }

      const user = await UserService.createUser(name, email, phone);
      res.status(201).json(user);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      res.status(500).json({ message: errorMessage });
    }
  }

  static async updatePreferences(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { preferences } = req.body as {
        preferences: NotificationPreference[];
      };

      // Validate preferences format
      if (!Array.isArray(preferences)) {
        res.status(400).json({ message: 'Preferences must be an array' });
        return;
      }

      const updatedUser = await UserService.updateNotificationPreferences(
        userId,
        preferences
      );

      if (!updatedUser) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      res.json(updatedUser);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update preferences';
      res.status(500).json({ message: errorMessage });
    }
  }

  static async getUser(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      
      // Basic ID validation
      if (!userId) {
        res.status(400).json({ message: 'User ID is required' });
        return;
      }

      const user = await UserService.getUserById(userId);

      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      res.json(user);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user';
      res.status(500).json({ message: errorMessage });
    }
  }
}