
import { NextRequest, NextResponse } from 'next/server';
import { deleteCookie } from 'cookies-next';

export async function POST(req: NextRequest) {
  const response = NextResponse.json({ message: 'Logout successful' }, { status: 200 });

  deleteCookie('token', {
    req,
    res: response,
    path: '/',
  });

  return response;
}
