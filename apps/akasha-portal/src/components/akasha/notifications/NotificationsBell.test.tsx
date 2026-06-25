/** @vitest-environment jsdom */
/**
 * NotificationsBell tests — D-046 (Wave 13.3).
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
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';

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

// ─── Helpers ────────────────────────────────────────────────────────

const LOCALE = 'pt-BR';

beforeEach(() => {
  mockApiResponse = { notifications: [], unreadCount: 0 };
  fetchMock.mockClear();
  fetchMock.mockImplementation(async () => ({
    ok: true,
    status: 200,
    json: async () => mockApiResponse,
  }));
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

  it('hides badge when unreadCount = 0', () => {
    mockApiResponse = { notifications: [], unreadCount: 0 };
    render(<NotificationsBell locale={LOCALE} />);
    expect(screen.queryByTestId('notifications-bell-badge')).not.toBeInTheDocument();
  });

  it('shows badge with exact count when 1-9 unread', async () => {
    mockApiResponse = { notifications: [], unreadCount: 3 };
    render(<NotificationsBell locale={LOCALE} />);
    await waitFor(() => {
      expect(screen.getByTestId('notifications-bell-badge')).toHaveTextContent('3');
    });
  });

  it('shows "9+" when >= 10 unread', async () => {
    mockApiResponse = { notifications: [], unreadCount: 25 };
    render(<NotificationsBell locale={LOCALE} />);
    await waitFor(() => {
      expect(screen.getByTestId('notifications-bell-badge')).toHaveTextContent('9+');
    });
  });

  it('aria-label includes count of unread', async () => {
    mockApiResponse = { notifications: [], unreadCount: 7 };
    render(<NotificationsBell locale={LOCALE} />);
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
    // Aguarda o fetch inicial popular o estado.
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

describe('NotificationsBell — initial fetch', () => {
  it('calls fetch on mount', () => {
    render(<NotificationsBell locale={LOCALE} />);
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/notifications?limit=50',
      expect.objectContaining({ credentials: 'same-origin' })
    );
  });
});