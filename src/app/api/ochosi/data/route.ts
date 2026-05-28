// ============================================================
// OCHOSI DATA API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for Ochosi data
// - Retrieve Ochosi configurations
// - Retrieve pathways and roads
// - Retrieve offerings and rituals
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

interface OchosiConfig {
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

// GET /api/ochosi/data - Get Ochosi data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    // Return single config by type
    if (type === 'config') {
      const configs: OchosiConfig[] = [
        { name: 'ochosi-hunter', description: 'Configuracao principal de Ochosi', enabled: true },
        { name: 'ochosi-pathfinder', description: 'Configuracao para busca e encontro', enabled: true },
        { name: 'ochosi-adventure', description: 'Configuracao para aventura e jornada', enabled: true },
      ];
      return NextResponse.json({ success: true, data: configs });
    }

    // Return pathways and roads
    if (type === 'pathways') {
      const pathways: PathwayRoad[] = [
        { tipo: 'caçador-das-florestas', descricao: 'Caminho do caçador das matas', energia: 'Busca e perspicacia' },
        { tipo: 'encontrador-de-caminhos', descricao: 'Caminho do encontrador de trilhas', energia: 'Orientacao e destino' },
        { tipo: 'guardiao-das-sendas', descricao: 'Caminho do guardiao das sendas', energia: 'Protecao e vigilia' },
        { tipo: 'aventureiro-sagrado', descricao: 'Caminho do aventureiro sagrado', energia: 'Coragem e descoberta' },
        { tipo: 'rastreador-da-verdade', descricao: 'Caminho do rastreador da verdade', energia: 'Clareza e insight' },
      ];
      return NextResponse.json({ success: true, data: pathways });
    }

    // Return offerings and rituals
    if (type === 'offerings') {
      const offerings: OfferingRitual[] = [
        { tipo: 'milho-verde', descricao: 'Espiga de milho verde', freq: 1 },
        { tipo: 'mel-de-abelha', descricao: 'Mel puro de abelha', freq: 2 },
        { tipo: 'pomba-cinzenta', descricao: 'Pomba cinzenta para oferendas', freq: 3 },
        { tipo: 'ervas-de-protecao', descricao: 'Mistura de ervas protetoras', freq: 1 },
        { tipo: 'cabrito-branco', descricao: 'Cabrito branco para rituais', freq: 2 },
      ];
      return NextResponse.json({ success: true, data: offerings });
    }

    // Default — return all Ochosi data
    return NextResponse.json({
      success: true,
      data: {
        configs: [
          { name: 'ochosi-hunter', description: 'Configuracao principal de Ochosi', enabled: true },
          { name: 'ochosi-pathfinder', description: 'Configuracao para busca e encontro', enabled: true },
          { name: 'ochosi-adventure', description: 'Configuracao para aventura e jornada', enabled: true },
        ] as OchosiConfig[],
        pathways: [
          { tipo: 'caçador-das-florestas', descricao: 'Caminho do caçador das matas', energia: 'Busca e perspicacia' },
          { tipo: 'encontrador-de-caminhos', descricao: 'Caminho do encontrador de trilhas', energia: 'Orientacao e destino' },
          { tipo: 'guardiao-das-sendas', descricao: 'Caminho do guardiao das sendas', energia: 'Protecao e vigilia' },
          { tipo: 'aventureiro-sagrado', descricao: 'Caminho do aventureiro sagrado', energia: 'Coragem e descoberta' },
          { tipo: 'rastreador-da-verdade', descricao: 'Caminho do rastreador da verdade', energia: 'Clareza e insight' },
        ] as PathwayRoad[],
        offerings: [
          { tipo: 'milho-verde', descricao: 'Espiga de milho verde', freq: 1 },
          { tipo: 'mel-de-abelha', descricao: 'Mel puro de abelha', freq: 2 },
          { tipo: 'pomba-cinzenta', descricao: 'Pomba cinzenta para oferendas', freq: 3 },
          { tipo: 'ervas-de-protecao', descricao: 'Mistura de ervas protetoras', freq: 1 },
          { tipo: 'cabrito-branco', descricao: 'Cabrito branco para rituais', freq: 2 },
        ] as OfferingRitual[],
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch Ochosi data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}