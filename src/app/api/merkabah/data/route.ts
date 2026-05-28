// ============================================================
// MERKABAH DATA API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for merkabah data
// - Retrieve all merkabah stages
// - Retrieve merkabah categories and types
// ============================================================
/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from 'next/server';

// Merkabah stage definitions
const MERKABAH_STAGES = [
  { id: 'contemplation', name: 'Contemplação', type: 'awakening', description: 'Início da jornada merkabah — silêncio interior e escuta profunda.', elements: ['respiraçao', 'meditaçao', 'visualizaçao'], symbolism: 'O véu se ergue.' },
  { id: 'breath', name: 'Respiração Sagrada', type: 'activation', description: 'respiraçao conscious conecta corpo ao veículo de luz.', elements: ['ar', 'prana', 'chi'], symbolism: 'O sopro da vida.' },
  { id: 'embodiment', name: 'Corpificação', type: 'integration', description: 'Ancorar a energia merkabah no corpo físico.', elements: ['terra', 'corpo', 'estrutura'], symbolism: 'A luz se encontra com a forma.' },
  { id: 'activation', name: 'Ativação', type: 'integration', description: 'Despertar o merkabah dormente através de práticas sagradas.', elements: ['fogo', 'kundalini', 'shakti'], symbolism: 'A centelha se acende.' },
  { id: 'expansion', name: 'Expansão', type: 'transcendence', description: 'Expandir a consciência através das dimensões sutis.', elements: ['éter', 'akasha', 'vazio'], symbolism: 'O espaço se dissolve.' },
  { id: 'harmony', name: 'Harmonia', type: 'transcendence', description: 'Integrar todos os aspectos do ser em_UNIFIED campo.', elements: ['água', 'yin', 'receptividade'], symbolism: 'O río encontra o mar.' },
  { id: 'ascension', name: 'Ascensão', type: 'transcendence', description: 'Elevar a consciência para frequências mais altas.', elements: ['fogo', 'yang', 'emisso'], symbolism: 'A chama sobe.' },
  { id: 'completion', name: 'Completação', type: 'mastery', description: 'Realizar o potencial completo do merkabah.', elements: ['luz', 'ouro', 'transcendência'], symbolism: 'A luz se torna una.' },
];

// GET /api/merkabah/data - Get merkabah data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    // Return single stage by ID
    if (id) {
      const stage = MERKABAH_STAGES.find((s) => s.id === id);
      if (!stage) {
        return NextResponse.json(
          { success: false, error: 'Merkabah stage not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: stage });
    }

    // Return merkabah categories
    if (type === 'categories') {
      const categories = [
        { name: 'awakening', label: 'Despertar', description: 'Estágios iniciais de reconhecimento', weight: 3 },
        { name: 'activation', label: 'Ativação', description: 'Práticas que despertam a energia merkabah', weight: 3 },
        { name: 'integration', label: 'Integração', description: 'Ancoramento e harmonics', weight: 2 },
        { name: 'transcendence', label: 'Transcendência', description: 'Expansão além do ego', weight: 1 },
        { name: 'mastery', label: 'Mestria', description: 'Realização completa do merkabah', weight: 1 },
      ];
      return NextResponse.json({ success: true, data: categories });
    }

    // Return stages only
    if (type === 'stages') {
      return NextResponse.json({ success: true, data: MERKABAH_STAGES });
    }

    // Default — return all merkabah data
    return NextResponse.json({
      success: true,
      data: {
        stages: MERKABAH_STAGES,
        categories: [
          { name: 'awakening', label: 'Despertar', description: 'Estágios iniciais de reconhecimento', weight: 3 },
          { name: 'activation', label: 'Ativação', description: 'Práticas que despertam a energia merkabah', weight: 3 },
          { name: 'integration', label: 'Integração', description: 'Ancoramento e harmonics', weight: 2 },
          { name: 'transcendence', label: 'Transcendência', description: 'Expansão além do ego', weight: 1 },
          { name: 'mastery', label: 'Mestria', description: 'Realização completa do merkabah', weight: 1 },
        ],
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch merkabah data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
