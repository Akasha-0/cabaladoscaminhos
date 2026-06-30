// types.ts — Mentor, Sessao, Slot, FiltroMentor, Tradição enum
// Pure types. No runtime side effects.

export type Tradicao =
  | 'cigano'
  | 'orixas'
  | 'astrologia'
  | 'cabala'
  | 'numerologia'
  | 'tantra'
  | 'tarot';

export const TRADICOES: ReadonlyArray<Tradicao> = Object.freeze([
  'cigano',
  'orixas',
  'astrologia',
  'cabala',
  'numerologia',
  'tantra',
  'tarot',
] as const);

export interface Mentor {
  readonly id: string;
  readonly nome: string;
  readonly tradicaoPrincipal: Tradicao;
  readonly specialties: ReadonlyArray<string>;
  readonly bio: string;
  readonly rating: number;
  readonly sessoesCompletas: number;
  readonly precoBRL: number;
  readonly cidade?: string;
  readonly atendeOnline: boolean;
  readonly linguas: ReadonlyArray<'pt-BR' | 'en' | 'es'>;
}

export interface Slot {
  readonly id: string;
  readonly mentorId: string;
  readonly inicio: string; // ISO datetime
  readonly fim: string; // ISO datetime
  readonly duracaoMin: number;
}

export type StatusSessao =
  | 'agendada'
  | 'concluida'
  | 'cancelada'
  | 'no_show';

export interface Sessao {
  readonly id: string;
  readonly mentorId: string;
  readonly slotId: string;
  readonly usuarioId: string;
  readonly inicio: string; // ISO datetime
  readonly status: StatusSessao;
  readonly notas?: string;
  readonly gravacaoUrl?: string;
}

export interface FiltroMentor {
  readonly tradicoes: ReadonlyArray<Tradicao>;
  readonly specialties: ReadonlyArray<string>;
  readonly busca?: string;
  readonly apenasOnline: boolean;
  readonly precoMaxBRL?: number;
  readonly ratingMin?: number;
}

export interface ResultadoBooking {
  readonly sessao: Sessao;
  readonly mentor: Mentor;
  readonly slot: Slot;
}
