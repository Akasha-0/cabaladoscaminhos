// ============================================================================
// COMPONENT — PostCard
// ============================================================================
// Render + interação (like, menu, delete).
// ============================================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Stub de next/link (porque não temos provider de router aqui)
vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>{children}</a>
  ),
}));

// Stub do Avatar (do projeto)
vi.mock('@/components/ui/avatar', () => ({
  Avatar: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
  AvatarImage: ({ src, alt }: { src?: string; alt?: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
  AvatarFallback: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <span className={className}>{children}</span>
  ),
}));

import { PostCard } from '@/components/community/PostCard';
import type { Post } from '@/types/community';

const basePost: Post = {
  id: 'post-1',
  author: {
    id: 'u-1',
    handle: 'membro-1',
    displayName: 'Membro Um',
  },
  content: 'Conteúdo do post',
  type: 'TEXT',
  tradition: 'cabala',
  topic: 'meditacao',
  likesCount: 5,
  commentsCount: 2,
  sharesCount: 0,
  liked: false,
  bookmarked: false,
  createdAt: new Date(Date.now() - 60_000 * 30).toISOString(),
};

describe('<PostCard />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza nome do autor e conteúdo', () => {
    render(<PostCard post={basePost} />);
    expect(screen.getByText('Membro Um')).toBeInTheDocument();
    expect(screen.getByText('Conteúdo do post')).toBeInTheDocument();
    expect(screen.getByText('Cabala')).toBeInTheDocument();
  });

  it('mostra contadores de likes e comments', () => {
    render(<PostCard post={basePost} />);
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('chama onLike ao clicar em Curtir', async () => {
    const user = userEvent.setup();
    const onLike = vi.fn();
    render(<PostCard post={basePost} onLike={onLike} />);
    const likeBtn = screen.getByRole('button', { name: 'Curtir' });
    await user.click(likeBtn);
    expect(onLike).toHaveBeenCalledWith('post-1');
  });

  it('reflete estado liked visualmente', () => {
    render(<PostCard post={{ ...basePost, liked: true }} />);
    const likeBtn = screen.getByRole('button', { name: 'Curtir' });
    expect(likeBtn).toHaveAttribute('aria-pressed', 'true');
  });

  it('abre menu de opções ao clicar no botão ...', async () => {
    const user = userEvent.setup();
    render(<PostCard post={basePost} currentUserId="u-1" onDelete={vi.fn()} />);
    const menuBtn = screen.getByRole('button', { name: 'Mais opções' });
    await user.click(menuBtn);
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('mostra Editar + Deletar para o autor', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(<PostCard post={basePost} currentUserId="u-1" onDelete={onDelete} />);
    await user.click(screen.getByRole('button', { name: 'Mais opções' }));
    expect(screen.getByRole('menuitem', { name: /editar/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /deletar/i })).toBeInTheDocument();
  });

  it('mostra Reportar para não-autores', async () => {
    const user = userEvent.setup();
    const onReport = vi.fn();
    render(<PostCard post={basePost} currentUserId="u-outro" onReport={onReport} />);
    await user.click(screen.getByRole('button', { name: 'Mais opções' }));
    expect(screen.getByRole('menuitem', { name: /reportar/i })).toBeInTheDocument();
    await user.click(screen.getByRole('menuitem', { name: /reportar/i }));
    expect(onReport).toHaveBeenCalledWith('post-1');
  });

  it('chama onDelete quando autor clica em Deletar', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(<PostCard post={basePost} currentUserId="u-1" onDelete={onDelete} />);
    await user.click(screen.getByRole('button', { name: 'Mais opções' }));
    await user.click(screen.getByRole('menuitem', { name: /deletar/i }));
    expect(onDelete).toHaveBeenCalledWith('post-1');
  });

  it('fecha menu ao clicar fora', async () => {
    const user = userEvent.setup();
    render(<PostCard post={basePost} currentUserId="u-1" />);
    await user.click(screen.getByRole('button', { name: 'Mais opções' }));
    expect(screen.getByRole('menu')).toBeInTheDocument();
    // Clica em área vazia
    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('formata tempo relativo como "agora" para posts recém criados', () => {
    render(<PostCard post={{ ...basePost, createdAt: new Date().toISOString() }} />);
    expect(screen.getByText(/agora/i)).toBeInTheDocument();
  });

  it('formata tempo relativo em horas', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    render(<PostCard post={{ ...basePost, createdAt: twoHoursAgo }} />);
    expect(screen.getByText(/2h/i)).toBeInTheDocument();
  });

  it('renderiza referências científicas quando presentes', () => {
    const postWithRefs: Post = {
      ...basePost,
      references: [
        { title: 'Paper X', doi: '10.1234/abcd', year: 2024 },
      ],
    };
    render(<PostCard post={postWithRefs} />);
    const link = screen.getByText(/Paper X/);
    expect(link).toBeInTheDocument();
    // Elemento é um link
    expect(link.closest('a')).toHaveAttribute('target', '_blank');
  });
});