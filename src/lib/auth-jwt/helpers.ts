import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, type TokenPayload } from './jwt';

const COOKIE_NAME = 'auth_token';

export function getTokenFromRequest(request: NextRequest): string | null {
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    if (key && value) {
      acc[key.trim()] = value.trim();
    }
    return acc;
  }, {} as Record<string, string>);
  
  return cookies[COOKIE_NAME] || null;
}

export async function getAuthenticatedUser(request: NextRequest): Promise<TokenPayload | null> {
  const token = getTokenFromRequest(request);
  
  if (!token) {
    return null;
  }
  
  return verifyToken(token);
}

export async function requireAuth(request: NextRequest): Promise<TokenPayload> {
  const user = await getAuthenticatedUser(request);
  
  if (!user) {
    throw new NextResponse(
      JSON.stringify({ success: false, error: 'Não autenticado' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }
  
  return user;
}

export function createAuthCookie(token: string): string {
  const maxAge = 24 * 60 * 60; // 24 hours in seconds
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`;
}

export function clearAuthCookie(): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}