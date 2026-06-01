import { NextRequest, NextResponse } from 'next/server';
import {
  buildDailyContext,
  generateDailyRecommendationV2 as generateDailyRecommendation,
  generateAreaRecommendationV2 as generateAreaRecommendation,
  askSpiritualAgentV2 as askSpiritualAgent,
  type UserSpiritualProfile,
} from '@/lib/agents';
import { type LifeAreaId } from '@/lib/life-areas';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface RequestBody {
  action: 'context' | 'daily' | 'area' | 'chat' | 'timing';
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
        return NextResponse.json({ context, timestamp: new Date().toISOString() });
      }

      case 'daily': {
        const result = await generateDailyRecommendation(body.user, options);
        return NextResponse.json({ ...result, timestamp: new Date().toISOString() });
      }

      case 'area': {
        if (!body.areaId) {
          return NextResponse.json({ error: 'areaId é obrigatório' }, { status: 400 });
        }
        const result = await generateAreaRecommendation(body.user, body.areaId, options);
        return NextResponse.json({ ...result, timestamp: new Date().toISOString() });
      }

      case 'chat': {
        if (!body.question) {
          return NextResponse.json({ error: 'question é obrigatório' }, { status: 400 });
        }
        const result = await askSpiritualAgent(body.user, body.question, options);
        return NextResponse.json({ ...result, timestamp: new Date().toISOString() });
      }

      default:
        return NextResponse.json({ error: 'action inválida' }, { status: 400 });
    }
  } catch (error) {
    console.error('[API /recommendations v2] Error:', error);
    return NextResponse.json(
      { error: 'Erro ao processar recomendação', details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    name: 'Recommendations API v2',
    version: '2.0',
    engine: 'Swarm Knowledge Base + MiniMax M3',
    description: 'Sistema agêntico v2 com Knowledge Base persistente do Swarm',
    features: [
      'Knowledge Base curada por 12 agentes especialistas',
      'Quizilas de 15+ Orixás',
      'Fundamentos dos 16 Odus',
      '5 Corpos Prânicos (Tantra)',
      '7 Chakras principais + secundários',
      'Casa 5, Casa 8, Lilith (sexualidade)',
      '8+ plantas sagradas com indicações',
      'Sabbats Wiccanos',
      'Mapa de Xing',
      'Validação cruzada antes de chamar IA',
    ],
  });
}
