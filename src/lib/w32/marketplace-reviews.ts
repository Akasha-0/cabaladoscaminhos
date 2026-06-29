// src/lib/w32/marketplace-reviews.ts
// Cycle 32 worker D — marketplace reviews
// Composes w28/marketplace-stripe-connect (booking/payment shape) + w31/marketplace-leitura (reading content shape)
// Scope: rating, written feedback, verified-buyer badge, helpful vote, sort, seller response
// Namespace: w32 — self-contained, no runtime deps on other waves

export type ReviewSort = "recent" | "helpful" | "rating_high" | "rating_low";
export type ReviewTopic =
  | "conexao"
  | "clareza"
  | "profundidade"
  | "acolhimento"
  | "pontualidade"
  | "valor";

export interface ReviewRating {
  readonly overall: number; // 1-5
  readonly topics: Readonly<Record<ReviewTopic, number>>; // 1-5 each
}

export interface Review {
  readonly id: string;
  readonly bookingId: string;
  readonly listingId: string;
  readonly authorUserId: string;
  readonly authorDisplayName: string;
  readonly authorReputationLevel: number; // 0-10
  readonly rating: ReviewRating;
  readonly body: string;
  readonly photos: ReadonlyArray<string>;
  readonly createdAt: string; // ISO
  readonly helpfulVotes: number;
  readonly verifiedBuyer: boolean;
  readonly sellerResponse: SellerResponse | null;
  readonly flagged: boolean;
  readonly language: "pt-BR" | "en" | "es";
}

export interface SellerResponse {
  readonly body: string;
  readonly respondedAt: string; // ISO
  readonly responderUserId: string;
}

export const EMPTY_RATING: ReviewRating = {
  overall: 0,
  topics: {
    conexao: 0,
    clareza: 0,
    profundidade: 0,
    acolhimento: 0,
    pontualidade: 0,
    valor: 0,
  },
};

/** Build an average rating summary across many reviews. */
export function summarizeReviews(
  reviews: ReadonlyArray<Review>,
): {
  average: number;
  count: number;
  distribution: Readonly<Record<1 | 2 | 3 | 4 | 5, number>>;
  topicAverages: Readonly<Record<ReviewTopic, number>>;
} {
  if (reviews.length === 0) {
    return {
      average: 0,
      count: 0,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      topicAverages: {
        conexao: 0,
        clareza: 0,
        profundidade: 0,
        acolhimento: 0,
        pontualidade: 0,
        valor: 0,
      },
    };
  }
  const distribution: Record<1 | 2 | 3 | 4 | 5, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const sums: Record<ReviewTopic, number> = {
    conexao: 0,
    clareza: 0,
    profundidade: 0,
    acolhimento: 0,
    pontualidade: 0,
    valor: 0,
  };
  let overallSum = 0;
  for (const r of reviews) {
    if (r.flagged) continue;
    const bucket = Math.max(1, Math.min(5, Math.round(r.rating.overall))) as 1 | 2 | 3 | 4 | 5;
    distribution[bucket] += 1;
    overallSum += r.rating.overall;
    for (const t of Object.keys(sums) as ReviewTopic[]) {
      sums[t] += r.rating.topics[t];
    }
  }
  const considered = reviews.filter((r) => !r.flagged).length;
  const topicAverages = {
    conexao: considered > 0 ? sums.conexao / considered : 0,
    clareza: considered > 0 ? sums.clareza / considered : 0,
    profundidade: considered > 0 ? sums.profundidade / considered : 0,
    acolhimento: considered > 0 ? sums.acolhimento / considered : 0,
    pontualidade: considered > 0 ? sums.pontualidade / considered : 0,
    valor: considered > 0 ? sums.valor / considered : 0,
  };
  return {
    average: considered > 0 ? overallSum / considered : 0,
    count: considered,
    distribution,
    topicAverages,
  };
}

/** Sort reviews per the active mode. */
export function sortReviews(
  reviews: ReadonlyArray<Review>,
  sort: ReviewSort,
): ReadonlyArray<Review> {
  const copy = reviews.slice();
  switch (sort) {
    case "recent":
      copy.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
      break;
    case "helpful":
      copy.sort((a, b) => b.helpfulVotes - a.helpfulVotes);
      break;
    case "rating_high":
      copy.sort((a, b) => b.rating.overall - a.rating.overall);
      break;
    case "rating_low":
      copy.sort((a, b) => a.rating.overall - b.rating.overall);
      break;
  }
  return copy;
}

export interface HelpfulVoteCheck {
  readonly canVote: boolean;
  readonly reason: "guest" | "self" | "duplicate" | "ok";
}

/** Determine if a user can mark a review as helpful. */
export function evaluateHelpfulVote(
  review: Review,
  voterUserId: string,
  existingVotes: ReadonlyArray<{ reviewId: string; userId: string }>,
): HelpfulVoteCheck {
  if (!voterUserId) return { canVote: false, reason: "guest" };
  if (review.authorUserId === voterUserId) return { canVote: false, reason: "self" };
  if (existingVotes.some((v) => v.reviewId === review.id && v.userId === voterUserId)) {
    return { canVote: false, reason: "duplicate" };
  }
  return { canVote: true, reason: "ok" };
}

/** Validate a review submission before persistence. */
export function validateReviewSubmission(
  input: {
    rating: ReviewRating;
    body: string;
    bookingId: string;
  },
): { ok: true } | { ok: false; error: string } {
  if (!input.bookingId) return { ok: false, error: "booking inválido" };
  if (input.rating.overall < 1 || input.rating.overall > 5) {
    return { ok: false, error: "nota geral deve ser entre 1 e 5" };
  }
  const trimmed = input.body.trim();
  if (trimmed.length < 20) return { ok: false, error: "avaliação muito curta (mínimo 20)" };
  if (trimmed.length > 2000) return { ok: false, error: "avaliação muito longa (máximo 2000)" };
  for (const [topic, score] of Object.entries(input.rating.topics)) {
    if (score < 1 || score > 5) return { ok: false, error: `tópico ${topic} fora da faixa` };
  }
  return { ok: true };
}

/** Build a stars glyph string (e.g. "★★★★☆"). */
export function starsGlyph(overall: number): string {
  const full = Math.max(0, Math.min(5, Math.round(overall)));
  return "★".repeat(full) + "☆".repeat(5 - full);
}
