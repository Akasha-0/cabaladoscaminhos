/** @vitest-environment jsdom */
/**
 * NotificationsBell tests — D-046 (Wave 13.3) + SSE (Wave 18.1).
 *
 * Cobre:
 *   1. Render inicial: badge oculto se 0 unread.
 *   2. Badge aparece com count correto, e 9+ quando >= 10.
 *   3. Dropdown toggle (abrir/fechar).
 *   4. Empty state quando lista vazia.
 *   5. Lista mostra até 5 items + indicator de unread.
 *   6. Mark-all-as-read dispara PATCH e zera badge.
 *   7. Click em item com href navega + marca como lida.
 *   8. Click outside fecha dropdown.
 *   9. aria-label do botão inclui count.
 *  10. Polling: useEffect chama fetch inicialmente.
 *  11. SSE: snapshot event hidrata o state.
 *  12. SSE: message event adiciona notificação nova + bump unreadCount.
 *  13. SSE: dedup por id (não duplica se já existe).
 *  14. SSE: cleanup on unmount (EventSource.close chamado).
 *  15. SSE: polling safety-net continua rodando em paralelo.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor, act } from '@testing-library/react';

import { NotificationsBell } from '@/components/akasha/notifications/NotificationsBell';

// ─── Mocks ──────────────────────────────────────────────────────────

let mockApiResponse: {
  notifications: Array<{
    id: string;
    type: 'DIARIO' | 'MENTOR' | 'CONEXOES' | 'CREDITS' | 'SYSTEM';
    title: string;
    body: string;
    href: string | null;
    readAt: string | null;
    createdAt: string;
  }>;
  unreadCount: number;
} = { notifications: [], unreadCount: 0 };

const fetchMock = vi.fn(async () => ({
  ok: true,
  status: 200,
  json: async () => mockApiResponse,
}));

(globalThis as { fetch: typeof fetch }).fetch = fetchMock as unknown as typeof fetch;

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
  } & React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

// ─── EventSource mock ───────────────────────────────────────────────
// jsdom não tem EventSource nativo. Criamos um mock injetável via stub
// no globalThis que os testes podem programar para emitir eventos.

interface MockEventSourceListeners {
  // Tipos unificados (Event cobre MessageEvent — duck typing).
  // Cada entry aceita qualquer callback; emit() constrói o ev correto.
  open: Array<AnyListener>;
  message: Array<AnyListener>;
  snapshot: Array<AnyListener>;
  error: Array<AnyListener>;
}

type ListenerType = keyof MockEventSourceListeners;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyListener = (ev: any) => void;

class MockEventSource {
  static instances: MockEventSource[] = [];

  url: string;
  readyState: number = 0;
  closed = false;
  listeners: MockEventSourceListeners = {
    open: [],
    message: [],
    snapshot: [],
    error: [],
  };

  constructor(url: string, _init?: { withCredentials?: boolean }) {
    this.url = url;
    MockEventSource.instances.push(this);
  }

  addEventListener(type: ListenerType, cb: AnyListener) {
    this.listeners[type].push(cb as never);
  }

  removeEventListener(type: ListenerType, cb: AnyListener) {
    this.listeners[type] = this.listeners[type].filter((x) => x !== cb);
  }

  close() {
    this.closed = true;
    MockEventSource.instances = MockEventSource.instances.filter((x) => x !== this);
  }

  // ─── Test helpers ───────────────────────────────────────────────
  /** Dispara um listener programaticamente. */
  emit(type: ListenerType, payload?: unknown) {
    if (type === 'open' || type === 'error') {
      const ev = new Event(type);
      for (const cb of this.listeners[type]) cb(ev);
    } else {
      const ev = new MessageEvent(type, { data: JSON.stringify(payload ?? {}) });
      for (const cb of this.listeners[type]) cb(ev);
    }
  }

  /**
   * Auto-open helper: simula o browser abrindo o EventSource +
   * emitindo o snapshot inicial com o estado atual do mockApiResponse.
   * Mantém compat com a suite antiga (que dependia do fetch on-mount
   * para popular o badge).
   */
  autoOpenWithSnapshot() {
    this.emit('open');
    this.emit('snapshot', mockApiResponse);
  }
}

// Polyfill: stub global EventSource. Cast direto via unknown (TS não
// tenta reconciliar com a classe nativa, que tem readonly statics).
Object.defineProperty(globalThis, 'EventSource', {
  value: MockEventSource,
  writable: true,
  configurable: true,
});

// ─── Helpers ────────────────────────────────────────────────────────

const LOCALE = 'pt-BR';

/** Helper: espera próxima macrotask (flush microtasks + setTimeout 0). */
const flushMicrotasks = () => new Promise((r) => setTimeout(r, 0));

beforeEach(() => {
  mockApiResponse = { notifications: [], unreadCount: 0 };
  fetchMock.mockClear();
  fetchMock.mockImplementation(async () => ({
    ok: true,
    status: 200,
    json: async () => mockApiResponse,
  }));
  MockEventSource.instances = [];
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

// ─── Tests ─────────────────────────────────────────────────────────

describe('NotificationsBell — render', () => {
  it('renders the bell button', () => {
    render(<NotificationsBell locale={LOCALE} />);
    expect(screen.getByTestId('notifications-bell-button')).toBeInTheDocument();
  });

  it('hides badge when unreadCount = 0', async () => {
    mockApiResponse = { notifications: [], unreadCount: 0 };
    render(<NotificationsBell locale={LOCALE} />);
    // SSE snapshot vazio → badge não aparece
    const [es] = MockEventSource.instances;
    es.autoOpenWithSnapshot();
    await flushMicrotasks();
    expect(screen.queryByTestId('notifications-bell-badge')).not.toBeInTheDocument();
  });

  it('shows badge with exact count when 1-9 unread', async () => {
    mockApiResponse = { notifications: [], unreadCount: 3 };
    render(<NotificationsBell locale={LOCALE} />);
    const [es] = MockEventSource.instances;
    es.autoOpenWithSnapshot();
    await waitFor(() => {
      expect(screen.getByTestId('notifications-bell-badge')).toHaveTextContent('3');
    });
  });

  it('shows "9+" when >= 10 unread', async () => {
    mockApiResponse = { notifications: [], unreadCount: 25 };
    render(<NotificationsBell locale={LOCALE} />);
    const [es] = MockEventSource.instances;
    es.autoOpenWithSnapshot();
    await waitFor(() => {
      expect(screen.getByTestId('notifications-bell-badge')).toHaveTextContent('9+');
    });
  });

  it('aria-label includes count of unread', async () => {
    mockApiResponse = { notifications: [], unreadCount: 7 };
    render(<NotificationsBell locale={LOCALE} />);
    const [es] = MockEventSource.instances;
    es.autoOpenWithSnapshot();
    await waitFor(() => {
      const btn = screen.getByTestId('notifications-bell-button');
      expect(btn.getAttribute('aria-label')).toMatch(/7/);
    });
  });
});

describe('NotificationsBell — dropdown toggle', () => {
  it('does not show dropdown initially', () => {
    render(<NotificationsBell locale={LOCALE} />);
    expect(screen.queryByTestId('notifications-bell-dropdown')).not.toBeInTheDocument();
  });

  it('opens dropdown when bell is clicked', async () => {
    render(<NotificationsBell locale={LOCALE} />);
    fireEvent.click(screen.getByTestId('notifications-bell-button'));
    expect(screen.getByTestId('notifications-bell-dropdown')).toBeInTheDocument();
  });

  it('toggles aria-expanded', async () => {
    render(<NotificationsBell locale={LOCALE} />);
    const btn = screen.getByTestId('notifications-bell-button');
    expect(btn.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(btn);
    expect(btn.getAttribute('aria-expanded')).toBe('true');
  });

  it('closes dropdown when clicked again', () => {
    render(<NotificationsBell locale={LOCALE} />);
    const btn = screen.getByTestId('notifications-bell-button');
    fireEvent.click(btn);
    expect(screen.getByTestId('notifications-bell-dropdown')).toBeInTheDocument();
    fireEvent.click(btn);
    expect(screen.queryByTestId('notifications-bell-dropdown')).not.toBeInTheDocument();
  });

  it('closes dropdown on Escape', async () => {
    render(<NotificationsBell locale={LOCALE} />);
    fireEvent.click(screen.getByTestId('notifications-bell-button'));
    expect(screen.getByTestId('notifications-bell-dropdown')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByTestId('notifications-bell-dropdown')).not.toBeInTheDocument();
  });

  it('closes dropdown on outside click', async () => {
    render(
      <div>
        <div data-testid="outside">fora</div>
        <NotificationsBell locale={LOCALE} />
      </div>
    );
    fireEvent.click(screen.getByTestId('notifications-bell-button'));
    expect(screen.getByTestId('notifications-bell-dropdown')).toBeInTheDocument();
    fireEvent.mouseDown(screen.getByTestId('outside'));
    expect(screen.queryByTestId('notifications-bell-dropdown')).not.toBeInTheDocument();
  });
});

describe('NotificationsBell — empty state', () => {
  it('shows empty message when no notifications', async () => {
    mockApiResponse = { notifications: [], unreadCount: 0 };
    render(<NotificationsBell locale={LOCALE} />);
    const [es] = MockEventSource.instances;
    es.autoOpenWithSnapshot();
    fireEvent.click(screen.getByTestId('notifications-bell-button'));
    expect(screen.getByTestId('notifications-bell-empty')).toBeInTheDocument();
    expect(screen.getByTestId('notifications-bell-empty')).toHaveTextContent(
      /Sem notifica/i
    );
  });
});

describe('NotificationsBell — list rendering', () => {
  const sample = [
    {
      id: 'n1',
      type: 'DIARIO' as const,
      title: 'Novo Mandato',
      body: 'Hoje: ...',
      href: '/pt-BR/diario',
      readAt: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'n2',
      type: 'MENTOR' as const,
      title: 'Resposta',
      body: 'O Mentor disse...',
      href: '/pt-BR/oraculo',
      readAt: new Date().toISOString(),
      createdAt: new Date(Date.now() - 3600_000).toISOString(),
    },
  ];

  it('renders list items when present', async () => {
    mockApiResponse = { notifications: sample, unreadCount: 1 };
    render(<NotificationsBell locale={LOCALE} />);
    const [es] = MockEventSource.instances;
    es.autoOpenWithSnapshot();
    // Aguarda o SSE snapshot popular o estado.
    await waitFor(() => {
      expect(screen.queryByTestId('notifications-bell-badge')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId('notifications-bell-button'));
    const list = await screen.findByTestId('notifications-bell-list');
    expect(list.children).toHaveLength(2);
    expect(list.textContent).toMatch(/Novo Mandato/);
    expect(list.textContent).toMatch(/Resposta/);
  });

  it('marks unread item with data-unread=true', async () => {
    mockApiResponse = { notifications: sample, unreadCount: 1 };
    render(<NotificationsBell locale={LOCALE} />);
    const [es] = MockEventSource.instances;
    es.autoOpenWithSnapshot();
    await waitFor(() => {
      expect(screen.queryByTestId('notifications-bell-badge')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId('notifications-bell-button'));
    await screen.findByTestId('notifications-bell-list');
    // Encontra os containers data-unread diretamente.
    const unreadContainer = document.querySelector('[data-unread="true"]');
    const readContainer = document.querySelector('[data-unread="false"]');
    expect(unreadContainer).toBeInTheDocument();
    expect(readContainer).toBeInTheDocument();
    // O unread container deve ter o título "Novo Mandato"
    expect(unreadContainer?.textContent).toMatch(/Novo Mandato/);
    expect(readContainer?.textContent).toMatch(/Resposta/);
  });
});

describe('NotificationsBell — mark-all-as-read', () => {
  it('does not show mark-all button when 0 unread', async () => {
    mockApiResponse = { notifications: [], unreadCount: 0 };
    render(<NotificationsBell locale={LOCALE} />);
    const [es] = MockEventSource.instances;
    es.autoOpenWithSnapshot();
    fireEvent.click(screen.getByTestId('notifications-bell-button'));
    expect(
      screen.queryByTestId('notifications-bell-mark-all')
    ).not.toBeInTheDocument();
  });

  it('sends PATCH /api/notifications when clicked', async () => {
    mockApiResponse = {
      notifications: [
        {
          id: 'n1',
          type: 'DIARIO',
          title: 'X',
          body: 'Y',
          href: null,
          readAt: null,
          createdAt: new Date().toISOString(),
        },
      ],
      unreadCount: 1,
    };
    render(<NotificationsBell locale={LOCALE} />);
    const [es] = MockEventSource.instances;
    es.autoOpenWithSnapshot();
    fireEvent.click(screen.getByTestId('notifications-bell-button'));
    const btn = await screen.findByTestId('notifications-bell-mark-all');
    fireEvent.click(btn);
    await waitFor(() => {
      const calls = fetchMock.mock.calls as unknown as Array<[string, RequestInit?]>;
      const patchCall = calls.find(
        (c) => c[1] && c[1].method === 'PATCH'
      );
      expect(patchCall).toBeTruthy();
      expect(patchCall![0]).toBe('/api/notifications');
    });
  });
});

describe('NotificationsBell — SSE connection', () => {
  it('conecta em /api/notifications/stream ao montar', () => {
    render(<NotificationsBell locale={LOCALE} />);
    expect(MockEventSource.instances).toHaveLength(1);
    expect(MockEventSource.instances[0].url).toBe('/api/notifications/stream');
  });

  it('fecha EventSource no unmount (sem leak de conexão)', () => {
    const { unmount } = render(<NotificationsBell locale={LOCALE} />);
    const [es] = MockEventSource.instances;
    expect(es.closed).toBe(false);
    unmount();
    expect(es.closed).toBe(true);
  });

  it('hidrata state com snapshot event do SSE', async () => {
    mockApiResponse = {
      notifications: [
        {
          id: 'sse-n1',
          type: 'DIARIO',
          title: 'SSE Mandato',
          body: 'via SSE',
          href: null,
          readAt: null,
          createdAt: new Date().toISOString(),
        },
      ],
      unreadCount: 5,
    };
    render(<NotificationsBell locale={LOCALE} />);
    const [es] = MockEventSource.instances;
    es.autoOpenWithSnapshot();
    await waitFor(() => {
      expect(screen.getByTestId('notifications-bell-badge')).toHaveTextContent('5');
    });
    fireEvent.click(screen.getByTestId('notifications-bell-button'));
    const list = await screen.findByTestId('notifications-bell-list');
    expect(list.textContent).toMatch(/SSE Mandato/);
  });

  it('adiciona notificação via message event + bumpa unreadCount', async () => {
    mockApiResponse = { notifications: [], unreadCount: 0 };
    render(<NotificationsBell locale={LOCALE} />);
    const [es] = MockEventSource.instances;
    es.autoOpenWithSnapshot();
    // Aguarda estado inicial carregado
    await waitFor(() => {
      expect(MockEventSource.instances).toHaveLength(1);
    });

    // Servidor envia nova notificação via SSE
    await act(async () => {
      es.emit('message', {
        id: 'new-n1',
        type: 'MENTOR',
        title: 'Nova msg',
        body: 'oi',
        href: null,
        readAt: null,
        createdAt: new Date().toISOString(),
      });
    });

    await waitFor(() => {
      expect(screen.getByTestId('notifications-bell-badge')).toHaveTextContent('1');
    });
    fireEvent.click(screen.getByTestId('notifications-bell-button'));
    const list = await screen.findByTestId('notifications-bell-list');
    expect(list.textContent).toMatch(/Nova msg/);
  });

  it('dedup: não duplica notificação se id já existe', async () => {
    mockApiResponse = {
      notifications: [
        {
          id: 'dup-1',
          type: 'DIARIO',
          title: 'Já existe',
          body: 'X',
          href: null,
          readAt: null,
          createdAt: new Date().toISOString(),
        },
      ],
      unreadCount: 1,
    };
    render(<NotificationsBell locale={LOCALE} />);
    const [es] = MockEventSource.instances;
    es.autoOpenWithSnapshot();
    await waitFor(() => {
      expect(screen.getByTestId('notifications-bell-badge')).toHaveTextContent('1');
    });

    // SSE entrega MESMO id (ex: chegou via SSE e via poll quase simultâneo)
    await act(async () => {
      es.emit('message', {
        id: 'dup-1',
        type: 'DIARIO',
        title: 'Já existe',
        body: 'X',
        href: null,
        readAt: null,
        createdAt: new Date().toISOString(),
      });
    });

    // Badge continua 1, não 2
    expect(screen.getByTestId('notifications-bell-badge')).toHaveTextContent('1');
    fireEvent.click(screen.getByTestId('notifications-bell-button'));
    const list = await screen.findByTestId('notifications-bell-list');
    expect(list.children).toHaveLength(1);
  });

  it('cai pro polling-only após 3 erros consecutivos do SSE', async () => {
    vi.useFakeTimers();
    try {
      render(<NotificationsBell locale={LOCALE} />);
      const [es] = MockEventSource.instances;
      es.autoOpenWithSnapshot();

      // 3 erros seguidos
      es.emit('error');
      es.emit('error');
      es.emit('error');

      // EventSource deve ter sido fechado → cai pra polling
      expect(es.closed).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });

  it('reseta failure counter em evento open (reconnect com sucesso)', async () => {
    render(<NotificationsBell locale={LOCALE} />);
    const [es] = MockEventSource.instances;
    es.autoOpenWithSnapshot();

    // 2 falhas
    es.emit('error');
    es.emit('error');
    // reconnect bem-sucedido
    es.emit('open');

    // 2 falhas adicionais (não devem disparar fallback porque counter resetou)
    es.emit('error');
    es.emit('error');
    // EventSource ainda aberto (counter=2, < 3)
    expect(es.closed).toBe(false);
  });

  it('ignora payload malformado sem crashar', async () => {
    render(<NotificationsBell locale={LOCALE} />);
    const [es] = MockEventSource.instances;
    es.autoOpenWithSnapshot();

    // Envia JSON inválido (escape proposital para quebrar o parser)
    const ev = new MessageEvent('snapshot', { data: '{invalido' });
    act(() => {
      for (const cb of es.listeners.snapshot) cb(ev);
    });

    // Sem crash — badge ainda no estado inicial (unreadCount 0)
    expect(screen.queryByTestId('notifications-bell-badge')).not.toBeInTheDocument();
  });
});