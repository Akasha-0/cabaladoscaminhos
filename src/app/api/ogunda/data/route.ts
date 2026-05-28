// Ogunda API - Cabala Dos Caminhos
// GET endpoints for Ogunda Odu spiritual data

import { NextResponse } from 'next/server';

// Ogunda data structure based on Ifá lore
interface OgundaData {
  id: string;
  name: string;
  namePt: string;
  nameEn: string;
  symbol: string;
  yoruba: string;
  meaning: string;
  meaningPt: string;
  meaningEn: string;
  spiritualGuidance: string[];
  keywords: string[];
  elements: string[];
  colors: string[];
  dayOfWeek: string;
  rulingOrishas: string[];
  sacredNumbers: number[];
  greeting: string;
  rituals: string[];
  offerings: string[];
  affirmations: string[];
}

const ogundaData: OgundaData = {
  id: 'ogunda-001',
  name: 'Ogunda',
  namePt: 'Ogunda - A Ferramenta',
  nameEn: 'Ogunda - The Tool',
  symbol: '☱',
  yoruba: 'Ògùndá',
  meaning: 'Ogunda',
  meaningPt: 'Ogunda representa a revolta, a força física, a criação de ferramentas, o corte e a separação. É o Odu da guerra justa e da transformação através da ação.',
  meaningEn: 'Ogunda symbolizes revolt, physical strength, tool creation, cutting, and separation. It is the Odu of just war and transformation through action.',
  spiritualGuidance: [
    'A força não está na violência, mas na capacidade de transformar o ambiente ao seu redor.',
    'O corte preciso exige clareza mental e foco inabalável.',
    'Construa suas ferramentas com intenção e use-as com sabedoria.',
    'A separação é necessária para o crescimento; liberte-se do que não serve mais.',
  ],
  keywords: ['força', 'corte', 'ferramenta', 'revolta', 'ação', 'transformação', 'justiça'],
  elements: ['Fogo', 'Terra', 'Ferro'],
  colors: ['#FF4444', '#8B4513', '#CD853F'],
  dayOfWeek: 'Terça-feira',
  rulingOrishas: ['Ogum', 'Obaluaê'],
  sacredNumbers: [3, 7, 12],
  greeting: 'Ogunhê!',
  rituals: [
    'Limpeza com folhas de mariô para proteção',
    'Banho de ferro para fortalecimento',
    'Sacrifício de inhames assados para Ogum',
    'Oração de coragem antes de decisões importantes',
  ],
  offerings: [
    'Inhames assados',
    'Paliteiros de Ogum',
    'Ferro新旧',
    'Carne grelhada',
  ],
  affirmations: [
    'Minha força está alinhada com a justiça divina.',
    'Eu corto o que precisa ser cortado com precisão e sabedoria.',
    'Construo minha vida com ferramentas sagradas.',
    'A transformação acontece através da ação consciente.',
  ],
};

// Combined 16 Odus with Ogunda as Odu 3
const odusData: Record<number, OgundaData> = {
  1: { ...ogundaData, id: 'ogunda-001', name: 'Okaran', namePt: 'Okaran - O Começo', nameEn: 'Okaran - The Beginning' },
  2: { ...ogundaData, id: 'ogunda-002', name: 'Ejiokô', namePt: 'Ejiokô - A Dualidade', nameEn: 'Ejiokô - The Duality' },
  3: { ...ogundaData, id: 'ogunda-003', name: 'Ogunda', namePt: 'Ogunda - A Ferramenta', nameEn: 'Ogunda - The Tool' },
  4: { ...ogundaData, id: 'ogunda-004', name: 'Irosun', namePt: 'Irosun - O Aviso', nameEn: 'Irosun - The Warning' },
  5: { ...ogundaData, id: 'ogunda-005', name: 'Oxé', namePt: 'Oxé - O Ouro', nameEn: 'Oxé - The Gold' },
  6: { ...ogundaData, id: 'ogunda-006', name: 'Obará', namePt: 'Obará - A Riqueza', nameEn: 'Obará - The Wealth' },
  7: { ...ogundaData, id: 'ogunda-007', name: 'Odi', namePt: 'Odi - A Teimosia', nameEn: 'Odi - The Stubbornness' },
  8: { ...ogundaData, id: 'ogunda-008', name: 'EjiOníle', namePt: 'EjiOníle - A Cabeça', nameEn: 'EjiOníle - The Head' },
  9: { ...ogundaData, id: 'ogunda-009', name: 'Ossá', namePt: 'Ossá - O Vento', nameEn: 'Ossá - The Wind' },
  10: { ...ogundaData, id: 'ogunda-010', name: 'Ofun', namePt: 'Ofun - O Mistério', nameEn: 'Ofun - The Mystery' },
  11: { ...ogundaData, id: 'ogunda-011', name: 'Owarin', namePt: 'Owarin - A Pressa', nameEn: 'Owarin - The Haste' },
  12: { ...ogundaData, id: 'ogunda-012', name: 'Ejilsebora', namePt: 'Ejilsebora - A Justiça', nameEn: 'Ejilsebora - The Justice' },
  13: { ...ogundaData, id: 'ogunda-013', name: 'Olobón', namePt: 'Olobón - A Doença', nameEn: 'Olobón - The Illness' },
  14: { ...ogundaData, id: 'ogunda-014', name: 'Iká', namePt: 'Iká - A Traição', nameEn: 'Iká - The Betrayal' },
  15: { ...ogundaData, id: 'ogunda-015', name: 'Ogbogbé', namePt: 'Ogbogbé - A Feitiçaria', nameEn: 'Ogbogbé - The Sorcery' },
  16: { ...ogundaData, id: 'ogunda-016', name: 'Alafia', namePt: 'Alafia - A Paz', nameEn: 'Alafia - The Peace' },
};

/**
 * GET /api/ogunda/data
 * Returns Ogunda-related data including Ogunda Odu and associated spiritual values
 * Supports query parameters: type, numero, nome
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const type = url.searchParams.get('type');
  const numero = url.searchParams.get('numero');
  const nome = url.searchParams.get('nome');

  // Get single Odu by number
  if (numero) {
    const num = parseInt(numero, 10);
    const odu = odusData[num];

    if (!odu) {
      return NextResponse.json(
        { error: 'Odu not found', numero: num },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: odu });
  }

  // Get single Odu by name
  if (nome) {
    const odu = Object.values(odusData).find((o) =>
      o.name.toLowerCase() === nome.toLowerCase()
    );

    if (!odu) {
      return NextResponse.json(
        { error: 'Odu not found', nome },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: odu });
  }

  const odus = Object.values(odusData);

  switch (type) {
    case 'all':
      return NextResponse.json({ data: odus });

    case 'ogunda':
      return NextResponse.json({ data: ogundaData });

    case 'names':
      return NextResponse.json({
        data: odus.map((o) => ({ numero: odus.indexOf(o) + 1, name: o.name })),
      });

    case 'keywords':
      return NextResponse.json({
        data: { keywords: ogundaData.keywords },
      });

    case 'elements':
      return NextResponse.json({
        data: { elements: ogundaData.elements },
      });

    case 'colors':
      return NextResponse.json({
        data: { colors: ogundaData.colors },
      });

    case 'orishas':
      return NextResponse.json({
        data: { rulingOrishas: ogundaData.rulingOrishas },
      });

    case 'rituals':
      return NextResponse.json({
        data: { rituals: ogundaData.rituals },
      });

    case 'affirmations':
      return NextResponse.json({
        data: { affirmations: ogundaData.affirmations },
      });

    case 'offerings':
      return NextResponse.json({
        data: { offerings: ogundaData.offerings },
      });

    case 'spiritual-guidance':
      return NextResponse.json({
        data: { spiritualGuidance: ogundaData.spiritualGuidance },
      });

    default:
      return NextResponse.json({
        data: {
          id: ogundaData.id,
          name: ogundaData.name,
          namePt: ogundaData.namePt,
          nameEn: ogundaData.nameEn,
          symbol: ogundaData.symbol,
          yoruba: ogundaData.yoruba,
          meaning: ogundaData.meaning,
          totalOdus: 16,
          description: ogundaData.meaningPt,
        },
      });
  }
}