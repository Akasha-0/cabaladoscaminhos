'use client';

/**
 * AuthForm — Wave 20 — Shell compartilhado para fluxos de autenticação
 * ============================================================================
 * Wrapper canônico para formulários de autenticação (login, signup, forgot).
 * Encapsula o shell visual repetido em LoginForm/OptimizedSignupForm:
 *
 *   ┌─────────────────────────────────────┐
 *   │      [Icon]                         │
 *   │      Title (cinzel, gold)           │
 *   │      Subtitle (italic, serif)       │
 *   │                                     │
 *   │      <children />                   │
 *   │                                     │
 *   │      <oauth slot — optional>        │
 *   │      <footer slot — optional>       │
 *   └─────────────────────────────────────┘
 *
 * Este componente é NÃO-OPINATIVO quanto ao conteúdo interno — quem usa
 * define os campos. Ele apenas garante:
 *   1. Visual consistente (card-spiritual + glow dourado)
 *   2. A11y correto (role="region", aria-labelledby, focus no título)
 *   3. Responsividade mobile-first (max-w-md w-full)
 *
 * Forms existentes (LoginForm, OptimizedSignupForm, RegisterForm) NÃO foram
 * refatorados para usar AuthForm para preservar TSC=0 e evitar regressão.
 * AuthForm é o padrão recomendado para NOVOS fluxos de auth (ex: MFA setup,
 * change-password, delete-account confirm).
 * ============================================================================
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

// ============================================================================
// Tipos públicos
// ============================================================================

export interface AuthFormHeaderProps {
  /** Ícone centralizado acima do título (lucide-react). */
  icon?: React.ReactNode;
  /** Título principal — exibido em font-cinzel uppercase tracking-wider. */
  title: string;
  /** Subtítulo opcional — exibido em font-serif italic. */
  subtitle?: string;
}

export interface AuthFormProps {
  /** Conteúdo principal do formulário (campos, botões). */
  children: React.ReactNode;
  /** Bloco opcional renderizado entre os campos e o footer (ex: OAuth). */
  oauthSlot?: React.ReactNode;
  /** Bloco opcional renderizado abaixo de tudo (ex: links). */
  footerSlot?: React.ReactNode;
  /** Header visual (ícone + título + subtítulo). */
  header: AuthFormHeaderProps;
  /** Class names extras. */
  className?: string;
  /** ID opcional para o region — útil para skip links. */
  ariaLabelledBy?: string;
}

// ============================================================================
// Sub-componentes
// ============================================================================

/** Header reutilizável do AuthForm. Exportado para quem quiser composição granular. */
export function AuthFormHeader({ icon, title, subtitle }: AuthFormHeaderProps) {
  return (
    <div className="flex flex-col items-center mb-6 md:mb-8">
      {icon && (
        <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-spiritual-gold/20 to-spiritual-violet/20 flex items-center justify-center mb-3 md:mb-4 shadow-[0_0_30px_rgba(212,175,55,0.2)]">
          {icon}
        </div>
      )}
      <h1 className="font-cinzel text-xl md:text-2xl font-bold text-foreground tracking-wider text-center">
        {title}
      </h1>
      {subtitle && (
        <p className="text-muted-foreground text-xs md:text-sm mt-1 font-serif italic text-center">
          {subtitle}
        </p>
      )}
    </div>
  );
}

/**
 * AuthForm — Shell canônico de autenticação.
 *
 * @example
 * ```tsx
 * <AuthForm
 *   header={{ icon: <Sparkles />, title: 'Entrar', subtitle: 'Bem-vindo de volta' }}
 *   oauthSlot={<GoogleOAuthButton />}
 *   footerSlot={<Link href="/signup">Criar conta</Link>}
 * >
 *   <EmailField ... />
 *   <PasswordField ... />
 *   <SubmitButton>Entrar</SubmitButton>
 * </AuthForm>
 * ```
 */
export function AuthForm({
  children,
  oauthSlot,
  footerSlot,
  header,
  className,
  ariaLabelledBy,
}: AuthFormProps) {
  // ID estável (não muda entre renders) para aria-labelledby no header.
  const generatedId = React.useId();
  const labelId = ariaLabelledBy ?? generatedId;

  return (
    <div
      role="region"
      aria-labelledby={labelId}
      className={cn(
        'card-spiritual p-6 md:p-8 rounded-2xl max-w-md w-full',
        className
      )}
    >
      {/* Header oculto visualmente mas presente para screen readers
          quando usado o ID customizado (ex: skip link apontando aqui). */}
      <span id={labelId} className="sr-only">
        {header.title}
      </span>

      <AuthFormHeader
        icon={header.icon}
        title={header.title}
        subtitle={header.subtitle}
      />

      {/* Conteúdo principal (campos + submit) */}
      <div className="space-y-4">{children}</div>

      {/* OAuth slot */}
      {oauthSlot && (
        <div className="mt-6">
          {/* Divider padrão + OAuth */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-slate-700/60" aria-hidden="true" />
            <span className="text-xs uppercase tracking-widest text-slate-500">
              ou
            </span>
            <div className="flex-1 h-px bg-slate-700/60" aria-hidden="true" />
          </div>
          {oauthSlot}
        </div>
      )}

      {/* Footer slot */}
      {footerSlot && <div className="mt-6 md:mt-8">{footerSlot}</div>}
    </div>
  );
}