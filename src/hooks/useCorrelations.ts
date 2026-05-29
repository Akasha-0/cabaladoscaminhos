'use client';

import useSWR, { SWRConfiguration } from 'swr';
import { useCallback, useMemo } from 'react';

// Types
export interface Correlation {
  id: string;
  source: string;
  sourceType: 'spiritual' | 'technical';
  target: string;
  targetType: 'spiritual' | 'technical';
  strength: number;
  type: 'positive' | 'negative' | 'neutral';
  description: string;
  lastUpdated: string;
  anomaly?: boolean;
}

export interface Pattern {
  id: string;
  type: 'spiritual' | 'technical' | 'mixed';
  title: string;
  description: string;
  confidence: number;
  timestamp: string;
  alerts?: string[];
  metrics?: Record<string, number>;
}

export interface CorrelationStrength {
  id: string;
  source: string;
  target: string;
  strength: number;
  trend: 'up' | 'down' | 'stable';
  lastUpdated: string;
  anomaly?: boolean;
}

// Fetcher
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
};

// Default config
const DEFAULT_CONFIG: SWRConfiguration = {
  refreshInterval: 30000,
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
};

/**
 * Get all correlations
 */
export function useCorrelations(options?: SWRConfiguration) {
  const config = useMemo(() => ({ ...DEFAULT_CONFIG, ...options }), [options]);

  const { data, error, isLoading, isValidating, mutate } = useSWR<{
    correlations: Correlation[];
    total: number;
    timestamp: string;
  }>('/api/dashboard/correlation', fetcher, config);

  const refresh = useCallback(() => mutate(), [mutate]);

  return {
    correlations: data?.correlations || [],
    total: data?.total || 0,
    error,
    isLoading,
    isValidating,
    refresh,
  };
}

/**
 * Get correlation patterns
 */
export function useCorrelationPatterns(options?: SWRConfiguration) {
  const config = useMemo(() => ({ ...DEFAULT_CONFIG, ...options }), [options]);

  const { data, error, isLoading, mutate } = useSWR<{
    patterns: Pattern[];
    total: number;
    timestamp: string;
  }>('/api/dashboard/correlation?type=patterns', fetcher, config);

  const refresh = useCallback(() => mutate(), [mutate]);

  return {
    patterns: data?.patterns || [],
    total: data?.total || 0,
    error,
    isLoading,
    refresh,
  };
}

/**
 * Get correlation strength metrics
 */
export function useCorrelationStrength(options?: SWRConfiguration) {
  const config = useMemo(() => ({ ...DEFAULT_CONFIG, ...options }), [options]);

  const { data, error, isLoading, mutate } = useSWR<{
    correlations: CorrelationStrength[];
    stats: {
      avg: number;
      max: number;
      min: number;
      count: number;
    };
    timestamp: string;
  }>('/api/dashboard/correlation?type=strength', fetcher, config);

  const refresh = useCallback(() => mutate(), [mutate]);

  return {
    correlations: data?.correlations || [],
    stats: data?.stats || { avg: 0, max: 0, min: 0, count: 0 },
    error,
    isLoading,
    refresh,
  };
}

/**
 * Get spiritual-only correlations
 */
export function useSpiritualCorrelations(options?: SWRConfiguration) {
  const config = useMemo(() => ({ ...DEFAULT_CONFIG, ...options }), [options]);

  const { data, error, isLoading, mutate } = useSWR<{
    correlations: Correlation[];
    total: number;
  }>('/api/dashboard/correlation?sourceType=spiritual', fetcher, config);

  const refresh = useCallback(() => mutate(), [mutate]);

  return {
    correlations: data?.correlations || [],
    total: data?.total || 0,
    error,
    isLoading,
    refresh,
  };
}

/**
 * Get technical-only correlations
 */
export function useTechnicalCorrelations(options?: SWRConfiguration) {
  const config = useMemo(() => ({ ...DEFAULT_CONFIG, ...options }), [options]);

  const { data, error, isLoading, mutate } = useSWR<{
    correlations: Correlation[];
    total: number;
  }>('/api/dashboard/correlation?sourceType=technical', fetcher, config);

  const refresh = useCallback(() => mutate(), [mutate]);

  return {
    correlations: data?.correlations || [],
    total: data?.total || 0,
    error,
    isLoading,
    refresh,
  };
}

/**
 * Analyze new correlation
 */
export function useAnalyzeCorrelation() {
  const analyze = useCallback(async (source: string, target: string, type?: 'positive' | 'negative' | 'neutral') => {
    const res = await fetch('/api/dashboard/correlation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source, target, type }),
    });

    if (!res.ok) throw new Error('Failed to analyze correlation');
    
    const data = await res.json();
    return data.correlation;
  }, []);

  return { analyze };
}

// Export all hooks
export default {
  useCorrelations,
  useCorrelationPatterns,
  useCorrelationStrength,
  useSpiritualCorrelations,
  useTechnicalCorrelations,
  useAnalyzeCorrelation,
};