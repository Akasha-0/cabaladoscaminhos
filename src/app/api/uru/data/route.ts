// ============================================================
// URU DATA API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for Uru data
// - Retrieve Uru configurations
// - Retrieve sacred attributes
// - Retrieve divine symbolism
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

interface UruConfig {
  name: string;
  description: string;
  enabled: boolean;
}

interface SacredAttribute {
  tipo: string;
  descricao: string;
  peso: number;
}

interface DivineSymbolism {
  aspecto: string;
  energia: string;
  significado: string;
}

// GET /api/uru/data - Get Uru data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    // Return single config by type
    if (type === 'config') {
      const configs: UruConfig[] = [
        { name: 'uru-sacred', description: 'Configuracao sagrada de Uru', enabled: true },
        { name: 'uru-divine', description: 'Configuracao para energia divina', enabled: true },
        { name: 'uru-transcendental', description: 'Configuracao transcendental', enabled: true },
      ];
      return NextResponse.json({ success: true, data: configs });
    }

    // Return sacred attributes
    if (type === 'attributes') {
      const attributes: SacredAttribute[] = [
        { tipo: 'sagrado', descricao: 'Qualidade sagrada e pura', peso: 1 },
        { tipo: 'divino', descricao: 'Energia de origem divina', peso: 1 },
        { tipo: 'transcendente', descricao: 'Alem da compreensão mortal', peso: 1 },
      ];
      return NextResponse.json({ success: true, data: attributes });
    }

    // Return divine symbolism
    if (type === 'symbolism') {
      const aspects: DivineSymbolism[] = [
        { aspecto: 'luz', energia: 'Luz divina e purificadora', significado: 'Iluminacao espiritual' },
        { aspecto: 'pureza', energia: 'Pureza absoluta', significado: 'Estado de graça' },
        { aspecto: 'ascensao', energia: 'Elevacao espiritual', significado: 'Caminho de retorno ao divino' },
        { aspecto: 'unidade', energia: 'Uniao com o todo', significado: 'Dissolucao dos limites do ego' },
      ];
      return NextResponse.json({ success: true, data: aspects });
    }

    // Default — return all Uru data
    return NextResponse.json({
      success: true,
      data: {
        configs: [
          { name: 'uru-sacred', description: 'Configuracao sagrada de Uru', enabled: true },
          { name: 'uru-divine', description: 'Configuracao para energia divina', enabled: true },
          { name: 'uru-transcendental', description: 'Configuracao transcendental', enabled: true },
        ] as UruConfig[],
        attributes: [
          { tipo: 'sagrado', descricao: 'Qualidade sagrada e pura', peso: 1 },
          { tipo: 'divino', descricao: 'Energia de origem divina', peso: 1 },
          { tipo: 'transcendente', descricao: 'Alem da compreensão mortal', peso: 1 },
        ] as SacredAttribute[],
        symbolism: [
          { aspecto: 'luz', energia: 'Luz divina e purificadora', significado: 'Iluminacao espiritual' },
          { aspecto: 'pureza', energia: 'Pureza absoluta', significado: 'Estado de graça' },
          { aspecto: 'ascensao', energia: 'Elevacao espiritual', significado: 'Caminho de retorno ao divino' },
          { aspecto: 'unidade', energia: 'Uniao com o todo', significado: 'Dissolucao dos limites do ego' },
        ] as DivineSymbolism[],
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch Uru data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}