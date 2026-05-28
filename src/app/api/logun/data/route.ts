// ============================================================
// LOGUN API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for Logun data
// - Retrieve Logun configurations
// - Retrieve pathways and roads
// - Retrieve offerings and rituals
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

interface LogunConfig {
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

// GET /api/logun/data - Get Logun data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    // Return single config by type
    if (type === 'config') {
      const configs: LogunConfig[] = [
        { name: 'logun-primary', description: 'Configuracao principal de Logun', enabled: true },
        { name: 'logun-duplo', description: 'Configuracao do caminho duplo', enabled: true },
        { name: 'logun-equilibrio', description: 'Configuracao para equilIbrio entre agua e mata', enabled: true },
      ];
      return NextResponse.json({ success: true, data: configs });
    }

    // Return pathways and roads
    if (type === 'pathways') {
      const pathways: PathwayRoad[] = [
        { tipo: 'caminho-agua', descricao: 'Caminho das aguas doces', energia: 'Suavidade e fluidez' },
        { tipo: 'caminho-mata', descricao: 'Caminho da mata e floresta', energia: 'Forca e sobrevivEncia' },
        { tipo: 'cacimba', descricao: 'Caminho da cacimba e poço', energia: 'Profundidade e reflexao' },
        { tipo: 'duplo-caminho', descricao: 'Porta do equilibrio dual', energia: 'Harmonia entre opostos' },
        { tipo: 'arco-agua', descricao: 'Arco na agua sagrada', energia: 'Comunhao com as waters' },
      ];
      return NextResponse.json({ success: true, data: pathways });
    }

    // Return offerings and rituals
    if (type === 'offerings') {
      const offerings: OfferingRitual[] = [
        { tipo: 'milho-torrado', descricao: 'Milho torrado para Logun', freq: 1 },
        { tipo: 'amendoim', descricao: 'Amendoim torrado sagrado', freq: 2 },
        { tipo: 'mel', descricao: 'Mel silvestre para oferendas', freq: 1 },
        { tipo: 'eki-de-obi', descricao: 'Eko de obi para abertura de caminho', freq: 3 },
        { tipo: 'peixe', descricao: 'Peixe fresco em aguas doces', freq: 2 },
      ];
      return NextResponse.json({ success: true, data: offerings });
    }

    // Default — return all Logun data
    return NextResponse.json({
      success: true,
      data: {
        configs: [
          { name: 'logun-primary', description: 'Configuracao principal de Logun', enabled: true },
          { name: 'logun-duplo', description: 'Configuracao do caminho duplo', enabled: true },
          { name: 'logun-equilibrio', description: 'Configuracao para equilIbrio entre agua e mata', enabled: true },
        ] as LogunConfig[],
        pathways: [
          { tipo: 'caminho-agua', descricao: 'Caminho das aguas doces', energia: 'Suavidade e fluidez' },
          { tipo: 'caminho-mata', descricao: 'Caminho da mata e floresta', energia: 'Forca e sobrevivEncia' },
          { tipo: 'cacimba', descricao: 'Caminho da cacimba e poço', energia: 'Profundidade e reflexao' },
          { tipo: 'duplo-caminho', descricao: 'Porta do equilibrio dual', energia: 'Harmonia entre opostos' },
          { tipo: 'arco-agua', descricao: 'Arco na agua sagrada', energia: 'Comunhao com as waters' },
        ] as PathwayRoad[],
        offerings: [
          { tipo: 'milho-torrado', descricao: 'Milho torrado para Logun', freq: 1 },
          { tipo: 'amendoim', descricao: 'Amendoim torrado sagrado', freq: 2 },
          { tipo: 'mel', descricao: 'Mel silvestre para oferendas', freq: 1 },
          { tipo: 'eki-de-obi', descricao: 'Eko de obi para abertura de caminho', freq: 3 },
          { tipo: 'peixe', descricao: 'Peixe fresco em aguas doces', freq: 2 },
        ] as OfferingRitual[],
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch Logun data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
