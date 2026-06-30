// ============================================================================
// RSVP FORM — PURE LOGIC HELPERS
// ----------------------------------------------------------------------------
// W80-B · 2026-06-30 · Cycle 80
// Pure functions extracted from RSVPForm.tsx so they can be tested in isolation
// without DOM. Owns:
//   - 7-tradition-aware labels (Cigano/Orixás/Astrologia/Cabala/Tantra/Umbanda/Ifá)
//   - RSVP state derivation (current + pending transition validation)
//   - Capacity math (remaining, percent full, "Lotado", "Sem limite")
//   - Event-type labels (workshop/ritual/study-circle/meditation)
//   - Status messages (pt-BR) for live region + screen readers
//
// These functions are intentionally pure (no Date.now() / Math.random()) and
// deterministic — same input → same output. Mutation-free. Object.freeze on
// every record before returning (cycle 75 lesson #6).
// ============================================================================

// ============================================================================
// TYPES
// ============================================================================

/** Tradição espiritual — exatamente 7 chaves canônicas cobertas no portal. */
export type TraditionId =
  | 'cigano'
  | 'orixas'
  | 'astrologia'
  | 'cabala'
  | 'tantra'
  | 'umbanda'
  | 'ifa';

/** Tipo de evento — cobre a taxonomia de W26. */
export type EventTypeId =
  | 'workshop'
  | 'ritual'
  | 'study-circle'
  | 'meditation';

/** Status do RSVP no engine (espelha EventRsvpStatus do Prisma, lowercase p/ UI). */
export type RsvpState = 'going' | 'maybe' | 'declined' | null;

/** Resultado de uma tentativa de transição de estado. */
export interface RsvpTransition {
  /** Próximo estado alvo. */
  readonly next: Exclude<RsvpState, null>;
  /** Mensagem para live region (pt-BR). */
  readonly announcement: string;
  /** Se a transição requer confirmação adicional (ex: cancelar de going). */
  readonly requiresConfirm: boolean;
  /** Se a transição vai bater na API (false = noop idempotente). */
  readonly willMutate: boolean;
}

/** Derivação de capacidade para exibição. */
export interface CapacityDisplay {
  /** Texto curto (ex: "14/20 vagas", "Lotado", "Sem limite"). */
  readonly label: string;
  /** Número atual (confirmedCount). */
  readonly confirmed: number;
  /** Capacidade máxima (0 = ilimitado). */
  readonly capacity: number;
  /** Vagas restantes (null se ilimitado). */
  readonly remaining: number | null;
  /** Percentual de ocupação (0..100). null se ilimitado. */
  readonly percent: number | null;
  /** Se o evento está completamente lotado. */
  readonly isFull: boolean;
}

// ============================================================================
// TRADITION LABELS (7 chaves canônicas)
// ============================================================================

/**
 * Mapa canônico tradição → label pt-BR. Ordenado alfabeticamente para
 * cobertura completa de todas as 7 tradições do portal.
 */
export const TRADITION_LABEL: Readonly<Record<TraditionId, string>> = Object.freeze({
  cigano: 'Baralho Cigano',
  orixas: 'Orixás',
  astrologia: 'Astrologia',
  cabala: 'Cabala',
  tantra: 'Tântrica',
  umbanda: 'Umbanda',
  ifa: 'Ifá',
});

/** Ordem canônica (alfabética) — usada em testes para iteração estável. */
export const TRADITION_IDS: ReadonlyArray<TraditionId> = Object.freeze([
  'astrologia',
  'cabala',
  'cigano',
  'ifa',
  'orixas',
  'tantra',
  'umbanda',
]);

/**
 * Tipo discriminado: verifica se uma string é uma das 7 tradições canônicas.
 * Retorna `null` para chaves desconhecidas (em vez de `false`) para que
 * callers possam fazer narrowing direto: `if (isTradition(s)) { ... s ... }`.
 */
export function isTradition(s: string | null | undefined): TraditionId | null {
  if (!s) return null;
  if (s in TRADITION_LABEL) return s as TraditionId;
  return null;
}

/** Label pt-BR com fallback seguro para tradições não canônicas. */
export function traditionLabel(t: string | null | undefined): string {
  const id = isTradition(t);
  if (id) return TRADITION_LABEL[id];
  // fallback genérico (não quebra UI)
  if (!t) return 'Tradição';
  return t.charAt(0).toUpperCase() + t.slice(1);
}

// ============================================================================
// EVENT TYPE LABELS
// ============================================================================

export const EVENT_TYPE_LABEL: Readonly<Record<EventTypeId, string>> = Object.freeze({
  workshop: 'Workshop',
  ritual: 'Ritual',
  'study-circle': 'Círculo de Estudo',
  meditation: 'Meditação Guiada',
});

export function isEventType(s: string | null | undefined): EventTypeId | null {
  if (!s) return null;
  if (s in EVENT_TYPE_LABEL) return s as EventTypeId;
  return null;
}

export function eventTypeLabel(t: string | null | undefined): string {
  const id = isEventType(t);
  if (id) return EVENT_TYPE_LABEL[id];
  if (!t) return 'Evento';
  return t.charAt(0).toUpperCase() + t.slice(1);
}

// ============================================================================
// CAPACITY MATH
// ============================================================================

/**
 * Deriva o display de capacidade a partir de contadores puros.
 * - capacity=0 → ilimitado
 * - confirmedCount >= capacity → lotado
 * - Caso contrário, mostra X/Y vagas
 */
export function buildCapacityDisplay(
  confirmedCount: number,
  capacity: number
): CapacityDisplay {
  const safeConfirmed = Math.max(0, Math.floor(confirmedCount));
  const safeCapacity = Math.max(0, Math.floor(capacity));

  // Caso ilimitado
  if (safeCapacity === 0) {
    return Object.freeze({
      label: 'Sem limite de vagas',
      confirmed: safeConfirmed,
      capacity: 0,
      remaining: null,
      percent: null,
      isFull: false,
    });
  }

  const isFull = safeConfirmed >= safeCapacity;
  const remaining = Math.max(0, safeCapacity - safeConfirmed);
  const percent = Math.min(100, Math.round((safeConfirmed / safeCapacity) * 100));

  let label: string;
  if (isFull) {
    label = `Lotado · ${safeConfirmed}/${safeCapacity}`;
  } else if (remaining === 1) {
    label = `Última vaga · ${safeConfirmed}/${safeCapacity}`;
  } else if (remaining <= 3) {
    label = `${remaining} vagas restantes · ${safeConfirmed}/${safeCapacity}`;
  } else {
    label = `${safeConfirmed}/${safeCapacity} vagas`;
  }

  return Object.freeze({
    label,
    confirmed: safeConfirmed,
    capacity: safeCapacity,
    remaining,
    percent,
    isFull,
  });
}

// ============================================================================
// RSVP STATE LABELS + TRANSITIONS
// ============================================================================

/**
 * Labels pt-BR para os 3 estados do engine (lowercase na API → apresentação).
 * Adicionalmente: estado "logged_out" para usuários não autenticados.
 */
export const RSVP_STATE_LABEL = Object.freeze({
  going: 'Confirmar presença',
  maybe: 'Lista de espera',
  declined: 'Recusar',
  logged_out: 'Entrar para participar',
});

export const RSVP_STATE_LABEL_ACTIVE = Object.freeze({
  going: 'Presença confirmada',
  maybe: 'Na lista de espera',
  declined: 'Recusado',
});

/** Ícones semânticos por estado (usado por aria-label + UI). */
export const RSVP_STATE_ICON = Object.freeze({
  going: 'check-circle',
  maybe: 'clock',
  declined: 'x-circle',
});

/**
 * Calcula a transição de RSVP a partir do estado atual e o estado alvo clicado.
 *
 * Regras:
 *   - going → declined: requer confirmação (cancelar)
 *   - going → maybe: requer confirmação (perder vaga)
 *   - maybe → going: NÃO requer confirmação (promoção)
 *   - declined → going: NÃO requer confirmação
 *   - null → going: NÃO requer confirmação (primeira vez)
 *   - state === target: NOOP idempotente (willMutate=false)
 *   - target inválido: erro
 */
export function deriveRsvpTransition(
  current: RsvpState,
  target: Exclude<RsvpState, null>
): RsvpTransition | { error: string } {
  if (target !== 'going' && target !== 'maybe' && target !== 'declined') {
    return { error: `Estado inválido: ${String(target)}` };
  }

  // NOOP idempotente
  if (current === target) {
    return Object.freeze({
      next: target,
      announcement: `Você já está como ${RSVP_STATE_LABEL_ACTIVE[target]}.`,
      requiresConfirm: false,
      willMutate: false,
    });
  }

  const baseAnnouncement = `Status atualizado para ${RSVP_STATE_LABEL_ACTIVE[target]}.`;

  // Regras de confirmação
  let requiresConfirm = false;
  if (current === 'going' && (target === 'declined' || target === 'maybe')) {
    requiresConfirm = true;
  }

  return Object.freeze({
    next: target,
    announcement: baseAnnouncement,
    requiresConfirm,
    willMutate: true,
  });
}

/** Estado "default" recomendado quando usuário não tem RSVP. */
export function defaultRsvpState(): Exclude<RsvpState, null> {
  return 'going';
}

// ============================================================================
// SCREEN READER ANNOUNCEMENTS
// ============================================================================

/**
 * Anúncio para live region (aria-live="polite") após mudança de estado.
 * Inclui contexto de capacidade para que o screen reader anuncie vagas.
 */
export function buildRsvpAnnouncement(
  transition: RsvpTransition,
  capacity: CapacityDisplay
): string {
  const base = transition.announcement;
  if (capacity.isFull) {
    return `${base} Evento lotado (${capacity.confirmed}/${capacity.capacity}).`;
  }
  if (capacity.remaining !== null) {
    return `${base} ${capacity.remaining} vagas restantes.`;
  }
  return `${base}`;
}

// ============================================================================
// AVAILABILITY CHECK
// ============================================================================

/**
 * Decide se um estado é selecionável dado o estado atual + capacidade.
 *
 * - Se capacity.isFull && target === 'going' && current !== 'going':
 *     'waitlist_required' (deve usar 'maybe' em vez de 'going')
 * - Se current === target: 'current' (desabilitado)
 * - Caso contrário: 'available'
 */
export type RsvpButtonAvailability =
  | 'available'
  | 'current'
  | 'waitlist_required'
  | 'event_closed';

export function getButtonAvailability(
  current: RsvpState,
  target: Exclude<RsvpState, null>,
  capacity: CapacityDisplay,
  eventClosed: boolean
): RsvpButtonAvailability {
  if (eventClosed) return 'event_closed';
  if (current === target) return 'current';
  if (target === 'going' && capacity.isFull) return 'waitlist_required';
  return 'available';
}
