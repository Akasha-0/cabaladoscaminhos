// tests/components/operator/SessionsList.test.tsx
// Testes do componente SessionsList (Fase 16).
// Cobre: abertura/fechamento do modal, listagem de sessões, parsing
// de userAgent, revogação individual, "Sair de Todos os Outros",
// estados de loading/erro/vazio.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { SessionsList, parseUserAgent } from '@/components/operator/SessionsList';

// ----------------------------------------------------------------------------
// Mocks
// ----------------------------------------------------------------------------

const mockListSessions = vi.fn();
const mockRevokeSession = vi.fn();
const mockRevokeAllSessions = vi.fn();

vi.mock('@/components/providers/OperatorAuthProvider', () => ({
  useOperatorAuth: () => ({
    listSessions: mockListSessions,
    revokeSession: mockRevokeSession,
    revokeAllSessions: mockRevokeAllSessions,
  }),
}));

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

const mockCurrentSession = {
  id: 'sess-current',
  ipAddress: '203.0.113.10',
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  createdAt: new Date(Date.now() - 60_000).toISOString(),
  expiresAt: new Date(Date.now() + 60_000).toISOString(),
  isCurrent: true,
};

const mockOtherSessionMobile = {
  id: 'sess-mobile',
  ipAddress: '198.51.100.5',
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  createdAt: new Date(Date.now() - 3600_000).toISOString(),
  expiresAt: new Date(Date.now() + 60_000).toISOString(),
  isCurrent: false,
};

const mockOtherSessionLinux = {
  id: 'sess-linux',
  ipAddress: '192.0.2.42',
  userAgent: 'Mozilla/5.0 (X11; Linux x86_64; rv:120.0) Gecko/20100101 Firefox/120.0',
  createdAt: new Date(Date.now() - 86_400_000).toISOString(),
  expiresAt: new Date(Date.now() + 60_000).toISOString(),
  isCurrent: false,
};

beforeEach(() => {
  mockListSessions.mockReset();
  mockRevokeSession.mockReset();
  mockRevokeAllSessions.mockReset();
});

afterEach(() => {
  vi.clearAllMocks();
});

// ============================================================================
// parseUserAgent — helper exposto para testes diretos
// ============================================================================

describe('parseUserAgent', () => {
  it('detecta Chrome no macOS (desktop)', () => {
    const ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    const info = parseUserAgent(ua);
    expect(info.kind).toBe('desktop');
    expect(info.label).toMatch(/Chrome/);
    expect(info.label).toMatch(/macOS/);
  });

  it('detecta Firefox no Linux (desktop)', () => {
    const ua = 'Mozilla/5.0 (X11; Linux x86_64; rv:120.0) Gecko/20100101 Firefox/120.0';
    const info = parseUserAgent(ua);
    expect(info.kind).toBe('desktop');
    expect(info.label).toMatch(/Firefox/);
    expect(info.label).toMatch(/Linux/);
  });

  it('detecta Safari no iPhone (mobile)', () => {
    const ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
    const info = parseUserAgent(ua);
    expect(info.kind).toBe('mobile');
    expect(info.label).toMatch(/Safari/);
    expect(info.label).toMatch(/iOS/);
  });

  it('detecta Windows', () => {
    const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    const info = parseUserAgent(ua);
    expect(info.kind).toBe('desktop');
    expect(info.label).toMatch(/Windows/);
  });

  it('detecta Android como mobile', () => {
    const ua = 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';
    const info = parseUserAgent(ua);
    expect(info.kind).toBe('mobile');
    expect(info.label).toMatch(/Android/);
  });

  it('detecta iPad como tablet', () => {
    const ua = 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
    const info = parseUserAgent(ua);
    expect(info.kind).toBe('tablet');
  });

  it('devolve "Desconhecido" para string vazia', () => {
    expect(parseUserAgent(null).label).toMatch(/desconhecido/i);
    expect(parseUserAgent(undefined).label).toMatch(/desconhecido/i);
    expect(parseUserAgent('').label).toMatch(/desconhecido/i);
  });

  it('cai pra "Navegador" se UA não bate em nada conhecido', () => {
    const info = parseUserAgent('SomeCustom/1.0');
    expect(info.kind).toBe('desktop');
    expect(info.label).toMatch(/Navegador/);
  });
});

// ============================================================================
// Abertura e carregamento
// ============================================================================

describe('SessionsList — abertura e carregamento', () => {
  it('não renderiza conteúdo visível quando open=false', async () => {
    mockListSessions.mockResolvedValue({ ok: true, sessions: [] });
    render(<SessionsList open={false} onOpenChange={() => {}} />);
    // Dialog ainda não abriu → listSessions NÃO foi chamado
    expect(mockListSessions).not.toHaveBeenCalled();
  });

  it('carrega sessões ao abrir e mostra loading inicial', async () => {
    mockListSessions.mockResolvedValue({ ok: true, sessions: [mockCurrentSession] });
    render(<SessionsList open={true} onOpenChange={() => {}} />);

    // Loading aparece
    expect(screen.getByText(/Carregando/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(mockListSessions).toHaveBeenCalledTimes(1);
    });

    // Sessão atual aparece
    await waitFor(() => {
      expect(screen.getByTestId('session-item')).toBeInTheDocument();
    });
  });

  it('mostra estado vazio quando não há sessões', async () => {
    mockListSessions.mockResolvedValue({ ok: true, sessions: [] });
    render(<SessionsList open={true} onOpenChange={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText(/Nenhuma sessão ativa/i)).toBeInTheDocument();
    });
  });

  it('mostra erro de carregamento se listSessions falha', async () => {
    mockListSessions.mockResolvedValue({ ok: false, error: 'Falha ao carregar' });
    render(<SessionsList open={true} onOpenChange={() => {}} />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/Falha ao carregar/);
    });
  });
});

// ============================================================================
// Renderização das sessões
// ============================================================================

describe('SessionsList — renderização', () => {
  it('destaca a sessão atual com badge "Esta sessão"', async () => {
    mockListSessions.mockResolvedValue({
      ok: true,
      sessions: [mockCurrentSession, mockOtherSessionMobile],
    });
    render(<SessionsList open={true} onOpenChange={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText('Esta sessão')).toBeInTheDocument();
    });
  });

  it('mostra IP e data de criação formatada', async () => {
    mockListSessions.mockResolvedValue({
      ok: true,
      sessions: [mockCurrentSession, mockOtherSessionMobile],
    });
    render(<SessionsList open={true} onOpenChange={() => {}} />);

    await waitFor(() => {
      // IPs aparecem em font-mono
      expect(screen.getByText('203.0.113.10')).toBeInTheDocument();
      expect(screen.getByText('198.51.100.5')).toBeInTheDocument();
    });

    // "Desde" + data formatada
    expect(screen.getAllByText(/Desde /i).length).toBeGreaterThanOrEqual(2);
  });

  it('parseia userAgent — mostra "Chrome no macOS" para desktop e "Safari no iOS" para iPhone', async () => {
    mockListSessions.mockResolvedValue({
      ok: true,
      sessions: [mockCurrentSession, mockOtherSessionMobile, mockOtherSessionLinux],
    });
    render(<SessionsList open={true} onOpenChange={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText(/Chrome no macOS/)).toBeInTheDocument();
      expect(screen.getByText(/Safari no iOS/)).toBeInTheDocument();
      expect(screen.getByText(/Firefox no Linux/)).toBeInTheDocument();
    });
  });

  it('separa visualmente "Outros dispositivos" da sessão atual', async () => {
    mockListSessions.mockResolvedValue({
      ok: true,
      sessions: [mockCurrentSession, mockOtherSessionMobile],
    });
    render(<SessionsList open={true} onOpenChange={() => {}} />);

    await waitFor(() => {
      // O label "Outros dispositivos" aparece como section header (div, não button)
      const headers = screen.getAllByText('Outros dispositivos');
      // Pelo menos 1 é um div (section header); o "Sair de Todos os Outros"
      // é um button. Filtra para garantir que o section header existe.
      const divHeader = headers.find((el) => el.tagName === 'DIV');
      expect(divHeader).toBeInTheDocument();
    });
  });

  it('NÃO mostra botão "Sair deste" na sessão atual', async () => {
    mockListSessions.mockResolvedValue({
      ok: true,
      sessions: [mockCurrentSession, mockOtherSessionMobile],
    });
    render(<SessionsList open={true} onOpenChange={() => {}} />);

    // Espera 2 items renderizarem (current + other)
    await waitFor(() => {
      expect(screen.getAllByTestId('session-item')).toHaveLength(2);
    });

    // "Sair deste" aparece só 1x (na sessão other)
    // Filtra por BUTTON (evita match com "Sair de Todos os Outros" do rodapé)
    const buttons = screen.getAllByRole('button', { name: /Sair deste/i });
    expect(buttons).toHaveLength(1);
  });

  it('NÃO mostra "Sair de Todos os Outros" se só tem a sessão atual', async () => {
    mockListSessions.mockResolvedValue({
      ok: true,
      sessions: [mockCurrentSession],
    });
    render(<SessionsList open={true} onOpenChange={() => {}} />);

    await waitFor(() => {
      expect(screen.getByTestId('session-item')).toBeInTheDocument();
    });

    expect(screen.queryByText(/Sair de Todos os Outros/i)).not.toBeInTheDocument();
  });
});

// ============================================================================
// Revogação individual
// ============================================================================

describe('SessionsList — revogação individual', () => {
  it('chama revokeSession ao clicar "Sair deste"', async () => {
    mockListSessions.mockResolvedValue({
      ok: true,
      sessions: [mockCurrentSession, mockOtherSessionMobile],
    });
    mockRevokeSession.mockResolvedValue({ ok: true });
    render(<SessionsList open={true} onOpenChange={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText('Sair deste')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Sair deste'));

    await waitFor(() => {
      expect(mockRevokeSession).toHaveBeenCalledWith('sess-mobile');
    });
  });

  it('refaz o fetch após revoke bem-sucedido', async () => {
    mockListSessions
      .mockResolvedValueOnce({
        ok: true,
        sessions: [mockCurrentSession, mockOtherSessionMobile],
      })
      .mockResolvedValueOnce({
        ok: true,
        sessions: [mockCurrentSession], // mobile sumiu
      });
    mockRevokeSession.mockResolvedValue({ ok: true });

    render(<SessionsList open={true} onOpenChange={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText('Sair deste')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Sair deste'));

    await waitFor(() => {
      expect(mockListSessions).toHaveBeenCalledTimes(2);
    });
  });

  it('mostra mensagem de sucesso após revoke', async () => {
    mockListSessions.mockResolvedValue({
      ok: true,
      sessions: [mockCurrentSession, mockOtherSessionMobile],
    });
    mockRevokeSession.mockResolvedValue({ ok: true });

    render(<SessionsList open={true} onOpenChange={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText('Sair deste')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Sair deste'));

    await waitFor(() => {
      expect(screen.getByText(/Sessão revogada/i)).toBeInTheDocument();
    });
  });

  it('mostra erro de revoke', async () => {
    mockListSessions.mockResolvedValue({
      ok: true,
      sessions: [mockCurrentSession, mockOtherSessionMobile],
    });
    mockRevokeSession.mockResolvedValue({ ok: false, error: 'Sessão já revogada' });

    render(<SessionsList open={true} onOpenChange={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText('Sair deste')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Sair deste'));

    await waitFor(() => {
      expect(screen.getByText(/Sessão já revogada/)).toBeInTheDocument();
    });
  });
});

// ============================================================================
// Revogação em massa
// ============================================================================

describe('SessionsList — "Sair de Todos os Outros"', () => {
  it('pede confirmação inline antes de revogar', async () => {
    mockListSessions.mockResolvedValue({
      ok: true,
      sessions: [mockCurrentSession, mockOtherSessionMobile, mockOtherSessionLinux],
    });
    render(<SessionsList open={true} onOpenChange={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText(/Sair de Todos os Outros/i)).toBeInTheDocument();
    });

    // Confirmação ainda não apareceu
    expect(screen.queryByText(/Tem certeza/i)).not.toBeInTheDocument();

    // Clica no botão
    fireEvent.click(screen.getByText(/Sair de Todos os Outros/i));

    // Confirmação aparece
    await waitFor(() => {
      expect(screen.getByText(/Tem certeza/i)).toBeInTheDocument();
    });

    // revokeAllSessions AINDA não foi chamado
    expect(mockRevokeAllSessions).not.toHaveBeenCalled();
  });

  it('chama revokeAllSessions após confirmação', async () => {
    mockListSessions.mockResolvedValue({
      ok: true,
      sessions: [mockCurrentSession, mockOtherSessionMobile],
    });
    mockRevokeAllSessions.mockResolvedValue({ ok: true, revokedCount: 1 });
    render(<SessionsList open={true} onOpenChange={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText(/Sair de Todos os Outros/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Sair de Todos os Outros/i));

    await waitFor(() => {
      expect(screen.getByText(/Sim, revogar todas/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Sim, revogar todas/i));

    await waitFor(() => {
      expect(mockRevokeAllSessions).toHaveBeenCalledTimes(1);
    });
  });

  it('cancela a confirmação sem revogar', async () => {
    mockListSessions.mockResolvedValue({
      ok: true,
      sessions: [mockCurrentSession, mockOtherSessionMobile],
    });
    render(<SessionsList open={true} onOpenChange={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText(/Sair de Todos os Outros/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Sair de Todos os Outros/i));
    await waitFor(() => {
      expect(screen.getByText(/Cancelar/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Cancelar/i));

    expect(mockRevokeAllSessions).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.queryByText(/Tem certeza/i)).not.toBeInTheDocument();
    });
  });

  it('mostra contador correto na confirmação (singular vs plural)', async () => {
    mockListSessions.mockResolvedValue({
      ok: true,
      sessions: [
        mockCurrentSession,
        mockOtherSessionMobile, // 1 dispositivo
      ],
    });
    render(<SessionsList open={true} onOpenChange={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText(/Sair de Todos os Outros/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Sair de Todos os Outros/i));

    await waitFor(() => {
      expect(screen.getByText(/1 dispositivo/)).toBeInTheDocument();
    });
  });

  it('mostra sucesso com count após revoke-all', async () => {
    mockListSessions.mockResolvedValue({
      ok: true,
      sessions: [mockCurrentSession, mockOtherSessionMobile, mockOtherSessionLinux],
    });
    mockRevokeAllSessions.mockResolvedValue({ ok: true, revokedCount: 2 });
    render(<SessionsList open={true} onOpenChange={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText(/Sair de Todos os Outros/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Sair de Todos os Outros/i));
    await waitFor(() => {
      expect(screen.getByText(/Sim, revogar todas/i)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText(/Sim, revogar todas/i));

    await waitFor(() => {
      expect(screen.getByText(/2 sessões revogadas/)).toBeInTheDocument();
    });
  });
});
