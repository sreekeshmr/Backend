import { Request, Response } from 'express';
import { NotificationService } from '../services/notification.service';

export class NotificationController {
  static async getUserNotifications(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { eventType, priority, startDate, endDate } = req.query;

      // Create a more type-safe filters object
      const filters = {
        eventType: typeof eventType === 'string' ? eventType : undefined,
        priority: typeof priority === 'string' ? priority : undefined,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined
      };

      const notifications = await NotificationService.getUserNotifications(
        userId,
        filters
      );
      res.json(notifications);
    } catch (error) {
      // Proper error handling
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ message: errorMessage });
    }
  }

  static async sendBulkNotifications(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { notifications } = req.body;

      if (!Array.isArray(notifications)) {
        res.status(400).json({ message: 'Notifications must be an array' });
        return;
      }

      const createdNotifications = await NotificationService.sendBulkNotifications(
        userId,
        notifications
      );
      res.status(201).json(createdNotifications);
    } catch (error) {
      // Proper error handling
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ message: errorMessage });
    }
  }
}