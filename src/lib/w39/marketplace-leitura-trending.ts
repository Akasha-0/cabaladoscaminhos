// ============================================================================
// MARKETPLACE LEITURA TRENDING — Wave 39
// ============================================================================
// Velocity × recency × rating trending chart for leituras (marketplace items).
// Composes with:
//   - src/lib/w34/marketplace-leitura-discovery.ts (LeituraItem, DiscoveryFilters)
//   - src/lib/w35/marketplace-leitura-wishlist.ts (LeituraSnapshot, PriceAlert)
//   - src/lib/w38/marketplace-leitura-cross-sell.ts (Leitura, LeituraSnapshot)
//   - src/lib/w38/comments-reputation-trending-v2.ts (TrendingClass union, ForecastPoint)
//
// Pure TypeScript: no runtime imports, no I/O, no DOM. All dates are caller-
// supplied so the module is deterministic under test. Defensive runtime —
// never throws on missing/null/undefined inputs.
//
// Responsibilities:
//   1. Velocity — purchases/revenue per day normalized over a window.
//   2. Trending chart — per-day series with peak + trend direction.
//   3. Classification — bucket each leitura into a TrendingClass (viral,
//      breakout, sustained, declining, dormant, steady, new).
//   4. Per-category leaderboard — top trending leituras in a category.
//   5. Forecast — linear/naive projection of next-week velocity.
//   6. Cohort — group buckets by cohortWeek for time-bucketed analytics.
// ============================================================================

// ---------- TYPES ----------------------------------------------------------

export type IsoDate = string;

export interface DailyMetric {
  date: IsoDate;          // YYYY-MM-DD
  purchases: number;      // gross purchases that day (>= 0)
  revenue: number;        // cents (>= 0)
  views?: number;         // optional page views (>= 0)
  conversions?: number;   // optional checkouts that day (>= 0)
  rank?: number;          // optional global rank (1 = top, null-safe)
}

export interface TrendingWindow {
  windowDays: number;       // e.g. 7, 14, 30
  startDate: IsoDate;
  endDate: IsoDate;
  totalPurchases: number;
  totalRevenue: number;
}

export interface LeituraVelocity {
  leituraId: string;
  purchasesPerDay: number;
  revenuePerDay: number;
  conversionRate: number;   // 0..1 (purchases / views, 0 if no views)
  velocityScore: number;     // 0..1 (composite)
  windowDays: number;
}

export type TrendDirection = "rising" | "falling" | "stable";

export interface TrendingChartPoint {
  date: IsoDate;
  purchases: number;
  revenue: number;
  rank: number | null;
}

export interface TrendingChart {
  leituraId: string;
  dataPoints: TrendingChartPoint[];
  peakDate: IsoDate | null;
  peakPurchases: number;
  currentRank: number | null;
  rankDelta: number;         // positive = rank improving (lower number)
  trend: TrendDirection;
  windowDays: number;
}

export type TrendingClass =
  | "viral"
  | "breakout"
  | "sustained"
  | "declining"
  | "dormant"
  | "steady"
  | "new";

export interface TrendingBucket {
  leituraId: string;
  category: string;
  bucket: TrendingClass;
  score: number;             // 0..1
  rank: number | null;       // global rank within category
  cohortWeek: IsoDate;       // Monday ISO of the cohort week
  velocityScore: number;     // 0..1 (echoes LeituraVelocity.velocityScore)
  rating: number;            // 0..5
}

export type ForecastBasis = "linear" | "naive" | "mean" | "na";

export interface LeituraForecast {
  leituraId: string;
  nextWeekForecast: number;  // projected purchases next week
  confidence: number;        // 0..1
  basis: ForecastBasis;
  predictedRevenue: number;  // cents (derived from current avg revenue/purchase)
  predictedVelocity: number; // purchasesPerDay next week
  trend: TrendDirection;
}

export interface CohortTrendingStats {
  cohortWeek: IsoDate;
  buckets: TrendingBucket[];
  counts: Record<TrendingClass, number>;
  avgScore: number;
  medianRank: number | null;
}

export interface TrendingConfig {
  viralVelocityMin: number;          // velocityScore threshold for viral
  breakoutJumpMin: number;           // rank improvement needed
  breakoutWeeks: number;             // weeks of recent activity
  sustainedWeeks: number;
  sustainedScoreMin: number;
  decliningDropMin: number;
  dormantWeeks: number;
  dormantScoreMax: number;
  conversionCap: number;             // max conversion used in velocityScore (e.g. 0.1)
  ratingWeight: number;              // 0..1
  velocityWeight: number;            // 0..1
  recencyWeight: number;             // 0..1
  topCategoryLimit: number;          // default cap for topTrendingInCategory
}

// ---------- CONSTANTS -----------------------------------------------------

export const DEFAULT_TRENDING_CONFIG: TrendingConfig = {
  viralVelocityMin: 0.85,
  breakoutJumpMin: 10,
  breakoutWeeks: 3,
  sustainedWeeks: 4,
  sustainedScoreMin: 0.5,
  decliningDropMin: 8,
  dormantWeeks: 6,
  dormantScoreMax: 0.1,
  conversionCap: 0.1,
  ratingWeight: 0.25,
  velocityWeight: 0.55,
  recencyWeight: 0.2,
  topCategoryLimit: 20,
};

export const MS_PER_DAY = 86_400_000;
export const MAX_TRENDING_LOOKBACK_DAYS = 365;
export const DEFAULT_WINDOW_DAYS = 7;
export const COHORT_WEEK_MS = 7 * MS_PER_DAY;
export const TRENDING_SCORE_FLOOR = 0.05;
export const RANK_IMPROVEMENT_CLAMP = 1_000;

// ---------- WINDOW --------------------------------------------------------

export function isoDay(now: number): IsoDate {
  const d = new Date(now);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function computeTrendingWindow(
  windowDays: number,
  now: number,
  metrics: DailyMetric[] = []
): TrendingWindow {
  const wd = clampInt(windowDays, 1, MAX_TRENDING_LOOKBACK_DAYS);
  const end = isoDay(now);
  const start = isoDay(now - (wd - 1) * MS_PER_DAY);
  let totalPurchases = 0;
  let totalRevenue = 0;
  for (const m of metrics) {
    if (m.date < start || m.date > end) continue;
    if (typeof m.purchases === "number" && m.purchases > 0) totalPurchases += m.purchases;
    if (typeof m.revenue === "number" && m.revenue > 0) totalRevenue += m.revenue;
  }
  return { windowDays: wd, startDate: start, endDate: end, totalPurchases, totalRevenue };
}

// ---------- VELOCITY ------------------------------------------------------

export function computeVelocity(
  leituraId: string,
  purchases: number,
  windowDays: number,
  views: number = 0,
  config: TrendingConfig = DEFAULT_TRENDING_CONFIG
): LeituraVelocity {
  const wd = clampInt(windowDays, 1, MAX_TRENDING_LOOKBACK_DAYS);
  const p = Math.max(0, Number.isFinite(purchases) ? purchases : 0);
  const v = Math.max(0, Number.isFinite(views) ? views : 0);
  const purchasesPerDay = wd === 0 ? 0 : p / wd;
  // Revenue per day requires revenue — caller may pass 0 if unknown.
  // We derive revenuePerDay from purchases only when no separate revenue is known.
  const revenuePerDay = 0; // zero unless extended downstream
  const conversionRate = v === 0 ? 0 : Math.min(1, p / v);
  const convScore = Math.min(1, conversionRate / Math.max(0.0001, config.conversionCap));
  const logScore = p === 0 ? 0 : Math.min(1, Math.log10(p + 1) / 3);
  const velocityScore = Math.max(0, Math.min(1, logScore * 0.7 + convScore * 0.3));
  return {
    leituraId,
    purchasesPerDay,
    revenuePerDay,
    conversionRate,
    velocityScore,
    windowDays: wd,
  };
}

export function velocityDecay(
  velocity: LeituraVelocity,
  ageDays: number
): number {
  if (ageDays <= 0) return velocity.velocityScore;
  const halfLife = Math.max(1, velocity.windowDays);
  const factor = Math.pow(0.5, ageDays / halfLife);
  return Math.max(0, Math.min(1, velocity.velocityScore * factor));
}

// ---------- CHART ---------------------------------------------------------

export function buildTrendingChart(
  leituraId: string,
  dailyMetrics: DailyMetric[],
  windowDays: number = DEFAULT_WINDOW_DAYS
): TrendingChart {
  const wd = clampInt(windowDays, 1, MAX_TRENDING_LOOKBACK_DAYS);
  const sorted = [...(Array.isArray(dailyMetrics) ? dailyMetrics : [])]
    .filter((m): m is DailyMetric => m !== null && typeof m === "object")
    .sort((a, b) => a.date.localeCompare(b.date));
  const tail = sorted.slice(-wd);
  const points: TrendingChartPoint[] = tail.map((m) => ({
    date: m.date,
    purchases: clampNonNegative(m.purchases),
    revenue: clampNonNegative(m.revenue),
    rank: typeof m.rank === "number" && m.rank > 0 ? Math.floor(m.rank) : null,
  }));
  let peakDate: IsoDate | null = null;
  let peakPurchases = 0;
  for (const p of points) {
    if (p.purchases > peakPurchases) {
      peakPurchases = p.purchases;
      peakDate = p.date;
    }
  }
  const currentRank = points.length > 0 ? points[points.length - 1].rank : null;
  const firstRank = points.length > 0 ? points[0].rank : null;
  let rankDelta = 0;
  if (currentRank !== null && firstRank !== null) {
    rankDelta = firstRank - currentRank; // positive = improving
  }
  const trend = rankTrendFromPoints(points);
  return {
    leituraId,
    dataPoints: points,
    peakDate,
    peakPurchases,
    currentRank,
    rankDelta,
    trend,
    windowDays: wd,
  };
}

function rankTrendFromPoints(points: TrendingChartPoint[]): TrendDirection {
  if (points.length < 2) return "stable";
  const ranks = points
    .map((p) => p.rank)
    .filter((r): r is number => typeof r === "number" && r > 0);
  if (ranks.length < 2) return "stable";
  const half = Math.floor(ranks.length / 2);
  const firstAvg = avg(ranks.slice(0, half));
  const lastAvg = avg(ranks.slice(half));
  const diff = firstAvg - lastAvg; // positive = improving (rank going down)
  if (diff >= 5) return "rising";
  if (diff <= -5) return "falling";
  return "stable";
}

export function rankTrend(chart: TrendingChart): TrendDirection {
  return chart.trend;
}

export function mergeTrendingCharts(charts: TrendingChart[]): {
  dataPoints: TrendingChartPoint[];
  totalPurchases: number;
  totalRevenue: number;
} {
  const byDate = new Map<IsoDate, TrendingChartPoint>();
  let totalPurchases = 0;
  let totalRevenue = 0;
  for (const chart of charts) {
    for (const p of chart.dataPoints) {
      const existing = byDate.get(p.date);
      if (!existing) {
        byDate.set(p.date, { ...p });
      } else {
        existing.purchases += p.purchases;
        existing.revenue += p.revenue;
      }
      totalPurchases += p.purchases;
      totalRevenue += p.revenue;
    }
  }
  const merged = Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
  return { dataPoints: merged, totalPurchases, totalRevenue };
}

// ---------- CLASSIFICATION -----------------------------------------------

export function classifyTrending(
  leituraId: string,
  category: string,
  velocity: LeituraVelocity,
  recencyDays: number,
  rating: number,
  rankDelta: number = 0,
  cohortWeek: IsoDate = isoDay(Date.now()),
  config: TrendingConfig = DEFAULT_TRENDING_CONFIG
): TrendingBucket {
  const r = clampRating(rating);
  const rec = Math.max(0, Math.floor(Number.isFinite(recencyDays) ? recencyDays : 0));
  const recencyScore = Math.max(0, Math.min(1, 1 - rec / Math.max(1, velocity.windowDays * 2)));
  const ratingScore = r / 5;
  const composite = Math.max(0, Math.min(1,
    velocity.velocityScore * config.velocityWeight +
      ratingScore * config.ratingWeight +
      recencyScore * config.recencyWeight
  ));
  const klass = pickTrendingClass(velocity.velocityScore, recencyScore, rec, rankDelta, config);
  const score = Math.max(composite, trendingScoreForClass(klass, rankDelta, composite));
  return {
    leituraId,
    category,
    bucket: klass,
    score,
    rank: null,
    cohortWeek,
    velocityScore: velocity.velocityScore,
    rating: r,
  };
}

function pickTrendingClass(
  velocityScore: number,
  recencyScore: number,
  recencyDays: number,
  rankDelta: number,
  config: TrendingConfig
): TrendingClass {
  if (recencyDays <= 0) return "new";
  if (velocityScore >= config.viralVelocityMin && rankDelta >= config.breakoutJumpMin) return "viral";
  if (rankDelta >= config.breakoutJumpMin && recencyDays <= config.breakoutWeeks) return "breakout";
  if (recencyDays >= config.sustainedWeeks && velocityScore >= config.sustainedScoreMin) return "sustained";
  if (rankDelta <= -config.decliningDropMin) return "declining";
  if (recencyDays >= config.dormantWeeks && velocityScore < config.dormantScoreMax) return "dormant";
  return "steady";
}

export function trendingScoreForClass(
  klass: TrendingClass,
  rankDelta: number,
  recentAvg: number
): number {
  let base = 0;
  switch (klass) {
    case "viral": base = 0.95; break;
    case "breakout": base = 0.8; break;
    case "sustained": base = 0.65; break;
    case "declining": base = 0.3; break;
    case "dormant": base = 0.05; break;
    case "steady": base = 0.4; break;
    case "new": base = 0.5; break;
  }
  const jumpBoost = Math.max(0, Math.min(0.05, Math.abs(rankDelta) * 0.005));
  const scoreBoost = Math.max(0, Math.min(0.05, recentAvg * 0.05));
  return Math.max(0, Math.min(1, base + jumpBoost + scoreBoost));
}

// ---------- TOP IN CATEGORY ----------------------------------------------

export interface LeituraTrendingInput {
  leituraId: string;
  category: string;
  velocity: LeituraVelocity;
  recencyDays: number;
  rating: number;
  rank: number | null;
  publishedAt?: IsoDate;
}

export function topTrendingInCategory(
  leituras: LeituraTrendingInput[],
  category: string,
  n: number,
  cohortWeek: IsoDate = isoDay(Date.now()),
  config: TrendingConfig = DEFAULT_TRENDING_CONFIG
): TrendingBucket[] {
  const filtered = leituras.filter((l) => l.category === category);
  const buckets: TrendingBucket[] = filtered.map((l) => {
    const rankDelta = l.rank !== null ? Math.max(-RANK_IMPROVEMENT_CLAMP, -l.rank) : 0;
    const bucket = classifyTrending(
      l.leituraId,
      l.category,
      l.velocity,
      l.recencyDays,
      l.rating,
      rankDelta,
      cohortWeek,
      config
    );
    bucket.rank = l.rank;
    return bucket;
  });
  buckets.sort((a, b) => b.score - a.score || (a.rank ?? Infinity) - (b.rank ?? Infinity));
  return buckets.slice(0, Math.max(0, n));
}

// ---------- FORECAST -----------------------------------------------------

export function forecastTrending(
  chart: TrendingChart,
  currentRevenue: number = 0,
  currentPurchases: number = 0
): LeituraForecast {
  const purchases = chart.dataPoints.map((p) => p.purchases);
  if (purchases.length === 0) {
    return {
      leituraId: chart.leituraId,
      nextWeekForecast: 0,
      confidence: 0,
      basis: "na",
      predictedRevenue: 0,
      predictedVelocity: 0,
      trend: chart.trend,
    };
  }
  const linear = linearProjection(purchases);
  const naive = naiveProjection(purchases);
  const mean = meanProjection(purchases);
  let basis: ForecastBasis = "na";
  let predicted = 0;
  let confidence = 0;
  if (linear && linear.confidence >= 0.6) {
    basis = "linear";
    predicted = linear.predicted;
    confidence = linear.confidence;
  } else if (naive && naive.confidence > 0.4) {
    basis = "naive";
    predicted = naive.predicted;
    confidence = naive.confidence;
  } else if (mean) {
    basis = "mean";
    predicted = mean.predicted;
    confidence = mean.confidence;
  }
  const predictedNextWeek = Math.max(0, Math.round(predicted));
  const avgRevPerPurchase = currentPurchases > 0 ? currentRevenue / currentPurchases : 0;
  const predictedRevenue = Math.round(avgRevPerPurchase * predictedNextWeek);
  const predictedVelocity = predictedNextWeek / Math.max(1, chart.windowDays);
  return {
    leituraId: chart.leituraId,
    nextWeekForecast: predictedNextWeek,
    confidence,
    basis,
    predictedRevenue,
    predictedVelocity,
    trend: chart.trend,
  };
}

function linearProjection(values: number[]): { predicted: number; confidence: number } | null {
  if (values.length < 3) return null;
  const n = values.length;
  const xs = Array.from({ length: n }, (_, i) => i);
  const meanX = avg(xs);
  const meanY = avg(values);
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - meanX) * (values[i] - meanY);
    den += (xs[i] - meanX) ** 2;
  }
  if (den === 0) return null;
  const slope = num / den;
  const intercept = meanY - slope * meanX;
  const predictedRaw = slope * n + intercept;
  const predicted = Math.max(0, predictedRaw);
  const residuals: number[] = [];
  for (let i = 0; i < n; i++) {
    residuals.push(values[i] - (slope * xs[i] + intercept));
  }
  const variance = avg(residuals.map((r) => r * r));
  const confidence = Math.max(0, Math.min(1, 1 - Math.sqrt(variance) / Math.max(1, Math.abs(meanY))));
  return { predicted, confidence };
}

function naiveProjection(values: number[]): { predicted: number; confidence: number } | null {
  if (values.length === 0) return null;
  const last = values[values.length - 1];
  const confidence = Math.max(0, Math.min(1, values.length / 8));
  return { predicted: Math.max(0, last), confidence };
}

function meanProjection(values: number[]): { predicted: number; confidence: number } | null {
  if (values.length === 0) return null;
  const mean = avg(values);
  return { predicted: Math.max(0, mean), confidence: 0.3 };
}

// ---------- COHORT -------------------------------------------------------

export function cohortWeekKey(isoDayStr: IsoDate): IsoDate {
  const t = Date.parse(isoDayStr + "T00:00:00Z");
  if (Number.isNaN(t)) return isoDayStr;
  const d = new Date(t);
  const dow = d.getUTCDay(); // 0 = Sun
  const diff = dow === 0 ? -6 : 1 - dow;
  d.setUTCDate(d.getUTCDate() + diff);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function cohortTrending(
  buckets: TrendingBucket[],
  weeksBack: number
): CohortTrendingStats[] {
  const wb = Math.max(0, Math.floor(Number.isFinite(weeksBack) ? weeksBack : 0));
  const now = Date.now();
  const cutoff = now - wb * COHORT_WEEK_MS;
  const inWindow = buckets.filter((b) => {
    const t = Date.parse(b.cohortWeek + "T00:00:00Z");
    return !Number.isNaN(t) && t >= cutoff;
  });
  const byWeek = new Map<IsoDate, TrendingBucket[]>();
  for (const b of inWindow) {
    const key = cohortWeekKey(b.cohortWeek);
    const arr = byWeek.get(key);
    if (arr) arr.push(b);
    else byWeek.set(key, [b]);
  }
  const out: CohortTrendingStats[] = [];
  for (const [week, items] of byWeek.entries()) {
    out.push(summarizeCohort(week, items));
  }
  out.sort((a, b) => a.cohortWeek.localeCompare(b.cohortWeek));
  return out;
}

function summarizeCohort(cohortWeek: IsoDate, items: TrendingBucket[]): CohortTrendingStats {
  const counts: Record<TrendingClass, number> = {
    viral: 0, breakout: 0, sustained: 0, declining: 0, dormant: 0, steady: 0, new: 0,
  };
  let sumScore = 0;
  const ranks: number[] = [];
  for (const b of items) {
    counts[b.bucket] = (counts[b.bucket] ?? 0) + 1;
    sumScore += b.score;
    if (b.rank !== null) ranks.push(b.rank);
  }
  ranks.sort((a, b) => a - b);
  const medianRank = ranks.length === 0 ? null : ranks[Math.floor(ranks.length / 2)];
  return {
    cohortWeek,
    buckets: items,
    counts,
    avgScore: items.length === 0 ? 0 : sumScore / items.length,
    medianRank,
  };
}

// ---------- SUMMARY ------------------------------------------------------

export function summarizeChart(chart: TrendingChart): string {
  if (chart.dataPoints.length === 0) return `chart[${chart.leituraId}]: empty`;
  const peak = chart.peakDate ? `@${chart.peakDate}=${chart.peakPurchases}` : "nopeak";
  return [
    `chart[${chart.leituraId}]`,
    `days=${chart.dataPoints.length}`,
    `trend=${chart.trend}`,
    `rank=${chart.currentRank ?? "?"}`,
    `Δrank=${chart.rankDelta}`,
    peak,
  ].join(" | ");
}

export function summarizeBucket(b: TrendingBucket): string {
  return `${b.leituraId}#${b.bucket}@${b.score.toFixed(2)}(v=${b.velocityScore.toFixed(2)},r=${b.rating.toFixed(1)})`;
}

export function summarizeTrending(buckets: TrendingBucket[]): string {
  if (buckets.length === 0) return "trending: no buckets";
  const counts: Record<TrendingClass, number> = {
    viral: 0, breakout: 0, sustained: 0, declining: 0, dormant: 0, steady: 0, new: 0,
  };
  for (const b of buckets) counts[b.bucket] = (counts[b.bucket] ?? 0) + 1;
  const top = buckets.slice().sort((a, b) => b.score - a.score)[0];
  return [
    `trending: n=${buckets.length}`,
    `V/B/S/D/Dm/St/N=${counts.viral}/${counts.breakout}/${counts.sustained}/${counts.declining}/${counts.dormant}/${counts.steady}/${counts.new}`,
    `top=${top ? summarizeBucket(top) : "none"}`,
  ].join(" | ");
}

export function summarizeForecast(f: LeituraForecast): string {
  return [
    `forecast[${f.leituraId}]`,
    `next=${f.nextWeekForecast}`,
    `conf=${f.confidence.toFixed(2)}`,
    `basis=${f.basis}`,
    `trend=${f.trend}`,
  ].join(" | ");
}

// ---------- HELPERS ------------------------------------------------------

function clampInt(n: number, lo: number, hi: number): number {
  if (!Number.isFinite(n)) return lo;
  return Math.max(lo, Math.min(hi, Math.floor(n)));
}

function clampNonNegative(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, n);
}

function clampRating(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(5, n));
}

function avg(values: number[]): number {
  if (values.length === 0) return 0;
  let sum = 0;
  for (const v of values) sum += v;
  return sum / values.length;
}