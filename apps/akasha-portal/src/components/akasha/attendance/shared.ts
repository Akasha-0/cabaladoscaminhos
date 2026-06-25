/**
 * Shared types for /atendimento (Wave 22.2)
 *
 * Tudo que é trocado entre <AttendanceClient> e os sub-componentes
 * (ClientCard, DiscoveryCard, ActionBar, EmotionalStateToggle) mora
 * aqui para evitar import cycle e dar um único ponto de tipagem.
 *
 * Convenções:
 *   - Tipos públicos começam com `Attendance*`.
 *   - IDs opacos (string ≤ 128 chars) — sem expor Prisma IDs internos.
 *   - Discriminated unions para "estado emocional" e "rating".
 */

import type { EmotionalState } from '@/lib/state/emotional-state';

// ─────────────────────────────────────────────────────────────────────────────
// Client (consulente)
// ─────────────────────────────────────────────────────────────────────────────

export interface AttendanceClient {
  /** ID opaco (≤ 128 chars). */
  id: string;
  /** Nome completo do consulente. */
  fullName: string;
  /** Idade (calculada a partir de birthDate no server). */
  age: number;
  /** Signo solar — string livre, formato "Escorpião". */
  sunSign: string;
  /** Cidade de nascimento (opcional, LGPD-friendly — pode ser omitida). */
  birthCity?: string | null;
  /** Estado emocional atual (Wave 9.1), persistido pelo Zelador. */
  emotionalState: EmotionalState;
}

// ─────────────────────────────────────────────────────────────────────────────
// Discovery (Wave 20.2)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Source pillar (5 Pilares + literatureRAG). UI consome apenas o ícone
 * e a cor — semânticas completas vivem em @akasha/core.
 */
export type DiscoverySource =
  | 'cabala'
  | 'astrologia'
  | 'tantra'
  | 'odu'
  | 'iching'
  | 'literature';

export interface AttendanceDiscovery {
  /** ID opaco. */
  id: string;
  /** Pilar de origem. */
  source: DiscoverySource;
  /** Título curto (≤ 80 chars). */
  title: string;
  /** Insight em si (1-3 frases). */
  excerpt: string;
  /** Referência simbólica (ex: "Iluminador · 11" ou "Hexagrama 29"). */
  symbolRef?: string;
  /** Score atual do InsightRanker (Wave 21.2). 0-1. */
  rankScore: number;
  /** Quando foi gerada (ISO). Usado pra ordenar e mostrar "há X min". */
  createdAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// ActionBar
// ─────────────────────────────────────────────────────────────────────────────

/** Rating — re-exportado de MessageRating para evitar import cycle. */
export type AttendanceRating = 'up' | 'down';

export interface AttendanceActionHandlers {
  /** Salvar a sessão inteira (POST /api/attendance — fora do escopo W22.2). */
  onSave?: () => void;
  /** Citar o discovery selecionado para o Diário do consulente. */
  onCite?: (discoveryId: string) => void;
  /** Marcar up/down em um discovery (POST /api/feedback). */
  onRate?: (discoveryId: string, rating: AttendanceRating) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Layout
// ─────────────────────────────────────────────────────────────────────────────

/** Tab ativa no mobile (≤ 480px). Desktop sempre mostra tudo em 2 colunas. */
export type AttendanceTab = 'cliente' | 'insights' | 'chat';
