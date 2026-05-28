// Megi Meji API - Cabala Dos Caminhos
// GET endpoints for Megi Meji Odu spiritual data

import { NextResponse } from 'next/server';

// Megi Meji data structure based on Ifá lore
interface MegiMejiData {
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

const megiMejiData: MegiMejiData = {
  id: 'megi-meji-001',
  name: 'Megi Meji',
  namePt: 'Megi Meji - A Duplicação da Luz Dourada',
  nameEn: 'Megi Meji - The Duplication of Golden Light',
  symbol: '☱☱',
  yoruba: 'Mégi Méjì',
  meaning: 'Megi Meji',
  meaningPt: 'Megi Meji representa a duplicação da luz dourada interior, o reflexo divino da essência radiante que habita em cada ser. É o Odu da restauração da autoestima, do espelhamento sagrado e da abundância reflejada que retorna ao buscador. Este Odu une a sabedoria das águas douradas de Megi com o princípio da duplicação primordial de Meji.',
  meaningEn: 'Megi Meji symbolizes the duplication of inner golden light, the divine reflection of the radiant essence that dwells within every being. It is the Odu of self-esteem restoration, sacred mirroring, and reflected abundance that returns to the seeker. This Odu unites the wisdom of Megi\'s golden waters with Meji\'s principle of primordial duplication.',
  spiritualGuidance: [
    'Sua luz interior é infinita e se multiplica a cada ato de amor próprio',
    'O espelho sagrado revela a beleza divina que reside em seu ser',
    'A duplicação da luz dourada ocorre quando você honra sua essência',
    'Você merece refletir a abundância que existe em seu interior',
    'A restauração da autoestima é um direito sagrado seu',
    'Cada ato de autoaceitação multiplica sua luz interior',
    'O universo refletirá de volta a luz que você irradia para si mesmo',
    'A verdadeira riqueza começa no espelho da alma',
  ],
  keywords: ['luz dourada', 'duplicação', 'autoestima', 'espelho', 'abundância reflejada', 'restauração', 'amor próprio', 'radiância'],
  elements: ['Água Dourada', 'Luz Solar Refletida', 'Espelho Sagrado'],
  colors: ['#FFD700', '#FFA500', '#F5DEB3', '#DAA520', '#FFE4B5'],
  dayOfWeek: 'Sábado',
  rulingOrishas: ['Megi', 'Oxum', 'Olódùmarè', 'Obatalá'],
  sacredNumbers: [2, 6, 9, 15, 21],
  greeting: 'A luz dourada se duplica para você!',
  rituals: [
    'Ritual do espelho com água dourada ao amanhecer',
    'Meditação de restauração da luz interior',
    'Oferenda de mel e água de colônia ao espelho sagrado',
    'Banho de duplicação com pétalas douradas',
    'Oração de autoaceitação diante do reflexo',
  ],
  offerings: [
    'Água de colônia perfumada',
    'Mel silvestre',
    'Espelho novo coberto de dourado',
    'Flores amarelas e douradas',
    'Velas douradas',
    'Pente ornamentado',
    'Açúcar mascavo',
  ],
  affirmations: [
    'Eu reflito a luz dourada que habita em minha essência',
    'Minha autoestima brilha como o ouro das águas de Oxum',
    'Aceito e honro cada parte de meu ser iluminado',
    'Minha luz interior se multiplica a cada momento',
    'Sou digno de toda a abundância que reflito',
    'O espelho sagrado revela minha verdadeira beleza divina',
    'Permito que minha luz dourada ilumine todos os cantos de minha existência',
    'Duplico a graça que recebo em amor próprio reflido',
  ],
};

// Combined 16 Megi Meji Odus
const megiMejiOdusData: Record<number, MegiMejiData> = {
  1: { ...megiMejiData, id: 'megi-meji-ogbe', name: 'Megi Meji-Ogbe' },
  2: { ...megiMejiData, id: 'megi-meji-odi', name: 'Megi Meji-Odi' },
  3: { ...megiMejiData, id: 'megi-meji-ogunda', name: 'Megi Meji-Ogunda' },
  4: { ...megiMejiData, id: 'megi-meji-rosun', name: 'Megi Meji-Rosun' },
  5: { ...megiMejiData, id: 'megi-meji-iron', name: 'Megi Meji-Iron' },
  6: { ...megiMejiData, id: 'megi-meji-oton', name: 'Megi Meji-Oton' },
  7: { ...megiMejiData, id: 'megi-meji-megi', name: 'Megi Meji-Megi' },
  8: { ...megiMejiData, id: 'megi-meji-ogun', name: 'Megi Meji-Ogun' },
  9: { ...megiMejiData, id: 'megi-meji-rosi', name: 'Megi Meji-Rosi' },
  10: { ...megiMejiData, id: 'megi-meji-oshe', name: 'Megi Meji-Oshe' },
  11: { ...megiMejiData, id: 'megi-meji-ika', name: 'Megi Meji-Ika' },
  12: { ...megiMejiData, id: 'megi-meji-ikate', name: 'Megi Meji-Ikate' },
  13: { ...megiMejiData, id: 'megi-meji-tura', name: 'Megi Meji-Tura' },
  14: { ...megiMejiData, id: 'megi-meji-tetua', name: 'Megi Meji-Tetua' },
  15: { ...megiMejiData, id: 'megi-meji-turun', name: 'Megi Meji-Turun' },
  16: { ...megiMejiData, id: 'megi-meji-kan', name: 'Megi Meji-Kan' },
};

/**
 * GET /api/megi-meji/data
 * Returns Megi Meji-related data including Megi Meji Odu and associated spiritual values
 * Supports query parameters: type, numero, nome
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const numero = searchParams.get('numero');
  const nome = searchParams.get('nome');

  // Default response - all Megi Meji data
  if (!type && !numero && !nome) {
    return NextResponse.json({
      success: true,
      data: {
        main: megiMejiData,
        variations: Object.values(megiMejiOdusData),
        count: Object.keys(megiMejiOdusData).length,
      },
    });
  }

  // Get specific Odu by number
  if (numero) {
    const num = parseInt(numero, 10);
    if (megiMejiOdusData[num]) {
      return NextResponse.json({
        success: true,
        data: megiMejiOdusData[num],
      });
    }
    return NextResponse.json(
      { success: false, error: 'Invalid Odu number. Must be 1-16.' },
      { status: 400 }
    );
  }

  // Get by nome
  if (nome) {
    const normalizedNome = nome.toLowerCase().replace(/\s+/g, '-');
    const found = Object.values(megiMejiOdusData).find(
      (odu) => odu.name.toLowerCase().replace(/\s+/g, '-') === normalizedNome
    );
    if (found) {
      return NextResponse.json({
        success: true,
        data: found,
      });
    }
    return NextResponse.json(
      { success: false, error: 'Odu not found' },
      { status: 404 }
    );
  }

  // Get main Megi Meji data
  if (type === 'main') {
    return NextResponse.json({
      success: true,
      data: megiMejiData,
    });
  }

  // Get all variations
  if (type === 'all') {
    return NextResponse.json({
      success: true,
      data: Object.values(megiMejiOdusData),
    });
  }

  return NextResponse.json({
    success: true,
    data: megiMejiData,
  });
}