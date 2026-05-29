// ============================================================
// MAPA SHARE API - Cabala Dos Caminhos
// ============================================================
// POST /api/mapa/share - Generate shareable public link
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const ShareRequestSchema = z.object({
  mapaId: z.string().min(1, 'mapaId is required'),
  expiresIn: z.number().int().positive().optional(),
});

type ShareRequest = z.infer<typeof ShareRequestSchema>;

// In-memory store for share links (MVP - use Redis in production)
interface ShareEntry {
  mapaId: string;
  createdAt: number;
  expiresAt: number | null;
}

const shareStore = new Map<string, ShareEntry>();

// Clean up expired entries periodically
const EXPIRY_CHECK_INTERVAL = 60 * 1000; // 1 minute
let lastCleanup = Date.now();

function cleanupExpired() {
  const now = Date.now();
  if (now - lastCleanup < EXPIRY_CHECK_INTERVAL) return;
  
  const entries = Array.from(shareStore.entries());
  for (const [hash, entry] of entries) {
    if (entry.expiresAt && entry.expiresAt < now) {
      shareStore.delete(hash);
    }
  }
  lastCleanup = now;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = ShareRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { mapaId, expiresIn }: ShareRequest = validation.data;

    // Generate unique hash
    const hash = crypto.randomUUID();
    const now = Date.now();
    const expiresAt = expiresIn ? now + expiresIn : null;

    // Store the share link
    shareStore.set(hash, {
      mapaId,
      createdAt: now,
      expiresAt,
    });

    // Cleanup expired entries
    cleanupExpired();

    // Return share URL
    const shareUrl = `/mapa/shared/${hash}`;

    return NextResponse.json(
      { shareUrl },
      { status: 200 }
    );
  } catch (error) {
    console.error('[mapa/share] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Export store for shared page to use
export { shareStore };