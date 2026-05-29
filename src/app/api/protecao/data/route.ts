// ============================================================
// PROTEÇÃO API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for spiritual protection
// - Retrieve all protection rituals
// - Retrieve single ritual by ID
// - Retrieve protection types
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

 
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    const rituals = [
      {
        id: 'banho-de-protecao',
        name: 'Banho de Proteção',
        namePt: 'Banho de Proteção - Escudo Espiritual',
        nameEn: 'Protection Bath - Spiritual Shield',
        type: 'cleansing',
        description: 'Ritual de limpeza e proteção espiritual usando ervas sagradas.',
        steps: [
          'Ferva água com folhas de guiné e arruda',
          'Deixe esfriar até temperatura confortável',
          'Despeje sobre o corpo da cabeça aos pés',
          'Mentalize uma barreira de luz ao redor',
          'Repita por 7 dias consecutivos'
        ],
        elements: ['água', 'ervas', 'luz'],
        orixas: ['Oxum', 'Ogum'],
        duration: '15-20 minutos',
        moonPhase: 'crescente'
      },
      {
        id: 'vela-da-protecao',
        name: 'Vela da Proteção',
        namePt: 'Vela da Proteção - Chama Guardiã',
        nameEn: 'Protection Candle - Guardian Flame',
        type: 'ritual',
        description: 'Acender vela para proteção e defesa espiritual.',
        steps: [
          'Escolha uma vela verde ou branca',
          'Purifique o espaço com defumação',
          'Acenda a vela pedindo proteção',
          'Visualize um escudo de luz ao redor',
          'Deixe queimar até o fim naturalmente'
        ],
        elements: ['fogo', 'luz'],
        orixas: ['Oxum', 'Ogum', 'Ibeji'],
        duration: '30-45 minutos'
      },
      {
        id: 'defumacao-protetora',
        name: 'Defumação Protetora',
        namePt: 'Defumação Protetora - Fumaça Sagrada',
        nameEn: 'Protective Smudging - Sacred Smoke',
        type: 'defumacao',
        description: 'Defumação com ervas para criar barreira contra energias negativas.',
        herbs: ['pau-brasil', 'guiné', 'arruda', 'manjericão'],
        steps: [
          'Acenda o fumo em brasa',
          'Passe pela casa no sentido horário',
          'Foque nos cantos e entradas',
          'Mentalize proteção ao passar',
          'Finalize no centro da casa'
        ],
        elements: ['fumo', 'fogo'],
        orixas: ['Ogum', 'Exu'],
        duration: '20-30 minutos'
      },
      {
        id: 'escudo-de-luz',
        name: 'Escudo de Luz',
        namePt: 'Escudo de Luz - Barreira Divina',
        nameEn: 'Light Shield - Divine Barrier',
        type: 'meditation',
        description: 'Meditação para criar escudo energético de proteção.',
        steps: [
          'Sente-se em posição confortável',
          'Feche os olhos e respire profundamente',
          'Visualize uma luz dourada ao redor',
          'Forme um escudo sólido de luz',
          'Sinta a proteção envolver seu corpo'
        ],
        elements: ['luz', 'energia'],
        duration: '10-15 minutos',
        chakra: '7º Coroa'
      },
      {
        id: 'ebori-de-protecao',
        name: 'Ebó de Proteção',
        namePt: 'Ebó de Proteção - Oferta Guardiã',
        nameEn: 'Ebo of Protection - Guardian Offering',
        type: 'ebo',
        description: 'Oferta ritual para proteção e defesa espiritual.',
        offerings: ['farinha de milho', 'quiabo', 'pipoca', ' Dendê'],
        steps: [
          'Prepare a oferenda em recipiente',
          'Coloque em local de grande movimento',
          'Recite oração de proteção',
          'Peça que Exu guarde seus caminhos',
          'Descarte no terreiro após 24h'
        ],
        elements: ['terra', 'sagrado'],
        orixas: ['Exu', 'Ogum'],
        duration: '30 minutos',
        moonPhase: 'qualquer'
      },
      {
        id: 'agua-fluidica',
        name: 'Água Fluidica de Proteção',
        namePt: 'Água Fluidica - Limpador Protetor',
        nameEn: 'Fluidic Water - Protective Cleanser',
        type: 'fluid',
        description: 'Preparar água fluidizada para limpeza e proteção.',
        steps: [
          'Encha um copo com água limpa',
          'Coloque bajo influence de luz lunar',
          'Recite mantras de proteção',
          'Beba pela manhã em jejum',
          'Repita por 7 dias'
        ],
        elements: ['água', 'luz lunar'],
        orixas: ['Oxum'],
        duration: '10 minutos',
        moonPhase: 'cheia'
      },
      {
        id: 'cruz-de-ogum',
        name: 'Cruz de Ogum',
        namePt: 'Cruz de Ogum - Arma Divina Protetora',
        nameEn: 'Ogum Cross - Protective Divine Weapon',
        type: 'talisman',
        description: 'Ritual com cruz de Ogum para proteção militar.',
        steps: [
          'Obtenha uma cruz de Ogum consagrada',
          'Carregue consigo em pequenos viajes',
          'Não mostre a terceiros',
          'Recarregue toda semana',
          'Ao sentir ameaça, segure firme'
        ],
        elements: ['ferro', 'sagrado'],
        orixas: ['Ogum'],
        duration: '5 minutos'
      },
      {
        id: 'cabaça-sagrada',
        name: 'Cabaça Sagrada',
        namePt: 'Cabaça Sagrada - Reservatório Protetor',
        nameEn: 'Sacred Gourd - Protective Reservoir',
        type: 'container',
        description: 'Preparar cabaça com ervas protetoras.',
        herbs: ['guiné', 'alecrim', 'cravo', 'canela'],
        steps: [
          'Prepare cabaça com orifício',
          'Coloque mistura de ervas secas',
          'Consagre com oração',
          'Guarde em lugar sagrado',
          'Use para banhar pessoas em risco'
        ],
        elements: ['planta', 'água'],
        orixas: ['Oxum', 'Nanã'],
        duration: '45 minutos'
      }
    ];

    // Return single ritual by ID
    if (id) {
      const ritual = rituals.find((r) => r.id === id);
      if (!ritual) {
        return NextResponse.json(
          { success: false, error: 'Protection ritual not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: ritual });
    }

    // Return protection types
    if (type === 'types') {
      const types = [
        { name: 'cleansing', description: 'Banhos e limpeza energética', weight: 3 },
        { name: 'ritual', description: 'Rituais com velas e oferendas', weight: 3 },
        { name: 'defumacao', description: 'Defumações e fumo sagrado', weight: 3 },
        { name: 'meditation', description: 'Meditações e visualizações', weight: 3 },
        { name: 'ebo', description: 'Ebós e oferendas especiais', weight: 2 },
        { name: 'fluid', description: 'Águas fluidizadas', weight: 2 },
        { name: 'talisman', description: 'Talismãs e objetos consagrados', weight: 2 },
        { name: 'container', description: 'Recipientes e ferramentas rituais', weight: 2 }
      ];
      return NextResponse.json({ success: true, data: types });
    }

    // Return ritual records only
    if (type === 'records') {
      return NextResponse.json({ success: true, data: rituals });
    }

    // Default — return all protection data
    const response = {
      success: true,
      data: {
        rituals,
        types: [
          { name: 'cleansing', description: 'Banhos e limpeza energética', weight: 3 },
          { name: 'ritual', description: 'Rituais com velas e oferendas', weight: 3 },
          { name: 'defumacao', description: 'Defumações e fumo sagrado', weight: 3 },
          { name: 'meditation', description: 'Meditações e visualizações', weight: 3 },
          { name: 'ebo', description: 'Ebós e oferendas especiais', weight: 2 },
          { name: 'fluid', description: 'Águas fluidizadas', weight: 2 },
          { name: 'talisman', description: 'Talismãs e objetos consagrados', weight: 2 },
          { name: 'container', description: 'Recipientes e ferramentas rituais', weight: 2 }
        ],
        guidance: [
          'Mantenha prática regular de proteção',
          'Combine múltiplas formas de proteção',
          'Renove suas proteções semanalmente',
          'Honre os orixás protetores',
          'Cuide da sua energia primeiro'
        ]
      }
    };

    return NextResponse.json(response);
  } catch (_error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch protection data' },
      { status: 500 }
    );
  }
}