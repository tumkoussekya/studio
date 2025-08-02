
import { NextRequest, NextResponse } from 'next/server';
import { getCookie } from 'cookies-next';
import { verify } from 'jsonwebtoken';
import { userStore } from '@/lib/userStore';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

export async function POST(req: NextRequest) {
    const token = getCookie('token', { req });
    if (!token) {
        return NextResponse.json({ errorMessage: 'User not authenticated.' }, { status: 401 });
    }

    let decoded: { userId: string; email: string };
    try {
        decoded = verify(token, JWT_SECRET) as { userId: string; email: string };
    } catch (e) {
        return NextResponse.json({ errorMessage: 'Invalid auth token.' }, { status: 401 });
    }

    const { x, y } = await req.json();
    if (typeof x !== 'number' || typeof y !== 'number') {
        return NextResponse.json({ errorMessage: 'Invalid position data.' }, { status: 400 });
    }

    try {
        userStore.updateUserPosition(decoded.email, x, y);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to update position:', error);
        return NextResponse.json({ errorMessage: 'Failed to update position.' }, { status: 500 });
    }
}
