// ============================================================
// ORACLE DATA API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for oracle data
// - Retrieve oracle configurations
// - Retrieve spiritual context options
// - Retrieve arcano mappings
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

interface OracleConfig {
  name: string;
  description: string;
  enabled: boolean;
}

interface ArcanoMapping {
  dia: string;
  arcano: string;
  energia: string;
}

interface CaminhoType {
  tipo: string;
  descricao: string;
  peso: number;
}

// GET /api/oracle/data - Get oracle data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    // Return single config by type
    if (type === 'config') {
      const configs: OracleConfig[] = [
        { name: 'oracle-primary', description: 'Configuração principal do oráculo', enabled: true },
        { name: 'oracle-afirmacao', description: 'Configuração para afirmações oraculares', enabled: true },
        { name: 'oracle-predicao', description: 'Configuração para predições espirituais', enabled: true },
      ];
      return NextResponse.json({ success: true, data: configs });
    }

    // Return arcano mappings
    if (type === 'arcanos') {
      const arcanos: ArcanoMapping[] = [
        { dia: 'domingo', arcano: 'O Sol', energia: 'Iluminação e clareza' },
        { dia: 'segunda', arcano: 'A Lua', energia: 'Intuição e reflexão' },
        { dia: 'terca', arcano: 'O Mago', energia: 'Manifestação e habilidade' },
        { dia: 'quarta', arcano: 'A Imperatriz', energia: 'Fertilidade e abundância' },
        { dia: 'quinta', arcano: 'O Imperador', energia: 'Autoridade e estrutura' },
        { dia: 'sexta', arcano: 'O Hierofante', energia: 'Tradição e ensinamento' },
        { dia: 'sabado', arcano: 'O Mundo', energia: 'Completude e integração' },
      ];
      return NextResponse.json({ success: true, data: arcanos });
    }

    // Return caminho types
    if (type === 'caminhos') {
      const caminhos: CaminhoType[] = [
        { tipo: 'caminho-da-mao-direita', descricao: 'Caminho de luz e evolução positiva', peso: 1 },
        { tipo: 'caminho-da-mao-esquerda', descricao: 'Caminho de sombra e transformação profunda', peso: 1 },
        { tipo: 'caminho-do-meio', descricao: 'Caminho do equilíbrio entre luz e sombra', peso: 1 },
      ];
      return NextResponse.json({ success: true, data: caminhos });
    }

    // Default — return all oracle data
    return NextResponse.json({
      success: true,
      data: {
        configs: [
          { name: 'oracle-primary', description: 'Configuração principal do oráculo', enabled: true },
          { name: 'oracle-afirmacao', description: 'Configuração para afirmações oraculares', enabled: true },
          { name: 'oracle-predicao', description: 'Configuração para predições espirituais', enabled: true },
        ] as OracleConfig[],
        arcanos: [
          { dia: 'domingo', arcano: 'O Sol', energia: 'Iluminação e clareza' },
          { dia: 'segunda', arcano: 'A Lua', energia: 'Intuição e reflexão' },
          { dia: 'terca', arcano: 'O Mago', energia: 'Manifestação e habilidade' },
          { dia: 'quarta', arcano: 'A Imperatriz', energia: 'Fertilidade e abundância' },
          { dia: 'quinta', arcano: 'O Imperador', energia: 'Autoridade e estrutura' },
          { dia: 'sexta', arcano: 'O Hierofante', energia: 'Tradição e ensinamento' },
          { dia: 'sabado', arcano: 'O Mundo', energia: 'Completude e integração' },
        ] as ArcanoMapping[],
        caminhos: [
          { tipo: 'caminho-da-mao-direita', descricao: 'Caminho de luz e evolução positiva', peso: 1 },
          { tipo: 'caminho-da-mao-esquerda', descricao: 'Caminho de sombra e transformação profunda', peso: 1 },
          { tipo: 'caminho-do-meio', descricao: 'Caminho do equilíbrio entre luz e sombra', peso: 1 },
        ] as CaminhoType[],
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch oracle data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}