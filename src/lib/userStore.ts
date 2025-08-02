// NOTE: This is a simple in-memory store for demonstration purposes.
// In a real application, you would use a database.
import { User } from '@/models/User';

const users: User[] = [
  {
    id: 'default-user-1',
    email: 'user@example.com',
    // Pre-hashed password for "password"
    passwordHash: '$2a$10$V8.v4bH/wR4Fv.K5f.gS9.7Yj7.F1q.Y1q.N3.N3.L1gS9.N3.S9O',
    lastX: 200,
    lastY: 200,
    role: 'Admin'
  },
  {
    id: 'default-user-2',
    email: 'manager@example.com',
    passwordHash: '$2a$10$V8.v4bH/wR4Fv.K5f.gS9.7Yj7.F1q.Y1q.N3.N3.L1gS9.N3.S9O',
    lastX: 250,
    lastY: 250,
    role: 'ProjectManager'
  },
    {
    id: 'default-user-3',
    email: 'member@example.com',
    passwordHash: '$2a$10$V8.v4bH/wR4Fv.K5f.gS9.7Yj7.F1q.Y1q.N3.N3.L1gS9.N3.S9O',
    lastX: 150,
    lastY: 150,
    role: 'TeamMember'
  }
];

export const userStore = {
  addUser: (user: User): User | null => {
    const existingUser = users.find((u) => u.email === user.email);
    if (existingUser) {
      return null; // User already exists
    }
    // New users get TeamMember role by default
    const userWithRole = { ...user, role: 'TeamMember' as const };
    users.push(userWithRole);
    console.log('Current users:', users);
    return userWithRole;
  },
  findByEmail: (email: string): User | undefined => {
    return users.find((user) => user.email === email);
  },
  updateUserPosition: (email: string, x: number, y: number): void => {
    const user = users.find((u) => u.email === email);
    if (user) {
      user.lastX = x;
      user.lastY = y;
      console.log(`Updated position for ${email}:`, {x, y});
    }
  },
  getUsers: (): Omit<User, 'passwordHash'>[] => {
    return users.map(({ passwordHash, ...user }) => user);
  }
};
