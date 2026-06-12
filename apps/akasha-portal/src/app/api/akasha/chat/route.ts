/**
 * POST /api/akasha/chat
 * Chat completo do Mentor On-Demand
 * 
 * Recebe mensagem do usuário, autentica, extrai userCode (se disponível),
 * valida com Zod, chama MentorEngine.chat() e retorna ChatResponse.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAkashaApi } from '@/lib/application/auth/akasha-guard';
import { prisma } from '@/lib/infrastructure/prisma';
import { MentorEngine, type ChatRequest, type MentorMessage } from '@akasha/mentor';
import type { AkashaCode } from '@akasha/core';

// ─── Schema de Validação ──────────────────────────────────────────────────────

const chatBodySchema = z.object({
  message: z.string().min(1).max(2000),
  userCode: z.string().optional(),
  conversationHistory: z.array(z.object({
    id: z.string().optional(),
    userId: z.string().optional(),
    role: z.enum(['user', 'mentor']),
    content: z.string(),
    createdAt: z.date().optional(),
  })).optional(),
  intent: z.enum(['practice', 'guidance', 'ritual', 'general']).optional(),
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
  let parsed: z.infer<typeof chatBodySchema>;
  try {
    const raw = await request.json();
    parsed = chatBodySchema.parse(raw);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Parâmetros inválidos', details: err.errors },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 });
  }

  const { message, userCode, conversationHistory, intent } = parsed;

  // 3. Extrair userCode do usuário (se não fornecido explicitamente)
  let resolvedUserCode: string | undefined = userCode;
  if (!resolvedUserCode) {
    const extractedCode = await extractUserCode(userId);
    if (extractedCode) {
      resolvedUserCode = akashaCodeToString(extractedCode);
    }
  }

  // 4. Montar ChatRequest
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
    intent,
  };

  // 5. Chamar MentorEngine
  try {
    const mentor = new MentorEngine();
    const response = await mentor.chat(chatRequest);

    return NextResponse.json(response);
  } catch (err) {
    console.error('[chat/route] Erro no mentor:', err);
    const errorMessage = err instanceof Error ? err.message : 'Erro interno do mentor';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
