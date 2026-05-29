 
// prettier-ignore

// ============================================================
// ALAGBEDO DATA API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for Alagbedo data
// - Retrieve Alagbedo configurations
// - Retrieve light frequencies and harmonics
// - Retrieve ascension practices
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

interface AlagbedoConfig {
  name: string;
  description: string;
  enabled: boolean;
}

interface LightFrequency {
  tipo: string;
  descricao: string;
  cor: string;
  harmonico: number;
}

interface AscensionPractice {
  tipo: string;
  descricao: string;
  nivel: number;
}

// GET /api/alagbedo/data - Get Alagbedo data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    // Return single config by type
    if (type === 'config') {
      const configs: AlagbedoConfig[] = [
        { name: 'alagbedo-primary', description: 'Configuração principal de Alagbedo', enabled: true },
        { name: 'alagbedo-light', description: 'Configuração para frequência de luz branca', enabled: true },
        { name: 'alagbedo-purity', description: 'Configuração para purificação e claridade', enabled: true },
      ];
      return NextResponse.json({ success: true, data: configs });
    }

    // Return light frequencies and harmonics
    if (type === 'frequencies') {
      const frequencies: LightFrequency[] = [
        { tipo: 'luz-branca', descricao: 'Luz branca pura da claridade mental', cor: '#FFFFFF', harmonico: 1 },
        { tipo: 'luz-dourada', descricao: 'Luz dourada da sabedoria divina', cor: '#FFD700', harmonico: 2 },
        { tipo: 'luz-celeste', descricao: 'Luz celeste do plano espiritual', cor: '#87CEEB', harmonico: 3 },
        { tipo: 'luz-arc-en-ciel', descricao: 'Luz arco-íris da integração total', cor: '#FF6B6B', harmonico: 7 },
        { tipo: 'luz-violem', descricao: 'Luz violeta da transformação superior', cor: '#EE82EE', harmonico: 5 },
      ];
      return NextResponse.json({ success: true, data: frequencies });
    }

    // Return ascension practices
    if (type === 'practices') {
      const practices: AscensionPractice[] = [
        { tipo: 'meditacao-luz', descricao: 'Meditação de imersão na luz branca', nivel: 1 },
        { tipo: 'visualizacao-cristal', descricao: 'Visualização de clareza cristalina', nivel: 2 },
        { tipo: 'protecao-luz', descricao: 'Projeção de campo de luz protetora', nivel: 3 },
        { tipo: 'integracao-cosmica', descricao: 'Integração com a consciência cósmica', nivel: 5 },
        { tipo: 'ascensao-final', descricao: 'Ascensão final para o plano divino', nivel: 7 },
      ];
      return NextResponse.json({ success: true, data: practices });
    }

    // Default — return all Alagbedo data
    return NextResponse.json({
      success: true,
      data: {
        configs: [
          { name: 'alagbedo-primary', description: 'Configuração principal de Alagbedo', enabled: true },
          { name: 'alagbedo-light', description: 'Configuração para frequência de luz branca', enabled: true },
          { name: 'alagbedo-purity', description: 'Configuração para purificação e claridade', enabled: true },
        ] as AlagbedoConfig[],
        frequencies: [
          { tipo: 'luz-branca', descricao: 'Luz branca pura da claridade mental', cor: '#FFFFFF', harmonico: 1 },
          { tipo: 'luz-dourada', descricao: 'Luz dourada da sabedoria divina', cor: '#FFD700', harmonico: 2 },
          { tipo: 'luz-celeste', descricao: 'Luz celeste do plano espiritual', cor: '#87CEEB', harmonico: 3 },
          { tipo: 'luz-arc-en-ciel', descricao: 'Luz arco-íris da integração total', cor: '#FF6B6B', harmonico: 7 },
          { tipo: 'luz-violem', descricao: 'Luz violeta da transformação superior', cor: '#EE82EE', harmonico: 5 },
        ] as LightFrequency[],
        practices: [
          { tipo: 'meditacao-luz', descricao: 'Meditação de imersão na luz branca', nivel: 1 },
          { tipo: 'visualizacao-cristal', descricao: 'Visualização de clareza cristalina', nivel: 2 },
          { tipo: 'protecao-luz', descricao: 'Projeção de campo de luz protetora', nivel: 3 },
          { tipo: 'integracao-cosmica', descricao: 'Integração com a consciência cósmica', nivel: 5 },
          { tipo: 'ascensao-final', descricao: 'Ascensão final para o plano divino', nivel: 7 },
        ] as AscensionPractice[],
      },
    });
  } catch (_error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch Alagbedo data',
        message: _error instanceof Error ? _error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}