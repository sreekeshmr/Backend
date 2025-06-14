import mongoose, { Document, Schema,Types  } from 'mongoose';

export interface NotificationPreference {
  eventType: string;
  methods: string[];
}

export interface IUser extends Document {
   _id: Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  notificationPreferences: NotificationPreference[];
}

const NotificationPreferenceSchema = new Schema({
  eventType: { type: String, required: true },
  methods: { type: [String], required: true }
});

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  notificationPreferences: { type: [NotificationPreferenceSchema], default: [] }
});

export const User = mongoose.model<IUser>('User', UserSchema);