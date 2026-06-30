// pages.tsx — pure functions returning React.createElement trees
// For the W82 mentorship-ui engine-adapter layer.
// Wraps the UI components into a cohesive page model.

import { h, type ComponentType } from '../../../components/react-stubs.js';
import type {
  FiltroMentor,
  Mentor,
  Sessao,
  Slot,
} from '../../../components/mentorship/types.tsx';
import { MentorListPage } from '../../../components/mentorship/ui/MentorListPage.tsx';
import { MentorDetailPage } from '../../../components/mentorship/ui/MentorDetailPage.tsx';
import { MinhasSessoesPage } from '../../../components/mentorship/ui/MinhasSessoesPage.tsx';
import type { BookingFormState } from '../../../components/mentorship/ui/BookingForm.tsx';

export type RouteName = 'list' | 'detail' | 'minhas-sessoes';

export interface ListRouteState {
  readonly name: 'list';
  readonly filtro: FiltroMentor;
}

export interface DetailRouteState {
  readonly name: 'detail';
  readonly mentorId: string;
  readonly bookingState: BookingFormState;
  readonly submitting: boolean;
  readonly bookingError: string | null;
  readonly bookedSuccessfully: boolean;
}

export interface MinhasSessoesRouteState {
  readonly name: 'minhas-sessoes';
}

export type RouteState =
  | ListRouteState
  | DetailRouteState
  | MinhasSessoesRouteState;

export interface PageContext {
  readonly mentores: ReadonlyArray<Mentor>;
  readonly slotsByMentor: Readonly<Record<string, ReadonlyArray<Slot>>>;
  readonly sessoes: ReadonlyArray<{
    readonly sessao: Sessao;
    readonly mentor: Mentor;
    readonly slot: Slot;
  }>;
}

export interface PageActions {
  readonly onChangeFiltro: (filtro: FiltroMentor) => void;
  readonly onSelectMentor: (id: string) => void;
  readonly onOpenMinhasSessoes: () => void;
  readonly onBack: () => void;
  readonly onChangeBooking: (next: BookingFormState) => void;
  readonly onSubmitBooking: () => void;
  readonly onCancelSessao: (sessaoId: string) => void;
  readonly onVerNotas: (sessaoId: string) => void;
  readonly onBrowse: () => void;
}

export interface RenderPageArgs {
  readonly route: RouteState;
  readonly ctx: PageContext;
  readonly actions: PageActions;
}

export function renderPage(args: RenderPageArgs): JSX.Element {
  const { route, ctx, actions } = args;
  if (route.name === 'list') {
    return h(MentorListPage, {
      mentores: ctx.mentores,
      filtro: route.filtro,
      onChangeFiltro: actions.onChangeFiltro,
      onSelectMentor: actions.onSelectMentor,
      onOpenMinhasSessoes: actions.onOpenMinhasSessoes,
    });
  }
  if (route.name === 'detail') {
    const mentor = ctx.mentores.find((m) => m.id === route.mentorId) ?? null;
    const slots = ctx.slotsByMentor[route.mentorId] ?? [];
    return h(MentorDetailPage, {
      mentor,
      slots,
      bookingState: route.bookingState,
      onChangeBooking: actions.onChangeBooking,
      onSubmitBooking: actions.onSubmitBooking,
      submitting: route.submitting,
      bookingError: route.bookingError,
      bookedSuccessfully: route.bookedSuccessfully,
      onBack: actions.onBack,
      onOpenMinhasSessoes: actions.onOpenMinhasSessoes,
    });
  }
  return h(MinhasSessoesPage, {
    items: ctx.sessoes,
    onBack: actions.onBack,
    onCancel: actions.onCancelSessao,
    onVerNotas: actions.onVerNotas,
    onBrowse: actions.onBrowse,
  });
}
