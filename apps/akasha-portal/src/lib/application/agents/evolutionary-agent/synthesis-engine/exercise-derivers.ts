/**
 * synthesis-engine/exercise-derivers.ts
 *
 * Exercise derivation functions for the evolutionary agent.
 * Extracted from evolutionary-agent/index.ts to reduce file size.
 */
import type { PersonalCycleSnapshot } from '@/lib/application/agents/personal-cycle-engine';
import type { EvolutionaryExercise } from '../index';
import { LUNAR_EXERCISES, normalizePhase } from '../lunar-exercises';
import { PERSONAL_DAY_EXERCISES } from './personal-day-exercises-data';
import type { DayEnergy } from './personal-day-exercises-data';

/**
 * Derives lunar-phase exercises for the given moon phase and personal cycle snapshot.
 */
export function lunarExercises(
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

/**
 * Derives exercises for the current personal day energy.
 */
export function personalDayExercises(snapshot: PersonalCycleSnapshot): EvolutionaryExercise[] {
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

/**
 * Derives exercises for the current personal month.
 */
export function personalMonthExercises(snapshot: PersonalCycleSnapshot): EvolutionaryExercise[] {
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

/**
 * Derives exercises for the current personal year.
 */
export function personalYearExercises(snapshot: PersonalCycleSnapshot): EvolutionaryExercise[] {
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

/**
 * Derives exercises for the current pinnacle cycle.
 */
export function pinnacleExercises(snapshot: PersonalCycleSnapshot): EvolutionaryExercise[] {
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

/**
 * Derives exercises for each karmic lesson in the current snapshot.
 */
export function karmicLessonExercises(snapshot: PersonalCycleSnapshot): EvolutionaryExercise[] {
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
