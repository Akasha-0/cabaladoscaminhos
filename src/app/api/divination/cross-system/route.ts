// ============================================================
// CROSS-SYSTEM DIVINATION API - CABALA DOS CAMINHOS
// Combines Tarot, Ifá/Odu, Numerology, Astrology
// Enhanced with spiritual correlations
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { TarotCard, MAJOR_ARCANA, MINOR_ARCANA } from '@/lib/tarot/cards';
import { odusData } from '@/lib/odus/calculos';
import { calcularPitagorica, calcularPitagoricaData } from '@/lib/numerologia/calculos';
import { generateMinimaxResponse } from '@/lib/ai/minimax';
import { NUMEROLOGY_ODU_CORRELATIONS } from '@/lib/numerologia/odu-correlations';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const SefirotSchema = z.enum([
  'Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah',
  'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'
]);
const ChakraSchema = z.coerce.number().int().min(1).max(7);
const ElementSchema = z.enum(['Fogo', 'Água', 'Terra', 'Ar', 'Éter']);

const CrossSystemQuerySchema = z.object({
  includeCorrelations: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  sefirot: SefirotSchema.optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
  orixa: z.string().optional(),
});

// ─── Spiritual Correlations for Tarot Arcanos ──────────────────────────────────────────
const TAROT_SPIRITUAL_CORRELATIONS: Record<string, {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  frequency: string;
}> = {
  'The Fool': { sefirot: ['Kether'], chakra: 7, element: 'Ar', orixa: 'Oxalá', affirmation: 'Inicio minha jornada com confiança', frequency: '963 Hz' },
  'The Magician': { sefirot: ['Kether', 'Chokhmah'], chakra: 5, element: 'Fogo', orixa: 'Ogum', affirmation: 'Minhas intenções se manifestam', frequency: '528 Hz' },
  'The High Priestess': { sefirot: ['Binah', 'Yesod'], chakra: 6, element: 'Água', orixa: 'Iemanjá', affirmation: 'A sabedoria oculta me guia', frequency: '639 Hz' },
  'The Empress': { sefirot: ['Chesed', 'Tipheret'], chakra: 4, element: 'Fogo', orixa: 'Oxum', affirmation: 'A natureza me sustenta', frequency: '528 Hz' },
  'The Emperor': { sefirot: ['Malkuth', 'Gevurah'], chakra: 1, element: 'Terra', orixa: 'Ogum', affirmation: 'Tenho disciplina e estrutura', frequency: '396 Hz' },
  'The Hierophant': { sefirot: ['Chokhmah', 'Chesed'], chakra: 5, element: 'Terra', orixa: 'Oxalá', affirmation: 'A tradição me ensina', frequency: '741 Hz' },
  'The Lovers': { sefirot: ['Tipheret', 'Netzach'], chakra: 4, element: 'Ar', orixa: 'Oxum', affirmation: 'Escolho o amor em tudo', frequency: '528 Hz' },
  'The Chariot': { sefirot: ['Gevurah', 'Kether'], chakra: 3, element: 'Fogo', orixa: 'Ogum', affirmation: 'Conquisto meus objetivos', frequency: '528 Hz' },
  'Strength': { sefirot: ['Chesed', 'Tipheret'], chakra: 4, element: 'Fogo', orixa: 'Oxum', affirmation: 'Minha força vem do amor', frequency: '528 Hz' },
  'The Hermit': { sefirot: ['Binah', 'Hod'], chakra: 6, element: 'Terra', orixa: 'Oxalá', affirmation: 'Encontro luz na solidão', frequency: '741 Hz' },
  'Wheel of Fortune': { sefirot: ['Chokhmah', 'Netzach'], chakra: 5, element: 'Fogo', orixa: 'Ogum', affirmation: 'O destino me favorece', frequency: '528 Hz' },
  'Justice': { sefirot: ['Gevurah', 'Tipheret'], chakra: 3, element: 'Fogo', orixa: 'Xangô', affirmation: 'A justiça me equilibra', frequency: '528 Hz' },
  'The Hanged Man': { sefirot: ['Chokhmah', 'Yesod'], chakra: 6, element: 'Água', orixa: 'Iemanjá', affirmation: 'Mudo minha perspectiva', frequency: '639 Hz' },
  'Death': { sefirot: ['Malkuth', 'Gevurah'], chakra: 1, element: 'Fogo', orixa: 'Omolu', affirmation: 'Aceito a transformação', frequency: '417 Hz' },
  'Temperance': { sefirot: ['Tipheret', 'Chesed'], chakra: 4, element: 'Água', orixa: 'Oxum', affirmation: 'Equilibro extremos com harmonia', frequency: '528 Hz' },
  'The Devil': { sefirot: ['Malkuth', 'Gevurah'], chakra: 1, element: 'Terra', orixa: 'Ogum', affirmation: 'Libero prisões interiores', frequency: '396 Hz' },
  'The Tower': { sefirot: ['Gevurah', 'Kether'], chakra: 3, element: 'Fogo', orixa: 'Xangô', affirmation: 'Aceito mudanças disruptivas', frequency: '417 Hz' },
  'The Star': { sefirot: ['Chesed', 'Tipheret'], chakra: 6, element: 'Água', orixa: 'Oxum', affirmation: 'Minha esperança se renova', frequency: '639 Hz' },
  'The Moon': { sefirot: ['Yesod', 'Malkuth'], chakra: 6, element: 'Água', orixa: 'Iemanjá', affirmation: 'Confio na minha intuição', frequency: '639 Hz' },
  'The Sun': { sefirot: ['Tipheret', 'Kether'], chakra: 4, element: 'Fogo', orixa: 'Oxum', affirmation: 'Alegria e sucesso me acompanham', frequency: '528 Hz' },
  'Judgement': { sefirot: ['Kether', 'Binah'], chakra: 7, element: 'Fogo', orixa: 'Oxalá', affirmation: 'Renasco para nova vida', frequency: '963 Hz' },
  'The World': { sefirot: ['Malkuth', 'Kether'], chakra: 7, element: 'Terra', orixa: 'Oxum', affirmation: 'Completo ciclos com graça', frequency: '528 Hz' },
};

// ─── Spiritual Correlations for Odús ──────────────────────────────────────────
const ODU_SPIRITUAL_CORRELATIONS: Record<number, {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  frequency: string;
}> = {
  1: { sefirot: ['Hod', 'Gevurah'], chakra: 5, element: 'Fogo', orixa: 'Ogum', affirmation: 'Inicio meu caminho com coragem', frequency: '417 Hz' },
  2: { sefirot: ['Chokhmah', 'Binah'], chakra: 6, element: 'Ar', orixa: 'Iemanjá', affirmation: 'A dualidade me ensina harmonia', frequency: '639 Hz' },
  3: { sefirot: ['Gevurah', 'Malkuth'], chakra: 1, element: 'Terra', orixa: 'Ogum', affirmation: 'A força de Ogum me protege', frequency: '396 Hz' },
  4: { sefirot: ['Binah', 'Yesod'], chakra: 2, element: 'Água', orixa: 'Iemanjá', affirmation: 'Minha visão espiritual clareia', frequency: '639 Hz' },
  5: { sefirot: ['Tipheret', 'Chesed'], chakra: 4, element: 'Água', orixa: 'Oxum', affirmation: 'A doçura de Oxum me adorna', frequency: '528 Hz' },
  6: { sefirot: ['Chesed', 'Gevurah'], chakra: 3, element: 'Fogo', orixa: 'Xangô', affirmation: 'A riqueza de Xangô me abençoa', frequency: '528 Hz' },
  7: { sefirot: ['Malkuth', 'Binah'], chakra: 1, element: 'Terra', orixa: 'Omolu', affirmation: 'A transformação de Omolu me renova', frequency: '174 Hz' },
  8: { sefirot: ['Netzach', 'Hod'], chakra: 6, element: 'Fogo', orixa: 'Iansã', affirmation: 'O poder de Iansã me transforma', frequency: '417 Hz' },
  9: { sefirot: ['Tipheret', 'Yesod'], chakra: 4, element: 'Fogo', orixa: 'Oxum', affirmation: 'A clareza me guia para a verdade', frequency: '528 Hz' },
  10: { sefirot: ['Netzach', 'Malkuth'], chakra: 6, element: 'Terra', orixa: 'Oxóssi', affirmation: 'A prosperidade flui em minha vida', frequency: '639 Hz' },
  11: { sefirot: ['Kether', 'Chokhmah'], chakra: 7, element: 'Ar', orixa: 'Oxalá', affirmation: 'A justiça de Oxalá me equilibra', frequency: '963 Hz' },
  12: { sefirot: ['Yesod', 'Malkuth'], chakra: 2, element: 'Água', orixa: 'Iemanjá', affirmation: 'O amor de Iemanjá me sustenta', frequency: '639 Hz' },
  13: { sefirot: ['Chokhmah', 'Hod'], chakra: 5, element: 'Ar', orixa: 'Orunmilá', affirmation: 'A sabedoria de Orunmilá me ilumina', frequency: '741 Hz' },
  14: { sefirot: ['Binah', 'Tipheret'], chakra: 4, element: 'Fogo', orixa: 'Xangô', affirmation: 'O destino se revela em meu caminho', frequency: '528 Hz' },
  15: { sefirot: ['Kether', 'Tipheret'], chakra: 7, element: 'Éter', orixa: 'Oxalá', affirmation: 'A bênção divina me protege', frequency: '963 Hz' },
  16: { sefirot: ['Binah', 'Kether', 'Yesod'], chakra: 7, element: 'Água', orixa: 'Iemanjá', affirmation: 'O universo conspirou a meu favor', frequency: '963 Hz' },
};

// ─── Spiritual Correlations for Numerology ──────────────────────────────────────────
const NUMERO_SPIRITUAL_CORRELATIONS: Record<number, {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  frequency: string;
}> = {
  1: { sefirot: ['Kether', 'Gevurah'], chakra: 1, element: 'Fogo', orixa: 'Ogum', affirmation: 'Eu inicio com coragem', frequency: '528 Hz' },
  2: { sefirot: ['Chokhmah', 'Binah'], chakra: 2, element: 'Água', orixa: 'Iemanjá', affirmation: 'A cooperação traz harmonia', frequency: '639 Hz' },
  3: { sefirot: ['Chokhmah', 'Netzach'], chakra: 5, element: 'Ar', orixa: 'Orunmilá', affirmation: 'A criatividade flui através de mim', frequency: '741 Hz' },
  4: { sefirot: ['Malkuth', 'Yesod'], chakra: 1, element: 'Terra', orixa: 'Ogum', affirmation: 'Construo uma base sólida', frequency: '396 Hz' },
  5: { sefirot: ['Hod', 'Gevurah'], chakra: 3, element: 'Fogo', orixa: 'Xangô', affirmation: 'A liberdade me guia', frequency: '528 Hz' },
  6: { sefirot: ['Tipheret', 'Chesed'], chakra: 4, element: 'Fogo', orixa: 'Oxum', affirmation: 'O amor e a responsabilidade guiam meu caminho', frequency: '528 Hz' },
  7: { sefirot: ['Binah', 'Hod'], chakra: 6, element: 'Água', orixa: 'Oxalá', affirmation: 'A sabedoria interior me sustenta', frequency: '741 Hz' },
  8: { sefirot: ['Gevurah', 'Malkuth'], chakra: 3, element: 'Terra', orixa: 'Ogum', affirmation: 'O poder justo flui através de mim', frequency: '396 Hz' },
  9: { sefirot: ['Tipheret', 'Yesod'], chakra: 6, element: 'Água', orixa: 'Iemanjá', affirmation: 'Sou um canal de compaixão e serviço', frequency: '639 Hz' },
  11: { sefirot: ['Kether', 'Chokhmah'], chakra: 6, element: 'Ar', orixa: 'Oxalá', affirmation: 'Minha intuição ilumina o caminho', frequency: '963 Hz' },
  22: { sefirot: ['Chesed', 'Gevurah'], chakra: 4, element: 'Terra', orixa: 'Ogum', affirmation: 'Transformo visões em realidade', frequency: '528 Hz' },
  33: { sefirot: ['Tipheret', 'Kether'], chakra: 7, element: 'Fogo', orixa: 'Oxalá', affirmation: 'Sou um canal de amor divino', frequency: '963 Hz' },
};

// ─── Spiritual Correlations for Planets ──────────────────────────────────────────
const PLANET_SPIRITUAL_CORRELATIONS: Record<string, {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  frequency: string;
}> = {
  'Sol': { sefirot: ['Kether', 'Tipheret'], chakra: 4, element: 'Fogo', orixa: 'Oxum', affirmation: 'Eu brilho com minha verdade', frequency: '528 Hz' },
  'Lua': { sefirot: ['Yesod', 'Binah'], chakra: 6, element: 'Água', orixa: 'Iemanjá', affirmation: 'Eu fluo com a vida', frequency: '639 Hz' },
  'Mercúrio': { sefirot: ['Hod', 'Netzach'], chakra: 5, element: 'Ar', orixa: 'Orunmilá', affirmation: 'Eu comunico com clareza', frequency: '741 Hz' },
  'Vênus': { sefirot: ['Tipheret', 'Chesed'], chakra: 4, element: 'Fogo', orixa: 'Oxum', affirmation: 'Eu amo em harmonia', frequency: '528 Hz' },
  'Marte': { sefirot: ['Gevurah', 'Kether'], chakra: 1, element: 'Fogo', orixa: 'Ogum', affirmation: 'Eu ago com coragem', frequency: '396 Hz' },
  'Júpiter': { sefirot: ['Chokhmah', 'Chesed'], chakra: 6, element: 'Fogo', orixa: 'Oxóssi', affirmation: 'Eu expanso com sabedoria', frequency: '528 Hz' },
  'Saturno': { sefirot: ['Malkuth', 'Gevurah'], chakra: 1, element: 'Terra', orixa: 'Ogum', affirmation: 'Eu construo com disciplina', frequency: '174 Hz' },
};

// ─── Helper Functions ──────────────────────────────────────────────────────────
function getTarotCorrelations(cardName: string) {
  return TAROT_SPIRITUAL_CORRELATIONS[cardName] || TAROT_SPIRITUAL_CORRELATIONS['The Fool'];
}

function enrichTarotCards(cards: TarotCard[], includeCorrelations: boolean) {
  if (!includeCorrelations) return cards;
  return cards.map(card => ({
    ...card,
    spiritualCorrelations: getTarotCorrelations(card.name),
  }));
}

// fallow-ignore-next-line complexity
function enrichOdu(numero: number) {
  const odu = odusData[numero];
  const corr = ODU_SPIRITUAL_CORRELATIONS[numero] || ODU_SPIRITUAL_CORRELATIONS[1];
  return {
    numero,
    nome: odu?.nome || 'Unknown',
    significado: odu?.significado || '',
    orixaRegente: odu?.orixaRegente || '',
    elementos: odu?.elementos || '',
    spiritualCorrelations: corr,
  };
}

function enrichNumerology(numeroReduzido: number) {
  const corr = NUMERO_SPIRITUAL_CORRELATIONS[numeroReduzido] || NUMERO_SPIRITUAL_CORRELATIONS[1];
  return {
    spiritualCorrelations: corr,
  };
}

function enrichAstrology(planet: string) {
  const normalized = planet.charAt(0).toUpperCase() + planet.slice(1).toLowerCase();
  const corr = PLANET_SPIRITUAL_CORRELATIONS[normalized] || PLANET_SPIRITUAL_CORRELATIONS['Sol'];
  return {
    planetCorrelations: corr,
  };
}

function getCardsForSpread(spread: string, count: number): TarotCard[] {
  const allCards = [...MAJOR_ARCANA, ...MINOR_ARCANA];
  const deck = [...allCards];
  const selected: TarotCard[] = [];
  const now = Date.now();
  for (let i = 0; i < count && deck.length > 0; i++) {
    const index = (now + i * 7) % deck.length;
    selected.push(deck.splice(index, 1)[0]);
  }
  return selected;
}

function getRandomOduNumero(): number {
  return Math.floor(Math.random() * 16) + 1;
}

// ─── API ROUTE HANDLERS ──────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const parseResult = CrossSystemQuerySchema.safeParse({
    includeCorrelations: searchParams.get('includeCorrelations'),
    sefirot: searchParams.get('sefirot'),
    chakra: searchParams.get('chakra'),
    element: searchParams.get('element'),
    orixa: searchParams.get('orixa'),
  });

  if (!parseResult.success) {
    return NextResponse.json({
      success: false,
      error: 'Parâmetros inválidos',
      details: parseResult.error.flatten().fieldErrors,
    }, { status: 400 });
  }

  const { includeCorrelations = false } = parseResult.data;

  // Return metadata with spiritual correlations
  return NextResponse.json({
    success: true,
    name: 'Cross-System Divination',
    description: 'Combina Tarot, Ifá/Odu, Numerologia e Astrologia',
    spiritualCorrelations: {
      tarot: TAROT_SPIRITUAL_CORRELATIONS,
      odus: ODU_SPIRITUAL_CORRELATIONS,
      numerology: NUMERO_SPIRITUAL_CORRELATIONS,
      planets: PLANET_SPIRITUAL_CORRELATIONS,
    },
    meta: {
      includeCorrelations,
    },
  });
}

// fallow-ignore-next-line complexity
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = z.object({
      userId: z.string().min(1, 'userId é obrigatório'),
      question: z.string().min(3).max(500),
      spread: z.enum(['celtic-cross', 'three-cards', 'five-cards', 'single-card']).optional().default('celtic-cross'),
      birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      userName: z.string().optional(),
      includeCorrelations: z.boolean().optional().default(false),
      sefirot: z.string().optional(),
      chakra: z.coerce.number().optional(),
      element: z.string().optional(),
      orixa: z.string().optional(),
    }).safeParse(body);

    if (!validation.success) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: validation.error.issues,
      }, { status: 400 });
    }

    const { userId, question, spread = 'celtic-cross', birthDate, userName, includeCorrelations = false, sefirot, chakra, element, orixa } = validation.data;

    const SPREAD_COUNTS: Record<string, number> = {
      'celtic-cross': 10,
      'three-cards': 3,
      'five-cards': 5,
      'single-card': 1,
    };

    const count = SPREAD_COUNTS[spread] || 10;

    // Get readings
    const tarotReading = getCardsForSpread(spread, count);
    const oduNum = getRandomOduNumero();
    const oduReading = enrichOdu(oduNum);

    // Numerology
    let numeroReduzido: number;
    let nomeNumerologico: string;
    if (birthDate) {
      numeroReduzido = calcularPitagoricaData(birthDate);
      nomeNumerologico = 'Número de Vida';
    } else if (userName) {
      numeroReduzido = calcularPitagorica(userName);
      nomeNumerologico = 'Número de Destino';
    } else {
      const today = new Date().toISOString().split('T')[0];
      numeroReduzido = calcularPitagoricaData(today);
      nomeNumerologico = 'Número Universal';
    }
    const correlation = NUMEROLOGY_ODU_CORRELATIONS.find(c => c.numeroReduzido === numeroReduzido);

    const numerologyReading = {
      numeroReduzido,
      nomeNumerologico,
      significado: correlation?.equivalenteCabalistica || `Número ${numeroReduzido}`,
      sefirotRelacionado: correlation ? `${correlation.sephirahFrom} → ${correlation.sephirahTo}` : '',
      spiritualCorrelations: NUMERO_SPIRITUAL_CORRELATIONS[numeroReduzido] || NUMERO_SPIRITUAL_CORRELATIONS[1],
    };

    // Astrology
    const planets = ['Sol', 'Lua', 'Mercúrio', 'Vênus', 'Marte', 'Júpiter', 'Saturno'];
    const signs = ['Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão', 'Virgem'];
    const now = Date.now();
    const dominantPlanet = planets[now % planets.length];
    const currentSign = signs[Math.floor(now / 1000000) % signs.length];
    const planetCorr = PLANET_SPIRITUAL_CORRELATIONS[dominantPlanet] || PLANET_SPIRITUAL_CORRELATIONS['Sol'];
    const astrologyReading = {
      currentAspect: `${dominantPlanet} em ${currentSign}`,
      dominantPlanet,
      elementalBalance: 'Fogo: 2, Água: 2, Ar: 3, Terra: 3',
      spiritualCorrelations: planetCorr,
    };

    // Enrich tarot cards
    const enrichedTarot = includeCorrelations
      ? tarotReading.map(card => ({
          ...card,
          spiritualCorrelations: getTarotCorrelations(card.name),
        }))
      : tarotReading;

    // Build spiritual stats
    const spiritualStats = {
      tarotSefirot: enrichedTarot.reduce((acc, card) => {
        const corr = getTarotCorrelations(card.name);
        corr.sefirot.forEach(s => { acc[s] = (acc[s] || 0) + 1; });
        return acc;
      }, {} as Record<string, number>),
      tarotChakras: enrichedTarot.reduce((acc, card) => {
        const corr = getTarotCorrelations(card.name);
        acc[corr.chakra] = (acc[corr.chakra] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      tarotElements: enrichedTarot.reduce((acc, card) => {
        const corr = getTarotCorrelations(card.name);
        acc[corr.element] = (acc[corr.element] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      tarotOrixas: enrichedTarot.reduce((acc, card) => {
        const corr = getTarotCorrelations(card.name);
        acc[corr.orixa] = (acc[corr.orixa] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    // Build response
    const response = {
      success: true,
      id: `csd-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      question,
      spread,
      tarotReading: enrichedTarot,
      oduReading,
      numerologyReading,
      astrologyReading,
      timestamp: new Date().toISOString(),
      spiritualCorrelations: {
        tarot: TAROT_SPIRITUAL_CORRELATIONS,
        odus: ODU_SPIRITUAL_CORRELATIONS,
        numerology: NUMERO_SPIRITUAL_CORRELATIONS,
        planets: PLANET_SPIRITUAL_CORRELATIONS,
      },
      spiritualStats,
      meta: {
        includeCorrelations,
        filters: { sefirot, chakra, element, orixa },
      },
    };

    // Apply spiritual filters to tarot cards
// fallow-ignore-next-line complexity
    if (sefirot || chakra || element || orixa) {
      const filtered = enrichedTarot.filter(card => {
        const corr = getTarotCorrelations(card.name);
        if (sefirot && !corr.sefirot.includes(sefirot)) return false;
        if (chakra && corr.chakra !== chakra) return false;
        if (element && corr.element !== element) return false;
        if (orixa && corr.orixa !== orixa) return false;
        return true;
      });
      if (filtered.length > 0) {
        response.tarotReading = filtered;
      }
    }

    // Generate AI interpretations
    const tarotNames = enrichedTarot.slice(0, 3).map(c => c.name).join(', ');
    const oduInfo = `${oduReading.nome}: ${oduReading.significado}`;

    try {
      const [combined, guidance] = await Promise.all([
        generateMinimaxResponse([{
          role: 'system',
          content: `Você é um guia espiritual integrando Tarot, Ifá/Odú, Numerologia e Astrologia. Responda em português brasileiro de forma poética e profunda.`
        }, {
          role: 'user',
          content: `Pergunta: "${question}\n\nTarot: ${tarotNames}\nIfá/Odú: ${oduInfo}\nNumerologia: ${numeroReduzido}\nAstrologia: ${dominantPlanet} em ${currentSign}\n\nCrie uma interpretação unificada.`
        }], { temperature: 0.7, max_tokens: 800 }),
        generateMinimaxResponse([{
          role: 'system',
          content: `Você é um sábio guia espiritual. Dê orientação prática e compassiva em português brasileiro.`
        }, {
          role: 'user',
          content: `Tarot: ${tarotNames}\nOdú: ${oduReading.nome}\nPergunta: ${question}`
        }], { temperature: 0.8, max_tokens: 500 }),
      ]);
      Object.assign(response, { combinedInterpretation: combined, aiGuidance: guidance });
    } catch {
      Object.assign(response, {
        combinedInterpretation: `A convergência de ${tarotNames} com ${oduReading.nome} aponta para transformação interior. O número ${numeroReduzido} amplifica esta energia.`,
        aiGuidance: `Permaneça no caminho da luz. Confie na sabedoria que habita em você.`,
      });
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Cross-system divination error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Erro ao processar divinização',
    }, { status: 500 });
  }
}
