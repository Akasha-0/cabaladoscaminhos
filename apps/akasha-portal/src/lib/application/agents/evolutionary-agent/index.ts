/**
 * evolutionary-agent/index.ts
 *
 * Agente evolutivo — camada 7 do ROADMAP.
 * Propoe exercícios e rituais personalizados com base no ciclo pessoal,
 * história de áreas e fase lunar.
 */
import type { PersonalCycleSnapshot } from '@/lib/application/agents/personal-cycle-engine';
// ─── Personal Day Exercises ───────────────────────────────────────────────────

import { PERSONAL_DAY_EXERCISES } from './synthesis-engine/personal-day-exercises-data';
import type { DayEnergy } from './synthesis-engine/personal-day-exercises-data';

export type { AreaHistoryEntry, CycleModulation } from './area-history';
export { trackAreaRead, detectAreaPatterns } from './area-history';
export { LUNAR_EXERCISES, normalizePhase, deriveLunarExercises } from './lunar-exercises';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface EvolutionaryExercise {
  id: string;
  area: string;
  title: string;
  instruction: string;
  duration: string;
  difficulty: 'light' | 'moderate' | 'deep';
  type: 'ritual' | 'meditation' | 'journaling' | 'movement' | 'social';
  cycleAnchor: {
    personalDay?: boolean;
    personalMonth?: boolean;
    personalYear?: boolean;
    pinnacle?: boolean;
    karmicLesson?: boolean;
    lunar?: boolean;
  };
  rationale: string;
}

export interface CycleExerciseSet {
  date: string;
  personalDay: EvolutionaryExercise[];
  personalMonth: EvolutionaryExercise[];
  personalYear: EvolutionaryExercise[];
  pinnacle: EvolutionaryExercise[];
  karmicLessons: EvolutionaryExercise[];
  lunar: EvolutionaryExercise[];
  prioritizedExercises: EvolutionaryExercise[];
}

// ─── Lunar Phases ─────────────────────────────────────────────────────────────

const LUNAR_EXERCISES = {
  nova: {
    theme: 'Plantio interno — introspecção e intenção',
    exercises: {
      ritual: {
        title: 'Ritual de Intenção Lunar',
        instruction:
          'Acenda uma vela branca. No papel, escreva 3 intenções para este ciclo lunar. Leia em voz alta, dobrando o papel e guardando num lugar sagrado. Prancha: https://youtu.be/placeholder',
        duration: '10 minutos',
        difficulty: 'light' as const,
      },
      meditation: {
        title: 'Meditação do Vazio Criativo',
        instruction:
          'Sente-se em silêncio. Observe os pensamentos sem apego, como nuvens passando. Permita que a mente se aquiete até surgir uma imagem ou sensação — é a sua intenção.seed.',
        duration: '12 minutos',
        difficulty: 'light' as const,
      },
      journaling: {
        title: 'Diário do Novo Começo',
        instruction:
          'Escreva: "Este ciclo lunar eu escolho ___" (3 preenchimentos). Depois escreva: "O que preciso soltar para que isso se manifeste é ___" (2 preenchimentos). Sem filtro, sem censura.',
        duration: '10 minutos',
        difficulty: 'light' as const,
      },
      movement: {
        title: 'Dança do Novo Ar',
        instruction:
          'Música: algo fluido e ascendente. Mova-se livremente, imaginando que cada gesto planta uma semente no espaço. Termine em posição de gratidão.',
        duration: '15 minutos',
        difficulty: 'light' as const,
      },
      social: {
        title: 'Círculo de Intenções Partilhadas',
        instruction:
          'Reúna 1-3 pessoas de confiança. Cada um partilha uma intenção para este ciclo. Os outros reflectem sem advice — só espelho e acolhimento.',
        duration: '45 minutos',
        difficulty: 'moderate' as const,
      },
    },
  },
  crescente: {
    theme: 'Expansão — ação e construção',
    exercises: {
      ritual: {
        title: 'Ritual de Cascata Ascendente',
        instruction:
          'Com um copo de água, desperdice simbólica e lentamente enquanto diz: "Que isto cresça e se multiplique". Visualize a água infiltrando na terra e dela brotando o que pediu.',
        duration: '7 minutos',
        difficulty: 'light' as const,
      },
      meditation: {
        title: 'Meditação do Fogo Interior',
        instruction:
          'Feche os olhos. Visualize um fogo no centro do peito — pequeno no início, depois cada vez maior. Sinta-o aquecer o corpo inteiro e projectar luz para fora.',
        duration: '12 minutos',
        difficulty: 'moderate' as const,
      },
      journaling: {
        title: 'Plano de 3 Próximos Passos',
        instruction:
          'Escolha uma intenção da Lua Nova. Escreva 3 acções concretas — com quem, quando, como — que avance essa intenção nos próximos 7 dias. Seja específico.',
        duration: '10 minutos',
        difficulty: 'moderate' as const,
      },
      movement: {
        title: 'Yoga Solar (Surya Namaskar)',
        instruction:
          '7 rounds de Salutação ao Sol. Comece devagar, aumente gradualmente. Sinta o calor muscular e a energia subindo do sacro ao coração.',
        duration: '20 minutos',
        difficulty: 'moderate' as const,
      },
      social: {
        title: 'Alinhamento com Aliado',
        instruction:
          'Marque uma conversa com alguém que respeito — amigo, mentor, terapeuta. Peça feedback honesto sobre o seu caminho actual e ouça sem defender.',
        duration: '60 minutos',
        difficulty: 'moderate' as const,
      },
    },
  },
  cheia: {
    theme: 'Pico de energia — manifestação e celebração',
    exercises: {
      ritual: {
        title: 'Ritual de Gratidão Luminosa',
        instruction:
          'Ao entardecer, acenda uma vela dourada. Liste em voz alta 7 coisas que recebeu desde a Lua Nova — concretas ou subtis. Agradeça uma a uma.',
        duration: '10 minutos',
        difficulty: 'light' as const,
      },
      meditation: {
        title: 'Meditação do Abraço Infinito',
        instruction:
          'Sentado, visualize-se no centro de uma esfera de luz. Primeiro, dirija amor a si mesmo; depois, às pessoas que ama; depois, aos que dificuldade. Termine com compaixão pelo mundo.',
        duration: '15 minutos',
        difficulty: 'moderate' as const,
      },
      journaling: {
        title: 'Diário de Celebração e Projecção',
        instruction:
          'Escreva: "As maiores vitórias desde a Lua Nova foram ___. Como me senti ___." Depois: "O que quero celebrar na próxima Lua Cheia é ___."',
        duration: '10 minutos',
        difficulty: 'light' as const,
      },
      movement: {
        title: 'Dança de Alegria Elemental',
        instruction:
          'Música que evoque os 4 elementos — água, fogo, terra, ar. Dança livre com cada elemento, fechando com uma posição de gratidão.',
        duration: '20 minutos',
        difficulty: 'moderate' as const,
      },
      social: {
        title: 'Cerimónia de Grupo — Partilha de Luz',
        instruction:
          'Reúna um grupo (ou marque uma videochamada). Cada pessoa partilha uma bênção que recebeu ou ofereceu neste ciclo. Feche com um momento de silêncio partilhado.',
        duration: '60 minutos',
        difficulty: 'moderate' as const,
      },
    },
  },
  minguante: {
    theme: 'Liberação — soltura e depuração',
    exercises: {
      ritual: {
        title: 'Ritual de Soltura Controlada',
        instruction:
          'Escreva num papel o que quer soltar — hábito, relação, crença, padrão. Leia em voz alta. Depois queime o papel num recipiente seguro, dizendo: "Solto para o universo transformar."',
        duration: '10 minutos',
        difficulty: 'moderate' as const,
      },
      meditation: {
        title: 'Meditação do Vento que Carrega',
        instruction:
          'Visualize um vento forte mas gentil a atravessá-lo, levando consigo os pesos que escreveu. Cada vez que expira, o vento fica mais forte e leve. Permita que leve o que não serve.',
        duration: '12 minutos',
        difficulty: 'moderate' as const,
      },
      journaling: {
        title: 'Diário de Desapego Consciente',
        instruction:
          'Escreva: "Estou pronto para soltar ___" (3 coisas). "O que tem peso e já não me serve é ___." Depois um texto livre: o que sente ao deixar ir.',
        duration: '10 minutos',
        difficulty: 'moderate' as const,
      },
      movement: {
        title: 'Shaking — Libertação Somática',
        instruction:
          'De pé, com música tribal ou ritmo forte, shakingsubstancial do corpo inteiro — comeca nos pés e vai subindo. Primeiro 2 minutos de shakingsustido leve, depois 1 minuto intenso, depois 1 minuto de silêncio e respire.',
        duration: '15 minutos',
        difficulty: 'moderate' as const,
      },
      social: {
        title: 'Perdão Ritualizado',
        instruction:
          'Escreva uma carta de perdão — para si mesmo ou outro. Não precisa enviar. Leia em voz alta, depois guarde ou queime. O acto de escrever já é ritual.',
        duration: '30 minutos',
        difficulty: 'deep' as const,
      },
    },
  },
} as const;

// personalMonthExercises and personalYearExercises are declared locally below

// ─── Core Functions ────────────────────────────────────────────────────────────

function lunarExercises(
  moonPhase: string,
  snapshot: PersonalCycleSnapshot
): EvolutionaryExercise[] {
  const phase = normalizePhase(moonPhase);
  const lunar = LUNAR_EXERCISES[phase];
  const date = snapshot.currentDate;

  // Determinar a área mais relevante para cada exercício lunar
  const areaByType: Record<string, string> = {
    ritual: 'missaoDestino',
    meditation: 'oriCabecaQuizilas',
    journaling: 'desafiosSombras',
    movement: 'vitalidadeEnergia',
    social: 'conexoesAmor',
  };

  return (
    Object.entries(lunar.exercises) as [
      EvolutionaryExercise['type'],
      (typeof lunar.exercises)[EvolutionaryExercise['type']],
    ][]
  ).map(([type, ex]) => {
    const area = areaByType[type] ?? 'missaoDestino';
    const id = `${area}-${type}-${Date.now()}-lunar`;
    return {
      id,
      area,
      title: ex.title,
      instruction: ex.instruction,
      duration: ex.duration,
      difficulty: ex.difficulty,
      type,
      cycleAnchor: { lunar: true },
      rationale: `${lunar.theme}. Este exercício lunar activa a fase de ${lunar.theme.toLowerCase()}, canalizando a energia da lua ${phase} para a área de ${area}.`,
    };
  });
}

function personalDayExercises(snapshot: PersonalCycleSnapshot): EvolutionaryExercise[] {
  const energy = snapshot.personalDay.energy;
  const base = PERSONAL_DAY_EXERCISES[energy as DayEnergy];
  if (!base) return [];

  const areaKeys = [
    'vitalidadeEnergia',
    'conexoesAmor',
    'carreiraProsperidade',
    'oriCabecaQuizilas',
    'missaoDestino',
    'desafiosSombras',
  ];

  return areaKeys
    .map((areaKey): EvolutionaryExercise | null => {
      const ex = base[areaKey];
      if (!ex) return null;
      const id = `${areaKey}-${ex.type}-${Date.now()}-day`;
      return {
        id,
        area: areaKey,
        title: ex.title,
        instruction: ex.instruction,
        duration: ex.duration,
        difficulty: ex.difficulty as 'light' | 'moderate' | 'deep',
        type: ex.type as EvolutionaryExercise['type'],
        cycleAnchor: { personalDay: true },
        rationale: `Hoje é um dia pessoal de energia "${energy}" — ${snapshot.personalDay.keywords.slice(0, 2).join(', ')}. Este exercício activa a área de ${ex.area.replace(/([A-Z])/g, ' $1').toLowerCase()} através do canal natural deste dia.`,
      };
    })
    .filter((e): e is EvolutionaryExercise => e !== null);
}

function personalMonthExercises(snapshot: PersonalCycleSnapshot): EvolutionaryExercise[] {
  const { personalMonth } = snapshot;
  const areaKeys = [
    'vitalidadeEnergia',
    'conexoesAmor',
    'carreiraProsperidade',
    'oriCabecaQuizilas',
    'missaoDestino',
    'desafiosSombras',
  ];
  // Map month theme/focus to area
  const focusAreaMap: Record<string, string> = {
    'Tomar a primeira ação': 'carreiraProsperidade',
    'Aprofundar relações': 'conexoesAmor',
    'Expressar ideias': 'vitalidadeEnergia',
    'Estabelecer rotinas': 'carreiraProsperidade',
    'Sair da zona de conforto': 'desafiosSombras',
    'Cuidar de pessoas': 'conexoesAmor',
    'Refletir, meditar': 'oriCabecaQuizilas',
    'Avançar carreira': 'carreiraProsperidade',
    'Finalizar, perdoar': 'missaoDestino',
    'Canalizar a intuição': 'missaoDestino',
    'Construir algo duradouro': 'missaoDestino',
  };

  const matchedArea =
    focusAreaMap[personalMonth.focus] ?? areaKeys[Math.floor(Date.now() / 1000) % areaKeys.length];
  const id = `${matchedArea}-ritual-${Date.now()}-month`;

  return [
    {
      id,
      area: matchedArea,
      title: `Exercício do Mês Pessoal ${personalMonth.number}`,
      instruction: `Foco do mês: ${personalMonth.focus}. ${personalMonth.opportunities[0] ? 'Oportunidade: ' + personalMonth.opportunities[0] + '.' : ''} Este exercício ritual mensal é desenhado para consolidar o tema de ${personalMonth.theme.toLowerCase()}.`,
      duration: '15 minutos',
      difficulty: 'moderate',
      type: 'ritual',
      cycleAnchor: { personalMonth: true },
      rationale: `Mês pessoal ${personalMonth.number} — tema: ${personalMonth.theme}. ${personalMonth.keywords.join(', ')}. Este exercício está alinhado com o ciclo mensal de ${personalMonth.energy.toLowerCase()}.`,
    },
  ];
}

function personalYearExercises(snapshot: PersonalCycleSnapshot): EvolutionaryExercise[] {
  const { personalYear } = snapshot;
  const id = `desafiosSombras-journaling-${Date.now()}-year`;

  return [
    {
      id,
      area: 'desafiosSombras',
      title: `Exercício do Ano Pessoal ${personalYear.number}`,
      instruction: `Lição central: ${personalYear.majorLessons[0]}. Acção-chave: ${personalYear.keyAction}. Reserve 20 minutos para escrever sobre como este ano se relaciona com a sua missão de longo prazo.`,
      duration: '20 minutos',
      difficulty: 'moderate',
      type: 'journaling',
      cycleAnchor: { personalYear: true },
      rationale: `Ano pessoal ${personalYear.number} — ${personalYear.theme}. ${personalYear.keyAction} Este exercício conecta a energia do ano inteiro com a sua jornada de transformação.`,
    },
  ];
}

function pinnacleExercises(snapshot: PersonalCycleSnapshot): EvolutionaryExercise[] {
  const { currentPinnacle } = snapshot;
  const id1 = `carreiraProsperidade-ritual-${Date.now()}-pinnacle`;
  const id2 = `oriCabecaQuizilas-meditation-${Date.now()}-pinnacle`;

  return [
    {
      id: id1,
      area: 'carreiraProsperidade',
      title: `Ritual do Pináculo ${currentPinnacle.number}`,
      instruction: `Oportunidade actual: ${currentPinnacle.opportunities[0]}. Desafio: ${currentPinnacle.challenges[0]}. Pergunta-chave: "${currentPinnacle.keyQuestion}" — responda num diário de 10 minutos.`,
      duration: '15 minutos',
      difficulty: 'moderate',
      type: 'ritual',
      cycleAnchor: { pinnacle: true },
      rationale: `Pináculo ${currentPinnacle.number} activo dos ${currentPinnacle.period}. Este é um período de ${currentPinnacle.theme.toLowerCase()}.`,
    },
    {
      id: id2,
      area: 'oriCabecaQuizilas',
      title: `Meditação do Pináculo`,
      instruction: `Sente-se. Imagine-se a atravessar o período do pináculo com clareza e propósito. Visualize as oportunidades concretizadas. Sinta o que é ter dominado esta lição.`,
      duration: '12 minutos',
      difficulty: 'moderate',
      type: 'meditation',
      cycleAnchor: { pinnacle: true },
      rationale: `A energia do pináculo ${currentPinnacle.number} convida ao desenvolvimento de ${currentPinnacle.theme.toLowerCase()}. Esta meditação projecta a consciência para o estado mastery.`,
    },
  ];
}

function karmicLessonExercises(snapshot: PersonalCycleSnapshot): EvolutionaryExercise[] {
  const { karmicLessons } = snapshot;
  if (karmicLessons.length === 0) return [];

  return karmicLessons.map((lesson, i) => {
    const areaKeys = [
      'desafiosSombras',
      'oriCabecaQuizilas',
      'missaoDestino',
      'carreiraProsperidade',
      'conexoesAmor',
      'vitalidadeEnergia',
    ];
    const area = areaKeys[i % areaKeys.length];
    const id = `${area}-journaling-${Date.now()}-karmic-${lesson.missing}`;

    const exerciseTypes: EvolutionaryExercise['type'][] = [
      'journaling',
      'ritual',
      'meditation',
      'movement',
      'social',
    ];
    const type = exerciseTypes[i % exerciseTypes.length];

    const instructionMap: Record<string, string> = {
      journaling: `${lesson.description}. ÁREA de vida afectada: ${lesson.lifeArea}. Como pode aplicar isso hoje num contexto prático? Escreva 3 respostas.`,
      ritual: `Lição cármica: falta o número ${lesson.missing}. Crie um micro-ritual de 7 minutos: acenda uma vela, respire 7 vezes, e declare que está a aprender esta lição.`,
      meditation: `Sente-se. Observe como o número ${lesson.missing} — absent in your numerological chart — se manifesta como padrão no seu comportamento. Sem crítica, só consciência.`,
      movement: `Movimento consciente: 10 minutos de yoga ou alongamento focado na área do corpo relacionada com ${lesson.lifeArea.toLowerCase()}.`,
      social: `Partilhe com alguém de confiança: "Estou a trabalhar em ___" (based on ${lesson.howToLearn}). Convide essa pessoa a ser testemunha do seu processo.`,
    };

    return {
      id,
      area,
      title: `Lição Cármica ${lesson.missing}: ${lesson.lifeArea}`,
      instruction: instructionMap[type] ?? instructionMap.journaling,
      duration: '15 minutos',
      difficulty: 'deep' as const,
      type,
      cycleAnchor: { karmicLesson: true },
      rationale: `Número ${lesson.missing} está ausente do seu mapa — indica uma lição cármica em ${lesson.lifeArea.toLowerCase()}. Como aprender: ${lesson.howToLearn}.`,
    };
  });
}

function normalizePhase(moonPhase: string): keyof typeof LUNAR_EXERCISES {
  const p = moonPhase.toLowerCase().normalize('NFD')[0];
  if (p === 'n') return 'nova';
  if (p === 'c' && moonPhase.toLowerCase().includes('cresc')) return 'crescente';
  if (p === 'c') return 'cheia';
  if (p === 'm') return 'minguante';
  return 'nova';
}

// ─── Public API ────────────────────────────────────────────────────────────────

/**
 * Deriva um conjunto completo de exercícios personalizados a partir do snapshot do ciclo pessoal.
 */
export function deriveExercisesFromSnapshot(
  snapshot: PersonalCycleSnapshot,
  moonPhase: string = 'nova'
): CycleExerciseSet {
  const date = snapshot.currentDate;

  const personalDay = personalDayExercises(snapshot);
  const personalMonth = personalMonthExercises(snapshot);
  const personalYear = personalYearExercises(snapshot);
  const pinnacle = pinnacleExercises(snapshot);
  const karmicLessons = karmicLessonExercises(snapshot);
  const lunar = lunarExercises(moonPhase, snapshot);

  const prioritizedExercises = [
    ...karmicLessons,
    ...pinnacle,
    ...personalDay,
    ...personalMonth,
    ...personalYear,
    ...lunar,
  ];

  return {
    date,
    personalDay,
    personalMonth,
    personalYear,
    pinnacle,
    karmicLessons,
    lunar,
    prioritizedExercises,
  };
}

// ─── Cycle Modulation ─────────────────────────────────────────────────────────

export { deriveCycleModulation } from './synthesis-engine/cycle-modulation';
