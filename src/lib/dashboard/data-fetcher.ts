/**
 * Dashboard Data Fetcher
 * High-performance data fetching with caching, real-time updates, and error handling
 */

import type { Insight } from '@/lib/api/types';

// ============================================================
// INTERFACES
// ============================================================

/**
 * User spiritual data for dashboard analysis
 */
export interface UserSpiritualData {
  nome: string;
  dataNascimento: string;
  orixa?: string;
  caminho?: number;
  odu?: string;
  destino?: number;
}

/**
 * Energy data from spiritual energy analyzer
 */
export interface EnergyData {
  lunarPhase: 'nova' | 'crescente' | 'cheia' | 'minguante';
  element: string;
  orixa: string;
  dominantEnergy: string;
  recommendations: string[];
  warnings: string[];
  timestamp: number;
}

/**
 * Correlation data from correlation engine
 */
export interface CorrelationData {
  numerology: {
    numero: number;
    element: string;
  };
  astrology: {
    sign: string;
    element: string;
  };
  orixa: {
    name: string;
    element: string;
  };
  odu: {
    name: string;
    number: number;
  };
  correlations: Array<{
    source: string;
    target: string;
    strength: number;
  }>;
  timestamp: number;
}

/**
 * Journey progress data
 */
export interface JourneyData {
  currentStep: number;
  totalSteps: number;
  milestones: Array<{
    id: string;
    title: string;
    completed: boolean;
    completedAt?: string;
  }>;
  streak: number;
  timestamp: number;
}

/**
 * Prediction data for future insights
 */
export interface Prediction {
  id: string;
  type: 'short_term' | 'medium_term' | 'long_term';
  title: string;
  description: string;
  confidence: number;
  timeframe: string;
  relatedElement?: string;
  timestamp: number;
}

/**
 * Notification data for user alerts
 */
export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'reminder';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  read: boolean;
  createdAt: number;
}

/**
 * Aggregated dashboard data
 */
export interface DashboardData {
  energy?: EnergyData;
  correlations?: CorrelationData;
  insights?: Insight[];
  journey?: JourneyData;
  predictions?: Prediction[];
  notifications?: Notification[];
  lastUpdated: number;
}

/**
 * Data fetch options for selective loading
 */
export interface DataFetchOptions {
  includeEnergy?: boolean;
  includeCorrelations?: boolean;
  includeInsights?: boolean;
  includeJourney?: boolean;
  includePredictions?: boolean;
  includeNotifications?: boolean;
  /** Priority: essential loads first, heavy loads lazy */
  priority?: 'essential' | 'normal' | 'low';
  /** Enable real-time updates via polling */
  pollingInterval?: number; // ms, 0 = disabled
  /** Cache TTL in ms */
  cacheTTL?: number;
  /** Force fresh data, ignore cache */
  forceRefresh?: boolean;
  /** Background refresh threshold (0-1) relative to TTL */
  backgroundRefreshThreshold?: number;
}

// ============================================================
// CACHE SYSTEM
// ============================================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  etag?: string;
}

interface CacheConfig {
  maxSize: number; // Max entries
  defaultTTL: number; // ms
}

const DEFAULT_CACHE_CONFIG: CacheConfig = {
  maxSize: 50,
  defaultTTL: 5 * 60 * 1000, // 5 minutes
};

class DashboardCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private accessOrder: string[] = [];
  private config: CacheConfig;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...DEFAULT_CACHE_CONFIG, ...config };
  }

  /**
   * Generate cache key including userId and options
   */
  generateKey(userId: string, options?: DataFetchOptions): string {
    const parts = [`user:${userId}`];
    
    if (options) {
      const flags = [
        options.includeEnergy && 'e',
        options.includeCorrelations && 'c',
        options.includeInsights && 'i',
        options.includeJourney && 'j',
        options.includePredictions && 'p',
        options.includeNotifications && 'n',
      ].filter(Boolean).join('');
      
      if (flags) parts.push(`flags:${flags}`);
      
      if (options.pollingInterval) parts.push(`poll:${options.pollingInterval}`);
    }
    
    return parts.join('|');
  }

  /**
   * Get cached data if valid
   */
  get<T>(key: string, ttl?: number): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    
    if (!entry) return null;
    
    const maxAge = ttl ?? this.config.defaultTTL;
    const age = Date.now() - entry.timestamp;
    
    if (age > maxAge) {
      this.delete(key);
      return null;
    }
    
    // Update access order for LRU
    this.touch(key);
    
    return entry.data;
  }

  /**
   * Set cached data
   */
  set<T>(key: string, data: T, ttl?: number): void {
    // Evict if at capacity
    if (this.cache.size >= this.config.maxSize) {
      this.evictLRU();
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
    this.touch(key);
  }

  /**
   * Check if data is stale but refreshable
   */
  isStale(key: string, threshold: number = 0.5): boolean {
    const entry = this.cache.get(key);
    if (!entry) return true;
    
    const age = Date.now() - entry.timestamp;
    return age > this.config.defaultTTL * threshold;
  }

  /**
   * Delete cache entry
   */
  delete(key: string): void {
    this.cache.delete(key);
    this.accessOrder = this.accessOrder.filter(k => k !== key);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    this.accessOrder = [];
  }

  /**
   * Get cache stats
   */
  stats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  private touch(key: string): void {
    this.accessOrder = this.accessOrder.filter(k => k !== key);
    this.accessOrder.push(key);
  }

  private evictLRU(): void {
    if (this.accessOrder.length > 0) {
      const lru = this.accessOrder.shift();
      if (lru) this.cache.delete(lru);
    }
  }
}

// Singleton cache instance
export const dashboardCache = new DashboardCache();

// ============================================================
// REQUEST DEDUPLICATION
// ============================================================

class RequestDeduplicator {
  private pending = new Map<string, Promise<unknown>>();
  private debounceTimers = new Map<string, ReturnType<typeof setTimeout>>();

  /**
   * Execute request with deduplication
   */
  async execute<T>(
    key: string,
    request: () => Promise<T>,
    debounceMs: number = 0
  ): Promise<T> {
    // Check for pending request
    const existing = this.pending.get(key);
    if (existing) {
      return existing as Promise<T>;
    }

    // Debounce rapid requests
    if (debounceMs > 0) {
      return new Promise((resolve, reject) => {
        const existingTimer = this.debounceTimers.get(key);
        if (existingTimer) {
          clearTimeout(existingTimer);
        }

        const timer = setTimeout(async () => {
          this.debounceTimers.delete(key);
          try {
            const result = await this.execute(key, request, 0);
            resolve(result);
          } catch (err) {
            reject(err);
          }
        }, debounceMs);

        this.debounceTimers.set(key, timer);
      });
    }

    // Execute and track
    const promise = request().finally(() => {
      this.pending.delete(key);
    });

    this.pending.set(key, promise);
    return promise;
  }

  /**
   * Cancel debounced request
   */
  cancel(key: string): void {
    const timer = this.debounceTimers.get(key);
    if (timer) {
      clearTimeout(timer);
      this.debounceTimers.delete(key);
    }
  }

  /**
   * Check if request is pending
   */
  isPending(key: string): boolean {
    return this.pending.has(key);
  }
}

export const requestDeduplicator = new RequestDeduplicator();

// ============================================================
// RETRY LOGIC
// ============================================================

interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
};

async function withRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const { maxRetries, baseDelay, maxDelay, backoffMultiplier } = {
    ...DEFAULT_RETRY_CONFIG,
    ...config,
  };

  let lastError: Error | undefined;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      
      if (attempt < maxRetries) {
        const delay = Math.min(
          baseDelay * Math.pow(backoffMultiplier, attempt),
          maxDelay
        );
        await sleep(delay);
      }
    }
  }
  
  throw lastError ?? new Error('Max retries exceeded');
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================
// HELPERS
// ============================================================

/**
 * Calculate lunar phase
 */
export function getLunarPhase(): 'nova' | 'crescente' | 'cheia' | 'minguante' {
  const LUNAR_CYCLE = 29.53058867;
  const KNOWN_NEW_MOON = new Date('2000-01-06T18:14:00Z');
  const now = new Date();
  const diffMs = now.getTime() - KNOWN_NEW_MOON.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  const lunarAge = diffDays % LUNAR_CYCLE;
  const phase = lunarAge / LUNAR_CYCLE;
  
  if (phase < 0.125) return 'nova';
  if (phase < 0.375) return 'crescente';
  if (phase < 0.625) return 'cheia';
  if (phase < 0.875) return 'minguante';
  return 'nova';
}

/**
 * Calculate element from birth date
 */
export function calculateElement(dataNascimento: string): string {
  const elements = ['água', 'fogo', 'terra', 'ar', 'éter'];
  const sum = dataNascimento.replace(/\D/g, '').split('')
    .reduce((acc, d) => acc + parseInt(d), 0);
  return elements[sum % elements.length];
}

/**
 * Calculate numerology number
 */
export function calculateNumerology(dataNascimento: string): number {
  const numeros = dataNascimento.replace(/\D/g, '');
  let soma = numeros.split('').reduce((acc, d) => acc + parseInt(d), 0);
  while (soma > 9 && soma !== 11 && soma !== 22 && soma !== 33) {
    soma = soma.toString().split('').reduce((acc, d) => acc + parseInt(d), 0);
  }
  return soma;
}

// ============================================================
// DATA FETCHERS
// ============================================================

/**
 * Fetch energy data
 */
async function fetchEnergyData(userData: UserSpiritualData): Promise<EnergyData> {
  return withRetry(async () => {
    const lunarPhase = getLunarPhase();
    const element = calculateElement(userData.dataNascimento);
    
    return {
      lunarPhase,
      element,
      orixa: userData.orixa || 'oxum',
      dominantEnergy: element,
      recommendations: [
        'Pratique meditação ao amanhecer',
        'Conecte-se com a natureza',
        'Mantenha pensamentos positivos'
      ],
      warnings: [
        'Evite conflitos desnecessários',
        'Não force situações além do tempo'
      ],
      timestamp: Date.now()
    };
  });
}

/**
 * Fetch correlation data (heavy - lazy load)
 */
async function fetchCorrelationData(userData: UserSpiritualData): Promise<CorrelationData> {
  return withRetry(async () => {
    const element = calculateElement(userData.dataNascimento);
    const numero = calculateNumerology(userData.dataNascimento);
    
    return {
      numerology: {
        numero,
        element
      },
      astrology: {
        sign: 'aries',
        element: 'fogo'
      },
      orixa: {
        name: userData.orixa || 'oxum',
        element
      },
      odu: {
        name: userData.odu || 'ogunda',
        number: userData.caminho || 1
      },
      correlations: [
        { source: 'numerologia', target: element, strength: 0.9 },
        { source: 'orixa', target: element, strength: 0.85 },
        { source: 'astrologia', target: element, strength: 0.75 }
      ],
      timestamp: Date.now()
    };
  });
}

/**
 * Fetch insights from API
 */
async function fetchInsights(userData: UserSpiritualData): Promise<Insight[]> {
  return withRetry(async () => {
    try {
      const response = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: userData.nome,
          dataNascimento: userData.dataNascimento
        })
      });
      
      if (!response.ok) {
        return getFallbackInsights(userData);
      }
      
      const data = await response.json();
      return data.insights || [];
    } catch {
      return getFallbackInsights(userData);
    }
  });
}

/**
 * Get fallback insights when API unavailable
 */
function getFallbackInsights(userData: UserSpiritualData): Insight[] {
  const element = calculateElement(userData.dataNascimento);
  return [
    {
      id: `insight_${Date.now()}_1`,
      tipo: 'diario' as const,
      titulo: `Energia de ${element}`,
      conteudo: `Sua energia dominante é ${element}. Permita que esta energia guie suas decisões hoje.`,
      data: new Date().toISOString(),
      relacionado: {
        tipo: 'numero',
        valor: element
      }
    },
    {
      id: `insight_${Date.now()}_2`,
      tipo: 'diario' as const,
      titulo: 'Caminho Espiritual',
      conteudo: 'Você está em um momento de transformação. Continue firme em sua prática.',
      data: new Date().toISOString()
    }
  ];
}

/**
 * Fetch journey data
 */
async function fetchJourneyData(): Promise<JourneyData> {
  return withRetry(async () => {
    // Get journey from localStorage or use defaults
    if (typeof window !== 'undefined') {
      const storedJourney = localStorage.getItem('user_journey');
      if (storedJourney) {
        try {
          return JSON.parse(storedJourney);
        } catch {
          // Fall through to defaults
        }
      }
    }
    
    return {
      currentStep: 2,
      totalSteps: 5,
      milestones: [
        { id: '1', title: 'Primeiro Contato', completed: true, completedAt: new Date().toISOString() },
        { id: '2', title: 'Exploração', completed: true, completedAt: new Date().toISOString() },
        { id: '3', title: 'Aprofundamento', completed: false },
        { id: '4', title: 'Prática Regular', completed: false },
        { id: '5', title: 'Maestria', completed: false }
      ],
      streak: 5,
      timestamp: Date.now()
    };
  });
}

/**
 * Fetch predictions (heavy - lazy load)
 */
async function fetchPredictions(userData: UserSpiritualData): Promise<Prediction[]> {
  return withRetry(async () => {
    try {
      const response = await fetch('/api/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: userData.nome,
          dataNascimento: userData.dataNascimento
        })
      });
      
      if (!response.ok) {
        return getFallbackPredictions(userData);
      }
      
      const data = await response.json();
      return data.predictions || [];
    } catch {
      return getFallbackPredictions(userData);
    }
  });
}

/**
 * Get fallback predictions
 */
function getFallbackPredictions(userData: UserSpiritualData): Prediction[] {
  const element = calculateElement(userData.dataNascimento);
  return [
    {
      id: `pred_${Date.now()}_1`,
      type: 'short_term',
      title: `Ciclo de ${element}`,
      description: `Os próximos dias serão marcados por energia de ${element}. Aproveite para introspecção.`,
      confidence: 0.75,
      timeframe: '7 dias',
      relatedElement: element,
      timestamp: Date.now()
    },
    {
      id: `pred_${Date.now()}_2`,
      type: 'medium_term',
      title: 'Transformação Spiritual',
      description: 'Um período de crescimento espiritual se aproxima. Mantenha-se dedicado às práticas.',
      confidence: 0.68,
      timeframe: '30 dias',
      timestamp: Date.now()
    }
  ];
}

/**
 * Fetch notifications
 */
async function fetchNotifications(): Promise<Notification[]> {
  return withRetry(async () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('user_notifications');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          // Fall through
        }
      }
    }
    
    return getDefaultNotifications();
  });
}

/**
 * Get default notifications
 */
function getDefaultNotifications(): Notification[] {
  return [
    {
      id: `notif_${Date.now()}_1`,
      type: 'reminder',
      title: 'Prática Diária',
      message: 'Reserve um momento para sua prática espiritual.',
      priority: 'medium',
      read: false,
      createdAt: Date.now()
    }
  ];
}

// ============================================================
// UNIFIED DATA FETCHER
// ============================================================

export interface FetchResult {
  data: DashboardData;
  partial: boolean; // True if some data failed to load
  errors: string[];
}

/**
 * Fetch all dashboard data with selective loading and caching
 */
export async function fetchAllDashboardData(
  userId: string,
  userData: UserSpiritualData,
  options: DataFetchOptions = {}
): Promise<FetchResult> {
  const {
    includeEnergy = true,
    includeCorrelations = true,
    includeInsights = true,
    includeJourney = true,
    includePredictions = false, // Lazy load
    includeNotifications = false, // Lazy load
    cacheTTL = DEFAULT_CACHE_CONFIG.defaultTTL,
    forceRefresh = false,
  } = options;

  const cacheKey = dashboardCache.generateKey(userId, options);
  const errors: string[] = [];

  // Try cache first if not forcing refresh
  if (!forceRefresh) {
    const cached = dashboardCache.get<DashboardData>(cacheKey, cacheTTL);
    if (cached) {
      return { data: cached, partial: false, errors: [] };
    }
  }

  // Build data with priority loading
  const data: DashboardData = {
    lastUpdated: Date.now()
  };

  // Essential data loads first (sync)
  const essentialPromises: Promise<void>[] = [];

  if (includeEnergy) {
    essentialPromises.push(
      fetchEnergyData(userData)
        .then(energy => { data.energy = energy; })
        .catch(err => { errors.push(`energy: ${err.message}`); })
    );
  }

  if (includeInsights) {
    essentialPromises.push(
      fetchInsights(userData)
        .then(insights => { data.insights = insights; })
        .catch(err => { errors.push(`insights: ${err.message}`); })
    );
  }

  // Wait for essential data
  await Promise.all(essentialPromises);

  // Heavy data loads lazily (parallel)
  const heavyPromises: Promise<void>[] = [];

  if (includeCorrelations) {
    heavyPromises.push(
      fetchCorrelationData(userData)
        .then(correlations => { data.correlations = correlations; })
        .catch(err => { errors.push(`correlations: ${err.message}`); })
    );
  }

  if (includeJourney) {
    heavyPromises.push(
      fetchJourneyData()
        .then(journey => { data.journey = journey; })
        .catch(err => { errors.push(`journey: ${err.message}`); })
    );
  }

  if (includePredictions) {
    heavyPromises.push(
      fetchPredictions(userData)
        .then(predictions => { data.predictions = predictions; })
        .catch(err => { errors.push(`predictions: ${err.message}`); })
    );
  }

  if (includeNotifications) {
    heavyPromises.push(
      fetchNotifications()
        .then(notifications => { data.notifications = notifications; })
        .catch(err => { errors.push(`notifications: ${err.message}`); })
    );
  }

  // Load heavy data in parallel
  await Promise.all(heavyPromises);

  // Cache the result
  data.lastUpdated = Date.now();
  dashboardCache.set(cacheKey, data, cacheTTL);

  return {
    data,
    partial: errors.length > 0,
    errors
  };
}

/**
 * Fetch specific subset of dashboard data
 */
export async function fetchDashboardSubset(
  userId: string,
  subset: keyof Pick<DataFetchOptions, 'includeEnergy' | 'includeCorrelations' | 'includeInsights' | 'includeJourney' | 'includePredictions' | 'includeNotifications'>,
  userData: UserSpiritualData,
  cacheTTL: number = DEFAULT_CACHE_CONFIG.defaultTTL
): Promise<Partial<DashboardData>> {
  const options: DataFetchOptions = {
    [subset]: true,
    cacheTTL,
    forceRefresh: false
  };

  const cacheKey = dashboardCache.generateKey(userId, options);
  const cached = dashboardCache.get<DashboardData>(cacheKey, cacheTTL);
  
  if (cached) {
    return cached;
  }

  const { data } = await fetchAllDashboardData(userId, userData, options);
  return data;
}

/**
 * Invalidate cache for user
 */
export function invalidateCache(userId: string): void {
  const stats = dashboardCache.stats();
  const prefix = `user:${userId}`;
  
  for (const key of stats.keys) {
    if (key.startsWith(prefix)) {
      dashboardCache.delete(key);
    }
  }
}

/**
 * Get connection status
 */
export function getConnectionStatus(): 'connected' | 'disconnected' | 'unstable' {
  if (typeof navigator === 'undefined') return 'connected';
  
  if (!navigator.onLine) return 'disconnected';
  
  const connection = (navigator as Navigator & { connection?: { effectiveType?: string } }).connection;
  if (connection?.effectiveType === '2g' || connection?.effectiveType === 'slow-2g') {
    return 'unstable';
  }
  
  return 'connected';
}


// Alias for backward compatibility
export const clearCachedData = invalidateCache;