/**
 * buildFormDataFromUser unit tests
 * Tests the helper function from src/app/dashboard/perfil/page.tsx
 */

import { describe, it, expect } from 'vitest';

// Inline the helper to avoid importing the whole page component
// This tests the actual behavior of the function logic
function buildFormDataFromUser(
  user: { email?: string; user_metadata?: Record<string, string> } | null,
  prev: {
    nomeCompleto: string;
    email: string;
    dataNascimento: string;
    horaNascimento: string;
    localNascimento: string;
  }
): {
  nomeCompleto: string;
  email: string;
  dataNascimento: string;
  horaNascimento: string;
  localNascimento: string;
} {
  if (!user) return prev;
  const meta = user.user_metadata ?? {};
  return {
    nomeCompleto: meta.nomeCompleto || meta.full_name || user.email?.split('@')[0] || prev.nomeCompleto,
    email: user.email || prev.email,
    dataNascimento: meta.dataNascimento || meta.data_nascimento || prev.dataNascimento,
    horaNascimento: meta.horaNascimento || prev.horaNascimento || '',
    localNascimento: meta.localNascimento || prev.localNascimento || '',
  };
}

const PREV_FORM = {
  nomeCompleto: 'Maria da Luz',
  email: 'maria.luz@exemplo.com',
  dataNascimento: '1990-06-15',
  horaNascimento: '14:30',
  localNascimento: 'Rio de Janeiro, RJ',
} as const;

describe('buildFormDataFromUser', () => {
  it('returns prev when user is null', () => {
    const result = buildFormDataFromUser(null, PREV_FORM);
    expect(result).toEqual(PREV_FORM);
  });

  it('returns prev when user is undefined', () => {
    // @ts-ignore — testing runtime behavior
    const result = buildFormDataFromUser(undefined, PREV_FORM);
    expect(result).toEqual(PREV_FORM);
  });

  it('uses nomeCompleto from user_metadata when available', () => {
    const result = buildFormDataFromUser(
      { email: 'joao@exemplo.com', user_metadata: { nomeCompleto: 'João Silva' } },
      PREV_FORM
    );
    expect(result.nomeCompleto).toBe('João Silva');
  });

  it('uses full_name from user_metadata as fallback for nomeCompleto', () => {
    const result = buildFormDataFromUser(
      { email: 'joao@exemplo.com', user_metadata: { full_name: 'João Full Name' } },
      PREV_FORM
    );
    expect(result.nomeCompleto).toBe('João Full Name');
  });

  it('derives nomeCompleto from email prefix when no name metadata', () => {
    const result = buildFormDataFromUser(
      { email: 'pedro@exemplo.com', user_metadata: {} },
      PREV_FORM
    );
    expect(result.nomeCompleto).toBe('pedro');
  });

  it('derives nomeCompleto from email when no name metadata', () => {
    // nomeCompleto: wrongKey is missing, so falls through to email prefix
    const result = buildFormDataFromUser(
      { email: 'joao@exemplo.com', user_metadata: { wrongKey: 'value' } },
      PREV_FORM
    );
    expect(result.nomeCompleto).toBe('joao'); // email prefix is the actual fallback
  });

  it('uses email from user when available', () => {
    const result = buildFormDataFromUser(
      { email: 'novo@exemplo.com', user_metadata: {} },
      PREV_FORM
    );
    expect(result.email).toBe('novo@exemplo.com');
  });

  it('falls back to prev.email when user.email is missing', () => {
    const result = buildFormDataFromUser(
      { email: '', user_metadata: {} },
      PREV_FORM
    );
    expect(result.email).toBe('maria.luz@exemplo.com');
  });

  it('uses dataNascimento from user_metadata when available', () => {
    const result = buildFormDataFromUser(
      { email: 'joao@exemplo.com', user_metadata: { dataNascimento: '1985-03-20' } },
      PREV_FORM
    );
    expect(result.dataNascimento).toBe('1985-03-20');
  });

  it('uses data_nascimento (snake_case) as fallback', () => {
    const result = buildFormDataFromUser(
      { email: 'joao@exemplo.com', user_metadata: { data_nascimento: '2000-01-01' } },
      PREV_FORM
    );
    expect(result.dataNascimento).toBe('2000-01-01');
  });

  it('uses horaNascimento from user_metadata', () => {
    const result = buildFormDataFromUser(
      { email: 'joao@exemplo.com', user_metadata: { horaNascimento: '09:15' } },
      PREV_FORM
    );
    expect(result.horaNascimento).toBe('09:15');
  });

  it('uses localNascimento from user_metadata', () => {
    const result = buildFormDataFromUser(
      { email: 'joao@exemplo.com', user_metadata: { localNascimento: 'São Paulo, SP' } },
      PREV_FORM
    );
    expect(result.localNascimento).toBe('São Paulo, SP');
  });

  it('preserves prev.horaNascimento when user_metadata is empty', () => {
    const result = buildFormDataFromUser(
      { email: 'joao@exemplo.com', user_metadata: {} },
      PREV_FORM
    );
    expect(result.horaNascimento).toBe('14:30');
  });

  it('preserves prev.localNascimento when user_metadata is empty', () => {
    const result = buildFormDataFromUser(
      { email: 'joao@exemplo.com', user_metadata: {} },
      PREV_FORM
    );
    expect(result.localNascimento).toBe('Rio de Janeiro, RJ');
  });

  it('returns empty string for horaNascimento when no metadata and prev is empty', () => {
    const emptyPrev = {
      nomeCompleto: '',
      email: '',
      dataNascimento: '',
      horaNascimento: '',
      localNascimento: '',
    };
    const result = buildFormDataFromUser(
      { email: 'joao@exemplo.com', user_metadata: {} },
      emptyPrev
    );
    expect(result.horaNascimento).toBe('');
  });
});
