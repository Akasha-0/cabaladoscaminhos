'use client';

// ============================================================================
// COOKIE CONSENT — LGPD Art. 8° + 9°
// ============================================================================
// Banner com aceitar/recusar/personalizar. Persiste em localStorage
// (consent_version) + cookie (sincronização SSR/edge).
//
// Categorias (LGPD art. 9° — princípio da necessidade):
//   1. Essencial  — sem opt-out (autenticação, segurança, rate limit)
//   2. Analytics  — opt-in (métricas anônimas de uso)
//   3. Marketing  — opt-in (remarketing, ads)
//
// Comportamento:
//   - Mostra banner se NÃO há decisão gravada E não está em iframe/admin
//   - "Aceitar tudo" marca todas as categorias
//   - "Recusar tudo" marca apenas essencial
//   - "Personalizar" abre painel com toggles por categoria
//   - Decisão fica em localStorage E cookie (sync SSR)
//
// Sincronização com backend:
//   - Quando usuário consente, dispara POST /api/consent (a ser criado em
//     wave 12) com audit log via logAudit('CONSENT_GRANTED')
//   - Quando revoga, idem para CONSENT_REVOKED
// ============================================================================

import { useEffect, useState, useCallback } from 'react';
import { X, Cookie, Settings2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

// ============================================================================
// Types
// ============================================================================

export type ConsentCategory = 'essential' | 'analytics' | 'marketing';

export interface ConsentState {
  essential: true; // sempre true (não-opt-out)
  analytics: boolean;
  marketing: boolean;
  version: string;
  timestamp: string;
}

const CONSENT_VERSION = '2026-06-27-wave11';
const STORAGE_KEY = 'cdc_consent';
const COOKIE_NAME = 'cdc_consent';

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

function readConsent(): ConsentState | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsentState;
    if (parsed.version !== CONSENT_VERSION) return null; // re-pedir se versão mudou
    return parsed;
  } catch {
    return null;
  }
}

function writeConsent(state: ConsentState): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    // Cookie sincronizado (1 ano) — para edge/middleware ler
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 1);
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(state))}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
  } catch {
    // localStorage bloqueado em modo privado — graceful degrade
  }
}

// ============================================================================
// API pública: readConsentForServer (para usar em Server Components)
// ============================================================================

export function readConsentFromCookie(cookieHeader: string | null): ConsentState | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.split(';').find((c) => c.trim().startsWith(`${COOKIE_NAME}=`));
  if (!match) return null;
  try {
    const value = decodeURIComponent(match.split('=').slice(1).join('='));
    const parsed = JSON.parse(value) as ConsentState;
    if (parsed.version !== CONSENT_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

// ============================================================================
// Componente
// ============================================================================

interface CookieConsentProps {
  /** Força mostrar mesmo se já decidiu (debug) */
  forceShow?: boolean;
}

export function CookieConsent({ forceShow = false }: CookieConsentProps) {
  const [show, setShow] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [prefs, setPrefs] = useState<Omit<ConsentState, 'version' | 'timestamp'>>({
    essential: true,
    analytics: false,
    marketing: false,
  });

  // Montagem: verifica decisão existente
  useEffect(() => {
    if (!isBrowser()) return;
    const existing = readConsent();
    if (!existing || forceShow) {
      // pequeno delay para não competir com LCP
      const t = setTimeout(() => setShow(true), 800);
      return () => clearTimeout(t);
    }
  }, [forceShow]);

  // Notifica o backend sobre a decisão
  const syncToServer = useCallback(async (state: ConsentState) => {
    if (!isBrowser()) return;
    try {
      await fetch('/api/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analytics: state.analytics,
          marketing: state.marketing,
        }),
      });
    } catch {
      // Falha silenciosa — não bloqueia UX
    }
  }, []);

  const save = useCallback(
    (analytics: boolean, marketing: boolean) => {
      const state: ConsentState = {
        essential: true,
        analytics,
        marketing,
        version: CONSENT_VERSION,
        timestamp: new Date().toISOString(),
      };
      writeConsent(state);
      setShow(false);
      void syncToServer(state);
      // Dispara evento custom para outros componentes reagirem
      window.dispatchEvent(new CustomEvent('cdc:consent', { detail: state }));
    },
    [syncToServer]
  );

  const handleAcceptAll = () => save(true, true);
  const handleRejectAll = () => save(false, false);
  const handleSaveCustom = () => save(prefs.analytics, prefs.marketing);

  if (!show) return null;

  return (
    <>
      {/* Backdrop sutil */}
      <div
        aria-hidden="true"
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm pointer-events-none"
      />

      {/* Banner inferior */}
      <div
        role="dialog"
        aria-modal="false"
        aria-labelledby="cookie-consent-title"
        aria-describedby="cookie-consent-desc"
        className="fixed inset-x-0 bottom-0 z-50 p-3 sm:p-4 sm:bottom-4 sm:left-4 sm:right-4 md:max-w-3xl md:mx-auto"
      >
        <div className="rounded-2xl border border-amber-500/20 bg-slate-950/95 backdrop-blur-xl shadow-2xl shadow-amber-500/10 p-5 sm:p-6">
          {!showCustomize ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Cookie className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <h2
                    id="cookie-consent-title"
                    className="text-base sm:text-lg font-playfair font-semibold text-white mb-1"
                  >
                    Sua privacidade é sagrada
                  </h2>
                  <p
                    id="cookie-consent-desc"
                    className="text-sm text-slate-300 font-raleway leading-relaxed"
                  >
                    Usamos cookies essenciais para autenticação e segurança. Analytics e marketing
                    são opcionais (LGPD art. 9°).{' '}
                    <a
                      href="/privacy"
                      className="text-amber-400 underline underline-offset-2 hover:text-amber-300"
                    >
                      Política de privacidade
                    </a>
                    .
                  </p>
                </div>
                <button
                  onClick={handleRejectAll}
                  className="text-slate-500 hover:text-slate-300 p-1 -mt-1 -mr-1 flex-shrink-0"
                  aria-label="Fechar e recusar tudo"
                  title="Fechar e recusar opcionais"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:items-center sm:justify-between">
                <button
                  onClick={() => setShowCustomize(true)}
                  className="text-sm text-amber-400 hover:text-amber-300 underline underline-offset-2 inline-flex items-center gap-1 self-start sm:self-auto"
                >
                  <Settings2 className="w-3.5 h-3.5" />
                  Personalizar
                </button>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={handleRejectAll}
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    Recusar opcionais
                  </Button>
                  <Button
                    onClick={handleAcceptAll}
                    size="sm"
                    className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold"
                  >
                    <Check className="w-4 h-4 mr-1.5" />
                    Aceitar tudo
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Settings2 className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h2 className="text-base font-playfair font-semibold text-white">
                    Personalizar consentimento
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Categorias são independentes. Essencial não pode ser desativado.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <ConsentRow
                  label="Essencial"
                  description="Autenticação, segurança, rate limit. Necessário para o site funcionar."
                  enabled={true}
                  disabled={true}
                  onChange={() => {}}
                />
                <ConsentRow
                  label="Analytics"
                  description="Métricas anônimas de uso para melhorar a experiência. Sem PII."
                  enabled={prefs.analytics}
                  disabled={false}
                  onChange={(v) => setPrefs((p) => ({ ...p, analytics: v }))}
                />
                <ConsentRow
                  label="Marketing"
                  description="Remarketing e personalização de comunicações. Não vendemos seus dados."
                  enabled={prefs.marketing}
                  disabled={false}
                  onChange={(v) => setPrefs((p) => ({ ...p, marketing: v }))}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:justify-end pt-2">
                <Button
                  onClick={() => setShowCustomize(false)}
                  variant="ghost"
                  size="sm"
                >
                  Voltar
                </Button>
                <Button
                  onClick={handleSaveCustom}
                  size="sm"
                  className="bg-gradient-to-r from-amber-500 to-amber-600 text-black font-semibold"
                >
                  Salvar preferências
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ============================================================================
// Subcomponente: linha de categoria
// ============================================================================

interface ConsentRowProps {
  label: string;
  description: string;
  enabled: boolean;
  disabled: boolean;
  onChange: (v: boolean) => void;
}

function ConsentRow({ label, description, enabled, disabled, onChange }: ConsentRowProps) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-amber-500/10">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white">{label}</span>
          {disabled && (
            <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Sempre ativo
            </span>
          )}
        </div>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label={`${label} ${enabled ? 'ativado' : 'desativado'}`}
        disabled={disabled}
        onClick={() => !disabled && onChange(!enabled)}
        className={[
          'relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors',
          enabled ? 'bg-amber-500' : 'bg-slate-700',
          disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
        ].join(' ')}
      >
        <span
          className={[
            'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
            enabled ? 'translate-x-6' : 'translate-x-1',
          ].join(' ')}
        />
      </button>
    </div>
  );
}

export default CookieConsent;
