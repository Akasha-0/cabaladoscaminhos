/**
 * LiteraturePapersAdapter — Wave 28.6
 *
 * Testa (a-h) o adapter que serve o Knowledge Browser. Sem dependência
 * de Prisma (mock determinístico, mesmo padrão dos adapters Wave
 * 23.2/27.3/28.2).
 *
 * Cobertura:
 *   (a) Retorna papers para qualquer filtro vazio.
 *   (b) Filtro year funciona (Number match exato).
 *   (c) Filtro pilar funciona.
 *   (d) Filtro journal funciona (case-insensitive).
 *   (e) Filtro hasPractice funciona (true/false).
 *   (f) Filtros combinados aplicam interseção (AND).
 *   (g) citationCount determinístico (mesmo paperId → mesmo count).
 *   (h) abstractPtBr preferencial em pt-BR; fallback em en.
 *   (i) loadLiteratureFacets retorna years/pillars/jords/total únicos.
 *   (j) LGPD: nenhum PII em qualquer campo.
 */

import { describe, it, expect } from 'vitest';

import {
  loadLiteraturePapers,
  loadLiteratureFacets,
} from '../LiteraturePapersAdapter';

describe('LiteraturePapersAdapter — Wave 28.6', () => {
  it('(a) retorna papers sem filtros (default = todos)', async () => {
    const papers = await loadLiteraturePapers({ filters: {}, locale: 'pt-BR' });
    expect(papers.length).toBeGreaterThan(10);
  });

  it('(b) filtro year funciona (match exato)', async () => {
    const papers = await loadLiteraturePapers({
      filters: { year: 2021 },
      locale: 'pt-BR',
    });
    expect(papers.length).toBeGreaterThan(0);
    for (const p of papers) expect(p.year).toBe(2021);
  });

  it('(c) filtro pilar funciona', async () => {
    const papers = await loadLiteraturePapers({
      filters: { pilar: 'tantrica' },
      locale: 'pt-BR',
    });
    expect(papers.length).toBeGreaterThan(0);
    for (const p of papers) expect(p.pilar).toBe('tantrica');
  });

  it('(d) filtro journal funciona (case-insensitive)', async () => {
    const journals = await loadLiteratureFacets();
    const target = journals.journals[0];
    expect(target).toBeDefined();
    const papersLower = await loadLiteraturePapers({
      filters: { journal: target.toLowerCase() },
      locale: 'pt-BR',
    });
    const papersUpper = await loadLiteraturePapers({
      filters: { journal: target.toUpperCase() },
      locale: 'pt-BR',
    });
    expect(papersLower.length).toBe(papersUpper.length);
    expect(papersLower.length).toBeGreaterThan(0);
  });

  it('(e) filtro hasPractice funciona (true)', async () => {
    const papers = await loadLiteraturePapers({
      filters: { hasPractice: true },
      locale: 'pt-BR',
    });
    expect(papers.length).toBeGreaterThan(0);
    for (const p of papers) expect(p.practiceField).not.toBeNull();
  });

  it('(e2) filtro hasPractice funciona (false)', async () => {
    const papers = await loadLiteraturePapers({
      filters: { hasPractice: false },
      locale: 'pt-BR',
    });
    expect(papers.length).toBeGreaterThan(0);
    for (const p of papers) expect(p.practiceField).toBeNull();
  });

  it('(f) filtros combinados aplicam interseção (AND)', async () => {
    const papers = await loadLiteraturePapers({
      filters: { pilar: 'astrologia', hasPractice: true, year: 2019 },
      locale: 'pt-BR',
    });
    // Apenas paper_okafor_2019 match (astrologia + 2019 + tem prática)
    expect(papers.length).toBe(1);
    expect(papers[0]?.paperId).toBe('paper_okafor_2019');
  });

  it('(g) citationCount determinístico', async () => {
    const a = await loadLiteraturePapers({ filters: {}, locale: 'pt-BR' });
    const b = await loadLiteraturePapers({ filters: {}, locale: 'pt-BR' });
    expect(a.map((p) => p.citationCount)).toEqual(b.map((p) => p.citationCount));
    // Range 1-50
    for (const p of a) {
      expect(p.citationCount).toBeGreaterThanOrEqual(1);
      expect(p.citationCount).toBeLessThanOrEqual(50);
    }
  });

  it('(h) abstractPtBr preferencial em pt-BR; fallback em en', async () => {
    const ptPapers = await loadLiteraturePapers({
      filters: { pilar: 'tantrica' },
      locale: 'pt-BR',
    });
    const enPapers = await loadLiteraturePapers({
      filters: { pilar: 'tantrica' },
      locale: 'en',
    });

    const ptCahn = ptPapers.find((p) => p.paperId === 'paper_cahn_2010');
    const enCahn = enPapers.find((p) => p.paperId === 'paper_cahn_2010');
    expect(ptCahn).toBeDefined();
    expect(enCahn).toBeDefined();
    // pt-BR usa abstractPtBr (com "Coerência")
    expect(ptCahn?.abstract).toContain('Coerência');
    // en usa abstractEn (com "Brainwave")
    expect(enCahn?.abstract).toContain('Brainwave');
  });

  it('(i) loadLiteratureFacets retorna facets únicas', async () => {
    const facets = await loadLiteratureFacets();
    expect(facets.totalPapers).toBeGreaterThan(10);
    expect(facets.years.length).toBeGreaterThan(0);
    expect(facets.pillars).toEqual([
      'cabala',
      'astrologia',
      'tantrica',
      'odu',
      'iching',
    ]);
    // years ordenados desc
    for (let i = 1; i < facets.years.length; i++) {
      expect(facets.years[i]).toBeLessThanOrEqual(facets.years[i - 1]!);
    }
    // journals ordenados asc
    for (let i = 1; i < facets.journals.length; i++) {
      expect(facets.journals[i]!.localeCompare(facets.journals[i - 1]!)).toBeGreaterThanOrEqual(0);
    }
    // Sem duplicatas
    expect(new Set(facets.journals).size).toBe(facets.journals.length);
    expect(new Set(facets.years).size).toBe(facets.years.length);
  });

  it('(j) LGPD: nenhum PII em qualquer campo', async () => {
    const papers = await loadLiteraturePapers({ filters: {}, locale: 'pt-BR' });
    for (const p of papers) {
      const allText = JSON.stringify(p);
      // Sem email, cpf, telefone em qualquer campo
      expect(allText).not.toMatch(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
      expect(allText).not.toMatch(/\d{3}\.\d{3}\.\d{3}-\d{2}/);
      expect(allText).not.toMatch(/\buserId\b/i);
      expect(allText).not.toMatch(/\bbirthDate\b/i);
    }
  });
});
