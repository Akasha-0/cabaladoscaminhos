// ============================================================
// PLANETARY WISDOM API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for planetary wisdom and astrology
// - Planetary positions and influences
// - Planetary correspondences (sefirot, orixás, tarot, chakra)
// - Daily planetary guidance
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const PlanetKeySchema = z.enum([
  'sol', 'lua', 'mercurio', 'venus', 'marte',
  'jupiter', 'saturno', 'urano', 'netuno', 'plutao'
]);

const PlanetaryQuerySchema = z.object({
  planet: z.string().optional(),
  type: z.enum(['guidance', 'correspondences', 'full']).optional(),
});

const PlanetSchema = z.object({
  name: z.string(),
  namePt: z.string(),
  symbol: z.string(),
  ruler: z.string(),
  day: z.string(),
  metal: z.string(),
  stone: z.string(),
  color: z.string(),
  quality: z.string(),
  element: z.enum(['Fogo', 'Água', 'Ar', 'Terra', 'Éter']),
  sefirot: z.array(z.string()),
  orixas: z.array(z.string()),
  tarot: z.array(z.string()),
  chakra: z.string(),
  traits: z.array(z.string()),
  strengths: z.array(z.string()),
  challenges: z.array(z.string()),
  affirmation: z.string(),
  meaning: z.string(),
});

const PositionSchema = z.object({
  sign: z.string(),
  degree: z.number(),
});

// ─── Type Definitions ───────────────────────────────────────────────────────
interface Planet {
  name: string;
  namePt: string;
  symbol: string;
  ruler: string;
  day: string;
  metal: string;
  stone: string;
  color: string;
  quality: string;
  element: string;
  sefirot: string[];
  orixas: string[];
  tarot: string[];
  chakra: string;
  traits: string[];
  strengths: string[];
  challenges: string[];
  affirmation: string;
  meaning: string;
}

interface Guidance {
  sign: string;
  degree: string;
  daily: string;
  affirmations: string[];
  actions: string[];
  favorable: string[];
  caution: string[];
  timeOfDay: string;
}

export const dynamic = 'force-dynamic';

// ─── Planetary Data ───────────────────────────────────────────────────────
const PLANETS: Record<string, Planet> = {
  sol: {
    name: 'Sun',
    namePt: 'Sol',
    symbol: '☉',
    ruler: 'Sou o centro do meu universo',
    day: 'Domingo',
    metal: 'Ouro',
    stone: 'Topázio, Diamante',
    color: 'Amarelo dourado',
    quality: 'Cardeal',
    element: 'Fogo',
    sefirot: ['Tiferet'],
    orixas: ['Oxalá'],
    tarot: ['O Sol (XIX)', 'O Carro (VII)'],
    chakra: 'Manipura (3º) - Sahasrara (7º)',
    traits: ['Liderança', 'Vitalidade', 'Criatividade', 'Autoexpressão', 'Espiritualidade', 'Fertilidade'],
    strengths: ['Confiança', 'Otimismo', 'Generosidade', 'Claridade mental'],
    challenges: ['Ego inflado', 'Arrogância', 'Teimosia'],
    affirmation: 'Eu brilho com a luz do Sol, manifestando minha verdadeira essência.',
    meaning: 'O Sol representa o núcleo da identidade, a vontade vital e a expressão autêntica do ser.',
  },
  lua: {
    name: 'Moon',
    namePt: 'Lua',
    symbol: '☽',
    ruler: 'Fluo com os ciclos da vida',
    day: 'Segunda-feira',
    metal: 'Prata',
    stone: 'Pedra da Lua, Cristal de Rocha',
    color: 'Branco prateado',
    quality: 'Mutável',
    element: 'Água',
    sefirot: ['Yesod'],
    orixas: ['Iemanjá', 'Oxum'],
    tarot: ['A Lua (XVIII)', 'A Imperatriz (III)'],
    chakra: 'Svadhisthana (2º) - Ajna (6º)',
    traits: ['Intuição', 'Emoções', 'Memória', 'Sensibilidade', 'Imaginação', 'Feminilidade'],
    strengths: ['Empatia', 'Adaptabilidade', 'Nutrição', 'Conexão interior'],
    challenges: ['Instabilidade emocional', 'Vulnerabilidade excessiva', 'Insegurança'],
    affirmation: 'Permito que minha intuição me guie através das águas emocionais.',
    meaning: 'A Lua governa o mundo emocional, os ciclos inconscientes e a sabedoria do coração.',
  },
  mercurio: {
    name: 'Mercury',
    namePt: 'Mercúrio',
    symbol: '☿',
    ruler: 'Comunico com clareza e verdade',
    day: 'Quarta-feira',
    metal: 'Mercúrio (Quicksilver)',
    stone: 'Ágata, Fluorita',
    color: 'Azul e amarelo',
    quality: 'Mutável',
    element: 'Ar',
    sefirot: ['Hod'],
    orixas: ['Exu'],
    tarot: ['Os Enamorados (VI)', 'O Mago (I)'],
    chakra: 'Vishuddha (5º) - Ajna (6º)',
    traits: ['Comunicação', 'Inteligência', 'Agilidade mental', 'Versatilidade', 'Comércio', 'Viagens'],
    strengths: ['Curiosidade', 'Linguagem', 'Análise', 'Aprendizado rápido'],
    challenges: ['Inconsistência', 'Nervosismo', 'Superficialidade'],
    affirmation: 'Minhas palavras são claras e minhas ideias fluem com sabedoria.',
    meaning: 'Mercúrio rege a mente, a comunicação e a conexão entre o mundo interior e exterior.',
  },
  venus: {
    name: 'Venus',
    namePt: 'Vênus',
    symbol: '♀',
    ruler: 'Amo e sou amado de forma saudável',
    day: 'Sexta-feira',
    metal: 'Cobre',
    stone: 'Rosa do Deserto, Turquesa, Jade',
    color: 'Verde e rosa',
    quality: 'Fixo',
    element: 'Terra',
    sefirot: ['Netzach'],
    orixas: ['Oxum', 'Yemanjá'],
    tarot: ['A Imperatriz (III)', 'O Hierofante (V)'],
    chakra: 'Anahata (4º) - Svadhisthana (2º)',
    traits: ['Amor', 'Beleza', 'Harmonia', 'Prazer', 'Relacionamentos', 'Arte'],
    strengths: ['Encantamento', 'Diplomacia', 'Sensibilidade estética', 'Bondade'],
    challenges: ['Indulgência', 'Ciúmes', 'Possessividade', 'Vanglória'],
    affirmation: 'Amo profundamente e sou merecedor de amor verdadeiro e harmonioso.',
    meaning: 'Vênus governa o amor, a beleza, os relacionamentos e a capacidade de fruição da vida.',
  },
  marte: {
    name: 'Mars',
    namePt: 'Marte',
    symbol: '♂',
    ruler: 'Atuo com coragem e determinação',
    day: 'Terça-feira',
    metal: 'Ferro',
    stone: 'Cornalina, Rubi, Olho de Tigre',
    color: 'Vermelho',
    quality: 'Cardeal',
    element: 'Fogo',
    sefirot: ['Gevurah'],
    orixas: ['Ogum', 'Xangô'],
    tarot: ['O Carro (VII)', 'A Torre (XVI)'],
    chakra: 'Manipura (3º) - Muladhara (1º)',
    traits: ['Energia', 'Coragem', 'Ação', 'Determinação', 'Sexualidade', 'Competitividade'],
    strengths: ['Assertividade', 'Força', 'Iniciativa', 'Proteção'],
    challenges: ['Agressividade', 'Impaciência', 'Impulsividade', 'Conflito'],
    affirmation: 'Canalizo minha energia vital para ações construtivas e realizadas.',
    meaning: 'Marte representa a força vital, a capacidade de ação e a energia Yang do ser.',
  },
  jupiter: {
    name: 'Jupiter',
    namePt: 'Júpiter',
    symbol: '♃',
    ruler: 'Expando minha consciência e prospero',
    day: 'Quinta-feira',
    metal: 'Estanho',
    stone: 'Ametista, Turquesa, Safira azul',
    color: 'Azul e roxo',
    quality: 'Mútuo',
    element: 'Fogo',
    sefirot: ['Chesed'],
    orixas: ['Oxum', 'Obatalá'],
    tarot: ['A Temperança (XIV)', 'O Louco (0)'],
    chakra: 'Anahata (4º) - Ajna (6º)',
    traits: ['Expansão', 'Sabedoria', 'Otimismo', 'Filosofia', 'Prosperidade', 'Sorte'],
    strengths: ['Generosidade', 'Visão de longo prazo', 'Orientação espiritual', 'Abundância'],
    challenges: ['Excesso', 'Extravagância', 'Dogmatismo', 'Procrastinação'],
    affirmation: 'Sou abundante em todas as áreas da minha vida, crescendo em sabedoria e graça.',
    meaning: 'Júpiter expande tudo o que toca, representando a sabedoria, a espiritualidade e a abundância.',
  },
  saturno: {
    name: 'Saturn',
    namePt: 'Saturno',
    symbol: '♄',
    ruler: 'Construo com disciplina e paciência',
    day: 'Sábado',
    metal: 'Chumbo',
    stone: 'Hematita, Ônix, Granada',
    color: 'Preto e cinza',
    quality: 'Cardeal',
    element: 'Terra',
    sefirot: ['Binah'],
    orixas: ['Omulu', 'Nanã Buruku'],
    tarot: ['O Mundo (XXI)', 'O Julgamento (XX)', 'O Enforcado (XII)'],
    chakra: 'Muladhara (1º) - Ajna (6º)',
    traits: ['Disciplina', 'Responsabilidade', 'Estrutura', 'Limites', 'Paciência', 'Sabedoria das sombras'],
    strengths: ['Perseverança', 'Maturidade', 'Organização', 'Autoridade interior'],
    challenges: ['Rigidez', 'Melancolia', 'Medo', 'Autorrepressão'],
    affirmation: 'Aceito as lições do tempo e construo uma vida de propósito e significado.',
    meaning: 'Saturno representa a lei cósmica, as limitações necessárias e a sabedoria conquistada através da experiência.',
  },
  urano: {
    name: 'Uranus',
    namePt: 'Urano',
    symbol: '♅',
    ruler: 'Ilumino minha originalidade e liberdade',
    day: 'Domingo',
    metal: 'Urânio, Metal radioativo',
    stone: 'Moldavita, Rodocrosita',
    color: 'Ciano, elétrico',
    quality: 'Fixo',
    element: 'Éter',
    sefirot: ['Keter'],
    orixas: ['Oxumaré'],
    tarot: ['A Estrela (XVII)'],
    chakra: 'Sahasrara (7º) - Corona',
    traits: ['Inovação', 'Originalidade', 'Libertação', 'Rebeldia', 'Tecnologia', 'Iluminação súbita'],
    strengths: ['Genialidade', 'Abertura mental', 'Progresso', 'Desapego'],
    challenges: ['Imprevisibilidade', 'Rebeldia destrutiva', 'Alienação', 'Nervosismo excessivo'],
    affirmation: 'Abracei minha singularidade e contribuo para a evolução coletiva da humanidade.',
    meaning: 'Urano representa a iluminação súbita, a libertação das correntes e a conexão com o divino.',
  },
  netuno: {
    name: 'Neptune',
    namePt: 'Netuno',
    symbol: '♆',
    ruler: 'Dissolvo os limites e Uno-me ao divino',
    day: 'Segunda-feira',
    metal: 'Platina',
    stone: 'Aguamarinha, Quartzo transparente',
    color: 'Azul ultramarino',
    quality: 'Mutável',
    element: 'Água',
    sefirot: ['Chokhmah'],
    orixas: ['Yemanjá', 'Oxalá'],
    tarot: ['A Lua (XVIII)', 'A Estrela (XVII)'],
    chakra: 'Sahasrara (7º) - Ajna (6º)',
    traits: ['Transcendência', 'Intuição superior', 'Sonhos', 'Arte', 'Misticismo', 'União cósmica'],
    strengths: ['Compaixão', 'Inspiração artística', 'Conexão espiritual', 'Sensibilidade transcendente'],
    challenges: ['Ilusão', 'Confusão', 'Vulnerabilidade a enganos', 'Dissolução de limites'],
    affirmation: 'Permaneço no fluxo divino enquanto mantenho minha essência clara e protegida.',
    meaning: 'Netuno dissolve os limites entre o eu e o todo, revelando a unidade sagrada de toda existência.',
  },
  plutao: {
    name: 'Pluto',
    namePt: 'Plutão',
    symbol: '♇',
    ruler: 'Transformo através das sombras',
    day: 'Terça-feira',
    metal: 'Plutônio',
    stone: 'Obsidiana, Turmalina negra',
    color: 'Negro profundo',
    quality: 'Fixo',
    element: 'Fogo',
    sefirot: ['Daat'],
    orixas: ['Omulu', 'Sangue de Aço (Oxumaré)'],
    tarot: ['A Torre (XVI)', 'A Morte (XIII)', 'O Julgamento (XX)'],
    chakra: 'Muladhara (1º) - Sahasrara (7º)',
    traits: ['Transformação', 'Regeneração', 'Poder', 'Sexualidade profunda', 'Rebirth'],
    strengths: ['Resiliência', 'Capacidade de renovação', 'Profundidade psicológica', 'Desapego radical'],
    challenges: ['Obsessão', 'Manipulação', 'Medo primordial', 'Sombra'],
    affirmation: 'Permito que o fogo da transformação renove minha alma, emergindo mais forte.',
    meaning: 'Plutão governa a morte e o renascimento, a transformação profunda que emerge das trevas.',
  },
};

// Current planetary positions (simplified calculation)
function getPlanetaryPositions(): Record<string, { sign: string; degree: number }> {
  const now = new Date();
  const jd = getJulianDay(now);
  
  return {
    sol: { sign: 'Gêmeos', degree: ((jd * 13 + 45) % 360) },
    lua: { sign: 'Touro', degree: ((jd * 237 + 89) % 360) },
    mercurio: { sign: 'Touro', degree: ((jd * 48 + 120) % 360) },
    venus: { sign: 'Áries', degree: ((jd * 22 + 200) % 360) },
    marte: { sign: 'Câncer', degree: ((jd * 19 + 90) % 360) },
    jupiter: { sign: 'Peixes', degree: ((jd * 4 + 300) % 360) },
    saturno: { sign: 'Aquário', degree: ((jd * 1 + 270) % 360) },
    urano: { sign: 'Touro', degree: ((jd * 0.3 + 30) % 360) },
    netuno: { sign: 'Peixes', degree: ((jd * 0.2 + 330) % 360) },
    plutao: { sign: 'Capricórnio', degree: ((jd * 0.1 + 280) % 360) },
  };
}

// Calculate Julian Day
function getJulianDay(date: Date): number {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate() + date.getHours() / 24;
  
  const a = Math.floor((14 - m) / 12);
  const y2 = y + 4800 - a;
  const m2 = m + 12 * a - 3;
  
  return d + Math.floor((153 * m2 + 2) / 5) + 365 * y2 + Math.floor(y2 / 4) - Math.floor(y2 / 100) + Math.floor(y2 / 400) - 32045;
}

// ─── API Routes ─────────────────────────────────────────────────────────────
// GET endpoint - retrieve planetary wisdom
// fallow-ignore-next-line complexity
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const parseResult = PlanetaryQuerySchema.safeParse({
      planet: searchParams.get('planet'),
      type: searchParams.get('type'),
    });

    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const { planet, type } = parseResult.data;
    const positions = getPlanetaryPositions();

    // Return all planets with positions
    if (!planet) {
      const planetsWithData = Object.entries(PLANETS).map(([key, p]) => ({
        key,
        ...p,
        currentPosition: positions[key],
      }));

      return NextResponse.json({
        success: true,
        planets: planetsWithData,
        timestamp: new Date().toISOString(),
        type: 'all',
        meta: {
          total: Object.keys(PLANETS).length,
          availablePlanets: Object.keys(PLANETS),
        },
      });
    }

    // Validate planet key
    const planetKeyParse = z.string().refine(
      (val) => Object.keys(PLANETS).includes(val.toLowerCase()),
      { message: 'Planeta inválido' }
    ).safeParse(planet.toLowerCase());

    if (!planetKeyParse.success) {
      return NextResponse.json({
        success: false,
        error: 'Planeta inválido',
        available: Object.keys(PLANETS),
      }, { status: 400 });
    }

    const planetKey = planetKeyParse.data;
    const planetData = PLANETS[planetKey];
    const pos = positions[planetKey];

    const response: Record<string, unknown> = {
      success: true,
      key: planetKey,
      ...planetData,
      currentPosition: pos,
      timestamp: new Date().toISOString(),
    };

    // Add specific wisdom based on type
    if (type === 'guidance') {
      response.guidance = generateGuidance(planetKey, planetData, pos);
      response.type = 'guidance';
    } else if (type === 'correspondences') {
      response.type = 'correspondences';
    } else {
      response.type = 'full';
    }

    return NextResponse.json(response);
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({
      success: false,
      error: `Erro interno: ${err.message}`,
    }, { status: 500 });
  }
}

// Generate guidance based on planetary position
function generateGuidance(
  planetKey: string,
  planet: Planet,
  position: { sign: string; degree: number }
): Guidance {
  const hour = new Date().getHours();
  const isDaytime = hour >= 6 && hour < 18;
  
  const signInfluences: Record<string, string[]> = {
    'Áries': ['Inicie novos projetos com coragem', 'Canalize energia em ação construtiva', 'Assertividade é favorecida'],
    'Touro': ['Foque em estabilidade e recursos', 'Prazer sensorial e conforto', 'Persistência traz resultados'],
    'Gêmeos': ['Comunicação é poder hoje', 'Flexibilidade mental', 'Conexões sociais são benéficas'],
    'Câncer': ['Emoções estão em destaque', 'Cuide de família e lar', 'Intuição está heightened'],
    'Leão': ['Expressão criativa brilha', 'Liderança natural é favorecida', 'Confiança pessoal aumenta'],
    'Virgem': ['Análise e organização', 'Detalhes importam', 'Serviço aos outros traz satisfação'],
    'Libra': ['Harmonia em relacionamentos', 'Beleza e arte são importantes', 'Equilíbrio é essencial'],
    'Escorpião': ['Transformação profunda', 'Poder pessoal está ativo', 'Revelações são possíveis'],
    'Sagitário': ['Expansão e filosofia', 'Viagens e novas perspectivas', 'Otimismo é contagious'],
    'Capricórnio': ['Disciplina e estrutura', 'Metas de longo prazo', 'Responsabilidade traz recompensas'],
    'Aquário': ['Inovação e originalidade', 'Pensamento humanitário', 'Liberdade individual'],
    'Peixes': ['Sensibilidade espiritual', 'Sonhos contêm mensagens', 'Dissolução de limites'],
  };

  const signInfluence = signInfluences[position.sign] || ['Influência neutral'];

  const planetActions: Record<string, string[]> = {
    sol: ['Aprecie sua identidade única', 'Busque clareza em decisões'],
    lua: ['Honre suas emoções', 'Pratique autocuidado'],
    mercurio: ['Comunique-se claramente', 'Organize seus pensamentos'],
    venus: ['Cultive relacionamentos', 'Aprecie a beleza'],
    marte: ['Tome iniciativa', 'Canalize energia positivamente'],
    jupiter: ['Expanda seus horizontes', 'Busque conhecimento'],
    saturno: ['Estabeleça estruturas', 'Pratique paciência'],
    urano: ['Abrace a mudança', 'Seja original'],
    netuno: ['Medite ou sonhe', 'Confie na intuição'],
    plutao: ['Libere o que não serve', 'Permita renascimento'],
  };

  return {
    sign: position.sign,
    degree: position.degree.toFixed(2),
    daily: `${planet.namePt} está em ${position.sign}. ${planet.affirmation}`,
    affirmations: [
      planet.affirmation,
      planet.ruler,
      ...signInfluence.slice(0, 2),
    ],
    actions: planetActions[planetKey] || [],
    favorable: planet.traits.slice(0, 3),
    caution: planet.challenges.slice(0, 2),
    timeOfDay: isDaytime ? 'Período diurno favorece energia Yang e ação' : 'Período noturno favorece energia Yin e reflexão',
  };
}