/**
 * QA & Testing Evals - Cabala dos Caminhos
 * Rigorous evaluation of test coverage, quality, and reliability
 */

import { readFile, readdir, stat, access, constants } from 'fs/promises'
import { join } from 'path'
import { glob } from 'glob'
import {
  EvalDefinition,
  MetricResultBuilder,
  MetricCategory,
  MetricSeverity,
  MetricStatus,
} from '../metrics-framework'

// ============================================================================
// Constants
// ============================================================================

const PROJECT_ROOT = process.cwd()
const TESTS_DIR = join(PROJECT_ROOT, 'tests')
const COVERAGE_THRESHOLD = 80
const CRITICAL_PATH_THRESHOLD = 95
const FLAKINESS_THRESHOLD = 5
const EXECUTION_TIME_THRESHOLD = 300 // 5 minutes in seconds
const ASSERTION_MIN_DENSITY = 2
const CRITICAL_PATHS = [
  'auth',
  'payment',
  'jwt',
  'token',
  'creditos',
  'creditosInput',
]

// ============================================================================
// Helper Functions
// ============================================================================

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path, constants.F_OK)
    return true
  } catch {
    return false
  }
}

async function readTestFiles(pattern: string): Promise<string[]> {
  const files = await glob(pattern, { cwd: PROJECT_ROOT, absolute: true })
  return Promise.all(
    files.map(async (f) => {
      try {
        return await readFile(f, 'utf-8')
      } catch {
        return ''
      }
    })
  ).then((contents) => contents.filter(Boolean))
}

function countOccurrences(content: string, pattern: RegExp): number {
  const matches = content.match(pattern)
  return matches ? matches.length : 0
}

function calculatePercentage(part: number, total: number): number {
  if (total === 0) return 0
  return Math.round((part / total) * 100 * 100) / 100
}

interface TestStats {
  totalTests: number
  assertions: number
  mocks: number
  spies: number
  describeBlocks: number
  itBlocks: number
  beforeEachBlocks: number
  afterEachBlocks: number
  beforeAllBlocks: number
  sharedStateUsage: number
}

function analyzeTestContent(content: string): TestStats {
  return {
    totalTests: countOccurrences(content, /\bit\s*\(/g),
    assertions: countOccurrences(content, /\.to(?:Be|Equal|Truthy|Falsy|Null|Defined|Undefined|Contain|HaveLength|HaveProperty|Throw|HaveBeenCalled|HaveBeenCalledWith|toStrictEqual)/g) +
      countOccurrences(content, /\.expect\(/g),
    mocks: countOccurrences(content, /vi\.mock\(|jest\.mock\(|mock\(|createMock\(/g),
    spies: countOccurrences(content, /vi\.spyOn\(|jest\.spyOn\(|spyOn\(/g),
    describeBlocks: countOccurrences(content, /\bdescribe\s*\(/g),
    itBlocks: countOccurrences(content, /\bit\s*\(|test\s*\(/g),
    beforeEachBlocks: countOccurrences(content, /\bbeforeEach\s*\(/g),
    afterEachBlocks: countOccurrences(content, /\bafterEach\s*\(/g),
    beforeAllBlocks: countOccurrences(content, /\b(beforeAll|beforeEach|before)\s*\(/g),
    sharedStateUsage: countOccurrences(content, /global\.|process\.|window\.|document\.innerHTML\s*=/g),
  }
}

interface CoverageData {
  lines: { total: number; covered: number; uncovered: string[] }
  branches: { total: number; covered: number }
  functions: { total: number; covered: number }
}

async function getCoverageData(): Promise<CoverageData | null> {
  // Try to read Vitest coverage output
  const coveragePath = join(PROJECT_ROOT, 'coverage', 'coverage-summary.json')
  const exists = await fileExists(coveragePath)

  if (!exists) return null

  try {
    const content = await readFile(coveragePath, 'utf-8')
    const data = JSON.parse(content)

    // Calculate from Istanbul/coverage output format
    const allFiles = Object.values(data) as Array<{
      lines?: { total: number; covered: number }
      branches?: { total: number; covered: number }
      functions?: { total: number; covered: number }
    }>

    const linesTotal = allFiles.reduce((acc, f) => acc + (f.lines?.total || 0), 0)
    const linesCovered = allFiles.reduce((acc, f) => acc + (f.lines?.covered || 0), 0)
    const branchesTotal = allFiles.reduce((acc, f) => acc + (f.branches?.total || 0), 0)
    const branchesCovered = allFiles.reduce((acc, f) => acc + (f.branches?.covered || 0), 0)
    const functionsTotal = allFiles.reduce((acc, f) => acc + (f.functions?.total || 0), 0)
    const functionsCovered = allFiles.reduce((acc, f) => acc + (f.functions?.covered || 0), 0)

    return {
      lines: { total: linesTotal, covered: linesCovered, uncovered: [] },
      branches: { total: branchesTotal, covered: branchesCovered },
      functions: { total: functionsTotal, covered: functionsCovered },
    }
  } catch {
    return null
  }
}

// ============================================================================
// 1. Test Coverage Eval
// ============================================================================

export const testCoverageEval: EvalDefinition = {
  id: 'qa-test-coverage',
  name: 'Test Coverage',
  description: 'Verifica cobertura de testes (threshold: >80% linhas)',
  category: 'qa_testing' as MetricCategory,

  async run() {
    const startTime = Date.now()
    const builder = new MetricResultBuilder(
      'qa-test-coverage',
      'Test Coverage',
      'qa_testing' as MetricCategory
    )

    try {
      const coverage = await getCoverageData()

      if (!coverage) {
        return builder
          .status('warning')
          .score(0)
          .value('Coverage report not found. Run tests with --coverage flag.')
          .threshold(`>${COVERAGE_THRESHOLD}%`)
          .severity('high')
          .message('Coverage data unavailable - run vitest with --coverage')
          .details({ hint: 'Run: vitest run --coverage' })
          .duration(Date.now() - startTime)
          .build()
      }

      const coveragePercent = calculatePercentage(
        coverage.lines.covered,
        coverage.lines.total
      )

      const status: MetricStatus =
        coveragePercent >= COVERAGE_THRESHOLD ? 'pass' : 'fail'
      const severity: MetricSeverity =
        coveragePercent >= COVERAGE_THRESHOLD
          ? 'info'
          : coveragePercent >= 60
          ? 'high'
          : 'critical'

      return builder
        .status(status)
        .score(coveragePercent)
        .value(`${coveragePercent}% (${coverage.lines.covered}/${coverage.lines.total} lines)`)
        .threshold(`>${COVERAGE_THRESHOLD}%`)
        .severity(severity)
        .message(
          coveragePercent >= COVERAGE_THRESHOLD
            ? 'Test coverage meets threshold'
            : `Coverage below threshold: ${coveragePercent}% < ${COVERAGE_THRESHOLD}%`
        )
        .details({
          linesCovered: coverage.lines.covered,
          linesTotal: coverage.lines.total,
          branchesCovered: coverage.branches.covered,
          branchesTotal: coverage.branches.total,
          functionsCovered: coverage.functions.covered,
          functionsTotal: coverage.functions.total,
          coveragePercent,
        })
        .duration(Date.now() - startTime)
        .build()
    } catch (error) {
      return builder
        .status('error')
        .score(0)
        .value(error instanceof Error ? error.message : 'Unknown error')
        .threshold(`>${COVERAGE_THRESHOLD}%`)
        .severity('critical')
        .message('Failed to analyze test coverage')
        .duration(Date.now() - startTime)
        .build()
    }
  },
}

// ============================================================================
// 2. Critical Path Coverage Eval
// ============================================================================

export const criticalPathCoverageEval: EvalDefinition = {
  id: 'qa-critical-path-coverage',
  name: 'Critical Path Coverage',
  description: 'Cobertura de paths críticos (auth, payments) >95%',
  category: 'qa_testing' as MetricCategory,

  async run() {
    const startTime = Date.now()
    const builder = new MetricResultBuilder(
      'qa-critical-path-coverage',
      'Critical Path Coverage',
      'qa_testing' as MetricCategory
    )

    try {
      // Find all test files
      const testFiles = await glob('tests/**/*.test.{ts,tsx}', { cwd: PROJECT_ROOT })

      if (testFiles.length === 0) {
        return builder
          .status('fail')
          .score(0)
          .value('No test files found')
          .threshold(`>${CRITICAL_PATH_THRESHOLD}%`)
          .severity('critical')
          .message('Critical path coverage cannot be measured')
          .details({ testFilesFound: 0 })
          .duration(Date.now() - startTime)
          .build()
      }

      // Analyze coverage of critical paths
      const criticalPatterns = CRITICAL_PATHS.map((path) => {
        const regex = new RegExp(
          `describe\\(['"']${path}|describe\\(['"]${path.toUpperCase()}|it\\(['"'].*${path}|test\\(['"'].*${path}`,
          'gi'
        )
        return { path, regex }
      })

      const pathResults: Record<string, { tested: boolean; testFiles: string[] }> = {}
      let criticalTestsFound = 0
      const criticalTotal = criticalPatterns.length

      for (const testFile of testFiles) {
        const content = await readFile(join(PROJECT_ROOT, testFile), 'utf-8')

        for (const { path, regex } of criticalPatterns) {
          if (regex.test(content)) {
            if (!pathResults[path]) {
              pathResults[path] = { tested: false, testFiles: [] }
            }
            if (!pathResults[path].testFiles.includes(testFile)) {
              pathResults[path].testFiles.push(testFile)
            }
            pathResults[path].tested = true
            criticalTestsFound++
          }
          regex.lastIndex = 0 // Reset regex
        }
      }

      const coveragePercent = calculatePercentage(criticalTestsFound, criticalTotal)

      const status: MetricStatus =
        coveragePercent >= CRITICAL_PATH_THRESHOLD ? 'pass' : 'fail'
      const severity: MetricSeverity =
        coveragePercent >= CRITICAL_PATH_THRESHOLD
          ? 'info'
          : coveragePercent >= 80
          ? 'high'
          : 'critical'

      return builder
        .status(status)
        .score(coveragePercent)
        .value(`${coveragePercent}% (${criticalTestsFound}/${criticalTotal} critical paths)`)
        .threshold(`>${CRITICAL_PATH_THRESHOLD}%`)
        .severity(severity)
        .message(
          coveragePercent >= CRITICAL_PATH_THRESHOLD
            ? 'Critical paths adequately covered'
            : `${criticalTotal - criticalTestsFound} critical paths lack coverage`
        )
        .details({
          coveragePercent,
          criticalPaths: pathResults,
          criticalTotal,
          criticalTestsFound,
          testFilesAnalyzed: testFiles.length,
          missingPaths: Object.entries(pathResults)
            .filter(([, v]) => !v.tested)
            .map(([k]) => k),
        })
        .duration(Date.now() - startTime)
        .build()
    } catch (error) {
      return builder
        .status('error')
        .score(0)
        .value(error instanceof Error ? error.message : 'Unknown error')
        .threshold(`>${CRITICAL_PATH_THRESHOLD}%`)
        .severity('critical')
        .message('Failed to analyze critical path coverage')
        .duration(Date.now() - startTime)
        .build()
    }
  },
}

// ============================================================================
// 3. Test Flakiness Eval
// ============================================================================

export const testFlakinessEval: EvalDefinition = {
  id: 'qa-test-flakiness',
  name: 'Test Flakiness',
  description: 'Verifica tests não são flaky (threshold: <5% flakiness)',
  category: 'qa_testing' as MetricCategory,

  async run() {
    const startTime = Date.now()
    const builder = new MetricResultBuilder(
      'qa-test-flakiness',
      'Test Flakiness',
      'qa_testing' as MetricCategory
    )

    try {
      const testContents = await readTestFiles('tests/**/*.test.{ts,tsx}')

      if (testContents.length === 0) {
        return builder
          .status('warning')
          .score(100)
          .value('No tests found to analyze')
          .threshold(`<${FLAKINESS_THRESHOLD}%`)
          .severity('medium')
          .message('No flakiness analysis possible')
          .details({ testsAnalyzed: 0 })
          .duration(Date.now() - startTime)
          .build()
      }

      // Patterns that indicate potential flakiness
      const flakinessPatterns = {
        randomValues: /Math\.random\(\)|faker\.|Chance\./g,
        timersWithoutClear: /setTimeout|setInterval/g,
        missingAsyncWaits: /async.*\b(it|test)\b.*\{[^}]*\.(?!await)(?!wait)/g,
        sleepStatements: /sleep|delay|wait\([0-9]+\)/g,
        raceConditions: /Promise\.race|allSettled|all/g,
        missingCleanup: /afterEach|afterAll|cleanup/g,
        hardcodedTimeouts: /timeout.*1000|timeout.*2000/g,
        flakyNetworkCalls: /fetch|axios|supertest/g,
      }

      const results: Record<string, number> = {}
      let totalFlakyIndicators = 0
      let testsAnalyzed = 0

      for (const content of testContents) {
        const stats = analyzeTestContent(content)
        testsAnalyzed += stats.itBlocks

        for (const [patternName, regex] of Object.entries(flakinessPatterns)) {
          const count = countOccurrences(content, new RegExp(regex.source, 'gi'))
          results[patternName] = (results[patternName] || 0) + count
          totalFlakyIndicators += count
        }
      }

      // Check for missing cleanup patterns (increases flakiness score)
      const hasMissingCleanup = testContents.some((c) => {
        const stats = analyzeTestContent(c)
        return (
          (stats.beforeEachBlocks > 0 || stats.beforeAllBlocks > 0) &&
          stats.afterEachBlocks === 0 &&
          stats.afterEachBlocks === 0
        )
      })

      if (hasMissingCleanup) {
        results.missingCleanup = -1 // Indicate missing cleanup
        totalFlakyIndicators += 2
      }

      // Calculate flakiness score (lower is better, inverted for score)
      const flakinessPercent = testsAnalyzed > 0
        ? Math.min(100, (totalFlakyIndicators / Math.max(1, testsAnalyzed)) * 100)
        : 0

      const score = Math.max(0, 100 - flakinessPercent * 2)

      const status: MetricStatus =
        flakinessPercent <= FLAKINESS_THRESHOLD ? 'pass' : 'fail'
      const severity: MetricSeverity =
        flakinessPercent <= FLAKINESS_THRESHOLD
          ? 'info'
          : flakinessPercent <= 15
          ? 'high'
          : 'critical'

      return builder
        .status(status)
        .score(Math.round(score * 100) / 100)
        .value(`${flakinessPercent.toFixed(2)}% flakiness indicators`)
        .threshold(`<${FLAKINESS_THRESHOLD}%`)
        .severity(severity)
        .message(
          flakinessPercent <= FLAKINESS_THRESHOLD
            ? 'Tests appear stable with minimal flaky patterns'
            : `High flakiness risk: ${totalFlakyIndicators} indicators detected`
        )
        .details({
          flakinessPercent: Math.round(flakinessPercent * 100) / 100,
          totalFlakyIndicators,
          testsAnalyzed,
          indicatorsByType: results,
          hasMissingCleanup,
        })
        .duration(Date.now() - startTime)
        .build()
    } catch (error) {
      return builder
        .status('error')
        .score(0)
        .value(error instanceof Error ? error.message : 'Unknown error')
        .threshold(`<${FLAKINESS_THRESHOLD}%`)
        .severity('critical')
        .message('Failed to analyze test flakiness')
        .duration(Date.now() - startTime)
        .build()
    }
  },
}

// ============================================================================
// 4. Test Execution Time Eval
// ============================================================================

export const testExecutionTimeEval: EvalDefinition = {
  id: 'qa-execution-time',
  name: 'Test Execution Time',
  description: 'Tempo total de execução (threshold: <5min)',
  category: 'qa_testing' as MetricCategory,

  async run() {
    const startTime = Date.now()
    const builder = new MetricResultBuilder(
      'qa-execution-time',
      'Test Execution Time',
      'qa_testing' as MetricCategory
    )

    try {
      // Analyze test files for execution time hints
      const testContents = await readTestFiles('tests/**/*.test.{ts,tsx}')

      let totalEstimatedTime = 0
      const slowTests: { file: string; reason: string }[] = []

      for (const content of testContents) {
        // Count operations that typically slow tests
        const networkCalls = countOccurrences(content, /fetch|axios|supertest|msw/g)
        const dbOperations = countOccurrences(content, /prisma\.|db\.|mongodb|redis/g)
        const aiCalls = countOccurrences(content, /openai|ai\.|chat|gpt/g)
        const sleeps = countOccurrences(content, /sleep|delay|wait\(|setTimeout/g)

        // Estimate time: network ~200ms, db ~50ms, ai ~500ms, sleep already accounted
        const estimatedTime =
          networkCalls * 200 + dbOperations * 50 + aiCalls * 500

        totalEstimatedTime += estimatedTime

        if (estimatedTime > 1000) {
          slowTests.push({
            file: 'unknown',
            reason: `Network: ${networkCalls}, DB: ${dbOperations}, AI: ${aiCalls}`,
          })
        }
      }

      // Convert to seconds
      const estimatedSeconds = Math.round(totalEstimatedTime / 1000)

      const status: MetricStatus =
        estimatedSeconds <= EXECUTION_TIME_THRESHOLD ? 'pass' : 'warning'
      const severity: MetricSeverity =
        estimatedSeconds <= EXECUTION_TIME_THRESHOLD
          ? 'info'
          : estimatedSeconds <= 360
          ? 'high'
          : 'critical'

      return builder
        .status(status)
        .score(
          Math.max(
            0,
            100 - (estimatedSeconds / EXECUTION_TIME_THRESHOLD) * 100
          )
        )
        .value(`${estimatedSeconds}s estimated`)
        .threshold(`<${EXECUTION_TIME_THRESHOLD}s (5min)`)
        .severity(severity)
        .message(
          estimatedSeconds <= EXECUTION_TIME_THRESHOLD
            ? 'Test execution time within acceptable limits'
            : `Tests may exceed time budget: ${estimatedSeconds}s estimated`
        )
        .details({
          estimatedSeconds,
          slowTestsCount: slowTests.length,
          slowTests: slowTests.slice(0, 10),
          thresholdSeconds: EXECUTION_TIME_THRESHOLD,
        })
        .duration(Date.now() - startTime)
        .build()
    } catch (error) {
      return builder
        .status('error')
        .score(0)
        .value(error instanceof Error ? error.message : 'Unknown error')
        .threshold(`<${EXECUTION_TIME_THRESHOLD}s`)
        .severity('critical')
        .message('Failed to analyze test execution time')
        .duration(Date.now() - startTime)
        .build()
    }
  },
}

// ============================================================================
// 5. Mock Quality Eval
// ============================================================================

export const mockQualityEval: EvalDefinition = {
  id: 'qa-mock-quality',
  name: 'Mock Quality',
  description: 'Verifica mocks não estão mocking demais',
  category: 'qa_testing' as MetricCategory,

  async run() {
    const startTime = Date.now()
    const builder = new MetricResultBuilder(
      'qa-mock-quality',
      'Mock Quality',
      'qa_testing' as MetricCategory
    )

    try {
      const testContents = await readTestFiles('tests/**/*.test.{ts,tsx}')

      if (testContents.length === 0) {
        return builder
          .status('warning')
          .score(100)
          .value('No tests found')
          .threshold('Quality threshold: 70-90%')
          .severity('medium')
          .message('Mock quality cannot be assessed')
          .duration(Date.now() - startTime)
          .build()
      }

      let totalMocks = 0
      let overMocked = 0
      let underMocked = 0
      const issues: string[] = []

      for (const content of testContents) {
        const stats = analyzeTestContent(content)
        totalMocks += stats.mocks

        // Check for over-mocking (mocking too much = not testing real behavior)
        const allMockPattern = /vi\.mock\(.*,\s*\(\)\s*=>\s*\{[^}]*\}/g
        const wildcardMocks = countOccurrences(
          content,
          /vi\.mock\(['"'].*\*|jest\.mock\(['"'].*\*|mock.*:\s*\{[^}]*\.\.\./g
        )
        const deepMocking = countOccurrences(
          content,
          /mockResolvedValue|mockRejectedValue|mockImplementation/g
        )

        // Over-mocking indicators
        if (wildcardMocks > 0 && stats.itBlocks > 0) {
          const ratio = wildcardMocks / stats.itBlocks
          if (ratio > 0.5) {
            overMocked++
            issues.push(`File has ${ratio.toFixed(2)} wildcard mocks per test`)
          }
        }

        // Check for under-mocking (not mocking external dependencies)
        const hasExternalDeps = /fetch|axios|localStorage|sessionStorage|document\.|window\./.test(
          content
        )
        const hasProperMocks =
          /vi\.fn\(\)|jest\.fn\(\)|mock\(|mockResolvedValue/.test(content)

        if (hasExternalDeps && !hasProperMocks) {
          underMocked++
          issues.push('External dependencies found without proper mocking')
        }

        // Check for mock implementation quality
        const emptyMocks = countOccurrences(
          content,
          /mockImplementation\(\s*\(\s*\)\s*=>\s*\{\s*\}/g
        )
        if (emptyMocks > 0) {
          issues.push(`${emptyMocks} empty mock implementations found`)
        }
      }

      // Calculate mock quality score
      const mockQualityScore =
        totalMocks > 0
          ? Math.max(
              0,
              100 -
                overMocked * 10 +
                underMocked * 5 -
                issues.length * 2
            )
          : 100

      const status: MetricStatus =
        mockQualityScore >= 70 && mockQualityScore <= 90 ? 'pass' : 'warning'
      const severity: MetricSeverity =
        mockQualityScore >= 70 && mockQualityScore <= 90
          ? 'info'
          : mockQualityScore >= 50
          ? 'high'
          : 'critical'

      return builder
        .status(status)
        .score(Math.max(0, Math.min(100, mockQualityScore)))
        .value(
          `${totalMocks} mocks, ${overMocked} over-mocked, ${underMocked} under-mocked`
        )
        .threshold('70-90% (not over/under mocking)')
        .severity(severity)
        .message(
          mockQualityScore >= 70 && mockQualityScore <= 90
            ? 'Mock usage is balanced and appropriate'
            : mockQualityScore > 90
            ? 'Possibly under-mocking external dependencies'
            : 'Too many mocks or poor mock quality detected'
        )
        .details({
          totalMocks,
          overMocked,
          underMocked,
          issuesFound: issues.length,
          issues: issues.slice(0, 10),
          mockQualityScore,
        })
        .duration(Date.now() - startTime)
        .build()
    } catch (error) {
      return builder
        .status('error')
        .score(0)
        .value(error instanceof Error ? error.message : 'Unknown error')
        .threshold('70-90%')
        .severity('critical')
        .message('Failed to analyze mock quality')
        .duration(Date.now() - startTime)
        .build()
    }
  },
}

// ============================================================================
// 6. Assertion Density Eval
// ============================================================================

export const assertionDensityEval: EvalDefinition = {
  id: 'qa-assertion-density',
  name: 'Assertion Density',
  description: 'Verifica assertions suficientes por test',
  category: 'qa_testing' as MetricCategory,

  async run() {
    const startTime = Date.now()
    const builder = new MetricResultBuilder(
      'qa-assertion-density',
      'Assertion Density',
      'qa_testing' as MetricCategory
    )

    try {
      const testContents = await readTestFiles('tests/**/*.test.{ts,tsx}')

      if (testContents.length === 0) {
        return builder
          .status('warning')
          .score(0)
          .value('No tests found')
          .threshold(`>${ASSERTION_MIN_DENSITY} assertions/test`)
          .severity('medium')
          .message('Cannot measure assertion density')
          .duration(Date.now() - startTime)
          .build()
      }

      let totalAssertions = 0
      let totalTests = 0
      const lowDensityTests: { file: string; assertions: number }[] = []

      for (const content of testContents) {
        const stats = analyzeTestContent(content)
        totalAssertions += stats.assertions
        totalTests += stats.itBlocks

        // Check for tests with insufficient assertions
        const singleAssertTests = countOccurrences(
          content,
          /it\s*\([^)]*\)[^,{]*\{[^}]*expect\([^)]+\)[^}]*\}/g
        )

        if (stats.itBlocks > 0 && stats.assertions < stats.itBlocks) {
          lowDensityTests.push({
            file: 'unknown',
            assertions: stats.assertions,
          })
        }
      }

      const avgAssertionsPerTest =
        totalTests > 0 ? totalAssertions / totalTests : 0

      const status: MetricStatus =
        avgAssertionsPerTest >= ASSERTION_MIN_DENSITY ? 'pass' : 'warning'
      const severity: MetricSeverity =
        avgAssertionsPerTest >= ASSERTION_MIN_DENSITY
          ? 'info'
          : avgAssertionsPerTest >= 1
          ? 'high'
          : 'critical'

      return builder
        .status(status)
        .score(Math.min(100, avgAssertionsPerTest * 30))
        .value(`${avgAssertionsPerTest.toFixed(2)} assertions/test`)
        .threshold(`>${ASSERTION_MIN_DENSITY} assertions/test`)
        .severity(severity)
        .message(
          avgAssertionsPerTest >= ASSERTION_MIN_DENSITY
            ? 'Assertion density is adequate'
            : `Tests have insufficient assertions: ${avgAssertionsPerTest.toFixed(2)} < ${ASSERTION_MIN_DENSITY}`
        )
        .details({
          totalAssertions,
          totalTests,
          avgAssertionsPerTest,
          lowDensityTests: lowDensityTests.slice(0, 10),
          threshold: ASSERTION_MIN_DENSITY,
        })
        .duration(Date.now() - startTime)
        .build()
    } catch (error) {
      return builder
        .status('error')
        .score(0)
        .value(error instanceof Error ? error.message : 'Unknown error')
        .threshold(`>${ASSERTION_MIN_DENSITY}`)
        .severity('critical')
        .message('Failed to analyze assertion density')
        .duration(Date.now() - startTime)
        .build()
    }
  },
}

// ============================================================================
// 7. Test Isolation Eval
// ============================================================================

export const testIsolationEval: EvalDefinition = {
  id: 'qa-test-isolation',
  name: 'Test Isolation',
  description: 'Verifica tests não dependem de estado compartilhado',
  category: 'qa_testing' as MetricCategory,

  async run() {
    const startTime = Date.now()
    const builder = new MetricResultBuilder(
      'qa-test-isolation',
      'Test Isolation',
      'qa_testing' as MetricCategory
    )

    try {
      const testContents = await readTestFiles('tests/**/*.test.{ts,tsx}')

      if (testContents.length === 0) {
        return builder
          .status('warning')
          .score(100)
          .value('No tests found')
          .threshold('100% isolated')
          .severity('medium')
          .message('Test isolation cannot be assessed')
          .duration(Date.now() - startTime)
          .build()
      }

      let sharedStateViolations = 0
      const violations: string[] = []

      for (const content of testContents) {
        const stats = analyzeTestContent(content)

        // Check for shared state patterns
        const globalMutations = countOccurrences(
          content,
          /global\.\w+\s*=|Object\.assign\(global|Object\.defineProperty\(global/g
        )
        const moduleState = countOccurrences(
          content,
          /import.*from\s+['"]\.\/|\.\.\/|\.\/state|store\.|zustand/g
        )
        const missingBeforeEach = stats.beforeEachBlocks === 0 && stats.itBlocks > 2
        const missingAfterEach = stats.afterEachBlocks === 0 && stats.beforeEachBlocks > 0

        // Check for test order dependencies
        const orderDependencies = countOccurrences(
          content,
          /test\(\s*['"]should run after|it\(\s*['"]should run after|skipIf|skipUnless/g
        )

        if (globalMutations > 0) {
          sharedStateViolations += globalMutations
          violations.push(`${globalMutations} global state mutations found`)
        }

        if (missingBeforeEach && moduleState > 0) {
          sharedStateViolations++
          violations.push('Tests with shared state missing beforeEach')
        }

        if (missingAfterEach) {
          sharedStateViolations++
          violations.push('Tests modifying state without afterEach cleanup')
        }

        if (orderDependencies > 0) {
          sharedStateViolations += orderDependencies
          violations.push(`${orderDependencies} test order dependencies found`)
        }

        // Check for cross-file state sharing (module-level variables)
        const moduleVars = countOccurrences(
          content,
          /^(?:const|let|var)\s+\w+\s*=\s*(?!.*=>|function|import)/gm
        )
        if (moduleVars > 0 && stats.describeBlocks > 1) {
          sharedStateViolations++
          violations.push('Possible module-level shared state')
        }
      }

      // Calculate isolation score (100 = perfect isolation)
      const isolationScore = Math.max(
        0,
        100 - sharedStateViolations * 5
      )

      const status: MetricStatus =
        isolationScore >= 90 ? 'pass' : isolationScore >= 70 ? 'warning' : 'fail'
      const severity: MetricSeverity =
        isolationScore >= 90
          ? 'info'
          : isolationScore >= 70
          ? 'high'
          : 'critical'

      return builder
        .status(status)
        .score(isolationScore)
        .value(`${isolationScore}% isolation score`)
        .threshold('>=90%')
        .severity(severity)
        .message(
          isolationScore >= 90
            ? 'Tests are well isolated'
            : `Test isolation issues: ${sharedStateViolations} violations detected`
        )
        .details({
          isolationScore,
          sharedStateViolations,
          violations: violations.slice(0, 10),
        })
        .duration(Date.now() - startTime)
        .build()
    } catch (error) {
      return builder
        .status('error')
        .score(0)
        .value(error instanceof Error ? error.message : 'Unknown error')
        .threshold('>=90%')
        .severity('critical')
        .message('Failed to analyze test isolation')
        .duration(Date.now() - startTime)
        .build()
    }
  },
}

// ============================================================================
// 8. E2E Coverage Eval
// ============================================================================

export const e2eCoverageEval: EvalDefinition = {
  id: 'qa-e2e-coverage',
  name: 'E2E Coverage',
  description: 'Verifica fluxos de usuário críticos coberts',
  category: 'qa_testing' as MetricCategory,

  async run() {
    const startTime = Date.now()
    const builder = new MetricResultBuilder(
      'qa-e2e-coverage',
      'E2E Coverage',
      'qa_testing' as MetricCategory
    )

    try {
      const e2eFiles = await glob('tests/e2e/**/*.test.{ts,tsx}', {
        cwd: PROJECT_ROOT,
      })

      if (e2eFiles.length === 0) {
        return builder
          .status('fail')
          .score(0)
          .value('No E2E tests found')
          .threshold('All critical user flows covered')
          .severity('critical')
          .message('E2E tests are missing')
          .details({ e2eFilesFound: 0 })
          .duration(Date.now() - startTime)
          .build()
      }

      // Critical user flows that should be covered
      const criticalFlows = [
        { name: 'auth-login', patterns: [/login|sign.?in|authenticate/i] },
        { name: 'auth-logout', patterns: [/logout|sign.?out/i] },
        { name: 'registration', patterns: [/register|signup|create.?account/i] },
        { name: 'dashboard', patterns: [/dashboard|home|main/i] },
        { name: 'payment', patterns: [/payment|checkout|credit|purchase/i] },
        { name: 'profile', patterns: [/profile|settings|account/i] },
        { name: 'navigation', patterns: [/navigate|navigation|menu|router/i] },
      ]

      const coverage: Record<string, boolean> = {}
      let flowsCovered = 0

      for (const e2eFile of e2eFiles) {
        const content = await readFile(join(PROJECT_ROOT, e2eFile), 'utf-8')

        for (const flow of criticalFlows) {
          if (!coverage[flow.name]) {
            for (const pattern of flow.patterns) {
              if (pattern.test(content)) {
                coverage[flow.name] = true
                flowsCovered++
                break
              }
            }
          }
        }
      }

      const coveragePercent = calculatePercentage(flowsCovered, criticalFlows.length)

      const status: MetricStatus =
        coveragePercent >= 80 ? 'pass' : coveragePercent >= 50 ? 'warning' : 'fail'
      const severity: MetricSeverity =
        coveragePercent >= 80
          ? 'info'
          : coveragePercent >= 50
          ? 'high'
          : 'critical'

      return builder
        .status(status)
        .score(coveragePercent)
        .value(`${coveragePercent}% (${flowsCovered}/${criticalFlows.length} flows)`)
        .threshold('>=80% critical flows')
        .severity(severity)
        .message(
          coveragePercent >= 80
            ? 'E2E coverage is adequate'
            : `${criticalFlows.length - flowsCovered} critical flows lack E2E coverage`
        )
        .details({
          coveragePercent,
          flowsCovered,
          criticalFlows: criticalFlows.length,
          coverageByFlow: coverage,
          missingFlows: criticalFlows
            .filter((f) => !coverage[f.name])
            .map((f) => f.name),
          e2eFilesAnalyzed: e2eFiles.length,
        })
        .duration(Date.now() - startTime)
        .build()
    } catch (error) {
      return builder
        .status('error')
        .score(0)
        .value(error instanceof Error ? error.message : 'Unknown error')
        .threshold('>=80%')
        .severity('critical')
        .message('Failed to analyze E2E coverage')
        .duration(Date.now() - startTime)
        .build()
    }
  },
}

// ============================================================================
// 9. CI Reliability Eval
// ============================================================================

export const ciReliabilityEval: EvalDefinition = {
  id: 'qa-ci-reliability',
  name: 'CI Reliability',
  description: 'Verifica pipeline CI não falha por race conditions',
  category: 'qa_testing' as MetricCategory,

  async run() {
    const startTime = Date.now()
    const builder = new MetricResultBuilder(
      'qa-ci-reliability',
      'CI Reliability',
      'qa_testing' as MetricCategory
    )

    try {
      // Check for CI configuration files
      const ciFiles = await glob('.github/workflows/*.{yml,yaml}', {
        cwd: PROJECT_ROOT,
      })

      // Analyze test files for CI reliability patterns
      const testContents = await readTestFiles('tests/**/*.test.{ts,tsx}')

      if (testContents.length === 0) {
        return builder
          .status('warning')
          .score(100)
          .value('No tests found')
          .threshold('100% CI-safe')
          .severity('medium')
          .message('CI reliability cannot be assessed')
          .duration(Date.now() - startTime)
          .build()
      }

      let raceConditionRisks = 0
      const issues: string[] = []

      for (const content of testContents) {
        // Race condition patterns
        const parallelTests = countOccurrences(content, /concurrent|parallel|skipSerial/g)
        const missingTimeouts = countOccurrences(
          content,
          /it\s*\([^)]*\)[^,{]*\{[^}]*(?<!timeout\()(?<!setTimeout\()/g
        )
        const sharedPorts = countOccurrences(
          content,
          /localhost:3000|localhost:5432|:5173|:4000/g
        )
        const missingRetries = countOccurrences(content, /retry|flaky|unstable/g)

        // Parallel test risks
        if (parallelTests > 0 && sharedPorts > 0) {
          raceConditionRisks += sharedPorts
          issues.push('Parallel tests with hardcoded ports detected')
        }

        // Database connection sharing
        const dbConnections = countOccurrences(
          content,
          /prisma\.|new\s+PrismaClient|DATABASE_URL/g
        )
        if (dbConnections > 1) {
          // Check for proper cleanup
          const hasPrismaCleanup = /afterEach.*prisma|$prisma\.\$disconnect/g.test(
            content
          )
          if (!hasPrismaCleanup) {
            raceConditionRisks += 2
            issues.push('Prisma client may be shared across parallel tests')
          }
        }

        // File system races
        const fileWrites = countOccurrences(content, /writeFile|mkdir|unlink|rmdir/g)
        if (fileWrites > 1) {
          raceConditionRisks++
          issues.push('Multiple file system operations may race')
        }
      }

      // Calculate CI reliability score
      const ciScore = Math.max(0, 100 - raceConditionRisks * 10)

      const status: MetricStatus =
        ciScore >= 90 ? 'pass' : ciScore >= 70 ? 'warning' : 'fail'
      const severity: MetricSeverity =
        ciScore >= 90
          ? 'info'
          : ciScore >= 70
          ? 'high'
          : 'critical'

      return builder
        .status(status)
        .score(ciScore)
        .value(`${ciScore}% CI reliability score`)
        .threshold('>=90%')
        .severity(severity)
        .message(
          ciScore >= 90
            ? 'Tests appear CI-safe'
            : `CI reliability issues: ${raceConditionRisks} race condition risks`
        )
        .details({
          ciScore,
          raceConditionRisks,
          ciFilesFound: ciFiles.length,
          issues: issues.slice(0, 10),
        })
        .duration(Date.now() - startTime)
        .build()
    } catch (error) {
      return builder
        .status('error')
        .score(0)
        .value(error instanceof Error ? error.message : 'Unknown error')
        .threshold('>=90%')
        .severity('critical')
        .message('Failed to analyze CI reliability')
        .duration(Date.now() - startTime)
        .build()
    }
  },
}

// ============================================================================
// 10. Visual Regression Eval
// ============================================================================

export const visualRegressionEval: EvalDefinition = {
  id: 'qa-visual-regression',
  name: 'Visual Regression',
  description: 'Verifica componentes renderizam corretamente',
  category: 'qa_testing' as MetricCategory,

  async run() {
    const startTime = Date.now()
    const builder = new MetricResultBuilder(
      'qa-visual-regression',
      'Visual Regression',
      'qa_testing' as MetricCategory
    )

    try {
      // Check for visual regression / snapshot tests
      const snapshotTests = await glob('tests/**/*snapshot*.{ts,tsx}', {
        cwd: PROJECT_ROOT,
      })
      const componentTests = await glob('tests/components/**/*.{ts,tsx}', {
        cwd: PROJECT_ROOT,
      })

      // Critical components that should have visual tests
      const criticalComponents = [
        'Card',
        'Button',
        'Input',
        'Modal',
        'Navigation',
        'Header',
        'Footer',
        'Form',
      ]

      let componentsWithTests = 0
      const componentCoverage: Record<string, boolean> = {}

      // Analyze component tests
      for (const testFile of componentTests) {
        const content = await readFile(join(PROJECT_ROOT, testFile), 'utf-8')

        for (const component of criticalComponents) {
          if (!componentCoverage[component]) {
            const hasTest =
              new RegExp(component, 'i').test(content) ||
              /render|screen\.|getBy|findBy|queryBy/i.test(content)
            if (hasTest) {
              componentCoverage[component] = true
              componentsWithTests++
            }
          }
        }
      }

      // Check for snapshot patterns
      let snapshotCount = 0
      for (const snapshotFile of snapshotTests) {
        const content = await readFile(join(PROJECT_ROOT, snapshotFile), 'utf-8')
        snapshotCount += countOccurrences(content, /toMatchSnapshot|toMatchInlineSnapshot/g)
      }

      // Check for Playwright visual tests
      const playwrightConfig = await fileExists(
        join(PROJECT_ROOT, 'playwright.config.ts')
      )
      const playwrightVisualTests = await glob('**/*visual*.{ts,tsx}', {
        cwd: PROJECT_ROOT,
      })

      const coveragePercent = calculatePercentage(
        componentsWithTests,
        criticalComponents.length
      )

      const hasVisualTesting =
        snapshotCount > 0 ||
        playwrightVisualTests.length > 0 ||
        componentTests.length > 5

      const status: MetricStatus =
        hasVisualTesting && coveragePercent >= 60
          ? 'pass'
          : hasVisualTesting
          ? 'warning'
          : 'fail'
      const severity: MetricSeverity =
        hasVisualTesting && coveragePercent >= 60
          ? 'info'
          : hasVisualTesting
          ? 'high'
          : 'critical'

      return builder
        .status(status)
        .score(hasVisualTesting ? coveragePercent : 0)
        .value(
          `${coveragePercent}% component coverage, ${snapshotCount} snapshots, ${playwrightVisualTests.length} visual tests`
        )
        .threshold('>=60% components tested')
        .severity(severity)
        .message(
          hasVisualTesting && coveragePercent >= 60
            ? 'Visual regression testing is in place'
            : hasVisualTesting
            ? 'Expand visual test coverage'
            : 'Visual regression tests are missing'
        )
        .details({
          coveragePercent,
          componentsWithTests,
          criticalComponentsTotal: criticalComponents.length,
          componentCoverage,
          snapshotCount,
          playwrightVisualTests: playwrightVisualTests.length,
          hasPlaywrightConfig: playwrightConfig,
          componentTestsAnalyzed: componentTests.length,
        })
        .duration(Date.now() - startTime)
        .build()
    } catch (error) {
      return builder
        .status('error')
        .score(0)
        .value(error instanceof Error ? error.message : 'Unknown error')
        .threshold('>=60%')
        .severity('critical')
        .message('Failed to analyze visual regression coverage')
        .duration(Date.now() - startTime)
        .build()
    }
  },
}

// ============================================================================
// Export All Evals
// ============================================================================

export const qaTestingEvals: EvalDefinition[] = [
  testCoverageEval,
  criticalPathCoverageEval,
  testFlakinessEval,
  testExecutionTimeEval,
  mockQualityEval,
  assertionDensityEval,
  testIsolationEval,
  e2eCoverageEval,
  ciReliabilityEval,
  visualRegressionEval,
]

export default qaTestingEvals
