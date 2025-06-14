import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  eventType: string;
  title: string;
  description: string;
  methods: string[];
  isRead: boolean;
  createdAt: Date;
  sentAt: Date;
}

const NotificationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
  eventType: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  methods: { type: [String], required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  sentAt: { type: Date }
});

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);