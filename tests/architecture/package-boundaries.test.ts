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

// vitest runs from apps/akasha-portal, so we need to go up to monorepo root
const ROOT = path.resolve(process.cwd(), '../..');

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

  it('no workspace imports from internal paths of other packages', () => {
    const violations: string[] = [];

    // Check each core package
    for (const [pkg, internalPaths] of packageInternalPaths) {
      if (internalPaths.length === 0) continue;

      const pkgName = pkg.replace('packages/', '@akasha/');

      for (const internalPath of internalPaths) {
        // Skip if path has no files
        const fullPath = path.join(ROOT, pkg, 'src', internalPath + '.ts');
        if (!fs.existsSync(fullPath)) continue;

        // Search all workspaces for imports of this internal path
        const searchPattern = `@akasha/${internalPath.split('/')[0]}/`;

        // Only search in packages/apps (not the source package itself)
        const workspaces = [
          'apps/akasha-portal/src',
          ...CORE_PACKAGES.filter((p) => p !== pkg).map((p) => `${p}/src`),
        ];

        for (const workspace of workspaces) {
          const workspaceDir = path.join(ROOT, workspace);
          if (!fs.existsSync(workspaceDir)) continue;

          try {
            const result = execSync(
              `grep -rE "from\\s+['\"]@akasha/[^'\"]*${internalPath.split('/')[0]}[^'\"]*['\"]" "${workspaceDir}" 2>/dev/null | grep -v "index.ts" || true`,
              { encoding: 'utf-8' }
            );

            const lines = result.trim().split('\n').filter(Boolean);
            for (const line of lines) {
              // Extract the file being imported from
              const match = line.match(/from\s+['"](@akasha\/[^'"]+)['"]/);
              if (match) {
                const imported = match[1];
                // Check if it is NOT index.ts (internal import)
                if (!imported.endsWith('/index') && !imported.endsWith('/index.ts')) {
                  violations.push(
                    `  ❌ ${workspace} imports internal ${imported} (should use ${pkgName}/src/index.ts)`
                  );
                }
              }
            }
          } catch {
            // No matches found
          }
        }
      }
    }

    // Also check that apps dont import directly from packages/core-STAR/src/FILE
    // They should use the @akasha/* alias pointing to index.ts
    try {
      const directSrcResult = execSync(
        `grep -rE "from\\s+['\"][^'\"]*packages/(core-[^/]+)/src/[^index][^'\"]*['\"]" apps/akasha-portal/src 2>/dev/null | grep -v "index.ts" || true`,
        { encoding: 'utf-8' }
      );

      const directLines = directSrcResult.trim().split('\n').filter(Boolean);
      for (const line of directLines) {
        violations.push(`  ❌ Direct src/ import found: ${line.trim()}`);
      }
    } catch {
      // No matches
    }

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
