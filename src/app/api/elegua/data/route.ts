// ============================================================
// ELEGUA DATA API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for Elegua data
// - Retrieve Elegua configurations
// - Retrieve pathways and roads
// - Retrieve offerings and rituals
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

interface EleguaConfig {
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

// GET /api/elegua/data - Get Elegua data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    // Return single config by type
    if (type === 'config') {
      const configs: EleguaConfig[] = [
        { name: 'elegua-primary', description: 'Configuração principal de Elegua', enabled: true },
        { name: 'elegua crossroads', description: 'Configuração para cruzamentos e encruzilhadas', enabled: true },
        { name: 'elegua-destiny', description: 'Configuração para destino e caminho', enabled: true },
      ];
      return NextResponse.json({ success: true, data: configs });
    }

    // Return pathways and roads
    if (type === 'pathways') {
      const pathways: PathwayRoad[] = [
        { tipo: 'caminho-aberto', descricao: 'Caminho aberto e favoravel', energia: 'Luz e prosperidade' },
        { tipo: 'caminho-bloqueado', descricao: 'Caminho bloqueado necessitando intervencao', energia: 'Sombra e transformacao' },
        { tipo: 'encruzilhada', descricao: 'Encruzilhada de escolhas e destinos', energia: 'Decisao e oportunidade' },
        { tipo: 'porta-aberta', descricao: 'Porta aberta para novas possibilidades', energia: 'Inicio e renovacao' },
        { tipo: 'porta-fechada', descricao: 'Porta fechada que precisa ser aberta', energia: 'Barreira e superacao' },
      ];
      return NextResponse.json({ success: true, data: pathways });
    }

    // Return offerings and rituals
    if (type === 'offerings') {
      const offerings: OfferingRitual[] = [
        { tipo: 'akpessura', descricao: 'Massa de milho e mel', freq: 1 },
        { tipo: 'otosi', descricao: 'Cachorro sagrado de Elegua', freq: 3 },
        { tipo: 'coco-vela', descricao: 'Coco com vela acesa', freq: 2 },
        { tipo: 'dende', descricao: 'Oleo de dendem', freq: 1 },
        { tipo: 'efun', descricao: 'Giz branco e vermelho', freq: 2 },
      ];
      return NextResponse.json({ success: true, data: offerings });
    }

    // Default — return all Elegua data
    return NextResponse.json({
      success: true,
      data: {
        configs: [
          { name: 'elegua-primary', description: 'Configuração principal de Elegua', enabled: true },
          { name: 'elegua-crossroads', description: 'Configuração para cruzamentos e encruzilhadas', enabled: true },
          { name: 'elegua-destiny', description: 'Configuração para destino e caminho', enabled: true },
        ] as EleguaConfig[],
        pathways: [
          { tipo: 'caminho-aberto', descricao: 'Caminho aberto e favoravel', energia: 'Luz e prosperidade' },
          { tipo: 'caminho-bloqueado', descricao: 'Caminho bloqueado necessitando intervencao', energia: 'Sombra e transformacao' },
          { tipo: 'encruzilhada', descricao: 'Encruzilhada de escolhas e destinos', energia: 'Decisao e oportunidade' },
          { tipo: 'porta-aberta', descricao: 'Porta aberta para novas possibilidades', energia: 'Inicio e renovacao' },
          { tipo: 'porta-fechada', descricao: 'Porta fechada que precisa ser aberta', energia: 'Barreira e superacao' },
        ] as PathwayRoad[],
        offerings: [
          { tipo: 'akpessura', descricao: 'Massa de milho e mel', freq: 1 },
          { tipo: 'otosi', descricao: 'Cachorro sagrado de Elegua', freq: 3 },
          { tipo: 'coco-vela', descricao: 'Coco com vela acesa', freq: 2 },
          { tipo: 'dende', descricao: 'Oleo de dendem', freq: 1 },
          { tipo: 'efun', descricao: 'Giz branco e vermelho', freq: 2 },
        ] as OfferingRitual[],
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch Elegua data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
