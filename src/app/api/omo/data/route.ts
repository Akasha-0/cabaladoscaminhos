// ============================================================
// OMO DATA API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for Omo data
// - Retrieve Omo configurations
// - Retrieve sacred elements and symbolism
// - Retrieve offerings and rituals
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

interface OmoConfig {
  name: string;
  description: string;
  enabled: boolean;
}

interface SacredElement {
  tipo: string;
  descricao: string;
  energia: string;
}

interface OfferingRitual {
  tipo: string;
  descricao: string;
  freq: number;
}

// GET /api/omo/data - Get Omo data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    // Return single config by type
    if (type === 'config') {
      const configs: OmoConfig[] = [
        { name: 'omo-primary', description: 'Configuração principal de Omo', enabled: true },
        { name: 'omo-elegua-child', description: 'Configuração para Omo Elegua - filho de Elegua', enabled: true },
        { name: 'omo-innocence', description: 'Configuração para energia de inocência e pureza', enabled: true },
      ];
      return NextResponse.json({ success: true, data: configs });
    }

    // Return sacred elements
    if (type === 'elements') {
      const elements: SacredElement[] = [
        { tipo: 'luz-divina', descricao: 'Luz pura e emanacao sagrada', energia: 'Purificacao e renovacao' },
        { tipo: 'inocencia', descricao: 'Estado de pureza e transparencia', energia: 'Protecao e harmonia' },
        { tipo: 'transformacao', descricao: 'Capacidade de mudanca e evolucao', energia: 'Crescimento espiritual' },
        { tipo: 'conexao', descricao: 'Ligacao com a energia criadora', energia: 'Ancestralidade e linhagem' },
        { tipo: 'liberdade', descricao: 'Liberdade de expressao e caminho', energia: 'Abertura e possibilidade' },
      ];
      return NextResponse.json({ success: true, data: elements });
    }

    // Return offerings and rituals
    if (type === 'offerings') {
      const offerings: OfferingRitual[] = [
        { tipo: 'akpessura', descricao: 'Massa de milho e mel', freq: 1 },
        { tipo: 'mel-puro', descricao: 'Mel natural sem adicao', freq: 2 },
        { tipo: 'coco-fresco', descricao: 'Coco fresco cortado', freq: 1 },
        { tipo: 'agua-florida', descricao: 'Agua de florida perfumada', freq: 3 },
        { tipo: 'folhas-verdes', descricao: 'Folhas verdes frescas', freq: 2 },
      ];
      return NextResponse.json({ success: true, data: offerings });
    }

    // Default — return all Omo data
    return NextResponse.json({
      success: true,
      data: {
        configs: [
          { name: 'omo-primary', description: 'Configuração principal de Omo', enabled: true },
          { name: 'omo-elegua-child', description: 'Configuração para Omo Elegua - filho de Elegua', enabled: true },
          { name: 'omo-innocence', description: 'Configuração para energia de inocência e pureza', enabled: true },
        ] as OmoConfig[],
        elements: [
          { tipo: 'luz-divina', descricao: 'Luz pura e emanacao sagrada', energia: 'Purificacao e renovacao' },
          { tipo: 'inocencia', descricao: 'Estado de pureza e transparencia', energia: 'Protecao e harmonia' },
          { tipo: 'transformacao', descricao: 'Capacidade de mudanca e evolucao', energia: 'Crescimento espiritual' },
          { tipo: 'conexao', descricao: 'Ligacao com a energia criadora', energia: 'Ancestralidade e linhagem' },
          { tipo: 'liberdade', descricao: 'Liberdade de expressao e caminho', energia: 'Abertura e possibilidade' },
        ] as SacredElement[],
        offerings: [
          { tipo: 'akpessura', descricao: 'Massa de milho e mel', freq: 1 },
          { tipo: 'mel-puro', descricao: 'Mel natural sem adicao', freq: 2 },
          { tipo: 'coco-fresco', descricao: 'Coco fresco cortado', freq: 1 },
          { tipo: 'agua-florida', descricao: 'Agua de florida perfumada', freq: 3 },
          { tipo: 'folhas-verdes', descricao: 'Folhas verdes frescas', freq: 2 },
        ] as OfferingRitual[],
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch Omo data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}