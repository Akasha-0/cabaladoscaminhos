'use client';

/**
 * AdaptiveContent — Wave 9.1
 *
 * The dispatcher. Reads the current EmotionalState and renders the
 * matching view. Pure presentational — state comes from the parent
 * (which got it from `useEmotionalState()`).
 *
 * Why a switch + map and not a dynamic import?
 *   - All four views are tiny (< 5KB each). Splitting buys nothing.
 *   - Switching is a literal `switch` — bundlers can tree-shake unused
 *     views in the future if size matters.
 *
 * The wrapper div carries `data-state` for analytics + e2e selectors.
 */

import type { EmotionalState } from '@/lib/state/emotional-state';

import type { AdaptiveViewData } from './shared';
import { CentradoView } from './centrado/CentradoView';
import { AnsiosoView } from './ansioso/AnsiosoView';
import { PerdidoView } from './perdido/PerdidoView';
import { CuriosoView } from './curioso/CuriosoView';

export interface AdaptiveContentProps {
  state: EmotionalState;
  locale: string;
  data?: AdaptiveViewData | null;
  loading?: boolean;
}

export function AdaptiveContent({ state, locale, data, loading }: AdaptiveContentProps) {
  return (
    <div data-state={state} data-testid="adaptive-content">
      {state === 'centrado' && (
        <CentradoView locale={locale} data={data} loading={loading} />
      )}
      {state === 'ansioso' && (
        <AnsiosoView locale={locale} data={data} loading={loading} />
      )}
      {state === 'perdido' && (
        <PerdidoView locale={locale} data={data} loading={loading} />
      )}
      {state === 'curioso' && (
        <CuriosoView locale={locale} data={data} loading={loading} />
      )}
    </div>
  );
}

export default AdaptiveContent;