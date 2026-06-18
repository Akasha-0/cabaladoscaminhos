/**
 * Shared types for DeepCorrelationEngine
 * Duplicated from apps/akasha-portal/src/lib/application/ai/types.ts
 * to avoid cross-package type dependency
 */

export interface UserSpiritualData {
  id: string;
  nome: string;
  dataNascimento: string;
  numeroPessoal: number;
  arcoPessoal: number;
  odu: string;
  orixaRegente: string;
  sefirotDominante: string[];
  arcoMaior: number[];
  sign: string;
  houses: Record<string, number>;
  rashi: string;
  planetPositions?: Record<string, number>;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export type SpiritualSource =
  | 'kabbalah'
  | 'ifa'
  | 'candomble'
  | 'tarot'
  | 'astrology'
  | 'numerology';

export interface SpiritualCorrelation {
  source: SpiritualSource;
  target: string;
  correlation: number; // 0-1
  explanation: string;
  shared_energy: string;
}

export interface SystemCorrelation {
  source: SpiritualSystem;
  target: SpiritualSystem;
  correlationType: 'elemental' | 'numerical' | 'symbolic' | 'temporal';
  strength: number; // 0-1
  explanation: string;
}

export interface DetectedPattern {
  patternType: 'recurring_number' | 'elemental_imbalance' | 'karmic_theme' | 'spiritual_block';
  systems: string[];
  description: string;
  recommendation: string;
  urgency: 'low' | 'medium' | 'high';
}

export type SpiritualSystem =
  | 'kabbalah'
  | 'ifa'
  | 'candomble'
  | 'tarot'
  | 'astrology'
  | 'numerology'
  | 'chakra'
  | 'element'
  | 'temporal';

export interface CrossSystemPattern {
  name: string;
  description: string;
  strength: number; // 0-1
  involved_systems: SpiritualSource[];
  manifestations: string[];
}

export interface EnergyHarmonyReport {
  overall_score: number; // 0-1
  system_harmonies: Record<SpiritualSource, number>; // 0-1 per system
  dominant_energy: string;
  balance_indicators: {
    harmonious: string[];
    conflicting: string[];
    neutral: string[];
  };
  recommendations: string[];
}
