// ============================================================================
// W86-D — Events/Workshops Engine · factory
// ----------------------------------------------------------------------------
// Fachada de alto nível. Recebe um `EventsAdapter` (memory | http | supabase)
// e expõe as regras de negócio:
//   - LGPD consent é obrigatório (versão `LGPD_VERSION`)
//   - Capacidade: se capacity > 0 e confirmed >= capacity → waitlist automático
//   - Cancelamento preserva histórico (status='cancelled', não delete)
//   - Eventos encerrados/cancelados não aceitam novos RSVPs
// ============================================================================

import type {
  CreateRSVPResult,
  EventId,
  EventStats,
  EventsAdapter,
  EventsEngine,
  RSVP,
  RSVPId,
  UserId,
} from './types';
import { LGPD_VERSION, RSVP_GUESTS_MAX, RSVP_GUESTS_MIN } from './types';

// ============================================================
// Helpers
// ============================================================

function nowIso(): string {
  return new Date().toISOString();
}

function newRSVPId(): RSVPId {
  // ID simples e determinístico o suficiente para o adapter in-memory
  return `rsvp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}` as RSVPId;
}

// ============================================================
// Estatísticas
// ============================================================

export async function computeEventStats(
  adapter: EventsAdapter,
  eventId: EventId
): Promise<EventStats | null> {
  const evt = await adapter.getEvent(eventId);
  if (!evt) return null;
  const rsvps = await adapter.listRSVPs(eventId);
  const confirmed = rsvps.filter((r) => r.status === 'confirmed').length;
  const waitlist = rsvps.filter((r) => r.status === 'waitlist').length;
  const cancelled = rsvps.filter((r) => r.status === 'cancelled').length;
  const isFull = evt.capacity > 0 && confirmed >= evt.capacity;
  const spotsLeft =
    evt.capacity === 0 ? Infinity : Math.max(0, evt.capacity - confirmed);
  return {
    eventId,
    capacity: evt.capacity,
    confirmed,
    waitlist,
    cancelled,
    isFull,
    spotsLeft,
  };
}

// ============================================================
// Factory
// ============================================================================

export function createEventsEngine(adapter: EventsAdapter): EventsEngine {
  return {
    async listEvents(filter) {
      return adapter.listEvents(filter);
    },

    async getEvent(id) {
      return adapter.getEvent(id);
    },

    async createRSVP(
      eventId,
      userId,
      userName,
      guests,
      lgpdConsent
    ): Promise<CreateRSVPResult> {
      // 1. LGPD consent é OBRIGATÓRIO
      if (!lgpdConsent) {
        return {
          kind: 'lgpd_missing',
          message: `É necessário aceitar a versão ${LGPD_VERSION} do termo de consentimento LGPD para confirmar presença.`,
        };
      }

      // 2. Validação de guests
      if (
        !Number.isInteger(guests) ||
        guests < RSVP_GUESTS_MIN ||
        guests > RSVP_GUESTS_MAX
      ) {
        return {
          kind: 'lgpd_missing', // reaproveita o mesmo canal de "form error" simples
          message: `Número de convidados deve estar entre ${RSVP_GUESTS_MIN} e ${RSVP_GUESTS_MAX}.`,
        };
      }

      // 3. Evento existe?
      const evt = await adapter.getEvent(eventId);
      if (!evt) {
        return { kind: 'event_not_found', message: 'Evento não encontrado.' };
      }

      // 4. Evento encerrado/cancelado?
      if (evt.status === 'ended') {
        return {
          kind: 'event_ended',
          message: 'Este evento já foi encerrado.',
        };
      }
      if (evt.status === 'cancelled') {
        return {
          kind: 'event_cancelled',
          message: 'Este evento foi cancelado pelo facilitador.',
        };
      }

      // 5. Duplicidade (mesmo userId + eventId)
      const existing = await adapter.listUserRSVPs(userId);
      const dup = existing.find(
        (r) =>
          r.eventId === eventId &&
          (r.status === 'confirmed' || r.status === 'waitlist')
      );
      if (dup) {
        return {
          kind: 'duplicate',
          message: 'Você já tem uma inscrição ativa neste evento.',
        };
      }

      // 6. Determina status — capacidade?
      const stats = await computeEventStats(adapter, eventId);
      const isFull = stats !== null && stats.isFull;
      const rsvpStatus: 'confirmed' | 'waitlist' = isFull ? 'waitlist' : 'confirmed';

      const rsvp: RSVP = {
        id: newRSVPId(),
        eventId,
        userId,
        userName,
        guests,
        status: rsvpStatus,
        lgpdConsent,
        createdAt: nowIso(),
      };

      await adapter.saveRSVP(rsvp);

      const finalStats = await computeEventStats(adapter, eventId);
      if (!finalStats) {
        return {
          kind: 'event_not_found',
          message: 'Evento não encontrado após criação do RSVP.',
        };
      }

      if (rsvpStatus === 'waitlist') {
        return { kind: 'waitlist', rsvp, stats: finalStats };
      }
      return { kind: 'success', rsvp, stats: finalStats };
    },

    async cancelRSVP(rsvpId) {
      // O adapter pode expor debugRSVPs (memory) ou um método interno equivalente.
      // Para não acoplar ao adapter, usamos listRSVPs por todos os eventos:
      // mas o adapter não expõe listAllEvents → usa o seedEvents em memória
      // e procura. Para o motor genérico, adicionamos um caminho via debug se existir.
      const adapterAny = adapter as unknown as {
        debugRSVPs?: () => ReadonlyArray<RSVP>;
      };
      if (typeof adapterAny.debugRSVPs !== 'function') {
        return {
          ok: false,
          message: 'Adapter não suporta cancelamento de RSVP.',
        };
      }
      const rsvps = adapterAny.debugRSVPs.call(adapter);
      const target = rsvps.find((r) => r.id === rsvpId);
      if (!target) {
        return { ok: false, message: 'Inscrição não encontrada.' };
      }
      if (target.status === 'cancelled') {
        return { ok: false, message: 'Inscrição já cancelada.' };
      }
      const updated: RSVP = { ...target, status: 'cancelled' };
      await adapter.updateRSVP(updated);
      return { ok: true, message: 'Inscrição cancelada.' };
    },

    async listUserRSVPs(userId) {
      return adapter.listUserRSVPs(userId);
    },

    async getEventStats(eventId) {
      return computeEventStats(adapter, eventId);
    },
  };
}

// Re-exporta tudo que pode ser útil fora do engine
export * from './types';
export { InMemoryEventsAdapter } from './adapter-memory';
