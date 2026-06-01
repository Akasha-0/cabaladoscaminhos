import { NextRequest, NextResponse } from 'next/server';
import {
  buildDailyContext,
  generateDailyRecommendation,
  generateAreaRecommendation,
  generateAreaDeepInsight,
  askSpiritualAgent,
  getSpiritualTiming,
  type UserSpiritualProfile,
} from '@/lib/agents';
import type { LifeAreaId } from '@/lib/life-areas';

// ============================================================
// API: /api/recommendations
// ============================================================
// Sistema agêntico DINÂMICO de recomendações com IA MiniMax M3.
//
// POST /api/recommendations
//   {
//     action: 'context' | 'daily' | 'area' | 'insight' | 'chat' | 'timing',
//     user: UserSpiritualProfile,
//     areaId?: LifeAreaId,
//     question?: string,
//     intention?: string,
//     useAI?: boolean
//   }
// ============================================================

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface RequestBody {
  action: 'context' | 'daily' | 'area' | 'insight' | 'chat' | 'timing';
  user: UserSpiritualProfile;
  areaId?: LifeAreaId;
  question?: string;
  intention?: string;
  useAI?: boolean;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RequestBody;

    if (!body.user || !body.user.nome || !body.user.dataNascimento) {
      return NextResponse.json(
        { error: 'user.nome e user.dataNascimento são obrigatórios' },
        { status: 400 }
      );
    }

    const useAI = body.useAI !== false;
    const options = { useAI };

    switch (body.action) {
      case 'context': {
        const context = await buildDailyContext(body.user);
        return NextResponse.json({
          context,
          timestamp: new Date().toISOString(),
        });
      }

      case 'daily': {
        const result = await generateDailyRecommendation(body.user, options);
        return NextResponse.json({
          ...result,
          timestamp: new Date().toISOString(),
        });
      }

      case 'area': {
        if (!body.areaId) {
          return NextResponse.json(
            { error: 'areaId é obrigatório' },
            { status: 400 }
          );
        }
        const result = await generateAreaRecommendation(body.user, body.areaId, options);
        return NextResponse.json({
          ...result,
          timestamp: new Date().toISOString(),
        });
      }

      case 'insight': {
        if (!body.areaId) {
          return NextResponse.json(
            { error: 'areaId é obrigatório' },
            { status: 400 }
          );
        }
        const result = await generateAreaDeepInsight(body.user, body.areaId, options);
        return NextResponse.json({
          ...result,
          timestamp: new Date().toISOString(),
        });
      }

      case 'chat': {
        if (!body.question) {
          return NextResponse.json(
            { error: 'question é obrigatório' },
            { status: 400 }
          );
        }
        const result = await askSpiritualAgent(body.user, body.question, options);
        return NextResponse.json({
          ...result,
          timestamp: new Date().toISOString(),
        });
      }

      case 'timing': {
        if (!body.intention) {
          return NextResponse.json(
            { error: 'intention é obrigatório' },
            { status: 400 }
          );
        }
        const result = await getSpiritualTiming(body.user, body.intention, options);
        return NextResponse.json({
          ...result,
          timestamp: new Date().toISOString(),
        });
      }

      default:
        return NextResponse.json(
          { error: 'action inválida' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('[API /recommendations] Error:', error);
    return NextResponse.json(
      { error: 'Erro ao processar recomendação', details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    name: 'Recommendations API',
    version: '1.0',
    description: 'Sistema agêntico de recomendações espirituais com IA MiniMax M3',
    engine: 'Dynamic context builder + MiniMax M3',
    actions: {
      'POST /api/recommendations': {
        body: {
          action: "'context' | 'daily' | 'area' | 'insight' | 'chat' | 'timing'",
          user: 'UserSpiritualProfile (nome, dataNascimento, ...)',
          areaId: 'LifeAreaId (para action area/insight)',
          question: 'string (para action chat)',
          intention: 'string (para action timing)',
          useAI: 'boolean (default true)',
        },
      },
    },
    features: [
      'Dia/Mês/Ano pessoal calculados dinamicamente',
      'Trânsitos planetários do dia',
      'Fase lunar',
      'Pináculos, Desafios, Lições Cármicas',
      'Contexto agêntico estruturado',
      'IA MiniMax M3 para insights profundos',
      'Fallback estruturado sem IA',
    ],
  });
}
