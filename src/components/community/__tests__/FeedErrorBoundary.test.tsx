// ============================================================================
// FeedError (FeedErrorBoundary) — testes do estado de erro do feed
// ============================================================================
// Renderização do card exibido quando o feed falha ao carregar.
// ============================================================================

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FeedError } from '@/components/community/FeedErrorBoundary';

describe('FeedError', () => {
  it('renderiza mensagem padrao de erro', () => {
    render(<FeedError />);
    expect(screen.getByText('Não conseguimos carregar o feed agora')).toBeTruthy();
    expect(screen.getByText('Tente novamente em alguns instantes.')).toBeTruthy();
  });

  it('mostra mensagem de erro customizada quando passada', () => {
    render(<FeedError error="Banco de dados indisponivel" />);
    expect(screen.getByText('Banco de dados indisponivel')).toBeTruthy();
  });

  it('omite botao de retry quando onRetry nao e fornecido', () => {
    render(<FeedError />);
    expect(screen.queryByRole('button', { name: /Tentar novamente/ })).toBeNull();
  });

  it('chama onRetry quando o botao e clicado', () => {
    const onRetry = vi.fn();
    render(<FeedError onRetry={onRetry} />);
    fireEvent.click(screen.getByRole('button', { name: /Tentar novamente/ }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('expoe role=alert e data-testid para acessibilidade e integracao', () => {
    const { container } = render(<FeedError />);
    const alert = container.querySelector('[role="alert"]');
    expect(alert).toBeTruthy();
    expect(alert?.getAttribute('data-testid')).toBe('feed-error');
  });
});
