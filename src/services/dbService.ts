import Dexie from 'dexie';
import type { User } from '../types';

export class UserDatabase extends Dexie {
  users!: Dexie.Table<User, string>;

  constructor() {
    super('UserDatabase');
    this.version(1).stores({
      users: '++id, name.first, name.last, email'
    });
  }
}

export const db = new UserDatabase();

export class UserService {
  static async getAllUsers(): Promise<User[]> {
    return await db.users.toArray();
  }

  static async addUser(user: User): Promise<void> {
    await db.users.add(user);
  }

  static async addUsers(users: User[]): Promise<void> {
    await db.users.bulkAdd(users);
  }

  static async deleteUser(userId: string): Promise<void> {
    await db.users.delete(userId);
  }

  static async clearAllUsers(): Promise<void> {
    await db.users.clear();
  }

  static async getUserCount(): Promise<number> {
    return await db.users.count();
  }
}
