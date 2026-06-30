// W78 sacred-sound-ui — UI orchestration layer for sacred sound playback.
// Pure TypeScript, React-agnostic. Manages:
//   - Track listing (7 traditions × 3 tracks = 21 tracks)
//   - Intention system (set / list / complete)
//   - Playback state machine (idle → loading → playing → paused → ended → error)
//   - Accessibility (keyboard nav, screen reader, reduced motion, captions)
//   - Tradition catalog (frequencies, intention categories, recommended tracks)
//   - Persistence (session state + intention history per user)
// All outputs are Readonly / Object.frozen. No React imports.

import { sha256HexSync } from './sacred-sound-ui.hash.ts';

// =====================================================================
// BRANDED PRIMITIVES
// =====================================================================

export type Brand<TBase, TBrand extends string> = TBase & { readonly __brand: TBrand };

export type TrackId        = Brand<string, 'TrackId'>;
export type UserId         = Brand<string, 'UserId'>;
export type IntentionId    = Brand<string, 'IntentionId'>;
export type IntentionCategory = Brand<string, 'IntentionCategory'>;
export type ISODateTime    = Brand<string, 'ISODateTime'>;

const TRACK_ID_RE     = /^t_[a-z0-9_]{3,40}$/;
const USER_ID_RE      = /^u_[a-z0-9_]{3,40}$/;
const INTENTION_ID_RE = /^i_[a-z0-9_]{3,40}$/;
const CATEGORY_RE     = /^[a-z0-9-]{2,40}$/;
const ISO_DATETIME_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z$/;

export function makeTrackId(raw: string): TrackId {
  if (!TRACK_ID_RE.test(raw)) throw new Error(`invalid TrackId: ${raw}`);
  return raw as TrackId;
}
export function makeUserId(raw: string): UserId {
  if (!USER_ID_RE.test(raw)) throw new Error(`invalid UserId: ${raw}`);
  return raw as UserId;
}
export function makeIntentionId(raw: string): IntentionId {
  if (!INTENTION_ID_RE.test(raw)) throw new Error(`invalid IntentionId: ${raw}`);
  return raw as IntentionId;
}
export function makeCategory(raw: string): IntentionCategory {
  if (!CATEGORY_RE.test(raw)) throw new Error(`invalid Category: ${raw}`);
  return raw as IntentionCategory;
}
export function makeISO(raw: string): ISODateTime {
  if (!ISO_DATETIME_RE.test(raw)) throw new Error(`invalid ISODateTime: ${raw}`);
  return raw as ISODateTime;
}
export function nowISO(): ISODateTime {
  return '2026-06-30T00:00:00.000Z' as ISODateTime;
}

// =====================================================================
// OPTION / RESULT
// =====================================================================

export type Option<T> = { readonly kind: 'some'; readonly value: T } | { readonly kind: 'none' };
export const NONE: Option<never> = Object.freeze({ kind: 'none' });
export function some<T>(value: T): Option<T> {
  return Object.freeze({ kind: 'some' as const, value: Object.freeze(value as object) as T });
}
export function fromNullable<T>(v: T | null | undefined): Option<T> {
  return v === null || v === undefined ? NONE : some(v);
}

export type Result<T, E> = { readonly ok: true; readonly value: T } | { readonly ok: false; readonly error: E };
export function ok<T>(value: T): Result<T, never> {
  return Object.freeze({ ok: true as const, value: Object.freeze(value as object) as T });
}
export function err<E>(error: E): Result<never, E> {
  return Object.freeze({ ok: false as const, error: Object.freeze(error as object) as E });
}

// =====================================================================
// TRADITION — 7 CANONICAL ROOTS
// =====================================================================

export const TRADITIONS = [
  'candomble', 'umbanda', 'ifa', 'cabala', 'astrologia', 'tantra', 'cigano-ramiro',
] as const;
export type Tradition = typeof TRADITIONS[number];

export function isTradition(s: string): s is Tradition {
  return (TRADITIONS as ReadonlyArray<string>).includes(s);
}

export const TRADITION_DISPLAY: ReadonlyArray<{ readonly id: Tradition; readonly pt: string; readonly en: string }> = Object.freeze([
  Object.freeze({ id: 'candomble',     pt: 'Candomblé',      en: 'Candomble' }),
  Object.freeze({ id: 'umbanda',       pt: 'Umbanda',        en: 'Umbanda' }),
  Object.freeze({ id: 'ifa',           pt: 'Ifá',            en: 'Ifa' }),
  Object.freeze({ id: 'cabala',        pt: 'Cabala',         en: 'Kabbalah' }),
  Object.freeze({ id: 'astrologia',    pt: 'Astrologia',     en: 'Astrology' }),
  Object.freeze({ id: 'tantra',        pt: 'Tantra',         en: 'Tantra' }),
  Object.freeze({ id: 'cigano-ramiro', pt: 'Cigano Ramiro',  en: 'Gypsy Ramiro' }),
]);

// =====================================================================
// SACRED FREQUENCIES
// =====================================================================

export const SOLFEGGIO_HZ: ReadonlyArray<number> = Object.freeze([174, 285, 396, 417, 432, 528, 639, 741, 852, 963]);
export const TANTRA_GAMMA_HZ = 40;
export const SCHUMANN_HZ = 7.83;

export type SacredFrequency = Brand<{ readonly hz: number; readonly label: string }, 'SacredFrequency'>;
export function isSacredHz(hz: number): boolean {
  if (SOLFEGGIO_HZ.includes(hz)) return true;
  return hz === TANTRA_GAMMA_HZ || hz === SCHUMANN_HZ;
}
export function makeFrequency(hz: number, label: string): SacredFrequency {
  if (!isSacredHz(hz)) throw new Error(`not a sacred frequency: ${hz}`);
  return Object.freeze({ hz, label }) as unknown as SacredFrequency;
}

const TRADITION_FREQ: ReadonlyArray<{ readonly t: Tradition; readonly hz: number }> = [
  { t: 'candomble',     hz: 528 },
  { t: 'umbanda',       hz: 396 },
  { t: 'ifa',           hz: 432 },
  { t: 'cabala',        hz: 963 },
  { t: 'astrologia',    hz: SCHUMANN_HZ },
  { t: 'tantra',        hz: TANTRA_GAMMA_HZ },
  { t: 'cigano-ramiro', hz: 528 },
];

const FREQ_LABEL: Readonly<Record<number, string>> = Object.freeze({
  174: 'Frequência do Despertar', 285: 'Regeneração', 396: 'Libertação', 417: 'Transformação',
  432: 'Harmonia Natural', 528: 'Transformação Milagrosa', 639: 'Conexão',
  741: 'Despertar Intuição', 852: 'Visão Interior', 963: 'Conexão Divina',
  [TANTRA_GAMMA_HZ]: 'Onda Gamma — Meditação Profunda',
  [SCHUMANN_HZ]: 'Ressonância Schumann — Batida da Terra',
});

export function getFrequencyForTradition(t: Tradition): SacredFrequency {
  const row = TRADITION_FREQ.find((r) => r.t === t);
  if (!row) throw new Error(`unknown tradition: ${t}`);
  const label = FREQ_LABEL[row.hz] ?? `${row.hz}Hz`;
  return makeFrequency(row.hz, label);
}

// =====================================================================
// INTENTION CATEGORIES PER TRADITION
// =====================================================================

type CategorySeed = readonly [Tradition, readonly string[]][];
const CATEGORY_SEED: CategorySeed = [
  ['candomble',     ['ancoramento', 'fluidez', 'forca']],
  ['umbanda',       ['protecao', 'sabedoria', 'humildade']],
  ['ifa',           ['clareza', 'destino', 'caminho']],
  ['cabala',        ['revelacao', 'manifestacao', 'integracao']],
  ['astrologia',    ['intuicao', 'renovacao', 'celebracao']],
  ['tantra',        ['despertar', 'uniao', 'energia']],
  ['cigano-ramiro', ['amor', 'orientacao', 'verdade']],
];

export function getTraditionIntentionCategories(t: Tradition): ReadonlyArray<IntentionCategory> {
  const row = CATEGORY_SEED.find((r) => r[0] === t);
  if (!row) return Object.freeze([]);
  const cats = row[1].map((c) => makeCategory(c));
  return Object.freeze(cats);
}
export function isIntentionCategory(s: string): boolean {
  return TRADITIONS.some((t) => getTraditionIntentionCategories(t).some((c) => (c as string) === s));
}

// =====================================================================
// TRACK MODEL & CATALOG (7 TRADITIONS × 3 TRACKS = 21)
// =====================================================================

export type CaptionLine = {
  readonly startSec: number;
  readonly endSec: number;
  readonly text: string;
  readonly lang: 'pt-BR' | 'en';
};

export type Track = {
  readonly id: TrackId;
  readonly title: string;
  readonly tradition: Tradition;
  readonly frequency: SacredFrequency;
  readonly durationSec: number;
  readonly sizeMb: number;
  readonly audioUrl: string;
  readonly description: string;
  readonly intentionCategories: ReadonlyArray<IntentionCategory>;
  readonly captions: ReadonlyArray<CaptionLine>;
  readonly thumbnailUrl: string;
};

type TrackSeed = readonly [Tradition, readonly [string, string, readonly string[]][]][];

const TRACK_SEED: TrackSeed = [
  ['candomble', [
    ['Iemanjá Calm Sea',     '528Hz — abraço das ondas da rainha do mar',         ['fluidez', 'ancoramento']],
    ['Oxalá White Light',    '528Hz — luz branca do pai da criação',              ['ancoramento', 'forca']],
    ['Xangô Justice Drum',   '528Hz — tambores da justiça e do trovão',           ['forca', 'ancoramento']],
  ]],
  ['umbanda', [
    ['Caboclo Sete Flechas', '396Hz — sete flechas de luz e direção',             ['protecao', 'sabedoria']],
    ['Preto-Velho Cachimbo', '396Hz — paciência e sabedoria dos mais velhos',    ['humildade', 'sabedoria']],
    ['Baiana Cocar Dourado', '396Hz — doçura e proteção do axé',                 ['protecao', 'humildade']],
  ]],
  ['ifa', [
    ['Odu of Ogbe',          '432Hz — abertura do caminho (Ogbe Meun)',           ['clareza', 'caminho']],
    ['Ifá Reading Bowl',     '432Hz — escuta profunda do Opó Afonjá',             ['destino', 'clareza']],
    ['Esentaiye Proverb',    '432Hz — provérbios do babalaô',                     ['caminho', 'destino']],
  ]],
  ['cabala', [
    ['Keter Crown',          '963Hz — coroa da vontade divina',                   ['revelacao', 'integracao']],
    ['Malkuth Earth',        '963Hz — ancoragem no mundo material',               ['manifestacao', 'integracao']],
    ['Tiferet Heart',        '963Hz — coração, beleza e compaixão',               ['integracao', 'revelacao']],
  ]],
  ['astrologia', [
    ['Luna Nueva',           '7.83Hz — novo ciclo lunar',                         ['intuicao', 'renovacao']],
    ['Solstice Fire',        '7.83Hz — fogo do solstício',                        ['celebracao', 'renovacao']],
    ['Saturn Return',        '7.83Hz — amadurecimento e estrutura',               ['renovacao', 'intuicao']],
  ]],
  ['tantra', [
    ['Kundalini Rising',     '40Hz — desperta a serpente na base',                ['despertar', 'energia']],
    ['Prana Flow',           '40Hz — respiração e circulação da energia vital',  ['energia', 'uniao']],
    ['Yab Yum Union',        '40Hz — reunião dos opostos',                        ['uniao', 'despertar']],
  ]],
  ['cigano-ramiro', [
    ['Cigana do Amor',       '528Hz — amor e cura da Cigana',                     ['amor', 'verdade']],
    ['Mesa Cigana',          '528Hz — mesa aberta do Ramiro',                     ['orientacao', 'verdade']],
    ['Boi da Cara Preta',    '528Hz — firmeza e proteção cigana',                 ['verdade', 'orientacao']],
  ]],
];

function freezeCaptions(lines: ReadonlyArray<CaptionLine>): ReadonlyArray<CaptionLine> {
  return Object.freeze(lines.map((l) => Object.freeze({ startSec: l.startSec, endSec: l.endSec, text: l.text, lang: l.lang })));
}

function buildCatalog(): ReadonlyArray<Track> {
  const out: Track[] = [];
  let counter = 0;
  for (const [tradition, seedTracks] of TRACK_SEED) {
    const canonicalHz = getFrequencyForTradition(tradition);
    seedTracks.forEach((seed, idx) => {
      counter++;
      const [title, desc, cats] = seed;
      const id = makeTrackId(`t_${tradition.replace(/-/g, '_')}_${(idx + 1).toString().padStart(2, '0')}`);
      const catsBranded = cats.map((c) => makeCategory(c));
      const isCandombleOrCigano = tradition === 'candomble' || tradition === 'cigano-ramiro';
      const captions = isCandombleOrCigano
        ? [
            { startSec: 0,   endSec: 30,  text: `${title}. Acolhimento inicial.`, lang: 'pt-BR' as const },
            { startSec: 30,  endSec: 120, text: 'Respire e plante a intenção.',   lang: 'pt-BR' as const },
            { startSec: 120, endSec: 240, text: 'Deixe a vibração trabalhar.',     lang: 'pt-BR' as const },
          ]
        : [
            { startSec: 0,   endSec: 30,  text: `${title}. Opening.`,               lang: 'en' as const },
            { startSec: 30,  endSec: 120, text: 'Breathe and set your intention.', lang: 'en' as const },
            { startSec: 120, endSec: 240, text: 'Let the vibration do the work.',  lang: 'en' as const },
          ];
      const track: Track = Object.freeze({
        id, title,
        tradition,
        frequency: canonicalHz,
        durationSec: 600 + ((counter * 37) % 480),
        sizeMb: 4 + ((counter * 3) % 24),
        audioUrl: `https://cdn.cabala.app/sacred-sound/${tradition}/${idx + 1}.mp3`,
        thumbnailUrl: `https://cdn.cabala.app/sacred-sound/${tradition}/${idx + 1}.jpg`,
        description: desc,
        intentionCategories: catsBranded,
        captions: freezeCaptions(captions),
      }) as unknown as Track;
      out.push(track);
    });
  }
  return Object.freeze(out);
}

const TRACK_CATALOG: ReadonlyArray<Track> = buildCatalog();

export type TrackFilter = {
  readonly tradition?: Tradition;
  readonly category?: IntentionCategory;
  readonly minDurationSec?: number;
  readonly maxSizeMb?: number;
};

export function listTracks(filter?: TrackFilter): ReadonlyArray<Track> {
  if (!filter) return TRACK_CATALOG;
  return Object.freeze(TRACK_CATALOG.filter((t) => {
    if (filter.tradition && t.tradition !== filter.tradition) return false;
    if (filter.category && !t.intentionCategories.some((c) => (c as string) === (filter.category as string))) return false;
    if (filter.minDurationSec !== undefined && t.durationSec < filter.minDurationSec) return false;
    if (filter.maxSizeMb !== undefined && t.sizeMb > filter.maxSizeMb) return false;
    return true;
  }));
}

export function getTrack(id: TrackId): Option<Track> {
  const t = TRACK_CATALOG.find((x) => (x.id as string) === (id as string));
  return t ? some(t) : NONE;
}

export function listTracksByTradition(t: Tradition): ReadonlyArray<Track> {
  return Object.freeze(TRACK_CATALOG.filter((x) => x.tradition === t));
}

export function listTracksByFrequency(hz: SacredFrequency): ReadonlyArray<Track> {
  const hzVal = (hz as unknown as { hz: number }).hz;
  return Object.freeze(TRACK_CATALOG.filter((x) => (x.frequency as unknown as { hz: number }).hz === hzVal));
}

export function getCaptionsForTrack(id: TrackId): ReadonlyArray<CaptionLine> {
  const t = getTrack(id);
  return isSome(t) ? t.value.captions : Object.freeze([]);
}
function isSome<T>(o: Option<T>): o is { kind: 'some'; value: T } { return o.kind === 'some'; }
function isNone<T>(o: Option<T>): o is { readonly kind: 'none' } { return o.kind === 'none'; }

// =====================================================================
// INTENTION MODEL
// =====================================================================

export type Intention = {
  readonly id: IntentionId;
  readonly userId: UserId;
  readonly trackId: TrackId;
  readonly category: IntentionCategory;
  readonly text: string;
  readonly tradition: Tradition;
  readonly createdAt: ISODateTime;
  readonly completedAt: Option<ISODateTime>;
  readonly reflection: Option<string>;
};

export type IntentionInput = {
  readonly category: IntentionCategory;
  readonly text: string;
};

export type IntentionError =
  | { readonly kind: 'auth-required' }
  | { readonly kind: 'track-not-found'; readonly trackId: TrackId }
  | { readonly kind: 'category-mismatch'; readonly category: string }
  | { readonly kind: 'text-empty' }
  | { readonly kind: 'text-too-long'; readonly maxLen: number }
  | { readonly kind: 'intention-not-found'; readonly id: IntentionId }
  | { readonly kind: 'already-completed' };

const MAX_INTENTION_LEN = 280;

const INTENTION_STORE: Map<string, ReadonlyArray<Intention>> = new Map();
const USER_STORE: Map<string, true> = new Map();

export function registerUser(userId: UserId): void {
  if (!USER_STORE.has(userId as string)) USER_STORE.set(userId as string, true);
}
function isAuthenticated(userId: UserId | undefined | null): userId is UserId {
  return userId !== undefined && userId !== null && USER_STORE.has(userId as string);
}

function validateIntentionInput(track: Track, input: IntentionInput): IntentionError | null {
  if (!input.text || input.text.trim().length === 0) return { kind: 'text-empty' };
  if (input.text.length > MAX_INTENTION_LEN) return { kind: 'text-too-long', maxLen: MAX_INTENTION_LEN };
  const cats: ReadonlyArray<string> = track.intentionCategories.map((c) => c as string);
  if (!cats.includes(input.category as string)) return { kind: 'category-mismatch', category: input.category as string };
  return null;
}

export function setIntention(
  userId: UserId,
  trackId: TrackId,
  input: IntentionInput,
): Result<IntentionId, IntentionError> {
  if (!isAuthenticated(userId)) return err({ kind: 'auth-required' });
  const trackOpt = getTrack(trackId);
  if (!isSome(trackOpt)) return err({ kind: 'track-not-found', trackId });
  const track = trackOpt.value;
  const validation = validateIntentionInput(track, input);
  if (validation) return err(validation);
  const id = makeIntentionId(`i_${(Math.random().toString(36).slice(2, 14).padStart(12, '0'))}`);
  const intention: Intention = Object.freeze({
    id,
    userId,
    trackId,
    category: input.category,
    text: input.text,
    tradition: track.tradition,
    createdAt: nowISO(),
    completedAt: NONE,
    reflection: NONE,
  });
  const existing = INTENTION_STORE.get(userId as string) ?? [];
  INTENTION_STORE.set(userId as string, Object.freeze([...existing, intention]));
  return ok(id);
}

export function listIntentions(userId: UserId): ReadonlyArray<Intention> {
  if (!isAuthenticated(userId)) return Object.freeze([]);
  return INTENTION_STORE.get(userId as string) ?? Object.freeze([]);
}

export function getIntention(id: IntentionId): Option<Intention> {
  for (const list of INTENTION_STORE.values()) {
    const found = list.find((i) => (i.id as string) === (id as string));
    if (found) return some(found);
  }
  return NONE;
}

export function completeIntention(id: IntentionId, reflection: string): Result<Intention, IntentionError> {
  const owner = findIntentionOwner(id);
  if (owner === null) return err({ kind: 'intention-not-found', id });
  const [userKey, list] = owner;
  const idx = list.findIndex((i) => (i.id as string) === (id as string));
  if (idx < 0) return err({ kind: 'intention-not-found', id });
  const current = list[idx];
  if (!current) return err({ kind: 'intention-not-found', id });
  if (isSome(current.completedAt)) return err({ kind: 'already-completed' });
  const updated: Intention = Object.freeze({
    ...current,
    completedAt: some(nowISO()),
    reflection: some(reflection),
  });
  const newList = Object.freeze(list.map((i, i2) => (i2 === idx ? updated : i)));
  INTENTION_STORE.set(userKey, newList);
  return ok(updated);
}

function findIntentionOwner(id: IntentionId): readonly [string, ReadonlyArray<Intention>] | null {
  for (const [k, v] of INTENTION_STORE.entries()) {
    if (v.some((i) => (i.id as string) === (id as string))) {
      return [k, v] as unknown as readonly [string, ReadonlyArray<Intention>];
    }
  }
  return null;
}

export function exportIntentionHistory(userId: UserId): ReadonlyArray<Intention> {
  if (!isAuthenticated(userId)) return Object.freeze([]);
  return listIntentions(userId);
}

// =====================================================================
// PLAYBACK STATE MACHINE
// =====================================================================

export type PlaybackState = 'idle' | 'loading' | 'playing' | 'paused' | 'ended' | 'error';

export type Session = {
  readonly trackId: TrackId;
  readonly state: PlaybackState;
  readonly position: number;
  readonly duration: number;
  readonly intentionId: Option<IntentionId>;
  readonly errorMessage: Option<string>;
  readonly _failOnLoad?: boolean;
};

export type Unsubscribe = () => void;
type StateListener = (s: PlaybackState) => void;

const SESSION_REGISTRY: Map<string, { readonly session: Session; readonly listeners: Set<StateListener> }> = new Map();

function sessionKey(trackId: TrackId, fail?: boolean): string {
  return `${trackId as string}::${fail ? 'fail' : 'ok'}`;
}

function storeSession(key: string, next: Session): void {
  const existing = SESSION_REGISTRY.get(key);
  const listeners = existing ? existing.listeners : new Set<StateListener>();
  SESSION_REGISTRY.set(key, { session: Object.freeze(next) as unknown as Session, listeners });
}

function notify(key: string, state: PlaybackState): void {
  const entry = SESSION_REGISTRY.get(key);
  if (!entry) return;
  for (const cb of [...entry.listeners]) cb(state);
}

export function createSession(trackId: TrackId, opts?: { readonly failOnLoad?: boolean }): Session {
  const tOpt = getTrack(trackId);
  const duration = isSome(tOpt) ? tOpt.value.durationSec : 600;
  const s: Session = Object.freeze({
    trackId,
    state: 'idle',
    position: 0,
    duration,
    intentionId: NONE,
    errorMessage: NONE,
    _failOnLoad: opts?.failOnLoad,
  }) as unknown as Session;
  storeSession(sessionKey(trackId, opts?.failOnLoad), s);
  return s;
}

export function play(session: Session): Session {
  const key = sessionKey(session.trackId, session._failOnLoad);
  const next: Session = Object.freeze({ ...session, state: 'loading', errorMessage: NONE }) as unknown as Session;
  storeSession(key, next);
  const resolved: Session = session._failOnLoad
    ? Object.freeze({ ...next, state: 'error', errorMessage: some('audio load failed') }) as unknown as Session
    : Object.freeze({ ...next, state: 'playing' }) as unknown as Session;
  storeSession(key, resolved);
  notify(key, resolved.state);
  return resolved;
}

export function pause(session: Session): Session {
  if (session.state !== 'playing') return session;
  const next: Session = Object.freeze({ ...session, state: 'paused' }) as unknown as Session;
  storeSession(sessionKey(session.trackId, session._failOnLoad), next);
  notify(sessionKey(session.trackId, session._failOnLoad), 'paused');
  return next;
}

export function resume(session: Session): Session {
  if (session.state !== 'paused') return session;
  const next: Session = Object.freeze({ ...session, state: 'playing' }) as unknown as Session;
  storeSession(sessionKey(session.trackId, session._failOnLoad), next);
  notify(sessionKey(session.trackId, session._failOnLoad), 'playing');
  return next;
}

export function seek(session: Session, position: number): Session {
  if (position < 0) return session;
  if (position > session.duration) {
    const ended: Session = Object.freeze({ ...session, state: 'ended', position: session.duration }) as unknown as Session;
    storeSession(sessionKey(session.trackId, session._failOnLoad), ended);
    notify(sessionKey(session.trackId, session._failOnLoad), 'ended');
    return ended;
  }
  const next: Session = Object.freeze({ ...session, position }) as unknown as Session;
  storeSession(sessionKey(session.trackId, session._failOnLoad), next);
  return next;
}

export function getCurrentPosition(session: Session): number {
  return session.position;
}

export function onStateChange(session: Session, cb: StateListener): Unsubscribe {
  const key = sessionKey(session.trackId, session._failOnLoad);
  const entry = SESSION_REGISTRY.get(key);
  if (!entry) return () => {};
  entry.listeners.add(cb);
  return () => { entry.listeners.delete(cb); };
}

// =====================================================================
// ACCESSIBILITY
// =====================================================================

export type KeyboardShortcut = {
  readonly key: string;
  readonly label: string;
  readonly action: 'play-pause' | 'seek-forward' | 'seek-backward' | 'volume-up' | 'volume-down' | 'mute';
};

const SHORTCUTS: ReadonlyArray<KeyboardShortcut> = Object.freeze([
  Object.freeze({ key: 'Space',      label: 'Play / Pause',         action: 'play-pause' }),
  Object.freeze({ key: 'ArrowRight', label: 'Avançar 10s',          action: 'seek-forward' }),
  Object.freeze({ key: 'ArrowLeft',  label: 'Voltar 10s',           action: 'seek-backward' }),
  Object.freeze({ key: 'ArrowUp',    label: 'Aumentar volume',      action: 'volume-up' }),
  Object.freeze({ key: 'ArrowDown',  label: 'Diminuir volume',      action: 'volume-down' }),
  Object.freeze({ key: 'm',          label: 'Mudo / Som',           action: 'mute' }),
]);

export function getKeyboardShortcuts(): ReadonlyArray<KeyboardShortcut> { return SHORTCUTS; }

export type ScreenReaderText = { readonly id: string; readonly text: string };

export function getScreenReaderAnnouncements(state: PlaybackState): ReadonlyArray<ScreenReaderText> {
  switch (state) {
    case 'idle':    return Object.freeze([{ id: 'sr-idle',   text: 'Pronto para tocar. Pressione espaço para iniciar.' }]);
    case 'loading': return Object.freeze([{ id: 'sr-load',   text: 'Carregando áudio sagrado...' }]);
    case 'playing': return Object.freeze([{ id: 'sr-play',   text: 'Tocando agora.' }]);
    case 'paused':  return Object.freeze([{ id: 'sr-pause',  text: 'Pausado. Pressione espaço para continuar.' }]);
    case 'ended':   return Object.freeze([{ id: 'sr-end',    text: 'Término. Intenção selada.' }]);
    case 'error':   return Object.freeze([{ id: 'sr-err',    text: 'Erro de áudio. Tente novamente.' }]);
  }
}

let _reducedMotionHint = false;
export function isReducedMotionPreferred(): boolean { return _reducedMotionHint; }
export function _setReducedMotionForTests(v: boolean): void { _reducedMotionHint = v; }

// =====================================================================
// TRADITION SELECTOR
// =====================================================================

export function getRecommendedTrackForTradition(t: Tradition, intention?: Intention): Option<TrackId> {
  const tracks = listTracksByTradition(t);
  if (tracks.length === 0) return NONE;
  if (!intention) {
    const first = tracks[0];
    return first ? some(first.id) : NONE;
  }
  for (const tr of tracks) {
    if (tr.intentionCategories.some((c) => (c as string) === (intention.category as string))) return some(tr.id);
  }
  const fb = tracks[0];
  return fb ? some(fb.id) : NONE;
}

// =====================================================================
// PERSISTENCE
// =====================================================================

const SESSION_PERSIST: Map<string, Session> = new Map();
const NETWORK_TYPE_HINT: { wifi: boolean } = { wifi: true };

export function saveSessionState(session: Session, userId: UserId): void {
  if (!isAuthenticated(userId)) return;
  SESSION_PERSIST.set(userId as string, session);
}

export function loadSessionState(userId: UserId): Option<Session> {
  if (!isAuthenticated(userId)) return NONE;
  const s = SESSION_PERSIST.get(userId as string);
  return s ? some(s) : NONE;
}

export function shouldWarnOnCellular(trackId: TrackId): boolean {
  const tOpt = getTrack(trackId);
  if (!isSome(tOpt)) return false;
  return tOpt.value.sizeMb > 20 && !NETWORK_TYPE_HINT.wifi;
}
export function _setNetworkHintForTests(wifi: boolean): void { NETWORK_TYPE_HINT.wifi = wifi; }

// =====================================================================
// HASHING / CANONICAL JSON
// =====================================================================

export function hashSessionState(session: Session): string {
  return sha256HexSync(`session::${session.trackId}::${session.state}::${session.position}::${session.duration}`);
}

export function hashIntentionCanonical(intention: Intention): string {
  return sha256HexSync(`intention::${intention.userId}::${intention.trackId}::${intention.category}::${intention.text}::${intention.tradition}::${intention.createdAt}`);
}

// =====================================================================
// TEST RESET
// =====================================================================

export function _resetUIForTests(): void {
  INTENTION_STORE.clear();
  USER_STORE.clear();
  SESSION_REGISTRY.clear();
  SESSION_PERSIST.clear();
  _reducedMotionHint = false;
  NETWORK_TYPE_HINT.wifi = true;
}
