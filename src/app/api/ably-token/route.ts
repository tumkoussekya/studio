
import { NextRequest, NextResponse } from 'next/server';
import * as Ably from 'ably';
import { createClient } from '@/lib/supabase/server';

const ABLY_API_KEY = process.env.ABLY_API_KEY;

export async function POST(req: NextRequest) {
    if (!ABLY_API_KEY) {
        return NextResponse.json({
            errorMessage: 'Missing ABLY_API_KEY environment variable.'
        }, { status: 500 });
    }
    
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
         return NextResponse.json({ errorMessage: 'User not authenticated.' }, { status: 401 });
    }
    
    const user = session.user;
    const clientId = user.id;

    const client = new Ably.Rest(ABLY_API_KEY);
    const tokenRequestData = await client.auth.createTokenRequest({
        clientId: clientId,
        capability: {
             "pixel-space": ["subscribe", "publish", "presence"]
        }
    });

    return NextResponse.json(tokenRequestData);
}
