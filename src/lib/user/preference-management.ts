// ============================================================
// PREFERENCE MANAGEMENT - CABALA DOS CAMINHOS
// ============================================================
// Handles user preference storage and retrieval
// Supports both client-side (localStorage) and server-side persistence
// ============================================================

export interface UserPreferences {
  theme: 'mystical' | 'minimal' | 'cosmic';
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    frequency: 'daily' | 'weekly' | 'monthly' | 'never';
  };
  privacy: {
    profilePublic: boolean;
    showProgress: boolean;
    sharePractices: boolean;
  };
  display: {
    reducedMotion: boolean;
    highContrast: boolean;
    fontSize: 'small' | 'medium' | 'large';
    compactMode: boolean;
  };
  dashboard: {
    defaultLayout: string;
    widgetOrder: string[];
    refreshInterval: number;
  };
  astrologia: {
    defaultHouseSystem: 'placidus' | 'koch' | 'whole-sign' | 'equal';
    defaultZodiac: 'western' | 'vedic' | 'sidereal';
    showAspects: boolean;
    showTransits: boolean;
  };
  meditation: {
    defaultDuration: number;
    backgroundSounds: boolean;
    sessionReminders: boolean;
  };
  dataExport: {
    format: 'json' | 'csv' | 'pdf';
    includeHistory: boolean;
    includePractices: boolean;
  };
  lastUpdated?: number;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'mystical',
  language: 'pt-BR',
  timezone: 'America/Sao_Paulo',
  notifications: {
    email: true,
    push: true,
    sms: false,
    frequency: 'weekly',
  },
  privacy: {
    profilePublic: false,
    showProgress: true,
    sharePractices: false,
  },
  display: {
    reducedMotion: false,
    highContrast: false,
    fontSize: 'medium',
    compactMode: false,
  },
  dashboard: {
    defaultLayout: 'default',
    widgetOrder: [],
    refreshInterval: 300000,
  },
  astrologia: {
    defaultHouseSystem: 'placidus',
    defaultZodiac: 'western',
    showAspects: true,
    showTransits: true,
  },
  meditation: {
    defaultDuration: 600,
    backgroundSounds: true,
    sessionReminders: true,
  },
  dataExport: {
    format: 'json',
    includeHistory: true,
    includePractices: true,
  },
};

// ============================================================
// STORAGE KEYS
// ============================================================

const PREFERENCE_STORAGE_KEY = 'user_preferences';
const SERVER_PREFERENCE_PREFIX = 'pref:';

/**
 * Get storage key for server-side preferences
 */

// ============================================================
// CLIENT-SIDE PREFERENCES
// ============================================================

/**
 * Load preferences from client-side storage (localStorage)
 */
export function loadClientPreferences(): UserPreferences {
  if (typeof window === 'undefined') {
    return { ...DEFAULT_PREFERENCES };
  }

  try {
    const stored = localStorage.getItem(PREFERENCE_STORAGE_KEY);
    if (!stored) {
      return { ...DEFAULT_PREFERENCES };
    }
    const parsed = JSON.parse(stored) as Partial<UserPreferences>;
    return { ...DEFAULT_PREFERENCES, ...parsed, lastUpdated: Date.now() };
  } catch {
    return { ...DEFAULT_PREFERENCES };
  }
}

/**
 * Save preferences to client-side storage (localStorage)
 */
export function saveClientPreferences(preferences: Partial<UserPreferences>): UserPreferences {
  if (typeof window === 'undefined') {
    return { ...DEFAULT_PREFERENCES, ...preferences };
  }

  try {
    const current = loadClientPreferences();
    const updated = { ...current, ...preferences, lastUpdated: Date.now() };
    localStorage.setItem(PREFERENCE_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return { ...DEFAULT_PREFERENCES, ...preferences };
  }
}

// ============================================================
// PREFERENCE MANAGEMENT
// ============================================================

export interface PreferenceManager {
  get: () => UserPreferences;
  set: (preferences: Partial<UserPreferences>) => UserPreferences;
  reset: () => UserPreferences;
  merge: (updates: Partial<UserPreferences>) => UserPreferences;
  subscribe: (callback: (prefs: UserPreferences) => void) => () => void;
}

/**
 * Create a preference manager instance
 * Manages user preferences with client-side storage
 */
export function managePreferences(): PreferenceManager {
  const subscribers = new Set<(prefs: UserPreferences) => void>();

  const notify = (prefs: UserPreferences) => {
    subscribers.forEach((cb) => cb(prefs));
  };

  return {
    /**
     * Get current preferences
     */
    get(): UserPreferences {
      return loadClientPreferences();
    },

    /**
     * Set complete preferences (replaces all)
     */
    set(preferences: Partial<UserPreferences>): UserPreferences {
      const updated = saveClientPreferences(preferences);
      notify(updated);
      return updated;
    },

    /**
     * Reset preferences to defaults
     */
    reset(): UserPreferences {
      const defaults = saveClientPreferences(DEFAULT_PREFERENCES);
      notify(defaults);
      return defaults;
    },

    /**
     * Merge partial updates into existing preferences
     */
    merge(updates: Partial<UserPreferences>): UserPreferences {
      const current = loadClientPreferences();
      const updated = saveClientPreferences({ ...current, ...updates });
      notify(updated);
      return updated;
    },

    /**
     * Subscribe to preference changes
     * Returns unsubscribe function
     */
    subscribe(callback: (prefs: UserPreferences) => void): () => void {
      subscribers.add(callback);
      return () => subscribers.delete(callback);
    },
  };
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/**
 * Get a specific preference value
 */
export function getPreference<K extends keyof UserPreferences>(
  key: K
): UserPreferences[K] {
  const prefs = loadClientPreferences();
  return prefs[key];
}

/**
 * Update a specific preference value
 */
export function setPreference<K extends keyof UserPreferences>(
  key: K,
  value: UserPreferences[K]
): UserPreferences {
  return saveClientPreferences({ [key]: value });
}

/**
 * Check if preferences have been customized
 */
export function hasCustomPreferences(): boolean {
  const prefs = loadClientPreferences();
  const defaults = DEFAULT_PREFERENCES;

  return (
    prefs.theme !== defaults.theme ||
    prefs.language !== defaults.language ||
    prefs.notifications.email !== defaults.notifications.email ||
    prefs.notifications.push !== defaults.notifications.push ||
    prefs.privacy.profilePublic !== defaults.privacy.profilePublic ||
    prefs.display.reducedMotion !== defaults.display.reducedMotion ||
    prefs.display.fontSize !== defaults.display.fontSize
  );
}

/**
 * Export preferences as JSON string
 */
export function exportPreferences(): string {
  const prefs = loadClientPreferences();
  return JSON.stringify(prefs, null, 2);
}

/**
 * Import preferences from JSON string
 */
export function importPreferences(json: string): UserPreferences | null {
  try {
    const parsed = JSON.parse(json) as Partial<UserPreferences>;
    return saveClientPreferences(parsed);
  } catch {
    return null;
  }
}

// ============================================================
// DEFAULT EXPORT
// ============================================================

export default managePreferences;
