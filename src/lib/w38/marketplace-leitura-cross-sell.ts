// src/lib/w38/marketplace-leitura-cross-sell.ts
// Cross-sell recommendations based on bundle content, tag overlap, co-purchase patterns.
// Composes: w36/w36-marketplace-leitura-bundles-v2 (Bundle type with perPersonCents),
//           w34/marketplace-leitura-discovery (LeituraSnapshot, filters, carousels),
//           w32/marketplace-reviews (RatingDistribution, averageRating),
//           w31/marketplace-leitura (Leitura, PriceTier)

export type LeituraFormat = "ebook" | "audiobook" | "physical" | "pdf" | "subscription";
export type PriceTier = "free" | "low" | "mid" | "high" | "premium";

export interface Leitura {
  leituraId: string;
  title: string;
  authorId: string;
  tags: string[];
  format: LeituraFormat;
  priceCents: number;
  priceTier: PriceTier;
  averageRating: number; // 0..5
  ratingCount: number;
  purchaseCount: number;
}

export interface LeituraSnapshot {
  leituraId: string;
  title: string;
  authorId: string;
  tags: string[];
  priceCents: number;
  priceTier: PriceTier;
  averageRating: number;
}

export interface BundleItem {
  leituraId: string;
  weight: number; // contribution weight within the bundle
}

export type BundleType = "self" | "gift" | "group" | "subscription";

export interface Bundle {
  bundleId: string;
  title: string;
  type: BundleType;
  items: BundleItem[];
  priceCents: number;
  perPersonCents: number | null;
  primaryTags: string[];
  averageRating: number;
  purchaseCount: number;
}

export interface CoPurchaseStat {
  leituraAId: string;
  leituraBId: string;
  count: number;
  confidence: number; // 0..1
}

export interface CrossSellCandidate {
  leituraId: string;
  title: string;
  score: number; // 0..1
  tagScore: number;
  ratingScore: number;
  priceScore: number;
  coPurchaseScore: number;
  reason: string;
  bundleId: string | null;
}

export interface CrossSellList {
  bundleId: string | null;
  candidates: CrossSellCandidate[];
  generatedAt: number;
}

export interface CrossSellConfig {
  tagWeight: number;
  ratingWeight: number;
  priceWeight: number;
  coPurchaseWeight: number;
  sameFormatBonus: number;
  maxCandidates: number;
  minRatingForBoost: number;
  highRatingThreshold: number;
  priceTierSimilarityMatrix: Record<PriceTier, Record<PriceTier, number>>;
}

export const DEFAULT_CROSS_SELL_CONFIG: CrossSellConfig = {
  tagWeight: 0.4,
  ratingWeight: 0.2,
  priceWeight: 0.15,
  coPurchaseWeight: 0.25,
  sameFormatBonus: 0.05,
  maxCandidates: 10,
  minRatingForBoost: 3.0,
  highRatingThreshold: 4.5,
  priceTierSimilarityMatrix: {
    free: { free: 1, low: 0.7, mid: 0.3, high: 0.1, premium: 0.05 },
    low: { free: 0.7, low: 1, mid: 0.7, high: 0.3, premium: 0.1 },
    mid: { free: 0.3, low: 0.7, mid: 1, high: 0.7, premium: 0.3 },
    high: { free: 0.1, low: 0.3, mid: 0.7, high: 1, premium: 0.7 },
    premium: { free: 0.05, low: 0.1, mid: 0.3, high: 0.7, premium: 1 },
  },
};

export const PRICE_TIER_ORDER: PriceTier[] = ["free", "low", "mid", "high", "premium"];

export function tierFromPriceCents(cents: number): PriceTier {
  if (cents <= 0) return "free";
  if (cents < 1000) return "low";
  if (cents < 3000) return "mid";
  if (cents < 8000) return "high";
  return "premium";
}

export function jaccardTags(a: string[], b: string[]): number {
  if (a.length === 0 && b.length === 0) return 0;
  const sa = new Set(a.map((s) => s.toLowerCase()));
  const sb = new Set(b.map((s) => s.toLowerCase()));
  let inter = 0;
  for (const v of sa) if (sb.has(v)) inter++;
  const union = sa.size + sb.size - inter;
  return union === 0 ? 0 : inter / union;
}

export function priceTierSimilarity(
  config: CrossSellConfig,
  a: PriceTier,
  b: PriceTier,
): number {
  return config.priceTierSimilarityMatrix[a][b];
}

export function bundleItemTags(bundle: Bundle, items: Leitura[]): string[] {
  const set = new Set<string>();
  for (const it of bundle.items) {
    const leitura = items.find((l) => l.leituraId === it.leituraId);
    if (!leitura) continue;
    for (const t of leitura.tags) set.add(t.toLowerCase());
  }
  for (const t of bundle.primaryTags) set.add(t.toLowerCase());
  return Array.from(set);
}

export function ratingBoost(leitura: Leitura, config: CrossSellConfig): number {
  if (leitura.ratingCount < 3) return 0;
  if (leitura.averageRating < config.minRatingForBoost) return 0;
  if (leitura.averageRating >= config.highRatingThreshold) return 1;
  return (leitura.averageRating - config.minRatingForBoost) /
    (config.highRatingThreshold - config.minRatingForBoost);
}

export function coPurchaseLookup(
  stats: CoPurchaseStat[],
  leituraId: string,
  candidateId: string,
): CoPurchaseStat | null {
  for (const s of stats) {
    if ((s.leituraAId === leituraId && s.leituraBId === candidateId) ||
        (s.leituraAId === candidateId && s.leituraBId === leituraId)) {
      return s;
    }
  }
  return null;
}

export function aggregateCoPurchaseScore(
  stats: CoPurchaseStat[],
  bundle: Bundle,
  candidateId: string,
): number {
  if (bundle.items.length === 0) return 0;
  let total = 0;
  let weightSum = 0;
  for (const it of bundle.items) {
    const stat = coPurchaseLookup(stats, it.leituraId, candidateId);
    if (!stat) continue;
    total += stat.confidence * it.weight;
    weightSum += it.weight;
  }
  if (weightSum === 0) return 0;
  return (total / weightSum);
}

export function scoreCrossSellCandidate(
  bundle: Bundle,
  candidate: Leitura,
  allItems: Leitura[],
  coStats: CoPurchaseStat[],
  config: CrossSellConfig,
): CrossSellCandidate {
  const bundleTags = bundleItemTags(bundle, allItems);
  const tScore = jaccardTags(bundleTags, candidate.tags);
  const rScore = ratingBoost(candidate, config);
  const pScore = priceTierSimilarity(config, candidate.priceTier, tierFromPriceCents(bundle.priceCents));
  const cpScore = aggregateCoPurchaseScore(coStats, bundle, candidate.leituraId);
  const sameFormat = bundle.items.some((it) => {
    const item = allItems.find((l) => l.leituraId === it.leituraId);
    return item && item.format === candidate.format;
  });
  const fmtBonus = sameFormat ? config.sameFormatBonus : 0;
  const total =
    tScore * config.tagWeight +
    rScore * config.ratingWeight +
    pScore * config.priceWeight +
    cpScore * config.coPurchaseWeight +
    fmtBonus;
  const score = Math.max(0, Math.min(1, total));
  let reason = `${(tScore * 100).toFixed(0)}% tag overlap`;
  if (cpScore > 0) reason += `, ${(cpScore * 100).toFixed(0)}% co-purchase`;
  if (rScore > 0) reason += `, rating ${candidate.averageRating.toFixed(1)}`;
  return {
    leituraId: candidate.leituraId,
    title: candidate.title,
    score,
    tagScore: tScore,
    ratingScore: rScore,
    priceScore: pScore,
    coPurchaseScore: cpScore,
    reason,
    bundleId: bundle.bundleId,
  };
}

export function buildCrossSellList(
  bundle: Bundle,
  allItems: Leitura[],
  coStats: CoPurchaseStat[],
  config: CrossSellConfig = DEFAULT_CROSS_SELL_CONFIG,
  now: number = Date.now(),
): CrossSellList {
  const candidates: CrossSellCandidate[] = [];
  const seen = new Set<string>();
  for (const it of bundle.items) seen.add(it.leituraId);
  for (const candidate of allItems) {
    if (seen.has(candidate.leituraId)) continue;
    if (candidate.priceTier === "free" && candidate.purchaseCount === 0) continue;
    const cs = scoreCrossSellCandidate(bundle, candidate, allItems, coStats, config);
    if (cs.score < 0.05) continue;
    candidates.push(cs);
  }
  candidates.sort((a, b) => b.score - a.score);
  return {
    bundleId: bundle.bundleId,
    candidates: candidates.slice(0, config.maxCandidates),
    generatedAt: now,
  };
}

export function buildCrossSellFromLeitura(
  source: Leitura,
  allItems: Leitura[],
  coStats: CoPurchaseStat[],
  config: CrossSellConfig = DEFAULT_CROSS_SELL_CONFIG,
  now: number = Date.now(),
): CrossSellList {
  const bundle: Bundle = {
    bundleId: `singleton-${source.leituraId}`,
    title: source.title,
    type: "self",
    items: [{ leituraId: source.leituraId, weight: 1 }],
    priceCents: source.priceCents,
    perPersonCents: null,
    primaryTags: source.tags,
    averageRating: source.averageRating,
    purchaseCount: source.purchaseCount,
  };
  return buildCrossSellList(bundle, allItems, coStats, config, now);
}

export function mergeCrossSellLists(lists: CrossSellList[], config: CrossSellConfig = DEFAULT_CROSS_SELL_CONFIG): CrossSellList {
  const byLeitura = new Map<string, CrossSellCandidate>();
  for (const list of lists) {
    for (const c of list.candidates) {
      const existing = byLeitura.get(c.leituraId);
      if (!existing) {
        byLeitura.set(c.leituraId, { ...c });
      } else {
        existing.score = Math.min(1, existing.score + c.score * 0.5);
        existing.tagScore = Math.max(existing.tagScore, c.tagScore);
        existing.coPurchaseScore = Math.max(existing.coPurchaseScore, c.coPurchaseScore);
      }
    }
  }
  const merged = Array.from(byLeitura.values());
  merged.sort((a, b) => b.score - a.score);
  return {
    bundleId: null,
    candidates: merged.slice(0, config.maxCandidates),
    generatedAt: lists[0]?.generatedAt ?? Date.now(),
  };
}

export function filterByMinRating(
  list: CrossSellList,
  minRating: number,
): CrossSellList {
  return {
    ...list,
    candidates: list.candidates.filter((c) => c.tagScore >= 0 || c.coPurchaseScore >= 0).map((c) => c),
  };
}

export function topNCrossSell(list: CrossSellList, n: number): CrossSellCandidate[] {
  return list.candidates.slice(0, n);
}

export function summarizeCrossSell(list: CrossSellList): string {
  if (list.candidates.length === 0) return "cross-sell: no candidates";
  const top = list.candidates[0];
  return [
    `cross-sell: bundle=${list.bundleId ?? "merged"}`,
    `n=${list.candidates.length}`,
    `top=${top.title}(${top.score.toFixed(2)})`,
    `tag=${top.tagScore.toFixed(2)}`,
    `cp=${top.coPurchaseScore.toFixed(2)}`,
    `rating=${top.ratingScore.toFixed(2)}`,
  ].join(" | ");
}
