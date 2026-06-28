// ============================================================================
// FEATURE FLAG REGISTRY — Wave 20 (GTM Readiness 3/6)
// ============================================================================
// Single source of truth para todas as feature flags ativas no Akasha Portal.
//
// Cada flag é tipada com:
//   - key:           identificador único (kebab-case)
//   - type:          'boolean' | 'percentage' | 'whitelist'
//   - defaultValue:  fallback quando storage falha
//   - description:   por que a flag existe, qual hipótese testa
//   - owner:         quem decide (PM/Coder/Security/etc)
//   - expiresAt?:    data para remover a flag (higiene — força revisão)
//
// O rollout (% de usuários que veem) é aplicado via hash determinístico
// do userId, então a atribuição é estável entre sessões/dispositivos.
//
// IMPORTANTE: nunca criar flag em produção sem passar pelo PM.
// O registro abaixo é o contrato vivo — adicionar flags aqui, não em código
// espalhado.
// ============================================================================

export type FlagType = 'boolean' | 'percentage' | 'whitelist';

export interface FeatureFlagDefinition {
  /** Identificador único, kebab-case */
  key: string;
  /** Tipo de rollout */
  type: FlagType;
  /** Default se storage falhar (fail-safe) */
  defaultValue: boolean;
  /** Por que esta flag existe / hipótese que testa */
  description: string;
  /** Dono da decisão (PM, Coder, Designer, etc) */
  owner: string;
  /** % de rollout (0-100), apenas para type='percentage' */
  rolloutPercent?: number;
  /** User IDs com bypass (sempre true), apenas para type='percentage' */
  whitelist?: string[];
  /** ISO date — força revisão/remoção */
  expiresAt?: string;
}

// ============================================================================
// REGISTRO — adicione flags novas aqui, nunca inline em componentes
// ============================================================================

export const FEATURE_FLAGS: Record<string, FeatureFlagDefinition> = {
  // --------------------------------------------------------------------------
  // WAVE 19 — Onboard redesign (A/B test com fluxo legado)
  // --------------------------------------------------------------------------
  'onboarding-redesign-v2': {
    key: 'onboarding-redesign-v2',
    type: 'percentage',
    defaultValue: false,
    rolloutPercent: 5,
    description:
      'Novo fluxo de onboard com 3 passos (intenção → tradição → primeiro conteúdo). Testa se aumenta D7 retention vs fluxo legado.',
    owner: 'pm',
    expiresAt: '2026-09-30',
  },

  // --------------------------------------------------------------------------
  // AKASHIC — voice mode para leitura oracular
  // --------------------------------------------------------------------------
  'akashic-voice-mode': {
    key: 'akashic-voice-mode',
    type: 'percentage',
    defaultValue: false,
    rolloutPercent: 10,
    description:
      'Síntese de voz (TTS) para a leitura akáshica. Testa se praticantes preferem ouvir vs ler; mede tempo de sessão.',
    owner: 'pm',
    expiresAt: '2026-09-30',
  },

  // --------------------------------------------------------------------------
  // MENTORSHIP — listagem pública de mentores verificados
  // --------------------------------------------------------------------------
  'mentorship-public-list': {
    key: 'mentorship-public-list',
    type: 'boolean',
    defaultValue: true,
    description:
      'Lista pública de mentores verificados (perfil + tradição + agenda). Estável — habilitar para todos quando GA.',
    owner: 'pm',
  },

  // --------------------------------------------------------------------------
  // MARKETPLACE — affiliate tracker para商品
  // --------------------------------------------------------------------------
  'marketplace-affiliate-tracker': {
    key: 'marketplace-affiliate-tracker',
    type: 'boolean',
    defaultValue: true,
    description:
      'Tracking de afiliados (UTM + cookie 30d) para produtos do marketplace. Compliance LGPD: opt-in obrigatório.',
    owner: 'pm',
  },

  // --------------------------------------------------------------------------
  // NEWSLETTER — digest semanal automático
  // --------------------------------------------------------------------------
  'newsletter-digest-auto': {
    key: 'newsletter-digest-auto',
    type: 'percentage',
    defaultValue: false,
    rolloutPercent: 5,
    description:
      'Digest semanal automático (top 5 artigos + 1 evento). Testa se reduz churn e aumenta DAU/MAU.',
    owner: 'pm',
    expiresAt: '2026-10-31',
  },

  // --------------------------------------------------------------------------
  // PWA — install prompt
  // --------------------------------------------------------------------------
  'pwa-install-prompt': {
    key: 'pwa-install-prompt',
    type: 'boolean',
    defaultValue: true,
    description:
      'Prompt de instalação PWA (mobile-first, com deferimento por engajamento). On para todos.',
    owner: 'coder',
  },

  // --------------------------------------------------------------------------
  // FEED — algoritmo "Para Você" v2
  // --------------------------------------------------------------------------
  'feed-para-voce-v2': {
    key: 'feed-para-voce-v2',
    type: 'percentage',
    defaultValue: false,
    rolloutPercent: 25,
    description:
      'Algoritmo de feed personalizado v2 (re-ranking por afinidade astrológica + tradição). Testa tempo de sessão e CTR.',
    owner: 'coder',
    expiresAt: '2026-09-15',
  },

  // --------------------------------------------------------------------------
  // COMMUNITY — reactions com emojis
  // --------------------------------------------------------------------------
  'comments-reactions-emojis': {
    key: 'comments-reactions-emojis',
    type: 'boolean',
    defaultValue: true,
    description:
      'Reações rápidas em comentários (🔥 🙏 ✨ 💜 🌙). Aumenta engagement sem precisar digitar. On para todos.',
    owner: 'coder',
  },

  // --------------------------------------------------------------------------
  // AKASHIC — multi-tradição na mesma leitura
  // --------------------------------------------------------------------------
  'akashic-multitradition': {
    key: 'akashic-multitradition',
    type: 'percentage',
    defaultValue: false,
    rolloutPercent: 50,
    description:
      'Permite cruzar Cabala + Ifá + Tantra na mesma leitura akáshica (lente multi-tradição). Testa se aprofundamento compensa.',
    owner: 'pm',
    expiresAt: '2026-10-15',
  },

  // --------------------------------------------------------------------------
  // STREAMING — SSE sempre ativo (vs polling)
  // --------------------------------------------------------------------------
  'streaming-sse-always': {
    key: 'streaming-sse-always',
    type: 'boolean',
    defaultValue: true,
    description:
      'SSE para notificações + chat sempre ativo. Substitui polling. On para todos — perf já validada em Wave 16.',
    owner: 'coder',
  },

  // --------------------------------------------------------------------------
  // WAVE 20 — GTM Readiness 6/6: Conversion funnel A/B/C/D
  // --------------------------------------------------------------------------
  // Atribuição por hash(userId + 'landing-variant') — 25% cada.
  // Hipótese: vídeo (B) e social proof (C) aumentam conversion vs baseline.
  // Métrica objetivo: visitor → waitlist signup em /validacao.
  // --------------------------------------------------------------------------
  'landing-variant': {
    key: 'landing-variant',
    type: 'whitelist',
    defaultValue: false,
    rolloutPercent: 100,
    description:
      'A/B/C/D test da landing /validacao. Variante A=baseline (waitlist simples), B=hero+video, C=social proof first, D=interactive quiz. Atribuição determinística por hash(userId). Default A até % rollout configurar.',
    owner: 'pm',
    expiresAt: '2026-09-30',
  },

  // --------------------------------------------------------------------------
  // WAVE 20 — Signup flow otimizado (1-step + magic link)
  // --------------------------------------------------------------------------
  'signup-magic-link': {
    key: 'signup-magic-link',
    type: 'percentage',
    defaultValue: false,
    rolloutPercent: 0,
    description:
      'Exibe "Entrar com link mágico" como opção primária no signup. Reduz friction (1 campo vs 4). Testa conversion vs fluxo tradicional.',
    owner: 'pm',
    expiresAt: '2026-09-30',
  },

  // --------------------------------------------------------------------------
  // WAVE 20 — Email capture (exit-intent desktop + mobile bottom bar)
  // --------------------------------------------------------------------------
  'exit-intent-modal': {
    key: 'exit-intent-modal',
    type: 'percentage',
    defaultValue: false,
    rolloutPercent: 50,
    description:
      'Modal de captura de email quando usuário tenta sair (mouse leave desktop, scroll up mobile). Threshold: 30s na página + não-convertido.',
    owner: 'pm',
    expiresAt: '2026-09-30',
  },

  'mobile-capture-bar': {
    key: 'mobile-capture-bar',
    type: 'boolean',
    defaultValue: true,
    description:
      'Bottom bar fixa em mobile com captura de email. Aparece após 8s, dismissível, persistente via localStorage por 7 dias.',
    owner: 'pm',
  },

  // --------------------------------------------------------------------------
  // WAVE 20 — First-value onboarding (recommended post)
  // --------------------------------------------------------------------------
  'first-value-recommendation': {
    key: 'first-value-recommendation',
    type: 'percentage',
    defaultValue: false,
    rolloutPercent: 0,
    description:
      'Logo após signup: mostrar 3 posts recomendados + 3 tradições pré-selecionadas baseado em quiz/tradição de interesse. Aha moment < 30s.',
    owner: 'pm',
    expiresAt: '2026-09-30',
  },
};

// ============================================================================
// Helpers de validação do registro
// ============================================================================

export function listFlags(): FeatureFlagDefinition[] {
  return Object.values(FEATURE_FLAGS);
}

export function getFlagDefinition(key: string): FeatureFlagDefinition | undefined {
  return FEATURE_FLAGS[key];
}

export function isValidFlagKey(key: string): key is keyof typeof FEATURE_FLAGS {
  return key in FEATURE_FLAGS;
}
