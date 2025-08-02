
import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';
import {verify, type JwtPayload} from 'jsonwebtoken';
import type { User } from './models/User';

const JWT_SECRET = process.env.JWT_SECRET!;

interface DecodedToken extends JwtPayload, Partial<Pick<User, 'role'>> {}

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  const publicRoutes = ['/login', '/signup', '/about', '/privacy-policy', '/terms-of-service', '/features', '/pricing'];
  const isPublicRoute = publicRoutes.includes(pathname);
  const isHomePage = pathname === '/';
  const isApiRoute = pathname.startsWith('/api/');

  if (isApiRoute) {
    if (pathname.startsWith('/api/admin')) {
       if (!token) {
        return new NextResponse(JSON.stringify({ message: 'Authentication required' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
       }
       try {
         const decoded = verify(token, JWT_SECRET) as DecodedToken;
         if (decoded.role !== 'Admin') {
            return new NextResponse(JSON.stringify({ message: 'Forbidden' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
         }
       } catch (error) {
         return new NextResponse(JSON.stringify({ message: 'Invalid token' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
       }
    }
    return NextResponse.next();
  }


  if (token) {
    try {
      const decoded = verify(token, JWT_SECRET) as DecodedToken;
      const userRole = decoded.role;

      // If authenticated, redirect from public routes to dashboard
      if (isPublicRoute) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }

      // --- Role-based access control for protected routes ---
      // Admin-only routes
      if ((pathname.startsWith('/admin') || pathname.startsWith('/analytics') || pathname.startsWith('/kanban')) && userRole !== 'Admin') {
          return NextResponse.redirect(new URL('/dashboard?error=unauthorized', request.url));
      }

    } catch (error) {
      // Invalid token, clear it and redirect to login
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token');
      return response;
    }
  } else {
    // Not authenticated
    if (!isPublicRoute && !isHomePage) {
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
