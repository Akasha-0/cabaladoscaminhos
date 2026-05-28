// ============================================================
// OBALUAYE DATA API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for Obaluaye data
// - Retrieve Obaluaye configurations
// - Retrieve protections and wards
// - Retrieve offerings and rituals
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

interface ObaluayeConfig {
  name: string;
  description: string;
  enabled: boolean;
}

interface ProtectionWard {
  tipo: string;
  descricao: string;
  energia: string;
}

interface OfferingRitual {
  tipo: string;
  descricao: string;
  freq: number;
}

// GET /api/obaluaye/data - Get Obaluaye data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    // Return single config by type
    if (type === 'config') {
      const configs: ObaluayeConfig[] = [
        { name: 'obaluaye-primary', description: 'Configuração principal de Obaluaye', enabled: true },
        { name: 'obaluaye-protection', description: 'Configuração para proteção e cura', enabled: true },
        { name: 'obaluaye-sickness', description: 'Configuração para doenças e epidemias', enabled: true },
      ];
      return NextResponse.json({ success: true, data: configs });
    }

    // Return protections and wards
    if (type === 'protections') {
      const protections: ProtectionWard[] = [
        { tipo: 'protecao-contra-doenca', descricao: 'Proteção contra doenças e epidemias', energia: 'Sagrado e purificador' },
        { tipo: 'cura-divina', descricao: 'Cura divina através de Obaluaye', energia: 'Luz e restauração' },
        { tipo: 'limpeza-energetica', descricao: 'Limpeza de energias negativas', energia: 'Purificação e renovação' },
        { tipo: 'barreira-sagrada', descricao: 'Barreira sagrada contra pragas', energia: 'Defesa e proteção' },
        { tipo: 'ritual-saude', descricao: 'Ritual para restauração da saúde', energia: 'Equilíbrio e bem-estar' },
      ];
      return NextResponse.json({ success: true, data: protections });
    }

    // Return offerings and rituals
    if (type === 'offerings') {
      const offerings: OfferingRitual[] = [
        { tipo: 'akpessura', descricao: 'Massa de milho e mel', freq: 1 },
        { tipo: 'ogoró', descricao: 'Fruta sagrada de Obaluaye', freq: 3 },
        { tipo: 'ekura', descricao: 'Cinzel e ferramentas rituais', freq: 2 },
        { tipo: 'dende', descricao: 'Óleo de dendê', freq: 1 },
        { tipo: 'obí', descricao: 'Nozes de obí para adivinhação', freq: 2 },
      ];
      return NextResponse.json({ success: true, data: offerings });
    }

    // Default — return all Obaluaye data
    return NextResponse.json({
      success: true,
      data: {
        configs: [
          { name: 'obaluaye-primary', description: 'Configuração principal de Obaluaye', enabled: true },
          { name: 'obaluaye-protection', description: 'Configuração para proteção e cura', enabled: true },
          { name: 'obaluaye-sickness', description: 'Configuração para doenças e epidemias', enabled: true },
        ] as ObaluayeConfig[],
        protections: [
          { tipo: 'protecao-contra-doenca', descricao: 'Proteção contra doenças e epidemias', energia: 'Sagrado e purificador' },
          { tipo: 'cura-divina', descricao: 'Cura divina através de Obaluaye', energia: 'Luz e restauração' },
          { tipo: 'limpeza-energetica', descricao: 'Limpeza de energias negativas', energia: 'Purificação e renovação' },
          { tipo: 'barreira-sagrada', descricao: 'Barreira sagrada contra pragas', energia: 'Defesa e proteção' },
          { tipo: 'ritual-saude', descricao: 'Ritual para restauração da saúde', energia: 'Equilíbrio e bem-estar' },
        ] as ProtectionWard[],
        offerings: [
          { tipo: 'akpessura', descricao: 'Massa de milho e mel', freq: 1 },
          { tipo: 'ogoró', descricao: 'Fruta sagrada de Obaluaye', freq: 3 },
          { tipo: 'ekura', descricao: 'Cinzel e ferramentas rituais', freq: 2 },
          { tipo: 'dende', descricao: 'Óleo de dendê', freq: 1 },
          { tipo: 'obí', descricao: 'Nozes de obí para adivinhação', freq: 2 },
        ] as OfferingRitual[],
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch Obaluaye data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
