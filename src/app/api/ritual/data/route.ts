// ============================================================
// RITUAL DATA API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for ritual data
// - Retrieve all rituals
// - Retrieve single ritual by ID
// - Retrieve ritual categories
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

 
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    const rituals = [
      {
        id: 'ritual-aterramento',
        name: 'Ritual de Aterramento',
        category: 'GROUNDING',
        day: 'SEGUNDA',
        orixá: 'Omolu',
        sephirah: 'Malkuth',
        chakra: '1º Básico',
        element: 'Terra',
        description: 'Ritual para ancorar a energia espiritual no plano físico e conectar-se com os ancestrais.',
        steps: [
          'Acenda uma vela marrom ou preta',
          'Coloque terra em um prato',
          'Recite a oração de aterramento',
          'Visualize raízes descendo',
          'Agradeça aos ancestrais'
        ],
      },
      {
        id: 'ritual-protecao',
        name: 'Ritual de Proteção',
        category: 'PROTECTION',
        day: 'TERÇA',
        orixá: 'Ogum',
        sephirah: 'Geburah',
        chakra: '5º Laríngeo',
        element: 'Fogo',
        description: 'Ritual para criar um escudo de proteção contra energias negativas e demandas.',
        steps: [
          'Acenda uma vela vermelha',
          'Corte um limão ao meio',
          'Coloque sal grosso sobre o limão',
          'Recite a oração de proteção',
          'Descarte o limão fora de casa'
        ],
      },
      {
        id: 'ritual-abundancia',
        name: 'Ritual de Abundância',
        category: 'ABUNDANCE',
        day: 'QUINTA',
        orixá: 'Oxóssi',
        sephirah: 'Chesed',
        chakra: '4º Cardíaco',
        element: 'Água',
        description: 'Ritual para atrair prosperidade, fartura e conhecimento.',
        steps: [
          'Acenda uma vela azul',
          'Coloque água em um copo de vidro',
          'Adicione moedas de cobre',
          'Recite a oração de abundância',
          'Guarde a água por sete dias'
        ],
      },
      {
        id: 'ritual-paz',
        name: 'Ritual de Paz Interior',
        category: 'PEACE',
        day: 'SEXTA',
        orixá: 'Oxalá',
        sephirah: 'Kether',
        chakra: '7º Coronário',
        element: 'Éter',
        description: 'Ritual para buscar paz absoluta, pureza e conexão direta com o Divino.',
        steps: [
          'Acenda uma vela branca',
          'Queime incenso de alfazema',
          'Sente-se em silêncio',
          'Recite a oração de paz',
          'Visualize luz branca envolvendo seu corpo'
        ],
      },
      {
        id: 'ritual-amor',
        name: 'Ritual de Amor',
        category: 'LOVE',
        day: 'SÁBADO',
        orixá: 'Oxum',
        sephirah: 'Binah',
        chakra: '4º Cardíaco',
        element: 'Água',
        description: 'Ritual para abrir o coração ao amor incondicional e fortalecer a intuição.',
        steps: [
          'Acenda uma vela dourada',
          'Coloque pétalas de rosa vermelha em água',
          'Recite a oração de Oxum',
          'Banhe o rosto com a água de pétalas',
          'Agradeça o amor que flui em você'
        ],
      },
      {
        id: 'ritual-cura',
        name: 'Ritual de Cura',
        category: 'HEALING',
        day: 'QUARTA',
        orixá: 'Oxakuara',
        sephirah: 'Tiphereth',
        chakra: '4º Cardíaco',
        element: 'Fogo',
        description: 'Ritual para cura física, emocional e espiritual.',
        steps: [
          'Acenda uma vela verde',
          'Cante orações de cura',
          'Coloque as mãos sobre o coração',
          'Visualize luz verde restaurando',
          'Permaneça em gratidão'
        ],
      },
      {
        id: 'ritual-ancestral',
        name: 'Ritual de Honra aos Ancestrais',
        category: 'ANCESTRAL',
        day: 'DOMINGO',
        orixá: 'Omolu',
        sephirah: 'Yesod',
        chakra: '1º Básico',
        element: 'Terra',
        description: 'Ritual para honrar os ancestrais e pedir bênçãos e proteção.',
        steps: [
          'Prepare um prato com alimentos preferidos dos ancestrais',
          'Acenda velas pretas e marrons',
          'Recite a oração de conexão ancestral',
          'Ofereça a comida à terra',
          'Agradeça a presença dos ancestrais'
        ],
      },
      {
        id: 'ritual-limpieza',
        name: 'Ritual de Limpeza Energética',
        category: 'CLEANSING',
        day: 'SEGUNDA',
        orixá: 'Ossaim',
        sephirah: 'Hod',
        chakra: '3º Plexo Solar',
        element: 'Fogo',
        description: 'Ritual para limpar energias densas e harmonizar o campo aurico.',
        steps: [
          'Acenda uma vela amarela',
          'Queime ervas de limpeza',
          'Passe a fumaça pelo corpo',
          'Recite a oração de limpeza',
          ' Tome um banho de солн小额'
        ],
      },
      {
        id: 'ritual-equilibrio',
        name: 'Ritual de Equilíbrio',
        category: 'BALANCE',
        day: 'QUARTA',
        orixá: 'Xangô',
        sephirah: 'Hod',
        chakra: '3º Plexo Solar',
        element: 'Fogo',
        description: 'Ritual para restabelecer o equilíbrio entre os planos espiritual e físico.',
        steps: [
          'Acenda velas vermelha e branca',
          'Coloque pedras de equilíbrio no altar',
          'Recite a oração de Xangô',
          'Visualize harmonia restaurada',
          'Agradeça pelo equilíbrio alcançado'
        ],
      },
      {
        id: 'ritual-manifestacao',
        name: 'Ritual de Manifestação',
        category: 'MANIFESTATION',
        day: 'QUINTA',
        orixá: 'Oxalá',
        sephirah: 'Kether',
        chakra: '7º Coronário',
        element: 'Éter',
        description: 'Ritual para manifestar intenções e desejos no plano material.',
        steps: [
          'Escreva seu desejo em papel branco',
          'Acenda uma vela branca',
          'Recite a oração de manifestação',
          'Enterre o papel na terra',
          'Regue com água e gratidão'
        ],
      },
    ];

    // Return single ritual by ID
    if (id) {
      const record = rituals.find((r) => r.id.toLowerCase() === id.toLowerCase());
      if (!record) {
        return NextResponse.json(
          { success: false, error: 'Ritual not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: record });
    }

    // Return ritual categories
    if (type === 'categories') {
      const categories = [
        { name: 'GROUNDING', description: 'Aterramento e conexão com a terra', day: 'SEGUNDA' },
        { name: 'PROTECTION', description: 'Proteção e defesa espiritual', day: 'TERÇA' },
        { name: 'ABUNDANCE', description: 'Abundância e prosperidade', day: 'QUINTA' },
        { name: 'PEACE', description: 'Paz interior e harmonia', day: 'SEXTA' },
        { name: 'LOVE', description: 'Amor e conexões afetivas', day: 'SÁBADO' },
        { name: 'HEALING', description: 'Cura física, emocional e espiritual', day: 'QUARTA' },
        { name: 'ANCESTRAL', description: 'Conexão com ancestrais', day: 'DOMINGO' },
        { name: 'CLEANSING', description: 'Limpeza e purificação energética', day: 'SEGUNDA' },
        { name: 'BALANCE', description: 'Equilíbrio entre os planos', day: 'QUARTA' },
        { name: 'MANIFESTATION', description: 'Manifestação de intenções', day: 'QUINTA' },
      ];
      return NextResponse.json({ success: true, data: categories });
    }

    // Return ritual records only
    if (type === 'records') {
      return NextResponse.json({ success: true, data: rituals });
    }

    // Default — return all ritual data
    return NextResponse.json({
      success: true,
      data: {
        records: rituals,
        categories: [
          { name: 'GROUNDING', description: 'Aterramento e conexão com a terra', day: 'SEGUNDA' },
          { name: 'PROTECTION', description: 'Proteção e defesa espiritual', day: 'TERÇA' },
          { name: 'ABUNDANCE', description: 'Abundância e prosperidade', day: 'QUINTA' },
          { name: 'PEACE', description: 'Paz interior e harmonia', day: 'SEXTA' },
          { name: 'LOVE', description: 'Amor e conexões afetivas', day: 'SÁBADO' },
          { name: 'HEALING', description: 'Cura física, emocional e espiritual', day: 'QUARTA' },
          { name: 'ANCESTRAL', description: 'Conexão com ancestrais', day: 'DOMINGO' },
          { name: 'CLEANSING', description: 'Limpeza e purificação energética', day: 'SEGUNDA' },
          { name: 'BALANCE', description: 'Equilíbrio entre os planos', day: 'QUARTA' },
          { name: 'MANIFESTATION', description: 'Manifestação de intenções', day: 'QUINTA' },
        ],
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch ritual data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}