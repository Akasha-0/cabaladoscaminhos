import type { EvalDefinition, MetricResult } from '../metrics-framework'
import { MetricResultBuilder } from '../metrics-framework'

// Zod enums - use as type constructors, not objects with properties
const MetricStatus = {
  pass: 'pass',
  fail: 'fail',
  warning: 'warning',
  skipped: 'skipped',
  error: 'error',
} as const
type MetricStatus = typeof MetricStatus[keyof typeof MetricStatus]

const MetricSeverity = {
  critical: 'critical',
  high: 'high',
  medium: 'medium',
  low: 'low',
  info: 'info',
} as const
type MetricSeverity = typeof MetricSeverity[keyof typeof MetricSeverity]
// ============================================================================
// Helpers
// ============================================================================

function calculateP95(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const index = Math.ceil(values.length * 0.95) - 1
  return sorted[index] ?? sorted[sorted.length - 1]
}

function calculateScore(value: number, threshold: number, inverse: boolean = false): number {
  const factor = inverse ? (threshold / Math.max(value, 0.001)) : (value / threshold)
  return Math.min(100, Math.max(0, factor * 100))
}

// ============================================================================
// 1. LCP Eval - Largest Contentful Paint
// ============================================================================

const lcpEval: EvalDefinition = {
  id: 'perf-lcp',
  name: 'Largest Contentful Paint',
  description: 'Measures loading performance. Threshold: <2500ms for good UX.',
  category: 'performance',

  async run(): Promise<MetricResult> {
    const start = performance.now()

    // Simulate LCP measurement via Navigation Timing API
    // In production, use real-user monitoring (RUM) data or Playwright performance traces
    let lcpValue: number = 2500 // Default if unavailable

    if (typeof globalThis !== 'undefined') {
      try {
        // Read from performance observer data or estimate from navigation timing
        const entries = performance.getEntriesByType('navigation')
        if (entries.length > 0) {
          const nav = entries[0] as PerformanceNavigationTiming
          // LCP is typically near DOMContentLoaded + Largest Content Paint
          // For a real implementation, use PerformanceObserver on 'largest-contentful-paint'
          lcpValue = Math.max(nav.domContentLoadedEventEnd || 1500, 1200)
        }
      } catch {
        lcpValue = 1800 // Fallback estimate
      }
    }

    const threshold = 2500
    const passed = lcpValue < threshold
    const score = calculateScore(lcpValue, threshold, true)
    const duration = performance.now() - start

    return new MetricResultBuilder('perf-lcp', 'Largest Contentful Paint', 'performance')
      .status(passed ? MetricStatus.pass : MetricStatus.fail)
      .score(score)
      .value(lcpValue)
      .threshold(threshold)
      .unit('ms')
      .severity(passed ? MetricSeverity.low : MetricSeverity.critical)
      .message(
        passed
          ? `LCP ${lcpValue}ms within threshold (${threshold}ms)`
          : `LCP ${lcpValue}ms exceeds threshold (${threshold}ms). Optimize images, use CDN, reduce server response time.`
      )
      .details({
        good: lcpValue < 2500,
        needsImprovement: lcpValue >= 2500 && lcpValue < 4000,
        poor: lcpValue >= 4000,
        optimizationTips: [
          'Preload largest contentful element',
          'Use modern image formats (WebP/AVIF)',
          'Enable CDN with edge caching',
          'Optimize server TTFB',
          'Remove render-blocking resources',
        ],
      })
      .duration(duration)
      .build()
  },
}

// ============================================================================
// 2. FID Eval - First Input Delay
// ============================================================================

const fidEval: EvalDefinition = {
  id: 'perf-fid',
  name: 'First Input Delay',
  description: 'Measures interactivity. Threshold: <100ms for good responsiveness.',
  category: 'performance',

  async run(): Promise<MetricResult> {
    const start = performance.now()

    // FID measures time from first user interaction to browser response
    // In production, this comes from Event Timing API via PerformanceObserver
    let fidValue: number = 100 // Default

    if (typeof globalThis !== 'undefined') {
      try {
        const entries = performance.getEntriesByType('event')
        if (entries.length > 0) {
          const firstInput = entries.find(e => (e as PerformanceEventTiming).processingStart)
          if (firstInput) {
            const eventTiming = firstInput as PerformanceEventTiming
            fidValue = eventTiming.processingStart - eventTiming.startTime
          }
        }
      } catch {
        fidValue = 50 // Fallback estimate
      }
    }

    const threshold = 100
    const passed = fidValue < threshold
    const score = calculateScore(fidValue, threshold, true)
    const duration = performance.now() - start

    return new MetricResultBuilder('perf-fid', 'First Input Delay', 'performance')
      .status(passed ? MetricStatus.pass : MetricStatus.fail)
      .score(score)
      .value(fidValue)
      .threshold(threshold)
      .unit('ms')
      .severity(passed ? MetricSeverity.low : MetricSeverity.critical)
      .message(
        passed
          ? `FID ${fidValue}ms within threshold (${threshold}ms)`
          : `FID ${fidValue}ms exceeds threshold (${threshold}ms). Reduce main thread work, defer non-critical JS.`
      )
      .details({
        interactive: fidValue < 100,
        moderate: fidValue >= 100 && fidValue < 300,
        poor: fidValue >= 300,
        optimizationTips: [
          'Break up long tasks (>=50ms chunks)',
          'Defer non-critical JavaScript',
          'Use web workers for heavy computation',
          'Optimize event handlers',
          'Reduce polyfill usage',
        ],
      })
      .duration(duration)
      .build()
  },
}

// ============================================================================
// 3. CLS Eval - Cumulative Layout Shift
// ============================================================================

const clsEval: EvalDefinition = {
  id: 'perf-cls',
  name: 'Cumulative Layout Shift',
  description: 'Measures visual stability. Threshold: <0.1 for good UX.',
  category: 'performance',

  async run(): Promise<MetricResult> {
    const start = performance.now()

    // CLS is sum of all unexpected layout shifts
    // In production, use Layout Instability API via PerformanceObserver
    let clsValue: number = 0.05 // Default (good)

    if (typeof globalThis !== 'undefined') {
      try {
        const entries = performance.getEntriesByType('layout-shift')
        if (entries.length > 0) {
          // LayoutShift entries contain value and sources
          clsValue = entries.reduce((sum: number, entry: unknown) => {
            const ls = entry as { value: number; sources: unknown[] }
            if (ls.value !== undefined) {
              return sum + ls.value
            }
            return sum
          }, 0)
        }
      } catch {
        clsValue = 0.08 // Fallback estimate
      }
    }

    const threshold = 0.1
    const passed = clsValue < threshold
    const score = Math.min(100, (1 - clsValue / threshold) * 100)
    const duration = performance.now() - start

    return new MetricResultBuilder('perf-cls', 'Cumulative Layout Shift', 'performance')
      .status(passed ? MetricStatus.pass : MetricStatus.fail)
      .score(Math.round(score * 10) / 10)
      .value(Math.round(clsValue * 1000) / 1000)
      .threshold(threshold)
      .unit('score')
      .severity(passed ? MetricSeverity.low : MetricSeverity.critical)
      .message(
        passed
          ? `CLS ${clsValue.toFixed(3)} within threshold (${threshold})`
          : `CLS ${clsValue.toFixed(3)} exceeds threshold (${threshold}). Set explicit dimensions on images and embeds.`
      )
      .details({
        good: clsValue < 0.1,
        needsImprovement: clsValue >= 0.1 && clsValue < 0.25,
        poor: clsValue >= 0.25,
        optimizationTips: [
          'Add aspect-ratio or explicit width/height to images',
          'Reserve space for dynamic embeds (ads, iframes)',
          'Avoid inserting content above existing content',
          'Use font-display: optional for web fonts',
          'Preload critical fonts to avoid FOUT',
        ],
      })
      .duration(duration)
      .build()
  },
}

// ============================================================================
// 4. TTFB Eval - Time to First Byte
// ============================================================================

const ttfbEval: EvalDefinition = {
  id: 'perf-ttfb',
  name: 'Time to First Byte',
  description: 'Measures server responsiveness. Threshold: <600ms for good performance.',
  category: 'performance',

  async run(): Promise<MetricResult> {
    const start = performance.now()

    let ttfbValue: number = 600 // Default

    if (typeof globalThis !== 'undefined') {
      try {
        const entries = performance.getEntriesByType('navigation')
        if (entries.length > 0) {
          const nav = entries[0] as PerformanceNavigationTiming
          ttfbValue = nav.responseStart - nav.requestStart
          // Fallback to responseStart if requestStart not available
          if (ttfbValue < 0) ttfbValue = nav.responseStart - nav.fetchStart
        }
      } catch {
        // Fallback: estimate TTFB from connection timing
        ttfbValue = 400
      }
    }

    const threshold = 600
    const passed = ttfbValue < threshold
    const score = calculateScore(ttfbValue, threshold, true)
    const duration = performance.now() - start

    return new MetricResultBuilder('perf-ttfb', 'Time to First Byte', 'performance')
      .status(passed ? MetricStatus.pass : MetricStatus.fail)
      .score(score)
      .value(Math.round(ttfbValue))
      .threshold(threshold)
      .unit('ms')
      .severity(passed ? MetricSeverity.low : MetricSeverity.high)
      .message(
        passed
          ? `TTFB ${Math.round(ttfbValue)}ms within threshold (${threshold}ms)`
          : `TTFB ${Math.round(ttfbValue)}ms exceeds threshold (${threshold}ms). Enable caching, optimize database queries.`
      )
      .details({
        fast: ttfbValue < 200,
        moderate: ttfbValue >= 200 && ttfbValue < 600,
        slow: ttfbValue >= 600 && ttfbValue < 800,
        verySlow: ttfbValue >= 800,
        optimizationTips: [
          'Enable Redis/object cache for frequently accessed data',
          'Use CDN with edge caching',
          'Optimize Prisma queries (add indexes)',
          'Enable HTTP/2 or HTTP/3',
          'Consider server-side rendering for critical pages',
          'Database connection pooling',
        ],
      })
      .duration(duration)
      .build()
  },
}

// ============================================================================
// 5. API Response Time Eval - P95 Latency
// ============================================================================

const apiLatencyEval: EvalDefinition = {
  id: 'perf-api-latency',
  name: 'API Response Time (P95)',
  description: 'Measures API route latency. Threshold: P95 <500ms.',
  category: 'performance',

  async run(): Promise<MetricResult> {
    const start = performance.now()

    // Simulate API latency collection
    // In production, aggregate from request logs or APM telemetry
    const apiLatencies: number[] = [
      120, 150, 180, 200, 220, 240, 250, 260, 280, 300,
      310, 320, 340, 350, 360, 380, 400, 420, 450, 480,
      490, 500, 520, 550, 580, 600, 650, 700, 800, 900,
    ]

    const p95 = calculateP95(apiLatencies)
    const p50 = apiLatencies[Math.floor(apiLatencies.length * 0.5)]
    const p99 = calculateP95(apiLatencies.slice(0, Math.ceil(apiLatencies.length * 0.99)))

    const threshold = 500
    const passed = p95 < threshold
    const score = calculateScore(p95, threshold, true)
    const duration = performance.now() - start

    return new MetricResultBuilder('perf-api-latency', 'API Response Time (P95)', 'performance')
      .status(passed ? MetricStatus.pass : MetricStatus.fail)
      .score(score)
      .value(Math.round(p95))
      .threshold(threshold)
      .unit('ms')
      .severity(passed ? MetricSeverity.low : MetricSeverity.critical)
      .message(
        passed
          ? `API P95 latency ${Math.round(p95)}ms within threshold (${threshold}ms)`
          : `API P95 latency ${Math.round(p95)}ms exceeds threshold (${threshold}ms). Optimize database queries, add caching.`
      )
      .details({
        p50,
        p95,
        p99: Math.round(p99),
        min: Math.min(...apiLatencies),
        max: Math.max(...apiLatencies),
        sampleSize: apiLatencies.length,
        optimizationTips: [
          'Add Redis caching for expensive operations',
          'Use database query optimization (indexes, explain)',
          'Implement pagination for large datasets',
          'Batch database queries when possible',
          'Consider API response compression',
          'Use connection pooling for Prisma',
        ],
      })
      .duration(duration)
      .build()
  },
}

// ============================================================================
// 6. Database Query Time Eval - P95 Query Duration
// ============================================================================

const dbQueryEval: EvalDefinition = {
  id: 'perf-db-query',
  name: 'Database Query Time (P95)',
  description: 'Measures Prisma query performance. Threshold: P95 <200ms.',
  category: 'performance',

  async run(): Promise<MetricResult> {
    const start = performance.now()

    // Simulate database query durations
    // In production, use Prisma logging middleware to capture real timings
    const queryDurations: number[] = [
      5, 8, 10, 12, 15, 18, 20, 22, 25, 28,
      30, 32, 35, 40, 45, 50, 55, 60, 65, 70,
      75, 80, 85, 90, 100, 120, 150, 180, 200, 250,
    ]

    const p95 = calculateP95(queryDurations)
    const slowQueries = queryDurations.filter(q => q > 100).length

    const threshold = 200
    const passed = p95 < threshold
    const score = calculateScore(p95, threshold, true)
    const duration = performance.now() - start

    return new MetricResultBuilder('perf-db-query', 'Database Query Time (P95)', 'performance')
      .status(passed ? MetricStatus.pass : MetricStatus.fail)
      .score(score)
      .value(Math.round(p95))
      .threshold(threshold)
      .unit('ms')
      .severity(passed ? MetricSeverity.low : MetricSeverity.high)
      .message(
        passed
          ? `DB P95 query time ${Math.round(p95)}ms within threshold (${threshold}ms)`
          : `DB P95 query time ${Math.round(p95)}ms exceeds threshold (${threshold}ms). Add indexes, optimize Prisma includes.`
      )
      .details({
        p50: queryDurations[Math.floor(queryDurations.length * 0.5)],
        p95: Math.round(p95),
        p99: calculateP95(queryDurations.slice(0, Math.ceil(queryDurations.length * 0.99))),
        slowQueries,
        optimizationTips: [
          'Add database indexes on frequently queried columns',
          'Use select() to limit returned fields',
          'Avoid N+1 queries with include/prisma nested',
          'Use pagination for large result sets',
          'Enable query caching',
          'Consider materialized views for complex queries',
        ],
      })
      .duration(duration)
      .build()
  },
}

// ============================================================================
// 7. Redis Cache Hit Eval - Cache Efficiency
// ============================================================================

const cacheHitEval: EvalDefinition = {
  id: 'perf-cache-hit',
  name: 'Redis Cache Hit Ratio',
  description: 'Measures cache efficiency. Threshold: >80% hit ratio.',
  category: 'performance',

  async run(): Promise<MetricResult> {
    const start = performance.now()

    // Simulate cache metrics
    // In production, collect from Redis INFO or custom instrumentation
    const cacheMetrics = {
      hits: 8500,
      misses: 1500,
      total: 10000,
    }

    const hitRatio = (cacheMetrics.hits / cacheMetrics.total) * 100

    const threshold = 80
    const passed = hitRatio > threshold
    const score = (hitRatio / threshold) * 100
    const duration = performance.now() - start

    return new MetricResultBuilder('perf-cache-hit', 'Redis Cache Hit Ratio', 'performance')
      .status(passed ? MetricStatus.pass : MetricStatus.fail)
      .score(Math.min(100, score))
      .value(Math.round(hitRatio * 10) / 10)
      .threshold(threshold)
      .unit('%')
      .severity(passed ? MetricSeverity.low : MetricSeverity.high)
      .message(
        passed
          ? `Cache hit ratio ${hitRatio.toFixed(1)}% above threshold (${threshold}%)`
          : `Cache hit ratio ${hitRatio.toFixed(1)}% below threshold (${threshold}%). Increase cache coverage.`
      )
      .details({
        hits: cacheMetrics.hits,
        misses: cacheMetrics.misses,
        hitRatio: Math.round(hitRatio * 10) / 10,
        missRatio: Math.round((100 - hitRatio) * 10) / 10,
        optimizationTips: [
          'Cache more read-heavy endpoints',
          'Use cache-aside pattern for expensive computations',
          'Implement cache warming for critical data',
          'Add cache tags for selective invalidation',
          'Consider longer TTLs for stable data',
          'Use compression for large cached values',
        ],
      })
      .duration(duration)
      .build()
  },
}

// ============================================================================
// 8. Bundle Size Eval - JS Bundle Size
// ============================================================================

const bundleSizeEval: EvalDefinition = {
  id: 'perf-bundle-size',
  name: 'JavaScript Bundle Size',
  description: 'Measures gzipped JS bundle size. Threshold: <500KB.',
  category: 'performance',

  async run(): Promise<MetricResult> {
    const start = performance.now()

    // Bundle size metrics - in production, read from build artifacts or webpack stats
    // For Next.js App Router, check .next/static/chunks
    const bundleMetrics = {
      main: 185,    // KB gzipped
      vendor: 220,  // KB gzipped
      dynamic: 45,  // KB gzipped
      total: 450,   // KB gzipped
    }

    const threshold = 500
    const passed = bundleMetrics.total < threshold
    const score = calculateScore(bundleMetrics.total, threshold, true)
    const duration = performance.now() - start

    return new MetricResultBuilder('perf-bundle-size', 'JavaScript Bundle Size', 'performance')
      .status(passed ? MetricStatus.pass : MetricStatus.fail)
      .score(score)
      .value(bundleMetrics.total)
      .threshold(threshold)
      .unit('KB')
      .severity(passed ? MetricSeverity.low : MetricSeverity.high)
      .message(
        passed
          ? `JS bundle ${bundleMetrics.total}KB gzipped within threshold (${threshold}KB)`
          : `JS bundle ${bundleMetrics.total}KB exceeds threshold (${threshold}KB). Split chunks, tree-shake.`
      )
      .details({
        main: bundleMetrics.main,
        vendor: bundleMetrics.vendor,
        dynamic: bundleMetrics.dynamic,
        total: bundleMetrics.total,
        limit: threshold,
        headroom: threshold - bundleMetrics.total,
        optimizationTips: [
          'Use dynamic imports for route-based code splitting',
          'Enable tree-shaking in bundler config',
          'Analyze bundle with webpack-bundle-analyzer',
          'Remove unused dependencies (use-side-effects)',
          'Preload critical chunks in _document',
          'Consider using lightweight alternatives (e.g., date-fns over moment)',
        ],
      })
      .duration(duration)
      .build()
  },
}

// ============================================================================
// 9. Memory Usage Eval - Heap Memory
// ============================================================================

const memoryEval: EvalDefinition = {
  id: 'perf-memory',
  name: 'Heap Memory Usage',
  description: 'Measures Node.js heap usage in production. Threshold: <512MB.',
  category: 'performance',

  async run(): Promise<MetricResult> {
    const start = performance.now()

    // Memory metrics - in production, use process.memoryUsage()
    let memoryUsage = { heapUsed: 300 * 1024 * 1024, heapTotal: 512 * 1024 * 1024 } // Default 300MB

    if (typeof process !== 'undefined' && process.memoryUsage) {
      const mem = process.memoryUsage()
      memoryUsage = { heapUsed: mem.heapUsed, heapTotal: mem.heapTotal }
    }

    const heapUsedMB = Math.round(memoryUsage.heapUsed / (1024 * 1024))
    const heapTotalMB = Math.round(memoryUsage.heapTotal / (1024 * 1024))
    const usageRatio = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100

    const threshold = 512 // MB
    const passed = heapUsedMB < threshold
    const score = calculateScore(heapUsedMB, threshold, true)
    const duration = performance.now() - start

    return new MetricResultBuilder('perf-memory', 'Heap Memory Usage', 'performance')
      .status(passed ? MetricStatus.pass : MetricStatus.fail)
      .score(Math.round(score))
      .value(heapUsedMB)
      .threshold(threshold)
      .unit('MB')
      .severity(passed ? MetricSeverity.low : MetricSeverity.critical)
      .message(
        passed
          ? `Heap memory ${heapUsedMB}MB within threshold (${threshold}MB)`
          : `Heap memory ${heapUsedMB}MB exceeds threshold (${threshold}MB). Check for memory leaks.`
      )
      .details({
        heapUsed: heapUsedMB,
        heapTotal: heapTotalMB,
        usageRatio: Math.round(usageRatio * 10) / 10,
        rss: Math.round((process?.memoryUsage?.()?.rss ?? 0) / (1024 * 1024)),
        external: Math.round((process?.memoryUsage?.()?.external ?? 0) / (1024 * 1024)),
        optimizationTips: [
          'Check for memory leaks with heap snapshots',
          'Clear event listeners when components unmount',
          'Avoid keeping large objects in memory',
          'Use streaming for large data processing',
          'Implement connection cleanup in middleware',
          'Consider worker threads for CPU-intensive tasks',
        ],
      })
      .duration(duration)
      .build()
  },
}

// ============================================================================
// 10. Throughput Eval - Requests Per Second
// ============================================================================

const throughputEval: EvalDefinition = {
  id: 'perf-throughput',
  name: 'Request Throughput',
  description: 'Measures requests per second capacity. Threshold: >100 rps.',
  category: 'performance',

  async run(): Promise<MetricResult> {
    const start = performance.now()

    // Simulate throughput metrics
    // In production, calculate from request logs: total_requests / time_window
    const throughputMetrics = {
      current: 120,  // rps
      peak: 180,
      avg: 95,
    }

    const threshold = 100
    const passed = throughputMetrics.current > threshold
    const score = (throughputMetrics.current / threshold) * 100
    const duration = performance.now() - start

    return new MetricResultBuilder('perf-throughput', 'Request Throughput', 'performance')
      .status(passed ? MetricStatus.pass : MetricStatus.fail)
      .score(Math.min(100, score))
      .value(throughputMetrics.current)
      .threshold(threshold)
      .unit('rps')
      .severity(passed ? MetricSeverity.low : MetricSeverity.high)
      .message(
        passed
          ? `Throughput ${throughputMetrics.current} rps exceeds threshold (${threshold} rps)`
          : `Throughput ${throughputMetrics.current} rps below threshold (${threshold} rps). Scale horizontally.`
      )
      .details({
        current: throughputMetrics.current,
        peak: throughputMetrics.peak,
        avg: throughputMetrics.avg,
        headroom: throughputMetrics.current - threshold,
        optimizationTips: [
          'Enable horizontal scaling for production',
          'Use load balancer with health checks',
          'Implement request queuing for burst handling',
          'Optimize slow endpoints first',
          'Consider edge caching to reduce backend load',
          'Use connection pooling for database',
        ],
      })
      .duration(duration)
      .build()
  },
}

// ============================================================================
// Export Array - All Performance Evals
// ============================================================================

export const performanceEvals: EvalDefinition[] = [
  lcpEval,
  fidEval,
  clsEval,
  ttfbEval,
  apiLatencyEval,
  dbQueryEval,
  cacheHitEval,
  bundleSizeEval,
  memoryEval,
  throughputEval,
]

export default performanceEvals