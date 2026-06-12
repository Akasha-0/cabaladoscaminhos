/**
 * POST /api/akasha/rag/index
 * Indexa uma prática no RAG
 * 
 * Body:
 * - id: string
 * - name: string
 * - category: string
 * - description?: string
 * - tags?: string[]
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAkashaApi } from '@/lib/application/auth/akasha-guard';
import { initializeRAG, indexPractice, createRAGConfigFromEnv } from '@akasha/mentor/rag';

const indexBodySchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

// Lazy initialization
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

export async function POST(request: NextRequest) {
  // 1. Autenticar (apenas admins)
  const authResult = await requireAkashaApi(request);
  if (authResult instanceof NextResponse) return authResult;
  
  // 2. Validar body
  let parsed: z.infer<typeof indexBodySchema>;
  try {
    const raw = await request.json();
    parsed = indexBodySchema.parse(raw);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Parâmetros inválidos', details: err.errors },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 });
  }
  
  const { id, name, category, description, tags } = parsed;
  
  // 3. Indexar
  try {
    await ensureRAGInitialized();
    
    if (!ragInitialized) {
      return NextResponse.json(
        { error: 'RAG não configurado. Configure OPENAI_API_KEY ou COHERE_API_KEY.' },
        { status: 503 }
      );
    }
    
    await indexPractice({ id, name, category, description: description ?? '', tags });
    
    return NextResponse.json({ 
      success: true,
      message: `Prática '${name}' indexada com sucesso` 
    });
  } catch (err) {
    console.error('[rag/index] Erro:', err);
    return NextResponse.json(
      { error: 'Erro ao indexar prática', details: err instanceof Error ? err.message : 'Unknown' },
      { status: 500 }
    );
  }
}
