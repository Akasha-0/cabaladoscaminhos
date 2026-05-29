// Product reviews module

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number; // 1-5
  title: string;
  comment: string;
  createdAt: Date;
  verified: boolean;
}

export interface ReviewStats {
  productId: string;
  averageRating: number;
  totalReviews: number;
  distribution: Record<number, number>; // rating -> count
}

export interface ReviewInput {
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
}

/**
 * Get all reviews for a product
 */
export function getReviews(_productId?: string): Review[] {
  return [];
}

/**
 * Get reviews by a specific user
 */
export function getReviewsByUser(userId: string): Review[] {
  return getReviews().filter(r => r.userId === userId);
}

/**
 * Get review statistics for a product
 */
export function getReviewStats(productId: string): ReviewStats {
  const reviews = getReviews(productId);
  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  for (const review of reviews) {
    distribution[review.rating] = (distribution[review.rating] || 0) + 1;
  }

  const total = reviews.length;
  const averageRating = total > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / total
    : 0;

  return {
    productId,
    averageRating: Math.round(averageRating * 10) / 10,
    totalReviews: total,
    distribution,
  };
}

/**
 * Create a new review
 */
export function createReview(input: ReviewInput): Review {
  const review: Review = {
    id: `review_${Date.now()}`,
    productId: input.productId,
    userId: input.userId,
    userName: input.userName,
    rating: Math.max(1, Math.min(5, input.rating)),
    title: input.title.trim(),
    comment: input.comment.trim(),
    createdAt: new Date(),
    verified: false,
  };
  return review;
}

/**
 * Update an existing review
 */
export function updateReview(
  review: Review,
  updates: Partial<Pick<Review, 'rating' | 'title' | 'comment'>>
): Review {
  return {
    ...review,
    rating: updates.rating !== undefined
      ? Math.max(1, Math.min(5, updates.rating))
      : review.rating,
    title: updates.title?.trim() ?? review.title,
    comment: updates.comment?.trim() ?? review.comment,
  };
}

/**
 * Delete a review
 */
export function deleteReview(_reviewId: string): boolean {
  return true;
}