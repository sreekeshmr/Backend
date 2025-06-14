import { User, IUser, NotificationPreference } from '../models/user.model';

export class UserService {
  static async createUser(name: string, email: string, phone?: string): Promise<IUser> {
    // Check for existing user first
    const existingUser = await User.findOne({ email }).exec();
    if (existingUser) {
      throw new Error('Email already exists');
    }

    const user = new User({ name, email, phone });
    return user.save();
  }

  static async getUserById(id: string): Promise<IUser | null> {
    return User.findById(id).exec();
  }

  static async getUserByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email }).exec();
  }

  static async updateNotificationPreferences(
    userId: string,
    preferences: NotificationPreference[]
  ): Promise<IUser | null> {
    return User.findByIdAndUpdate(
      userId,
      { notificationPreferences: preferences },
      { new: true }
    ).exec();
  }
}