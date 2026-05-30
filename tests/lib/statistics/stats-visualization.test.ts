import { describe, it, expect } from 'vitest';
import { getVisualization, getChartByType, exportChartData } from '@/lib/statistics/stats-visualization';

describe('statistics/stats-visualization', () => {
  it('returns visualization data', () => {
    const viz = getVisualization();
    expect(viz.weeklyProgressChart).toBeDefined();
    expect(viz.categoryBreakdownChart).toBeDefined();
    expect(viz.streakData).toBeDefined();
  });

  it('returns a chart by type', () => {
    const chart = getChartByType('weekly');
    expect(chart).toBeDefined();
    expect(chart?.type).toBe('bar');
  });

  it('exports chart data', () => {
    const exported = exportChartData();
    expect(exported.charts.length).toBe(5);
    expect(exported.metadata).toBeDefined();
  });
});
