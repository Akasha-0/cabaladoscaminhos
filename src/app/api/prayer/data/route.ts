// ============================================================
// PRAYER DATA API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for prayer data
// - Retrieve all prayers
// - Retrieve single prayer by ID
// - Retrieve prayer types
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

 
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    const prayers = [
      {
        id: 'oracao-aterramento',
        name: 'Prece de Aterramento',
        type: 'GROUNDING',
        day: 'SEGUNDA',
        orixá: 'Omolu',
        sephirah: 'Malkuth',
        chakra: '1º Básico',
        element: 'Terra',
        description: 'Prece para conexão com a terra, limpeza espiritual e respeito aos antepassados.',
        affirmation: 'Amo a terra que me sustenta e honro meus ancestrais.',
      },
      {
        id: 'oracao-movimento',
        name: 'Prece de Movimento',
        type: 'MOVEMENT',
        day: 'TERÇA',
        orixá: 'Ogum',
        sephirah: 'Geburah',
        chakra: '2º Sacro',
        element: 'Fogo',
        description: 'Prece para coragem, quebra de demandas e ativação do movimento.',
        affirmation: 'Cortou-se o que não serve. A forças me acompanha.',
      },
      {
        id: 'oracao-justica',
        name: 'Prece de Justiça',
        type: 'BALANCE',
        day: 'QUARTA',
        orixá: 'Xangô',
        sephirah: 'Hod',
        chakra: '3º Plexo Solar',
        element: 'Fogo',
        description: 'Prece pela verdade, equilíbrio mental e sabedoria divina.',
        affirmation: 'A verdade me liberta e a justiça divina me orienta.',
      },
      {
        id: 'oracao-expansao',
        name: 'Prece de Expansão',
        type: 'EXPANSION',
        day: 'QUINTA',
        orixá: 'Oxóssi',
        sephirah: 'Chesed',
        chakra: '4º Cardíaco',
        element: 'Água',
        description: 'Prece pela fartura, conhecimento e cura através das matas.',
        affirmation: 'A abundância flui em minha vida e o conhecimento me ilumina.',
      },
      {
        id: 'oracao-paz',
        name: 'Prece de Paz',
        type: 'SPIRITUAL',
        day: 'SEXTA',
        orixá: 'Oxalá',
        sephirah: 'Kether',
        chakra: '7º Coronário',
        element: 'Éter',
        description: 'Prece de paz absoluta, pureza e conexão direta com o Divino.',
        affirmation: 'A paz me envolve e a luz divina me atravessa.',
      },
      {
        id: 'oracao-amor',
        name: 'Prece de Amor',
        type: 'LOVE',
        day: 'SÁBADO',
        orixá: 'Oxum',
        sephirah: 'Binah',
        chakra: '4º Cardíaco',
        element: 'Água',
        description: 'Prece pelo amor incondicional, intuição e fertilidade.',
        affirmation: 'O amor flui em mim como águas profundas e geradoras.',
      },
      {
        id: 'oracao-vitalidade',
        name: 'Prece de Vitalidade',
        type: 'POWER',
        day: 'DOMINGO',
        orixá: 'Xangô',
        sephirah: 'Tiphereth',
        chakra: '3º Plexo Solar',
        element: 'Fogo',
        description: 'Prece para recarregar a energia vital e alinhar com o propósito de vida.',
        affirmation: 'Minha energia vital transborda e meu propósito brilha.',
      },
      {
        id: 'prece-ancestral',
        name: 'Ligação Ancestral',
        type: 'ANCESTRAL',
        day: 'TODOS',
        orixá: 'Omolu',
        sephirah: 'Yesod',
        chakra: '1º Básico',
        element: 'Terra',
        description: 'Prece de conexão com a ancestors, respeito aos que vieram antes.',
        affirmation: 'Honro meus antepassados que abriram caminhos para mim.',
      },
      {
        id: 'prece-protecao',
        name: 'Invocação de Proteção',
        type: 'PROTECTION',
        day: 'TODOS',
        orixá: 'Ogum',
        sephirah: 'Geburah',
        chakra: '5º Laríngeo',
        element: 'Fogo',
        description: 'Prece de proteção contra energias negativas e demandas.',
        affirmation: 'Minha aura está protegida por forças superiores.',
      },
      {
        id: 'prece-iluminacao',
        name: 'Sopro de Iluminação',
        type: 'ILLUMINATION',
        day: 'TODOS',
        orixá: 'Oxalá',
        sephirah: 'Kether',
        chakra: '7º Coronário',
        element: 'Éter',
        description: 'Prece para abertura da consciência e alinhamento espiritual.',
        affirmation: 'Que a luz divine me ilumine e me guie pelo caminho certo.',
      },
    ];

    // Return single prayer by ID
    if (id) {
      const record = prayers.find((r) => r.id.toLowerCase() === id.toLowerCase());
      if (!record) {
        return NextResponse.json(
          { success: false, error: 'Prayer not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: record });
    }

    // Return prayer types
    if (type === 'types') {
      const types = [
        { name: 'GROUNDING', description: 'Aterramento e conexão com a terra', day: 'SEGUNDA' },
        { name: 'MOVEMENT', description: 'Movimento, coragem e quebra de padrões', day: 'TERÇA' },
        { name: 'BALANCE', description: 'Equilíbrio mental e verdade', day: 'QUARTA' },
        { name: 'EXPANSION', description: 'Fartura e expansão de consciência', day: 'QUINTA' },
        { name: 'SPIRITUAL', description: ' Conexão espiritual direta', day: 'SEXTA' },
        { name: 'LOVE', description: 'Amor incondicional eintuição', day: 'SÁBADO' },
        { name: 'POWER', description: 'Vitalidade e propósito de vida', day: 'DOMINGO' },
        { name: 'ANCESTRAL', description: 'Ligação com ancestrais', day: 'TODOS' },
        { name: 'PROTECTION', description: 'Proteção e defesa espiritual', day: 'TODOS' },
        { name: 'ILLUMINATION', description: 'Iluminação e despertar', day: 'TODOS' },
      ];
      return NextResponse.json({ success: true, data: types });
    }

    // Return prayer records only
    if (type === 'records') {
      return NextResponse.json({ success: true, data: prayers });
    }

    // Default — return all prayer data
    return NextResponse.json({
      success: true,
      data: {
        records: prayers,
        types: [
          { name: 'GROUNDING', description: 'Aterramento e conexão com a terra', day: 'SEGUNDA' },
          { name: 'MOVEMENT', description: 'Movimento, coragem e quebra de padrões', day: 'TERÇA' },
          { name: 'BALANCE', description: 'Equilíbrio mental e verdade', day: 'QUARTA' },
          { name: 'EXPANSION', description: 'Fartura e expansão de consciência', day: 'QUINTA' },
          { name: 'SPIRITUAL', description: 'Conexão espiritual direta', day: 'SEXTA' },
          { name: 'LOVE', description: 'Amor incondicional eintuição', day: 'SÁBADO' },
          { name: 'POWER', description: 'Vitalidade e propósito de vida', day: 'DOMINGO' },
          { name: 'ANCESTRAL', description: 'Ligação com ancestrais', day: 'TODOS' },
          { name: 'PROTECTION', description: 'Proteção e defesa espiritual', day: 'TODOS' },
          { name: 'ILLUMINATION', description: 'Iluminação e despertar', day: 'TODOS' },
        ],
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch prayer data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
