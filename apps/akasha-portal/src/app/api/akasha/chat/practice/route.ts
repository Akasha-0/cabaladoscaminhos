/**
 * POST /api/akasha/chat/practice
 * Rota especializada para práticas recomendadas
 * 
 * Força intent='practice', extrai userCode, chama MentorEngine
 * e retorna apenas as práticas sugeridas.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAkashaApi } from '@/lib/application/auth/akasha-guard';
import { prisma } from '@/lib/infrastructure/prisma';
import { MentorEngine, type ChatRequest, type MentorMessage } from '@akasha/mentor';
import type { AkashaCode } from '@akasha/core';

// ─── Schema de Validação ──────────────────────────────────────────────────────

const practiceBodySchema = z.object({
  message: z.string().min(1).max(2000).optional().default('Sugira práticas espirituais para mim'),
  userCode: z.string().optional(),
  conversationHistory: z.array(z.object({
    id: z.string().optional(),
    userId: z.string().optional(),
    role: z.enum(['user', 'mentor']),
    content: z.string(),
    createdAt: z.date().optional(),
  })).optional(),
});

// ─── Helper: Converter AkashaCode para string ─────────────────────────────────

function akashaCodeToString(code: AkashaCode): string {
  return `${code.hexagram}-${code.level}-${code.lifeArea}`;
}

// ─── Helper: Extrair AkashaCode do usuário ───────────────────────────────────

async function extractUserCode(userId: string): Promise<AkashaCode | undefined> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { ichingEnabled: true, ichingMap: true },
    });

    if (!user?.ichingEnabled || !user.ichingMap) {
      return undefined;
    }

    const ichingMap = user.ichingMap as { hexagram?: number; level?: string };
    if (ichingMap?.hexagram) {
      return {
        hexagram: ichingMap.hexagram,
        level: (ichingMap.level as 'shadow' | 'gift' | 'siddhi') ?? 'gift',
        lifeArea: 'espiritualidade',
      };
    }

    return undefined;
  } catch {
    return undefined;
  }
}

// ─── Handler ─────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // 1. Autenticar
  const authResult = await requireAkashaApi(request);
  if (authResult instanceof NextResponse) return authResult;
  const { id: userId } = authResult;

  // 2. Validar body
  let parsed: z.infer<typeof practiceBodySchema>;
  try {
    const raw = await request.json();
    parsed = practiceBodySchema.parse(raw);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Parâmetros inválidos', details: err.errors },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 });
  }

  const { message, userCode, conversationHistory } = parsed;

  // 3. Extrair userCode do usuário (se não fornecido explicitamente)
  let resolvedUserCode: string | undefined = userCode;
  if (!resolvedUserCode) {
    const extractedCode = await extractUserCode(userId);
    if (extractedCode) {
      resolvedUserCode = akashaCodeToString(extractedCode);
    }
  }

  // 4. Montar ChatRequest forçando intent='practice'
  const historyMessages: MentorMessage[] | undefined = conversationHistory?.map((item) => ({
    id: item.id ?? crypto.randomUUID(),
    userId: item.userId,
    role: item.role as 'user' | 'mentor',
    content: item.content,
    createdAt: item.createdAt ?? new Date(),
  }));

  const chatRequest: ChatRequest = {
    message,
    userCode: resolvedUserCode,
    conversationHistory: historyMessages,
    intent: 'practice',
  };

  // 5. Chamar MentorEngine
  try {
    const mentor = new MentorEngine();
    const response = await mentor.chat(chatRequest);

    // 6. Retornar apenas suggestedPractices
    return NextResponse.json({
      suggestedPractices: response.suggestedPractices ?? [],
    });
  } catch (err) {
    console.error('[chat/practice/route] Erro no mentor:', err);
    const errorMessage = err instanceof Error ? err.message : 'Erro interno do mentor';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
