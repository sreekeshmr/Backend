import express from 'express';
import bodyParser from 'body-parser';
import { UserController } from './controllers/user.controller';
import { EventController } from './controllers/event.controller';
import { NotificationController } from './controllers/notification.controller';

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// User routes
app.post('/users', UserController.registerUser);
app.get('/users/:userId', UserController.getUser);
app.put('/users/:userId/preferences', UserController.updatePreferences);

// Event routes
app.post('/events', EventController.createEvent);
app.get('/events', EventController.getEvents);

// Notification routes
app.get('/users/:userId/notifications', NotificationController.getUserNotifications);
app.post('/users/:userId/notifications/bulk', NotificationController.sendBulkNotifications);

export default app;
