/**
 * Quality Metrics Framework - Cabala dos Caminhos
 * Sistema central de métricas e evals para auto-avaliação contínua
 */

import { z } from 'zod'

// ============================================================================
// Types & Interfaces
// ============================================================================

export const MetricCategory = z.enum([
  'spiritual_correlations',
  'ai_integration',
  'performance',
  'ui_design',
  'ux_design',
  'architecture',
  'qa_testing',
  'documentation'
])
export type MetricCategory = z.infer<typeof MetricCategory>
export const MetricSeverity = z.enum(['critical', 'high', 'medium', 'low', 'info'])
export type MetricSeverity = z.infer<typeof MetricSeverity>
export const MetricStatus = z.enum(['pass', 'fail', 'warning', 'skipped', 'error'])
export type MetricStatus = z.infer<typeof MetricStatus>
// Aliases for .options compatibility (Zod uses .values internally)
Object.defineProperty(MetricCategory, 'options', {
  value: MetricCategory.values,
  writable: false,
  enumerable: true,
})
Object.defineProperty(MetricSeverity, 'options', {
  value: MetricSeverity.values,
  writable: false,
  enumerable: true,
})
Object.defineProperty(MetricStatus, 'options', {
  value: MetricStatus.values,
  writable: false,
  enumerable: true,
})

// Schema for individual metric result
export const MetricResultSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: MetricCategory,
  status: MetricStatus,
  score: z.number().min(0).max(100),
  value: z.unknown(),
  threshold: z.union([z.number(), z.string()]),
  unit: z.string().optional(),
  severity: MetricSeverity,
  message: z.string(),
  details: z.record(z.unknown()).optional(),
  timestamp: z.date(),
  duration: z.number().optional(), // ms
})

export type MetricResult = z.infer<typeof MetricResultSchema>

// Schema for eval suite
export const EvalSuiteSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: MetricCategory,
  version: z.string(),
  metrics: z.array(MetricResultSchema),
  summary: z.object({
    total: z.number(),
    passed: z.number(),
    failed: z.number(),
    warnings: z.number(),
    skipped: z.number(),
    overallScore: z.number(),
    grade: z.enum(['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F']),
  }),
  executedAt: z.date(),
  duration: z.number(),
})

export type EvalSuite = z.infer<typeof EvalSuiteSchema>

// Schema for quality report
export const QualityReportSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.date(),
  version: z.string(),
  suites: z.array(EvalSuiteSchema),
  overallScore: z.number().min(0).max(100),
  grade: z.enum(['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F']),
  criticalIssues: z.array(MetricResultSchema),
  highPriorityIssues: z.array(MetricResultSchema),
  improvements: z.array(z.object({
    metricId: z.string(),
    currentValue: z.unknown(),
    targetValue: z.unknown(),
    effort: z.enum(['low', 'medium', 'high']),
    impact: z.enum(['low', 'medium', 'high']),
  })),
  trend: z.object({
    previousScore: z.number().optional(),
    delta: z.number().optional(),
    trend: z.enum(['improving', 'stable', 'declining']).optional(),
  }),
  metadata: z.object({
    branch: z.string(),
    commit: z.string().optional(),
    runner: z.string(),
  }),
})

export type QualityReport = z.infer<typeof QualityReportSchema>

// ============================================================================
// Threshold Configuration
// ============================================================================

export interface ThresholdConfig {
  name: string
  category: MetricCategory
  thresholds: {
    critical: number
    high: number
    medium: number
    low: number
  }
  weight: number
}

export const DEFAULT_THRESHOLDS: ThresholdConfig[] = [
  {
    name: 'spiritual_correlations',
    category: 'spiritual_correlations',
    thresholds: { critical: 95, high: 85, medium: 70, low: 50 },
    weight: 1.5, // High priority - core business logic
  },
  {
    name: 'ai_integration',
    category: 'ai_integration',
    thresholds: { critical: 90, high: 80, medium: 65, low: 45 },
    weight: 1.5, // High priority - core business logic
  },
  {
    name: 'performance',
    category: 'performance',
    thresholds: { critical: 90, high: 75, medium: 60, low: 40 },
    weight: 1.2,
  },
  {
    name: 'ui_design',
    category: 'ui_design',
    thresholds: { critical: 85, high: 75, medium: 60, low: 40 },
    weight: 1.0,
  },
  {
    name: 'ux_design',
    category: 'ux_design',
    thresholds: { critical: 85, high: 75, medium: 60, low: 40 },
    weight: 1.0,
  },
  {
    name: 'architecture',
    category: 'architecture',
    thresholds: { critical: 90, high: 80, medium: 65, low: 45 },
    weight: 1.2,
  },
  {
    name: 'qa_testing',
    category: 'qa_testing',
    thresholds: { critical: 90, high: 80, medium: 65, low: 45 },
    weight: 1.3,
  },
  {
    name: 'documentation',
    category: 'documentation',
    thresholds: { critical: 80, high: 70, medium: 55, low: 35 },
    weight: 0.8,
  },
]

// ============================================================================
// Grading System
// ============================================================================

export function calculateGrade(score: number): QualityReport['grade'] {
  if (score >= 97) return 'A+'
  if (score >= 93) return 'A'
  if (score >= 90) return 'A-'
  if (score >= 87) return 'B+'
  if (score >= 83) return 'B'
  if (score >= 80) return 'B-'
  if (score >= 77) return 'C+'
  if (score >= 73) return 'C'
  if (score >= 70) return 'C-'
  return 'F'
}
export function getGradeColor(grade: QualityReport['grade']): string {
  const colors: Record<QualityReport['grade'], string> = {
    'A+': '#00ff88',
    'A': '#00cc66',
    'A-': '#66cc00',
    'B+': '#cccc00',
    'B': '#ffcc00',
    'B-': '#ffcc33',
    'C+': '#ff9900',
    'C': '#ff6600',
    'C-': '#ff3300',
    'D': '#ff0000',
    'F': '#cc0000',
  }
  return colors[grade]
}
// ============================================================================
// Metric Result Builder
// ============================================================================
export class MetricResultBuilder {
  private result: Partial<MetricResult>
  constructor(id: string, category: MetricCategory, name?: string) {
    let actualCategory = category;
    let actualName = name ?? id;
    
    // Auto-swap if arguments were passed as (id, name, category) instead of (id, category, name)
    const validCategories = [
      'spiritual_correlations',
      'ai_integration',
      'performance',
      'ui_design',
      'ux_design',
      'architecture',
      'qa_testing',
      'documentation'
    ];
    if (name && validCategories.includes(name) && !validCategories.includes(category)) {
      actualCategory = name as MetricCategory;
      actualName = category;
    }
    
    this.result = {
      id,
      name: actualName,
      category: actualCategory,
      timestamp: new Date(),
    }
  }
  status(status: MetricStatus): this {
    this.result.status = status
    return this
  }
  score(score: number): this {
    this.result.score = Math.max(0, Math.min(100, score))
    return this
  }
  value(value: MetricResult['value']): this {
    this.result.value = value
    return this
  }
  threshold(threshold: MetricResult['threshold']): this {
    this.result.threshold = threshold
    return this
  }
  unit(unit: string): this {
    this.result.unit = unit
    return this
  }
  severity(severity: MetricSeverity): this {
    this.result.severity = severity
    return this
  }
  message(message: string): this {
    this.result.message = message
    return this
  }
  details(details: Record<string, unknown>): this {
    this.result.details = details
    return this
  }
  duration(duration: number): this {
    this.result.duration = duration
    return this
  }
  build(): MetricResult {
    const requiredFields = ['id', 'name', 'category', 'status', 'score', 'value', 'threshold', 'severity', 'message', 'timestamp']
    for (const field of requiredFields) {
      if (!(field in this.result)) {
        throw new Error(`Missing required field: ${field}`)
      }
    }
    return MetricResultSchema.parse(this.result)
  }
}
export interface EvalDefinition {
  id: string
  name: string
  description: string
  category: MetricCategory
  run: () => Promise<MetricResult> | MetricResult
}
export class EvalSuiteRunner {
  private suite: EvalSuite | null = null

  async runSuite(
    id: string,
    name: string,
    description: string,
    category: MetricCategory,
    evals: EvalDefinition[]
  ): Promise<EvalSuite> {
    const startTime = Date.now()
    const metrics: MetricResult[] = []
    for (const evalItem of evals) {
      try {
        const start = Date.now()
        const result = await evalItem.run()
        result.duration = Date.now() - start
        metrics.push(result)
      } catch (error) {
        metrics.push({
          id: evalItem.id,
          name: evalItem.name,
          category,
          status: 'error',
          score: 0,
          value: error instanceof Error ? error.message : 'Unknown error',
          threshold: 'N/A',
          severity: 'critical',
          message: `Eval failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          timestamp: new Date(),
          duration: Date.now() - startTime,
        })
      }
    }
    

    const duration = Date.now() - startTime
    const summary = this.calculateSummary(metrics)


    this.suite = EvalSuiteSchema.parse({
      id,
      name,
      description,
      category,
      version: '1.0.0',
      metrics,
      summary,
      executedAt: new Date(),
      duration,
    })

    return this.suite
  }

  private calculateSummary(metrics: MetricResult[]) {
    const total = metrics.length
    const passed = metrics.filter(m => m.status === 'pass').length
    const failed = metrics.filter(m => m.status === 'fail').length
    const warnings = metrics.filter(m => m.status === 'warning').length
    const skipped = metrics.filter(m => m.status === 'skipped').length
    const overallScore = total > 0
      ? metrics.reduce((sum, m) => sum + (m.score || 0), 0) / total
      : 0

    return {
      total,
      passed,
      failed,
      warnings,
      skipped,
      overallScore,
      grade: calculateGrade(overallScore),
    }
  }

  getSuite(): EvalSuite | null {
    return this.suite
  }
}

// ============================================================================
// Quality Report Generator
// ============================================================================

export class QualityReportGenerator {
  private report: QualityReport | null = null

  async generateReport(
    suites: EvalSuite[],
    metadata: QualityReport['metadata']
  ): Promise<QualityReport> {
    const allMetrics = suites.flatMap(s => s.metrics)
    
    // Calculate weighted overall score
    const categoryScores = new Map<MetricCategory, { score: number; weight: number }>()
    
    for (const suite of suites) {
      const existing = categoryScores.get(suite.category)
      const config = DEFAULT_THRESHOLDS.find(t => t.category === suite.category)
      const weight = config?.weight || 1.0
      
      if (existing) {
        existing.score += suite.summary.overallScore * weight
        existing.weight += weight
      } else {
        categoryScores.set(suite.category, { score: suite.summary.overallScore * weight, weight })
      }
    }
    
    let totalWeightedScore = 0
    let totalWeight = 0
    for (const [, data] of categoryScores) {
      totalWeightedScore += data.score
      totalWeight += data.weight
    }
    
    const overallScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0

    // Filter critical and high priority issues
    const criticalIssues = allMetrics.filter(m => 
      m.severity === 'critical' && m.status === 'fail'
    )
    const highPriorityIssues = allMetrics.filter(m =>
      m.severity === 'high' && m.status === 'fail'
    )

    // Generate improvement suggestions
    const improvements = allMetrics
      .filter(m => m.status === 'fail' || m.status === 'warning')
      .map(m => ({
        metricId: m.id,
        currentValue: m.value,
        targetValue: m.threshold,
        effort: 'medium' as const,
        impact: m.severity === 'critical' ? 'high' as const : 'medium' as const,
      }))

    this.report = QualityReportSchema.parse({
      id: crypto.randomUUID(),
      timestamp: new Date(),
      version: '1.0.0',
      suites,
      overallScore,
      grade: calculateGrade(overallScore),
      criticalIssues,
      highPriorityIssues,
      improvements,
      trend: {
        previousScore: undefined, // Would come from previous report
        delta: undefined,
        trend: undefined,
      },
      metadata,
    })

    return this.report
  }

  getReport(): QualityReport | null {
    return this.report
  }
}

// ============================================================================
// Reporter Interface
// ============================================================================

export interface QualityReporter {
  report(report: QualityReport): Promise<void>
  reportSuite(suite: EvalSuite): Promise<void>
}

export class ConsoleReporter implements QualityReporter {
  async report(report: QualityReport): Promise<void> {
    console.log('\n' + '='.repeat(80))
    console.log('  QUALITY REPORT - Cabala dos Caminhos')
    console.log('='.repeat(80))
    console.log(`Timestamp: ${report.timestamp.toISOString()}`)
    console.log(`Version: ${report.version}`)
    console.log(`Overall Score: ${report.overallScore.toFixed(2)}% (Grade: ${report.grade})`)
    console.log('')
    
    for (const suite of report.suites) {
      console.log(`\nSuite: ${suite.name}`)
      console.log('-'.repeat(60))
      console.log(`  Score: ${suite.summary.overallScore.toFixed(2)}% | ${suite.summary.passed}/${suite.summary.total} passed`)
      
      for (const metric of suite.metrics) {
        const statusIcon = metric.status === 'pass' ? '✓' : metric.status === 'fail' ? '✗' : metric.status === 'warning' ? '⚠' : '○'
        console.log(`    ${statusIcon} ${metric.name}: ${metric.score.toFixed(1)}% - ${metric.message}`)
      }
    }

    if (report.criticalIssues.length > 0) {
      console.log('\n🚨 CRITICAL ISSUES:')
      for (const issue of report.criticalIssues) {
        console.log(`  - ${issue.name}: ${issue.message}`)
      }
    }

    console.log('\n' + '='.repeat(80))
  }

  async reportSuite(suite: EvalSuite): Promise<void> {
    console.log(`\nSuite: ${suite.name} - Score: ${suite.summary.overallScore.toFixed(2)}% (${suite.summary.grade})`)
  }
}

// ============================================================================
// Performance Monitor
// ============================================================================

export class PerformanceMonitor {
  private measurements: Map<string, number[]> = new Map()

  record(name: string, value: number): void {
    const existing = this.measurements.get(name) || []
    existing.push(value)
    this.measurements.set(name, existing)
  }

  getStats(name: string): { avg: number; min: number; max: number; p95: number; p99: number } | null {
    const values = this.measurements.get(name)
    if (!values || values.length === 0) return null
    
    const sorted = [...values].sort((a, b) => a - b)
    const avg = values.reduce((a, b) => a + b, 0) / values.length
    
    return {
      avg,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)],
    }
  }
}

// ============================================================================
// Validation Helpers
// ============================================================================

export function validateMetricValue(
  value: number,
  threshold: number,
  operator: 'gte' | 'lte' | 'eq' | 'gt' | 'lt' = 'gte'
): boolean {
  switch (operator) {
    case 'gte': return value >= threshold
    case 'lte': return value <= threshold
    case 'eq': return value === threshold
    case 'gt': return value > threshold
    case 'lt': return value < threshold
  }
}

export function calculateScoreFromValue(
  value: number,
  thresholds: { critical: number; high: number; medium: number; low: number }
): number {
  if (value >= thresholds.critical) return 100
  if (value >= thresholds.high) return 80 + (value - thresholds.high) / (thresholds.critical - thresholds.high) * 20
  if (value >= thresholds.medium) return 60 + (value - thresholds.medium) / (thresholds.high - thresholds.medium) * 20
  if (value >= thresholds.low) return 40 + (value - thresholds.low) / (thresholds.medium - thresholds.low) * 20
  return Math.max(0, value / thresholds.low * 40)
}

// ============================================================================
// Export all schemas and types for downstream use
// ============================================================================

export const MetricSchemas = {
  MetricResult: MetricResultSchema,
  EvalSuite: EvalSuiteSchema,
  QualityReport: QualityReportSchema,
  MetricCategory,
  MetricSeverity,
  MetricStatus,
}

export default {
  MetricCategory,
  MetricSeverity,
  MetricStatus,
  MetricResultSchema,
  EvalSuiteSchema,
  QualityReportSchema,
  DEFAULT_THRESHOLDS,
  calculateGrade,
  getGradeColor,
  MetricResultBuilder,
  EvalSuiteRunner,
  QualityReportGenerator,
  ConsoleReporter,
  PerformanceMonitor,
  validateMetricValue,
  calculateScoreFromValue,
}
