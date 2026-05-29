"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Insight } from '@/lib/api/types';
import {
  fetchAllDashboardData,
  fetchDashboardSubset,
  invalidateCache,
  getConnectionStatus,
  dashboardCache,
  requestDeduplicator,
  getLunarPhase,
  calculateElement,
  type UserSpiritualData,
  type DashboardData,
  type DataFetchOptions,
  type EnergyData,
  type CorrelationData,
  type JourneyData,
  type Prediction,
  type Notification,
  type FetchResult,
} from '@/lib/dashboard/data-fetcher';

// ============================================================
// TYPE RE-EXPORTS (for backwards compatibility)
// ============================================================

export type { 
  UserSpiritualData, 
  DashboardData,
  DataFetchOptions,
  EnergyData, 
  CorrelationData, 
  JourneyData,
  Prediction,
  Notification,
} from '@/lib/dashboard/data-fetcher';

/**
 * Aggregated dashboard data (for backward compatibility)
 */
export interface DashboardAggregatedData {
  energy?: EnergyData;
  correlations?: CorrelationData;
  insights?: Insight[];
  journey?: JourneyData;
  predictions?: Prediction[];
  notifications?: Notification[];
  lastUpdated: number;
}

/**
 * Dashboard data options for selective fetching
 */
export interface DashboardDataOptions {
  includeEnergy?: boolean;
  includeCorrelations?: boolean;
  includeInsights?: boolean;
  includeJourney?: boolean;
  includePredictions?: boolean;
  includeNotifications?: boolean;
  refreshInterval?: number;  // ms, 0 = no refresh
  cacheTTL?: number;  // ms, default 5 minutes
  forceRefresh?: boolean;
  debounceMs?: number; // Debounce rapid refetch requests
}

/**
 * Connection status indicator
 */
export interface ConnectionState {
  status: 'connected' | 'disconnected' | 'unstable';
  lastChecked: number;
}

/**
 * Return type for the hook
 */
export interface UseDashboardDataReturn {
  data: DashboardAggregatedData | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  connectionStatus: ConnectionState;
  isStale: boolean;
  partialLoad: boolean;
}

// ============================================================
// CONSTANTS
// ============================================================

const DEFAULT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const DEFAULT_DEBOUNCE_MS = 300;
const DEFAULT_BACKGROUND_REFRESH_THRESHOLD = 0.5;

// ============================================================
// ERROR BOUNDARY & DEGRADATION
// ============================================================

interface ErrorBoundaryState {
  hasError: boolean;
  fallbackData: DashboardAggregatedData | null;
  errorMessage: string | null;
}

/**
 * Create error boundary state
 */
function createErrorBoundary(): ErrorBoundaryState {
  return {
    hasError: false,
    fallbackData: null,
    errorMessage: null,
  };
}

// ============================================================
// MAIN HOOK
// ============================================================

/**
 * Unified hook for accessing all dashboard AI data
 * 
 * Features:
 * - Selective data loading (essential vs heavy data)
 * - TTL-based caching with invalidation
 * - Real-time updates via polling
 * - Connection status tracking
 * - Request deduplication
 * - Debounced refetch on rapid changes
 * - Graceful degradation on API failure
 * - Memory management for large datasets
 * 
 * @param userId - Unique user identifier
 * @param userData - User spiritual data for analysis
 * @param options - Configuration options for data fetching
 * @returns Dashboard data, loading state, error, and utility functions
 */
export function useDashboardData(
  userId: string,
  userData: UserSpiritualData,
  options: DashboardDataOptions = {}
): UseDashboardDataReturn {
  const {
    includeEnergy = true,
    includeCorrelations = true,
    includeInsights = true,
    includeJourney = true,
    includePredictions = false,
    includeNotifications = false,
    refreshInterval = 0,
    cacheTTL = DEFAULT_CACHE_TTL,
    forceRefresh = false,
    debounceMs = DEFAULT_DEBOUNCE_MS,
  } = options;

  // State
  const [data, setData] = useState<DashboardAggregatedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionState>(() => ({
    status: 'connected',
    lastChecked: Date.now(),
  }));
  const [isStale, setIsStale] = useState(false);
  const [partialLoad, setPartialLoad] = useState(false);
  const [errorBoundary, setErrorBoundary] = useState<ErrorBoundaryState>(createErrorBoundary);

  // Refs
  const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userIdRef = useRef(userId);
  const userDataRef = useRef(userData);
  const refreshCountRef = useRef(0);
  const lastRefreshRef = useRef(0);
  const refreshRef = useRef<(() => Promise<void>) | null>(null);
  // Keep refs updated
  useEffect(() => {
    userIdRef.current = userId;
    userDataRef.current = userData;
  }, [userId, userData]);

  /**
   * Check and update connection status
   */
  const checkConnection = useCallback(() => {
    const status = getConnectionStatus();
    setConnectionStatus({
      status,
      lastChecked: Date.now(),
    });
    return status;
  }, []);

  /**
   * Memory cleanup for large datasets
   */
  const cleanupMemory = useCallback(() => {
    const stats = dashboardCache.stats();
    
    // If cache is getting large, evict old entries
    if (stats.size > 30) {
      const keysToRemove = stats.keys.slice(0, 10);
      keysToRemove.forEach(key => dashboardCache.delete(key));
    }
    
    // Clear deduplicator pending requests older than 30s
    // (handled internally by request deduplicator)
  }, []);

  /**
   * Fetch all requested dashboard data
   */
  const refresh = useCallback(async () => {
    const currentUserId = userIdRef.current;
    const currentUserData = userDataRef.current;
    
    if (!currentUserId || !currentUserData.nome) {
      setLoading(false);
      return;
    }

    // Check connection first
    const connection = checkConnection();
    if (connection === 'disconnected') {
      // Try to use cached data on disconnect
      const cacheKey = dashboardCache.generateKey(currentUserId, options);
      const cached = dashboardCache.get<DashboardData>(cacheKey, cacheTTL);
      if (cached) {
        setData(cached);
        setLoading(false);
        setIsStale(true);
        setError(null);
        return;
      }
    }

    // Check for rapid successive refreshes (debounce)
    const now = Date.now();
    if (debounceMs > 0 && now - lastRefreshRef.current < debounceMs) {
      // Schedule debounced refresh
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        refreshRef.current?.();
      }, debounceMs);
      return;
    }
    lastRefreshRef.current = now;
    refreshCountRef.current++;

    setLoading(true);
    setError(null);
    setPartialLoad(false);

    try {
      // Build fetch options
      const fetchOptions: DataFetchOptions = {
        includeEnergy,
        includeCorrelations,
        includeInsights,
        includeJourney,
        includePredictions,
        includeNotifications,
        cacheTTL,
        forceRefresh,
        backgroundRefreshThreshold: DEFAULT_BACKGROUND_REFRESH_THRESHOLD,
      };

      // Use deduplicated request
      const requestKey = `refresh:${currentUserId}:${refreshCountRef.current}`;
      const result = await requestDeduplicator.execute<FetchResult>(
        requestKey,
        () => fetchAllDashboardData(currentUserId, currentUserData, fetchOptions),
        debounceMs
      );

      // Update state with fetched data
      setData(result.data);
      setPartialLoad(result.partial);
      setIsStale(result.partial);

      // Handle errors gracefully (set error state but keep data)
      if (result.errors.length > 0) {
        console.warn('Partial load errors:', result.errors);
        // Don't fail completely - use partial data
        if (result.data) {
          setError(null); // Clear error since we have partial data
        }
      } else {
        setError(null);
      }

      // Memory cleanup after successful fetch
      cleanupMemory();

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch dashboard data');
      
      // Error boundary: try to use fallback data
      const cacheKey = dashboardCache.generateKey(currentUserId, options);
      const fallbackCached = dashboardCache.get<DashboardData>(cacheKey, cacheTTL);
      
      if (fallbackCached) {
        // Graceful degradation: use cached data
        setData(fallbackCached);
        setIsStale(true);
        console.warn('Using cached data due to fetch error:', error.message);
      } else {
        // No fallback available - set error
        setError(error);
      }
    } finally {
      setLoading(false);
    }
  }, [
    includeEnergy, 
    includeCorrelations, 
    includeInsights, 
    includeJourney,
    includePredictions,
    includeNotifications,
    cacheTTL, 
    forceRefresh,
    debounceMs,
    checkConnection,
    cleanupMemory,
    options,
  ]);

  // Keep refresh ref updated to avoid TDZ in recursive calls
  useEffect(() => {
    refreshRef.current = refresh;
  }, [refresh]);
  /**
   * Partial refresh for specific data types
   */
  const refreshSubset = useCallback(async (
    subset: 'energy' | 'correlations' | 'insights' | 'journey' | 'predictions' | 'notifications'
  ) => {
    const currentUserId = userIdRef.current;
    const currentUserData = userDataRef.current;

    if (!currentUserId || !currentUserData.nome) return;

    try {
      const subsetKey = `include${subset.charAt(0).toUpperCase() + subset.slice(1)}` as keyof DataFetchOptions;
      const result = await fetchDashboardSubset(
        currentUserId,
        subsetKey as 'includeEnergy' | 'includeCorrelations' | 'includeInsights' | 'includeJourney' | 'includePredictions' | 'includeNotifications',
        currentUserData,
        cacheTTL
      );

      // Merge partial data with existing
      setData(prev => prev ? { ...prev, ...result } : result as DashboardAggregatedData);
    } catch (err) {
      console.warn(`Partial refresh of ${subset} failed:`, err);
    }
  }, [cacheTTL]);

  /**
   * Invalidate cache and force refresh
   */
  const invalidateAndRefresh = useCallback(async () => {
    if (userIdRef.current) {
      invalidateCache(userIdRef.current);
    }
    await refresh();
  }, [refresh]);

  // Initial fetch and cache check
  useEffect(() => {
    const cacheKey = dashboardCache.generateKey(userId, options);
    
    // Try to load from cache first
    const cached = dashboardCache.get<DashboardData>(cacheKey, cacheTTL);
    
    if (cached) {
      setData(cached);
      setLoading(false);
      
      // Check if data is stale and needs background refresh
      const stale = dashboardCache.isStale(cacheKey, DEFAULT_BACKGROUND_REFRESH_THRESHOLD);
      setIsStale(stale);
      
      // Background refresh if stale
      if (stale && !forceRefresh) {
        refresh();
      }
    } else {
      refresh();
    }
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Setup auto-refresh polling
  useEffect(() => {
    // Clear any existing interval
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }

    // Setup new interval if specified
    if (refreshInterval > 0) {
      refreshIntervalRef.current = setInterval(() => {
        checkConnection();
        if (connectionStatus.status !== 'disconnected') {
          refresh();
        }
      }, refreshInterval);
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, [refreshInterval, refresh, checkConnection, connectionStatus.status]);

  // Monitor online/offline status
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      checkConnection();
      // Refresh when coming back online
      if (data && !isStale) {
        refresh();
      }
    };

    const handleOffline = () => {
      setConnectionStatus({
        status: 'disconnected',
        lastChecked: Date.now(),
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    checkConnection();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [checkConnection, data, isStale, refresh]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    refresh: invalidateAndRefresh,
    connectionStatus,
    isStale,
    partialLoad,
  };
}

// ============================================================
// EXPORTS
// ============================================================

export {
  getLunarPhase,
  calculateElement,
  invalidateCache as clearDashboardCache,
  dashboardCache,
};