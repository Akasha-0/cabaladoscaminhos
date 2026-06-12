/**
 * GET /api/akasha/rag/search
 * Busca práticas similares usando RAG
 * 
 * Query params:
 * - q: string (required) - query text
 * - limit: number (optional, default: 5)
 * - category: string (optional)
 * - tags: string (optional, comma-separated)
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAkashaApi } from '@/lib/application/auth/akasha-guard';
import { initializeRAG, findSimilarPractices, createRAGConfigFromEnv } from '@akasha/mentor/rag';
import type { PracticeFilters } from '@akasha/mentor/rag';

const searchSchema = z.object({
  q: z.string().min(1),
  limit: z.coerce.number().min(1).max(20).default(5),
  category: z.string().optional(),
  tags: z.string().optional(),
});

// Lazy initialization flag
let ragInitialized = false;

async function ensureRAGInitialized() {
  if (!ragInitialized) {
    const config = createRAGConfigFromEnv();
    if (config.apiKey) {
      await initializeRAG(config);
      ragInitialized = true;
    }
  }
}

export async function GET(request: NextRequest) {
  // 1. Autenticar
  const authResult = await requireAkashaApi(request);
  if (authResult instanceof NextResponse) return authResult;
  
  // 2. Parsear query params
  const { searchParams } = new URL(request.url);
  const params = {
    q: searchParams.get('q') || '',
    limit: searchParams.get('limit') || '5',
    category: searchParams.get('category') || undefined,
    tags: searchParams.get('tags') || undefined,
  };
  
  const parsed = searchSchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Parâmetros inválidos', details: parsed.error.errors },
      { status: 400 }
    );
  }
  
  const { q, limit, category, tags } = parsed.data;
  
  // 3. Construir filtros
  const filters: PracticeFilters | undefined = category || tags 
    ? { 
        category, 
        tags: tags?.split(',').map(t => t.trim()) 
      }
    : undefined;
  
  // 4. Buscar similar
  try {
    await ensureRAGInitialized();
    
    if (!ragInitialized) {
      return NextResponse.json(
        { error: 'RAG não configurado. Configure OPENAI_API_KEY ou COHERE_API_KEY.' },
        { status: 503 }
      );
    }
    
    const results = await findSimilarPractices(q, limit, filters);
    
    return NextResponse.json({ results });
  } catch (err) {
    console.error('[rag/search] Erro:', err);
    return NextResponse.json(
      { error: 'Erro ao buscar práticas', details: err instanceof Error ? err.message : 'Unknown' },
      { status: 500 }
    );
  }
}
