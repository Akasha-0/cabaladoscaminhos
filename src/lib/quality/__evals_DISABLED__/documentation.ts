/**
 * Documentation Quality Evals - Cabala dos Caminhos
 * Rigorous metrics for documentation quality assessment
 */

import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { MetricResultBuilder, type EvalDefinition } from '../metrics-framework'

// Enum value objects for direct usage with MetricResultBuilder
const MetricCategory = {
  DOCUMENTATION: 'documentation',
  SPIRITUAL_CORRELATIONS: 'spiritual_correlations',
  AI_INTEGRATION: 'ai_integration',
  PERFORMANCE: 'performance',
  UI_DESIGN: 'ui_design',
  UX_DESIGN: 'ux_design',
  ARCHITECTURE: 'architecture',
  QA_TESTING: 'qa_testing',
} as const

const MetricSeverity = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
  INFO: 'info',
} as const

// ============================================================================
// Helper Functions
// ============================================================================

function readDocument(path: string): string | null {
  try {
    const fullPath = join(process.cwd(), path)
    if (!existsSync(fullPath)) return null
    return readFileSync(fullPath, 'utf-8')
  } catch {
    return null
  }
}

function countMatches(content: string, pattern: RegExp): number {
  return (content.match(pattern) || []).length
}

function hasSection(content: string, title: string): boolean {
  return content.toLowerCase().includes(title.toLowerCase())
}

function calculatePercentage(found: number, total: number): number {
  if (total === 0) return 100
  return Math.round((found / total) * 100)
}

// ============================================================================
// 1. README Quality Eval
// ============================================================================

export const readmeQualityEval: EvalDefinition = {
  id: 'documentation-readme-quality',
  name: 'README Quality',
  description: 'Verifica qualidade do README com setup, features e contrib guild',
  category: MetricCategory.DOCUMENTATION,
  run: async () => {
    const startTime = Date.now()
    const builder = new MetricResultBuilder(
      'documentation-readme-quality',
      'README Quality',
      MetricCategory.DOCUMENTATION
    )

    const content = readDocument('README.md')
    if (!content) {
      return builder
        .status('fail')
        .score(0)
        .value('not_found')
        .threshold(80)
        .severity(MetricSeverity.CRITICAL)
        .message('README.md não encontrado')
        .details({ found: false })
        .duration(Date.now() - startTime)
        .build()
    }

    const checks = {
      setup: hasSection(content, 'setup') || hasSection(content, 'instalação') || hasSection(content, 'instalacao'),
      features: hasSection(content, 'feature') || hasSection(content, 'funcionalidade'),
      contributing: hasSection(content, 'contrib') || hasSection(content, 'contributing'),
      installation: hasSection(content, 'install') || hasSection(content, 'npm') || hasSection(content, 'yarn'),
      gettingStarted: hasSection(content, 'getting started') || hasSection(content, 'começando') || hasSection(content, 'início'),
      usage: hasSection(content, 'usage') || hasSection(content, 'uso') || hasSection(content, 'exemplo'),
      license: hasSection(content, 'license') || hasSection(content, 'licença'),
      badges: /\[!\[[\w]+]\(/.test(content) || content.includes('[!['),
    }

    const passedChecks = Object.values(checks).filter(Boolean).length
    const totalChecks = Object.keys(checks).length
    const score = calculatePercentage(passedChecks, totalChecks)

    const status = score >= 80 ? 'pass' : score >= 60 ? 'warning' : 'fail'
    const severity = score >= 80 ? MetricSeverity.LOW : score >= 60 ? MetricSeverity.MEDIUM : MetricSeverity.HIGH

    const messages: Record<string, string> = {
      pass: 'README completo com todas seções essenciais',
      warning: 'README incompleto - falta(m) seção(ões)',
      fail: 'README deficiente - múltiplas seções ausentes',
    }

    return builder
      .status(status)
      .score(score)
      .value(passedChecks)
      .threshold(80)
      .severity(severity)
      .message(messages[status])
      .details({
        ...checks,
        checksPassed: passedChecks,
        totalChecks,
        missingSections: Object.entries(checks)
          .filter(([, v]) => !v)
          .map(([k]) => k),
      })
      .duration(Date.now() - startTime)
      .build()
  },
}

// ============================================================================
// 2. API Documentation Eval
// ============================================================================

export const apiDocumentationEval: EvalDefinition = {
  id: 'documentation-api',
  name: 'API Documentation',
  description: 'Verifica todos endpoints documentados com request/response examples',
  category: MetricCategory.DOCUMENTATION,
  run: async () => {
    const startTime = Date.now()
    const builder = new MetricResultBuilder(
      'documentation-api',
      'API Documentation',
      MetricCategory.DOCUMENTATION
    )

    const content = readDocument('docs/API.md')
    if (!content) {
      return builder
        .status('fail')
        .score(0)
        .value('not_found')
        .threshold(85)
        .severity(MetricSeverity.CRITICAL)
        .message('docs/API.md não encontrado')
        .details({ found: false })
        .duration(Date.now() - startTime)
        .build()
    }

    // Key sections that should be present
    const sections = {
      baseUrl: /base url|baseURL|http:\/\/localhost:3000\/api/i.test(content),
      authentication: /autenticação|authentication|bearer|token/i.test(content),
      rateLimiting: /rate limit|limite|429/i.test(content),
      errorCodes: /erro|error|400|401|404|500/i.test(content),
    }

    // Count documented endpoints
    const endpointPattern = /#### `([A-Z]+) ([/a-z-]+)`/g
    const endpoints: string[] = []
    let match
    while ((match = endpointPattern.exec(content)) !== null) {
      endpoints.push(`${match[1]} ${match[2]}`)
    }

    // Check for examples
    const requestExamples = countMatches(content, /```json\s*\{/g)
    const responseExamples = countMatches(content, /\*\*Response \(200\)/g)
    const hasRequestExamples = requestExamples >= endpoints.length * 0.7
    const hasResponseExamples = responseExamples >= endpoints.length * 0.5

    // Calculate score
    const sectionScore = calculatePercentage(
      Object.values(sections).filter(v => v).length,
      4
    )
    const endpointScore = Math.min(endpoints.length * 10, 50)
    const exampleScore = (hasRequestExamples ? 25 : 0) + (hasResponseExamples ? 25 : 0)
    const totalScore = Math.min(sectionScore + endpointScore + exampleScore, 100)

    const status = totalScore >= 85 ? 'pass' : totalScore >= 60 ? 'warning' : 'fail'
    const severity = totalScore >= 85 ? MetricSeverity.LOW : totalScore >= 60 ? MetricSeverity.MEDIUM : MetricSeverity.HIGH

    return builder
      .status(status)
      .score(totalScore)
      .value(endpoints.length)
      .threshold(85)
      .severity(severity)
      .message(`${endpoints.length} endpoints documentados com ${exampleScore}% de coverage`)
      .details({
        sectionsPresent: Object.values(sections).filter(v => v).length,
        totalSections: 4,
        endpointsFound: endpoints.length,
        requestExamples,
        responseExamples,
        hasRequestExamples,
        hasResponseExamples,
      })
      .duration(Date.now() - startTime)
      .build()
  },
}

// ============================================================================
// 3. Type Documentation Eval
// ============================================================================

export const typeDocumentationEval: EvalDefinition = {
  id: 'documentation-types',
  name: 'Type Documentation (TSDoc)',
  description: 'Verifica types exports com TSDoc comments completos',
  category: MetricCategory.DOCUMENTATION,
  run: async () => {
    const startTime = Date.now()
    const builder = new MetricResultBuilder(
      'documentation-types',
      'Type Documentation (TSDoc)',
      MetricCategory.DOCUMENTATION
    )

    // Scan key lib files for type exports with documentation
    const keyFiles = [
      'src/lib/numerologia/calculos.ts',
      'src/lib/astrologia/planet-calculator.ts',
      'src/lib/ai/oracle.ts',
      'src/lib/ritual/ritual-calendar.ts',
    ]

    let totalTypes = 0
    let documentedTypes = 0
    const filesWithDocumentation: string[] = []
    const filesWithoutDocumentation: string[] = []

    for (const file of keyFiles) {
      const content = readDocument(file)
      if (!content) continue

      const typePattern = /(?:export\s+)?(?:interface|type)\s+(\w+)/g
      const tsdocPattern = /\/\*\*\s*\n\s*\*[^*]/g

      const matches = content.match(typePattern) || []
      const docs = content.match(tsdocPattern) || []

      totalTypes += matches.length

      if (docs.length >= matches.length * 0.7) {
        documentedTypes += matches.length
        filesWithDocumentation.push(file)
      } else {
        filesWithoutDocumentation.push(file)
      }
    }

    // Check for TSDoc tags
    const allLibContent = keyFiles.map(f => readDocument(f) || '').join('\n')
    const hasParams = countMatches(allLibContent, /@param/) > 0
    const hasReturns = countMatches(allLibContent, /@returns?/) > 0
    const hasExamples = countMatches(allLibContent, /@example/) > 0

    const coverage = totalTypes > 0 ? calculatePercentage(documentedTypes, totalTypes) : 50
    const status = coverage >= 80 ? 'pass' : coverage >= 50 ? 'warning' : 'fail'
    const severity = coverage >= 80 ? MetricSeverity.LOW : coverage >= 50 ? MetricSeverity.MEDIUM : MetricSeverity.HIGH

    const messages: Record<string, string> = {
      pass: 'Types bem documentados com TSDoc comments',
      warning: 'Types parcialmente documentados',
      fail: 'Types sem documentação TSDoc adequada',
    }

    return builder
      .status(status)
      .score(coverage)
      .value(documentedTypes)
      .threshold(80)
      .severity(severity)
      .message(messages[status])
      .details({
        totalTypes,
        documentedTypes,
        coverage,
        filesWithDocs: filesWithDocumentation.length,
        filesWithoutDocs: filesWithoutDocumentation.length,
        hasParams,
        hasReturns,
        hasExamples,
      })
      .duration(Date.now() - startTime)
      .build()
  },
}

// ============================================================================
// 4. Changelog Eval
// ============================================================================

export const changelogEval: EvalDefinition = {
  id: 'documentation-changelog',
  name: 'Changelog Updated',
  description: 'Verifica changelog atualizado com release notes no padrão Keep a Changelog',
  category: MetricCategory.DOCUMENTATION,
  run: async () => {
    const startTime = Date.now()
    const builder = new MetricResultBuilder(
      'documentation-changelog',
      'Changelog Updated',
      MetricCategory.DOCUMENTATION
    )

    const content = readDocument('docs/CHANGELOG.md')
    if (!content) {
      return builder
        .status('fail')
        .score(0)
        .value('not_found')
        .threshold(70)
        .severity(MetricSeverity.HIGH)
        .message('docs/CHANGELOG.md não encontrado')
        .details({ found: false })
        .duration(Date.now() - startTime)
        .build()
    }

    // Check for Keep a Changelog format
    const hasKeepAChangelog = /keep a changelog|keepachangelog/i.test(content)
    const hasSemanticVersioning = /semantic versioning|semver/i.test(content)

    // Check for required sections
    const requiredSections = ['added', 'changed', 'deprecated', 'removed', 'fixed', 'security']
    const presentSections = requiredSections.filter(s =>
      new RegExp(`###\\s+${s}`, 'i').test(content)
    )

    // Check for versions
    const hasUnreleased = /\[unreleased\]/i.test(content)
    const hasReleasedVersions = /\[\d+\.\d+\.\d+\]/g.test(content)

    // Check if substantial content exists
    const recentUpdates = content.length > 500

    let score = calculatePercentage(presentSections.length, requiredSections.length)
    if (hasKeepAChangelog) score += 10
    if (hasSemanticVersioning) score += 10
    if (hasUnreleased || hasReleasedVersions) score += 10
    if (recentUpdates) score += 10

    const finalScore = Math.min(score, 100)

    const status = finalScore >= 70 ? 'pass' : finalScore >= 40 ? 'warning' : 'fail'
    const severity = finalScore >= 70 ? MetricSeverity.LOW : finalScore >= 40 ? MetricSeverity.MEDIUM : MetricSeverity.HIGH

    return builder
      .status(status)
      .score(finalScore)
      .value(presentSections.length)
      .threshold(70)
      .severity(severity)
      .message(`${presentSections.length}/${requiredSections.length} seções presentes`)
      .details({
        hasKeepAChangelog,
        hasSemanticVersioning,
        presentSections,
        missingSections: requiredSections.filter(s => !presentSections.includes(s)),
        hasUnreleased,
        hasReleasedVersions,
        hasRecentUpdates: recentUpdates,
      })
      .duration(Date.now() - startTime)
      .build()
  },
}

// ============================================================================
// 5. Contributing Guide Eval
// ============================================================================

export const contributingGuideEval: EvalDefinition = {
  id: 'documentation-contributing',
  name: 'Contributing Guide',
  description: 'Verifica CONTRIBUTING.md com coding standards e workflow completo',
  category: MetricCategory.DOCUMENTATION,
  run: async () => {
    const startTime = Date.now()
    const builder = new MetricResultBuilder(
      'documentation-contributing',
      'Contributing Guide',
      MetricCategory.DOCUMENTATION
    )

    const content = readDocument('CONTRIBUTING.md')
    if (!content) {
      return builder
        .status('fail')
        .score(0)
        .value('not_found')
        .threshold(75)
        .severity(MetricSeverity.HIGH)
        .message('CONTRIBUTING.md não encontrado')
        .details({ found: false })
        .duration(Date.now() - startTime)
        .build()
    }

    // Check for essential sections
    const checks = {
      setup: hasSection(content, 'pré-requisito') || hasSection(content, 'prerequisite') || hasSection(content, 'configuração local'),
      installation: hasSection(content, 'instalar') || hasSection(content, 'install') || hasSection(content, 'clone'),
      codingStandards: hasSection(content, 'convenção') || hasSection(content, 'convention') || hasSection(content, 'padrão'),
      typescript: hasSection(content, 'typescript') || /interface|type\s+\w+/i.test(content),
      gitWorkflow: hasSection(content, 'branch') || hasSection(content, 'commit'),
      conventionalCommits: /conventional commit|conventional-commits/i.test(content),
      testing: hasSection(content, 'test') || hasSection(content, 'vitest'),
      pullRequest: hasSection(content, 'pull request') || hasSection(content, 'pr'),
      prChecklist: /checklist|checklist|✅|-\s+\[/i.test(content),
      codeExamples: countMatches(content, /```typescript|```tsx|```bash/g) >= 3,
    }

    const passedChecks = Object.values(checks).filter(Boolean).length
    const totalChecks = Object.keys(checks).length
    const score = calculatePercentage(passedChecks, totalChecks)

    const status = score >= 75 ? 'pass' : score >= 50 ? 'warning' : 'fail'
    const severity = score >= 75 ? MetricSeverity.LOW : score >= 50 ? MetricSeverity.MEDIUM : MetricSeverity.HIGH

    return builder
      .status(status)
      .score(score)
      .value(passedChecks)
      .threshold(75)
      .severity(severity)
      .message(`${passedChecks}/${totalChecks} seções de contribuição verificadas`)
      .details({
        ...checks,
        checksPassed: passedChecks,
        totalChecks,
        missingSections: Object.entries(checks)
          .filter(([, v]) => !v)
          .map(([k]) => k),
      })
      .duration(Date.now() - startTime)
      .build()
  },
}

// ============================================================================
// 6. Component Documentation Eval
// ============================================================================

export const componentDocumentationEval: EvalDefinition = {
  id: 'documentation-components',
  name: 'Component Documentation',
  description: 'Verifica componentes com examples e props documentados',
  category: MetricCategory.DOCUMENTATION,
  run: async () => {
    const startTime = Date.now()
    const builder = new MetricResultBuilder(
      'documentation-components',
      'Component Documentation',
      MetricCategory.DOCUMENTATION
    )

    const content = readDocument('docs/COMPONENTS.md')
    if (!content) {
      return builder
        .status('fail')
        .score(0)
        .value('not_found')
        .threshold(80)
        .severity(MetricSeverity.HIGH)
        .message('docs/COMPONENTS.md não encontrado')
        .details({ found: false })
        .duration(Date.now() - startTime)
        .build()
    }

    // Count documented components
    const componentPattern = /###\s+\w+[A-Za-z]/g
    const components = content.match(componentPattern) || []

    // Check for props tables
    const propsTablePattern = /\*\*Props:\*\*|Prop\s+\|\s+Tipo|Props\s+\|\s+Tipo/g
    const propsTables = content.match(propsTablePattern) || []

    // Check for code examples
    const codeBlockPattern = /```(tsx|jsx|typescript|javascript)[\s\S]*?```/g
    const codeExamples = content.match(codeBlockPattern) || []

    // Check for location paths
    const locationPattern = /Localização:|Location:|src\/components\//g
    const locations = content.match(locationPattern) || []

    // Calculate coverage
    const hasPropsTables = propsTables.length >= components.length * 0.7
    const hasCodeExamples = codeExamples.length >= components.length * 0.8
    const hasLocations = locations.length >= components.length * 0.5

    let exampleScore = 0
    if (hasPropsTables) exampleScore += 30
    if (hasCodeExamples) exampleScore += 35
    if (hasLocations) exampleScore += 15
    exampleScore += Math.min(components.length * 2, 20)

    const score = Math.min(exampleScore, 100)

    const status = score >= 80 ? 'pass' : score >= 50 ? 'warning' : 'fail'
    const severity = score >= 80 ? MetricSeverity.LOW : score >= 50 ? MetricSeverity.MEDIUM : MetricSeverity.HIGH

    return builder
      .status(status)
      .score(score)
      .value(components.length)
      .threshold(80)
      .severity(severity)
      .message(`${components.length} componentes documentados com ${codeExamples.length} examples`)
      .details({
        componentsFound: components.length,
        propsTablesFound: propsTables.length,
        codeExamplesFound: codeExamples.length,
        locationsFound: locations.length,
        hasPropsTables,
        hasCodeExamples,
        hasLocations,
      })
      .duration(Date.now() - startTime)
      .build()
  },
}

// ============================================================================
// 7. Error Messages Eval
// ============================================================================

export const errorMessagesEval: EvalDefinition = {
  id: 'documentation-error-messages',
  name: 'Error Messages Descriptive',
  description: 'Verifica mensagens de erro descritivas com contexto e sugestões',
  category: MetricCategory.DOCUMENTATION,
  run: async () => {
    const startTime = Date.now()
    const builder = new MetricResultBuilder(
      'documentation-error-messages',
      'Error Messages Descriptive',
      MetricCategory.DOCUMENTATION
    )

    // Check key API routes for error message quality
    const keyRoutes = [
      'src/app/api/numerologia/route.ts',
      'src/app/api/astrologia/natal/route.ts',
      'src/middleware.ts',
    ]

    let totalErrorResponses = 0
    let descriptiveErrors = 0
    let hasErrorCode = 0
    let hasSuggestion = 0

    for (const route of keyRoutes) {
      const content = readDocument(route)
      if (!content) continue

      // Find error responses
      const errorPattern = /\{[\s\S]*?error:\s*['"]([^'"]+)['"][\s\S]*?\}/g
      const errors = content.match(errorPattern) || []

      totalErrorResponses += errors.length

      // Check if errors are descriptive
      const descriptivePatterns = [
        /Parâmetro.*obrigatório/i,
        /não reconhecido|inválido/i,
        /não encontrado/i,
        /credenciais/i,
        /créditos insuficientes/i,
        /autenticação/i,
      ]

      for (const error of errors) {
        if (descriptivePatterns.some(p => p.test(error))) {
          descriptiveErrors++
        }
        if (/error:\s*['"].*[:\s]/i.test(error)) {
          hasErrorCode++
        }
        if (/sugestão|tente|verifique|verifique/i.test(error.toLowerCase())) {
          hasSuggestion++
        }
      }
    }

    const descriptiveRatio = totalErrorResponses > 0
      ? calculatePercentage(descriptiveErrors, totalErrorResponses)
      : 0

    const status = descriptiveRatio >= 80 ? 'pass' : descriptiveRatio >= 50 ? 'warning' : 'fail'
    const severity = descriptiveRatio >= 80 ? MetricSeverity.LOW : descriptiveRatio >= 50 ? MetricSeverity.MEDIUM : MetricSeverity.HIGH

    const messages: Record<string, string> = {
      pass: 'Mensagens de erro descritivas e informativas',
      warning: 'Algumas mensagens de erro genéricas encontradas',
      fail: 'Mensagens de erro pouco descritivas',
    }

    return builder
      .status(status)
      .score(descriptiveRatio)
      .value(descriptiveErrors)
      .threshold(80)
      .severity(severity)
      .message(messages[status])
      .details({
        totalErrors: totalErrorResponses,
        descriptiveErrors,
        hasErrorCode,
        hasSuggestion,
        routesAnalyzed: keyRoutes.length,
      })
      .duration(Date.now() - startTime)
      .build()
  },
}

// ============================================================================
// 8. Examples Coverage Eval
// ============================================================================

export const examplesCoverageEval: EvalDefinition = {
  id: 'documentation-examples',
  name: 'Examples Coverage',
  description: 'Verifica coverage de code examples na documentação',
  category: MetricCategory.DOCUMENTATION,
  run: async () => {
    const startTime = Date.now()
    const builder = new MetricResultBuilder(
      'documentation-examples',
      'Examples Coverage',
      MetricCategory.DOCUMENTATION
    )

    const docsFiles = ['docs/API.md', 'docs/COMPONENTS.md', 'CONTRIBUTING.md']
    let totalCodeBlocks = 0
    let typescriptExamples = 0
    let bashExamples = 0
    let jsonExamples = 0

    for (const file of docsFiles) {
      const content = readDocument(file)
      if (!content) continue

      totalCodeBlocks += countMatches(content, /```[\w]*\n[\s\S]*?\n```/g)

      typescriptExamples += countMatches(content, /```tsx|```typescript|```jsx/gi)
      bashExamples += countMatches(content, /```bash|```sh|```shell/gi)
      jsonExamples += countMatches(content, /```json/gi)
    }

    // Check for @example TSDoc tags
    const libFiles = ['src/lib/numerologia/calculos.ts', 'src/lib/astrologia/planet-calculator.ts']
    let tsdocExamples = 0

    for (const file of libFiles) {
      const content = readDocument(file)
      if (content) {
        tsdocExamples += countMatches(content, /@example/)
      }
    }

    // Score based on variety and quantity
    const hasTypescript = typescriptExamples > 0
    const hasBash = bashExamples > 0
    const hasJson = jsonExamples > 0
    const hasTsDocExamples = tsdocExamples > 0

    let varietyScore = 0
    if (hasTypescript) varietyScore += 25
    if (hasBash) varietyScore += 20
    if (hasJson) varietyScore += 20
    if (hasTsDocExamples) varietyScore += 15
    varietyScore += Math.min(totalCodeBlocks * 3, 20)

    const score = Math.min(varietyScore, 100)

    const status = score >= 75 ? 'pass' : score >= 40 ? 'warning' : 'fail'
    const severity = score >= 75 ? MetricSeverity.LOW : score >= 40 ? MetricSeverity.MEDIUM : MetricSeverity.HIGH

    return builder
      .status(status)
      .score(score)
      .value(totalCodeBlocks)
      .threshold(75)
      .severity(severity)
      .message(`${totalCodeBlocks} code examples em ${docsFiles.length} arquivos`)
      .details({
        typescriptExamples,
        bashExamples,
        jsonExamples,
        tsdocExamples,
        hasTypescript,
        hasBash,
        hasJson,
        hasTsDocExamples,
      })
      .duration(Date.now() - startTime)
      .build()
  },
}

// ============================================================================
// 9. Inline Comments Eval
// ============================================================================

export const inlineCommentsEval: EvalDefinition = {
  id: 'documentation-inline-comments',
  name: 'Inline Comments (Complex Logic)',
  description: 'Verifica lógica complexa comentada adequadamente',
  category: MetricCategory.DOCUMENTATION,
  run: async () => {
    const startTime = Date.now()
    const builder = new MetricResultBuilder(
      'documentation-inline-comments',
      'Inline Comments (Complex Logic)',
      MetricCategory.DOCUMENTATION
    )

    // Check complex algorithm files
    const complexFiles = [
      'src/lib/numerologia/calculos.ts',
      'src/lib/astrologia/planet-calculator.ts',
      'src/lib/ai/oracle.ts',
      'src/lib/ritual/ritual-calendar.ts',
    ]

    let totalComplexFunctions = 0
    let documentedFunctions = 0
    const undocumentedFunctions: string[] = []

    for (const file of complexFiles) {
      const content = readDocument(file)
      if (!content) continue

      // Find functions
      const functionPattern = /(?:export\s+)?function\s+(\w+)|const\s+(\w+)\s*=\s*(?:async\s+)?\(/g
      const functions = content.match(functionPattern) || []

      for (const func of functions) {
        totalComplexFunctions++

        // Extract function name
        const nameMatch = func.match(/function\s+(\w+)|const\s+(\w+)/)
        const funcName = nameMatch ? (nameMatch[1] || nameMatch[2]) : 'unknown'

        // Check for preceding JSDoc or inline comments
        const funcIndex = content.indexOf(func)
        const precedingContent = content.slice(Math.max(0, funcIndex - 300), funcIndex)

        const hasJSDoc = /\/\*\*[\s\S]*?\*\//.test(precedingContent)
        const hasInlineComment = /\/\/\s*.{10,}/.test(precedingContent)

        if (hasJSDoc || hasInlineComment) {
          documentedFunctions++
        } else {
          // Only flag as undocumented if the function has complex indicators
          const funcContent = content.slice(funcIndex, funcIndex + 500)
          if (/\b(for|while|switch|if.*&&|\|\||recursiv|calcular|process|complex)/i.test(funcContent)) {
            undocumentedFunctions.push(`${file}:${funcName}`)
          }
        }
      }
    }

    const coverage = totalComplexFunctions > 0
      ? calculatePercentage(documentedFunctions, totalComplexFunctions)
      : 50

    const status = coverage >= 75 ? 'pass' : coverage >= 50 ? 'warning' : 'fail'
    const severity = coverage >= 75 ? MetricSeverity.LOW : coverage >= 50 ? MetricSeverity.MEDIUM : MetricSeverity.HIGH

    const messages: Record<string, string> = {
      pass: 'Funções complexas bem documentadas com comments',
      warning: 'Algumas funções complexas sem comments adequados',
      fail: 'Funções complexas sem documentação inline',
    }

    return builder
      .status(status)
      .score(coverage)
      .value(documentedFunctions)
      .threshold(75)
      .severity(severity)
      .message(messages[status])
      .details({
        totalFunctions: totalComplexFunctions,
        documentedFunctions,
        undocumentedCount: undocumentedFunctions.length,
        undocumentedFunctions: undocumentedFunctions.slice(0, 5),
      })
      .duration(Date.now() - startTime)
      .build()
  },
}

// ============================================================================
// 10. Version Documentation Eval
// ============================================================================

export const versionDocumentationEval: EvalDefinition = {
  id: 'documentation-version',
  name: 'Version Documentation (SemVer)',
  description: 'Verifica versionamento semântico seguido consistentemente',
  category: MetricCategory.DOCUMENTATION,
  run: async () => {
    const startTime = Date.now()
    const builder = new MetricResultBuilder(
      'documentation-version',
      'Version Documentation (SemVer)',
      MetricCategory.DOCUMENTATION
    )

    // Check package.json for version
    const packageContent = readDocument('package.json')
    if (!packageContent) {
      return builder
        .status('fail')
        .score(0)
        .value('not_found')
        .threshold(70)
        .severity(MetricSeverity.HIGH)
        .message('package.json não encontrado')
        .details({ found: false })
        .duration(Date.now() - startTime)
        .build()
    }

    // Extract version from package.json
    const versionMatch = packageContent.match(/"version":\s*"([^"]+)"/)
    const currentVersion = versionMatch ? versionMatch[1] : null

    if (!currentVersion) {
      return builder
        .status('fail')
        .score(0)
        .value('no_version')
        .threshold(70)
        .severity(MetricSeverity.HIGH)
        .message('Version não encontrada em package.json')
        .details({ found: false })
        .duration(Date.now() - startTime)
        .build()
    }

    // Validate SemVer format (major.minor.patch)
    const semverPattern = /^\d+\.\d+\.\d+$/
    const isValidSemver = semverPattern.test(currentVersion)

    // Check if CHANGELOG references the version
    const changelogContent = readDocument('docs/CHANGELOG.md') || ''
    const changelogHasVersion = changelogContent.includes(`[${currentVersion}]`)
    const changelogHasUnreleased = /\[unreleased\]/i.test(changelogContent)

    // Check for consistent versioning in docs
    const apiContent = readDocument('docs/API.md') || ''
    const apiHasVersionInfo = /v\d+\.\d+|version\s+\d+/i.test(apiContent)

    // Calculate score
    let score = 0
    if (isValidSemver) score += 40
    if (changelogHasVersion || changelogHasUnreleased) score += 35
    if (apiHasVersionInfo || !apiContent) score += 15
    if (changelogHasVersion) score += 10

    score = Math.min(score, 100)

    const status = score >= 70 ? 'pass' : score >= 40 ? 'warning' : 'fail'
    const severity = score >= 70 ? MetricSeverity.LOW : score >= 40 ? MetricSeverity.MEDIUM : MetricSeverity.HIGH

    return builder
      .status(status)
      .score(score)
      .value(1)
      .threshold(70)
      .severity(severity)
      .message(`Version ${currentVersion} ${isValidSemver ? 'válida' : 'inválida'} (SemVer)`)
      .details({
        currentVersion,
        semverFormat: isValidSemver,
        changelogUpdated: changelogHasVersion || changelogHasUnreleased,
        changelogHasVersion,
        changelogHasUnreleased,
      })
      .duration(Date.now() - startTime)
      .build()
  },
}

// ============================================================================
// Export All Documentation Evals
// ============================================================================

export const documentationEvals: EvalDefinition[] = [
  readmeQualityEval,
  apiDocumentationEval,
  typeDocumentationEval,
  changelogEval,
  contributingGuideEval,
  componentDocumentationEval,
  errorMessagesEval,
  examplesCoverageEval,
  inlineCommentsEval,
  versionDocumentationEval,
]

export default documentationEvals
