// ============================================================
// CONEXAO DATA API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for conexao (connection) data
// - Retrieve all connection types
// - Retrieve single connection by ID
// - Retrieve connection patterns and meanings
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

interface ConnectionType {
  id: string;
  name: string;
  category: string;
}

interface ConnectionPattern {
  type: string;
  description: string;
  indicators: string[];
  guidance: string;
}

// GET /api/conexao/data - Get conexao data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    const connections: ConnectionPattern[] = [
      {
        type: 'ancestral',
        description: 'Conexão com ancestrais e lignagens espirituais',
        indicators: ['sensações de presença', 'sonhos significativos', 'intuição fortalecida'],
        guidance: 'Honre seus ancestrais através de rituais de proteção e gratidão.',
      },
      {
        type: 'orixa',
        description: 'Alinhamento com a energia dos Orixás',
        indicators: ['sinais divinatórios', 'conexão emocional profunda', 'sincronicidades'],
        guidance: 'Mantenha práticas devocionais e ofertas regulares.',
      },
      {
        type: 'terrena',
        description: 'Conexão com a energia da Terra e natureza',
        indicators: ['sensação de enraizamento', 'calma em ambientes naturais', 'harmonia corporal'],
        guidance: 'Pratique caminhadas na natureza e ritais de enraizamento.',
      },
      {
        type: 'celestial',
        description: 'Alinhamento com energias cósmicas e astrais',
        indicators: ['claridade mental', 'visões e intuições elevadas', 'expansão de consciência'],
        guidance: 'Medite sob céu aberto e observe as influências planetárias.',
      },
      {
        type: 'comunitario',
        description: 'Conexão com a comunidade e coletivo',
        indicators: ['sentimento de pertencimento', 'colaboração facilitada', 'troca energética positiva'],
        guidance: 'Participe de círculos de cura e atividades coletivas.',
      },
    ];

    // Return single connection by type ID
    if (id) {
      const record = connections.find((r) => r.type.toLowerCase() === id.toLowerCase());
      if (!record) {
        return NextResponse.json(
          { success: false, error: 'Connection type not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: record });
    }

    // Return connection categories
    if (type === 'types') {
      return NextResponse.json({ success: true, data: connections });
    }

    // Return connection types only
    if (type === 'records') {
      return NextResponse.json({ success: true, data: connections });
    }

    // Default — return all conexao data
    return NextResponse.json({
      success: true,
      data: {
        records: connections,
        connectionTypes: [
          { id: 'ancestral', name: 'Conexão Ancestral', category: 'espiritual' },
          { id: 'orixa', name: 'Alinhamento com Orixás', category: 'divino' },
          { id: 'terrena', name: 'Energia Terrena', category: 'natural' },
          { id: 'celestial', name: 'Energia Celestial', category: 'cósmico' },
          { id: 'comunitario', name: 'Conexão Comunitária', category: 'coletivo' },
        ] as ConnectionType[],
      },
    });
  } catch (_error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch conexao data',
        message: _error instanceof Error ? _error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
