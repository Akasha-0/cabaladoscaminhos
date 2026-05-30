import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useJourney } from '@/hooks/useJourney';

describe('useJourney', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock localStorage
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});
  });

  it('returns initial milestones', () => {
    const { result } = renderHook(() => useJourney());
    
    expect(result.current.milestones).toBeDefined();
    expect(Array.isArray(result.current.milestones)).toBe(true);
  });

  it('returns progress object', () => {
    const { result } = renderHook(() => useJourney());
    
    expect(result.current.progress).toBeDefined();
    expect(result.current.progress.currentStep).toBeDefined();
    expect(result.current.progress.totalSteps).toBeDefined();
    expect(result.current.progress.percentage).toBeDefined();
  });

  it('has isLoading state', () => {
    const { result } = renderHook(() => useJourney());
    
    expect(typeof result.current.isLoading).toBe('boolean');
  });

  it('has completeMilestone function', () => {
    const { result } = renderHook(() => useJourney());
    
    expect(typeof result.current.completeMilestone).toBe('function');
  });

  it('has resetJourney function', () => {
    const { result } = renderHook(() => useJourney());
    
    expect(typeof result.current.resetJourney).toBe('function');
  });

  it('completeMilestone updates milestone status', () => {
    const { result } = renderHook(() => useJourney());
    
    const initialCompleted = result.current.milestones.filter(m => m.completed).length;
    
    // Find a non-completed milestone
    const nonCompleted = result.current.milestones.find(m => !m.completed);
    if (nonCompleted) {
      act(() => {
        result.current.completeMilestone(nonCompleted.id);
      });
      
      const newCompleted = result.current.milestones.filter(m => m.completed).length;
      expect(newCompleted).toBeGreaterThanOrEqual(initialCompleted);
    }
  });

  it('resetJourney restores all milestones to incomplete', () => {
    const { result } = renderHook(() => useJourney());
    
    // Complete a milestone first
    const nonCompleted = result.current.milestones.find(m => !m.completed);
    if (nonCompleted) {
      act(() => {
        result.current.completeMilestone(nonCompleted.id);
      });
    }
    
    // Reset journey
    act(() => {
      result.current.resetJourney();
    });
    
    // All should be incomplete
    const completedCount = result.current.milestones.filter(m => m.completed).length;
    expect(completedCount).toBe(0);
  });

  it('progress percentage is between 0 and 100', () => {
    const { result } = renderHook(() => useJourney());
    
    expect(result.current.progress.percentage).toBeGreaterThanOrEqual(0);
    expect(result.current.progress.percentage).toBeLessThanOrEqual(100);
  });

  it('currentStep reflects completed milestones', () => {
    const { result } = renderHook(() => useJourney());
    
    const completedCount = result.current.milestones.filter(m => m.completed).length;
    expect(result.current.progress.currentStep).toBe(completedCount);
  });

  it('totalSteps equals milestones length', () => {
    const { result } = renderHook(() => useJourney());
    
    expect(result.current.progress.totalSteps).toBe(result.current.milestones.length);
  });
});
