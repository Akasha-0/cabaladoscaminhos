import { analyzeDay, DayAnalysis } from './day-portal-analyzer';
import { getLunarPhase, LUNAR_PHASES, LunarPhase } from './lunar-phase-analyzer';
import { diagnoseSpiritualMisalignment, getSpiritualPrescription, DiagnosisResult } from './spiritual-diagnosis';
import { ODU_TAROT_CORRELATIONS, ORIXA_CHAKRA_MAP, DAY_PORTALS } from './correlation-types';

export interface RitualPlan {
  title: string;
  day: string;
  lunarPhase: string;
  focus: string;
  timing: {
    start: string;
    end: string;
    reason: string;
  };
  elements: {
    colors: string[];
    herbs: string[];
    incenses: string[];
    elements: string[];
    sounds: string[];
  };
  orixas: string[];
  sephirot: string[];
  arcanos: string[];
  steps: string[];
  affirmations: string[];
  warnings: string[];
  expectedOutcome: string;
}

/**
 * Generate a complete ritual plan for a specific day
 */
export function generateRitualPlan(
  date: Date,
  spiritualNeeds?: string[]
): RitualPlan {
  const dayName = getDayName(date);
  const dayAnalysis = analyzeDay(dayName);
  const lunarPhase = getLunarPhase(date);

  // Get spiritual diagnosis if needs provided
  const diagnosis = spiritualNeeds
    ? diagnoseSpiritualMisalignment(spiritualNeeds)
    : [];
  const prescription = diagnosis.length > 0
    ? getSpiritualPrescription(diagnosis)
    : null;

  // Build plan based on day portal
  const plan: RitualPlan = {
    title: `Ritual de ${dayAnalysis.portals.arcano.join(' e ')} - ${dayName}`,
    day: dayName,
    lunarPhase: lunarPhase.name,
    focus: getDayFocus(dayName),
    timing: {
      start: lunarPhase.window.start,
      end: lunarPhase.window.end,
      reason: lunarPhase.window.description,
    },
    elements: {
      colors: getDayColors(dayName),
      herbs: dayAnalysis.rituals.herbs,
      incenses: getDayIncenses(dayName),
      elements: getDayElements(dayName),
      sounds: getDaySounds(dayName),
    },
    orixas: dayAnalysis.portals.orixa,
    sephirot: dayAnalysis.portals.sephirah,
    arcanos: dayAnalysis.portals.arcano,
    steps: generateRitualSteps(dayName, lunarPhase, diagnosis),
    affirmations: generateAffirmations(dayName, diagnosis),
    warnings: getDayWarnings(dayName),
    expectedOutcome: getExpectedOutcome(dayName, diagnosis),
  };

  return plan;
}

function getDayName(date: Date): string {
  const days: Record<number, string> = {
    0: 'Domingo',
    1: 'Segunda-feira',
    2: 'Terça-feira',
    3: 'Quarta-feira',
    4: 'Quinta-feira',
    5: 'Sexta-feira',
    6: 'Sábado',
  };
  return days[date.getDay()];
}

function getDayFocus(day: string): string {
  const focus: Record<string, string> = {
    'Segunda-feira': 'Aterramento, limpeza ancestral, proteção',
    'Terça-feira': 'Força, movimento, quebra de demandas',
    'Quarta-feira': 'Justiça, verdade, clareza mental',
    'Quinta-feira': 'Abundância, expansão, conhecimento',
    'Sexta-feira': 'Paz, purificação, conexão divina',
    'Sábado': 'Amor, intuição, fertilidade',
    'Domingo': 'Vitalidade, propósito, brilho pessoal',
  };
  return focus[day] || 'Harmonia geral';
}

function getDayColors(day: string): string[] {
  const colors: Record<string, string[]> = {
    'Segunda-feira': ['Vermelho', 'Branco', 'Preto'],
    'Terça-feira': ['Laranja', 'Vermelho', 'Verde'],
    'Quarta-feira': ['Amarelo', 'Branco'],
    'Quinta-feira': ['Verde', 'Azul-turquesa'],
    'Sexta-feira': ['Branco', 'Violeta', 'Rosa'],
    'Sábado': ['Azul Escuro', 'Rosa', 'Branco'],
    'Domingo': ['Amarelo', 'Dourado', 'Laranja'],
  };
  return colors[day] || ['Branco'];
}

function getDayIncenses(day: string): string[] {
  const incenses: Record<string, string[]> = {
    'Segunda-feira': ['Mirra', 'Cânfora', 'Sândalo'],
    'Terça-feira': ['Arruda', 'Cânfora', 'Pinhão Roxo'],
    'Quarta-feira': ['Alecrim', 'Estoraque'],
    'Quinta-feira': ['Benjoim', 'Eucalipto'],
    'Sexta-feira': ['Olíbano', 'Jasmim', 'Rosa Branca'],
    'Sábado': ['Mirra', 'Rosa', 'Verbena'],
    'Domingo': ['Olifício', 'Canela', 'Laranja'],
  };
  return incenses[day] || ['Olícito'];
}

function getDayElements(day: string): string[] {
  const elements: Record<string, string[]> = {
    'Segunda-feira': ['Terra', 'Água'],
    'Terça-feira': ['Fogo', 'Terra'],
    'Quarta-feira': ['Fogo', 'Ar'],
    'Quinta-feira': ['Água', 'Ar'],
    'Sexta-feira': ['Éter', 'Ar'],
    'Sábado': ['Água', 'Éter'],
    'Domingo': ['Fogo', 'Éter'],
  };
  return elements[day] || ['Ar'];
}

function getDaySounds(day: string): string[] {
  const sounds: Record<string, string[]> = {
    'Segunda-feira': ['396 Hz (LAM)', '417 Hz (VAM)'],
    'Terça-feira': ['528 Hz (RAM)', '741 Hz (HAM)'],
    'Quarta-feira': ['528 Hz (RAM)', '639 Hz (YAM)'],
    'Quinta-feira': ['639 Hz (YAM)', '741 Hz (HAM)'],
    'Sexta-feira': ['852 Hz (OM)', '963 Hz (AUM)'],
    'Sábado': ['639 Hz (YAM)', '852 Hz (OM)'],
    'Domingo': ['528 Hz (RAM)', '963 Hz (AUM)'],
  };
  return sounds[day] || ['963 Hz (AUM)'];
}

function generateRitualSteps(
  day: string,
  lunarPhase: LunarPhase,
  diagnosis: DiagnosisResult[]
): string[] {
  const baseSteps = [
    'Preparar o espaço com defumação de ' + getDayIncenses(day)[0],
    'Acender velas nas cores de ' + day,
    'Colocar água e sal no altar',
    'Sentar em posição confortável',
    'Respirar profundamente 3 vezes',
    'Recitar oração do dia ou mantram correspondente',
    'Emitir o som semilla (LAM/VAM/RAM/YAM/HAM/OM/AUM)',
    'Pedir alinhamento com a energia do dia',
    'Fazer reflexão ou pedido específico',
    'Agradecer aos Orixás do dia',
    'Desligar velas com pensamento de paz',
  ];

  // Add diagnosis-specific steps
  if (diagnosis.length > 0) {
    baseSteps.push(
      'Aplicar o tratamento específico: ' + diagnosis[0].correctiveActions.ritual
    );
  }

  return baseSteps;
}

function generateAffirmations(day: string, diagnosis: DiagnosisResult[]): string[] {
  const baseAffirmations: Record<string, string[]> = {
    'Segunda-feira': [
      'Eu me ancoro na terra e libero todo medo',
      'Meus ancestrais me protegem e guiam',
    ],
    'Terça-feira': [
      'Tenho força e coragem para enfrentar qualquer desafio',
      'Corto todo vínculo negativo que intercepta meus caminhos',
    ],
    'Quarta-feira': [
      'Minha mente é clara e minha verdade brilha',
      'A justiça divina opera em minha vida',
    ],
    'Quinta-feira': [
      'Abundância flui para minha vida naturalmente',
      'Sou digno de prosperidade em todas as áreas',
    ],
    'Sexta-feira': [
      'Meu Ori está em paz e harmonia',
      'Conecto-me com a luz divina que tudo ilumina',
    ],
    'Sábado': [
      'Amo e sou amado inconditionicamente',
      'Minha intuição me guia com precisão',
    ],
    'Domingo': [
      'Minha luz interior brilha com força',
      'Alinho-me com meu verdadeiro propósito',
    ],
  };

  const affirmations = baseAffirmations[day] || ['Eu fluo em harmonia com o universo'];

  // Add diagnosis affirmations
  if (diagnosis.length > 0) {
    diagnosis.forEach(d => {
      affirmations.push(d.correctiveActions.affirmation);
    });
  }

  return [...new Set(affirmations)].slice(0, 5);
}

function getDayWarnings(day: string): string[] {
  const warnings: Record<string, string[]> = {
    'Segunda-feira': [
      'Evitar conflitos e decisões precipitadas',
      'Não comer carne de porco',
    ],
    'Terça-feira': [
      'Evitar inação e procrastinação',
      'Não guardar objetos quebrados em casa',
    ],
    'Quarta-feira': [
      'Evitar segredos e falsidade',
      'Não comer abóbora',
    ],
    'Quinta-feira': [
      'Evitar ganância e inveja',
      'Cuidar com mel em excesso',
    ],
    'Sexta-feira': [
      'Evitar roupas escuras',
      'Não consumir azeite de dendê ou sal',
    ],
    'Sábado': [
      'Evitar banhos de mar em dias de vento',
      'Não comer ovos ou abóbora',
    ],
    'Domingo': [
      'Evitar preocupação excessiva',
      'Manter a cabeça fria',
    ],
  };
  return warnings[day] || [];
}

function getExpectedOutcome(day: string, diagnosis: DiagnosisResult[]): string {
  const outcomes: Record<string, string> = {
    'Segunda-feira': 'Aterramento profundo, proteção ancestral, abertura de caminhos',
    'Terça-feira': 'Força interior, coragem, quebra de amarrações',
    'Quarta-feira': 'Clareza mental, verdade revelada, equilíbrio',
    'Quinta-feira': 'Abundância manifestada, fartura, expansão',
    'Sexta-feira': 'Paz interior, purificação, conexão divina',
    'Sábado': 'Amor próprio aumentado, intuição fortalecida, fertilidade',
    'Domingo': 'Vitalidade reestabelecida, propósito clareado, brilho',
  };

  let outcome = outcomes[day] || 'Harmonia espiritual';

  if (diagnosis.length > 0) {
    outcome += `; tratamento do ${diagnosis[0].chakra}`;
  }

  return outcome;
}

/**
 * Get weekly ritual schedule
 */
export function getWeeklyRitualSchedule(spiritualNeeds?: string[]): RitualPlan[] {
  const days = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];
  const today = new Date();
  const currentDay = today.getDay();

  return days.map((day, index) => {
    const planDate = new Date(today);
    planDate.setDate(today.getDate() + (index - currentDay));
    return generateRitualPlan(planDate, spiritualNeeds);
  });
}
