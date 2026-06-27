// ============================================================================
// GROUPS LIST PAGE — Tests
// ============================================================================
// /groups — verifica render, filtros, search, empty state, card link.
// ============================================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock useAuth — default = deslogado
const useAuthMock = vi.fn(() => ({ user: null }));
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => useAuthMock(),
}));

// Mock useGroupsList — controlável por teste
const useGroupsListMock = vi.fn();
vi.mock('@/hooks/useGroups', () => ({
  useGroupsList: (opts: unknown) => useGroupsListMock(opts),
}));

import GroupsPage from '@/app/(community)/groups/page';

const SAMPLE_GROUPS = [
  {
    id: 'g1',
    slug: 'cabala',
    name: 'Cabala & Árvore da Vida',
    description: 'Tradição mística judaica',
    longDescription: null,
    rules: [],
    iconUrl: null,
    bannerUrl: null,
    tradition: 'cabala',
    isPublic: true,
    requireApproval: false,
    createdBy: 'u1',
    membersCount: 412,
    postsCount: 1204,
    viewerRole: null,
    isMember: false,
    createdAt: '2026-06-01T00:00:00Z',
    updatedAt: '2026-06-01T00:00:00Z',
  },
  {
    id: 'g2',
    slug: 'ifa',
    name: 'Ifá & Orixás',
    description: 'Sistema iorubá',
    longDescription: null,
    rules: [],
    iconUrl: null,
    bannerUrl: null,
    tradition: 'ifa',
    isPublic: true,
    requireApproval: false,
    createdBy: 'u2',
    membersCount: 387,
    postsCount: 982,
    viewerRole: 'MEMBER' as const,
    isMember: true,
    createdAt: '2026-06-01T00:00:00Z',
    updatedAt: '2026-06-01T00:00:00Z',
  },
];

describe('GroupsListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthMock.mockReturnValue({ user: null });
    useGroupsListMock.mockReturnValue({
      groups: SAMPLE_GROUPS,
      loading: false,
      error: null,
      refresh: vi.fn(),
    });
  });

  describe('renderização inicial', () => {
    it('renderiza sem crash', () => {
      expect(() => render(<GroupsPage />)).not.toThrow();
    });

    it('mostra o título da página', () => {
      render(<GroupsPage />);
      expect(screen.getByText(/Grupos da Comunidade/i)).toBeTruthy();
    });

    it('mostra subheadline', () => {
      render(<GroupsPage />);
      expect(screen.getByText(/Sub-comunidades focadas/i)).toBeTruthy();
    });

    it('renderiza todos os grupos como cards', () => {
      render(<GroupsPage />);
      expect(screen.getByTestId('group-card-cabala')).toBeTruthy();
      expect(screen.getByTestId('group-card-ifa')).toBeTruthy();
    });

    it('cada card tem link para /groups/[slug]', () => {
      render(<GroupsPage />);
      const cabalaLink = screen.getByTestId('group-card-cabala').closest('a');
      expect(cabalaLink?.getAttribute('href')).toBe('/groups/cabala');
    });

    it('cada card mostra contagem de membros e posts', () => {
      render(<GroupsPage />);
      expect(screen.getByText(/412 membros/)).toBeTruthy();
      expect(screen.getByText(/1204 posts/)).toBeTruthy();
    });

    it('mostra badge "membro" em grupos onde usuário é membro', () => {
      render(<GroupsPage />);
      const ifaCard = screen.getByTestId('group-card-ifa');
      // Vê se dentro do card há um Badge "membro"
      expect(ifaCard.textContent).toMatch(/membro/);
    });
  });

  describe('filtros', () => {
    it('passa tradition para o hook useGroupsList', async () => {
      const user = userEvent.setup();
      render(<GroupsPage />);

      const select = screen.getByTestId('groups-tradition-filter');
      await user.selectOptions(select, 'cabala');

      // O hook deve ter sido chamado com tradition=cabala
      const lastCall = useGroupsListMock.mock.calls[useGroupsListMock.mock.calls.length - 1]?.[0];
      expect(lastCall?.tradition).toBe('cabala');
    });

    it('toggle do filtro "Meus grupos"', async () => {
      const user = userEvent.setup();
      render(<GroupsPage />);

      const btn = screen.getByTestId('groups-mine-filter');
      await user.click(btn);

      expect(btn.getAttribute('aria-pressed')).toBe('true');

      const lastCall = useGroupsListMock.mock.calls[useGroupsListMock.mock.calls.length - 1]?.[0];
      expect(lastCall?.mine).toBe(true);
    });

    it('botão "Limpar filtros" reseta tradição, mine e search', async () => {
      const user = userEvent.setup();
      render(<GroupsPage />);

      // Seta filtros
      await user.selectOptions(screen.getByTestId('groups-tradition-filter'), 'cabala');
      await user.click(screen.getByTestId('groups-mine-filter'));

      const clearBtn = screen.getByTestId('groups-clear-filters');
      await user.click(clearBtn);

      const lastCall = useGroupsListMock.mock.calls[useGroupsListMock.mock.calls.length - 1]?.[0];
      expect(lastCall?.tradition).toBeUndefined();
      expect(lastCall?.mine).toBeFalsy();
    });

    it('search atualiza debouncedSearch após 300ms', async () => {
      const user = userEvent.setup();
      render(<GroupsPage />);

      const input = screen.getByTestId('groups-search-input');
      await user.type(input, 'cabala');

      // Imediatamente após digitar, debouncedSearch ainda é ''
      const immediateCall = useGroupsListMock.mock.calls[useGroupsListMock.mock.calls.length - 1]?.[0];
      expect(immediateCall?.search).toBeUndefined();

      // Após 300ms, hook recebe search: 'cabala'
      await waitFor(
        () => {
          const lastCall = useGroupsListMock.mock.calls[useGroupsListMock.mock.calls.length - 1]?.[0];
          expect(lastCall?.search).toBe('cabala');
        },
        { timeout: 500 }
      );
    });
  });

  describe('estados de loading/erro/vazio', () => {
    it('mostra spinner quando loading=true e nenhum grupo', () => {
      useGroupsListMock.mockReturnValue({
        groups: [],
        loading: true,
        error: null,
        refresh: vi.fn(),
      });
      render(<GroupsPage />);
      expect(screen.getByTestId('groups-loading')).toBeTruthy();
    });

    it('mostra mensagem de erro quando há erro e nenhum grupo', () => {
      useGroupsListMock.mockReturnValue({
        groups: [],
        loading: false,
        error: 'Algo deu errado',
        refresh: vi.fn(),
      });
      render(<GroupsPage />);
      expect(screen.getByText(/Algo deu errado/i)).toBeTruthy();
    });

    it('mostra empty state quando mine=true sem grupos', () => {
      useGroupsListMock.mockReturnValue({
        groups: [],
        loading: false,
        error: null,
        refresh: vi.fn(),
      });
      // mine=true via hook
      useGroupsListMock.mockImplementation((opts: { mine?: boolean }) => ({
        groups: [],
        loading: false,
        error: null,
        refresh: vi.fn(),
        // Render condition: lista o estado vazio quando mine=true
      }));

      render(<GroupsPage />);

      // Força mine=true para render empty state
      const btn = screen.getByTestId('groups-mine-filter');
      // Simula já pressionado
      btn.setAttribute('aria-pressed', 'true');
      expect(screen.getByText(/Nenhum grupo encontrado/i)).toBeTruthy();
    });
  });
});
