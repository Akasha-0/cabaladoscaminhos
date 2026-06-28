/**
 * AuthForm — Wave 20
 * ----------------------------------------------------------------------------
 * Testa o shell compartilhado:
 *  - Renderização de header (icon, title, subtitle)
 *  - Renderização do conteúdo principal
 *  - Renderização condicional do oauthSlot e footerSlot
 *  - Divider "ou" presente quando oauthSlot é fornecido
 *  - role="region" + aria-labelledby para a11y
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Sparkles } from 'lucide-react';
import { AuthForm, AuthFormHeader } from '../AuthForm';

describe('AuthForm', () => {
  describe('renderização básica', () => {
    it('renderiza title e subtitle no header', () => {
      render(
        <AuthForm
          header={{ icon: <Sparkles data-testid="icon" />, title: 'Entrar', subtitle: 'Bem-vindo' }}
        >
          <input type="email" aria-label="email" />
        </AuthForm>
      );

      expect(screen.getByRole('heading', { name: /entrar/i })).toBeInTheDocument();
      expect(screen.getByText(/bem-vindo/i)).toBeInTheDocument();
      expect(screen.getByTestId('icon')).toBeInTheDocument();
    });

    it('renderiza o children no body', () => {
      render(
        <AuthForm header={{ title: 'Test' }}>
          <button>Custom button</button>
        </AuthForm>
      );

      expect(screen.getByRole('button', { name: /custom button/i })).toBeInTheDocument();
    });

    it('header aceita icon opcional (não renderiza wrapper se ausente)', () => {
      const { container } = render(
        <AuthForm header={{ title: 'Sem icon' }}>
          <span>content</span>
        </AuthForm>
      );

      expect(screen.getByRole('heading', { name: /sem icon/i })).toBeInTheDocument();
      // wrapper do icon (div com bg-gradient) não deve estar presente
      const gradientDivs = container.querySelectorAll('.bg-gradient-to-br');
      expect(gradientDivs.length).toBe(0);
    });
  });

  describe('slots condicionais', () => {
    it('renderiza oauthSlot com divider "ou" quando fornecido', () => {
      render(
        <AuthForm
          header={{ title: 'Login' }}
          oauthSlot={<button>Continuar com Google</button>}
        >
          <input aria-label="email" />
        </AuthForm>
      );

      expect(screen.getByRole('button', { name: /google/i })).toBeInTheDocument();
      expect(screen.getByText(/^ou$/i)).toBeInTheDocument();
    });

    it('NÃO renderiza divider quando oauthSlot ausente', () => {
      render(
        <AuthForm header={{ title: 'Login' }}>
          <input aria-label="email" />
        </AuthForm>
      );

      expect(screen.queryByText(/^ou$/i)).not.toBeInTheDocument();
    });

    it('renderiza footerSlot quando fornecido', () => {
      render(
        <AuthForm
          header={{ title: 'Login' }}
          footerSlot={<a href="/register">Criar conta</a>}
        >
          <input aria-label="email" />
        </AuthForm>
      );

      expect(screen.getByRole('link', { name: /criar conta/i })).toBeInTheDocument();
    });
  });

  describe('a11y', () => {
    it('tem role="region" e aria-labelledby', () => {
      const { container } = render(
        <AuthForm header={{ title: 'Login Espiritual' }}>
          <input aria-label="email" />
        </AuthForm>
      );

      const region = container.querySelector('[role="region"]');
      expect(region).not.toBeNull();
      expect(region?.getAttribute('aria-labelledby')).toBeTruthy();

      // O ID do aria-labelledby deve apontar para o sr-only span com o título
      const labelId = region?.getAttribute('aria-labelledby');
      const labelledBySpan = labelId ? container.querySelector(`#${labelId}`) : null;
      expect(labelledBySpan?.textContent).toBe('Login Espiritual');
    });

    it('aceita aria-labelledby customizado', () => {
      const { container } = render(
        <>
          <h2 id="custom-label">Custom heading outside</h2>
          <AuthForm header={{ title: 'Inner' }} ariaLabelledBy="custom-label">
            <input aria-label="email" />
          </AuthForm>
        </>
      );

      const region = container.querySelector('[role="region"]');
      expect(region?.getAttribute('aria-labelledby')).toBe('custom-label');
    });
  });

  describe('AuthFormHeader (export granular)', () => {
    it('renderiza isoladamente quando necessário', () => {
      render(
        <AuthFormHeader
          icon={<Sparkles data-testid="header-icon" />}
          title="Header isolado"
          subtitle="Para composição customizada"
        />
      );

      expect(screen.getByTestId('header-icon')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /header isolado/i })).toBeInTheDocument();
      expect(screen.getByText(/composição customizada/i)).toBeInTheDocument();
    });
  });

  describe('className prop', () => {
    it('aplica className extra ao shell', () => {
      const { container } = render(
        <AuthForm header={{ title: 'Test' }} className="custom-class">
          <input aria-label="email" />
        </AuthForm>
      );

      const region = container.querySelector('[role="region"]');
      expect(region?.className).toMatch(/custom-class/);
      // classes padrão também devem estar presentes
      expect(region?.className).toMatch(/card-spiritual/);
    });
  });
});