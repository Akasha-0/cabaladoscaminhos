/**
 * @akasha/portal — MessageRating component tests (Wave 13.5)
 *
 * Cobertura:
 *   (a) Render: ambos os botões up/down com aria-label.
 *   (b) Click 'up' → POST /api/feedback com {messageId, rating:'up'}.
 *   (c) Optimistic UI: filled IMEDIATAMENTE antes da response chegar.
 *   (d) Sucesso: onThanks chamado com 'up'.
 *   (e) Erro HTTP (500): rollback para estado anterior + onError chamado.
 *   (f) Erro de rede (fetch reject): rollback + onError.
 *   (g) Re-click no mesmo rating (já committed): segundo POST é enviado
 *       (server faz upsert, atualiza). Testamos o comportamento.
 *   (h) Custom endpoint prop é usado (testabilidade).
 *   (i) aria-pressed reflete estado committed.
 *   (j) LGPD: POST NÃO inclui userId no body.
 *   (k) Idempotência durante pending: 2º click é noop (button disabled).
 *   (l) Comment NÃO é enviado no body (a feature não está exposta no widget).
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

import { MessageRating } from '../MessageRating';

const LABELS = {
  up: 'Útil',
  down: 'Não útil',
  submitting: 'Enviando...',
};

beforeEach(() => {
  vi.restoreAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('MessageRating — Wave 13.5', () => {
  it('(a) renderiza 2 botões (up/down) com aria-label', () => {
    render(
      <MessageRating messageId="msg-1" labels={LABELS} />
    );
    expect(screen.getByLabelText('Útil')).toBeInTheDocument();
    expect(screen.getByLabelText('Não útil')).toBeInTheDocument();
  });

  it('(b) click "up" envia POST com {messageId, rating:"up"}', async () => {
    const fetchSpy = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true, id: 'x' }), { status: 201 })
    );
    vi.stubGlobal('fetch', fetchSpy);

    render(<MessageRating messageId="msg-42" labels={LABELS} />);
    fireEvent.click(screen.getByTestId('mentor-message-rating-up'));

    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1));
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('/api/feedback');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body as string)).toEqual({
      messageId: 'msg-42',
      rating: 'up',
    });
    expect(init.credentials).toBe('include');
  });

  it('(c) optimistic UI: ícone fica filled IMEDIATAMENTE (não espera response)', async () => {
    let resolveFn: (v: Response) => void = () => {};
    const pending = new Promise<Response>((resolve) => {
      resolveFn = resolve;
    });
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(pending));

    render(<MessageRating messageId="msg-1" labels={LABELS} />);
    fireEvent.click(screen.getByTestId('mentor-message-rating-down'));

    // Imediatamente após click — antes de resolver o fetch — o botão
    // deve estar aria-pressed=true
    await waitFor(() => {
      const btn = screen.getByTestId('mentor-message-rating-down');
      expect(btn.getAttribute('aria-pressed')).toBe('true');
    });

    // Limpa
    resolveFn(new Response('{}', { status: 201 }));
  });

  it('(d) sucesso: onThanks é chamado com o rating', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ ok: true, id: 'x' }), { status: 201 })
      )
    );
    const onThanks = vi.fn();

    render(
      <MessageRating
        messageId="msg-1"
        labels={LABELS}
        onThanks={onThanks}
      />
    );
    fireEvent.click(screen.getByTestId('mentor-message-rating-up'));

    await waitFor(() => expect(onThanks).toHaveBeenCalledWith('up'));
  });

  it('(e) erro HTTP (500): rollback + onError', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: 'db_error' }), { status: 500 })
      )
    );
    const onError = vi.fn();
    const onThanks = vi.fn();

    render(
      <MessageRating
        messageId="msg-1"
        labels={LABELS}
        onError={onError}
        onThanks={onThanks}
      />
    );
    fireEvent.click(screen.getByTestId('mentor-message-rating-up'));

    await waitFor(() => expect(onError).toHaveBeenCalled());
    expect(onError.mock.calls[0]?.[0]).toContain('db_error');
    expect(onThanks).not.toHaveBeenCalled();

    // Rollback: aria-pressed voltou para false
    expect(
      screen.getByTestId('mentor-message-rating-up').getAttribute('aria-pressed')
    ).toBe('false');
  });

  it('(f) erro de rede (fetch reject): rollback + onError', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    const onError = vi.fn();

    render(
      <MessageRating
        messageId="msg-1"
        labels={LABELS}
        onError={onError}
      />
    );
    fireEvent.click(screen.getByTestId('mentor-message-rating-down'));

    await waitFor(() => expect(onError).toHaveBeenCalled());
    expect(onError.mock.calls[0]?.[0]).toContain('Failed to fetch');
    // Rollback: nenhum botão pressionado
    expect(
      screen.getByTestId('mentor-message-rating-down').getAttribute('aria-pressed')
    ).toBe('false');
  });

  it('(g) re-click no MESMO rating já committed: envia outro POST (server faz upsert)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ ok: true, id: 'x' }), { status: 200 })
      )
    );

    render(<MessageRating messageId="msg-1" labels={LABELS} />);
    fireEvent.click(screen.getByTestId('mentor-message-rating-up'));

    await waitFor(() =>
      expect(
        screen
          .getByTestId('mentor-message-rating-up')
          .getAttribute('aria-pressed')
      ).toBe('true')
    );

    // Segundo click — botão deve estar habilitado (pending já limpou)
    fireEvent.click(screen.getByTestId('mentor-message-rating-up'));

    await waitFor(() => {
      // 2 POSTs no total
      expect((globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls.length).toBeGreaterThanOrEqual(2);
    });
  });

  it('(h) endpoint customizado é usado', async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValue(new Response('{}', { status: 201 }));
    vi.stubGlobal('fetch', fetchSpy);

    render(
      <MessageRating
        messageId="msg-1"
        labels={LABELS}
        endpoint="/api/test/feedback"
      />
    );
    fireEvent.click(screen.getByTestId('mentor-message-rating-up'));

    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1));
    expect(fetchSpy.mock.calls[0]?.[0]).toBe('/api/test/feedback');
  });

  it('(i) aria-pressed reflete committed em ambos os botões (mutuamente exclusivos)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('{}', { status: 201 }))
    );

    render(<MessageRating messageId="msg-1" labels={LABELS} />);
    fireEvent.click(screen.getByTestId('mentor-message-rating-up'));

    await waitFor(() => {
      expect(
        screen.getByTestId('mentor-message-rating-up').getAttribute('aria-pressed')
      ).toBe('true');
      expect(
        screen.getByTestId('mentor-message-rating-down').getAttribute('aria-pressed')
      ).toBe('false');
    });
  });

  it('(j) LGPD: POST NÃO inclui userId no body', async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValue(new Response('{}', { status: 201 }));
    vi.stubGlobal('fetch', fetchSpy);

    render(<MessageRating messageId="msg-1" labels={LABELS} />);
    fireEvent.click(screen.getByTestId('mentor-message-rating-up'));

    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1));
    const body = JSON.parse(fetchSpy.mock.calls[0]?.[1]?.body as string);
    expect(body).not.toHaveProperty('userId');
    expect(body).not.toHaveProperty('email');
    expect(body).not.toHaveProperty('content');
  });

  it('(k) idempotência durante pending: 2º click é ignorado', async () => {
    let resolveFn: (v: Response) => void = () => {};
    const pending = new Promise<Response>((resolve) => {
      resolveFn = resolve;
    });
    const fetchSpy = vi.fn().mockReturnValue(pending);
    vi.stubGlobal('fetch', fetchSpy);

    render(<MessageRating messageId="msg-1" labels={LABELS} />);
    fireEvent.click(screen.getByTestId('mentor-message-rating-up'));
    fireEvent.click(screen.getByTestId('mentor-message-rating-down'));
    fireEvent.click(screen.getByTestId('mentor-message-rating-up'));

    // Apenas 1 fetch foi disparado (o 1º click), os outros são noop
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    // Limpa
    act(() => {
      resolveFn(new Response('{}', { status: 201 }));
    });
  });

  it('(l) widget não envia "comment" no body (campo não exposto)', async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValue(new Response('{}', { status: 201 }));
    vi.stubGlobal('fetch', fetchSpy);

    render(<MessageRating messageId="msg-1" labels={LABELS} />);
    fireEvent.click(screen.getByTestId('mentor-message-rating-up'));

    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1));
    const body = JSON.parse(fetchSpy.mock.calls[0]?.[1]?.body as string);
    expect(body).not.toHaveProperty('comment');
  });
});
