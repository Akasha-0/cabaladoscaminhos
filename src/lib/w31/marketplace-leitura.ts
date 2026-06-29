/**
 * w31/marketplace-leitura
 *
 * Marketplace "leitura" (reading) cross-sell layer. When a user books
 * a consulta or pratica with a guide, this module decides which
 * additional reading materials (articles, posts, books) to recommend
 * based on:
 *  - the topic/intention of the booking
 *  - the guide's published corpus
 *  - the user's prior reading history
 *  - the tradition alignment (Candomblé, Umbanda, Cabala, Tantra, etc.)
 *
 * PURE module: returns ranked suggestions, never executes payments.
 */

export type Tradition =
  | "candomble"
  | "umbanda"
  | "ifá"
  | "cabala"
  | "tantra"
  | "astrologia"
  | "numerologia"
  | "umbanda-cristã"
  | "espiritismo"
  | "budismo"
  | "xamanismo"
  | "universalista";

export type ContentKind =
  | "article"
  | "post"
  | "ebook"
  | "audio"
  | "video"
  | "course"
  | "ritual-guide";

export interface ReadingContent {
  id: string;
  kind: ContentKind;
  title: string;
  authorId: string;
  authorDisplayName: string;
  tradition: Tradition;
  topics: string[];
  language: "pt-BR" | "en" | "es";
  publishedAt: string;
  durationMinutes: number;
  priceCents: number;
  currency: "BRL" | "USD" | "EUR";
  ratingAvg: number;
  ratingCount: number;
  isPremium: boolean;
  resonantEntities: string[];
}

export interface UserReadingHistory {
  userId: string;
  viewed: string[];
  purchased: string[];
  favorited: string[];
  completed: string[];
  affinityTopics: string[];
  traditionAffinity: Partial<Record<Tradition, number>>;
}

export interface MarketplaceBooking {
  id: string;
  userId: string;
  guideId: string;
  bookedAt: string;
  scheduledFor: string;
  status: "pending" | "confirmed" | "completed" | "cancelled" | "refunded";
  intention: string;
  topics: string[];
  priceCents: number;
  currency: "BRL" | "USD" | "EUR";
}

export interface BookingContext {
  booking: MarketplaceBooking;
  guideTraditions: Tradition[];
  guideTopics: string[];
  guideContentIds: string[];
}

export interface RankedSuggestion {
  content: ReadingContent;
  score: number;
  reasonTags: string[];
}

export function jaccardOverlap(a: string[], b: string[]): number {
  if (a.length === 0 || b.length === 0) return 0;
  const A = new Set(a);
  const B = new Set(b);
  let inter = 0;
  for (const x of A) if (B.has(x)) inter++;
  const union = A.size + B.size - inter;
  return union === 0 ? 0 : inter / union;
}

export function traditionScore(
  contentTradition: Tradition,
  guideTraditions: Tradition[],
  userAff: Partial<Record<Tradition, number>>,
): number {
  let s = 0;
  if (guideTraditions.includes(contentTradition)) s += 0.6;
  s += 0.4 * (userAff[contentTradition] ?? 0);
  return Math.min(1, s);
}

export function freshnessBoost(publishedAt: string, now: Date): number {
  const days = Math.max(0, (now.getTime() - new Date(publishedAt).getTime()) / 86_400_000);
  if (days <= 30) return 0.2;
  if (days <= 180) return 0.1;
  if (days <= 365) return 0.05;
  return 0;
}

export function ratingBoost(c: ReadingContent): number {
  if (c.ratingCount < 3) return 0;
  return Math.min(0.15, (c.ratingAvg - 3) * 0.075);
}

export function scoreContent(
  content: ReadingContent,
  ctx: BookingContext,
  history: UserReadingHistory,
  now: Date = new Date(),
): { score: number; reasonTags: string[] } {
  if (history.purchased.includes(content.id) || history.completed.includes(content.id)) {
    return { score: 0, reasonTags: ["already_consumed"] };
  }

  const reasonTags: string[] = [];
  const sameGuideScore = ctx.guideContentIds.includes(content.id) ? 0.35 : 0;
  if (ctx.guideContentIds.includes(content.id)) reasonTags.push("same_guide");

  const tScore = traditionScore(content.tradition, ctx.guideTraditions, history.traditionAffinity);
  if (tScore > 0.3) reasonTags.push("tradition_alignment");

  const topicOverlap = jaccardOverlap(content.topics, [
    ...ctx.guideTopics,
    ...history.affinityTopics,
  ]);
  if (topicOverlap > 0.2) reasonTags.push("topic_overlap");

  const fresh = freshnessBoost(content.publishedAt, now);
  const rate = ratingBoost(content);
  const langScore = content.language === "pt-BR" ? 0.05 : 0;
  const freeBoost = !content.isPremium && content.priceCents === 0 ? 0.05 : 0;

  const total =
    sameGuideScore +
    0.3 * tScore +
    0.4 * topicOverlap +
    fresh +
    rate +
    langScore +
    freeBoost;

  return { score: Math.min(1, total), reasonTags };
}

export function rankSuggestions(
  candidates: ReadingContent[],
  ctx: BookingContext,
  history: UserReadingHistory,
  opts: { limit?: number; minScore?: number; now?: Date } = {},
): RankedSuggestion[] {
  const limit = opts.limit ?? 5;
  const minScore = opts.minScore ?? 0.15;
  const now = opts.now ?? new Date();

  return candidates
    .map((c) => {
      const { score, reasonTags } = scoreContent(c, ctx, history, now);
      return { content: c, score, reasonTags };
    })
    .filter((r) => r.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function groupByKind(
  ranked: RankedSuggestion[],
): Partial<Record<ContentKind, RankedSuggestion[]>> {
  const out: Partial<Record<ContentKind, RankedSuggestion[]>> = {};
  for (const r of ranked) {
    const k = r.content.kind;
    if (!out[k]) out[k] = [];
    out[k]!.push(r);
  }
  return out;
}

export function pitchForSuggestion(s: RankedSuggestion): string {
  const tags = s.reasonTags;
  if (tags.includes("same_guide")) {
    return `Mais do(a) ${s.content.authorDisplayName} sobre esse tema`;
  }
  if (tags.includes("topic_overlap") && tags.includes("tradition_alignment")) {
    return "Combina com o que você busca e com a tradição da consulta";
  }
  if (tags.includes("topic_overlap")) {
    return "Toca em temas parecidos com o que você marcou";
  }
  if (tags.includes("tradition_alignment")) {
    return "Da mesma tradição do(a) guia";
  }
  return "Escolhido a partir do seu histórico";
}

export function crossSellForBooking(args: {
  booking: MarketplaceBooking;
  guideTraditions: Tradition[];
  guideTopics: string[];
  guideContentIds: string[];
  history: UserReadingHistory;
  catalog: ReadingContent[];
  limit?: number;
}): RankedSuggestion[] {
  const ctx: BookingContext = {
    booking: args.booking,
    guideTraditions: args.guideTraditions,
    guideTopics: args.guideTopics,
    guideContentIds: args.guideContentIds,
  };
  return rankSuggestions(args.catalog, ctx, args.history, { limit: args.limit ?? 5 });
}
