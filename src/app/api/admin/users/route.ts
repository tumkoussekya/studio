
import { NextResponse } from 'next/server';
import { userStore } from '@/lib/userStore';

export async function GET() {
  // Note: The middleware should have already handled authentication
  // and role-based access control for this endpoint.
  try {
    const users = userStore.getUsers();
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
