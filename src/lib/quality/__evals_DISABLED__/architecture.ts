/**
 * Architecture Evals - Cabala dos Caminhos
 * Rigorous quality evaluations for architectural patterns and code organization
 */

import { readdir, readFile } from 'fs/promises'
import { join, relative } from 'path'
import { MetricResultBuilder } from '../metrics-framework'
import type { EvalDefinition, MetricCategory } from '../metrics-framework'

// ============================================================================
// Helper Functions
// ============================================================================

async function getTsFiles(dir: string, baseDir: string = dir): Promise<string[]> {
  const files: string[] = []
  try {
    const entries = await readdir(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = join(dir, entry.name)
      if (entry.isDirectory()) {
        if (entry.name !== 'node_modules' && !entry.name.startsWith('.')) {
          files.push(...await getTsFiles(fullPath, baseDir))
        }
      } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
        files.push(relative(baseDir, fullPath))
      }
    }
  } catch { /* ignore */ }
  return files
}

async function readFileContent(filePath: string): Promise<string> {
  try {
    return await readFile(filePath, 'utf-8')
  } catch {
    return ''
  }
}

function countPattern(content: string, pattern: RegExp): number {
  const matches = content.match(pattern)
  return matches ? matches.length : 0
}

function extractImports(content: string): string[] {
  const importPattern = /import\s+(?:{[^}]+}|\*\s+as\s+\w+|\w+)\s+from\s+['"]([^'"]+)['"]/g
  const imports: string[] = []
  let match
  while ((match = importPattern.exec(content)) !== null) {
    imports.push(match[1])
  }
  return imports
}

function extractDeclarations(content: string): string[] {
  const patterns = [
    /(?:export\s+)?(?:async\s+)?function\s+(\w+)/g,
    /(?:export\s+)?class\s+(\w+)/g,
    /(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=/g,
  ]
  const declarations: string[] = []
  for (const pattern of patterns) {
    let match
    while ((match = pattern.exec(content)) !== null) {
      declarations.push(match[1])
    }
  }
  return declarations
}

function calculateModuleCohesion(declarations: string[], content: string): number {
  if (declarations.length === 0) return 0
  if (declarations.length === 1) return 100
  const words = content.toLowerCase().split(/\W+/).filter(w => w.length > 3)
  const wordFreq: Record<string, number> = {}
  for (const word of words) {
    wordFreq[word] = (wordFreq[word] || 0) + 1
  }
  const sortedWords = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
  if (sortedWords.length === 0) return 50
  const totalFreq = sortedWords.reduce((sum, [, count]) => sum + count, 0)
  const avgFreq = totalFreq / sortedWords.length
  return Math.min(100, Math.round(avgFreq * 10))
}

// ============================================================================
// 1. Modularity Eval
// ============================================================================

export const modularityEval: EvalDefinition = {
  id: 'arch-modularity',
  name: 'Modularity Evaluation',
  description: 'Verifies clear separation of modules with distinct responsibilities',
  category: 'architecture' as MetricCategory,
  async run() {
    const builder = new MetricResultBuilder('arch-modularity', 'Modularity Evaluation', 'architecture' as MetricCategory)
    const startTime = Date.now()
    try {
      const srcDir = join(process.cwd(), 'src')
      const files = await getTsFiles(srcDir)
      const apiModules = files.filter(f => f.startsWith('app/api/')).length
      const libModules = files.filter(f => f.startsWith('lib/')).length
      const componentModules = files.filter(f => f.startsWith('components/')).length
      const hookModules = files.filter(f => f.startsWith('hooks/')).length
      const totalModules = apiModules + libModules + componentModules + hookModules
      const domainDistribution = [apiModules, libModules, componentModules, hookModules].filter(v => v > 0).length
      let score = 50
      if (domainDistribution >= 3) score += 20
      if (apiModules > 0 && libModules > 0) score += 15
      if (componentModules > 0) score += 10
      if (hookModules > 0) score += 5
      let oversizedModules = 0
      for (const file of files.slice(0, 50)) {
        const content = await readFileContent(join(srcDir, file))
        if (content.split('\n').length > 500) oversizedModules++
      }
      score -= oversizedModules * 5
      const details = { apiModules, libModules, componentModules, hookModules, totalModules, domainDistribution, oversizedModules }
      const message = domainDistribution >= 3
        ? `Good modular separation with ${domainDistribution} distinct domains`
        : `Limited modular separation - only ${domainDistribution} domains found`
      return builder.status(score >= 70 ? 'pass' : score >= 50 ? 'warning' : 'fail').score(Math.max(0, Math.min(100, score))).value(totalModules).threshold(90).severity('high').message(message).details(details).duration(Date.now() - startTime).build()
    } catch (error) {
      return builder.status('error').score(0).value(0).threshold(90).severity('critical').message(`Modularity evaluation failed: ${error}`).details({ error: String(error) }).duration(Date.now() - startTime).build()
    }
  },
}

// ============================================================================
// 2. Type Safety Eval
// ============================================================================

export const typeSafetyEval: EvalDefinition = {
  id: 'arch-type-safety',
  name: 'Type Safety Evaluation',
  description: 'Verifies absence of any types and correct use of generics',
  category: 'architecture' as MetricCategory,
  async run() {
    const builder = new MetricResultBuilder('arch-type-safety', 'Type Safety Evaluation', 'architecture' as MetricCategory)
    const startTime = Date.now()
    try {
      const srcDir = join(process.cwd(), 'src')
      const files = await getTsFiles(srcDir)
      let totalAnyTypes = 0
      let totalExplicitTypes = 0
      let properGenerics = 0
      const problematicAnyLocations: { file: string; line: number }[] = []
      const anyTypePattern = /:\s*any\b/g
      const explicitTypePattern = /:\s*(?:string|number|boolean|object|Array|Record|Map|Set|Promise)<|:\s*(?:string|number|boolean|object)\[\]/g
      const genericPattern = /<[A-Z]\w+>/g
      for (const file of files) {
        const content = await readFileContent(join(srcDir, file))
        const lines = content.split('\n')
        const hasDisableComment = (line: string) =>
          line.includes('@typescript-eslint/no-explicit-any') || line.includes('eslint-disable-next-line')
        for (let i = 0; i < lines.length; i++) {
          if (anyTypePattern.test(lines[i])) {
            if (!hasDisableComment(lines[i])) {
              totalAnyTypes++
              problematicAnyLocations.push({ file, line: i + 1 })
            }
            anyTypePattern.lastIndex = 0
          }
        }
        totalExplicitTypes += countPattern(content, explicitTypePattern)
        properGenerics += countPattern(content, genericPattern)
      }
      const anyRatio = files.length > 0 ? totalAnyTypes / files.length : 0
      let score = 100 - (anyRatio * 100)
      score = Math.max(0, Math.min(100, score))
      if (properGenerics > 0) score += Math.min(10, properGenerics / 10)
      const details = { totalFiles: files.length, anyTypeCount: totalAnyTypes, explicitTypeCount: totalExplicitTypes, genericUsage: properGenerics, anyPerFile: anyRatio.toFixed(3), sampleProblematicLocations: problematicAnyLocations.slice(0, 10) }
      const message = totalAnyTypes === 0 ? 'Excellent type safety - no any types found' : `Found ${totalAnyTypes} any types across ${files.length} files (${anyRatio.toFixed(2)} per file)`
      return builder.status(score >= 90 ? 'pass' : score >= 70 ? 'warning' : 'fail').score(Math.round(score)).value(totalAnyTypes).threshold(95).severity('critical').message(message).details(details).duration(Date.now() - startTime).build()
    } catch (error) {
      return builder.status('error').score(0).value(0).threshold(95).severity('critical').message(`Type safety evaluation failed: ${error}`).details({ error: String(error) }).duration(Date.now() - startTime).build()
    }
  },
}

// ============================================================================
// 3. Error Handling Eval
// ============================================================================

export const errorHandlingEval: EvalDefinition = {
  id: 'arch-error-handling',
  name: 'Error Handling Evaluation',
  description: 'Verifies all errors are properly caught and handled',
  category: 'architecture' as MetricCategory,
  async run() {
    const builder = new MetricResultBuilder('arch-error-handling', 'Error Handling Evaluation', 'architecture' as MetricCategory)
    const startTime = Date.now()
    try {
      const srcDir = join(process.cwd(), 'src')
      const files = await getTsFiles(srcDir)
      let totalTryCatch = 0
      let totalThrow = 0
      const missingErrorHandling: string[] = []
      const tryCatchPattern = /try\s*\{/g
      const throwPattern = /throw\s+/g
      const promisePatterns = [/await\s+\w+\.(json|text|blob)\(\)/g, /await\s+fetch\(/g, /await\s+prisma\./g, /await\s+\w+\.(create|update|delete|find)/g]
      let promisesWithoutTryCatch = 0
      for (const file of files) {
        const content = await readFileContent(join(srcDir, file))
        const tryCount = countPattern(content, tryCatchPattern)
        const throwCount = countPattern(content, throwPattern)
        totalTryCatch += tryCount
        totalThrow += throwCount
        const hasAsync = content.includes('async') || content.includes('await')
        const hasTryCatch = tryCount > 0
        if (hasAsync && !hasTryCatch && (file.includes('api/') || file.includes('lib/'))) {
          missingErrorHandling.push(file)
        }
        for (const pattern of promisePatterns) {
          const matches = content.match(pattern)
          if (matches) promisesWithoutTryCatch += matches.length
        }
      }
      const errorHandlingRatio = totalTryCatch > 0 ? Math.min(100, (totalTryCatch / Math.max(1, totalThrow)) * 50) : 0
      let score = errorHandlingRatio + (totalTryCatch > 10 ? 20 : totalTryCatch > 5 ? 10 : 0)
      score = Math.max(0, Math.min(100, score))
      score -= Math.min(30, missingErrorHandling.length * 5)
      const details = { tryCatchBlocks: totalTryCatch, throwStatements: totalThrow, missingErrorHandlingFiles: missingErrorHandling.slice(0, 20), totalFiles: files.length }
      const message = missingErrorHandling.length === 0 ? `Excellent error handling with ${totalTryCatch} try-catch blocks` : `Found ${missingErrorHandling.length} files missing error handling`
      return builder.status(score >= 80 ? 'pass' : score >= 60 ? 'warning' : 'fail').score(Math.round(score)).value(totalTryCatch).threshold(90).severity('critical').message(message).details(details).duration(Date.now() - startTime).build()
    } catch (error) {
      return builder.status('error').score(0).value(0).threshold(90).severity('critical').message(`Error handling evaluation failed: ${error}`).details({ error: String(error) }).duration(Date.now() - startTime).build()
    }
  },
}

// ============================================================================
// 4. API Design Eval
// ============================================================================

export const apiDesignEval: EvalDefinition = {
  id: 'arch-api-design',
  name: 'API Design Evaluation',
  description: 'Verifies REST patterns consistency and proper versioning',
  category: 'architecture' as MetricCategory,
  async run() {
    const builder = new MetricResultBuilder('arch-api-design', 'API Design Evaluation', 'architecture' as MetricCategory)
    const startTime = Date.now()
    try {
      const srcDir = join(process.cwd(), 'src')
      const apiDir = join(srcDir, 'app/api')
      const apiFiles = await getTsFiles(apiDir, srcDir)
      const restPatterns = { get: 0, post: 0, put: 0, patch: 0, delete: 0 }
      const versionedRoutes: string[] = []
      const unversionedRoutes: string[] = []
      for (const file of apiFiles) {
        const content = await readFileContent(join(srcDir, file))
        const fullPath = `/${file.replace(/\\/g, '/')}`
        if (/export\s+async\s+function\s+GET/g.test(content)) restPatterns.get++
        if (/export\s+async\s+function\s+POST/g.test(content)) restPatterns.post++
        if (/export\s+async\s+function\s+PUT/g.test(content)) restPatterns.put++
        if (/export\s+async\s+function\s+PATCH/g.test(content)) restPatterns.patch++
        if (/export\s+async\s+function\s+DELETE/g.test(content)) restPatterns.delete++
        if (/\/v\d+\//.test(fullPath) || /\bv2\b/.test(fullPath)) {
          versionedRoutes.push(fullPath)
        } else if (content.includes('export async function')) {
          unversionedRoutes.push(fullPath)
        }
      }
      let score = 50
      const methodsUsed = Object.values(restPatterns).filter(v => v > 0).length
      score += methodsUsed * 5
      const versioningRatio = apiFiles.length > 0 ? versionedRoutes.length / (versionedRoutes.length + unversionedRoutes.length) : 0
      score += versioningRatio * 20
      const consistentNaming = apiFiles.filter(f => /^[a-z][a-z0-9-]*$/.test(f.split('/').pop() || '')).length
      const namingScore = apiFiles.length > 0 ? (consistentNaming / apiFiles.length) * 10 : 0
      score += namingScore
      score = Math.max(0, Math.min(100, score))
      const details = { totalApiRoutes: apiFiles.length, restMethods: restPatterns, versionedRoutes: versionedRoutes.length, unversionedRoutes: unversionedRoutes.slice(0, 10), versioningRatio: (versioningRatio * 100).toFixed(1) + '%' }
      const message = versioningRatio > 0.5 ? `Good API design with ${versionedRoutes.length} versioned routes` : `API versioning needed - only ${versionedRoutes.length} of ${apiFiles.length} routes are versioned`
      return builder.status(score >= 80 ? 'pass' : score >= 60 ? 'warning' : 'fail').score(Math.round(score)).value(apiFiles.length).threshold(90).severity('high').message(message).details(details).duration(Date.now() - startTime).build()
    } catch (error) {
      return builder.status('error').score(0).value(0).threshold(90).severity('high').message(`API design evaluation failed: ${error}`).details({ error: String(error) }).duration(Date.now() - startTime).build()
    }
  },
}

// ============================================================================
// 5. Database Schema Eval
// ============================================================================

export const databaseSchemaEval: EvalDefinition = {
  id: 'arch-database-schema',
  name: 'Database Schema Evaluation',
  description: 'Verifies proper relationships, indexes, and constraints in Prisma schema',
  category: 'architecture' as MetricCategory,
  async run() {
    const builder = new MetricResultBuilder('arch-database-schema', 'Database Schema Evaluation', 'architecture' as MetricCategory)
    const startTime = Date.now()
    try {
      const schemaPath = join(process.cwd(), 'prisma/schema.prisma')
      const schemaContent = await readFileContent(schemaPath)
      if (!schemaContent) {
        return builder.status('error').score(0).value(0).threshold(85).severity('critical').message('Prisma schema not found').details({ error: 'Schema file not found' }).duration(Date.now() - startTime).build()
      }
      const modelPattern = /model\s+(\w+)\s*\{/g
      let models: string[] = []
      let match
      while ((match = modelPattern.exec(schemaContent)) !== null) {
        models.push(match[1])
      }
      const relations = countPattern(schemaContent, /@relation/g)
      const indexes = countPattern(schemaContent, /@@index/g)
      const uniqueConstraints = countPattern(schemaContent, /@unique/g)
      const cascades = countPattern(schemaContent, /onDelete:\s*Cascade/g)
      const tableMappings = countPattern(schemaContent, /@@map/g)
      const relPerModel = models.length > 0 ? relations / models.length : 0
      const idxPerModel = models.length > 0 ? indexes / models.length : 0
      let score = 50
      if (relations > 0) score += 15
      if (idxPerModel >= 1) score += 15
      else if (idxPerModel >= 0.5) score += 10
      if (cascades > 0) score += 10
      if (tableMappings > 0) score += 5
      if (uniqueConstraints > 0) score += 5
      score = Math.max(0, Math.min(100, score))
      const details = { totalModels: models.length, models, relationships: relations, indexes, uniqueConstraints, cascades, tableMappings, relPerModel: relPerModel.toFixed(2), idxPerModel: idxPerModel.toFixed(2) }
      const message = relations > 0 && indexes > 0 ? `Good schema design with ${relations} relationships and ${indexes} indexes` : `Schema needs improvement - found ${relations} relations and ${indexes} indexes`
      return builder.status(score >= 80 ? 'pass' : score >= 60 ? 'warning' : 'fail').score(Math.round(score)).value(models.length).threshold(85).severity('high').message(message).details(details).duration(Date.now() - startTime).build()
    } catch (error) {
      return builder.status('error').score(0).value(0).threshold(85).severity('high').message(`Database schema evaluation failed: ${error}`).details({ error: String(error) }).duration(Date.now() - startTime).build()
    }
  },
}

// ============================================================================
// 6. Dependency Inversion Eval
// ============================================================================

export const dependencyInversionEval: EvalDefinition = {
  id: 'arch-dependency-inversion',
  name: 'Dependency Inversion Evaluation',
  description: 'Verifies high-level modules depend on abstractions, not concretions',
  category: 'architecture' as MetricCategory,
  async run() {
    const builder = new MetricResultBuilder('arch-dependency-inversion', 'Dependency Inversion Evaluation', 'architecture' as MetricCategory)
    const startTime = Date.now()
    try {
      const srcDir = join(process.cwd(), 'src')
      const files = await getTsFiles(srcDir)
      const directDbPattern = /import\s+.*\s+from\s+['"]@prisma\/client['"]/g
      const directNewPattern = /new\s+(?:PrismaClient|Redis|MySQL)/g
      const violations: { file: string; type: string }[] = []
      let abstractions = 0
      for (const file of files) {
        const content = await readFileContent(join(srcDir, file))
        if (!file.includes('middleware') && !file.includes('node_modules')) {
          const hasDirectDb = directDbPattern.test(content)
          directDbPattern.lastIndex = 0
          const hasDirectNew = directNewPattern.test(content)
          if (hasDirectDb || hasDirectNew) {
            violations.push({ file, type: hasDirectDb ? 'direct_prisma' : 'direct_instantiation' })
          }
        }
        abstractions += countPattern(content, /interface\s+\w+/g) + countPattern(content, /abstract\s+class\s+\w+/g)
      }
      const violationRatio = files.length > 0 ? violations.length / files.length : 0
      let score = 100 - (violationRatio * 100)
      score = Math.max(0, Math.min(100, score))
      if (abstractions > 0) score += Math.min(15, abstractions / 5)
      const details = { totalFiles: files.length, violations: violations.slice(0, 15), abstractionCount: abstractions, violationRatio: (violationRatio * 100).toFixed(2) + '%' }
      const message = violations.length === 0 ? `Excellent dependency management with ${abstractions} abstractions` : `Found ${violations.length} potential DIP violations`
      return builder.status(score >= 85 ? 'pass' : score >= 70 ? 'warning' : 'fail').score(Math.round(score)).value(violations.length).threshold(90).severity('high').message(message).details(details).duration(Date.now() - startTime).build()
    } catch (error) {
      return builder.status('error').score(0).value(0).threshold(90).severity('high').message(`Dependency inversion evaluation failed: ${error}`).details({ error: String(error) }).duration(Date.now() - startTime).build()
    }
  },
}

// ============================================================================
// 7. Cohesion Eval
// ============================================================================

export const cohesionEval: EvalDefinition = {
  id: 'arch-cohesion',
  name: 'Cohesion Evaluation',
  description: 'Verifies modules have high cohesion with single responsibility',
  category: 'architecture' as MetricCategory,
  async run() {
    const builder = new MetricResultBuilder('arch-cohesion', 'Cohesion Evaluation', 'architecture' as MetricCategory)
    const startTime = Date.now()
    try {
      const srcDir = join(process.cwd(), 'src')
      const files = await getTsFiles(srcDir)
      let totalCohesion = 0
      let evaluatedModules = 0
      const lowCohesionModules: { file: string; score: number }[] = []
      for (const file of files) {
        const content = await readFileContent(join(srcDir, file))
        if (content.length < 100) continue
        const declarations = extractDeclarations(content)
        if (declarations.length < 2) continue
        const cohesion = calculateModuleCohesion(declarations, content)
        totalCohesion += cohesion
        evaluatedModules++
        if (cohesion < 50) {
          lowCohesionModules.push({ file, score: cohesion })
        }
      }
      const avgCohesion = evaluatedModules > 0 ? totalCohesion / evaluatedModules : 0
      let score = avgCohesion
      if (lowCohesionModules.length > 0) {
        score -= Math.min(20, lowCohesionModules.length * 2)
      }
      score = Math.max(0, Math.min(100, score))
      const details = { evaluatedModules, avgCohesion: avgCohesion.toFixed(1) + '%', lowCohesionModules: lowCohesionModules.slice(0, 15), cohesionDistribution: { high: evaluatedModules - lowCohesionModules.length, low: lowCohesionModules.length } }
      const message = avgCohesion >= 60 ? `Good module cohesion with ${avgCohesion.toFixed(1)}% average` : `Low cohesion detected - ${lowCohesionModules.length} modules need refactoring`
      return builder.status(score >= 70 ? 'pass' : score >= 55 ? 'warning' : 'fail').score(Math.round(score)).value(Math.round(avgCohesion)).threshold(80).severity('medium').message(message).details(details).duration(Date.now() - startTime).build()
    } catch (error) {
      return builder.status('error').score(0).value(0).threshold(80).severity('medium').message(`Cohesion evaluation failed: ${error}`).details({ error: String(error) }).duration(Date.now() - startTime).build()
    }
  },
}

// ============================================================================
// 8. Coupling Eval
// ============================================================================

export const couplingEval: EvalDefinition = {
  id: 'arch-coupling',
  name: 'Coupling Evaluation',
  description: 'Verifies low coupling between modules',
  category: 'architecture' as MetricCategory,
  async run() {
    const builder = new MetricResultBuilder('arch-coupling', 'Coupling Evaluation', 'architecture' as MetricCategory)
    const startTime = Date.now()
    try {
      const srcDir = join(process.cwd(), 'src')
      const files = await getTsFiles(srcDir)
      const importCounts: Record<string, number> = {}
      const importTargets: Record<string, string[]> = {}
      const circularDependencies: string[][] = []
      for (const file of files) {
        const content = await readFileContent(join(srcDir, file))
        const imports = extractImports(content)
        importCounts[file] = imports.length
        importTargets[file] = imports
        for (const imp of imports) {
          if (importTargets[imp]?.includes(file.replace(/\\/g, '/'))) {
            circularDependencies.push([file, imp])
          }
        }
      }
      const totalImports = Object.values(importCounts).reduce((sum, count) => sum + count, 0)
      const avgImports = files.length > 0 ? totalImports / files.length : 0
      const fanOut: Record<string, number> = {}
      for (const [, imports] of Object.entries(importTargets)) {
        for (const imp of imports) {
          fanOut[imp] = (fanOut[imp] || 0) + 1
        }
      }
      const godModules = Object.entries(fanOut)
        .filter(([, count]) => count > 20)
        .map(([mod, count]) => ({ module: mod, fanOut: count }))
      let score = 100 - (avgImports * 5)
      score -= circularDependencies.length * 5
      score -= godModules.length * 3
      score = Math.max(0, Math.min(100, score))
      const details = { totalFiles: files.length, avgImportsPerFile: avgImports.toFixed(2), circularDependencies: circularDependencies.slice(0, 10), godModules, fanOutStats: { max: Math.max(...Object.values(fanOut), 0), avg: (Object.values(fanOut).reduce((a, b) => a + b, 0) / Math.max(1, Object.keys(fanOut).length)).toFixed(2) } }
      const message = circularDependencies.length === 0 && godModules.length === 0 ? `Good decoupling with ${avgImports.toFixed(1)} avg imports per file` : `Coupling issues: ${circularDependencies.length} circular deps, ${godModules.length} god modules`
      return builder.status(score >= 80 ? 'pass' : score >= 65 ? 'warning' : 'fail').score(Math.round(score)).value(Math.round(avgImports * 10) / 10).threshold(85).severity('high').message(message).details(details).duration(Date.now() - startTime).build()
    } catch (error) {
      return builder.status('error').score(0).value(0).threshold(85).severity('high').message(`Coupling evaluation failed: ${error}`).details({ error: String(error) }).duration(Date.now() - startTime).build()
    }
  },
}

// ============================================================================
// 9. Scalability Eval
// ============================================================================

export const scalabilityEval: EvalDefinition = {
  id: 'arch-scalability',
  name: 'Scalability Evaluation',
  description: 'Verifies architecture supports horizontal scaling',
  category: 'architecture' as MetricCategory,
  async run() {
    const builder = new MetricResultBuilder('arch-scalability', 'Scalability Evaluation', 'architecture' as MetricCategory)
    const startTime = Date.now()
    try {
      const srcDir = join(process.cwd(), 'src')
      const files = await getTsFiles(srcDir)
      let statelessPatterns = 0
      let cachingPatterns = 0
      let connectionPooling = 0
      let asyncPatterns = 0
      let stateManagement = 0
      let singletonPatterns = 0
      const scalabilityChecks = {
        stateless: /req:\s*(?:NextRequest|Request)/,
        cache: /cache\(|getStaticProps|getServerSideProps|revalidate|cacheTags/,
        connectionPool: /pool|max:|connectionLimit/,
        async: /async|await|Promise/,
        stateManagement: /useState|useReducer|zustand|jotai|recoil|redux/,
        singleton: /new\s+\w+\(\)|instance|singleInstance/,
      }
      for (const file of files) {
        const content = await readFileContent(join(srcDir, file))
        if (scalabilityChecks.stateless.test(content)) statelessPatterns++
        if (scalabilityChecks.cache.test(content)) cachingPatterns++
        if (scalabilityChecks.connectionPool.test(content)) connectionPooling++
        if (scalabilityChecks.async.test(content)) asyncPatterns++
        if (scalabilityChecks.stateManagement.test(content)) stateManagement++
        if (scalabilityChecks.singleton.test(content)) singletonPatterns++
      }
      let score = 50
      if (statelessPatterns > 0) score += 15
      if (cachingPatterns > 0) score += 15
      if (connectionPooling > 0) score += 10
      if (asyncPatterns > files.length * 0.5) score += 5
      if (singletonPatterns > files.length * 0.3) score -= 10
      score = Math.max(0, Math.min(100, score))
      const details = { statelessEndpoints: statelessPatterns, cachingPatterns, connectionPooling, asyncPatterns, stateManagement, singletonPatterns, recommendations: [
        connectionPooling === 0 ? 'Consider implementing database connection pooling' : 'Good: Connection pooling detected',
        cachingPatterns === 0 ? 'Consider adding caching layer for scalability' : 'Good: Caching patterns found',
        singletonPatterns > 10 ? 'Consider reducing singleton patterns for stateless design' : 'Good: Limited singletons',
      ]}
      const message = score >= 75 ? 'Architecture supports horizontal scaling well' : score >= 55 ? 'Architecture partially supports scaling - some improvements needed' : 'Architecture may have scaling limitations'
      return builder.status(score >= 75 ? 'pass' : score >= 55 ? 'warning' : 'fail').score(Math.round(score)).value(statelessPatterns + cachingPatterns).threshold(80).severity('high').message(message).details(details).duration(Date.now() - startTime).build()
    } catch (error) {
      return builder.status('error').score(0).value(0).threshold(80).severity('high').message(`Scalability evaluation failed: ${error}`).details({ error: String(error) }).duration(Date.now() - startTime).build()
    }
  },
}

// ============================================================================
// 10. Code Organization Eval
// ============================================================================

export const codeOrganizationEval: EvalDefinition = {
  id: 'arch-code-organization',
  name: 'Code Organization Evaluation',
  description: 'Verifies consistent and logical folder structure',
  category: 'architecture' as MetricCategory,
  async run() {
    const builder = new MetricResultBuilder('arch-code-organization', 'Code Organization Evaluation', 'architecture' as MetricCategory)
    const startTime = Date.now()
    try {
      const srcDir = join(process.cwd(), 'src')
      const entries = await readdir(srcDir, { withFileTypes: true })
      const directories = entries.filter(e => e.isDirectory()).map(e => e.name)
      const expectedDirs = { api: ['app/api', 'pages/api', 'api'], lib: ['lib', 'utils', 'helpers'], components: ['components'], hooks: ['hooks', 'composables'], types: ['types', 'types.ts', '@types'], store: ['store', 'stores', 'state'] }
      const foundDirs: Record<string, boolean> = {}
      for (const [category, paths] of Object.entries(expectedDirs)) {
        foundDirs[category] = paths.some(p => directories.includes(p) || directories.some(d => d.includes(p)))
      }
      const srcFiles = await getTsFiles(srcDir, srcDir)
      const rootFiles = srcFiles.filter(f => !f.includes('/'))
      const deepNestedFiles = srcFiles.filter(f => (f.match(/\//g) || []).length > 4)
      const kebabCase = srcFiles.filter(f => /^[a-z][a-z0-9-]+\.[jt]sx?$/.test(f.split('/').pop() || '')).length
      const camelCase = srcFiles.filter(f => /^[a-z][a-z0-9]+\.[jt]sx?$/.test(f.split('/').pop() || '')).length
      const pascalCase = srcFiles.filter(f => /^[A-Z][a-zA-Z0-9]+\.[jt]sx?$/.test(f.split('/').pop() || '')).length
      const namingConsistency = srcFiles.length > 0 ? Math.max(kebabCase, camelCase, pascalCase) / srcFiles.length : 1
      let score = 50
      const structureScore = Object.values(foundDirs).filter(Boolean).length
      score += structureScore * 8
      if (namingConsistency > 0.8) score += 10
      else if (namingConsistency > 0.5) score += 5
      if (rootFiles.length > 10) score -= 10
      if (deepNestedFiles.length > srcFiles.length * 0.3) score -= 10
      score = Math.max(0, Math.min(100, score))
      const details = { directoriesFound: directories, structureCoverage: foundDirs, structureScore: `${structureScore}/${Object.keys(expectedDirs).length}`, rootLevelFiles: rootFiles.length, deepNestedFiles: deepNestedFiles.length, namingConvention: { kebabCase, camelCase, pascalCase, consistency: (namingConsistency * 100).toFixed(1) + '%' } }
      const message = structureScore >= 4 ? `Good code organization with ${structureScore} of ${Object.keys(expectedDirs).length} expected directories` : `Limited code organization - only ${structureScore} expected directories found`
      return builder.status(score >= 75 ? 'pass' : score >= 55 ? 'warning' : 'fail').score(Math.round(score)).value(structureScore).threshold(80).severity('medium').message(message).details(details).duration(Date.now() - startTime).build()
    } catch (error) {
      return builder.status('error').score(0).value(0).threshold(80).severity('medium').message(`Code organization evaluation failed: ${error}`).details({ error: String(error) }).duration(Date.now() - startTime).build()
    }
  },
}

// ============================================================================
// Export All Architecture Evals
// ============================================================================

export const architectureEvals: EvalDefinition[] = [
  modularityEval,
  typeSafetyEval,
  errorHandlingEval,
  apiDesignEval,
  databaseSchemaEval,
  dependencyInversionEval,
  cohesionEval,
  couplingEval,
  scalabilityEval,
  codeOrganizationEval,
]

export default architectureEvals