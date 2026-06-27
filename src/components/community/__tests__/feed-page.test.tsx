// ============================================================================
// Feed — testes do PostCard + ComposeBox + filtros
// ============================================================================
// A pagina expoe o componente default. Testamos:
//  - render basico com 4 posts mock
//  - tabs de filtro (Tudo / Seguindo / Meus grupos / Tendencias)
//  - acao de like (contador incrementa, classe active aparece)
//  - acao de bookmark
//  - compose: digitar conteudo, botao Publicar desabilitado quando vazio
// ============================================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import './_mocks';
import { resetCommunityMocks } from './_mocks';

import FeedPage from '@/app/(community)/feed/page';

describe('Feed page', () => {
  beforeEach(() => {
    resetCommunityMocks();
    // Silencia logs esperados de testes de handlers
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  describe('renderizacao inicial', () => {
    it('renderiza sem crash', () => {
      expect(() => render(<FeedPage />)).not.toThrow();
    });

    it('mostra o titulo da pagina', () => {
      render(<FeedPage />);
      expect(screen.getByText(/Akasha — Comunidade Viva/i)).toBeTruthy();
    });

    it('renderiza o subheadline', () => {
      render(<FeedPage />);
      expect(screen.getByText(/Compartilhe, aprenda e evolua junto/i)).toBeTruthy();
    });

    it('mostra os 4 posts mock', () => {
      render(<FeedPage />);
      // Nomes de autor dos mocks
      expect(screen.getByText('Marina dos Caminhos')).toBeTruthy();
      expect(screen.getByText('Ruy de Ogum')).toBeTruthy();
      expect(screen.getByText('Bia Kether')).toBeTruthy();
      expect(screen.getByText('Caio de Oxossi')).toBeTruthy();
    });

    it('mostra os chips de filtro', () => {
      render(<FeedPage />);
      expect(screen.getByRole('button', { name: /Tudo/i })).toBeTruthy();
      expect(screen.getByRole('button', { name: /Seguindo/i })).toBeTruthy();
      expect(screen.getByRole('button', { name: /Meus grupos/i })).toBeTruthy();
      expect(screen.getByRole('button', { name: /Tendências/i })).toBeTruthy();
    });

    it('mostra o compose box', () => {
      render(<FeedPage />);
      expect(screen.getByPlaceholderText(/compartilhar com a comunidade/i)).toBeTruthy();
    });
  });

  describe('PostCard - interacoes', () => {
    it('cada post mostra botoes Curtir, Comentar, Compartilhar e Salvar', () => {
      render(<FeedPage />);
      expect(screen.getAllByRole('button', { name: 'Curtir' }).length).toBeGreaterThanOrEqual(4);
      expect(screen.getAllByRole('button', { name: 'Comentar' }).length).toBeGreaterThanOrEqual(4);
      expect(screen.getAllByRole('button', { name: 'Compartilhar' }).length).toBeGreaterThanOrEqual(4);
      expect(screen.getAllByRole('button', { name: 'Salvar' }).length).toBeGreaterThanOrEqual(4);
    });

    it('clicar em Curtir incrementa contador e ativa o estado visual', async () => {
      const user = userEvent.setup();
      render(<FeedPage />);

      const firstLikeBtn = screen.getAllByRole('button', { name: 'Curtir' })[0];
      const initialText = firstLikeBtn.textContent || '';

      await user.click(firstLikeBtn);

      // Encontrar de novo (pode ter sido re-renderizado mas a referencia ainda existe)
      const afterBtn = screen.getAllByRole('button', { name: 'Curtir' })[0];
      const afterText = afterBtn.textContent || '';
      expect(afterText).not.toBe(initialText);
    });

    it('clicar em Curtir duas vezes volta ao estado original', async () => {
      const user = userEvent.setup();
      render(<FeedPage />);

      const likeBtn = screen.getAllByRole('button', { name: 'Curtir' })[0];
      const initialText = likeBtn.textContent;

      await user.click(likeBtn);
      await user.click(screen.getAllByRole('button', { name: 'Curtir' })[0]);

      const afterBtn = screen.getAllByRole('button', { name: 'Curtir' })[0];
      expect(afterBtn.textContent).toBe(initialText);
    });

    it('clicar em Salvar alterna o estado visual', async () => {
      const user = userEvent.setup();
      render(<FeedPage />);

      const bookmarkBtn = screen.getAllByRole('button', { name: 'Salvar' })[0];
      const initialClass = bookmarkBtn.className;

      await user.click(bookmarkBtn);
      const afterBtn = screen.getAllByRole('button', { name: 'Salvar' })[0];

      // A cor/text muda (classe bookmarked inclui text-amber-400)
      expect(afterBtn.className).not.toBe(initialClass);
      expect(afterBtn.className).toMatch(/text-amber-400/);
    });

    it('clicar em Comentar loga o id do post (handler mock)', async () => {
      const user = userEvent.setup();
      render(<FeedPage />);

      await user.click(screen.getAllByRole('button', { name: 'Comentar' })[0]);
      expect(console.log).toHaveBeenCalledWith('comment', expect.any(String));
    });

    it('clicar em Compartilhar loga o id do post', async () => {
      const user = userEvent.setup();
      render(<FeedPage />);

      await user.click(screen.getAllByRole('button', { name: 'Compartilhar' })[0]);
      expect(console.log).toHaveBeenCalledWith('share', expect.any(String));
    });
  });

  describe('Filtros', () => {
    it('Todos comeca ativo por default', () => {
      render(<FeedPage />);
      const allChip = screen.getByRole('button', { name: /Tudo/i });
      // ativo: classe inclui from-amber-500/20
      expect(allChip.className).toMatch(/from-amber-500\/20/);
    });

    it('clicar em Seguindo move o destaque do chip', async () => {
      const user = userEvent.setup();
      render(<FeedPage />);

      const allChip = screen.getByRole('button', { name: /Tudo/i });
      const seguindoChip = screen.getByRole('button', { name: /Seguindo/i });

      await user.click(seguindoChip);

      expect(seguindoChip.className).toMatch(/from-amber-500\/20/);
      expect(allChip.className).not.toMatch(/from-amber-500\/20/);
    });

    it('clicar em Meus grupos move o destaque', async () => {
      const user = userEvent.setup();
      render(<FeedPage />);

      await user.click(screen.getByRole('button', { name: /Meus grupos/i }));
      const gruposChip = screen.getByRole('button', { name: /Meus grupos/i });
      expect(gruposChip.className).toMatch(/from-amber-500\/20/);
    });

    it('clicar em Tendencias move o destaque', async () => {
      const user = userEvent.setup();
      render(<FeedPage />);

      await user.click(screen.getByRole('button', { name: /Tendências/i }));
      const tendenciasChip = screen.getByRole('button', { name: /Tendências/i });
      expect(tendenciasChip.className).toMatch(/from-amber-500\/20/);
    });

    it('apenas um filtro fica ativo por vez', async () => {
      const user = userEvent.setup();
      render(<FeedPage />);

      await user.click(screen.getByRole('button', { name: /Seguindo/i }));

      const activeChips = [
        screen.getByRole('button', { name: /Tudo/i }),
        screen.getByRole('button', { name: /Seguindo/i }),
        screen.getByRole('button', { name: /Meus grupos/i }),
        screen.getByRole('button', { name: /Tendências/i }),
      ].filter((b) => /from-amber-500\/20/.test(b.className));

      expect(activeChips).toHaveLength(1);
      expect(activeChips[0].textContent).toMatch(/Seguindo/);
    });
  });

  describe('ComposeBox', () => {
    it('botao Publicar nao aparece antes do foco no textarea', () => {
      render(<FeedPage />);
      expect(screen.queryByRole('button', { name: /Publicar/i })).toBeNull();
    });

    it('botao Publicar aparece apos focar no textarea', async () => {
      const user = userEvent.setup();
      render(<FeedPage />);

      const textarea = screen.getByPlaceholderText(/compartilhar com a comunidade/i);
      await user.click(textarea);

      expect(screen.getByRole('button', { name: /Publicar/i })).toBeTruthy();
    });

    it('Publicar fica desabilitado enquanto texto esta vazio', async () => {
      const user = userEvent.setup();
      render(<FeedPage />);

      await user.click(screen.getByPlaceholderText(/compartilhar com a comunidade/i));
      const submit = screen.getByRole('button', { name: /Publicar/i });
      expect((submit as HTMLButtonElement).disabled).toBe(true);
    });

    it('Publicar habilita quando ha conteudo', async () => {
      const user = userEvent.setup();
      render(<FeedPage />);

      const textarea = screen.getByPlaceholderText(/compartilhar com a comunidade/i);
      await user.click(textarea);
      await user.type(textarea, 'olá comunidade');

      const submit = screen.getByRole('button', { name: /Publicar/i });
      expect((submit as HTMLButtonElement).disabled).toBe(false);
    });

    it('clicar em Publicar adiciona um novo post no topo', async () => {
      const user = userEvent.setup();
      render(<FeedPage />);

      const textarea = screen.getByPlaceholderText(/compartilhar com a comunidade/i);
      await user.click(textarea);
      await user.type(textarea, 'Meu primeiro post na Akasha');

      const submitBefore = screen.getAllByRole('button', { name: 'Curtir' }).length;
      await user.click(screen.getByRole('button', { name: /Publicar/i }));

      // Apos adicionar um post, temos 5 posts (4 mock + 1 novo) = 5 botoes Curtir
      await waitFor(() => {
        expect(screen.getAllByRole('button', { name: 'Curtir' }).length).toBe(submitBefore + 1);
      });

      // Conteudo do novo post aparece
      expect(screen.getByText(/Meu primeiro post na Akasha/i)).toBeTruthy();
    });

    it('apos publicar, textarea e limpa', async () => {
      const user = userEvent.setup();
      render(<FeedPage />);

      const textarea = screen.getByPlaceholderText(
        /compartilhar com a comunidade/i
      ) as HTMLTextAreaElement;
      await user.click(textarea);
      await user.type(textarea, 'algo importante');
      await user.click(screen.getByRole('button', { name: /Publicar/i }));

      await waitFor(() => {
        expect(textarea.value).toBe('');
      });
    });
  });

  describe('Sidebar', () => {
    it('mostra a secao "Tradições em destaque"', () => {
      render(<FeedPage />);
      expect(screen.getByText(/Tradições em destaque/i)).toBeTruthy();
    });

    it('mostra a secao de sugestoes da IA', () => {
      render(<FeedPage />);
      expect(screen.getByText(/Sugestões da Akasha IA/i)).toBeTruthy();
    });

    it('mostra CTA de completar mapa espiritual', () => {
      render(<FeedPage />);
      expect(screen.getByText(/Complete seu mapa espiritual/i)).toBeTruthy();
    });
  });
});