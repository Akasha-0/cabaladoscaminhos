// Meji-Oni API - Cabala Dos Caminhos
// GET endpoints for Meji-Oni Odu spiritual data

import { NextResponse } from 'next/server';

// Meji-Oni data structure based on Ifá lore
interface MejiOniData {
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

const mejiOniData: MejiOniData = {
  id: 'meji-oni-001',
  name: 'Meji-Oni',
  namePt: 'Meji-Oni - O Segredo Revelado',
  nameEn: 'Meji-Oni - The Revealed Secret',
  symbol: '☷☷',
  yoruba: 'Ògùndá Méjì',
  meaning: 'Meji-Oni',
  meaningPt: 'Meji-Oni representa o segredo, o oculto, o mistério, a sabedoria profunda, a comunicação espiritual e a revelação. É o Odu dos mistérios e da transformação interior.',
  meaningEn: 'Meji-Oni symbolizes the secret, the hidden, the mystery, deep wisdom, spiritual communication, and revelation. It is the Odu of mysteries and inner transformation.',
  spiritualGuidance: [
    'O segredo deve ser guardado com respeito e sabedoria',
    'A revelação chega no tempo certo, não force a verdade',
    'Honre os mistérios da vida e do universo',
    'A sabedoria interior é mais poderosa que o conhecimento exterior',
    'A transformação acontece quando você aceita o oculto',
    'Pratique a escuta ativa em todas as suas formas',
    'O universo revela seus segredos aos que são dignos',
    'Desenvolva sua intuição para perceber o invisível',
  ],
  keywords: ['segredo', 'mistério', 'oculto', 'sabedoria', 'revelação', 'transformação', 'intuição', 'comunicação espiritual'],
  elements: ['Terra Profunda', 'Caverna', 'Obsidiana'],
  colors: ['#2F4F4F', '#191970', '#4B0082'],
  dayOfWeek: 'Terça-feira',
  rulingOrishas: ['Olódùmarè', 'Orunmila', 'Osanyin'],
  sacredNumbers: [3, 7, 15, 33],
  greeting: 'The secret reveals!',
  rituals: [
    'Meditação em cavernas ou lugares escuros para acessar sabedoria oculta',
    'Oração silenciosa ao amanhecer e ao anoitecer',
    'Ritual de transformação interior com elementos da terra',
    'Prática de guardar segredos com responsabilidade sagrada',
    'Cerimônia de revelação quando o momento é propício',
  ],
  offerings: [
    'Folhas escuras e plantas ocultas',
    'Café preto em xícara escura',
    'Frutos escuros: amora, uva preta, berinjela',
    'Água de nascente em recipiente de pedra',
    'Incienso de mirra e sálvia',
  ],
  affirmations: [
    'Eu sou digno de conhecer os segredos do universo',
    'Minha intuição me guia através dos mistérios',
    'A verdade é revelada no tempo certo',
    'Eu abraço a sabedoria oculta com gratidão',
    'O universo confia em mim com seus segredos',
    'Eu transformo sombras em luz interior',
  ],
};

// Combined 16 Meji Odus with Meji-Oni as Odu 14
const mejiOdusData: Record<number, MejiOniData> = {
  1: { ...mejiOniData, id: 'meji-oni-001', name: 'Meji-Oni', namePt: 'Meji-Oni - O Segredo Revelado', nameEn: 'Meji-Oni - The Revealed Secret' },
  2: { ...mejiOniData, id: 'meji-oni-002', name: 'Meji-Ogbe', namePt: 'Meji-Ogbe - A Duplicação', nameEn: 'Meji-Ogbe - The Duplication' },
  3: { ...mejiOniData, id: 'meji-oni-003', name: 'Meji-Oyei', namePt: 'Meji-Oyei - O Decreto', nameEn: 'Meji-Oyei - The Decree' },
  4: { ...mejiOniData, id: 'meji-oni-004', name: 'Meji-Osa', namePt: 'Meji-Osa - A Montanha', nameEn: 'Meji-Osa - The Mountain' },
  5: { ...mejiOniData, id: 'meji-oni-005', name: 'Meji-Iwonla', namePt: 'Meji-Iwonla - O Destino', nameEn: 'Meji-Iwonla - The Destiny' },
  6: { ...mejiOniData, id: 'meji-oni-006', name: 'Meji-Irosun', namePt: 'Meji-Irosun - A Sorte', nameEn: 'Meji-Irosun - The Luck' },
  7: { ...mejiOniData, id: 'meji-oni-007', name: 'Meji-Ofun', namePt: 'Meji-Ofun - O Portal', nameEn: 'Meji-Ofun - The Portal' },
  8: { ...mejiOniData, id: 'meji-oni-008', name: 'Meji-Ochun', namePt: 'Meji-Ochun - O Rio', nameEn: 'Meji-Ochun - The River' },
  9: { ...mejiOniData, id: 'meji-oni-009', name: 'Meji-Ika', namePt: 'Meji-Ika - O Veneno', nameEn: 'Meji-Ika - The Poison' },
  10: { ...mejiOniData, id: 'meji-oni-010', name: 'Meji-Otura', namePt: 'Meji-Otura - A Sabedoria', nameEn: 'Meji-Otura - The Wisdom' },
  11: { ...mejiOniData, id: 'meji-oni-011', name: 'Meji-Irete', namePt: 'Meji-Irete - A Paz', nameEn: 'Meji-Irete - The Peace' },
  12: { ...mejiOniData, id: 'meji-oni-012', name: 'Meji-Ose', namePt: 'Meji-Ose - A Força', nameEn: 'Meji-Ose - The Strength' },
  13: { ...mejiOniData, id: 'meji-oni-013', name: 'Meji-Owu', namePt: 'Meji-Owu - O Fio', nameEn: 'Meji-Owu - The Thread' },
  14: { ...mejiOniData, id: 'meji-oni-014', name: 'Meji-Oni', namePt: 'Meji-Oni - O Segredo', nameEn: 'Meji-Oni - The Secret' },
  15: { ...mejiOniData, id: 'meji-oni-015', name: 'Meji-Ogunda', namePt: 'Meji-Ogunda - O Campo', nameEn: 'Meji-Ogunda - The Field' },
  16: { ...mejiOniData, id: 'meji-oni-016', name: 'Meji-Osa', namePt: 'Meji-Osa - O Caminho', nameEn: 'Meji-Osa - The Path' },
};

/**
 * GET /api/meji-oni/data
 * Returns Meji-Oni-related data including Meji-Oni Odu and associated spiritual values
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
    const odu = mejiOdusData[num];

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
    const odu = Object.values(mejiOdusData).find((o) =>
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

  const odus = Object.values(mejiOdusData);

  switch (type) {
    case 'all':
      return NextResponse.json({ data: odus });

    case 'meji-oni':
      return NextResponse.json({ data: mejiOniData });

    case 'names':
      return NextResponse.json({
        data: odus.map((o) => ({ numero: odus.indexOf(o) + 1, name: o.name })),
      });

    case 'keywords':
      return NextResponse.json({
        data: { keywords: mejiOniData.keywords },
      });

    case 'elements':
      return NextResponse.json({
        data: { elements: mejiOniData.elements },
      });

    case 'colors':
      return NextResponse.json({
        data: { colors: mejiOniData.colors },
      });

    case 'orishas':
      return NextResponse.json({
        data: { rulingOrishas: mejiOniData.rulingOrishas },
      });

    case 'rituals':
      return NextResponse.json({
        data: { rituals: mejiOniData.rituals },
      });

    case 'affirmations':
      return NextResponse.json({
        data: { affirmations: mejiOniData.affirmations },
      });

    case 'offerings':
      return NextResponse.json({
        data: { offerings: mejiOniData.offerings },
      });

    case 'spiritual-guidance':
      return NextResponse.json({
        data: { spiritualGuidance: mejiOniData.spiritualGuidance },
      });

    default:
      return NextResponse.json({
        data: {
          id: mejiOniData.id,
          name: mejiOniData.name,
          namePt: mejiOniData.namePt,
          nameEn: mejiOniData.nameEn,
          symbol: mejiOniData.symbol,
          yoruba: mejiOniData.yoruba,
          meaning: mejiOniData.meaning,
          totalOdus: 16,
          description: mejiOniData.meaningPt,
        },
      });
  }
}