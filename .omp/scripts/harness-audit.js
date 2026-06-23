#!/usr/bin/env node
/**
 * harness-audit.js — Deterministic ECC harness audit (rubric 2026-05-19).
 *
 * Usage:
 *   node .omp/scripts/harness-audit.js [scope] [--format text|json] [--root <path>]
 *
 * Scopes: repo (default) | hooks | skills | commands | agents
 *   - repo: runs all applicable categories
 *   - hooks/skills/commands/agents: filters the output to that subarea
 *
 * Up to 12 fixed categories (0-10 normalized each). Only applicable categories
 * contribute to max_score; the script auto-detects deploy markers (vercel.json,
 * netlify.toml, wrangler.toml, wrangler.jsonc, fly.toml) and excludes the rest.
 *
 * The first 7 categories are always applicable.
 * Category 8 (GitHub Integration) is always applicable.
 * Categories 9-12 (Vercel/Netlify/Cloudflare/Fly) are applicable only when the
 * corresponding marker is detected.
 */
'use strict';

const fs = require('fs');
const path = require('path');

// ---------- args ----------
function parseArgs(argv) {
 const args = { scope: 'repo', format: 'text', root: process.cwd() };
 const positional = [];
 for (let i = 2; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--format' && argv[i + 1]) { args.format = argv[++i]; continue; }
  if (a === '--root' && argv[i + 1]) { args.root = argv[++i]; continue; }
  if (a.startsWith('--')) { continue; }
  positional.push(a);
 }
 if (positional[0]) args.scope = positional[0];
 if (!['repo', 'hooks', 'skills', 'commands', 'agents'].includes(args.scope)) {
  throw new Error(`Invalid scope: ${args.scope}`);
 }
 if (!['text', 'json'].includes(args.format)) {
  throw new Error(`Invalid format: ${args.format}`);
 }
 args.root = path.resolve(args.root);
 return args;
}

// ---------- fs helpers ----------
const exists = (p) => { try { fs.accessSync(p); return true; } catch { return false; } };
const isDir = (p) => { try { return fs.statSync(p).isDirectory(); } catch { return false; } };
const isFile = (p) => { try { return fs.statSync(p).isFile(); } catch { return false; } };
const read = (p) => { try { return fs.readFileSync(p, 'utf8'); } catch { return ''; } };
const listDir = (p) => { try { return fs.readdirSync(p); } catch { return []; } };

function findFiles(root, glob) {
 // very small recursive matcher: dir, **, *.ext
 const segs = glob.split('/').filter(Boolean);
 const out = [];
 function walk(dir, i) {
  if (i === segs.length) { out.push(dir); return; }
  const seg = segs[i];
  if (seg === '**') {
   for (const entry of listDir(dir)) {
    const child = path.join(dir, entry);
    if (isDir(child)) walk(child, i);
    else if (i + 1 === segs.length && matchEntry(entry, segs[i + 1])) out.push(child);
   }
   return;
  }
  const target = path.join(dir, seg);
  if (seg.includes('*')) {
   const rx = new RegExp('^' + seg.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$');
   for (const entry of listDir(dir)) {
    const child = path.join(dir, entry);
    if (rx.test(entry)) {
     if (i + 1 === segs.length || (i + 1 === segs.length - 1 && segs[i + 1] === '**')) out.push(child);
     else if (isDir(child)) walk(child, i + 1);
    }
   }
   return;
  }
  if (!exists(target)) return;
  if (i + 1 === segs.length) { out.push(target); return; }
  if (isDir(target)) walk(target, i + 1);
 }
 function matchEntry(name, pat) {
  if (!pat) return true;
  const rx = new RegExp('^' + pat.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$');
  return rx.test(name);
 }
 if (exists(root)) walk(root, 0);
 return out;
}

function searchInFile(filePath, needle) {
 const content = read(filePath);
 return content.includes(needle);
}

// ---------- category checks ----------
// Each check returns { ok, points, max, message, evidence? }
function checkToolCoverage(root) {
 const checks = [];
 // 1. omp agents exist (>=3)
 const agents = listDir(path.join(root, '.omp/agents')).filter(f => f.endsWith('.md'));
 const agentsCount = agents.length;
 checks.push({
  name: 'omp_agents_present',
  ok: agentsCount >= 3,
  points: agentsCount >= 3 ? 4 : Math.min(agentsCount, 4),
  max: 4,
  message: agentsCount >= 3
   ? `${agentsCount} agents defined in .omp/agents/`
   : `Only ${agentsCount} agents in .omp/agents/ (need >=3)`,
  evidence: agents.map(f => `.omp/agents/${f}`),
 });
 // 2. omp rules (TTSR) exist (>=1)
 const rules = listDir(path.join(root, '.omp/rules')).filter(f => f.endsWith('.md'));
 const rulesCount = rules.length;
 checks.push({
  name: 'omp_ttsr_rules_present',
  ok: rulesCount >= 1,
  points: rulesCount >= 1 ? 3 : 0,
  max: 3,
  message: rulesCount >= 1
   ? `${rulesCount} TTSR rules in .omp/rules/`
   : 'No TTSR rules in .omp/rules/',
  evidence: rules.map(f => `.omp/rules/${f}`),
 });
 // 3. Skills present (>=1)
 const skillsDirs = [
  path.join(root, '.omp/skills'),
  path.join(root, '.autonomous/skills'),
 ];
 let skillsCount = 0;
 for (const d of skillsDirs) {
  if (!isDir(d)) continue;
  skillsCount += listDir(d).filter(f => isDir(path.join(d, f))).length;
 }
 checks.push({
  name: 'skills_present',
  ok: skillsCount >= 1,
  points: skillsCount >= 1 ? 3 : 0,
  max: 3,
  message: skillsCount >= 1
   ? `${skillsCount} skills available`
   : 'No skills in .omp/skills/ or .autonomous/skills/',
 });
 return scoreFromChecks('Tool Coverage', checks);
}

function checkContextEfficiency(root) {
 const checks = [];
 // 1. codegraph-first TTSR
 const codegraphRule = path.join(root, '.omp/rules/codegraph-first.md');
 checks.push({
  name: 'codegraph_first_rule',
  ok: isFile(codegraphRule),
  points: isFile(codegraphRule) ? 4 : 0,
  max: 4,
  message: isFile(codegraphRule) ? 'codegraph-first rule present' : 'Missing .omp/rules/codegraph-first.md',
  evidence: isFile(codegraphRule) ? ['.omp/rules/codegraph-first.md'] : [],
 });
 // 2. headroom-first TTSR
 const headroomRule = path.join(root, '.omp/rules/headroom-first.md');
 checks.push({
  name: 'headroom_first_rule',
  ok: isFile(headroomRule),
  points: isFile(headroomRule) ? 3 : 0,
  max: 3,
  message: isFile(headroomRule) ? 'headroom-first rule present' : 'Missing .omp/rules/headroom-first.md',
  evidence: isFile(headroomRule) ? ['.omp/rules/headroom-first.md'] : [],
 });
 // 3. codegraph index present
 const codegraphDb = path.join(root, '.codegraph/codegraph.db');
 checks.push({
  name: 'codegraph_index_present',
  ok: isFile(codegraphDb),
  points: isFile(codegraphDb) ? 3 : 0,
  max: 3,
  message: isFile(codegraphDb) ? 'CodeGraph SQLite index present' : 'Missing .codegraph/codegraph.db',
  evidence: isFile(codegraphDb) ? ['.codegraph/codegraph.db'] : [],
 });
 return scoreFromChecks('Context Efficiency', checks);
}

function checkQualityGates(root) {
 const checks = [];
 // 1. vitest config
 const vitest = path.join(root, 'vitest.config.ts');
 checks.push({
  name: 'vitest_config',
  ok: isFile(vitest),
  points: isFile(vitest) ? 3 : 0,
  max: 3,
  message: isFile(vitest) ? 'vitest.config.ts present' : 'Missing vitest.config.ts',
  evidence: isFile(vitest) ? ['vitest.config.ts'] : [],
 });
 // 2. tests/ directory
 const testsDir = path.join(root, 'tests');
 checks.push({
  name: 'tests_directory',
  ok: isDir(testsDir),
  points: isDir(testsDir) ? 3 : 0,
  max: 3,
  message: isDir(testsDir) ? 'tests/ directory present' : 'Missing tests/ directory',
  evidence: isDir(testsDir) ? ['tests/'] : [],
 });
 // 3. CI workflow runs tests
 const ciFiles = findFiles(root, '.github/workflows/*.yml').concat(findFiles(root, '.github/workflows/*.yaml'));
 let ciRunsTests = false;
 for (const f of ciFiles) {
  const c = read(f);
  if (/test|vitest|jest|playwright/i.test(c)) { ciRunsTests = true; break; }
 }
 checks.push({
  name: 'ci_runs_tests',
  ok: ciRunsTests,
  points: ciRunsTests ? 4 : 0,
  max: 4,
  message: ciRunsTests ? 'CI runs tests' : 'No workflow runs tests',
  evidence: ciFiles.filter(f => /test|vitest|jest|playwright/i.test(read(f))),
 });
 return scoreFromChecks('Quality Gates', checks);
}

function checkMemoryPersistence(root) {
 const checks = [];
 // 1. lessons/ directory with INDEX.md
 const lessonsDir = path.join(root, '.autonomous/lessons');
 const indexFile = path.join(lessonsDir, 'INDEX.md');
 checks.push({
  name: 'lessons_index',
  ok: isFile(indexFile),
  points: isFile(indexFile) ? 4 : 0,
  max: 4,
  message: isFile(indexFile) ? 'lessons/INDEX.md present' : 'Missing .autonomous/lessons/INDEX.md',
  evidence: isFile(indexFile) ? ['.autonomous/lessons/INDEX.md'] : [],
 });
 // 2. SPEC.md present
 const specFile = path.join(root, 'SPEC.md');
 checks.push({
  name: 'spec_present',
  ok: isFile(specFile),
  points: isFile(specFile) ? 3 : 0,
  max: 3,
  message: isFile(specFile) ? 'SPEC.md present' : 'Missing SPEC.md',
  evidence: isFile(specFile) ? ['SPEC.md'] : [],
 });
 // 3. AGENTS.md present (DOX rail)
 const agentsMd = path.join(root, 'AGENTS.md');
 checks.push({
  name: 'agents_md_root',
  ok: isFile(agentsMd),
  points: isFile(agentsMd) ? 3 : 0,
  max: 3,
  message: isFile(agentsMd) ? 'AGENTS.md present (DOX rail)' : 'Missing AGENTS.md',
  evidence: isFile(agentsMd) ? ['AGENTS.md'] : [],
 });
 return scoreFromChecks('Memory Persistence', checks);
}

function checkEvalCoverage(root) {
 const checks = [];
 // 1. tests/api present
 const apiTests = path.join(root, 'tests/api');
 const apiHas = isDir(apiTests) && listDir(apiTests).some(f => f.endsWith('.test.ts') || f.endsWith('.test.tsx'));
 checks.push({
  name: 'api_tests',
  ok: apiHas,
  points: apiHas ? 4 : 0,
  max: 4,
  message: apiHas ? 'API tests present' : 'Missing tests/api/ tests',
  evidence: apiHas ? ['tests/api/'] : [],
 });
 // 2. e2e tests present
 const e2e = path.join(root, 'tests/e2e');
 const e2eHas = isDir(e2e) && listDir(e2e).some(f => f.endsWith('.test.ts') || f.endsWith('.test.tsx'));
 checks.push({
  name: 'e2e_tests',
  ok: e2eHas,
  points: e2eHas ? 3 : 0,
  max: 3,
  message: e2eHas ? 'E2E tests present' : 'Missing tests/e2e/ tests',
  evidence: e2eHas ? ['tests/e2e/'] : [],
 });
 // 3. Coverage threshold in vitest config
 const vitest = read(path.join(root, 'vitest.config.ts'));
 const hasThreshold = /coverageThreshold|coverage:\s*\{/i.test(vitest);
 checks.push({
  name: 'coverage_threshold',
  ok: hasThreshold,
  points: hasThreshold ? 3 : 0,
  max: 3,
  message: hasThreshold ? 'Coverage threshold configured' : 'No coverage threshold in vitest.config.ts',
 });
 return scoreFromChecks('Eval Coverage', checks);
}

function checkSecurityGuardrails(root) {
 const checks = [];
 // 1. pre-hooks present
 const preHooksDir = path.join(root, '.omp/hooks/pre');
 let preHookCount = 0;
 if (isDir(preHooksDir)) {
  preHookCount = listDir(preHooksDir).filter(f => f.endsWith('.ts') || f.endsWith('.sh')).length;
 }
 checks.push({
  name: 'pre_hooks',
  ok: preHookCount >= 1,
  points: preHookCount >= 1 ? 4 : 0,
  max: 4,
  message: preHookCount >= 1
   ? `${preHookCount} pre-hooks in .omp/hooks/pre/`
   : 'No pre-hooks in .omp/hooks/pre/',
  evidence: preHookCount >= 1 ? listDir(preHooksDir).map(f => `.omp/hooks/pre/${f}`) : [],
 });
 // 2. no-parallel-versions TTSR (anti-bloat)
 const noParallel = path.join(root, '.omp/rules/no-parallel-versions.md');
 checks.push({
  name: 'no_parallel_versions_rule',
  ok: isFile(noParallel),
  points: isFile(noParallel) ? 3 : 0,
  max: 3,
  message: isFile(noParallel) ? 'no-parallel-versions rule present' : 'Missing .omp/rules/no-parallel-versions.md',
  evidence: isFile(noParallel) ? ['.omp/rules/no-parallel-versions.md'] : [],
 });
 // 3. migration-approval TTSR
 const migrationRule = path.join(root, '.omp/rules/migration-approval.md');
 checks.push({
  name: 'migration_approval_rule',
  ok: isFile(migrationRule),
  points: isFile(migrationRule) ? 3 : 0,
  max: 3,
  message: isFile(migrationRule) ? 'migration-approval rule present' : 'Missing .omp/rules/migration-approval.md',
  evidence: isFile(migrationRule) ? ['.omp/rules/migration-approval.md'] : [],
 });
 return scoreFromChecks('Security Guardrails', checks);
}

function checkCostEfficiency(root) {
 const checks = [];
 // 1. headroom proxy integration
 const headroomRule = path.join(root, '.omp/rules/headroom-first.md');
 checks.push({
  name: 'headroom_integration',
  ok: isFile(headroomRule),
  points: isFile(headroomRule) ? 4 : 0,
  max: 4,
  message: isFile(headroomRule) ? 'Headroom integration rule present' : 'Missing .omp/rules/headroom-first.md',
  evidence: isFile(headroomRule) ? ['.omp/rules/headroom-first.md'] : [],
 });
 // 2. .env has ANTHROPIC_BASE_URL pointing to headroom
 const envContent = read(path.join(root, '.env'));
 const routesHeadroom = /ANTHROPIC_BASE_URL\s*=\s*["']?http:\/\/(?:127\.0\.0\.1|localhost):8787/i.test(envContent);
 checks.push({
  name: 'env_routes_headroom',
  ok: routesHeadroom,
  points: routesHeadroom ? 3 : 0,
  max: 3,
  message: routesHeadroom
   ? '.env routes ANTHROPIC_BASE_URL to Headroom'
   : '.env does not route ANTHROPIC_BASE_URL to Headroom (port 8787)',
  evidence: routesHeadroom ? ['.env'] : [],
 });
 // 3. minimal defaultThinkingLevel not auto-loop
 const ompConfig = read(path.join(root, '.omp/config.yml'));
 const thinkingOk = /defaultThinkingLevel|thinkingBudgets/i.test(ompConfig);
 checks.push({
  name: 'thinking_budget_configured',
  ok: thinkingOk,
  points: thinkingOk ? 3 : 0,
  max: 3,
  message: thinkingOk ? 'Thinking budget configured' : 'No thinking budget in .omp/config.yml',
  evidence: thinkingOk ? ['.omp/config.yml'] : [],
 });
 return scoreFromChecks('Cost Efficiency', checks);
}

function checkGithubIntegration(root) {
 const checks = [];
 // 1. workflows present
 const wfDir = path.join(root, '.github/workflows');
 const wf = isDir(wfDir) ? listDir(wfDir).filter(f => /\.(yml|yaml)$/i.test(f)) : [];
 checks.push({
  name: 'github_workflows',
  ok: wf.length >= 1,
  points: wf.length >= 1 ? 4 : 0,
  max: 4,
  message: wf.length >= 1 ? `${wf.length} workflows` : 'No workflows in .github/workflows/',
  evidence: wf.map(f => `.github/workflows/${f}`),
 });
 // 2. dependabot
 const dependabot = path.join(root, '.github/dependabot.yml');
 checks.push({
  name: 'dependabot',
  ok: isFile(dependabot),
  points: isFile(dependabot) ? 3 : 0,
  max: 3,
  message: isFile(dependabot) ? 'Dependabot configured' : 'Missing .github/dependabot.yml',
  evidence: isFile(dependabot) ? ['.github/dependabot.yml'] : [],
 });
 // 3. CODEOWNERS
 const codeowners = path.join(root, '.github/CODEOWNERS');
 checks.push({
  name: 'codeowners',
  ok: isFile(codeowners),
  points: isFile(codeowners) ? 3 : 0,
  max: 3,
  message: isFile(codeowners) ? 'CODEOWNERS present' : 'Missing .github/CODEOWNERS',
  evidence: isFile(codeowners) ? ['.github/CODEOWNERS'] : [],
 });
 return scoreFromChecks('GitHub Integration', checks);
}

function checkVercelIntegration(root) {
 const checks = [];
 const vercelJson = path.join(root, 'vercel.json');
 const vercelDir = path.join(root, '.vercel');
 const hasVercel = isFile(vercelJson) || isDir(vercelDir);
 // 1. vercel.json or .vercel/ present
 checks.push({
  name: 'vercel_config',
  ok: hasVercel,
  points: hasVercel ? 4 : 0,
  max: 4,
  message: hasVercel ? 'Vercel config present' : 'Missing vercel.json or .vercel/',
  evidence: hasVercel ? (isFile(vercelJson) ? ['vercel.json'] : ['.vercel/']) : [],
 });
 // 2. cron jobs in vercel.json
 let hasCron = false;
 if (isFile(vercelJson)) {
  const c = read(vercelJson);
  hasCron = /"crons"\s*:/i.test(c);
 }
 checks.push({
  name: 'vercel_crons',
  ok: hasCron,
  points: hasCron ? 3 : 0,
  max: 3,
  message: hasCron ? 'Vercel crons configured' : 'No crons in vercel.json',
 });
 // 3. deploy workflow references vercel
 const wfDir = path.join(root, '.github/workflows');
 let deployOk = false;
 if (isDir(wfDir)) {
  for (const f of listDir(wfDir)) {
   if (!/\.(yml|yaml)$/i.test(f)) continue;
   const c = read(path.join(wfDir, f));
   if (/vercel/i.test(c) && /deploy/i.test(c)) { deployOk = true; break; }
  }
 }
 checks.push({
  name: 'vercel_deploy_workflow',
  ok: deployOk,
  points: deployOk ? 3 : 0,
  max: 3,
  message: deployOk ? 'Vercel deploy workflow present' : 'No Vercel deploy workflow in .github/workflows/',
  evidence: deployOk ? ['.github/workflows/'] : [],
 });
 return scoreFromChecks('Vercel Integration', checks);
}

function checkNetlifyIntegration(root) {
 const checks = [];
 const netlifyToml = path.join(root, 'netlify.toml');
 const netlifyDir = path.join(root, '.netlify');
 const has = isFile(netlifyToml) || isDir(netlifyDir);
 checks.push({ name: 'netlify_config', ok: has, points: has ? 10 : 0, max: 10, message: has ? 'Netlify config present' : 'Missing netlify.toml or .netlify/' });
 return scoreFromChecks('Netlify Integration', checks);
}

function checkCloudflareIntegration(root) {
 const checks = [];
 const has = isFile(path.join(root, 'wrangler.toml')) || isFile(path.join(root, 'wrangler.jsonc'));
 checks.push({ name: 'cloudflare_config', ok: has, points: has ? 10 : 0, max: 10, message: has ? 'Cloudflare wrangler present' : 'Missing wrangler.toml or wrangler.jsonc' });
 return scoreFromChecks('Cloudflare Integration', checks);
}

function checkFlyIntegration(root) {
 const checks = [];
 const has = isFile(path.join(root, 'fly.toml'));
 checks.push({ name: 'fly_config', ok: has, points: has ? 10 : 0, max: 10, message: has ? 'fly.toml present' : 'Missing fly.toml' });
 return scoreFromChecks('Fly Integration', checks);
}

function scoreFromChecks(name, checks) {
 const total = checks.reduce((a, c) => a + c.points, 0);
 const max = checks.reduce((a, c) => a + c.max, 0);
 const score = max > 0 ? Math.round((total / max) * 10 * 100) / 100 : 0;
 return { name, score, max_points: max, earned: total, checks };
}

function detectDeployMarkers(root) {
 return {
  vercel: isFile(path.join(root, 'vercel.json')) || isDir(path.join(root, '.vercel')),
  netlify: isFile(path.join(root, 'netlify.toml')) || isDir(path.join(root, '.netlify')),
  cloudflare: isFile(path.join(root, 'wrangler.toml')) || isFile(path.join(root, 'wrangler.jsonc')),
  fly: isFile(path.join(root, 'fly.toml')),
 };
}

function topActions(categories) {
 const failed = [];
 for (const cat of categories) {
  for (const c of cat.checks) {
   if (!c.ok) failed.push({ category: cat.name, check: c });
  }
 }
 // Sort by max points descending
 failed.sort((a, b) => b.check.max - a.check.max);
 return failed.slice(0, 3).map(f => `[${f.category}] ${f.check.message}${f.evidence && f.evidence.length ? ` (${f.evidence[0]})` : ''}`);
}

function suggestSkills(categories) {
 const suggestions = [];
 const has = (name) => categories.find(c => c.name === name);
 if (has('Context Efficiency') && has('Context Efficiency').score < 8) {
  suggestions.push('search-first');
  suggestions.push('iterative-retrieval');
 }
 if (has('Cost Efficiency') && has('Cost Efficiency').score < 8) {
  suggestions.push('cost-aware-llm-pipeline');
 }
 if (has('Security Guardrails') && has('Security Guardrails').score < 8) {
  suggestions.push('security-review');
  suggestions.push('safety-guard');
 }
 if (has('Memory Persistence') && has('Memory Persistence').score < 8) {
  suggestions.push('knowledge-ops');
 }
 if (has('Eval Coverage') && has('Eval Coverage').score < 8) {
  suggestions.push('agent-eval');
 }
 return suggestions;
}

function runAudit(args) {
 const root = args.root;
 const markers = detectDeployMarkers(root);

 // Always applicable
 const categories = [
  checkToolCoverage(root),
  checkContextEfficiency(root),
  checkQualityGates(root),
  checkMemoryPersistence(root),
  checkEvalCoverage(root),
  checkSecurityGuardrails(root),
  checkCostEfficiency(root),
  checkGithubIntegration(root),
 ];
 if (markers.vercel) categories.push(checkVercelIntegration(root));
 if (markers.netlify) categories.push(checkNetlifyIntegration(root));
 if (markers.cloudflare) categories.push(checkCloudflareIntegration(root));
 if (markers.fly) categories.push(checkFlyIntegration(root));

 // Filter by scope
 const SCOPE_MAP = {
  hooks: ['Security Guardrails'],
  skills: ['Tool Coverage'],
  commands: ['Tool Coverage'],
  agents: ['Tool Coverage'],
 };
 const filtered = (SCOPE_MAP[args.scope] || null)
  ? categories.filter(c => SCOPE_MAP[args.scope].includes(c.name))
  : categories;

 const overall = filtered.reduce((a, c) => a + c.earned, 0);
 const maxScore = filtered.reduce((a, c) => a + c.max_points, 0);

 const result = {
  overall_score: overall,
  max_score: maxScore,
  applicable_categories: filtered.map(c => c.name),
  category_count: filtered.length,
  deploy_markers: markers,
  categories: filtered,
  top_actions: topActions(filtered),
  suggested_skills: suggestSkills(filtered),
  scope: args.scope,
  root,
  rubric_version: '2026-05-19',
 };
 return result;
}

function formatText(r) {
 const lines = [];
 lines.push(`Harness Audit (${r.scope}, ${r.root}): ${r.overall_score}/${r.max_score}`);
 for (const c of r.categories) {
  lines.push(`- ${c.name}: ${c.score}/10 (${c.earned}/${c.max_points} pts)`);
  for (const ch of c.checks) {
   const mark = ch.ok ? '[OK]' : '[!!]';
   const tail = ch.evidence && ch.evidence.length ? ` -> ${ch.evidence.join(', ')}` : '';
   lines.push(`    ${mark} ${ch.name}: ${ch.message}${tail}`);
  }
 }
 if (r.top_actions.length) {
  lines.push('');
  lines.push('Top Actions:');
  r.top_actions.forEach((a, i) => lines.push(`  ${i + 1}) ${a}`));
 }
 if (r.suggested_skills.length) {
  lines.push('');
  lines.push('Suggested ECC skills:');
  r.suggested_skills.forEach(s => lines.push(`  - ${s}`));
 }
 return lines.join('\n');
}

function main() {
 let args;
 try { args = parseArgs(process.argv); }
 catch (e) { console.error(`Error: ${e.message}`); process.exit(1); }
 const result = runAudit(args);
 if (args.format === 'json') {
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
 } else {
  process.stdout.write(formatText(result) + '\n');
 }
}

if (require.main === module) main();
module.exports = { runAudit, parseArgs, detectDeployMarkers };
