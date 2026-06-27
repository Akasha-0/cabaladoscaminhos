// ============================================================================
// CommunityNav — testes do header global da comunidade
// ============================================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock side-effect: importa antes do componente para garantir registro.
import './_mocks';
import { usePathnameMock, resetCommunityMocks } from './_mocks';

import { CommunityNav, type CommunityUser } from '@/components/community/CommunityNav';

const baseUser: CommunityUser = {
  id: 'u1',
  handle: 'marina-caminhos',
  displayName: 'Marina dos Caminhos',
  notificationsCount: 3,
};

describe('CommunityNav', () => {
  beforeEach(() => {
    resetCommunityMocks();
  });

  describe('renderizacao basica', () => {
    it('renderiza sem crash quando deslogado', () => {
      expect(() => render(<CommunityNav user={null} />)).not.toThrow();
    });

    it('renderiza sem crash quando logado', () => {
      expect(() => render(<CommunityNav user={baseUser} />)).not.toThrow();
    });

    it('mostra o logo "Akasha"', () => {
      render(<CommunityNav user={null} />);
      expect(screen.getByText('Akasha')).toBeTruthy();
    });

    it('renderiza os 3 links de navegacao principais', () => {
      render(<CommunityNav user={null} />);
      expect(screen.getAllByRole('link', { name: /Feed/i }).length).toBeGreaterThan(0);
      expect(screen.getAllByRole('link', { name: /Explorar/i }).length).toBeGreaterThan(0);
      expect(screen.getAllByRole('link', { name: /Biblioteca/i }).length).toBeGreaterThan(0);
    });

    it('tem um botao de busca acessivel (aria-label="Buscar")', () => {
      render(<CommunityNav user={null} />);
      expect(screen.getByRole('button', { name: 'Buscar' })).toBeTruthy();
    });
  });

  describe('estado deslogado', () => {
    it('mostra o botao "Entrar"', () => {
      render(<CommunityNav user={null} />);
      const entrar = screen.getByRole('link', { name: /Entrar/i });
      expect(entrar).toBeTruthy();
      expect(entrar.getAttribute('href')).toBe('/login');
    });

    it('nao mostra badge de notificacoes sem usuario', () => {
      render(<CommunityNav user={null} />);
      // Sem link de notificacoes
      expect(screen.queryByLabelText('Notificações')).toBeNull();
    });

    it('nao renderiza bottom-nav em mobile sem usuario', () => {
      render(<CommunityNav user={null} />);
      // Bottom nav so renderiza quando user existe.
      expect(screen.queryByText('Perfil')).toBeNull();
    });
  });

  describe('estado logado', () => {
    it('nao mostra o botao "Entrar"', () => {
      render(<CommunityNav user={baseUser} />);
      expect(screen.queryByRole('link', { name: /Entrar/i })).toBeNull();
    });

    it('mostra o avatar do usuario no header', () => {
      render(<CommunityNav user={baseUser} />);
      expect(screen.getAllByTestId('avatar').length).toBeGreaterThan(0);
      // Fallback com a primeira letra do displayName
      expect(screen.getAllByTestId('avatar-fallback')[0].textContent).toBe('M');
    });

    it('mostra badge com contador de notificacoes quando count > 0', () => {
      render(<CommunityNav user={baseUser} />);
      // Badge aparece no icone do sino
      const bellLink = screen.getByLabelText('Notificações');
      expect(bellLink).toBeTruthy();
      expect(within(bellLink).getByText('3')).toBeTruthy();
    });

    it('cap o contador em "9+" quando count > 9', () => {
      render(<CommunityNav user={{ ...baseUser, notificationsCount: 42 }} />);
      const bellLink = screen.getByLabelText('Notificações');
      expect(within(bellLink).getByText('9+')).toBeTruthy();
    });

    it('nao mostra badge quando notificationsCount e 0', () => {
      render(<CommunityNav user={{ ...baseUser, notificationsCount: 0 }} />);
      const bellLink = screen.getByLabelText('Notificações');
      // O badge e um span com o numero; quando 0, nao existe.
      expect(within(bellLink).queryByText('0')).toBeNull();
    });

    it('renderiza bottom-nav em mobile com link para o perfil', () => {
      render(<CommunityNav user={baseUser} />);
      // O label "Perfil" so aparece no bottom-nav (header desktop nao tem).
      expect(screen.getAllByText('Perfil').length).toBeGreaterThan(0);
      const perfilLinks = screen
        .getAllByRole('link')
        .filter((a) => a.getAttribute('href') === '/u/marina-caminhos');
      expect(perfilLinks.length).toBeGreaterThan(0);
    });
  });

  describe('link ativo (rota atual)', () => {
    it('marca o link correspondente ao pathname atual como ativo', () => {
      usePathnameMock.mockReturnValue('/library');
      render(<CommunityNav user={null} />);
      const libLink = screen.getAllByRole('link', { name: /Biblioteca/i })[0];
      // Classe de estado ativo inclui gradient amber/violet.
      expect(libLink.className).toMatch(/amber/);
    });

    it('marca /feed como ativo quando pathname === /feed', () => {
      usePathnameMock.mockReturnValue('/feed');
      render(<CommunityNav user={null} />);
      const feedLink = screen.getAllByRole('link', { name: /Feed/i })[0];
      expect(feedLink.className).toMatch(/amber/);
    });

    it('links de rotas diferentes nao recebem o destaque', () => {
      usePathnameMock.mockReturnValue('/feed');
      render(<CommunityNav user={null} />);
      const libLink = screen.getAllByRole('link', { name: /Biblioteca/i })[0];
      expect(libLink.className).not.toMatch(/from-amber-500\/15/);
    });
  });

  describe('handlers e interacoes', () => {
    it('aciona onSearch ao digitar na busca expandida', async () => {
      const user = userEvent.setup();
      const onSearch = vi.fn();
      render(<CommunityNav user={null} onSearch={onSearch} />);

      // Abre a busca
      await user.click(screen.getByRole('button', { name: 'Buscar' }));
      const input = screen.getByPlaceholderText(/Buscar tradi/i);
      await user.type(input, 'cabala');

      expect(onSearch).toHaveBeenCalled();
      // Ultimo valor digitado deve ser 'cabala'
      expect(onSearch).toHaveBeenLastCalledWith('cabala');
    });

    it('abre e fecha a barra de busca ao clicar no botao', async () => {
      const user = userEvent.setup();
      render(<CommunityNav user={null} />);

      const toggle = screen.getByRole('button', { name: 'Buscar' });
      await user.click(toggle);
      expect(screen.getByPlaceholderText(/Buscar tradi/i)).toBeTruthy();

      await user.click(toggle);
      // Volta a ficar oculta. queryBy nao deve encontrar mais.
      expect(screen.queryByPlaceholderText(/Buscar tradi/i)).toBeNull();
    });

    it('abre o menu mobile ao clicar no botao de menu', async () => {
      const user = userEvent.setup();
      render(<CommunityNav user={null} />);

      const menuBtn = screen.getByRole('button', { name: 'Menu' });
      await user.click(menuBtn);

      // No menu mobile aparecem links adicionais de Feed/Explorar/Biblioteca.
      const feedLinks = screen.getAllByRole('link', { name: /Feed/i });
      // Antes do menu: header + (sem bottom-nav pq sem user) = 1 link Feed.
      // Depois do menu aberto: header + menu mobile = 2.
      expect(feedLinks.length).toBeGreaterThanOrEqual(2);
    });

    it('fecha o menu mobile ao clicar em um link do menu', async () => {
      const user = userEvent.setup();
      render(<CommunityNav user={null} />);

      await user.click(screen.getByRole('button', { name: 'Menu' }));
      expect(screen.getAllByRole('link', { name: /Feed/i }).length).toBeGreaterThanOrEqual(2);

      // Clica no primeiro link "Feed" do menu mobile (estao todos na pagina).
      const allFeedLinks = screen.getAllByRole('link', { name: /Feed/i });
      // O do menu mobile aparece depois no DOM (renderizado depois do header).
      await user.click(allFeedLinks[allFeedLinks.length - 1]);

      // O menu mobile some — volta a ter so 1 link Feed (do header).
      expect(screen.getAllByRole('link', { name: /Feed/i }).length).toBe(1);
    });

    it('abre o profile dropdown ao clicar no avatar e mostra opcoes', async () => {
      const user = userEvent.setup();
      render(<CommunityNav user={baseUser} />);

      // O botao do avatar nao tem aria-label explicito; pegamos pelo fallback.
      const avatarBtn = screen.getAllByTestId('avatar')[0].closest('button');
      expect(avatarBtn).toBeTruthy();
      await user.click(avatarBtn!);

      // Opcoes do dropdown
      expect(screen.getByText('Meu perfil')).toBeTruthy();
      expect(screen.getByText('Configurações')).toBeTruthy();
      expect(screen.getByText('Meu mapa espiritual')).toBeTruthy();
      expect(screen.getByText('Sair')).toBeTruthy();
    });

    it('profile dropdown tem link para o perfil do usuario', async () => {
      const user = userEvent.setup();
      render(<CommunityNav user={baseUser} />);

      const avatarBtn = screen.getAllByTestId('avatar')[0].closest('button');
      await user.click(avatarBtn!);

      const profileLink = screen.getByRole('link', { name: /Meu perfil/i });
      expect(profileLink.getAttribute('href')).toBe('/u/marina-caminhos');
    });
  });
});