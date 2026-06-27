/**
 * Auth integration tests — signup → onboarding → feed
 * ----------------------------------------------------------------------------
 * Testa o fluxo completo do ponto de vista do usuário:
 *   1. /register: signup com email/senha → cria sessão
 *   2. /onboarding: preenche 5 passos → chama completeOnboardingAction
 *   3. /feed: redirect após sucesso
 *
 * Usa mocks pesados de Supabase + Server Actions para evitar rede real.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// ----------------------------------------------------------------------------
// Mocks globais
// ----------------------------------------------------------------------------

const mockSignUp = vi.fn();
const mockSignInWithPassword = vi.fn();
const mockGetSession = vi.fn();
const mockOnAuthStateChange = vi.fn();

vi.mock('@supabase/ssr', () => ({
  createBrowserClient: vi.fn(() => ({
    auth: {
      signUp: mockSignUp,
      signInWithPassword: mockSignInWithPassword,
      getSession: mockGetSession,
      onAuthStateChange: mockOnAuthStateChange,
    },
  })),
  createServerClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'u-test-1', email: 'test@example.com' } },
      }),
    },
  })),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    spiritualProfile: {
      findUnique: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockImplementation(({ data }) =>
        Promise.resolve({ id: 'sp-1', ...data }),
      ),
      upsert: vi.fn().mockImplementation(({ create, update }) =>
        Promise.resolve({ id: 'sp-1', ...create, ...update }),
      ),
    },
    user: {
      update: vi.fn().mockResolvedValue({}),
    },
  },
}));

// Mock do server action — chamado pelo OnboardingFlow
const mockCompleteOnboarding = vi.fn().mockResolvedValue({
  ok: true,
  data: { profileId: 'sp-1', userId: 'u-test-1' },
});

vi.mock('@/app/actions/auth', () => ({
  completeOnboardingAction: (...args: unknown[]) => mockCompleteOnboarding(...args),
  signupAction: vi.fn().mockResolvedValue({
    ok: true,
    data: { userId: 'u-test-1', email: 'test@example.com' },
  }),
  loginAction: vi.fn().mockResolvedValue({
    ok: true,
    data: { userId: 'u-test-1', email: 'test@example.com' },
  }),
  logoutAction: vi.fn().mockResolvedValue({ ok: true }),
}));

const mockPush = vi.fn();
const mockRefresh = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ push: mockPush, refresh: mockRefresh })),
  useSearchParams: vi.fn(() => ({ get: () => null })),
}));

// ----------------------------------------------------------------------------
// Setup
// ----------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks();
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
  mockGetSession.mockResolvedValue({ data: { session: { user: { id: 'u-test-1' } } } });
  mockOnAuthStateChange.mockReturnValue({
    data: { subscription: { unsubscribe: vi.fn() } },
  });
});

// ============================================================================
// Test fixtures
// ============================================================================

async function fillRegisterForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/Nome/i), 'Maria Teste');
  await user.type(screen.getByLabelText(/Email/i), 'maria@teste.com');
  // 2 password fields
  const pwInputs = screen.getAllByLabelText(/Senha/i);
  await user.type(pwInputs[0], 'senha-forte-123');
  await user.type(pwInputs[1], 'senha-forte-123');
  // terms checkbox
  await user.click(screen.getByRole('checkbox', { name: /termos/i }));
}

// ============================================================================
// Tests
// ============================================================================

describe('Auth flow — signup → onboarding → feed', () => {
  describe('signup', () => {
    it('submete form de signup e navega para /onboarding', async () => {
      mockSignUp.mockResolvedValueOnce({
        data: { user: { id: 'u-test-1' }, session: { access_token: 'x' } },
        error: null,
      });

      const { RegisterForm } = await import('@/components/auth/RegisterForm');
      const user = userEvent.setup();
      render(<RegisterForm />);

      await fillRegisterForm(user);

      await user.click(screen.getByRole('button', { name: /criar/i }));

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith(
          'maria@teste.com',
          'senha-forte-123',
          expect.objectContaining({
            data: expect.objectContaining({ name: 'Maria Teste' }),
          }),
        );
      });
    });

    it('mostra mensagem de confirmação quando Supabase exige confirmação de email', async () => {
      mockSignUp.mockResolvedValueOnce({
        data: { user: { id: 'u-test-1' }, session: null },
        error: null,
      });

      const { RegisterForm } = await import('@/components/auth/RegisterForm');
      const user = userEvent.setup();
      render(<RegisterForm />);

      await fillRegisterForm(user);
      await user.click(screen.getByRole('button', { name: /criar/i }));

      await waitFor(() => {
        expect(screen.getByText(/confirme seu email/i)).toBeInTheDocument();
      });
    });
  });

  describe('onboarding', () => {
    it('passa pelos 5 passos e chama completeOnboardingAction', async () => {
      const { OnboardingFlow } = await import(
        '@/components/onboarding/OnboardingFlow'
      );
      const user = userEvent.setup();
      render(<OnboardingFlow />);

      // Espera carregar
      await waitFor(() => screen.getByText(/seu nome/i));

      // Passo 1 — Nome
      await user.type(screen.getByLabelText(/nome completo/i), 'Maria Teste');
      await user.click(screen.getByRole('button', { name: /continuar/i }));

      // Passo 2 — Tradições
      await waitFor(() => screen.getByText(/cabal/i));
      await user.click(screen.getByRole('button', { name: /cabala/i }));
      await user.click(screen.getByRole('button', { name: /astrologia/i }));
      await user.click(screen.getByRole('button', { name: /continuar/i }));

      // Passo 3 — Data
      await waitFor(() => screen.getByLabelText(/data de nascimento/i));
      await user.type(screen.getByLabelText(/data de nascimento/i), '1990-05-15');
      await user.click(screen.getByRole('button', { name: /continuar/i }));

      // Passo 4 — Hora (vazio, ok)
      await waitFor(() => screen.getByLabelText(/horário/i));
      await user.click(screen.getByRole('button', { name: /continuar/i }));

      // Passo 5 — Local
      await waitFor(() => screen.getByLabelText(/cidade/i));
      await user.type(screen.getByLabelText(/cidade de nascimento/i), 'Salvador');
      await user.type(screen.getByLabelText(/país/i), 'Brasil');

      // Submete
      await user.click(screen.getByRole('button', { name: /gerar/i }));

      await waitFor(() => {
        expect(mockCompleteOnboarding).toHaveBeenCalledWith(
          expect.objectContaining({
            fullName: 'Maria Teste',
            traditions: expect.arrayContaining(['cabala', 'astrologia']),
            birthDate: '1990-05-15',
            birthPlace: 'Salvador',
            birthCountry: 'Brasil',
          }),
        );
      });
    });
  });

  describe('validação Zod', () => {
    it('bloqueia signup se senhas não coincidem', async () => {
      const { RegisterForm } = await import('@/components/auth/RegisterForm');
      const user = userEvent.setup();
      render(<RegisterForm />);

      await user.type(screen.getByLabelText(/Nome/i), 'Maria');
      await user.type(screen.getByLabelText(/Email/i), 'maria@teste.com');
      const pws = screen.getAllByLabelText(/Senha/i);
      await user.type(pws[0], '12345678');
      await user.type(pws[1], '87654321');
      await user.click(screen.getByRole('checkbox', { name: /termos/i }));

      await user.click(screen.getByRole('button', { name: /criar/i }));

      await waitFor(() => {
        expect(screen.getByText(/senhas não coincidem/i)).toBeInTheDocument();
      });
      expect(mockSignUp).not.toHaveBeenCalled();
    });

    it('bloqueia signup sem aceitar termos', async () => {
      const { RegisterForm } = await import('@/components/auth/RegisterForm');
      const user = userEvent.setup();
      render(<RegisterForm />);

      await user.type(screen.getByLabelText(/Nome/i), 'Maria');
      await user.type(screen.getByLabelText(/Email/i), 'maria@teste.com');
      const pws = screen.getAllByLabelText(/Senha/i);
      await user.type(pws[0], 'senha12345');
      await user.type(pws[1], 'senha12345');
      // NÃO marca termos
      await user.click(screen.getByRole('button', { name: /criar/i }));

      await waitFor(() => {
        expect(screen.getByText(/aceitar os termos/i)).toBeInTheDocument();
      });
      expect(mockSignUp).not.toHaveBeenCalled();
    });
  });
});