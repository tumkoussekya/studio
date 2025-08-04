
import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  // Check for environment variables at the very beginning.
  // If they are missing, redirect to a setup page.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const ablyApiKey = process.env.ABLY_API_KEY;

  const isConfigured = supabaseUrl && supabaseAnonKey && ablyApiKey;
  const isApiRoute = request.nextUrl.pathname.startsWith('/api/');

  // If the request is for an API route, we shouldn't redirect it.
  // We just want to let the request pass through.
  if (isApiRoute) {
    return NextResponse.next();
  }

  // If not configured and not on the setup page, redirect to setup.
  if (!isConfigured && request.nextUrl.pathname !== '/setup') {
    const url = request.nextUrl.clone()
    url.pathname = '/setup'
    return NextResponse.redirect(url)
  }

  // If configured, but user tries to access setup page, redirect to home.
  if (isConfigured && request.nextUrl.pathname === '/setup') {
     const url = request.nextUrl.clone()
     url.pathname = '/'
     return NextResponse.redirect(url)
  }
  
  // If we are on the setup page (because we weren't configured), allow the request.
  if (request.nextUrl.pathname === '/setup') {
    return NextResponse.next();
  }


  // If we are configured, proceed with session handling.
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
