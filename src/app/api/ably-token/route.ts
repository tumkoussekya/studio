
import { NextRequest, NextResponse } from 'next/server';
import * as Ably from 'ably';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

const ABLY_API_KEY = process.env.ABLY_API_KEY;

export async function POST(req: NextRequest) {
    if (!ABLY_API_KEY) {
        return NextResponse.json({
            errorMessage: 'Missing ABLY_API_KEY environment variable.'
        }, { status: 500 });
    }
    
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
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
             // Use a wildcard to allow access to all channels.
             // This is necessary for dynamic channels like DMs and private zones.
             "*": ["subscribe", "publish", "presence"],
        }
    });

    return NextResponse.json(tokenRequestData);
}
