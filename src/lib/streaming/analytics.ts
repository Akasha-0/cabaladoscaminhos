// ============================================================================
// Streaming Analytics — Wave 39 (Video + Streaming 6/8)
// ============================================================================
// View + engagement metrics for live and VOD events.
//
// Metrics collected:
//   • Concurrent viewers (live)
//   • Watch time (live + VOD)
//   • Drop-off points (VOD, where viewers stop)
//   • Quality distribution (which HLS variant each viewer picked)
//   • Device types (mobile / desktop / tablet / TV)
//   • Geographic distribution (country + region, IP-anonymized)
//   • Chat engagement (msgs / minute, peak chat velocity)
//   • Reaction breakdown (heart / fire / sparkles / om / lotus count)
//   • Conversion funnel (RSVP → start watching → 5min retention → end)
//
// LGPD Art. 14 (informação): all analytics are aggregated; raw viewer
// tracking uses IP-anonymized session IDs (no fingerprinting).
//
// Storage: append-only events table. Aggregations pre-computed by the
// daily cron at /scripts/cron/daily-streaming-aggregation.ts.
// ============================================================================

/**
 * A single viewer session — emitted when the player starts, paused, or ended.
 */
export interface ViewerSession {
  readonly sessionId: string;       // anonymous, rotated per pageview
  readonly userId?: string;         // hashed, only if logged in
  readonly eventId: string;
  readonly videoId?: string;        // present for VOD, absent for live
  readonly kind: 'live' | 'vod';
  /** Wall-clock ISO start. */
  readonly startedAt: string;
  /** Wall-clock ISO end (filled when session ends). */
  readonly endedAt?: string;
  /** Watched seconds (active, not paused). */
  readonly watchedSeconds: number;
  /** Last HLS variant index (highest quality selected by ABR). */
  readonly lastVariantIndex?: number;
  /** PiP / fullscreen / casting milestones. */
  readonly milestones: ReadonlyArray<'pip' | 'fullscreen' | 'cast' | 'airplay'>;
  /** User-agent derived device category. */
  readonly deviceCategory: 'mobile' | 'desktop' | 'tablet' | 'tv' | 'unknown';
  /** Country derived from IP (anonymized; never the raw IP). */
  readonly countryCode?: string;
  /** Region / state derived from IP. */
  readonly regionCode?: string;
}

/**
 * Aggregate per-event statistics. Returned by /api/streaming/[eventId]/viewers
 * and used to drive the host dashboard.
 */
export interface EventAnalytics {
  readonly eventId: string;
  readonly title: string;
  readonly isLive: boolean;
  readonly concurrentViewers: number;
  readonly peakConcurrentViewers: number;
  readonly totalUniqueViewers: number;
  readonly totalWatchedHours: number;
  readonly avgWatchedMinutes: number;
  readonly deviceSplit: Readonly<Record<ViewerSession['deviceCategory'], number>>;
  readonly topCountries: ReadonlyArray<{ code: string; viewers: number }>;
  readonly variantSplit: ReadonlyArray<{ variantIndex: number; viewers: number }>;
  readonly chatEngagement: {
    readonly totalMessages: number;
    readonly peakMessagesPerMinute: number;
    readonly uniqueContributors: number;
  };
  readonly reactionsBreakdown: Readonly<Record<string, number>>;
  /** 0-1 retention at 25%, 50%, 75%, 100% of the event. */
  readonly retentionCurve: readonly number[];
}

/**
 * Compute peak concurrency from a list of heartbeats.
 * Pure helper — called by both live + VOD aggregation.
 */
export function computePeakConcurrency(heartbeats: readonly { ts: number }[]): number {
  if (heartbeats.length === 0) return 0;
  // Slide a 60s window — count unique heartbeats in each.
  const sorted = [...heartbeats].sort((a, b) => a.ts - b.ts);
  let peak = 0;
  for (let i = 0; i < sorted.length; i++) {
    const winStart = sorted[i]!.ts;
    let count = 0;
    for (let j = i; j < sorted.length; j++) {
      if (sorted[j]!.ts - winStart < 60_000) count += 1;
      else break;
    }
    if (count > peak) peak = count;
  }
  return peak;
}

/**
 * Compute the retention curve from a list of "viewer completed at t=X"
 * milestones. Returns 0..1 indexed by [25%, 50%, 75%, 100%].
 */
export function computeRetentionCurve(
  totalViewers: number,
  completionsAtFraction: readonly { fraction: number; count: number }[],
): readonly number[] {
  if (totalViewers === 0) return Object.freeze([0, 0, 0, 0]);
  const buckets = [0.25, 0.5, 0.75, 1.0];
  return Object.freeze(
    buckets.map((b) => {
      const exact = completionsAtFraction.find((c) => Math.abs(c.fraction - b) < 0.05);
      return exact ? exact.count / totalViewers : 0;
    }),
  );
}

/**
 * Parse a User-Agent string to extract device category.
 * Lightweight heuristic — covers the top 90% of cases.
 * Doesn't need full ua-parser-js for the analytics pipeline.
 */
export function detectDeviceCategory(ua: string): ViewerSession['deviceCategory'] {
  const lower = ua.toLowerCase();
  if (/smarttv|smart-tv|hbbtv|googletv|appletv|roku|firetv|crkey|chromecast/.test(lower)) {
    return 'tv';
  }
  if (/ipad|tablet|playbook|silk/.test(lower)) return 'tablet';
  if (/mobi|android|iphone|ipod|blackberry|iemobile|opera mini/.test(lower)) return 'mobile';
  if (/windows nt|macintosh|x11|linux/.test(lower)) return 'desktop';
  return 'unknown';
}

/**
 * Compute a fingerprint-free watch-time metric.
 * Input is a list of active play intervals; output is total seconds
 * where the player was unpaused and the document was visible.
 */
export function sumWatchedSeconds(intervals: ReadonlyArray<{ start: number; end: number }>): number {
  if (intervals.length === 0) return 0;
  // Merge overlapping intervals to avoid double-counting.
  const sorted = [...intervals].sort((a, b) => a.start - b.start);
  const merged: { start: number; end: number }[] = [{ ...sorted[0]! }];
  for (let i = 1; i < sorted.length; i++) {
    const last = merged[merged.length - 1]!;
    if (sorted[i]!.start <= last.end) {
      last.end = Math.max(last.end, sorted[i]!.end);
    } else {
      merged.push({ ...sorted[i]! });
    }
  }
  let total = 0;
  for (const m of merged) total += m.end - m.start;
  return Math.floor(total / 1000);
}

/**
 * Convert a watch-time hours value to a "pessoas-hora" display (PT-BR friendly).
 * Used in /library cards: "247 pessoas assistiram 1,420 horas".
 */
export function formatPessoaHora(hours: number): string {
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(Math.round(hours));
}

/**
 * Variant distribution summary — drives the host "qualidade mais usada" stat.
 */
export function aggregateVariantDistribution(
  sessions: readonly ViewerSession[],
): ReadonlyArray<{ variantIndex: number; viewers: number }> {
  const counts = new Map<number, number>();
  for (const s of sessions) {
    if (s.lastVariantIndex === undefined) continue;
    counts.set(s.lastVariantIndex, (counts.get(s.lastVariantIndex) ?? 0) + 1);
  }
  return Object.freeze(
    Array.from(counts.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([variantIndex, viewers]) => ({ variantIndex, viewers })),
  );
}

/**
 * Geographic distribution — top 10 countries by viewer count.
 */
export function aggregateTopCountries(
  sessions: readonly ViewerSession[],
  limit: number = 10,
): ReadonlyArray<{ code: string; viewers: number }> {
  const counts = new Map<string, number>();
  for (const s of sessions) {
    if (!s.countryCode) continue;
    counts.set(s.countryCode, (counts.get(s.countryCode) ?? 0) + 1);
  }
  return Object.freeze(
    Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([code, viewers]) => ({ code, viewers })),
  );
}
