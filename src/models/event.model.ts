import mongoose, { Document, Schema,Types } from 'mongoose';

export enum EventPriority {
  HIGH = 'high',
  LOW = 'low'
}

export interface IEvent extends Document {
   _id: Types.ObjectId;
  type: string;
  priority: EventPriority;
  data: {
    title: string;
    description: string;
  };
  createdAt: Date;
}

const EventSchema = new Schema({
  type: { type: String, required: true },
  priority: { type: String, enum: Object.values(EventPriority), required: true },
  data: {
    title: { type: String, required: true },
    description: { type: String, required: true }
  },
  createdAt: { type: Date, default: Date.now }
});

export const Event = mongoose.model<IEvent>('Event', EventSchema);