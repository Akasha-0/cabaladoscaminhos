/**
 * evolutionary-agent/index.ts
 *
 * Agente evolutivo — camada 7 do ROADMAP.
 * Propoe exercícios e rituais personalizados com base no ciclo pessoal,
 * história de áreas e fase lunar.
 */
import type { PersonalCycleSnapshot } from '@/lib/application/agents/personal-cycle-engine';
import {
  lunarExercises,
  personalDayExercises,
  personalMonthExercises,
  personalYearExercises,
  pinnacleExercises,
  karmicLessonExercises,
} from './synthesis-engine/exercise-derivers';

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
