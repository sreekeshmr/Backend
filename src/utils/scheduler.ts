import { NotificationService } from '../services/notification.service';
import cron from 'node-cron';

export function setupScheduler(): void {
  // Run every day at 11:59 PM to send pending low priority notifications
  cron.schedule('59 23 * * *', async () => {
    console.log('Running daily notification batch job');
    await NotificationService.sendPendingLowPriorityNotifications();
  });
}