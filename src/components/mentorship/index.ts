// index.ts — public exports for the mentorship package

// Types
export type {
  Mentor,
  Sessao,
  Slot,
  FiltroMentor,
  Tradicao,
  StatusSessao,
  ResultadoBooking,
} from './types.ts';
export { TRADICOES } from './types.ts';

// Constants
export {
  TRADICAO_LABELS,
  TRADICAO_DESCRICOES,
  TRADICAO_BADGE_COLORS,
  SAMPLE_MENTORES,
  SAMPLE_SLOTS,
  ALL_SPECIALTIES,
  mentorsPorTradicao,
} from './constants.ts';

// Adapter
export {
  createInMemoryMentorshipAdapter,
  defaultMentorshipAdapter,
} from './mentorship-adapter.ts';
export type { MentorshipAdapter } from './mentorship-adapter.ts';

// UI
export { MentorCard } from './ui/MentorCard.tsx';
export { FilterBar } from './ui/FilterBar.tsx';
export { MentorListPage } from './ui/MentorListPage.tsx';
export { MentorDetailPage } from './ui/MentorDetailPage.tsx';
export { MinhasSessoesPage } from './ui/MinhasSessoesPage.tsx';
export { SessaCard } from './ui/SessaCard.tsx';
export { BookingForm } from './ui/BookingForm.tsx';
export type { BookingFormProps, BookingFormState } from './ui/BookingForm.tsx';
