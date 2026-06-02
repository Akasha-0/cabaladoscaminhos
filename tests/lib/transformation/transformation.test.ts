import { describe, it, expect, beforeEach, afterEach } from 'vitest';
// @ts-ignore
import {
  getData,
  getDataById,
  getDataByCategory,
  TransformationData,
} from '../../../src/lib/transformation/transformation-data';
// @ts-ignore
import {
  trackProgress,
  getProgress,
  clearProgress,
  TransformationProgress,
} from '../../../src/lib/transformation/transformation-tracking';

// Mock localStorage for transformation-tracking tests
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('Transformation Data', () => {
  describe('getData', () => {
    it('should return array of transformation data', () => {
      const data = getData();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
    });

    it('should have required properties for each entry', () => {
      const data = getData();
      data.forEach((item) => {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('name');
        expect(item).toHaveProperty('namePt');
        expect(item).toHaveProperty('nameEn');
        expect(item).toHaveProperty('value');
        expect(item).toHaveProperty('min');
        expect(item).toHaveProperty('max');
        expect(item).toHaveProperty('unit');
        expect(item).toHaveProperty('description');
        expect(item).toHaveProperty('descriptionPt');
        expect(item).toHaveProperty('timestamp');
      });
    });

    it('should have value within min/max range', () => {
      const data = getData();
      data.forEach((item) => {
        expect(item.value).toBeGreaterThanOrEqual(item.min);
        expect(item.value).toBeLessThanOrEqual(item.max);
      });
    });

    it('should have string id values', () => {
      const data = getData();
      data.forEach((item) => {
        expect(typeof item.id).toBe('string');
        expect(item.id.length).toBeGreaterThan(0);
      });
    });
  });

  describe('getDataById', () => {
    it('should return transformation data by id', () => {
      const data = getData();
      if (data.length > 0) {
        const item = getDataById(data[0].id);
        expect(item).toBeDefined();
        expect(item?.id).toBe(data[0].id);
      }
    });

    it('should return undefined for non-existent id', () => {
      const item = getDataById('non-existent-id');
      expect(item).toBeUndefined();
    });
  });

  describe('getDataByCategory', () => {
    it('should return entries matching category prefix', () => {
      const data = getData();
      if (data.length > 0) {
        const firstId = data[0].id;
        const prefix = firstId.split('-')[0] + '-';
        const categoryData = getDataByCategory(prefix);
        expect(Array.isArray(categoryData)).toBe(true);
        categoryData.forEach((item) => {
          expect(item.id.startsWith(prefix)).toBe(true);
        });
      }
    });

    it('should return empty array for non-matching prefix', () => {
      const data = getDataByCategory('non-existent-prefix-');
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(0);
    });

    it('should return all entries when category matches many', () => {
      const data = getData();
      const prefix = data.length > 0 ? data[0].id.split('-')[0] + '-' : '';
      const categoryData = getDataByCategory(prefix);
      expect(categoryData.length).toBeLessThanOrEqual(data.length);
    });
  });
});

describe('Transformation Tracking', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('trackProgress', () => {
    it('should store progress entry in localStorage', () => {
      trackProgress('test-step');
      const progress = getProgress();
      expect(progress.length).toBe(1);
      expect(progress[0].step).toBe('test-step');
    });

    it('should set completed to true by default', () => {
      trackProgress('test-step');
      const progress = getProgress();
      expect(progress[0].completed).toBe(true);
    });

    it('should accept completed parameter', () => {
      trackProgress('test-step', false);
      const progress = getProgress();
      expect(progress[0].completed).toBe(false);
    });

    it('should update existing step', () => {
      trackProgress('test-step', true);
      trackProgress('test-step', false);
      const progress = getProgress();
      expect(progress.length).toBe(1);
      expect(progress[0].completed).toBe(false);
    });

    it('should have timestamp', () => {
      trackProgress('test-step');
      const progress = getProgress();
      expect(progress[0]).toHaveProperty('timestamp');
      expect(typeof progress[0].timestamp).toBe('number');
    });
  });

  describe('getProgress', () => {
    it('should return empty array when no progress stored', () => {
      const progress = getProgress();
      expect(Array.isArray(progress)).toBe(true);
      expect(progress.length).toBe(0);
    });

    it('should return stored progress entries', () => {
      trackProgress('step-1');
      trackProgress('step-2');
      const progress = getProgress();
      expect(progress.length).toBe(2);
    });

    it('should return progress in order of tracking', () => {
      trackProgress('first');
      trackProgress('second');
      trackProgress('third');
      const progress = getProgress();
      expect(progress[0].step).toBe('first');
      expect(progress[1].step).toBe('second');
      expect(progress[2].step).toBe('third');
    });
  });

  describe('clearProgress', () => {
    it('should remove all progress entries', () => {
      trackProgress('step-1');
      trackProgress('step-2');
      clearProgress();
      const progress = getProgress();
      expect(progress.length).toBe(0);
    });

    it('should allow adding new progress after clearing', () => {
      trackProgress('old-step');
      clearProgress();
      trackProgress('new-step');
      const progress = getProgress();
      expect(progress.length).toBe(1);
      expect(progress[0].step).toBe('new-step');
    });
  });
});