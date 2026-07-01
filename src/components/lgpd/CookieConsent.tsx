'use client';

// ============================================================================
// COOKIE CONSENT v2 — Wave 37 / LGPD Compliance 7/8
// ============================================================================
// Substitui o W11 CookieConsent com suporte a:
//   - 4 categorias granulares (marketing, analytics, personalization,
//     thirdPartySharing) — alinhado com src/lib/lgpd/consent.ts
//   - Versionamento: detecta bump de versão e força re-consent
//   - Withdrawal fácil via modal de Settings
//   - Persist localStorage + cookie sync
//   - POST /api/lgpd/consent com audit log
//   - A11y: focus trap, ARIA labels, keyboard navigation
//
// LGPD Art. 8° §2° — consentimento deve ser livre, informado, inequívoco.
// Nunca inferimos consentimento por inércia (banner não fecha sem ação).
// ============================================================================

import { useEffect, useState, useCallback, useRef } from 'react';
import { X, Cookie, Settings2, Check, Shield } from 'lucide-react';

// ============================================================================
// Types — alinhados com src/lib/lgpd/consent.ts
// ============================================================================

export type ConsentCategory =
  | 'necessary'
  | 'analytics'
  | 'marketing'
  | 'personalization'
  | 'thirdPartySharing';

export interface GranularConsent {
  necessary: true; // sempre true (LGPD Art. 7°, V — execução de contrato)
  analytics: boolean;
  marketing: boolean;
  personalization: boolean;
  thirdPartySharing: boolean;
}

const STORAGE_KEY = 'lgpd_consent_v2';
const COOKIE_KEY = 'lgpd_consent_v2';
const CURRENT_VERSION = '1.0.0';

const DEFAULT_DENIED: GranularConsent = {
  necessary: true,
  analytics: false,
  marketing: false,
  personalization: false,
  thirdPartySharing: false,
};

const CATEGORY_DESCRIPTIONS: Record<ConsentCategory, {
  label: string;
  description: string;
  required?: boolean;
}> = {
  necessary: {
    label: 'Necessários',
    description: 'Autenticação, segurança, sessão. Não podem ser desativados.',
    required: true,
  },
  analytics: {
    label: 'Analytics',
    description: 'Métricas anônimas de uso para melhorar a experiência. (LGPD Art. 7°, IX — legítimo interesse)',
  },
  marketing: {
    label: 'Marketing',
    description: 'Newsletters semanais e comunicações sobre tradições que você segue.',
  },
  personalization: {
    label: 'Personalização',
    description: 'Recomendações de conteúdo baseadas no seu perfil espiritual.',
  },
  thirdPartySharing: {
    label: 'Compartilhamento com terceiros',
    description: 'Compartilhamos dados agregados com parceiros de pesquisa acadêmica.',
  },
};

// ============================================================================
// Persistência localStorage + cookie
// ============================================================================

function persistConsent(consent: GranularConsent, version: string): void {
  const payload = JSON.stringify({ consent, version, ts: Date.now() });
  try {
    localStorage.setItem(STORAGE_KEY, payload);
  } catch {
    // Safari private mode etc — silently degrade
  }
  // Cookie para SSR (1 ano)
  const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${COOKIE_KEY}=${encodeURIComponent(payload)}; expires=${expires}; path=/; SameSite=Lax`;
}

function loadConsent(): { consent: GranularConsent; version: string } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return { consent: parsed.consent ?? DEFAULT_DENIED, version: parsed.version ?? '0.0.0' };
  } catch {
    return null;
  }
}

// ============================================================================
// Submissão ao backend
// ============================================================================

async function submitConsent(consent: GranularConsent, version: string): Promise<boolean> {
  try {
    const res = await fetch('/api/lgpd/consent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        consent,
        version,
      }),
    });
    return res.ok;
  } catch {
    // Falha de rede = manter localStorage (LGPD: consentimento é local-first)
    return false;
  }
}

// ============================================================================
// Componente principal
// ============================================================================

export function CookieConsent() {
  const [show, setShow] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [consent, setConsent] = useState<GranularConsent>(DEFAULT_DENIED);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Detecta primeira visita ou versão bumped
  useEffect(() => {
    const stored = loadConsent();
    if (!stored || stored.version !== CURRENT_VERSION) {
      // Mostra após 1s para não atrapalhar LCP
      const timer = setTimeout(() => setShow(true), 1000);
      return () => clearTimeout(timer);
    }
    setConsent(stored.consent);
  }, []);

  // Focus trap quando modal aberto
  useEffect(() => {
    if (!showCustomize || !dialogRef.current) return;
    const dialog = dialogRef.current;
    const focusable = dialog.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    first?.focus();
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setShowCustomize(false);
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    }
    dialog.addEventListener('keydown', handleKey);
    return () => dialog.removeEventListener('keydown', handleKey);
  }, [showCustomize]);

  const handleAcceptAll = useCallback(async () => {
    const accepted: GranularConsent = {
      necessary: true,
      analytics: true,
      marketing: true,
      personalization: true,
      thirdPartySharing: true,
    };
    setConsent(accepted);
    persistConsent(accepted, CURRENT_VERSION);
    await submitConsent(accepted, CURRENT_VERSION);
    setShow(false);
    setShowCustomize(false);
  }, []);

  const handleRejectAll = useCallback(async () => {
    const rejected: GranularConsent = {
      ...DEFAULT_DENIED,
    };
    setConsent(rejected);
    persistConsent(rejected, CURRENT_VERSION);
    await submitConsent(rejected, CURRENT_VERSION);
    setShow(false);
    setShowCustomize(false);
  }, []);

  const handleSaveCustom = useCallback(async () => {
    persistConsent(consent, CURRENT_VERSION);
    await submitConsent(consent, CURRENT_VERSION);
    setShow(false);
    setShowCustomize(false);
  }, [consent]);

  if (!show) return null;

  return (
    <>
      {/* Banner principal */}
      {!showCustomize && (
        <div
          role="dialog"
          aria-labelledby="cookie-consent-title"
          aria-describedby="cookie-consent-desc"
          className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-2xl rounded-lg border border-purple-500/30 bg-slate-900/95 p-4 shadow-2xl backdrop-blur md:bottom-6 md:left-6 md:right-6"
        >
          <div className="flex items-start gap-3">
            <Cookie className="mt-0.5 h-6 w-6 flex-shrink-0 text-purple-400" aria-hidden="true" />
            <div className="flex-1">
              <h2
                id="cookie-consent-title"
                className="text-base font-semibold text-slate-100"
              >
                Sua privacidade importa
              </h2>
              <p id="cookie-consent-desc" className="mt-1 text-sm text-slate-300">
                Usamos cookies e tecnologias similares para autenticação, métricas
                anônimas e personalização. Você pode aceitar todas as finalidades,
                recusar tudo (mantendo apenas o necessário) ou personalizar.{' '}
                <a href="/privacy" className="underline hover:text-purple-300">
                  Saiba mais na Política de Privacidade
                </a>
                .
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={handleAcceptAll}
                  className="rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-500"
                >
                  Aceitar tudo
                </button>
                <button
                  onClick={handleRejectAll}
                  className="rounded-md border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-slate-700"
                >
                  Recusar tudo
                </button>
                <button
                  onClick={() => setShowCustomize(true)}
                  className="rounded-md border border-purple-500/40 bg-transparent px-4 py-2 text-sm font-medium text-purple-300 hover:bg-purple-500/10"
                >
                  <Settings2 className="mr-1 inline h-4 w-4" aria-hidden="true" />
                  Personalizar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de personalização */}
      {showCustomize && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur"
          role="presentation"
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="customize-title"
            className="w-full max-w-lg rounded-lg border border-purple-500/30 bg-slate-900 p-6 shadow-2xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-400" aria-hidden="true" />
                <h2 id="customize-title" className="text-lg font-semibold text-slate-100">
                  Configurações de privacidade
                </h2>
              </div>
              <button
                onClick={() => setShowCustomize(false)}
                aria-label="Fechar"
                className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mb-4 text-sm text-slate-300">
              Escolha quais finalidades de tratamento você aceita. Você pode
              alterar a qualquer momento em <a href="/settings/privacy" className="underline">Configurações</a>.
            </p>

            <div className="space-y-3">
              {(Object.keys(CATEGORY_DESCRIPTIONS) as ConsentCategory[]).map((cat) => {
                const desc = CATEGORY_DESCRIPTIONS[cat];
                const checked = cat === 'necessary' ? true : consent[cat];
                return (
                  <div
                    key={cat}
                    className="flex items-start gap-3 rounded-md border border-slate-700 bg-slate-800/50 p-3"
                  >
                    <input
                      type="checkbox"
                      id={`cat-${cat}`}
                      checked={checked}
                      disabled={desc.required}
                      onChange={(e) => {
                        if (desc.required) return;
                        setConsent((prev) => ({ ...prev, [cat]: e.target.checked }));
                      }}
                      className="mt-1 h-4 w-4 rounded border-slate-500 bg-slate-700 text-purple-600 focus:ring-purple-500 disabled:opacity-50"
                    />
                    <label htmlFor={`cat-${cat}`} className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-100">
                        {desc.label}
                        {desc.required && (
                          <span className="rounded bg-slate-700 px-1.5 py-0.5 text-xs text-slate-300">
                            obrigatório
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 text-xs text-slate-400">
                        {desc.description}
                      </div>
                    </label>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowCustomize(false)}
                className="rounded-md border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-slate-700"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveCustom}
                className="rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-500"
              >
                <Check className="mr-1 inline h-4 w-4" aria-hidden="true" />
                Salvar preferências
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ============================================================================
// Hook para componentes que precisam ler consent
// ============================================================================

export function useConsent(): GranularConsent {
  const [consent, setConsentState] = useState<GranularConsent>(DEFAULT_DENIED);
  useEffect(() => {
    const stored = loadConsent();
    if (stored) setConsentState(stored.consent);
  }, []);
  return consent;
}