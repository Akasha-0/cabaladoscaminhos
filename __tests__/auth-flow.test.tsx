/**
 * Auth flow tests (signup → onboarding → redirect to feed)
 * ----------------------------------------------------------------------------
 * Cobre os componentes principais do fluxo:
 *   - LoginForm: valida email/senha, mostra erros, submete ao supabase
 *   - RegisterForm: valida nome/email/senha/termos, submete ao supabase
 *   - OnboardingFlow: 5 passos, validação por passo, action de finalizar
 *
 * Cada teste substitui o supabase client real por um mock controlado,
 * para validar o comportamento sem precisar de um projeto Supabase real.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';

import type { SupabaseClient } from '@supabase/supabase-js';

// ============================================================================
// MOCKS COMPARTILHADOS
// ============================================================================

const mockPush = vi.fn();
const mockRefresh = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn(), refresh: mockRefresh, back: vi.fn() }),
  useSearchParams: () => ({
    get: (key: string) => (key === 'redirectTo' ? '/feed' : null),
  }),
}));

let fakeSupabaseClient: {
  auth: {
    signInWithPassword: ReturnType<typeof vi.fn>;
    signUp: ReturnType<typeof vi.fn>;
    signInWithOAuth: ReturnType<typeof vi.fn>;
    signOut: ReturnType<typeof vi.fn>;
    getUser: ReturnType<typeof vi.fn>;
    onAuthStateChange: ReturnType<typeof vi.fn>;
  };
} | null = null;

vi.mock('@/components/providers/SupabaseProvider', () => ({
  useAuth: () => ({
    user: null,
    isLoading: false,
    isAuthenticated: false,
    signOut: vi.fn(),
    supabase: fakeSupabaseClient,
  }),
}));

// Mock da server action de onboarding
const mockCompleteOnboarding = vi.fn();
vi.mock('@/app/actions/auth', () => ({
  completeOnboardingAction: (...args: unknown[]) => mockCompleteOnboarding(...args),
  loginAction: vi.fn(),
  signupAction: vi.fn(),
  logoutAction: vi.fn(),
}));

// ============================================================================
// TESTES DO LOGIN FORM
// ============================================================================

import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';

function buildSupabaseMock() {
  return {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signInWithOAuth: vi.fn(),
      signOut: vi.fn(),
      getUser: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockPush.mockReset();
  mockRefresh.mockReset();
  mockCompleteOnboarding.mockReset();
  fakeSupabaseClient = null;
});

describe('LoginForm', () => {
  it('renderiza campos de email e senha', () => {
    render(<LoginForm />);
    expect(screen.getByLabelText(/email/i)).toBeTruthy();
    expect(screen.getByLabelText(/senha/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeTruthy();
  });

  it('mostra erros de validação quando campos vazios', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(screen.getByText(/email obrigatório/i)).toBeTruthy();
    });
    expect(screen.getByText(/senha obrigatória/i)).toBeTruthy();
  });

  it('rejeita email inválido', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), 'nao-eh-email');
    await user.type(screen.getByLabelText(/senha/i), '123');
    await user.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(screen.getByText(/email inválido/i)).toBeTruthy();
    });
  });

  it('mostra mensagem amigável quando credenciais inválidas', async () => {
    fakeSupabaseClient = buildSupabaseMock();
    fakeSupabaseClient.auth.signInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: { name: 'AuthError', message: 'Invalid login credentials' },
    });

    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), 'a@b.com');
    await user.type(screen.getByLabelText(/senha/i), 'wrongpass');
    await user.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert').textContent).toMatch(/email ou senha incorretos/i);
    });
  });

  it('redireciona para /feed após login bem-sucedido', async () => {
    fakeSupabaseClient = buildSupabaseMock();
    fakeSupabaseClient.auth.signInWithPassword.mockResolvedValue({
      data: { user: { id: '1', email: 'a@b.com' }, session: {} },
      error: null,
    });

    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), 'a@b.com');
    await user.type(screen.getByLabelText(/senha/i), 'senha12345');
    await user.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/feed');
    });
  });

  it('avisa quando supabase não está configurado', async () => {
    fakeSupabaseClient = null;

    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), 'a@b.com');
    await user.type(screen.getByLabelText(/senha/i), 'senha12345');
    await user.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert').textContent).toMatch(/supabase não configurado/i);
    });
  });
});

describe('RegisterForm', () => {
  it('exige aceite de termos', async () => {
    fakeSupabaseClient = buildSupabaseMock();
    fakeSupabaseClient.auth.signUp.mockResolvedValue({
      data: { user: { id: '1', email: 'a@b.com' }, session: {} },
      error: null,
    });

    const user = userEvent.setup();
    render(<RegisterForm />);

    await user.type(screen.getByLabelText(/nome completo/i), 'Ana Cabral');
    await user.type(screen.getByLabelText(/^email/i), 'a@b.com');
    await user.type(screen.getByLabelText(/^senha/i), 'senha12345');
    await user.type(screen.getByLabelText(/confirmar senha/i), 'senha12345');
    // Não marcar termos
    await user.click(screen.getByRole('button', { name: /criar conta/i }));

    await waitFor(() => {
      expect(screen.getByText(/aceitar os termos/i)).toBeTruthy();
    });
  });

  it('detecta senhas diferentes', async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    await user.type(screen.getByLabelText(/nome completo/i), 'Ana');
    await user.type(screen.getByLabelText(/^email/i), 'a@b.com');
    await user.type(screen.getByLabelText(/^senha/i), 'senha12345');
    await user.type(screen.getByLabelText(/confirmar senha/i), 'outraSenha9');
    await user.click(screen.getByLabelText(/aceitar termos/i));
    await user.click(screen.getByRole('button', { name: /criar conta/i }));

    await waitFor(() => {
      expect(screen.getByText(/senhas não coincidem/i)).toBeTruthy();
    });
  });

  it('redireciona para /onboarding após signup OK', async () => {
    fakeSupabaseClient = buildSupabaseMock();
    fakeSupabaseClient.auth.signUp.mockResolvedValue({
      data: { user: { id: '1', email: 'a@b.com' }, session: {} },
      error: null,
    });

    const user = userEvent.setup();
    render(<RegisterForm />);

    await user.type(screen.getByLabelText(/nome completo/i), 'Ana Cabral');
    await user.type(screen.getByLabelText(/^email/i), 'a@b.com');
    await user.type(screen.getByLabelText(/^senha/i), 'senha12345');
    await user.type(screen.getByLabelText(/confirmar senha/i), 'senha12345');
    await user.click(screen.getByLabelText(/aceitar termos/i));
    await user.click(screen.getByRole('button', { name: /criar conta/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/onboarding');
    });
  });
});

// ============================================================================
// TESTES DO ONBOARDING FLOW
// ============================================================================

// O OnboardingFlow espera `useAuth` retornar user !== null.
// Aqui sobrescrevemos o mock para esse describe.
describe('OnboardingFlow', () => {
  let useAuthReturn: { user: unknown; isLoading: boolean; supabase: unknown };

  beforeEach(() => {
    useAuthReturn = { user: { id: 'u1', email: 'a@b.com' }, isLoading: false, supabase: null };
  });

  // Mock dinâmico para o escopo do describe — necessário porque vi.mock
  // não pode ser chamado dentro de describe com setup lazy sem hoist. Como
  // alternativa, usamos um mock controlado por variável.
  function Wrapper({ children }: { children: ReactNode }) {
    return <>{children}</>;
  }

  it('renderiza o primeiro passo (Nome Completo)', async () => {
    vi.doMock('@/components/providers/SupabaseProvider', () => ({
      useAuth: () => useAuthReturn,
    }));
    // Re-import dentro do teste para pegar o mock atualizado
    const { OnboardingFlow: OnboardingFlowFresh } = await import(
      '@/components/onboarding/OnboardingFlow'
    );

    render(<OnboardingFlowFresh />, { wrapper: Wrapper });

    expect(await screen.findByLabelText(/nome completo/i)).toBeTruthy();
    expect(screen.getByText(/passo 1 de 5/i)).toBeTruthy();
  });

  it('avança pelos 5 passos e dispara completeOnboardingAction', async () => {
    mockCompleteOnboarding.mockResolvedValue({
      ok: true,
      data: { profileId: 'p1', userId: 'u1' },
    });

    vi.doMock('@/components/providers/SupabaseProvider', () => ({
      useAuth: () => useAuthReturn,
    }));
    const { OnboardingFlow: OnboardingFlowFresh } = await import(
      '@/components/onboarding/OnboardingFlow'
    );

    const user = userEvent.setup();
    render(<OnboardingFlowFresh />, { wrapper: Wrapper });

    // Step 1: nome
    await user.type(await screen.findByLabelText(/nome completo/i), 'Ana Cabral');
    await user.click(screen.getByRole('button', { name: /continuar/i }));

    // Step 2: tradições
    expect(await screen.findByText(/tradições/i)).toBeTruthy();
    await user.click(screen.getByRole('button', { name: /cabala/i }));
    await user.click(screen.getByRole('button', { name: /astrologia/i }));
    await user.click(screen.getByRole('button', { name: /continuar/i }));

    // Step 3: data
    expect(await screen.findByLabelText(/data de nascimento/i)).toBeTruthy();
    await user.type(screen.getByLabelText(/data de nascimento/i), '1990-05-15');
    await user.click(screen.getByRole('button', { name: /continuar/i }));

    // Step 4: hora (opcional — pular)
    expect(await screen.findByLabelText(/horário/i)).toBeTruthy();
    await user.click(screen.getByRole('button', { name: /continuar/i }));

    // Step 5: local
    expect(await screen.findByLabelText(/cidade de nascimento/i)).toBeTruthy();
    await user.type(screen.getByLabelText(/cidade de nascimento/i), 'Salvador');
    await user.click(screen.getByRole('button', { name: /gerar meu mapa/i }));

    await waitFor(() => {
      expect(mockCompleteOnboarding).toHaveBeenCalledTimes(1);
    });

    const args = mockCompleteOnboarding.mock.calls[0][0];
    expect(args.fullName).toBe('Ana Cabral');
    expect(args.traditions).toEqual(expect.arrayContaining(['cabala', 'astrologia']));
    expect(args.birthDate).toBe('1990-05-15');
    expect(args.birthPlace).toBe('Salvador');

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/feed?welcome=1');
    });
  });

  it('mostra erro do servidor quando completeOnboardingAction falha', async () => {
    mockCompleteOnboarding.mockResolvedValue({
      ok: false,
      error: 'Erro simulado',
    });

    vi.doMock('@/components/providers/SupabaseProvider', () => ({
      useAuth: () => useAuthReturn,
    }));
    const { OnboardingFlow: OnboardingFlowFresh } = await import(
      '@/components/onboarding/OnboardingFlow'
    );

    const user = userEvent.setup();
    render(<OnboardingFlowFresh />, { wrapper: Wrapper });

    await user.type(await screen.findByLabelText(/nome completo/i), 'Ana');
    await user.click(screen.getByRole('button', { name: /continuar/i }));
    await user.click(screen.getByRole('button', { name: /cabala/i }));
    await user.click(screen.getByRole('button', { name: /continuar/i }));
    await user.type(screen.getByLabelText(/data de nascimento/i), '1990-05-15');
    await user.click(screen.getByRole('button', { name: /continuar/i }));
    await user.click(screen.getByRole('button', { name: /continuar/i }));
    await user.type(screen.getByLabelText(/cidade de nascimento/i), 'Salvador');
    await user.click(screen.getByRole('button', { name: /gerar meu mapa/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert').textContent).toMatch(/erro simulado/i);
    });
  });
});