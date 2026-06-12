/**
 * @akasha/core — Tipos de Ritual
 * 
 * Modelos para o ritual diário do Akasha OS.
 * Conecta código Akasha com componentes de prática espiritual.
 */

export type { AkashaCode } from './correlation-engine';
import type { AkashaCode } from './correlation-engine';
import type { IntegrativePractice, HexagramWithWings } from '../../core-iching/src/types';

// ─── Componentes do Ritual ────────────────────────────────────────────────────

/** Componentes ativos do ritual. */
export interface RitualComponentes {
  codigoDoDia: boolean;
  praticaPrincipal: boolean;
  quizilas: boolean;
  afirmacao: boolean;
}

/** Configuração do ritual diário. */
export interface RitualConfig {
  horario: string;           // HH:MM - horário configurável
  timezone: string;           // Timezone do usuário (ex: "America/Sao_Paulo")
  ativo: boolean;
  componentes: RitualComponentes;
}

// ─── Quizila ──────────────────────────────────────────────────────────────────

/** Quizila — preceito/restrição do Odu. */
export interface Quizila {
  id: string;
  texto: string;
  tipo: 'proibicao' | 'restricao' | 'orientacao';
}

// ─── Código do Ritual ────────────────────────────────────────────────────────

/** Código do ritual — hexagrama, Odu opcional e nível. */
export interface RitualCode {
  hexagrama: HexagramWithWings;
  odu?: {
    id: number;
    name: string;
    quizilas: string[];
  };
  nivel: 'shadow' | 'gift' | 'siddhi';
}

// ─── Resposta do Ritual ───────────────────────────────────────────────────────

/** Resposta completa do ritual diário. */
export interface RitualResponse {
  data: Date;
  codigo: {
    hexagrama: HexagramWithWings;
    odu?: {
      id: number;
      name: string;
      quizilas: string[];
    };
    nivel: 'shadow' | 'gift' | 'siddhi';
  };
  pratica: IntegrativePractice;
  quizilas: Quizila[];
  afirmacao: string;
  oracao: string;
}

// ─── Ritual Calculator ────────────────────────────────────────────────────────

/** Resultado do cálculo do código do dia. */
export interface CodeOfDayResult {
  code: AkashaCode;
  timestamp: number;
}
