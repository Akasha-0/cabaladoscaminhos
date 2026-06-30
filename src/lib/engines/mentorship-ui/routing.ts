// routing.ts — type-safe route params
// Cycle 82 lesson: param validation must be in pure helpers, not in components.

import type { RouteName, RouteState } from './pages.tsx';
import type { FiltroMentor } from '../../../components/mentorship/types.ts';
import type { BookingFormState } from '../../../components/mentorship/ui/BookingForm.ts';

const EMPTY_FILTRO: FiltroMentor = Object.freeze({
  tradicoes: [],
  specialties: [],
  apenasOnline: false,
});

const EMPTY_BOOKING: BookingFormState = Object.freeze({
  slotId: null,
  notas: '',
});

export function emptyFiltro(): FiltroMentor {
  return EMPTY_FILTRO;
}

export function emptyBookingState(): BookingFormState {
  return EMPTY_BOOKING;
}

export function listRoute(filtro: FiltroMentor): RouteState {
  return { name: 'list', filtro };
}

export function detailRoute(args: {
  mentorId: string;
  bookingState?: BookingFormState;
  submitting?: boolean;
  bookingError?: string | null;
  bookedSuccessfully?: boolean;
}): RouteState {
  return {
    name: 'detail',
    mentorId: args.mentorId,
    bookingState: args.bookingState ?? emptyBookingState(),
    submitting: args.submitting ?? false,
    bookingError: args.bookingError ?? null,
    bookedSuccessfully: args.bookedSuccessfully ?? false,
  };
}

export function minhasSessoesRoute(): RouteState {
  return { name: 'minhas-sessoes' };
}

export interface ParsedPath {
  readonly route: RouteName;
  readonly params: Readonly<Record<string, string>>;
}

export function parseMentorshipPath(path: string): ParsedPath | null {
  if (path === '/mentorship') {
    return { route: 'list', params: {} };
  }
  if (path.startsWith('/mentorship/sessions')) {
    return { route: 'minhas-sessoes', params: {} };
  }
  const detailMatch = path.match(/^\/mentorship\/([\w-]+)$/);
  if (detailMatch) {
    return {
      route: 'detail',
      params: { id: detailMatch[1]! },
    };
  }
  return null;
}

export function buildMentorshipPath(
  route: RouteName,
  params: Readonly<Record<string, string>> = {}
): string {
  if (route === 'list') return '/mentorship';
  if (route === 'minhas-sessoes') return '/mentorship/sessions';
  const id = params.id;
  if (!id) return '/mentorship';
  return '/mentorship/' + id;
}
