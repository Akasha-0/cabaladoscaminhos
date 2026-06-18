// Odu Timeline Generator - Cabala Dos Caminhos
// Generates temporal progression for Odu readings and spiritual development
import { OduInfo, odusData } from './calculos';

/**
 * Phase of an Odu reading or spiritual journey
 */
export type TimelinePhase =
  | 'iniciacao'
  | 'desenvolvimento'
  | 'estabilizacao'
  | 'transformacao'
  | 'consolidacao'
  | 'maturidade';

/**
 * Timeline event for an Odu
 */
export interface TimelineEvent {
  phase: TimelinePhase;
  title: string;
  description: string;
  duration: number; // days
  practices: string[];
  warnings: string[];
}

/**
 * Complete Odu timeline
 */
export interface OduTimeline {
  odu: OduInfo;
  events: TimelineEvent[];
  totalDays: number;
  currentPhase: TimelinePhase;
}

/**
 * Phase definitions with base durations
 */
const phaseDefinitions: Record<TimelinePhase, { duracao: number; descricao: string }> = {
  iniciacao: { duracao: 7, descricao: 'Início do trabalho espiritual' },
  desenvolvimento: { duracao: 21, descricao: 'Crescimento e aprendizado' },
  estabilizacao: { duracao: 14, descricao: 'Consolidação dos ensinamentos' },
  transformacao: { duracao: 28, descricao: 'Mudança e renovação interior' },
  consolidacao: { duracao: 21, descricao: 'Integração da experiência' },
  maturidade: { duracao: 40, descricao: 'Sabedoria e domínio espiritual' },
};

/**
 * Activities by Odu type and phase
 */
const phaseActivities: Record<
  number,
  Record<TimelinePhase, { praticas: string[]; avisos: string[] }>
> = {
  1: {
    iniciacao: { praticas: ['Rezar a Ogum', 'Usar ferramentas'], avisos: ['Evitar conflitos'] },
    desenvolvimento: {
      praticas: ['Desbravamento de caminhos', 'Estudos'],
      avisos: ['Cuidado com armas'],
    },
    estabilizacao: { praticas: ['Meditar sobre força'], avisos: ['Não forçar situações'] },
    transformacao: { praticas: ['Rituais de coragem'], avisos: ['Evitar agressividade'] },
    consolidacao: { praticas: ['Agradecimentos'], avisos: [] },
    maturidade: { praticas: ['Compartilhar conhecimento'], avisos: [] },
  },
  2: {
    iniciacao: { praticas: ['Rezar a Oya', 'Acender velas'], avisos: ['Respeitar ancestrais'] },
    desenvolvimento: { praticas: ['Culto aos mortos', 'Sessões'], avisos: ['Evitar luto pesado'] },
    estabilizacao: { praticas: ['Orações de paz'], avisos: [] },
    transformacao: { praticas: ['Rituais de passagem'], avisos: ['Cuidado com energias'] },
    consolidacao: { praticas: ['Honrar antepassados'], avisos: [] },
    maturidade: { praticas: ['Guia espiritual'], avisos: [] },
  },
  3: {
    iniciacao: { praticas: ['Rezar a Oxum', 'Usar amarelo'], avisos: ['Evitar falsidade'] },
    desenvolvimento: { praticas: ['Oferendas de mel', 'Danças'], avisos: ['Não ser vaidoso'] },
    estabilizacao: { praticas: ['Abraços de água'], avisos: [] },
    transformacao: { praticas: ['Rituais de amor'], avisos: ['Evitar ciúmes'] },
    consolidacao: { praticas: ['Gratidão'], avisos: [] },
    maturidade: { praticas: ['慈爱'], avisos: [] },
  },
  4: {
    iniciacao: {
      praticas: ['Rezar a Xangô', 'Carregar mini machado'],
      avisos: ['Controlar raiva'],
    },
    desenvolvimento: { praticas: ['Estudos de justicia', 'Fogo'], avisos: ['Não usar violencia'] },
    estabilizacao: { praticas: ['Meditar sobre equidade'], avisos: [] },
    transformacao: { praticas: ['Rituais de lei'], avisos: ['Evitar vingança'] },
    consolidacao: { praticas: ['Aplicar justiça'], avisos: [] },
    maturidade: { praticas: ['Juiz espiritual'], avisos: [] },
  },
  5: {
    iniciacao: { praticas: ['Rezar a Iemanjá', 'Banho de mar'], avisos: ['Respeitar o mar'] },
    desenvolvimento: { praticas: ['Culto maternal', 'Água'], avisos: ['Não ser possessivo'] },
    estabilizacao: { praticas: ['Orações de proteção'], avisos: [] },
    transformacao: { praticas: ['Rituais de fertility'], avisos: ['Evitar sufocamento'] },
    consolidacao: { praticas: ['Cuidar da família'], avisos: [] },
    maturidade: { praticas: ['Mãe universal'], avisos: [] },
  },
  6: {
    iniciacao: { praticas: ['Rezar a Oxossi', 'Usar arco'], avisos: ['Caçar com ética'] },
    desenvolvimento: {
      praticas: ['Estudos de sabedoria', 'Caça'],
      avisos: ['Não acumular demais'],
    },
    estabilizacao: { praticas: ['Meditar na floresta'], avisos: [] },
    transformacao: { praticas: ['Rituais de conhecimento'], avisos: ['Evitar gula'] },
    consolidacao: { praticas: ['Compartilhar caça'], avisos: [] },
    maturidade: { praticas: ['Sábio da floresta'], avisos: [] },
  },
  7: {
    iniciacao: { praticas: ['Rezar a Nanã', 'Culto aos velhos'], avisos: ['Respeitar anciãos'] },
    desenvolvimento: {
      praticas: ['Trabalhar Ancestralidade', 'Terra'],
      avisos: ['Não temer a morte'],
    },
    estabilizacao: { praticas: ['Orações de paz'], avisos: [] },
    transformacao: { praticas: ['Rituais de purificação'], avisos: ['Evitar orgulho'] },
    consolidacao: { praticas: ['Aceitar finitude'], avisos: [] },
    maturidade: { praticas: ['Portal da existência'], avisos: [] },
  },
  8: {
    iniciacao: { praticas: ['Rezar a Ewá', 'Usar espelho'], avisos: ['Evitar vaidade'] },
    desenvolvimento: { praticas: ['Beleza interior', 'Danças'], avisos: ['Não ser superficial'] },
    estabilizacao: { praticas: ['Auto-reflexão'], avisos: [] },
    transformacao: { praticas: ['Rituais de autoconhecimento'], avisos: ['Evitar ego'] },
    consolidacao: { praticas: ['Expressão autêntica'], avisos: [] },
    maturidade: { praticas: ['Encantamento'], avisos: [] },
  },
  9: {
    iniciacao: { praticas: ['Rezar a Obá', 'Cozinhar bem'], avisos: ['Respeitar alimentos'] },
    desenvolvimento: { praticas: ['Arte culinária', 'Amor'], avisos: ['Não ser ciumento'] },
    estabilizacao: { praticas: ['Alimentar bem'], avisos: [] },
    transformacao: { praticas: ['Rituais de nutrição'], avisos: ['Evitar gula'] },
    consolidacao: { praticas: ['Cozinhar para outros'], avisos: [] },
    maturidade: { praticas: ['Nurturing'], avisos: [] },
  },
  10: {
    iniciacao: { praticas: ['Rezar a Logun Edé', 'Duplo culto'], avisos: ['Equilibrar gêneros'] },
    desenvolvimento: { praticas: ['Sacrifício', 'Batalha'], avisos: ['Não ser frio'] },
    estabilizacao: { praticas: ['Diplomacia'], avisos: [] },
    transformacao: { praticas: ['Rituais de alinhamento'], avisos: ['Evitar frieza emocional'] },
    consolidacao: { praticas: ['Harmonia dual'], avisos: [] },
    maturidade: { praticas: ['União de opostos'], avisos: [] },
  },
  11: {
    iniciacao: {
      praticas: ['Rezar a Ossaim', 'Estudar ervas'],
      avisos: ['Usar plantas com respeito'],
    },
    desenvolvimento: {
      praticas: ['Fitoterapia', 'Sabedoria verde'],
      avisos: ['Não usar sem conhecimento'],
    },
    estabilizacao: { praticas: ['Aplicar curas naturais'], avisos: [] },
    transformacao: { praticas: ['Rituais de saúde'], avisos: ['Evitar automedicação'] },
    consolidacao: { praticas: ['Compartilhar conhecimento'], avisos: [] },
    maturidade: { praticas: ['Curador verde'], avisos: [] },
  },
  12: {
    iniciacao: { praticas: ['Rezar a Inhansã', 'Veneno'], avisos: ['Cuidado com veneno'] },
    desenvolvimento: { praticas: ['Mistérios', 'Transição'], avisos: ['Não usar para mal'] },
    estabilizacao: { praticas: ['Desapego'], avisos: [] },
    transformacao: { praticas: ['Rituais de fim'], avisos: ['Aceitar mudanças'] },
    consolidacao: { praticas: ['Libertação'], avisos: [] },
    maturidade: { praticas: ['Portal da transformação'], avisos: [] },
  },
  13: {
    iniciacao: { praticas: ['Rezar a Omolu', 'Evitar olhar'], avisos: ['Respeitar isolamento'] },
    desenvolvimento: { praticas: ['Caridade', 'Sacrifício'], avisos: ['Não ter medo de doença'] },
    estabilizacao: { praticas: ['Aceitação'], avisos: [] },
    transformacao: { praticas: ['Rituais de cura'], avisos: ['Evitar negação'] },
    consolidacao: { praticas: ['Servir aos necessitados'], avisos: [] },
    maturidade: { praticas: ['Mestre da saúde'], avisos: [] },
  },
  14: {
    iniciacao: {
      praticas: ['Rezar a Oxumaré', 'Cores do arco-íris'],
      avisos: ['Equilibrar ciclos'],
    },
    desenvolvimento: {
      praticas: ['Ciclos de vida', 'Serpente'],
      avisos: ['Não resistir mudanças'],
    },
    estabilizacao: { praticas: ['Ritmo natural'], avisos: [] },
    transformacao: { praticas: ['Rituais de renovação'], avisos: ['Evitar estagnação'] },
    consolidacao: { praticas: ['Aceitar destino'], avisos: [] },
    maturidade: { praticas: ['Guardião do tempo'], avisos: [] },
  },
  15: {
    iniciacao: { praticas: ['Rezar a Obatalá', 'Usar branco'], avisos: ['Pureza de intenção'] },
    desenvolvimento: { praticas: ['Criação', 'Paz'], avisos: ['Não ser passivo demais'] },
    estabilizacao: { praticas: ['Discernimento'], avisos: [] },
    transformacao: { praticas: ['Rituais de luz'], avisos: ['Evitar orgulho'] },
    consolidacao: { praticas: ['Criação consciente'], avisos: [] },
    maturidade: { praticas: ['Pai da luz'], avisos: [] },
  },
  16: {
    iniciacao: { praticas: ['Rezar a Odoyá', 'Caminho'], avisos: ['Honrar a jornada'] },
    desenvolvimento: { praticas: ['Sorte', 'Destino'], avisos: ['Não ser preguiçoso'] },
    estabilizacao: { praticas: ['Perseverança'], avisos: [] },
    transformacao: { praticas: ['Rituais de destino'], avisos: ['Evitar fatalismo'] },
    consolidacao: { praticas: ['Forjar o próprio destino'], avisos: [] },
    maturidade: { praticas: ['Criador de caminhos'], avisos: [] },
  },
};

/**
 * Get the complete timeline for an Odu
 */
export function getOduTimeline(odu: OduInfo | number): OduTimeline {
  const oduNum = typeof odu === 'number' ? odu : odu.numero;
  const oduInfo = typeof odu === 'number' ? odusData[odu] : odu;
  const activities = phaseActivities[oduNum] || phaseActivities[1];

  const phases: TimelinePhase[] = [
    'iniciacao',
    'desenvolvimento',
    'estabilizacao',
    'transformacao',
    'consolidacao',
    'maturidade',
  ];

  const events: TimelineEvent[] = phases.map((phase) => {
    const phaseData = activities[phase] || {
      praticas: ['Práticas gerais de evolução'],
      avisos: [],
    };
    const phaseInfo = phaseDefinitions[phase];

    return {
      phase,
      title: getPhaseTitle(phase, oduNum),
      description: phaseInfo.descricao,
      duration: phaseInfo.duracao,
      practices: phaseData.praticas,
      warnings: phaseData.avisos,
    };
  });

  const totalDays = events.reduce((sum, event) => sum + event.duration, 0);

  return {
    odu: oduInfo,
    events,
    totalDays,
    currentPhase: phases[0],
  };
}

/**
 * Get phase title for an Odu
 */
function getPhaseTitle(phase: TimelinePhase, oduNum: number): string {
  const oduInfo = odusData[oduNum];
  const titles: Record<TimelinePhase, string> = {
    iniciacao: `${oduInfo.nome} - Despertar`,
    desenvolvimento: `${oduInfo.nome} - Crescimento`,
    estabilizacao: `${oduInfo.nome} - Fundamento`,
    transformacao: `${oduInfo.nome} - Mudança`,
    consolidacao: `${oduInfo.nome} - Integração`,
    maturidade: `${oduInfo.nome} - Sabedoria`,
  };
  return titles[phase];
}

/**
 * Get timeline for multiple Odus (combined reading)
 */
function getCombinedTimeline(odus: (OduInfo | number)[]): OduTimeline[] {
  return odus.map((odu) => getOduTimeline(odu));
}

/**
 * Get phase progress as percentage
 */
export function getPhaseProgress(timeline: OduTimeline, phase: TimelinePhase): number {
  const phases: TimelinePhase[] = [
    'iniciacao',
    'desenvolvimento',
    'estabilizacao',
    'transformacao',
    'consolidacao',
    'maturidade',
  ];
  const phaseIndex = phases.indexOf(phase);
  if (phaseIndex === -1) return 0;

  const completedDays = timeline.events
    .slice(0, phaseIndex)
    .reduce((sum, event) => sum + event.duration, 0);

  return (completedDays / timeline.totalDays) * 100;
}

/**
 * Get next phase in the timeline
 */
function getNextPhase(currentPhase: TimelinePhase): TimelinePhase | null {
  const phases: TimelinePhase[] = [
    'iniciacao',
    'desenvolvimento',
    'estabilizacao',
    'transformacao',
    'consolidacao',
    'maturidade',
  ];
  const currentIndex = phases.indexOf(currentPhase);
  if (currentIndex === -1 || currentIndex === phases.length - 1) return null;
  return phases[currentIndex + 1];
}

/**
 * Get milestone dates for timeline
 */
function getTimelineMilestones(timeline: OduTimeline): {
  day: number;
  event: TimelineEvent;
  label: string;
}[] {
  let cumulative = 0;
  return timeline.events.map((event) => {
    cumulative += event.duration;
    return {
      day: cumulative,
      event,
      label: `Dia ${cumulative} - ${event.title}`,
    };
  });
}
