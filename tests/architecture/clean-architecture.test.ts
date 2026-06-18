/**
 * Teste-guardião arquitetural — Clean Architecture (v0.0.6 T4).
 *
 * Garante que a camada domain (src/lib/domain/) não importa concerns
 * de infraestrutura (Next.js, Prisma, Supabase, pg, ioredis, process.env).
 * Violações indicam violação da dependency rule da Clean Architecture.
 *
 * Failures bloqueiam merge até correção.
 */

import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';
import path from 'path';

// vitest runs from apps/akasha-portal, so we need to go up to monorepo root
const ROOT = path.resolve(process.cwd(), '../..');

// Padrões proibidos: imports que atravessam a fronteira domain → infrastructure
const PROHIBITED_PATTERNS = [
  // Next.js internals
  'next/',
  // Database / ORM
  '@prisma/',
  '@supabase/',
  'pg',
  // Cache
  'ioredis',
  // Direct env access (should be abstracted)
  'process\\.env',
];

describe('Clean Architecture Guardian', () => {
  describe('domain layer isolation', () => {
    it('src/lib/domain/ must not import infrastructure concerns', () => {
      const domainDir = path.join(ROOT, 'apps/akasha-portal/src/lib/domain');

      // Skip if domain directory doesn't exist yet (pre-refactoring)
      const { existsSync } = require('fs');
      if (!existsSync(domainDir)) {
        console.log('⚠️  domain/ directory not found — skipping (pre-refactoring state)');
        expect(true).toBe(true);
        return;
      }

      // Build grep pattern
      const patternPart = PROHIBITED_PATTERNS
        .map((p) => p.replace('/', '\\/'))
        .join('|');

      // Pattern: import from prohibited packages OR direct process.env access
      const grepPattern = `(from\\s+['"][^'"]*(${patternPart})[/'"])|(process\\.env)`;

      let result = '';
      try {
        result = execSync(
          `grep -rE '${grepPattern}' "${domainDir}" 2>/dev/null || true`,
          { encoding: 'utf-8' }
        );
      } catch {
        // grep returns non-zero when no matches
        result = '';
      }

      const violations = result
        .trim()
        .split('\n')
        .filter(Boolean)
        .map((line) => {
          // Colorize for visibility
          return `  ❌ ${line}`;
        });

      expect(
        violations.length,
        violations.length > 0
          ? `Found ${violations.length} Clean Architecture violations:\n${violations.join('\n')}\n\nDomain layer must not import infrastructure concerns (next/, @prisma/, @supabase/, pg, ioredis, process.env)`
          : 'No violations found'
      ).toBe(0);
    });

    it('domain layer must not import application layer', () => {
      const domainDir = path.join(ROOT, 'apps/akasha-portal/src/lib/domain');

      const { existsSync } = require('fs');
      if (!existsSync(domainDir)) {
        console.log('⚠️  domain/ directory not found — skipping (pre-refactoring state)');
        expect(true).toBe(true);
        return;
      }

      let result = '';
      try {
        result = execSync(
          `grep -rE "from\\s+['\"][^'\"]*@/lib/(application|infrastructure|interface)" "${domainDir}" 2>/dev/null || true`,
          { encoding: 'utf-8' }
        );
      } catch {
        result = '';
      }

      const violations = result
        .trim()
        .split('\n')
        .filter(Boolean)
        .map((line) => `  ❌ ${line}`);

      expect(
        violations.length,
        violations.length > 0
          ? `Found ${violations.length} domain→application/infrastructure violations:\n${violations.join('\n')}\n\nDomain must not import outer layers (dependency rule)`
          : 'No violations found'
      ).toBe(0);
    });

    it('domain layer must not import interface layer (adapters)', () => {
      const domainDir = path.join(ROOT, 'apps/akasha-portal/src/lib/domain');

      const { existsSync } = require('fs');
      if (!existsSync(domainDir)) {
        console.log('⚠️  domain/ directory not found — skipping (pre-refactoring state)');
        expect(true).toBe(true);
        return;
      }

      let result = '';
      try {
        result = execSync(
          `grep -rE "from\\s+['\"][^'\"]*@/lib/interface" "${domainDir}" 2>/dev/null || true`,
          { encoding: 'utf-8' }
        );
      } catch {
        result = '';
      }

      const violations = result
        .trim()
        .split('\n')
        .filter(Boolean)
        .map((line) => `  ❌ ${line}`);

      expect(
        violations.length,
        violations.length > 0
          ? `Found ${violations.length} domain→interface violations:\n${violations.join('\n')}\n\nDomain must not import interface/adapters`
          : 'No violations found'
      ).toBe(0);
    });
  });
});
