
export type UserRole = 'Admin' | 'ProjectManager' | 'TeamMember';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  lastX: number;
  lastY: number;
  role: UserRole;
}
