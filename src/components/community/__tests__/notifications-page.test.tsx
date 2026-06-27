// ============================================================================
// Notifications — testes da pagina de notificacoes
// ============================================================================
// Cobre:
//  - render basico com 7 mocks
//  - contagem de nao lidas
//  - filtro "Tudo" / "Não lidas"
//  - clique em uma notif marca como lida (remove destaque + remove bolinha)
//  - "Marcar todas como lidas" zera contador e esconde botao
//  - empty state quando filtro zera a lista
// ============================================================================

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import './_mocks';
import { resetCommunityMocks } from './_mocks';

import NotificationsPage from '@/app/(community)/notifications/page';

describe('Notifications page', () => {
  beforeEach(() => {
    resetCommunityMocks();
  });

  describe('renderizacao inicial', () => {
    it('renderiza sem crash', () => {
      expect(() => render(<NotificationsPage />)).toBeTruthy();
    });

    it('mostra o titulo', () => {
      render(<NotificationsPage />);
      expect(screen.getByText(/Notificações/i)).toBeTruthy();
    });

    it('mostra contador de nao lidas (3 no mock)', () => {
      render(<NotificationsPage />);
      expect(screen.getByText(/3 não lidas/i)).toBeTruthy();
    });

    it('lista as 7 notificacoes mock', () => {
      render(<NotificationsPage />);
      // Filtramos por nomes que aparecem no mock
      expect(screen.getByText(/Ruy de Ogum/i)).toBeTruthy();
      expect(screen.getByText(/Marina dos Caminhos/i)).toBeTruthy();
      expect(screen.getByText(/Bia Kether/i)).toBeTruthy();
      expect(screen.getByText(/Akasha IA/i)).toBeTruthy();
      expect(screen.getByText(/Caio de Oxossi/i)).toBeTruthy();
      expect(screen.getByText(/Leo Ary/i)).toBeTruthy();
      expect(screen.getByText(/Grupo Tantra/i)).toBeTruthy();
    });

    it('mostra os filtros "Tudo" e "Não lidas" com contadores', () => {
      render(<NotificationsPage />);
      const tudoChip = screen.getByRole('button', { name: /Tudo/i });
      const unreadChip = screen.getByRole('button', { name: /Não lidas/i });

      // Contadores estao dentro de cada chip
      expect(within(tudoChip).getByText('7')).toBeTruthy();
      expect(within(unreadChip).getByText('3')).toBeTruthy();
    });

    it('"Tudo" comeca ativo', () => {
      render(<NotificationsPage />);
      const tudoChip = screen.getByRole('button', { name: /Tudo/i });
      expect(tudoChip.className).toMatch(/from-amber-500\/20/);
    });

    it('mostra o botao "Marcar todas como lidas" quando ha nao lidas', () => {
      render(<NotificationsPage />);
      expect(screen.getByRole('button', { name: /Marcar todas como lidas/i })).toBeTruthy();
    });
  });

  describe('Filtro "Não lidas"', () => {
    it('clicar em "Não lidas" esconde as notificacoes lidas', async () => {
      const user = userEvent.setup();
      render(<NotificationsPage />);

      await user.click(screen.getByRole('button', { name: /Não lidas/i }));

      // So 3 notificacoes estao nao-lidas no mock
      expect(screen.getAllByText(/começou a seguir você/i).length).toBe(1);
      // Akasha IA e lida; nao deve aparecer
      expect(screen.queryByText(/Akasha IA/i)).toBeNull();
      // Bia Kether (NEW_LIKE) tambem e lida? Nao, e nao-lida (mock n.id=3)
      expect(screen.getByText(/Bia Kether/i)).toBeTruthy();
    });

    it('clicar em "Não lidas" marca o chip como ativo', async () => {
      const user = userEvent.setup();
      render(<NotificationsPage />);

      await user.click(screen.getByRole('button', { name: /Não lidas/i }));
      const unreadChip = screen.getByRole('button', { name: /Não lidas/i });
      expect(unreadChip.className).toMatch(/from-amber-500\/20/);

      // E "Tudo" deixa de ser o chip ativo
      const tudoChip = screen.getByRole('button', { name: /Tudo/i });
      expect(tudoChip.className).not.toMatch(/from-amber-500\/20/);
    });

    it('voltar para "Tudo" reaparece as notificacoes lidas', async () => {
      const user = userEvent.setup();
      render(<NotificationsPage />);

      await user.click(screen.getByRole('button', { name: /Não lidas/i }));
      await user.click(screen.getByRole('button', { name: /Tudo/i }));

      // Volta a 7
      const tudoChip = screen.getByRole('button', { name: /Tudo/i });
      expect(within(tudoChip).getByText('7')).toBeTruthy();
    });
  });

  describe('Marcar como lida individualmente', () => {
    it('clicar em uma notif a remove do filtro "Não lidas"', async () => {
      const user = userEvent.setup();
      render(<NotificationsPage />);

      // Notif 1 (Ruy de Ogum) e nao-lida.
      // Localizamos o link que contem o texto da notif.
      const ruyCard = screen.getByText(/Ruy de Ogum/i).closest('a');
      expect(ruyCard).toBeTruthy();

      await user.click(ruyCard!);

      // Agora so 2 nao-lidas; o contador no chip cai.
      const unreadChip = screen.getByRole('button', { name: /Não lidas/i });
      expect(within(unreadChip).getByText('2')).toBeTruthy();

      // O subheadline atualiza de "3 não lidas" para "2 não lidas"
      expect(screen.getByText(/2 não lidas/i)).toBeTruthy();
      expect(screen.queryByText(/3 não lidas/i)).toBeNull();
    });

    it('remover a ultima nao-lida esconde o botao "Marcar todas como lidas"', async () => {
      const user = userEvent.setup();
      render(<NotificationsPage />);

      // Clica nas 3 nao-lidas (ids 1, 2, 3 no mock)
      const ruy = screen.getByText(/Ruy de Ogum/i).closest('a');
      const marina = screen.getByText(/Marina dos Caminhos/i).closest('a');
      const bia = screen.getByText(/Bia Kether/i).closest('a');

      await user.click(ruy!);
      // Marina e Bia sao re-renderizados; precisamos pegar de novo.
      await user.click(screen.getByText(/Marina dos Caminhos/i).closest('a')!);
      await user.click(screen.getByText(/Bia Kether/i).closest('a')!);

      expect(screen.queryByRole('button', { name: /Marcar todas como lidas/i })).toBeNull();
      expect(screen.getByText(/Tudo lido/i)).toBeTruthy();
    });
  });

  describe('Marcar todas como lidas', () => {
    it('zera contador de nao lidas', async () => {
      const user = userEvent.setup();
      render(<NotificationsPage />);

      await user.click(screen.getByRole('button', { name: /Marcar todas como lidas/i }));

      expect(screen.queryByText(/não lidas/i)).toBeNull();
      expect(screen.getByText(/Tudo lido/i)).toBeTruthy();
    });

    it('esconde o proprio botao depois de clicar', async () => {
      const user = userEvent.setup();
      render(<NotificationsPage />);

      const btn = screen.getByRole('button', { name: /Marcar todas como lidas/i });
      await user.click(btn);

      expect(screen.queryByRole('button', { name: /Marcar todas como lidas/i })).toBeNull();
    });

    it('apos marcar todas, o filtro "Não lidas" fica vazio', async () => {
      const user = userEvent.setup();
      render(<NotificationsPage />);

      await user.click(screen.getByRole('button', { name: /Marcar todas como lidas/i }));
      await user.click(screen.getByRole('button', { name: /Não lidas/i }));

      // Empty state
      expect(screen.getByText(/Nenhuma notificação por aqui/i)).toBeTruthy();
    });
  });

  describe('Empty state do filtro "Não lidas"', () => {
    it('mostra empty state quando nao ha nao-lidas', async () => {
      const user = userEvent.setup();
      render(<NotificationsPage />);

      // Marcar todas
      await user.click(screen.getByRole('button', { name: /Marcar todas como lidas/i }));
      // Filtrar nao-lidas
      await user.click(screen.getByRole('button', { name: /Não lidas/i }));

      expect(screen.getByText(/Nenhuma notificação por aqui/i)).toBeTruthy();
      expect(
        screen.getByText(/Quando alguém curtir, comentar ou seguir/i)
      ).toBeTruthy();
    });
  });

  describe('Link de destino das notificacoes', () => {
    it('notif de follow aponta para /u/<handle>', () => {
      render(<NotificationsPage />);
      // Notif 1 do mock: actor=Ruy de Ogum, link=/u/ruy-ogum
      const ruyLink = screen.getByText(/Ruy de Ogum/i).closest('a');
      expect(ruyLink?.getAttribute('href')).toBe('/u/ruy-ogum');
    });

    it('notif de comment aponta para /post/<id>', () => {
      render(<NotificationsPage />);
      // Notif 2: Marina, link=/post/1
      const marinaLink = screen.getByText(/Marina dos Caminhos/i).closest('a');
      expect(marinaLink?.getAttribute('href')).toBe('/post/1');
    });

    it('notif da IA aponta para /library#a1', () => {
      render(<NotificationsPage />);
      const iaLink = screen.getByText(/Akasha IA/i).closest('a');
      expect(iaLink?.getAttribute('href')).toBe('/library#a1');
    });
  });

  describe('Indicador visual de nao lida', () => {
    it('notifs nao-lidas tem classe com border-amber-500/20', () => {
      render(<NotificationsPage />);
      const ruyCard = screen.getByText(/Ruy de Ogum/i).closest('a');
      expect(ruyCard?.className).toMatch(/border-amber-500\/20/);
    });

    it('notifs lidas tem classe mais discreta', () => {
      render(<NotificationsPage />);
      // Akasha IA e lida
      const iaCard = screen.getByText(/Akasha IA/i).closest('a');
      expect(iaCard?.className).toMatch(/border-slate-800\/30/);
    });
  });
});