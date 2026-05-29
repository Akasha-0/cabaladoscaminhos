/**
 * Quality Metrics Framework Tests
 * Rigorous tests for the central metrics and evals system
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  MetricResultBuilder,
  MetricResultSchema,
  EvalSuiteSchema,
  QualityReportSchema,
  EvalSuiteRunner,
  QualityReportGenerator,
  MetricCategory,
  MetricSeverity,
  MetricStatus,
  calculateGrade,
  getGradeColor,
  validateMetricValue,
  calculateScoreFromValue,
  DEFAULT_THRESHOLDS,
  MetricSchemas,
} from '@/lib/quality/metrics-framework'

// ============================================================================
// 1. MetricResultBuilder Tests
// ============================================================================

describe('MetricResultBuilder', () => {
  describe('creating valid metrics', () => {
    it('should create a basic metric with required fields', () => {
      const metric = new MetricResultBuilder('metric-1', 'Test Metric', 'performance')
        .status('pass')
        .score(85)
        .value(100)
        .threshold(80)
        .severity('high')
        .message('Test passed successfully')
        .build()

      expect(metric.id).toBe('metric-1')
      expect(metric.name).toBe('Test Metric')
      expect(metric.category).toBe('performance')
      expect(metric.status).toBe('pass')
      expect(metric.score).toBe(85)
      expect(metric.value).toBe(100)
      expect(metric.threshold).toBe(80)
      expect(metric.severity).toBe('high')
      expect(metric.message).toBe('Test passed successfully')
      expect(metric.timestamp).toBeInstanceOf(Date)
    })

    it('should create metric with all optional fields', () => {
      const metric = new MetricResultBuilder('metric-2', 'Complete Metric', 'ai_integration')
        .status('fail')
        .score(45)
        .value(150)
        .threshold(100)
        .severity('critical')
        .message('Response time exceeded threshold')
        .unit('ms')
        .details({ responseTime: 150, expectedMax: 100 })
        .duration(250)
        .build()

      expect(metric.unit).toBe('ms')
      expect(metric.details).toEqual({ responseTime: 150, expectedMax: 100 })
      expect(metric.duration).toBe(250)
    })

    it('should clamp score between 0 and 100', () => {
      const highScore = new MetricResultBuilder('m1', 'High', 'performance')
        .status('pass')
        .score(150)
        .value(100)
        .threshold(80)
        .severity('medium')
        .message('test')
        .build()
      expect(highScore.score).toBe(100)

      const lowScore = new MetricResultBuilder('m2', 'Low', 'performance')
        .status('fail')
        .score(-50)
        .value(100)
        .threshold(80)
        .severity('medium')
        .message('test')
        .build()
      expect(lowScore.score).toBe(0)
    })

    it('should accept all valid statuses', () => {
      const statuses: MetricStatus[] = ['pass', 'fail', 'warning', 'skipped', 'error']
      for (const status of statuses) {
        const metric = new MetricResultBuilder('m1', status, 'documentation')
          .status(status)
          .score(50)
          .value(50)
          .threshold(50)
          .severity('low')
          .message(status)
          .build()
        expect(metric.status).toBe(status)
      }
    })

    it('should accept all severity levels', () => {
      const severities: MetricSeverity[] = ['critical', 'high', 'medium', 'low', 'info']
      for (const severity of severities) {
        const metric = new MetricResultBuilder('sev-' + severity, severity, 'architecture')
          .status('warning')
          .score(50)
          .value(50)
          .threshold(50)
          .severity(severity)
          .message(severity)
          .build()
        expect(metric.severity).toBe(severity)
      }
    })

    it('should accept all category types', () => {
      const categories: MetricCategory[] = [
        'spiritual_correlations',
        'ai_integration',
        'performance',
        'ui_design',
        'ux_design',
        'architecture',
        'qa_testing',
        'documentation',
      ]
      for (const category of categories) {
        const metric = new MetricResultBuilder('cat-' + category, category, category)
          .status('pass')
          .score(100)
          .value(100)
          .threshold(80)
          .severity('low')
          .message(category)
          .build()
        expect(metric.category).toBe(category)
      }
    })

    it('should throw error when required field is missing', () => {
      const incompleteBuilder = new MetricResultBuilder('m1', 'Incomplete', 'performance')
        .status('pass')
        .score(100)
        // Missing: value, threshold, severity, message

      expect(() => incompleteBuilder.build()).toThrow('Missing required field: value')
    })

    it('should throw error when missing multiple fields', () => {
      const incompleteBuilder = new MetricResultBuilder('m2', 'Missing', 'performance')
        .status('fail')
        // Missing: score, value, threshold, severity, message

      expect(() => incompleteBuilder.build()).toThrow('Missing required field: score')
    })

    it('should validate against zod schema', () => {
      const validMetric = new MetricResultBuilder('valid-1', 'Valid', 'ui_design')
        .status('pass')
        .score(90)
        .value(95)
        .threshold(80)
        .severity('low')
        .message('All good')
        .build()

      const result = MetricResultSchema.safeParse(validMetric)
      expect(result.success).toBe(true)
    })
  })
})

// ============================================================================
// 2. Grading System Tests
// ============================================================================

describe('calculateGrade', () => {
  it('should return A+ for score >= 97', () => {
    expect(calculateGrade(97)).toBe('A+')
    expect(calculateGrade(100)).toBe('A+')
    expect(calculateGrade(99)).toBe('A+')
  })

  it('should return A for score >= 93 and < 97', () => {
    expect(calculateGrade(93)).toBe('A')
    expect(calculateGrade(95)).toBe('A')
    expect(calculateGrade(96.9)).toBe('A')
  })

  it('should return A- for score >= 90 and < 93', () => {
    expect(calculateGrade(90)).toBe('A-')
    expect(calculateGrade(91)).toBe('A-')
    expect(calculateGrade(92.9)).toBe('A-')
  })

  it('should return B+ for score >= 87 and < 90', () => {
    expect(calculateGrade(87)).toBe('B+')
    expect(calculateGrade(88.5)).toBe('B+')
    expect(calculateGrade(89.9)).toBe('B+')
  })

  it('should return B for score >= 83 and < 87', () => {
    expect(calculateGrade(83)).toBe('B')
    expect(calculateGrade(85)).toBe('B')
    expect(calculateGrade(86.9)).toBe('B')
  })

  it('should return B- for score >= 80 and < 83', () => {
    expect(calculateGrade(80)).toBe('B-')
    expect(calculateGrade(81.5)).toBe('B-')
    expect(calculateGrade(82.9)).toBe('B-')
  })

  it('should return C+ for score >= 77 and < 80', () => {
    expect(calculateGrade(77)).toBe('C+')
    expect(calculateGrade(78.5)).toBe('C+')
    expect(calculateGrade(79.9)).toBe('C+')
  })

  it('should return C for score >= 73 and < 77', () => {
    expect(calculateGrade(73)).toBe('C')
    expect(calculateGrade(75)).toBe('C')
    expect(calculateGrade(76.9)).toBe('C')
  })

  it('should return C- for score >= 70 and < 73', () => {
    expect(calculateGrade(70)).toBe('C-')
    expect(calculateGrade(71.5)).toBe('C-')
    expect(calculateGrade(72.9)).toBe('C-')
  })

  it('should return D for score >= 60 and < 70', () => {
    expect(calculateGrade(60)).toBe('D')
    expect(calculateGrade(65)).toBe('D')
    expect(calculateGrade(69.9)).toBe('D')
  })

  it('should return F for score < 60', () => {
    expect(calculateGrade(59)).toBe('F')
    expect(calculateGrade(0)).toBe('F')
    expect(calculateGrade(30)).toBe('F')
  })

  it('should handle decimal scores correctly', () => {
    // 96.99 is < 97 so it's A, not A+
    expect(calculateGrade(96.99)).toBe('A')
    expect(calculateGrade(97.0)).toBe('A+')
    expect(calculateGrade(96.01)).toBe('A')
  })

  it('should handle boundary values precisely', () => {
    expect(calculateGrade(89.9999)).toBe('B+')
    expect(calculateGrade(90.0)).toBe('A-')
  })
})

describe('getGradeColor', () => {
  it('should return correct colors for all grades', () => {
    expect(getGradeColor('A+')).toBe('#00ff88')
    expect(getGradeColor('A')).toBe('#00cc66')
    expect(getGradeColor('A-')).toBe('#66cc00')
    expect(getGradeColor('B+')).toBe('#cccc00')
    expect(getGradeColor('B')).toBe('#ffcc00')
    expect(getGradeColor('B-')).toBe('#ffcc33')
    expect(getGradeColor('C+')).toBe('#ff9900')
    expect(getGradeColor('C')).toBe('#ff6600')
    expect(getGradeColor('C-')).toBe('#ff3300')
    expect(getGradeColor('D')).toBe('#ff0000')
    expect(getGradeColor('F')).toBe('#cc0000')
  })
})

// ============================================================================
// 3. EvalSuiteRunner Tests
// ============================================================================

describe('EvalSuiteRunner', () => {
  let runner: EvalSuiteRunner

  beforeEach(() => {
    runner = new EvalSuiteRunner()
  })

  it('should execute a suite with single eval', async () => {
    const suite = await runner.runSuite(
      'suite-1',
      'Single Eval Suite',
      'Test suite with one eval',
      'performance',
      [
        {
          id: 'eval-1',
          name: 'Single Test',
          description: 'A single test eval',
          category: 'performance',
          run: async () => ({
            id: 'eval-1',
            name: 'Single Test',
            category: 'performance',
            status: 'pass',
            score: 100,
            value: 50,
            threshold: 100,
            severity: 'low',
            message: 'Test passed',
            timestamp: new Date(),
          }),
        },
      ]
    )

    expect(suite.id).toBe('suite-1')
    expect(suite.metrics).toHaveLength(1)
    expect(suite.metrics[0].status).toBe('pass')
    expect(suite.metrics[0].score).toBe(100)
    expect(suite.summary.total).toBe(1)
    expect(suite.summary.passed).toBe(1)
  })

  it('should execute a suite with multiple evals', async () => {
    const suite = await runner.runSuite(
      'suite-2',
      'Multi Eval Suite',
      'Test suite with multiple evals',
      'ai_integration',
      [
        {
          id: 'eval-a',
          name: 'Test A',
          description: 'First test',
          category: 'ai_integration',
          run: async () => ({
            id: 'eval-a',
            name: 'Test A',
            category: 'ai_integration',
            status: 'pass',
            score: 90,
            value: 90,
            threshold: 80,
            severity: 'medium',
            message: 'Pass',
            timestamp: new Date(),
          }),
        },
        {
          id: 'eval-b',
          name: 'Test B',
          description: 'Second test',
          category: 'ai_integration',
          run: async () => ({
            id: 'eval-b',
            name: 'Test B',
            category: 'ai_integration',
            status: 'fail',
            score: 40,
            value: 200,
            threshold: 100,
            severity: 'high',
            message: 'Over threshold',
            timestamp: new Date(),
          }),
        },
        {
          id: 'eval-c',
          name: 'Test C',
          description: 'Third test',
          category: 'ai_integration',
          run: async () => ({
            id: 'eval-c',
            name: 'Test C',
            category: 'ai_integration',
            status: 'warning',
            score: 65,
            value: 75,
            threshold: 80,
            severity: 'medium',
            message: 'Near threshold',
            timestamp: new Date(),
          }),
        },
      ]
    )

    expect(suite.metrics).toHaveLength(3)
    expect(suite.summary.total).toBe(3)
    expect(suite.summary.passed).toBe(1)
    expect(suite.summary.failed).toBe(1)
    expect(suite.summary.warnings).toBe(1)
  })

  it('should calculate overall score correctly', async () => {
    const suite = await runner.runSuite(
      'suite-3',
      'Score Test',
      'Testing score calculation',
      'documentation',
      [
        {
          id: 's1',
          name: 'Score 1',
          description: 'test',
          category: 'documentation',
          run: async () => ({
            id: 's1', name: 'Score 1', category: 'documentation',
            status: 'pass', score: 100, value: 100, threshold: 80,
            severity: 'low', message: 'ok', timestamp: new Date(),
          }),
        },
        {
          id: 's2',
          name: 'Score 2',
          description: 'test',
          category: 'documentation',
          run: async () => ({
            id: 's2', name: 'Score 2', category: 'documentation',
            status: 'pass', score: 60, value: 60, threshold: 50,
            severity: 'low', message: 'ok', timestamp: new Date(),
          }),
        },
      ]
    )

    expect(suite.summary.overallScore).toBe(80)
  })

  it('should assign grade based on score', async () => {
    const suite = await runner.runSuite(
      'suite-4',
      'Grade Test',
      'Testing grade assignment',
      'architecture',
      [
        {
          id: 'g1',
          name: 'Grade Test',
          description: 'test',
          category: 'architecture',
          run: async () => ({
            id: 'g1', name: 'Grade Test', category: 'architecture',
            status: 'pass', score: 92, value: 92, threshold: 80,
            severity: 'low', message: 'A- grade', timestamp: new Date(),
          }),
        },
      ]
    )

    expect(suite.summary.overallScore).toBe(92)
    expect(suite.summary.grade).toBe('A-')
  })

  it('should capture duration for each eval', async () => {
    const suite = await runner.runSuite(
      'suite-5',
      'Duration Test',
      'Testing duration capture',
      'performance',
      [
        {
          id: 'd1',
          name: 'Duration Test',
          description: 'test',
          category: 'performance',
          run: async () => {
            await new Promise(r => setTimeout(r, 10))
            return {
              id: 'd1', name: 'Duration Test', category: 'performance',
              status: 'pass', score: 100, value: 10, threshold: 100,
              severity: 'low', message: 'ok', timestamp: new Date(),
            }
          },
        },
      ]
    )
    // Tolerance for timer granularity on different systems (may return 9 instead of 10)
    expect(suite.metrics[0].duration).toBeGreaterThanOrEqual(9)
    expect(suite.duration).toBeGreaterThan(0)
  })

  it('should handle eval errors gracefully', async () => {
    const suite = await runner.runSuite(
      'suite-6',
      'Error Test',
      'Testing error handling',
      'qa_testing',
      [
        {
          id: 'error-eval',
          name: 'Error Eval',
          description: 'This will fail',
          category: 'qa_testing',
          run: async () => {
            throw new Error('Simulated eval failure')
          },
        },
      ]
    )

    expect(suite.metrics).toHaveLength(1)
    expect(suite.metrics[0].status).toBe('error')
    expect(suite.metrics[0].score).toBe(0)
    expect(suite.metrics[0].message).toContain('Simulated eval failure')
  })

  it('should handle mixed success and error evals', async () => {
    const suite = await runner.runSuite(
      'suite-7',
      'Mixed Test',
      'Testing mixed success/error',
      'spiritual_correlations',
      [
        {
          id: 'success-eval',
          name: 'Success',
          description: 'succeeds',
          category: 'spiritual_correlations',
          run: async () => ({
            id: 'success-eval', name: 'Success', category: 'spiritual_correlations',
            status: 'pass', score: 95, value: 95, threshold: 80,
            severity: 'low', message: 'ok', timestamp: new Date(),
          }),
        },
        {
          id: 'fail-eval',
          name: 'Fails',
          description: 'fails',
          category: 'spiritual_correlations',
          run: async () => {
            throw new Error('This failed')
          },
        },
      ]
    )

    expect(suite.summary.total).toBe(2)
    expect(suite.summary.passed).toBe(1)
    expect(suite.metrics[1].status).toBe('error')
  })

  it('should get suite after execution', async () => {
    const suite = await runner.runSuite(
      'suite-8',
      'Getter Test',
      'Testing getSuite',
      'ui_design',
      [
        {
          id: 'get-test',
          name: 'Get Test',
          description: 'test',
          category: 'ui_design',
          run: async () => ({
            id: 'get-test', name: 'Get Test', category: 'ui_design',
            status: 'pass', score: 85, value: 85, threshold: 70,
            severity: 'low', message: 'ok', timestamp: new Date(),
          }),
        },
      ]
    )

    const retrievedSuite = runner.getSuite()
    expect(retrievedSuite).toBe(suite)
    expect(retrievedSuite?.id).toBe('suite-8')
  })
})

// ============================================================================
// 4. QualityReportGenerator Tests
// ============================================================================

describe('QualityReportGenerator', () => {
  let runner: EvalSuiteRunner
  let generator: QualityReportGenerator

  beforeEach(() => {
    runner = new EvalSuiteRunner()
    generator = new QualityReportGenerator()
  })

  it('should generate report from single suite', async () => {
    const suite = await runner.runSuite(
      'report-suite-1',
      'Report Suite 1',
      'First suite for report',
      'performance',
      [
        {
          id: 'r1',
          name: 'Report Test 1',
          description: 'test',
          category: 'performance',
          run: async () => ({
            id: 'r1', name: 'Report Test 1', category: 'performance',
            status: 'pass', score: 90, value: 90, threshold: 80,
            severity: 'medium', message: 'ok', timestamp: new Date(),
          }),
        },
      ]
    )

    const report = await generator.generateReport([suite], {
      branch: 'main',
      commit: 'abc123',
      runner: 'test-runner',
    })

    expect(report.suites).toHaveLength(1)
    expect(report.overallScore).toBe(90)
    expect(report.grade).toBe('A-')
  })

  it('should generate report from multiple suites', async () => {
    const suite1 = await runner.runSuite(
      'multi-suite-1',
      'Suite One',
      'First',
      'performance',
      [
        {
          id: 'ms1',
          name: 'Multi Suite 1',
          description: 'test',
          category: 'performance',
          run: async () => ({
            id: 'ms1', name: 'Multi Suite 1', category: 'performance',
            status: 'pass', score: 80, value: 80, threshold: 70,
            severity: 'low', message: 'ok', timestamp: new Date(),
          }),
        },
      ]
    )

    const runner2 = new EvalSuiteRunner()
    const suite2 = await runner2.runSuite(
      'multi-suite-2',
      'Suite Two',
      'Second',
      'ai_integration',
      [
        {
          id: 'ms2',
          name: 'Multi Suite 2',
          description: 'test',
          category: 'ai_integration',
          run: async () => ({
            id: 'ms2', name: 'Multi Suite 2', category: 'ai_integration',
            status: 'pass', score: 95, value: 95, threshold: 85,
            severity: 'low', message: 'ok', timestamp: new Date(),
          }),
        },
      ]
    )

    const report = await generator.generateReport([suite1, suite2], {
      branch: 'main',
      runner: 'multi-test',
    })

    expect(report.suites).toHaveLength(2)
    expect(report.overallScore).toBeGreaterThan(0)
  })

  it('should calculate weighted overall score', async () => {
    const suite1 = await runner.runSuite(
      'weighted-1',
      'Weighted Suite 1',
      'High weight category',
      'spiritual_correlations',
      [
        {
          id: 'w1',
          name: 'Weighted Test 1',
          description: 'test',
          category: 'spiritual_correlations',
          run: async () => ({
            id: 'w1', name: 'Weighted Test 1', category: 'spiritual_correlations',
            status: 'pass', score: 80, value: 80, threshold: 70,
            severity: 'low', message: 'ok', timestamp: new Date(),
          }),
        },
      ]
    )

    const runner2 = new EvalSuiteRunner()
    const suite2 = await runner2.runSuite(
      'weighted-2',
      'Weighted Suite 2',
      'Low weight category',
      'documentation',
      [
        {
          id: 'w2',
          name: 'Weighted Test 2',
          description: 'test',
          category: 'documentation',
          run: async () => ({
            id: 'w2', name: 'Weighted Test 2', category: 'documentation',
            status: 'pass', score: 60, value: 60, threshold: 50,
            severity: 'low', message: 'ok', timestamp: new Date(),
          }),
        },
      ]
    )

    const report = await generator.generateReport([suite1, suite2], {
      branch: 'main',
      runner: 'weighted-test',
    })

    // Weighted average: (80 * 1.5 + 60 * 0.8) / (1.5 + 0.8) = (120 + 48) / 2.3 = 73.04
    expect(report.overallScore).toBeCloseTo(73.04, 0)
  })

  it('should identify critical and high priority issues', async () => {
    const suite = await runner.runSuite(
      'critical-suite',
      'Critical Suite',
      'Suite with critical failures',
      'performance',
      [
        {
          id: 'crit-1',
          name: 'Critical Failure 1',
          description: 'critical',
          category: 'performance',
          run: async () => ({
            id: 'crit-1', name: 'Critical Failure 1', category: 'performance',
            status: 'fail', score: 20, value: 500, threshold: 100,
            severity: 'critical', message: 'Critical failure', timestamp: new Date(),
          }),
        },
        {
          id: 'high-1',
          name: 'High Severity Failure',
          description: 'high',
          category: 'performance',
          run: async () => ({
            id: 'high-1', name: 'High Severity Failure', category: 'performance',
            status: 'fail', score: 40, value: 300, threshold: 100,
            severity: 'high', message: 'High severity', timestamp: new Date(),
          }),
        },
        {
          id: 'pass-1',
          name: 'Passing Test',
          description: 'pass',
          category: 'performance',
          run: async () => ({
            id: 'pass-1', name: 'Passing Test', category: 'performance',
            status: 'pass', score: 90, value: 90, threshold: 80,
            severity: 'low', message: 'ok', timestamp: new Date(),
          }),
        },
      ]
    )

    const report = await generator.generateReport([suite], {
      branch: 'main',
      runner: 'critical-test',
    })

    expect(report.criticalIssues).toHaveLength(1)
    expect(report.criticalIssues[0].id).toBe('crit-1')
    expect(report.highPriorityIssues).toHaveLength(1)
    expect(report.highPriorityIssues[0].id).toBe('high-1')
  })

  it('should generate improvement suggestions for failures', async () => {
    const suite = await runner.runSuite(
      'improve-suite',
      'Improvement Suite',
      'Suite with improvements needed',
      'qa_testing',
      [
        {
          id: 'fail-metric',
          name: 'Failing Metric',
          description: 'fail',
          category: 'qa_testing',
          run: async () => ({
            id: 'fail-metric', name: 'Failing Metric', category: 'qa_testing',
            status: 'fail', score: 45, value: 45, threshold: 80,
            severity: 'critical', message: 'Failed metric', timestamp: new Date(),
          }),
        },
        {
          id: 'warn-metric',
          name: 'Warning Metric',
          description: 'warning',
          category: 'qa_testing',
          run: async () => ({
            id: 'warn-metric', name: 'Warning Metric', category: 'qa_testing',
            status: 'warning', score: 68, value: 68, threshold: 75,
            severity: 'high', message: 'Warning metric', timestamp: new Date(),
          }),
        },
      ]
    )

    const report = await generator.generateReport([suite], {
      branch: 'main',
      runner: 'improve-test',
    })

    expect(report.improvements).toHaveLength(2)
    expect(report.improvements[0].metricId).toBe('fail-metric')
    expect(report.improvements[0].currentValue).toBe(45)
    expect(report.improvements[0].targetValue).toBe(80)
    expect(report.improvements[0].impact).toBe('high')
  })

  it('should generate valid UUID for report id', async () => {
    const suite = await runner.runSuite(
      'uuid-suite',
      'UUID Suite',
      'Suite for UUID test',
      'architecture',
      [
        {
          id: 'uuid-test',
          name: 'UUID Test',
          description: 'test',
          category: 'architecture',
          run: async () => ({
            id: 'uuid-test', name: 'UUID Test', category: 'architecture',
            status: 'pass', score: 88, value: 88, threshold: 75,
            severity: 'low', message: 'ok', timestamp: new Date(),
          }),
        },
      ]
    )

    const report = await generator.generateReport([suite], {
      branch: 'main',
      runner: 'uuid-test',
    })

    expect(report.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
  })

  it('should include metadata in report', async () => {
    const suite = await runner.runSuite(
      'meta-suite',
      'Metadata Suite',
      'Suite for metadata test',
      'ux_design',
      [
        {
          id: 'meta-test',
          name: 'Meta Test',
          description: 'test',
          category: 'ux_design',
          run: async () => ({
            id: 'meta-test', name: 'Meta Test', category: 'ux_design',
            status: 'pass', score: 85, value: 85, threshold: 70,
            severity: 'low', message: 'ok', timestamp: new Date(),
          }),
        },
      ]
    )

    const report = await generator.generateReport([suite], {
      branch: 'feature/test-metrics',
      commit: 'def456',
      runner: 'ci-runner-42',
    })

    expect(report.metadata.branch).toBe('feature/test-metrics')
    expect(report.metadata.commit).toBe('def456')
    expect(report.metadata.runner).toBe('ci-runner-42')
  })

  it('should get report after generation', async () => {
    const suite = await runner.runSuite(
      'get-report-suite',
      'Get Report Suite',
      'Suite for get report test',
      'ui_design',
      [
        {
          id: 'get-report-test',
          name: 'Get Report Test',
          description: 'test',
          category: 'ui_design',
          run: async () => ({
            id: 'get-report-test', name: 'Get Report Test', category: 'ui_design',
            status: 'pass', score: 92, value: 92, threshold: 80,
            severity: 'low', message: 'ok', timestamp: new Date(),
          }),
        },
      ]
    )

    const report = await generator.generateReport([suite], {
      branch: 'main',
      runner: 'get-test',
    })

    const retrievedReport = generator.getReport()
    expect(retrievedReport).toBe(report)
    expect(retrievedReport?.id).toBe(report.id)
  })
})

// ============================================================================
// 5. validateMetricValue Tests - All Operators
// ============================================================================

describe('validateMetricValue', () => {
  describe('gte operator', () => {
    it('should return true when value equals threshold', () => {
      expect(validateMetricValue(100, 100, 'gte')).toBe(true)
    })

    it('should return true when value is greater than threshold', () => {
      expect(validateMetricValue(150, 100, 'gte')).toBe(true)
    })

    it('should return false when value is less than threshold', () => {
      expect(validateMetricValue(50, 100, 'gte')).toBe(false)
    })
  })

  describe('lte operator', () => {
    it('should return true when value equals threshold', () => {
      expect(validateMetricValue(100, 100, 'lte')).toBe(true)
    })

    it('should return true when value is less than threshold', () => {
      expect(validateMetricValue(50, 100, 'lte')).toBe(true)
    })

    it('should return false when value is greater than threshold', () => {
      expect(validateMetricValue(150, 100, 'lte')).toBe(false)
    })
  })

  describe('eq operator', () => {
    it('should return true when value exactly equals threshold', () => {
      expect(validateMetricValue(100, 100, 'eq')).toBe(true)
    })

    it('should return false when value does not equal threshold', () => {
      expect(validateMetricValue(99.99, 100, 'eq')).toBe(false)
      expect(validateMetricValue(100.01, 100, 'eq')).toBe(false)
    })
  })

  describe('gt operator', () => {
    it('should return false when value equals threshold', () => {
      expect(validateMetricValue(100, 100, 'gt')).toBe(false)
    })

    it('should return true when value is greater than threshold', () => {
      expect(validateMetricValue(100.01, 100, 'gt')).toBe(true)
    })

    it('should return false when value is less than threshold', () => {
      expect(validateMetricValue(50, 100, 'gt')).toBe(false)
    })
  })

  describe('lt operator', () => {
    it('should return false when value equals threshold', () => {
      expect(validateMetricValue(100, 100, 'lt')).toBe(false)
    })

    it('should return true when value is less than threshold', () => {
      expect(validateMetricValue(99.99, 100, 'lt')).toBe(true)
    })

    it('should return false when value is greater than threshold', () => {
      expect(validateMetricValue(150, 100, 'lt')).toBe(false)
    })
  })

  describe('default operator', () => {
    it('should use gte as default operator', () => {
      expect(validateMetricValue(100, 100)).toBe(true)
      expect(validateMetricValue(150, 100)).toBe(true)
      expect(validateMetricValue(50, 100)).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('should handle negative values', () => {
      expect(validateMetricValue(-50, -100, 'gte')).toBe(true)
      expect(validateMetricValue(-150, -100, 'lte')).toBe(true)
    })

    it('should handle decimal values', () => {
      expect(validateMetricValue(99.5, 100, 'lt')).toBe(true)
      expect(validateMetricValue(100.5, 100, 'gt')).toBe(true)
      expect(validateMetricValue(99.999, 100, 'lt')).toBe(true)
    })

    it('should handle zero values', () => {
      expect(validateMetricValue(0, 0, 'eq')).toBe(true)
      expect(validateMetricValue(0, 0, 'gte')).toBe(true)
      expect(validateMetricValue(0, 0, 'lte')).toBe(true)
    })
  })
})

// ============================================================================
// 6. calculateScoreFromValue Tests - All Thresholds
// ============================================================================

describe('calculateScoreFromValue', () => {
  const standardThresholds = {
    critical: 95,
    high: 85,
    medium: 70,
    low: 50,
  }

  it('should return 100 when value >= critical', () => {
    expect(calculateScoreFromValue(95, standardThresholds)).toBe(100)
    expect(calculateScoreFromValue(100, standardThresholds)).toBe(100)
    expect(calculateScoreFromValue(150, standardThresholds)).toBe(100)
  })

  it('should calculate score in high range (80-100)', () => {
    expect(calculateScoreFromValue(85, standardThresholds)).toBe(80)
    expect(calculateScoreFromValue(90, standardThresholds)).toBe(90)
  })

  it('should calculate score in medium range (60-80)', () => {
    expect(calculateScoreFromValue(70, standardThresholds)).toBe(60)
    expect(calculateScoreFromValue(77.5, standardThresholds)).toBe(70)
  })

  it('should calculate score in low range (40-60)', () => {
    expect(calculateScoreFromValue(50, standardThresholds)).toBe(40)
    expect(calculateScoreFromValue(60, standardThresholds)).toBe(50)
  })

  it('should calculate score below low threshold', () => {
    expect(calculateScoreFromValue(0, standardThresholds)).toBe(0)
    expect(calculateScoreFromValue(25, standardThresholds)).toBe(20)
    expect(calculateScoreFromValue(49, standardThresholds)).toBeCloseTo(39.2, 1)
  })

  it('should not return negative scores', () => {
    expect(calculateScoreFromValue(-50, standardThresholds)).toBe(0)
    expect(calculateScoreFromValue(-100, standardThresholds)).toBe(0)
  })

  it('should work with different threshold values', () => {
    const customThresholds = {
      critical: 100,
      high: 80,
      medium: 60,
      low: 40,
    }

    expect(calculateScoreFromValue(100, customThresholds)).toBe(100)
    expect(calculateScoreFromValue(80, customThresholds)).toBe(80)
    expect(calculateScoreFromValue(60, customThresholds)).toBe(60)
    expect(calculateScoreFromValue(40, customThresholds)).toBe(40)
    expect(calculateScoreFromValue(20, customThresholds)).toBe(20)
  })

  it('should handle tight threshold ranges', () => {
    const tightThresholds = {
      critical: 100,
      high: 98,
      medium: 95,
      low: 90,
    }

    expect(calculateScoreFromValue(100, tightThresholds)).toBe(100)
    expect(calculateScoreFromValue(98, tightThresholds)).toBe(80)
    expect(calculateScoreFromValue(95, tightThresholds)).toBe(60)
    expect(calculateScoreFromValue(90, tightThresholds)).toBe(40)
  })
})

// ============================================================================
// 7. DEFAULT_THRESHOLDS Tests - All Thresholds
// ============================================================================

describe('DEFAULT_THRESHOLDS', () => {
  it('should have exactly 8 threshold configurations', () => {
    expect(DEFAULT_THRESHOLDS).toHaveLength(8)
  })

  it('should include all metric categories', () => {
    const categories = DEFAULT_THRESHOLDS.map(t => t.category)
    expect(categories).toContain('spiritual_correlations')
    expect(categories).toContain('ai_integration')
    expect(categories).toContain('performance')
    expect(categories).toContain('ui_design')
    expect(categories).toContain('ux_design')
    expect(categories).toContain('architecture')
    expect(categories).toContain('qa_testing')
    expect(categories).toContain('documentation')
  })

  it('should have correct spiritual_correlations thresholds', () => {
    const spiritual = DEFAULT_THRESHOLDS.find(t => t.category === 'spiritual_correlations')
    expect(spiritual?.thresholds).toEqual({ critical: 95, high: 85, medium: 70, low: 50 })
    expect(spiritual?.weight).toBe(1.5)
  })

  it('should have correct ai_integration thresholds', () => {
    const ai = DEFAULT_THRESHOLDS.find(t => t.category === 'ai_integration')
    expect(ai?.thresholds).toEqual({ critical: 90, high: 80, medium: 65, low: 45 })
    expect(ai?.weight).toBe(1.5)
  })

  it('should have correct performance thresholds', () => {
    const perf = DEFAULT_THRESHOLDS.find(t => t.category === 'performance')
    expect(perf?.thresholds).toEqual({ critical: 90, high: 75, medium: 60, low: 40 })
    expect(perf?.weight).toBe(1.2)
  })

  it('should have correct ui_design thresholds', () => {
    const ui = DEFAULT_THRESHOLDS.find(t => t.category === 'ui_design')
    expect(ui?.thresholds).toEqual({ critical: 85, high: 75, medium: 60, low: 40 })
    expect(ui?.weight).toBe(1.0)
  })

  it('should have correct ux_design thresholds', () => {
    const ux = DEFAULT_THRESHOLDS.find(t => t.category === 'ux_design')
    expect(ux?.thresholds).toEqual({ critical: 85, high: 75, medium: 60, low: 40 })
    expect(ux?.weight).toBe(1.0)
  })

  it('should have correct architecture thresholds', () => {
    const arch = DEFAULT_THRESHOLDS.find(t => t.category === 'architecture')
    expect(arch?.thresholds).toEqual({ critical: 90, high: 80, medium: 65, low: 45 })
    expect(arch?.weight).toBe(1.2)
  })

  it('should have correct qa_testing thresholds', () => {
    const qa = DEFAULT_THRESHOLDS.find(t => t.category === 'qa_testing')
    expect(qa?.thresholds).toEqual({ critical: 90, high: 80, medium: 65, low: 45 })
    expect(qa?.weight).toBe(1.3)
  })

  it('should have correct documentation thresholds', () => {
    const doc = DEFAULT_THRESHOLDS.find(t => t.category === 'documentation')
    expect(doc?.thresholds).toEqual({ critical: 80, high: 70, medium: 55, low: 35 })
    expect(doc?.weight).toBe(0.8)
  })

  it('should have critical > high > medium > low for all configs', () => {
    for (const config of DEFAULT_THRESHOLDS) {
      expect(config.thresholds.critical).toBeGreaterThan(config.thresholds.high)
      expect(config.thresholds.high).toBeGreaterThan(config.thresholds.medium)
      expect(config.thresholds.medium).toBeGreaterThan(config.thresholds.low)
    }
  })

  it('should have positive weights', () => {
    for (const config of DEFAULT_THRESHOLDS) {
      expect(config.weight).toBeGreaterThan(0)
    }
  })

  it('should have non-empty names', () => {
    for (const config of DEFAULT_THRESHOLDS) {
      expect(config.name).toBeTruthy()
    }
  })
})

// ============================================================================
// 8. Zod Schema Validation Tests
// ============================================================================

describe('Zod Schema Validation', () => {
  describe('MetricResultSchema', () => {
    it('should validate a complete metric', () => {
      const validMetric = {
        id: 'test-metric-1',
        name: 'Valid Metric',
        category: 'performance',
        status: 'pass',
        score: 85.5,
        value: 100,
        threshold: 80,
        severity: 'high',
        message: 'Metric passed',
        timestamp: new Date(),
      }

      const result = MetricResultSchema.safeParse(validMetric)
      expect(result.success).toBe(true)
    })

    it('should reject missing required fields', () => {
      const incompleteMetric = {
        id: 'test-metric-2',
        name: 'Incomplete Metric',
        category: 'performance',
      }

      const result = MetricResultSchema.safeParse(incompleteMetric)
      expect(result.success).toBe(false)
    })

    it('should reject invalid category', () => {
      const invalidMetric = {
        id: 'test-metric-3',
        name: 'Bad Category',
        category: 'invalid_category',
        status: 'pass',
        score: 80,
        value: 80,
        threshold: 70,
        severity: 'low',
        message: 'Test',
        timestamp: new Date(),
      }

      const result = MetricResultSchema.safeParse(invalidMetric)
      expect(result.success).toBe(false)
    })

    it('should reject invalid status', () => {
      const invalidMetric = {
        id: 'test-metric-4',
        name: 'Bad Status',
        category: 'performance',
        status: 'invalid_status',
        score: 80,
        value: 80,
        threshold: 70,
        severity: 'low',
        message: 'Test',
        timestamp: new Date(),
      }

      const result = MetricResultSchema.safeParse(invalidMetric)
      expect(result.success).toBe(false)
    })

    it('should reject score outside 0-100 range', () => {
      const overScore = {
        id: 'test-metric-5',
        name: 'Over Score',
        category: 'performance',
        status: 'pass',
        score: 150,
        value: 150,
        threshold: 100,
        severity: 'low',
        message: 'Test',
        timestamp: new Date(),
      }

      expect(MetricResultSchema.safeParse(overScore).success).toBe(false)

      const underScore = { ...overScore, score: -10 }
      expect(MetricResultSchema.safeParse(underScore).success).toBe(false)
    })

    it('should accept optional fields', () => {
      const metricWithOptional = {
        id: 'test-metric-6',
        name: 'With Optionals',
        category: 'ai_integration',
        status: 'warning',
        score: 65,
        value: 85,
        threshold: 80,
        severity: 'medium',
        message: 'Near threshold',
        timestamp: new Date(),
        unit: 'ms',
        details: { responseTime: 85, expected: 80 },
        duration: 150,
      }

      const result = MetricResultSchema.safeParse(metricWithOptional)
      expect(result.success).toBe(true)
    })
  })

  describe('EvalSuiteSchema', () => {
    it('should validate a complete suite', () => {
      const validSuite = {
        id: 'suite-1',
        name: 'Test Suite',
        description: 'A test suite',
        category: 'performance',
        version: '1.0.0',
        metrics: [],
        summary: {
          total: 0,
          passed: 0,
          failed: 0,
          warnings: 0,
          skipped: 0,
          overallScore: 0,
          grade: 'F' as const,
        },
        executedAt: new Date(),
        duration: 100,
      }

      const result = EvalSuiteSchema.safeParse(validSuite)
      expect(result.success).toBe(true)
    })

    it('should reject invalid grade in summary', () => {
      const invalidSuite = {
        id: 'suite-2',
        name: 'Invalid Grade',
        description: 'Bad grade',
        category: 'performance',
        version: '1.0.0',
        metrics: [],
        summary: {
          total: 1,
          passed: 1,
          failed: 0,
          warnings: 0,
          skipped: 0,
          overallScore: 100,
          grade: 'Z' as const,
        },
        executedAt: new Date(),
        duration: 50,
      }

      const result = EvalSuiteSchema.safeParse(invalidSuite)
      expect(result.success).toBe(false)
    })
  })

  describe('QualityReportSchema', () => {
    it('should validate a complete report', () => {
      const validReport = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        timestamp: new Date(),
        version: '1.0.0',
        suites: [],
        overallScore: 85.5,
        grade: 'B' as const,
        criticalIssues: [],
        highPriorityIssues: [],
        improvements: [],
        trend: {
          previousScore: 80,
          delta: 5.5,
          trend: 'improving' as const,
        },
        metadata: {
          branch: 'main',
          commit: 'abc123',
          runner: 'ci-test',
        },
      }

      const result = QualityReportSchema.safeParse(validReport)
      expect(result.success).toBe(true)
    })

    it('should reject invalid UUID format', () => {
      const invalidReport = {
        id: 'not-a-uuid',
        timestamp: new Date(),
        version: '1.0.0',
        suites: [],
        overallScore: 85.5,
        grade: 'B' as const,
        criticalIssues: [],
        highPriorityIssues: [],
        improvements: [],
        trend: {},
        metadata: {
          branch: 'main',
          runner: 'test',
        },
      }

      const result = QualityReportSchema.safeParse(invalidReport)
      expect(result.success).toBe(false)
    })

    it('should reject invalid trend direction', () => {
      const invalidTrend = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        timestamp: new Date(),
        version: '1.0.0',
        suites: [],
        overallScore: 85.5,
        grade: 'B' as const,
        criticalIssues: [],
        highPriorityIssues: [],
        improvements: [],
        trend: {
          trend: 'invalid_direction' as any,
        },
        metadata: {
          branch: 'main',
          runner: 'test',
        },
      }

      const result = QualityReportSchema.safeParse(invalidTrend)
      expect(result.success).toBe(false)
    })
  })

  describe('MetricSchemas export', () => {
    it('should export all schemas', () => {
      expect(MetricSchemas.MetricResult).toBeDefined()
      expect(MetricSchemas.EvalSuite).toBeDefined()
      expect(MetricSchemas.QualityReport).toBeDefined()
      expect(MetricSchemas.MetricCategory).toBeDefined()
      expect(MetricSchemas.MetricSeverity).toBeDefined()
      expect(MetricSchemas.MetricStatus).toBeDefined()
    })

    it('should validate enum schemas', () => {
      expect(MetricSchemas.MetricCategory.safeParse('performance').success).toBe(true)
      expect(MetricSchemas.MetricSeverity.safeParse('high').success).toBe(true)
      expect(MetricSchemas.MetricStatus.safeParse('pass').success).toBe(true)
    })
  })

  describe('Enum validation', () => {
    it('should validate all metric categories', () => {
      const categories = [
        'spiritual_correlations',
        'ai_integration',
        'performance',
        'ui_design',
        'ux_design',
        'architecture',
        'qa_testing',
        'documentation',
      ]

      for (const cat of categories) {
        expect(MetricCategory.parse(cat)).toBe(cat)
      }
    })

    it('should validate all severity levels', () => {
      const severities = ['critical', 'high', 'medium', 'low', 'info']
      for (const sev of severities) {
        expect(MetricSeverity.parse(sev)).toBe(sev)
      }
    })

    it('should validate all statuses', () => {
      const statuses = ['pass', 'fail', 'warning', 'skipped', 'error']
      for (const stat of statuses) {
        expect(MetricStatus.parse(stat)).toBe(stat)
      }
    })
  })
})