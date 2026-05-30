import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getFlow, setFlow, energyFlow, type FlowState, type FlowConfig } from '@/lib/energy/energy-flow';

describe('energy-flow module', () => {
  beforeEach(() => {
    // Reset module state between tests
    setFlow(50);
  });

  describe('getFlow', () => {
    it('should return current flow state with default values', () => {
      const state = getFlow();
      
      expect(state).toHaveProperty('current');
      expect(state).toHaveProperty('config');
      expect(state.current).toBe(50);
      expect(state.config).toMatchObject({
        minFlow: 0,
        maxFlow: 100,
        unit: 'units',
      });
    });

    it('should return a new config object each call (not shared)', () => {
      const state1 = getFlow();
      state1.config.minFlow = -999;
      
      const state2 = getFlow();
      expect(state2.config.minFlow).toBe(0);
    });

    it('should reflect updated flow after setFlow', () => {
      setFlow(75);
      const state = getFlow();
      
      expect(state.current).toBe(75);
    });
  });

  describe('setFlow', () => {
    it('should set flow to valid value within bounds', () => {
      setFlow(25);
      expect(getFlow().current).toBe(25);
    });

    it('should clamp value to max when exceeding maxFlow', () => {
      setFlow(150);
      expect(getFlow().current).toBe(100);
    });

    it('should clamp value to min when below minFlow', () => {
      setFlow(-50);
      expect(getFlow().current).toBe(0);
    });

    it('should accept boundary values', () => {
      setFlow(0);
      expect(getFlow().current).toBe(0);
      
      setFlow(100);
      expect(getFlow().current).toBe(100);
    });
  });

  describe('energyFlow object', () => {
    it('should have getFlow method', () => {
      expect(typeof energyFlow.getFlow).toBe('function');
    });

    it('should have setFlow method', () => {
      expect(typeof energyFlow.setFlow).toBe('function');
    });

    it('should delegate getFlow to the exported function', () => {
      setFlow(42);
      const state = energyFlow.getFlow();
      
      expect(state.current).toBe(42);
      expect(state.config.unit).toBe('units');
    });

    it('should delegate setFlow to the exported function', () => {
      energyFlow.setFlow(80);
      
      expect(getFlow().current).toBe(80);
    });

    it('should maintain state across multiple operations', () => {
      energyFlow.setFlow(30);
      const s1 = energyFlow.getFlow();
      
      energyFlow.setFlow(60);
      const s2 = energyFlow.getFlow();
      
      expect(s1.current).toBe(30);
      expect(s2.current).toBe(60);
    });
  });

  describe('FlowConfig type', () => {
    it('should have correct config structure', () => {
      const state: FlowState = getFlow();
      const config: FlowConfig = state.config;
      
      expect(typeof config.minFlow).toBe('number');
      expect(typeof config.maxFlow).toBe('number');
      expect(typeof config.unit).toBe('string');
    });
  });
});