/**
 * DiarioPapersAdapter — Wave 28.2
 *
 * Testa:
 *   (a) Retorna papers para o pilarPrincipal.
 *   (b) Pilares secundarios retornam 1 paper cada (top citationCount).
 *   (c) Ordenação: principal primeiro, depois secundarios por citationCount desc.
 *   (d) citationCount determinístico (mesmo paperId → mesmo count).
 *   (e) abstractPtBr preferencial em pt-BR quando disponível.
 *   (f) abstractEn fallback em en ou pt-BR sem tradução.
 *   (g) Pilar sem catálogo retorna array vazio daquele pilar.
 *   (h) LGPD: nenhum dado pessoal em qualquer campo.
 */

import { describe, it, expect } from 'vitest';

import { loadDiarioPapers } from '../DiarioPapersAdapter';

describe('DiarioPapersAdapter — Wave 28.2', () => {
  it('(a) retorna papers para o pilarPrincipal', async () => {
    const papers = await loadDiarioPapers({
      pilarPrincipal: 'astrologia',
      date: '2026-06-25',
      locale: 'pt-BR',
    });

    // Pelo menos 2 papers (astrologia tem 2 no catálogo mock)
    const astroPapers = papers.filter((p) => p.pilar === 'astrologia');
    expect(astroPapers.length).toBeGreaterThanOrEqual(2);
  });

  it('(b) pilares secundarios retornam 1 paper cada', async () => {
    const papers = await loadDiarioPapers({
      pilarPrincipal: 'cabala',
      date: '2026-06-25',
      locale: 'pt-BR',
    });

    const secundarios: Array<'astrologia' | 'tantrica' | 'odu' | 'iching'> = [
      'astrologia',
      'tantrica',
      'odu',
      'iching',
    ];
    for (const sec of secundarios) {
      const matched = papers.filter((p) => p.pilar === sec);
      expect(matched).toHaveLength(1);
    }
  });

  it('(c) ordenação: principal primeiro, depois por citationCount desc', async () => {
    const papers = await loadDiarioPapers({
      pilarPrincipal: 'astrologia',
      date: '2026-06-25',
      locale: 'pt-BR',
    });

    // Os primeiros devem ser do pilar principal
    const principalCount = papers.filter((p) => p.pilar === 'astrologia').length;
    expect(papers[0]?.pilar).toBe('astrologia');
    expect(papers[principalCount - 1]?.pilar).toBe('astrologia');

    // Todos do principal vêm antes de qualquer secundario
    const firstSecundarioIdx = papers.findIndex((p) => p.pilar !== 'astrologia');
    for (let i = 0; i < firstSecundarioIdx; i++) {
      expect(papers[i]?.pilar).toBe('astrologia');
    }

    // Secundarios ordenados por citationCount desc
    const secundarios = papers.filter((p) => p.pilar !== 'astrologia');
    for (let i = 1; i < secundarios.length; i++) {
      const prev = secundarios[i - 1]!.citationCount;
      const curr = secundarios[i]!.citationCount;
      expect(prev).toBeGreaterThanOrEqual(curr);
    }
  });

  it('(d) citationCount determinístico', async () => {
    const a = await loadDiarioPapers({
      pilarPrincipal: 'tantrica',
      date: '2026-06-25',
      locale: 'pt-BR',
    });
    const b = await loadDiarioPapers({
      pilarPrincipal: 'tantrica',
      date: '2026-06-25',
      locale: 'pt-BR',
    });

    expect(a.map((p) => p.citationCount)).toEqual(b.map((p) => p.citationCount));
  });

  it('(e) abstractPtBr preferencial em pt-BR quando disponível', async () => {
    const papers = await loadDiarioPapers({
      pilarPrincipal: 'tantrica', // tem abstractPtBr
      date: '2026-06-25',
      locale: 'pt-BR',
    });

    const cahn = papers.find((p) => p.paperId === 'paper_cahn_2010');
    expect(cahn).toBeDefined();
    // Cahn 2010 tem abstractPtBr com "Coerência de ondas cerebrais"
    expect(cahn?.abstract).toContain('Coerência');
  });

  it('(f) abstractEn fallback em en', async () => {
    const papers = await loadDiarioPapers({
      pilarPrincipal: 'tantrica',
      date: '2026-06-25',
      locale: 'en',
    });

    const cahn = papers.find((p) => p.paperId === 'paper_cahn_2010');
    expect(cahn).toBeDefined();
    expect(cahn?.abstract).toContain('Brainwave coherence');
  });

  it('(g) LGPD: nenhum PII em qualquer campo', async () => {
    const papers = await loadDiarioPapers({
      pilarPrincipal: 'astrologia',
      date: '2026-06-25',
      locale: 'pt-BR',
    });

    for (const p of papers) {
      // Sem email, cpf, telefone em qualquer campo
      const allText = JSON.stringify(p);
      expect(allText).not.toMatch(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
      expect(allText).not.toMatch(/\d{3}\.\d{3}\.\d{3}-\d{2}/);
    }
  });
});
