// ============================================================================
// W87-B — Mentorship Pairing · factory
// ----------------------------------------------------------------------------
// Fachada de alto nível. Recebe um `MentorshipAdapter` e expõe:
//   - listAvailableMentors (com filtros)
//   - findPairings (score-based, topN)
//   - createPairingRequest (LGPD obrigatório)
//   - accept/decline/completePairing (state machine)
//
// Decisões:
//   - LGPD consent é obrigatório no createPairingRequest
//   - Mensagem precisa ter 10..1000 chars
//   - Duplicidade: bloqueia se já existe pending/accepted entre mesmo par
//   - State machine: pending → {accepted, declined} | accepted → completed
//   - findPairings SEMPRE exclui mentores com acceptMentees=false
// ============================================================================

import {
  LGPD_VERSION,
  LEVEL_ORDER,
  MESSAGE_MAX_LEN,
  MESSAGE_MIN_LEN,
  PLAUSIBLE_THRESHOLD,
  SCORE_WEIGHTS,
  STUDY_AREA_MATCH_CAP,
  pairingId,
  type CreatePairingResult,
  type MentorFilter,
  type MentorId,
  type MentorProfile,
  type MenteeId,
  type MenteeProfile,
  type MentorshipAdapter,
  type MentorshipEngine,
  type PairingId,
  type PairingRequest,
  type PairingScore,
  type PairingStatus,
  type TransitionResult,
} from './types';

// ============================================================
// Helpers
// ============================================================

function nowIso(): string {
  return new Date().toISOString();
}

function newPairingId(): PairingId {
  return pairingId(
    `pair-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  );
}

function clampScore(n: number): number {
  if (!Number.isFinite(n)) return 0;
  if (n < 0) return 0;
  if (n > 100) return 100;
  return Math.round(n);
}

/**
 * Diferença de fuso entre dois timezones IANA em horas (arredondado).
 * Implementação determinística baseada em offset de uma data de referência.
 * Usa 2026-07-01T12:00Z (meio do ano, fora de horário de verão conflitante).
 *
 * @returns horas (signed) — positivo = mentor ahead do mentee
 */
function tzDiffHours(
  mentorTz: string,
  menteeTz: string,
  refIso = '2026-07-01T12:00:00.000Z',
): number {
  // Fallback seguro se o ambiente não suportar Intl — assume mesmo fuso
  try {
    const refUtc = new Date(refIso);
    const mentorOffset = getTzOffsetMinutes(mentorTz, refUtc);
    const menteeOffset = getTzOffsetMinutes(menteeTz, refUtc);
    return Math.round((mentorOffset - menteeOffset) / 60);
  } catch {
    return 0;
  }
}

function getTzOffsetMinutes(tz: string, refUtc: Date): number {
  // dtf format para extrair offset do tz em uma data específica
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    timeZoneName: 'shortOffset',
  });
  const parts = dtf.formatToParts(refUtc);
  const tzPart = parts.find((p) => p.type === 'timeZoneName');
  if (!tzPart) return 0;
  // Formato típico: "GMT-3", "GMT+5:30"
  const m = /GMT([+-])(\d{1,2})(?::(\d{2}))?/.exec(tzPart.value);
  if (!m) return 0;
  const sign = m[1] === '-' ? -1 : 1;
  const h = Number(m[2] || 0);
  const min = Number(m[3] || 0);
  return sign * (h * 60 + min);
}

// ============================================================
// Score calculator (puro, exposto para testes)
// ============================================================================

/**
 * Calcula o score de pareamento entre um mentor e um mentee.
 *
 * Pesos (vide SCORE_WEIGHTS):
 *   - tradição match: +30
 *   - cada study area em comum (até STUDY_AREA_MATCH_CAP): +10/match
 *   - language overlap: +15
 *   - timezone diff < 3h: +10
 *   - mentor.level >= mentee.level: +5 (level guard)
 *   - mentee.level > mentor.level: -10 (level overflow penalty)
 *   - timezone diff > 3h: -3/h excedente
 *
 * Retorna PairingScore com motivos em ordem (para auditabilidade).
 */
export function computePairingScore(
  mentor: MentorProfile,
  mentee: MenteeProfile,
): PairingScore {
  const reasons: string[] = [];
  let score = 0;

  // 1. Tradição
  if (mentor.tradição === mentee.tradiçãoEscolhida) {
    score += SCORE_WEIGHTS.tradiçãoMatch;
    reasons.push(`+${SCORE_WEIGHTS.tradiçãoMatch} tradição match (${mentor.tradição})`);
  }

  // 2. Study area overlap (cap)
  const menteeSet = new Set<MenteeProfile['interests'][number]>(mentee.interests);
  const overlap = mentor.studyAreas.filter((s) => menteeSet.has(s));
  const countedOverlap = Math.min(overlap.length, STUDY_AREA_MATCH_CAP);
  if (countedOverlap > 0) {
    const add = countedOverlap * SCORE_WEIGHTS.studyAreaPerMatch;
    score += add;
    reasons.push(
      `+${add} study overlap (${countedOverlap}× ${SCORE_WEIGHTS.studyAreaPerMatch})`,
    );
  }

  // 3. Language overlap
  const mentorLangSet = new Set(mentor.languages);
  const langOverlap = mentee.languages.filter((l) => mentorLangSet.has(l));
  if (langOverlap.length > 0) {
    score += SCORE_WEIGHTS.languageMatch;
    reasons.push(`+${SCORE_WEIGHTS.languageMatch} idioma compartilhado (${langOverlap.join(', ')})`);
  }

  // 4. Timezone
  const diffHours = Math.abs(tzDiffHours(mentor.timezone, mentee.timezone));
  if (diffHours < 3) {
    score += SCORE_WEIGHTS.timezoneClose;
    reasons.push(`+${SCORE_WEIGHTS.timezoneClose} fuso próximo (${diffHours}h diff)`);
  } else {
    const overHours = diffHours - 3;
    const penalty = overHours * SCORE_WEIGHTS.timezoneOverflowPerHour;
    score += penalty;
    reasons.push(`${penalty} fuso distante (${diffHours}h diff)`);
  }

  // 5. Level guard
  const mentorLevelN = LEVEL_ORDER[mentor.level];
  const menteeLevelN = LEVEL_ORDER[mentee.level];
  if (mentorLevelN >= menteeLevelN) {
    score += SCORE_WEIGHTS.levelGuard;
    reasons.push(
      `+${SCORE_WEIGHTS.levelGuard} level guard (mentor ${mentor.level} ≥ mentee ${mentee.level})`,
    );
  } else {
    score += SCORE_WEIGHTS.levelOverflow;
    reasons.push(
      `${SCORE_WEIGHTS.levelOverflow} level overflow (mentor ${mentor.level} < mentee ${mentee.level})`,
    );
  }

  const finalScore = clampScore(score);
  return {
    mentorId: mentor.id,
    score: finalScore,
    reason: Object.freeze(reasons),
    isPlausible: finalScore >= PLAUSIBLE_THRESHOLD,
  };
}

// ============================================================
// Filter compose
// ============================================================================

/**
 * Aplica filtros client-side sobre uma lista de mentores.
 * Mantido fora do adapter para permitir composição UI-side sem
 * round-trip ao backend (pattern W86-B).
 */
export function applyMentorFilter(
  mentors: ReadonlyArray<MentorProfile>,
  filter: MentorFilter | undefined,
): ReadonlyArray<MentorProfile> {
  if (!filter) return mentors;
  return mentors.filter((m) => {
    if (filter.tradição && m.tradição !== filter.tradição) return false;
    if (filter.studyArea && !m.studyAreas.includes(filter.studyArea)) return false;
    if (filter.language && !m.languages.includes(filter.language)) return false;
    if (filter.level && m.level !== filter.level) return false;
    if (filter.onlyAccepting !== false && !m.acceptMentees) return false;
    return true;
  });
}

// ============================================================
// State machine — transições válidas
// ============================================================================

const VALID_TRANSITIONS: Readonly<Record<PairingStatus, ReadonlyArray<PairingStatus>>> =
  Object.freeze({
    pending: Object.freeze<PairingStatus[]>(['accepted', 'declined']),
    accepted: Object.freeze<PairingStatus[]>(['completed', 'declined']),
    declined: Object.freeze<PairingStatus[]>([]),
    completed: Object.freeze<PairingStatus[]>([]),
  });

function canTransition(from: PairingStatus, to: PairingStatus): boolean {
  return VALID_TRANSITIONS[from].includes(to);
}

// ============================================================
// Factory principal
// ============================================================================

export function createMentorshipEngine(adapter: MentorshipAdapter): MentorshipEngine {
  return {
    async listAvailableMentors(filter) {
      const all = await adapter.listMentors();
      return applyMentorFilter(all, filter ?? { onlyAccepting: true });
    },

    async getMentor(id) {
      return adapter.getMentor(id);
    },

    async findPairings(mentee, topN = 5) {
      const mentors = await adapter.listMentors();
      // Só pareamos com quem aceita
      const accepting = mentors.filter((m) => m.acceptMentees);
      const scored = accepting.map((m) => computePairingScore(m, mentee));
      // Ordem desc por score, depois por displayName do mentor (determinístico)
      scored.sort((a, b) => {
        if (a.score !== b.score) return b.score - a.score;
        return a.mentorId.localeCompare(b.mentorId);
      });
      return scored.slice(0, Math.max(1, topN));
    },

    async createPairingRequest({ menteeId, mentorId, message, lgpdConsent }) {
      // 1. LGPD consent obrigatório
      if (!lgpdConsent) {
        return {
          kind: 'lgpd_missing',
          message: `É necessário aceitar o termo de consentimento LGPD (versão ${LGPD_VERSION}) para enviar a solicitação de mentoria.`,
        };
      }

      // 2. Mensagem válida
      const trimmed = message.trim();
      if (trimmed.length < MESSAGE_MIN_LEN) {
        return {
          kind: 'message_required',
          message: `A mensagem inicial deve ter ao menos ${MESSAGE_MIN_LEN} caracteres.`,
        };
      }
      if (trimmed.length > MESSAGE_MAX_LEN) {
        return {
          kind: 'message_required',
          message: `A mensagem inicial deve ter no máximo ${MESSAGE_MAX_LEN} caracteres.`,
        };
      }

      // 3. Mentee existe?
      const mentee = await adapter.getMentee(menteeId);
      if (!mentee) {
        return {
          kind: 'mentee_not_found',
          message: 'Perfil de mentee não encontrado.',
        };
      }

      // 4. Mentor existe?
      const mentor = await adapter.getMentor(mentorId);
      if (!mentor) {
        return {
          kind: 'mentor_not_found',
          message: 'Perfil de mentor não encontrado.',
        };
      }

      // 5. Mentor aceita novos mentees?
      if (!mentor.acceptMentees) {
        return {
          kind: 'mentor_not_accepting',
          message: 'Este mentor não está aceitando novos mentees no momento.',
        };
      }

      // 6. Duplicidade (mesmo par + status ativo)
      const existing = await adapter.listPairingRequests({ menteeId });
      const activeDup = existing.find(
        (r) =>
          r.mentorId === mentorId &&
          (r.status === 'pending' || r.status === 'accepted'),
      );
      if (activeDup) {
        return {
          kind: 'duplicate',
          message: 'Você já tem uma solicitação ativa com este mentor.',
        };
      }

      const req: PairingRequest = {
        id: newPairingId(),
        menteeId,
        mentorId,
        status: 'pending',
        message: trimmed,
        lgpdConsent,
        createdAt: nowIso(),
      };
      await adapter.savePairingRequest(req);
      return { kind: 'success', message: 'Solicitação criada.', pairing: req };
    },

    async acceptPairing(id) {
      return transitionStatus(adapter, id, 'accepted');
    },

    async declinePairing(id) {
      return transitionStatus(adapter, id, 'declined');
    },

    async completePairing(id) {
      return transitionStatus(adapter, id, 'completed');
    },

    async listPairingRequests(filter) {
      return adapter.listPairingRequests(filter);
    },
  };
}

// ============================================================
// State transition helper (interno)
// ============================================================================

async function transitionStatus(
  adapter: MentorshipAdapter,
  id: PairingId,
  to: PairingStatus,
): Promise<TransitionResult> {
  const all = await adapter.listPairingRequests();
  const target = all.find((r) => r.id === id);
  if (!target) {
    return { ok: false, message: 'Solicitação não encontrada.' };
  }
  if (!canTransition(target.status, to)) {
    return {
      ok: false,
      message: `Transição inválida: ${target.status} → ${to}.`,
    };
  }
  const updated: PairingRequest = {
    ...target,
    status: to,
    updatedAt: nowIso(),
  };
  await adapter.updatePairingRequest(updated);
  return { ok: true, message: `Status atualizado para ${to}.`, pairing: updated };
}

// ============================================================
// Re-exports
// ============================================================================

export * from './types';
export { InMemoryMentorshipAdapter } from './adapter-memory';
