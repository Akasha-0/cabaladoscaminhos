import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLayerState } from '@/components/akasha/hooks/useLayerState';

describe('useLayerState', () => {
  it('initializes with null active and hovered layer', () => {
    const { result } = renderHook(() => useLayerState());
    expect(result.current.activeLayer).toBeNull();
    expect(result.current.hoveredLayer).toBeNull();
  });

  it('ringPaused is false when no layer active', () => {
    const { result } = renderHook(() => useLayerState());
    expect(result.current.ringPaused).toBe(false);
  });

  it('ringPaused is true when Layer 4 is active', () => {
    const { result } = renderHook(() => useLayerState());
    act(() => {
      result.current.setActiveLayer(4);
    });
    expect(result.current.ringPaused).toBe(true);
  });

  it('opacity returns 1 when no layer is active (all dimmed → full)', () => {
    const { result } = renderHook(() => useLayerState());
    expect(result.current.opacity(1)).toBe(1);
    expect(result.current.opacity(2)).toBe(1);
    expect(result.current.opacity(3)).toBe(1);
  });

  it('opacity returns 1 for the active layer', () => {
    const { result } = renderHook(() => useLayerState());
    act(() => {
      result.current.setActiveLayer(2);
    });
    expect(result.current.opacity(2)).toBe(1);
  });

  it('opacity returns 0.3 for non-active/non-hovered layers when something is active', () => {
    const { result } = renderHook(() => useLayerState());
    act(() => {
      result.current.setActiveLayer(2);
    });
    expect(result.current.opacity(1)).toBe(0.3);
    expect(result.current.opacity(3)).toBe(0.3);
  });

  it('opacity returns 1 for hovered layer even if different layer is active', () => {
    const { result } = renderHook(() => useLayerState());
    act(() => {
      result.current.setActiveLayer(2);
      result.current.setHoveredLayer(3);
    });
    // Hovered layer (3) should be full opacity even though active is 2
    expect(result.current.opacity(3)).toBe(1);
    // Active layer (2) should still be full opacity
    expect(result.current.opacity(2)).toBe(1);
  });

  it('setActiveLayer toggles: clicking same layer deactivates it', () => {
    const { result } = renderHook(() => useLayerState());
    act(() => {
      result.current.setActiveLayer(2);
    });
    expect(result.current.activeLayer).toBe(2);
    act(() => {
      result.current.setActiveLayer(2);
    });
    expect(result.current.activeLayer).toBeNull();
  });

  it('setActiveLayer sets new layer when different from current', () => {
    const { result } = renderHook(() => useLayerState());
    act(() => {
      result.current.setActiveLayer(1);
    });
    expect(result.current.activeLayer).toBe(1);
    act(() => {
      result.current.setActiveLayer(3);
    });
    expect(result.current.activeLayer).toBe(3);
  });

  it('setHoveredLayer accepts null to clear hover', () => {
    const { result } = renderHook(() => useLayerState());
    act(() => {
      result.current.setHoveredLayer(2);
    });
    expect(result.current.hoveredLayer).toBe(2);
    act(() => {
      result.current.setHoveredLayer(null);
    });
    expect(result.current.hoveredLayer).toBeNull();
  });

  it('edge case: opacity for hoveredLayer === activeLayer → 1 (not 0.3)', () => {
    const { result } = renderHook(() => useLayerState());
    act(() => {
      result.current.setActiveLayer(2);
      result.current.setHoveredLayer(2);
    });
    // When hovered === active, still returns 1 (not 0.3)
    expect(result.current.opacity(2)).toBe(1);
    expect(result.current.opacity(3)).toBe(0.3);
  });

  it('edge case: opacity when only hovered (no active) → 1', () => {
    const { result } = renderHook(() => useLayerState());
    act(() => {
      result.current.setHoveredLayer(4);
    });
    // With no active layer but hovered set, non-hovered layers return 1 (activeLayer === null path)
    expect(result.current.opacity(4)).toBe(1);
    expect(result.current.opacity(1)).toBe(1);
    expect(result.current.opacity(2)).toBe(1);
  });
});
