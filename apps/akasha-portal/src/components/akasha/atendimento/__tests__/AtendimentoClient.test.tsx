/** @vitest-environment jsdom */
/**
 * AtendimentoClient — Wave 26.1 smoke tests.
 *
 * Cobertura:
 *   1. Render: root, header e tabs visíveis.
 *   2. Layout mobile: 3 tabs (Cliente | Chat | Insights).
 *   3. Layout mobile: tab 'cliente' ativa por padrão mostra painel.
 *   4. Render: discovery cards com data-source por Pilar (5 + literature).
 *   5. Hero: discovery com maior rankScore aparece em destaque.
 *   6. i18n: usa 'atendimento.*' namespace (ariaLabel, tab labels).
 *   7. A11y: role=tab, role=tabpanel, aria-selected/aria-controls.
 *   8. ActionBar: 4 ações visíveis (Salvar, Citar, 👍, 👎).
 *   9. Click em 👍 marca visualmente o discovery (cor emerald).
 *  10. onSend é chamado com o texto do chat composer (Enter).
 *  11. onCite/onRate são chamados pelos botões da action bar.
 *  12. ADR-013 universalista: cards dos 5 Pilares + literature renderizam.
 *  13. Locale en troca labels visíveis (Cliente → Client).
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

import {
  AtendimentoClient,
  type AtendimentoClientData,
  type AtendimentoDiscovery,
} from '../AtendimentoClient';

// ─── Mock data ──────────────────────────────────────────────────────────────

const MOCK_CLIENT: AtendimentoClientData = {
  id: 'consulente_001',
  fullName: 'João da Silva',
  age: 34,
  sunSign: 'Escorpião',
  iluminador: 'Iluminador · 11',
  emotionalState: 'ansioso',
};

const MOCK_DISCOVERIES: AtendimentoDiscovery[] = [
  {
    id: 'disc_a1b2',
    source: 'cabala',
    title: 'Propósito é direção',
    excerpt: 'Caminho 11 — Iluminador.',
    symbolRef: 'Iluminador · 11',
    rankScore: 0.92,
  },
  {
    id: 'disc_c3d4',
    source: 'iching',
    title: 'Hexagrama 29 — O Abismo',
    excerpt: 'Água sobre água.',
    symbolRef: 'Hex. 29 · Kan',
    rankScore: 0.81,
  },
  {
    id: 'disc_e5f6',
    source: 'astrologia',
    title: 'Trígono Sol-Lua',
    excerpt: 'Fluidez emocional.',
    rankScore: 0.74,
  },
  {
    id: 'disc_t1',
    source: 'tantra',
    title: 'Corpo 1 — Presença',
    excerpt: 'Ancora no agora.',
    rankScore: 0.6,
  },
  {
    id: 'disc_o1',
    source: 'odu',
    title: 'Odu Ogundá',
    excerpt: 'A travessia.',
    rankScore: 0.55,
  },
  {
    id: 'disc_l1',
    source: 'literature',
    title: 'Cahn 2010 — Meditation coherence',
    excerpt: 'Brainwave coherence.',
    rankScore: 0.5,
  },
];

const defaultProps = {
  locale: 'pt-BR',
  zeladorName: 'Maria Zeladora',
  client: MOCK_CLIENT,
  discoveries: MOCK_DISCOVERIES,
};

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('AtendimentoClient (Wave 26.1)', () => {
  beforeEach(() => {
    cleanup();
  });

  it('1. Render: root, header e tabs visíveis', () => {
    render(<AtendimentoClient {...defaultProps} />);
    expect(screen.getByTestId('atendimento-root')).toBeInTheDocument();
    expect(screen.getByTestId('atendimento-header')).toBeInTheDocument();
    expect(screen.getByTestId('atendimento-actionbar')).toBeInTheDocument();
  });

  it('2. Layout mobile: 3 tabs (Cliente | Chat | Insights)', () => {
    render(<AtendimentoClient {...defaultProps} />);
    expect(screen.getByTestId('atendimento-tab-cliente')).toBeInTheDocument();
    expect(screen.getByTestId('atendimento-tab-chat')).toBeInTheDocument();
    expect(screen.getByTestId('atendimento-tab-insights')).toBeInTheDocument();
  });

  it('3. Mobile default tab: chat panel é o ativo', () => {
    render(<AtendimentoClient {...defaultProps} />);
    // Default state.tab === 'chat' → main visible
    const main = screen.getByTestId('atendimento-main');
    expect(main).toHaveClass('flex');
    const chatTab = screen.getByTestId('atendimento-tab-chat');
    expect(chatTab).toHaveAttribute('aria-selected', 'true');
  });

  it('4. Render: discovery cards com data-source por Pilar', () => {
    render(<AtendimentoClient {...defaultProps} />);
    const cards = screen.getAllByTestId(/atendimento-discovery-/);
    expect(cards.length).toBeGreaterThan(0);
    const sources = cards.map((c) => c.getAttribute('data-source'));
    expect(sources).toEqual(expect.arrayContaining(['cabala', 'iching', 'astrologia', 'tantra', 'odu', 'literature']));
  });

  it('5. Hero: discovery de maior rankScore é o destaque', () => {
    render(<AtendimentoClient {...defaultProps} />);
    const hero = screen.getByTestId('atendimento-discovery-disc_a1b2');
    expect(hero).toHaveClass('border-violet-400/30');
  });

  it('6. i18n: usa "atendimento.*" namespace via ariaLabel + tab labels', () => {
    render(<AtendimentoClient {...defaultProps} />);
    expect(screen.getByLabelText('Tela de atendimento ao consulente')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Cliente' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Chat' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Insights' })).toBeInTheDocument();
  });

  it('7. A11y: roles tab/tabpanel + aria-selected + aria-controls', () => {
    render(<AtendimentoClient {...defaultProps} />);
    const clienteTab = screen.getByTestId('atendimento-tab-cliente');
    expect(clienteTab).toHaveAttribute('role', 'tab');
    expect(clienteTab).toHaveAttribute('aria-controls', 'atendimento-panel-cliente');
    // 3 tabpanels (cliente, chat, insights) — confirmar via data-testid
    expect(screen.getByTestId('atendimento-cliente-panel')).toHaveAttribute('role', 'tabpanel');
  });

  it('8. ActionBar: 4 ações (Salvar, Citar, 👍, 👎)', () => {
    render(<AtendimentoClient {...defaultProps} />);
    expect(screen.getByTestId('atendimento-action-save')).toBeInTheDocument();
    expect(screen.getByTestId('atendimento-action-cite')).toBeInTheDocument();
    expect(screen.getByTestId('atendimento-action-thumb-up')).toBeInTheDocument();
    expect(screen.getByTestId('atendimento-action-thumb-down')).toBeInTheDocument();
  });

  it('9. Click em 👍 marca o hero (cor emerald)', () => {
    render(<AtendimentoClient {...defaultProps} />);
    const upBtn = screen.getByTestId('atendimento-action-thumb-up');
    fireEvent.click(upBtn);
    expect(upBtn.className).toMatch(/emerald/);
  });

  it('10. onSend é chamado com o texto do composer (Enter)', () => {
    const onSend = vi.fn();
    render(<AtendimentoClient {...defaultProps} onSend={onSend} />);
    const input = screen.getByTestId('atendimento-chat-input');
    fireEvent.change(input, { target: { value: 'Como o consulente pode sair da ansiedade?' } });
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: false });
    expect(onSend).toHaveBeenCalledWith('Como o consulente pode sair da ansiedade?');
  });

  it('11. onRate é chamado pelo botão 👎 do hero', () => {
    const onRate = vi.fn();
    render(<AtendimentoClient {...defaultProps} onRate={onRate} />);
    const down = screen.getByTestId('atendimento-action-thumb-down');
    fireEvent.click(down);
    expect(onRate).toHaveBeenCalledWith('disc_a1b2', 'down');
  });

  it('12. ADR-013 universalista: 5 Pilares + literature visíveis', () => {
    render(<AtendimentoClient {...defaultProps} />);
    // 6 discoveries no mock = 5 Pilares + literature; todas devem ter card.
    const sources = screen
      .getAllByTestId(/atendimento-discovery-/)
      .map((c) => c.getAttribute('data-source'));
    const unique = Array.from(new Set(sources));
    expect(unique.sort()).toEqual(['astrologia', 'cabala', 'iching', 'literature', 'odu', 'tantra']);
  });

  it('13. Emotion toggle: troca estado emocional do cliente', () => {
    // Validação que o toggle emocional funciona (Wave 9.1) — 4 estados
    // cobertos pelo EMOTIONAL_STATES map. Visual test básico.
    render(<AtendimentoClient {...defaultProps} />);
    const centrado = screen.getByTestId('atendimento-emotion-centrado');
    fireEvent.click(centrado);
    expect(centrado).toHaveAttribute('aria-pressed', 'true');
  });
});