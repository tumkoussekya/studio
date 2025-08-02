
import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';
import { createClient } from './lib/supabase/server';
import type { User } from './models/User';


export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;

  const publicRoutes = ['/login', '/signup', '/about', '/privacy-policy', '/terms-of-service', '/features', '/pricing', '/contact', '/documentation', '/careers', '/faq', '/blog', '/profile'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  const isHomePage = pathname === '/';
  const isApiRoute = pathname.startsWith('/api/');

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


  if (user) {
      const userRole = user.user_metadata?.role;
      const profileComplete = user.user_metadata?.profile_complete;

      // If profile is not complete, redirect to profile setup page
      if (!profileComplete && pathname !== '/profile' && !isApiRoute && pathname !== '/api/auth/logout') {
          return NextResponse.redirect(new URL('/profile', request.url));
      }
      
      // If profile IS complete, but they try to access the setup page, redirect to dashboard
      if (profileComplete && pathname === '/profile') {
          return NextResponse.redirect(new URL('/dashboard', request.url));
      }

      // If authenticated, redirect from public auth routes to dashboard
      if (pathname.startsWith('/login') || pathname.startsWith('/signup')) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }

      // --- Role-based access control for protected routes ---
      // Admin-only routes
      if ((pathname.startsWith('/admin') || pathname.startsWith('/analytics') || pathname.startsWith('/kanban')) && userRole !== 'Admin') {
          return NextResponse.redirect(new URL('/dashboard?error=unauthorized', request.url));
      }

  } else {
    // Not authenticated
    if (!isPublicRoute && !isHomePage && !pathname.startsWith('/meetings/')) {
        if (pathname.startsWith('/meetings/')) {
            // Allow anonymous users to join meetings, but they will be prompted for a name by Jitsi
        } else {
             return NextResponse.redirect(new URL('/login', request.url));
        }
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
