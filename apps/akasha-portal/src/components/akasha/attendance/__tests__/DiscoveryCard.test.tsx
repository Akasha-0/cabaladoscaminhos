/**
 * @akasha/portal — DiscoveryCard tests
 *
 * Wave 22.2 Zelador Attendance UI. Renderiza um insight da IA no
 * /atendimento. Testa render estrutural + interações (citar / rate).
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { DiscoveryCard } from '../components/DiscoveryCard';
import type { AttendanceDiscovery } from '../shared';

const LABELS = {
  pillarLabel: 'Pilar',
  cited: 'Citada',
  upvoted: 'Útil',
  downvoted: 'Não útil',
};

const DISCOVERY: AttendanceDiscovery = {
  id: 'disc_test_1',
  source: 'cabala',
  title: 'Propósito é direção',
  excerpt: 'Caminho de Vida 11 — O Iluminador...',
  symbolRef: 'Iluminador · 11',
  rankScore: 0.92,
  createdAt: new Date(Date.now() - 60 * 1000).toISOString(),
};

describe('DiscoveryCard', () => {
  it('renderiza o card', () => {
    render(
      <DiscoveryCard
        discovery={DISCOVERY}
        locale="pt-BR"
        labels={LABELS}
      />
    );
    expect(screen.getByTestId('attendance-discovery-card')).toBeInTheDocument();
  });

  it('mostra o pilar de origem no badge', () => {
    render(
      <DiscoveryCard
        discovery={DISCOVERY}
        locale="pt-BR"
        labels={LABELS}
      />
    );
    const badge = screen.getByTestId('discovery-source-badge');
    expect(badge.textContent).toMatch(/Cabala/i);
  });

  it('mostra título e excerto', () => {
    render(
      <DiscoveryCard
        discovery={DISCOVERY}
        locale="pt-BR"
        labels={LABELS}
      />
    );
    expect(screen.getByTestId('discovery-title')).toHaveTextContent('Propósito é direção');
    expect(screen.getByTestId('discovery-excerpt')).toHaveTextContent('Caminho de Vida 11');
  });

  it('mostra symbolRef quando presente', () => {
    render(
      <DiscoveryCard
        discovery={DISCOVERY}
        locale="pt-BR"
        labels={LABELS}
      />
    );
    expect(screen.getByTestId('discovery-symbol-ref')).toHaveTextContent('Iluminador · 11');
  });

  it('expõe data-source e data-discovery-id', () => {
    render(
      <DiscoveryCard
        discovery={DISCOVERY}
        locale="pt-BR"
        labels={LABELS}
      />
    );
    const card = screen.getByTestId('attendance-discovery-card');
    expect(card.getAttribute('data-source')).toBe('cabala');
    expect(card.getAttribute('data-discovery-id')).toBe('disc_test_1');
  });

  it('dispara onCite ao clicar no botão Citar', () => {
    const onCite = vi.fn();
    render(
      <DiscoveryCard
        discovery={DISCOVERY}
        locale="pt-BR"
        labels={LABELS}
        onCite={onCite}
      />
    );
    fireEvent.click(screen.getByTestId('discovery-cite-button'));
    expect(onCite).toHaveBeenCalledWith('disc_test_1');
  });

  it('dispara onRate com "up" no upvote', () => {
    const onRate = vi.fn();
    render(
      <DiscoveryCard
        discovery={DISCOVERY}
        locale="pt-BR"
        labels={LABELS}
        onRate={onRate}
      />
    );
    fireEvent.click(screen.getByTestId('discovery-upvote'));
    expect(onRate).toHaveBeenCalledWith('disc_test_1', 'up');
  });

  it('dispara onRate com "down" no downvote', () => {
    const onRate = vi.fn();
    render(
      <DiscoveryCard
        discovery={DISCOVERY}
        locale="pt-BR"
        labels={LABELS}
        onRate={onRate}
      />
    );
    fireEvent.click(screen.getByTestId('discovery-downvote'));
    expect(onRate).toHaveBeenCalledWith('disc_test_1', 'down');
  });

  it('marca upvote como ativo quando currentRating="up"', () => {
    render(
      <DiscoveryCard
        discovery={DISCOVERY}
        locale="pt-BR"
        labels={LABELS}
        currentRating="up"
        onRate={vi.fn()}
      />
    );
    expect(screen.getByTestId('discovery-upvote').getAttribute('data-active')).toBe('true');
    expect(screen.getByTestId('discovery-downvote').getAttribute('data-active')).toBe('false');
  });

  it('suporta todos os 6 sources (universalista)', () => {
    const sources = ['cabala', 'astrologia', 'tantra', 'odu', 'iching', 'literature'] as const;
    for (const source of sources) {
      const { unmount } = render(
        <DiscoveryCard
          discovery={{ ...DISCOVERY, id: `d_${source}`, source }}
          locale="pt-BR"
          labels={LABELS}
        />
      );
      expect(screen.getByTestId('attendance-discovery-card').getAttribute('data-source')).toBe(source);
      unmount();
    }
  });
});
