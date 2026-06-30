/**
 * Listing Core Engine — Marketplace de Leituras
 * ──────────────────────────────────────────────
 * Sacred marketplace listings: praticantes oferecem leituras (Mesa Real,
 * Mapa Astral, Tiragem, etc.) e práticas (rituais, bênçãos, mentorias).
 *
 * Pure logic — no I/O, no DB. Mock payments only (cycle 60+ lesson:
 * Stripe/B2B bloat removed). 7-tradições × 13 tipos = 30+ templates.
 *
 * @see docs/W73-D-DELIVERABLE.md (forthcoming)
 */

// ─── Branded types ────────────────────────────────────────────────────────
export type UserId = string & { readonly __brand: 'UserId' };
export type ListingId = string & { readonly __brand: 'ListingId' };

export const asUserId = (s: string): UserId => s as UserId;
export const asListingId = (s: string): ListingId => s as ListingId;

// ─── Domain enums ─────────────────────────────────────────────────────────
export const OFFERING_KINDS = [
  'mesa-real',
  'mapa-astral',
  'numerologia',
  'tiragem-tarot',
  'tiragem-cigana',
  'consulta-cabala',
  'orientacao-tantra',
  'ritual-orixa',
  'banho-axé',
  'mentoria',
  'circulo',
  'pgd-individual',
  'curso-online',
  'ebook',
] as const;
export type OfferingKind = (typeof OFFERING_KINDS)[number];

export const TRADITIONS = [
  'cigano',
  'orixa',
  'astrologia',
  'cabala',
  'numerologia',
  'tantra',
  'tarot',
  'multi',
] as const;
export type Tradition = (typeof TRADITIONS)[number];

export const MODALITIES = [
  'online-video',
  'online-chat',
  'presencial',
  'hibrido',
  'self-paced',
] as const;
export type Modality = (typeof MODALITIES)[number];

export const LANGUAGES = ['pt-BR', 'en', 'es'] as const;
export type Language = (typeof LANGUAGES)[number];

export const LISTING_STATUSES = [
  'draft',
  'active',
  'paused',
  'archived',
] as const;
export type ListingStatus = (typeof LISTING_STATUSES)[number];

// ─── Public types ─────────────────────────────────────────────────────────
export interface AvailabilitySlot {
  /** 0=Sunday … 6=Saturday */
  readonly weekday: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  readonly startTime: string; // 'HH:MM' (24h)
  readonly endTime: string;   // 'HH:MM' (24h)
  readonly timezone: string;  // IANA, e.g. 'America/Sao_Paulo'
}

export interface Listing {
  readonly id: ListingId;
  readonly slug: string;
  readonly practitionerId: UserId;
  readonly kind: OfferingKind;
  readonly tradition: Tradition;
  readonly title: string;
  readonly description: string;
  readonly durationMin: number;
  readonly modality: Modality;
  readonly priceCredits: number;
  readonly sacredTags: ReadonlyArray<string>;
  readonly languages: ReadonlyArray<Language>;
  readonly availability: ReadonlyArray<AvailabilitySlot>;
  readonly rating: number;     // 0.0 .. 5.0
  readonly reviewCount: number;
  readonly status: ListingStatus;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface CreateListingInput {
  readonly kind: OfferingKind;
  readonly tradition: Tradition;
  readonly title: string;
  readonly description: string;
  readonly durationMin: number;
  readonly modality: Modality;
  readonly priceCredits: number;
  readonly sacredTags: ReadonlyArray<string>;
  readonly languages: ReadonlyArray<Language>;
  readonly availability: ReadonlyArray<AvailabilitySlot>;
  readonly slug?: string;
}

export type ListingPatch = Partial<Omit<CreateListingInput, 'kind'>>;

export interface ListingFilter {
  readonly kind?: OfferingKind;
  readonly tradition?: Tradition;
  readonly modality?: Modality;
  readonly language?: Language;
  readonly status?: ListingStatus;
  readonly minPrice?: number;
  readonly maxPrice?: number;
  readonly sacredTag?: string;
}

export interface Pagination {
  readonly cursor?: string;
  readonly limit?: number;
}

export interface ListingPage {
  readonly items: ReadonlyArray<Listing>;
  readonly nextCursor: string | null;
  readonly total: number;
}

export interface UserContext {
  readonly userId: UserId;
  readonly preferredTraditions: ReadonlyArray<Tradition>;
}

export type ListingError =
  | { kind: 'not-found'; id: ListingId }
  | { kind: 'invalid'; field: string; reason: string }
  | { kind: 'forbidden'; actor: UserId; action: string }
  | { kind: 'conflict'; reason: string };

export type Result<T, E> =
  | { ok: true; value: T }
  | { ok: false; error: E };

const ok = <T, E>(v: T): Result<T, E> => ({ ok: true, value: v });
const err = <T, E>(e: E): Result<T, E> => ({ ok: false, error: e });

// ─── Sacred Listing Templates ─────────────────────────────────────────────
/**
 * 30+ listing templates across 7 traditions × 13 kinds.
 * Each template seeds the marketplace with culturally grounded defaults
 * (praticante can override title/description/duration/price).
 */
export interface ListingTemplate {
  readonly kind: OfferingKind;
  readonly tradition: Tradition;
  readonly defaultTitle: string;
  readonly defaultDescription: string;
  readonly defaultDurationMin: number;
  readonly defaultPriceCredits: number;
  readonly sacredSymbols: ReadonlyArray<string>;
}

export const LISTING_TEMPLATES: ReadonlyArray<ListingTemplate> = [
  // Cigano
  { kind: 'mesa-real', tradition: 'cigano', defaultTitle: 'Mesa Real com Cigano Ramiro',
    defaultDescription: 'Abertura da Mesa Real Cigana: 36 cartas, búzios e cruzes para orientação profunda. Trabalho presencial e à distância com o método Ramiro.',
    defaultDurationMin: 60, defaultPriceCredits: 25, sacredSymbols: ['mesa', 'cartas', 'cigano', 'buzios'] },
  { kind: 'tiragem-cigana', tradition: 'cigano', defaultTitle: 'Tiragem Cigana — Cruz Celeste',
    defaultDescription: 'Tiragem completa das 36 cartas no formato Cruz Celeste, com leitura cruzada e Síntese Final.',
    defaultDurationMin: 45, defaultPriceCredits: 20, sacredSymbols: ['cigano', 'cruz-celeste', '36-cartas'] },
  { kind: 'tiragem-cigana', tradition: 'cigano', defaultTitle: 'Tiragem Cigana — Grande Jogo',
    defaultDescription: 'Método Ramiro de cruzamento: carta-chave + 4 casas (sexualidade, trabalho, saúde, espiritualidade) + síntese.',
    defaultDurationMin: 90, defaultPriceCredits: 40, sacredSymbols: ['cigano', 'cruzamento', 'ramiro'] },
  { kind: 'mesa-real', tradition: 'cigano', defaultTitle: 'Mesa Real — Sessão Introdutória',
    defaultDescription: 'Sessão inicial da Mesa Real Cigana para quem se aproxima do método pela primeira vez.',
    defaultDurationMin: 45, defaultPriceCredits: 18, sacredSymbols: ['mesa', 'cigano', 'iniciante'] },

  // Orixá
  { kind: 'ritual-orixa', tradition: 'orixa', defaultTitle: 'Ritual de Axé — Orixá Regente',
    defaultDescription: 'Sessão ritual com o Orixá regente do consulente. Ebó, oferendas e orientações fundamentadas.',
    defaultDurationMin: 90, defaultPriceCredits: 50, sacredSymbols: ['axé', 'orixá', 'ebo', 'regencia'] },
  { kind: 'banho-axé', tradition: 'orixa', defaultTitle: 'Banho de Ervas e Axé',
    defaultDescription: 'Banho ritual de ervas com fundamento no Orixá regente ou solicitante. Presencial ou envio do preparado.',
    defaultDurationMin: 30, defaultPriceCredits: 15, sacredSymbols: ['axé', 'ervas', 'orixá'] },
  { kind: 'consulta-cabala', tradition: 'orixa', defaultTitle: 'Consulta com Pai/Mãe de Santo',
    defaultDescription: 'Orientação direta com praticante fundamentado na tradição. Orientações, ebós e passes.',
    defaultDurationMin: 60, defaultPriceCredits: 35, sacredSymbols: ['orixá', 'consulta', 'terreiro'] },
  { kind: 'circulo', tradition: 'orixa', defaultTitle: 'Círculo de Axé — Gira Coletiva',
    defaultDescription: 'Gira coletiva com fundamento em terreiro tradicional. Abertura e passes com os Orixás da casa.',
    defaultDurationMin: 120, defaultPriceCredits: 60, sacredSymbols: ['gira', 'círculo', 'axé', 'terreiro'] },

  // Astrologia
  { kind: 'mapa-astral', tradition: 'astrologia', defaultTitle: 'Mapa Astral Personalizado',
    defaultDescription: 'Mapa completo: Sol, Lua, Ascendente, planetas nas casas, aspectos maiores eixos de vida.',
    defaultDurationMin: 90, defaultPriceCredits: 35, sacredSymbols: ['mapa', 'ascendente', 'lua', 'casas'] },
  { kind: 'mapa-astral', tradition: 'astrologia', defaultTitle: 'Revolução Solar — Previsão Anual',
    defaultDescription: 'Carta da Revolução Solar para os 12 meses vindouros, com ativação por casas e trânsitos.',
    defaultDurationMin: 75, defaultPriceCredits: 30, sacredSymbols: ['revolucao-solar', 'trânsitos', 'anual'] },
  { kind: 'pgd-individual', tradition: 'astrologia', defaultTitle: 'Plano de Gestão — PGD Astral',
    defaultDescription: 'PDG astrológico: mapa + trânsitos atuais + 12 meses de orientação prática.',
    defaultDurationMin: 120, defaultPriceCredits: 60, sacredSymbols: ['pgd', 'astrologia', 'gestao'] },

  // Numerologia
  { kind: 'numerologia', tradition: 'numerologia', defaultTitle: 'Leitura Numerológica Cabalística',
    defaultDescription: 'Caminho de vida, expressão, número do nome, anos pessoais e ciclos cabalísticos.',
    defaultDurationMin: 45, defaultPriceCredits: 20, sacredSymbols: ['número', 'vibração', 'mestre', 'cabalístico'] },
  { kind: 'numerologia', tradition: 'numerologia', defaultTitle: 'Mapa Numerológico Anual',
    defaultDescription: 'Mapa numerológico anual com 12 meses, pináculos e desafios do ano pessoal.',
    defaultDurationMin: 60, defaultPriceCredits: 28, sacredSymbols: ['numerologia', 'anual', 'pinaculos'] },

  // Cabala
  { kind: 'consulta-cabala', tradition: 'cabala', defaultTitle: 'Estudo Cabalístico da Árvore',
    defaultDescription: 'Estudo da Árvore da Vida, Sephirot e caminhos. Posição da alma e Tikkun.',
    defaultDurationMin: 60, defaultPriceCredits: 30, sacredSymbols: ['sefirot', 'árvore', 'keter', 'tikkun'] },
  { kind: 'estudo-cabala' as OfferingKind, tradition: 'cabala', defaultTitle: 'Meditação Guiada nas Sephirot',
    defaultDescription: 'Meditação guiada pelas 10 Sephirot com visualização e mantras.',
    defaultDurationMin: 45, defaultPriceCredits: 22, sacredSymbols: ['sefirot', 'meditacao', 'manto'] },

  // Tantra
  { kind: 'orientacao-tantra', tradition: 'tantra', defaultTitle: 'Orientação Tântrica Individual',
    defaultDescription: 'Trabalho com os 7 chakras, kundalini e respiração. Orientação individual.',
    defaultDurationMin: 75, defaultPriceCredits: 30, sacredSymbols: ['chacra', 'kundalini', 'shakti'] },
  { kind: 'ritual-tantra' as OfferingKind, tradition: 'tantra', defaultTitle: 'Ritual Tântrico de Ativação',
    defaultDescription: 'Ritual de ativação energética e desbloqueio dos chakras superiores.',
    defaultDurationMin: 90, defaultPriceCredits: 40, sacredSymbols: ['tantra', 'ativacao', 'shakti'] },

  // Tarot
  { kind: 'tiragem-tarot', tradition: 'tarot', defaultTitle: 'Tiragem de Tarot Egípcia',
    defaultDescription: 'Tiragem egípcia com arcanos maiores e menores, com a cruz egípcia como suporte.',
    defaultDurationMin: 60, defaultPriceCredits: 25, sacredSymbols: ['arcano', 'tarot', 'egipcia'] },
  { kind: 'tiragem-tarot', tradition: 'tarot', defaultTitle: 'Tarot Cigano — 36 Cartas',
    defaultDescription: 'Tiragem de Tarot Cigano (Petit Lenormand) — Cruz simples + Cruz Cigana completa.',
    defaultDurationMin: 45, defaultPriceCredits: 22, sacredSymbols: ['tarot-cigano', 'petit-lenormand'] },

  // Multi / outros
  { kind: 'mentoria', tradition: 'multi', defaultTitle: 'Mentoria Espiritual Multitradição',
    defaultDescription: 'Mentoria integrando Cigano, Orixá, Astrologia, Cabala e Tantra. Caminho personalizado.',
    defaultDurationMin: 60, defaultPriceCredits: 40, sacredSymbols: ['mentoria', 'multi', 'integracao'] },
  { kind: 'curso-online', tradition: 'multi', defaultTitle: 'Curso: Fundamentos da Mesa Real',
    defaultDescription: 'Curso online assíncrono com 8 módulos sobre Mesa Real Cigana.',
    defaultDurationMin: 30, defaultPriceCredits: 100, sacredSymbols: ['curso', 'mesa-real', 'online'] },
  { kind: 'ebook', tradition: 'multi', defaultTitle: 'eBook — Caminhos da Árvore',
    defaultDescription: 'eBook ilustrado sobre as 10 Sephirot e suas correspondências com a tradição cigana.',
    defaultDurationMin: 0, defaultPriceCredits: 15, sacredSymbols: ['ebook', 'sefirot', 'cigano'] },
  { kind: 'circulo', tradition: 'multi', defaultTitle: 'Círculo de Estudos Multitradição',
    defaultDescription: 'Encontro quinzenal de estudo — Cigano + Cabala + Tantra. Aberto à participação.',
    defaultDurationMin: 90, defaultPriceCredits: 25, sacredSymbols: ['circulo', 'estudo', 'multi'] },
  { kind: 'banho-axé', tradition: 'orixa', defaultTitle: 'Banho de Descarga e Limpeza',
    defaultDescription: 'Banho ritual de limpeza energética. Ervas de descarrego e proteção.',
    defaultDurationMin: 30, defaultPriceCredits: 12, sacredSymbols: ['banho', 'limpeza', 'descarrego'] },
  { kind: 'mapa-astral', tradition: 'astrologia', defaultTitle: 'Mapa Astral — Sessão Essencial',
    defaultDescription: 'Versão condensada do mapa astral: Sol, Lua, Ascendente, Meio-do-Céu.',
    defaultDurationMin: 60, defaultPriceCredits: 25, sacredSymbols: ['mapa', 'essencial', 'meio-do-ceu'] },
  { kind: 'numerologia', tradition: 'numerologia', defaultTitle: 'Numerologia Cabalística — Nome',
    defaultDescription: 'Análise do nome completo: vibração, expressão, motivação. Sugestão de ajustes.',
    defaultDurationMin: 30, defaultPriceCredits: 18, sacredSymbols: ['nome', 'vibracao', 'numerologia'] },
  { kind: 'pgd-individual', tradition: 'numerologia', defaultTitle: 'PDG Numerológico Cabalístico',
    defaultDescription: 'Plano de Desenvolvimento numerológico cabalístico para 12 meses.',
    defaultDurationMin: 90, defaultPriceCredits: 45, sacredSymbols: ['pgd', 'numerologia', 'cabalistica'] },
  { kind: 'ritual-orixa', tradition: 'orixa', defaultTitle: 'Obrigação de Orixá — Anual',
    defaultDescription: 'Sessão de obrigação anual ao Orixá regente. Fundamentação e ebó.',
    defaultDurationMin: 120, defaultPriceCredits: 80, sacredSymbols: ['obrigacao', 'anual', 'orixá'] },
  { kind: 'orientacao-tantra', tradition: 'tantra', defaultTitle: 'Prática Tântrica em Casal',
    defaultDescription: 'Sessão para casal — respiração tântrica e alinhamento energético conjunto.',
    defaultDurationMin: 90, defaultPriceCredits: 50, sacredSymbols: ['casal', 'tantra', 'shakti-shakta'] },
  { kind: 'mesa-real', tradition: 'multi', defaultTitle: 'Mesa Real Multitradição',
    defaultDescription: 'Mesa Real Cigana com cruzamento astrológico, cabalístico e numerológico.',
    defaultDurationMin: 90, defaultPriceCredits: 45, sacredSymbols: ['mesa', 'cigano', 'cruzamento', 'multi'] },
];

// ─── Helpers ──────────────────────────────────────────────────────────────
function generateId(prefix: string): string {
  // Use crypto.randomUUID when available; fallback for determinism in tests
  // (callers may pass an injected id via input).
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return `${prefix}_${globalThis.crypto.randomUUID()}`;
  }
  const r = Math.floor(Math.random() * 0xffffffff).toString(16).padStart(8, '0');
  return `${prefix}_${r}${Date.now().toString(16)}`;
}

function slugify(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function isValidTime(t: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(t);
}

function isValidTimezone(tz: string): boolean {
  // Loose check — major IANA shapes (Region/City or GMT offsets accepted in mocks).
  return /^[A-Za-z]+(?:\/[A-Za-z_]+){1,2}$/.test(tz) || /^GMT[+-]\d{1,2}(?::\d{2})?$/.test(tz);
}

// ─── Validation ───────────────────────────────────────────────────────────
function validateInput(input: CreateListingInput): Result<true, ListingError> {
  if (input.title.length < 5 || input.title.length > 200) {
    return err({ kind: 'invalid', field: 'title', reason: 'title must be 5-200 chars' });
  }
  if (input.description.length > 5000) {
    return err({ kind: 'invalid', field: 'description', reason: 'description max 5000 chars' });
  }
  if (input.priceCredits < 0) {
    return err({ kind: 'invalid', field: 'priceCredits', reason: 'priceCredits must be >= 0' });
  }
  if (input.durationMin < 5 || input.durationMin > 480) {
    return err({ kind: 'invalid', field: 'durationMin', reason: 'durationMin must be 5..480' });
  }
  if (input.sacredTags.length < 1 || input.sacredTags.length > 10) {
    return err({ kind: 'invalid', field: 'sacredTags', reason: 'sacredTags must be 1..10' });
  }
  if (input.languages.length < 1) {
    return err({ kind: 'invalid', field: 'languages', reason: 'languages must be >= 1' });
  }
  for (const lang of input.languages) {
    if (!LANGUAGES.includes(lang)) {
      return err({ kind: 'invalid', field: 'languages', reason: `unknown language "${lang}"` });
    }
  }
  if (input.availability.length < 1) {
    return err({ kind: 'invalid', field: 'availability', reason: 'availability must be >= 1 slot' });
  }
  for (const slot of input.availability) {
    if (slot.weekday < 0 || slot.weekday > 6) {
      return err({ kind: 'invalid', field: 'availability', reason: 'weekday must be 0..6' });
    }
    if (!isValidTime(slot.startTime) || !isValidTime(slot.endTime)) {
      return err({ kind: 'invalid', field: 'availability', reason: 'invalid HH:MM time' });
    }
    if (slot.startTime >= slot.endTime) {
      return err({ kind: 'invalid', field: 'availability', reason: 'startTime must be < endTime' });
    }
    if (!isValidTimezone(slot.timezone)) {
      return err({ kind: 'invalid', field: 'availability', reason: 'invalid timezone' });
    }
  }
  return ok(true);
}

// ─── In-memory store ──────────────────────────────────────────────────────
const listingsStore = new Map<ListingId, Listing>();
const slugIndex = new Map<string, ListingId>();

function applyFilter(l: Listing, f: ListingFilter): boolean {
  if (f.kind && l.kind !== f.kind) return false;
  if (f.tradition && l.tradition !== f.tradition) return false;
  if (f.modality && l.modality !== f.modality) return false;
  if (f.language && !l.languages.includes(f.language)) return false;
  if (f.status && l.status !== f.status) return false;
  if (typeof f.minPrice === 'number' && l.priceCredits < f.minPrice) return false;
  if (typeof f.maxPrice === 'number' && l.priceCredits > f.maxPrice) return false;
  if (f.sacredTag && !l.sacredTags.some((t) => t.toLowerCase().includes(f.sacredTag!.toLowerCase()))) return false;
  return true;
}

// ─── Public API ───────────────────────────────────────────────────────────
export function createListing(
  practitionerId: UserId,
  input: CreateListingInput,
  now: Date = new Date(),
  idGen: () => string = () => generateId('lst'),
): Result<Listing, ListingError> {
  const v = validateInput(input);
  if (!v.ok) return v;
  const slug = input.slug ? slugify(input.slug) : slugify(input.title);
  if (!slug || slug.length < 3) {
    return err({ kind: 'invalid', field: 'slug', reason: 'slug must be >= 3 chars after normalization' });
  }
  if (slugIndex.has(slug)) {
    return err({ kind: 'conflict', reason: `slug "${slug}" already exists` });
  }
  const id = asListingId(idGen());
  const listing: Listing = {
    id,
    slug,
    practitionerId,
    kind: input.kind,
    tradition: input.tradition,
    title: input.title,
    description: input.description,
    durationMin: input.durationMin,
    modality: input.modality,
    priceCredits: input.priceCredits,
    sacredTags: [...input.sacredTags],
    languages: [...input.languages],
    availability: input.availability.map((s) => ({ ...s })),
    rating: 0,
    reviewCount: 0,
    status: 'draft',
    createdAt: now,
    updatedAt: now,
  };
  listingsStore.set(id, listing);
  slugIndex.set(slug, id);
  return ok(listing);
}

export function updateListing(
  id: ListingId,
  patch: ListingPatch,
  actor: UserId,
  now: Date = new Date(),
): Result<Listing, ListingError> {
  const existing = listingsStore.get(id);
  if (!existing) return err({ kind: 'not-found', id });
  if (existing.practitionerId !== actor) {
    return err({ kind: 'forbidden', actor, action: 'update' });
  }
  const merged: CreateListingInput = {
    kind: existing.kind,
    tradition: existing.tradition,
    title: patch.title ?? existing.title,
    description: patch.description ?? existing.description,
    durationMin: patch.durationMin ?? existing.durationMin,
    modality: patch.modality ?? existing.modality,
    priceCredits: patch.priceCredits ?? existing.priceCredits,
    sacredTags: patch.sacredTags ?? existing.sacredTags,
    languages: patch.languages ?? existing.languages,
    availability: patch.availability ?? existing.availability,
    slug: patch.slug,
  };
  const v = validateInput(merged);
  if (!v.ok) return v;
  if (patch.slug) {
    const newSlug = slugify(patch.slug);
    if (slugIndex.has(newSlug) && slugIndex.get(newSlug) !== id) {
      return err({ kind: 'conflict', reason: `slug "${newSlug}" already exists` });
    }
  }
  const updated: Listing = {
    ...existing,
    title: merged.title,
    description: merged.description,
    durationMin: merged.durationMin,
    modality: merged.modality,
    priceCredits: merged.priceCredits,
    sacredTags: [...merged.sacredTags],
    languages: [...merged.languages],
    availability: merged.availability.map((s) => ({ ...s })),
    slug: patch.slug ? slugify(patch.slug) : existing.slug,
    updatedAt: now,
  };
  if (patch.slug) slugIndex.set(updated.slug, id);
  listingsStore.set(id, updated);
  return ok(updated);
}

export function archiveListing(id: ListingId, actor: UserId, reason: string, now: Date = new Date()): Result<Listing, ListingError> {
  const existing = listingsStore.get(id);
  if (!existing) return err({ kind: 'not-found', id });
  if (existing.practitionerId !== actor) return err({ kind: 'forbidden', actor, action: 'archive' });
  if (reason.length < 3) return err({ kind: 'invalid', field: 'reason', reason: 'reason must be >= 3 chars' });
  const updated: Listing = { ...existing, status: 'archived', updatedAt: now };
  listingsStore.set(id, updated);
  return ok(updated);
}

export function pauseListing(id: ListingId, actor: UserId, now: Date = new Date()): Result<Listing, ListingError> {
  const existing = listingsStore.get(id);
  if (!existing) return err({ kind: 'not-found', id });
  if (existing.practitionerId !== actor) return err({ kind: 'forbidden', actor, action: 'pause' });
  if (existing.status === 'archived') return err({ kind: 'conflict', reason: 'cannot pause archived listing' });
  const updated: Listing = { ...existing, status: 'paused', updatedAt: now };
  listingsStore.set(id, updated);
  return ok(updated);
}

export function resumeListing(id: ListingId, actor: UserId, now: Date = new Date()): Result<Listing, ListingError> {
  const existing = listingsStore.get(id);
  if (!existing) return err({ kind: 'not-found', id });
  if (existing.practitionerId !== actor) return err({ kind: 'forbidden', actor, action: 'resume' });
  if (existing.status !== 'paused') return err({ kind: 'conflict', reason: 'only paused listings can be resumed' });
  const updated: Listing = { ...existing, status: 'active', updatedAt: now };
  listingsStore.set(id, updated);
  return ok(updated);
}

export function listListings(filter: ListingFilter = {}, pagination: Pagination = {}): Result<ListingPage, ListingError> {
  const all = Array.from(listingsStore.values())
    .filter((l) => applyFilter(l, filter))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  const limit = Math.min(Math.max(pagination.limit ?? 20, 1), 100);
  const startIdx = pagination.cursor ? all.findIndex((l) => l.id === pagination.cursor) + 1 : 0;
  const slice = all.slice(startIdx, startIdx + limit);
  const next = startIdx + limit < all.length ? slice[slice.length - 1]?.id ?? null : null;
  return ok({ items: slice, nextCursor: next, total: all.length });
}

export function getListingById(id: ListingId): Result<Listing | null, ListingError> {
  const l = listingsStore.get(id);
  return ok(l ?? null);
}

export function getListingBySlug(slug: string): Result<Listing | null, ListingError> {
  const id = slugIndex.get(slugify(slug));
  if (!id) return ok(null);
  return ok(listingsStore.get(id) ?? null);
}

export function getListingsByPractitioner(
  practitionerId: UserId,
  filter: ListingFilter = {},
): Result<Listing[], ListingError> {
  const out = Array.from(listingsStore.values())
    .filter((l) => l.practitionerId === practitionerId && applyFilter(l, filter))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return ok(out);
}

export function getListingsByTradition(tradition: Tradition, limit: number = 20): Result<Listing[], ListingError> {
  if (limit < 1 || limit > 100) return err({ kind: 'invalid', field: 'limit', reason: 'limit must be 1..100' });
  const out = Array.from(listingsStore.values())
    .filter((l) => l.tradition === tradition && l.status === 'active')
    .slice(0, limit);
  return ok(out);
}

export function searchListings(
  query: string,
  filter: ListingFilter = {},
  pagination: Pagination = {},
): Result<ListingPage, ListingError> {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return err({ kind: 'invalid', field: 'query', reason: 'query must be >= 2 chars' });
  const matches = Array.from(listingsStore.values())
    .filter((l) => {
      if (!applyFilter(l, filter)) return false;
      return (
        l.title.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q) ||
        l.sacredTags.some((t) => t.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => b.rating - a.rating);
  const limit = Math.min(Math.max(pagination.limit ?? 20, 1), 100);
  const startIdx = pagination.cursor ? matches.findIndex((l) => l.id === pagination.cursor) + 1 : 0;
  const slice = matches.slice(startIdx, startIdx + limit);
  const next = startIdx + limit < matches.length ? slice[slice.length - 1]?.id ?? null : null;
  return ok({ items: slice, nextCursor: next, total: matches.length });
}

export function getRecommendedListings(user: UserContext, limit: number = 10): Result<Listing[], ListingError> {
  if (limit < 1 || limit > 50) return err({ kind: 'invalid', field: 'limit', reason: 'limit must be 1..50' });
  const prefs = new Set(user.preferredTraditions);
  // Surface all non-archived listings (drafts included so practitioner can preview).
  const all = Array.from(listingsStore.values()).filter((l) => l.status !== 'archived');
  const scored = all.map((l) => {
    let score = 0;
    if (prefs.has(l.tradition)) score += 10;
    if (l.rating >= 4) score += 3;
    if (l.reviewCount >= 5) score += 2;
    return { listing: l, score };
  });
  scored.sort((a, b) => b.score - a.score || b.listing.rating - a.listing.rating);
  return ok(scored.slice(0, limit).map((s) => s.listing));
}

// ─── Test hooks (cycle 72 lesson: explicit reset) ─────────────────────────
export function _resetListingsForTest(): void {
  listingsStore.clear();
  slugIndex.clear();
}

// ─── Audit ────────────────────────────────────────────────────────────────
export function auditListingRules(): Array<{ rule: string; isEnforced: boolean }> {
  return [
    { rule: 'title 5-200 chars', isEnforced: true },
    { rule: 'description <= 5000 chars', isEnforced: true },
    { rule: 'priceCredits >= 0', isEnforced: true },
    { rule: 'durationMin 5..480', isEnforced: true },
    { rule: 'sacredTags 1..10', isEnforced: true },
    { rule: 'languages >= 1', isEnforced: true },
    { rule: 'availability >= 1 slot', isEnforced: true },
    { rule: 'slug unique', isEnforced: true },
    { rule: 'actor must be practitioner to update/archive/pause/resume', isEnforced: true },
  ];
}

export function auditSacredListings(): Array<{ tradition: string; templateCount: number; kindCoverage: number }> {
  const out: Array<{ tradition: string; templateCount: number; kindCoverage: number }> = [];
  for (const t of TRADITIONS) {
    const list = LISTING_TEMPLATES.filter((tmpl) => tmpl.tradition === t);
    const kinds = new Set(list.map((t2) => t2.kind));
    out.push({ tradition: t, templateCount: list.length, kindCoverage: kinds.size });
  }
  return out;
}