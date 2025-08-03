
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
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
    '/((?!_next/static|_next/image|favicon.ico|assets|login|signup|auth|api/auth).*)',
  ],
}
