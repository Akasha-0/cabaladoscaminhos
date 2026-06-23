/**
 * @akasha/portal — useLayerState unit tests
 *
 * Tests the layer selection + opacity logic exported by useLayerState.
 */
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLayerState } from './useLayerState';
import type { Layer } from '@/components/akasha/mandala-geometry';

// ─── Constants ────────────────────────────────────────────────────────────────

const LAYERS = [1, 2, 3, 4, 5] as const satisfies readonly Layer[];

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Exercise every opacity branch for a given layer by driving state manually. */
function runOpacityScenarios(layer: Layer) {
  const { result } = renderHook(() => useLayerState());

  // Scenario 1 — null active (all visible)
  expect(result.current.opacity(layer)).toBe(1);

  // Scenario 2 — layer is active → visible
  act(() => result.current.setActiveLayer(layer));
  expect(result.current.opacity(layer)).toBe(1);

  // Scenario 3 — another layer is active, this one is not hovered → dimmed
  const otherLayer = (layer % 5 + 1) as Layer;
  act(() => result.current.setActiveLayer(otherLayer));
  expect(result.current.opacity(layer)).toBe(0.3);

  // Scenario 4 — hovered even when another is active → visible
  act(() => result.current.setHoveredLayer(layer));
  expect(result.current.opacity(layer)).toBe(1);

  // Scenario 5 — clear hover → dimmed again
  act(() => result.current.setHoveredLayer(null));
  expect(result.current.opacity(layer)).toBe(0.3);
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('useLayerState', () => {
  describe('initial state', () => {
    it('starts with null activeLayer and null hoveredLayer', () => {
      const { result } = renderHook(() => useLayerState());
      expect(result.current.activeLayer).toBeNull();
      expect(result.current.hoveredLayer).toBeNull();
    });

    it('ringPaused is false when no layer is active', () => {
      const { result } = renderHook(() => useLayerState());
      expect(result.current.ringPaused).toBe(false);
    });
  });

  describe('ringPaused — boundary: Layer 4', () => {
    it('ringPaused is true only when activeLayer is 4', () => {
      const { result } = renderHook(() => useLayerState());

      for (const layer of LAYERS) {
        act(() => result.current.setActiveLayer(layer));
        expect(result.current.ringPaused).toBe(layer === 4);
      }
    });
  });

  describe('handleSetActiveLayer — toggle behaviour', () => {
    it('sets the active layer when called with a layer', () => {
      const { result } = renderHook(() => useLayerState());
      act(() => result.current.setActiveLayer(3));
      expect(result.current.activeLayer).toBe(3);
    });

    it('clears the active layer (toggle-off) when called with the same layer', () => {
      const { result } = renderHook(() => useLayerState());
      act(() => result.current.setActiveLayer(2));
      expect(result.current.activeLayer).toBe(2);
      act(() => result.current.setActiveLayer(2));
      expect(result.current.activeLayer).toBeNull();
    });

    it('replaces the active layer when called with a different layer', () => {
      const { result } = renderHook(() => useLayerState());
      act(() => result.current.setActiveLayer(1));
      expect(result.current.activeLayer).toBe(1);
      act(() => result.current.setActiveLayer(5));
      expect(result.current.activeLayer).toBe(5);
    });
  });

  describe('handleSetHoveredLayer', () => {
    it('sets hoveredLayer to the given layer', () => {
      const { result } = renderHook(() => useLayerState());
      act(() => result.current.setHoveredLayer(4));
      expect(result.current.hoveredLayer).toBe(4);
    });

    it('clears hoveredLayer when passed null', () => {
      const { result } = renderHook(() => useLayerState());
      act(() => result.current.setHoveredLayer(2));
      expect(result.current.hoveredLayer).toBe(2);
      act(() => result.current.setHoveredLayer(null));
      expect(result.current.hoveredLayer).toBeNull();
    });
  });

  describe('opacity — edge case: all layers at boundary conditions', () => {
    it('returns 1 for all layers when activeLayer is null (null-active dimming rule)', () => {
      const { result } = renderHook(() => useLayerState());
      for (const layer of LAYERS) {
        expect(result.current.opacity(layer)).toBe(1);
      }
    });

    it('covers every opacity branch for every layer', () => {
      for (const layer of LAYERS) {
        runOpacityScenarios(layer);
      }
    });
  });
});
