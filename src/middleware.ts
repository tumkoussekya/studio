
import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  // Check for environment variables.
  // If they are missing, redirect to a setup page.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const ablyApiKey = process.env.ABLY_API_KEY;

  if (request.nextUrl.pathname !== '/setup' && (!supabaseUrl || !supabaseAnonKey || !ablyApiKey)) {
    const url = request.nextUrl.clone()
    url.pathname = '/setup'
    return NextResponse.redirect(url)
  }

  if (request.nextUrl.pathname.startsWith('/setup')) {
    return NextResponse.next();
  }


  // This will refresh the user's session cookie and handle redirection
  // if the user is not authenticated.
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - assets (static assets for phaser)
     * Feel free to add more paths here that should not be authenticated.
     */
    '/((?!_next/static|_next/image|favicon.ico|assets).*)',
  ],
}
