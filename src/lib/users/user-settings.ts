// User settings - skipped linting and formatting

import type { UserPreferences } from '../user/preference-management';

export interface UserSettings {
  userId: string;
  preferences: UserPreferences;
  lastUpdated: string;
}

export const DEFAULT_SETTINGS: UserSettings = {
  userId: 'default',
  preferences: {
    theme: 'mystical',
    language: 'pt-BR',
    timezone: 'America/Sao_Paulo',
    notifications: {
      email: false,
      push: false,
      sms: false,
      frequency: 'never',
    },
    privacy: {
      profilePublic: false,
      showProgress: false,
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
      showAspects: true,
      showTransits: true,
      defaultHouseSystem: 'placidus',
      defaultZodiac: 'western',
    },
    meditation: {
      defaultDuration: 10,
      backgroundSounds: true,
      sessionReminders: false,
    },
    dataExport: {
      format: 'json',
      includeHistory: true,
      includePractices: true,
    },
  },
  lastUpdated: new Date().toISOString(),
};

export function getDefaultSettings(): UserSettings {
  return { ...DEFAULT_SETTINGS, lastUpdated: new Date().toISOString() };
}
