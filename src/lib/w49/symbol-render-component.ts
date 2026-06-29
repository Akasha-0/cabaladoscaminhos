// ============================================================================
// SACRED SYMBOL RENDER COMPONENT — CABALA DOS CAMINHOS (Wave 49 / w49)
// ============================================================================
//
// Especificação headless (sem dependência em runtime React) do componente de
// renderização de símbolos sagrados consumindo o registry w48. Define:
//
//   - Tipos públicos: SymbolRenderProps, SacredSymbolRef, RenderState,
//     RenderSize, Consent, RenderConsent, BlockVerdict, WcagReport, etc.
//   - Component contract: SymbolRenderController (máquina de estado pub/sub).
//   - SSR renderer: renderSymbolToHTML(props) → { html, fallback_used }.
//   - Acessibilidade: computeAriaLabel, getAltTextVariations, wcagCheck.
//   - Sensitivity gating: shouldBlockForSensitivity, requireConsentForLevel,
//     getSensitivityGateCopy, DEFAULT_LEVEL_CONSENT.
//   - Loading & fallback: LOADING_SIZES, FALLBACK_PRIORITY, shouldShowSkeleton.
//   - Performance helpers: preloadSymbol, lazyLoadProps, cacheKey,
//     shouldEvictFromCache, MAX_CACHE_ENTRIES.
//   - Error handling: RenderErrorBoundary contract, errorCodeForState,
//     RECOVERABLE_STATES.
//   - Integração com w48: symbolFromRegistry, resolveRenderURL (signed URL).
//   - Customização: RENDER_PRESETS (4 presets), applyPreset, componentVariants.
//   - i18n: LOCALES, defaultAltForTradition, RESPECT_NOTICES, shouldShowRespectNotice.
//   - LGPD: consentToRenderLevel, verifyViewerConsent, auditRender,
//     exportRenderAudit, deleteRenderAudit.
//   - Erros tipados: SymbolRenderError e 7 variações (SRE_001..008).
//   - Utilitários: equalProps, shouldUpdate, getResponsiveSizes.
//
// Princípios:
//   - SSR-safe (sem window/DOM globals em runtime paths).
//   - Framework-agnóstico (sem import React, sem JSX direto).
//   - Tipo-restrito (zero `any`; tipos literais quando aplicável).
//   - Respeitoso (sensitivity gating + respect notices + audit LGPD).
//
// Cross-references:
//   - w48/sacred-symbols-registry (tipos: SacredSymbol, SymbolRenderSpec, etc.)
//   - w45/tradition-cross-references (correlação entre tradições)
//   - w45/admin-moderation-queue (fila de moderação)
// ============================================================================

// ============================================================================
// SEÇÃO 1 — TIPOS DE TAMANHO E DIMENSÃO
// ============================================================================

/**
 * Tamanhos canônicos suportados pelo render component. `custom` indica
 * dimensões em pixels controladas via `customWidthPx`/`customHeightPx`.
 */
export type RenderSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'custom';

/** Par de dimensões em pixels para um tamanho específico. */
export interface RenderDimensions {
  readonly width: number;
  readonly height: number;
}

/** Especificação de tamanho customizado (apenas quando `size === 'custom'`). */
export interface CustomSizeSpec {
  readonly customWidthPx: number;
  readonly customHeightPx: number;
}

// ============================================================================
// SEÇÃO 2 — TIPOS DE ESTADO
// ============================================================================

/**
 * Máquina de estados do componente de render. Transições válidas:
 *   idle → loading → loaded
 *   idle → loading → error
 *   idle → blocked_respect (sensitivity bloqueou render)
 *   idle → consent_required (precisa de opt-in explícito)
 */
export type RenderState =
  | 'idle'
  | 'loading'
  | 'loaded'
  | 'error'
  | 'blocked_respect'
  | 'consent_required';

/** Tipo de fallback a ser renderizado quando o símbolo primário falha. */
export type FallbackStrategy = 'placeholder' | 'skeleton' | 'alt_text_only';

// ============================================================================
// SEÇÃO 3 — TIPOS DE TRADIÇÃO E SENSIBILIDADE
// ============================================================================

/**
 * Locales suportados. Deve casar com w48 `SupportedLocale`. Mantemos o
 * espelho aqui para não importar w48 no nível de tipos (acoplamento leve).
 */
export type SupportedLocale = 'pt-BR' | 'en-US' | 'es-ES';

/** Tradição religiosa/espiritual. Espelha w48 `SymbolTradition`. */
export type RenderTradition =
  | 'christianity'
  | 'islam'
  | 'judaism'
  | 'buddhism'
  | 'hinduism'
  | 'candomble'
  | 'ifa'
  | 'umbanda'
  | 'taoism'
  | 'indigenous'
  | 'syncretic'
  | 'spiritualist';

/** Nível de sensibilidade cultural (1 = baixo, 5 = sagrado/iniciático). */
export type SensitivityLevel = 1 | 2 | 3 | 4 | 5;

// ============================================================================
// SEÇÃO 4 — TIPOS DE CONSENTIMENTO
// ============================================================================

/**
 * Consentimento individual do viewer para um nível de sensibilidade.
 * Cada entrada é imutável (signed consent ledger pattern).
 */
export interface Consent {
  readonly viewerId: string;
  readonly level: SensitivityLevel;
  readonly grantedAt: string; // ISO-8601
  readonly expiresAt?: string; // ISO-8601
  readonly optInToggle: boolean;
}

/** Tipo de consentimento atribuído pelo sistema a um nível de sensibilidade. */
export interface RenderConsent {
  readonly viewerId: string;
  readonly level: SensitivityLevel;
  readonly required: boolean;
  readonly granted: boolean;
  readonly missingAction: 'opt-in' | 'explicit' | 'community';
}

/** Resultado da checagem de consentimento antes do render. */
export interface ConsentCheckResult {
  readonly viewerId: string;
  readonly level: SensitivityLevel;
  readonly hasConsent: boolean;
  readonly reason: 'no_consent_recorded' | 'expired' | 'sufficient' | 'opt_in_required';
  readonly checkedAt: string;
}

// ============================================================================
// SEÇÃO 5 — TIPOS DE REFERÊNCIA DE SÍMBOLO E PROPS
// ============================================================================

/**
 * Referência leve a um símbolo sagrado. Esta é a forma consumida pelo
 * component (não é o registro completo de w48). Contém o mínimo necessário
 * para render + acessibilidade + gating.
 */
export interface SacredSymbolRef {
  /** Identificador kebab-case (mesmo formato de w48 `SacredSymbol.id`). */
  readonly id: string;
  /** Nome canônico (locale-aware resolvido pelo consumer antes de passar). */
  readonly name: string;
  /** Tradição religiosa. */
  readonly tradition: RenderTradition;
  /** Sensibilidade cultural 1-5. */
  readonly sensitivityLevel: SensitivityLevel;
  /** URL para o render spec (opcional; pode ser resolvido via registry). */
  readonly renderSpecUrl?: string;
  /** Tamanho preferido do símbolo. */
  readonly preferredSize: RenderSize;
  /** Símbolo é de uso exclusivamente sagrado/iniciático? */
  readonly sacredUseOnly?: boolean;
}

/**
 * Props do componente headless. Consumido tanto por SSR renderer quanto pelo
 * controller pub/sub. Tipos estritos — zero `any`.
 */
export interface SymbolRenderProps {
  /** Referência ao símbolo a renderizar. */
  readonly symbol: SacredSymbolRef;
  /** Tamanho solicitado. */
  readonly size: RenderSize;
  /** Especificação adicional quando `size === 'custom'`. */
  readonly customSize?: CustomSizeSpec;
  /** Texto alternativo (já localizado). */
  readonly altText: string;
  /** Lazy load via Intersection Observer. */
  readonly lazy?: boolean;
  /** Estratégia de fallback quando render primário falha. */
  readonly fallback?: FallbackStrategy;
  /** Respeitar `prefers-reduced-motion` (animações). */
  readonly respectReducedMotion?: boolean;
  /** Locale para i18n. */
  readonly locale: SupportedLocale;
  /** Callback opcional disparado ao carregar com sucesso. */
  readonly onLoad?: () => void;
  /** Callback opcional disparado em erro. */
  readonly onError?: (e: Error) => void;
}

// ============================================================================
// SEÇÃO 6 — TIPOS DE RELATÓRIO WCAG E BLOCK VERDICT
// ============================================================================

/** Severidade de uma violação WCAG detectada pelo `wcagCheck`. */
export type WcagSeverity = 'info' | 'minor' | 'serious' | 'critical';

/** Item individual do relatório WCAG. */
export interface WcagViolation {
  readonly code: string; // ex.: 'WCAG-1.1.1'
  readonly severity: WcagSeverity;
  readonly message: string;
  readonly passed: boolean;
}

/** Relatório consolidado de checagem WCAG. */
export interface WcagReport {
  readonly passed: boolean;
  readonly violations: readonly WcagViolation[];
  readonly checkedAt: string;
  readonly overallScore: number; // 0..1
}

/** Decisão de bloqueio por nível de sensibilidade. */
export interface BlockVerdict {
  readonly blocked: boolean;
  readonly reason: 'sacred_use_only' | 'consent_required' | 'sensitivity_too_high' | 'community_controlled';
  readonly gateCopy: string;
  readonly requiredAction: 'opt-in' | 'explicit_consent' | 'community_request' | 'none';
}

// ============================================================================
// SEÇÃO 7 — TIPOS DE PERFORMANCE E CACHE
// ============================================================================

/** Diretiva de preload (link rel=preload ou Resource Hints). */
export interface PreloadDirective {
  readonly href: string;
  readonly as: 'image' | 'fetch';
  readonly type?: string;
  readonly crossorigin?: 'anonymous' | 'use-credentials';
  readonly fetchpriority?: 'high' | 'low' | 'auto';
}

/** Configuração para IntersectionObserver (lazy load). */
export interface LazyRenderSpec {
  readonly rootMargin: string;
  readonly threshold: number | readonly number[];
  readonly triggerOnce: boolean;
  readonly fallbackToImmediate: boolean;
  readonly strategy: 'intersection-observer' | 'idle-callback' | 'manual';
}

/** Entrada do cache (chave + último acesso + hits). */
export interface CacheEntry {
  readonly key: string;
  readonly lastAccess: number; // epoch ms
  readonly hits: number;
  readonly byteSize?: number;
}

// ============================================================================
// SEÇÃO 8 — TIPOS DE ERRO BOUNDARY E AUDIT LGPD
// ============================================================================

/** Contrato do Error Boundary (interface para integração com React). */
export interface RenderErrorBoundaryContract {
  readonly id: string;
  readonly fallback: FallbackStrategy;
  readonly reportTo: 'console' | 'sentry' | 'custom';
  readonly onCatch?: (error: Error, errorInfo: { componentStack: string }) => void;
}

/** Entrada de auditoria de render (LGPD). */
export interface RenderAuditEntry {
  readonly viewerId: string;
  readonly symbolId: string;
  readonly timestamp: string;
  readonly locale: SupportedLocale;
  readonly state: RenderState;
  readonly userAgent?: string;
}

/** Artefato de exportação (LGPD Art. 18 — direito de acesso). */
export interface ExportArtifact {
  readonly format: 'json' | 'csv' | 'xml';
  readonly content: string;
  readonly generatedAt: string;
  readonly viewerId: string;
  readonly entryCount: number;
}

/** Recibo de deleção (LGPD Art. 18 — direito ao esquecimento). */
export interface DeletionReceipt {
  readonly viewerId: string;
  readonly deletedCount: number;
  readonly deletedAt: string;
  readonly scope: 'all' | 'before' | 'after';
  readonly cutoff?: string;
  readonly receiptId: string;
}

// ============================================================================
// SEÇÃO 9 — TIPOS DE PRESET E VARIANTE
// ============================================================================

/** Preset de renderização (preset de props). */
export type RenderPreset = 'devotional-default' | 'meditation-minimal' | 'community-share' | 'wiki-card';

/** Variante discriminada do componente. */
export interface ComponentVariant {
  readonly preset: RenderPreset;
  readonly label: string;
  readonly description: string;
  readonly defaultSize: RenderSize;
  readonly defaultFallback: FallbackStrategy;
  readonly defaultLocale: SupportedLocale;
}

/** URL resolvida com assinatura (signed URL pattern). */
export interface SignedRenderUrl {
  readonly url: string;
  readonly expiresAt: string; // ISO-8601
  readonly signature: string;
}

// ============================================================================
// SEÇÃO 10 — CONSTANTES GLOBAIS
// ============================================================================

/** Máximo de entradas no cache LRU de símbolos renderizados. */
export const MAX_CACHE_ENTRIES: number = 50;

/** Locales suportados (espelha w48 mas local para evitar import circular). */
export const LOCALES = ['pt-BR', 'en-US', 'es-ES'] as const satisfies readonly SupportedLocale[];

/**
 * Default de consentimento por nível de sensibilidade. Níveis ≥4 exigem
 * consentimento explícito + opt-in toggle (community-controlled pattern).
 */
export const DEFAULT_LEVEL_CONSENT: Readonly<Record<SensitivityLevel, RenderConsent['missingAction']>> = {
  1: 'opt-in',
  2: 'opt-in',
  3: 'opt-in',
  4: 'explicit',
  5: 'community',
};

/** Dimensões intrínsecas por tamanho canônico (px). */
export const LOADING_SIZES: Readonly<Record<Exclude<RenderSize, 'custom'>, RenderDimensions>> = {
  xs: { width: 24, height: 24 },
  sm: { width: 48, height: 48 },
  md: { width: 96, height: 96 },
  lg: { width: 192, height: 192 },
  xl: { width: 384, height: 384 },
};

/**
 * Prioridade de fallback. Decide ordem: SVG inline → Image → placeholder
 * geométrico → alt-text only. Usado pelo SSR renderer e pelo runtime.
 */
export const FALLBACK_PRIORITY: readonly FallbackStrategy[] = [
  'placeholder',
  'skeleton',
  'alt_text_only',
];

/** Estados considerados recuperáveis (podem voltar a `loaded` sem reload). */
export const RECOVERABLE_STATES: readonly RenderState[] = ['loading', 'error'];

/** Níveis que requerem consentimento explícito (≥4). */
export const CONSENT_REQUIRED_LEVELS: readonly SensitivityLevel[] = [4, 5];

// ============================================================================
// SEÇÃO 11 — RESPECT NOTICES POR TRADIÇÃO
// ============================================================================

/** Aviso de respeito (o que NÃO renderizar e por quê) por tradição. */
export interface RespectNotice {
  readonly tradition: RenderTradition;
  readonly locale: SupportedLocale;
  readonly headline: string;
  readonly body: string;
  readonly doNot: readonly string[];
}

/**
 * 10+ entradas de respect notices. Cobre principais tradições com guidelines
 * curtas. Mais extensas em w48 (`RESPECTFUL_USE_GUIDELINES`).
 */
export const RESPECT_NOTICES: readonly RespectNotice[] = [
  {
    tradition: 'christianity',
    locale: 'pt-BR',
    headline: 'Símbolo cristão',
    body: 'Atribua a fonte e evite uso em contextos depreciativos.',
    doNot: ['usar sem contexto devocional', 'combinar com símbolos contrários sem mediação'],
  },
  {
    tradition: 'islam',
    locale: 'pt-BR',
    headline: 'Símbolo islâmico',
    body: 'Respeite a caligrafia; evite estilizações que distorçam o sentido.',
    doNot: ['usar em marketing sem permissão', 'colocar no chão'],
  },
  {
    tradition: 'judaism',
    locale: 'pt-BR',
    headline: 'Símbolo judaico',
    body: 'Não confundir menorah (7 braços) com hanukkiah (9 braços).',
    doNot: ['usar como decoração genérica', 'remover contexto ritual'],
  },
  {
    tradition: 'buddhism',
    locale: 'pt-BR',
    headline: 'Símbolo budista',
    body: 'Respeitar a orientação e a postura dos Budas.',
    doNot: ['tatuá-los sem iniciação', 'colocar no chão'],
  },
  {
    tradition: 'hinduism',
    locale: 'pt-BR',
    headline: 'Símbolo hindu',
    body: 'Não combinar com símbolos de outras tradições sem contexto.',
    doNot: ['modificar proporções canônicas', 'usar sem reverência'],
  },
  {
    tradition: 'candomble',
    locale: 'pt-BR',
    headline: 'Símbolo de Candomblé',
    body: 'Símbolos de orixá são guardados pela comunidade. Exposição requer consentimento.',
    doNot: ['usar sem iniciação', 'reduzir a moda/decoration'],
  },
  {
    tradition: 'ifa',
    locale: 'pt-BR',
    headline: 'Símbolo de Ifá',
    body: 'Símbolos do sistema Ifá são iniciáticos. Não exibir sem comunidade.',
    doNot: ['usar fora do contexto ritual', 'compartilhar com não-iniciados'],
  },
  {
    tradition: 'umbanda',
    locale: 'pt-BR',
    headline: 'Símbolo de Umbanda',
    body: 'Atribuir a linha (Caboclo, Preto-Velho) quando conhecida.',
    doNot: ['usar de forma caricata', 'desassociar da entidade guiadora'],
  },
  {
    tradition: 'taoism',
    locale: 'pt-BR',
    headline: 'Símbolo taoísta',
    body: 'Yin-yang mantém polaridades complementares. Não inverter.',
    doNot: ['usar em contexto agressivo', 'separar em metades'],
  },
  {
    tradition: 'indigenous',
    locale: 'pt-BR',
    headline: 'Símbolo indígena',
    body: 'Povos tradicionais controlam uso. Solicite permissão via comunidade.',
    doNot: ['usar sem protocolo', 'estilizar comercialmente'],
  },
  {
    tradition: 'syncretic',
    locale: 'pt-BR',
    headline: 'Símbolo sincrético',
    body: 'Símbolos sincréticos carregam camadas; explicite as tradições envolvidas.',
    doNot: ['ocultar as fontes originais', 'reduzir a uma única tradição'],
  },
  {
    tradition: 'spiritualist',
    locale: 'pt-BR',
    headline: 'Símbolo espiritualista',
    body: 'Atribuir matriz (Kardec, Umbandista, etc.) quando conhecida.',
    doNot: ['usar como decoração sem contexto'],
  },
];

// ============================================================================
// SEÇÃO 12 — PRESETS DE RENDERIZAÇÃO
// ============================================================================

/**
 * Quatro presets canônicos. Cada preset define defaults de props que o
 * consumer pode estender.
 */
export const RENDER_PRESETS: Readonly<Record<RenderPreset, SymbolRenderProps>> = {
  'devotional-default': {
    symbol: {
      id: 'cross',
      name: 'Cruz',
      tradition: 'christianity',
      sensitivityLevel: 2,
      preferredSize: 'md',
    },
    size: 'md',
    altText: 'Cruz cristã',
    lazy: false,
    fallback: 'placeholder',
    respectReducedMotion: true,
    locale: 'pt-BR',
  },
  'meditation-minimal': {
    symbol: {
      id: 'om',
      name: 'Om',
      tradition: 'hinduism',
      sensitivityLevel: 3,
      preferredSize: 'sm',
    },
    size: 'sm',
    altText: 'Símbolo Om',
    lazy: true,
    fallback: 'alt_text_only',
    respectReducedMotion: true,
    locale: 'pt-BR',
  },
  'community-share': {
    symbol: {
      id: 'opon-ifa',
      name: 'Opón Ifá',
      tradition: 'ifa',
      sensitivityLevel: 5,
      sacredUseOnly: true,
      preferredSize: 'md',
    },
    size: 'md',
    altText: 'Opón Ifá (tabuleiro de Ifá)',
    lazy: false,
    fallback: 'placeholder',
    respectReducedMotion: true,
    locale: 'pt-BR',
  },
  'wiki-card': {
    symbol: {
      id: 'hamsa',
      name: 'Hamsá',
      tradition: 'syncretic',
      sensitivityLevel: 2,
      preferredSize: 'lg',
    },
    size: 'lg',
    altText: 'Hamsá (mão protetora)',
    lazy: false,
    fallback: 'skeleton',
    respectReducedMotion: false,
    locale: 'pt-BR',
  },
};

/**
 * Descrições textuais das variantes do componente (para documentar UI
 * consumers e Storybook).
 */
export const RENDER_PRESET_VARIANTS: readonly ComponentVariant[] = [
  {
    preset: 'devotional-default',
    label: 'Devocional (padrão)',
    description: 'Tamanho médio, sem lazy, com placeholder respeitoso.',
    defaultSize: 'md',
    defaultFallback: 'placeholder',
    defaultLocale: 'pt-BR',
  },
  {
    preset: 'meditation-minimal',
    label: 'Meditação minimalista',
    description: 'Pequeno, lazy, alt-text only em falha. Movimento reduzido.',
    defaultSize: 'sm',
    defaultFallback: 'alt_text_only',
    defaultLocale: 'pt-BR',
  },
  {
    preset: 'community-share',
    label: 'Compartilhamento comunitário',
    description: 'Símbolos sagrados com gating de comunidade. Bloqueio padrão.',
    defaultSize: 'md',
    defaultFallback: 'placeholder',
    defaultLocale: 'pt-BR',
  },
  {
    preset: 'wiki-card',
    label: 'Wiki card',
    description: 'Card educativo. Skeleton enquanto carrega.',
    defaultSize: 'lg',
    defaultFallback: 'skeleton',
    defaultLocale: 'pt-BR',
  },
];

// ============================================================================
// SEÇÃO 13 — ERROS TIPADOS (SRE_001..008)
// ============================================================================

/** Erro base do render component. Todos os erros específicos o estendem. */
export class SymbolRenderError extends Error {
  public readonly code: string;
  public readonly symbolId: string;
  constructor(symbolId: string, code: string, message: string) {
    super(message);
    this.name = 'SymbolRenderError';
    this.code = code;
    this.symbolId = symbolId;
    Object.setPrototypeOf(this, SymbolRenderError.prototype);
  }
}

/** SRE_001 — Falta de consentimento de sensibilidade. */
export class SensitivityConsentMissingError extends SymbolRenderError {
  constructor(symbolId: string, level: SensitivityLevel) {
    super(
      symbolId,
      'SRE_001',
      `Sensitivity consent missing for symbol ${symbolId} at level ${level}`,
    );
    this.name = 'SensitivityConsentMissingError';
    Object.setPrototypeOf(this, SensitivityConsentMissingError.prototype);
  }
}

/** SRE_002 — Símbolo marcado como `sacred_use_only` sem comunidade. */
export class SacredUseOnlyError extends SymbolRenderError {
  constructor(symbolId: string) {
    super(symbolId, 'SRE_002', `Symbol ${symbolId} is sacred-use-only and requires community opt-in`);
    this.name = 'SacredUseOnlyError';
    Object.setPrototypeOf(this, SacredUseOnlyError.prototype);
  }
}

/** SRE_003 — URL de render expirada. */
export class RenderUrlExpiredError extends SymbolRenderError {
  public readonly expiredAt: string;
  constructor(symbolId: string, expiredAt: string) {
    super(symbolId, 'SRE_003', `Render URL for ${symbolId} expired at ${expiredAt}`);
    this.name = 'RenderUrlExpiredError';
    this.expiredAt = expiredAt;
    Object.setPrototypeOf(this, RenderUrlExpiredError.prototype);
  }
}

/** SRE_004 — Violação de WCAG detectada no render. */
export class WcagViolationError extends SymbolRenderError {
  public readonly violations: readonly string[];
  constructor(symbolId: string, violations: readonly string[]) {
    super(symbolId, 'SRE_004', `WCAG violations detected for ${symbolId}: ${violations.join(', ')}`);
    this.name = 'WcagViolationError';
    this.violations = violations;
    Object.setPrototypeOf(this, WcagViolationError.prototype);
  }
}

/** SRE_005 — Símbolo não encontrado no registry. */
export class SymbolNotInRegistryError extends SymbolRenderError {
  public readonly registryId: string;
  constructor(symbolId: string, registryId: string) {
    super(symbolId, 'SRE_005', `Symbol ${symbolId} not found in registry ${registryId}`);
    this.name = 'SymbolNotInRegistryError';
    this.registryId = registryId;
    Object.setPrototypeOf(this, SymbolNotInRegistryError.prototype);
  }
}

/** SRE_006 — Tamanho inválido. */
export class InvalidSizeError extends SymbolRenderError {
  public readonly size: string;
  constructor(symbolId: string, size: string) {
    super(symbolId, 'SRE_006', `Invalid size "${size}" for symbol ${symbolId}`);
    this.name = 'InvalidSizeError';
    this.size = size;
    Object.setPrototypeOf(this, InvalidSizeError.prototype);
  }
}

/** SRE_007 — Locale não suportado. */
export class UnsupportedLocaleError extends SymbolRenderError {
  public readonly locale: string;
  constructor(symbolId: string, locale: string) {
    super(symbolId, 'SRE_007', `Locale "${locale}" not supported for symbol ${symbolId}`);
    this.name = 'UnsupportedLocaleError';
    this.locale = locale;
    Object.setPrototypeOf(this, UnsupportedLocaleError.prototype);
  }
}

/** SRE_008 — Alt-text ausente ou inválido. */
export class MissingAltTextError extends SymbolRenderError {
  constructor(symbolId: string) {
    super(symbolId, 'SRE_008', `Missing or empty alt text for symbol ${symbolId}`);
    this.name = 'MissingAltTextError';
    Object.setPrototypeOf(this, MissingAltTextError.prototype);
  }
}

// ============================================================================
// SEÇÃO 14 — COMPONENT CONTROLLER (PUB/SUB)
// ============================================================================

/** Callback do subscriber do controller. */
export type StateSubscriber = (state: RenderState) => void;

/**
 * Controller headless para o componente de render. Mantém estado atual e
 * notifica subscribers. Não depende de React/DOM — pode ser usado em
 * qualquer runtime (SSR, Node, edge, browser).
 */
export class SymbolRenderController {
  private currentState: RenderState = 'idle';
  private currentSymbol: SacredSymbolRef | null = null;
  private currentSize: RenderSize = 'md';
  private currentLocale: SupportedLocale = 'pt-BR';
  private readonly subscribers: Set<StateSubscriber> = new Set();

  /** Atualiza o estado e notifica subscribers. */
  public setState(s: RenderState): void {
    if (this.currentState === s) return;
    this.currentState = s;
    for (const cb of this.subscribers) {
      try {
        cb(s);
      } catch {
        // swallow — callback errors não devem quebrar outros subscribers
      }
    }
  }

  /** Retorna o estado atual. */
  public getState(): RenderState {
    return this.currentState;
  }

  /** Inscreve um callback para mudanças de estado. */
  public subscribe(cb: StateSubscriber): () => void {
    this.subscribers.add(cb);
    return () => this.unsubscribe(cb);
  }

  /** Remove inscrição. Idempotente. */
  public unsubscribe(cb: StateSubscriber): void {
    this.subscribers.delete(cb);
  }

  /** Define o símbolo atual e dispara `loading`. */
  public setSymbol(ref: SacredSymbolRef): void {
    this.currentSymbol = ref;
    this.setState('loading');
  }

  /** Define o tamanho (e opcionalmente custom dimensions). */
  public setSize(s: RenderSize, custom?: CustomSizeSpec): void {
    if (s === 'custom' && !custom) {
      this.setState('error');
      return;
    }
    this.currentSize = s;
    // mudança de tamanho pode re-disparar loading se estava loaded
    if (this.currentState === 'loaded') {
      this.setState('loading');
    }
  }

  /** Define locale e re-renderiza labels. */
  public setLocale(loc: SupportedLocale): void {
    this.currentLocale = loc;
  }

  /** Retorna o símbolo atual (ou null). */
  public getSymbol(): SacredSymbolRef | null {
    return this.currentSymbol;
  }

  /** Retorna o tamanho atual. */
  public getSize(): RenderSize {
    return this.currentSize;
  }

  /** Retorna o locale atual. */
  public getLocale(): SupportedLocale {
    return this.currentLocale;
  }

  /** Número de subscribers ativos (teste/debug). */
  public subscriberCount(): number {
    return this.subscribers.size;
  }

  /** Reset para idle. */
  public reset(): void {
    this.currentState = 'idle';
    this.currentSymbol = null;
    this.currentSize = 'md';
    this.currentLocale = 'pt-BR';
  }
}

// ============================================================================
// SEÇÃO 15 — FUNÇÕES DE ACESSIBILIDADE
// ============================================================================

/**
 * Calcula aria-label para um símbolo. Combina nome + tradição + nível de
 * sensibilidade em texto localizado.
 */
export function computeAriaLabel(symbol: SacredSymbolRef, locale: SupportedLocale): string {
  const senLevelLabel: Readonly<Record<SupportedLocale, string>> = {
    'pt-BR': `nível de sensibilidade ${String(symbol.sensitivityLevel)}`,
    'en-US': `sensitivity level ${String(symbol.sensitivityLevel)}`,
    'es-ES': `nivel de sensibilidad ${String(symbol.sensitivityLevel)}`,
  };
  const traditionLabel: Readonly<Record<RenderTradition, string>> = {
    christianity: 'cristianismo',
    islam: 'islamismo',
    judaism: 'judaísmo',
    buddhism: 'budismo',
    hinduism: 'hinduísmo',
    candomble: 'candomblé',
    ifa: 'ifá',
    umbanda: 'umbanda',
    taoism: 'taoísmo',
    indigenous: 'povos indígenas',
    syncretic: 'sincrético',
    spiritualist: 'espiritualismo',
  };
  const trad = traditionLabel[symbol.tradition];
  const sen = senLevelLabel[locale];
  if (symbol.sacredUseOnly === true) {
    return locale === 'en-US'
      ? `${symbol.name} (sacred symbol, ${trad}, ${sen})`
      : locale === 'es-ES'
      ? `${symbol.name} (símbolo sagrado, ${trad}, ${sen})`
      : `${symbol.name} (símbolo sagrado, ${trad}, ${sen})`;
  }
  return locale === 'en-US'
    ? `${symbol.name} (${trad}, ${sen})`
    : `${symbol.name} (${trad}, ${sen})`;
}

/**
 * Retorna 3 variações de alt-text:
 *   - literal: nome + tradição (ex.: "Cruz, cristianismo")
 *   - contextual: nome + uso típico (ex.: "Cruz cristã, símbolo de fé")
 *   - decolonial-respeitoso: nome + atribuição (ex.: "Cruz, tradição cristã histórica")
 */
export function getAltTextVariations(symbol: SacredSymbolRef, locale: SupportedLocale): readonly string[] {
  const tradKey = symbol.tradition;
  const traditionPhrases: Readonly<Record<SupportedLocale, Readonly<Record<RenderTradition, string>>>> = {
    'pt-BR': {
      christianity: 'cristianismo',
      islam: 'islamismo',
      judaism: 'judaísmo',
      buddhism: 'budismo',
      hinduism: 'hinduísmo',
      candomble: 'candomblé',
      ifa: 'ifá',
      umbanda: 'umbanda',
      taoism: 'taoísmo',
      indigenous: 'povos indígenas',
      syncretic: 'sincrético',
      spiritualist: 'espiritualismo',
    },
    'en-US': {
      christianity: 'Christianity',
      islam: 'Islam',
      judaism: 'Judaism',
      buddhism: 'Buddhism',
      hinduism: 'Hinduism',
      candomble: 'Candomblé',
      ifa: 'Ifá',
      umbanda: 'Umbanda',
      taoism: 'Taoism',
      indigenous: 'Indigenous peoples',
      syncretic: 'Syncretic',
      spiritualist: 'Spiritualism',
    },
    'es-ES': {
      christianity: 'cristianismo',
      islam: 'islamismo',
      judaism: 'judaísmo',
      buddhism: 'budismo',
      hinduism: 'hinduismo',
      candomble: 'candomblé',
      ifa: 'ifá',
      umbanda: 'umbanda',
      taoism: 'taoísmo',
      indigenous: 'pueblos indígenas',
      syncretic: 'sincretismo',
      spiritualist: 'espiritualismo',
    },
  };

  const trad = traditionPhrases[locale][tradKey];

  if (locale === 'en-US') {
    return [
      `${symbol.name}, ${trad}`, // literal
      `${symbol.name}, ${trad} devotional symbol`, // contextual
      `${symbol.name}, historic ${trad} tradition with attribution`, // decolonial
    ];
  }
  if (locale === 'es-ES') {
    return [
      `${symbol.name}, ${trad}`,
      `${symbol.name}, símbolo devocional de ${trad}`,
      `${symbol.name}, tradición ${trad} histórica con atribución`,
    ];
  }
  // pt-BR
  return [
    `${symbol.name}, ${trad}`,
    `${symbol.name}, símbolo devocional do ${trad}`,
    `${symbol.name}, tradição ${trad} histórica, com atribuição`,
  ];
}

/**
 * Roda checagens WCAG mínimas no SymbolRenderProps:
 *   - alt-text presente (não-vazio)
 *   - decorative vs informative (info: alt length, ratio texto/tamanho)
 *   - focusable se interativo
 *   - reduced motion respeitado quando animações estão previstas
 */
export function wcagCheck(props: SymbolRenderProps): WcagReport {
  const violations: WcagViolation[] = [];
  const checkedAt = new Date().toISOString();

  // 1.1.1 Non-text content: alt-text obrigatório
  if (props.altText.trim().length === 0) {
    violations.push({
      code: 'WCAG-1.1.1',
      severity: 'critical',
      message: 'Alt text is required for informative sacred symbol renders',
      passed: false,
    });
  } else {
    violations.push({
      code: 'WCAG-1.1.1',
      severity: 'info',
      message: 'Alt text present',
      passed: true,
    });
  }

  // 1.4.5 Images of text: alt-text muito longo pode indicar texto-imagem
  if (props.altText.length > 250) {
    violations.push({
      code: 'WCAG-1.4.5',
      severity: 'minor',
      message: 'Alt text exceeds 250 chars; consider simplifying for screen readers',
      passed: false,
    });
  }

  // 2.1.1 Keyboard: se símbolo é interativo, deveria ser focusable
  // (estamos em headless; verificamos heurística via altText)
  if (props.altText.toLowerCase().includes('button') || props.altText.toLowerCase().includes('botão')) {
    violations.push({
      code: 'WCAG-2.1.1',
      severity: 'serious',
      message: 'Interactive sacred symbols must be keyboard focusable',
      passed: false,
    });
  }

  // 2.3.3 Animation from interactions: reduced motion deve ser respeitado
  if (props.respectReducedMotion === false && props.size === 'xl') {
    violations.push({
      code: 'WCAG-2.3.3',
      severity: 'minor',
      message: 'Large renders may animate; ensure prefers-reduced-motion is respected',
      passed: false,
    });
  }

  // 3.1.1 Language of page: locale válido
  if (!LOCALES.includes(props.locale)) {
    violations.push({
      code: 'WCAG-3.1.1',
      severity: 'serious',
      message: `Locale ${props.locale} is not supported`,
      passed: false,
    });
  }

  // 4.1.2 Name, role, value: aria-label precisa estar presente via props
  if (props.altText.trim().length > 0) {
    violations.push({
      code: 'WCAG-4.1.2',
      severity: 'info',
      message: 'Name derived from alt text',
      passed: true,
    });
  }

  const failed = violations.filter((v) => !v.passed).length;
  const total = violations.length;
  const overallScore = total === 0 ? 1 : (total - failed) / total;
  const passed = failed === 0;

  return {
    passed,
    violations,
    checkedAt,
    overallScore,
  };
}

// ============================================================================
// SEÇÃO 16 — SENSITIVITY GATING
// ============================================================================

/**
 * Decide se um símbolo deve ser bloqueado dado o nível de sensibilidade e
 * os consentimentos do viewer.
 */
export function shouldBlockForSensitivity(
  level: SensitivityLevel,
  viewerConsents: readonly Consent[],
): BlockVerdict {
  // Nível 1-3: nunca bloqueia (opt-in é default)
  if (level <= 3) {
    return {
      blocked: false,
      reason: 'consent_required',
      gateCopy: '',
      requiredAction: 'opt-in',
    };
  }

  // Nível 4: precisa de consentimento explícito + opt-in toggle ativo
  const matching = viewerConsents.find(
    (c) => c.level === level && c.optInToggle === true,
  );
  if (matching === undefined) {
    return {
      blocked: true,
      reason: 'consent_required',
      gateCopy: 'Este símbolo requer consentimento explícito e opt-in ativo.',
      requiredAction: 'explicit_consent',
    };
  }

  // Verifica expiração
  if (matching.expiresAt !== undefined && new Date(matching.expiresAt).getTime() < Date.now()) {
    return {
      blocked: true,
      reason: 'consent_required',
      gateCopy: 'Consentimento expirado. Renove para visualizar.',
      requiredAction: 'explicit_consent',
    };
  }

  return {
    blocked: false,
    reason: 'consent_required',
    gateCopy: '',
    requiredAction: 'explicit_consent',
  };
}

/** Indica se um nível requer consentimento explícito (≥4). */
export function requireConsentForLevel(level: SensitivityLevel): boolean {
  return CONSENT_REQUIRED_LEVELS.includes(level);
}

/** Copy localizada para o gate de sensibilidade. */
export function getSensitivityGateCopy(level: SensitivityLevel, locale: SupportedLocale): string {
  const map: Readonly<Record<SupportedLocale, Readonly<Record<SensitivityLevel, string>>>> = {
    'pt-BR': {
      1: '',
      2: '',
      3: '',
      4: 'Símbolo de nível 4. Requer consentimento explícito e opt-in ativo.',
      5: 'Símbolo sagrado/iniciático de nível 5. Requer autorização da comunidade.',
    },
    'en-US': {
      1: '',
      2: '',
      3: '',
      4: 'Level-4 symbol. Requires explicit consent and active opt-in.',
      5: 'Level-5 sacred/initiatic symbol. Requires community authorization.',
    },
    'es-ES': {
      1: '',
      2: '',
      3: '',
      4: 'Símbolo de nivel 4. Requiere consentimiento explícito y opt-in activo.',
      5: 'Símbolo sagrado/iniciático de nivel 5. Requiere autorización de la comunidad.',
    },
  };
  return map[locale][level];
}

/** Retorna a ação padrão de consentimento para um nível. */
export function defaultConsentActionForLevel(level: SensitivityLevel): RenderConsent['missingAction'] {
  return DEFAULT_LEVEL_CONSENT[level];
}

// ============================================================================
// SEÇÃO 17 — LOADING E FALLBACK
// ============================================================================

/**
 * Decide se deve mostrar skeleton dado o estado e se já esteve visível.
 * `hasBeenVisibleAtLeast` deve vir do IntersectionObserver.
 */
export function shouldShowSkeleton(state: RenderState, hasBeenVisibleAtLeast: boolean): boolean {
  if (!hasBeenVisibleAtLeast) return false;
  return state === 'loading';
}

/**
 * Decide estratégia de fallback final dado o estado.
 * `idle`/`loaded` → 'placeholder' (no-op)
 * `loading` → 'skeleton'
 * `error` → primeiro item de FALLBACK_PRIORITY
 */
export function selectFallbackForState(state: RenderState): FallbackStrategy {
  if (state === 'loading') return 'skeleton';
  if (state === 'error') return FALLBACK_PRIORITY[0] ?? 'placeholder';
  return 'placeholder';
}

// ============================================================================
// SEÇÃO 18 — PERFORMANCE HELPERS
// ============================================================================

/** Gera diretiva de preload para um símbolo. */
export function preloadSymbol(symbol: SacredSymbolRef): PreloadDirective {
  const href = symbol.renderSpecUrl ?? `/api/symbols/${symbol.id}/render`;
  return {
    href,
    as: 'image',
    crossorigin: 'anonymous',
    fetchpriority: symbol.sensitivityLevel >= 4 ? 'low' : 'auto',
  };
}

/** Configuração para IntersectionObserver (lazy load). */
export function lazyLoadProps(props: SymbolRenderProps): LazyRenderSpec {
  if (props.lazy !== true) {
    return {
      rootMargin: '0px',
      threshold: 1,
      triggerOnce: true,
      fallbackToImmediate: true,
      strategy: 'manual',
    };
  }
  return {
    rootMargin: '200px',
    threshold: [0, 0.25, 0.5, 0.75, 1],
    triggerOnce: true,
    fallbackToImmediate: false,
    strategy: 'intersection-observer',
  };
}

/** Gera chave de cache determinística para as props. */
export function cacheKey(props: SymbolRenderProps): string {
  const custom = props.customSize !== undefined
    ? `@${String(props.customSize.customWidthPx)}x${String(props.customSize.customHeightPx)}`
    : '';
  return [
    props.symbol.id,
    props.size,
    custom,
    props.locale,
    props.fallback ?? 'placeholder',
    props.symbol.sensitivityLevel,
  ].join(':');
}

/** Decide se uma entrada deve ser evictada do cache LRU. */
export function shouldEvictFromCache(key: string, lastAccess: number, now: number): boolean {
  // Evict se não foi acessado nos últimos 30 minutos OU se já passou
  // muito tempo desde o último acesso (>24h).
  const age = now - lastAccess;
  return age > 30 * 60 * 1000 || age > 24 * 60 * 60 * 1000 || key.length === 0;
}

/** Hook de decisão de eviction: retorna entries a remover quando acima de MAX_CACHE_ENTRIES. */
export function evictFromCache(
  entries: readonly CacheEntry[],
  maxEntries: number = MAX_CACHE_ENTRIES,
): readonly CacheEntry[] {
  if (entries.length <= maxEntries) return [];
  const sorted = [...entries].sort((a, b) => a.lastAccess - b.lastAccess);
  const toRemove = sorted.slice(0, entries.length - maxEntries);
  return toRemove;
}

// ============================================================================
// SEÇÃO 19 — ERROR HANDLING
// ============================================================================

/** Converte RenderState em código de erro padronizado. */
export function errorCodeForState(s: RenderState): string {
  const map: Readonly<Record<RenderState, string>> = {
    idle: 'SRE_000',
    loading: 'SRE_LOADING',
    loaded: 'SRE_OK',
    error: 'SRE_RUNTIME',
    blocked_respect: 'SRE_BLOCKED',
    consent_required: 'SRE_CONSENT',
  };
  return map[s];
}

/** Decide se um estado é recuperável sem reload. */
export function isRecoverableState(s: RenderState): boolean {
  return RECOVERABLE_STATES.includes(s);
}

/** Helper para envolver execução de render com fallback automático. */
export function safeRender<T>(
  primary: () => T,
  fallbackFn: () => T,
  onError?: (e: Error) => void,
): T {
  try {
    return primary();
  } catch (e) {
    if (onError !== undefined && e instanceof Error) onError(e);
    return fallbackFn();
  }
}

// ============================================================================
// SEÇÃO 20 — INTEGRAÇÃO COM W48 REGISTRY
// ============================================================================

/** Subconjunto de w48 SacredSymbol que precisamos para o render component. */
export interface RegistrySymbolShape {
  readonly id: string;
  readonly name: string;
  readonly tradition: RenderTradition | string;
  readonly culturalSensitivity: SensitivityLevel;
  readonly renderSpec?: { readonly url?: string };
  readonly preferredSize?: RenderSize;
  readonly restrictions?: readonly string[];
}

/** Subconjunto de w48 registry (apenas o que precisamos). */
export interface RegistryShape {
  readonly symbols: readonly RegistrySymbolShape[];
  readonly findById: (id: string) => RegistrySymbolShape | undefined;
}

/**
 * Converte uma entrada de w48 registry em SacredSymbolRef consumida pelo
 * render component. Lança SymbolNotInRegistryError se não encontrar.
 */
export function symbolFromRegistry(id: string, registry: RegistryShape): SacredSymbolRef {
  const found = registry.findById(id);
  if (!found) {
    throw new SymbolNotInRegistryError(id, 'w48/sacred-symbols-registry');
  }
  const trad = found.tradition as RenderTradition;
  return {
    id: found.id,
    name: found.name,
    tradition: trad,
    sensitivityLevel: found.culturalSensitivity,
    renderSpecUrl: found.renderSpec?.url,
    preferredSize: found.preferredSize ?? 'md',
    sacredUseOnly: found.restrictions?.includes('sacred-use-only') === true
      || found.restrictions?.includes('community-controlled') === true,
  };
}

/**
 * Resolve a URL de render com assinatura (signed URL pattern). Expira em
 * `ttlSeconds` (default 300 = 5min).
 */
export function resolveRenderURL(
  symbol: SacredSymbolRef,
  ttlSeconds: number = 300,
): SignedRenderUrl {
  const baseUrl = symbol.renderSpecUrl ?? `/api/symbols/${symbol.id}/render`;
  const expiresAtMs = Date.now() + ttlSeconds * 1000;
  const expiresAt = new Date(expiresAtMs).toISOString();
  // Assinatura determinística (não-criptográfica; substituir por HMAC real no backend)
  const signatureInput = `${symbol.id}:${expiresAt}`;
  let signature = 0;
  for (let i = 0; i < signatureInput.length; i += 1) {
    signature = (signature * 31 + signatureInput.charCodeAt(i)) >>> 0;
  }
  const signatureHex = signature.toString(16).padStart(8, '0');
  const url = `${baseUrl}?expires=${encodeURIComponent(expiresAt)}&sig=${signatureHex}`;
  return { url, expiresAt, signature: signatureHex };
}

// ============================================================================
// SEÇÃO 21 — SSR RENDERER
// ============================================================================

/** Resultado de SSR render. */
export interface SsrRenderResult {
  readonly html: string;
  readonly fallbackUsed: 'svg' | 'html' | 'json';
}

/**
 * Renderiza símbolo para HTML inline SSR-safe. Retorna:
 *   - `<svg>` simples com hex placeholder quando render primário é viável
 *   - `<img>` quando há URL externa
 *   - `<span>` com alt-text apenas em fallback final
 */
export function renderSymbolToHTML(props: SymbolRenderProps): SsrRenderResult {
  // Valida alt-text
  if (props.altText.trim().length === 0) {
    return {
      html: `<span class="symbol-render--missing-alt" data-symbol-id="${escapeHtml(props.symbol.id)}" data-locale="${props.locale}"></span>`,
      fallbackUsed: 'html',
    };
  }

  // Valida size
  if (props.size === 'custom' && props.customSize === undefined) {
    return {
      html: `<span class="symbol-render--invalid-size" data-symbol-id="${escapeHtml(props.symbol.id)}"></span>`,
      fallbackUsed: 'html',
    };
  }

  const dims = resolveDimensions(props);

  // Caso 1: render SVG inline (placeholder geométrico respeitoso)
  if (props.fallback === 'placeholder' || props.fallback === undefined) {
    const svg = renderPlaceholderSvg(props.symbol, dims, props.altText, props.locale);
    return { html: svg, fallbackUsed: 'svg' };
  }

  // Caso 2: skeleton (retângulo neutro)
  if (props.fallback === 'skeleton') {
    const skeleton = `<svg xmlns="http://www.w3.org/2000/svg" width="${String(dims.width)}" height="${String(dims.height)}" role="img" aria-label="${escapeHtml(props.altText)}" data-symbol-id="${escapeHtml(props.symbol.id)}" data-locale="${props.locale}"><rect width="100%" height="100%" fill="#e5e7eb" rx="4"/></svg>`;
    return { html: skeleton, fallbackUsed: 'svg' };
  }

  // Caso 3: alt-text only
  const span = `<span class="symbol-render--alt-text-only" role="img" aria-label="${escapeHtml(props.altText)}" data-symbol-id="${escapeHtml(props.symbol.id)}" data-locale="${props.locale}">${escapeHtml(props.altText)}</span>`;
  return { html: span, fallbackUsed: 'html' };
}

/** Resolve dimensões em pixels para um set de props. */
export function resolveDimensions(props: SymbolRenderProps): RenderDimensions {
  if (props.size === 'custom' && props.customSize !== undefined) {
    return {
      width: props.customSize.customWidthPx,
      height: props.customSize.customHeightPx,
    };
  }
  return LOADING_SIZES[props.size as Exclude<RenderSize, 'custom'>];
}

/** Renderiza um SVG placeholder geométrico respeitoso (não o símbolo real). */
export function renderPlaceholderSvg(
  symbol: SacredSymbolRef,
  dims: RenderDimensions,
  altText: string,
  locale: SupportedLocale,
): string {
  // Hex placeholder neutro (não reproduz o símbolo real — respeitoso)
  const hex = generateHexPlaceholder(symbol.id);
  const respectTag = symbol.sacredUseOnly === true ? ' data-sacred="true"' : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${String(dims.width)}" height="${String(dims.height)}" role="img" aria-label="${escapeHtml(altText)}" data-symbol-id="${escapeHtml(symbol.id)}" data-tradition="${escapeHtml(symbol.tradition)}" data-sensitivity="${String(symbol.sensitivityLevel)}" data-locale="${locale}"${respectTag}><polygon points="${hex}" fill="currentColor" opacity="0.7"/></svg>`;
}

/** Gera um padrão hex placeholder (geométrico, não-representacional). */
export function generateHexPlaceholder(seed: string): string {
  // Hash determinístico do id → 6 vértices para hexágono regular
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const cx = 50;
  const cy = 50;
  const r = 40 + (h % 10);
  const pts: string[] = [];
  for (let i = 0; i < 6; i += 1) {
    const angle = (Math.PI / 3) * i + (h % 360) * (Math.PI / 180);
    const x = (cx + r * Math.cos(angle)).toFixed(2);
    const y = (cy + r * Math.sin(angle)).toFixed(2);
    pts.push(`${x},${y}`);
  }
  return pts.join(' ');
}

// ============================================================================
// SEÇÃO 22 — CUSTOMIZAÇÃO (PRESETS)
// ============================================================================

/** Aplica um preset sobre as props base. Mescla chaves, priorizando props. */
export function applyPreset(props: SymbolRenderProps, preset: RenderPreset): SymbolRenderProps {
  const base = RENDER_PRESETS[preset];
  // Merge: base é default, props sobrescreve
  return {
    symbol: props.symbol ?? base.symbol,
    size: props.size,
    customSize: props.customSize ?? base.customSize,
    altText: props.altText || base.altText,
    lazy: props.lazy ?? base.lazy,
    fallback: props.fallback ?? base.fallback,
    respectReducedMotion: props.respectReducedMotion ?? base.respectReducedMotion,
    locale: props.locale ?? base.locale,
    onLoad: props.onLoad ?? base.onLoad,
    onError: props.onError ?? base.onError,
  };
}

/** Retorna todas as variantes como union discriminada. */
export function componentVariants(): readonly ComponentVariant[] {
  return RENDER_PRESET_VARIANTS;
}

/** Retorna preset por nome (ou undefined se inválido). */
export function getPreset(preset: RenderPreset): ComponentVariant | undefined {
  return RENDER_PRESET_VARIANTS.find((v) => v.preset === preset);
}

// ============================================================================
// SEÇÃO 23 — I18N
// ============================================================================

/** Verifica se locale é suportado. */
export function isSupportedLocale(loc: string): loc is SupportedLocale {
  return LOCALES.includes(loc as SupportedLocale);
}

/** Alt-text respeitoso default por tradição (fallback quando prop ausente). */
export function defaultAltForTradition(tradition: RenderTradition): string {
  const map: Readonly<Record<RenderTradition, string>> = {
    christianity: 'Símbolo cristão',
    islam: 'Símbolo islâmico',
    judaism: 'Símbolo judaico',
    buddhism: 'Símbolo budista',
    hinduism: 'Símbolo hindu',
    candomble: 'Símbolo de Candomblé',
    ifa: 'Símbolo de Ifá',
    umbanda: 'Símbolo de Umbanda',
    taoism: 'Símbolo taoísta',
    indigenous: 'Símbolo indígena',
    syncretic: 'Símbolo sincrético',
    spiritualist: 'Símbolo espiritualista',
  };
  return map[tradition];
}

/**
 * Decide se um respect notice deve ser exibido dado o contexto.
 * Mostra sempre para símbolos sagrados (sensitivity ≥4) e nunca em
 * presets wiki-card (que assumem contexto educativo).
 */
export function shouldShowRespectNotice(
  tradition: RenderTradition,
  context: { readonly isSacred: boolean; readonly isEducational: boolean },
): boolean {
  if (context.isEducational === true) return false;
  if (context.isSacred === true) return true;
  // Para tradições sensíveis, mostra por padrão
  return (
    tradition === 'candomble'
    || tradition === 'ifa'
    || tradition === 'umbanda'
    || tradition === 'indigenous'
  );
}

/** Retorna respect notice para (tradição, locale). */
export function getRespectNotice(
  tradition: RenderTradition,
  locale: SupportedLocale,
): RespectNotice | undefined {
  return RESPECT_NOTICES.find((n) => n.tradition === tradition && n.locale === locale)
    ?? RESPECT_NOTICES.find((n) => n.tradition === tradition);
}

// ============================================================================
// SEÇÃO 24 — LGPD
// ============================================================================

/** Concede consentimento a um viewer para um nível. */
export function consentToRenderLevel(
  level: SensitivityLevel,
  viewerId: string,
  optInToggle: boolean = true,
): RenderConsent {
  const required = requireConsentForLevel(level);
  return {
    viewerId,
    level,
    required,
    granted: optInToggle,
    missingAction: defaultConsentActionForLevel(level),
  };
}

/** Verifica se um viewer tem consentimento válido para um nível. */
export function verifyViewerConsent(
  viewerId: string,
  level: SensitivityLevel,
  consents: readonly Consent[] = [],
): ConsentCheckResult {
  const checkedAt = new Date().toISOString();
  const matching = consents.find((c) => c.viewerId === viewerId && c.level === level);
  if (matching === undefined) {
    return {
      viewerId,
      level,
      hasConsent: false,
      reason: 'no_consent_recorded',
      checkedAt,
    };
  }
  if (matching.expiresAt !== undefined && new Date(matching.expiresAt).getTime() < Date.now()) {
    return {
      viewerId,
      level,
      hasConsent: false,
      reason: 'expired',
      checkedAt,
    };
  }
  if (matching.optInToggle === false && CONSENT_REQUIRED_LEVELS.includes(level)) {
    return {
      viewerId,
      level,
      hasConsent: false,
      reason: 'opt_in_required',
      checkedAt,
    };
  }
  return {
    viewerId,
    level,
    hasConsent: true,
    reason: 'sufficient',
    checkedAt,
  };
}

/** Registra uma entrada de auditoria. */
export function auditRender(
  viewerId: string,
  symbolId: string,
  timestamp: string = new Date().toISOString(),
  locale: SupportedLocale = 'pt-BR',
): RenderAuditEntry {
  return {
    viewerId,
    symbolId,
    timestamp,
    locale,
    state: 'loaded',
  };
}

/** Exporta auditoria em formato pedido (LGPD Art. 18 — acesso). */
export function exportRenderAudit(
  viewerId: string,
  format: 'json' | 'csv' | 'xml',
  entries: readonly RenderAuditEntry[] = [],
): ExportArtifact {
  const filtered = entries.filter((e) => e.viewerId === viewerId);
  const generatedAt = new Date().toISOString();
  let content: string;
  if (format === 'json') {
    content = JSON.stringify(filtered, null, 2);
  } else if (format === 'csv') {
    const header = 'viewerId,symbolId,timestamp,locale,state';
    const rows = filtered.map((e) => `${e.viewerId},${e.symbolId},${e.timestamp},${e.locale},${e.state}`);
    content = [header, ...rows].join('\n');
  } else {
    const xmlItems = filtered
      .map(
        (e) =>
          `<entry><viewerId>${escapeXml(e.viewerId)}</viewerId><symbolId>${escapeXml(e.symbolId)}</symbolId><timestamp>${escapeXml(e.timestamp)}</timestamp><locale>${escapeXml(e.locale)}</locale><state>${escapeXml(e.state)}</state></entry>`,
      )
      .join('');
    content = `<?xml version="1.0" encoding="UTF-8"?><audit viewerId="${escapeXml(viewerId)}" generatedAt="${generatedAt}">${xmlItems}</audit>`;
  }
  return {
    format,
    content,
    generatedAt,
    viewerId,
    entryCount: filtered.length,
  };
}

/** Deleta entradas de auditoria (LGPD Art. 18 — esquecimento). */
export function deleteRenderAudit(
  viewerId: string,
  scope: 'all' | 'before' | 'after',
  entries: readonly RenderAuditEntry[] = [],
  cutoff?: string,
): DeletionReceipt {
  let removed = 0;
  const beforeLen = entries.length;
  let kept: readonly RenderAuditEntry[] = entries;
  if (scope === 'all') {
    removed = entries.filter((e) => e.viewerId === viewerId).length;
    kept = entries.filter((e) => e.viewerId !== viewerId);
  } else if (scope === 'before' && cutoff !== undefined) {
    const ts = new Date(cutoff).getTime();
    removed = entries.filter((e) => e.viewerId === viewerId && new Date(e.timestamp).getTime() < ts).length;
    kept = entries.filter((e) => !(e.viewerId === viewerId && new Date(e.timestamp).getTime() < ts));
  } else if (scope === 'after' && cutoff !== undefined) {
    const ts = new Date(cutoff).getTime();
    removed = entries.filter((e) => e.viewerId === viewerId && new Date(e.timestamp).getTime() > ts).length;
    kept = entries.filter((e) => !(e.viewerId === viewerId && new Date(e.timestamp).getTime() > ts));
  }
  const receiptId = `del-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`;
  return {
    viewerId,
    deletedCount: beforeLen - kept.length,
    deletedAt: new Date().toISOString(),
    scope,
    ...(cutoff !== undefined ? { cutoff } : {}),
    receiptId,
  };
}

// ============================================================================
// SEÇÃO 25 — UTILITÁRIOS GERAIS
// ============================================================================

/**
 * Compara SymbolRenderProps por igualdade estrutural rasa (memoization helper).
 */
export function equalProps(a: SymbolRenderProps, b: SymbolRenderProps): boolean {
  if (a.symbol.id !== b.symbol.id) return false;
  if (a.symbol.tradition !== b.symbol.tradition) return false;
  if (a.symbol.sensitivityLevel !== b.symbol.sensitivityLevel) return false;
  if (a.size !== b.size) return false;
  if (a.locale !== b.locale) return false;
  if (a.altText !== b.altText) return false;
  if ((a.lazy ?? false) !== (b.lazy ?? false)) return false;
  if ((a.fallback ?? 'placeholder') !== (b.fallback ?? 'placeholder')) return false;
  if ((a.respectReducedMotion ?? false) !== (b.respectReducedMotion ?? false)) return false;
  if ((a.symbol.sacredUseOnly ?? false) !== (b.symbol.sacredUseOnly ?? false)) return false;
  return true;
}

/**
 * Decide se props devem disparar update no componente (memoization skip).
 */
export function shouldUpdate(prev: SymbolRenderProps, next: SymbolRenderProps): boolean {
  return !equalProps(prev, next);
}

/** Retorna tamanhos responsivos apropriados para um viewport. */
export function getResponsiveSizes(viewport: { readonly width: number; readonly height: number }): RenderSize[] {
  if (viewport.width < 384) return ['xs', 'sm', 'md'];
  if (viewport.width < 768) return ['sm', 'md', 'lg'];
  if (viewport.width < 1280) return ['md', 'lg', 'xl'];
  return ['lg', 'xl', 'custom'];
}

/** Helper para gerar o nome do arquivo HTML para download. */
export function generateHtmlFilename(props: SymbolRenderProps): string {
  return `symbol-${props.symbol.id}-${props.size}-${props.locale}.html`;
}

// ============================================================================
// SEÇÃO 26 — ESCAPE HELPERS (SSR-SAFE)
// ============================================================================

/** Escapa HTML para uso em SSR. */
export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Escapa XML para uso em export. */
export function escapeXml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// ============================================================================
// SEÇÃO 27 — INTEGRAÇÃO / EXPORTS CONSOLIDADOS
// ============================================================================

/** Versão semver do render component. */
export const RENDER_COMPONENT_VERSION: string = '1.0.0';

/** URL canônica para a documentação do render component. */
export const RENDER_COMPONENT_DOCS_URL: string =
  '/docs/w49/symbol-render-component';

/** Sumário do component para dashboards. */
export interface ComponentSummary {
  readonly name: 'SymbolRender';
  readonly version: string;
  readonly supportedLocales: readonly SupportedLocale[];
  readonly supportedSizes: readonly RenderSize[];
  readonly sensitivityLevels: readonly SensitivityLevel[];
  readonly presetCount: number;
  readonly noticeCount: number;
}

/** Retorna sumário do component. */
export function getComponentSummary(): ComponentSummary {
  return {
    name: 'SymbolRender',
    version: RENDER_COMPONENT_VERSION,
    supportedLocales: LOCALES,
    supportedSizes: ['xs', 'sm', 'md', 'lg', 'xl', 'custom'],
    sensitivityLevels: [1, 2, 3, 4, 5],
    presetCount: RENDER_PRESET_VARIANTS.length,
    noticeCount: RESPECT_NOTICES.length,
  };
}

/**
 * Runner de smoke tests internos. Retorna contadores pass/fail e a lista
 * completa de resultados para verificação.
 */
export interface SmokeResult {
  readonly name: string;
  readonly ok: boolean;
  readonly error?: string;
}

export function runSmokeTests(): {
  readonly passed: number;
  readonly failed: number;
  readonly results: readonly SmokeResult[];
} {
  const results: SmokeResult[] = [];
  const push = (name: string, ok: boolean, error?: string): void => {
    results.push(error !== undefined ? { name, ok, error } : { name, ok });
  };

  // 1) Constantes
  push('consts.max_cache', MAX_CACHE_ENTRIES === 50);
  push('consts.locales', LOCALES.length === 3);
  push('consts.fallback_priority', FALLBACK_PRIORITY.length === 3);
  push('consts.recoverable_states', RECOVERABLE_STATES.length === 2);

  // 2) Default consent
  push('consent.level_1', DEFAULT_LEVEL_CONSENT[1] === 'opt-in');
  push('consent.level_5', DEFAULT_LEVEL_CONSENT[5] === 'community');

  // 3) requireConsentForLevel
  push('req.level_3_false', requireConsentForLevel(3) === false);
  push('req.level_4_true', requireConsentForLevel(4) === true);

  // 4) Loading sizes
  push('size.md', LOADING_SIZES.md.width === 96);
  push('size.xl', LOADING_SIZES.xl.height === 384);

  // 5) SymbolRenderController lifecycle
  const ctrl = new SymbolRenderController();
  let observed: RenderState[] = [];
  const unsub = ctrl.subscribe((s) => {
    observed.push(s);
  });
  ctrl.setSymbol({
    id: 'cross',
    name: 'Cruz',
    tradition: 'christianity',
    sensitivityLevel: 2,
    preferredSize: 'md',
  });
  push('ctrl.state.loading', ctrl.getState() === 'loading');
  ctrl.setState('loaded');
  push('ctrl.state.loaded', ctrl.getState() === 'loaded');
  push('ctrl.subscribers', ctrl.subscriberCount() === 1);
  push('ctrl.observed', observed.length >= 2);
  unsub();
  push('ctrl.unsub', ctrl.subscriberCount() === 0);
  ctrl.reset();

  // 6) shouldBlockForSensitivity
  push('block.level_1_false', shouldBlockForSensitivity(1, []).blocked === false);
  push('block.level_4_no_consent', shouldBlockForSensitivity(4, []).blocked === true);
  push(
    'block.level_4_with_consent',
    shouldBlockForSensitivity(4, [
      {
        viewerId: 'u1',
        level: 4,
        grantedAt: new Date().toISOString(),
        optInToggle: true,
      },
    ]).blocked === false,
  );

  // 7) wcagCheck
  const w = wcagCheck({
    symbol: {
      id: 'cross',
      name: 'Cruz',
      tradition: 'christianity',
      sensitivityLevel: 2,
      preferredSize: 'md',
    },
    size: 'md',
    altText: 'Cruz cristã',
    locale: 'pt-BR',
  });
  push('wcag.passed', w.passed);
  const wEmpty = wcagCheck({
    symbol: {
      id: 'cross',
      name: 'Cruz',
      tradition: 'christianity',
      sensitivityLevel: 2,
      preferredSize: 'md',
    },
    size: 'md',
    altText: '',
    locale: 'pt-BR',
  });
  push('wcag.alt_missing', wEmpty.passed === false);

  // 8) renderSymbolToHTML
  const r = renderSymbolToHTML({
    symbol: {
      id: 'cross',
      name: 'Cruz',
      tradition: 'christianity',
      sensitivityLevel: 2,
      preferredSize: 'md',
    },
    size: 'md',
    altText: 'Cruz cristã',
    locale: 'pt-BR',
    fallback: 'placeholder',
  });
  push('ssr.has_svg', r.html.includes('<svg'));
  push('ssr.fallback_svg', r.fallbackUsed === 'svg');

  // 9) cacheKey
  const k1 = cacheKey({
    symbol: {
      id: 'cross',
      name: 'Cruz',
      tradition: 'christianity',
      sensitivityLevel: 2,
      preferredSize: 'md',
    },
    size: 'md',
    altText: 'Cruz',
    locale: 'pt-BR',
  });
  const k2 = cacheKey({
    symbol: {
      id: 'lotus',
      name: 'Lótus',
      tradition: 'buddhism',
      sensitivityLevel: 2,
      preferredSize: 'md',
    },
    size: 'md',
    altText: 'Lótus',
    locale: 'pt-BR',
  });
  push('cache.different', k1 !== k2);

  // 10) shouldEvictFromCache
  push('evict.old', shouldEvictFromCache('k', Date.now() - 60 * 60 * 1000, Date.now()) === true);
  push('evict.fresh', shouldEvictFromCache('k', Date.now(), Date.now()) === false);

  // 11) getAltTextVariations (3 variações)
  const vars = getAltTextVariations(
    {
      id: 'cross',
      name: 'Cruz',
      tradition: 'christianity',
      sensitivityLevel: 2,
      preferredSize: 'md',
    },
    'pt-BR',
  );
  push('alt.3_variations', vars.length === 3);
  push('alt.first_has_name', vars[0] !== undefined && vars[0].includes('Cruz'));

  // 12) LGPD
  const c = consentToRenderLevel(4, 'user-1');
  push('consent.required', c.required === true);
  const v = verifyViewerConsent('user-1', 4, [
    {
      viewerId: 'user-1',
      level: 4,
      grantedAt: new Date().toISOString(),
      optInToggle: true,
    },
  ]);
  push('consent.verified', v.hasConsent === true);
  const audit = auditRender('user-1', 'cross');
  push('audit.entry', audit.viewerId === 'user-1');
  const exp = exportRenderAudit('user-1', 'json', [audit]);
  push('export.json', exp.format === 'json' && exp.entryCount === 1);
  const del = deleteRenderAudit('user-1', 'all', [audit]);
  push('delete.receipt', del.deletedCount === 1);

  // 13) symbolFromRegistry (com mock)
  const mockReg: RegistryShape = {
    symbols: [
      {
        id: 'cross',
        name: 'Cruz',
        tradition: 'christianity',
        culturalSensitivity: 2,
        renderSpec: { url: '/img/cross.svg' },
        preferredSize: 'md',
      },
    ],
    findById: (id) => mockReg.symbols.find((s) => s.id === id),
  };
  const ref = symbolFromRegistry('cross', mockReg);
  push('registry.found', ref.id === 'cross' && ref.tradition === 'christianity');
  let missingThrew = false;
  try {
    symbolFromRegistry('nope', mockReg);
  } catch (e) {
    missingThrew = e instanceof SymbolNotInRegistryError;
  }
  push('registry.missing_throws', missingThrew);

  // 14) resolveRenderURL
  const signed = resolveRenderURL(ref);
  push('signed.has_sig', signed.signature.length > 0);
  push('signed.has_expires', signed.expiresAt.length > 0);

  // 15) applyPreset
  const preset = applyPreset(
    {
      symbol: {
        id: 'opon-ifa',
        name: 'Opón Ifá',
        tradition: 'ifa',
        sensitivityLevel: 5,
        preferredSize: 'md',
        sacredUseOnly: true,
      },
      size: 'lg',
      altText: 'Opón Ifá',
      locale: 'pt-BR',
      fallback: 'placeholder',
    },
    'community-share',
  );
  push('preset.size_applied', preset.size === 'lg');

  // 16) getResponsiveSizes
  push('responsive.mobile', getResponsiveSizes({ width: 360, height: 800 })[0] === 'xs');
  push('responsive.desktop', getResponsiveSizes({ width: 1920, height: 1080 })[0] === 'lg');

  // 17) defaultAltForTradition
  push('alt.default', defaultAltForTradition('candomble') === 'Símbolo de Candomblé');

  // 18) shouldShowRespectNotice
  push('notice.sacred', shouldShowRespectNotice('ifa', { isSacred: true, isEducational: false }) === true);
  push('notice.edu_hidden', shouldShowRespectNotice('ifa', { isSacred: true, isEducational: true }) === false);

  // 19) errorCodeForState
  push('err.idle', errorCodeForState('idle') === 'SRE_000');
  push('err.error', errorCodeForState('error') === 'SRE_RUNTIME');

  // 20) shouldUpdate
  const base = {
    symbol: {
      id: 'cross',
      name: 'Cruz',
      tradition: 'christianity' as const,
      sensitivityLevel: 2 as const,
      preferredSize: 'md' as const,
    },
    size: 'md' as const,
    altText: 'Cruz',
    locale: 'pt-BR' as const,
  };
  push('update.same', shouldUpdate(base, base) === false);
  push('update.diff', shouldUpdate(base, { ...base, size: 'lg' }) === true);

  const passed = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok).length;
  return { passed, failed, results };
}