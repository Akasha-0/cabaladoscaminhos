// mentorship-adapter.ts — InMemoryMentorshipAdapter
// Pure mock. No I/O. Mirrors W68 engine surface.
// Used by the UI for browse + booking + my-sessions flows.

import type {
  FiltroMentor,
  Mentor,
  ResultadoBooking,
  Sessao,
  Slot,
  Tradicao,
} from './types.ts';
import { SAMPLE_MENTORES, SAMPLE_SLOTS } from './constants.ts';

export interface MentorshipAdapter {
  listMentores(filtro?: FiltroMentor): ReadonlyArray<Mentor>;
  getMentor(id: string): Mentor | null;
  getSlots(mentorId: string): ReadonlyArray<Slot>;
  agendarSessao(args: {
    usuarioId: string;
    slotId: string;
    notas?: string;
  }): ResultadoBooking | { erro: string };
  cancelarSessao(args: {
    usuarioId: string;
    sessaoId: string;
  }): Sessao | { erro: string };
  listMinhasSessoes(args: {
    usuarioId: string;
    incluirPassadas?: boolean;
  }): ReadonlyArray<{ sessao: Sessao; mentor: Mentor; slot: Slot }>;
  marcarConcluida(args: {
    usuarioId: string;
    sessaoId: string;
    gravacaoUrl?: string;
  }): Sessao | { erro: string };
}

export function createInMemoryMentorshipAdapter(): MentorshipAdapter {
  // Mutable copies of seed data
  const mentores: Mentor[] = SAMPLE_MENTORES.map((m) => m);
  const slots: Slot[] = SAMPLE_SLOTS.map((s) => s);
  const sessoes: Sessao[] = [];
  let nextSessaoSeq = 1;

  function matchFiltro(m: Mentor, f: FiltroMentor | undefined): boolean {
    if (!f) return true;
    if (f.tradicoes && f.tradicoes.length > 0 && !f.tradicoes.includes(m.tradicaoPrincipal)) {
      return false;
    }
    if (f.specialties && f.specialties.length > 0) {
      const hasAny = f.specialties.some((s) => m.specialties.includes(s));
      if (!hasAny) return false;
    }
    if (f.apenasOnline && !m.atendeOnline) return false;
    if (typeof f.precoMaxBRL === 'number' && m.precoBRL > f.precoMaxBRL) return false;
    if (typeof f.ratingMin === 'number' && m.rating < f.ratingMin) return false;
    if (f.busca && f.busca.trim().length > 0) {
      const q = f.busca.toLowerCase();
      const inName = m.nome.toLowerCase().includes(q);
      const inBio = m.bio.toLowerCase().includes(q);
      const inSpec = m.specialties.some((s) => s.toLowerCase().includes(q));
      if (!(inName || inBio || inSpec)) return false;
    }
    return true;
  }

  function nowIso(): string {
    return new Date().toISOString();
  }

  return {
    listMentores(filtro?: FiltroMentor): ReadonlyArray<Mentor> {
      return Object.freeze(mentores.filter((m) => matchFiltro(m, filtro)).slice());
    },

    getMentor(id: string): Mentor | null {
      return mentores.find((m) => m.id === id) ?? null;
    },

    getSlots(mentorId: string): ReadonlyArray<Slot> {
      const now = new Date();
      return Object.freeze(
        slots
          .filter((s) => s.mentorId === mentorId && new Date(s.inicio) > now)
          .sort((a, b) => a.inicio.localeCompare(b.inicio))
          .slice()
      );
    },

    agendarSessao(args: {
      usuarioId: string;
      slotId: string;
      notas?: string;
    }): ResultadoBooking | { erro: string } {
      if (!args.usuarioId || args.usuarioId.length < 3) {
        return { erro: 'usuarioId inválido' };
      }
      const slotIdx = slots.findIndex((s) => s.id === args.slotId);
      if (slotIdx < 0) return { erro: 'slot não encontrado' };
      const slot = slots[slotIdx]!;
      const now = new Date();
      if (new Date(slot.inicio) <= now) {
        return { erro: 'slot já passou' };
      }
      // Prevent double-booking same slot
      const taken = sessoes.find(
        (sx) => sx.slotId === slot.id && (sx.status === 'agendada' || sx.status === 'concluida')
      );
      if (taken) return { erro: 'slot já reservado' };

      const mentor = mentores.find((m) => m.id === slot.mentorId);
      if (!mentor) return { erro: 'mentor do slot não encontrado' };

      const sessao: Sessao = {
        id: 'sx-' + (nextSessaoSeq++).toString().padStart(4, '0'),
        mentorId: mentor.id,
        slotId: slot.id,
        usuarioId: args.usuarioId,
        inicio: slot.inicio,
        status: 'agendada',
        notas: args.notas,
      };
      sessoes.push(sessao);
      return Object.freeze({ sessao, mentor, slot });
    },

    cancelarSessao(args: {
      usuarioId: string;
      sessaoId: string;
    }): Sessao | { erro: string } {
      const idx = sessoes.findIndex(
        (s) => s.id === args.sessaoId && s.usuarioId === args.usuarioId
      );
      if (idx < 0) return { erro: 'sessão não encontrada' };
      const sessao = sessoes[idx]!;
      if (sessao.status === 'cancelada') return { erro: 'já cancelada' };
      if (sessao.status === 'concluida') return { erro: 'sessão já concluída' };
      if (sessao.status === 'no_show') return { erro: 'sessão com no-show' };
      const updated: Sessao = { ...sessao, status: 'cancelada' };
      sessoes[idx] = updated;
      return Object.freeze(updated);
    },

    listMinhasSessoes(args: {
      usuarioId: string;
      incluirPassadas?: boolean;
    }): ReadonlyArray<{ sessao: Sessao; mentor: Mentor; slot: Slot }> {
      const now = new Date();
      const filtered = sessoes
        .filter((s) => s.usuarioId === args.usuarioId)
        .filter((s) => {
          if (args.incluirPassadas) return true;
          return new Date(s.inicio) >= now || s.status === 'agendada';
        })
        .map((sessao) => {
          const mentor = mentores.find((m) => m.id === sessao.mentorId)!;
          const slot = slots.find((sl) => sl.id === sessao.slotId)!;
          return { sessao, mentor, slot };
        })
        .sort((a, b) => a.sessao.inicio.localeCompare(b.sessao.inicio));
      return Object.freeze(filtered);
    },

    marcarConcluida(args: {
      usuarioId: string;
      sessaoId: string;
      gravacaoUrl?: string;
    }): Sessao | { erro: string } {
      const idx = sessoes.findIndex(
        (s) => s.id === args.sessaoId && s.usuarioId === args.usuarioId
      );
      if (idx < 0) return { erro: 'sessão não encontrada' };
      const sessao = sessoes[idx]!;
      if (sessao.status === 'cancelada') return { erro: 'sessão cancelada' };
      const updated: Sessao = {
        ...sessao,
        status: 'concluida',
        gravacaoUrl: args.gravacaoUrl,
      };
      sessoes[idx] = updated;
      return Object.freeze(updated);
    },
  };
}

// Default singleton for UI use
let _default: MentorshipAdapter | null = null;
export function defaultMentorshipAdapter(): MentorshipAdapter {
  if (!_default) _default = createInMemoryMentorshipAdapter();
  return _default;
}

// Helper: get tradicao from id
export function tradicoesFromFiltro(filtro: FiltroMentor): ReadonlyArray<Tradicao> {
  return filtro.tradicoes;
}
