import { NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/auth-jwt';

export async function POST() {
  const response = NextResponse.json({ success: true });

  response.headers.set('Set-Cookie', clearAuthCookie());

  return response;
}