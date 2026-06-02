// fallow-ignore-file unused-file
"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * User Preferences Hook
 * Manages widget visibility, language, and theme preferences
 * Persists to localStorage for cross-session consistency
 */

const STORAGE_KEY = "cabala_user_preferences";

export interface WidgetVisibility {
  ritualReminder: boolean;
  spiritualProgress: boolean;
  spiritualState: boolean;
  dailyWisdom: boolean;
  aiOracle: boolean;
  meditationGuide: boolean;
  journeyTracker: boolean;
  [key: string]: boolean;
}

export interface UserPreferences {
  widgets: WidgetVisibility;
  language: "pt" | "es" | "en";
  theme: "dark" | "light" | "auto";
  userId: string;
  userName: string;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  compactMode: boolean;
}

export interface UseUserPreferencesReturn {
  preferences: UserPreferences;
  isLoading: boolean;
  setWidgetVisibility: (widget: string, visible: boolean) => void;
  setLanguage: (language: UserPreferences["language"]) => void;
  setTheme: (theme: UserPreferences["theme"]) => void;
  setUserId: (userId: string) => void;
  setUserName: (userName: string) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setCompactMode: (compact: boolean) => void;
  resetPreferences: () => void;
}

const DEFAULT_WIDGETS: WidgetVisibility = {
  ritualReminder: true,
  spiritualProgress: true,
  spiritualState: true,
  dailyWisdom: true,
  aiOracle: true,
  meditationGuide: true,
  journeyTracker: true,
};

const DEFAULT_PREFERENCES: UserPreferences = {
  widgets: DEFAULT_WIDGETS,
  language: "pt",
  theme: "dark",
  userId: "default",
  userName: "Buscador",
  notificationsEnabled: true,
  soundEnabled: false,
  compactMode: false,
};

function loadPreferences(): UserPreferences {
  if (typeof window === "undefined") return DEFAULT_PREFERENCES;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_PREFERENCES;
    const parsed = JSON.parse(stored);
    return { ...DEFAULT_PREFERENCES, ...parsed, widgets: { ...DEFAULT_WIDGETS, ...parsed.widgets } };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

function savePreferences(preferences: UserPreferences): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch {
    // Storage unavailable
  }
}

export function useUserPreferences(): UseUserPreferencesReturn {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loaded = loadPreferences();
    setPreferences(loaded);
    setIsLoading(false);
  }, []);

  const persistPreferences = useCallback((updated: UserPreferences) => {
    savePreferences(updated);
    setPreferences(updated);
  }, []);

  const setWidgetVisibility = useCallback(
    (widget: string, visible: boolean) => {
      setPreferences((prev) => {
        const updated = {
          ...prev,
          widgets: {
            ...prev.widgets,
            [widget]: visible,
          },
        };
        persistPreferences(updated);
        return updated;
      });
    },
    [persistPreferences]
  );

  const setLanguage = useCallback(
    (language: UserPreferences["language"]) => {
      setPreferences((prev) => {
        const updated = { ...prev, language };
        persistPreferences(updated);
        return updated;
      });
    },
    [persistPreferences]
  );

  const setTheme = useCallback(
    (theme: UserPreferences["theme"]) => {
      setPreferences((prev) => {
        const updated = { ...prev, theme };
        persistPreferences(updated);
        return updated;
      });
    },
    [persistPreferences]
  );

  const setUserId = useCallback(
    (userId: string) => {
      setPreferences((prev) => {
        const updated = { ...prev, userId };
        persistPreferences(updated);
        return updated;
      });
    },
    [persistPreferences]
  );

  const setUserName = useCallback(
    (userName: string) => {
      setPreferences((prev) => {
        const updated = { ...prev, userName };
        persistPreferences(updated);
        return updated;
      });
    },
    [persistPreferences]
  );

  const setNotificationsEnabled = useCallback(
    (enabled: boolean) => {
      setPreferences((prev) => {
        const updated = { ...prev, notificationsEnabled: enabled };
        persistPreferences(updated);
        return updated;
      });
    },
    [persistPreferences]
  );

  const setSoundEnabled = useCallback(
    (enabled: boolean) => {
      setPreferences((prev) => {
        const updated = { ...prev, soundEnabled: enabled };
        persistPreferences(updated);
        return updated;
      });
    },
    [persistPreferences]
  );

  const setCompactMode = useCallback(
    (compact: boolean) => {
      setPreferences((prev) => {
        const updated = { ...prev, compactMode: compact };
        persistPreferences(updated);
        return updated;
      });
    },
    [persistPreferences]
  );

  const resetPreferences = useCallback(() => {
    persistPreferences(DEFAULT_PREFERENCES);
  }, [persistPreferences]);

  return {
    preferences,
    isLoading,
    setWidgetVisibility,
    setLanguage,
    setTheme,
    setUserId,
    setUserName,
    setNotificationsEnabled,
    setSoundEnabled,
    setCompactMode,
    resetPreferences,
  };
}
