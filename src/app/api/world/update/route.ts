
import { NextRequest, NextResponse } from 'next/server';
import { getCookie } from 'cookies-next';
import { verify } from 'jsonwebtoken';
import * as Ably from 'ably';

const ABLY_API_KEY = process.env.ABLY_API_KEY;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

// This endpoint is no longer strictly necessary for broadcasting,
// but can be kept for server-side validation or other future uses.
// For now, we simplify and publish directly from the client via the ChatService.
export async function POST(req: NextRequest) {
    if (!ABLY_API_KEY) {
        return NextResponse.json({ errorMessage: 'Missing ABLY_API_KEY environment variable.' }, { status: 500 });
    }

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
        const ably = new Ably.Rest({ key: ABLY_API_KEY });
        const channel = ably.channels.get('pixel-space');
        
        await channel.publish('player-update', {
            x,
            y,
            email: decoded.email,
            clientId: decoded.userId,
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Ably publish error:', error);
        return NextResponse.json({ errorMessage: 'Failed to broadcast position.' }, { status: 500 });
    }
}
