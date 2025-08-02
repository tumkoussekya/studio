
import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';
import {verify} from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  if (request.nextUrl.pathname.startsWith('/world')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      verify(token, JWT_SECRET);
      return NextResponse.next();
    } catch (error) {
      console.error('JWT Verification Error:', error);
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  if (
    token &&
    (request.nextUrl.pathname.startsWith('/login') ||
      request.nextUrl.pathname.startsWith('/signup'))
  ) {
    try {
      verify(token, JWT_SECRET);
      // If token is valid, redirect to world
      return NextResponse.redirect(new URL('/world', request.url));
    } catch (error) {
      // If token is invalid, let them proceed to login/signup
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/world', '/login', '/signup'],
};
