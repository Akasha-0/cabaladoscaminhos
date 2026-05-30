import { describe, it, expect, beforeEach } from 'vitest'
import {
  calculateGrade,
  validateMetricValue,
  calculateScoreFromValue,
  PerformanceMonitor,
  DEFAULT_THRESHOLDS,
  MetricCategory,
  MetricSeverity,
  MetricStatus,
} from '@/lib/quality/metrics-framework'

// ============================================================
// Grade Calculation Tests
// ============================================================
describe('calculateGrade', () => {
  it('returns A+ for scores >= 97', () => {
    expect(calculateGrade(97)).toBe('A+')
    expect(calculateGrade(100)).toBe('A+')
  })

  it('returns A for scores >= 93', () => {
    expect(calculateGrade(93)).toBe('A')
    expect(calculateGrade(96)).toBe('A')
  })

  it('returns A- for scores >= 90', () => {
    expect(calculateGrade(90)).toBe('A-')
    expect(calculateGrade(92)).toBe('A-')
  })

  it('returns B+ for scores >= 87', () => {
    expect(calculateGrade(87)).toBe('B+')
    expect(calculateGrade(89)).toBe('B+')
  })

  it('returns B for scores >= 83', () => {
    expect(calculateGrade(83)).toBe('B')
    expect(calculateGrade(86)).toBe('B')
  })

  it('returns B- for scores >= 80', () => {
    expect(calculateGrade(80)).toBe('B-')
    expect(calculateGrade(82)).toBe('B-')
  })

  it('returns C+ for scores >= 77', () => {
    expect(calculateGrade(77)).toBe('C+')
    expect(calculateGrade(79)).toBe('C+')
  })

  it('returns C for scores >= 73', () => {
    expect(calculateGrade(73)).toBe('C')
    expect(calculateGrade(76)).toBe('C')
  })

  it('returns C- for scores >= 70', () => {
    expect(calculateGrade(70)).toBe('C-')
    expect(calculateGrade(72)).toBe('C-')
  })

  it('returns F for scores below 70', () => {
    expect(calculateGrade(69)).toBe('F')
    expect(calculateGrade(60)).toBe('F')
    expect(calculateGrade(0)).toBe('F')
  })
})

// ============================================================
// Threshold Validation Tests
// ============================================================
describe('validateMetricValue', () => {
  it('validates gte (greater than or equal)', () => {
    expect(validateMetricValue(100, 80, 'gte')).toBe(true)
    expect(validateMetricValue(80, 80, 'gte')).toBe(true)
    expect(validateMetricValue(79, 80, 'gte')).toBe(false)
  })

  it('validates lte (less than or equal)', () => {
    expect(validateMetricValue(50, 80, 'lte')).toBe(true)
    expect(validateMetricValue(80, 80, 'lte')).toBe(true)
    expect(validateMetricValue(81, 80, 'lte')).toBe(false)
  })

  it('validates eq (exact equality)', () => {
    expect(validateMetricValue(80, 80, 'eq')).toBe(true)
    expect(validateMetricValue(79, 80, 'eq')).toBe(false)
  })

  it('validates gt (strictly greater)', () => {
    expect(validateMetricValue(81, 80, 'gt')).toBe(true)
    expect(validateMetricValue(80, 80, 'gt')).toBe(false)
  })

  it('validates lt (strictly less)', () => {
    expect(validateMetricValue(79, 80, 'lt')).toBe(true)
    expect(validateMetricValue(80, 80, 'lt')).toBe(false)
  })
})

// ============================================================
// Score Calculation Tests
// ============================================================
describe('calculateScoreFromValue', () => {
  const thresholds = { critical: 90, high: 80, medium: 70, low: 60 }

  it('returns 100 for critical threshold', () => {
    expect(calculateScoreFromValue(95, thresholds)).toBe(100)
  })

  it('returns score between 80-100 for high threshold', () => {
    const score = calculateScoreFromValue(85, thresholds)
    expect(score).toBeGreaterThan(80)
    expect(score).toBeLessThan(100)
  })

  it('returns score between 60-80 for medium threshold', () => {
    const score = calculateScoreFromValue(75, thresholds)
    expect(score).toBeGreaterThan(60)
    expect(score).toBeLessThan(80)
  })

  it('returns score between 0-40 for low threshold', () => {
    const score = calculateScoreFromValue(30, thresholds)
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThan(40)
  })
})

// ============================================================
// Performance Monitor Tests
// ============================================================
describe('PerformanceMonitor', () => {
  let monitor: PerformanceMonitor

  beforeEach(() => {
    monitor = new PerformanceMonitor()
  })

  it('records values and returns null for unknown name', () => {
    expect(monitor.getStats('unknown')).toBe(null)
  })

  it('records single value and returns stats', () => {
    monitor.record('response-time', 100)
    const stats = monitor.getStats('response-time')
    expect(stats).not.toBe(null)
    expect(stats!.avg).toBe(100)
    expect(stats!.min).toBe(100)
    expect(stats!.max).toBe(100)
    expect(stats!.p95).toBe(100)
    expect(stats!.p99).toBe(100)
  })

  it('calculates correct average for multiple values', () => {
    monitor.record('response-time', 100)
    monitor.record('response-time', 200)
    monitor.record('response-time', 300)
  it('calculates p95 and p99 correctly for multiple values', () => {
    // With 20 values (indices 0-19), p95 = index 19 (Math.floor(20*0.95)=19), p99 = index 19 (Math.floor(20*0.99)=19)
    for (let i = 1; i <= 20; i++) {
      monitor.record('latency', i * 10) // 10, 20, ..., 200
    }
    const stats = monitor.getStats('latency')
    expect(stats!.avg).toBe(105) // average of 10, 20, ..., 200 = (10+200)*20/2/20 = 105
    expect(stats!.min).toBe(10)
    expect(stats!.max).toBe(200)
    expect(stats!.p95).toBe(200)
    expect(stats!.p99).toBe(200)
  })
  })
})

// ============================================================
// DEFAULT_THRESHOLDS Tests
// ============================================================
describe('DEFAULT_THRESHOLDS', () => {
  it('has entries for all metric categories', () => {
    const categories = Object.keys(DEFAULT_THRESHOLDS)
    expect(categories.length).toBeGreaterThan(0)
  })

  it('each threshold has required fields', () => {
    for (const threshold of DEFAULT_THRESHOLDS) {
      expect(threshold).toHaveProperty('category')
      expect(threshold).toHaveProperty('weight')
    }
  })

  it('has spiritual_correlations category', () => {
    const spiritual = DEFAULT_THRESHOLDS.find(
      (t: { category: string }) => t.category === 'spiritual_correlations'
    )
    expect(spiritual).toBeDefined()
  })
})

// ============================================================
// Metric Enums Tests (using Zod .parse)
// ============================================================
describe('Metric enums', () => {
  it('MetricCategory parses valid values', () => {
    expect(MetricCategory.parse('spiritual_correlations')).toBe('spiritual_correlations')
    expect(MetricCategory.parse('ai_integration')).toBe('ai_integration')
    expect(MetricCategory.parse('performance')).toBe('performance')
  })

  it('MetricSeverity parses valid values', () => {
    expect(MetricSeverity.parse('critical')).toBe('critical')
    expect(MetricSeverity.parse('high')).toBe('high')
    expect(MetricSeverity.parse('medium')).toBe('medium')
    expect(MetricSeverity.parse('low')).toBe('low')
    expect(MetricSeverity.parse('info')).toBe('info')
  })

  it('MetricStatus parses valid values', () => {
    expect(MetricStatus.parse('pass')).toBe('pass')
    expect(MetricStatus.parse('fail')).toBe('fail')
    expect(MetricStatus.parse('warning')).toBe('warning')
    expect(MetricStatus.parse('skipped')).toBe('skipped')
    expect(MetricStatus.parse('error')).toBe('error')
  })

  it('MetricCategory rejects invalid values', () => {
    expect(() => MetricCategory.parse('invalid')).toThrow()
  })
})
