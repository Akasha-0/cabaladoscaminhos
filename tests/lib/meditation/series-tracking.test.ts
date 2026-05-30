import { describe, it, expect, beforeEach } from 'vitest';
import {
  trackSeries,
  getSeries,
  getAllSeries,
  clearSeries,
  type SeriesEntry,
  type TrackSeriesOptions,
} from '@/lib/meditation/series-tracking';

describe('series-tracking', () => {
  beforeEach(() => {
    clearSeries();
  });

  describe('trackSeries', () => {
    it('creates a series entry for a meditation', () => {
      trackSeries({ meditationId: 'med-1' });
      const series = getSeries('med-1');
      expect(series.length).toBe(1);
      expect(series[0].meditationId).toBe('med-1');
    });

    it('marks entry as completed by default', () => {
      trackSeries({ meditationId: 'med-1' });
      const series = getSeries('med-1');
      expect(series[0].completed).toBe(true);
    });

    it('respects completed option', () => {
      trackSeries({ meditationId: 'med-1', completed: false });
      const series = getSeries('med-1');
      expect(series[0].completed).toBe(false);
    });

    it('creates entry with ISO date string', () => {
      trackSeries({ meditationId: 'med-1' });
      const series = getSeries('med-1');
      expect(series[0].date).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('accumulates multiple entries for same meditation', () => {
      trackSeries({ meditationId: 'med-1' });
      trackSeries({ meditationId: 'med-1' });
      const series = getSeries('med-1');
      expect(series.length).toBe(2);
    });
  });

  describe('getSeries', () => {
    it('returns empty array for unknown meditation', () => {
      const series = getSeries('non-existent');
      expect(series).toEqual([]);
    });

    it('returns all entries for a meditation', () => {
      trackSeries({ meditationId: 'med-a' });
      trackSeries({ meditationId: 'med-b' });
      trackSeries({ meditationId: 'med-a' });
      const series = getSeries('med-a');
      expect(series.length).toBe(2);
    });
  });

  describe('getAllSeries', () => {
    it('returns all series data keyed by meditation id', () => {
      trackSeries({ meditationId: 'med-x' });
      trackSeries({ meditationId: 'med-y' });
      const all = getAllSeries();
      expect(all['med-x']).toBeDefined();
      expect(all['med-y']).toBeDefined();
    });

    it('returns empty object when no series', () => {
      const all = getAllSeries();
      expect(Object.keys(all).length).toBe(0);
    });
  });

  describe('clearSeries', () => {
    it('clears all series when called without id', () => {
      trackSeries({ meditationId: 'med-1' });
      trackSeries({ meditationId: 'med-2' });
      clearSeries();
      expect(getAllSeries()).toEqual({});
    });

    it('clears specific meditation series', () => {
      trackSeries({ meditationId: 'med-a' });
      trackSeries({ meditationId: 'med-b' });
      clearSeries('med-a');
      expect(getSeries('med-a')).toEqual([]);
      expect(getSeries('med-b').length).toBe(1);
    });
  });
});