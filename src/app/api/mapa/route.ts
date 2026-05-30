import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { gerarMapaAlmaCompleto } from '@/lib/engines/spiritual-engine';
import { getRedisClient } from '@/lib/redis';

const mapaSchema = z.object({
  nomeCompleto: z.string().min(2).max(200),
  dataNascimento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  hora: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  pais: z.string().optional(),
});

type MapaInput = z.infer<typeof mapaSchema>;

// ============================================================
// HELPERS
// ============================================================

async function hashCacheKey(nomeCompleto: string, dataNascimento: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(nomeCompleto + dataNascimento);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function getCachedMapa(key: string): Promise<unknown | null> {
  try {
    const redis = await getRedisClient();
    const raw = await redis.get(key);
    if (raw) return JSON.parse(raw as string);
  } catch {
    // Redis unavailable — fall through to calculation
  }
  return null;
}

async function setCachedMapa(key: string, mapa: unknown): Promise<void> {
  try {
    const redis = await getRedisClient();
    await redis.set(key, JSON.stringify(mapa), 'EX', 86400);
  } catch {
    // Redis unavailable — caching silently skipped
  }
}

// ============================================================
// GET — fetch previously cached result
// ============================================================

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'userId é obrigatório' }, { status: 400 });
  }

  try {
    const redis = await getRedisClient();
    const cached = await redis.get(`mapa:${userId}`);
    if (cached) {
      return NextResponse.json(JSON.parse(cached as string));
    }
    return NextResponse.json({ error: 'Mapa não encontrado no cache' }, { status: 404 });
  } catch {
    return NextResponse.json({ error: 'Erro ao acessar cache' }, { status: 500 });
  }
}

// ============================================================
// POST — generate full MapaAlmaCompleto
// ============================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as unknown;
    const parsed = mapaSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { nomeCompleto, dataNascimento, hora, cidade, estado, pais } = parsed.data as MapaInput;
    const profile = { nomeCompleto, dataNascimento, hora, cidade: cidade ?? '', estado: estado ?? '', pais: pais ?? '' };

    // Check cache first
    const cacheKey = `mapa:${await hashCacheKey(nomeCompleto, dataNascimento)}`;
    const cached = await getCachedMapa(cacheKey);
    if (cached) return NextResponse.json(cached);

    // Calculate MapaAlmaCompleto via spiritual engine
    const mapa = await gerarMapaAlmaCompleto(profile);

    // Store in cache with 24h TTL
    await setCachedMapa(cacheKey, mapa);

    return NextResponse.json(mapa, { status: 200 });
  } catch (err) {
    console.error('[mapa] Error:', err);
    return NextResponse.json(
      { error: 'Erro interno ao gerar Mapa da Alma' },
      { status: 500 }
    );
  }
}
