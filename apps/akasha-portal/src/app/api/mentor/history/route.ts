/**
 * API Route: GET /api/mentor/history
 * Returns recent mentor messages for the authenticated user.
 *
 * SECURITY FIX (v0.85.2):
 * Previously took userId from query params directly — allowed ANY user to read
 * any other user's mentor history (IDOR vulnerability). Now uses requireAkashaApi
 * to enforce authentication and returns only the authenticated user's history.
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireAkashaApi } from '@/lib/application/auth/akasha-guard';
import { prisma } from '@/lib/infrastructure/prisma';

export async function GET(request: NextRequest) {
  const authResult = await requireAkashaApi(request);
  if (authResult instanceof NextResponse) return authResult;

  const userId = authResult.id;

  try {
    // Get recent mentor sessions and messages for the authenticated user
    const sessions = await prisma.consultation.findMany({
      where: {
        userId,
        title: { startsWith: '[MENTOR]' },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        createdAt: true,
        messages: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            role: true,
            content: true,
            createdAt: true,
          },
        },
      },
    });

    // Flatten messages from all sessions
    const messages = sessions.flatMap((session) =>
      session.messages.map((msg) => ({
        id: msg.id,
        sessionId: session.id,
        role: msg.role === 'USER' ? 'user' : 'mentor',
        content: msg.content,
        createdAt: msg.createdAt,
      }))
    );

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Mentor history error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
