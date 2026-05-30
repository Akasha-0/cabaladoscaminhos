import { renderHook, act } from '@testing-library/react';
import { useUserPreferences } from '@/lib/store/userPreferences';

// Reset store between tests
beforeEach(() => {
  const { result } = renderHook(() => useUserPreferences());
  act(() => {
    result.current.clearQuizilas();
    result.current.setTema('mystical');
    result.current.setNotifications(true);
    result.current.setOrixaFavorito(null);
  });
});

describe('useUserPreferences', () => {
  describe('initial state', () => {
    it('initializes with default theme mystical', () => {
      const { result } = renderHook(() => useUserPreferences());
      expect(result.current.tema).toBe('mystical');
    });

    it('initializes with notifications enabled', () => {
      const { result } = renderHook(() => useUserPreferences());
      expect(result.current.notifications).toBe(true);
    });

    it('initializes with empty quizilas array', () => {
      const { result } = renderHook(() => useUserPreferences());
      expect(result.current.quizilas).toEqual([]);
    });

    it('initializes with null orixaFavorito', () => {
      const { result } = renderHook(() => useUserPreferences());
      expect(result.current.orixaFavorito).toBeNull();
    });
  });

  describe('setTema', () => {
    it('changes theme to minimal', () => {
      const { result } = renderHook(() => useUserPreferences());

      act(() => {
        result.current.setTema('minimal');
      });

      expect(result.current.tema).toBe('minimal');
    });

    it('changes theme to cosmic', () => {
      const { result } = renderHook(() => useUserPreferences());

      act(() => {
        result.current.setTema('cosmic');
      });

      expect(result.current.tema).toBe('cosmic');
    });

    it('reverts theme back to mystical', () => {
      const { result } = renderHook(() => useUserPreferences());

      act(() => {
        result.current.setTema('cosmic');
      });

      act(() => {
        result.current.setTema('mystical');
      });

      expect(result.current.tema).toBe('mystical');
    });
  });

  describe('setNotifications', () => {
    it('disables notifications', () => {
      const { result } = renderHook(() => useUserPreferences());

      act(() => {
        result.current.setNotifications(false);
      });

      expect(result.current.notifications).toBe(false);
    });

    it('re-enables notifications', () => {
      const { result } = renderHook(() => useUserPreferences());

      act(() => {
        result.current.setNotifications(false);
      });

      act(() => {
        result.current.setNotifications(true);
      });

      expect(result.current.notifications).toBe(true);
    });
  });

  describe('addQuizila', () => {
    it('adds a quizila to the array', () => {
      const { result } = renderHook(() => useUserPreferences());

      act(() => {
        result.current.addQuizila('Ogbe');
      });

      expect(result.current.quizilas).toContain('Ogbe');
    });

    it('adds multiple quizilas', () => {
      const { result } = renderHook(() => useUserPreferences());

      act(() => {
        result.current.addQuizila('Ogbe');
      });

      act(() => {
        result.current.addQuizila('Oxum');
      });

      expect(result.current.quizilas).toHaveLength(2);
      expect(result.current.quizilas).toContain('Ogbe');
      expect(result.current.quizilas).toContain('Oxum');
    });

    it('does not add duplicate quizilas', () => {
      const { result } = renderHook(() => useUserPreferences());

      act(() => {
        result.current.addQuizila('Ogbe');
      });

      act(() => {
        result.current.addQuizila('Ogbe');
      });

      expect(result.current.quizilas).toHaveLength(1);
      expect(result.current.quizilas).toEqual(['Ogbe']);
    });
  });

  describe('removeQuizila', () => {
    it('removes a quizila from the array', () => {
      const { result } = renderHook(() => useUserPreferences());

      act(() => {
        result.current.addQuizila('Ogbe');
      });

      act(() => {
        result.current.addQuizila('Oxum');
      });

      act(() => {
        result.current.removeQuizila('Ogbe');
      });

      expect(result.current.quizilas).toHaveLength(1);
      expect(result.current.quizilas).not.toContain('Ogbe');
      expect(result.current.quizilas).toContain('Oxum');
    });

    it('does nothing when removing non-existent quizila', () => {
      const { result } = renderHook(() => useUserPreferences());

      act(() => {
        result.current.addQuizila('Ogbe');
      });

      act(() => {
        result.current.removeQuizila('NonExistent');
      });

      expect(result.current.quizilas).toHaveLength(1);
      expect(result.current.quizilas).toContain('Ogbe');
    });

    it('removes quizila and handles remaining items', () => {
      const { result } = renderHook(() => useUserPreferences());
      act(() => {
        result.current.addQuizila('Ogbe');
      });
      act(() => {
        result.current.addQuizila('Oxum');
      });
      act(() => {
        result.current.addQuizila('Xango');
      });
      act(() => {
        result.current.removeQuizila('Ogbe');
      });
      expect(result.current.quizilas).toHaveLength(2);
      expect(result.current.quizilas).not.toContain('Ogbe');
      expect(result.current.quizilas).toContain('Oxum');
      expect(result.current.quizilas).toContain('Xango');
    });
  });

  describe('setOrixaFavorito', () => {
    it('sets orixa favorito', () => {
      const { result } = renderHook(() => useUserPreferences());

      act(() => {
        result.current.setOrixaFavorito('Iemanjá');
      });

      expect(result.current.orixaFavorito).toBe('Iemanjá');
    });

    it('changes orixa favorito', () => {
      const { result } = renderHook(() => useUserPreferences());

      act(() => {
        result.current.setOrixaFavorito('Iemanjá');
      });

      act(() => {
        result.current.setOrixaFavorito('Oxalá');
      });

      expect(result.current.orixaFavorito).toBe('Oxalá');
    });

    it('can set orixa favorito to null', () => {
      const { result } = renderHook(() => useUserPreferences());

      act(() => {
        result.current.setOrixaFavorito('Iemanjá');
      });

      act(() => {
        result.current.setOrixaFavorito(null);
      });

      expect(result.current.orixaFavorito).toBeNull();
    });
  });

  describe('clearQuizilas', () => {
    it('clears all quizilas', () => {
      const { result } = renderHook(() => useUserPreferences());

      act(() => {
        result.current.addQuizila('Ogbe');
        result.current.addQuizila('Oxum');
        result.current.addQuizila('Xango');
      });

      expect(result.current.quizilas).toHaveLength(3);

      act(() => {
        result.current.clearQuizilas();
      });

      expect(result.current.quizilas).toEqual([]);
    });
  });

  describe('type safety', () => {
    it('accepts only valid theme values', () => {
      const { result } = renderHook(() => useUserPreferences());

      const themes: ('mystical' | 'minimal' | 'cosmic')[] = ['mystical', 'minimal', 'cosmic'];

      themes.forEach((theme) => {
        act(() => {
          result.current.setTema(theme);
        });
        expect(result.current.tema).toBe(theme);
      });
    });
  });
});
