import { describe, it, expect, beforeEach } from 'vitest';
import { saveGuidance, getGuidanceHistory, clearGuidanceHistory, type GuidanceRecord } from '@/lib/guidance/guidance-history';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string): string | null => store[key] ?? null,
    setItem: (key: string, value: string): void => { store[key] = value; },
    removeItem: (key: string): void => { delete store[key]; },
    clear: (): void => { store = {}; },
    get length(): number { return Object.keys(store).length; },
    key: (i: number): string | null => Object.keys(store)[i] ?? null,
  };
})();

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('guidance-history', () => {
  describe('saveGuidance', () => {
    it('creates record with id and timestamp', () => {
      const input = 'What is my path?';
      const response = 'Follow the light.';
      const result = saveGuidance({ input, response });

      expect(result.id).toBeDefined();
      expect(typeof result.id).toBe('string');
      expect(result.timestamp).toBeDefined();
      expect(typeof result.timestamp).toBe('number');
    });

    it('adds record to history', () => {
      const record = { input: 'Test input', response: 'Test response' };
      saveGuidance(record);

      const history = getGuidanceHistory();
      expect(history).toHaveLength(1);
      expect(history[0].input).toBe('Test input');
      expect(history[0].response).toBe('Test response');
    });

    it('returns GuidanceRecord with correct fields', () => {
      const record = { input: 'Test', response: 'Answer', archetype: 'warrior' };
      const result = saveGuidance(record);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('timestamp');
      expect(result.input).toBe('Test');
      expect(result.response).toBe('Answer');
      expect(result.archetype).toBe('warrior');
    });

    it('keeps max 50 entries', () => {
      // Save 55 entries
      for (let i = 0; i < 55; i++) {
        saveGuidance({ input: `Input ${i}`, response: `Response ${i}` });
      }

      const history = getGuidanceHistory();
      expect(history).toHaveLength(50);
      // Oldest in the truncated list should be "5"
      expect(history[49].input).toBe('Input 5');
    });
  });

  describe('getGuidanceHistory', () => {
    it('returns empty array when no data', () => {
      localStorage.clear();
      const result = getGuidanceHistory();
      expect(result).toEqual([]);
    });

    it('returns array when data exists', () => {
      const testData: GuidanceRecord[] = [
        { id: '1', timestamp: 1000, input: 'First', response: 'First response' },
        { id: '2', timestamp: 2000, input: 'Second', response: 'Second response' },
      ];
      localStorage.setItem('cabala_guidance_history', JSON.stringify(testData));

      const result = getGuidanceHistory();
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('1');
      expect(result[1].id).toBe('2');
    });

    it('returns empty array on corrupted JSON', () => {
      localStorage.setItem('cabala_guidance_history', 'not valid json {{{');

      const result = getGuidanceHistory();
      expect(result).toEqual([]);
    });
  });

  describe('clearGuidanceHistory', () => {
    it('removes data from localStorage', () => {
      saveGuidance({ input: 'Test', response: 'Test' });
      expect(getGuidanceHistory()).toHaveLength(1);

      clearGuidanceHistory();
      expect(getGuidanceHistory()).toEqual([]);
    });
  });

  describe('multiple saves accumulate in history', () => {
    it('most recent first', () => {
      saveGuidance({ input: 'First', response: 'First response' });
      saveGuidance({ input: 'Second', response: 'Second response' });
      saveGuidance({ input: 'Third', response: 'Third response' });

      const history = getGuidanceHistory();
      expect(history).toHaveLength(3);
      expect(history[0].input).toBe('Third');
      expect(history[1].input).toBe('Second');
      expect(history[2].input).toBe('First');
    });
  });
});