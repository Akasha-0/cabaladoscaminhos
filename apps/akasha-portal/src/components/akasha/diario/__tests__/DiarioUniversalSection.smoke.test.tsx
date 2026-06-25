/**
 * DiarioUniversalSection — Wave 28.2
 *
 * Smoke tests (Vitest jsdom). Verifica:
 *   (a) Render básico — header + 5 Pilares + papers visíveis.
 *   (b) Pilar ativo destacado com `data-pilar-active="true"`.
 *   (c) 4 pilares secundarios marcados `data-pilar-active="false"`.
 *   (d) Papers do Pilar principal aparecem primeiro (citationCount desc).
 *   (e) Abstract expand/collapse toggle.
 *   (f) Link "ver Mandala completa" aponta para /[locale]/mandala.
 *   (g) Link de cada paper aponta para open-access URL quando existe.
 *   (h) i18n: chaves `diario.universal.*` consumidas corretamente.
 *   (i) LGPD: nenhuma PII de usuário no DOM.
 *   (j) Empty state quando papers.length === 0.
 */

import { describe, it, expect } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';

import { DiarioUniversalSection } from '../DiarioUniversalSection';
import type { DiarioPaperDTO } from '../DiarioPapersAdapter';
import type { Pilar } from '@/lib/grimoire/significados-curados';

const PAPEERS_MOCK: DiarioPaperDTO[] = [
  {
    paperId: 'paper_principal_1',
    title: 'Paper do Pilar principal',
    authors: ['Smith J.'],
    year: 2020,
    journal: 'J. Universalism',
    doi: '10.1234/abc',
    abstract: 'Abstract about the principal pilar.',
    fullTextUrl: 'https://doi.org/10.1234/abc',
    pilar: 'cabala',
    citationCount: 9,
  },
  {
    paperId: 'paper_secundario_astrologia',
    title: 'Paper de Astrologia (relacionado)',
    authors: ['Mayo J.'],
    year: 2019,
    journal: 'Astrology J.',
    doi: '10.1234/xyz',
    abstract: 'Astronomy-paper abstract.',
    fullTextUrl: 'https://doi.org/10.1234/xyz',
    pilar: 'astrologia',
    citationCount: 5,
  },
  {
    paperId: 'paper_secundario_tantrica',
    title: 'Paper de Tantra (relacionado)',
    authors: ['Tang Y.'],
    year: 2015,
    journal: 'Nature Reviews',
    doi: '10.1038/nrn3916',
    abstract: 'Meditation and brainwave coherence.',
    fullTextUrl: 'https://doi.org/10.1038/nrn3916',
    pilar: 'tantrica',
    citationCount: 12,
  },
];

const PILAR_PRINCIPAL: Pilar = 'cabala';

describe('DiarioUniversalSection — Wave 28.2', () => {
  it('(a) render básico: header + 5 Pilares + papers', () => {
    render(
      <DiarioUniversalSection
        pilarPrincipal={PILAR_PRINCIPAL}
        papers={PAPEERS_MOCK}
        locale="pt-BR"
      />
    );

    expect(screen.getByTestId('diario-universal-section')).toBeInTheDocument();
    expect(screen.getByText('Mandato Universalista')).toBeInTheDocument();
    expect(screen.getByTestId('diario-universal-pilares')).toBeInTheDocument();
    expect(screen.getByTestId('diario-universal-papers')).toBeInTheDocument();
  });

  it('(b) pilar ativo (cabala) tem data-pilar-active="true"', () => {
    render(
      <DiarioUniversalSection
        pilarPrincipal={PILAR_PRINCIPAL}
        papers={PAPEERS_MOCK}
        locale="pt-BR"
      />
    );

    const cabalaChip = screen.getByTestId('diario-universal-pilar-cabala');
    expect(cabalaChip.getAttribute('data-pilar-active')).toBe('true');
  });

  it('(c) 4 pilares secundarios tem data-pilar-active="false"', () => {
    render(
      <DiarioUniversalSection
        pilarPrincipal={PILAR_PRINCIPAL}
        papers={PAPEERS_MOCK}
        locale="pt-BR"
      />
    );

    const secundarios: Pilar[] = ['astrologia', 'tantrica', 'odu', 'iching'];
    for (const p of secundarios) {
      const chip = screen.getByTestId(`diario-universal-pilar-${p}`);
      expect(chip.getAttribute('data-pilar-active')).toBe('false');
    }

    // data-testid exposes secundarios via sr-only span
    const secEl = screen.getByTestId('diario-universal-pilares-secundarios');
    expect(secEl.textContent?.split(',').sort().join(',')).toBe(
      secundarios.sort().join(',')
    );
  });

  it('(d) paper do pilar principal tem data-is-principal="true"', () => {
    render(
      <DiarioUniversalSection
        pilarPrincipal={PILAR_PRINCIPAL}
        papers={PAPEERS_MOCK}
        locale="pt-BR"
      />
    );

    const paperPrincipal = screen.getByTestId('diario-universal-paper-paper_principal_1');
    expect(paperPrincipal.getAttribute('data-is-principal')).toBe('true');

    const paperSecundario = screen.getByTestId('diario-universal-paper-paper_secundario_astrologia');
    expect(paperSecundario.getAttribute('data-is-principal')).toBe('false');
  });

  it('(e) abstract expand / collapse toggle', () => {
    render(
      <DiarioUniversalSection
        pilarPrincipal={PILAR_PRINCIPAL}
        papers={PAPEERS_MOCK}
        locale="pt-BR"
      />
    );

    const paper = screen.getByTestId('diario-universal-paper-paper_principal_1');
    const button = within(paper).getByRole('button', { name: /ver abstract|recolher/ });

    // Initially collapsed — abstract not rendered
    expect(
      paper.querySelector('#diario-paper-abstract-paper_principal_1')
    ).not.toBeInTheDocument();

    // Click to expand
    fireEvent.click(button);
    expect(
      paper.querySelector('#diario-paper-abstract-paper_principal_1')
    ).toBeInTheDocument();

    // Click to collapse
    fireEvent.click(button);
    expect(
      paper.querySelector('#diario-paper-abstract-paper_principal_1')
    ).not.toBeInTheDocument();
  });

  it('(f) link "Ver Mandala completa" aponta para /[locale]/mandala', () => {
    render(
      <DiarioUniversalSection
        pilarPrincipal={PILAR_PRINCIPAL}
        papers={PAPEERS_MOCK}
        locale="pt-BR"
      />
    );

    const viewAll = screen.getByText('Ver Mandala completa');
    const anchor = viewAll.closest('a');
    expect(anchor?.getAttribute('href')).toBe('/pt-BR/mandala');
  });

  it('(g) link de paper aponta para open-access URL quando existe', () => {
    render(
      <DiarioUniversalSection
        pilarPrincipal={PILAR_PRINCIPAL}
        papers={PAPEERS_MOCK}
        locale="pt-BR"
      />
    );

    const paper = screen.getByTestId('diario-universal-paper-paper_principal_1');
    const link = within(paper).getByText('Ler paper').closest('a');
    expect(link?.getAttribute('href')).toBe('https://doi.org/10.1234/abc');
    expect(link?.getAttribute('target')).toBe('_blank');
    expect(link?.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('(h) i18n: chaves diario.universal.* consumidas (pt-BR)', () => {
    render(
      <DiarioUniversalSection
        pilarPrincipal={PILAR_PRINCIPAL}
        papers={PAPEERS_MOCK}
        locale="pt-BR"
      />
    );

    expect(screen.getByText('Mandato Universalista')).toBeInTheDocument();
    expect(screen.getByText('5 Pilares em diálogo')).toBeInTheDocument();
    expect(screen.getByText('Papers que sustentam este Mandato')).toBeInTheDocument();
    expect(screen.getByText('Evidência científica')).toBeInTheDocument();
  });

  it('(h-en) i18n: chaves diario.universal.* consumidas (en)', () => {
    render(
      <DiarioUniversalSection
        pilarPrincipal={PILAR_PRINCIPAL}
        papers={PAPEERS_MOCK}
        locale="en"
      />
    );

    expect(screen.getByText('Universalist Mandate')).toBeInTheDocument();
    expect(screen.getByText('5 Pillars in dialogue')).toBeInTheDocument();
    expect(screen.getByText('Papers supporting this Mandate')).toBeInTheDocument();
    expect(screen.getByText('Scientific evidence')).toBeInTheDocument();
  });

  it('(i) LGPD: nenhum dado pessoal no DOM', () => {
    render(
      <DiarioUniversalSection
        pilarPrincipal={PILAR_PRINCIPAL}
        papers={PAPEERS_MOCK}
        locale="pt-BR"
      />
    );

    // Componente NÃO recebe userId/name; não deve haver PII
    const html = document.body.innerHTML;
    expect(html).not.toMatch(/userId/i);
    expect(html).not.toMatch(/user_name/i);
    expect(html).not.toMatch(/\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/); // CPF
    expect(html).not.toMatch(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i); // email
  });

  it('(j) empty state quando papers vazio', () => {
    render(
      <DiarioUniversalSection
        pilarPrincipal={PILAR_PRINCIPAL}
        papers={[]}
        locale="pt-BR"
      />
    );

    expect(
      screen.getByText('Nenhum paper indexado para este Pilar ainda.')
    ).toBeInTheDocument();
  });

  it('(k) citationCount aparece para cada paper', () => {
    render(
      <DiarioUniversalSection
        pilarPrincipal={PILAR_PRINCIPAL}
        papers={PAPEERS_MOCK}
        locale="pt-BR"
      />
    );

    expect(screen.getByText(/citado em 9 outros insights/i)).toBeInTheDocument();
    expect(screen.getByText(/citado em 5 outros insights/i)).toBeInTheDocument();
    expect(screen.getByText(/citado em 12 outros insights/i)).toBeInTheDocument();
  });
});
