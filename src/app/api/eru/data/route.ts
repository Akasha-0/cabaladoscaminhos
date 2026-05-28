// ============================================================
// ERU DATA API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for Eru ritual substance data
// - Eru as sacred ritual powder in Ifá traditions
// - Preparation and application methods
// - Spiritual properties and uses
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const eruData: any = {};

// ============================================================
// TYPES
// ============================================================

export interface EruConfig {
  name: string;
  description: string;
  enabled: boolean;
}

export interface EruType {
  tipo: string;
  descricao: string;
  origem: string;
  uso: string;
}

export interface EruProperty {
  propriedade: string;
  energia: string;
  aplicacao: string;
}

// ============================================================
// ERU DATA
// ============================================================

const ERU_CONFIGS: EruConfig[] = [
  { name: 'eru-primary', description: 'Configuração principal de Eru', enabled: true },
  { name: 'eru-powder', description: 'Configuração para Eru em pó', enabled: true },
  { name: 'eru-ritual', description: 'Configuração para práticas rituais', enabled: true },
];

const ERU_TYPES: EruType[] = [
  { tipo: 'eru-em-po', descricao: 'Eru preparado em forma de pó para oferendas e ebós', origem: 'Tradição Ifá/Yorubá', uso: 'Oferendas, purificação, proteção' },
  { tipo: 'eru-fresco', descricao: 'Eru fresco utilizado em práticas de Ossaim', origem: 'Tradição Ifá/Yorubá', uso: 'Cura, limpeza espiritual' },
  { tipo: 'eru-de-azeite', descricao: 'Mistura de Eru com azeite de dendê', origem: 'Tradição Ifá/Yorubá', uso: 'Unção, abertura de caminhos' },
];

const ERU_PROPERTIES: EruProperty[] = [
  { propriedade: 'purificacao', energia: 'Energia de limpeza e renovação espiritual', aplicacao: 'Usado em ebós de purificação e limpeza de espaços' },
  { propriedade: 'protecao', energia: 'Energia de escudo e defesa espiritual', aplicacao: 'Proteção de caminhos e pessoas' },
  { propriedade: 'abertura', energia: 'Energia de facilitação e novos começos', aplicacao: 'Abertura de caminhos bloqueados' },
  { propriedade: 'conexao', energia: 'Energia de comunicação com o sagrado', aplicacao: 'Conexão com orixás e forças espirituais' },
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getConfigByName(name: string): EruConfig | undefined {
  return ERU_CONFIGS.find(c => c.name === name);
}

function getEruTypes(): EruType[] {
  return ERU_TYPES;
}

function getEruProperties(): EruProperty[] {
  return ERU_PROPERTIES;
}

// ============================================================
// API ROUTE HANDLERS
// ============================================================

/**
 * GET /api/eru/data
 * Retrieve Eru data with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    // Return single config by type
    if (type === 'config') {
      const configName = searchParams.get('name');
      if (configName) {
        const config = getConfigByName(configName);
        if (!config) {
          return NextResponse.json({ success: false, error: 'Config not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: config });
      }
      return NextResponse.json({ success: true, data: ERU_CONFIGS });
    }

    // Return Eru types
    if (type === 'types') {
      return NextResponse.json({ success: true, data: ERU_TYPES });
    }

    // Return Eru properties
    if (type === 'properties') {
      return NextResponse.json({ success: true, data: ERU_PROPERTIES });
    }

    // Default — return all Eru data
    return NextResponse.json({
      success: true,
      data: {
        configs: ERU_CONFIGS as EruConfig[],
        types: ERU_TYPES as EruType[],
        properties: ERU_PROPERTIES as EruProperty[],
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch Eru data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
