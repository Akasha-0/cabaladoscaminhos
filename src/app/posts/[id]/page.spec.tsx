/**
 * ════════════════════════════════════════════════════════════════════════════
 * W87-C — POST DETAIL PAGE SPEC (source-inspection)
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Verifies static contracts of the demo page (per W86-B precedent):
 *   - Uses 'use client' directive (required for Thread/Composer hydration)
 *   - Imports Thread and wires it with postId/viewerId/engine
 *   - Renders mobile-first layout (max-width 640)
 *   - Surfaces sacred terms intact in metadata (Axé, Candomblé, Caboclo,
 *     Orixá, Tarô, Cabala, Sefirá, Keter)
 *   - Defensive notFound() for unknown post ids
 *
 * Run: npx vitest run src/app/posts
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const cwd = process.cwd();
const pageSrc = readFileSync(
  resolve(cwd, 'src/app/posts/[id]/page.tsx'),
  'utf8',
);

describe('Post detail page (W87-C source contracts)', () => {
  it('is a client component', () => {
    expect(pageSrc).toMatch(/^'use client'/m);
  });

  it('imports the Thread component', () => {
    expect(pageSrc).toMatch(/from '@\/components\/comments\/Thread'/);
  });

  it('wires Thread with viewerId (LGPD is meaningful)', () => {
    expect(pageSrc).toMatch(/viewerId=/);
  });

  it('passes isFirstComment=true to the Thread (LGPD gate visible)', () => {
    expect(pageSrc).toMatch(/isFirstComment/);
  });

  it('uses mobile-first max-width (640)', () => {
    expect(pageSrc).toMatch(/maxWidth:\s*640/);
  });

  it('calls notFound() for unknown post ids', () => {
    expect(pageSrc).toMatch(/notFound\(\)/);
  });

  it('preserves sacred Candomblé terms verbatim', () => {
    expect(pageSrc).toContain('Candomblé');
    expect(pageSrc).toContain('Caboclo');
    expect(pageSrc).toContain('Axé');
  });

  it('preserves sacred Cabala / Tarô / Sefirá terms verbatim', () => {
    expect(pageSrc).toContain('Tarô');
    expect(pageSrc).toContain('Cabala');
    expect(pageSrc).toContain('Sefirá');
    expect(pageSrc).toContain('Keter');
  });

  it('uses useParams() from next/navigation (App Router)', () => {
    expect(pageSrc).toMatch(/useParams/);
    expect(pageSrc).toMatch(/from 'next\/navigation'/);
  });

  it('memoizes the engine so adapters are stable across re-renders', () => {
    expect(pageSrc).toMatch(/useMemo/);
  });
});
