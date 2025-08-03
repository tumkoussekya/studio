export type UserRole = 'Admin' | 'TeamMember';

export interface User {
  id: string;
  email: string;
  lastX: number;
  lastY: number;
  role: UserRole;
}
