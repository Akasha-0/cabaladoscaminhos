import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useUserProfile, useHasUserProfile, useNumerologyInterpretation } from '@/hooks/useUserProfile';

// Mock data
const mockProfile = {
  id: 'test-id',
  nome: 'Test User',
  email: 'test@example.com',
  dataNascimento: '15/01/1990',
  orixaRegente: 'Oxum',
  odu: 'Oxé',
  numeroVida: 5,
};

// Mock the store with selector support
vi.mock('@/lib/store/user-profile', () => {
  return {
    useUserProfileStore: (selector?: (state: { profile: typeof mockProfile; isLoading: boolean; setProfile: () => void; updateProfile: () => void; clearProfile: () => void }) => unknown) => {
      const store = {
        profile: mockProfile,
        isLoading: false,
        setProfile: vi.fn(),
        updateProfile: vi.fn(),
        clearProfile: vi.fn(),
      };
      return selector ? selector(store) : store;
    },
  };
});

describe('useUserProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns user data object', () => {
    const { result } = renderHook(() => useUserProfile());
    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty('nome');
    expect(result.current).toHaveProperty('dataNascimento');
  });

  it('has nome property from profile', () => {
    const { result } = renderHook(() => useUserProfile());
    expect(result.current.nome).toBe('Test User');
  });

  it('has dataNascimento property from profile', () => {
    const { result } = renderHook(() => useUserProfile());
    expect(result.current.dataNascimento).toBe('15/01/1990');
  });

  it('has orixaRegente property from profile', () => {
    const { result } = renderHook(() => useUserProfile());
    expect(result.current.orixaRegente).toBe('Oxum');
  });

  it('has odu property from profile', () => {
    const { result } = renderHook(() => useUserProfile());
    expect(result.current.odu).toBe('Oxé');
  });

  it('has numeroVida property from profile', () => {
    const { result } = renderHook(() => useUserProfile());
    expect(result.current.numeroVida).toBe(5);
  });

  it('returns computed numerology when profile exists', () => {
    const { result } = renderHook(() => useUserProfile());
    // Should have lifePath calculation
    expect(result.current).toHaveProperty('lifePath');
  });

  it('returns object with all expected fields', () => {
    const { result } = renderHook(() => useUserProfile());
    const data = result.current;
    expect(data.nome).toBe('Test User');
    expect(data.dataNascimento).toBe('15/01/1990');
    expect(data.orixaRegente).toBe('Oxum');
    expect(data.odu).toBe('Oxé');
    expect(data.numeroVida).toBe(5);
  });
});

describe('useHasUserProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns boolean value', () => {
    const { result } = renderHook(() => useHasUserProfile());
    expect(typeof result.current).toBe('boolean');
  });

  it('returns true when profile exists', () => {
    const { result } = renderHook(() => useHasUserProfile());
    expect(result.current).toBe(true);
  });
});

describe('useNumerologyInterpretation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null for null input', () => {
    const { result } = renderHook(() => useNumerologyInterpretation(null));
    expect(result.current).toBeNull();
  });

  it('returns object for valid number', () => {
    const { result } = renderHook(() => useNumerologyInterpretation(5));
    expect(result.current).toBeDefined();
  });
});