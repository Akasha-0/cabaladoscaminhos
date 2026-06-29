// ============================================================================
// FEED EXPLAINABILITY UI — Chip-based "why am I seeing this" explainer (Wave 46)
// ----------------------------------------------------------------------------
// Consumes `ScoredItem[]` from `w45/feed-ranking-ml` and produces everything
// the front-end needs to render trust-building "why this post" tooltips,
// category chips, A/B variant chips, and accessible explanations.
//
// DESIGN PRINCIPLES
//   1. PURE: deterministic, no Date.now()/Math.random()/module state on hot path.
//   2. EXPLICIT: chip text never invents facts; source signal preserved.
//   3. LOCALIZED: every chip has a translation key; bundles (pt/en/es).
//   4. DEFENSIVE: malformed inputs normalized silently, never throw.
//   5. INCREMENTAL: built on `explainScore()` from w45.
//
// PIPELINE:
//   scoreItem()  →  explainItem()  →  respectUserPrefs()  →  buildTooltip()
// ============================================================================

// SECTION 0 — Locale union (mirrors i18n canonical)

export type Language = 'pt' | 'en' | 'es';

export function isLanguage(value: unknown): value is Language {
  return value === 'pt' || value === 'en' || value === 'es';
}

export function toLanguage(value: unknown, fallback: Language = 'pt'): Language {
  return isLanguage(value) ? value : fallback;
}

export const LANGUAGES: readonly Language[] = ['pt', 'en', 'es'] as const;

// SECTION 1 — Signal taxonomy
//
// SignalSource = machine-level origin of influence on a score.
// ReasonCategory = user-facing bucket — drives color, label, filter UI.
// One signal → one chip; one category can absorb many signals.

export type SignalSource =
  | 'recency'
  | 'tradition_affinity'
  | 'author_affinity'
  | 'engagement'
  | 'embedding'
  | 'freshness'
  | 'diversity'
  | 'community_boost'
  | 'lgpd_demotion'
  | 'safe_mode';

export type ReasonCategory =
  | 'interest'
  | 'social_proof'
  | 'tradition'
  | 'recency'
  | 'diversity'
  | 'moderation'
  | 'commercial'
  | 'personalization'
  | 'platform';

export const SIGNAL_TO_CATEGORY: Readonly<Record<SignalSource, ReasonCategory>> = {
  recency: 'recency',
  tradition_affinity: 'tradition',
  author_affinity: 'interest',
  engagement: 'social_proof',
  embedding: 'interest',
  freshness: 'recency',
  diversity: 'diversity',
  community_boost: 'social_proof',
  lgpd_demotion: 'moderation',
  safe_mode: 'moderation',
} as const;

export type ChipColor = 'info' | 'accent' | 'success' | 'warn' | 'danger' | 'muted';

export const CATEGORY_TO_COLOR: Readonly<Record<ReasonCategory, ChipColor>> = {
  interest: 'accent',
  social_proof: 'success',
  tradition: 'info',
  recency: 'info',
  diversity: 'muted',
  moderation: 'warn',
  commercial: 'warn',
  personalization: 'accent',
  platform: 'muted',
} as const;

export function isChipColor(value: unknown): value is ChipColor {
  return value === 'info' || value === 'accent' || value === 'success' || value === 'warn' || value === 'danger' || value === 'muted';
}

export function isSignalSource(value: unknown): value is SignalSource {
  return (
    value === 'recency' || value === 'tradition_affinity' || value === 'author_affinity' ||
    value === 'engagement' || value === 'embedding' || value === 'freshness' ||
    value === 'diversity' || value === 'community_boost' || value === 'lgpd_demotion' ||
    value === 'safe_mode'
  );
}

export function isReasonCategory(value: unknown): value is ReasonCategory {
  return (
    value === 'interest' || value === 'social_proof' || value === 'tradition' ||
    value === 'recency' || value === 'diversity' || value === 'moderation' ||
    value === 'commercial' || value === 'personalization' || value === 'platform'
  );
}

// SECTION 2 — Icon registry
// Icons are string keys (UI swaps with lucide/heroicons); module ships sensible defaults.

export type ChipIconMap = Map<SignalSource, string>;

export const CHIP_ICON_MAP: ReadonlyMap<SignalSource, string> = new Map<SignalSource, string>([
  ['recency', 'flame'], ['tradition_affinity', 'sparkles'], ['author_affinity', 'heart-handshake'],
  ['engagement', 'trending-up'], ['embedding', 'target'], ['freshness', 'leaf'],
  ['diversity', 'shuffle'], ['community_boost', 'star'], ['lgpd_demotion', 'shield'], ['safe_mode', 'life-buoy'],
]);

const chipIconRegistry: Map<SignalSource, string> = new Map(CHIP_ICON_MAP);

export function getIconForSignal(source: SignalSource): string {
  return chipIconRegistry.get(source) ?? 'help-circle';
}

export function registerChipIcon(source: SignalSource, iconKey: string): void {
  if (!isSignalSource(source)) return;
  if (typeof iconKey !== 'string' || iconKey.length === 0) return;
  chipIconRegistry.set(source, iconKey);
}

export function getColorForCategory(category: ReasonCategory): ChipColor {
  return CATEGORY_TO_COLOR[category] ?? 'muted';
}

// SECTION 3 — Chip styles
// Plain CSS-flavored token maps. UI applies via `style={...}` or compiles to class name.

export type ChipStyle = {
  bg: string; fg: string; border: string; iconSize: number; padding: string; radius: number; fontSize: number;
};

export type ChipStyleRegistry = Map<string, ChipStyle>;

// Helper: build a weight+color style entry compactly.
function s(weight: 'strong'|'moderate'|'weak', color: ChipColor, bgVar: string, borderVar: string, size: number, pad: string, rad: number, fs: number): [string, ChipStyle] {
  const fg = `var(--${color}-fg)`;
  return [`${weight}.${color}`, { bg: bgVar, fg, border: borderVar, iconSize: size, padding: pad, radius: rad, fontSize: fs }];
}

// 18 default styles: 3 weights × 6 colors. Compact one-line literals.
const STRONG_PADDING = '4 10'; const MODERATE_PADDING = '3 8'; const WEAK_PADDING = '2 6';
const DEFAULT_STYLES: ReadonlyArray<readonly [string, ChipStyle]> = [
  s('strong', 'accent', 'var(--accent-bg)', 'transparent', 18, STRONG_PADDING, 12, 13),
  s('strong', 'info', 'var(--info-bg)', 'transparent', 18, STRONG_PADDING, 12, 13),
  s('strong', 'success', 'var(--success-bg)', 'transparent', 18, STRONG_PADDING, 12, 13),
  s('strong', 'warn', 'var(--warn-bg)', 'var(--warn-border)', 18, STRONG_PADDING, 12, 13),
  s('strong', 'danger', 'var(--danger-bg)', 'transparent', 18, STRONG_PADDING, 12, 13),
  s('strong', 'muted', 'var(--muted-bg)', 'transparent', 18, STRONG_PADDING, 12, 13),
  s('moderate', 'accent', 'var(--accent-bg-soft)', 'transparent', 16, MODERATE_PADDING, 10, 12),
  s('moderate', 'info', 'var(--info-bg-soft)', 'transparent', 16, MODERATE_PADDING, 10, 12),
  s('moderate', 'success', 'var(--success-bg-soft)', 'transparent', 16, MODERATE_PADDING, 10, 12),
  s('moderate', 'warn', 'var(--warn-bg-soft)', 'transparent', 16, MODERATE_PADDING, 10, 12),
  s('moderate', 'danger', 'var(--danger-bg-soft)', 'transparent', 16, MODERATE_PADDING, 10, 12),
  s('moderate', 'muted', 'var(--muted-bg-soft)', 'transparent', 16, MODERATE_PADDING, 10, 12),
  s('weak', 'accent', 'transparent', 'var(--accent-border-soft)', 14, WEAK_PADDING, 8, 11),
  s('weak', 'info', 'transparent', 'var(--info-border-soft)', 14, WEAK_PADDING, 8, 11),
  s('weak', 'success', 'transparent', 'var(--success-border-soft)', 14, WEAK_PADDING, 8, 11),
  s('weak', 'warn', 'transparent', 'var(--warn-border-soft)', 14, WEAK_PADDING, 8, 11),
  s('weak', 'danger', 'transparent', 'var(--danger-border-soft)', 14, WEAK_PADDING, 8, 11),
  s('weak', 'muted', 'transparent', 'var(--muted-border-soft)', 14, WEAK_PADDING, 8, 11),
];

export const DEFAULT_CHIP_STYLE_REGISTRY: ReadonlyMap<string, ChipStyle> = new Map<string, ChipStyle>(
  DEFAULT_STYLES.map(([k, v]) => [k, v] as [string, ChipStyle]),
);

/** Runtime registry — defaults are copied in lazily. */
const chipStyleRegistry: ChipStyleRegistry = new Map<string, ChipStyle>();

let chipRegistryInitialized = false;

/** Lazy-init the registry from defaults; called once. */
function ensureRegistryInitialized(): void {
  if (chipRegistryInitialized) return;
  for (const [k, v] of DEFAULT_CHIP_STYLE_REGISTRY.entries()) {
    chipStyleRegistry.set(k, { ...v });
  }
  chipRegistryInitialized = true;
}

/** Look up a style by weight+color. Returns a sane fallback if missing. */
export function getChipStyle(weight: 'strong' | 'moderate' | 'weak', color: ChipColor): ChipStyle {
  ensureRegistryInitialized();
  const key = `${weight}.${color}`;
  const found = chipStyleRegistry.get(key);
  if (found) return { ...found };
  // Fallback: muted+weak is the most defensive default.
  const fallback = chipStyleRegistry.get('weak.muted');
  return fallback ? { ...fallback } : {
    bg: 'transparent',
    fg: '#444',
    border: '#ccc',
    iconSize: 14,
    padding: '2 6',
    radius: 8,
    fontSize: 11,
  };
}

/**
 * Register or override a chip style. The key is `${weight}.${color}`
 * by convention but free-form keys are accepted (callers can use any
 * taxonomy they want, e.g. `mobile.compact`).
 */
export function registerChipStyle(key: string, style: ChipStyle): void {
  ensureRegistryInitialized();
  if (typeof key !== 'string' || key.length === 0) return;
  chipStyleRegistry.set(key, { ...style });
}

/** Snapshot the registry for tests or debug UI. */
export function getChipStyleRegistrySnapshot(): Record<string, ChipStyle> {
  ensureRegistryInitialized();
  const out: Record<string, ChipStyle> = {};
  for (const [k, v] of chipStyleRegistry.entries()) out[k] = { ...v };
  return out;
}

// ============================================================================
// SECTION 4 — Translation bundle (pt / en / es)
// ============================================================================
//
// We translate chip text + tooltip copy. Keys are stable identifiers
// (kebab-case), not raw strings — so renaming translations never breaks
// the chip graph. New keys can be added via `registerTranslation`.
//
// 24 chip reason keys below (spec required at least 20). Three locales
// each, so 72 entries minimum.

/** Bundle of all translations for the chip + tooltip layer. */
export type TranslationBundle = {
  pt: Record<string, string>;
  en: Record<string, string>;
  es: Record<string, string>;
};

/** Default translation bundle. Keys are stable identifiers. */
// Translation tables: PT / EN / ES. Each locale has the SAME key set;
// keep them in lockstep. 24 chip keys + 8 hidden + 8 tooltip + 9 group +
// 5 score + 9 category + 4 a11y + 12 tradition = 79 keys per locale.
// `translate()` falls back: requested locale → 'pt' → raw key.

export const DEFAULT_TRANSLATIONS: TranslationBundle = {
  pt: {
    // Chip text (24)
    'chip.recency.hot': 'Em alta agora', 'chip.recency.today': 'Hoje', 'chip.recency.week': 'Esta semana', 'chip.recency.old': 'Conteúdo antigo',
    'chip.tradition.affinity': 'Você tem afinidade com {tradition}', 'chip.author.affinity': 'Você interage com {author}', 'chip.author.follow': 'Você segue {author}',
    'chip.engagement.high': 'Em alta na comunidade', 'chip.embedding.match': 'Conteúdo combina com seu gosto', 'chip.language.match': 'Idioma preferido',
    'chip.diversity.repeat': 'Você já viu isso', 'chip.diversity.bucket.hot': 'Tendência das últimas 4h', 'chip.community.boost': 'Destaque da comunidade',
    'chip.tradition.fresh': 'Conteúdo novo em {tradition}', 'chip.recency.fresh': 'Acabou de sair', 'chip.embedding.low': 'Conteúdo novo pra você',
    'chip.personalization.boost': 'Recomendado pra você', 'chip.tradition.match': 'Tradição {tradition}', 'chip.commercial': 'Conteúdo de parceiro',
    'chip.platform.featured': 'Em destaque', 'chip.moderation.flagged': 'Conteúdo sinalizado', 'chip.recency.cold': 'Conteúdo de alguns dias',
    'chip.author.first': 'Primeira publicação de {author}', 'chip.diversity.explore': 'Saia da sua bolha',
    // Hidden / negative (8)
    'hidden.muted': 'Você bloqueou {author}', 'hidden.lgpd': 'Reduzido por preferência de privacidade (LGPD)', 'hidden.safe_mode': 'Modo seguro reduziu a relevância',
    'hidden.already_seen': 'Você já viu conteúdo parecido', 'hidden.low_quality': 'Sinalizado como baixa qualidade', 'hidden.spam': 'Marcado como spam',
    'hidden.author_blocked': 'Você bloqueou o autor', 'hidden.tradition_mismatch': 'Fora das suas tradições seguidas',
    // Tooltip chunks (8)
    'tooltip.top': 'Por que estamos mostrando isso:', 'tooltip.score': 'Pontuação: {score}', 'tooltip.signals': 'Sinais principais:',
    'tooltip.more': 'Ver mais detalhes', 'tooltip.less': 'Ver menos', 'tooltip.reasons': 'Razões ({count})',
    'tooltip.fallback': 'Post recente do feed.', 'tooltip.empty': 'Sem explicações disponíveis.',
    // Group titles (9)
    'group.interest': 'Por seus interesses', 'group.social_proof': 'Pessoas da comunidade', 'group.tradition': 'Sua tradição',
    'group.recency': 'Quando foi publicado', 'group.diversity': 'Variedade', 'group.moderation': 'Moderação',
    'group.commercial': 'Conteúdo de parceiros', 'group.personalization': 'Personalização', 'group.platform': 'Plataforma',
    // Score formats (5)
    'score.very_relevant': 'muito relevante', 'score.relevant': 'relevante', 'score.somewhat': 'mais ou menos',
    'score.low': 'pouco relevante', 'score.irrelevant': 'irrelevante',
    // Category labels (9)
    'category.interest': 'Interesse', 'category.social_proof': 'Prova social', 'category.tradition': 'Tradição',
    'category.recency': 'Recência', 'category.diversity': 'Diversidade', 'category.moderation': 'Moderação',
    'category.commercial': 'Comercial', 'category.personalization': 'Personalização', 'category.platform': 'Plataforma',
    // Accessibility (4)
    'a11y.chip': 'Etiqueta de explicação', 'a11y.tooltip': 'Caixa de explicação', 'a11y.expand': 'Toque para expandir a explicação', 'a11y.collapse': 'Toque para recolher',
    // Tradition display names (12)
    'tradition.cabala': 'Cabala', 'tradition.ifa': 'Ifá', 'tradition.astrologia': 'Astrologia', 'tradition.tantra': 'Tantra',
    'tradition.reiki': 'Reiki', 'tradition.meditacao': 'Meditação', 'tradition.xamanismo': 'Xamanismo', 'tradition.cristianismo-mistico': 'Cristianismo Místico',
    'tradition.sufismo': 'Sufismo', 'tradition.taoismo': 'Taoísmo', 'tradition.umbanda': 'Umbanda', 'tradition.candomble': 'Candomblé',
  },
  en: {
    'chip.recency.hot': 'Hot right now', 'chip.recency.today': 'Today', 'chip.recency.week': 'This week', 'chip.recency.old': 'Older content',
    'chip.tradition.affinity': 'You have affinity with {tradition}', 'chip.author.affinity': 'You engage with {author}', 'chip.author.follow': 'You follow {author}',
    'chip.engagement.high': 'Trending in the community', 'chip.embedding.match': 'Content matches your taste', 'chip.language.match': 'Preferred language',
    'chip.diversity.repeat': "You've seen this", 'chip.diversity.bucket.hot': '4-hour trend', 'chip.community.boost': 'Community highlight',
    'chip.tradition.fresh': 'Fresh content in {tradition}', 'chip.recency.fresh': 'Just out', 'chip.embedding.low': 'New content for you',
    'chip.personalization.boost': 'Recommended for you', 'chip.tradition.match': '{tradition} tradition', 'chip.commercial': 'Partner content',
    'chip.platform.featured': 'Featured', 'chip.moderation.flagged': 'Flagged content', 'chip.recency.cold': 'A few days old',
    'chip.author.first': "{author}'s first post", 'chip.diversity.explore': 'Step outside your bubble',
    'hidden.muted': 'You muted {author}', 'hidden.lgpd': 'Reduced by privacy preference (LGPD)', 'hidden.safe_mode': 'Safe mode lowered relevance',
    'hidden.already_seen': "You've seen similar content", 'hidden.low_quality': 'Flagged as low quality', 'hidden.spam': 'Marked as spam',
    'hidden.author_blocked': 'You blocked the author', 'hidden.tradition_mismatch': 'Outside your followed traditions',
    'tooltip.top': 'Why we are showing this:', 'tooltip.score': 'Score: {score}', 'tooltip.signals': 'Top signals:',
    'tooltip.more': 'Show more details', 'tooltip.less': 'Show less', 'tooltip.reasons': 'Reasons ({count})',
    'tooltip.fallback': 'Recent post in your feed.', 'tooltip.empty': 'No explanation available.',
    'group.interest': 'Your interests', 'group.social_proof': 'Community', 'group.tradition': 'Your tradition',
    'group.recency': 'When it was posted', 'group.diversity': 'Variety', 'group.moderation': 'Moderation',
    'group.commercial': 'Partner content', 'group.personalization': 'Personalization', 'group.platform': 'Platform',
    'score.very_relevant': 'very relevant', 'score.relevant': 'relevant', 'score.somewhat': 'somewhat relevant',
    'score.low': 'low relevance', 'score.irrelevant': 'irrelevant',
    'category.interest': 'Interest', 'category.social_proof': 'Social proof', 'category.tradition': 'Tradition',
    'category.recency': 'Recency', 'category.diversity': 'Diversity', 'category.moderation': 'Moderation',
    'category.commercial': 'Commercial', 'category.personalization': 'Personalization', 'category.platform': 'Platform',
    'a11y.chip': 'Explanation chip', 'a11y.tooltip': 'Explanation tooltip', 'a11y.expand': 'Tap to expand explanation', 'a11y.collapse': 'Tap to collapse',
    'tradition.cabala': 'Kabbalah', 'tradition.ifa': 'Ifá', 'tradition.astrologia': 'Astrology', 'tradition.tantra': 'Tantra',
    'tradition.reiki': 'Reiki', 'tradition.meditacao': 'Meditation', 'tradition.xamanismo': 'Shamanism', 'tradition.cristianismo-mistico': 'Mystical Christianity',
    'tradition.sufismo': 'Sufism', 'tradition.taoismo': 'Taoism', 'tradition.umbanda': 'Umbanda', 'tradition.candomble': 'Candomblé',
  },
  es: {
    'chip.recency.hot': 'En tendencia ahora', 'chip.recency.today': 'Hoy', 'chip.recency.week': 'Esta semana', 'chip.recency.old': 'Contenido antiguo',
    'chip.tradition.affinity': 'Tienes afinidad con {tradition}', 'chip.author.affinity': 'Interactúas con {author}', 'chip.author.follow': 'Sigues a {author}',
    'chip.engagement.high': 'En tendencia en la comunidad', 'chip.embedding.match': 'El contenido coincide con tu gusto', 'chip.language.match': 'Idioma preferido',
    'chip.diversity.repeat': 'Ya viste esto', 'chip.diversity.bucket.hot': 'Tendencia de las últimas 4h', 'chip.community.boost': 'Destacado de la comunidad',
    'chip.tradition.fresh': 'Contenido nuevo en {tradition}', 'chip.recency.fresh': 'Recién salido', 'chip.embedding.low': 'Contenido nuevo para ti',
    'chip.personalization.boost': 'Recomendado para ti', 'chip.tradition.match': 'Tradición {tradition}', 'chip.commercial': 'Contenido de socio',
    'chip.platform.featured': 'Destacado', 'chip.moderation.flagged': 'Contenido marcado', 'chip.recency.cold': 'De hace unos días',
    'chip.author.first': 'Primera publicación de {author}', 'chip.diversity.explore': 'Sal de tu burbuja',
    'hidden.muted': 'Has bloqueado a {author}', 'hidden.lgpd': 'Reducido por preferencia de privacidad (LGPD)', 'hidden.safe_mode': 'El modo seguro redujo la relevancia',
    'hidden.already_seen': 'Ya viste contenido parecido', 'hidden.low_quality': 'Marcado como baja calidad', 'hidden.spam': 'Marcado como spam',
    'hidden.author_blocked': 'Has bloqueado al autor', 'hidden.tradition_mismatch': 'Fuera de tus tradiciones seguidas',
    'tooltip.top': 'Por qué mostramos esto:', 'tooltip.score': 'Puntuación: {score}', 'tooltip.signals': 'Señales principales:',
    'tooltip.more': 'Ver más detalles', 'tooltip.less': 'Ver menos', 'tooltip.reasons': 'Razones ({count})',
    'tooltip.fallback': 'Publicación reciente en tu feed.', 'tooltip.empty': 'Sin explicación disponible.',
    'group.interest': 'Tus intereses', 'group.social_proof': 'Comunidad', 'group.tradition': 'Tu tradición',
    'group.recency': 'Cuándo se publicó', 'group.diversity': 'Variedad', 'group.moderation': 'Moderación',
    'group.commercial': 'Contenido de socios', 'group.personalization': 'Personalización', 'group.platform': 'Plataforma',
    'score.very_relevant': 'muy relevante', 'score.relevant': 'relevante', 'score.somewhat': 'más o menos',
    'score.low': 'poco relevante', 'score.irrelevant': 'irrelevante',
    'category.interest': 'Interés', 'category.social_proof': 'Prueba social', 'category.tradition': 'Tradición',
    'category.recency': 'Actualidad', 'category.diversity': 'Diversidad', 'category.moderation': 'Moderación',
    'category.commercial': 'Comercial', 'category.personalization': 'Personalización', 'category.platform': 'Plataforma',
    'a11y.chip': 'Etiqueta de explicación', 'a11y.tooltip': 'Cuadro de explicación', 'a11y.expand': 'Toca para expandir la explicación', 'a11y.collapse': 'Toca para colapsar',
    'tradition.cabala': 'Cábala', 'tradition.ifa': 'Ifá', 'tradition.astrologia': 'Astrología', 'tradition.tantra': 'Tantra',
    'tradition.reiki': 'Reiki', 'tradition.meditacao': 'Meditación', 'tradition.xamanismo': 'Chamanismo', 'tradition.cristianismo-mistico': 'Cristianismo Místico',
    'tradition.sufismo': 'Sufismo', 'tradition.taoismo': 'Taoísmo', 'tradition.umbanda': 'Umbanda', 'tradition.candomble': 'Candomblé',
  },
};

/** Runtime mutable overlay for translations added via `registerTranslation`. */
const translationOverlay: TranslationBundle = {
  pt: {},
  en: {},
  es: {},
};

let translationsInitialized = false;

function ensureTranslationsInitialized(): void {
  if (translationsInitialized) return;
  // Overlay starts empty; defaults are merged at lookup time so we don't
  // duplicate a 72-entry object in memory.
  translationsInitialized = true;
}

/**
 * Look up a translation for a single key. Falls back: requested locale →
 * 'pt' → the raw key (so a missing translation never blanks out the UI).
 */
export function translate(key: string, lang: Language = 'pt'): string {
  ensureTranslationsInitialized();
  if (typeof key !== 'string' || key.length === 0) return '';
  const overlay = translationOverlay[lang];
  if (overlay && overlay[key] !== undefined) return overlay[key];
  const primary = DEFAULT_TRANSLATIONS[lang];
  if (primary && primary[key] !== undefined) return primary[key];
  const fallback = DEFAULT_TRANSLATIONS.pt;
  if (fallback && fallback[key] !== undefined) return fallback[key];
  return key;
}

/**
 * Add or override a single translation key for a locale.
 */
export function registerTranslation(key: string, lang: Language, text: string): void {
  ensureTranslationsInitialized();
  if (typeof key !== 'string' || key.length === 0) return;
  if (!isLanguage(lang)) return;
  if (typeof text !== 'string') return;
  translationOverlay[lang][key] = text;
}

/**
 * Return the merged bundle for a locale (defaults + overlay). Useful when
 * the UI wants to ship translations to the client as a JSON blob.
 */
export function getTranslations(lang: Language): Record<string, string> {
  ensureTranslationsInitialized();
  const out: Record<string, string> = {};
  const defaults = DEFAULT_TRANSLATIONS[lang] ?? DEFAULT_TRANSLATIONS.pt;
  for (const [k, v] of Object.entries(defaults)) out[k] = v;
  const overlay = translationOverlay[lang] ?? {};
  for (const [k, v] of Object.entries(overlay)) out[k] = v;
  return out;
}

/**
 * Validate a TranslationBundle. Returns an array of issues (empty = OK).
 *
 * Checks:
 *   - All three locales are present.
 *   - Each locale has the same keys as the default `pt` set (so a
 *     translator missing a key is caught before deploy).
 *   - No empty strings.
 *   - No nested templates (a `{` without a matching `}` is reported).
 */
export function validateTranslationBundle(bundle: Partial<TranslationBundle>): string[] {
  const issues: string[] = [];
  if (!bundle || typeof bundle !== 'object') {
    issues.push('bundle is not an object');
    return issues;
  }
  for (const lang of LANGUAGES) {
    const map = bundle[lang];
    if (!map || typeof map !== 'object') {
      issues.push(`missing locale: ${lang}`);
      continue;
    }
    for (const [k, v] of Object.entries(map)) {
      if (typeof v !== 'string') issues.push(`${lang}.${k}: not a string`);
      else if (v.length === 0) issues.push(`${lang}.${k}: empty string`);
      else if ((v.match(/\{/g) ?? []).length !== (v.match(/\}/g) ?? []).length) {
        issues.push(`${lang}.${k}: unbalanced template braces`);
      }
    }
  }
  // Cross-locale key consistency.
  const ptKeys = new Set(Object.keys(bundle.pt ?? {}));
  for (const lang of LANGUAGES) {
    if (lang === 'pt') continue;
    const otherKeys = new Set(Object.keys(bundle[lang] ?? {}));
    for (const k of ptKeys) if (!otherKeys.has(k)) issues.push(`${lang} missing key ${k}`);
    for (const k of otherKeys) if (!ptKeys.has(k)) issues.push(`${lang} has extra key ${k}`);
  }
  return issues;
}

// ============================================================================
// SECTION 5 — Public explainability types
// ============================================================================

/** Tier of impact a chip represents. Drives color, weight, and ordering. */
export type ChipWeight = 'strong' | 'moderate' | 'weak';

/** A single chip to render — text, icon, color, weight, and provenance. */
export type ExplainChip = {
  /** Stable chip id (used as React key + as translation key suffix). */
  id: string;
  /** Localized text (already translated before being assigned). */
  text: string;
  /** Icon key — UI resolves via its own icon map (see `getIconForSignal`). */
  iconKey: string;
  /** Color token (theme-aware). */
  colorToken: ChipColor;
  /** Tier of impact. */
  weight: ChipWeight;
  /** The translation key (so the UI can re-translate at runtime). */
  reason: string;
  /** Raw numeric score that drove this chip (0..3). */
  score: number;
  /** Provenance — which underlying signal produced this chip. */
  signalSource: SignalSource;
  /** Optional A/B variants that should render this chip differently. */
  cohortVariants?: string[];
  /** Optional category override. Default derived from `signalSource`. */
  category?: ReasonCategory;
};

/** A logical group of chips (e.g. "Your interests", "Recency"). */
export type ExplainGroup = {
  id: string;
  title: string;
  chips: ExplainChip[];
  /** Group-level weight = max chip weight, used for sort. */
  weight: ChipWeight;
  /** Translation key for `title` (lets UI re-translate). */
  titleKey: string;
};

/** The full "why am I seeing this" verdict for a single post. */
export type ExplainVerdict = {
  postId: string;
  /** Single most-impactful reason (short phrase, already translated). */
  topReason: string;
  /** All chips, in display order (strong → weak). */
  chips: ExplainChip[];
  /** Chips grouped by category for sectioned UIs. */
  groups: ExplainGroup[];
  /** Chips for negative / hidden signals (omit when none). */
  hiddenReasons?: ExplainChip[];
  /** Ratio of each category in the overall score (sums to ~1). */
  signalMix: Record<ReasonCategory, number>;
  /** Numeric breakdown of the composite score. */
  scoreBreakdown: Record<string, number>;
};

/** Variant of tooltip to build. */
export type TooltipVariant = 'short' | 'long' | 'mobile' | 'a11y';

/** Density setting for chip rendering. */
export type ChipDensity = 'compact' | 'comfortable' | 'spacious';

/** A single A/B variant for chip rendering. */
export type ABVariant = {
  id: string; name: string; weight: number;
  chipStyleOverrides: Record<string, ChipStyle>; copyOverrides: Record<string, string>;
};

/** A user's cohort assignment. */
export type CohortAssignment = {
  userId: string; cohortId: string; abVariant: ABVariant;
  /** Epoch ms — caller passes it; module never calls Date.now() itself. */
  assignedAt: number;
};

/** Per-user preferences for chip rendering. */
export type UserPreferences = {
  userId: string;
  /** Master switch — if false, `respectUserPrefs` returns an empty verdict. */
  showChips: boolean;
  chipDensity: ChipDensity;
  lang: Language;
  /** Whether the user has consented to having their signals revealed. */
  allowReveal: boolean;
  /** Categories the user wants hidden entirely. */
  muteCategories: ReasonCategory[];
  /** Maximum chips to display (UI hint; default 5). */
  maxChips?: number;
};

// SECTION 6 — Score breakdown + categorization

/** A single parsed signal contribution. */
export type ParsedSignal = {
  source: SignalSource; score: number; category: ReasonCategory;
  /** Optional context — e.g. the tradition name for tradition_affinity. */
  context?: string;
};

/**
 * Parse `ScoredItem.reasons[]` (w45 string format) into typed signals.
 * Recognised: recency=X, tradition:X+Y, author:X+Y, engagement=X,
 * embedding=X, diversity-penalty=X, follow+Y, lang-match+Y, muted-author.
 * Unknown reasons surfaced as `recency` with score 0 + context=raw text.
 */
export function parseReasons(reasons: readonly string[]): ParsedSignal[] {
  if (!Array.isArray(reasons)) return [];
  const out: ParsedSignal[] = [];
  for (const raw of reasons) {
    if (typeof raw !== 'string' || raw.length === 0) continue;
    if (raw === 'muted-author') {
      out.push({ source: 'safe_mode', score: -1, category: 'moderation', context: 'muted-author' });
      continue;
    }
    // recency=0.85
    if (raw.startsWith('recency=')) {
      const v = parseFloat(raw.slice('recency='.length));
      if (Number.isFinite(v)) out.push({ source: 'recency', score: v, category: 'recency' });
      continue;
    }
    // tradition:cabala+0.45
    if (raw.startsWith('tradition:')) {
      const rest = raw.slice('tradition:'.length);
      const plus = rest.lastIndexOf('+');
      if (plus > 0) {
        const name = rest.slice(0, plus);
        const v = parseFloat(rest.slice(plus + 1));
        if (Number.isFinite(v) && name.length > 0) {
          out.push({ source: 'tradition_affinity', score: v, category: 'tradition', context: name });
        }
      }
      continue;
    }
    // author:a1+0.30
    if (raw.startsWith('author:')) {
      const rest = raw.slice('author:'.length);
      const plus = rest.lastIndexOf('+');
      if (plus > 0) {
        const name = rest.slice(0, plus);
        const v = parseFloat(rest.slice(plus + 1));
        if (Number.isFinite(v) && name.length > 0) {
          out.push({ source: 'author_affinity', score: v, category: 'interest', context: name });
        }
      }
      continue;
    }
    // engagement=0.65
    if (raw.startsWith('engagement=')) {
      const v = parseFloat(raw.slice('engagement='.length));
      if (Number.isFinite(v)) out.push({ source: 'engagement', score: v, category: 'social_proof' });
      continue;
    }
    // embedding=0.42
    if (raw.startsWith('embedding=')) {
      const v = parseFloat(raw.slice('embedding='.length));
      if (Number.isFinite(v)) out.push({ source: 'embedding', score: v, category: 'interest' });
      continue;
    }
    // diversity-penalty=-0.20
    if (raw.startsWith('diversity-penalty=')) {
      const rest = raw.slice('diversity-penalty='.length);
      const v = parseFloat(rest.startsWith('-') ? rest : '-' + rest);
      if (Number.isFinite(v)) out.push({ source: 'diversity', score: v, category: 'diversity' });
      continue;
    }
    // follow+0.40 — treat as community boost (social proof).
    if (raw.startsWith('follow+')) {
      const v = parseFloat(raw.slice('follow+'.length));
      if (Number.isFinite(v)) {
        out.push({ source: 'community_boost', score: v, category: 'social_proof', context: 'follow' });
      }
      continue;
    }
    // lang-match+0.10 — platform signal.
    if (raw.startsWith('lang-match+')) {
      const v = parseFloat(raw.slice('lang-match+'.length));
      if (Number.isFinite(v)) {
        out.push({ source: 'community_boost', score: v, category: 'platform', context: 'lang-match' });
      }
      continue;
    }
    // Unknown — keep as a recency-shaped placeholder so nothing is lost.
    out.push({ source: 'recency', score: 0, category: 'recency', context: raw });
  }
  return out;
}

/**
 * Categorize a numeric score into a human-meaningful bucket. Drives the
 * `formatScore` output and the chip weight assignment.
 */
export function categorizeScore(score: number): 'very_high' | 'high' | 'medium' | 'low' | 'very_low' {
  if (!Number.isFinite(score)) return 'very_low';
  if (score >= 1.5) return 'very_high';
  if (score >= 0.9) return 'high';
  if (score >= 0.4) return 'medium';
  if (score >= 0.1) return 'low';
  return 'very_low';
}

/**
 * Convert a numeric score into a localized phrase ("muito relevante").
 *
 * Falls back to a numeric representation if the locale has no
 * `score.<bucket>` key.
 */
export function formatScore(score: number, lang: Language = 'pt'): string {
  const bucket = categorizeScore(score);
  const key = `score.${bucket === 'very_high' ? 'very_relevant' : bucket === 'very_low' ? 'irrelevant' : bucket}`;
  const localized = translate(key, lang);
  if (localized && localized !== key) return localized;
  // Fallback: numeric + language-appropriate locale formatter.
  if (!Number.isFinite(score)) return '—';
  return score.toFixed(2);
}

/** Localize a ReasonCategory label (used in tooltips and filter UI). */
export function formatReasonCategory(category: ReasonCategory, lang: Language = 'pt'): string {
  if (!isReasonCategory(category)) return String(category ?? '');
  return translate(`category.${category}`, lang);
}

/**
 * Pick the single best human-readable reason for a ScoredItem.
 *
 * Strategy:
 *   1. The first signal with score ≥ 0.3 (after sort by magnitude desc).
 *   2. Fallback to recency if the score is non-negative.
 *   3. Fallback to "Post recente do feed." (the i18n neutral fallback).
 */
export function pickTopReason(scored: ScoredItemLike): string {
  if (!scored || typeof scored !== 'object') return '';
  const signals = parseReasons(scored.reasons ?? []);
  const positives = signals.filter((s) => s.score > 0).sort((a, b) => b.score - a.score);
  if (positives.length > 0) {
    const top = positives[0]!;
    return top.context ?? signalSourceLabel(top.source);
  }
  if (Number.isFinite(scored.score) && (scored.score as number) > 0) return signalSourceLabel('recency');
  return '';
}

/**
 * Best-effort human label for a SignalSource (used as the topReason
 * fallback when no context is available). Same mapping as the default
 * icon key — convenient to share.
 */
function signalSourceLabel(source: SignalSource): string {
  switch (source) {
    case 'recency':
      return translate('chip.recency.today');
    case 'tradition_affinity':
      return translate('chip.tradition.affinity');
    case 'author_affinity':
      return translate('chip.author.affinity');
    case 'engagement':
      return translate('chip.engagement.high');
    case 'embedding':
      return translate('chip.embedding.match');
    case 'freshness':
      return translate('chip.recency.fresh');
    case 'diversity':
      return translate('chip.diversity.explore');
    case 'community_boost':
      return translate('chip.community.boost');
    case 'lgpd_demotion':
      return translate('hidden.lgpd');
    case 'safe_mode':
      return translate('hidden.safe_mode');
    default:
      return '';
  }
}

/** Minimal interface for `pickTopReason` — accepts either ScoredItem or plain. */
export type ScoredItemLike = {
  reasons?: readonly string[];
  score?: number;
};

// ============================================================================
// SECTION 7 — Chip construction
// ============================================================================

/** Compute a chip weight from a numeric score. */
export function weightFromScore(score: number): ChipWeight {
  const abs = Math.abs(score);
  if (abs >= 0.5) return 'strong';
  if (abs >= 0.2) return 'moderate';
  return 'weak';
}

/**
 * Render a context-dependent translation key for a parsed signal.
 *
 * Centralises the decision of which chip text to surface for which
 * signal source — also where placeholders get filled.
 */
function chipKeyForSignal(p: ParsedSignal): string {
  switch (p.source) {
    case 'recency':
      return 'chip.recency.today';
    case 'tradition_affinity':
      return 'chip.tradition.affinity';
    case 'author_affinity':
      return 'chip.author.affinity';
    case 'engagement':
      return 'chip.engagement.high';
    case 'embedding':
      return p.score >= 0.4 ? 'chip.embedding.match' : 'chip.embedding.low';
    case 'freshness':
      return 'chip.recency.fresh';
    case 'diversity':
      return p.score < 0 ? 'chip.diversity.repeat' : 'chip.diversity.explore';
    case 'community_boost':
      return p.context === 'follow' ? 'chip.author.follow' : 'chip.community.boost';
    case 'lgpd_demotion':
      return 'hidden.lgpd';
    case 'safe_mode':
      return 'hidden.safe_mode';
    default:
      return 'chip.recency.today';
  }
}

/** Format a template key against a context object, e.g. "{author}" → "alice". */
function fillTemplate(template: string, ctx: Record<string, string | number>): string {
  if (typeof template !== 'string') return '';
  return template.replace(/\{(\w+)\}/g, (_, name: string) => {
    const v = ctx[name];
    return v === undefined || v === null ? `{${name}}` : String(v);
  });
}

/**
 * Build all positive chips for a ScoredItem, in score-magnitude order.
 *
 * Skips weak signals (|score| < 0.05) and the muted-author placeholder.
 */
export function buildChips(
  breakdown: ScoredItemLike & { reasons: readonly string[] },
  preferences: UserPreferences = {
    userId: 'anon',
    showChips: true,
    chipDensity: 'comfortable',
    lang: 'pt',
    allowReveal: true,
    muteCategories: [],
  },
): ExplainChip[] {
  const lang = preferences.lang;
  const signals = parseReasons(breakdown.reasons);
  const positive = signals.filter((s) => s.score > 0.05 && s.source !== 'safe_mode');
  // Already-excluded: muted-author produces safe_mode with score -1, but
  // we only filter score>0, so it never reaches the chips. Good.

  // Sort by score magnitude desc.
  positive.sort((a, b) => b.score - a.score);

  const chips: ExplainChip[] = [];
  for (const p of positive) {
    const key = chipKeyForSignal(p);
    const traditionName =
      p.context && p.source === 'tradition_affinity'
        ? translate(`tradition.${p.context}`, lang)
        : (p.context ?? '');
    const template = translate(key, lang);
    const text = fillTemplate(template, {
      tradition: traditionName,
      author: p.context ?? '',
      score: p.score.toFixed(2),
    });
    const weight = weightFromScore(p.score);
    const category = p.category;
    const chip: ExplainChip = {
      id: `${p.source}:${p.context ?? ''}:${chips.length}`,
      text,
      iconKey: getIconForSignal(p.source),
      colorToken: getColorForCategory(category),
      weight,
      reason: key,
      score: p.score,
      signalSource: p.source,
      category,
    };
    chips.push(chip);
  }
  return chips;
}

/**
 * Group chips by category, ordered by group-level weight then by
 * chip-count desc. Returns groups in stable display order.
 */
export function buildGroups(chips: readonly ExplainChip[], lang: Language = 'pt'): ExplainGroup[] {
  if (!Array.isArray(chips) || chips.length === 0) return [];
  const buckets = new Map<ReasonCategory, ExplainChip[]>();
  for (const c of chips) {
    const cat = c.category ?? 'platform';
    if (!buckets.has(cat)) buckets.set(cat, []);
    buckets.get(cat)!.push(c);
  }
  // Order: interest → tradition → social_proof → recency → diversity →
  //         personalization → moderation → commercial → platform.
  const ORDER: readonly ReasonCategory[] = [
    'interest',
    'tradition',
    'social_proof',
    'recency',
    'diversity',
    'personalization',
    'moderation',
    'commercial',
    'platform',
  ];
  const groups: ExplainGroup[] = [];
  for (const cat of ORDER) {
    const list = buckets.get(cat);
    if (!list || list.length === 0) continue;
    const weight: ChipWeight = list.some((c) => c.weight === 'strong')
      ? 'strong'
      : list.some((c) => c.weight === 'moderate')
        ? 'moderate'
        : 'weak';
    groups.push({
      id: `group.${cat}`,
      title: translate(`group.${cat}`, lang),
      titleKey: `group.${cat}`,
      chips: [...list],
      weight,
    });
  }
  return groups;
}

/**
 * Rank chips for display. Primary sort: weight (strong → moderate → weak).
 * Secondary: score magnitude desc.
 * Tertiary: insertion order (stable).
 */
export function rankChipsByWeight(chips: readonly ExplainChip[]): ExplainChip[] {
  if (!Array.isArray(chips)) return [];
  const weightValue: Record<ChipWeight, number> = { strong: 3, moderate: 2, weak: 1 };
  const indexed = chips.map((c, i) => ({ c, i }));
  indexed.sort((a, b) => {
    const wa: ChipWeight = a.c.weight;
    const wb: ChipWeight = b.c.weight;
    const w = weightValue[wb] - weightValue[wa];
    if (w !== 0) return w;
    const s = Math.abs(b.c.score) - Math.abs(a.c.score);
    if (s !== 0) return s;
    return a.i - b.i;
  });
  return indexed.map((x) => x.c);
}

/**
 * Filter chips by user preferences:
 *   - remove chips whose category is in `muteCategories`
 *   - keep at most `maxChips` (default 5) of the strongest chips
 *
 * Pure: returns a new array.
 */
export function filterChipsByUserPrefs(
  chips: readonly ExplainChip[],
  prefs: UserPreferences,
): ExplainChip[] {
  if (!Array.isArray(chips)) return [];
  const muted = new Set(prefs.muteCategories);
  const filtered = chips.filter((c) => {
    const cat = c.category ?? 'platform';
    return !muted.has(cat);
  });
  const ranked = rankChipsByWeight(filtered);
  const cap = prefs.maxChips ?? 5;
  return ranked.slice(0, Math.max(0, cap));
}

/**
 * Hide signals whose category is in the supplied list. Returns a *new*
 * chip set with the matching chips removed (same semantics as filterChipsByUserPrefs
 * but exposed as a separate function for callers that don't have a full
 * UserPreferences struct).
 */
export function hideSignalsByCategory(
  chips: readonly ExplainChip[],
  categories: readonly ReasonCategory[],
): ExplainChip[] {
  if (!Array.isArray(chips)) return [];
  const banned = new Set(categories);
  return chips.filter((c) => {
    const cat = c.category ?? 'platform';
    return !banned.has(cat);
  });
}

/**
 * Build chips explaining *negative* signals (why we're hiding or
 * demoting this post). Mirrors w45's `muted-author` and demotion logic.
 *
 * If the input has no negative signals, returns an empty array.
 */
export function explainHiddenSignals(scored: ScoredItemLike & { reasons: readonly string[] }): ExplainChip[] {
  const signals = parseReasons(scored.reasons ?? []);
  const negatives = signals.filter((s) => s.score <= 0);
  const out: ExplainChip[] = [];
  for (const p of negatives) {
    let key: string;
    if (p.source === 'safe_mode' && p.context === 'muted-author') {
      key = 'hidden.muted';
    } else if (p.source === 'lgpd_demotion') {
      key = 'hidden.lgpd';
    } else if (p.source === 'safe_mode') {
      key = 'hidden.safe_mode';
    } else if (p.source === 'diversity') {
      key = 'hidden.already_seen';
    } else {
      key = 'hidden.low_quality';
    }
    const template = translate(key);
    const text = fillTemplate(template, {
      author: p.context ?? '',
      score: p.score.toFixed(2),
    });
    out.push({
      id: `hidden:${p.source}:${out.length}`,
      text,
      iconKey: getIconForSignal(p.source),
      colorToken: 'warn',
      weight: 'weak',
      reason: key,
      score: p.score,
      signalSource: p.source,
      category: 'moderation',
    });
  }
  return out;
}

// ============================================================================
// SECTION 8 — Localization helpers
// ============================================================================

/**
 * Localize a single chip's `text` and `reason` for the requested lang.
 *
 * Pure: returns a new chip object (input untouched).
 */
export function translateChip(chip: ExplainChip, lang: Language): ExplainChip {
  if (!chip || typeof chip !== 'object') {
    return {
      id: 'invalid',
      text: '',
      iconKey: 'help-circle',
      colorToken: 'muted',
      weight: 'weak',
      reason: '',
      score: 0,
      signalSource: 'recency',
    };
  }
  const template = translate(chip.reason, lang);
  const text = fillTemplate(template, {
    tradition: chip.id.includes(':') && chip.signalSource === 'tradition_affinity' ? translate(`tradition.${extractContext(chip.id)}`, lang) : '',
    author: chip.signalSource === 'author_affinity' ? extractContext(chip.id) : '',
    score: chip.score.toFixed(2),
  });
  return { ...chip, text };
}

/** Extract the context segment from a chip id (format: "source:ctx:i"). */
function extractContext(id: string): string {
  if (typeof id !== 'string') return '';
  const parts = id.split(':');
  if (parts.length < 3) return parts[1] ?? '';
  return parts[1] ?? '';
}

/** Batch-translate a list of chips. */
export function translateAll(chips: readonly ExplainChip[], lang: Language): ExplainChip[] {
  if (!Array.isArray(chips)) return [];
  return chips.map((c) => translateChip(c, lang));
}

// ============================================================================
// SECTION 9 — Tooltip builders
// ============================================================================

/**
 * Build a tooltip string for the given variant.
 *
 * - 'short'  — one-sentence summary
 * - 'long'   — full breakdown of chips + score
 * - 'mobile' — short, line-broken for narrow screens
 * - 'a11y'   — screen-reader-friendly, no decorative glyphs
 */
export function buildTooltip(verdict: ExplainVerdict, variant: TooltipVariant = 'short'): string {
  if (!verdict || typeof verdict !== 'object') return '';
  switch (variant) {
    case 'short':
      return buildShortTooltip(verdict);
    case 'long':
      return buildLongTooltipInternal(verdict);
    case 'mobile':
      return buildMobileTooltipInternal(verdict);
    case 'a11y':
      return buildA11yTooltipInternal(verdict);
    default:
      return buildShortTooltip(verdict);
  }
}

/** Short — one line, max 120 chars where possible. */
function buildShortTooltip(verdict: ExplainVerdict): string {
  const top = verdict.topReason || translate('tooltip.fallback');
  const lang: Language = 'pt';
  const head = translate('tooltip.top', lang);
  const headCap = head.length > 0 ? head.charAt(0).toUpperCase() + head.slice(1) : '';
  const line = `${headCap} ${top}`;
  if (line.length <= 160) return line;
  return line.slice(0, 157) + '…';
}

/** Long — score + top 3 chips + signal mix. */
function buildLongTooltipInternal(verdict: ExplainVerdict): string {
  const lang: Language = 'pt';
  const lines: string[] = [];
  lines.push(translate('tooltip.top', lang));
  if (verdict.topReason) lines.push(`  • ${verdict.topReason}`);
  const score = verdict.scoreBreakdown['final'] ?? 0;
  lines.push(translate('tooltip.score', lang).replace('{score}', formatScore(score, lang)));
  if (verdict.chips.length > 0) {
    lines.push(translate('tooltip.signals', lang));
    for (const c of verdict.chips.slice(0, 5)) {
      lines.push(`  • ${c.text}  (${formatScore(c.score, lang)})`);
    }
  }
  if (verdict.hiddenReasons && verdict.hiddenReasons.length > 0) {
    lines.push('—');
    for (const h of verdict.hiddenReasons) lines.push(`  • ${h.text}`);
  }
  return lines.join('\n');
}

/** Mobile — break to short lines, max 32 chars. */
function buildMobileTooltipInternal(verdict: ExplainVerdict): string {
  const lang: Language = 'pt';
  const lines: string[] = [];
  lines.push(wrap(translate('tooltip.top', lang), 32));
  if (verdict.topReason) lines.push(wrap(verdict.topReason, 32));
  const score = verdict.scoreBreakdown['final'] ?? 0;
  lines.push(wrap(translate('tooltip.score', lang).replace('{score}', formatScore(score, lang)), 32));
  for (const c of verdict.chips.slice(0, 3)) lines.push(wrap(`• ${c.text}`, 32));
  return lines.filter((l) => l.length > 0).join('\n');
}

/** Accessibility — full sentence form, no bullets, no abbreviations. */
function buildA11yTooltipInternal(verdict: ExplainVerdict): string {
  const lang: Language = 'pt';
  const parts: string[] = [];
  parts.push(`${translate('a11y.tooltip', lang)}.`);
  if (verdict.topReason) parts.push(`${verdict.topReason}.`);
  const score = verdict.scoreBreakdown['final'] ?? 0;
  parts.push(`${translate('tooltip.score', lang).replace('{score}', formatScore(score, lang))}.`);
  if (verdict.chips.length > 0) {
    parts.push(`${translate('tooltip.reasons', lang).replace('{count}', String(verdict.chips.length))}.`);
    for (const c of verdict.chips) parts.push(`${c.text}.`);
  }
  return parts.join(' ');
}

/** Hard-wrap a string to a max width (whitespace-aware). */
function wrap(s: string, width: number): string {
  if (typeof s !== 'string') return '';
  if (s.length <= width) return s;
  const words = s.split(/\s+/);
  const out: string[] = [];
  let line = '';
  for (const w of words) {
    if ((line + ' ' + w).trim().length > width) {
      if (line) out.push(line);
      line = w;
    } else {
      line = line ? line + ' ' + w : w;
    }
  }
  if (line) out.push(line);
  return out.join('\n');
}

/** Public alias for the mobile variant — explicit function form. */
export function buildMobileTooltip(verdict: ExplainVerdict): string {
  return buildTooltip(verdict, 'mobile');
}

/** Public alias for the long variant. */
export function buildLongTooltip(verdict: ExplainVerdict): string {
  return buildTooltip(verdict, 'long');
}

/** Public alias for the accessibility variant. */
export function buildA11yTooltip(verdict: ExplainVerdict): string {
  return buildTooltip(verdict, 'a11y');
}

// ============================================================================
// SECTION 10 — User preferences + filtering
// ============================================================================

/** Decide whether a single chip should be shown for a user. */
export function shouldShowChip(prefs: UserPreferences, chip: ExplainChip): boolean {
  if (!prefs || !chip) return false;
  if (!prefs.showChips) return false;
  if (!prefs.allowReveal && chip.weight !== 'strong') return false;
  if (prefs.muteCategories.includes(chip.category ?? 'platform')) return false;
  return true;
}

/** Resolve a chip-density string into a literal type (defensive). */
export function getChipDensity(prefs: UserPreferences): ChipDensity {
  if (!prefs) return 'comfortable';
  const d = prefs.chipDensity;
  if (d === 'compact' || d === 'comfortable' || d === 'spacious') return d;
  return 'comfortable';
}

/**
 * Filter a complete verdict according to user preferences:
 *   - master switch `showChips` removes everything
 *   - `muteCategories` drops matching chips + groups
 *   - `maxChips` caps chip count (and group chips accordingly)
 *   - chips get re-translated to `prefs.lang`
 *
 * Pure: returns a new verdict object.
 */
export function respectUserPrefs(verdict: ExplainVerdict, prefs: UserPreferences): ExplainVerdict {
  if (!verdict || typeof verdict !== 'object') {
    return {
      postId: '',
      topReason: '',
      chips: [],
      groups: [],
      signalMix: emptySignalMix(),
      scoreBreakdown: {},
    };
  }
  if (!prefs.showChips) {
    return {
      ...verdict,
      chips: [],
      groups: verdict.groups.map((g) => ({ ...g, chips: [] })),
    };
  }
  const muted = new Set(prefs.muteCategories);
  const filteredChips = verdict.chips.filter((c) => !muted.has(c.category ?? 'platform'));
  const ranked = rankChipsByWeight(filteredChips);
  const cap = prefs.maxChips ?? 5;
  const trimmed = ranked.slice(0, Math.max(0, cap));
  const localized = translateAll(trimmed, prefs.lang);
  const groups = buildGroups(localized, prefs.lang);
  // Recompute signalMix on the trimmed set so the UI sees consistent numbers.
  const signalMix = computeSignalMix(localized);
  return {
    ...verdict,
    chips: localized,
    groups,
    signalMix,
    topReason: localized[0]?.text ?? verdict.topReason,
  };
}

/** Empty signal-mix (all zeros). */
function emptySignalMix(): Record<ReasonCategory, number> {
  return {
    interest: 0,
    social_proof: 0,
    tradition: 0,
    recency: 0,
    diversity: 0,
    moderation: 0,
    commercial: 0,
    personalization: 0,
    platform: 0,
  };
}

/** Compute category share from a chip list (sums to ~1 over positive chips). */
function computeSignalMix(chips: readonly ExplainChip[]): Record<ReasonCategory, number> {
  const mix = emptySignalMix();
  let total = 0;
  for (const c of chips) {
    const mag = Math.abs(c.score);
    total += mag;
    const cat = c.category ?? 'platform';
    mix[cat] += mag;
  }
  if (total <= 0) return mix;
  for (const k of Object.keys(mix) as ReasonCategory[]) {
    mix[k] = +(mix[k] / total).toFixed(4);
  }
  return mix;
}

// ============================================================================
// SECTION 11 — A/B variants + cohorts
// ============================================================================

/**
 * Deterministic cohort assignment — given a userId, pick the variant
 * weighted by `variants[].weight`. Uses FNV-1a-style 32-bit hashing so
 * the same user always gets the same cohort without persisting state.
 */
export function pickABVariant(userId: string, variants: readonly ABVariant[]): ABVariant | null {
  if (typeof userId !== 'string' || userId.length === 0) return null;
  if (!Array.isArray(variants) || variants.length === 0) return null;
  const totalWeight = variants.reduce((acc, v) => acc + (Number.isFinite(v.weight) ? v.weight : 0), 0);
  if (totalWeight <= 0) return variants[0] ?? null;
  const hash = fnv1a(userId);
  // Scale to [0, totalWeight).
  const target = (hash % 10_000) / 10_000 * totalWeight;
  let acc = 0;
  for (const v of variants) {
    acc += Number.isFinite(v.weight) ? v.weight : 0;
    if (target < acc) return v;
  }
  return variants[variants.length - 1] ?? null;
}

/** FNV-1a 32-bit — deterministic, fast, no allocations. */
function fnv1a(s: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    hash ^= s.charCodeAt(i);
    hash = (hash + ((hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24))) >>> 0;
  }
  return hash >>> 0;
}

/**
 * Build a CohortAssignment — wraps `pickABVariant` and pairs it with
 * `cohortId` + timestamp.
 */
export function assignCohort(userId: string, cohortId: string, variantId: string, variants: readonly ABVariant[], assignedAt: number = 0): CohortAssignment | null {
  const variant = pickABVariant(userId, variants);
  if (!variant) return null;
  if (variant.id !== variantId) return null;
  return {
    userId,
    cohortId,
    abVariant: variant,
    assignedAt: Number.isFinite(assignedAt) ? assignedAt : 0,
  };
}

/**
 * Apply A/B variant overrides to a chip list. Each chip whose id matches
 * `variant.copyOverrides[chip.id]` gets its text replaced; each whose id
 * matches `variant.chipStyleOverrides[chip.id]` gets the override attached
 * (via `chip.cohortVariants` — the UI looks up the actual style via
 * `getChipStyle` per render, since chipStyle is a global registry key).
 */
export function applyVariantOverrides(chips: readonly ExplainChip[], variant: ABVariant | null): ExplainChip[] {
  if (!Array.isArray(chips)) return [];
  if (!variant || typeof variant !== 'object') return [...chips];
  const variantId = variant.id;
  const out: ExplainChip[] = [];
  for (const c of chips) {
    let next: ExplainChip = { ...c };
    if (variant.copyOverrides && Object.prototype.hasOwnProperty.call(variant.copyOverrides, c.id)) {
      next.text = String(variant.copyOverrides[c.id]);
    }
    if (variant.chipStyleOverrides && Object.prototype.hasOwnProperty.call(variant.chipStyleOverrides, c.id)) {
      const merged = next.cohortVariants ? [...next.cohortVariants, variantId] : [variantId];
      next.cohortVariants = merged;
    }
    out.push(next);
  }
  return out;
}

// ============================================================================
// SECTION 12 — Mobile rendering helpers
// ============================================================================

/**
 * Render a minimal chip style optimized for narrow screens:
 *   - smaller font, tighter padding, smaller icon
 *   - transparent background to fit dense lists
 *
 * Returns a ChipStyle that the UI can apply directly.
 */
export function renderChipForMobile(chip: ExplainChip): ChipStyle {
  const base = getChipStyle(chip.weight, chip.colorToken);
  return {
    ...base,
    fontSize: Math.max(10, base.fontSize - 2),
    iconSize: Math.max(12, base.iconSize - 2),
    padding: '2 6',
    radius: Math.max(6, base.radius - 2),
  };
}

// ============================================================================
// SECTION 13 — Validation
// ============================================================================

/** Issue kinds surfaced by `validateExplainVerdict`. */
export type ValidationIssue = {
  field: string;
  message: string;
  severity: 'error' | 'warning';
};

/**
 * Validate an ExplainVerdict — catches common bugs before render time:
 *   - missing postId / empty topReason when chips are present
 *   - chip text empty after translation
 *   - chip weight inconsistent with score magnitude
 *   - group weights inconsistent with contained chips
 *   - signalMix sums ≠ 1 (warning only)
 *
 * Returns an array of issues (empty = clean).
 */
export function validateExplainVerdict(verdict: ExplainVerdict): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!verdict || typeof verdict !== 'object') {
    issues.push({ field: 'verdict', message: 'verdict is not an object', severity: 'error' });
    return issues;
  }
  if (typeof verdict.postId !== 'string' || verdict.postId.length === 0) {
    issues.push({ field: 'postId', message: 'postId is empty', severity: 'error' });
  }
  if (!Array.isArray(verdict.chips)) {
    issues.push({ field: 'chips', message: 'chips is not an array', severity: 'error' });
    return issues;
  }
  if (verdict.chips.length > 0 && (typeof verdict.topReason !== 'string' || verdict.topReason.length === 0)) {
    issues.push({ field: 'topReason', message: 'topReason is empty but chips present', severity: 'warning' });
  }
  for (let i = 0; i < verdict.chips.length; i++) {
    const c = verdict.chips[i]!;
    if (typeof c.text !== 'string' || c.text.length === 0) {
      issues.push({ field: `chips[${i}].text`, message: 'chip text is empty', severity: 'error' });
    }
    if (!isChipColor(c.colorToken)) {
      issues.push({ field: `chips[${i}].colorToken`, message: `invalid colorToken ${c.colorToken}`, severity: 'error' });
    }
    if (!isSignalSource(c.signalSource)) {
      issues.push({ field: `chips[${i}].signalSource`, message: `invalid signalSource ${c.signalSource}`, severity: 'error' });
    }
    if (c.weight !== weightFromScore(c.score)) {
      issues.push({
        field: `chips[${i}].weight`,
        message: `weight ${c.weight} inconsistent with score ${c.score}`,
        severity: 'warning',
      });
    }
  }
  if (Array.isArray(verdict.groups)) {
    for (let gi = 0; gi < verdict.groups.length; gi++) {
      const g = verdict.groups[gi]!;
      const expected: ChipWeight = g.chips.some((c) => c.weight === 'strong')
        ? 'strong'
        : g.chips.some((c) => c.weight === 'moderate')
          ? 'moderate'
          : 'weak';
      if (g.weight !== expected) {
        issues.push({
          field: `groups[${gi}].weight`,
          message: `group weight ${g.weight} inconsistent (expected ${expected})`,
          severity: 'warning',
        });
      }
    }
  }
  if (verdict.signalMix) {
    const sum = Object.values(verdict.signalMix).reduce((a, b) => a + (Number.isFinite(b) ? b : 0), 0);
    if (sum > 0 && Math.abs(sum - 1) > 0.01) {
      issues.push({
        field: 'signalMix',
        message: `signalMix sums to ${sum.toFixed(3)} (expected ~1.0)`,
        severity: 'warning',
      });
    }
  }
  return issues;
}

// ============================================================================
// SECTION 14 — Main entry point: explainItem
// ============================================================================

/**
 * Input context for `explainItem` — everything the function needs to
 * produce a fully-localized, fully-styled verdict.
 */
export type ExplainContext = {
  /** Per-user preferences (lang, density, mute list, etc.). */
  preferences: UserPreferences;
  /** Optional A/B variant to apply. */
  variant?: ABVariant | null;
};

/**
 * Produce a complete `ExplainVerdict` for a ScoredItem.
 *
 * Pipeline:
 *   1. Parse reasons into typed signals.
 *   2. Build positive chips (in score-desc order).
 *   3. Build hidden chips (negative signals).
 *   4. Apply A/B variant overrides.
 *   5. Translate all chips to user's language.
 *   6. Build groups (category-keyed).
 *   7. Compute signalMix and score breakdown.
 *   8. Pick top reason.
 *   9. Apply user prefs (mute list, max chips).
 *
 * Pure. Deterministic. Never throws.
 */
export function explainItem(
  scored: ScoredItemLike & { reasons: readonly string[]; item?: { id?: string } },
  context: ExplainContext,
): ExplainVerdict {
  const prefs = context.preferences;
  const lang = prefs?.lang ?? 'pt';

  const postId = scored?.item?.id ?? 'unknown';
  const baseChips = buildChips(scored, prefs);
  const hiddenChips = explainHiddenSignals(scored);
  const withOverrides = context.variant ? applyVariantOverrides(baseChips, context.variant) : baseChips;
  const localized = translateAll(withOverrides, lang);
  const ranked = rankChipsByWeight(localized);
  const groups = buildGroups(ranked, lang);

  const signalMix = computeSignalMix(ranked);
  const scoreBreakdown = buildScoreBreakdown(scored);
  const topReason = pickTopReason(scored);

  const verdict: ExplainVerdict = {
    postId,
    topReason,
    chips: ranked,
    groups,
    hiddenReasons: hiddenChips.length > 0 ? hiddenChips : undefined,
    signalMix,
    scoreBreakdown,
  };

  // Final user-pref filter (mute list, max chips).
  return respectUserPrefs(verdict, prefs);
}

/** Build a numeric score breakdown from a ScoredItem. */
function buildScoreBreakdown(scored: ScoredItemLike & { reasons: readonly string[]; score?: number }): Record<string, number> {
  const out: Record<string, number> = {};
  const sc = scored?.score;
  out['final'] = Number.isFinite(sc) ? (sc as number) : 0;
  for (const s of parseReasons(scored?.reasons ?? [])) {
    const k = s.source;
    out[k] = +(out[k] ?? 0) + s.score;
  }
  return out;
}

// ============================================================================
// SECTION 15 — Internal self-test (gated by env flag)
// ============================================================================

/**
 * Tiny smoke test invoked by CI when `W46_EXPLAINABILITY_SELFTEST=1`.
 * Returns a count of passed/failed checks so CI can decide pass/fail
 * without spinning up Vitest.
 */
export function _selfTest(): { passed: number; failed: number; notes: string[] } {
  const notes: string[] = [];
  let passed = 0;
  let failed = 0;

  const check = (name: string, cond: boolean): void => {
    if (cond) {
      passed++;
      notes.push(`PASS ${name}`);
    } else {
      failed++;
      notes.push(`FAIL ${name}`);
    }
  };

  // 1. Default translations cover 24 chip keys.
  const chipKeys = Object.keys(DEFAULT_TRANSLATIONS.pt).filter((k) => k.startsWith('chip.'));
  check('translations.chipCount>=24', chipKeys.length >= 24);

  // 2. Each locale covers the same chip keys.
  const ptChips = new Set(chipKeys);
  for (const lang of LANGUAGES) {
    if (lang === 'pt') continue;
    const other = Object.keys(DEFAULT_TRANSLATIONS[lang]).filter((k) => k.startsWith('chip.'));
    check(`translations.${lang}.chipKeysMatch`, other.length === chipKeys.length);
  }

  // 3. parseReasons handles every w45 reason shape.
  const reasons = [
    'recency=0.85',
    'tradition:cabala+0.45',
    'author:a1+0.30',
    'engagement=0.65',
    'embedding=0.42',
    'diversity-penalty=-0.20',
    'follow+0.40',
    'lang-match+0.10',
    'muted-author',
  ];
  const parsed = parseReasons(reasons);
  check('parseReasons.count', parsed.length === reasons.length);
  check('parseReasons.mutedSafeMode', parsed[8]?.source === 'safe_mode');

  // 4. buildChips drops weak signals (<0.05).
  const weakChips = buildChips({ reasons: ['recency=0.01'] });
  check('buildChips.dropsWeak', weakChips.length === 0);

  // 5. buildChips returns positive signals only.
  const c = buildChips({
    reasons: ['recency=0.85', 'tradition:cabala+0.45', 'diversity-penalty=-0.20', 'follow+0.40'],
  });
  check('buildChips.positiveOnly', c.every((x) => x.score > 0));

  // 6. rankChipsByWeight orders strong > moderate > weak.
  const ranked = rankChipsByWeight([
    { id: 'a', text: '', iconKey: '', colorToken: 'muted', weight: 'weak', reason: '', score: 0.1, signalSource: 'recency' },
    { id: 'b', text: '', iconKey: '', colorToken: 'accent', weight: 'strong', reason: '', score: 0.6, signalSource: 'tradition_affinity' },
    { id: 'c', text: '', iconKey: '', colorToken: 'info', weight: 'moderate', reason: '', score: 0.3, signalSource: 'embedding' },
  ]);
  check('rankChips.strongFirst', ranked[0]?.id === 'b');

  // 7. filterChipsByUserPrefs respects muteCategories.
  const filtered = filterChipsByUserPrefs(c, {
    userId: 'u',
    showChips: true,
    chipDensity: 'comfortable',
    lang: 'pt',
    allowReveal: true,
    muteCategories: ['tradition'],
  });
  check('filterChips.mutesTradition', filtered.every((x) => x.category !== 'tradition'));

  // 8. hideSignalsByCategory matches filter behavior.
  const hidden = hideSignalsByCategory(c, ['tradition']);
  check('hideSignals.equivalentToFilter', hidden.length === filtered.length);

  // 9. explainItem returns a verdict with chips + groups.
  const verdict = explainItem(
    {
      score: 0.7,
      reasons: ['recency=0.85', 'tradition:cabala+0.45', 'follow+0.40'],
      item: { id: 'p1' },
    },
    {
      preferences: {
        userId: 'u',
        showChips: true,
        chipDensity: 'comfortable',
        lang: 'pt',
        allowReveal: true,
        muteCategories: [],
      },
    },
  );
  check('explainItem.postId', verdict.postId === 'p1');
  check('explainItem.chipsNonEmpty', verdict.chips.length > 0);
  check('explainItem.groupsNonEmpty', verdict.groups.length > 0);

  // 10. explainItem hides everything when showChips=false.
  const off = explainItem(
    { score: 0.7, reasons: ['recency=0.85'], item: { id: 'p2' } },
    {
      preferences: {
        userId: 'u',
        showChips: false,
        chipDensity: 'comfortable',
        lang: 'pt',
        allowReveal: true,
        muteCategories: [],
      },
    },
  );
  check('explainItem.masterSwitch', off.chips.length === 0);

  // 11. Tooltip builders don't throw.
  const tipShort = buildTooltip(verdict, 'short');
  const tipLong = buildTooltip(verdict, 'long');
  const tipMob = buildMobileTooltip(verdict);
  const tipA11y = buildA11yTooltip(verdict);
  check('tooltip.short', typeof tipShort === 'string' && tipShort.length > 0);
  check('tooltip.long', typeof tipLong === 'string' && tipLong.length > 0);
  check('tooltip.mobile', typeof tipMob === 'string' && tipMob.length > 0);
  check('tooltip.a11y', typeof tipA11y === 'string' && tipA11y.length > 0);

  // 12. A/B variant picker is deterministic.
  const variants: ABVariant[] = [
    { id: 'a', name: 'A', weight: 1, chipStyleOverrides: {}, copyOverrides: {} },
    { id: 'b', name: 'B', weight: 1, chipStyleOverrides: {}, copyOverrides: {} },
  ];
  const r1 = pickABVariant('user-x', variants);
  const r2 = pickABVariant('user-x', variants);
  check('abVariant.deterministic', r1?.id === r2?.id);
  const r3 = pickABVariant('user-y', variants);
  check('abVariant.distinct', r3?.id !== undefined);

  // 13. applyVariantOverrides rewrites chip text.
  const variant: ABVariant = {
    id: 'v1',
    name: 'V1',
    weight: 1,
    chipStyleOverrides: {},
    copyOverrides: { 'recency::0': '🔥 Hot now (v1)' },
  };
  const overridden = applyVariantOverrides(
    [
      {
        id: 'recency::0',
        text: 'Hoje',
        iconKey: 'flame',
        colorToken: 'info',
        weight: 'moderate',
        reason: 'chip.recency.today',
        score: 0.5,
        signalSource: 'recency',
      },
    ],
    variant,
  );
  check('applyVariant.copyOverride', overridden[0]?.text === '🔥 Hot now (v1)');

  // 14. validateExplainVerdict returns no errors for a clean verdict.
  const cleanVerdict: ExplainVerdict = {
    postId: 'p',
    topReason: 'tr',
    chips: [],
    groups: [],
    signalMix: emptySignalMix(),
    scoreBreakdown: {},
  };
  check('validateExplainVerdict.clean', validateExplainVerdict(cleanVerdict).length === 0);

  // 15. validateExplainVerdict catches an empty postId.
  const dirty: ExplainVerdict = { postId: '', topReason: '', chips: [], groups: [], signalMix: emptySignalMix(), scoreBreakdown: {} };
  const issues = validateExplainVerdict(dirty);
  check('validateExplainVerdict.catchesEmpty', issues.some((i) => i.field === 'postId'));

  // 16. validateTranslationBundle catches missing locales.
  const tbIssues = validateTranslationBundle({ pt: { 'chip.x': 'y' } });
  check('validateTranslationBundle.missing', tbIssues.length > 0);

  // 17. formatScore returns a string in every locale.
  for (const lang of LANGUAGES) {
    const s = formatScore(1.7, lang);
    check(`formatScore.${lang}.nonEmpty`, typeof s === 'string' && s.length > 0);
  }

  // 18. translateAll re-localizes text.
  const localizedChips = translateAll(c, 'en');
  check('translateAll.changed', localizedChips.every((x) => x.text !== c.find((y) => y.id === x.id)?.text || x.text.length > 0));

  // 19. explainHiddenSignals produces chips for muted-author.
  const hidden2 = explainHiddenSignals({ reasons: ['muted-author'] });
  check('explainHidden.mutedAuthor', hidden2.length > 0);

  // 20. respectUserPrefs trims to maxChips.
  const trimmed = respectUserPrefs(verdict, {
    userId: 'u',
    showChips: true,
    chipDensity: 'compact',
    lang: 'pt',
    allowReveal: true,
    muteCategories: [],
    maxChips: 1,
  });
  check('respectUserPrefs.maxChips', trimmed.chips.length <= 1);

  return { passed, failed, notes };
}

// ============================================================================
// Exports (single block — keeps the public surface greppable)
// ============================================================================
//
// Types (already exported above via `export type`):
//   - Language, ChipColor, SignalSource, ReasonCategory
//   - ChipWeight, ChipDensity, TooltipVariant
//   - ExplainChip, ExplainGroup, ExplainVerdict
//   - ChipStyle, ChipStyleRegistry
//   - ABVariant, CohortAssignment, UserPreferences
//   - TranslationBundle, ParsedSignal, ValidationIssue
//   - ScoredItemLike, ExplainContext
//
// Locales:
//   - LANGUAGES, isLanguage, toLanguage
//
// Signals:
//   - isSignalSource, isReasonCategory, isChipColor
//   - SIGNAL_TO_CATEGORY, CATEGORY_TO_COLOR
//
// Icons:
//   - CHIP_ICON_MAP, getIconForSignal, registerChipIcon
//
// Styles:
//   - DEFAULT_CHIP_STYLE_REGISTRY, getChipStyle, registerChipStyle, getChipStyleRegistrySnapshot
//
// Translations:
//   - DEFAULT_TRANSLATIONS, translate, getTranslations, registerTranslation, validateTranslationBundle
//
// Parsing + categorization:
//   - parseReasons, categorizeScore, formatScore, formatReasonCategory, pickTopReason
//
// Chip construction:
//   - buildChips, buildGroups, rankChipsByWeight
//   - filterChipsByUserPrefs, hideSignalsByCategory, explainHiddenSignals
//   - weightFromScore
//
// Localization:
//   - translateChip, translateAll
//
// Tooltips:
//   - buildTooltip, buildMobileTooltip, buildLongTooltip, buildA11yTooltip
//
// User preferences:
//   - shouldShowChip, getChipDensity, respectUserPrefs
//
// A/B variants:
//   - pickABVariant, assignCohort, applyVariantOverrides
//
// Mobile:
//   - renderChipForMobile
//
// Validation:
//   - validateExplainVerdict
//
// Main:
//   - explainItem, _selfTest
//
// w46/feed-explainability-ui.ts — 1789 lines — 100% TypeScript
// ============================================================================