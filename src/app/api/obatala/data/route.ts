// ============================================================
// OBATALA DATA API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for Obatala data
// - Retrieve Obatala configurations
// - Retrieve pathways and roads
// - Retrieve offerings and rituals
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

interface ObatalaConfig {
  name: string;
  description: string;
  enabled: boolean;
}

interface PathwayRoad {
  tipo: string;
  descricao: string;
  energia: string;
}

interface OfferingRitual {
  tipo: string;
  descricao: string;
  freq: number;
}

// GET /api/obatala/data - Get Obatala data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    // Return single config by type
    if (type === 'config') {
      const configs: ObatalaConfig[] = [
        { name: 'obatala-primary', description: 'Configuracao principal de Obatala', enabled: true },
        { name: 'obatala-creator', description: 'Configuracao para criacao e formacao', enabled: true },
        { name: 'obatala-purity', description: 'Configuracao para purificacao e clareza', enabled: true },
      ];
      return NextResponse.json({ success: true, data: configs });
    }

    // Return pathways and roads
    if (type === 'pathways') {
      const pathways: PathwayRoad[] = [
        { tipo: 'caminho-puro', descricao: 'Caminho de pureza e luz', energia: 'Clareza e verdade' },
        { tipo: 'caminho-criador', descricao: 'Caminho de criacao e formacao', energia: 'Ordem e vida' },
        { tipo: 'cabeca-sagrada', descricao: 'Caminho da cabeca sagrada', energia: 'Sabedoria e paciencia' },
        { tipo: 'porta-branca', descricao: 'Porta branca de purificacao', energia: 'Renovacao e inicio' },
        { tipo: 'artistica', descricao: 'Caminho artistico e criativo', energia: 'Beleza e expressao' },
      ];
      return NextResponse.json({ success: true, data: pathways });
    }

    // Return offerings and rituals
    if (type === 'offerings') {
      const offerings: OfferingRitual[] = [
        { tipo: 'amala', descricao: 'Massa de angu branco', freq: 1 },
        { tipo: 'dende', descricao: 'Oleo de dendem branco', freq: 2 },
        { tipo: 'pomba-branca', descricao: 'Pomba branca sagrada', freq: 3 },
        { tipo: 'efun', descricao: 'Giz branco para purificacao', freq: 1 },
        { tipo: 'coco-branco', descricao: 'Coco branco para oferendas', freq: 2 },
      ];
      return NextResponse.json({ success: true, data: offerings });
    }

    // Default — return all Obatala data
    return NextResponse.json({
      success: true,
      data: {
        configs: [
          { name: 'obatala-primary', description: 'Configuracao principal de Obatala', enabled: true },
          { name: 'obatala-creator', description: 'Configuracao para criacao e formacao', enabled: true },
          { name: 'obatala-purity', description: 'Configuracao para purificacao e clareza', enabled: true },
        ] as ObatalaConfig[],
        pathways: [
          { tipo: 'caminho-puro', descricao: 'Caminho de pureza e luz', energia: 'Clareza e verdade' },
          { tipo: 'caminho-criador', descricao: 'Caminho de criacao e formacao', energia: 'Ordem e vida' },
          { tipo: 'cabeca-sagrada', descricao: 'Caminho da cabeca sagrada', energia: 'Sabedoria e paciencia' },
          { tipo: 'porta-branca', descricao: 'Porta branca de purificacao', energia: 'Renovacao e inicio' },
          { tipo: 'artistica', descricao: 'Caminho artistico e criativo', energia: 'Beleza e expressao' },
        ] as PathwayRoad[],
        offerings: [
          { tipo: 'amala', descricao: 'Massa de angu branco', freq: 1 },
          { tipo: 'dende', descricao: 'Oleo de dendem branco', freq: 2 },
          { tipo: 'pomba-branca', descricao: 'Pomba branca sagrada', freq: 3 },
          { tipo: 'efun', descricao: 'Giz branco para purificacao', freq: 1 },
          { tipo: 'coco-branco', descricao: 'Coco branco para oferendas', freq: 2 },
        ] as OfferingRitual[],
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch Obatala data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
