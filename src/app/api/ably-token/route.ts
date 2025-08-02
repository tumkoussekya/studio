
import { NextRequest, NextResponse } from 'next/server';
import * as Ably from 'ably';
import { getCookie } from 'cookies-next';
import { verify } from 'jsonwebtoken';

const ABLY_API_KEY = process.env.ABLY_API_KEY;

export async function POST(req: NextRequest) {
    if (!ABLY_API_KEY) {
        return NextResponse.json({
            errorMessage: 'Missing ABLY_API_KEY environment variable.'
        }, { status: 500 });
    }
    
    const token = getCookie('token', { req });
    let clientId: string;
    let userEmail: string;

    if (token) {
        try {
            const decoded = verify(token, process.env.JWT_SECRET || 'fallback-secret') as { userId: string, email: string };
            clientId = decoded.userId;
            userEmail = decoded.email;
        } catch (e) {
            console.error("Token verification failed in Ably endpoint", e);
            return NextResponse.json({ errorMessage: 'Invalid auth token.' }, { status: 401 });
        }
    } else {
        // For users who might not be logged in but can view
        clientId = 'anonymous-' + Math.random().toString(36).substr(2, 16);
        userEmail = 'anonymous';
    }


    const client = new Ably.Rest(ABLY_API_KEY);
    const tokenRequestData = await client.auth.createTokenRequest({
        clientId: clientId,
        // Add any capabilities you want to grant the user here
        // For example, allow them to publish and subscribe to their own channel
        capability: {
             "pixel-space": ["subscribe", "publish", "presence"]
        }
    });

    return NextResponse.json(tokenRequestData);
}
