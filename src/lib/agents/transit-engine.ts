// ============================================================
// TRANSIT ENGINE
// ============================================================
// Motor de Trânsitos Planetários DINÂMICO.
// Calcula influências astrológicas do dia em relação ao mapa natal.
//
// Usa as efemérides do projeto (src/lib/astrologia/planet-positions)
// para calcular posições planetárias ATUAIS e cruzá-las com o mapa
// natal, gerando insights práticos para cada área da vida.
//
// 100% DINÂMICO - funciona para QUALQUER data.
// ============================================================

import { getPositions, type PlanetPosition } from '@/lib/astrologia/planet-positions';
import { getBirthChart, type BirthChart } from '@/lib/astrologia/birth-chart';
import { findAspects } from '@/lib/astrologia/aspect-finder';

// ============================================================
// TYPES
// ============================================================

export type Planet = 'sol' | 'lua' | 'mercurio' | 'venus' | 'marte' |
                     'jupiter' | 'saturno' | 'urano' | 'netuno' | 'plutao' |
                     'node_norte' | 'node_sul';

export type AspectType = 'conjuncao' | 'sextil' | 'quadratura' | 'trino' | 'oposicao';

export interface TransitAspect {
  transitPlanet: Planet;
  natalPlanet: Planet;
  aspect: AspectType;
  exactness: number;          // 0-100 (100 = exato)
  isApplying: boolean;
  duration: string;           // "2-3 dias" etc
  interpretation: string;
  lifeAreas: string[];        // Áreas da vida afetadas
  energy: 'harmonioso' | 'desafiador' | 'neutro';
  recommendation: string;
}

export interface MoonPhase {
  phase: 'nova' | 'crescente' | 'cheia' | 'minguante' |
         'lua-crescente' | 'gibosa-crescente' | 'gibosa-minguante' | 'lua-minguante';
  name: string;
  illumination: number;       // 0-100%
  energy: string;
  action: string;
  avoid: string;
  rituals: string[];
  favorableFor: string[];
}

export interface DailyEnergy {
  date: string;
  moonPhase: MoonPhase;
  retrogradePlanets: Planet[];
  majorAspects: TransitAspect[];
  overallEnergy: number;      // 0-100
  overallTheme: string;
  keyAdvice: string;
  luckyColor: string;
  luckyNumber: number;
  powerHour: string;          // Horário de pico de energia
}

// ============================================================
// INTERPRETAÇÕES DOS ASPECTOS DE TRÂNSITO
// ============================================================

const TRANSIT_INTERPRETATIONS: Record<string, {
  interpretation: string;
  lifeAreas: string[];
  energy: 'harmonioso' | 'desafiador' | 'neutro';
  recommendation: string;
}> = {
  // Sol em trânsito
  'sol-sol-conjuncao': {
    interpretation: 'Renovação da identidade. Momento de brilhar e ser visto.',
    lifeAreas: ['proposito', 'criatividade', 'lideranca'],
    energy: 'harmonioso',
    recommendation: 'Mostre quem você é. Inicie algo significativo.',
  },
  'sol-sol-oposicao': {
    interpretation: 'Tensão entre o eu e os outros. Conflito de identidade.',
    lifeAreas: ['relacionamentos', 'autoconhecimento'],
    energy: 'desafiador',
    recommendation: 'Encontre o equilíbrio entre suas necessidades e as do outro.',
  },
  'sol-sol-trino': {
    interpretation: 'Fluidez criativa e vitalidade abundante.',
    lifeAreas: ['criatividade', 'saude', 'carreira'],
    energy: 'harmonioso',
    recommendation: 'Aproveite a harmonia. Aja, crie, brilhe.',
  },
  // Lua em trânsito
  'lua-sol-conjuncao': {
    interpretation: 'Emoções à flor da pele. Intuição amplificada.',
    lifeAreas: ['emocoes', 'familia', 'relacionamentos'],
    energy: 'neutro',
    recommendation: 'Confie na intuição, cuide das emoções.',
  },
  'lua-lua-conjuncao': {
    interpretation: 'Momento emocionalmente carregado. Reencontro com o passado.',
    lifeAreas: ['familia', 'emocoes'],
    energy: 'neutro',
    recommendation: 'Honre o que sente. Pratique autocuidado.',
  },
  // Mercúrio
  'mercurio-mercurio-conjuncao': {
    interpretation: 'Clareza mental, comunicação fluida.',
    lifeAreas: ['comunicacao', 'conhecimento'],
    energy: 'harmonioso',
    recommendation: 'Assine contratos, converse, escreva.',
  },
  'mercurio-sol-conjuncao': {
    interpretation: 'Mente e vontade alinhadas. Decisões claras.',
    lifeAreas: ['comunicacao', 'carreira'],
    energy: 'harmonioso',
    recommendation: 'Apresente ideias, negociações, decisões importantes.',
  },
  // Vênus
  'venus-venus-conjuncao': {
    interpretation: 'Magnetismo pessoal elevado. Atração e beleza.',
    lifeAreas: ['relacionamentos', 'financas', 'sexualidade'],
    energy: 'harmonioso',
    recommendation: 'Cultive o amor, invista em beleza, atraia o que deseja.',
  },
  'venus-marte-conjuncao': {
    interpretation: 'Paixão ardente. Desejo e ação unidos.',
    lifeAreas: ['sexualidade', 'relacionamentos', 'criatividade'],
    energy: 'harmonioso',
    recommendation: 'Declare seu amor, crie com paixão, mova-se.',
  },
  // Marte
  'marte-marte-conjuncao': {
    interpretation: 'Energia física e assertividade no auge.',
    lifeAreas: ['carreira', 'saude', 'sexualidade'],
    energy: 'neutro',
    recommendation: 'Use a energia com propósito. Evite irritação.',
  },
  'marte-saturno-conjuncao': {
    interpretation: 'Disciplina extrema. Frustração se não agir com ética.',
    lifeAreas: ['carreira', 'saude', 'autoconhecimento'],
    energy: 'desafiador',
    recommendation: 'Pare, planeje, aja com paciência. Use a raiva com sabedoria.',
  },
  'marte-saturno-quadratura': {
    interpretation: 'Tensão entre ação e estrutura. Bloqueios e atritos.',
    lifeAreas: ['carreira', 'relacionamentos', 'saude'],
    energy: 'desafiador',
    recommendation: 'Respire antes de agir. Resolva com maturidade.',
  },
  'marte-jupiter-trino': {
    interpretation: 'Ação bem-sucedida. Confiança e expansão.',
    lifeAreas: ['carreira', 'financas', 'criatividade'],
    energy: 'harmonioso',
    recommendation: 'Arrisque-se. Inicie grandes projetos.',
  },
  // Júpiter
  'jupiter-sol-conjuncao': {
    interpretation: 'Sorte, expansão, oportunidades abundantes.',
    lifeAreas: ['proposito', 'carreira', 'financas'],
    energy: 'harmonioso',
    recommendation: 'Abra-se para o que é maior. Aja com otimismo.',
  },
  'jupiter-jupiter-conjuncao': {
    interpretation: 'Novo ciclo de 12 anos começa. Expansão significativa.',
    lifeAreas: ['todos'],
    energy: 'harmonioso',
    recommendation: 'Plante sementes de visão ampla. Viaje, estude, expanda.',
  },
  // Saturno
  'saturno-sol-conjuncao': {
    interpretation: 'Momento de maturidade, responsabilidade e karma.',
    lifeAreas: ['carreira', 'autoconhecimento', 'proposito'],
    energy: 'desafiador',
    recommendation: 'Encare responsabilidades. Defina limites. Esteja sóbrio.',
  },
  'saturno-lua-conjuncao': {
    interpretation: 'Emoções contidas. Necessidade de estrutura emocional.',
    lifeAreas: ['familia', 'emocoes', 'relacionamentos'],
    energy: 'desafiador',
    recommendation: 'Construa segurança interior. Enfrente medos.',
  },
  'saturno-venus-conjuncao': {
    interpretation: 'Amor sério. Compromissos profundos. Possível frieza.',
    lifeAreas: ['relacionamentos', 'financas'],
    energy: 'desafiador',
    recommendation: 'Comprometa-se de verdade. Defina valores.',
  },
  // Urano
  'urano-sol-conjuncao': {
    interpretation: 'Ruptura libertadora. Mudança radical na identidade.',
    lifeAreas: ['autoconhecimento', 'carreira', 'relacionamentos'],
    energy: 'neutro',
    recommendation: 'Liberte-se do que não é você. Abrace o novo.',
  },
  'urano-venus-conjuncao': {
    interpretation: 'Atração repentina, mudanças no amor e finanças.',
    lifeAreas: ['relacionamentos', 'financas', 'amizades'],
    energy: 'neutro',
    recommendation: 'Esteja aberto ao inesperado. Mas evite decisões impulsivas.',
  },
  // Netuno
  'netuno-sol-conjuncao': {
    interpretation: 'Inspiração divina, sensibilidade extrema, dissolução do ego.',
    lifeAreas: ['espiritualidade', 'criatividade', 'autoconhecimento'],
    energy: 'harmonioso',
    recommendation: 'Medite, crie, sonhe. Mas mantenha os pés no chão.',
  },
  'netuno-netuno-conjuncao': {
    interpretation: 'Ciclo espiritual de 14 anos. Dissolução e renascimento.',
    lifeAreas: ['espiritualidade', 'todos'],
    energy: 'neutro',
    recommendation: 'Solte o que não serve. Permita-se ser guiado.',
  },
  // Plutão
  'plutao-sol-conjuncao': {
    interpretation: 'Transformação profunda do eu. Poder e morte simbólica.',
    lifeAreas: ['autoconhecimento', 'proposito', 'carreira'],
    energy: 'desafiador',
    recommendation: 'Encare suas sombras. Morra para renascer.',
  },
  'plutao-venus-conjuncao': {
    interpretation: 'Paixão obsessiva, transformações amorosas.',
    lifeAreas: ['relacionamentos', 'sexualidade', 'financas'],
    energy: 'desafiador',
    recommendation: 'Vá fundo no amor. Cuidado com manipulação.',
  },
};

// ============================================================
// ASPECT ORBS para trânsitos
// ============================================================

const TRANSIT_ORBS: Record<AspectType, number> = {
  conjuncao: 3,
  oposicao: 3,
  quadratura: 2.5,
  trino: 3,
  sextil: 2.5,
};

// ============================================================
// CÁLCULO DE FASE LUNAR
// ============================================================

// fallow-ignore-next-line complexity
function calculateMoonPhase(date: Date): MoonPhase {
  // Algoritmo simplificado de fase lunar
  // Referência: Lua Nova 2000-01-06
  const reference = new Date('2000-01-06T18:14:00Z');
  const lunarCycle = 29.530588853;
  const diff = (date.getTime() - reference.getTime()) / (1000 * 60 * 60 * 24);
  const cycles = diff / lunarCycle;
  const phaseIndex = cycles - Math.floor(cycles);

  let phase: MoonPhase['phase'];
  let name: string;
  let energy: string;
  let action: string;
  let avoid: string;
  let rituals: string[];
  let favorableFor: string[];

  if (phaseIndex < 0.0625 || phaseIndex >= 0.9375) {
    phase = 'nova';
    name = '🌑 Lua Nova';
    energy = 'Intenção, plantio, recomeços';
    action = 'Plante sementes. Faça pedidos. Inicie ciclos internos.';
    avoid = 'Decisões precipitadas, gastos excessivos';
    rituals = ['Banho de ervas', 'Defumação', 'Escrever intenções', 'Jejum opcional'];
    favorableFor = ['Manifestação', 'Novoscomeços', 'Meditação profunda', 'Autoconhecimento'];
  } else if (phaseIndex < 0.1875) {
    phase = 'lua-crescente';
    name = '🌒 Lua Crescente';
    energy = 'Crescimento, ação, construção';
    action = 'Tome ações concretas. Avance nos planos.';
    avoid = 'Dúvidas, hesitação';
    rituals = ['Visualização ativa', 'Carta de intenções', 'Atividade física'];
    favorableFor = ['Iniciativa', 'Networking', 'Investimentos pequenos', 'Estudos'];
  } else if (phaseIndex < 0.3125) {
    phase = 'crescente';
    name = '🌓 Quarto Crescente';
    energy = 'Decisão, superação de desafios';
    action = 'Encare obstáculos. Decida com coragem.';
    avoid = 'Procrastinação, autossabotagem';
    rituals = ['Banho de sal grosso', 'Defumação', 'Queima de papéis negativos'];
    favorableFor = ['Decisões', 'Cortes', 'Ação decisiva', 'Resolução de conflitos'];
  } else if (phaseIndex < 0.4375) {
    phase = 'gibosa-crescente';
    name = '🌔 Gibosa Crescente';
    energy = 'Refinamento, ajustes, paciência';
    action = 'Ajuste o que não está funcionando. Confie no processo.';
    avoid = 'Imperfeição como desculpa para não agir';
    rituals = ['Meditação', 'Journaling', 'Banho de flores'];
    favorableFor = ['Refinamento', 'Ajustes', 'Networking', 'Preparação'];
  } else if (phaseIndex < 0.5625) {
    phase = 'cheia';
    name = '🌕 Lua Cheia';
    energy = 'Colheita, iluminação, pico emocional';
    action = 'Celebre o que conquistou. Solte o que não serve.';
    avoid = 'Acumular, apegar, evitar verdades';
    rituals = ['Banho de lua', 'Gratidão', 'Queima de pedidos', 'Festa'];
    favorableFor = ['Colheita', 'Encerramentos', 'Rituais de poder', 'Encontros'];
  } else if (phaseIndex < 0.6875) {
    phase = 'gibosa-minguante';
    name = '🌖 Gibosa Minguante';
    energy = 'Gratidão, partilha, generosidade';
    action = 'Compartilhe o que aprendeu. Ensine, doe.';
    avoid = 'Avareza, orgulho';
    rituals = ['Oferendas', 'Voluntariado', 'Agradecer'];
    favorableFor = ['Ensino', 'Partilha', 'Generosidade', 'Voluntariado'];
  } else if (phaseIndex < 0.8125) {
    phase = 'minguante';
    name = '🌗 Quarto Minguante';
    energy = 'Liberação, perdão, desintoxicação';
    action = 'Solte, perdoe, limpe. Detox digital, emocional, físico.';
    avoid = 'Apego, rancor, ressentimento';
    rituals = ['Banho de sal grosso', 'Descarrego', 'Soltar objetos'];
    favorableFor = ['Desapego', 'Limpeza', 'Cortes energéticos', 'Terapia'];
  } else {
    phase = 'lua-minguante';
    name = '🌘 Lua Minguante (Balsâmica)';
    energy = 'Descanso, recolhimento, preparação';
    action = 'Descanse, medite, se prepare para o novo ciclo.';
    avoid = 'Ações grandes, socialização excessiva';
    rituals = ['Meditação silenciosa', 'Jejum', 'Sono reparador'];
    favorableFor = ['Descanso', 'Retiros', 'Reflexão', 'Preparação'];
  }

  // Calcular iluminação (0-100%)
  const illumination = Math.round(
    (1 - Math.cos(phaseIndex * 2 * Math.PI)) / 2 * 100
  );

  return {
    phase,
    name,
    illumination,
    energy,
    action,
    avoid,
    rituals,
    favorableFor,
  };
}

// ============================================================
// CÁLCULO DE TRÂNSITOS DO DIA
// ============================================================
// fallow-ignore-next-line complexity

function calculateTransits(
  birthChart: BirthChart,
  currentDate: Date = new Date(),
  orbs: Record<AspectType, number> = TRANSIT_ORBS
): TransitAspect[] {
  const transitPositions = getPositions(currentDate);
  const natalPositions = birthChart.planets;

  const aspects: TransitAspect[] = [];

  for (const transit of transitPositions) {
    for (const natal of natalPositions) {
      if (!transit || !natal) continue;

      const aspect = findSingleAspect(
        transit.longitude,
        natal.longitude,
        orbs
      );

      if (aspect) {
        const key = `${transit.planet}-${natal.planet}-${aspect}`;
        const interpretation = TRANSIT_INTERPRETATIONS[key] ||
          getGenericInterpretation(transit.planet, natal.planet, aspect);

        // Calcular exactness
        const exactness = calculateExactness(transit.longitude, natal.longitude, aspect);

        aspects.push({
          transitPlanet: transit.planet as Planet,
          natalPlanet: natal.planet as Planet,
          aspect: aspect as AspectType,
          exactness,
          isApplying: exactness > 70,
          duration: estimateDuration(transit.planet),
          interpretation: interpretation.interpretation,
          lifeAreas: interpretation.lifeAreas,
          energy: interpretation.energy,
          recommendation: interpretation.recommendation,
        });
      }
    }
  }

  // Ordenar por exactness (mais importantes primeiro)
  return aspects.sort((a, b) => b.exactness - a.exactness);
}

function findSingleAspect(
  transitLon: number,
  natalLon: number,
  orbs: Record<AspectType, number>
): AspectType | null {
  let diff = Math.abs(transitLon - natalLon);
  if (diff > 180) diff = 360 - diff;

  const aspectAngles: Record<AspectType, number> = {
    conjuncao: 0,
    sextil: 60,
    quadratura: 90,
    trino: 120,
    oposicao: 180,
  };

  for (const [aspect, angle] of Object.entries(aspectAngles)) {
    if (Math.abs(diff - angle) <= orbs[aspect as AspectType]) {
      return aspect as AspectType;
    }
  }

  return null;
}

function calculateExactness(t1: number, t2: number, aspect: AspectType): number {
  let diff = Math.abs(t1 - t2);
  if (diff > 180) diff = 360 - diff;

  const targetAngles: Record<AspectType, number> = {
    conjuncao: 0,
    sextil: 60,
    quadratura: 90,
    trino: 120,
    oposicao: 180,
  };

  const target = targetAngles[aspect];
  const distance = Math.abs(diff - target);

  // 100% = perfeito, 0% = orb máximo
  return Math.max(0, Math.min(100, 100 - (distance / 3) * 100));
}

function estimateDuration(planet: Planet | string): string {
  const durations: Record<string, string> = {
    sol: '1-2 dias',
    lua: '2-4 horas',
    mercurio: '3-5 dias',
    venus: '3-5 dias',
    marte: '4-7 dias',
    jupiter: '5-7 dias',
    saturno: '7-14 dias',
    urano: '14-30 dias',
    netuno: '30-60 dias',
    plutao: '60-180 dias',
    node_norte: '30-60 dias',
    node_sul: '30-60 dias',
  };
  return durations[planet] || '1-3 dias';
// fallow-ignore-next-line complexity
}

function getGenericInterpretation(
  transitP: Planet | string,
  natalP: Planet | string,
  aspect: AspectType
): { interpretation: string; lifeAreas: string[]; energy: 'harmonioso' | 'desafiador' | 'neutro'; recommendation: string } {
  const energy: 'harmonioso' | 'desafiador' | 'neutro' =
    aspect === 'trino' || aspect === 'sextil' ? 'harmonioso' :
    aspect === 'quadratura' || aspect === 'oposicao' ? 'desafiador' : 'neutro';

  return {
    interpretation: `Trânsito de ${String(transitP)} ${aspect} ao ${String(natalP)} natal traz movimento nessa área.`,
    lifeAreas: ['geral'],
    energy,
    recommendation: energy === 'harmonioso'
      ? 'Aproveite o fluxo positivo.'
      : energy === 'desafiador'
        ? 'Observe a lição, não resista.'
        : 'Mantenha-se presente e consciente.',
  };
}

// ============================================================
// ENERGIA DIÁRIA COMPLETA
// ============================================================

export function buildDailyEnergy(
  birthChart: BirthChart,
  currentDate: Date = new Date()
): DailyEnergy {
  const moonPhase = calculateMoonPhase(currentDate);
  const aspects = calculateTransits(birthChart, currentDate);

  const retrogradePlanets: Planet[] = birthChart.planets
    .filter((p: PlanetPosition) => p?.retrograde)
    .map((p: PlanetPosition) => p.planet as Planet);

  const majorAspects = aspects
    .filter(a => a.exactness >= 50)
    .slice(0, 7);

  // Overall energy
  const harmonious = majorAspects.filter(a => a.energy === 'harmonioso').length;
  const challenging = majorAspects.filter(a => a.energy === 'desafiador').length;
  const moonMultiplier = moonPhase.phase === 'cheia' ? 1.2 :
                        moonPhase.phase === 'nova' ? 0.8 : 1.0;
  const overallEnergy = Math.min(100, Math.max(0,
    50 + (harmonious * 8) - (challenging * 6)
  )) * moonMultiplier;

  const overallTheme = generateOverallTheme(moonPhase, majorAspects);
  const keyAdvice = generateKeyAdvice(moonPhase, majorAspects);
  const { luckyColor, luckyNumber } = calculateLuckyForDay(currentDate);
  const powerHour = calculatePowerHour(currentDate);

  return {
    date: currentDate.toISOString().split('T')[0],
    moonPhase,
    retrogradePlanets,
    majorAspects,
    overallEnergy: Math.round(overallEnergy),
    overallTheme,
    keyAdvice,
    luckyColor,
    luckyNumber,
    powerHour,
  };
}

function generateOverallTheme(moon: MoonPhase, aspects: TransitAspect[]): string {
  if (aspects.length === 0) {
    return `Dia de ${moon.energy.toLowerCase()}. ${moon.action}`;
  }
  const topAspect = aspects[0];
  if (!topAspect) {
    return `Dia de ${moon.energy.toLowerCase()}. ${moon.action}`;
  }
  return `${moon.name} + ${topAspect.transitPlanet} ${topAspect.aspect} seu ${topAspect.natalPlanet}: ${topAspect.interpretation}`;
}

function generateKeyAdvice(moon: MoonPhase, aspects: TransitAspect[]): string {
  if (aspects.length === 0) return moon.action;
  const top = aspects[0];
  if (!top) return moon.action;
  return top.recommendation;
}

function calculateLuckyForDay(date: Date): { luckyColor: string; luckyNumber: number } {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  const sum = String(day + month + year).split('').reduce((a, b) => a + parseInt(b, 10), 0);
  const luckyNumber = ((sum * 7) % 9) + 1;

  const colors = ['Vermelho', 'Laranja', 'Amarelo', 'Verde', 'Azul', 'Violeta', 'Rosa', 'Dourado', 'Branco'];
  const luckyColor = colors[(sum - 1) % colors.length];

  return { luckyColor, luckyNumber };
}

function calculatePowerHour(date: Date): string {
  // Simplificado: horário de pico baseado no signo solar médio do dia
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  const hours = ['06-08h', '08-10h', '10-12h', '12-14h', '14-16h', '16-18h', '18-20h', '20-22h'];
  return hours[dayOfYear % hours.length];
}
