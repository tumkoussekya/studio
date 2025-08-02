
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

  // --- Handle authenticated users trying to access public routes ---
  if (token && isPublicRoute) {
    try {
      verify(token, JWT_SECRET);
      // If token is valid, redirect them away from login/signup
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } catch (error) {
      // If token is invalid, it will be cleared, let them proceed
      const response = NextResponse.next();
      response.cookies.delete('token');
      return response;
    }
  }

  // --- Handle unauthenticated users trying to access protected routes ---
  if (!token && !isPublicRoute) {
    // allow access to the public home page
    if (pathname === '/') {
        return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // --- Handle role-based access for authenticated users ---
  if (token && !isPublicRoute) {
     try {
      const decoded = verify(token, JWT_SECRET) as DecodedToken;
      const userRole = decoded.role;

      // Admin-only routes
      if (pathname.startsWith('/admin') && userRole !== 'Admin') {
          return NextResponse.redirect(new URL('/dashboard?error=unauthorized', request.url));
      }

      // Project Manager and Admin routes
      if (pathname.startsWith('/kanban') && userRole !== 'Admin' && userRole !== 'ProjectManager') {
        return NextResponse.redirect(new URL('/dashboard?error=unauthorized', request.url));
      }
      
      // If all checks pass, allow the request
      return NextResponse.next();

    } catch (error) {
      console.error('JWT Verification Error:', error);
      // If token is invalid, redirect to login and clear the cookie
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token');
      return response;
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
