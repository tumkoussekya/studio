
import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { userStore } from '@/lib/userStore';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    const existingUser = userStore.findByEmail(email);
    if (existingUser) {
      return NextResponse.json({ message: 'User already exists' }, { status: 409 });
    }

    const passwordHash = await hash(password, 10);
    const id = Date.now().toString(); // Simple ID generation

    userStore.addUser({ id, email, passwordHash });

    return NextResponse.json({ message: 'User created successfully' }, { status: 201 });
  } catch (error) {
    console.error('Signup Error:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
