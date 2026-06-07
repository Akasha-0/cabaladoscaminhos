import { renderHook, act } from '@testing-library/react';
import { useUserProfileStore } from '@/lib/store/user-profile';

// Reset store between tests
beforeEach(() => {
  const { result } = renderHook(() => useUserProfileStore());
  act(() => {
    result.current.clearProfile();
  });
});

describe('useUserProfileStore', () => {
  it('initializes with null profile', () => {
    const { result } = renderHook(() => useUserProfileStore());
    expect(result.current.profile).toBeNull();
  });

  it('setProfile updates profile', () => {
    const { result } = renderHook(() => useUserProfileStore());

    act(() => {
      result.current.setProfile({ id: '1', nome: 'Test', email: 'test@test.com' });
    });

    expect(result.current.profile?.nome).toBe('Test');
    expect(result.current.profile?.id).toBe('1');
    expect(result.current.profile?.email).toBe('test@test.com');
  });

  it('updateProfile merges with existing profile', () => {
    const { result } = renderHook(() => useUserProfileStore());

    act(() => {
      result.current.setProfile({ id: '1', nome: 'Test', email: 'test@test.com' });
    });

    act(() => {
      result.current.updateProfile({ numeroVida: 5, orixaRegente: 'Oxalá' });
    });

    expect(result.current.profile?.numeroVida).toBe(5);
    expect(result.current.profile?.orixaRegente).toBe('Oxalá');
    expect(result.current.profile?.nome).toBe('Test'); // existing field preserved
  });

  it('clearProfile resets to null', () => {
    const { result } = renderHook(() => useUserProfileStore());

    act(() => {
      result.current.setProfile({ id: '1', nome: 'Test', email: 'test@test.com' });
    });

    act(() => {
      result.current.clearProfile();
    });

    expect(result.current.profile).toBeNull();
  });

  it('isLoading starts as false', () => {
    const { result } = renderHook(() => useUserProfileStore());
    expect(result.current.isLoading).toBe(false);
  });

  it('can set multiple profile fields', () => {
    const { result } = renderHook(() => useUserProfileStore());

    act(() => {
      result.current.setProfile({
        id: '1',
        nome: 'Maria',
        email: 'maria@test.com',
        dataNascimento: '1990-01-15',
        numeroVida: 7,
        odu: 'Ogbe',
        signo: 'Capricórnio',
        orixaRegente: 'Iemanjá',
      });
    });

    expect(result.current.profile?.nome).toBe('Maria');
    expect(result.current.profile?.dataNascimento).toBe('1990-01-15');
    expect(result.current.profile?.odu).toBe('Ogbe');
    expect(result.current.profile?.signo).toBe('Capricórnio');
  });

  it('updateProfile without existing profile does nothing', () => {
    const { result } = renderHook(() => useUserProfileStore());

    act(() => {
      result.current.updateProfile({ numeroVida: 5 });
    });

    expect(result.current.profile).toBeNull();
  });
});
