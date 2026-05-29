import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { UserProvider, useUserContext, getNumerologyInterpretation } from '@/components/providers/UserProvider';

// Mock the zustand store
vi.mock('@/lib/store/user-profile', () => ({
  useUserProfileStore: () => ({
    profile: null,
    isLoading: false,
    setProfile: vi.fn(),
    updateProfile: vi.fn(),
    clearProfile: vi.fn(),
  }),
}));

// Mock numerologia calculos - return the actual shape
vi.mock('@/lib/numerologia/calculos', () => ({
  calculateLifePath: vi.fn(() => 7),
  calculateExpression: vi.fn(() => 5),
  calculateSoulUrge: vi.fn(() => 3),
  calculatePersonality: vi.fn(() => 2),
  getInterpretacao: vi.fn((num: number) => {
    if (num === null) return null;
    return {
      numero: num,
      nome: `Número ${num}`,
      significado: 'Descrição espiritual',
      forca: 'Força espiritual',
      desafio: 'Desafio espiritual',
      sefirotRelacionado: 'Hod',
    };
  }),
}));

// Test component that uses the context
function TestConsumer() {
  const userData = useUserContext();
  
  return (
    <div>
      <span data-testid="has-profile">{userData.hasProfile ? 'yes' : 'no'}</span>
      <span data-testid="life-path">{userData.lifePath ?? 'null'}</span>
      <span data-testid="destiny">{userData.destiny ?? 'null'}</span>
      <span data-testid="soul-urge">{userData.soulUrge ?? 'null'}</span>
      <span data-testid="personality">{userData.personality ?? 'null'}</span>
      <span data-testid="orixa">{userData.orixaRegente ?? 'none'}</span>
      <span data-testid="odu">{userData.odu ?? 'none'}</span>
    </div>
  );
}

describe('UserProvider', () => {
  it('deve fornecer valores padrão quando não há perfil', () => {
    render(
      <UserProvider>
        <TestConsumer />
      </UserProvider>
    );
    
    expect(screen.getByTestId('has-profile').textContent).toBe('no');
    expect(screen.getByTestId('life-path').textContent).toBe('null');
    expect(screen.getByTestId('orixa').textContent).toBe('none');
  });
  
  it('deve usar dados iniciais quando fornecidos', () => {
    render(
      <UserProvider initialData={{ orixaRegente: 'Oxalá', odu: 'Okaran' }}>
        <TestConsumer />
      </UserProvider>
    );
    
    expect(screen.getByTestId('has-profile').textContent).toBe('yes');
    expect(screen.getByTestId('orixa').textContent).toBe('Oxalá');
    expect(screen.getByTestId('odu').textContent).toBe('Okaran');
  });
  
  it('deve calcular numerologia quando nome é fornecido', () => {
    render(
      <UserProvider initialData={{ nome: 'Maria' }}>
        <TestConsumer />
      </UserProvider>
    );
    
    expect(screen.getByTestId('has-profile').textContent).toBe('yes');
    expect(screen.getByTestId('destiny').textContent).toBe('5');
    expect(screen.getByTestId('soul-urge').textContent).toBe('3');
    expect(screen.getByTestId('personality').textContent).toBe('2');
  });
});

describe('getNumerologyInterpretation', () => {
  it('deve retornar null para número null', () => {
    expect(getNumerologyInterpretation(null)).toBeNull();
  });
  
  it('deve retornar interpretação para número válido', () => {
    const result = getNumerologyInterpretation(7);
    expect(result).toBeTruthy();
    expect(result?.numero).toBe(7);
    expect(result?.titulo).toBe('Número 7');
    expect(result?.sefira).toBe('Hod');
  });
});
