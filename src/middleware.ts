
import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';
import {verify} from 'jsonwebtoken';
import { userStore } from './lib/userStore';

const JWT_SECRET = process.env.JWT_SECRET!;

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  const publicRoutes = ['/login', '/signup'];
  const isPublicRoute = publicRoutes.includes(pathname);

  // If user has a token and tries to access a public route, redirect to /dashboard
  if (token && isPublicRoute) {
    try {
      verify(token, JWT_SECRET);
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } catch (error) {
      // Invalid token, allow access to public route
      return NextResponse.next();
    }
  }

  // If user has no token and tries to access a protected route, redirect to /login
  if (!token && !isPublicRoute) {
    // allow access to home page
    if (pathname === '/') {
        return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If user has a token and accesses a protected route, allow access
  if (token && !isPublicRoute) {
     try {
      const decoded = verify(token, JWT_SECRET) as { email: string, lastX: number, lastY: number };
      if (pathname.startsWith('/world')) {
         const { x, y } = request.body ? JSON.parse(request.body as any) : { x: decoded.lastX, y: decoded.lastY };
        if (request.method === 'POST') {
          userStore.updateUserPosition(decoded.email, x, y);
        }
      }
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
