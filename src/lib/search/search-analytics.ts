// ============================================================
// SEARCH ANALYTICS - CABALA DOS CAMINHOS
// ============================================================
// Search analytics and popular searches tracking
// ============================================================

export interface SearchAnalytics {
  totalSearches: number;
  popularSearches: PopularSearch[];
  recentSearches: RecentSearch[];
  searchTrends: SearchTrend[];
}

export interface PopularSearch {
  query: string;
  count: number;
  category?: string;
}

export interface RecentSearch {
  query: string;
  timestamp: Date;
  results: number;
}

export interface SearchTrend {
  date: string;
  searches: number;
}

// In-memory storage (replace with database in production)
const analyticsStore: {
  totalSearches: number;
  popularSearches: Map<string, number>;
  recentSearches: RecentSearch[];
  trends: Map<string, number>;
} = {
  totalSearches: 0,
  popularSearches: new Map(),
  recentSearches: [],
  trends: new Map(),
};

const MAX_RECENT_SEARCHES = 100;
const MAX_POPULAR_SEARCHES = 20;

export function recordSearch(
  query: string,
  results: number = 0,
  category?: string
): void {
  const normalizedQuery = query.toLowerCase().trim();

  // Update total searches
  analyticsStore.totalSearches++;

  // Update popular searches
  const currentCount = analyticsStore.popularSearches.get(normalizedQuery) || 0;
  analyticsStore.popularSearches.set(normalizedQuery, currentCount + 1);

  // Add to recent searches
  analyticsStore.recentSearches.unshift({
    query: normalizedQuery,
    timestamp: new Date(),
    results,
  });

  // Trim recent searches to max
  if (analyticsStore.recentSearches.length > MAX_RECENT_SEARCHES) {
    analyticsStore.recentSearches = analyticsStore.recentSearches.slice(
      0,
      MAX_RECENT_SEARCHES
    );
  }

  // Update daily trends
  const today = new Date().toISOString().split('T')[0];
  const currentTrend = analyticsStore.trends.get(today) || 0;
  analyticsStore.trends.set(today, currentTrend + 1);
}

export function getAnalytics(): SearchAnalytics {
  // Convert popular searches to sorted array
  const popularSearches: PopularSearch[] = Array.from(
    analyticsStore.popularSearches.entries()
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, MAX_POPULAR_SEARCHES)
    .map(([query, count]) => ({
      query,
      count,
    }));

  // Get search trends for last 30 days
  const searchTrends: SearchTrend[] = [];
  const today = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    searchTrends.push({
      date: dateStr,
      searches: analyticsStore.trends.get(dateStr) || 0,
    });
  }

  return {
    totalSearches: analyticsStore.totalSearches,
    popularSearches,
    recentSearches: analyticsStore.recentSearches.slice(0, 10),
    searchTrends,
  };
}

export function getPopularSearches(limit: number = 10): PopularSearch[] {
  return Array.from(analyticsStore.popularSearches.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([query, count]) => ({
      query,
      count,
    }));
}

export function clearAnalytics(): void {
  analyticsStore.totalSearches = 0;
  analyticsStore.popularSearches.clear();
  analyticsStore.recentSearches = [];
  analyticsStore.trends.clear();
}
