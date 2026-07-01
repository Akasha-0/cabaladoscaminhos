// ============================================================================
// ONBOARDING STATE MACHINE — Wave 35 (Beta First-Run Experience)
// ============================================================================
// Camada de domínio pura: define os estados válidos, transições, eventos
// canônicos e regras de skip. **Sem efeitos colaterais** — apenas funções
// determinísticas que recebem um estado e devolvem o próximo.
//
// Por que isolada?
//   - Testável sem DB / Next.js / React (regras puras).
//   - Reutilizável tanto pela API route (`/api/onboarding/state`) quanto
//     pelo client (welcome/profile/first-action pages) para checar `canSkip`,
//     `nextState`, etc.
//   - Permite trocar persistência (localStorage vs DB) sem mudar a lógica.
//
// Diagrama:
//   INVITED ──accept_invite──> SIGNED_UP
//   SIGNED_UP ──welcome_view──> PROFILE_SETUP (skip-welcome → SIGNED_UP)
//   PROFILE_SETUP ──profile_save──> TRADITION_CHOSEN
//   TRADITION_CHOSEN ──cta_first──> FIRST_ACTION
//   FIRST_ACTION ──action_done──> ONBOARDED
//   qualquer-estado-ativo ──skip_all──> SKIPPED
//   qualquer-estado-ativo ──14d_inativo──> DROPPED (cron rotula)
//
// LGPD: transições que tocam dados sensíveis (LGPD refresh, email prefs)
// devem gerar evento OnboardingEvent — esta lib emite `stateBefore`/`stateAfter`
// para a API persistir no log append-only.
// ============================================================================

import type { OnboardingState } from '@prisma/client';

// ============================================================================
// Tipos públicos
// ============================================================================

/** Eventos disparados pela UI (carrossel welcome, profile save, etc). */
export type OnboardingTransition =
  | 'invite_accepted' // convite consumido — INVITED → SIGNED_UP
  | 'welcome_viewed' // carrossel welcome aberto — SIGNED_UP → PROFILE_SETUP
  | 'welcome_completed' // carrossel chegou no fim
  | 'welcome_skipped' // pulou a partir de um step intermediário
  | 'profile_completed' // profile wizard salvo — PROFILE_SETUP → TRADITION_CHOSEN
  | 'tradition_selected' // user escolheu preferred tradição
  | 'first_action_started' // clicou em CTA do first-actions
  | 'first_action_completed' // completou a ação (post, chat, mapa, etc)
  | 'tour_completed' // tour 7-step concluído
  | 'tour_skipped' // pulou o tour
  | 'onboarding_skipped_all' // skip-all persistente (nunca mais mostra)
  | 'reminder_sent' // cron enviou reminder email
  | 'milestone_reached' // marco de progresso (50%, 100%)
  | 'no_op'; // evento sem mudança de estado (ex: campo editado)

/** Contexto passado para a função `transition()`. */
export interface TransitionContext {
  /** ID do usuário — apenas para logging/tracing, não persistido aqui. */
  userId?: string;
  /** Step atual do carrossel welcome (0..3). Para retomar cross-device. */
  welcomeStep?: number;
  /** Metadata técnico (sem PII). */
  metadata?: Record<string, unknown>;
  /** Variant A/B (null = controle). */
  abVariant?: string | null;
  /** Dispositivo (best-effort). */
  device?: string;
}

/** Resultado da transição: novo estado + info para UI/persistência. */
export interface TransitionResult {
  state: OnboardingState;
  /** Se houve mudança de estado (false = no-op). */
  changed: boolean;
  /** Step do welcome carousel (0..3) — persistir junto. */
  welcomeStep: number;
  /** Label human-readable para UI. */
  label: string;
  /** Próximo passo sugerido (URL relativa ou null se terminal). */
  nextRoute: string | null;
}

// ============================================================================
// Constantes — fonte única de verdade
// ============================================================================

/** Ordem canônica dos estados (progressão linear, exceto SKIPPED/DROPPED). */
export const STATE_ORDER: readonly OnboardingState[] = [
  'INVITED',
  'SIGNED_UP',
  'PROFILE_SETUP',
  'TRADITION_CHOSEN',
  'FIRST_ACTION',
  'ONBOARDED',
] as const;

/** Steps do carrossel welcome (4 telas). */
export const WELCOME_STEPS = [
  { id: 0, slug: 'mission', title: 'Bem-vindo(a)' },
  { id: 1, slug: 'traditions', title: '7 tradições' },
  { id: 2, slug: 'features', title: 'Recursos' },
  { id: 3, slug: 'community', title: 'Comunidade' },
] as const;

/** 5 first-action CTAs — Wave 35 spec. */
export const FIRST_ACTIONS = [
  {
    id: 'first-post',
    title: 'Faça seu primeiro post',
    description: 'Compartilhe uma reflexão, dúvida ou achado espiritual.',
    href: '/feed?compose=1',
    icon: 'PenLine',
    estimatedMinutes: 2,
  },
  {
    id: 'akasha-chat',
    title: 'Converse com Akasha',
    description: 'Pergunte à nossa IA sobre sua jornada, símbolos ou tradições.',
    href: '/akashic-chat?welcome=1',
    icon: 'Sparkles',
    estimatedMinutes: 3,
  },
  {
    id: 'explore-mapa',
    title: 'Explore seu mapa astral',
    description: 'Veja os insights já gerados a partir do seu nascimento.',
    href: '/me?tab=mapa',
    icon: 'Compass',
    estimatedMinutes: 2,
  },
  {
    id: 'read-article',
    title: 'Leia um artigo',
    description: 'Comece pela curadoria da semana — temas que combinam com você.',
    href: '/library?welcome=1',
    icon: 'BookOpen',
    estimatedMinutes: 4,
  },
  {
    id: 'find-mentor',
    title: 'Encontre seu mentor',
    description: 'Conecte-se com praticantes experientes da sua tradição.',
    href: '/mentorship?welcome=1',
    icon: 'Users',
    estimatedMinutes: 3,
  },
] as const;

/** Categorias de notificação por email (5 booleanas). */
export const EMAIL_PREF_CATEGORIES = [
  {
    key: 'emailPrefsNewContent',
    label: 'Conteúdo novo',
    description: 'Artigos, podcasts e vídeos curados para você.',
  },
  {
    key: 'emailPrefsCommunity',
    label: 'Comunidade',
    description: 'Menções, replies e atividades em grupos que você segue.',
  },
  {
    key: 'emailPrefsMentorship',
    label: 'Mentoria',
    description: 'Convites de mentoria, sessões agendadas e mensagens.',
  },
  {
    key: 'emailPrefsMarketing',
    label: 'Novidades do portal',
    description: 'Lançamentos, recursos novos e promoções.',
  },
  {
    key: 'emailPrefsNpsSurveys',
    label: 'Pesquisas NPS',
    description: 'Convite para avaliar sua experiência (1x a cada 30 dias).',
  },
] as const;

/** Categorias de prática preferida (multi-select). */
export const PRACTICE_PREFERENCES = [
  { value: 'meditation', label: 'Meditação' },
  { value: 'prayer', label: 'Oração' },
  { value: 'ritual', label: 'Ritual' },
  { value: 'study', label: 'Estudo' },
  { value: 'journaling', label: 'Journaling' },
  { value: 'yoga', label: 'Yoga' },
  { value: 'breathwork', label: 'Respiração' },
  { value: 'divination', label: 'Divinação' },
] as const;

// ============================================================================
// Função principal — transition()
// ============================================================================

/**
 * Calcula o próximo estado dado o estado atual + evento disparado.
 *
 * Determinística e pura. Não toca DB / localStorage / rede.
 *
 * @param current Estado atual persistido (lido do DB).
 * @param event   Evento disparado pela UI.
 * @param ctx     Contexto adicional (welcomeStep, etc).
 * @returns Novo estado + flag `changed` + `nextRoute` para UI navegar.
 */
export function transition(
  current: OnboardingState,
  event: OnboardingTransition,
  ctx: TransitionContext = {}
): TransitionResult {
  const welcomeStep = ctx.welcomeStep ?? 0;
  const baseLabel = STATE_LABELS[current];

  // --- Ramificações laterais (prioridade alta) ---------------------------
  if (event === 'onboarding_skipped_all') {
    return {
      state: 'SKIPPED',
      changed: current !== 'SKIPPED',
      welcomeStep,
      label: STATE_LABELS.SKIPPED,
      nextRoute: '/feed',
    };
  }

  // Eventos que não mudam estado (só logam). Mantém estado atual.
  if (event === 'no_op') {
    return {
      state: current,
      changed: false,
      welcomeStep,
      label: baseLabel,
      nextRoute: getNextRoute(current),
    };
  }

  if (event === 'reminder_sent' || event === 'milestone_reached') {
    // Cron/admin only — não muda estado do user, apenas loga.
    return {
      state: current,
      changed: false,
      welcomeStep,
      label: baseLabel,
      nextRoute: getNextRoute(current),
    };
  }

  // --- Transições lineares ----------------------------------------------
  // Regra: usuário só avança (não regride). Re-invite ou admin pode forçar
  // reset (setando User.onboardingState = 'INVITED' manualmente).

  switch (event) {
    case 'invite_accepted':
      return makeResult(current, 'SIGNED_UP', 0, '/onboarding/welcome');

    case 'welcome_viewed':
      // Abrir o carrossel welcome move para PROFILE_SETUP. Skip-welcome
      // fica como `welcome_skipped` (não `welcome_viewed`).
      return makeResult(current, 'PROFILE_SETUP', Math.max(welcomeStep, 0), '/onboarding/profile');

    case 'welcome_completed':
      // Chegou no step 3 e clicou "Continuar". Já está em PROFILE_SETUP.
      return makeResult(current, 'PROFILE_SETUP', 3, '/onboarding/profile');

    case 'welcome_skipped':
      // Pulou a partir de step intermediário. Já está em PROFILE_SETUP.
      return makeResult(current, 'PROFILE_SETUP', welcomeStep, '/onboarding/profile');

    case 'profile_completed':
      return makeResult(current, 'TRADITION_CHOSEN', 3, '/onboarding/first-actions');

    case 'tradition_selected':
      // Helper event — não muda estado se já está em TRADITION_CHOSEN.
      return makeResult(current, 'TRADITION_CHOSEN', 3, '/onboarding/first-actions');

    case 'first_action_started':
      return makeResult(current, 'FIRST_ACTION', 3, null);

    case 'first_action_completed':
      return makeResult(current, 'ONBOARDED', 3, '/feed?welcome=done');

    case 'tour_completed':
      // Tour é opcional e pode ser feito depois — não força ONBOARDED.
      return makeResult(current, current, welcomeStep, null);

    case 'tour_skipped':
      return makeResult(current, current, welcomeStep, null);

    default: {
      // Exhaustiveness check — se cair aqui, é bug.
      const _exhaustive: never = event;
      void _exhaustive;
      return {
        state: current,
        changed: false,
        welcomeStep,
        label: baseLabel,
        nextRoute: getNextRoute(current),
      };
    }
  }
}

// ============================================================================
// Helpers
// ============================================================================

/** Constrói um TransitionResult + calcula `changed` + `label`. */
function makeResult(
  current: OnboardingState,
  target: OnboardingState,
  welcomeStep: number,
  nextRoute: string | null
): TransitionResult {
  return {
    state: target,
    changed: current !== target,
    welcomeStep,
    label: STATE_LABELS[target],
    nextRoute: target === current ? nextRoute : nextRoute,
  };
}

/** Devolve a próxima rota sugerida dado um estado. */
export function getNextRoute(state: OnboardingState): string | null {
  switch (state) {
    case 'INVITED':
      return '/convite'; // raramente visto (estado pré-signup)
    case 'SIGNED_UP':
      return '/onboarding/welcome';
    case 'PROFILE_SETUP':
      return '/onboarding/profile';
    case 'TRADITION_CHOSEN':
      return '/onboarding/first-actions';
    case 'FIRST_ACTION':
      return '/onboarding/first-actions';
    case 'ONBOARDED':
      return '/feed';
    case 'SKIPPED':
      return '/feed';
    case 'DROPPED':
      return '/onboarding/welcome?resumed=1';
  }
}

/** Labels human-readable (pt-BR) para uso em UI/admin/analytics. */
export const STATE_LABELS: Record<OnboardingState, string> = {
  INVITED: 'Convidado',
  SIGNED_UP: 'Conta criada',
  PROFILE_SETUP: 'Configurando perfil',
  TRADITION_CHOSEN: 'Tradição escolhida',
  FIRST_ACTION: 'Primeira ação',
  ONBOARDED: 'Onboarding completo',
  SKIPPED: 'Pulou onboarding',
  DROPPED: 'Inativo (14d+)',
};

/** Percentual de progresso (0..100) — alimenta a barra de progresso. */
export function progressPercent(state: OnboardingState): number {
  switch (state) {
    case 'INVITED':
      return 0;
    case 'SIGNED_UP':
      return 14;
    case 'PROFILE_SETUP':
      return 42;
    case 'TRADITION_CHOSEN':
      return 57;
    case 'FIRST_ACTION':
      return 78;
    case 'ONBOARDED':
      return 100;
    case 'SKIPPED':
      return 100;
    case 'DROPPED':
      return 0;
  }
}

/** Quantos steps totais a barra de progresso mostra (denominador fixo). */
export const TOTAL_PROGRESS_STEPS = 7;

/** Step atual numerado (1..7) para a barra. */
export function progressStepNumber(state: OnboardingState): number {
  switch (state) {
    case 'INVITED':
      return 0;
    case 'SIGNED_UP':
      return 1;
    case 'PROFILE_SETUP':
      return 3;
    case 'TRADITION_CHOSEN':
      return 4;
    case 'FIRST_ACTION':
      return 5;
    case 'ONBOARDED':
      return 7;
    case 'SKIPPED':
      return 7;
    case 'DROPPED':
      return 0;
  }
}

/** Verifica se o usuário pode pular onboarding (sem perder acesso). */
export function canSkip(state: OnboardingState): boolean {
  return state !== 'ONBOARDED' && state !== 'SKIPPED';
}

/** Verifica se o usuário é considerado "novo" (precisa ver onboarding). */
export function isFreshUser(state: OnboardingState, skippedAll: boolean): boolean {
  if (skippedAll) return false;
  return state === 'INVITED' || state === 'SIGNED_UP' || state === 'PROFILE_SETUP';
}

/** Decide se o milestone (50%) foi cruzado (para confetti animation). */
export function justHitMilestone(
  before: OnboardingState,
  after: OnboardingState,
  milestone: 50 | 100
): boolean {
  return progressPercent(before) < milestone && progressPercent(after) >= milestone;
}