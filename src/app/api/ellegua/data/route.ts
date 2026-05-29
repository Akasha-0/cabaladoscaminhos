// ============================================================
// ELLEGUA DATA API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for Ellegua data
// - Retrieve Ellegua configurations
// - Retrieve path-opening symbolism
// - Retrieve energetic attributes
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

interface ElleguaConfig {
  name: string;
  description: string;
  enabled: boolean;
}

interface PathSymbolism {
  direction: string;
  energia: string;
  significado: string;
}

interface AttributeType {
  tipo: string;
  descricao: string;
  peso: number;
}

// GET /api/ellegua/data - Get Ellegua data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    // Return single config by type
    if (type === 'config') {
      const configs: ElleguaConfig[] = [
        { name: 'ellegua-primary', description: 'Configuração principal de Ellegua', enabled: true },
        { name: 'ellegua-path-opener', description: 'Configuração para abertura de caminhos', enabled: true },
        { name: 'ellegua-guardian', description: 'Configuração para energia de proteção', enabled: true },
      ];
      return NextResponse.json({ success: true, data: configs });
    }

    // Return path symbolism
    if (type === 'directions') {
      const directions: PathSymbolism[] = [
        { direction: 'norte', energia: 'Iniciação e novos começos', significado: 'Porta para conhecimento oculto' },
        { direction: 'sul', energia: 'Prosperidade e abundância', significado: 'Porta para manifestação' },
        { direction: 'leste', energia: 'Iluminação e verdade', significado: 'Porta para despertamento' },
        { direction: 'oeste', energia: 'Transformação e regeneração', significado: 'Porta para renovação' },
      ];
      return NextResponse.json({ success: true, data: directions });
    }

    // Return attribute types
    if (type === 'attributes') {
      const attributes: AttributeType[] = [
        { tipo: 'abridor-de-caminhos', descricao: 'Abre novas possibilidades e direções', peso: 1 },
        { tipo: 'guardião', descricao: 'Protege e vigia os caminhos', peso: 1 },
        { tipo: 'mediador', descricao: 'Conecta mundos e dimensões', peso: 1 },
      ];
      return NextResponse.json({ success: true, data: attributes });
    }

    // Default — return all Ellegua data
    return NextResponse.json({
      success: true,
      data: {
        configs: [
          { name: 'ellegua-primary', description: 'Configuração principal de Ellegua', enabled: true },
          { name: 'ellegua-path-opener', description: 'Configuração para abertura de caminhos', enabled: true },
          { name: 'ellegua-guardian', description: 'Configuração para energia de proteção', enabled: true },
        ] as ElleguaConfig[],
        directions: [
          { direction: 'norte', energia: 'Iniciação e novos começos', significado: 'Porta para conhecimento oculto' },
          { direction: 'sul', energia: 'Prosperidade e abundância', significado: 'Porta para manifestação' },
          { direction: 'leste', energia: 'Iluminação e verdade', significado: 'Porta para despertamento' },
          { direction: 'oeste', energia: 'Transformação e regeneração', significado: 'Porta para renovação' },
        ] as PathSymbolism[],
        attributes: [
          { tipo: 'abridor-de-caminhos', descricao: 'Abre novas possibilidades e direções', peso: 1 },
          { tipo: 'guardião', descricao: 'Protege e vigia os caminhos', peso: 1 },
          { tipo: 'mediador', descricao: 'Conecta mundos e dimensões', peso: 1 },
        ] as AttributeType[],
      },
    });
  } catch (_error) {
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch Ellegua data',
        message: _error instanceof Error ? _error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}