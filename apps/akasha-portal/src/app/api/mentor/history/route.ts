/**
 * API Route: GET /api/mentor/history
 * Returns recent mentor messages for a user
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/infrastructure/prisma';

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId');

  if (!userId) {
    return NextResponse.json(
      { error: 'userId is required' },
      { status: 400 }
    );
  }

  try {
    // Get recent mentor sessions and messages
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
    const messages = sessions.flatMap(session =>
      session.messages.map(msg => ({
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
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
