/** @vitest-environment jsdom */
/**
 * MandalaUniversalView — Wave 28.1 smoke tests.
 *
 * Cobertura:
 *   1. Render: hero tagline + 5 PillarCards + papers section.
 *   2. 5 PillarCards: data-pillar por Pilar (cabala/astrologia/tantra/odu/iching).
 *   3. Cada card tem ícone + texto de voz.
 *   4. Cores distintas por Pilar (borderClass contém o nome do color).
 *   5. Papers cited: lista renderiza todos os papers passados.
 *   6. DOI link é renderizado quando paper.doi existe.
 *   7. i18n: usa 'mandala.universal.*' namespace (tagline, citations, pillar voices).
 *   8. Mobile-first: layout vertical (flex) sem forçar grid horizontal.
 *   9. CTA secundário: link para /dashboard e /diario.
 *  10. Saudação propaga ao hero (Bom despertar/Boa tarde/Boa noite).
 *  11. LGPD: nenhum dado pessoal do usuário no markup (sem nome/email).
 *  12. A11y: tagline é h1 (heading hierarchy) e papers section tem aria-label.
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';

import {
  MandalaUniversalView,
  PILLAR_VOICES,
  type CitedPaper,
} from '../MandalaUniversalView';

// ─── Mock data ──────────────────────────────────────────────────────────────

const MOCK_PAPERS: CitedPaper[] = [
  {
    id: 'paper_riba_2003',
    title: 'Ayahuasca pharmacology',
    authors: ['Riba J.', 'Rodriguez-Fornells A.'],
    year: 2003,
    journal: 'J. Psychopharmacology',
    doi: '10.1177/0269881103170500',
  },
  {
    id: 'paper_selby_2014',
    title: 'I Ching in clinical practice',
    authors: ['Selby J.'],
    year: 2014,
    journal: 'J. Humanistic Psychology',
    doi: null,
  },
];

const defaultProps = {
  locale: 'pt-BR',
  saudacao: 'Bom despertar',
  papers: MOCK_PAPERS,
};

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('MandalaUniversalView (Wave 28.1)', () => {
  beforeEach(() => {
    cleanup();
  });

  it('1. Render: hero, 5 PillarCards, papers section', () => {
    render(<MandalaUniversalView {...defaultProps} />);
    expect(screen.getByTestId('mandala-universal-root')).toBeInTheDocument();
    expect(screen.getByTestId('mandala-universal-hero')).toBeInTheDocument();
    expect(screen.getAllByTestId(/^pillar-card-/)).toHaveLength(5);
    expect(screen.getByTestId('mandala-universal-papers')).toBeInTheDocument();
  });

  it('2. 5 PillarCards: data-pillar por Pilar', () => {
    render(<MandalaUniversalView {...defaultProps} />);
    PILLAR_VOICES.forEach((p) => {
      const card = screen.getByTestId(`pillar-card-${p.key}`);
      expect(card).toBeInTheDocument();
      expect(card.getAttribute('data-pillar')).toBe(p.key);
    });
  });

  it('3. Cada card tem ícone + texto de voz', () => {
    render(<MandalaUniversalView {...defaultProps} />);
    PILLAR_VOICES.forEach((p) => {
      const card = screen.getByTestId(`pillar-card-${p.key}`);
      // Ícone (SVG lucide) presente no card
      expect(card.querySelector('svg')).toBeInTheDocument();
      // Voz: parágrafo com texto não-vazio
      const paragraphs = card.querySelectorAll('p');
      expect(paragraphs.length).toBeGreaterThan(0);
      const voiceText = paragraphs[0]?.textContent ?? '';
      expect(voiceText.length).toBeGreaterThan(10);
    });
  });

  it('4. Cores distintas por Pilar (borderClass contém classe de cor)', () => {
    render(<MandalaUniversalView {...defaultProps} />);
    PILLAR_VOICES.forEach((p) => {
      const card = screen.getByTestId(`pillar-card-${p.key}`);
      const classes = card.className;
      // borderClass contém o nome da cor em Tailwind (ex: border-violet-500/40)
      expect(classes).toContain(p.borderClass.split(' ')[0]);
    });
  });

  it('5. Papers cited: renderiza todos os papers passados', () => {
    render(<MandalaUniversalView {...defaultProps} />);
    const papersSection = screen.getByTestId('mandala-universal-papers');
    const list = within(papersSection).getByRole('list');
    const items = within(list).getAllByRole('listitem');
    expect(items).toHaveLength(MOCK_PAPERS.length);
    MOCK_PAPERS.forEach((paper) => {
      expect(within(list).getByText(paper.title)).toBeInTheDocument();
    });
  });

  it('6. DOI link é renderizado quando paper.doi existe', () => {
    render(<MandalaUniversalView {...defaultProps} />);
    // First paper has DOI
    const doiLink = screen.getByRole('link', { name: /doi:10\.1177/i });
    expect(doiLink).toBeInTheDocument();
    expect(doiLink.getAttribute('href')).toBe(
      'https://doi.org/10.1177/0269881103170500'
    );
    // First paper's DOI link is the only doi: link in the section
    // (second paper has no DOI — não tem href de doi)
    const papersSection = screen.getByTestId('mandala-universal-papers');
    const doiLinks = within(papersSection).getAllByRole('link', { name: /doi:/i });
    expect(doiLinks).toHaveLength(1);
  });

  it('7. i18n: usa "mandala.universal.*" namespace', () => {
    render(<MandalaUniversalView {...defaultProps} />);
    // Tagline e subtitle resolvem (não retornam a key)
    const hero = screen.getByTestId('mandala-universal-hero');
    const heroText = hero.textContent ?? '';
    // Pelo menos uma das strings i18n renderizou (não é a chave literal)
    expect(heroText).not.toContain('mandala.universal.');
    // Hero tem h1 (tagline) — hierarquia semântica correta
    expect(hero.querySelector('h1')).toBeInTheDocument();
  });

  it('8. Mobile-first: layout vertical (flex) por padrão', () => {
    render(<MandalaUniversalView {...defaultProps} />);
    const root = screen.getByTestId('mandala-universal-root');
    // Section de cards usa flex-col em mobile
    const cardSection = screen
      .getByTestId('mandala-universal-root')
      .querySelector('section');
    expect(cardSection?.className).toContain('flex-col');
  });

  it('9. CTA secundário: links para /dashboard e /diario', () => {
    render(<MandalaUniversalView {...defaultProps} />);
    const dashboardLink = screen.getByRole('link', { name: /Análise Completa/i });
    expect(dashboardLink).toBeInTheDocument();
    expect(dashboardLink.getAttribute('href')).toBe('/dashboard');
    const diarioLink = screen.getByRole('link', { name: /Diário de hoje/i });
    expect(diarioLink).toBeInTheDocument();
    expect(diarioLink.getAttribute('href')).toBe('/diario');
  });

  it('10. Saudação propaga ao hero', () => {
    render(
      <MandalaUniversalView
        {...defaultProps}
        saudacao="Boa tarde"
      />
    );
    expect(screen.getByText('Boa tarde')).toBeInTheDocument();
  });

  it('11. LGPD: nenhum dado pessoal do usuário no markup', () => {
    render(<MandalaUniversalView {...defaultProps} />);
    const root = screen.getByTestId('mandala-universal-root');
    const html = root.innerHTML.toLowerCase();
    // Sem email, telefone, nome — apenas strings universais (tagline, pilares)
    expect(html).not.toMatch(/@.*\.(com|org|net|br)/);
    expect(html).not.toMatch(/\(\d{2}\)\s*\d{4,5}/); // telefone BR
    // Saudação é passada como prop — não inclui nome do user
    expect(html).not.toContain('joão');
    expect(html).not.toContain('maria');
  });

  it('12. A11y: papers section tem aria-label, hero tem h1', () => {
    render(<MandalaUniversalView {...defaultProps} />);
    const papersSection = screen.getByTestId('mandala-universal-papers');
    expect(papersSection.tagName.toLowerCase()).toBe('section');
    expect(papersSection.getAttribute('aria-label')).toBeTruthy();
    // Hero tem h1 (sempre único na página)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('13. PILLAR_VOICES tem exatamente 5 entries (Cabala, Astrologia, Tantra, Odu, I Ching)', () => {
    expect(PILLAR_VOICES).toHaveLength(5);
    const keys = PILLAR_VOICES.map((p) => p.key).sort();
    expect(keys).toEqual(['astrologia', 'cabala', 'iching', 'odu', 'tantra']);
  });
});
