// ============================================================================
// CommunityShell — testes do wrapper de layout da comunidade
// ============================================================================

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

import './_mocks';
import { resetCommunityMocks } from './_mocks';

import { CommunityShell } from '@/components/community/CommunityShell';
import type { CommunityUser } from '@/components/community/CommunityNav';

const sampleUser: CommunityUser = {
  id: 'u1',
  handle: 'bia-kether',
  displayName: 'Bia Kether',
};

describe('CommunityShell', () => {
  beforeEach(() => {
    resetCommunityMocks();
  });

  describe('renderizacao', () => {
    it('renderiza sem crash com children minimos', () => {
      expect(() =>
        render(
          <CommunityShell user={null}>
            <p>hello world</p>
          </CommunityShell>
        )
      ).not.toThrow();
    });

    it('renderiza os children passados', () => {
      render(
        <CommunityShell user={null}>
          <span data-testid="child">conteudo interno</span>
        </CommunityShell>
      );
      expect(screen.getByTestId('child').textContent).toBe('conteudo interno');
    });

    it('renderiza o header da comunidade (logo Akasha)', () => {
      render(
        <CommunityShell user={null}>
          <p>x</p>
        </CommunityShell>
      );
      expect(screen.getByText('Akasha')).toBeTruthy();
    });

    it('renderiza a tag <main> em volta do conteudo', () => {
      render(
        <CommunityShell user={null}>
          <span>conteudo</span>
        </CommunityShell>
      );
      const main = screen.getByRole('main');
      expect(main).toBeTruthy();
      expect(main.contains(screen.getByText('conteudo'))).toBe(true);
    });
  });

  describe('composicao com CommunityNav', () => {
    it('passa o usuario adiante para o nav', () => {
      render(
        <CommunityShell user={sampleUser}>
          <span>x</span>
        </CommunityShell>
      );
      // O avatar do usuario aparece (prova que o nav recebeu user)
      const fallback = screen.getAllByTestId('avatar-fallback')[0];
      expect(fallback.textContent).toBe('B');
    });

    it('passa user=null quando assim fornecido', () => {
      render(
        <CommunityShell user={null}>
          <span>x</span>
        </CommunityShell>
      );
      // Botao "Entrar" so aparece quando user=null
      expect(screen.getByRole('link', { name: /Entrar/i })).toBeTruthy();
    });
  });

  describe('multiplos children', () => {
    it('renderiza varios children em ordem', () => {
      render(
        <CommunityShell user={null}>
          <h1>Titulo</h1>
          <p>paragrafo</p>
          <button>acao</button>
        </CommunityShell>
      );

      expect(screen.getByRole('heading', { level: 1, name: 'Titulo' })).toBeTruthy();
      expect(screen.getByText('paragrafo')).toBeTruthy();
      expect(screen.getByRole('button', { name: 'acao' })).toBeTruthy();
    });
  });
});