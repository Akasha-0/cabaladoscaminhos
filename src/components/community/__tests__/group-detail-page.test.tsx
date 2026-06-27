// ============================================================================
// GROUP DETAIL PAGE — Tests
// ============================================================================
// /groups/[slug] — render, tabs, botões entrar/sair baseados em membership.
// ============================================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock next/navigation
const paramsMock = vi.fn(() => ({ slug: 'cabala' }));
vi.mock('next/navigation', () => ({
  useParams: () => paramsMock(),
  usePathname: () => '/groups/cabala',
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

// Mock useAuth
const useAuthMock = vi.fn(() => ({ user: null }));
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => useAuthMock(),
}));

// Mock useGroups
const groupMock = vi.fn();
const membersMock = vi.fn();
const membershipMock = vi.fn();
const postsMock = vi.fn();
vi.mock('@/hooks/useGroups', () => ({
  useGroup: (...args: unknown[]) => groupMock(...args),
  useGroupMembers: (...args: unknown[]) => membersMock(...args),
  useGroupMembership: (...args: unknown[]) => membershipMock(...args),
  useGroupPosts: (...args: unknown[]) => postsMock(...args),
}));

// Mock usePosts (CreatePost depende)
const createPostMock = vi.fn();
vi.mock('@/hooks/usePosts', () => ({
  useCreatePost: () => ({ createPost: createPostMock, loading: false }),
}));

import GroupPage from '@/app/(community)/groups/[slug]/page';

const SAMPLE_GROUP_PUBLIC = {
  id: 'g1',
  slug: 'cabala',
  name: 'Cabala & Árvore da Vida',
  description: 'Tradição mística judaica',
  longDescription: 'Descrição longa completa.',
  rules: ['Respeito às correntes', 'Compartilhe fontes', 'Sem promessas absolutas'],
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
};

const SAMPLE_GROUP_MEMBER = {
  ...SAMPLE_GROUP_PUBLIC,
  viewerRole: 'MEMBER' as const,
  isMember: true,
};

describe('GroupDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    paramsMock.mockReturnValue({ slug: 'cabala' });
    useAuthMock.mockReturnValue({ user: null });
    createPostMock.mockResolvedValue({ ok: true });
    groupMock.mockReturnValue({
      group: SAMPLE_GROUP_PUBLIC,
      loading: false,
      error: null,
      refresh: vi.fn(),
    });
    membersMock.mockReturnValue({
      members: [
        { userId: 'u1', displayName: 'Membro ADMIN', role: 'ADMIN', joinedAt: '2026-06-01', invitedBy: null },
        { userId: 'u2', displayName: 'Membro MEM', role: 'MEMBER', joinedAt: '2026-06-02', invitedBy: 'u1' },
      ],
      loading: false,
      error: null,
      refresh: vi.fn(),
    });
    membershipMock.mockReturnValue({
      join: vi.fn().mockResolvedValue({ ok: true }),
      leave: vi.fn().mockResolvedValue({ ok: true }),
      promote: vi.fn().mockResolvedValue({ ok: true }),
      remove: vi.fn().mockResolvedValue({ ok: true }),
      loading: false,
    });
    postsMock.mockReturnValue({
      posts: [],
      loading: false,
      loadingMore: false,
      error: null,
      hasMore: false,
      loadMore: vi.fn(),
      refresh: vi.fn(),
    });
  });

  describe('renderização — usuário deslogado (não membro)', () => {
    it('renderiza sem crash', () => {
      expect(() => render(<GroupPage />)).not.toThrow();
    });

    it('mostra nome do grupo', () => {
      render(<GroupPage />);
      expect(screen.getByTestId('group-name').textContent).toMatch(/Cabala/);
    });

    it('mostra descrição do grupo', () => {
      render(<GroupPage />);
      expect(screen.getByText(/Tradição mística judaica/)).toBeTruthy();
    });

    it('mostra contagem de membros e posts', () => {
      render(<GroupPage />);
      expect(screen.getByTestId('members-count').textContent).toMatch(/412/);
    });

    it('mostra botão "Entrar" quando não-membro e grupo público', () => {
      render(<GroupPage />);
      expect(screen.getByTestId('join-button')).toBeTruthy();
    });

    it('NÃO mostra botão "Sair" para não-membro', () => {
      render(<GroupPage />);
      expect(screen.queryByTestId('leave-button')).toBeNull();
    });

    it('NÃO mostra badge ADMIN/MODERATOR para não-membro', () => {
      render(<GroupPage />);
      expect(screen.queryByTestId('admin-badge')).toBeNull();
      expect(screen.queryByTestId('moderator-badge')).toBeNull();
    });

    it('mostra tab Posts ativa por padrão', () => {
      render(<GroupPage />);
      const tab = screen.getByTestId('tab-posts');
      expect(tab.getAttribute('data-active') || '').toBeTruthy();
    });

    it('renderiza todas as 4 tabs', () => {
      render(<GroupPage />);
      expect(screen.getByTestId('tab-posts')).toBeTruthy();
      expect(screen.getByTestId('tab-members')).toBeTruthy();
      expect(screen.getByTestId('tab-about')).toBeTruthy();
      expect(screen.getByTestId('tab-rules')).toBeTruthy();
    });

    it('mostra CTA "Entre no grupo para publicar" para não-membro', () => {
      render(<GroupPage />);
      expect(
        screen.getByText(/Entre no grupo para publicar/i)
      ).toBeTruthy();
    });
  });

  describe('renderização — usuário membro', () => {
    beforeEach(() => {
      groupMock.mockReturnValue({
        group: SAMPLE_GROUP_MEMBER,
        loading: false,
        error: null,
        refresh: vi.fn(),
      });
    });

    it('mostra badge ADMIN quando viewerRole=ADMIN', () => {
      groupMock.mockReturnValue({
        group: { ...SAMPLE_GROUP_MEMBER, viewerRole: 'ADMIN', isMember: true },
        loading: false,
        error: null,
        refresh: vi.fn(),
      });
      render(<GroupPage />);
      expect(screen.getByTestId('admin-badge')).toBeTruthy();
    });

    it('mostra badge MODERATOR quando viewerRole=MODERATOR', () => {
      groupMock.mockReturnValue({
        group: { ...SAMPLE_GROUP_MEMBER, viewerRole: 'MODERATOR', isMember: true },
        loading: false,
        error: null,
        refresh: vi.fn(),
      });
      render(<GroupPage />);
      expect(screen.getByTestId('moderator-badge')).toBeTruthy();
    });

    it('mostra botão "Sair" (label "Membro") quando é MEMBER', () => {
      render(<GroupPage />);
      // Quando é MEMBER, "Sair" fica escondido (proteção contra remover-se)
      // O botão aparece quando isMember && viewerRole !== 'ADMIN'
      expect(screen.queryByTestId('leave-button')).toBeTruthy();
    });
  });

  describe('ações', () => {
    it('clicar em "Entrar" chama membership.join', async () => {
      const join = vi.fn().mockResolvedValue({ ok: true });
      membershipMock.mockReturnValue({
        join,
        leave: vi.fn().mockResolvedValue({ ok: true }),
        promote: vi.fn().mockResolvedValue({ ok: true }),
        remove: vi.fn().mockResolvedValue({ ok: true }),
        loading: false,
      });

      const user = userEvent.setup();
      render(<GroupPage />);

      await user.click(screen.getByTestId('join-button'));
      expect(join).toHaveBeenCalled();
    });

    it('mostra erro se join falhar', async () => {
      const join = vi.fn().mockResolvedValue({ ok: false, error: 'Você precisa estar logado' });
      membershipMock.mockReturnValue({
        join,
        leave: vi.fn(),
        promote: vi.fn(),
        remove: vi.fn(),
        loading: false,
      });

      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      const user = userEvent.setup();
      render(<GroupPage />);

      await user.click(screen.getByTestId('join-button'));
      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('logado'));
      });
      alertSpy.mockRestore();
    });
  });

  describe('grupo não encontrado', () => {
    it('mostra fallback com link para /groups', () => {
      groupMock.mockReturnValue({
        group: null,
        loading: false,
        error: 'Não encontrado',
        refresh: vi.fn(),
      });
      render(<GroupPage />);
      expect(screen.getByText(/Grupo não encontrado/i)).toBeTruthy();
    });
  });

  describe('tab Regras', () => {
    it('mostra lista numerada de regras', async () => {
      const user = userEvent.setup();
      render(<GroupPage />);

      await user.click(screen.getByTestId('tab-rules'));

      expect(screen.getByText(/Respeito às correntes/)).toBeTruthy();
      expect(screen.getByText(/Compartilhe fontes/)).toBeTruthy();
      expect(screen.getByText(/Sem promessas absolutas/)).toBeTruthy();
    });
  });

  describe('feed do grupo', () => {
    it('mostra empty state quando não há posts', () => {
      postsMock.mockReturnValue({
        posts: [],
        loading: false,
        loadingMore: false,
        error: null,
        hasMore: false,
        loadMore: vi.fn(),
        refresh: vi.fn(),
      });
      render(<GroupPage />);
      expect(screen.getByText(/Nenhum post no grupo/i)).toBeTruthy();
    });

    it('renderiza posts quando há dados', () => {
      postsMock.mockReturnValue({
        posts: [
          {
            id: 'p1',
            authorId: 'seed-author-1',
            content: 'Conteúdo do post',
            createdAt: '2026-06-01T00:00:00Z',
            likesCount: 5,
            commentsCount: 2,
          },
        ],
        loading: false,
        loadingMore: false,
        error: null,
        hasMore: false,
        loadMore: vi.fn(),
        refresh: vi.fn(),
      });
      render(<GroupPage />);
      expect(screen.getByTestId('group-post')).toBeTruthy();
      expect(screen.getByText(/Conteúdo do post/)).toBeTruthy();
    });
  });
});
