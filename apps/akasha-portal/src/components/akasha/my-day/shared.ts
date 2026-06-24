/**
 * Shared view props for the four adaptive views.
 *
 * All four views accept the same payload shape so <AdaptiveContent> can
 * `switch` on state and forward props blindly. This keeps the dispatch
 * table flat and makes it trivial to swap one view for another in tests.
 *
 * We deliberately re-declare a *minimal* shape rather than importing the
 * full `DailyContentUI` from `dashboard/hooks/useAkashaSynthesis.ts`. The
 * views shouldn't depend on the full daily endpoint — only the few fields
 * they actually render. This keeps the hub loose-coupled and easy to test.
 */

import type {
  DailyRitualUI,
  AkashaTypeProfileUI,
} from '@/components/akasha/dashboard/hooks/useAkashaSynthesis';

export interface AdaptiveViewData {
  /** Daily synthesis from /api/akasha/daily (when available). */
  climate?: string;
  ritual?: DailyRitualUI | null;
  /** The Akasha Type profile for today (strategy + authority + directive). */
  oneProfile?: AkashaTypeProfileUI | null;
  /** Short integration paragraph from the synthesis. */
  synthesisParagraph?: string | null;
}

export interface AdaptiveViewProps {
  locale: string;
  data?: AdaptiveViewData | null;
  loading?: boolean;
}