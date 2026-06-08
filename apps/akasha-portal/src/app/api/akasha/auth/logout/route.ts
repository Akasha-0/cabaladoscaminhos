import { NextResponse } from 'next/server';
import { clearAkashaSessionCookie, clearAkashaRefreshCookie } from '@/lib/application/auth/akasha-jwt';

export async function POST() {
  const response = NextResponse.json({ message: 'Sessão encerrada' });
  clearAkashaSessionCookie(response);
  clearAkashaRefreshCookie(response);
  return response;
}
