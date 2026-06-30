'use client';

// ============================================================================
// LeaderboardWidget — Top 10 universalista (cycle 91 W91-B)
// ============================================================================
// Compact widget for the community sidebar / mobile home. Renders the top
// 10 entries with avatar, display name, primary tradition badge, and
// universalista score. Positive framing: "Reconhecimento universalista".
//
// Sacred-cultural compliance:
//   - 5 traditions rendered as BADGES (no ranking that pits traditions
//     against each other)
//   - Verbatim PT-BR labels: Candomblé, Umbanda, Ifá, Cabala, Astrologia
//   - Positive tone only: "Reconhecimento", "Contribuição"
//   - WCAG AA: contrast pair checked against slate-950 background
//
// Mobile-first: max-w-full mobile, sm:max-w-md tablet+.
// ============================================================================

import React, { useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sparkles, Crown } from 'lucide-react';
import {
  topN,
  asUserId,
  asDisplayName,
  asTraditionKey,
  asPageNumber,
  asPageSize,
  TRADICAO_BADGES,
  TRADICAO_ACCENT_CLASSES,
  type LeaderboardEntry,
  type ScoredEntry,
  type TraditionId,
} from '@/lib/w91/reputation-leaderboard-engine';
import { cn } from '@/lib/utils';

export interface LeaderboardWidgetProps {
  /** Pre-fetched entries (server-rendered). */
  readonly entries: ReadonlyArray<LeaderboardEntry>;
  /** Top-N to render. Default 10. */
  readonly top?: number;
  /** Optional tradition filter — show only entries from these traditions. */
  readonly traditions?: ReadonlyArray<TraditionId>;
  /** Title override. Default: "Reconhecimento universalista". */
  readonly title?: string;
  /** Subtitle override. */
  readonly subtitle?: string;
  /** Deep link to the full leaderboard page. */
  readonly viewAllHref?: string;
  /** Class for outer container. */
  readonly className?: string;
}

export function LeaderboardWidget({
  entries,
  top = 10,
  traditions,
  title = 'Reconhecimento universalista',
  subtitle = 'Top contribuições entre as tradições da casa',
  viewAllHref = '/community/leaderboard',
  className,
}: LeaderboardWidgetProps) {
  const scored = useMemo<ReadonlyArray<ScoredEntry>>(
    () =>
      topN(entries, top, undefined, traditions ? { traditions } : {}),
    [entries, top, traditions]
  );

  return (
    <Card
      data-testid="leaderboard-widget"
      aria-label={title}
      role="region"
      className={cn(
        'card-spiritual border-slate-800/60 bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-sm',
        className
      )}
    >
      <CardHeader className="pb-3 border-b border-slate-800/60">
        <h3 className="text-sm font-semibold bg-gradient-to-r from-amber-300 via-violet-300 to-sky-300 bg-clip-text text-transparent flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-300" aria-hidden="true" />
          {title}
        </h3>
        {subtitle ? (
          <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
        ) : null}
      </CardHeader>
      <CardContent className="pt-3 space-y-2 px-3">
        {scored.length === 0 ? (
          <p
            data-testid="leaderboard-widget-empty"
            className="text-xs text-slate-500 py-6 text-center"
          >
            Ainda sem contribuições reconhecidas. Sua jornada pode ser a próxima ✨
          </p>
        ) : (
          <ol
            className="space-y-2 list-none m-0 p-0"
            data-testid="leaderboard-widget-list"
            aria-label={`Top ${scored.length} contribuições universalistas`}
          >
            {scored.map((entry, idx) => (
              <LeaderboardRow
                key={entry.userId}
                entry={entry}
                rank={idx + 1}
              />
            ))}
          </ol>
        )}
        {viewAllHref ? (
          <Link
            href={viewAllHref}
            data-testid="leaderboard-widget-view-all"
            className="block text-center text-xs text-violet-300 hover:text-violet-200 mt-3 min-h-[44px] leading-[44px] focus:outline-none focus:ring-2 focus:ring-violet-400/60 rounded-md"
          >
            Ver classificação completa →
          </Link>
        ) : null}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Internal — Single row
// ============================================================================

interface LeaderboardRowProps {
  readonly entry: ScoredEntry;
  readonly rank: number;
}

function LeaderboardRow({ entry, rank }: LeaderboardRowProps) {
  const isTop = rank === 1;
  const initials = useMemo(() => {
    const parts = entry.displayName.trim().split(/\s+/);
    if (parts.length === 0) return '✦';
    if (parts.length === 1) {
      const first = parts[0] ?? '';
      return first.slice(0, 2).toUpperCase();
    }
    const first = parts[0]?.[0] ?? '';
    const last = parts[parts.length - 1]?.[0] ?? '';
    return (first + last).toUpperCase();
  }, [entry.displayName]);

  const accent =
    TRADICAO_ACCENT_CLASSES[entry.primaryTradition] ??
    'border-slate-700/50 bg-slate-800/40 text-slate-200';
  const badgeLabel =
    TRADICAO_BADGES[entry.primaryTradition] ?? entry.primaryTradition;

  return (
    <li
      data-testid={`leaderboard-widget-row-${rank}`}
      className="flex items-center gap-3 py-1.5 px-2 rounded-md hover:bg-slate-800/40 transition-colors min-h-[44px]"
    >
      <span
        className={cn(
          'flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shrink-0',
          isTop
            ? 'bg-amber-400/20 text-amber-200 ring-1 ring-amber-400/40'
            : 'bg-slate-800/80 text-slate-300'
        )}
        aria-label={`Posição ${rank}`}
      >
        {isTop ? <Crown className="w-3.5 h-3.5" aria-hidden="true" /> : rank}
      </span>
      <Avatar className="w-8 h-8 shrink-0">
        {entry.avatarUrl ? (
          <AvatarImage
            src={entry.avatarUrl}
            alt={`Avatar de ${entry.displayName}`}
          />
        ) : null}
        <AvatarFallback className="text-[10px] bg-slate-800 text-slate-200">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p
          className="text-sm text-slate-100 truncate"
          data-testid="leaderboard-widget-name"
        >
          {entry.displayName}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span
            className={cn(
              'inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] border',
              accent
            )}
            data-testid="leaderboard-widget-tradition-badge"
          >
            {badgeLabel}
          </span>
          {entry.traditionBreadth > 1 ? (
            <span
              className="text-[10px] text-slate-400"
              data-testid="leaderboard-widget-breadth"
              title={`Atuação em ${entry.traditionBreadth} tradições`}
            >
              · {entry.traditionBreadth} tradições
            </span>
          ) : null}
        </div>
      </div>
      <span
        className="text-sm font-bold text-amber-200 tabular-nums shrink-0"
        data-testid="leaderboard-widget-score"
        aria-label={`Pontuação ${entry.score}`}
      >
        {entry.score}
      </span>
    </li>
  );
}

export default LeaderboardWidget;