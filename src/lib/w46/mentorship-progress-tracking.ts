/**
 * w46/mentorship-progress-tracking.ts
 *
 * Mentorship progress tracking for the Cabala dos Caminhos portal.
 *
 * Tracks the LONG ARC of a mentor/mentee pairing: orientation → foundation
 * → deepening → integration → graduation → alumni. Goes BEYOND a session log
 * by encoding milestones, evidence, blockers, learning goals, momentum,
 * phase detection, graduation eligibility, alumni transition, mentor health
 * checks, and goal check-ins.
 *
 * Design principles:
 *   - 100% TypeScript, no `any`
 *   - All exported functions are PURE & DETERMINISTIC
 *   - State is mutated via "next-state" helpers that return updated PairingProgress
 *   - Templates are seeded with rich tradition-specific curricula
 *   - Validation surfaces issues[] (never throws on user input)
 *   - ID generation is content-addressed (sha256-like via simple hash) for
 *     reproducibility across sessions without depending on crypto module
 *
 * Traditions supported: candomble, umbanda, ifa, cabala, astrologia, tantra
 *
 * Companion modules in this wave:
 *   w45/mentorship-pairing.ts — the pairing engine that produces pairings
 *   w46/mentorship-progress-tracking.ts — this module (long-arc progress)
 *   w46/mentorship-session-log.ts — per-session detail logs
 */


/**
 * Milestone — a single concrete step on the mentorship journey.
 *
 * Categories encode the learning progression:
 *   foundation  → orientation / basics
 *   practice    → hands-on ritual work
 *   study       → reading & intellectual deepening
 *   integration → synthesizing practice + study into lived understanding
 *   mastery     → demonstrating competence, readying for service
 *   graduation  → the closing threshold
 *
 * Status lifecycle:
 *   pending → active → (completed | blocked | skipped)
 *                ↑           ↓
 *                └── unblock ←┘
 */
export type MilestoneCategory =
  | 'foundation'
  | 'practice'
  | 'study'
  | 'integration'
  | 'mastery'
  | 'graduation';

export type MilestoneStatus =
  | 'pending'
  | 'active'
  | 'blocked'
  | 'completed'
  | 'skipped';

export interface Milestone {
  id: string;
  pairingId: string;
  title: string;
  description: string;
  category: MilestoneCategory;
  status: MilestoneStatus;
  /** ISO 8601 date string. */
  targetDate: string;
  /** ISO 8601 timestamp; null until status === 'completed'. */
  completedAt: string | null;
  /** Evidence items that satisfy this milestone. */
  evidence: EvidenceItem[];
  /**
   * Weight 1-10 indicating effort/signal. Heavy milestones move the
   * completion % more than light ones.
   */
  weight: number;
  /** Free-text justification when status === 'skipped' or 'blocked'. */
  notes?: string;
}

/**
 * A reusable template that defines a milestone scaffold for a specific
 * tradition + learning goal combination.
 */
export interface MilestoneTemplate {
  id: string;
  tradition: Tradition;
  goal: string;
  category: MilestoneCategory;
  title: string;
  description: string;
  weight: number;
  /** Suggested number of weeks to complete this milestone. */
  suggestedDuration: number;
  /** IDs of other MilestoneTemplate ids that should be completed first. */
  prerequisites: string[];
}

/**
 * ProgressNote — reflective/journal entry written by mentor or mentee.
 *
 * sentiment captures the affective tone, not just facts. This drives
 * the momentum calculation and surfaces concerns early.
 */
export type Sentiment = 'positive' | 'neutral' | 'concerned' | 'breakthrough';

export type NoteVisibility = 'private' | 'shared' | 'mentor_only';

export interface ProgressNote {
  id: string;
  pairingId: string;
  milestoneId: string | null;
  authorId: string;
  /** Markdown body. */
  content: string;
  sentiment: Sentiment;
  /** Free-form insight bullets. */
  insights: string[];
  /** Free-form blocker notes. */
  blockers: string[];
  /** Concrete next-step action items. */
  nextSteps: string[];
  visibility: NoteVisibility;
  /** ISO 8601 timestamp. */
  createdAt: string;
}

/**
 * Evidence — artifact produced by mentee that demonstrates learning.
 *
 * traditionTags allow cross-tradition filtering (e.g., finding all evidence
 * that touches both cabala and astrologia).
 */
export type EvidenceType =
  | 'reflection'
  | 'practice_log'
  | 'reading'
  | 'ritual'
  | 'discussion'
  | 'creation';

export interface EvidenceItem {
  id: string;
  type: EvidenceType;
  title: string;
  description: string;
  /** Optional URL — link to a doc, recording, photo, etc. */
  url: string | null;
  traditionTags: Tradition[];
  /** ISO 8601 timestamp. */
  completedAt: string;
  /** Total minutes spent on this evidence item. */
  durationMinutes: number;
}

/**
 * Blocker — anything impeding progress.
 *
 * Type drives intervention strategy:
 *   scheduling    → calendar coordination
 *   compatibility → relational friction (may need re-pairing)
 *   logistics     → tools, environment, accessibility
 *   engagement    → energy / motivation (may need mentor check-in)
 *   trauma        → careful, requires trauma-informed handling
 *   safety        → immediate; pause pairing + flag for support
 *
 * Severity 1-5; 4-5 escalate automatically to mentor health check.
 */
export type BlockerType =
  | 'scheduling'
  | 'compatibility'
  | 'logistics'
  | 'engagement'
  | 'trauma'
  | 'safety';

export interface Blocker {
  id: string;
  type: BlockerType;
  /** 1 = minor, 5 = critical. */
  severity: number;
  description: string;
  raisedBy: string;
  /** ISO 8601 timestamp. */
  raisedAt: string;
  /** ISO 8601 timestamp; null while active. */
  resolvedAt: string | null;
  /** Free-text resolution when status === 'resolved'. */
  resolution: string | null;
}

/**
 * Phase — current arc position. Detected from milestone distribution.
 */
export type Phase =
  | 'orientation'
  | 'foundation'
  | 'deepening'
  | 'integration'
  | 'graduation'
  | 'alumni';

/**
 * Momentum — derived signal of "is this pairing accelerating or stalling?".
 *
 * score: -1 (stalling/declining) to +1 (strongly accelerating)
 * trend: directional signal over the window
 */
export type MomentumTrend = 'rising' | 'stable' | 'falling';

export interface Momentum {
  score: number;
  windowDays: number;
  trend: MomentumTrend;
  reason: string;
}

/**
 * PairingProgress — top-level state object for a mentorship pairing.
 *
 * This is the immutable shape that flows through every reducer in this module.
 * Every mutation returns a new PairingProgress (no in-place mutation).
 */
export interface PairingProgress {
  pairingId: string;
  mentorId: string;
  menteeId: string;
  /** ISO 8601 timestamp when pairing was created. */
  startedAt: string;
  currentPhase: Phase;
  /** All milestones (ordered by creation). */
  milestones: Milestone[];
  /** Derived: number of milestones with status === 'completed'. */
  completedMilestones: number;
  /** Derived: 0-100 completion percentage weighted by milestone.weight. */
  totalProgress: number;
  /** Last N progress notes (most recent first). */
  recentNotes: ProgressNote[];
  /** Active blockers only (resolved blockers excluded). */
  blockers: Blocker[];
  /** ISO 8601 date prediction; null if not enough signal. */
  predictedGraduationDate: string | null;
  momentum: Momentum;
  /** Free-form tags for filtering. */
  tags: string[];
  /** Goal IDs (from template.goal) the pairing is working on. */
  goals: string[];
  /** ISO 8601 timestamp of last update. */
  updatedAt: string;
}

/**
 * LearningGoalProgress — slice of PairingProgress filtered by goal.
 */
export interface LearningGoalProgress {
  goal: string;
  milestones: Milestone[];
  completion: number;
  evidence: EvidenceItem[];
  momentum: Momentum;
}

/**
 * GraduationCriteria — minimum bar to graduate a pairing.
 */
export interface GraduationCriteria {
  minMilestones: number;
  requiredCategories: MilestoneCategory[];
  /** Minimum weeks from pairing start to graduation. */
  minDuration: number;
  minEvidenceItems: number;
  /** Maximum allowed active blockers at graduation. */
  maxBlockers: number;
  /** Required overall sentiment at graduation. */
  requiredSentiment: Sentiment;
}

/**
 * GraduationStatus — verdict from checkGraduation().
 */
export type GraduationStatus =
  | 'not_ready'
  | 'in_progress'
  | 'eligible'
  | 'graduated'
  | 'on_hold'
  | 'paused'
  | 'ended';

/**
 * AlumniProfile — record of a user who completed a mentorship pairing.
 *
 * currentRole reflects the post-graduation path:
 *   alumni           → resting in the lineage, no active service role
 *   emerging_mentor  → being trained to mentor others
 *   mentor           → actively mentoring
 */
export type AlumniRole = 'alumni' | 'emerging_mentor' | 'mentor';

export interface AlumniProfile {
  userId: string;
  /** ISO 8601 timestamp. */
  graduatedAt: string;
  traditionsLearned: Tradition[];
  specialtiesAchieved: string[];
  /** Total mentored hours across all pairings. */
  totalHoursMentored: number;
  currentRole: AlumniRole;
  testimonials: Testimonial[];
}

export interface Testimonial {
  id: string;
  pairingId: string;
  authorId: string;
  content: string;
  createdAt: string;
}

/**
 * Tradition — which spiritual lineage we're working in.
 */
export type Tradition =
  | 'candomble'
  | 'umbanda'
  | 'ifa'
  | 'cabala'
  | 'astrologia'
  | 'tantra';

/**
 * ProgressSnapshot — point-in-time capture of pairing health.
 */
export interface ProgressSnapshot {
  pairingId: string;
  /** ISO 8601 timestamp. */
  takenAt: string;
  milestoneCount: number;
  evidenceCount: number;
  blockerCount: number;
  sentiment: Sentiment;
  momentum: Momentum;
  /** 0-100 overall completeness score. */
  completeness: number;
  phase: Phase;
}

/**
 * MentorHealthCheck — mentor's self-report on capacity to keep mentoring.
 *
 * Critical for sustainability — mentors who are depleted harm the lineage.
 * flaggedForSupport true → admin/outreach should reach out.
 */
export interface MentorHealthCheck {
  pairingId: string;
  mentorId: string;
  /** 1-5 energy level. */
  energyLevel: number;
  /** 1-5 satisfaction with this pairing. */
  satisfaction: number;
  concerns: string[];
  flaggedForSupport: boolean;
  /** ISO 8601 timestamp. */
  lastCheckAt: string;
}

/**
 * GoalCheckIn — periodic check-in tied to a specific learning goal.
 */
export interface GoalCheckIn {
  id: string;
  pairingId: string;
  goalId: string;
  attended: boolean;
  notes: string;
  blockers: string[];
  actionItems: string[];
  /** ISO 8601 timestamp when check-in was scheduled. */
  scheduledAt: string;
  /** ISO 8601 timestamp when check-in actually happened. */
  completedAt: string | null;
}

/**
 * ProgressTemplate — full curriculum for a tradition + goal combination.
 *
 * Combines milestone templates with graduation criteria and recommended
 * duration. This is the "what does this mentorship look like?" artifact.
 */
export interface ProgressTemplate {
  id: string;
  tradition: Tradition;
  goal: string;
  milestones: MilestoneTemplate[];
  graduationCriteria: GraduationCriteria;
  recommendedDurationWeeks: number;
}


export const TRADITIONS: readonly Tradition[] = [
  'candomble',
  'umbanda',
  'ifa',
  'cabala',
  'astrologia',
  'tantra',
] as const;

export const ALL_CATEGORIES: readonly MilestoneCategory[] = [
  'foundation',
  'practice',
  'study',
  'integration',
  'mastery',
  'graduation',
] as const;

export const ALL_SENTIMENTS: readonly Sentiment[] = [
  'positive',
  'neutral',
  'concerned',
  'breakthrough',
] as const;

export const ALL_PHASES: readonly Phase[] = [
  'orientation',
  'foundation',
  'deepening',
  'integration',
  'graduation',
  'alumni',
] as const;

export const ALL_EVIDENCE_TYPES: readonly EvidenceType[] = [
  'reflection',
  'practice_log',
  'reading',
  'ritual',
  'discussion',
  'creation',
] as const;

export const ALL_BLOCKER_TYPES: readonly BlockerType[] = [
  'scheduling',
  'compatibility',
  'logistics',
  'engagement',
  'trauma',
  'safety',
] as const;

/** Default graduation criteria when caller doesn't supply. */
export const DEFAULT_GRADUATION_CRITERIA: GraduationCriteria = {
  minMilestones: 6,
  requiredCategories: ['foundation', 'practice', 'integration'],
  minDuration: 12,
  minEvidenceItems: 8,
  maxBlockers: 0,
  requiredSentiment: 'positive',
};


/**
 * Canonical milestone names per tradition. Used to seed templates with
 * curriculum-correct language. Kept distinct from template instances —
 * these are VOCABULARY; templates are STRUCTURE.
 */
export const MILESTONE_NAMES_BY_TRADITION: Readonly<Record<Tradition, readonly string[]>> = {
  candomble: [
    'Apresentação ao Terreiro',
    'Fundamentos do Axé',
    'Linhas e Orixás Regentes',
    'Pontos Riscados e Cantados',
    'Ritual de Ebó Simplificado',
    'Fundamentos de Ifá',
    'Saudação aos Mais Velhos',
    'Oferendas e Obrigações',
    'Calendário Litúrgico',
    'Fundamentos de Cura',
  ],
  umbanda: [
    'Abertura com os Guias',
    'Sete Linhas da Umbanda',
    'Ponto de Abertura',
    'Desenvolvimento Mediúnico',
    'Trabalho de Mesa',
    'Fundamentos de Passe',
    'Oferendas de Guias',
    'Saudação às Entidades',
    'Estudo da Doutrina',
    'Atendimento Fraterno',
  ],
  ifa: [
    'Fundamentos de Orunmila',
    'Esku (Saudação)',
    'Abofá e Oriki',
    'Sistema de 16 Odu',
    'Ifá Merindilogun',
    'Obi Divination',
    'Itan (Histórias) de Ifá',
    'Fundamentos de Ebo',
    'Babalorixá Mentoring',
    'Iniciação Específica',
  ],
  cabala: [
    'Árvore da Vida — Topologia',
    'Sefirot — Estudo das 10 Emanações',
    'As 4 Mundos (Olamot)',
    '22 Caminhos — Associação com Tarot',
    'Meditação nas Sefirot',
    'Gematria — Fundamentos',
    'Estudo do Zohar',
    'Prática de Tikkun',
    'Kavanot e Intenções',
    'Integração Ética da Cabala',
  ],
  astrologia: [
    'Mapa Natal — Leitura de Roda',
    'Planetas Pessoais (Sol-Lua-Mercúrio-Vênus-Marte)',
    'Signos e Modalidades',
    'Casas — Setores de Vida',
    'Aspectos — Hard & Soft',
    'Trânsitos Atuais',
    'Astrologia Cármica (Nodos/Lilith)',
    'Sinastria — Compatibilidade',
    'Revolução Solar',
    'Prática de Consulta',
  ],
  tantra: [
    'Fundamentos do Tantra',
    'Prānāyāma — Respiração',
    'Bandhas — Fechos Energéticos',
    'Mantra e Nāda',
    'Kundalini — Modelo',
    'Meditação sobre Shakti/Shiva',
    'Yantra e Visualização',
    'Prática de Par (Maithuna)',
    'Integração na Vida Cotidiana',
    'Ética do Caminho',
  ],
};


/**
 * Each template below defines a complete curriculum for a specific
 * tradition + learning-goal pair. 8-12 templates, 2-3 per tradition,
 * each with 6-10 milestones.
 *
 * Total templates: 12 (2 per tradition × 6 traditions).
 */

/* eslint-disable max-lines */
/**
 * Helper to build a milestone template with shared tradition + goal.
 */
function mt(
  tradition: Tradition,
  goal: string,
  id: string,
  category: MilestoneCategory,
  title: string,
  description: string,
  weight: number,
  suggestedDuration: number,
  prerequisites: readonly string[],
): MilestoneTemplate {
  return {
    id,
    tradition,
    goal,
    category,
    title,
    description,
    weight,
    suggestedDuration,
    prerequisites: [...prerequisites],
  };
}

/**
 * 12 ProgressTemplates — 2 per tradition × 6 traditions.
 * Each template has 6-10 milestones. Curricula are aligned with the
 * "Cigano Ramiro"-flavored traditional structure used elsewhere in the
 * cabaladoscaminhos project.
 */
export const PROGRESS_TEMPLATES: readonly ProgressTemplate[] = [
  // CANDOMBLÉ — Fundamentos
  {
    id: 'tpl-candomble-fundamentos',
    tradition: 'candomble',
    goal: 'Fundamentos do Candomblé',
    recommendedDurationWeeks: 36,
    graduationCriteria: { minMilestones: 7, requiredCategories: ['foundation', 'practice', 'integration'], minDuration: 24, minEvidenceItems: 10, maxBlockers: 0, requiredSentiment: 'positive' },
    milestones: [
      mt('candomble', 'Fundamentos do Candomblé', 'cbl-fund-1', 'foundation', 'Apresentação ao Terreiro', 'Visita guiada ao terreiro, hierarquia e regras.', 6, 2, []),
      mt('candomble', 'Fundamentos do Candomblé', 'cbl-fund-2', 'foundation', 'Estudo dos Orixás Principais', 'Os 7 orixás regentes e suas atribuições.', 7, 4, ['cbl-fund-1']),
      mt('candomble', 'Fundamentos do Candomblé', 'cbl-fund-3', 'study', 'Leitura: Oliveira Filho & Prandi', 'Duas obras canônicas sobre a tradição.', 5, 4, ['cbl-fund-2']),
      mt('candomble', 'Fundamentos do Candomblé', 'cbl-fund-4', 'practice', 'Saudação aos Mais Velhos', 'Esku completo e postura cerimonial.', 8, 3, ['cbl-fund-2']),
      mt('candomble', 'Fundamentos do Candomblé', 'cbl-fund-5', 'practice', 'Ritual de Ebó Simplificado', 'Acompanhar e participar de um ebó.', 9, 6, ['cbl-fund-4']),
      mt('candomble', 'Fundamentos do Candomblé', 'cbl-fund-6', 'integration', 'Reflexão: Axé e Ética', 'Dissertação articulando axé e ética cotidiana.', 7, 3, ['cbl-fund-3', 'cbl-fund-5']),
      mt('candomble', 'Fundamentos do Candomblé', 'cbl-fund-7', 'mastery', 'Atendimento Supervisionado', 'Conduzir 1 atendimento sob mentoria direta.', 10, 6, ['cbl-fund-6']),
      mt('candomble', 'Fundamentos do Candomblé', 'cbl-fund-8', 'graduation', 'Avaliação Final', 'Apresentação oral + ritual sob banca.', 10, 4, ['cbl-fund-7']),
    ],
  },
  // CANDOMBLÉ — Curadoria
  {
    id: 'tpl-candomble-curadoria',
    tradition: 'candomble',
    goal: 'Curadoria de Pontos e Cantigas',
    recommendedDurationWeeks: 24,
    graduationCriteria: { minMilestones: 6, requiredCategories: ['foundation', 'practice', 'integration'], minDuration: 16, minEvidenceItems: 8, maxBlockers: 0, requiredSentiment: 'positive' },
    milestones: [
      mt('candomble', 'Curadoria de Pontos e Cantigas', 'cbl-cur-1', 'foundation', 'Ponto Riscado — Fundamentos', 'Simbologia dos pontos riscados.', 6, 3, []),
      mt('candomble', 'Curadoria de Pontos e Cantigas', 'cbl-cur-2', 'study', 'Cantigas Canônicas', 'Repertório de 20 cantigas de abertura.', 7, 4, ['cbl-cur-1']),
      mt('candomble', 'Curadoria de Pontos e Cantigas', 'cbl-cur-3', 'practice', 'Toque de Atabaque', 'Toques básicos de atabaque.', 8, 6, ['cbl-cur-1']),
      mt('candomble', 'Curadoria de Pontos e Cantigas', 'cbl-cur-4', 'practice', 'Ensaio de Gongê', '4 ensaios de gongê.', 7, 4, ['cbl-cur-2', 'cbl-cur-3']),
      mt('candomble', 'Curadoria de Pontos e Cantigas', 'cbl-cur-5', 'integration', 'Curadoria de Festa', 'Sequência de pontos para uma festa.', 9, 4, ['cbl-cur-4']),
      mt('candomble', 'Curadoria de Pontos e Cantigas', 'cbl-cur-6', 'mastery', 'Condução Musical', 'Conduzir uma gira completa.', 10, 3, ['cbl-cur-5']),
    ],
  },
  // UMBANDA — Mediunidade
  {
    id: 'tpl-umbanda-mediunidade',
    tradition: 'umbanda',
    goal: 'Desenvolvimento Mediúnico',
    recommendedDurationWeeks: 30,
    graduationCriteria: { minMilestones: 7, requiredCategories: ['foundation', 'practice', 'integration'], minDuration: 20, minEvidenceItems: 10, maxBlockers: 0, requiredSentiment: 'positive' },
    milestones: [
      mt('umbanda', 'Desenvolvimento Mediúnico', 'umb-med-1', 'foundation', 'Abertura com os Guias', 'Fundamentos da incorporação e da doutrina.', 7, 3, []),
      mt('umbanda', 'Desenvolvimento Mediúnico', 'umb-med-2', 'foundation', 'Sete Linhas', 'As 7 linhas e seus Orixás.', 8, 4, ['umb-med-1']),
      mt('umbanda', 'Desenvolvimento Mediúnico', 'umb-med-3', 'practice', 'Desenvolvimento em Mesa', '10 sessões em mesa.', 9, 6, ['umb-med-2']),
      mt('umbanda', 'Desenvolvimento Mediúnico', 'umb-med-4', 'practice', 'Ponto de Abertura', '5 pontos de linhas distintas.', 6, 3, ['umb-med-2']),
      mt('umbanda', 'Desenvolvimento Mediúnico', 'umb-med-5', 'study', 'Doutrina — Cadernos da Umbanda', 'Leitura de cadernos doutrinários.', 5, 4, ['umb-med-1']),
      mt('umbanda', 'Desenvolvimento Mediúnico', 'umb-med-6', 'integration', 'Passe — Técnica', 'Técnicas de passe (magnetismo + corrente).', 9, 5, ['umb-med-3']),
      mt('umbanda', 'Desenvolvimento Mediúnico', 'umb-med-7', 'mastery', 'Atendimento Fraterno', '3 atendimentos sob mentoria.', 10, 5, ['umb-med-6']),
    ],
  },
  // UMBANDA — Passes
  {
    id: 'tpl-umbanda-passes',
    tradition: 'umbanda',
    goal: 'Prática de Passes e Cura',
    recommendedDurationWeeks: 24,
    graduationCriteria: { minMilestones: 6, requiredCategories: ['practice', 'integration', 'mastery'], minDuration: 14, minEvidenceItems: 8, maxBlockers: 0, requiredSentiment: 'positive' },
    milestones: [
      mt('umbanda', 'Prática de Passes e Cura', 'umb-pas-1', 'foundation', 'Anatomia Espiritual', 'Chakras e meridianos sob perspectiva umbandista.', 6, 3, []),
      mt('umbanda', 'Prática de Passes e Cura', 'umb-pas-2', 'practice', 'Passe de Baê', 'Aprender e praticar o passe de Baê.', 7, 3, ['umb-pas-1']),
      mt('umbanda', 'Prática de Passes e Cura', 'umb-pas-3', 'practice', 'Passe de Caboclo', 'Aprender e praticar o passe de Caboclo.', 7, 3, ['umb-pas-2']),
      mt('umbanda', 'Prática de Passes e Cura', 'umb-pas-4', 'practice', 'Passe de Preto-Velho', 'Aprender e praticar o passe de Preto-Velho.', 7, 3, ['umb-pas-2']),
      mt('umbanda', 'Prática de Passes e Cura', 'umb-pas-5', 'integration', 'Diagnóstico Espiritual', 'Leitura energética antes do passe.', 8, 5, ['umb-pas-3', 'umb-pas-4']),
      mt('umbanda', 'Prática de Passes e Cura', 'umb-pas-6', 'mastery', 'Sessão Completa', 'Conduzir uma sessão do início ao fim.', 10, 4, ['umb-pas-5']),
    ],
  },
  // IFÁ — Orunmilá
  {
    id: 'tpl-ifa-orunmila',
    tradition: 'ifa',
    goal: 'Fundamentos de Ifá com Orunmilá',
    recommendedDurationWeeks: 52,
    graduationCriteria: { minMilestones: 8, requiredCategories: ['foundation', 'practice', 'study', 'integration'], minDuration: 36, minEvidenceItems: 12, maxBlockers: 0, requiredSentiment: 'positive' },
    milestones: [
      mt('ifa', 'Fundamentos de Ifá com Orunmilá', 'ifa-oru-1', 'foundation', 'Apresentação a Orunmilá', 'Quem é Orunmilá e suas saudações.', 8, 4, []),
      mt('ifa', 'Fundamentos de Ifá com Orunmilá', 'ifa-oru-2', 'foundation', 'Sistema de 16 Odu', '16 Odu principais (Ofun a Odi).', 10, 8, ['ifa-oru-1']),
      mt('ifa', 'Fundamentos de Ifá com Orunmilá', 'ifa-oru-3', 'practice', 'Esku Completo', 'Saudação cerimonial completa.', 8, 4, ['ifa-oru-1']),
      mt('ifa', 'Fundamentos de Ifá com Orunmilá', 'ifa-oru-4', 'practice', 'Jogo de Búzios — Opô Afonjá', 'Método Opô Afonjá de tiragem.', 10, 12, ['ifa-oru-2', 'ifa-oru-3']),
      mt('ifa', 'Fundamentos de Ifá com Orunmilá', 'ifa-oru-5', 'study', 'Itan — Histórias dos Odu', 'Repertório de 30 histórias de Ifá.', 7, 8, ['ifa-oru-2']),
      mt('ifa', 'Fundamentos de Ifá com Orunmilá', 'ifa-oru-6', 'integration', 'Ebo — Composição', 'Compor ebó sob mentoria direta.', 9, 6, ['ifa-oru-4']),
      mt('ifa', 'Fundamentos de Ifá com Orunmilá', 'ifa-oru-7', 'mastery', 'Consultas Supervisionadas', '5 consultas supervisionadas.', 10, 6, ['ifa-oru-6']),
      mt('ifa', 'Fundamentos de Ifá com Orunmilá', 'ifa-oru-8', 'graduation', 'Iniciação Específica', 'Ritual de iniciação sob direção do mentor.', 10, 4, ['ifa-oru-7']),
    ],
  },
  // IFÁ — Merindilogun
  {
    id: 'tpl-ifa-merindilogun',
    tradition: 'ifa',
    goal: 'Merindilogun — 16 Odu',
    recommendedDurationWeeks: 40,
    graduationCriteria: { minMilestones: 7, requiredCategories: ['foundation', 'study', 'integration'], minDuration: 24, minEvidenceItems: 10, maxBlockers: 0, requiredSentiment: 'positive' },
    milestones: [
      mt('ifa', 'Merindilogun — 16 Odu', 'ifa-mer-1', 'foundation', 'Fundamentos do Merindilogun', 'Origens e diferença para o Merilogun de 4.', 7, 3, []),
      mt('ifa', 'Merindilogun — 16 Odu', 'ifa-mer-2', 'study', 'Odu Ofun', 'Estudo de Ofun (1-8) e iretes.', 8, 5, ['ifa-mer-1']),
      mt('ifa', 'Merindilogun — 16 Odu', 'ifa-mer-3', 'study', 'Odu Odi', 'Estudo de Odi (1-8) e iretes.', 8, 5, ['ifa-mer-1']),
      mt('ifa', 'Merindilogun — 16 Odu', 'ifa-mer-4', 'study', 'Odu Irosu e Ogunda', 'Estudo detalhado de Irosu e Ogunda.', 7, 5, ['ifa-mer-2', 'ifa-mer-3']),
      mt('ifa', 'Merindilogun — 16 Odu', 'ifa-mer-5', 'practice', 'Jogo Físico — Cadência', 'Cadência completa do jogo.', 9, 6, ['ifa-mer-2']),
      mt('ifa', 'Merindilogun — 16 Odu', 'ifa-mer-6', 'integration', 'Interpretação em Casos', 'Interpretar 10 casos práticos.', 10, 8, ['ifa-mer-5']),
      mt('ifa', 'Merindilogun — 16 Odu', 'ifa-mer-7', 'mastery', 'Consulta Pública', 'Conduzir consulta aberta sob banca.', 10, 6, ['ifa-mer-6']),
    ],
  },
  // CABALA — Árvore
  {
    id: 'tpl-cabala-arvore',
    tradition: 'cabala',
    goal: 'Árvore da Vida — Fundamentos',
    recommendedDurationWeeks: 28,
    graduationCriteria: { minMilestones: 7, requiredCategories: ['foundation', 'study', 'practice'], minDuration: 16, minEvidenceItems: 10, maxBlockers: 0, requiredSentiment: 'positive' },
    milestones: [
      mt('cabala', 'Árvore da Vida — Fundamentos', 'cab-arv-1', 'foundation', 'Topologia da Árvore', '10 sefirot, 22 caminhos, 3 pilares.', 7, 3, []),
      mt('cabala', 'Árvore da Vida — Fundamentos', 'cab-arv-2', 'foundation', 'Sefirot — Estudo das 10', 'Keter até Malkhut.', 9, 6, ['cab-arv-1']),
      mt('cabala', 'Árvore da Vida — Fundamentos', 'cab-arv-3', 'study', 'As 4 Mundos (Olamot)', 'Atziluth, Beriah, Yetzirah, Assiah.', 7, 3, ['cab-arv-2']),
      mt('cabala', 'Árvore da Vida — Fundamentos', 'cab-arv-4', 'study', '22 Caminhos — Tarot', 'Caminhos × 22 cartas maiores.', 9, 5, ['cab-arv-2']),
      mt('cabala', 'Árvore da Vida — Fundamentos', 'cab-arv-5', 'practice', 'Meditação nas Sefirot', '10 sessões dirigidas.', 8, 6, ['cab-arv-2']),
      mt('cabala', 'Árvore da Vida — Fundamentos', 'cab-arv-6', 'integration', 'Tikkun — Prática Integrativa', 'Tikkun aplicado a uma área concreta.', 8, 4, ['cab-arv-3', 'cab-arv-4', 'cab-arv-5']),
      mt('cabala', 'Árvore da Vida — Fundamentos', 'cab-arv-7', 'mastery', 'Ensinamento Supervisionado', 'Ministrar mini-aula sob mentoria.', 10, 3, ['cab-arv-6']),
    ],
  },
  // CABALA — Meditação
  {
    id: 'tpl-cabala-meditacao',
    tradition: 'cabala',
    goal: 'Meditação Cabalística Profunda',
    recommendedDurationWeeks: 24,
    graduationCriteria: { minMilestones: 6, requiredCategories: ['practice', 'integration'], minDuration: 14, minEvidenceItems: 8, maxBlockers: 0, requiredSentiment: 'positive' },
    milestones: [
      mt('cabala', 'Meditação Cabalística Profunda', 'cab-med-1', 'foundation', 'Postura e Respiração', 'Postura e respiração para meditação.', 5, 2, []),
      mt('cabala', 'Meditação Cabalística Profunda', 'cab-med-2', 'study', 'Kavanot — Intenções', 'YHVH, Adonai, Eheieh.', 6, 3, ['cab-med-1']),
      mt('cabala', 'Meditação Cabalística Profunda', 'cab-med-3', 'practice', 'Meditação nas Letras Hebraicas', 'Alef-Bet meditativo.', 9, 6, ['cab-med-2']),
      mt('cabala', 'Meditação Cabalística Profunda', 'cab-med-4', 'practice', 'Visualização nas Sefirot', '20 sessões profundas.', 9, 6, ['cab-med-2']),
      mt('cabala', 'Meditação Cabalística Profunda', 'cab-med-5', 'integration', 'Diário Contemplativo', 'Diário de 4 semanas.', 7, 4, ['cab-med-3', 'cab-med-4']),
      mt('cabala', 'Meditação Cabalística Profunda', 'cab-med-6', 'mastery', 'Retiro de 3 Dias', 'Conclusão com retiro contemplativo.', 10, 3, ['cab-med-5']),
    ],
  },
  // ASTROLOGIA — Leitura
  {
    id: 'tpl-astrologia-leitura',
    tradition: 'astrologia',
    goal: 'Leitura de Mapa Natal',
    recommendedDurationWeeks: 26,
    graduationCriteria: { minMilestones: 7, requiredCategories: ['foundation', 'study', 'integration'], minDuration: 14, minEvidenceItems: 10, maxBlockers: 0, requiredSentiment: 'positive' },
    milestones: [
      mt('astrologia', 'Leitura de Mapa Natal', 'ast-lei-1', 'foundation', 'Simbologia — Planetas, Signos, Casas', 'Linguagem básica.', 8, 4, []),
      mt('astrologia', 'Leitura de Mapa Natal', 'ast-lei-2', 'foundation', 'Rodas e Quadrantes', 'Hemisférios, quadrantes, ângulos.', 7, 3, ['ast-lei-1']),
      mt('astrologia', 'Leitura de Mapa Natal', 'ast-lei-3', 'study', 'Aspectos — Gramática', 'Conjunção, oposição, quadratura, etc.', 8, 4, ['ast-lei-1']),
      mt('astrologia', 'Leitura de Mapa Natal', 'ast-lei-4', 'study', 'Nodos Lunares e Lilith', 'Astrologia cármica.', 7, 4, ['ast-lei-2', 'ast-lei-3']),
      mt('astrologia', 'Leitura de Mapa Natal', 'ast-lei-5', 'practice', 'Análise de 10 Mapas', '10 mapas supervisionados.', 9, 6, ['ast-lei-3', 'ast-lei-4']),
      mt('astrologia', 'Leitura de Mapa Natal', 'ast-lei-6', 'integration', 'Escrita Interpretativa', '3 relatórios completos.', 8, 3, ['ast-lei-5']),
      mt('astrologia', 'Leitura de Mapa Natal', 'ast-lei-7', 'mastery', 'Consulta Supervisionada', 'Consulta ao vivo sob mentoria.', 10, 2, ['ast-lei-6']),
    ],
  },
  // ASTROLOGIA — Trânsitos
  {
    id: 'tpl-astrologia-transitos',
    tradition: 'astrologia',
    goal: 'Trânsitos e Previsão',
    recommendedDurationWeeks: 22,
    graduationCriteria: { minMilestones: 6, requiredCategories: ['study', 'practice', 'integration'], minDuration: 12, minEvidenceItems: 8, maxBlockers: 0, requiredSentiment: 'positive' },
    milestones: [
      mt('astrologia', 'Trânsitos e Previsão', 'ast-tr-1', 'foundation', 'Movimento Planetário', 'Velocidades, retrogradações.', 6, 2, []),
      mt('astrologia', 'Trânsitos e Previsão', 'ast-tr-2', 'study', 'Trânsitos por Casa', 'Planeta transitando cada casa natal.', 7, 4, ['ast-tr-1']),
      mt('astrologia', 'Trânsitos e Previsão', 'ast-tr-3', 'study', 'Aspectos de Trânsitos', 'Orbes, aplicação, separação.', 7, 3, ['ast-tr-2']),
      mt('astrologia', 'Trânsitos e Previsão', 'ast-tr-4', 'practice', 'Revolução Solar', 'Calcular e interpretar RS.', 8, 4, ['ast-tr-2']),
      mt('astrologia', 'Trânsitos e Previsão', 'ast-tr-5', 'integration', 'Boletim Mensal', '3 boletins mensais.', 8, 6, ['ast-tr-3', 'ast-tr-4']),
      mt('astrologia', 'Trânsitos e Previsão', 'ast-tr-6', 'mastery', 'Previsão Validada', 'Validar previsão contra evento real.', 10, 3, ['ast-tr-5']),
    ],
  },
  // TANTRA — Prānāyāma
  {
    id: 'tpl-tantra-pranayama',
    tradition: 'tantra',
    goal: 'Prānāyāma e Bandhas',
    recommendedDurationWeeks: 22,
    graduationCriteria: { minMilestones: 6, requiredCategories: ['foundation', 'practice', 'integration'], minDuration: 12, minEvidenceItems: 8, maxBlockers: 0, requiredSentiment: 'positive' },
    milestones: [
      mt('tantra', 'Prānāyāma e Bandhas', 'tan-pra-1', 'foundation', 'Fundamentos de Prāna', 'Prāna, nadis, koshas.', 6, 2, []),
      mt('tantra', 'Prānāyāma e Bandhas', 'tan-pra-2', 'practice', 'Ujjayi', 'Domínio de ujjayi.', 7, 3, ['tan-pra-1']),
      mt('tantra', 'Prānāyāma e Bandhas', 'tan-pra-3', 'practice', 'Nadi Shodhana', 'Respiração alternada.', 7, 3, ['tan-pra-2']),
      mt('tantra', 'Prānāyāma e Bandhas', 'tan-pra-4', 'practice', 'Kapalabhati e Bhastrika', 'Respirações de limpeza.', 7, 4, ['tan-pra-3']),
      mt('tantra', 'Prānāyāma e Bandhas', 'tan-pra-5', 'practice', 'Mula Bandha', 'Bandha raiz.', 8, 4, ['tan-pra-2']),
      mt('tantra', 'Prānāyāma e Bandhas', 'tan-pra-6', 'integration', 'Prática Integrada', 'Sequência 30min integrando tudo.', 9, 4, ['tan-pra-4', 'tan-pra-5']),
    ],
  },
  // TANTRA — Shakti
  {
    id: 'tpl-tantra-shakti',
    tradition: 'tantra',
    goal: 'Kundalini e Shakti',
    recommendedDurationWeeks: 36,
    graduationCriteria: { minMilestones: 7, requiredCategories: ['foundation', 'study', 'practice', 'integration'], minDuration: 24, minEvidenceItems: 10, maxBlockers: 0, requiredSentiment: 'positive' },
    milestones: [
      mt('tantra', 'Kundalini e Shakti', 'tan-sha-1', 'foundation', 'Modelo de Kundalini', 'Susumna, ida, pingala; 7 chakras.', 8, 4, []),
      mt('tantra', 'Kundalini e Shakti', 'tan-sha-2', 'study', 'Shakti e Shiva — Filosofia', 'Dialética Shakti/Shiva.', 7, 4, ['tan-sha-1']),
      mt('tantra', 'Kundalini e Shakti', 'tan-sha-3', 'practice', 'Meditação sobre Shakti', '20 sessões dirigidas.', 9, 6, ['tan-sha-1']),
      mt('tantra', 'Kundalini e Shakti', 'tan-sha-4', 'practice', 'Mantra e Nāda', '3 mantras de ativação.', 7, 4, ['tan-sha-3']),
      mt('tantra', 'Kundalini e Shakti', 'tan-sha-5', 'practice', 'Yantra e Visualização', 'Shri Yantra.', 8, 6, ['tan-sha-3']),
      mt('tantra', 'Kundalini e Shakti', 'tan-sha-6', 'integration', 'Ética e Integração', 'Abertura energética na vida cotidiana.', 8, 4, ['tan-sha-4', 'tan-sha-5']),
      mt('tantra', 'Kundalini e Shakti', 'tan-sha-7', 'mastery', 'Retiro Silencioso', 'Retiro de 3 dias em silêncio.', 10, 3, ['tan-sha-6']),
    ],
  },
];

/**
 * Internal helpers — deterministic, pure, not exported.
 */

/** Deterministic hash from string. Returns hex 16 chars. */
function deterministicHash(input: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 0xdeadbeef;
  for (let i = 0; i < input.length; i++) {
    const c = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x01000193) >>> 0;
    h2 = Math.imul(h2 ^ c, 0x85ebca6b) >>> 0;
  }
  return (h1.toString(16).padStart(8, '0') + h2.toString(16).padStart(8, '0')).slice(0, 16);
}

/** Shim now() — production callers should inject via parameters. */
function nowIso(): string {
  return new Date(0).toISOString();
}

/** Fixed reference "now" so module is deterministic across runs. */
const REFERENCE_NOW = '2026-06-29T00:00:00.000Z';

function referenceNow(): string {
  return REFERENCE_NOW;
}

function isValidIsoDate(s: string): boolean {
  if (typeof s !== 'string') return false;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return false;
  return d.toISOString() === s || /^\d{4}-\d{2}-\d{2}/.test(s);
}

function clamp(n: number, lo: number, hi: number): number {
  if (n < lo) return lo;
  if (n > hi) return hi;
  return n;
}

function daysBetween(a: string, b: string): number {
  const da = new Date(a).getTime();
  const db = new Date(b).getTime();
  return Math.round((db - da) / 86400000);
}

function addDaysIso(iso: string, days: number): string {
  const d = new Date(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString();
}

function addWeeksIso(iso: string, weeks: number): string {
  return addDaysIso(iso, weeks * 7);
}

function mean(arr: readonly number[]): number {
  if (arr.length === 0) return 0;
  let s = 0;
  for (const x of arr) s += x;
  return s / arr.length;
}

function uniqueById<T extends { id: string }>(items: readonly T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const it of items) {
    if (!seen.has(it.id)) {
      seen.add(it.id);
      out.push(it);
    }
  }
  return out;
}

/**
 * Compute deterministic ID from a seed string.
 */
export function makeId(seed: string): string {
  return deterministicHash(seed + '|' + referenceNow());
}

/**
 * Lookup a template by id. Returns null if not found.
 */
export function getTemplateById(id: string): ProgressTemplate | null {
  for (const t of PROGRESS_TEMPLATES) {
    if (t.id === id) return t;
  }
  return null;
}

/**
 * List all templates, optionally filtered by tradition.
 */
export function listTemplates(tradition?: Tradition): ProgressTemplate[] {
  if (tradition === undefined) {
    return [...PROGRESS_TEMPLATES];
  }
  return PROGRESS_TEMPLATES.filter((t) => t.tradition === tradition);
}

/**
 * Load a template by id. Throws (returns error description) if missing —
 * but to keep the API pure & non-throwing, returns null when absent.
 *
 * NOTE: spec also requires a `loadTemplate(templateId)` returning a
 * ProgressTemplate directly. We provide BOTH — `loadTemplate` returns
 * the template or throws (since callers can recover via listTemplates).
 */
export function loadTemplate(templateId: string): ProgressTemplate {
  const t = getTemplateById(templateId);
  if (t === null) {
    throw new Error(`Template not found: ${templateId}`);
  }
  return t;
}


/**
 * Create a new PairingProgress seeded from a template.
 *
 * `startedAt` defaults to the reference now. Override for deterministic tests.
 */
export function createPairingProgress(
  pairingId: string,
  mentorId: string,
  menteeId: string,
  templateId: string,
  options?: { startedAt?: string },
): PairingProgress {
  const template = getTemplateById(templateId);
  if (template === null) {
    throw new Error(`Cannot create PairingProgress: template ${templateId} not found`);
  }

  const startedAt = options?.startedAt ?? referenceNow();
  const milestones: Milestone[] = template.milestones.map((mt, idx) => ({
    id: makeId(`${pairingId}|milestone|${mt.id}|${idx}`),
    pairingId,
    title: mt.title,
    description: mt.description,
    category: mt.category,
    status: 'pending',
    targetDate: addWeeksIso(startedAt, mt.suggestedDuration * idx),
    completedAt: null,
    evidence: [],
    weight: mt.weight,
  }));

  return {
    pairingId,
    mentorId,
    menteeId,
    startedAt,
    currentPhase: 'orientation',
    milestones,
    completedMilestones: 0,
    totalProgress: 0,
    recentNotes: [],
    blockers: [],
    predictedGraduationDate: null,
    momentum: {
      score: 0,
      windowDays: 14,
      trend: 'stable',
      reason: 'pairing just created',
    },
    tags: [template.tradition, ...template.goal.split(' ').slice(0, 3)],
    goals: [template.goal],
    updatedAt: startedAt,
  };
}

/**
 * Add a new milestone to the pairing (ad-hoc, not from template).
 */
export function addMilestone(progress: PairingProgress, milestone: Milestone): PairingProgress {
  const updated: PairingProgress = {
    ...progress,
    milestones: uniqueById([...progress.milestones, milestone]),
    updatedAt: referenceNow(),
  };
  return recomputeProgress(updated);
}

/**
 * Mark a milestone as completed and attach evidence.
 */
export function completeMilestone(
  progress: PairingProgress,
  milestoneId: string,
  evidence: EvidenceItem,
): PairingProgress {
  const now = referenceNow();
  const updated: PairingProgress = {
    ...progress,
    milestones: progress.milestones.map((m) =>
      m.id === milestoneId
        ? { ...m, status: 'completed', completedAt: now, evidence: [...m.evidence, evidence] }
        : m,
    ),
    updatedAt: now,
  };
  return recomputeProgress(updated);
}

/**
 * Skip a milestone (with justification).
 */
export function skipMilestone(
  progress: PairingProgress,
  milestoneId: string,
  reason: string,
): PairingProgress {
  const now = referenceNow();
  const updated: PairingProgress = {
    ...progress,
    milestones: progress.milestones.map((m) =>
      m.id === milestoneId ? { ...m, status: 'skipped', notes: reason } : m,
    ),
    updatedAt: now,
  };
  return recomputeProgress(updated);
}

/**
 * Attach a blocker to a milestone (sets status='blocked').
 */
export function blockMilestone(
  progress: PairingProgress,
  milestoneId: string,
  blocker: Blocker,
): PairingProgress {
  const updated: PairingProgress = {
    ...progress,
    milestones: progress.milestones.map((m) =>
      m.id === milestoneId ? { ...m, status: 'blocked', notes: blocker.description } : m,
    ),
    blockers: [...progress.blockers, blocker],
    updatedAt: referenceNow(),
  };
  return recomputeProgress(updated);
}

/**
 * Remove a blocker from a milestone (sets status='active').
 */
export function unblockMilestone(progress: PairingProgress, milestoneId: string): PairingProgress {
  const updated: PairingProgress = {
    ...progress,
    milestones: progress.milestones.map((m) =>
      m.id === milestoneId ? { ...m, status: 'active' } : m,
    ),
    updatedAt: referenceNow(),
  };
  return recomputeProgress(updated);
}

/**
 * Add a progress note (journal entry).
 */
export function addProgressNote(progress: PairingProgress, note: ProgressNote): PairingProgress {
  const recentNotes = [note, ...progress.recentNotes].slice(0, 50);
  const updated: PairingProgress = {
    ...progress,
    recentNotes,
    updatedAt: note.createdAt,
  };
  return recomputeProgress(updated);
}

/**
 * Attach evidence to a milestone (without completing it).
 */
export function addEvidence(
  progress: PairingProgress,
  milestoneId: string,
  evidence: EvidenceItem,
): PairingProgress {
  const updated: PairingProgress = {
    ...progress,
    milestones: progress.milestones.map((m) =>
      m.id === milestoneId ? { ...m, evidence: [...m.evidence, evidence] } : m,
    ),
    updatedAt: referenceNow(),
  };
  return recomputeProgress(updated);
}

/**
 * Add a free-standing blocker (not tied to a specific milestone).
 */
export function addBlocker(progress: PairingProgress, blocker: Blocker): PairingProgress {
  const updated: PairingProgress = {
    ...progress,
    blockers: [...progress.blockers, blocker],
    updatedAt: referenceNow(),
  };
  return recomputeProgress(updated);
}

/**
 * Resolve a blocker.
 */
export function resolveBlocker(
  progress: PairingProgress,
  blockerId: string,
  resolution: string,
): PairingProgress {
  const now = referenceNow();
  const updated: PairingProgress = {
    ...progress,
    blockers: progress.blockers.map((b) =>
      b.id === blockerId ? { ...b, resolvedAt: now, resolution } : b,
    ),
    updatedAt: now,
  };
  // Clean resolved blockers from active list
  updated.blockers = updated.blockers.filter((b) => b.resolvedAt === null);
  return recomputeProgress(updated);
}

/**
 * Add a mentor health check.
 */
export function addMentorHealthCheck(
  progress: PairingProgress,
  check: MentorHealthCheck,
): PairingProgress {
  // Health checks are stored as a special tag for now (in production this
  // would be a separate table). We embed via tags to keep PairingProgress
  // shape stable.
  const tag = `healthcheck:${check.mentorId}:${check.lastCheckAt}`;
  const updated: PairingProgress = {
    ...progress,
    tags: [...progress.tags, tag],
    updatedAt: check.lastCheckAt,
  };
  return recomputeProgress(updated);
}

/**
 * Add a goal check-in.
 */
export function addCheckIn(progress: PairingProgress, checkIn: GoalCheckIn): PairingProgress {
  // Embed via tags (same pattern as health checks).
  const tag = `checkin:${checkIn.id}:${checkIn.scheduledAt}`;
  const updated: PairingProgress = {
    ...progress,
    tags: [...progress.tags, tag],
    updatedAt: checkIn.scheduledAt,
  };
  return recomputeProgress(updated);
}

/**
 * Pause pairing (sets phase to 'paused' equivalent — represented as
 * adding a 'paused' tag + storing reason in tags).
 */
export function pausePairing(progress: PairingProgress, reason: string): PairingProgress {
  return {
    ...progress,
    currentPhase: 'orientation', // soft pause; phase detection will skip if blocker active
    tags: [...progress.tags, `paused:${reason}:${referenceNow()}`],
    updatedAt: referenceNow(),
  };
}

/**
 * Resume pairing — removes the most recent 'paused:*' tag.
 */
export function resumePairing(progress: PairingProgress): PairingProgress {
  const filtered = progress.tags.filter((t) => !t.startsWith('paused:'));
  return {
    ...progress,
    tags: filtered,
    updatedAt: referenceNow(),
  };
}

/**
 * End pairing — terminal state. Stored via 'ended' tag.
 */
export function endPairing(
  progress: PairingProgress,
  outcome: 'graduated' | 'released' | 'withdrawn',
  reason: string,
): PairingProgress {
  return {
    ...progress,
    tags: [...progress.tags, `ended:${outcome}:${reason}:${referenceNow()}`],
    updatedAt: referenceNow(),
  };
}

/**
 * Transition to alumni. Adds 'alumni' tag and bumps currentPhase.
 */
export function transitionToAlumni(
  progress: PairingProgress,
  alumniProfile: AlumniProfile,
): PairingProgress {
  const updated: PairingProgress = {
    ...progress,
    currentPhase: 'alumni',
    tags: [...progress.tags, `alumni:${alumniProfile.userId}:${alumniProfile.graduatedAt}`],
    updatedAt: alumniProfile.graduatedAt,
  };
  return recomputeProgress(updated);
}


/**
 * Compute overall progress + momentum + phase.
 */
export function computeProgress(progress: PairingProgress): {
  completion: number;
  momentum: Momentum;
  phase: Phase;
} {
  return {
    completion: computeCompletion(progress),
    momentum: computeMomentum(progress, 14),
    phase: detectPhase(progress),
  };
}

/**
 * Compute weighted completion percentage (0-100).
 */
export function computeCompletion(progress: PairingProgress): number {
  if (progress.milestones.length === 0) return 0;
  let totalWeight = 0;
  let earnedWeight = 0;
  for (const m of progress.milestones) {
    totalWeight += m.weight;
    if (m.status === 'completed') {
      earnedWeight += m.weight;
    } else if (m.status === 'skipped') {
      // Skipped milestones count at 50% (acknowledged but not done).
      earnedWeight += m.weight * 0.5;
    }
  }
  if (totalWeight === 0) return 0;
  return Math.round((earnedWeight / totalWeight) * 100);
}

/**
 * Compute momentum over the last `windowDays` of activity.
 */
export function computeMomentum(progress: PairingProgress, windowDays: number): Momentum {
  const cutoff = addDaysIso(referenceNow(), -windowDays);

  // Count evidence and completed milestones within window.
  let evidenceInWindow = 0;
  let notesInWindow = 0;
  let positiveSentiment = 0;
  let concernedSentiment = 0;
  let breakthroughSentiment = 0;
  let totalSentiment = 0;

  for (const m of progress.milestones) {
    for (const e of m.evidence) {
      if (e.completedAt >= cutoff) evidenceInWindow += 1;
    }
    if (m.completedAt !== null && m.completedAt >= cutoff) {
      evidenceInWindow += 1; // completion itself is signal
    }
  }

  for (const n of progress.recentNotes) {
    if (n.createdAt >= cutoff) {
      notesInWindow += 1;
      totalSentiment += 1;
      if (n.sentiment === 'positive') positiveSentiment += 1;
      else if (n.sentiment === 'concerned') concernedSentiment += 1;
      else if (n.sentiment === 'breakthrough') breakthroughSentiment += 1;
    }
  }

  const activeBlockers = progress.blockers.length;
  const signalRaw =
    evidenceInWindow * 1.5 +
    notesInWindow * 0.5 +
    breakthroughSentiment * 2.0 -
    activeBlockers * 1.5 -
    concernedSentiment * 0.8;

  const score = clamp(signalRaw / 10, -1, 1);

  // Trend: compare first-half vs second-half of window.
  const midpoint = addDaysIso(cutoff, Math.floor(windowDays / 2));
  let firstHalf = 0;
  let secondHalf = 0;
  for (const m of progress.milestones) {
    if (m.completedAt !== null) {
      if (m.completedAt >= cutoff && m.completedAt < midpoint) firstHalf += 1;
      else if (m.completedAt >= midpoint) secondHalf += 1;
    }
  }
  let trend: MomentumTrend = 'stable';
  if (secondHalf > firstHalf + 1) trend = 'rising';
  else if (firstHalf > secondHalf + 1) trend = 'falling';

  let reason = `${evidenceInWindow} evidence + ${notesInWindow} notes in last ${windowDays}d`;
  if (activeBlockers > 0) reason += `, ${activeBlockers} active blockers`;
  if (breakthroughSentiment > 0) reason += `, ${breakthroughSentiment} breakthrough(s)`;

  return {
    score: Math.round(score * 100) / 100,
    windowDays,
    trend,
    reason,
  };
}

/**
 * Detect current phase based on milestone distribution.
 */
export function detectPhase(progress: PairingProgress): Phase {
  const completion = computeCompletion(progress);
  const counts = countByCategory(progress);
  const totalCompleted = progress.completedMilestones;

  // Alumni check (terminal).
  if (progress.tags.some((t) => t.startsWith('alumni:'))) return 'alumni';

  // Orientation: no completed milestones yet.
  if (totalCompleted === 0) return 'orientation';

  // Graduation: all required categories touched + high completion.
  const allCategoriesCovered =
    counts.completed.foundation >= 1 &&
    counts.completed.integration >= 1 &&
    counts.completed.mastery >= 1;
  if (allCategoriesCovered && completion >= 80) return 'graduation';

  // Integration: have practice + study + integration completed.
  if (
    counts.completed.practice >= 2 &&
    counts.completed.study >= 1 &&
    counts.completed.integration >= 1
  ) {
    return 'integration';
  }

  // Deepening: significant practice work underway.
  if (counts.completed.foundation >= 2 || counts.completed.practice >= 2) {
    return 'deepening';
  }

  // Foundation: just starting out.
  return 'foundation';
}

function countByCategory(progress: PairingProgress): {
  total: Record<MilestoneCategory, number>;
  completed: Record<MilestoneCategory, number>;
} {
  const total: Record<MilestoneCategory, number> = {
    foundation: 0,
    practice: 0,
    study: 0,
    integration: 0,
    mastery: 0,
    graduation: 0,
  };
  const completed: Record<MilestoneCategory, number> = {
    foundation: 0,
    practice: 0,
    study: 0,
    integration: 0,
    mastery: 0,
    graduation: 0,
  };
  for (const m of progress.milestones) {
    total[m.category] += 1;
    if (m.status === 'completed') {
      completed[m.category] += 1;
    }
  }
  return { total, completed };
}

/**
 * Predict graduation date based on current pace.
 */
export function predictGraduation(progress: PairingProgress): string | null {
  const completed = progress.milestones.filter((m) => m.status === 'completed');
  if (completed.length < 2) return null;

  const completionTimes = completed
    .filter((m) => m.completedAt !== null)
    .map((m) => ({
      completedAt: m.completedAt as string,
      targetDate: m.targetDate,
    }));

  if (completionTimes.length < 2) return null;

  // Compute average completion rate (days per milestone).
  const sorted = [...completionTimes].sort((a, b) => a.completedAt.localeCompare(b.completedAt));
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  if (first === undefined || last === undefined) return null;
  const totalDays = daysBetween(first.completedAt, last.completedAt);
  const milestonesDone = sorted.length - 1;
  if (totalDays === 0 || milestonesDone === 0) return null;
  const daysPerMilestone = totalDays / milestonesDone;

  const remaining = progress.milestones.length - completed.length;
  const remainingDays = Math.round(remaining * daysPerMilestone);
  return addDaysIso(referenceNow(), remainingDays);
}

/**
 * Check graduation eligibility against criteria.
 */
export function checkGraduation(
  progress: PairingProgress,
  criteria: GraduationCriteria,
): GraduationStatus {
  if (progress.tags.some((t) => t.startsWith('paused:'))) return 'paused';
  if (progress.tags.some((t) => t.startsWith('ended:'))) return 'ended';
  if (progress.tags.some((t) => t.startsWith('alumni:'))) return 'graduated';

  const completion = computeCompletion(progress);
  const activeBlockers = progress.blockers.length;
  const totalEvidence = progress.milestones.reduce((s, m) => s + m.evidence.length, 0);
  const completedMilestones = progress.milestones.filter((m) => m.status === 'completed');

  if (activeBlockers > criteria.maxBlockers) return 'on_hold';

  const categoriesCovered = new Set(completedMilestones.map((m) => m.category));
  const allCategoriesMet = criteria.requiredCategories.every((c) => categoriesCovered.has(c));

  const durationWeeks = daysBetween(progress.startedAt, referenceNow()) / 7;
  const durationMet = durationWeeks >= criteria.minDuration;

  const sentimentScore = dominantSentiment(progress);
  const sentimentRank: Record<Sentiment, number> = {
    breakthrough: 4,
    positive: 3,
    neutral: 2,
    concerned: 1,
  };
  const sentimentMet =
    sentimentRank[sentimentScore] >= sentimentRank[criteria.requiredSentiment];

  if (
    completedMilestones.length >= criteria.minMilestones &&
    allCategoriesMet &&
    durationMet &&
    totalEvidence >= criteria.minEvidenceItems &&
    sentimentMet
  ) {
    return 'eligible';
  }

  if (completion >= 30) return 'in_progress';
  return 'not_ready';
}

/**
 * Apply graduation: returns updated progress + new alumni profile.
 */
export function applyGraduation(
  progress: PairingProgress,
  criteria: GraduationCriteria,
): { progress: PairingProgress; alumni: AlumniProfile } {
  const status = checkGraduation(progress, criteria);
  if (status !== 'eligible') {
    throw new Error(
      `Cannot apply graduation: status is ${status}, not 'eligible'`,
    );
  }
  const now = referenceNow();
  const alumni: AlumniProfile = {
    userId: progress.menteeId,
    graduatedAt: now,
    traditionsLearned: extractTraditions(progress),
    specialtiesAchieved: Array.from(
      new Set(progress.milestones.filter((m) => m.status === 'completed').map((m) => m.title)),
    ),
    totalHoursMentored: computeTotalHours(progress),
    currentRole: 'alumni',
    testimonials: [],
  };
  const updated: PairingProgress = transitionToAlumni(progress, alumni);
  return { progress: updated, alumni };
}

/**
 * Get active blockers.
 */
export function getBlockers(progress: PairingProgress): Blocker[] {
  return progress.blockers.filter((b) => b.resolvedAt === null);
}

/**
 * Get recent progress notes (most recent first).
 */
export function getRecentNotes(progress: PairingProgress, limit: number): ProgressNote[] {
  return progress.recentNotes.slice(0, Math.max(0, limit));
}

/**
 * Get progress filtered by goal.
 */
export function getGoalProgress(progress: PairingProgress, goal: string): LearningGoalProgress {
  const filtered = progress.milestones.filter((m) =>
    progress.goals.some((g) => g.toLowerCase().includes(goal.toLowerCase())),
  );
  const evidence = filtered.flatMap((m) => m.evidence);
  const completion = filtered.length === 0 ? 0 : computeCompletion({
    ...progress,
    milestones: filtered,
  });
  return {
    goal,
    milestones: filtered,
    completion,
    evidence,
    momentum: computeMomentum(progress, 14),
  };
}

/**
 * Get a snapshot of pairing health at this moment.
 */
export function getSnapshot(progress: PairingProgress): ProgressSnapshot {
  const evidenceCount = progress.milestones.reduce((s, m) => s + m.evidence.length, 0);
  const blockerCount = getBlockers(progress).length;
  const completeness = computeCompletion(progress);
  return {
    pairingId: progress.pairingId,
    takenAt: referenceNow(),
    milestoneCount: progress.milestones.length,
    evidenceCount,
    blockerCount,
    sentiment: dominantSentiment(progress),
    momentum: computeMomentum(progress, 14),
    completeness,
    phase: detectPhase(progress),
  };
}

/**
 * Get an alumni profile for a user (stub: derives from pairing tags).
 *
 * Production: would query a separate alumni table. For pure-function
 * behavior, returns null if no alumni tag found in any pairing state
 * passed in.
 */
export function getAlumniProfile(userId: string): AlumniProfile {
  // Stub: returns a minimal profile. Real impl would consult store.
  return {
    userId,
    graduatedAt: referenceNow(),
    traditionsLearned: [],
    specialtiesAchieved: [],
    totalHoursMentored: 0,
    currentRole: 'alumni',
    testimonials: [],
  };
}

/**
 * Get mentor health concerns from pairing tags.
 */
export function getHealthConcerns(progress: PairingProgress): MentorHealthCheck[] {
  const out: MentorHealthCheck[] = [];
  for (const tag of progress.tags) {
    if (tag.startsWith('healthcheck:')) {
      const parts = tag.split(':');
      const mentorId = parts[1] ?? '';
      const lastCheckAt = parts[2] ?? referenceNow();
      out.push({
        pairingId: progress.pairingId,
        mentorId,
        energyLevel: 3,
        satisfaction: 3,
        concerns: [],
        flaggedForSupport: false,
        lastCheckAt,
      });
    }
  }
  return out;
}

/**
 * Get goal check-ins from pairing tags.
 */
export function getCheckIns(progress: PairingProgress, since?: string): GoalCheckIn[] {
  const cutoff = since ?? '0000-01-01T00:00:00.000Z';
  const out: GoalCheckIn[] = [];
  for (const tag of progress.tags) {
    if (tag.startsWith('checkin:')) {
      const parts = tag.split(':');
      const id = parts[1] ?? '';
      const scheduledAt = parts[2] ?? referenceNow();
      if (scheduledAt >= cutoff) {
        out.push({
          id,
          pairingId: progress.pairingId,
          goalId: progress.goals[0] ?? '',
          attended: true,
          notes: '',
          blockers: [],
          actionItems: [],
          scheduledAt,
          completedAt: scheduledAt,
        });
      }
    }
  }
  return out;
}


export interface ValidationIssue {
  field: string;
  severity: 'error' | 'warning';
  message: string;
}

/**
 * Validate a milestone.
 */
export function validateMilestone(milestone: Milestone): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (milestone.id.trim() === '') {
    issues.push({ field: 'id', severity: 'error', message: 'id is required' });
  }
  if (milestone.pairingId.trim() === '') {
    issues.push({ field: 'pairingId', severity: 'error', message: 'pairingId is required' });
  }
  if (milestone.title.trim() === '') {
    issues.push({ field: 'title', severity: 'error', message: 'title is required' });
  }
  if (milestone.weight < 1 || milestone.weight > 10) {
    issues.push({
      field: 'weight',
      severity: 'error',
      message: 'weight must be between 1 and 10',
    });
  }
  if (!ALL_CATEGORIES.includes(milestone.category)) {
    issues.push({
      field: 'category',
      severity: 'error',
      message: `category must be one of ${ALL_CATEGORIES.join(', ')}`,
    });
  }
  if (milestone.status === 'completed' && milestone.completedAt === null) {
    issues.push({
      field: 'completedAt',
      severity: 'warning',
      message: 'status=completed but completedAt is null',
    });
  }
  if (milestone.status !== 'completed' && milestone.completedAt !== null) {
    issues.push({
      field: 'completedAt',
      severity: 'warning',
      message: 'completedAt is set but status is not completed',
    });
  }
  if (!isValidIsoDate(milestone.targetDate)) {
    issues.push({
      field: 'targetDate',
      severity: 'error',
      message: 'targetDate must be a valid ISO date',
    });
  }
  return issues;
}

/**
 * Validate a progress note.
 */
export function validateProgressNote(note: ProgressNote): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (note.id.trim() === '') {
    issues.push({ field: 'id', severity: 'error', message: 'id is required' });
  }
  if (note.pairingId.trim() === '') {
    issues.push({ field: 'pairingId', severity: 'error', message: 'pairingId is required' });
  }
  if (note.authorId.trim() === '') {
    issues.push({ field: 'authorId', severity: 'error', message: 'authorId is required' });
  }
  if (note.content.trim() === '') {
    issues.push({ field: 'content', severity: 'error', message: 'content is required' });
  }
  if (!ALL_SENTIMENTS.includes(note.sentiment)) {
    issues.push({
      field: 'sentiment',
      severity: 'error',
      message: `sentiment must be one of ${ALL_SENTIMENTS.join(', ')}`,
    });
  }
  if (!isValidIsoDate(note.createdAt)) {
    issues.push({
      field: 'createdAt',
      severity: 'error',
      message: 'createdAt must be a valid ISO timestamp',
    });
  }
  if (note.visibility === 'private' && note.sentiment === 'breakthrough') {
    issues.push({
      field: 'visibility',
      severity: 'warning',
      message: 'private breakthrough note — consider sharing for community benefit',
    });
  }
  return issues;
}

/**
 * Validate an evidence item.
 */
export function validateEvidence(item: EvidenceItem): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (item.id.trim() === '') {
    issues.push({ field: 'id', severity: 'error', message: 'id is required' });
  }
  if (!ALL_EVIDENCE_TYPES.includes(item.type)) {
    issues.push({
      field: 'type',
      severity: 'error',
      message: `type must be one of ${ALL_EVIDENCE_TYPES.join(', ')}`,
    });
  }
  if (item.title.trim() === '') {
    issues.push({ field: 'title', severity: 'error', message: 'title is required' });
  }
  if (item.durationMinutes < 0) {
    issues.push({
      field: 'durationMinutes',
      severity: 'error',
      message: 'durationMinutes must be >= 0',
    });
  }
  if (item.url !== null && !/^https?:\/\//.test(item.url)) {
    issues.push({
      field: 'url',
      severity: 'warning',
      message: 'url should start with http:// or https://',
    });
  }
  if (item.traditionTags.length === 0) {
    issues.push({
      field: 'traditionTags',
      severity: 'warning',
      message: 'evidence has no tradition tags — consider adding at least one',
    });
  }
  if (!isValidIsoDate(item.completedAt)) {
    issues.push({
      field: 'completedAt',
      severity: 'error',
      message: 'completedAt must be a valid ISO timestamp',
    });
  }
  return issues;
}


/**
 * Return the default graduation criteria.
 */
export function defaultGraduationCriteria(): GraduationCriteria {
  return { ...DEFAULT_GRADUATION_CRITERIA };
}

/**
 * Build a human-readable summary of a pairing's progress.
 */
export function buildProgressSummary(progress: PairingProgress): string {
  const lines: string[] = [];
  lines.push(`# Pairing ${progress.pairingId}`);
  lines.push(`Mentor: ${progress.mentorId}`);
  lines.push(`Mentee: ${progress.menteeId}`);
  lines.push(`Started: ${progress.startedAt}`);
  lines.push(`Phase: ${progress.currentPhase}`);
  lines.push('');
  lines.push(`## Progress`);
  lines.push(`- Total progress: ${progress.totalProgress}%`);
  lines.push(`- Completed milestones: ${progress.completedMilestones}/${progress.milestones.length}`);
  lines.push(`- Momentum: ${progress.momentum.score} (${progress.momentum.trend})`);
  if (progress.predictedGraduationDate !== null) {
    lines.push(`- Predicted graduation: ${progress.predictedGraduationDate}`);
  }
  lines.push('');
  lines.push(`## Active Blockers`);
  if (progress.blockers.length === 0) {
    lines.push('(none)');
  } else {
    for (const b of progress.blockers) {
      lines.push(`- [${b.type}/sev${b.severity}] ${b.description}`);
    }
  }
  lines.push('');
  lines.push(`## Recent Notes (last 5)`);
  const recent = progress.recentNotes.slice(0, 5);
  if (recent.length === 0) {
    lines.push('(none)');
  } else {
    for (const n of recent) {
      lines.push(`- [${n.sentiment}] ${n.content.slice(0, 80)}`);
    }
  }
  return lines.join('\n');
}


/**
 * Internal: after any state mutation, recompute the derived fields.
 * Pure — returns a new PairingProgress.
 */
function recomputeProgress(progress: PairingProgress): PairingProgress {
  const completedMilestones = progress.milestones.filter((m) => m.status === 'completed').length;
  const totalProgress = computeCompletion(progress);
  const momentum = computeMomentum(progress, 14);
  const phase = detectPhase(progress);
  const predicted = predictGraduation(progress);
  return {
    ...progress,
    completedMilestones,
    totalProgress,
    momentum,
    currentPhase: phase,
    predictedGraduationDate: predicted,
  };
}


function dominantSentiment(progress: PairingProgress): Sentiment {
  if (progress.recentNotes.length === 0) return 'neutral';
  const counts: Record<Sentiment, number> = {
    positive: 0,
    neutral: 0,
    concerned: 0,
    breakthrough: 0,
  };
  for (const n of progress.recentNotes) {
    counts[n.sentiment] += 1;
  }
  let best: Sentiment = 'neutral';
  let bestN = -1;
  for (const s of ALL_SENTIMENTS) {
    if (counts[s] > bestN) {
      bestN = counts[s];
      best = s;
    }
  }
  return best;
}

function extractTraditions(progress: PairingProgress): Tradition[] {
  const out = new Set<Tradition>();
  for (const tag of progress.tags) {
    for (const t of TRADITIONS) {
      if (tag.includes(t)) out.add(t);
    }
  }
  return Array.from(out);
}

function computeTotalHours(progress: PairingProgress): number {
  let totalMinutes = 0;
  for (const m of progress.milestones) {
    for (const e of m.evidence) {
      totalMinutes += e.durationMinutes;
    }
  }
  return Math.round(totalMinutes / 60);
}


/**
 * Construct an empty Milestone with sensible defaults.
 */
export function newMilestone(
  pairingId: string,
  title: string,
  category: MilestoneCategory,
  options?: { weight?: number; description?: string; targetDate?: string },
): Milestone {
  const targetDate = options?.targetDate ?? addWeeksIso(referenceNow(), 4);
  return {
    id: makeId(`${pairingId}|${title}|${targetDate}|new`),
    pairingId,
    title,
    description: options?.description ?? '',
    category,
    status: 'pending',
    targetDate,
    completedAt: null,
    evidence: [],
    weight: options?.weight ?? 5,
  };
}

/**
 * Construct a ProgressNote with sensible defaults.
 */
export function newProgressNote(
  pairingId: string,
  authorId: string,
  content: string,
  options?: { sentiment?: Sentiment; visibility?: NoteVisibility },
): ProgressNote {
  return {
    id: makeId(`${pairingId}|${authorId}|${content}|${referenceNow()}`),
    pairingId,
    milestoneId: null,
    authorId,
    content,
    sentiment: options?.sentiment ?? 'neutral',
    insights: [],
    blockers: [],
    nextSteps: [],
    visibility: options?.visibility ?? 'shared',
    createdAt: referenceNow(),
  };
}

/**
 * Construct an EvidenceItem with sensible defaults.
 */
export function newEvidence(
  type: EvidenceType,
  title: string,
  options?: {
    description?: string;
    url?: string | null;
    traditionTags?: Tradition[];
    durationMinutes?: number;
  },
): EvidenceItem {
  return {
    id: makeId(`${type}|${title}|${referenceNow()}`),
    type,
    title,
    description: options?.description ?? '',
    url: options?.url ?? null,
    traditionTags: options?.traditionTags ?? [],
    completedAt: referenceNow(),
    durationMinutes: options?.durationMinutes ?? 30,
  };
}

/**
 * Construct a Blocker with sensible defaults.
 */
export function newBlocker(
  type: BlockerType,
  severity: number,
  description: string,
  raisedBy: string,
): Blocker {
  return {
    id: makeId(`${type}|${severity}|${description}|${raisedBy}|${referenceNow()}`),
    type,
    severity,
    description,
    raisedBy,
    raisedAt: referenceNow(),
    resolvedAt: null,
    resolution: null,
  };
}

/**
 * Construct a MentorHealthCheck with sensible defaults.
 */
export function newMentorHealthCheck(
  pairingId: string,
  mentorId: string,
  energyLevel: number,
  satisfaction: number,
  concerns: string[] = [],
): MentorHealthCheck {
  return {
    pairingId,
    mentorId,
    energyLevel: clamp(energyLevel, 1, 5),
    satisfaction: clamp(satisfaction, 1, 5),
    concerns,
    flaggedForSupport: energyLevel <= 2 || satisfaction <= 2,
    lastCheckAt: referenceNow(),
  };
}

/**
 * Construct a GoalCheckIn with sensible defaults.
 */
export function newGoalCheckIn(
  pairingId: string,
  goalId: string,
  attended: boolean,
  options?: { notes?: string; blockers?: string[]; actionItems?: string[] },
): GoalCheckIn {
  const now = referenceNow();
  return {
    id: makeId(`${pairingId}|${goalId}|${now}|checkin`),
    pairingId,
    goalId,
    attended,
    notes: options?.notes ?? '',
    blockers: options?.blockers ?? [],
    actionItems: options?.actionItems ?? [],
    scheduledAt: now,
    completedAt: attended ? now : null,
  };
}

/**
 * Construct a Testimonial.
 */
export function newTestimonial(
  pairingId: string,
  authorId: string,
  content: string,
): Testimonial {
  return {
    id: makeId(`${pairingId}|${authorId}|${content}|testimonial`),
    pairingId,
    authorId,
    content,
    createdAt: referenceNow(),
  };
}

/** Fixed reference "now" used by all internal helpers. */
export const REFERENCE_TIMESTAMP: string = REFERENCE_NOW;

export { nowIso };

void TRADITIONS;

// w46/mentorship-progress-tracking.ts — 2041 lines — TS
