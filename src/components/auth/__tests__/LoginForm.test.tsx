/**
 * LoginForm — Wave 20
 * ----------------------------------------------------------------------------
 * Testa o shell + comportamento client-side:
 *  - Renderização dos campos email + password + submit
 *  - Acessibilidade: labels associados, aria-invalid em erros
 *  - Validação client-side (Zod loginSchema)
 *  - Toggle de visibilidade de senha (aria-pressed)
 *  - Chamada ao signIn() do useAuth e redirecionamento
 *  - Renderização de mensagem de erro do servidor
 *  - Renderização do link para /register e /forgot-password
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// ----------------------------------------------------------------------------
// Mocks
// ----------------------------------------------------------------------------

const mockSignIn = vi.fn();
const mockPush = vi.fn();

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...rest
  }: {
    children: React.ReactNode;
    href: string;
  } & React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: vi.fn(),
    replace: vi.fn(),
  }),
  useSearchParams: () => ({
    get: (key: string) => (key === 'redirectTo' ? '/feed' : null),
  }),
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    isAuthenticated: false,
    supabase: {},
    signIn: mockSignIn,
    signUp: vi.fn(),
    signInWithMagicLink: vi.fn(),
    signInWithGoogle: vi.fn(),
    signOut: vi.fn(),
    redirectAfterAuth: vi.fn(),
  }),
}));

import { LoginForm } from '../LoginForm';

beforeEach(() => {
  vi.clearAllMocks();
});

// ============================================================================
// Tests
// ============================================================================

describe('LoginForm', () => {
  // Helper: o toggle "Mostrar senha" tem aria-label que também bate com
  // /senha/i. Usamos getByLabelText com text-match exato "Senha" (Label).
  const getEmailInput = () => screen.getByLabelText('Email') as HTMLInputElement;
  const getPasswordInput = () => screen.getByLabelText('Senha') as HTMLInputElement;

  describe('renderização', () => {
    it('renderiza título, subtítulo e campos email/senha', () => {
      render(<LoginForm />);
      expect(screen.getByRole('heading', { name: /portal espiritual/i })).toBeInTheDocument();
      expect(getEmailInput()).toBeInTheDocument();
      expect(getPasswordInput()).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
    });

    it('renderiza link para /register e /forgot-password', () => {
      render(<LoginForm />);
      const registerLink = screen.getByRole('link', { name: /criar uma conta/i });
      expect(registerLink).toHaveAttribute('href', '/register');
      const forgotLink = screen.getByRole('link', { name: /esqueci minha senha/i });
      expect(forgotLink).toHaveAttribute('href', '/forgot-password');
    });
  });

  describe('a11y', () => {
    it('email input tem aria-invalid quando há erro de validação', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);
      const emailInput = getEmailInput();

      // Vazio → erro após submit
      await user.click(screen.getByRole('button', { name: /entrar/i }));

      await waitFor(() => {
        expect(emailInput).toHaveAttribute('aria-invalid', 'true');
      });
    });

    it('toggle de senha tem aria-pressed correto', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);
      const toggle = screen.getByRole('button', { name: /mostrar senha/i });
      expect(toggle).toHaveAttribute('aria-pressed', 'false');

      await user.click(toggle);
      expect(toggle).toHaveAttribute('aria-pressed', 'true');

      // label deve alternar
      expect(
        screen.getByRole('button', { name: /ocultar senha/i })
      ).toBeInTheDocument();
    });

    it('alterna type do input password ↔ text ao clicar toggle', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);
      const passwordInput = getPasswordInput();
      expect(passwordInput.type).toBe('password');

      await user.click(screen.getByRole('button', { name: /mostrar senha/i }));
      expect(passwordInput.type).toBe('text');

      await user.click(screen.getByRole('button', { name: /ocultar senha/i }));
      expect(passwordInput.type).toBe('password');
    });
  });

  describe('validação client-side', () => {
    it('mostra erro quando email é vazio', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      await user.type(getPasswordInput(), 'algumaSenha123');
      await user.click(screen.getByRole('button', { name: /entrar/i }));

      await waitFor(() => {
        expect(screen.getByText(/email obrigatório/i)).toBeInTheDocument();
      });
      expect(mockSignIn).not.toHaveBeenCalled();
    });

    it('mostra erro quando email é inválido', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      await user.type(getEmailInput(), 'not-an-email');
      await user.type(getPasswordInput(), 'algumaSenha123');
      await user.click(screen.getByRole('button', { name: /entrar/i }));

      await waitFor(() => {
        expect(screen.getByText(/email inválido/i)).toBeInTheDocument();
      });
      expect(mockSignIn).not.toHaveBeenCalled();
    });

    it('mostra erro quando senha é vazia', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      await user.type(getEmailInput(), 'user@example.com');
      await user.click(screen.getByRole('button', { name: /entrar/i }));

      await waitFor(() => {
        expect(screen.getByText(/senha obrigatória/i)).toBeInTheDocument();
      });
      expect(mockSignIn).not.toHaveBeenCalled();
    });
  });

  describe('submissão bem-sucedida', () => {
    it('chama signIn e redireciona para redirectTo após sucesso', async () => {
      mockSignIn.mockResolvedValueOnce({ ok: true });
      const user = userEvent.setup();
      render(<LoginForm />);

      await user.type(getEmailInput(), 'user@example.com');
      await user.type(getPasswordInput(), 'senhaValida123');
      await user.click(screen.getByRole('button', { name: /entrar/i }));

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('user@example.com', 'senhaValida123');
      });
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/feed');
      });
    });
  });

  describe('submissão com erro', () => {
    it('mostra mensagem de erro do servidor quando signIn retorna ok=false', async () => {
      mockSignIn.mockResolvedValueOnce({ ok: false, error: 'Email ou senha incorretos' });
      const user = userEvent.setup();
      render(<LoginForm />);

      await user.type(getEmailInput(), 'user@example.com');
      await user.type(getPasswordInput(), 'senhaErrada');
      await user.click(screen.getByRole('button', { name: /entrar/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/email ou senha incorretos/i);
      });
      expect(mockPush).not.toHaveBeenCalled();
    });

    it('mostra mensagem genérica quando signIn throws', async () => {
      mockSignIn.mockRejectedValueOnce(new Error('network'));
      const user = userEvent.setup();
      render(<LoginForm />);

      await user.type(getEmailInput(), 'user@example.com');
      await user.type(getPasswordInput(), 'senhaValida123');
      await user.click(screen.getByRole('button', { name: /entrar/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/erro ao fazer login/i);
      });
    });
  });

  describe('estado de loading', () => {
    it('desabilita inputs e botão durante submissão', async () => {
      mockSignIn.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ ok: true }), 100))
  );
      const user = userEvent.setup();
      render(<LoginForm />);

      await user.type(getEmailInput(), 'user@example.com');
      await user.type(getPasswordInput(), 'senhaValida123');
      await user.click(screen.getByRole('button', { name: /entrar/i }));

      // durante loading: button mostra "Entrando..."
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /entrando/i })).toBeDisabled();
      });
    });
  });
});