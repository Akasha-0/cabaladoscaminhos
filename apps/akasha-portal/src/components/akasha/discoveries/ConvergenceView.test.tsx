/** @vitest-environment jsdom */
/**
 * ConvergenceView — Wave 25.2 (Universalismo visceral em ação) tests.
 *
 * Cobertura:
 *   1. Render: mostra verdadeUniversal em destaque no TruthCard.
 *   2. Render: mostra 5 voice cards (1 por pilar) com cor distinta.
 *   3. Render: linha de convergência (visual) presente entre vozes e CTA.
 *   4. Render: confidence badge aparece quando confidence fornecido.
 *   5. Render: confidence badge oculto quando confidence omitido.
 *   6. Render: expand CTA só renderiza se onExpandPapers fornecido.
 *   7. Render: expand CTA mostra contador de papers quando > 0.
 *   8. i18n: usa 'discoveries.convergence.*' namespace (5 chaves).
 *   9. Locale EN troca labels visíveis (Verdade → Universal Truth).
 *  10. ADR-013 universalista: aceita QUALQUER ordem dos 5 pilares
 *      (sem hierarquia visual).
 *  11. Cap em 5 vozes (Wave 25.2 — 5 Pilares); mais que 5 = mostra 5.
 *  12. Empty state: voices=[] mostra mensagem, não quebra.
 *  13. Symbol opcional: aparece em itálico discreto antes da statement.
 *  14. Mobile-first: container não tem largura fixa (responsivo).
 *  15. A11y: root tem aria-labelledby apontando pro title h2.
 *  16. A11y: TruthCard tem role=status + aria-live=polite.
 *  17. Callback: clique no expand CTA dispara onExpandPapers.
 *  18. data-discovery-id: propaga discoveryId para o DOM (analytics).
 */

import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';

import { ConvergenceView } from './ConvergenceView';
import type { ConvergenceViewModel } from './ConvergenceView';

// ─── Mock data ──────────────────────────────────────────────────────────────

const MOCK_TRUTH =
  'Propósito é direção, não destino — vá onde o corpo sente medo.';

const MOCK_VOICES: ConvergenceViewModel['voices'] = [
  {
    source: 'cabala',
    symbol: 'Keter',
    statement: 'O 11 é iluminação que só o medo aceita ver.',
  },
  {
    source: 'astrologia',
    symbol: 'Nodo Norte',
    statement: 'O Nodo Norte aponta onde a alma sente medo de crescer.',
  },
  {
    source: 'tantra',
    symbol: 'Corpo 1',
    statement: 'O primeiro corpo sutil ancora o propósito no presente.',
  },
  {
    source: 'odu',
    symbol: 'Ìpínlà',
    statement: 'Ìpínlà é o arco: a travessia já começou quando se aceita o medo.',
  },
  {
    source: 'iching',
    symbol: 'Hexagrama 50',
    statement: 'Hexagrama 50 — a caldeira: ofereça o que te consome.',
  },
];

const MOCK_VIEW_MODEL: ConvergenceViewModel = {
  discoveryId: 'disc_conv_001',
  verdadeUniversal: MOCK_TRUTH,
  voices: MOCK_VOICES,
  confidence: 0.87,
  papersCount: 3,
};

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('ConvergenceView — Wave 25.2 (Universalismo visceral)', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders universal truth prominently in TruthCard', () => {
    render(<ConvergenceView {...MOCK_VIEW_MODEL} />);

    const truth = screen.getByTestId('convergence-truth');
    expect(truth).toBeInTheDocument();
    expect(truth.textContent).toContain(MOCK_TRUTH);
    // Decorado: o ✦ vem antes do texto
    expect(truth.textContent).toMatch(/✦.*Propósito/);
  });

  it('renders 5 voice cards (one per pillar) with distinct colors', () => {
    render(<ConvergenceView {...MOCK_VIEW_MODEL} />);

    const voiceList = screen.getByTestId('convergence-voices');
    expect(voiceList).toBeInTheDocument();

    // 5 voices — 1 por pilar
    const pillars = ['cabala', 'astrologia', 'tantra', 'odu', 'iching'] as const;
    for (const pillar of pillars) {
      expect(
        screen.getByTestId(`convergence-voice-${pillar}`)
      ).toBeInTheDocument();
    }

    // Cada voz tem sua statement visível (regex específica — evita match com o symbol)
    expect(within(screen.getByTestId('convergence-voice-cabala')).getByText(/iluminação que só o medo/)).toBeInTheDocument();
    expect(within(screen.getByTestId('convergence-voice-astrologia')).getByText(/alma sente medo de crescer/)).toBeInTheDocument();
    expect(within(screen.getByTestId('convergence-voice-tantra')).getByText(/primeiro corpo sutil/)).toBeInTheDocument();
    expect(within(screen.getByTestId('convergence-voice-odu')).getByText(/arco: a travessia/)).toBeInTheDocument();
    expect(within(screen.getByTestId('convergence-voice-iching')).getByText(/caldeira: ofereça/)).toBeInTheDocument();
  });

  it('renders convergence line (visual) between voices and CTA', () => {
    render(<ConvergenceView {...MOCK_VIEW_MODEL} />);

    const line = screen.getByTestId('convergence-line');
    expect(line).toBeInTheDocument();
    // Label i18n
    expect(line.textContent).toContain('convergem em');
  });

  it('shows confidence badge when confidence is provided', () => {
    render(<ConvergenceView {...MOCK_VIEW_MODEL} confidence={0.87} />);

    // 87% em pt-BR
    expect(screen.getByText('confiança 87%')).toBeInTheDocument();
  });

  it('hides confidence badge when confidence is omitted', () => {
    const noConfidence: ConvergenceViewModel = {
      ...MOCK_VIEW_MODEL,
      confidence: undefined,
    };
    render(<ConvergenceView {...noConfidence} />);

    expect(screen.queryByText(/confiança \d+%/)).toBeNull();
  });

  it('renders expand CTA only when onExpandPapers is provided', () => {
    // Com callback
    const onExpand = vi.fn();
    render(<ConvergenceView {...MOCK_VIEW_MODEL} onExpandPapers={onExpand} />);
    expect(screen.getByTestId('convergence-expand-cta')).toBeInTheDocument();

    // Sem callback
    cleanup();
    const noCallback: ConvergenceViewModel = {
      ...MOCK_VIEW_MODEL,
      onExpandPapers: undefined,
    };
    render(<ConvergenceView {...noCallback} />);
    expect(screen.queryByTestId('convergence-expand-cta')).toBeNull();
  });

  it('expand CTA shows paper count when > 0', () => {
    render(
      <ConvergenceView
        {...MOCK_VIEW_MODEL}
        papersCount={3}
        onExpandPapers={() => {}}
      />
    );

    const cta = screen.getByTestId('convergence-expand-cta');
    expect(cta.textContent).toMatch(/Mostrar papers citados.*\(3\)/);
  });

  it('expand CTA hides paper count when 0 or undefined', () => {
    render(
      <ConvergenceView
        {...MOCK_VIEW_MODEL}
        papersCount={0}
        onExpandPapers={() => {}}
      />
    );
    const cta = screen.getByTestId('convergence-expand-cta');
    expect(cta.textContent).not.toMatch(/\(\d+\)/);
  });

  it('uses discoveries.convergence.* i18n namespace for chrome', () => {
    render(
      <ConvergenceView
        {...MOCK_VIEW_MODEL}
        onExpandPapers={() => {}}
      />
    );

    // Title (header) — h2 contém o título do card
    expect(
      screen.getByRole('heading', { level: 2, name: /Convergência das vozes/ })
    ).toBeInTheDocument();
    // TruthCard section header — h3 dentro do truth card
    const truthCard = screen.getByTestId('convergence-truth-card');
    expect(within(truthCard).getByText(/Verdade Universal/i)).toBeInTheDocument();
    // Voices section header — h3 com voices label
    expect(
      screen.getByRole('heading', { level: 3, name: /As 5 vozes convergem/ })
    ).toBeInTheDocument();
    // Expand CTA label (precisa de onExpandPapers pra renderizar)
    expect(screen.getByTestId('convergence-expand-cta')).toHaveTextContent(
      'Mostrar papers citados'
    );
  });

  it('locale=en swaps chrome labels (PT → EN)', () => {
    render(
      <ConvergenceView
        {...MOCK_VIEW_MODEL}
        locale="en"
        onExpandPapers={() => {}}
      />
    );

    expect(
      screen.getByRole('heading', { level: 2, name: /Convergence of voices/ })
    ).toBeInTheDocument();
    // TruthCard h3
    const truthCard = screen.getByTestId('convergence-truth-card');
    expect(within(truthCard).getByText(/Universal Truth/i)).toBeInTheDocument();
    // Voices h3
    expect(
      screen.getByRole('heading', { level: 3, name: /The 5 voices converge/ })
    ).toBeInTheDocument();
    // Expand CTA — usa toHaveTextContent pra pegar texto fragmentado
    expect(screen.getByTestId('convergence-expand-cta')).toHaveTextContent(
      'Show cited papers'
    );
    // Confidence também troca
    expect(screen.getByText('confidence 87%')).toBeInTheDocument();
  });

  it('ADR-013 universalista: aceita qualquer ordem dos 5 pilares', () => {
    // Ordem invertida — sem hierarquia visual
    const reordered: ConvergenceViewModel = {
      ...MOCK_VIEW_MODEL,
      voices: [
        MOCK_VOICES[4], // iching
        MOCK_VOICES[0], // cabala
        MOCK_VOICES[3], // odu
        MOCK_VOICES[1], // astrologia
        MOCK_VOICES[2], // tantra
      ],
    };
    render(<ConvergenceView {...reordered} />);

    // Verifica que índice de cada voz no DOM bate com a ordem do array
    const iching = screen.getByTestId('convergence-voice-iching');
    const cabala = screen.getByTestId('convergence-voice-cabala');
    expect(iching.getAttribute('data-voice-index')).toBe('0');
    expect(cabala.getAttribute('data-voice-index')).toBe('1');
  });

  it('caps voices at 5 (Wave 25.2 — 5 Pilares)', () => {
    const tooMany: ConvergenceViewModel = {
      ...MOCK_VIEW_MODEL,
      voices: [
        ...MOCK_VOICES,
        // "literature" hipotético como 6ª voz — deve ser truncado
        {
          source: 'cabala', // reuso source só pra ter 6 entradas
          statement: 'Sexta voz hipotética que não deve aparecer.',
        },
      ],
    };
    render(<ConvergenceView {...tooMany} />);

    const voiceList = screen.getByTestId('convergence-voices');
    // 5 <li> dentro do <ul>
    expect(voiceList.querySelectorAll('li')).toHaveLength(5);
    // A 6ª voz NÃO está renderizada
    expect(
      screen.queryByText(/Sexta voz hipotética/)
    ).not.toBeInTheDocument();
  });

  it('empty voices array shows fallback message (não quebra)', () => {
    render(
      <ConvergenceView
        {...MOCK_VIEW_MODEL}
        voices={[]}
      />
    );

    expect(
      screen.getByTestId('convergence-voices-empty')
    ).toBeInTheDocument();
    // Truth e convergence line ainda renderizam
    expect(screen.getByTestId('convergence-truth')).toBeInTheDocument();
    expect(screen.getByTestId('convergence-line')).toBeInTheDocument();
  });

  it('symbol opcional aparece em itálico discreto antes da statement', () => {
    render(<ConvergenceView {...MOCK_VIEW_MODEL} />);

    // Cada voz com symbol renderiza o symbol
    expect(screen.getByText(/· Keter/)).toBeInTheDocument();
    expect(screen.getByText(/· Nodo Norte/)).toBeInTheDocument();
    expect(screen.getByText(/· Corpo 1/)).toBeInTheDocument();
    expect(screen.getByText(/· Ìpínlà/)).toBeInTheDocument();
    expect(screen.getByText(/· Hexagrama 50/)).toBeInTheDocument();
  });

  it('mobile-first: container não tem largura fixa (responsivo)', () => {
    render(<ConvergenceView {...MOCK_VIEW_MODEL} />);

    const root = screen.getByTestId('convergence-view');
    // Não tem width/height fixo — só padding/borda
    expect(root.className).not.toMatch(/\bw-(?:screen|full|\[)|h-(?:screen|full|\[)/);
  });

  it('a11y: root tem aria-labelledby apontando pro title h2', () => {
    render(<ConvergenceView {...MOCK_VIEW_MODEL} />);

    const root = screen.getByTestId('convergence-view');
    const titleId = root.getAttribute('aria-labelledby');
    expect(titleId).toBe(`convergence-view-title-${MOCK_VIEW_MODEL.discoveryId}`);

    const title = document.getElementById(titleId!);
    expect(title).not.toBeNull();
    expect(title?.tagName.toLowerCase()).toBe('h2');
  });

  it('a11y: TruthCard tem role=status + aria-live=polite', () => {
    render(<ConvergenceView {...MOCK_VIEW_MODEL} />);

    const truthCard = screen.getByTestId('convergence-truth-card');
    expect(truthCard.getAttribute('role')).toBe('status');
    expect(truthCard.getAttribute('aria-live')).toBe('polite');
  });

  it('click no expand CTA dispara onExpandPapers callback', () => {
    const onExpand = vi.fn();
    render(
      <ConvergenceView
        {...MOCK_VIEW_MODEL}
        onExpandPapers={onExpand}
      />
    );

    const cta = screen.getByTestId('convergence-expand-cta');
    fireEvent.click(cta);
    expect(onExpand).toHaveBeenCalledTimes(1);
  });

  it('data-discovery-id: propaga discoveryId para o DOM (analytics)', () => {
    render(<ConvergenceView {...MOCK_VIEW_MODEL} />);

    const root = screen.getByTestId('convergence-view');
    expect(root.getAttribute('data-discovery-id')).toBe(
      MOCK_VIEW_MODEL.discoveryId
    );
  });
});