/**
 * synthesis-engine/synthesis-types.ts
 *
 * Tipos e interfaces do motor de síntese narrativa dos 5 pilares.
 * Split de synthesis-engine.ts para manter separação de responsabilidades.
 */

import type { AkashicHologram } from '@/lib/domain/mapa/hologram-aggregator';
import type { AreaNarrativeFull } from '../narrative-generator';

// ─── Life Areas (Maslow + Akasha) ──────────────────────────────────────────

export type LifeArea =
  | 'vitalidadeEnergia'   // Corpo: saúde, sexualidade, energia vital
  | 'conexoesAmor'        // Relações: amor, família, vínculos
  | 'carreiraProsperidade' // Recursos: finanças, carreira, abundância
  | 'oriCabecaQuizilas'   // Mente: intuição, propósito, direção
  | 'missaoDestino'       // Espiritual: missão, destino, transcendência
  | 'desafiosSombras';    // Transformação: sombras, karma, superação

// ─── Frequência (Gene Keys inspired) ───────────────────────────────────────

export type FrequencyLevel = 'shadow' | 'gift' | 'siddhi';

// ─── Decision Framework (Human Design inspired) ─────────────────────────────

export type AkashaStrategy = 'act' | 'wait' | 'observe';
export type AkashaAuthority = 'emotional' | 'sacral' | 'splenic' | 'mental';

export interface DailyDecision {
  strategy: AkashaStrategy;
  strategyExplanation: string;
  authority: AkashaAuthority;
  authorityQuestion: string;
  recommendation: string;
  avoid: string;
}

// ─── F-227: ONE Akasha Profile Type System ──────────────────────────────────

export interface AkashaTypeProfile {
  type: string;
  typeName: string;
  typeIcon: string;
  corePattern: string;
  strategy: string;
  strategyDetail: string;
  authority: AkashaAuthority;
  authorityPractice: string;
  dailyDirective: string;
  oneLiner: string;
  /** @internal Dimensão que mais contribui para este tipo */
  dimensionOrigin?: string | null;
  growthEdge: string;
  shadowTrap: string;
}

// ─── F-225: Sexualidade Profunda ────────────────────────────────────────────

export interface SexualFantasy {
  archetype: string;
  description: string;
  trigger: string;
}

export interface SexualFetish {
  type: string;
  description: string;
  chakraRelated: string;
}

export interface SexualHiddenDesire {
  desire: string;
  fear: string;
  healing: string;
}

export interface SexualArchetype {
  name: string;
  description: string;
  bodyTantric: string;
  desirePattern: string;
  fantasy: SexualFantasy;
  fetishes: SexualFetish[];
  hiddenDesires: SexualHiddenDesire[];
  turnOn: string[];
  turnOff: string[];
  relationshipPattern: string;
  transformationKey: string;
}

// ─── F-224: Trânsito Diário por Área ────────────────────────────────────────

export interface TransitAspectOverlay {
  planet: string;
  aspect: string;
  energy: 'harmonioso' | 'desafiador' | 'neutro';
  description: string;
  recommendation: string;
}

export interface DailyTransitOverlay {
  astrologiaTransito: TransitAspectOverlay[];
  oduTransito: { odu: string; meaning: string; advice: string } | null;
  tantraEnergia: { element: string; quality: string; recommendation: string };
  todayPhrase: string;
}

// ─── Area Narrative ─────────────────────────────────────────────────────────

export interface AreaNarrative {
  area: LifeArea;
  title: string;
  frequency: FrequencyLevel;
  intensity: 1 | 2 | 3;
  shadowPattern: string;
  shadowSymptoms: string[];
  giftPattern: string;
  giftStrengths: string[];
  pillarContribution: {
    cabala: string;
    tantra: string;
    odus: string;
    astrologia: string;
  };
  practicalAdvice: string;
  dailyRitual: {
    title: string;
    instruction: string;
    duration: string;
    element: string;
    color: string;
  };
  transformationPrompt: string;
  dailyTransit?: DailyTransitOverlay;
  sexualidade?: SexualArchetype;
  expandedNarrative?: AreaNarrativeFull;
  chainOfReasoning?: string[];
}

// ─── Full Synthesis Output ─────────────────────────────────────────────────

export interface AkashaSynthesis {
  akashaProfile: {
    dominantFrequency: FrequencyLevel;
    overallFrequencyScore: number;
    transformationStage: 'surface' | 'deepening' | 'embodying';
    activeSequence: 'vitality' | 'heart' | 'purpose';
  };
  oneProfile?: AkashaTypeProfile;
  lifePath?: number;
  areas: Record<LifeArea, AreaNarrative>;
  dailyDecision: DailyDecision;
  synthesisParagraph: string;
  synthesizedProfile?: import('@akasha/core').SynthesizedProfile;
  transformationSequence?: {
    currentPhase: string;
    nextPhase: string;
    integrationNote: string;
  };
}

// Re-export from hologram-aggregator so consumers can import from a single place
export type { AkashicHologram };
