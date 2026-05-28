// ============================================================
// CHANNEL DATA API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for channel data
// - Retrieve all channel records
// - Retrieve channel categories
// - Retrieve channel metrics
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

interface ChannelRecord {
  id: string;
  name: string;
  description: string;
  type: string;
}

interface ChannelData {
  channels: ChannelRecord[];
  categories: ChannelCategory[];
}

interface ChannelCategory {
  name: string;
  description: string;
  weight: number;
}

function getChannelData(): ChannelData {
  const channels: ChannelRecord[] = [
    { id: 'spiritual', name: 'Espiritual', description: 'Canal de conexão espiritual e energia divina', type: 'spiritual' },
    { id: 'emotional', name: 'Emocional', description: 'Canal de processing emocional e sentimentos', type: 'emotional' },
    { id: 'mental', name: 'Mental', description: 'Canal de pensamento racional e análise', type: 'mental' },
    { id: 'physical', name: 'Físico', description: 'Canal de energia física e vitalidade', type: 'physical' },
    { id: 'creative', name: 'Criativo', description: 'Canal de expressão criativa e artística', type: 'creative' },
    { id: 'relational', name: 'Relacional', description: 'Canal de conexões e relacionamentos', type: 'relational' },
  ];

  const categories: ChannelCategory[] = [
    { name: 'energia', description: 'Fluxo de energia vital e prana', weight: 3 },
    { name: 'intuição', description: 'Conexão com a sabedoria interior', weight: 3 },
    { name: 'manifestação', description: 'Capacidade de criar realidade', weight: 2 },
    { name: 'comunicação', description: 'Transmissão e recebimento de mensagens', weight: 2 },
    { name: 'transformação', description: 'Processo de evolução e mutação', weight: 2 },
  ];

  return { channels, categories };
}

// GET /api/channel/data - Get channel data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    const { channels, categories } = getChannelData();

    // Return single channel by ID
    if (id) {
      const channel = channels.find((c) => c.id === id);
      if (!channel) {
        return NextResponse.json(
          { success: false, error: 'Channel not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: channel });
    }

    // Return channel categories
    if (type === 'categories') {
      return NextResponse.json({ success: true, data: categories });
    }

    // Return channels only
    if (type === 'channels') {
      return NextResponse.json({ success: true, data: channels });
    }

    // Default — return all channel data
    return NextResponse.json({
      success: true,
      data: {
        channels,
        categories,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch channel data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}