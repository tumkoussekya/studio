
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from './lib/supabase/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Create a Supabase client for middleware
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;

  const publicRoutes = ['/login', '/signup', '/about', '/privacy-policy', '/terms-of-service', '/features', '/pricing', '/contact', '/documentation', '/careers', '/faq', '/blog'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route)) || pathname === '/';
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/signup');
  const isApiRoute = pathname.startsWith('/api/');
  const isProfileRoute = pathname === '/profile';

  // Allow all API routes to be handled by their own logic, except for special cases
  if (isApiRoute) {
    if (pathname.startsWith('/api/admin')) {
       if (!user) {
        return new NextResponse(JSON.stringify({ message: 'Authentication required' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
       }
       // user_metadata is where we stored our custom role
       if (user.user_metadata?.role !== 'Admin') {
           return new NextResponse(JSON.stringify({ message: 'Forbidden' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
       }
    }
    return NextResponse.next();
  }

  // Handle authenticated users
  if (user) {
    const profileComplete = user.user_metadata?.profile_complete;
    const userRole = user.user_metadata?.role;

    // If profile is not complete, force redirection to the profile page
    if (!profileComplete && !isProfileRoute && pathname !== '/api/auth/logout' && pathname !== '/api/profile/update') {
      return NextResponse.redirect(new URL('/profile', request.url));
    }

    // If profile is complete, don't let them access the profile page again
    if (profileComplete && isProfileRoute) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    
    // If user is on an auth page like login/signup, redirect to dashboard
    if (isAuthRoute) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Handle role-based access for protected client-side routes
    if ((pathname.startsWith('/admin') || pathname.startsWith('/analytics') || pathname.startsWith('/kanban')) && userRole !== 'Admin') {
        return NextResponse.redirect(new URL('/dashboard?error=unauthorized', request.url));
    }

  } else { // Handle unauthenticated users
    // If the route is not public, redirect to login
    if (!isPublicRoute) {
        // Allow unauthenticated users to join meetings, but Jitsi will prompt for a name.
        if (pathname.startsWith('/meetings/')) {
            return NextResponse.next();
        }
       return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - assets (static assets for phaser)
     */
    '/((?!_next/static|_next/image|favicon.ico|assets).*)',
  ],
};
