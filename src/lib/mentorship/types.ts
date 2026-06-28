// ============================================================================
// MENTORSHIP — UI-specific types (filters, language, topic)
// ============================================================================
// These are UI-layer types that extend the API DTOs in
// src/hooks/useMentorship.ts. They exist here to keep the API contract
// stable while letting us evolve the discovery/filtering UX.
//
// Wave 20 Worker D — 2026-06-28
// ============================================================================

/**
 * Canonical tradition slugs used by the API + UI.
 * Mirrors `TRADITION_FILTERS` in src/app/(community)/mentorship/page.tsx.
 */
export type TraditionSlug =
  | 'cabala'
  | 'ifa'
  | 'astrologia'
  | 'tantra'
  | 'reiki'
  | 'meditacao'
  | 'xamanismo'
  | 'cristianismo-mistico'
  | 'sufismo'
  | 'taoismo'
  | 'umbanda'
  | 'candomble'
  | 'ayahuasca';

/** Languages a mentor can speak. PT-BR default. */
export type Language = 'pt-BR' | 'en' | 'es';

/**
 * Topics a mentor can specialize in. Topics cut across traditions
 * (e.g. "chakras" appears in Tantra + Hindu traditions).
 */
export type Topic =
  | 'axe'
  | 'orixas'
  | 'chakras'
  | 'tarot-cigano'
  | 'cabala'
  | 'astrologia'
  | 'runas'
  | 'meditacao'
  | 'reiki'
  | 'umbanda'
  | 'candomble'
  | 'ifa'
  | 'tantra'
  | 'xamanismo'
  | 'kundalini'
  | 'numerologia'
  | 'mesa-real';

/**
 * Display metadata for a single filter chip.
 */
export interface ChipOption<V extends string> {
  value: V;
  label: string;
  emoji?: string;
  /** Optional accent class (Tailwind) for the active state. */
  accentClass?: string;
}

/**
 * Filter state for the discover page (chips-based).
 */
export interface MentorFilters {
  tradition: TraditionSlug | '';
  languages: Language[];
  topics: Topic[];
  query: string;
}

/**
 * Extended mentor profile for the profile page (separate from the
 * list-page MentorDto — this is a richer, future-federated shape).
 *
 * Today the API only returns a subset of these fields; consumers
 * should treat optional fields as best-effort.
 */
export interface MentorProfile {
  id: string;
  displayName: string;
  bio: string | null;
  traditions: TraditionSlug[];
  languages: Language[];
  topics: Topic[];
  rating: number;
  completed: number;
  isAvailable: boolean;
  /** Years of practice (display-only, optional). */
  yearsPracticing?: number;
  /** City / region (optional, display-only). */
  region?: string | null;
  /** Approximate response time (display-only, optional). */
  responseTime?: string | null;
}

/**
 * Empty/initial filter state — exported for component reset flows.
 */
export const EMPTY_FILTERS: MentorFilters = {
  tradition: '',
  languages: [],
  topics: [],
  query: '',
};

/**
 * Default language (PT-BR) — used when no preference is set.
 */
export const DEFAULT_LANGUAGE: Language = 'pt-BR';

/**
 * Canonical chip definitions for the discover page.
 * Re-exported by FilterChips.tsx to keep the page header readable.
 */
export const TRADITION_CHIPS: ChipOption<TraditionSlug | ''>[] = [
  { value: '', label: 'Todas', emoji: '🌌' },
  { value: 'cabala', label: 'Cabala', emoji: '✡️' },
  { value: 'candomble', label: 'Candomblé', emoji: '🌍' },
  { value: 'umbanda', label: 'Umbanda', emoji: '🪘' },
  { value: 'ifa', label: 'Ifá', emoji: '🪶' },
  { value: 'tantra', label: 'Tantra', emoji: '🕉️' },
  { value: 'astrologia', label: 'Astrologia', emoji: '♈' },
  { value: 'ayahuasca', label: 'Ayahuasca', emoji: '🍃' },
  { value: 'xamanismo', label: 'Xamanismo', emoji: '🌿' },
  { value: 'meditacao', label: 'Meditação', emoji: '🧘' },
  { value: 'reiki', label: 'Reiki', emoji: '🔆' },
  { value: 'cristianismo-mistico', label: 'Cristianismo Místico', emoji: '✝️' },
  { value: 'sufismo', label: 'Sufismo', emoji: '☪️' },
  { value: 'taoismo', label: 'Taoísmo', emoji: '☯️' },
];

export const LANGUAGE_CHIPS: ChipOption<Language>[] = [
  { value: 'pt-BR', label: 'Português' },
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
];

export const TOPIC_CHIPS: ChipOption<Topic>[] = [
  { value: 'axe', label: 'Axé' },
  { value: 'orixas', label: 'Orixás' },
  { value: 'chakras', label: 'Chakras' },
  { value: 'kundalini', label: 'Kundalini' },
  { value: 'tarot-cigano', label: 'Tarot Cigano' },
  { value: 'cabala', label: 'Cabala' },
  { value: 'astrologia', label: 'Astrologia' },
  { value: 'numerologia', label: 'Numerologia' },
  { value: 'runas', label: 'Runas' },
  { value: 'mesa-real', label: 'Mesa Real' },
  { value: 'meditacao', label: 'Meditação' },
  { value: 'reiki', label: 'Reiki' },
  { value: 'umbanda', label: 'Umbanda' },
  { value: 'candomble', label: 'Candomblé' },
  { value: 'ifa', label: 'Ifá' },
  { value: 'tantra', label: 'Tantra' },
  { value: 'xamanismo', label: 'Xamanismo' },
];
