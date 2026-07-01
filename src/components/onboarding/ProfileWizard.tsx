'use client';

// ============================================================================
// ProfileWizard — Wave 35 Beta Onboarding
// ============================================================================
// Form wizard completo para o perfil público + LGPD refresh + email prefs.
//
// Sections:
//   1. Avatar (upload URL — placeholder para Cloudinary)
//   2. Display name + bio (max 280)
//   3. Preferred tradição (visual selector com 8 opções)
//   4. Practice preferences (multi-select 8 práticas)
//   5. Email notification preferences (5 toggles)
//   6. LGPD consent refresh (checkbox obrigatório para salvar)
//
// Validação: client-side via estado local + server-side via Zod schema em
// /api/onboarding/state (PUT). Erros de campo vêm do response.
//
// Eventos registrados:
//   - PROFILE_FIELD_EDITED (a cada blur de campo)
//   - PROFILE_AVATAR_UPLOADED (paste de URL)
//   - PROFILE_LGPD_REFRESHED (checkbox LGPD marcado)
//   - PROFILE_NOTIFICATION_PREFS_SAVED (toggle)
//   - PROFILE_COMPLETED (submit bem-sucedido)
// ============================================================================

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Image as ImageIcon,
  Sparkles,
  Shield,
  Bell,
  Save,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  PRACTICE_PREFERENCES,
  EMAIL_PREF_CATEGORIES,
} from '@/lib/onboarding/state-machine';

// ============================================================================
// Types
// ============================================================================

export interface ProfileWizardProps {
  defaultDisplayName?: string;
  defaultBio?: string;
  defaultTradition?: string;
  defaultPractices?: string[];
  defaultEmailPrefs: {
    newContent: boolean;
    community: boolean;
    mentorship: boolean;
    marketing: boolean;
    npsSurveys: boolean;
  };
  defaultAvatarUrl?: string | null;
  defaultLgpdRefreshedAt?: string | null;
  userEmail: string;
  nextRouteOnComplete?: string;
}

const TRADITIONS = [
  { value: 'cabala', label: 'Cabala', symbol: '🕎' },
  { value: 'ifa', label: 'Ifá / Orixás', symbol: '🌍' },
  { value: 'astrologia', label: 'Astrologia', symbol: '♈' },
  { value: 'tantra', label: 'Tantra', symbol: '🧘' },
  { value: 'xamanismo', label: 'Xamanismo', symbol: '🌬️' },
  { value: 'cristianismo-mistico', label: 'Cristianismo Místico', symbol: '✝️' },
  { value: 'umbanda', label: 'Umbanda', symbol: '🪶' },
  { value: 'budismo', label: 'Budismo', symbol: '☸️' },
] as const;

// ============================================================================
// Component
// ============================================================================

export function ProfileWizard({
  defaultDisplayName = '',
  defaultBio = '',
  defaultTradition = '',
  defaultPractices = [],
  defaultEmailPrefs,
  defaultAvatarUrl = null,
  defaultLgpdRefreshedAt = null,
  userEmail,
  nextRouteOnComplete = '/onboarding/first-actions',
}: ProfileWizardProps) {
  const router = useRouter();

  // --- Form state ----------------------------------------------------
  const [displayName, setDisplayName] = useState(defaultDisplayName);
  const [bio, setBio] = useState(defaultBio);
  const [avatarUrl, setAvatarUrl] = useState(defaultAvatarUrl ?? '');
  const [tradition, setTradition] = useState(defaultTradition);
  const [practices, setPractices] = useState<string[]>(defaultPractices);
  const [emailPrefs, setEmailPrefs] = useState(defaultEmailPrefs);
  const [lgpdConsent, setLgpdConsent] = useState(Boolean(defaultLgpdRefreshedAt));

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Validation ----------------------------------------------------
  const canSave = useMemo(() => {
    if (!displayName.trim() || displayName.trim().length < 2) return false;
    if (displayName.trim().length > 60) return false;
    if (bio.length > 280) return false;
    if (practices.length > 8) return false;
    if (!lgpdConsent) return false;
    return true;
  }, [displayName, bio, practices, lgpdConsent]);

  // --- Persist + log -------------------------------------------------
  const logEvent = useCallback(async (kind: string, metadata?: Record<string, unknown>) => {
    try {
      await fetch('/api/onboarding/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind, metadata: metadata ?? {} }),
      });
    } catch {
      // best-effort
    }
  }, []);

  const togglePractice = useCallback(
    (value: string) => {
      setPractices((prev) => {
        const next = prev.includes(value) ? prev.filter((p) => p !== value) : [...prev, value];
        void logEvent('PROFILE_FIELD_EDITED', { field: 'practicePreferences', count: next.length });
        return next;
      });
    },
    [logEvent]
  );

  const handleSubmit = async () => {
    if (!canSave) {
      setError('Preencha nome de exibição (2-60 chars) e confirme o consentimento LGPD.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/onboarding/state', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: displayName.trim(),
          bioPublic: bio.trim() || null,
          preferredTradition: tradition || null,
          practicePreferences: practices,
          avatarUrl: avatarUrl.trim() || null,
          emailPrefsNewContent: emailPrefs.newContent,
          emailPrefsCommunity: emailPrefs.community,
          emailPrefsMentorship: emailPrefs.mentorship,
          emailPrefsMarketing: emailPrefs.marketing,
          emailPrefsNpsSurveys: emailPrefs.npsSurveys,
          lgpdConsented: lgpdConsent,
          transitionEvent: 'profile_completed',
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.detail ? JSON.stringify(json.detail) : 'Falha ao salvar.');
        setSubmitting(false);
        return;
      }
      await logEvent('PROFILE_COMPLETED', {
        displayName: displayName.trim(),
        hasAvatar: Boolean(avatarUrl.trim()),
        tradition,
        practiceCount: practices.length,
        lgpdRefreshed: lgpdConsent,
        emailPrefsCount: Object.values(emailPrefs).filter(Boolean).length,
      });
      if (lgpdConsent) {
        await logEvent('PROFILE_LGPD_REFRESHED');
      }
      await logEvent('TRADITION_SELECTED', { tradition });
      router.push(nextRouteOnComplete);
    } catch {
      setError('Erro de conexão. Tente novamente.');
      setSubmitting(false);
    }
  };

  // --- Render --------------------------------------------------------
  return (
    <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8">
      <header className="text-center">
        <div className="text-4xl mb-2" aria-hidden="true">
          ✦
        </div>
        <h1 className="font-cinzel text-2xl sm:text-3xl font-bold text-amber-200">
          Configure seu perfil
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Como você quer aparecer na Cabala dos Caminhos.
        </p>
      </header>

      {/* ====== Section 1 — Avatar ====== */}
      <section className="card-spiritual p-5 sm:p-6 space-y-4">
        <h2 className="font-cinzel text-lg text-amber-200 flex items-center gap-2">
          <ImageIcon className="w-4 h-4" aria-hidden="true" />
          Foto de perfil
        </h2>
        <div className="flex items-center gap-4">
          <div
            className="w-20 h-20 rounded-full bg-slate-800/60 border-2 border-amber-500/40 flex items-center justify-center overflow-hidden flex-shrink-0"
            aria-label="Preview do avatar"
          >
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt=""
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <span className="text-2xl font-cinzel text-amber-300">
                {(displayName[0] ?? '✦').toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1">
            <label htmlFor="avatarUrl" className="block text-tiny text-slate-400 mb-1">
              URL da imagem (opcional)
            </label>
            <input
              id="avatarUrl"
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              onBlur={() => {
                if (avatarUrl) void logEvent('PROFILE_AVATAR_UPLOADED');
              }}
              placeholder="https://..."
              className="w-full px-3 py-2.5 min-h-[44px] rounded-lg bg-slate-900/60 border border-slate-700 text-slate-100 text-sm focus:border-amber-400 focus:outline-none"
            />
            <p className="text-tiny text-slate-500 mt-1">
              Cole uma URL (Cloudinary, Imgur) ou deixe em branco para usar suas iniciais.
            </p>
          </div>
        </div>
      </section>

      {/* ====== Section 2 — Identidade ====== */}
      <section className="card-spiritual p-5 sm:p-6 space-y-4">
        <h2 className="font-cinzel text-lg text-amber-200 flex items-center gap-2">
          <Sparkles className="w-4 h-4" aria-hidden="true" />
          Identidade pública
        </h2>

        <div>
          <label htmlFor="displayName" className="block text-sm font-medium text-slate-200 mb-1">
            Nome de exibição <span className="text-amber-400" aria-hidden="true">*</span>
          </label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={60}
            placeholder="Como quer ser chamado(a) na comunidade"
            className="w-full px-3 py-2.5 min-h-[44px] rounded-lg bg-slate-900/60 border border-slate-700 text-slate-100 text-base focus:border-amber-400 focus:outline-none"
            required
          />
          <p className="text-tiny text-slate-500 mt-1">
            {displayName.length}/60 caracteres · separamos isso do seu nome de certidão
          </p>
        </div>

        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-slate-200 mb-1">
            Bio (opcional)
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={280}
            placeholder="Compartilhe algo sobre sua jornada, intenção ou chamada..."
            rows={3}
            className="w-full px-3 py-2.5 rounded-lg bg-slate-900/60 border border-slate-700 text-slate-100 text-sm focus:border-amber-400 focus:outline-none resize-none"
          />
          <p className="text-tiny text-slate-500 mt-1">
            {bio.length}/280 caracteres
          </p>
        </div>
      </section>

      {/* ====== Section 3 — Tradição preferida ====== */}
      <section className="card-spiritual p-5 sm:p-6 space-y-4">
        <h2 className="font-cinzel text-lg text-amber-200 flex items-center gap-2">
          <Sparkles className="w-4 h-4" aria-hidden="true" />
          Tradição preferida
        </h2>
        <p className="text-sm text-slate-400">
          Vamos personalizar seu feed e recomendações.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {TRADITIONS.map((t) => {
            const selected = tradition === t.value;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => {
                  setTradition(t.value);
                  void logEvent('PROFILE_FIELD_EDITED', { field: 'preferredTradition', value: t.value });
                }}
                aria-pressed={selected}
                className={cn(
                  'p-3 rounded-lg border text-center transition-all min-h-[60px]',
                  selected
                    ? 'border-amber-400 bg-amber-500/10 text-amber-200'
                    : 'border-slate-700 bg-slate-900/40 text-slate-300 hover:border-amber-400/50'
                )}
              >
                <div className="text-xl" aria-hidden="true">
                  {t.symbol}
                </div>
                <div className="text-xs mt-1 font-serif">{t.label}</div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ====== Section 4 — Práticas preferidas ====== */}
      <section className="card-spiritual p-5 sm:p-6 space-y-4">
        <h2 className="font-cinzel text-lg text-amber-200 flex items-center gap-2">
          Práticas que te interessam
        </h2>
        <p className="text-sm text-slate-400">Escolha todas que combinam com você.</p>
        <div className="flex flex-wrap gap-2">
          {PRACTICE_PREFERENCES.map((p) => {
            const selected = practices.includes(p.value);
            return (
              <button
                key={p.value}
                type="button"
                onClick={() => togglePractice(p.value)}
                aria-pressed={selected}
                className={cn(
                  'px-4 py-2 min-h-[44px] rounded-full border text-sm font-serif transition-all',
                  selected
                    ? 'border-amber-400 bg-amber-500/10 text-amber-200'
                    : 'border-slate-700 bg-slate-900/40 text-slate-300 hover:border-amber-400/50'
                )}
              >
                {selected && <Check className="w-3 h-3 inline mr-1" aria-hidden="true" />}
                {p.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* ====== Section 5 — Email notification prefs ====== */}
      <section className="card-spiritual p-5 sm:p-6 space-y-4">
        <h2 className="font-cinzel text-lg text-amber-200 flex items-center gap-2">
          <Bell className="w-4 h-4" aria-hidden="true" />
          Notificações por email
        </h2>
        <p className="text-sm text-slate-400">
          Você pode mudar isso a qualquer momento em Configurações.
        </p>
        <div className="space-y-3">
          {EMAIL_PREF_CATEGORIES.map((cat) => {
            const key = cat.key as keyof typeof emailPrefs;
            const checked = emailPrefs[key];
            return (
              <label
                key={cat.key}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-800/30 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={async (e) => {
                    setEmailPrefs((prev) => ({ ...prev, [key]: e.target.checked }));
                    await logEvent('PROFILE_NOTIFICATION_PREFS_SAVED', {
                      category: cat.key,
                      enabled: e.target.checked,
                    });
                  }}
                  className="mt-0.5 w-5 h-5 accent-amber-400"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-slate-100">{cat.label}</div>
                  <p className="text-tiny text-slate-400">{cat.description}</p>
                </div>
              </label>
            );
          })}
        </div>
      </section>

      {/* ====== Section 6 — LGPD consent refresh ====== */}
      <section className="card-spiritual p-5 sm:p-6 space-y-4 border-amber-500/40">
        <h2 className="font-cinzel text-lg text-amber-200 flex items-center gap-2">
          <Shield className="w-4 h-4" aria-hidden="true" />
          Consentimento LGPD
        </h2>
        <div className="text-sm text-slate-300 leading-relaxed space-y-2">
          <p>
            Para continuar, confirme que você leu e concorda com nossa{' '}
            <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline text-amber-300">
              Política de Privacidade
            </a>{' '}
            e nossos{' '}
            <a href="/terms" target="_blank" rel="noopener noreferrer" className="underline text-amber-300">
              Termos de Uso
            </a>
            .
          </p>
          <p className="text-tiny text-slate-400">
            Conta: <span className="font-mono text-slate-200">{userEmail}</span>
          </p>
          <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg bg-slate-900/60 border border-slate-700">
            <input
              type="checkbox"
              checked={lgpdConsent}
              onChange={async (e) => {
                setLgpdConsent(e.target.checked);
                if (e.target.checked) {
                  await logEvent('PROFILE_LGPD_REFRESHED');
                }
              }}
              className="mt-0.5 w-5 h-5 accent-amber-400"
              aria-required="true"
              required
            />
            <span className="text-sm text-slate-100">
              Confirmo que li e aceito os termos de uso e a política de privacidade
              (LGPD art. 7º e 9º).
              <span className="text-amber-400 ml-1" aria-hidden="true">*</span>
            </span>
          </label>
        </div>
      </section>

      {error && (
        <div role="alert" className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* ====== Footer / actions ====== */}
      <div className="flex items-center justify-between gap-3 pb-8">
        <button
          type="button"
          onClick={() => router.push('/onboarding/welcome')}
          disabled={submitting}
          className="inline-flex items-center gap-1 px-4 py-3 rounded-lg min-h-[44px] text-slate-300 hover:bg-slate-800/60"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Voltar
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSave || submitting}
          className={cn(
            'inline-flex items-center gap-2 px-6 py-3 rounded-lg min-h-[44px] font-bold',
            canSave
              ? 'bg-gradient-to-r from-amber-600 to-amber-400 text-slate-950 hover:brightness-110'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          )}
        >
          {submitting ? (
            'Salvando...'
          ) : (
            <>
              <Save className="w-4 h-4" aria-hidden="true" />
              Continuar
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}