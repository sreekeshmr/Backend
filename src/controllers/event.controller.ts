import { Request, Response } from 'express';
import { EventService } from '../services/event.service';
import { EventPriority } from '../models/event.model';

export class EventController {
  static async createEvent(req: Request, res: Response): Promise<void> {
    try {
      const { type, priority, title, description } = req.body;

      if (!Object.values(EventPriority).includes(priority)) {
        res.status(400).json({ message: 'Invalid priority value' });
        return;
      }

      const event = await EventService.createEvent(
        type,
        priority as EventPriority,
        title,
        description
      );

      // Process the event to trigger notifications
      await EventService.processEvent(event);

      res.status(201).json(event);
    } catch (error) {
      // Proper error typing
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'An unknown error occurred' });
      }
    }
  }

static async getEvents(req: Request, res: Response): Promise<void> {
  try {
    const events = await EventService.getEvents();
    res.status(200).json(events); // Explicit status code
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch events';
    console.error('[EventController] Error fetching events:', error);
    res.status(500).json({ 
      error: 'InternalServerError',
      message: errorMessage,
      timestamp: new Date().toISOString()
    });
  }
}
}