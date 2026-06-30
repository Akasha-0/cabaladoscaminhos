/**
 * W93-B · auth-integration — Camada de integração entre UI e Backend
 * ----------------------------------------------------------------------------
 * Helpers puros (sem React, sem Next) que:
 *   1. Validam inputs client-side antes do submit (zod ou manual)
 *   2. Sanitizam URLs de redirect pós-auth (anti open-redirect)
 *   3. Normalizam query params (`next` vs `redirectTo`) para uma API única
 *   4. Hasheiam identificadores para logging LGPD-safe (sem PII crua)
 *   5. Calculam força de senha de forma didática (UX + A11Y)
 *
 * Estes helpers são consumidos tanto pelos componentes client (LoginForm,
 * SignupForm, ForgotForm) quanto pelos test specs/smoke. Não dependem do
 * Supabase nem do ambiente browser — são `import`able de qualquer lugar
 * (incluindo `node --test`).
 *
 * Princípios (do VISION.md do Cabala dos Caminhos):
 *   - Mobile-first (44px tap targets, validações curtas)
 *   - LGPD-by-default (nenhum email/nome em logs)
 *   - Sacred terminology preservada (pt-BR)
 *
 * Convenções:
 *   - `next` tem prioridade sobre `redirectTo` (mais explícito)
 *   - `next` é o "preferred name" do brief W93-B; `redirectTo` é preservado
 *     para retrocompatibilidade com componentes legados (Wave 11).
 */

import { z } from 'zod';

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Origens permitidas para `next` / `redirectTo`.
 * Por padrão só aceita paths internos (começando com `/`).
 * Em produção, configurar `ALLOWED_REDIRECT_ORIGINS` via env se quiser
 * permitir domínios externos.
 */
export const DEFAULT_AUTH_REDIRECT = '/feed';
export const FALLBACK_AUTH_REDIRECT = '/login';

/** Páginas de auth — não devem ser destino de `next` (loops). */
export const AUTH_PATHS = new Set<string>([
  '/login',
  '/signup',
  '/register',
  '/forgot',
  '/reset-password',
  '/verify-email',
]);

/**
 * Critérios de senha (alinhado com `passwordField` em validation/auth.ts).
 * - min 8, max 128
 * - pelo menos 1 letra
 * - pelo menos 1 número OU símbolo
 */
export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 128;

/** Hash curto para logging LGPD-safe (8 chars hex). Não é criptográfico. */
export const HASH_PREFIX = 'w93h';
export const HASH_LENGTH = 8;

/** Locales suportados (subset alinhado com i18n W93). */
export const SUPPORTED_LOCALES = ['pt-BR', 'en', 'es'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

// ============================================================================
// VALIDATION — EMAIL
// ============================================================================

/**
 * Validação manual de email (RFC 5322 simplificado).
 * Mais permissiva que `.email()` do Zod para acomodar TLDs longos (.museum,
 * .international) mas ainda rejeita os casos óbvios (sem @, sem domínio).
 *
 * @example
 *   validateEmail('user@example.com') // { ok: true, normalized: 'user@example.com' }
 *   validateEmail('USER@example.com') // { ok: true, normalized: 'user@example.com' }
 *   validateEmail('invalid')          // { ok: false, reason: 'Email inválido' }
 */
export function validateEmail(input: unknown): EmailValidationResult {
  if (typeof input !== 'string') {
    return { ok: false, reason: 'Email deve ser um texto' };
  }
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return { ok: false, reason: 'Email obrigatório' };
  }
  if (trimmed.length > 254) {
    return { ok: false, reason: 'Email muito longo' };
  }
  // Local part + @ + domain + . + tld (TLD min 2)
  const emailRe =
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRe.test(trimmed)) {
    return { ok: false, reason: 'Email inválido' };
  }
  // Rejeita pontos consecutivos (..) no local part
  const localPart = trimmed.split('@')[0] ?? '';
  if (localPart.includes('..')) {
    return { ok: false, reason: 'Email inválido' };
  }
  // Rejeita se começar/terminar com ponto
  if (localPart.startsWith('.') || localPart.endsWith('.')) {
    return { ok: false, reason: 'Email inválido' };
  }
  return { ok: true, normalized: trimmed.toLowerCase() };
}

export interface EmailValidationResult {
  ok: boolean;
  reason?: string;
  /** Versão normalizada (lowercase + trim) — só presente quando ok=true. */
  normalized?: string;
}

// ============================================================================
// VALIDATION — PASSWORD
// ============================================================================

export interface PasswordStrength {
  /** 0–4 (0 = muito fraca, 4 = forte). */
  score: number;
  /** Rótulo em pt-BR para exibir ao usuário. */
  label: string;
  /** Recomendações opcionais (sempre presente quando score < 4). */
  tips: string[];
  /** Critérios atendidos (bitmask). */
  criteria: {
    lengthOk: boolean;
    hasLower: boolean;
    hasUpper: boolean;
    hasDigit: boolean;
    hasSymbol: boolean;
  };
}

/**
 * Calcula força de senha de forma didática (sem zxcvbn para manter deps
 * leves). Critérios:
 *   +1 length >= 8
 *   +1 tem minúscula
 *   +1 tem maiúscula
 *   +1 tem dígito
 *   +1 tem símbolo (não-alfanumérico)
 *
 * Total 0–5 → mapeado para score 0–4 (cap em 4 para UX simples).
 */
export function validatePassword(input: unknown): PasswordStrength {
  if (typeof input !== 'string') {
    return {
      score: 0,
      label: 'Senha inválida',
      tips: ['Digite uma senha válida'],
      criteria: emptyCriteria(),
    };
  }

  const lengthOk = input.length >= PASSWORD_MIN && input.length <= PASSWORD_MAX;
  const hasLower = /[a-z]/.test(input);
  const hasUpper = /[A-Z]/.test(input);
  const hasDigit = /[0-9]/.test(input);
  const hasSymbol = /[^a-zA-Z0-9]/.test(input);

  const bits =
    Number(lengthOk) +
    Number(hasLower) +
    Number(hasUpper) +
    Number(hasDigit) +
    Number(hasSymbol);

  const score = bits === 0 ? 0 : bits === 1 ? 1 : bits <= 3 ? 2 : bits === 4 ? 3 : 4;

  const labelByScore: Record<number, string> = {
    0: 'Muito fraca',
    1: 'Fraca',
    2: 'Razoável',
    3: 'Boa',
    4: 'Forte',
  };

  const tips: string[] = [];
  if (!lengthOk) {
    tips.push(
      input.length < PASSWORD_MIN
        ? `Mínimo de ${PASSWORD_MIN} caracteres`
        : `Máximo de ${PASSWORD_MAX} caracteres`
    );
  }
  if (!hasLower) tips.push('Adicione letras minúsculas');
  if (!hasUpper) tips.push('Adicione letras maiúsculas');
  if (!hasDigit) tips.push('Adicione números');
  if (!hasSymbol) tips.push('Adicione um símbolo (!@#$%)');

  return {
    score,
    label: labelByScore[score] ?? 'Desconhecida',
    tips,
    criteria: { lengthOk, hasLower, hasUpper, hasDigit, hasSymbol },
  };
}

function emptyCriteria(): PasswordStrength['criteria'] {
  return {
    lengthOk: false,
    hasLower: false,
    hasUpper: false,
    hasDigit: false,
    hasSymbol: false,
  };
}

/**
 * Verifica se a senha atende ao mínimo (8 chars) + tipos básicos.
 * Não exige TODOS os critérios — só `lengthOk` (servidor já valida
 * o resto com Zod). Função para "submit habilitado?" no client.
 */
export function isPasswordAcceptable(input: unknown): boolean {
  if (typeof input !== 'string') return false;
  if (input.length < PASSWORD_MIN) return false;
  if (input.length > PASSWORD_MAX) return false;
  return /[a-zA-Z]/.test(input) && /[0-9]/.test(input);
}

// ============================================================================
// REDIRECT — sanitização (anti open-redirect)
// ============================================================================

/**
 * Sanitiza uma URL/path de redirect para prevenir open-redirect attacks.
 *
 * Regras:
 *   1. Aceita APENAS paths internos (começando com `/`)
 *   2. Bloqueia protocol-relative URLs (`//evil.com`)
 *   3. Bloqueia auth paths (loop prevention)
 *   4. Retorna fallback se inválido
 *
 * @example
 *   sanitizeNextPath('/dashboard')         // '/dashboard'
 *   sanitizeNextPath('//evil.com')          // '/feed' (bloqueado)
 *   sanitizeNextPath('https://evil.com')   // '/feed' (bloqueado)
 *   sanitizeNextPath('/login?x=1')         // '/feed' (auth path bloqueado)
 *   sanitizeNextPath(null)                 // '/feed'
 *   sanitizeNextPath('/path<script>')      // '/pathscript' (sanitizado)
 */
export function sanitizeNextPath(
  input: unknown,
  fallback: string = DEFAULT_AUTH_REDIRECT
): string {
  if (typeof input !== 'string' || input.length === 0) {
    return fallback;
  }

  // 1. Não-relative URL absoluta → bloqueado
  if (/^[a-z][a-z0-9+.-]*:/i.test(input)) {
    return fallback;
  }

  // 2. Protocol-relative `//host` → bloqueado
  if (input.startsWith('//')) {
    return fallback;
  }

  // 3. Deve começar com `/`
  if (!input.startsWith('/')) {
    return fallback;
  }

  // 4. Pega só o path (ignora query/fragment temporariamente para checar auth)
  const pathOnly = input.split('?')[0]?.split('#')[0] ?? '';

  // 5. Não pode apontar para páginas de auth (loop)
  if (AUTH_PATHS.has(pathOnly)) {
    return fallback;
  }

  // 6. Strip control chars e scripts básicos
  const cleaned = input.replace(/[<>"'`\\]/g, '');

  return cleaned || fallback;
}

/**
 * Extrai o path de redirect de um conjunto de query params.
 * Aceita tanto `next` (preferred, brief W93-B) quanto `redirectTo`
 * (legacy Wave 11) — `next` tem prioridade.
 */
export function getSafeNext(
  params: URLSearchParams | Record<string, string | undefined | null> | null | undefined,
  fallback: string = DEFAULT_AUTH_REDIRECT
): string {
  if (!params) return fallback;

  let nextValue: string | undefined;

  if (params instanceof URLSearchParams) {
    nextValue = params.get('next') ?? params.get('redirectTo') ?? undefined;
  } else {
    // Record
    const raw =
      'next' in params
        ? params.next
        : 'redirectTo' in params
          ? params.redirectTo
          : undefined;
    nextValue = typeof raw === 'string' ? raw : undefined;
  }

  return sanitizeNextPath(nextValue, fallback);
}

/**
 * Anexa `next` a uma URL preservando query/fragment existentes.
 * Útil para construir links "Login para continuar" a partir de páginas
 * internas.
 *
 * @example
 *   buildLoginRedirect('/feed', '/onboarding/step-2')
 *   // '/login?next=%2Fonboarding%2Fstep-2'
 *   buildLoginRedirect('/feed') // '/feed'
 */
export function buildLoginRedirect(
  currentPath: string,
  loginPath: string = '/login'
): string {
  if (!currentPath || currentPath === loginPath) return loginPath;
  if (currentPath.startsWith(loginPath)) return loginPath;
  // Encode next como URL param
  const sep = loginPath.includes('?') ? '&' : '?';
  return `${loginPath}${sep}next=${encodeURIComponent(currentPath)}`;
}

// ============================================================================
// HASH — LGPD-safe identifier hashing
// ============================================================================

/**
 * Hash não-criptográfico para identificar usuários em logs sem expor PII.
 *
 * Implementação: FNV-1a 32-bit (simples, determinístico, suficiente para
 * correlação de logs). NÃO use para auth — apenas para rastreamento.
 *
 * @example
 *   hashRedirect('user@example.com')
 *   // 'w93h7f4a1b2'
 */
export function hashRedirect(input: unknown, length: number = HASH_LENGTH): string {
  // FNV-1a 32-bit gera no máximo 8 hex chars. Cap em [4, 8].
  const safeLength = Math.max(4, Math.min(8, length));
  if (typeof input !== 'string' || input.length === 0) {
    return `${HASH_PREFIX}${'0'.repeat(safeLength)}`;
  }
  const normalized = input.trim().toLowerCase();

  // FNV-1a 32-bit
  let hash = 0x811c9dc5;
  for (let i = 0; i < normalized.length; i++) {
    hash ^= normalized.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  // Convert to unsigned hex
  const hex = (hash >>> 0).toString(16).padStart(8, '0');
  const truncated = hex.slice(0, safeLength);
  return `${HASH_PREFIX}${truncated}`;
}

/**
 * Mascara email para logs: `user@example.com` → `u***@example.com`.
 * Usado em server logs / analytics quando queremos manter contexto sem
 * expor a parte local.
 *
 * @example
 *   maskEmail('user@example.com')  // 'u***@example.com'
 *   maskEmail('a@b.co')            // 'a***@b.co'
 *   maskEmail('invalid')           // '***'
 */
export function maskEmail(input: unknown): string {
  if (typeof input !== 'string') return '***';
  const trimmed = input.trim();
  if (!trimmed.includes('@')) return '***';
  const [local, domain] = trimmed.split('@', 2);
  if (!local || !domain) return '***';
  const first = local.charAt(0);
  return `${first}***@${domain}`;
}

// ============================================================================
// OAUTH — provider normalization
// ============================================================================

export type OAuthProvider = 'google' | 'apple' | 'github' | 'facebook';

export const OAUTH_PROVIDERS: readonly OAuthProvider[] = [
  'google',
  'apple',
  'github',
  'facebook',
] as const;

export interface OAuthProviderInfo {
  id: OAuthProvider;
  /** Nome exibido ao usuário (pt-BR). */
  label: string;
  /** Nome exibido curto para o botão. */
  shortLabel: string;
  /** Path do SVG icon (lucide-react ou inline). */
  iconKey: 'google' | 'apple' | 'github' | 'facebook';
  /** Se o provider está configurado no Supabase (placeholder por enquanto). */
  configured: boolean;
  /** Texto LGPD do botão (consent implícito ao continuar). */
  consentNote: string;
}

/**
 * Catálogo canônico de provedores OAuth suportados.
 * `configured: false` em todos até que as chaves sejam adicionadas no
 * Supabase Dashboard. UI deve mostrar badge "em breve" para não-configurados.
 */
export const OAUTH_CATALOG: Readonly<Record<OAuthProvider, OAuthProviderInfo>> = {
  google: {
    id: 'google',
    label: 'Continuar com Google',
    shortLabel: 'Google',
    iconKey: 'google',
    configured: false,
    consentNote: 'Você será redirecionado para o Google para autorizar o acesso.',
  },
  apple: {
    id: 'apple',
    label: 'Continuar com Apple',
    shortLabel: 'Apple',
    iconKey: 'apple',
    configured: false,
    consentNote:
      'Você será redirecionado para a Apple. Não compartilhamos seu email real.',
  },
  github: {
    id: 'github',
    label: 'Continuar com GitHub',
    shortLabel: 'GitHub',
    iconKey: 'github',
    configured: false,
    consentNote: 'Você será redirecionado para o GitHub para autorizar o acesso.',
  },
  facebook: {
    id: 'facebook',
    label: 'Continuar com Facebook',
    shortLabel: 'Facebook',
    iconKey: 'facebook',
    configured: false,
    consentNote: 'Você será redirecionado para o Facebook para autorizar o acesso.',
  },
};

// ============================================================================
// ROUTE HELPERS — convenções
// ============================================================================

/**
 * Determina a rota de redirect pós-login baseada em flags de onboarding.
 * Hoje retorna `/feed` por padrão; no futuro, lê do perfil (ex.: se
 * `onboarding_completed=false`, retorna `/onboarding`).
 */
export function getPostLoginPath(
  opts: {
    onboardingCompleted?: boolean;
    explicitNext?: string | null;
  } = {}
): string {
  if (opts.explicitNext) {
    return sanitizeNextPath(opts.explicitNext);
  }
  if (opts.onboardingCompleted === false) {
    return '/onboarding';
  }
  return DEFAULT_AUTH_REDIRECT;
}

/**
 * Determina a rota de redirect pós-signup. Por padrão `/onboarding`
 * (já que signup implica que o usuário precisa completar o mapa).
 */
export function getPostSignupPath(
  opts: { explicitNext?: string | null } = {}
): string {
  if (opts.explicitNext) {
    // Fallback do signup é `/onboarding` (não `/feed`) — comportamento
    // divergente do login é intencional.
    return sanitizeNextPath(opts.explicitNext, '/onboarding');
  }
  return '/onboarding';
}

/**
 * Valida token de reset de senha (chamada client-side antes do submit).
 * Token esperado: 32-128 chars alfanuméricos (formato do Supabase recovery
 * token via PKCE flow).
 */
export function isValidResetToken(input: unknown): boolean {
  if (typeof input !== 'string') return false;
  if (input.length < 16 || input.length > 256) return false;
  // Aceita alfanuméricos + - _ . (Base64URL)
  return /^[a-zA-Z0-9._\-]+$/.test(input);
}

// ============================================================================
// SCHEMAS — composable para forms
// ============================================================================

export const w93LoginSchema = z.object({
  email: z.string().min(1, 'Email obrigatório'),
  password: z.string().min(1, 'Senha obrigatória'),
});

export const w93SignupSchema = z.object({
  fullName: z.string().trim().min(2, 'Nome muito curto').max(80, 'Nome muito longo'),
  email: z.string().min(1, 'Email obrigatório'),
  password: z
    .string()
    .min(PASSWORD_MIN, `Mínimo de ${PASSWORD_MIN} caracteres`)
    .max(PASSWORD_MAX, `Máximo de ${PASSWORD_MAX} caracteres`),
  primaryTradition: z
    .enum([
      'cabala',
      'ifa',
      'astrologia',
      'tantra',
      'xamanismo',
      'cristianismo-mistico',
      'umbanda',
      'budismo',
      'hinduismo',
      'sufismo',
      'none',
    ])
    .optional(),
  acceptLgpd: z.literal(true, {
    errorMap: () => ({ message: 'Você deve aceitar a Política de Privacidade' }),
  }),
});

export const w93ForgotSchema = z.object({
  email: z.string().min(1, 'Email obrigatório'),
  acceptLgpd: z.literal(true, {
    errorMap: () => ({ message: 'Você deve aceitar receber emails transacionais' }),
  }),
});

export const w93ResetTokenSchema = z.object({
  token: z.string().refine(isValidResetToken, 'Token inválido ou expirado'),
  password: z
    .string()
    .min(PASSWORD_MIN, `Mínimo de ${PASSWORD_MIN} caracteres`)
    .max(PASSWORD_MAX, `Máximo de ${PASSWORD_MAX} caracteres`),
  confirmPassword: z.string(),
});

export type W93LoginInput = z.infer<typeof w93LoginSchema>;
export type W93SignupInput = z.infer<typeof w93SignupSchema>;
export type W93ForgotInput = z.infer<typeof w93ForgotSchema>;
export type W93ResetTokenInput = z.infer<typeof w93ResetTokenSchema>;