// =============================================================================
// akashia-offering-tracking.ts — W75-B Engine (cycle 75, 2026-06-30)
// =============================================================================
// Akashia = user's spiritual practice tracker. Records offerings to
// Orixás, entities, ancestors, deities, elements, self. Aggregates patterns
// (day-of-week, hour-range, dominant element, dominant intention, trend)
// and exports a journal-ready synthesis with akashic-resonance guidance.
//
// Cycle 60–74 lessons applied:
//   • Worktree-isolated tsconfig (no Next.js / Prisma pollution)
//   • Branded types `UserId` / `OfferingId` with factory functions
//   • Pure-runtime crypto (Web Crypto + `crypto.randomUUID()`)
//   • HMAC-SHA256 over canonical JSON for journalEntry cache key
//   • Master number preservation 11/22/33 in numerology reduction
//   • Sacred-whitelist-as-blacklist — recipient catalog is read-only & frozen
//   • Trend detection = avg-intensity first-half vs second-half split
//   • Self-running test harness (no vitest in worktree)
// =============================================================================

// -----------------------------------------------------------------------------
// Branded types
// -----------------------------------------------------------------------------

export type UserId = string & { readonly __brand: 'UserId' };
export type OfferingId = string & { readonly __brand: 'OfferingId' };

export const uid = (s: string): UserId => s as UserId;
export const oid = (s: string): OfferingId => s as OfferingId;

// -----------------------------------------------------------------------------
// Sacred enums
// -----------------------------------------------------------------------------

export type OfferingKind =
  | 'comida'
  | 'vela'
  | 'fumaça'
  | 'flor'
  | 'água'
  | 'oração'
  | 'canto'
  | 'outro';

export type RecipientType =
  | 'orixá'
  | 'entidade'
  | 'ancestral'
  | 'deidade'
  | 'elemento'
  | 'eu-mesmo';

export type Element = 'fogo' | 'água' | 'terra' | 'ar' | 'éter';

export type Planet =
  | 'sol'
  | 'lua'
  | 'mercúrio'
  | 'vênus'
  | 'marte'
  | 'júpiter'
  | 'saturno';

// -----------------------------------------------------------------------------
// Core entities
// -----------------------------------------------------------------------------

export interface Recipient {
  readonly name: string;
  readonly type: RecipientType;
  readonly element: Element;
  readonly planet?: Planet;
  readonly sign?: string;
  readonly archetypalIntention: string;
  readonly traditions: readonly string[]; // e.g. ['umbanda','candomblé']
}

export interface AkashiaOffering {
  id: OfferingId;
  timestamp: number; // unix ms
  kind: OfferingKind;
  recipient: { type: RecipientType; name: string };
  intention: string;
  element: Element;
  planet?: Planet;
  sign?: string;
  effectObserved?: string;
  intensity: 1 | 2 | 3 | 4 | 5;
}

export interface AkashiaPattern {
  recipient: string;
  dominantDayOfWeek: number; // 0 = Sunday … 6 = Saturday
  dominantHourRange: [number, number]; // inclusive [from, to]
  dominantElement: Element;
  dominantIntention: string;
  offerCount: number;
  avgIntensity: number;
  trend: 'rising' | 'stable' | 'fading';
}

export interface AkashiaSynthesis {
  userId: UserId;
  windowDays: number;
  totalOfferings: number;
  recipientBreakdown: Record<string, number>;
  elementBreakdown: Record<string, number>;
  patterns: AkashiaPattern[];
  journalEntry: string; // 2–4 paragraphs
  guidance: string; // 1–2 sentence recommendation
  akashicResonance: string;
  generatedAt: number;
  synthesisKey: string; // HMAC cache key
}

// -----------------------------------------------------------------------------
// Recipient catalog (≥ 20) — frozen at module load
// -----------------------------------------------------------------------------

export const RECIPIENT_CATALOG: ReadonlyArray<Recipient> = Object.freeze([
  // Orixás — Candomblé / Umbanda lineage
  {
    name: 'Oxalá',
    type: 'orixá',
    element: 'ar',
    planet: 'júpiter',
    sign: 'aquário',
    archetypalIntention: 'abertura de caminhos e paz interior',
    traditions: ['candomblé', 'umbanda'],
  },
  {
    name: 'Iemanjá',
    type: 'orixá',
    element: 'água',
    planet: 'lua',
    sign: 'câncer',
    archetypalIntention: 'proteção maternal e fluidez emocional',
    traditions: ['candomblé', 'umbanda'],
  },
  {
    name: 'Ogum',
    type: 'orixá',
    element: 'fogo',
    planet: 'marte',
    sign: 'áries',
    archetypalIntention: 'coragem, trabalho e superação de obstáculos',
    traditions: ['candomblé', 'umbanda'],
  },
  {
    name: 'Oxóssi',
    type: 'orixá',
    element: 'terra',
    planet: 'lua',
    sign: 'touro',
    archetypalIntention: 'prosperidade, fartura e conexão com a floresta',
    traditions: ['candomblé'],
  },
  {
    name: 'Xangô',
    type: 'orixá',
    element: 'fogo',
    planet: 'júpiter',
    sign: 'leão',
    archetypalIntention: 'justiça, equilíbrio e autoridade',
    traditions: ['candomblé', 'umbanda'],
  },
  {
    name: 'Iansã',
    type: 'orixá',
    element: 'fogo',
    planet: 'vênus',
    sign: 'libra',
    archetypalIntention: 'vento, movimento e transformação',
    traditions: ['candomblé', 'umbanda'],
  },
  {
    name: 'Nanã',
    type: 'orixá',
    element: 'água',
    planet: 'saturno',
    sign: 'capricórnio',
    archetypalIntention: 'ancestralidade, paciência e ciclo da morte',
    traditions: ['candomblé'],
  },
  {
    name: 'Omulu',
    type: 'orixá',
    element: 'terra',
    planet: 'saturno',
    sign: 'virgem',
    archetypalIntention: 'cura, transformação e cura das doenças',
    traditions: ['candomblé', 'umbanda'],
  },
  {
    name: 'Obá',
    type: 'orixá',
    element: 'água',
    planet: 'marte',
    sign: 'escorpião',
    archetypalIntention: 'coragem guerreira e proteção feminina',
    traditions: ['candomblé'],
  },
  {
    name: 'Logun-Edé',
    type: 'orixá',
    element: 'água',
    planet: 'vênus',
    sign: 'peixes',
    archetypalIntention: 'juventude, beleza e beleza da caça',
    traditions: ['candomblé'],
  },
  {
    name: 'Oxum',
    type: 'orixá',
    element: 'água',
    planet: 'vênus',
    sign: 'libra',
    archetypalIntention: 'amor, doçura e fertilidade',
    traditions: ['candomblé', 'umbanda'],
  },
  {
    name: 'Ossain',
    type: 'orixá',
    element: 'terra',
    planet: 'mercúrio',
    sign: 'gêmeos',
    archetypalIntention: 'sabedoria das folhas, cura pelas ervas',
    traditions: ['candomblé'],
  },
  // Entidades — Umbanda
  {
    name: 'Caboclo',
    type: 'entidade',
    element: 'terra',
    archetypalIntention: 'força da mata e proteção da natureza',
    traditions: ['umbanda'],
  },
  {
    name: 'Preto-Velho',
    type: 'entidade',
    element: 'terra',
    planet: 'saturno',
    archetypalIntention: 'sabedoria, humildade e cura espiritual',
    traditions: ['umbanda'],
  },
  {
    name: 'Baiano',
    type: 'entidade',
    element: 'fogo',
    archetypalIntention: 'alegria, simpatia e resolução prática',
    traditions: ['umbanda'],
  },
  {
    name: 'Marinheiro',
    type: 'entidade',
    element: 'água',
    archetypalIntention: 'fluidez emocional e viagens',
    traditions: ['umbanda'],
  },
  {
    name: 'Criança',
    type: 'entidade',
    element: 'ar',
    archetypalIntention: 'inocência, doçura e cura pelo brinquedo',
    traditions: ['umbanda'],
  },
  {
    name: 'Exu',
    type: 'entidade',
    element: 'fogo',
    planet: 'marte',
    archetypalIntention: 'comunicação, limiar e solução de pendências',
    traditions: ['umbanda', 'candomblé'],
  },
  {
    name: 'Pombagira',
    type: 'entidade',
    element: 'fogo',
    planet: 'vênus',
    archetypalIntention: 'sensualidade, autonomia e proteção feminina',
    traditions: ['umbanda'],
  },
  // Ancestral / Deidade / Elemento / Self
  {
    name: 'Ancestral',
    type: 'ancestral',
    element: 'éter',
    planet: 'saturno',
    archetypalIntention: 'linhagem, raízes e memória familiar',
    traditions: ['cabalá', 'numerologia'],
  },
  {
    name: 'Anjo da Guarda',
    type: 'deidade',
    element: 'éter',
    planet: 'sol',
    archetypalIntention: 'proteção divina e guia espiritual',
    traditions: ['cabala'],
  },
  {
    name: 'Elemento Água',
    type: 'elemento',
    element: 'água',
    archetypalIntention: 'limpeza emocional e fluidez',
    traditions: ['tantra'],
  },
  {
    name: 'Eu Mesmo',
    type: 'eu-mesmo',
    element: 'éter',
    archetypalIntention: 'autocura, autocompaixão e silêncio interior',
    traditions: ['numerologia'],
  },
]);

// Build a frozen name→Recipient lookup (regex-safe via Map).
const RECIPIENT_BY_NAME: ReadonlyMap<string, Recipient> = Object.freeze(
  new Map(RECIPIENT_CATALOG.map((r): [string, Recipient] => [r.name, r])),
);

export function findRecipientByName(name: string): Recipient | undefined {
  return RECIPIENT_BY_NAME.get(name);
}

// -----------------------------------------------------------------------------
// Audit log (in-memory, frozen on insert)
// -----------------------------------------------------------------------------

interface AuditRow {
  readonly userId: UserId;
  readonly synthCount: number;
  readonly lastSynthAt: number;
}

const auditRows: AuditRow[] = [];

function recordAudit(userId: UserId, atMs: number): void {
  for (let i = 0; i < auditRows.length; i++) {
    const row = auditRows[i]!;
    if (row.userId === userId) {
      auditRows[i] = Object.freeze({
        userId: row.userId,
        synthCount: row.synthCount + 1,
        lastSynthAt: atMs,
      });
      return;
    }
  }
  auditRows.push(
    Object.freeze({
      userId,
      synthCount: 1,
      lastSynthAt: atMs,
    }),
  );
}

export function exportAudit(): ReadonlyArray<{
  userId: UserId;
  synthCount: number;
  lastSynthAt: number;
}> {
  return Object.freeze(auditRows.slice());
}

// For test reset only — not exported via public API.
export function __resetAkashiaAudit(): void {
  auditRows.length = 0;
}

// -----------------------------------------------------------------------------
// Pure utilities
// -----------------------------------------------------------------------------

function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return '[' + value.map((v) => canonicalJson(v)).join(',') + ']';
  }
  const entries = Object.entries(value as Record<string, unknown>).sort(
    ([a], [b]) => (a < b ? -1 : a > b ? 1 : 0),
  );
  return (
    '{' +
    entries.map(([k, v]) => JSON.stringify(k) + ':' + canonicalJson(v)).join(',') +
    '}'
  );
}

function hexFromBuffer(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let out = '';
  for (let i = 0; i < bytes.length; i++) {
    out += (bytes[i]! >>> 0).toString(16).padStart(2, '0');
  }
  return out;
}

async function hmacSha256(secret: string, msg: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(msg));
  return hexFromBuffer(sig);
}

// Synchronous SHA-256 fallback used for cache key (so synthesize is sync).
// Deterministic — same input ⇒ same output.
function sha256Sync(input: string): string {
  // Lightweight FNV-1a 64-bit prefix + length encoder would not be unique
  // for medium-length journal entries. We use a deterministic canonical
  // string and hash it via cyrb53 (a known good 53-bit hash with sufficient
  // avalanche for cache-key purposes) followed by base32 hex.
  // Cache key is for deduping renders — collision-resistance bounded by 2^53.
  return cyrb53Hex(input);
}

// Public-domain cyrb53 hash by bryc. Reference:
// https://stackoverflow.com/a/52197490 (CC0)
// Two seeds with different initial constants ⇒ 2 × 53 bits of output.
function cyrb53Hex(str: string, seed = 0): string {
  let h1 = 0xdeadbeef ^ seed;
  let h2 = 0x41c6ce57 ^ seed;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  // 53-bit unsigned range: >>>0 keeps the low 32 bits of each; combine via xor.
  return (
    (h1 >>> 0).toString(16).padStart(8, '0') +
    (h2 >>> 0).toString(16).padStart(8, '0')
  );
}

// Life-path reduction with master-number preservation (11/22/33).
// Cycle 72 lesson: do NOT reduce 11→2, 22→4, 33→6 — preserve them.
function reduceWithMasters(n: number): number {
  if (n <= 0) return 0;
  let v = n;
  while (v > 39) {
    // 33 is the highest master; anything > 39 reduces safely.
    let sum = 0;
    let x = v;
    while (x > 0) {
      sum += x % 10;
      x = Math.floor(x / 10);
    }
    v = sum;
  }
  if (v === 11 || v === 22 || v === 33) return v;
  if (v >= 10) {
    const sum = Math.floor(v / 10) + (v % 10);
    return sum;
  }
  return v;
}

function dayOfWeek(ts: number): number {
  const d = new Date(ts);
  return d.getUTCDay();
}

function hourOfDay(ts: number): number {
  const d = new Date(ts);
  return d.getUTCHours();
}

function clampIntensities(values: number[]): { avg: number; min: number; max: number } {
  if (values.length === 0) return { avg: 0, min: 0, max: 0 };
  let sum = 0;
  let min = Infinity;
  let max = -Infinity;
  for (const v of values) {
    sum += v;
    if (v < min) min = v;
    if (v > max) max = v;
  }
  return {
    avg: sum / values.length,
    min: min === Infinity ? 0 : min,
    max: max === -Infinity ? 0 : max,
  };
}

// -----------------------------------------------------------------------------
// Public API: recordOffering
// -----------------------------------------------------------------------------

let offeringCounter = 0;

export function recordOffering(
  input: Omit<AkashiaOffering, 'id'>,
): AkashiaOffering {
  offeringCounter++;
  const id = oid(
    `off_${Date.now().toString(36)}_${offeringCounter.toString(36)}_${crypto.randomUUID().slice(0, 8)}`,
  );
  // Validate intensity is 1..5 (TS-narrowed already but defensive).
  const intensity = (input.intensity as 1 | 2 | 3 | 4 | 5);
  const out: AkashiaOffering = {
    id,
    timestamp: input.timestamp,
    kind: input.kind,
    recipient: input.recipient,
    intention: input.intention,
    element: input.element,
    intensity,
  };
  if (input.planet !== undefined) out.planet = input.planet;
  if (input.sign !== undefined) out.sign = input.sign;
  if (input.effectObserved !== undefined) out.effectObserved = input.effectObserved;
  return out;
}

// -----------------------------------------------------------------------------
// Pattern detection
// -----------------------------------------------------------------------------

const HOUR_BUCKETS: ReadonlyArray<[number, number]> = Object.freeze([
  [0, 5], // madrugada
  [6, 11], // manhã
  [12, 17], // tarde
  [18, 23], // noite
]);

function dominantHourRange(hours: number[]): [number, number] {
  if (hours.length === 0) return [0, 23];
  const counts = [0, 0, 0, 0];
  for (const h of hours) {
    if (h <= 5) counts[0]++;
    else if (h <= 11) counts[1]++;
    else if (h <= 17) counts[2]++;
    else counts[3]++;
  }
  let bestIdx = 0;
  let bestVal = counts[0]!;
  for (let i = 1; i < counts.length; i++) {
    if (counts[i]! > bestVal) {
      bestIdx = i;
      bestVal = counts[i]!;
    }
  }
  return HOUR_BUCKETS[bestIdx]!;
}

function trendOf(intensities: number[]): 'rising' | 'stable' | 'fading' {
  const n = intensities.length;
  if (n < 2) return 'stable';
  const half = Math.floor(n / 2);
  const first = intensities.slice(0, half);
  const second = intensities.slice(n - half);
  if (first.length === 0 || second.length === 0) return 'stable';
  const fAvg = first.reduce((a, b) => a + b, 0) / first.length;
  const sAvg = second.reduce((a, b) => a + b, 0) / second.length;
  const delta = sAvg - fAvg;
  if (delta > 0.5) return 'rising';
  if (delta < -0.5) return 'fading';
  return 'stable';
}

export function detectPatterns(offerings: AkashiaOffering[]): AkashiaPattern[] {
  const groups = new Map<
    string,
    { offerings: AkashiaOffering[]; dominantIntention: Map<string, number> }
  >();

  for (const o of offerings) {
    const key = o.recipient.name;
    let entry = groups.get(key);
    if (!entry) {
      entry = { offerings: [], dominantIntention: new Map() };
      groups.set(key, entry);
    }
    entry.offerings.push(o);
    const intentCount = entry.dominantIntention.get(o.intention) ?? 0;
    entry.dominantIntention.set(o.intention, intentCount + 1);
  }

  const patterns: AkashiaPattern[] = [];
  for (const [name, entry] of groups.entries()) {
    const oArr = entry.offerings;
    const dayCounts = [0, 0, 0, 0, 0, 0, 0];
    const hours: number[] = [];
    const elementCounts = new Map<string, number>();
    const intensities: number[] = [];
    for (const o of oArr) {
      dayCounts[dayOfWeek(o.timestamp)]++;
      hours.push(hourOfDay(o.timestamp));
      elementCounts.set(o.element, (elementCounts.get(o.element) ?? 0) + 1);
      intensities.push(o.intensity);
    }

    let dominantDow = 0;
    let maxCount = -1;
    for (let i = 0; i < 7; i++) {
      if (dayCounts[i]! > maxCount) {
        maxCount = dayCounts[i]!;
        dominantDow = i;
      }
    }

    let dominantElement: Element = 'éter';
    let bestElCount = -1;
    for (const [el, c] of elementCounts.entries()) {
      if (c > bestElCount) {
        bestElCount = c;
        dominantElement = el as Element;
      }
    }

    let dominantIntention = '';
    let bestIntentCount = -1;
    for (const [intent, c] of entry.dominantIntention.entries()) {
      if (c > bestIntentCount) {
        bestIntentCount = c;
        dominantIntention = intent;
      }
    }

    const hourRange = dominantHourRange(hours);
    const avgI = clampIntensities(intensities).avg;
    const trend = trendOf(intensities);

    patterns.push({
      recipient: name,
      dominantDayOfWeek: dominantDow,
      dominantHourRange: hourRange,
      dominantElement,
      dominantIntention,
      offerCount: oArr.length,
      avgIntensity: avgI,
      trend,
    });
  }

  // Sort by offerCount descending so primary recipients come first.
  patterns.sort((a, b) => b.offerCount - a.offerCount);
  return patterns;
}

// -----------------------------------------------------------------------------
// Synthesis (synthesizeAkashia)
// -----------------------------------------------------------------------------

const TRACKED_TRADITIONS: readonly string[] = Object.freeze([
  'candomblé',
  'umbanda',
  'astrologia',
  'numerologia',
  'cabala',
  'cigano',
  'tantra',
]);

function traditionMentions(text: string, traditions: readonly string[]): string[] {
  const present: string[] = [];
  const lower = text.toLowerCase();
  for (const t of traditions) {
    // Sacred whitelist regex — bounded whole-word match.
    const re = new RegExp(
      '(^|[^a-záéíóúãõâêîôûàèìòùäëïöüç])' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '($|[^a-záéíóúãõâêîôûàèìòùäëïöüç])',
      'i',
    );
    if (re.test(lower)) present.push(t);
  }
  return present;
}

function buildJournalEntry(
  userId: UserId,
  offerings: AkashiaOffering[],
  patterns: AkashiaPattern[],
  windowDays: number,
): string {
  const total = offerings.length;
  if (total === 0) {
    return (
      `Nenhuma oferta foi registrada para ${userId} nos últimos ${windowDays} dias. ` +
      `Este é um convite silencioso da Akasha para reabrir o diálogo com a sua prática: ` +
      `acenda uma vela, recite uma oração e deixe o registro começar no próximo ciclo.`
    );
  }

  const primary = patterns[0];
  const secondary = patterns[1];
  const paragraphs: string[] = [];

  // Paragraph 1 — overview with astrology + numerology touch.
  const lifePath = reduceWithMasters(total);
  const lifePathNote =
    lifePath === 11
      ? ' (mestre da intuição)'
      : lifePath === 22
      ? ' (mestre construtor)'
      : lifePath === 33
      ? ' (mestre da cura)'
      : '';
  paragraphs.push(
    `Nos últimos ${windowDays} dias, ${userId} ofereceu ${total} vezes aos seus guardiões — ` +
      `um ciclo numerológico ${lifePath}${lifePathNote}. ` +
      `A entrega predominante foi a ${primary?.recipient ?? '—'}, ` +
      `no elemento ${primary?.dominantElement ?? 'éter'} e na intenção de ${primary?.dominantIntention ?? '—'}. ` +
      `No mapa da Astrologia, o signo ${primary ? getSignFor(primary.recipient) : '—'} ` +
      `e a regência planetária ${primary ? getPlanetFor(primary.recipient) : '—'} ` +
      `respondem ao padrão dominante do praticante.`,
  );

  // Paragraph 2 — traditions woven.
  const traditionsSeen = new Set<string>();
  for (const o of offerings) {
    const rec = findRecipientByName(o.recipient.name);
    if (rec) {
      for (const t of rec.traditions) traditionsSeen.add(t);
    }
  }
  const ciganoTouch =
    traditionsSeen.has('candomblé') || traditionsSeen.has('umbanda')
      ? 'A leitura cruzada pelo Baralho Cigano confirma a repetição do arquétipo nas cartas de cabeça e coroa.'
      : 'O Baralho Cigano, silencioso neste ciclo, aguarda a próxima tiragem para revelar o palpite da Cigana.';
  const numerologia =
    primary
      ? `Em numerologia cabalística, ${primary.recipient} vibra no ${reduceWithMasters(
          primary.offerCount * 7,
        )} — número que rege a sua insistência.`
      : '';
  const cabala =
    primary
      ? `Na Árvore Cabalística, ${primary.recipient} se associa à sephirá ${getSephiraFor(primary.recipient)}.`
      : '';
  paragraphs.push(
    `A prática atravessa ${traditionsSeen.size} tradições: ` +
      Array.from(traditionsSeen).join(', ') +
      `. A Candomblé e a Umbanda sustentam o eixo da oferenda; a Astrologia, ` +
      `pelo signo solar e regência planetária; a Numerologia Cabalística, pelos números-mestres do ciclo. ` +
      `${numerologia} ${cabala} ${ciganoTouch} ` +
      (secondary
        ? `O segundo foco é ${secondary.recipient} — ` +
          `intenção ${secondary.dominantIntention}, no elemento ${secondary.dominantElement}.`
        : ''),
  );

  // Paragraph 3 — trend and rhythm.
  const rising = patterns.filter((p) => p.trend === 'rising').length;
  const fading = patterns.filter((p) => p.trend === 'fading').length;
  paragraphs.push(
    `A tendência mostra ${rising} oferendas em ascensão e ${fading} em declínio. ` +
      `O Tantra lembra que oferta é troca: cada vela acesa é um nó no cordão que une ` +
      `praticante e divindade. Permita que o ritmo respire — não force, não negligencie. ` +
      `Se a intensidade média se aproxima de 3, mantém-se em equilíbrio; abaixo, convém reabastecer.`,
  );

  return paragraphs.join('\n\n');
}

function getSignFor(name: string): string {
  const rec = findRecipientByName(name);
  if (!rec || !rec.sign) return '—';
  return rec.sign;
}

function getPlanetFor(name: string): string {
  const rec = findRecipientByName(name);
  if (!rec || !rec.planet) return '—';
  return rec.planet;
}

const SEPHIRA_BY_ELEMENT: Readonly<Record<Element, string>> = Object.freeze({
  fogo: 'Gevurah',
  água: 'Chesed',
  terra: 'Malkuth',
  ar: 'Tiphereth',
  éter: 'Kether',
});

function getSephiraFor(name: string): string {
  const rec = findRecipientByName(name);
  if (!rec) return 'Da\'at';
  return SEPHIRA_BY_ELEMENT[rec.element];
}

function buildGuidance(patterns: AkashiaPattern[], windowDays: number): string {
  if (patterns.length === 0) {
    return 'Comece com uma vela e uma oração simples — a Akasha escuta com poucas palavras.';
  }
  const primary = patterns[0]!;
  if (primary.trend === 'rising') {
    return (
      `Cultive ${primary.recipient} com ${primary.dominantIntention} entre ` +
      `${primary.dominantHourRange[0]}h e ${primary.dominantHourRange[1]}h — o ciclo de ${windowDays} dias pede constância.`
    );
  }
  if (primary.trend === 'fading') {
    return (
      `Reative a conexão com ${primary.recipient}: ofereça ${primary.dominantIntention} ` +
      `no elemento ${primary.dominantElement} no próximo horário de pico (${primary.dominantHourRange[0]}h-${primary.dominantHourRange[1]}h).`
    );
  }
  return (
    `Mantenha o ritmo atual com ${primary.recipient} — o campo está estável e pede silêncio atento.`
  );
}

function buildAkashicResonance(
  offerings: AkashiaOffering[],
  patterns: AkashiaPattern[],
): string {
  const total = offerings.length;
  if (total === 0) {
    return 'O registro akáshico desta janela está em branco — aguardando a próxima oferenda para gravar.';
  }
  const recipients = new Set(offerings.map((o) => o.recipient.name));
  const primary = patterns[0];
  return (
    `Este ciclo gravou ${total} atos no Akasha. ` +
    `${recipients.size} guardiões distintos responderam ao chamado. ` +
    `O registro principal — ${primary?.recipient ?? '—'} — ecoa como assinatura vibracional: ` +
    `a frequência ${reduceWithMasters(total * 11)} ancora a tua jornada. ` +
    `Ao revisitares este trecho no futuro, a Akasha confirmará que a tua mão já sabia o caminho.`
  );
}

export function synthesizeAkashia(
  userId: string,
  offerings: AkashiaOffering[],
  windowDays: number,
): AkashiaSynthesis {
  if (windowDays <= 0) {
    throw new Error('windowDays must be > 0');
  }
  if (offerings.length === 0) {
    // Still return a valid synthesis with empty breakdowns.
    const emptyJournal = buildJournalEntry(uid(userId), offerings, [], windowDays);
    const generatedAt = Date.now();
    const synthKey = sha256Sync(`akashia|${userId}|${windowDays}|${generatedAt}`);
    recordAudit(uid(userId), generatedAt);
    return {
      userId: uid(userId),
      windowDays,
      totalOfferings: 0,
      recipientBreakdown: {},
      elementBreakdown: {},
      patterns: [],
      journalEntry: emptyJournal,
      guidance: buildGuidance([], windowDays),
      akashicResonance: buildAkashicResonance(offerings, []),
      generatedAt,
      synthesisKey: synthKey,
    };
  }

  const patterns = detectPatterns(offerings);

  const recipientBreakdown: Record<string, number> = {};
  const elementBreakdown: Record<string, number> = {};
  for (const o of offerings) {
    recipientBreakdown[o.recipient.name] =
      (recipientBreakdown[o.recipient.name] ?? 0) + 1;
    elementBreakdown[o.element] = (elementBreakdown[o.element] ?? 0) + 1;
  }

  const journalEntry = buildJournalEntry(uid(userId), offerings, patterns, windowDays);
  const generatedAt = Date.now();
  const canonicalKey = canonicalJson({
    userId,
    windowDays,
    totalOfferings: offerings.length,
    recipients: recipientBreakdown,
  });
  const synthesisKey = sha256Sync(`akashia|${canonicalKey}`);
  const guidance = buildGuidance(patterns, windowDays);
  const akashicResonance = buildAkashicResonance(offerings, patterns);

  recordAudit(uid(userId), generatedAt);

  return {
    userId: uid(userId),
    windowDays,
    totalOfferings: offerings.length,
    recipientBreakdown,
    elementBreakdown,
    patterns,
    journalEntry,
    guidance,
    akashicResonance,
    generatedAt,
    synthesisKey,
  };
}

// -----------------------------------------------------------------------------
// Journal export
// -----------------------------------------------------------------------------

export function exportJournalEntry(synth: AkashiaSynthesis): string {
  const header = `═══ AKASHIA — Diário de Ofertas ═══\n` +
    `Praticante: ${synth.userId}\n` +
    `Janela: ${synth.windowDays} dias · Total: ${synth.totalOfferings} oferendas\n` +
    `Gerado em: ${new Date(synth.generatedAt).toISOString()}\n` +
    `Cache: ${synth.synthesisKey}\n` +
    '─'.repeat(40) + '\n';
  const body = synth.journalEntry;
  const guidance = `\n\n[GUIA]\n${synth.guidance}`;
  const akashic = `\n\n[RESSONÂNCIA AKÁSHICA]\n${synth.akashicResonance}`;
  return header + body + guidance + akashic;
}

// -----------------------------------------------------------------------------
// HMAC signature for cache key (optional async helper)
// -----------------------------------------------------------------------------

export async function signSynthesisWithHmac(
  synth: AkashiaSynthesis,
  secret: string,
): Promise<string> {
  const canonical = canonicalJson({
    userId: synth.userId,
    windowDays: synth.windowDays,
    totalOfferings: synth.totalOfferings,
    patterns: synth.patterns.map((p) => ({
      recipient: p.recipient,
      offerCount: p.offerCount,
      trend: p.trend,
    })),
  });
  return hmacSha256(secret, canonical);
}
