// ============================================================
// ELEGBA DATA API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for Elegba data
// - Retrieve Elegba configurations
// - Retrieve crossroads symbolism
// - Retrieve energetic attributes
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

interface ElegbaConfig {
  name: string;
  description: string;
  enabled: boolean;
}

interface CrossroadsSymbolism {
  direction: string;
  energia: string;
  significado: string;
}

interface AttributeType {
  tipo: string;
  descricao: string;
  peso: number;
}

// GET /api/elegba/data - Get Elegba data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    // Return single config by type
    if (type === 'config') {
      const configs: ElegbaConfig[] = [
        { name: 'elegba-primary', description: 'Configuração principal de Elegba', enabled: true },
        { name: 'elegba-crossroads', description: 'Configuração para símbolos de encruzilhadas', enabled: true },
        { name: 'elegba-opportunity', description: 'Configuração para energia de oportunidade', enabled: true },
      ];
      return NextResponse.json({ success: true, data: configs });
    }

    // Return crossroads symbolism
    if (type === 'directions') {
      const directions: CrossroadsSymbolism[] = [
        { direction: 'norte', energia: 'Iniciação e novos começos', significado: 'Porta para conhecimento oculto' },
        { direction: 'sul', energia: 'Prosperidade e abundância', significado: 'Porta para manifestacao' },
        { direction: 'leste', energia: 'Iluminação e verdade', significado: 'Porta para despertamento' },
        { direction: 'oeste', energia: 'Transformação e regeneração', significado: 'Porta para renovação' },
      ];
      return NextResponse.json({ success: true, data: directions });
    }

    // Return attribute types
    if (type === 'attributes') {
      const attributes: AttributeType[] = [
        { tipo: 'encruzilhada', descricao: 'Ponto de escolha e decisão', peso: 1 },
        { tipo: 'oportunidade', descricao: 'Momento propício para ação', peso: 1 },
        { tipo: 'limiar', descricao: 'Porta entre mundos', peso: 1 },
      ];
      return NextResponse.json({ success: true, data: attributes });
    }

    // Default — return all Elegba data
    return NextResponse.json({
      success: true,
      data: {
        configs: [
          { name: 'elegba-primary', description: 'Configuração principal de Elegba', enabled: true },
          { name: 'elegba-crossroads', description: 'Configuração para símbolos de encruzilhadas', enabled: true },
          { name: 'elegba-opportunity', description: 'Configuração para energia de oportunidade', enabled: true },
        ] as ElegbaConfig[],
        directions: [
          { direction: 'norte', energia: 'Iniciação e novos começos', significado: 'Porta para conhecimento oculto' },
          { direction: 'sul', energia: 'Prosperidade e abundância', significado: 'Porta para manifestacao' },
          { direction: 'leste', energia: 'Iluminação e verdade', significado: 'Porta para despertamento' },
          { direction: 'oeste', energia: 'Transformação e regeneração', significado: 'Porta para renovação' },
        ] as CrossroadsSymbolism[],
        attributes: [
          { tipo: 'encruzilhada', descricao: 'Ponto de escolha e decisão', peso: 1 },
          { tipo: 'oportunidade', descricao: 'Momento propício para ação', peso: 1 },
          { tipo: 'limiar', descricao: 'Porta entre mundos', peso: 1 },
        ] as AttributeType[],
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch Elegba data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}