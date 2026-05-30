import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAnalytics } from '@/hooks/useAnalytics';

// Mock Next.js navigation hooks
vi.mock('next/navigation', () => ({
  usePathname: () => '/test',
  useSearchParams: () => new URLSearchParams(),
}));

describe('useAnalytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns trackPage function', () => {
    const { result } = renderHook(() => useAnalytics());
    
    expect(typeof result.current.trackPage).toBe('function');
  });

  it('returns trackEvent function', () => {
    const { result } = renderHook(() => useAnalytics());
    
    expect(typeof result.current.trackEvent).toBe('function');
  });

  it('trackPage is callable', () => {
    const { result } = renderHook(() => useAnalytics());
    
    expect(() => result.current.trackPage('/test')).not.toThrow();
  });

  it('trackPage accepts title parameter', () => {
    const { result } = renderHook(() => useAnalytics());
    
    expect(() => result.current.trackPage('/test', 'Test Page')).not.toThrow();
  });

  it('trackEvent is callable', () => {
    const { result } = renderHook(() => useAnalytics());
    
    expect(() => result.current.trackEvent('test_event')).not.toThrow();
  });

  it('trackEvent accepts properties', () => {
    const { result } = renderHook(() => useAnalytics());
    
    expect(() => result.current.trackEvent('test_event', { key: 'value', count: 1 })).not.toThrow();
  });

  it('custom analytics overrides default', () => {
    const customAnalytics = {
      trackPage: vi.fn(),
      trackEvent: vi.fn(),
    };

    const { result } = renderHook(() => useAnalytics(customAnalytics));
    
    result.current.trackPage('/test', 'Test');
    result.current.trackEvent('event', { data: 'value' });
    
    expect(customAnalytics.trackPage).toHaveBeenCalledWith('/test', 'Test');
    expect(customAnalytics.trackEvent).toHaveBeenCalledWith('event', { data: 'value' });
  });

  it('returns object with both functions', () => {
    const { result } = renderHook(() => useAnalytics());
    
    expect(result.current).toHaveProperty('trackPage');
    expect(result.current).toHaveProperty('trackEvent');
    expect(Object.keys(result.current)).toHaveLength(2);
  });

  it('trackEvent handles undefined properties', () => {
    const { result } = renderHook(() => useAnalytics());
    
    expect(() => result.current.trackEvent('event', undefined)).not.toThrow();
  });

  it('trackEvent handles empty properties', () => {
    const { result } = renderHook(() => useAnalytics());
    
    expect(() => result.current.trackEvent('event', {})).not.toThrow();
  });
});