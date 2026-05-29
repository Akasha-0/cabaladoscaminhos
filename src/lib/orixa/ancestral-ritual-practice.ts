// @ts-nocheck
// SKIP_LINT

/**
 * Ancestral Ritual Practice — ORIXÁ ANCESTRAL
 * Práticas ritualísticas e sagradas para o Ritual Ancestral
 * A conexão sagrada com os que vieram antes
 */

/**
 * Passthrough invocation result format
 */
export interface AncestralRitualPassthrough {
  orixa: string;
  greeting: string;
  practice: string;
  phases: string[];
  elements: string[];
  offerings: string[];
  pontos_cantados: string[];
  fundamentos: string[];
  ritualSteps: AncestralRitualStep[];
  sacredObjects: string[];
  contraindications: string[];
  timing: {
    bestTime: string;
    moonPhase: string;
    dayOfWeek: string;
  };
}

export interface AncestralRitualStep {
  phase: string;
  description: string;
  duration: string;
  offerings: string[];
  intention: string;
}

/**
 * Performs ancestral ritual practice
 * The sacred practice of ancestral traditions involves:
 * - Invocation of ancestral wisdom and guidance
 * - Connection with the lineage holders
 * - Offerings to the ancestors
 * - Seeking protection and blessings from those who came before
 */
export function performPractice(): AncestralRitualPassthrough {
  return {
    orixa: 'Ancestral',
    greeting: 'Mo a Egun',
    practice: 'Prática Ritualística Ancestral',
    phases: [
      'Preparação do espaço sagrado',
      'Invocação dos ancestrais',
      'Oferecimento de Ebo',
      'Conexão com a linhagem',
      'Súplica e agradecimento',
    ],
    elements: [
      'Fogo',
      'Água',
      'Terra',
      'Alívio',
      'Sangue',
      'Memória',
      'Odu',
    ],
    offerings: [
      'Akara',
      'Ekuru',
      'E/',
      'Ogp',
      'Água de obi',
      'Ramu',
      'Kola',
      'Pجان',
      'Djin',
      'Effun',
    ],
    pontos_cantados: [
      'Egun o!',
      'Moi Egun!',
      'Egun meta ijinle',
      'Omo Egun',
      'Awo Egun',
    ],
    fundamentos: [
      'IK .\nIK .\nIK ',
      'Ogunda Meji',
      'Iwori Meji',
      'Ogbe Meji',
    ],
    ritualSteps: [
      {
        phase: 'Preparação',
        description: 'Limpeza do espaço com água de folhas sagradas e acendimento de velas em memória dos ancestrais',
        duration: '15 minutos',
        offerings: ['Água de obi', 'Ek环节'],
        intention: 'Preparar o espaço para a comunicação com os ancestrais',
      },
      {
        phase: 'Invocação',
        description: 'Canto e invocação dos Eguns com os pontos sagrados e oferendas de kola e palma',
        duration: '20 minutos',
        offerings: ['O/', 'Kolá', 'Ek环节'],
        intention: 'Abrir o canal de comunicação com os ancestrais',
      },
      {
        phase: 'Oferecimento',
        description: 'Apresentação de ebó aos ancestrais com sangue e alimentos sagrados',
        duration: '25 minutos',
        offerings: ['Akara', 'Ekuru', 'E环节', 'Sangue'],
        intention: 'Alimentar os ancestrais e obter suas bênçãos',
      },
      {
        phase: 'Conexão',
        description: 'Lamento e escuta da sabedoria ancestral através do Ifá ou obi',
        duration: '30 minutos',
        offerings: ['Obi', 'Ikín'],
        intention: 'Receber orientação e proteção da linhagem',
      },
      {
        phase: 'Fechamento',
        description: 'Agradecimento aos ancestrais e selamento do ritual com preces finais',
        duration: '10 minutos',
        offerings: ['Água', 'Alívio'],
        intention: 'Fechar o ciclo e agradecer as bênçãos recebidas',
      },
    ],
    sacredObjects: [
      'Oxu',
      'Opón Ifá',
      'Ikín',
      'Obi',
      'E/',
      'Erue',
      'Seg benign',
      'P/',
      'P/',
    ],
    contraindications: [
      'Não realizar durante o período de luto público intenso',
      'Evitar em dias de lua cheia sem orientação',
      'Proibido durante menstruação em algumas linhagens',
      'Requer ayaje adequado para oferendas',
    ],
    timing: {
      bestTime: 'Meia-noite',
      moonPhase: 'Lua nova ou lua velha',
      dayOfWeek: 'Terça-feira ou domingo',
    },
  };
}
