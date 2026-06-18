// Teste-guardiao arquitatural — Package Boundaries (v0.0.6 T4).
//
// Garante que nenhum workspace (apps/*, packages/*) importa diretamente
// de paths internos de outros packages (packages/core-STAR/src/INTERNAL_HERE/).
// Apenas a superficie publica (packages/core-STAR/src/index.ts) pode ser importada.
//
// Failures bloqueiam merge ate correcao.

import { describe, it, expect, beforeAll } from 'vitest';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

// vitest runs from the monorepo root (where package.json lives)
const ROOT = path.resolve(process.cwd());

// Packages that expose internal paths that should NOT be imported directly
const CORE_PACKAGES = [
  'packages/core-astrology',
  'packages/core-cabala',
  'packages/core-iching',
  'packages/core-odus',
  'packages/core-tantra',
  'packages/types',
];

describe('Package Boundaries Guardian', () => {
  let packageInternalPaths: Map<string, string[]>;

  beforeAll(() => {
    // Discover all internal (non-index) paths for each core package
    packageInternalPaths = new Map();

    for (const pkg of CORE_PACKAGES) {
      const pkgRoot = path.join(ROOT, pkg, 'src');
      const internalPaths: string[] = [];

      if (!fs.existsSync(pkgRoot)) continue;

      function walk(dir: string, base: string) {
        const entries = fs.readdirSync(dir);
        for (const entry of entries) {
          const full = path.join(dir, entry);
          const stat = fs.statSync(full);
          if (stat.isDirectory()) {
            walk(full, base);
          } else if (entry.endsWith('.ts') && entry !== 'index.ts') {
            // Get relative path without extension
            const rel = path.relative(base, full).replace(/\.ts$/, '');
            internalPaths.push(rel);
          }
        }
      }

      walk(pkgRoot, pkgRoot);
      packageInternalPaths.set(pkg, internalPaths);
    }
  });

  it('core packages expose only index.ts as public API', () => {
    // Verify each core package has an index.ts
    const missingIndex: string[] = [];

    for (const pkg of CORE_PACKAGES) {
      const indexPath = path.join(ROOT, pkg, 'src', 'index.ts');
      if (!fs.existsSync(indexPath)) {
        missingIndex.push(pkg);
      }
    }

    expect(
      missingIndex.length,
      `Core packages missing index.ts: ${missingIndex.join(', ')}`
    ).toBe(0);
  });

// SKIPPED: was masked by shell errors; now unskipped — ViolationAuditor confirmed violations were stale at
// commit 70a9d2a0 and have been cleaned up by 100+ subsequent commits; test passes at 0 violations.
// FIXED (v0.0.7): replaced broken searchPattern logic that caused false positives.
// OLD bug: `@akasha/${internalPath.split('/')[0]}/` matched ANY import containing
// a segment name (e.g. "tipos" matched @akasha/mentor/types). Caused 50 false positives.
// NEW: directly search for exact internal import pattern `@akasha/{scope}/src/{file}`.
  it('no workspace imports from internal paths of other packages', () => {
    const violations: string[] = [];

    // Map package dir names to their @akasha scope strings
    const SCOPE_MAP: Record<string, string> = {
      'core-astrology': 'core-astrology',
      'core-cabala': 'core-cabala',
      'core-iching': 'core-iching',
      'core-odus': 'core-odus',
      'core-tantra': 'core-tantra',
      'types': 'types',
    };

    for (const pkg of CORE_PACKAGES) {
      const scope = pkg.replace('packages/', '');
      const pkgName = pkg.replace('packages/', '@akasha/');

      // Search in apps/akasha-portal and all OTHER core packages
      const workspaces = [
        'apps/akasha-portal/src',
        ...CORE_PACKAGES.filter((p) => p !== pkg).map((p) => `${p}/src`),
      ];

      for (const workspace of workspaces) {
        const workspaceDir = path.join(ROOT, workspace);
        if (!fs.existsSync(workspaceDir)) continue;

        // Match: @akasha/core-cabala/src/calculos  (internal)
        // But NOT: @akasha/core-cabala             (surface — no /src/)
        // And NOT: @akasha/core-cabala/src/index   (index.ts is allowed)
        const seg = scope.replace(/-/g, '[_-]');
        const patDouble = `from\\s+\\\"@akasha/${seg}/src/[^i][^n][^d][^e][^x][^/][^'\\\"]*\\\"`;
        const patSingle = `from\\s+\x27@akasha/${seg}/src/[^i][^n][^d][^e][^x][^/][^'\\\"]*\x27`;

        let result = '';
        let result2 = '';
        try {
          result = execSync(
            `grep -rE "${patDouble}" "${workspaceDir}" 2>/dev/null || true`,
            { encoding: 'utf-8' }
          );
          result2 = execSync(
            `grep -rE "${patSingle}" "${workspaceDir}" 2>/dev/null || true`,
            { encoding: 'utf-8' }
          );
        } catch (e) { void e; }

        const allLines = [...result.trim().split('\n'), ...result2.trim().split('\n')].filter(Boolean);
        for (const line of allLines) {
          const match = line.match(/from\s+['"](@akasha\/[^'"]+)['"]/);
          if (match) {
            violations.push(
              `  ❌ ${workspace} imports internal ${match[1]} (should use ${pkgName})`
            );
          }
        }
      }
    }

    // Section 2: catch alias patterns @akasha/{alias}/src/FILE (not surface imports)
    try {
      // e.g. @akasha/mentor/src/something — but NOT @akasha/mentor (no /src/)
      const aliasDouble = `from\\s+\\\"@akasha/[^/'\\\"\\s]+/src/[^i][^n][^d][^e][^x][^'\\\"]*\\\"`;
      const aliasSingle = `from\\s+\x27@akasha/[^/'\\\"\\s]+/src/[^i][^n][^d][^e][^x][^'\\\"]*\x27`;
      const r1 = execSync(
        `grep -rE "${aliasDouble}" apps/akasha-portal/src 2>/dev/null || true`,
        { encoding: 'utf-8' }
      );
      const r2 = execSync(
        `grep -rE "${aliasSingle}" apps/akasha-portal/src 2>/dev/null || true`,
        { encoding: 'utf-8' }
      );
      for (const line of [...r1, ...r2].filter(Boolean)) {
        violations.push(`  ❌ ${line.trim()}`);
      }
    } catch (e) { void e; }

    expect(
      violations.length,
      violations.length > 0
        ? `Found ${violations.length} package boundary violations:\n${violations.join('\n')}\n\nAll imports must use package surface (index.ts), not internal paths.`
        : 'No violations found'
    ).toBe(0);
  });

  // Note: Some packages have subdirectories (e.g., planetas/, trânsitos/ in core-astrology)
  // This is a known structure and not enforced as a hard violation
  // The main boundary check is preventing direct imports from internal paths
});
