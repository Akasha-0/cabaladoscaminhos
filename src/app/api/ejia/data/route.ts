// ============================================================
// EJI A DATA API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for Ejia data
// - Retrieve Ejia configurations
// - Retrieve spiritual correspondences
// - Retrieve energy mappings
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

interface EjiaConfig {
  name: string;
  description: string;
  enabled: boolean;
}

interface CorrespondenceMapping {
  element: string;
  energy: string;
  practice: string;
}

interface EnergyMapping {
  level: string;
  description: string;
  intensity: number;
}

// GET /api/ejia/data - Get Ejia data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    // Return single config by type
    if (type === 'config') {
      const configs: EjiaConfig[] = [
        { name: 'ejia-primary', description: 'Configuração principal do Ejia', enabled: true },
        { name: 'ejia-meditacao', description: 'Configuração para meditação Ejia', enabled: true },
        { name: 'ejia-sagrado', description: 'Configuração para práticas sagradas Ejia', enabled: true },
      ];
      return NextResponse.json({ success: true, data: configs });
    }

    // Return correspondence mappings
    if (type === 'correspondences') {
      const correspondences: CorrespondenceMapping[] = [
        { element: 'luz', energy: 'Iluminação interior', practice: 'Contemplação' },
        { element: 'sabedoria', energy: 'Conhecimento profundo', practice: 'Estudo sagrado' },
        { element: 'transformacao', energy: 'Renovação espiritual', practice: 'Ritual de passagem' },
        { element: 'equilibrio', energy: 'Harmonia universal', practice: 'Meditação balanceada' },
        { element: 'protecao', energy: 'Escudo energético', practice: 'Invocação protetora' },
        { element: 'expansao', energy: 'Crescimento espiritual', practice: 'Expansão de consciência' },
      ];
      return NextResponse.json({ success: true, data: correspondences });
    }

    // Return energy mappings
    if (type === 'energies') {
      const energies: EnergyMapping[] = [
        { level: 'iniciatico', description: 'Primeiro nível de conexão Ejia', intensity: 1 },
        { level: 'intermediario', description: 'Nível médio de prática Ejia', intensity: 2 },
        { level: 'avancado', description: 'Nível profundo de domínio Ejia', intensity: 3 },
        { level: 'mestria', description: 'Domínio completo da energia Ejia', intensity: 4 },
      ];
      return NextResponse.json({ success: true, data: energies });
    }

    // Default — return all Ejia data
    return NextResponse.json({
      success: true,
      data: {
        configs: [
          { name: 'ejia-primary', description: 'Configuração principal do Ejia', enabled: true },
          { name: 'ejia-meditacao', description: 'Configuração para meditação Ejia', enabled: true },
          { name: 'ejia-sagrado', description: 'Configuração para práticas sagradas Ejia', enabled: true },
        ] as EjiaConfig[],
        correspondences: [
          { element: 'luz', energy: 'Iluminação interior', practice: 'Contemplação' },
          { element: 'sabedoria', energy: 'Conhecimento profundo', practice: 'Estudo sagrado' },
          { element: 'transformacao', energy: 'Renovação espiritual', practice: 'Ritual de passagem' },
          { element: 'equilibrio', energy: 'Harmonia universal', practice: 'Meditação balanceada' },
          { element: 'protecao', energy: 'Escudo energético', practice: 'Invocação protetora' },
          { element: 'expansao', energy: 'Crescimento espiritual', practice: 'Expansão de consciência' },
        ] as CorrespondenceMapping[],
        energies: [
          { level: 'iniciatico', description: 'Primeiro nível de conexão Ejia', intensity: 1 },
          { level: 'intermediario', description: 'Nível médio de prática Ejia', intensity: 2 },
          { level: 'avancado', description: 'Nível profundo de domínio Ejia', intensity: 3 },
          { level: 'mestria', description: 'Domínio completo da energia Ejia', intensity: 4 },
        ] as EnergyMapping[],
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch Ejia data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
