// fallow-ignore-file unused-file
// Privacy settings - skipped linting and formatting

export interface PrivacySettings {
  id: string;
  perfilVisivel: boolean;
  mostrarEmail: boolean;
  mostrarDataNascimento: boolean;
  mostrarLocalizacao: boolean;
  permitirRastreamento: boolean;
  permitirAnalytics: boolean;
  aceitarTermos: boolean;
  aceitarPrivacidade: boolean;
  comunicacoes: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  visibilidades: {
    historicoLeituras: boolean;
    perfilEspiritual: boolean;
    jornadaUsuario: boolean;
    metrics: boolean;
  };
  createdAt: number;
  updatedAt: number;
}

const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
  id: 'default',
  perfilVisivel: false,
  mostrarEmail: false,
  mostrarDataNascimento: false,
  mostrarLocalizacao: false,
  permitirRastreamento: true,
  permitirAnalytics: true,
  aceitarTermos: false,
  aceitarPrivacidade: false,
  comunicacoes: {
    email: true,
    push: true,
    sms: false,
  },
  visibilidades: {
    historicoLeituras: true,
    perfilEspiritual: false,
    jornadaUsuario: true,
    metrics: true,
  },
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

const PRIVACY_STORAGE_KEY = 'privacy_settings';

/**
 * Get privacy settings from storage.
 */
 export function getSettings(_id?: string): PrivacySettings {
   const stored = localStorage.getItem(PRIVACY_STORAGE_KEY);
   if (stored) {
     try {
       return JSON.parse(stored);
     } catch {
       return { ...DEFAULT_PRIVACY_SETTINGS };
     }
   }
   return { ...DEFAULT_PRIVACY_SETTINGS };
 }

/**
 * Update privacy settings.
 */
export function updateSettings(data: Partial<PrivacySettings>): PrivacySettings {
  const updated: PrivacySettings = {
    ...getSettings(),
    ...data,
    updatedAt: Date.now(),
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(PRIVACY_STORAGE_KEY, JSON.stringify(updated));
  }

  return updated;
}

/**
 * Reset privacy settings to defaults.
 */
export function resetSettings(): PrivacySettings {
  const reset: PrivacySettings = {
    ...DEFAULT_PRIVACY_SETTINGS,
    updatedAt: Date.now(),
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(PRIVACY_STORAGE_KEY, JSON.stringify(reset));
  }

  return reset;
}

/**
 * Update communication preferences.
 */
export function updateComunications(settings: Partial<PrivacySettings['comunicacoes']>): PrivacySettings {
  const current = getSettings();
  return updateSettings({
    comunicacoes: {
      ...current.comunicacoes,
      ...settings,
    },
  });
}

/**
 * Update visibility preferences.
 */
export function updateVisibilidades(settings: Partial<PrivacySettings['visibilidades']>): PrivacySettings {
  const current = getSettings();
  return updateSettings({
    visibilidades: {
      ...current.visibilidades,
      ...settings,
    },
  });
}

/**
 * Check if user has accepted privacy terms.
 */
export function hasAcceptedTerms(): boolean {
  const settings = getSettings();
  return settings.aceitarTermos && settings.aceitarPrivacidade;
}

/**
 * Accept all privacy terms and conditions.
 */
export function acceptAllTerms(): PrivacySettings {
  return updateSettings({
    aceitarTermos: true,
    aceitarPrivacidade: true,
  });
}

