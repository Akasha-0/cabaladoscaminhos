import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useUserPreferences } from '@/hooks/useUserPreferences';

describe('useUserPreferences', () => {
  let storageData: Record<string, string> = {};

  beforeEach(() => {
    vi.clearAllMocks();
    storageData = {};
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key: string) => storageData[key] || null);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key: string, value: string) => {
      storageData[key] = value;
    });
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation((key: string) => {
      delete storageData[key];
    });
  });

  it('returns preferences object', () => {
    const { result } = renderHook(() => useUserPreferences());
    
    expect(result.current.preferences).toBeDefined();
  });

  it('has isLoading state', () => {
    const { result } = renderHook(() => useUserPreferences());
    
    expect(typeof result.current.isLoading).toBe('boolean');
  });

  it('has setWidgetVisibility function', () => {
    const { result } = renderHook(() => useUserPreferences());
    
    expect(typeof result.current.setWidgetVisibility).toBe('function');
  });

  it('has setLanguage function', () => {
    const { result } = renderHook(() => useUserPreferences());
    
    expect(typeof result.current.setLanguage).toBe('function');
  });

  it('has setTheme function', () => {
    const { result } = renderHook(() => useUserPreferences());
    
    expect(typeof result.current.setTheme).toBe('function');
  });

  it('has setUserId function', () => {
    const { result } = renderHook(() => useUserPreferences());
    
    expect(typeof result.current.setUserId).toBe('function');
  });

  it('has setUserName function', () => {
    const { result } = renderHook(() => useUserPreferences());
    
    expect(typeof result.current.setUserName).toBe('function');
  });

  it('has setNotificationsEnabled function', () => {
    const { result } = renderHook(() => useUserPreferences());
    
    expect(typeof result.current.setNotificationsEnabled).toBe('function');
  });

  it('has setSoundEnabled function', () => {
    const { result } = renderHook(() => useUserPreferences());
    
    expect(typeof result.current.setSoundEnabled).toBe('function');
  });

  it('has setCompactMode function', () => {
    const { result } = renderHook(() => useUserPreferences());
    
    expect(typeof result.current.setCompactMode).toBe('function');
  });

  it('has resetPreferences function', () => {
    const { result } = renderHook(() => useUserPreferences());
    
    expect(typeof result.current.resetPreferences).toBe('function');
  });

  it('has default language as pt', () => {
    const { result } = renderHook(() => useUserPreferences());
    
    expect(result.current.preferences.language).toBe('pt');
  });

  it('has default theme as dark', () => {
    const { result } = renderHook(() => useUserPreferences());
    
    expect(result.current.preferences.theme).toBe('dark');
  });

  it('has default widgets with all enabled', () => {
    const { result } = renderHook(() => useUserPreferences());
    
    expect(result.current.preferences.widgets.ritualReminder).toBe(true);
    expect(result.current.preferences.widgets.spiritualProgress).toBe(true);
    expect(result.current.preferences.widgets.spiritualState).toBe(true);
    expect(result.current.preferences.widgets.dailyWisdom).toBe(true);
    expect(result.current.preferences.widgets.aiOracle).toBe(true);
    expect(result.current.preferences.widgets.meditationGuide).toBe(true);
    expect(result.current.preferences.widgets.journeyTracker).toBe(true);
  });

  it('has notifications enabled by default', () => {
    const { result } = renderHook(() => useUserPreferences());
    
    expect(result.current.preferences.notificationsEnabled).toBe(true);
  });

  it('has sound disabled by default', () => {
    const { result } = renderHook(() => useUserPreferences());
    
    expect(result.current.preferences.soundEnabled).toBe(false);
  });

  it('has compact mode disabled by default', () => {
    const { result } = renderHook(() => useUserPreferences());
    
    expect(result.current.preferences.compactMode).toBe(false);
  });

  it('loads preferences from localStorage', () => {
    const storedPrefs = {
      language: 'en',
      theme: 'light',
      widgets: { ritualReminder: false },
    };
    storageData['cabala_user_preferences'] = JSON.stringify(storedPrefs);

    const { result } = renderHook(() => useUserPreferences());
    
    expect(result.current.preferences.language).toBe('en');
    expect(result.current.preferences.theme).toBe('light');
    expect(result.current.preferences.widgets.ritualReminder).toBe(false);
    // Other widgets should stay as default
    expect(result.current.preferences.widgets.spiritualProgress).toBe(true);
  });

  it('handles corrupted localStorage gracefully', () => {
    storageData['cabala_user_preferences'] = 'invalid json {{{';

    const { result } = renderHook(() => useUserPreferences());
    
    // Should fall back to defaults
    expect(result.current.preferences.language).toBe('pt');
    expect(result.current.preferences.theme).toBe('dark');
  });

  it('updates widget visibility', async () => {
    const { result } = renderHook(() => useUserPreferences());
    
    act(() => {
      result.current.setWidgetVisibility('ritualReminder', false);
    });
    
    // The update should be saved to localStorage
    const saved = JSON.parse(storageData['cabala_user_preferences']);
    expect(saved.widgets.ritualReminder).toBe(false);
  });

  it('updates language', async () => {
    const { result } = renderHook(() => useUserPreferences());
    
    act(() => {
      result.current.setLanguage('en');
    });
    
    expect(result.current.preferences.language).toBe('en');
  });

  it('updates theme', async () => {
    const { result } = renderHook(() => useUserPreferences());
    
    act(() => {
      result.current.setTheme('light');
    });
    
    expect(result.current.preferences.theme).toBe('light');
  });

  it('updates userName', async () => {
    const { result } = renderHook(() => useUserPreferences());
    
    act(() => {
      result.current.setUserName('Novo Nome');
    });
    
    expect(result.current.preferences.userName).toBe('Novo Nome');
  });

  it('updates userId', async () => {
    const { result } = renderHook(() => useUserPreferences());
    
    act(() => {
      result.current.setUserId('user-123');
    });
    
    expect(result.current.preferences.userId).toBe('user-123');
  });

  it('updates notificationsEnabled', async () => {
    const { result } = renderHook(() => useUserPreferences());
    
    act(() => {
      result.current.setNotificationsEnabled(false);
    });
    
    expect(result.current.preferences.notificationsEnabled).toBe(false);
  });

  it('updates soundEnabled', async () => {
    const { result } = renderHook(() => useUserPreferences());
    
    act(() => {
      result.current.setSoundEnabled(true);
    });
    
    expect(result.current.preferences.soundEnabled).toBe(true);
  });

  it('updates compactMode', async () => {
    const { result } = renderHook(() => useUserPreferences());
    
    act(() => {
      result.current.setCompactMode(true);
    });
    
    expect(result.current.preferences.compactMode).toBe(true);
  });

  it('resets preferences to defaults', async () => {
    // Start with custom preferences
    storageData['cabala_user_preferences'] = JSON.stringify({
      language: 'en',
      theme: 'light',
      userName: 'Custom',
    });

    const { result } = renderHook(() => useUserPreferences());
    
    act(() => {
      result.current.resetPreferences();
    });
    
    // Should reset to defaults
    expect(result.current.preferences.language).toBe('pt');
    expect(result.current.preferences.theme).toBe('dark');
    expect(result.current.preferences.userName).toBe('Buscador');
  });
});
