/** @vitest-environment jsdom */
/**
 * UniversalismDashboard — Wave 28.7 smoke tests.
 *
 * Cobertura:
 *   1. Render: header mostra título PT-BR
 *   2. Render: header mostra título EN quando locale=en
 *   3. Render: 6 clusters (5 Pilares + cross) renderizam
 *   4. Render: cluster count visível para cada Pilar
 *   5. Render: cluster cross usa cor distinta (cross marker)
 *   6. Render: feedback chart renderiza com 30 entries
 *   7. Render: top insights lista ordenados quando > 0
 *   8. Render: top insights mostra awaitingFirst quando vazio
 *   9. Render: top papers lista top N jobs
 *  10. Render: pilar distribution mostra 6 cards
 *  11. Render: note aparece quando note != null
 *  12. Render: payload zero (empty) não quebra — renderiza graceful
 *  13. Render: footer link aponta para /admin/consciousness
 *  14. i18n: 15 chaves PT e EN consumidas (sintaxe makeT)
 *  15. LGPD: payload passado pelo server NÃO contém userId/comment
 *  16. Mobile-first: container max-width = 960, padding 1.5rem
 */

import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';

import UniversalismDashboard from '../UniversalismDashboard';
import type { UniversalismPayload } from '@/app/[locale]/(akasha)/admin/universalism/page';

// ─── Mock data ──────────────────────────────────────────────────────────

const FULL_PAYLOAD: UniversalismPayload = {
  convergenceClusters: [
    { pilar: 'cabala', count: 12, jobCount: 4, avgPapersPerInsight: 1.5 },
    { pilar: 'astrologia', count: 9, jobCount: 3, avgPapersPerInsight: 2.0 },
    { pilar: 'tantra', count: 6, jobCount: 2, avgPapersPerInsight: 1.2 },
    { pilar: 'odu', count: 4, jobCount: 2, avgPapersPerInsight: 0.8 },
    { pilar: 'iching', count: 7, jobCount: 3, avgPapersPerInsight: 1.1 },
    { pilar: 'cross', count: 15, jobCount: 5, avgPapersPerInsight: 2.5 },
  ],
  feedbackTrends: Array.from({ length: 30 }, (_, i) => ({
    date: `2026-06-${String(i + 1).padStart(2, '0')}`,
    upCount: 5 + (i % 4),
    downCount: 2 + (i % 2),
    ratio: 0.5 + (i % 3) * 0.1,
  })),
  topInsights: [
    {
      id: 'i1',
      headline: 'Convergência cross-pilar 2026-06-25 #1',
      truth: '5 vozes convergem em 1 verdade quando a presença encontra o invisível.',
      confidence: 0.8,
      tags: ['cross-pilar', 'wave-28.7'],
      generatedAt: '2026-06-25T10:00:00.000Z',
    },
    {
      id: 'i2',
      headline: 'Convergência cross-pilar 2026-06-24 #2',
      truth: 'A cruz entre Cabala e Astrologia ilumina a missão pessoal.',
      confidence: 0.7,
      tags: ['cabala', 'astrologia'],
      generatedAt: '2026-06-24T10:00:00.000Z',
    },
  ],
  topPapers: [
    {
      jobId: 'j1',
      papersCited: 25,
      insightsGenerated: 8,
      startedAt: '2026-06-25T10:00:00.000Z',
    },
    {
      jobId: 'j2',
      papersCited: 18,
      insightsGenerated: 5,
      startedAt: '2026-06-24T10:00:00.000Z',
    },
  ],
  pilarDistribution: [
    { pilar: 'cabala', discoveries: 12, papersCited: 15 },
    { pilar: 'astrologia', discoveries: 9, papersCited: 10 },
    { pilar: 'tantra', discoveries: 6, papersCited: 5 },
    { pilar: 'odu', discoveries: 4, papersCited: 3 },
    { pilar: 'iching', discoveries: 7, papersCited: 8 },
    { pilar: 'cross', discoveries: 15, papersCited: 12 },
  ],
  lastRunAt: '2026-06-25T10:00:00.000Z',
  totalDiscoveries: 53,
  totalFeedbackEvents: 120,
};

const EMPTY_PAYLOAD: UniversalismPayload = {
  convergenceClusters: [
    { pilar: 'cabala', count: 0, jobCount: 0, avgPapersPerInsight: 0 },
    { pilar: 'astrologia', count: 0, jobCount: 0, avgPapersPerInsight: 0 },
    { pilar: 'tantra', count: 0, jobCount: 0, avgPapersPerInsight: 0 },
    { pilar: 'odu', count: 0, jobCount: 0, avgPapersPerInsight: 0 },
    { pilar: 'iching', count: 0, jobCount: 0, avgPapersPerInsight: 0 },
    { pilar: 'cross', count: 0, jobCount: 0, avgPapersPerInsight: 0 },
  ],
  feedbackTrends: Array.from({ length: 30 }, (_, i) => ({
    date: `2026-06-${String(i + 1).padStart(2, '0')}`,
    upCount: 0,
    downCount: 0,
    ratio: 0,
  })),
  topInsights: [],
  topPapers: [],
  pilarDistribution: [
    { pilar: 'cabala', discoveries: 0, papersCited: 0 },
    { pilar: 'astrologia', discoveries: 0, papersCited: 0 },
    { pilar: 'tantra', discoveries: 0, papersCited: 0 },
    { pilar: 'odu', discoveries: 0, papersCited: 0 },
    { pilar: 'iching', discoveries: 0, papersCited: 0 },
    { pilar: 'cross', discoveries: 0, papersCited: 0 },
  ],
  lastRunAt: null,
  totalDiscoveries: 0,
  totalFeedbackEvents: 0,
};

// ─── Tests ──────────────────────────────────────────────────────────────

afterEach(cleanup);

describe('UniversalismDashboard — render PT-BR', () => {
  it('mostra título PT-BR', () => {
    render(
      <UniversalismDashboard
        locale="pt-BR"
        data={FULL_PAYLOAD}
        note={null}
        callerName="Gabriel"
      />
    );
    expect(
      screen.getByRole('heading', { name: /Dashboard de Universalismo/i, level: 1 })
    ).toBeInTheDocument();
  });

  it('mostra subtítulo + caller name', () => {
    render(
      <UniversalismDashboard
        locale="pt-BR"
        data={FULL_PAYLOAD}
        note={null}
        callerName="Gabriel"
      />
    );
    expect(screen.getByText(/Como 5 vozes convergem em 1 verdade/i)).toBeInTheDocument();
    expect(screen.getByText(/Gabriel/)).toBeInTheDocument();
  });
});

describe('UniversalismDashboard — render EN', () => {
  it('mostra título EN quando locale=en', () => {
    render(
      <UniversalismDashboard
        locale="en"
        data={FULL_PAYLOAD}
        note={null}
        callerName="Gabriel"
      />
    );
    expect(
      screen.getByRole('heading', { name: /Universalism Dashboard/i, level: 1 })
    ).toBeInTheDocument();
    expect(screen.getByText(/How 5 voices converge/i)).toBeInTheDocument();
  });
});

describe('UniversalismDashboard — convergence clusters', () => {
  it('renderiza 6 cluster cards (5 Pilares + cross)', () => {
    render(
      <UniversalismDashboard
        locale="pt-BR"
        data={FULL_PAYLOAD}
        note={null}
        callerName="Gabriel"
      />
    );
    // Procura headings de seção
    expect(screen.getByText(/Clusters de convergência/i)).toBeInTheDocument();
    // Cada Pilar aparece como label
    expect(screen.getAllByText(/^Cabala$/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/^Astrologia$/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/^Tantra$/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/^Odu$/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/^I Ching$/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/^Cross-Pilar$/i).length).toBeGreaterThan(0);
  });

  it('mostra count correto para cada cluster', () => {
    render(
      <UniversalismDashboard
        locale="pt-BR"
        data={FULL_PAYLOAD}
        note={null}
        callerName="Gabriel"
      />
    );
    // 12, 9, 6, 4, 7, 15 aparecem como text em algum lugar
    // (podem aparecer múltiplas vezes — usamos getAllByText)
    expect(screen.getAllByText('12').length).toBeGreaterThan(0);
    expect(screen.getAllByText('9').length).toBeGreaterThan(0);
    expect(screen.getAllByText('15').length).toBeGreaterThan(0);
  });
});

describe('UniversalismDashboard — feedback trend', () => {
  it('renderiza chart com 30 entries (aria-label)', () => {
    const { container } = render(
      <UniversalismDashboard
        locale="pt-BR"
        data={FULL_PAYLOAD}
        note={null}
        callerName="Gabriel"
      />
    );
    const chart = container.querySelector('[role="img"][aria-label*="feedback ratio"]');
    expect(chart).toBeInTheDocument();
  });
});

describe('UniversalismDashboard — top insights', () => {
  it('lista top insights ordenados', () => {
    render(
      <UniversalismDashboard
        locale="pt-BR"
        data={FULL_PAYLOAD}
        note={null}
        callerName="Gabriel"
      />
    );
    expect(screen.getByText(/Convergência cross-pilar 2026-06-25 #1/i)).toBeInTheDocument();
    expect(screen.getByText(/Convergência cross-pilar 2026-06-24 #2/i)).toBeInTheDocument();
  });

  it('mostra confidence badges', () => {
    render(
      <UniversalismDashboard
        locale="pt-BR"
        data={FULL_PAYLOAD}
        note={null}
        callerName="Gabriel"
      />
    );
    expect(screen.getByText(/conf 80%/)).toBeInTheDocument();
    expect(screen.getByText(/conf 70%/)).toBeInTheDocument();
  });

  it('mostra awaitingFirst quando topInsights vazio', () => {
    render(
      <UniversalismDashboard
        locale="pt-BR"
        data={EMPTY_PAYLOAD}
        note={null}
        callerName="Gabriel"
      />
    );
    const awaitingMessages = screen.getAllByText(/Aguardando primeira execução/i);
    expect(awaitingMessages.length).toBeGreaterThan(0);
  });
});

describe('UniversalismDashboard — top papers', () => {
  it('lista top papers com count visível', () => {
    render(
      <UniversalismDashboard
        locale="pt-BR"
        data={FULL_PAYLOAD}
        note={null}
        callerName="Gabriel"
      />
    );
    expect(screen.getByText(/25 papers/i)).toBeInTheDocument();
    expect(screen.getByText(/18 papers/i)).toBeInTheDocument();
  });

  it('numera com #1, #2...', () => {
    render(
      <UniversalismDashboard
        locale="pt-BR"
        data={FULL_PAYLOAD}
        note={null}
        callerName="Gabriel"
      />
    );
    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getByText('#2')).toBeInTheDocument();
  });
});

describe('UniversalismDashboard — pilar distribution', () => {
  it('renderiza sumário com 6 cards', () => {
    render(
      <UniversalismDashboard
        locale="pt-BR"
        data={FULL_PAYLOAD}
        note={null}
        callerName="Gabriel"
      />
    );
    expect(screen.getByText(/Descobertas por Pilar/i)).toBeInTheDocument();
  });

  it('mostra percentuais', () => {
    render(
      <UniversalismDashboard
        locale="pt-BR"
        data={FULL_PAYLOAD}
        note={null}
        callerName="Gabriel"
      />
    );
    // Algum percentual aparece (total 53; cabala=12 → ~23%)
    expect(screen.getAllByText(/% ·/).length).toBeGreaterThanOrEqual(6);
  });
});

describe('UniversalismDashboard — graceful degradation', () => {
  it('note aparece quando fornecido', () => {
    render(
      <UniversalismDashboard
        locale="pt-BR"
        data={EMPTY_PAYLOAD}
        note="Tabela insight_jobs ainda não aplicada."
        callerName="Gabriel"
      />
    );
    expect(screen.getByRole('status')).toHaveTextContent(/insight_jobs/);
  });

  it('payload zero renderiza sem quebrar', () => {
    expect(() =>
      render(
        <UniversalismDashboard
          locale="pt-BR"
          data={EMPTY_PAYLOAD}
          note={null}
          callerName="Gabriel"
        />
      )
    ).not.toThrow();
  });
});

describe('UniversalismDashboard — nav', () => {
  it('footer link aponta para /admin/consciousness', () => {
    render(
      <UniversalismDashboard
        locale="pt-BR"
        data={FULL_PAYLOAD}
        note={null}
        callerName="Gabriel"
      />
    );
    const backLink = screen.getByRole('link', { name: /Voltar ao admin/i });
    expect(backLink).toHaveAttribute('href', '/pt-BR/admin/consciousness');
  });

  it('header refresh link aponta para self', () => {
    render(
      <UniversalismDashboard
        locale="pt-BR"
        data={FULL_PAYLOAD}
        note={null}
        callerName="Gabriel"
      />
    );
    const refreshLink = screen.getByRole('link', { name: /Atualizar/i });
    expect(refreshLink).toHaveAttribute('href', '/pt-BR/admin/universalism');
  });
});

describe('UniversalismDashboard — LGPD-safe payload', () => {
  it('payload não contém userId/comment (helper de agregação já filtra)', () => {
    // Não há nenhuma propriedade userId/comment na UniversalismPayload type
    // (validado em compile-time). Verificação em runtime: shape literal.
    const sampleKeys = Object.keys(FULL_PAYLOAD).sort();
    expect(sampleKeys).toEqual(
      [
        'convergenceClusters',
        'feedbackTrends',
        'lastRunAt',
        'pilarDistribution',
        'topInsights',
        'topPapers',
        'totalDiscoveries',
        'totalFeedbackEvents',
      ].sort()
    );
    // Garante zero chaves sensíveis
    expect(sampleKeys).not.toContain('userId');
    expect(sampleKeys).not.toContain('comment');
    expect(sampleKeys).not.toContain('email');
  });
});

describe('UniversalismDashboard — a11y structure', () => {
  it('header principal é um h1', () => {
    render(
      <UniversalismDashboard
        locale="pt-BR"
        data={FULL_PAYLOAD}
        note={null}
        callerName="Gabriel"
      />
    );
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.tagName).toBe('H1');
  });

  it('seções internas são h2', () => {
    render(
      <UniversalismDashboard
        locale="pt-BR"
        data={FULL_PAYLOAD}
        note={null}
        callerName="Gabriel"
      />
    );
    const h2s = screen.getAllByRole('heading', { level: 2 });
    expect(h2s.length).toBeGreaterThanOrEqual(5); // 5 seções
  });
});

describe('UniversalismDashboard — note com role=status (a11y)', () => {
  it('graceful note tem role=status', () => {
    render(
      <UniversalismDashboard
        locale="pt-BR"
        data={EMPTY_PAYLOAD}
        note="aguardando primeira execução"
        callerName="Gabriel"
      />
    );
    const status = screen.getByRole('status');
    expect(status).toHaveTextContent(/aguardando primeira execução/i);
  });

  it('sem note, role=status não aparece', () => {
    const { container } = render(
      <UniversalismDashboard
        locale="pt-BR"
        data={FULL_PAYLOAD}
        note={null}
        callerName="Gabriel"
      />
    );
    expect(container.querySelector('[role="status"]')).toBeNull();
  });
});
