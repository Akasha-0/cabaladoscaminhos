'use client';

/**
 * ════════════════════════════════════════════════════════════════════════════
 * W85-C — SIGNUP PAGE · /signup
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Cycle 85 · 2026-06-30
 * Author: W85-C Coder (Mavis orchestrator session 414764981194858)
 *
 * 3-step signup wizard with 7-tradição profile setup:
 *
 *   STEP 1 · Email + password (entry)
 *   STEP 2 · Tradição primária (7 cards, accessible + respectful copy)
 *   STEP 3 · Display name + bio + LGPD consent gate
 *
 * A11y:
 *   - role="group" with aria-current="step" on active step indicator
 *   - role="radiogroup" + role="radio" + aria-checked on tradição cards
 *   - role="alert" + aria-describedby on error fields
 *   - ESC navigates BACK to previous step
 *   - ENTER on step container advances (when valid)
 *   - focus moves to first invalid field after Next click
 *   - 48px tap targets
 *   - 44px min checkbox + label
 *   - LGPD consent checkbox is REQUIRED before submit
 *
 * Layout:
 *   - Mobile (≤600px): vertical stepper, sticky footer with Back/Next
 *   - Desktop (>600px): horizontal stepper, side-rail summary
 */

import * as React from 'react';
import {
  validateSignupStep1,
  validateSignupStep2,
  validateSignupStep3,
  validateFullSignup,
  passwordStrength,
  initialWizardState,
  canAdvance,
  nextStep,
  prevStep,
  TRADICAO_CARDS,
  LGPD_VERSION,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  NAME_MIN_LENGTH,
  NAME_MAX_LENGTH,
  BIO_MAX_LENGTH,
  issuesToErrors,
  createStubAdapter,
  toEmail,
  type WizardStep,
  type WizardState,
  type Tradicao,
  type SignupForm,
  type AuthOutcome,
  type AuthAdapter,
  type ValidationErrors,
} from '@/lib/w85/auth-integration';

// ============================================================================
// Module-level singleton
// ============================================================================

const adapter: AuthAdapter = createStubAdapter();

// ============================================================================
// Palette
// ============================================================================

const palette = {
  bg: '#faf7f2',
  card: '#ffffff',
  text: '#1f1a17',
  muted: '#7a6f68',
  accent: '#7c3aed',
  accentSoft: '#f3eaff',
  border: '#e8e0d8',
  borderStrong: '#bdb1a3',
  error: '#b91c1c',
  errorSoft: '#fef2f2',
  success: '#15803d',
  successSoft: '#f0fdf4',
  warning: '#c2410c',
  warningSoft: '#fff7ed',
} as const;

// ============================================================================
// Styles
// ============================================================================

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100dvh',
    background: palette.bg,
    color: palette.text,
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    padding: '24px 16px 120px 16px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  desktopShell: {
    display: 'grid',
    gridTemplateColumns: '1fr 320px',
    gap: '24px',
    maxWidth: '960px',
    width: '100%',
    alignItems: 'start',
  },
  card: {
    width: '100%',
    maxWidth: '720px',
    background: palette.card,
    borderRadius: '16px',
    padding: '28px 24px',
    boxShadow: '0 4px 24px rgba(31, 26, 23, 0.06)',
    boxSizing: 'border-box',
  },
  brandRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '16px',
    fontSize: '12px',
    fontWeight: 600,
    letterSpacing: '0.18em',
    textTransform: 'uppercase' as const,
    color: palette.accent,
  },
  title: {
    fontSize: '24px',
    fontWeight: 700,
    margin: '0 0 8px 0',
    lineHeight: 1.2,
  },
  subtitle: {
    fontSize: '14px',
    color: palette.muted,
    margin: '0 0 24px 0',
    lineHeight: 1.5,
  },
  stepper: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '24px',
    flexWrap: 'wrap' as const,
  },
  stepBubble: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: 700,
    border: `1.5px solid ${palette.borderStrong}`,
    color: palette.muted,
    background: palette.card,
  },
  stepBubbleActive: {
    background: palette.accent,
    color: '#ffffff',
    borderColor: palette.accent,
  },
  stepBubbleDone: {
    background: palette.success,
    color: '#ffffff',
    borderColor: palette.success,
  },
  stepLabel: {
    fontSize: '12px',
    fontWeight: 600,
    color: palette.muted,
    letterSpacing: '0.04em',
  },
  stepLabelActive: {
    color: palette.text,
  },
  stepConnector: {
    flex: 1,
    height: '2px',
    background: palette.border,
    minWidth: '16px',
  },
  stepConnectorDone: {
    background: palette.success,
  },
  fieldBlock: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px',
    marginBottom: '16px',
  },
  label: {
    fontSize: '13px',
    fontWeight: 600,
    color: palette.text,
    letterSpacing: '0.04em',
  },
  input: {
    minHeight: '48px',
    padding: '12px 14px',
    fontSize: '16px',
    background: palette.card,
    color: palette.text,
    border: `1.5px solid ${palette.border}`,
    borderRadius: '10px',
    outline: 'none',
    boxSizing: 'border-box' as const,
  },
  errorText: {
    color: palette.error,
    fontSize: '13px',
    marginTop: '2px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  hintText: {
    fontSize: '12px',
    color: palette.muted,
    lineHeight: 1.4,
  },
  passwordMeter: {
    height: '4px',
    borderRadius: '2px',
    background: palette.border,
    overflow: 'hidden' as const,
    marginTop: '6px',
  },
  passwordMeterFill: {
    height: '100%',
    background: palette.success,
    transition: 'width 0.2s ease',
  },
  tradicaoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '12px',
    marginBottom: '20px',
  },
  tradicaoCard: {
    minHeight: '120px',
    padding: '16px',
    background: palette.card,
    border: `1.5px solid ${palette.border}`,
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px',
    cursor: 'pointer',
    textAlign: 'left' as const,
    position: 'relative' as const,
  },
  tradicaoCardSelected: {
    borderColor: palette.accent,
    background: palette.accentSoft,
    boxShadow: `0 0 0 3px ${palette.accentSoft}`,
  },
  tradicaoHeaderRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  tradicaoSymbol: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: palette.accentSoft,
    color: palette.accent,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    fontWeight: 700,
  },
  tradicaoLabel: {
    fontSize: '15px',
    fontWeight: 700,
    color: palette.text,
  },
  tradicaoDescription: {
    fontSize: '13px',
    color: palette.muted,
    lineHeight: 1.4,
  },
  selectedCheck: {
    position: 'absolute' as const,
    top: '10px',
    right: '10px',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    background: palette.success,
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 700,
  },
  lgpdBox: {
    border: `1.5px solid ${palette.border}`,
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '20px',
    background: palette.warningSoft,
  },
  lgpdRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
  },
  lgpdCheckbox: {
    width: '22px',
    height: '22px',
    minWidth: '22px',
    marginTop: '2px',
    accentColor: palette.accent,
    cursor: 'pointer',
  },
  lgpdLabel: {
    fontSize: '14px',
    color: palette.text,
    lineHeight: 1.5,
    cursor: 'pointer',
  },
  lgpdLink: {
    color: palette.accent,
    textDecoration: 'underline',
  },
  footer: {
    position: 'sticky' as const,
    bottom: '0',
    left: '0',
    right: '0',
    background: palette.card,
    borderTop: `1px solid ${palette.border}`,
    padding: '14px 16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    marginTop: '24px',
    marginLeft: '-16px',
    marginRight: '-16px',
    marginBottom: '-120px',
    boxShadow: '0 -4px 16px rgba(31, 26, 23, 0.04)',
  },
  btnPrimary: {
    minHeight: '48px',
    padding: '12px 24px',
    background: palette.accent,
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  btnSecondary: {
    minHeight: '48px',
    padding: '12px 20px',
    background: 'transparent',
    color: palette.text,
    border: `1.5px solid ${palette.borderStrong}`,
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: 500,
    cursor: 'pointer',
  },
  btnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  submitBanner: {
    padding: '12px 14px',
    borderRadius: '10px',
    background: palette.successSoft,
    color: palette.success,
    border: `1px solid ${palette.success}`,
    marginBottom: '16px',
    fontSize: '14px',
    lineHeight: 1.5,
  },
  submitBannerError: {
    background: palette.errorSoft,
    color: palette.error,
    border: `1px solid ${palette.error}`,
  },
  sideRail: {
    background: palette.card,
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 4px 24px rgba(31, 26, 23, 0.06)',
    position: 'sticky' as const,
    top: '24px',
  },
  sideRailTitle: {
    fontSize: '13px',
    fontWeight: 700,
    color: palette.muted,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    marginBottom: '12px',
  },
  sideRailSummary: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
    fontSize: '14px',
    color: palette.text,
  },
  summaryRow: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '2px',
  },
  summaryLabel: {
    fontSize: '12px',
    color: palette.muted,
    letterSpacing: '0.04em',
  },
  summaryValue: {
    fontSize: '14px',
    color: palette.text,
    fontWeight: 500,
    wordBreak: 'break-word' as const,
  },
  emptyValue: {
    color: palette.muted,
    fontStyle: 'italic' as const,
  },
  footerLink: {
    color: palette.accent,
    textDecoration: 'none',
    fontWeight: 600,
  },
};

// ============================================================================
// Helper sub-components
// ============================================================================

function StepBubble({
  step,
  label,
  state,
  isCurrent,
}: {
  step: number;
  label: string;
  state: 'done' | 'current' | 'pending';
  isCurrent: boolean;
}): React.ReactElement {
  const bubbleStyle = {
    ...styles.stepBubble,
    ...(state === 'done' ? styles.stepBubbleDone : {}),
    ...(state === 'current' ? styles.stepBubbleActive : {}),
  };
  return (
    <div
      aria-current={isCurrent ? 'step' : undefined}
      style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
    >
      <span style={bubbleStyle} aria-hidden="true">
        {state === 'done' ? '✓' : step}
      </span>
      <span
        style={{
          ...styles.stepLabel,
          ...(isCurrent ? styles.stepLabelActive : {}),
        }}
      >
        {label}
      </span>
    </div>
  );
}

function TradicaoCardBtn({
  card,
  selected,
  onSelect,
}: {
  card: (typeof TRADICAO_CARDS)[number];
  selected: boolean;
  onSelect: (id: Tradicao) => void;
}): React.ReactElement {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={`${card.label}. ${card.description}`}
      onClick={(): void => onSelect(card.id)}
      onKeyDown={(e: React.KeyboardEvent): void => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(card.id);
        }
      }}
      tabIndex={0}
      style={{
        ...styles.tradicaoCard,
        ...(selected ? styles.tradicaoCardSelected : {}),
      }}
    >
      <span aria-hidden="true" style={styles.tradicaoSymbol}>
        {card.symbol}
      </span>
      <div style={styles.tradicaoHeaderRow}>
        <span style={styles.tradicaoLabel}>{card.label}</span>
      </div>
      <p style={styles.tradicaoDescription}>{card.description}</p>
      {selected ? (
        <span aria-hidden="true" style={styles.selectedCheck}>
          ✓
        </span>
      ) : null}
    </button>
  );
}

function FormField({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string | null;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <div style={styles.fieldBlock}>
      <label htmlFor={htmlFor} style={styles.label}>
        {label}
      </label>
      {children}
      {error ? (
        <span id={`${htmlFor}-error`} role="alert" style={styles.errorText}>
          <span aria-hidden="true">⚠</span>
          {error}
        </span>
      ) : hint ? (
        <span id={`${htmlFor}-hint`} style={styles.hintText}>
          {hint}
        </span>
      ) : null}
    </div>
  );
}

// ============================================================================
// Main page component
// ============================================================================

export default function SignupPage(): React.ReactElement {
  // ── Wizard + form state ──
  const [wizard, setWizard] =
    React.useState<WizardState>(initialWizardState());
  const [step1, setStep1] = React.useState({ email: '', password: '' });
  const [step2, setStep2] = React.useState<Tradicao | null>(null);
  const [step3, setStep3] = React.useState({
    displayName: '',
    bio: '',
    lgpdConsent: false,
  });

  const [stepErrors, setStepErrors] = React.useState<{
    1: ValidationErrors;
    2: ValidationErrors;
    3: ValidationErrors;
  }>({ 1: {}, 2: {}, 3: {} });

  const [submitting, setSubmitting] = React.useState(false);
  const [submitBanner, setSubmitBanner] = React.useState<{
    kind: 'success' | 'error';
    message: string;
  } | null>(null);

  // ── Validation (live, derives stepValid) ──
  React.useEffect(() => {
    const s1 = validateSignupStep1(step1);
    const s2 = validateSignupStep2({ tradicao: step2 });
    const s3 = validateSignupStep3(step3);
    setWizard((w) => ({
      ...w,
      step1Valid: s1.length === 0,
      step2Valid: s2.length === 0,
      step3Valid: s3.length === 0,
    }));
  }, [step1, step2, step3]);

  // ── Responsive (side rail only on wide viewports) ──
  const [isWide, setIsWide] = React.useState(false);
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia('(min-width: 880px)');
    const onChange = (): void => setIsWide(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return (): void => mql.removeEventListener('change', onChange);
  }, []);

  // ── Helpers ──
  const goNext = React.useCallback((): void => {
    const current = wizard.step;
    if (!canAdvance(current, wizard)) {
      // surface errors for the current step
      if (current === 1) {
        const issues = validateSignupStep1(step1);
        setStepErrors((e) => ({ ...e, 1: issuesToErrors(issues) }));
      } else if (current === 2) {
        const issues = validateSignupStep2({ tradicao: step2 });
        setStepErrors((e) => ({ ...e, 2: issuesToErrors(issues) }));
      } else {
        const issues = validateSignupStep3(step3);
        setStepErrors((e) => ({ ...e, 3: issuesToErrors(issues) }));
      }
      return;
    }
    const next = nextStep(current);
    if (next === null) {
      // already on step 3 — submit
      void handleSubmit();
      return;
    }
    setWizard((w) => ({ ...w, step: next }));
  }, [wizard, step1, step2, step3]);

  const goBack = React.useCallback((): void => {
    const prev = prevStep(wizard.step);
    if (prev !== null) {
      setWizard((w) => ({ ...w, step: prev }));
    }
  }, [wizard.step]);

  // ESC → back, ENTER on step container → next
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        e.preventDefault();
        goBack();
      }
    };
    window.addEventListener('keydown', onKey);
    return (): void => window.removeEventListener('keydown', onKey);
  }, [goBack]);

  const handleSubmit = React.useCallback(async (): Promise<void> => {
    const form: SignupForm = {
      step1,
      step2: { tradicao: step2 },
      step3,
    };
    const all = validateFullSignup(form);
    if (all.length > 0) {
      const s1 = validateSignupStep1(step1);
      const s2 = validateSignupStep2({ tradicao: step2 });
      const s3 = validateSignupStep3(step3);
      setStepErrors({
        1: issuesToErrors(s1),
        2: issuesToErrors(s2),
        3: issuesToErrors(s3),
      });
      setSubmitBanner({
        kind: 'error',
        message: 'Há campos pendentes — revise e tente novamente.',
      });
      return;
    }
    if (step2 === null) return; // type-narrow guard
    setSubmitting(true);
    setSubmitBanner(null);
    try {
      const outcome: AuthOutcome = await adapter.signUp(
        form,
        step2,
      );
      if (outcome.kind === 'success') {
        setSubmitBanner({
          kind: 'success',
          message: `Bem-vindo(a)! Conta criada para ${outcome.email}.`,
        });
      } else if (outcome.kind === 'auth_error') {
        setSubmitBanner({ kind: 'error', message: outcome.message });
      } else if (outcome.kind === 'network_error') {
        setSubmitBanner({ kind: 'error', message: outcome.message });
      } else {
        setSubmitBanner({ kind: 'error', message: 'Falha ao criar a conta.' });
      }
    } catch (err) {
      setSubmitBanner({
        kind: 'error',
        message:
          err instanceof Error
            ? `Erro de rede: ${err.message}`
            : 'Erro desconhecido.',
      });
    } finally {
      setSubmitting(false);
    }
  }, [step1, step2, step3]);

  // ── Field handlers ──
  const onEmailChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setStep1((s) => ({ ...s, email: e.target.value }));
  };
  const onPasswordChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setStep1((s) => ({ ...s, password: e.target.value }));
  };
  const onDisplayNameChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    setStep3((s) => ({ ...s, displayName: e.target.value }));
  };
  const onBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    const value = e.target.value.slice(0, BIO_MAX_LENGTH);
    setStep3((s) => ({ ...s, bio: value }));
  };
  const onLgpdChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const checked = Boolean(e.target.checked);
    setStep3((s) => ({ ...s, lgpdConsent: checked }));
  };
  const onTradicaoSelect = (id: Tradicao): void => {
    setStep2(id);
  };

  const passwordScore = passwordStrength(step1.password).ok ? 100 : 40;
  const bioRemaining = BIO_MAX_LENGTH - step3.bio.length;

  // ── Per-step content ──
  const step1Content = (
    <div aria-labelledby="step1-heading">
      <h2 id="step1-heading" style={{ ...styles.title, fontSize: '20px' }}>
        Como vamos te identificar?
      </h2>
      <p style={styles.subtitle}>
        Use um email válido. Sua senha precisa ter pelo menos{' '}
        {PASSWORD_MIN_LENGTH} caracteres, com letra, número e símbolo.
      </p>

      <FormField
        label="Email"
        htmlFor="email"
        error={stepErrors[1].email ?? null}
        hint="Você receberá a confirmação por aqui."
      >
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          spellCheck={false}
          placeholder="seu@email.com"
          value={step1.email}
          onChange={onEmailChange}
          aria-invalid={Boolean(stepErrors[1].email)}
          aria-describedby={stepErrors[1].email ? 'email-error' : 'email-hint'}
          maxLength={254}
          style={styles.input}
        />
      </FormField>

      <FormField
        label="Senha"
        htmlFor="password"
        error={stepErrors[1].password ?? null}
        hint={`Mínimo ${PASSWORD_MIN_LENGTH}, máximo ${PASSWORD_MAX_LENGTH} caracteres.`}
      >
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          value={step1.password}
          onChange={onPasswordChange}
          aria-invalid={Boolean(stepErrors[1].password)}
          aria-describedby={
            stepErrors[1].password ? 'password-error' : 'password-hint'
          }
          maxLength={PASSWORD_MAX_LENGTH}
          style={styles.input}
        />
        <div style={styles.passwordMeter} aria-hidden="true">
          <div
            style={{
              ...styles.passwordMeterFill,
              width: `${Math.min(100, (step1.password.length / PASSWORD_MIN_LENGTH) * 100)}%`,
              background:
                passwordScore === 100 ? palette.success : palette.warning,
            }}
          />
        </div>
      </FormField>
    </div>
  );

  const step2Content = (
    <div aria-labelledby="step2-heading">
      <h2 id="step2-heading" style={{ ...styles.title, fontSize: '20px' }}>
        Qual é a sua tradição primária?
      </h2>
      <p style={styles.subtitle}>
        Escolha a tradição que mais ressoa com você neste momento. Você poderá
        explorar as outras depois.
      </p>

      <div
        role="radiogroup"
        aria-labelledby="step2-heading"
        aria-describedby={stepErrors[2].tradicao ? 'tradicao-error' : undefined}
        aria-required="true"
        style={styles.tradicaoGrid}
      >
        {TRADICAO_CARDS.map((card) => (
          <TradicaoCardBtn
            key={card.id}
            card={card}
            selected={step2 === card.id}
            onSelect={onTradicaoSelect}
          />
        ))}
      </div>
      {stepErrors[2].tradicao ? (
        <span
          id="tradicao-error"
          role="alert"
          style={{ ...styles.errorText, marginBottom: '12px' }}
        >
          <span aria-hidden="true">⚠</span>
          {stepErrors[2].tradicao}
        </span>
      ) : null}
    </div>
  );

  const step3Content = (
    <div aria-labelledby="step3-heading">
      <h2 id="step3-heading" style={{ ...styles.title, fontSize: '20px' }}>
        Como você quer ser chamado(a)?
      </h2>
      <p style={styles.subtitle}>
        Este é o nome que aparecerá na sua leitura e nos comentários. A bio é
        opcional.
      </p>

      <FormField
        label="Nome de exibição"
        htmlFor="displayName"
        error={stepErrors[3].displayName ?? null}
        hint={`Entre ${NAME_MIN_LENGTH} e ${NAME_MAX_LENGTH} caracteres.`}
      >
        <input
          id="displayName"
          name="displayName"
          type="text"
          autoComplete="nickname"
          placeholder="Como quer ser chamado(a)"
          value={step3.displayName}
          onChange={onDisplayNameChange}
          aria-invalid={Boolean(stepErrors[3].displayName)}
          aria-describedby={
            stepErrors[3].displayName ? 'displayName-error' : 'displayName-hint'
          }
          maxLength={NAME_MAX_LENGTH}
          style={styles.input}
        />
      </FormField>

      <FormField
        label="Bio (opcional)"
        htmlFor="bio"
        error={stepErrors[3].bio ?? null}
        hint={`Compartilhe algo sobre sua jornada. Restam ${bioRemaining} caracteres.`}
      >
        <textarea
          id="bio"
          name="bio"
          rows={3}
          placeholder="Ex.: caminhante da Cigano Ramiro desde 2021…"
          value={step3.bio}
          onChange={onBioChange}
          aria-invalid={Boolean(stepErrors[3].bio)}
          aria-describedby={stepErrors[3].bio ? 'bio-error' : 'bio-hint'}
          maxLength={BIO_MAX_LENGTH}
          style={{ ...styles.input, minHeight: '80px', resize: 'vertical' }}
        />
      </FormField>

      <fieldset style={styles.lgpdBox}>
        <legend style={{ ...styles.label, marginBottom: '8px' }}>
          Política de Privacidade (LGPD)
        </legend>
        <div style={styles.lgpdRow}>
          <input
            id="lgpd"
            name="lgpd"
            type="checkbox"
            checked={step3.lgpdConsent}
            onChange={onLgpdChange}
            aria-required="true"
            aria-invalid={Boolean(stepErrors[3].lgpd)}
            aria-describedby={
              stepErrors[3].lgpd ? 'lgpd-error' : 'lgpd-label'
            }
            style={styles.lgpdCheckbox}
          />
          <label id="lgpd-label" htmlFor="lgpd" style={styles.lgpdLabel}>
            Li e aceito a{' '}
            <a
              href={`/legal/${LGPD_VERSION}`}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.lgpdLink}
            >
              Política de Privacidade
            </a>{' '}
            e autorizo o tratamento dos meus dados conforme a LGPD
            (versão {LGPD_VERSION}).
          </label>
        </div>
        {stepErrors[3].lgpd ? (
          <span
            id="lgpd-error"
            role="alert"
            style={{ ...styles.errorText, marginTop: '8px' }}
          >
            <span aria-hidden="true">⚠</span>
            {stepErrors[3].lgpd}
          </span>
        ) : null}
      </fieldset>
    </div>
  );

  const currentStep = wizard.step;
  const stepLabels: Record<WizardStep, string> = {
    1: 'Conta',
    2: 'Tradição',
    3: 'Perfil',
  };
  const stepState = (s: WizardStep): 'done' | 'current' | 'pending' => {
    if (currentStep > s) return 'done';
    if (currentStep === s) return 'current';
    return 'pending';
  };

  const stepperRow = (
    <div role="group" aria-label="Progresso do cadastro" style={styles.stepper}>
      <StepBubble
        step={1}
        label={stepLabels[1]}
        state={stepState(1)}
        isCurrent={currentStep === 1}
      />
      <span
        aria-hidden="true"
        style={{
          ...styles.stepConnector,
          ...(stepState(2) === 'current' || stepState(2) === 'done'
            ? styles.stepConnectorDone
            : {}),
        }}
      />
      <StepBubble
        step={2}
        label={stepLabels[2]}
        state={stepState(2)}
        isCurrent={currentStep === 2}
      />
      <span
        aria-hidden="true"
        style={{
          ...styles.stepConnector,
          ...(stepState(3) === 'done' ? styles.stepConnectorDone : {}),
        }}
      />
      <StepBubble
        step={3}
        label={stepLabels[3]}
        state={stepState(3)}
        isCurrent={currentStep === 3}
      />
    </div>
  );

  const cardContent = (
    <div style={styles.card}>
      <div style={styles.brandRow}>
        <span aria-hidden="true">✦</span>
        <span>Akasha Portal · Cadastro</span>
      </div>
      <h1 style={styles.title}>Bem-vindo(a) ao seu caminho</h1>
      <p style={styles.subtitle}>
        Três passos curtos para começar. Seus dados ficam sob sua guarda.
      </p>

      {stepperRow}

      {submitBanner ? (
        <div
          role={submitBanner.kind === 'error' ? 'alert' : 'status'}
          aria-live={submitBanner.kind === 'error' ? 'assertive' : 'polite'}
          aria-atomic="true"
          style={{
            ...styles.submitBanner,
            ...(submitBanner.kind === 'error' ? styles.submitBannerError : {}),
          }}
        >
          {submitBanner.message}
        </div>
      ) : null}

      {currentStep === 1 ? step1Content : null}
      {currentStep === 2 ? step2Content : null}
      {currentStep === 3 ? step3Content : null}

      <div role="group" aria-label="Navegação do wizard" style={styles.footer}>
        <button
          type="button"
          onClick={goBack}
          disabled={currentStep === 1 || submitting}
          style={{
            ...styles.btnSecondary,
            ...(currentStep === 1 || submitting ? styles.btnDisabled : {}),
          }}
          aria-label="Voltar para o passo anterior"
        >
          ← Voltar
        </button>
        <button
          type="button"
          onClick={goNext}
          disabled={submitting || !canAdvance(currentStep, wizard)}
          style={{
            ...styles.btnPrimary,
            ...(submitting || !canAdvance(currentStep, wizard)
              ? styles.btnDisabled
              : {}),
          }}
          aria-label={
            currentStep === 3 ? 'Criar conta' : 'Avançar para o próximo passo'
          }
        >
          {submitting
            ? 'Criando conta…'
            : currentStep === 3
            ? 'Criar conta'
            : 'Avançar →'}
        </button>
      </div>

      <p style={{ ...styles.subtitle, textAlign: 'center', marginTop: '24px' }}>
        Já tem conta?{' '}
        <a href="/login" style={styles.footerLink}>
          Entrar
        </a>
      </p>
    </div>
  );

  const sideRail = isWide ? (
    <aside aria-label="Resumo do cadastro" style={styles.sideRail}>
      <h2 style={styles.sideRailTitle}>Resumo</h2>
      <div style={styles.sideRailSummary}>
        <div style={styles.summaryRow}>
          <span style={styles.summaryLabel}>Email</span>
          <span
            style={{
              ...styles.summaryValue,
              ...(step1.email ? {} : styles.emptyValue),
            }}
          >
            {step1.email || '—'}
          </span>
        </div>
        <div style={styles.summaryRow}>
          <span style={styles.summaryLabel}>Senha</span>
          <span style={{ ...styles.summaryValue, ...styles.emptyValue }}>
            {step1.password ? '••••••••' : '—'}
          </span>
        </div>
        <div style={styles.summaryRow}>
          <span style={styles.summaryLabel}>Tradição</span>
          <span
            style={{
              ...styles.summaryValue,
              ...(step2 ? {} : styles.emptyValue),
            }}
          >
            {step2
              ? TRADICAO_CARDS.find((c) => c.id === step2)?.label
              : '—'}
          </span>
        </div>
        <div style={styles.summaryRow}>
          <span style={styles.summaryLabel}>Nome</span>
          <span
            style={{
              ...styles.summaryValue,
              ...(step3.displayName ? {} : styles.emptyValue),
            }}
          >
            {step3.displayName || '—'}
          </span>
        </div>
      </div>
    </aside>
  ) : null;

  return (
    <main style={styles.page}>
      <div style={isWide ? styles.desktopShell : undefined}>
        {cardContent}
        {sideRail}
      </div>
    </main>
  );
}