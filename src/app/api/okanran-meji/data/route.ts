// Okanran-Meji API - Cabala Dos Caminhos
// GET endpoints for Okanran-Meji Odu spiritual data

import { NextResponse } from 'next/server';

// Okanran-Meji data structure based on Ifá lore
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
  namePt: 'Okanran-Meji - A Mão que Desce do Céu',
  nameEn: 'Okanran-Meji - The Hand That Descends from Heaven',
  symbol: '☷☷☷',
  yoruba: 'Òkànràn Méjì',
  meaning: 'Okanran-Meji',
  meaningPt: 'Okanran-Meji representa a mão divina que desce do céu para abençoar, curar e proteger. É o Odu da intervenção celestial, da cura espiritual, e da bênção sagrada que vem de cima. Traz consigo a energia da misericórdia divina e da graça redentora.',
  meaningEn: 'Okanran-Meji symbolizes the divine hand descending from heaven to bless, heal, and protect. It is the Odu of celestial intervention, spiritual healing, and sacred blessing from above. It carries the energy of divine mercy and redeeming grace.',
  spiritualGuidance: [
    'A intervenção divina está ao seu alcance quando você se abre para a luz celestial',
    'A cura vem através da fé e da conexão com as forças superiores',
    'Você foi escolhido para receber bênçãos especiais nesta jornada',
    'A mão de Olódùmarè estende-se para guiá-lo através das tempestades',
    'Sua missão espiritual envolve transmitir cura e esperança aos outros',
    'Confie no processo divino mesmo quando não compreende seus caminhos',
    'A humildade é a porta de entrada para as bênçãos celestiais',
    'Você possui o poder de canalizar energia curativa para aqueles ao seu redor'
  ],
  keywords: ['mão divina', 'cura celestial', 'bênção', 'intervenção', 'proteção', 'céu', 'graça', 'misericórdia', 'redenção', 'sagrado'],
  elements: ['Água Celestial', 'Luz Solar Divina', 'Éter Purificado'],
  colors: ['#4B0082', '#6A5ACD', '#9370DB', '#E6E6FA'],
  dayOfWeek: 'Domingo',
  rulingOrishas: ['Olódùmarè', 'Olokun', 'Oxum', 'Oxalá'],
  sacredNumbers: [7, 14, 21, 70, 777],
  greeting: 'A mão divina estende-se para abençoá-lo!',
  rituals: [
    'Oração de cura ao nascer do sol',
    'Oferecimento de água morna com mel a Olódùmarè',
    'Luz de velas brancas para agradecer bênçãos',
    'Banho de ervas sagradas na quinta-feira',
    'Meditação com as mãos voltadas para o céu',
    'Oração de intercessão por aqueles que sofrem',
    'Saudação ao nascer do sol com palmas',
    'Ritual de cura com águas de sete乏rios'
  ],
  offerings: [
    'Água de cocô fresco ao amanhecer',
    'Mel puro derramado sobre pedra sagrada',
    'Flores brancas colocadars no altar',
    'Fumo puro de Sampo',
    'Água de chuva coletada em vaso de barro',
    'Milho torrado oferecids a Oxalá',
    'Ofrenda de frutas frescas ao pôr do sol',
    'Incenso de sândalo durante a oração'
  ],
  affirmations: [
    'A mão divina me abençoa e me protege',
    'Eu sou canal de cura e esperança',
    'A luz celestial flui através de mim',
    'Recebo bênçãos do céu com gratidão',
    'Minha fé é minha armor contra toda escuridão',
    'Eu sou digno das graças celestiais',
    'A cura flui em mim e através de mim',
    'Abraço minha missão de ser instrumento do divino'
  ]
};

// Combined 16 Okanran-Meji Odus
const mejiOdusData: Record<number, OkanranMejiData> = {
  1: {
    id: 'okanran-meji-01',
    name: 'Okanran/Meji (1)',
    namePt: 'Okanran-Meji - Primeira Duplicação',
    nameEn: 'Okanran-Meji - First Duplication',
    symbol: '☷☷',
    yoruba: 'Òkànràn Méjì Ògbe',
    meaning: 'Intervenção divina inicial',
    meaningPt: 'A primeira duplicação de Okanran-Meji representa o início da intervenção divina em sua vida. Uma mão se estende do céu para guiá-lo através do primeiro passo de sua jornada espiritual.',
    meaningEn: 'The first duplication of Okanran-Meji represents the beginning of divine intervention in your life. A hand reaches from heaven to guide you through the first step of your spiritual journey.',
    spiritualGuidance: [
      'O primeiro sinal de cura está chegando',
      'Não tema o caminho desconhecido',
      'A luz divina ilumina seu passo',
      'Uma nova fase de proteção se inicia'
    ],
    keywords: ['início', 'primeiro passo', 'proteção inicial', 'guia'],
    elements: ['Luz Solar', 'Água Benta'],
    colors: ['#9370DB', '#E6E6FA'],
    dayOfWeek: 'Domingo',
    rulingOrishas: ['Olódùmarè', 'Oxalá'],
    sacredNumbers: [7, 14],
    greeting: 'A jornada começa agora!',
    rituals: ['Oração ao amanhecer'],
    offerings: ['Água fresca'],
    affirmations: ['Aceito a proteção divina']
  },
  2: {
    id: 'okanran-meji-02',
    name: 'Okanran/Meji (2)',
    namePt: 'Okanran-Meji - Okanran-Ògbe-Meji',
    nameEn: 'Okanran-Meji - Okanran-Ogbe-Meji',
    symbol: '☷☰',
    yoruba: 'Òkànràn Ògbe Méjì',
    meaning: 'Mão que abre os céus',
    meaningPt: 'Okanran-Ògbe-Meji representa a mão divina abrindo os céus para revelar sabedoria oculta. Este é um Odu de revelação espiritual e descoberta de verdades profundas.',
    meaningEn: 'Okanran-Ogbe-Meji represents the divine hand opening the heavens to reveal hidden wisdom. This is an Odu of spiritual revelation and discovery of deep truths.',
    spiritualGuidance: [
      'A sabedoria está sendo revelada',
      'Desperte para verdades ocultas',
      'Os céus se abrem para você',
      'Nova compreensão emerge'
    ],
    keywords: ['revelação', 'sabedoria', 'verdade', 'abertura celestial'],
    elements: ['Luz Estelar', 'Vent'),
    colors: ['#6A5ACD', '#E6E6FA'],
    dayOfWeek: 'Segunda-feira',
    rulingOrishas: ['Orunmila', 'Olódùmarè'],
    sacredNumbers: [3, 7],
    greeting: 'A verdade será revelada!',
    rituals: ['Meditação ao anoitecer'],
    offerings: ['Incenso de oliban'],
    affirmations: ['Eu abraço a sabedoria']
  },
  3: {
    id: 'okanran-meji-03',
    name: 'Okanran/Meji (3)',
    namePt: 'Okanran-Meji - Okanran-Osa-Meji',
    nameEn: 'Okanran-Meji - Okanran-Osa-Meji',
    symbol: '☷☱',
    yoruba: 'Òkànràn Òsà Méjì',
    meaning: 'Mão que cura',
    meaningPt: 'Okanran-Osa-Meji representa a mão divina focada em cura. Este Odu traz poderosa energia curativa para corpo, mente e espírito. É especialmente favorável para procesos de recuperação.',
    meaningEn: 'Okanran-Osa-Meji represents the divine hand focused on healing. This Odu brings powerful healing energy for body, mind, and spirit. It is especially favorable for recovery processes.',
    spiritualGuidance: [
      'A cura está ao seu alcance',
      'Permita que a luz cure suas feridas',
      'Você está sendo restaurado',
      'A saúde retorna para você'
    ],
    keywords: ['cura', 'saúde', 'restauração', 'recuperação'],
    elements: ['Água Curativa', 'Fogo Purificador'],
    colors: ['#4B0082', '#6A5ACD'],
    dayOfWeek: 'Terça-feira',
    rulingOrishas: ['Olokun', 'Oxum'],
    sacredNumbers: [9, 21],
    greeting: 'A cura chega para você!',
    rituals: ['Banho de ervas sagradas'],
    offerings: ['Água com mel'],
    affirmations: ['Eu sou curado e restaurado']
  },
  4: {
    id: 'okanran-meji-04',
    name: 'Okanran/Meji (4)',
    namePt: 'Okanran-Meji - Okanran-Irosun-Meji',
    nameEn: 'Okanran-Meji - Okanran-Irosun-Meji',
    symbol: '☷☲',
    yoruba: 'Òkànràn Ìròsún Méjì',
    meaning: 'Mão de proteção',
    meaningPt: 'Okanran-Irosun-Meji traz a energia de proteção divina. Este Odu forma um escudo ao redor do consultante, protegendo contra influências negativas e energias densas.',
    meaningEn: 'Okanran-Irosun-Meji brings the energy of divine protection. This Odu forms a shield around the seeker, protecting against negative influences and dense energies.',
    spiritualGuidance: [
      'Você está protegido por forças superiores',
      'Nenhuma energia negativa pode alcançá-lo',
      'O escudo divino está ativo',
      'Paz e segurança o cercam'
    ],
    keywords: ['proteção', 'escudo', 'segurança', 'defesa'],
    elements: ['Terra Protetora', 'Fogo Guardian'],
    colors: ['#9370DB', '#C0C0C0'],
    dayOfWeek: 'Quarta-feira',
    rulingOrishas: ['Eleggua', 'Olódùmarè'],
    sacredNumbers: [12, 21],
    greeting: 'O escudo está ativo!',
    rituals: ['Defumação com ervas protetoras'],
    offerings: ['Maçã vermelha'],
    affirmations: ['Estou protegido e seguro']
  },
  5: {
    id: 'okanran-meji-05',
    name: 'Okanran/Meji (5)',
    namePt: 'Okanran-Meji - Okanran-Owonrin-Meji',
    nameEn: 'Okanran-Meji - Okanran-Owonrin-Meji',
    symbol: '☷☳',
    yoruba: 'Òkànràn Òwónrín Méjì',
    meaning: 'Mão da transformação',
    meaningPt: 'Okanran-Owonrin-Meji representa a mão divina conduzindo uma transformação profunda. Este é um momento de mudança radical e renascimento espiritual.',
    meaningEn: 'Okanran-Owonrin-Meji represents the divine hand leading a profound transformation. This is a time of radical change and spiritual rebirth.',
    spiritualGuidance: [
      'Uma grande transformação está em andamento',
      'Abra-se para a mudança',
      'O renascimento espiritual se aproxima',
      'Deixe o antigo morrer para o novo nascer'
    ],
    keywords: ['transformação', 'mudança', 'renascimento', 'metamorfose'],
    elements: ['Vent Transformador', 'Fogo Purificador'],
    colors: ['#4B0082', '#E6E6FA'],
    dayOfWeek: 'Quinta-feira',
    rulingOrishas: ['Oxalá', 'Olódùmarè'],
    sacredNumbers: [5, 10],
    greeting: 'A transformação começa!',
    rituals: ['Ritual de passagem'],
    offerings: ['Velas brancas'],
    affirmations: ['Eu abraço minha transformação']
  },
  6: {
    id: 'okanran-meji-06',
    name: 'Okanran/Meji (6)',
    namePt: 'Okanran-Meji - Okanran-Obara-Meji',
    nameEn: 'Okanran-Meji - Okanran-Obara-Meji',
    symbol: '☷☲',
    yoruba: 'Òkànràn Òbàrà Méjì',
    meaning: 'Mão de justimça',
    meaningPt: 'Okanran-Obara-Meji traz a energia da justiça divina. Este Odu indica que a verdade será revelada e a justiça será feita. A mão de Olódùmarè equilibra as escalas.',
    meaningEn: 'Okanran-Obara-Meji brings the energy of divine justice. This Odu indicates that truth will be revealed and justice will be served. The hand of Olódùmarè balances the scales.',
    spiritualGuidance: [
      'A verdade será revelada',
      'A justiça está a caminho',
      'Não se preocupe com aqueles que erraram',
      'O equilíbrio será restaurado'
    ],
    keywords: ['justiça', 'verdade', 'equilíbrio', 'retidão'],
    elements: ['Fogo da Verdade', 'Terra Firme'],
    colors: ['#6A5ACD', '#9370DB'],
    dayOfWeek: 'Sexta-feira',
    rulingOrishas: ['Ogum', 'Olódùmarè'],
    sacredNumbers: [8, 16],
    greeting: 'A verdade prevalece!',
    rituals: ['Oração pela justiça'],
    offerings: ['Pão fresco'],
    affirmations: ['A justiça me favorece']
  },
  7: {
    id: 'okanran-meji-07',
    name: 'Okanran/Meji (7)',
    namePt: 'Okanran-Meji - Okanran-Okanran-Meji',
    nameEn: 'Okanran-Meji - Okanran-Okanran-Meji',
    symbol: '☷☷',
    yoruba: 'Òkànràn Òkànràn Méjì',
    meaning: 'Duplicação da mão divina',
    meaningPt: 'Okanran-Okanran-Meji é a duplicação máxima deste Odu, representando bênçãos duplicadas e proteção máxima. Este é um dos Odus mais favoráveis para receber graças celestiais.',
    meaningEn: 'Okanran-Okanran-Meji is the maximum duplication of this Odu, representing doubled blessings and maximum protection. This is one of the most favorable Odus for receiving celestial graces.',
    spiritualGuidance: [
      'Bênçãos duplicadas estão chegando',
      'A proteção é máxima neste momento',
      'Duas mãos celestiais o cercam',
      'Graças abundantes fluem para você'
    ],
    keywords: ['bênção duplicada', 'graça máxima', 'proteção completa', 'favor'],
    elements: ['Luz Solar Dupla', 'Água Benta Dupla'],
    colors: ['#E6E6FA', '#C0C0C0', '#9370DB'],
    dayOfWeek: 'Domingo',
    rulingOrishas: ['Olódùmarè', 'Oxum', 'Oxalá'],
    sacredNumbers: [14, 28, 777],
    greeting: 'Bênçãos dobradas chegam!',
    rituals: ['Dobra de velas ao altar'],
    offerings: ['Duas frutas iguais'],
    affirmations: ['Recebo bênçãos em dobro']
  },
  8: {
    id: 'okanran-meji-08',
    name: 'Okanran/Meji (8)',
    namePt: 'Okanran-Meji - Okanran-Odi-Meji',
    nameEn: 'Okanran-Meji - Okanran-Odi-Meji',
    symbol: '☷☳',
    yoruba: 'Òkànràn Òdí Méjì',
    meaning: 'Mão que ilumina',
    meaningPt: 'Okanran-Odi-Meji representa a mão divina iluminando caminhos. Este Odu traz clareza mental e orientação para decisões importantes.',
    meaningEn: 'Okanran-Odi-Meji represents the divine hand illuminating paths. This Odu brings mental clarity and guidance for important decisions.',
    spiritualGuidance: [
      'A iluminação chega para você',
      'Clareza mental surge em sua mente',
      'O caminho se torna visível',
      'Decisões sábias estão ao seu alcance'
    ],
    keywords: ['iluminação', 'clareza', 'orientação', 'visão'],
    elements: ['Luz Estelar', 'Fogo da Sabedoria'],
    colors: ['#9370DB', '#4B0082'],
    dayOfWeek: 'Segunda-feira',
    rulingOrishas: ['Orunmila', 'Olódùmarè'],
    sacredNumbers: [9, 18],
    greeting: 'A luz ilumina seu caminho!',
    rituals: ['Meditação matinal'],
    offerings: ['Óleo de coco'],
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

  // Return specific MejI Odu by number
  if (numero) {
    const num = parseInt(numero, 10);
    if (mejiOdusData[num]) {
      return NextResponse.json({
        success: true,
        data: mejiOdusData[num]
      });
    }
    return NextResponse.json(
      { success: false, error: 'Odu não encontrado' },
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
    const normalizedNome = nome.toLowerCase().replace(/-/g, '').replace(/['']/g, '');
    for (const [key, odu] of Object.entries(mejiOdusData)) {
      const normalizedOduName = odu.name.toLowerCase().replace(/-/g, '').replace(/['']/g, '');
      if (normalizedOduName.includes(normalizedNome) || odu.yoruba.toLowerCase().includes(normalizedNome)) {
        return NextResponse.json({
          success: true,
          data: odu
        });
      }
    }
    return NextResponse.json(
      { success: false, error: 'Odu não encontrado' },
      { status: 404 }
    );
  }

  // Default: return main Okanran-Meji data
  return NextResponse.json({
    success: true,
    data: okanranMejiData
  });
}