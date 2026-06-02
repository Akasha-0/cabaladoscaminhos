// ============================================================
// MAPA SHARE API - Cabala Dos Caminhos
// ============================================================
// POST /api/mapa/share - Generate shareable public link
// GET /api/mapa/share?hash=xxx - Get shared mapa data
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const ShareRequestSchema = z.object({
  mapaId: z.string().min(1, 'mapaId is required'),
  expiresIn: z.number().int().positive().optional(),
});

type ShareRequest = z.infer<typeof ShareRequestSchema>;

// Full mapa data type (subset of what's returned by /api/mapa)
export interface MapaData {
  id: string;
  created_at: string;
  numerologia: {
    numero_vida: number;
    numero_destino: number;
    numero_alma: number;
    numero_personalidade: number;
  };
  odu: {
    nome: string;
    numero: number;
    orixas: string[];
    quizilas: string[];
    preceitos: string;
  };
  astrologia: {
    signo: string;
    ascendente: string;
    planetas: Record<string, string>;
    planeta?: Record<string, { planeta: string; longitude: number; latitude: number; distancia: number; velocidade: number; signo: string; casa: number; grauNoSigno: number }>;
    casas?: Array<{ numero: number; signo: string; grauNoSigno: number }>;
    ascendenteDegree?: number;
    mediumCoeli?: number;
  };
  tarot: {
    carta_nascimento: number;
    carta_ano_pessoal: number;
  };
  orixas: string[];
  sefirot: string[];
  convergencias?: Array<{
    energia: string;
    forca: 'simples' | 'dupla' | 'tripla';
    descricao: string;
  }>;
}

// In-memory store for share links (MVP - use Redis in production)
interface ShareEntry {
  mapaId: string;
  createdAt: number;
  expiresAt: number | null;
  data?: MapaData;
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const hash = searchParams.get('hash');

    if (!hash) {
      return NextResponse.json(
        { error: 'Hash is required' },
        { status: 400 }
      );
    }

    const entry = shareStore.get(hash);

    if (!entry) {
      return NextResponse.json(
        { error: 'Share link not found or expired' },
        { status: 404 }
      );
    }

    // Check expiration
    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      shareStore.delete(hash);
      return NextResponse.json(
        { error: 'Share link has expired' },
        { status: 410 }
      );
    }

    // Return the stored data if available
    if (entry.data) {
      return NextResponse.json(
        { data: entry.data },
        { status: 200 }
      );
    }

    // If no data stored, return the mapaId for client-side fetch
    return NextResponse.json(
      { mapaId: entry.mapaId },
      { status: 200 }
    );
  } catch (error) {
    console.error('[mapa/share] GET Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
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

    // Extract optional mapa data from request body
    const mapaData = body.data as MapaData | undefined;

    // Generate unique hash
    const hash = crypto.randomUUID();
    const now = Date.now();
    const expiresAt = expiresIn ? now + expiresIn : null;

    // Store the share link
    shareStore.set(hash, {
      mapaId,
      createdAt: now,
      expiresAt,
      data: mapaData,
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
    console.error('[mapa/share] POST Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Export store for type access
