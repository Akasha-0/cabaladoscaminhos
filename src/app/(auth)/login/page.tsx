'use client';

/**
 * ════════════════════════════════════════════════════════════════════════════
 * W85-C — LOGIN PAGE · /login
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Cycle 85 · 2026-06-30
 * Author: W85-C Coder (Mavis orchestrator session 414764981194858)
 *
 * Mobile-first auth entry point:
 *   - Email magic-link (primary flow, mirrors cycle 78/W79-B pattern)
 *   - OAuth buttons (Google, Apple) — VISUAL ONLY in cycle 85
 *   - "Don't have an account? Sign up" link
 *
 * A11y:
 *   - role="form" on the magic-link form
 *   - aria-live="polite" for status banner ("magic link sent")
 *   - aria-invalid + aria-describedby for error fields
 *   - 48px min tap targets
 *   - AA contrast (dark text on warm beige; status colors paired with text)
 *   - inputMode="email" + autoComplete="email" for mobile keyboard
 *
 * Layout:
 *   - Mobile (≤600px): bottom-sheet style, sticky CTA at viewport bottom
 *   - Desktop (>600px): centered card on gradient backdrop
 */

import * as React from 'react';
import {
  validateMagicLinkInput,
  createStubAdapter,
  toEmail,
  OAUTH_PROVIDERS,
  type AuthOutcome,
  type OAuthProvider,
  type AuthAdapter,
} from '@/lib/w85/auth-integration';

// ============================================================================
// Types (page-local state)
// ============================================================================

type SendState =
  | { readonly kind: 'idle' }
  | { readonly kind: 'submitting' }
  | { readonly kind: 'sent'; readonly email: string; readonly token: string }
  | { readonly kind: 'error'; readonly message: string };

interface LoginFormState {
  email: string;
  emailTouched: boolean;
  emailError: string | null;
  formError: string | null;
  oauthProvider: OAuthProvider | null;
}

// ============================================================================
// Module-level singleton — stub adapter in cycle 85
// (production swaps in cycle 78 W68 auth-impl adapter)
// ============================================================================

const adapter: AuthAdapter = createStubAdapter();

// ============================================================================
// Styles (inline — keeps page self-contained for isolated tsconfig)
// ============================================================================

const palette = {
  bg: '#faf7f2', // warm beige
  card: '#ffffff',
  text: '#1f1a17',
  muted: '#7a6f68',
  accent: '#7c3aed', // ifá violet
  accentSoft: '#f3eaff',
  border: '#e8e0d8',
  error: '#b91c1c',
  errorSoft: '#fef2f2',
  success: '#15803d',
  successSoft: '#f0fdf4',
  warning: '#c2410c',
} as const;

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100dvh',
    background: palette.bg,
    color: palette.text,
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0',
    margin: '0',
    boxSizing: 'border-box',
  },
  card: {
    width: '100%',
    maxWidth: '480px',
    background: palette.card,
    borderTopLeftRadius: '20px',
    borderTopRightRadius: '20px',
    padding: '28px 24px 32px 24px',
    boxShadow: '0 -8px 32px rgba(31, 26, 23, 0.08)',
    boxSizing: 'border-box',
  },
  desktopBackdrop: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: '24px',
    boxSizing: 'border-box',
  },
  desktopCard: {
    background: palette.card,
    borderRadius: '16px',
    padding: '40px',
    maxWidth: '480px',
    width: '100%',
    boxShadow: '0 8px 32px rgba(31, 26, 23, 0.08)',
    boxSizing: 'border-box',
  },
  headerBlock: {
    textAlign: 'center' as const,
    marginBottom: '24px',
  },
  brand: {
    fontSize: '13px',
    fontWeight: 600,
    letterSpacing: '0.18em',
    textTransform: 'uppercase' as const,
    color: palette.accent,
    marginBottom: '8px',
  },
  title: {
    fontSize: '26px',
    fontWeight: 700,
    margin: '0 0 8px 0',
    color: palette.text,
    lineHeight: 1.2,
  },
  subtitle: {
    fontSize: '15px',
    color: palette.muted,
    margin: '0',
    lineHeight: 1.5,
  },
  formBlock: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
    marginBottom: '20px',
  },
  fieldBlock: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: 600,
    color: palette.text,
    letterSpacing: '0.04em',
  },
  emailRow: {
    display: 'flex',
    alignItems: 'stretch',
    gap: '8px',
  },
  input: {
    flex: 1,
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
  sendBtn: {
    minHeight: '48px',
    minWidth: '48px',
    padding: '12px 20px',
    background: palette.accent,
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
  },
  sendBtnDisabled: {
    background: palette.muted,
    cursor: 'not-allowed',
  },
  dividerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    margin: '20px 0',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    background: palette.border,
  },
  dividerText: {
    fontSize: '12px',
    color: palette.muted,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
  },
  oauthStack: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
    marginBottom: '20px',
  },
  oauthBtn: {
    minHeight: '48px',
    padding: '12px 16px',
    background: palette.card,
    color: palette.text,
    border: `1.5px solid ${palette.border}`,
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: 500,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
  },
  oauthBadge: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: palette.accentSoft,
    color: palette.accent,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: 700,
  },
  footerRow: {
    textAlign: 'center' as const,
    marginTop: '16px',
    fontSize: '14px',
    color: palette.muted,
  },
  footerLink: {
    color: palette.accent,
    textDecoration: 'none',
    fontWeight: 600,
  },
  errorText: {
    color: palette.error,
    fontSize: '13px',
    marginTop: '4px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  statusBanner: {
    padding: '12px 14px',
    borderRadius: '10px',
    fontSize: '14px',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    lineHeight: 1.5,
  },
  statusBannerSuccess: {
    background: palette.successSoft,
    color: palette.success,
    border: `1px solid ${palette.success}`,
  },
  statusBannerError: {
    background: palette.errorSoft,
    color: palette.error,
    border: `1px solid ${palette.error}`,
  },
  statusDot: {
    flexShrink: 0,
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    marginTop: '6px',
  },
  hintText: {
    fontSize: '12px',
    color: palette.muted,
    marginTop: '4px',
    lineHeight: 1.4,
  },
  desktopHint: {
    textAlign: 'center' as const,
    fontSize: '13px',
    color: palette.muted,
    marginTop: '20px',
  },
};

// ============================================================================
// Helper components (local to page)
// ============================================================================

function StatusBanner({
  state,
}: {
  state: SendState;
}): React.ReactElement | null {
  if (state.kind === 'idle' || state.kind === 'submitting') return null;
  if (state.kind === 'sent') {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        style={{
          ...styles.statusBanner,
          ...styles.statusBannerSuccess,
        }}
      >
        <span
          aria-hidden="true"
          style={{ ...styles.statusDot, background: palette.success }}
        />
        <span>
          <strong>Link mágico enviado.</strong> Verifique a caixa de entrada de{' '}
          <code>{state.email}</code>. O link expira em 15 minutos.
        </span>
      </div>
    );
  }
  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      style={{
        ...styles.statusBanner,
        ...styles.statusBannerError,
      }}
    >
      <span
        aria-hidden="true"
        style={{ ...styles.statusDot, background: palette.error }}
      />
      <span>{state.message}</span>
    </div>
  );
}

function OAuthButton({
  provider,
  onClick,
  disabled,
}: {
  provider: (typeof OAUTH_PROVIDERS)[number];
  onClick: () => void;
  disabled: boolean;
}): React.ReactElement {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={provider.hint}
      style={{
        ...styles.oauthBtn,
        opacity: disabled ? 0.6 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      <span aria-hidden="true" style={styles.oauthBadge}>
        {provider.symbol}
      </span>
      <span>{provider.label}</span>
    </button>
  );
}

// ============================================================================
// Main page component
// ============================================================================

export default function LoginPage(): React.ReactElement {
  const [state, setState] = React.useState<LoginFormState>({
    email: '',
    emailTouched: false,
    emailError: null,
    formError: null,
    oauthProvider: null,
  });
  const [sendState, setSendState] = React.useState<SendState>({ kind: 'idle' });
  const [isDesktop, setIsDesktop] = React.useState(false);

  // ── Responsive detection — switch from bottom-sheet to centered card ──
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia('(min-width: 720px)');
    const onChange = (): void => setIsDesktop(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return (): void => mql.removeEventListener('change', onChange);
  }, []);

  // ── Auto-focus email field on mount ──
  const emailRef = React.useRef<HTMLInputElement | null>(null);
  React.useEffect(() => {
    emailRef.current?.focus();
  }, []);

  // ── Field validation (drives aria-invalid + live errors) ──
  const validateFieldEmail = React.useCallback(
    (raw: string): string | null => {
      const issues = validateMagicLinkInput({ email: raw });
      if (issues.length === 0) return null;
      return issues[0]?.message ?? null;
    },
    [],
  );

  // ── Submit handler ──
  const handleSubmit = React.useCallback(
    async (event: React.FormEvent): Promise<void> => {
      event.preventDefault();
      const issues = validateMagicLinkInput({ email: state.email });
      if (issues.length > 0) {
        setState((s) => ({
          ...s,
          emailTouched: true,
          emailError: issues[0]?.message ?? 'Email inválido',
          formError: null,
        }));
        return;
      }
      setSendState({ kind: 'submitting' });
      try {
        const outcome: AuthOutcome = await adapter.sendMagicLink(
          toEmail(state.email),
        );
        if (outcome.kind === 'sent') {
          setSendState({
            kind: 'sent',
            email: outcome.email,
            token: outcome.token,
          });
        } else if (outcome.kind === 'auth_error') {
          setSendState({ kind: 'error', message: outcome.message });
        } else if (outcome.kind === 'network_error') {
          setSendState({ kind: 'error', message: outcome.message });
        } else {
          setSendState({ kind: 'error', message: 'Falha ao enviar o link.' });
        }
      } catch (err) {
        setSendState({
          kind: 'error',
          message:
            err instanceof Error
              ? `Erro de rede: ${err.message}`
              : 'Erro de rede desconhecido.',
        });
      }
    },
    [state.email],
  );

  const handleOAuthClick = React.useCallback(
    (provider: OAuthProvider): void => {
      setState((s) => ({ ...s, oauthProvider: provider }));
      setSendState({
        kind: 'error',
        message: `Login com ${provider} será habilitado em breve. Por ora, use o link mágico.`,
      });
    },
    [],
  );

  const onEmailChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      const value = e.target.value;
      setState((s) => {
        const next: LoginFormState = {
          ...s,
          email: value,
          emailError: s.emailTouched ? validateFieldEmail(value) : null,
          formError: null,
        };
        return next;
      });
      if (sendState.kind === 'sent' || sendState.kind === 'error') {
        setSendState({ kind: 'idle' });
      }
    },
    [validateFieldEmail, sendState.kind],
  );

  const onEmailBlur = React.useCallback((): void => {
    setState((s) => ({
      ...s,
      emailTouched: true,
      emailError: validateFieldEmail(s.email),
    }));
  }, [validateFieldEmail]);

  const emailIsValid = state.emailError === null && state.email.length > 0;
  const isSubmitting = sendState.kind === 'submitting';
  const showSuccess = sendState.kind === 'sent';
  const sentEmail = sendState.kind === 'sent' ? sendState.email : null;

  // ── Layout: bottom-sheet on mobile, centered card on desktop ──
  const card = (
    <div style={isDesktop ? styles.desktopCard : styles.card}>
      <header style={styles.headerBlock}>
        <div style={styles.brand}>Akasha Portal</div>
        <h1 style={styles.title}>Entre no seu caminho</h1>
        <p style={styles.subtitle}>
          Receba um link mágico no seu email para acessar a sua jornada
          espiritual.
        </p>
      </header>

      <StatusBanner state={sendState} />

      <form
        role="form"
        aria-label="Login por link mágico"
        noValidate
        onSubmit={handleSubmit}
        style={styles.formBlock}
      >
        <div style={styles.fieldBlock}>
          <label htmlFor="email" style={styles.label}>
            Email
          </label>
          <div style={styles.emailRow}>
            <input
              ref={emailRef}
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              spellCheck={false}
              placeholder="seu@email.com"
              value={state.email}
              onChange={onEmailChange}
              onBlur={onEmailBlur}
              disabled={isSubmitting}
              aria-invalid={state.emailTouched && state.emailError !== null}
              aria-describedby={
                state.emailError ? 'email-error' : 'email-hint'
              }
              style={{
                ...styles.input,
                borderColor:
                  state.emailTouched && state.emailError
                    ? palette.error
                    : emailIsValid
                    ? palette.success
                    : palette.border,
              }}
            />
            <button
              type="submit"
              disabled={isSubmitting || state.email.length === 0}
              aria-label="Enviar link mágico por email"
              style={{
                ...styles.sendBtn,
                ...(isSubmitting || state.email.length === 0
                  ? styles.sendBtnDisabled
                  : {}),
              }}
            >
              {isSubmitting ? 'Enviando…' : 'Enviar link'}
            </button>
          </div>
          {state.emailError ? (
            <span
              id="email-error"
              role="alert"
              style={styles.errorText}
            >
              <span aria-hidden="true">⚠</span>
              {state.emailError}
            </span>
          ) : (
            <span id="email-hint" style={styles.hintText}>
              Use o email que você cadastrou ou que pretende usar no
              cadastro.
            </span>
          )}
        </div>
      </form>

      <div style={styles.dividerRow} aria-hidden="true">
        <span style={styles.dividerLine} />
        <span style={styles.dividerText}>ou continue com</span>
        <span style={styles.dividerLine} />
      </div>

      <div role="group" aria-label="Login por provedor OAuth" style={styles.oauthStack}>
        {OAUTH_PROVIDERS.map((p) => (
          <OAuthButton
            key={p.id}
            provider={p}
            onClick={(): void => handleOAuthClick(p.id)}
            disabled={isSubmitting || showSuccess}
          />
        ))}
      </div>

      <footer style={styles.footerRow}>
        Não tem conta?{' '}
        <a
          href="/signup"
          style={styles.footerLink}
          aria-label="Ir para página de cadastro"
        >
          Cadastre-se
        </a>
      </footer>

      {sentEmail ? (
        <p style={styles.desktopHint} aria-hidden="false">
          Não recebeu? Confira a pasta de spam ou aguarde 30 segundos para
          reenviar.
        </p>
      ) : null}
    </div>
  );

  return (
    <main style={isDesktop ? styles.desktopBackdrop : styles.page}>
      {card}
    </main>
  );
}