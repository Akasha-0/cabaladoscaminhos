import { NextRequest, NextResponse } from 'next/server';
import {
  correlateLifeAreas,
  generateAreaInsight,
  generateTopAreasInsights,
  UserProfile,
  LifeAreaId,
} from '@/lib/life-areas';

// ============================================================
// API: /api/life-areas
// ============================================================
// GET  /api/life-areas  - retorna o mapa de áreas da vida
// POST /api/life-areas  - gera insight IA para uma área específica
// ============================================================

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface GetRequest {
  userProfile: UserProfile;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      userProfile: UserProfile;
      areaId?: LifeAreaId;
      generateAI?: boolean;
      maxAreas?: number;
    };

    if (!body.userProfile) {
      return NextResponse.json(
        { error: 'userProfile é obrigatório' },
        { status: 400 }
      );
    }

    const { userProfile, areaId, generateAI = true, maxAreas = 3 } = body;

    // Compute full map
    const result = correlateLifeAreas(userProfile);

    // If specific area requested, generate insight for it
    if (areaId) {
      const corr = result.correlations.find(c => c.area.id === areaId);
      if (!corr) {
        return NextResponse.json(
          { error: `Área ${areaId} não encontrada` },
          { status: 404 }
        );
      }

      const insight = await generateAreaInsight(userProfile, areaId, corr, { useAI: generateAI });

      return NextResponse.json({
        result,
        insight,
        timestamp: new Date().toISOString(),
      });
    }

    // Otherwise generate insights for top areas
    const insights = await generateTopAreasInsights(result, { useAI: generateAI, maxAreas });

    return NextResponse.json({
      result,
      insights,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[API /life-areas] Error:', error);
    return NextResponse.json(
      { error: 'Erro ao processar correlações', details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    name: 'Life Areas API',
    version: '1.0',
    description: 'Correlação multi-tradicional das 12 áreas da vida com IA',
    endpoints: {
      POST: '/api/life-areas - { userProfile, areaId?, generateAI?, maxAreas? }',
    },
    areas: [
      'proposito', 'carreira', 'financas', 'saude',
      'relacionamentos', 'sexualidade', 'familia', 'espiritualidade',
      'criatividade', 'amizades', 'conhecimento', 'autoconhecimento',
    ],
  });
}
