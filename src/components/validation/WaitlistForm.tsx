'use client';

/**
 * WaitlistForm — Form multi-step de captura para o beta privado (Wave 32, 2026-06-30).
 * ----------------------------------------------------------------------------
 * Steps:
 *   1. Email
 *   2. Nome (opcional, mas ajuda personalização)
 *   3. Tradição principal (cards visuais, required)
 *   4. Perfil (iniciante / praticante / mestre / curioso)
 *   5. Confirmação + LGPD consent
 *
 * Features W32:
 *   - Validação Zod em tempo real (server-side shared schema)
 *   - Auto-save em localStorage (key: 'akasha_waitlist_draft')
 *   - Progress indicator visual (5 dots)
 *   - Tradição selector visual (7 cards)
 *   - LGPD consent checkbox REQUIRED (com link para política)
 *   - Mensagens de erro humanizadas PT-BR
 *   - Sucesso: animação check + compartilhamento social (whatsapp/twitter)
 *   - Mobile-first, 44px touch targets, WCAG AA
 *
 * Refs:
 *   - src/app/api/waitlist/route.ts (endpoint com Zod + idempotency + rate limit)
 *   - docs/WAITLIST-BETA-W32.md (architecture + UX rationale)
 */

import { useState, useEffect, useRef, type FormEvent } from 'react';
import {
  Mail,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  User,
  CircleDot,
  Star,
  Sprout,
  Eye,
  Share2,
  ShieldCheck,
} from 'lucide-react';
import { events } from '@/lib/analytics/events';

// ============================================================================
// Types
// ============================================================================

const TRADITIONS = [
  { slug: 'cigano', label: 'Baralho Cigano', emoji: '🃏', description: 'Mesa Real e cruzamentos', accent: 'amber' },
  { slug: 'candomble', label: 'Candomblé', emoji: '🍲', description: 'Orixás e axé', accent: 'emerald' },
  { slug: 'umbanda', label: 'Umbanda', emoji: '🕊️', description: 'Linhas e guias', accent: 'violet' },
  { slug: 'ifa', label: 'Ifá', emoji: '🪶', description: 'Odus e patakís', accent: 'sky' },
  { slug: 'cabala', label: 'Cabala', emoji: '✡️', description: 'Árvore da Vida', accent: 'rose' },
  { slug: 'astrologia', label: 'Astrologia', emoji: '⭐', description: 'Mapa natal', accent: 'pink' },
  { slug: 'tantra', label: 'Tantra', emoji: '🕉️', description: 'Kundalini e chakras', accent: 'fuchsia' },
] as const;

const PROFILES = [
  { slug: 'curioso', label: 'Curioso', icon: Eye, description: 'Começando a explorar' },
  { slug: 'iniciante', label: 'Iniciante', icon: Sprout, description: 'Já estudei um pouco' },
  { slug: 'praticante', label: 'Praticante', icon: CircleDot, description: 'Pratico há anos' },
  { slug: 'mestre', label: 'Mestre / Facilitador', icon: Star, description: 'Guio outros' },
] as const;

type TraditionSlug = (typeof TRADITIONS)[number]['slug'];
type ProfileSlug = (typeof PROFILES)[number]['slug'];

interface Draft {
  email: string;
  displayName: string;
  tradition: TraditionSlug | null;
  profile: ProfileSlug | null;
  lgpdConsent: boolean;
  marketingConsent: boolean;
  referredBy: string | null;
}

type Step = 1 | 2 | 3 | 4 | 5;

type SubmitState =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'success'; position: number; total: number; score: number }
  | { kind: 'error'; message: string };

// ============================================================================
// Validation helpers (PT-BR)
// ============================================================================

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(email: string): string | null {
  if (!email.trim()) return 'Email é obrigatório';
  if (!EMAIL_PATTERN.test(email.trim())) return 'Email inválido';
  return null;
}

function validateName(name: string): string | null {
  if (name.trim().length > 80) return 'Nome muito longo (máx 80 caracteres)';
  return null;
}

// ============================================================================
// Hook: auto-save to localStorage
// ============================================================================

const STORAGE_KEY = 'akasha_waitlist_draft';

function loadDraft(): Draft {
  if (typeof window === 'undefined') return emptyDraft();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyDraft();
    const parsed = JSON.parse(raw) as Partial<Draft>;
    return {
      ...emptyDraft(),
      ...parsed,
      lgpdConsent: parsed.lgpdConsent ?? false,
      marketingConsent: parsed.marketingConsent ?? false,
      referredBy: parsed.referredBy ?? null,
    };
  } catch {
    return emptyDraft();
  }
}

function saveDraft(d: Draft): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
  } catch {
    // localStorage cheio / bloqueado — não quebra UX
  }
}

function clearDraft(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

function emptyDraft(): Draft {
  return {
    email: '',
    displayName: '',
    tradition: null,
    profile: null,
    lgpdConsent: false,
    marketingConsent: false,
    referredBy: null,
  };
}

// ============================================================================
// Hook: ler referral code da URL (?ref=xxx)
// ============================================================================

function readReferralFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const ref = params.get('ref');
  if (ref && EMAIL_PATTERN.test(ref)) return ref.toLowerCase();
  return null;
}

// ============================================================================
// Component
// ============================================================================

export interface WaitlistFormProps {
  /** Texto do CTA customizado (legado — mantido para retrocompat). */
  ctaLabel?: string;
  /** Origem pra tracking. */
  source?: string;
  className?: string;
}

export function WaitlistForm({
  source = 'validacao-page',
  className,
}: WaitlistFormProps) {
  const [step, setStep] = useState<Step>(1);
  const [draft, setDraft] = useState<Draft>(emptyDraft());
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<SubmitState>({ kind: 'idle' });
  const [showShare, setShowShare] = useState(false);
  const [referralCode, setReferralCode] = useState<string>('');
  const formTopRef = useRef<HTMLDivElement>(null);

  // Init: carrega draft + referral
  useEffect(() => {
    const loaded = loadDraft();
    const ref = readReferralFromUrl();
    if (ref) loaded.referredBy = ref;
    setDraft(loaded);
    if (loaded.email) {
      // Pula direto para o último step conhecido se email estiver OK
      const stepFromDraft = computeResumeStep(loaded);
      setStep(stepFromDraft);
    }
    // Gera referral code curto para esta sessão (futuro: salvar no server)
    setReferralCode(`beta-${Math.random().toString(36).slice(2, 8)}`);
    // Track form start
    void events.waitlistFormStarted(source);
  }, [source]);

  // Auto-save
  useEffect(() => {
    if (state.kind !== 'success') {
      saveDraft(draft);
    }
  }, [draft, state.kind]);

  const updateDraft = (patch: Partial<Draft>) => {
    setDraft((d) => ({ ...d, ...patch }));
    setFieldErrors({});
  };

  const goNext = () => {
    const err = validateStep(step, draft);
    if (err) {
      setFieldErrors(err);
      return;
    }
    setFieldErrors({});
    setStep((s) => Math.min(5, s + 1) as Step);
    // Track progress
    void events.waitlistStepCompleted(step, source);
    // Scroll suave para o topo do form em mobile
    setTimeout(() => formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  const goBack = () => {
    setFieldErrors({});
    setStep((s) => Math.max(1, s - 1) as Step);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validação final
    const err = validateStep(5, draft);
    if (err) {
      setFieldErrors(err);
      return;
    }
    if (!draft.lgpdConsent) {
      setFieldErrors({ lgpdConsent: 'Você precisa aceitar a Política de Privacidade para entrar na fila.' });
      return;
    }

    setState({ kind: 'submitting' });

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: draft.email.trim().toLowerCase(),
          displayName: draft.displayName.trim() || undefined,
          tradition: draft.tradition,
          profile: draft.profile,
          lgpdConsent: draft.lgpdConsent,
          marketingConsent: draft.marketingConsent,
          referredBy: draft.referredBy,
          source,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 429) {
        setState({
          kind: 'error',
          message: data?.error ?? 'Muitas tentativas. Tente novamente em alguns minutos.',
        });
        return;
      }
      if (!response.ok) {
        setState({
          kind: 'error',
          message: data?.error ?? 'Erro ao entrar na lista. Tente de novo.',
        });
        return;
      }

      const position = typeof data?.position === 'number' ? data.position : 0;
      const total = typeof data?.total === 'number' ? data.total : 50;
      const score = typeof data?.score === 'number' ? data.score : 0;
      setState({ kind: 'success', position, total, score });
      clearDraft();
      void events.waitlistJoined(draft.email, source);
      // Anima share buttons após 800ms
      setTimeout(() => setShowShare(true), 800);
    } catch (err) {
      setState({
        kind: 'error',
        message: err instanceof Error ? err.message : 'Erro de rede. Tente de novo.',
      });
    }
  };

  // ============================================================================
  // Success state
  // ============================================================================

  if (state.kind === 'success') {
    const shareUrl = `https://akashaportal.com/validacao?ref=${encodeURIComponent(draft.email)}`;
    const shareText = `Entrei na lista de espera do Akasha Portal — espiritualidade universalista com rigor científico. Posição #${state.position}!`;

    return (
      <div
        ref={formTopRef}
        role="status"
        aria-live="polite"
        className={`max-w-md mx-auto rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-6 text-center ${className ?? ''}`}
      >
        <div className="relative inline-block mb-4">
          <CheckCircle2 className="w-14 h-14 text-emerald-400 animate-[fadeInScale_0.4s_ease-out]" />
          <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-amber-400 animate-pulse" />
        </div>
        <h3 className="font-cinzel text-xl font-semibold text-emerald-300 mb-2">
          Você está dentro!
        </h3>
        <p className="text-sm text-emerald-100/90 leading-relaxed mb-4">
          Posição <strong className="text-emerald-300">#{state.position}</strong> de{' '}
          {state.total}. Score de prioridade: <strong className="text-emerald-300">{state.score}</strong>.
          <br />
          Enviaremos um convite por email quando sua onda abrir.
        </p>
        <p className="text-xs text-emerald-200/70 mb-4">
          💌 Confira seu email — enviamos um link de confirmação. Sem ele, o invite não chega.
        </p>

        {showShare && (
          <div className="border-t border-emerald-500/20 pt-4 mt-4 animate-[fadeIn_0.5s_ease-out]">
            <p className="text-xs text-emerald-200/80 mb-3 flex items-center justify-center gap-1.5">
              <Share2 className="w-3.5 h-3.5" />
              Cada amigo confirmado sobe você +3 posições
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="h-11 px-4 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-500 transition flex items-center gap-2"
              >
                WhatsApp
              </a>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="h-11 px-4 rounded-lg bg-slate-700 text-white text-sm font-semibold hover:bg-slate-600 transition flex items-center gap-2"
              >
                Twitter / X
              </a>
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="h-11 px-4 rounded-lg bg-sky-600 text-white text-sm font-semibold hover:bg-sky-500 transition flex items-center gap-2"
              >
                Telegram
              </a>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ============================================================================
  // Form render
  // ============================================================================

  const isSubmitting = state.kind === 'submitting';

  return (
    <form
      ref={formTopRef}
      onSubmit={handleSubmit}
      className={`max-w-md mx-auto ${className ?? ''}`}
      noValidate
      aria-label="Formulário da lista de espera"
    >
      {/* Progress indicator */}
      <ProgressIndicator currentStep={step} />

      {/* Step content */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5 sm:p-6">
        {step === 1 && (
          <Step1Email
            email={draft.email}
            error={fieldErrors.email}
            onChange={(email) => updateDraft({ email })}
          />
        )}
        {step === 2 && (
          <Step2Name
            name={draft.displayName}
            error={fieldErrors.displayName}
            onChange={(displayName) => updateDraft({ displayName })}
          />
        )}
        {step === 3 && (
          <Step3Tradition
            value={draft.tradition}
            error={fieldErrors.tradition}
            onChange={(tradition) => updateDraft({ tradition })}
          />
        )}
        {step === 4 && (
          <Step4Profile
            value={draft.profile}
            error={fieldErrors.profile}
            onChange={(profile) => updateDraft({ profile })}
          />
        )}
        {step === 5 && (
          <Step5Consent
            draft={draft}
            error={fieldErrors.lgpdConsent}
            onChange={(patch) => updateDraft(patch)}
          />
        )}

        {/* Error message geral (API) */}
        {state.kind === 'error' && (
          <p
            role="alert"
            className="mt-4 flex items-start gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-3"
          >
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden />
            <span>{state.message}</span>
          </p>
        )}

        {/* Navigation */}
        <div className="mt-5 flex items-center gap-2">
          {step > 1 && (
            <button
              type="button"
              onClick={goBack}
              disabled={isSubmitting}
              className="h-12 px-4 rounded-lg bg-slate-800 text-slate-200 text-sm font-semibold hover:bg-slate-700 transition disabled:opacity-50 flex items-center gap-2 min-w-[80px]"
              aria-label="Voltar para o passo anterior"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden />
              Voltar
            </button>
          )}
          {step < 5 ? (
            <button
              type="button"
              onClick={goNext}
              disabled={isSubmitting}
              className="flex-1 h-12 px-5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-400 text-slate-900 font-semibold text-sm hover:from-amber-400 hover:to-amber-300 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              data-waitlist-next-click
            >
              Continuar
              <ArrowRight className="w-4 h-4" aria-hidden />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting || !draft.lgpdConsent}
              data-waitlist-cta-click
              className="flex-1 h-12 px-5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-400 text-slate-900 font-semibold text-sm hover:from-amber-400 hover:to-amber-300 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[160px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
                  Entrando na fila...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" aria-hidden />
                  Entrar na lista de espera
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-400 text-center">
        <ShieldCheck className="inline w-3.5 h-3.5 mr-1 -mt-0.5 text-emerald-400" aria-hidden />
        Seus dados são protegidos pela LGPD (Art. 7º e 18). Sem spam, sem compartilhamento.
      </p>
    </form>
  );
}

// ============================================================================
// Sub-components — cada step
// ============================================================================

function Step1Email({
  email,
  error,
  onChange,
}: {
  email: string;
  error?: string;
  onChange: (email: string) => void;
}) {
  return (
    <div>
      <label htmlFor="waitlist-email" className="block text-sm font-semibold text-slate-100 mb-1.5">
        <Mail className="inline w-4 h-4 mr-1 -mt-0.5" aria-hidden />
        Qual seu melhor email?
      </label>
      <p className="text-xs text-slate-400 mb-3">
        Enviaremos o convite e a confirmação por aqui. Pode ser Gmail, Outlook, Yahoo…
      </p>
      <input
        id="waitlist-email"
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder="seu@email.com"
        value={email}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? 'email-error' : undefined}
        className={`w-full h-12 px-4 rounded-lg bg-slate-950 border ${
          error ? 'border-red-500' : 'border-slate-700'
        } text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition text-base`}
      />
      {error && (
        <p id="email-error" role="alert" className="mt-2 text-xs text-red-400 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" aria-hidden />
          {error}
        </p>
      )}
    </div>
  );
}

function Step2Name({
  name,
  error,
  onChange,
}: {
  name: string;
  error?: string;
  onChange: (name: string) => void;
}) {
  return (
    <div>
      <label htmlFor="waitlist-name" className="block text-sm font-semibold text-slate-100 mb-1.5">
        <User className="inline w-4 h-4 mr-1 -mt-0.5" aria-hidden />
        Como podemos te chamar?
      </label>
      <p className="text-xs text-slate-400 mb-3">
        Primeiro nome é suficiente — usamos nos emails para deixar mais pessoal.
      </p>
      <input
        id="waitlist-name"
        type="text"
        autoComplete="given-name"
        placeholder="Ex: Maria"
        value={name}
        onChange={(e) => onChange(e.target.value)}
        maxLength={80}
        aria-invalid={Boolean(error)}
        className={`w-full h-12 px-4 rounded-lg bg-slate-950 border ${
          error ? 'border-red-500' : 'border-slate-700'
        } text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition text-base`}
      />
      {error && (
        <p role="alert" className="mt-2 text-xs text-red-400 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" aria-hidden />
          {error}
        </p>
      )}
      <p className="mt-2 text-xs text-slate-500">Opcional — você pode pular.</p>
    </div>
  );
}

function Step3Tradition({
  value,
  error,
  onChange,
}: {
  value: TraditionSlug | null;
  error?: string;
  onChange: (t: TraditionSlug) => void;
}) {
  return (
    <div>
      <p className="block text-sm font-semibold text-slate-100 mb-1.5">
        Qual sua tradição principal?
      </p>
      <p className="text-xs text-slate-400 mb-3">
        Isso nos ajuda a calibrar a curadoria inicial do beta pra você.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" role="radiogroup" aria-label="Tradição principal">
        {TRADITIONS.map((t) => {
          const isSelected = value === t.slug;
          const accentColors = {
            amber: 'border-amber-400/60 bg-amber-500/10 text-amber-300',
            emerald: 'border-emerald-400/60 bg-emerald-500/10 text-emerald-300',
            violet: 'border-violet-400/60 bg-violet-500/10 text-violet-300',
            sky: 'border-sky-400/60 bg-sky-500/10 text-sky-300',
            rose: 'border-rose-400/60 bg-rose-500/10 text-rose-300',
            pink: 'border-pink-400/60 bg-pink-500/10 text-pink-300',
            fuchsia: 'border-fuchsia-400/60 bg-fuchsia-500/10 text-fuchsia-300',
          }[t.accent];
          return (
            <button
              key={t.slug}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(t.slug)}
              className={`h-auto min-h-[60px] px-3 py-2.5 rounded-lg border-2 transition text-left flex items-center gap-3 ${
                isSelected
                  ? accentColors
                  : 'border-slate-700 bg-slate-900/50 text-slate-300 hover:border-slate-500'
              }`}
            >
              <span className="text-2xl flex-shrink-0" aria-hidden>
                {t.emoji}
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-semibold truncate">{t.label}</span>
                <span className="block text-xs opacity-70 truncate">{t.description}</span>
              </span>
              {isSelected && <CheckCircle2 className="w-4 h-4 flex-shrink-0" aria-hidden />}
            </button>
          );
        })}
      </div>
      {error && (
        <p role="alert" className="mt-2 text-xs text-red-400 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" aria-hidden />
          {error}
        </p>
      )}
    </div>
  );
}

function Step4Profile({
  value,
  error,
  onChange,
}: {
  value: ProfileSlug | null;
  error?: string;
  onChange: (p: ProfileSlug) => void;
}) {
  return (
    <div>
      <p className="block text-sm font-semibold text-slate-100 mb-1.5">
        Como você se vê nessa jornada?
      </p>
      <p className="text-xs text-slate-400 mb-3">
        Nível de experiência — sem julgamento, é só pra gente calibrar o conteúdo.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" role="radiogroup" aria-label="Perfil espiritual">
        {PROFILES.map((p) => {
          const Icon = p.icon;
          const isSelected = value === p.slug;
          return (
            <button
              key={p.slug}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(p.slug)}
              className={`h-14 px-3 rounded-lg border-2 transition flex items-center gap-3 ${
                isSelected
                  ? 'border-amber-400/60 bg-amber-500/10 text-amber-300'
                  : 'border-slate-700 bg-slate-900/50 text-slate-300 hover:border-slate-500'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" aria-hidden />
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-semibold">{p.label}</span>
                <span className="block text-xs opacity-70">{p.description}</span>
              </span>
              {isSelected && <CheckCircle2 className="w-4 h-4 flex-shrink-0" aria-hidden />}
            </button>
          );
        })}
      </div>
      {error && (
        <p role="alert" className="mt-2 text-xs text-red-400 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" aria-hidden />
          {error}
        </p>
      )}
    </div>
  );
}

function Step5Consent({
  draft,
  error,
  onChange,
}: {
  draft: Draft;
  error?: string;
  onChange: (patch: Partial<Draft>) => void;
}) {
  return (
    <div>
      <p className="block text-sm font-semibold text-slate-100 mb-1.5">
        Quase lá! Último passo:
      </p>
      <p className="text-xs text-slate-400 mb-4">
        Confirme os dados e aceite a política de privacidade (LGPD).
      </p>

      <div className="rounded-lg bg-slate-950/60 border border-slate-800 p-3 mb-4 space-y-1.5 text-xs">
        <Row label="Email" value={draft.email} />
        <Row label="Nome" value={draft.displayName || '— (não informado)'} />
        <Row
          label="Tradição"
          value={TRADITIONS.find((t) => t.slug === draft.tradition)?.label ?? '—'}
        />
        <Row
          label="Perfil"
          value={PROFILES.find((p) => p.slug === draft.profile)?.label ?? '—'}
        />
      </div>

      <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-700 hover:border-slate-600 cursor-pointer transition">
        <input
          type="checkbox"
          checked={draft.lgpdConsent}
          onChange={(e) => onChange({ lgpdConsent: e.target.checked })}
          className="mt-0.5 w-5 h-5 rounded border-slate-600 text-amber-500 focus:ring-2 focus:ring-amber-400/40 focus:ring-offset-0"
          aria-required="true"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'lgpd-error' : 'lgpd-desc'}
        />
        <span className="text-xs text-slate-300 leading-relaxed">
          <ShieldCheck className="inline w-3.5 h-3.5 mr-1 text-emerald-400" aria-hidden />
          Li e aceito a{' '}
          <a
            href="/privacidade"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-400 underline underline-offset-2 hover:text-amber-300"
          >
            Política de Privacidade
          </a>{' '}
          e autorizo o tratamento dos meus dados conforme a{' '}
          <strong>LGPD (Lei 13.709/2018, Art. 7º, I)</strong>.
          <span id="lgpd-desc" className="block mt-1 text-slate-500">
            Posso revogar este consentimento a qualquer momento.
          </span>
        </span>
      </label>
      {error && (
        <p id="lgpd-error" role="alert" className="mt-2 text-xs text-red-400 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" aria-hidden />
          {error}
        </p>
      )}

      <label className="mt-3 flex items-start gap-3 p-3 rounded-lg border border-slate-700/60 hover:border-slate-600 cursor-pointer transition">
        <input
          type="checkbox"
          checked={draft.marketingConsent}
          onChange={(e) => onChange({ marketingConsent: e.target.checked })}
          className="mt-0.5 w-5 h-5 rounded border-slate-600 text-amber-500 focus:ring-2 focus:ring-amber-400/40 focus:ring-offset-0"
        />
        <span className="text-xs text-slate-400 leading-relaxed">
          Aceito receber comunicações sobre o beta, eventos e conteúdos da
          Cabala dos Caminhos. <em>(Opcional — posso descadastrar a qualquer hora.)</em>
        </span>
      </label>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-slate-500 flex-shrink-0">{label}:</span>
      <span className="text-slate-200 truncate font-mono">{value}</span>
    </div>
  );
}

// ============================================================================
// Progress indicator (5 dots)
// ============================================================================

function ProgressIndicator({ currentStep }: { currentStep: Step }) {
  const labels = ['Email', 'Nome', 'Tradição', 'Perfil', 'Confirmar'];
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between gap-1 mb-2">
        {[1, 2, 3, 4, 5].map((s) => (
          <div
            key={s}
            className={`flex-1 h-1.5 rounded-full transition-colors ${
              s <= currentStep ? 'bg-amber-400' : 'bg-slate-800'
            }`}
            aria-hidden
          />
        ))}
      </div>
      <div className="flex items-center justify-between text-[10px] text-slate-500">
        {labels.map((l, i) => (
          <span
            key={l}
            className={`flex-1 text-center ${
              i + 1 === currentStep ? 'text-amber-400 font-semibold' : ''
            }`}
          >
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Validation (per step)
// ============================================================================

function validateStep(step: Step, draft: Draft): Record<string, string> {
  const errors: Record<string, string> = {};
  if (step >= 1) {
    const e = validateEmail(draft.email);
    if (e) errors.email = e;
  }
  if (step >= 2) {
    const e = validateName(draft.displayName);
    if (e) errors.displayName = e;
  }
  if (step >= 3 && !draft.tradition) {
    errors.tradition = 'Escolha uma tradição para continuarmos.';
  }
  if (step >= 4 && !draft.profile) {
    errors.profile = 'Escolha um perfil para continuarmos.';
  }
  if (step >= 5 && !draft.lgpdConsent) {
    errors.lgpdConsent = 'Você precisa aceitar a Política de Privacidade para entrar na fila.';
  }
  return errors;
}

function computeResumeStep(draft: Draft): Step {
  if (!draft.email) return 1;
  if (!draft.displayName) return 2;
  if (!draft.tradition) return 3;
  if (!draft.profile) return 4;
  return 5;
}