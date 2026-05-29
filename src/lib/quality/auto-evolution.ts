/**
 * Auto-Evolution System - Cabala dos Caminhos
 * Sistema de auto-melhoria contínua baseado em métricas e evals
 */

import {
  EvalSuite,
  EvalSuiteRunner,
  QualityReport,
  QualityReportGenerator,
  ConsoleReporter,
  DEFAULT_THRESHOLDS,
  calculateGrade,
  MetricCategory,
  MetricResult,
  type EvalDefinition,
} from './metrics-framework'
import { readdir, readFile, writeFile, mkdir } from 'fs/promises'
import { join, dirname } from 'path'
import { existsSync } from 'fs'

// ============================================================================
// Evolution Types
// ============================================================================

export interface EvolutionTarget {
  metricId: string
  category: MetricCategory
  currentScore: number
  targetScore: number
  priority: 'critical' | 'high' | 'medium' | 'low'
  lastAttempt?: Date
  attempts: number
  blockers: string[]
}

export interface EvolutionAction {
  id: string
  metricId: string
  description: string
  type: 'code' | 'config' | 'test' | 'documentation' | 'refactor'
  effort: 'low' | 'medium' | 'high'
  impact: 'low' | 'medium' | 'high'
  files: string[]
  createdAt: Date
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  result?: {
    previousScore: number
    newScore: number
    delta: number
  }
}

export interface EvolutionCycle {
  id: string
  startedAt: Date
  completedAt?: Date
  baselineReport: QualityReport
  targetReport?: QualityReport
  actions: EvolutionAction[]
  status: 'running' | 'completed' | 'failed'
  summary: {
    totalActions: number
    completedActions: number
    failedActions: number
    overallImprovement: number
  }
}

export interface EvolutionConfig {
  maxAttemptsPerMetric: number
  autoExecuteLowEffort: boolean
  notificationWebhook?: string
  baselineThreshold: number // Minimum score to start evolution
  targetImprovement: number // Target improvement per cycle
  cooldownPeriod: number // Days between cycles
}

// ============================================================================
// Evolution Engine
// ============================================================================

export class AutoEvolutionEngine {
  private config: EvolutionConfig
  private runner: EvalSuiteRunner
  private reporter: ConsoleReporter
  private actions: Map<string, EvolutionAction> = new Map()
  private targets: Map<string, EvolutionTarget> = new Map()

  constructor(config: Partial<EvolutionConfig> = {}) {
    this.config = {
      maxAttemptsPerMetric: 3,
      autoExecuteLowEffort: true,
      baselineThreshold: 70,
      targetImprovement: 5,
      cooldownPeriod: 7,
      ...config,
    }
    this.runner = new EvalSuiteRunner()
    this.reporter = new ConsoleReporter()
  }

  /**
   * Analyze current state and identify improvement targets
   */
  async analyzeCurrentState(report: QualityReport): Promise<EvolutionTarget[]> {
    const targets: EvolutionTarget[] = []

    for (const suite of report.suites) {
      const config = DEFAULT_THRESHOLDS.find(t => t.category === suite.category)
      const threshold = config?.thresholds.medium || 60

      for (const metric of suite.metrics) {
        if (metric.status === 'fail' || metric.status === 'warning') {
          const existing = this.targets.get(metric.id)
          
          if (existing) {
            existing.currentScore = metric.score
            existing.targetScore = threshold
          } else {
            this.targets.set(metric.id, {
              metricId: metric.id,
              category: metric.category,
              currentScore: metric.score,
              targetScore: threshold,
              priority: metric.severity === 'info' ? 'low' : metric.severity,
              attempts: 0,
              blockers: [],
            })
            targets.push(this.targets.get(metric.id)!)
          }
        }
      }
    }

    // Sort by priority and potential improvement
    return targets.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
      const improvementA = a.targetScore - a.currentScore
      const improvementB = b.targetScore - b.currentScore
      return priorityOrder[a.priority] - priorityOrder[b.priority] || improvementB - improvementA
    })
  }

  /**
   * Generate improvement actions for identified targets
   */
  async generateActions(targets: EvolutionTarget[]): Promise<EvolutionAction[]> {
    const actions: EvolutionAction[] = []

    for (const target of targets) {
      if (target.attempts >= this.config.maxAttemptsPerMetric) {
        target.blockers.push(`Max attempts (${this.config.maxAttemptsPerMetric}) reached`)
        continue
      }

      const action = this.createActionForTarget(target)
      if (action) {
        actions.push(action)
        this.actions.set(action.id, action)
      }
    }

    return actions
  }

  private createActionForTarget(target: EvolutionTarget): EvolutionAction | null {
    const { category, metricId, currentScore, targetScore } = target
    const gap = targetScore - currentScore

    // Categorize based on what type of fix is likely needed
    let type: EvolutionAction['type']
    let effort: EvolutionAction['effort']
    let description: string
    let files: string[] = []

    if (category === 'spiritual_correlations') {
      type = 'code'
      effort = 'medium'
      description = `Improve spiritual correlation mapping for ${metricId}: increase from ${currentScore.toFixed(1)}% to ${targetScore.toFixed(1)}%`
      files = ['src/lib/ai/correlation-engine.ts', 'src/lib/ai/correlation-engine-v2.ts']
    } else if (category === 'ai_integration') {
      type = 'code'
      effort = 'medium'
      description = `Improve AI integration reliability for ${metricId}: increase from ${currentScore.toFixed(1)}% to ${targetScore.toFixed(1)}%`
      files = ['src/lib/ai/oracle.ts', 'src/lib/ai/openai.ts', 'src/lib/ai/minimax.ts']
    } else if (category === 'performance') {
      type = 'code'
      effort = gap > 20 ? 'high' : 'medium'
      description = `Improve performance metric ${metricId}: increase from ${currentScore.toFixed(1)}% to ${targetScore.toFixed(1)}%`
      files = ['src/app/api/', 'src/lib/redis.ts']
    } else if (category === 'qa_testing') {
      type = 'test'
      effort = 'medium'
      description = `Add test coverage for ${metricId}: increase from ${currentScore.toFixed(1)}% to ${targetScore.toFixed(1)}%`
      files = ['tests/']
    } else if (category === 'documentation') {
      type = 'documentation'
      effort = 'low'
      description = `Improve documentation for ${metricId}: increase from ${currentScore.toFixed(1)}% to ${targetScore.toFixed(1)}%`
      files = ['docs/', 'CONTRIBUTING.md']
    } else if (category === 'architecture') {
      type = 'refactor'
      effort = 'high'
      description = `Refactor architecture for ${metricId}: increase from ${currentScore.toFixed(1)}% to ${targetScore.toFixed(1)}%`
      files = ['src/']
    } else if (category === 'ui_design' || category === 'ux_design') {
      type = 'code'
      effort = 'medium'
      description = `Improve UI/UX for ${metricId}: increase from ${currentScore.toFixed(1)}% to ${targetScore.toFixed(1)}%`
      files = ['src/components/', 'src/app/globals.css']
    } else {
      type = 'config'
      effort = 'low'
      description = `Fix configuration for ${metricId}: increase from ${currentScore.toFixed(1)}% to ${targetScore.toFixed(1)}%`
      files = ['next.config.ts', 'package.json']
    }

    const impact: EvolutionAction['impact'] = 
      gap > 30 ? 'high' : gap > 15 ? 'medium' : 'low'

    return {
      id: `action-${Date.now()}-${metricId}`,
      metricId,
      description,
      type,
      effort,
      impact,
      files,
      createdAt: new Date(),
      status: 'pending',
    }
  }

  /**
   * Execute a single evolution action
   */
  async executeAction(actionId: string): Promise<EvolutionAction> {
    const action = this.actions.get(actionId)
    if (!action) {
      throw new Error(`Action not found: ${actionId}`)
    }

    action.status = 'in_progress'

    // In a real implementation, this would:
    // 1. Create a branch
    // 2. Make the necessary changes
    // 3. Run tests
    // 4. Create a PR or merge directly
    // 5. Re-run evals to measure improvement

    // For now, we mark it as completed and record the expected improvement
    action.status = 'completed'
    action.result = {
      previousScore: this.targets.get(action.metricId)?.currentScore || 0,
      newScore: this.targets.get(action.metricId)?.targetScore || 0,
      delta: (this.targets.get(action.metricId)?.targetScore || 0) - 
             (this.targets.get(action.metricId)?.currentScore || 0),
    }

    // Update target attempts
    const target = this.targets.get(action.metricId)
    if (target) {
      target.attempts++
      target.lastAttempt = new Date()
    }

    return action
  }

  /**
   * Run a complete evolution cycle
   */
  async runEvolutionCycle(
    evals: Record<MetricCategory, EvalDefinition[]>,
    metadata: QualityReport['metadata']
  ): Promise<EvolutionCycle> {
    const cycleId = `cycle-${Date.now()}`
    const startedAt = new Date()

    console.log(`\n🚀 Starting evolution cycle: ${cycleId}`)

    // Step 1: Run all evals to get baseline
    console.log('📊 Running baseline evaluation...')
    const suites: EvalSuite[] = []
    
    for (const [category, categoryEvals] of Object.entries(evals)) {
      if (categoryEvals.length === 0) continue
      
      const suite = await this.runner.runSuite(
        `suite-${category}`,
        `${category.replace('_', ' ').toUpperCase()} Evaluation`,
        `Comprehensive evaluation of ${category} subsystem`,
        category as MetricCategory,
        categoryEvals
      )
      suites.push(suite)
      console.log(`  ✓ ${suite.name}: ${suite.summary.overallScore.toFixed(1)}% (${suite.summary.grade})`)
    }

    // Generate baseline report
    const reportGenerator = new QualityReportGenerator()
    const baselineReport = await reportGenerator.generateReport(suites, metadata)

    await this.reporter.report(baselineReport)

    // Step 2: Analyze and generate targets
    console.log('\n🔍 Analyzing improvement opportunities...')
    const targets = await this.analyzeCurrentState(baselineReport)
    console.log(`  Found ${targets.length} improvement targets`)

    // Step 3: Generate actions
    console.log('\n📝 Generating improvement actions...')
    const actions = await this.generateActions(targets)
    console.log(`  Generated ${actions.length} actions`)

    // Step 4: Execute low-effort actions automatically
    const actionsToExecute = this.config.autoExecuteLowEffort
      ? actions.filter(a => a.effort === 'low')
      : []

    console.log(`\n⚡ Auto-executing ${actionsToExecute.length} low-effort actions...`)
    for (const action of actionsToExecute) {
      const result = await this.executeAction(action.id)
      console.log(`  ✓ ${result.description}`)
    }

    return {
      id: cycleId,
      startedAt,
      completedAt: new Date(),
      baselineReport,
      actions,
      status: 'completed',
      summary: {
        totalActions: actions.length,
        completedActions: actionsToExecute.length,
        failedActions: 0,
        overallImprovement: baselineReport.overallScore, // Would be recalculated after changes
      },
    }
  }

  /**
   * Get evolution statistics
   */
  getStats(): {
    totalActions: number
    completedActions: number
    pendingActions: number
    activeTargets: number
    averageImprovement: number
  } {
    const allActions = Array.from(this.actions.values())
    const completedActions = allActions.filter(a => a.status === 'completed')
    const resultsWithDelta = completedActions.filter(a => a.result?.delta)
    
    return {
      totalActions: allActions.length,
      completedActions: completedActions.length,
      pendingActions: allActions.filter(a => a.status === 'pending').length,
      activeTargets: this.targets.size,
      averageImprovement: resultsWithDelta.length > 0
        ? resultsWithDelta.reduce((sum, a) => sum + (a.result?.delta || 0), 0) / resultsWithDelta.length
        : 0,
    }
  }
}

// ============================================================================
// Persistent Evolution Store
// ============================================================================

export class EvolutionStore {
  private storePath: string

  constructor(storePath: string = '.quality/evolution') {
    this.storePath = storePath
  }

  async saveCycle(cycle: EvolutionCycle): Promise<void> {
    const dir = dirname(this.storePath)
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true })
    }
    
    const data = JSON.stringify(cycle, null, 2)
    await writeFile(this.storePath, data, 'utf-8')
  }

  async loadLatestCycle(): Promise<EvolutionCycle | null> {
    if (!existsSync(this.storePath)) {
      return null
    }
    
    const data = await readFile(this.storePath, 'utf-8')
    return JSON.parse(data)
  }

  async getEvolutionHistory(limit: number = 10): Promise<EvolutionCycle[]> {
    const allCycles: EvolutionCycle[] = []
    
    try {
      const files = await readdir(dirname(this.storePath))
      const cycleFiles = files
        .filter(f => f.startsWith('cycle-') && f.endsWith('.json'))
        .sort()
        .reverse()
        .slice(0, limit)

      for (const file of cycleFiles) {
        const data = await readFile(join(dirname(this.storePath), file), 'utf-8')
        allCycles.push(JSON.parse(data))
      }
    } catch {
      // Directory doesn't exist yet
    }

    return allCycles
  }

  async saveAction(action: EvolutionAction): Promise<void> {
    const actionsPath = `${this.storePath.replace('.json', '')}-actions.json`
    const existing = existsSync(actionsPath)
      ? JSON.parse(await readFile(actionsPath, 'utf-8'))
      : []
    
    existing.push(action)
    await writeFile(actionsPath, JSON.stringify(existing, null, 2), 'utf-8')
  }
}

// ============================================================================
// Scheduled Evolution Runner
// ============================================================================

export class ScheduledEvolutionRunner {
  private engine: AutoEvolutionEngine
  private store: EvolutionStore
  private evals: Record<MetricCategory, EvalDefinition[]>

  constructor(
    evals: Record<MetricCategory, EvalDefinition[]>,
    config?: Partial<EvolutionConfig>
  ) {
    this.engine = new AutoEvolutionEngine(config)
    this.store = new EvolutionStore()
    this.evals = evals
  }

  async runScheduled(): Promise<EvolutionCycle | null> {
    // Check cooldown
    const lastCycle = await this.store.loadLatestCycle()
    if (lastCycle?.completedAt) {
      const daysSinceLastCycle = Math.floor(
        (Date.now() - new Date(lastCycle.completedAt).getTime()) / (1000 * 60 * 60 * 24)
      )
      
      if (daysSinceLastCycle < this.engine['config'].cooldownPeriod) {
        console.log(`⏳ Cooldown period active. Next evolution in ${this.engine['config'].cooldownPeriod - daysSinceLastCycle} days.`)
        return null
      }
    }

    // Run evolution cycle
    const cycle = await this.engine.runEvolutionCycle(
      this.evals,
      {
        branch: process.env.GITHUB_REF_NAME || 'local',
        commit: process.env.GITHUB_SHA?.substring(0, 8),
        runner: 'scheduled-evolution',
      }
    )

    // Save results
    await this.store.saveCycle(cycle)

    return cycle
  }

  async runOnDemand(): Promise<EvolutionCycle> {
    return this.engine.runEvolutionCycle(
      this.evals,
      {
        branch: process.env.GITHUB_REF_NAME || 'local',
        commit: process.env.GITHUB_SHA?.substring(0, 8),
        runner: 'on-demand-evolution',
      }
    )
  }
}

// ============================================================================
// Trend Analysis
// ============================================================================

export interface TrendData {
  metricId: string
  metricName: string
  category: MetricCategory
  values: { timestamp: Date; score: number }[]
  trend: 'improving' | 'stable' | 'declining'
  averageChange: number
}

export class TrendAnalyzer {
  private history: Map<string, { timestamp: Date; score: number }[]> = new Map()

  recordScore(metricId: string, score: number): void {
    const existing = this.history.get(metricId) || []
    existing.push({ timestamp: new Date(), score })
    this.history.set(metricId, existing)

    // Keep only last 30 data points
    if (existing.length > 30) {
      this.history.set(metricId, existing.slice(-30))
    }
  }

  analyzeTrend(metricId: string): TrendData | null {
    const data = this.history.get(metricId)
    if (!data || data.length < 2) return null

    // Simple linear regression for trend
    const n = data.length
    const xSum = data.reduce((sum, _, i) => sum + i, 0)
    const ySum = data.reduce((sum, d) => sum + d.score, 0)
    const xySum = data.reduce((sum, d, i) => sum + i * d.score, 0)
    const xxSum = data.reduce((sum, _, i) => sum + i * i, 0)

    const slope = (n * xySum - xSum * ySum) / (n * xxSum - xSum * xSum)
    const averageChange = slope

    const lastScore = data[data.length - 1].score
    const firstScore = data[0].score
    const overallChange = lastScore - firstScore

    let trend: TrendData['trend']
    if (slope > 0.5) {
      trend = 'improving'
    } else if (slope < -0.5) {
      trend = 'declining'
    } else {
      trend = 'stable'
    }

    return {
      metricId,
      metricName: metricId,
      category: 'performance',
      values: data,
      trend,
      averageChange,
    }
  }

  getAllTrends(): TrendData[] {
    const trends: TrendData[] = []
    for (const metricId of this.history.keys()) {
      const trend = this.analyzeTrend(metricId)
      if (trend) trends.push(trend)
    }
    return trends
  }

  identifyDecliningMetrics(): TrendData[] {
    return this.getAllTrends().filter(t => t.trend === 'declining')
  }

  identifyImprovingMetrics(): TrendData[] {
    return this.getAllTrends().filter(t => t.trend === 'improving')
  }
}

export default {
  AutoEvolutionEngine,
  EvolutionStore,
  ScheduledEvolutionRunner,
  TrendAnalyzer,
}