// ============================================================================
// TRIAL MANAGEMENT — 14-day trial + reminders + auto-downgrade
// ============================================================================
// Wave 37 (2026-07-01). Lógica de trial period para PRO tier.
//
// FLUXO:
//   1) User clica "Começar trial 14 dias" no /billing/upgrade
//   2) Backend cria Subscription { tier=PRO, status=TRIAL, trialEndsAt=D+14 }
//   3) Stripe Checkout (com trial_period_days=14) → user insere cartão
//   4) Stripe autoriza (não cobra); subscription fica 'trialing' por 14d
//   5) Day 11 (D-3): email reminder "Seu trial acaba em 3 dias"
//   6) Day 13 (D-1): email reminder "Último dia!"
//   7) Day 14 (D+0): Stripe tenta cobrar cartão
//      - sucesso → subscription.status='active', tier='PRO' mantido
//      - falha → subscription.status='past_due', retry por 7d
//   8) Day 14 + 7 (D+7, retry exhausted):
//      - cron downgrade: tier='FREE', status='EXPIRED'
//      - email "Trial encerrado — atualize para reativar"
//
// LGPD: reminders por email precisam consent (Art. 7º). Capturamos
// `marketingOptIn` no signup (já existe no /onboarding).
//
// LGPD Art. 18, §5: user pode cancelar trial a qualquer momento sem custo.
// ============================================================================

import { TRIAL_CONFIG } from './tiers';

// ============================================================================
// TYPES
// ============================================================================

export interface TrialState {
  inTrial: boolean;
  trialEndsAt: Date | null;
  daysRemaining: number;
  hoursRemaining: number;
  remindersSent: { d3: boolean; d1: boolean };
  willExpireSoon: boolean; // < 3 days
  expired: boolean; // > trialEndsAt
}

export type TrialReminderKind = 'd3' | 'd1' | 'expired';

export interface TrialReminder {
  kind: TrialReminderKind;
  userId: string;
  email: string;
  name?: string;
  trialEndsAt: Date;
  daysRemaining: number;
}

// ============================================================================
// STATE COMPUTATION
// ============================================================================

/**
 * Calcula estado atual do trial baseado em trialEndsAt + reminder flags.
 * Pure function — sem side-effects.
 */
export function computeTrialState(params: {
  trialEndsAt: Date | null;
  status: string;
  reminderD3: boolean;
  reminderD1: boolean;
  now?: Date;
}): TrialState {
  const now = params.now ?? new Date();
  const ends = params.trialEndsAt;
  const inTrial = !!ends && ends > now && params.status === 'TRIAL';
  const expired = !!ends && ends <= now;

  if (!ends) {
    return {
      inTrial: false,
      trialEndsAt: null,
      daysRemaining: 0,
      hoursRemaining: 0,
      remindersSent: { d3: params.reminderD3, d1: params.reminderD1 },
      willExpireSoon: false,
      expired: false,
    };
  }

  const ms = ends.getTime() - now.getTime();
  const daysRemaining = Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)));
  const hoursRemaining = Math.max(0, Math.ceil(ms / (60 * 60 * 1000)));

  return {
    inTrial,
    trialEndsAt: ends,
    daysRemaining,
    hoursRemaining,
    remindersSent: { d3: params.reminderD3, d1: params.reminderD1 },
    willExpireSoon: inTrial && daysRemaining <= 3,
    expired,
  };
}

/**
 * Quais reminders devem ser enviados AGORA?
 *   - D-3: now ∈ [trialEndsAt - 3d, trialEndsAt - 2d)
 *   - D-1: now ∈ [trialEndsAt - 1d, trialEndsAt)
 *   - D+0 expired: agora > trialEndsAt e não enviado
 *
 * Idempotente: caller checa reminderSentD3 / reminderSentD1 antes de chamar.
 */
export function shouldSendReminder(params: {
  trialEndsAt: Date | null;
  status: string;
  reminderD3: boolean;
  reminderD1: boolean;
  now?: Date;
}): TrialReminderKind | null {
  const now = params.now ?? new Date();
  if (!params.trialEndsAt) return null;
  if (params.status !== 'TRIAL') return null;

  const ends = params.trialEndsAt.getTime();
  const ms = ends - now.getTime();
  const daysRemaining = Math.ceil(ms / (24 * 60 * 60 * 1000));

  // D-3: 3 days remaining, não enviado
  if (daysRemaining === 3 && !params.reminderD3) return 'd3';

  // D-1: 1 day remaining (or 0 — último dia), não enviado
  if (daysRemaining <= 1 && daysRemaining >= 0 && !params.reminderD1) return 'd1';

  return null;
}

/**
 * Texto do reminder (PT-BR).
 */
export function renderReminderText(reminder: TrialReminder): {
  subject: string;
  bodyHtml: string;
  bodyText: string;
} {
  const dayWord = reminder.daysRemaining === 1 ? 'dia' : 'dias';
  const greeting = reminder.name ? `Olá, ${reminder.name}` : 'Olá';

  if (reminder.kind === 'd3') {
    const subject = `Seu trial Pro acaba em 3 dias — garanta seu lugar`;
    const bodyText = `${greeting},

Seu trial Pro da Akasha acaba em 3 ${dayWord} (${reminder.trialEndsAt.toLocaleDateString('pt-BR')}).

Após o trial, você volta automaticamente para o plano Free. Para manter:
- 200 conversas Akasha IA por mês
- 10 mapas Oráculo
- 4 sessões de mentoria incluídas
- Marketplace + grupos ilimitados

Acesse: https://akasha.app/billing

Com carinho,
Time Akasha`;

    const bodyHtml = `<p>${greeting},</p>
<p>Seu <strong>trial Pro</strong> da Akasha acaba em <strong>3 dias</strong> (${reminder.trialEndsAt.toLocaleDateString('pt-BR')}).</p>
<p>Após o trial, você volta automaticamente para o plano Free. Para manter os benefícios Pro:</p>
<ul>
  <li>200 conversas Akasha IA por mês</li>
  <li>10 mapas Oráculo</li>
  <li>4 sessões de mentoria incluídas</li>
  <li>Marketplace + grupos ilimitados</li>
</ul>
<p><a href="https://akasha.app/billing">Gerenciar assinatura</a></p>
<p>Com carinho,<br/>Time Akasha</p>`;

    return { subject, bodyHtml, bodyText };
  }

  // d1
  const subject = `Último dia do seu trial Pro`;
  const bodyText = `${greeting},

Hoje é o último dia do seu trial Pro. A partir de amanhã, se não houver ação, sua conta volta ao plano Free.

Renove agora: https://akasha.app/billing

Com carinho,
Time Akasha`;

  const bodyHtml = `<p>${greeting},</p>
<p>Hoje é o <strong>último dia</strong> do seu trial Pro. A partir de amanhã, se não houver ação, sua conta volta ao plano Free.</p>
<p><a href="https://akasha.app/billing"><strong>Renovar agora</strong></a></p>
<p>Com carinho,<br/>Time Akasha</p>`;

  return { subject, bodyHtml, bodyText };
}

/**
 * Auto-downgrade: chamado pelo cron quando trial expira sem conversão.
 * Retorna decisão (não side-effects). Aplicação é responsabilidade do caller.
 */
export function shouldAutoDowngrade(params: {
  trialEndsAt: Date | null;
  status: string;
  stripeSubscriptionId: string | null;
  now?: Date;
}): boolean {
  const now = params.now ?? new Date();
  if (!params.trialEndsAt) return false;
  if (params.status !== 'TRIAL') return false;
  if (!params.stripeSubscriptionId) {
    // Sem Stripe sub = trial orgânico (legado). Downgrade direto.
    return params.trialEndsAt <= now;
  }
  // Com Stripe sub, downgrade só após período de retry (7 dias).
  const retryDeadline = new Date(params.trialEndsAt);
  retryDeadline.setUTCDate(retryDeadline.getUTCDate() + 7);
  return now >= retryDeadline;
}

/**
 * Cron-friendly: lista subscriptions em trial expirado para batch processing.
 * (Implementação real itera DB; aqui só lógica.)
 */
export interface ExpiredTrialRow {
  userId: string;
  trialEndsAt: Date;
  stripeSubscriptionId: string | null;
  ageDays: number; // dias desde expiração
}

export function classifyExpiredTrial(
  trialEndsAt: Date,
  now: Date = new Date()
): { state: 'grace_period' | 'finalize' | 'noop'; ageDays: number } {
  const ageMs = now.getTime() - trialEndsAt.getTime();
  const ageDays = Math.floor(ageMs / (24 * 60 * 60 * 1000));

  if (ageDays <= 7) return { state: 'grace_period', ageDays };
  if (ageDays <= 30) return { state: 'finalize', ageDays };
  return { state: 'noop', ageDays };
}

// ============================================================================
// EXPORTS
// ============================================================================

export const Trial = {
  computeTrialState,
  shouldSendReminder,
  renderReminderText,
  shouldAutoDowngrade,
  classifyExpiredTrial,
  CONFIG: TRIAL_CONFIG,
};

export default Trial;