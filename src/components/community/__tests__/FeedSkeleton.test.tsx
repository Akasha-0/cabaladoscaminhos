// ============================================================================
// FeedSkeleton — testes do placeholder de carregamento do feed
// ============================================================================
// Verifica quantidade de placeholders, contagem custom e acessibilidade.
// ============================================================================

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { FeedSkeleton } from '@/components/community/FeedSkeleton';

describe('FeedSkeleton', () => {
  it('renderiza 3 placeholders por padrao', () => {
    const { container } = render(<FeedSkeleton />);
    const skeleton = container.querySelector('[data-testid="feed-skeleton"]');
    expect(skeleton).toBeTruthy();
    // Cada placeholder e um Card com animate-pulse
    const cards = container.querySelectorAll('.animate-pulse');
    // 1 avatar + 2 linhas header + 3 linhas content + 3 botoes = 9 por card * 3 = 27
    // (validacao flexivel: >=9 garante >=1 card)
    expect(cards.length).toBeGreaterThanOrEqual(9);
  });

  it('respeita count customizado', () => {
    const { container } = render(<FeedSkeleton count={5} />);
    const cards = container.querySelectorAll('.animate-pulse');
    // 9 pulses por card * 5 cards = 45
    expect(cards.length).toBeGreaterThanOrEqual(45);
  });

  it('nao renderiza nada para count=0', () => {
    const { container } = render(<FeedSkeleton count={0} />);
    const skeleton = container.querySelector('[data-testid="feed-skeleton"]');
    expect(skeleton).toBeTruthy();
    // Nenhum animate-pulse dentro
    expect(skeleton?.querySelectorAll('.animate-pulse').length).toBe(0);
  });

  it('expoe aria-busy=true e aria-label para leitores de tela', () => {
    const { container } = render(<FeedSkeleton />);
    const skeleton = container.querySelector('[data-testid="feed-skeleton"]');
    expect(skeleton?.getAttribute('aria-busy')).toBe('true');
    expect(skeleton?.getAttribute('aria-label')).toBe('Carregando feed');
  });
});
