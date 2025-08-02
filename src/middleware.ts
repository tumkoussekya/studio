
import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';
import {verify, type JwtPayload} from 'jsonwebtoken';
import type { User } from './models/User';

const JWT_SECRET = process.env.JWT_SECRET!;

interface DecodedToken extends JwtPayload, Partial<Pick<User, 'role'>> {}

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  const publicRoutes = ['/login', '/signup'];
  const isPublicRoute = publicRoutes.includes(pathname);
  const isHomePage = pathname === '/';

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
      if ((pathname.startsWith('/admin') || pathname.startsWith('/analytics')) && userRole !== 'Admin') {
          return NextResponse.redirect(new URL('/dashboard?error=unauthorized', request.url));
      }

      // Project Manager and Admin routes
      if (pathname.startsWith('/kanban') && userRole !== 'Admin' && userRole !== 'ProjectManager') {
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
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
