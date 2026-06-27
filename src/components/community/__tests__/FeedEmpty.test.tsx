// ============================================================================
// FeedEmpty — testes do estado vazio do feed
// ============================================================================
// Renderização do card exibido quando o feed não tem posts.
// ============================================================================

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FeedEmpty } from '@/components/community/FeedEmpty';

describe('FeedEmpty', () => {
  it('renderiza titulo e mensagem padrao', () => {
    render(<FeedEmpty />);
    expect(screen.getByText('Nenhum post ainda')).toBeTruthy();
    expect(
      screen.getByText('Seja o primeiro a compartilhar algo com a comunidade.')
    ).toBeTruthy();
  });

  it('aceita titulo e mensagem customizados', () => {
    render(<FeedEmpty title="Sem resultados" message="Tente outra busca" />);
    expect(screen.getByText('Sem resultados')).toBeTruthy();
    expect(screen.getByText('Tente outra busca')).toBeTruthy();
  });

  it('mostra CTA de explorar por padrao', () => {
    render(<FeedEmpty />);
    const cta = screen.getByRole('link', { name: /Explorar a comunidade/ });
    expect(cta).toBeTruthy();
    expect(cta.getAttribute('href')).toBe('/explore');
  });

  it('omite CTA quando showCreateCta=false', () => {
    render(<FeedEmpty showCreateCta={false} />);
    expect(screen.queryByRole('link', { name: /Explorar a comunidade/ })).toBeNull();
  });

  it('expoe data-testid para integracao', () => {
    const { container } = render(<FeedEmpty />);
    expect(container.querySelector('[data-testid="feed-empty"]')).toBeTruthy();
  });
});
