// Okanran-Meji API - Cabala Dos Caminhos
// GET endpoints for Okanran-Meji Odu spiritual data

import { NextResponse } from 'next/server';

// Okanran-Meji data structure based on Ifa lore
interface OkanranMejiData {
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

const okanranMejiData: OkanranMejiData = {
  id: 'okanran-meji-001',
  name: 'Okanran-Meji',
  namePt: 'Okanran-Meji - A Mao que Desce do Ceu',
  nameEn: 'Okanran-Meji - The Hand That Descends from Heaven',
  symbol: '###',
  yoruba: 'Okaran Meji',
  meaning: 'Okanran-Meji',
  meaningPt: 'Okanran-Meji representa a mao divina que desce do ceu para abencoar, curar e proteger. E o Odu da intervencao celestial, da cura espiritual, e da bencao sagrada que vem de cima. Traz consigo a energia da misericordia divina e da gracia redentora.',
  meaningEn: 'Okanran-Meji symbolizes the divine hand descending from heaven to bless, heal, and protect. It is the Odu of celestial intervention, spiritual healing, and sacred blessing from above. It carries the energy of divine mercy and redeeming grace.',
  spiritualGuidance: [
    'A intervencao divina esta ao seu alcance quando voce se abre para a luz celestial',
    'A cura vem atraves da fe e da conexao com as forcas superiores',
    'Voce foi escolhido para receber bendicoes especiais nesta jornada',
    'A mao de Olodumare estende-se para guia-lo atraves das tempestades',
    'Sua missao espiritual envolve transmitir cura e esperança aos outros',
    'Confie no processo divino mesmo quando nao compreende seus caminhos',
    'A humildade e a porta de entrada para as bencoes celestiais',
    'Voce possui o poder de canalizar energia curativa para aqueles ao seu redor'
  ],
  keywords: ['mao divina', 'cura celestial', 'bencao', 'intervencao', 'protecao', 'ceu', 'gracia', 'misericordia', 'redencao', 'sagrado'],
  elements: ['Agua Celestial', 'Luz Solar Divina', 'Eter Purificado'],
  colors: ['#4B0082', '#6A5ACD', '#9370DB', '#E6E6FA'],
  dayOfWeek: 'Domingo',
  rulingOrishas: ['Olodumare', 'Olokun', 'Oxum', 'Oxala'],
  sacredNumbers: [7, 14, 21, 70, 777],
  greeting: 'A mao divina estende-se para abencoa-lo!',
  rituals: [
    'Oracao de cura ao nascer do sol',
    'Oferecimento de agua morna com mel a Olodumare',
    'Luz de velas brancas para agradecer bencoes',
    'Banho de ervas sagradas na quinta-feira',
    'Meditacao com as maos voltadas para o ceu',
    'Oracao de intercessao por aqueles que sofrem',
    'Saudacao ao nascer do sol com palmas',
    'Ritual de cura com aguas de sete rios'
  ],
  offerings: [
    'Agua de coco fresco ao amanhecer',
    'Mel puro derramado sobre pedra sagrada',
    'Flores brancas colocadas no altar',
    'Fumo puro de Sampo',
    'Agua de chuva coletada em vaso de barro',
    'Milho torrado oferecido a Oxala',
    'Ofrenda de frutas frescas ao por do sol',
    'Incenso de sandalo durante a oracao'
  ],
  affirmations: [
    'A mao divina me abencoa e me protege',
    'Eu sou canal de cura e esperança',
    'A luz celestial flui atraves de mim',
    'Recebo bencoes do ceu com gratidao',
    'Minha fe e minha armadura contra toda escuridao',
    'Eu sou digno das gracias celestiais',
    'A cura flui em mim e atraves de mim',
    'Abraço minha missao de ser instrumento do divino'
  ]
};

// Combined 16 Okanran-Meji Odus
const mejiOdusData: Record<number, OkanranMejiData> = {
  1: {
    id: 'okanran-meji-01',
    name: 'Okanran/Meji (1)',
    namePt: 'Okanran-Meji - Primeira Duplicacao',
    nameEn: 'Okanran-Meji - First Duplication',
    symbol: '##',
    yoruba: 'Okaran Meji Ogbe',
    meaning: 'Intervencao divina inicial',
    meaningPt: 'A primeira duplicacao de Okanran-Meji representa o inicio da intervencao divina em sua vida. Uma mao se estende do ceu para guia-lo atraves do primeiro passo de sua jornada espiritual.',
    meaningEn: 'The first duplication of Okanran-Meji represents the beginning of divine intervention in your life. A hand reaches from heaven to guide you through the first step of your spiritual journey.',
    spiritualGuidance: [
      'O primeiro sinal de cura esta chegando',
      'Nao tema o caminho desconhecido',
      'A luz divina ilumina seu passo',
      'Uma nova fase de protecao se inicia'
    ],
    keywords: ['inicio', 'primeiro passo', 'protecao inicial', 'guia'],
    elements: ['Luz Solar', 'Agua Benta'],
    colors: ['#9370DB', '#E6E6FA'],
    dayOfWeek: 'Domingo',
    rulingOrishas: ['Olodumare', 'Oxala'],
    sacredNumbers: [7, 14],
    greeting: 'A jornada comeca agora!',
    rituals: ['Oracao ao amanhecer'],
    offerings: ['Agua fresca'],
    affirmations: ['Aceito a protecao divina']
  },
  2: {
    id: 'okanran-meji-02',
    name: 'Okanran/Meji (2)',
    namePt: 'Okanran-Meji - Okanran-Ogbe-Meji',
    nameEn: 'Okanran-Meji - Okanran-Ogbe-Meji',
    symbol: '#*',
    yoruba: 'Okaran Ogbe Meji',
    meaning: 'Mao que abre os ceus',
    meaningPt: 'Okanran-Ogbe-Meji representa a mao divina abrindo os ceus para revelar sabedoria oculta. Este e um Odu de revelacao espiritual e descoberta de verdades profundas.',
    meaningEn: 'Okanran-Ogbe-Meji represents the divine hand opening the heavens to reveal hidden wisdom. This is an Odu of spiritual revelation and discovery of deep truths.',
    spiritualGuidance: [
      'A sabedoria esta sendo revelada',
      'Desperte para verdades ocultas',
      'Os ceus se abrem para voce',
      'Nova compreensao emerge'
    ],
    keywords: ['revelacao', 'sabedoria', 'verdade', 'abertura celestial'],
    elements: ['Luz Estelar', 'Vento'],
    colors: ['#6A5ACD', '#E6E6FA'],
    dayOfWeek: 'Segunda-feira',
    rulingOrishas: ['Orunmila', 'Olodumare'],
    sacredNumbers: [3, 7],
    greeting: 'A verdade sera revelada!',
    rituals: ['Meditacao ao anoitecer'],
    offerings: ['Incenso de olibano'],
    affirmations: ['Eu abraço a sabedoria']
  },
  3: {
    id: 'okanran-meji-03',
    name: 'Okanran/Meji (3)',
    namePt: 'Okanran-Meji - Okanran-Osa-Meji',
    nameEn: 'Okanran-Meji - Okanran-Osa-Meji',
    symbol: '#^',
    yoruba: 'Okaran Osa Meji',
    meaning: 'Mao que cura',
    meaningPt: 'Okanran-Osa-Meji representa a mao divina focada em cura. Este Odu traz poderosa energia curativa para corpo, mente e espirito. E especialmente favoravel para processos de recuperacao.',
    meaningEn: 'Okanran-Osa-Meji represents the divine hand focused on healing. This Odu brings powerful healing energy for body, mind, and spirit. It is especially favorable for recovery processes.',
    spiritualGuidance: [
      'A cura esta ao seu alcance',
      'Permita que a luz cure suas feridas',
      'Voce esta sendo restaurado',
      'A saude retorna para voce'
    ],
    keywords: ['cura', 'saude', 'restauracao', 'recuperacao'],
    elements: ['Agua Curativa', 'Fogo Purificador'],
    colors: ['#4B0082', '#6A5ACD'],
    dayOfWeek: 'Terca-feira',
    rulingOrishas: ['Olokun', 'Oxum'],
    sacredNumbers: [9, 21],
    greeting: 'A cura chega para voce!',
    rituals: ['Banho de ervas sagradas'],
    offerings: ['Agua com mel'],
    affirmations: ['Eu sou curado e restaurado']
  },
  4: {
    id: 'okanran-meji-04',
    name: 'Okanran/Meji (4)',
    namePt: 'Okanran-Meji - Okanran-Irosun-Meji',
    nameEn: 'Okanran-Meji - Okanran-Irosun-Meji',
    symbol: '#~',
    yoruba: 'Okaran Irosun Meji',
    meaning: 'Mao de protecao',
    meaningPt: 'Okanran-Irosun-Meji traz a energia de protecao divina. Este Odu forma um escudo ao redor do consultante, protegendo contra influencias negativas e energias densas.',
    meaningEn: 'Okanran-Irosun-Meji brings the energy of divine protection. This Odu forms a shield around the seeker, protecting against negative influences and dense energies.',
    spiritualGuidance: [
      'Voce esta protegido por forcas superiores',
      'Nenhuma energia negativa pode alcanc-lo',
      'O escudo divino esta ativo',
      'Paz e seguranca o cercam'
    ],
    keywords: ['protecao', 'escudo', 'seguranca', 'defesa'],
    elements: ['Terra Protetora', 'Fogo Guardian'],
    colors: ['#9370DB', '#C0C0C0'],
    dayOfWeek: 'Quarta-feira',
    rulingOrishas: ['Eleggua', 'Olodumare'],
    sacredNumbers: [12, 21],
    greeting: 'O escudo esta ativo!',
    rituals: ['Defumacao com ervas protetoras'],
    offerings: ['Maca vermelha'],
    affirmations: ['Estou protegido e seguro']
  },
  5: {
    id: 'okanran-meji-05',
    name: 'Okanran/Meji (5)',
    namePt: 'Okanran-Meji - Okanran-Owonrin-Meji',
    nameEn: 'Okanran-Meji - Okanran-Owonrin-Meji',
    symbol: '#=',
    yoruba: 'Okaran Owonrin Meji',
    meaning: 'Mao da transformacao',
    meaningPt: 'Okanran-Owonrin-Meji representa a mao divina conduzindo uma transformacao profunda. Este e um momento de mudanca radical e renascimento espiritual.',
    meaningEn: 'Okanran-Owonrin-Meji represents the divine hand leading a profound transformation. This is a time of radical change and spiritual rebirth.',
    spiritualGuidance: [
      'Uma grande transformacao esta em andamento',
      'Abra-se para a mudanca',
      'O renascimento espiritual se aproxima',
      'Deixe o antigo morrer para o novo nascer'
    ],
    keywords: ['transformacao', 'mudanca', 'renascimento', 'metamorfose'],
    elements: ['Vento Transformador', 'Fogo Purificador'],
    colors: ['#4B0082', '#E6E6FA'],
    dayOfWeek: 'Quinta-feira',
    rulingOrishas: ['Oxala', 'Olodumare'],
    sacredNumbers: [5, 10],
    greeting: 'A transformacao comeca!',
    rituals: ['Ritual de passagem'],
    offerings: ['Velas brancas'],
    affirmations: ['Eu abraço minha transformacao']
  },
  6: {
    id: 'okanran-meji-06',
    name: 'Okanran/Meji (6)',
    namePt: 'Okanran-Meji - Okanran-Obara-Meji',
    nameEn: 'Okanran-Meji - Okanran-Obara-Meji',
    symbol: '#!',
    yoruba: 'Okaran Obara Meji',
    meaning: 'Mao de justica',
    meaningPt: 'Okanran-Obara-Meji traz a energia da justica divina. Este Odu indica que a verdade sera revelada e a justica sera feita. A mao de Olodumare equilibra as escalas.',
    meaningEn: 'Okanran-Obara-Meji brings the energy of divine justice. This Odu indicates that truth will be revealed and justice will be served. The hand of Olodumare balances the scales.',
    spiritualGuidance: [
      'A verdade sera revelada',
      'A justica esta a caminho',
      'Nao se preocupe com aqueles que erraram',
      'O equilibrio sera restaurado'
    ],
    keywords: ['justica', 'verdade', 'equilibrio', 'retidao'],
    elements: ['Fogo da Verdade', 'Terra Firme'],
    colors: ['#6A5ACD', '#9370DB'],
    dayOfWeek: 'Sexta-feira',
    rulingOrishas: ['Ogum', 'Olodumare'],
    sacredNumbers: [8, 16],
    greeting: 'A verdade prevalece!',
    rituals: ['Oracao pela justica'],
    offerings: ['Pao fresco'],
    affirmations: ['A justica me favorece']
  },
  7: {
    id: 'okanran-meji-07',
    name: 'Okanran/Meji (7)',
    namePt: 'Okanran-Meji - Okanran-Okanran-Meji',
    nameEn: 'Okanran-Meji - Okanran-Okanran-Meji',
    symbol: '&&',
    yoruba: 'Okaran Okaran Meji',
    meaning: 'Duplicacao da mao divina',
    meaningPt: 'Okanran-Okanran-Meji e a duplicacao maxima deste Odu, representando bencoes duplicadas e protecao maxima. Este e um dos Odus mais favoraveis para receber gracias celestiais.',
    meaningEn: 'Okanran-Okanran-Meji is the maximum duplication of this Odu, representing doubled blessings and maximum protection. This is one of the most favorable Odus for receiving celestial graces.',
    spiritualGuidance: [
      'Bencoes duplicadas estao chegando',
      'A protecao e maxima neste momento',
      'Duas maos celestiais o cercam',
      'Gracias abundantes fluem para voce'
    ],
    keywords: ['bencao duplicada', 'graca maxima', 'protecao completa', 'favor'],
    elements: ['Luz Solar Dupla', 'Agua Benta Dupla'],
    colors: ['#E6E6FA', '#C0C0C0', '#9370DB'],
    dayOfWeek: 'Domingo',
    rulingOrishas: ['Olodumare', 'Oxum', 'Oxala'],
    sacredNumbers: [14, 28, 777],
    greeting: 'Bencoes dobradas chegam!',
    rituals: ['Dobra de velas ao altar'],
    offerings: ['Duas frutas iguais'],
    affirmations: ['Recebo bencoes em dobro']
  },
  8: {
    id: 'okanran-meji-08',
    name: 'Okanran/Meji (8)',
    namePt: 'Okanran-Meji - Okanran-Odi-Meji',
    nameEn: 'Okanran-Meji - Okanran-Odi-Meji',
    symbol: '**',
    yoruba: 'Okaran Odi Meji',
    meaning: 'Mao que ilumina',
    meaningPt: 'Okanran-Odi-Meji representa a mao divina iluminando caminhos. Este Odu traz clareza mental e orientacao para decisoes importantes.',
    meaningEn: 'Okanran-Odi-Meji represents the divine hand illuminating paths. This Odu brings mental clarity and guidance for important decisions.',
    spiritualGuidance: [
      'A iluminacao chega para voce',
      'Clareza mental surge em sua mente',
      'O caminho se torna visivel',
      'Decisoes faceis estao ao seu alcance'
    ],
    keywords: ['iluminacao', 'clareza', 'orientacao', 'visao'],
    elements: ['Luz Estelar', 'Fogo da Sabedoria'],
    colors: ['#9370DB', '#4B0082'],
    dayOfWeek: 'Segunda-feira',
    rulingOrishas: ['Orunmila', 'Olodumare'],
    sacredNumbers: [9, 18],
    greeting: 'A luz ilumina seu caminho!',
    rituals: ['Meditacao matinal'],
    offerings: ['Oleo de coco'],
    affirmations: ['Eu vejo com clareza']
  }
};

/**
 * GET /api/okanran-meji/data
 * Returns Okanran-Meji-related data including Okanran-Meji Odu and associated spiritual values
 * Supports query parameters: type, numero, nome
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const numero = searchParams.get('numero');
  const nome = searchParams.get('nome');

  // Return all Okanran-Meji data
  if (!type && !numero && !nome) {
    return NextResponse.json({
      success: true,
      odu: okanranMejiData,
      mejiOdus: mejiOdusData,
      total: Object.keys(mejiOdusData).length + 1
    });
  }

  // Return specific Meji Odu by number
  if (numero) {
    const num = parseInt(numero, 10);
    if (mejiOdusData[num]) {
      return NextResponse.json({
        success: true,
        data: mejiOdusData[num]
      });
    }
    return NextResponse.json(
      { success: false, error: 'Odu nao encontrado' },
      { status: 404 }
    );
  }

  // Return by type
  if (type === 'principal') {
    return NextResponse.json({
      success: true,
      data: okanranMejiData
    });
  }

  if (type === 'mejis') {
    return NextResponse.json({
      success: true,
      data: mejiOdusData,
      total: Object.keys(mejiOdusData).length
    });
  }

  // Return by nome
  if (nome) {
    const normalizedNome = nome.toLowerCase().replace(/-/g, '');
    for (const [_key, odu] of Object.entries(mejiOdusData)) {
      const normalizedOduName = odu.name.toLowerCase().replace(/-/g, '');
      if (normalizedOduName.includes(normalizedNome) || odu.yoruba.toLowerCase().includes(normalizedNome)) {
        return NextResponse.json({
          success: true,
          data: odu
        });
      }
    }
    return NextResponse.json(
      { success: false, error: 'Odu nao encontrado' },
      { status: 404 }
    );
  }

  // Default: return main Okanran-Meji data
  return NextResponse.json({
    success: true,
    data: okanranMejiData
  });
}