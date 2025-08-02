
// NOTE: This is a simple in-memory store for demonstration purposes.
// In a real application, you would use a database.
import { User } from '@/models/User';

const users: User[] = [];

export const userStore = {
  addUser: (user: User): User | null => {
    const existingUser = users.find((u) => u.email === user.email);
    if (existingUser) {
      return null; // User already exists
    }
    users.push(user);
    console.log('Current users:', users);
    return user;
  },
  findByEmail: (email: string): User | undefined => {
    return users.find((user) => user.email === email);
  },
  updateUserPosition: (email: string, x: number, y: number): void => {
    const user = users.find((u) => u.email === user.email);
    if (user) {
      user.lastX = x;
      user.lastY = y;
      console.log(`Updated position for ${email}:`, {x, y});
    }
  }
};
