/**
 * ════════════════════════════════════════════════════════════════════════════
 * W77-A — MENTORSHIP PAIRING · PEER-TO-PEER EQUALITY · NO GURU MODEL
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Pairs seekers ("mentees") with peer mentors based on:
 *   - Tradition affinity (distance in tradition graph)
 *   - Domain overlap (study areas)
 *   - Timezone proximity (availability windows)
 *   - Language overlap
 *   - Recency / activity (mild)
 *
 * Equalitarian model — NO hierarchy, NO guru/disciple. Both mentor and mentee
 * are peers at different points in their learning journey. Mentors learn from
 * mentees (reverse mentoring) just as mentees learn from mentors.
 *
 * 7 sacred traditions covered: Candomblé, Umbanda, Ifá, Cabala, Astrologia,
 *   Tantra, Cigano (Lenormand).
 *
 * 8 study domains: tarot, cigano, odu/orixá, astrologia, numerologia, runas,
 *   cabala, tantra.
 */

import { canonicalJson, sha256Hex, sha256HexSync } from './mentorship-pairing.hash.ts';

// ════════════════════════════════════════════════════════════════════════════
// VERSION + CONSTANTS
// ════════════════════════════════════════════════════════════════════════════

export const W77_A_VERSION = '1.0.0';
export const W77_A_CYCLE = 77;
export const W77_A_TRADITIONS_SHIPPED = 7;
export const W77_A_DOMAINS_SHIPPED = 8;

// ════════════════════════════════════════════════════════════════════════════
// BRANDED TYPES — NOMINAL ID
// ════════════════════════════════════════════════════════════════════════════

export type MentorId = string & { readonly __brand: 'MentorId' };
export type MenteeId = string & { readonly __brand: 'MenteeId' };
export type Tradition = string & { readonly __brand: 'Tradition' };
export type Domain = string & { readonly brand: 'Domain' };

export function mentorId(s: string): MentorId {
  if (typeof s !== 'string' || !/^m_[a-z0-9_]{3,40}$/.test(s)) {
    throw new Error(`invalid MentorId: ${JSON.stringify(s)} — must match /^m_[a-z0-9_]{3,40}$/`);
  }
  return s as MentorId;
}

export function menteeId(s: string): MenteeId {
  if (typeof s !== 'string' || !/^s_[a-z0-9_]{3,40}$/.test(s)) {
    throw new Error(`invalid MenteeId: ${JSON.stringify(s)} — must match /^s_[a-z0-9_]{3,40}$/`);
  }
  return s as MenteeId;
}

export function tradition(t: string): Tradition {
  const T = TRADITION_LIST as readonly string[];
  if (!T.includes(t)) {
    throw new Error(
      `invalid Tradition: ${JSON.stringify(t)} — must be one of ${T.length} sacred traditions`,
    );
  }
  return t as Tradition;
}

export function domain(d: string): Domain {
  const D = DOMAIN_LIST as readonly string[];
  if (!D.includes(d)) {
    throw new Error(`invalid Domain: ${JSON.stringify(d)} — must be one of ${D.length} domains`);
  }
  return d as Domain;
}

// ════════════════════════════════════════════════════════════════════════════
// SACRED CONSTANTS — 7 TRADITIONS
// ════════════════════════════════════════════════════════════════════════════

export const TRADITION_LIST = Object.freeze([
  'Candomble',
  'Umbanda',
  'Ifa',
  'Cabala',
  'Astrologia',
  'Tantra',
  'Cigano',
] as const);

export type TraditionName = (typeof TRADITION_LIST)[number];

// Tradition affinity matrix — 0=unrelated, 1=related, 2=closely related.
// Encodes practitioner wisdom that some traditions share family resemblances.
export const TRADITION_AFFINITY: Readonly<Record<TraditionName, ReadonlyArray<readonly [TraditionName, 0 | 1 | 2]>>> = Object.freeze({
  Candomble: Object.freeze([
    ['Umbanda', 2], ['Ifa', 2], ['Tantra', 1], ['Cigano', 0],
    ['Cabala', 0], ['Astrologia', 0],
  ] as const),
  Umbanda: Object.freeze([
    ['Candomble', 2], ['Ifa', 2], ['Tantra', 1], ['Cigano', 0],
    ['Cabala', 0], ['Astrologia', 0],
  ] as const),
  Ifa: Object.freeze([
    ['Candomble', 2], ['Umbanda', 2], ['Tantra', 1], ['Cigano', 0],
    ['Cabala', 1], ['Astrologia', 1],
  ] as const),
  Cabala: Object.freeze([
    ['Astrologia', 1], ['Tantra', 2], ['Ifa', 1], ['Cigano', 1],
    ['Candomble', 0], ['Umbanda', 0],
  ] as const),
  Astrologia: Object.freeze([
    ['Cabala', 1], ['Cigano', 2], ['Tantra', 1], ['Ifa', 1],
    ['Candomble', 0], ['Umbanda', 0],
  ] as const),
  Tantra: Object.freeze([
    ['Cabala', 2], ['Candomble', 1], ['Umbanda', 1], ['Ifa', 1],
    ['Astrologia', 1], ['Cigano', 0],
  ] as const),
  Cigano: Object.freeze([
    ['Astrologia', 2], ['Cabala', 1], ['Candomble', 0], ['Umbanda', 0],
    ['Ifa', 0], ['Tantra', 0],
  ] as const),
});

// ════════════════════════════════════════════════════════════════════════════
// 8 DOMAINS — STUDY AREAS
// ════════════════════════════════════════════════════════════════════════════

export const DOMAIN_LIST = Object.freeze([
  'tarot',
  'cigano',
  'odu-orixa',
  'astrologia',
  'numerologia',
  'runas',
  'cabala',
  'tantra',
] as const);

export type DomainName = (typeof DOMAIN_LIST)[number];

// ════════════════════════════════════════════════════════════════════════════
// SACRED TERMS — UNICODE LOOKAROUND
// ════════════════════════════════════════════════════════════════════════════

export const SACRED_TERMS: ReadonlyArray<string> = Object.freeze([
  'Oxala', 'Iemanja', 'Oxum', 'Iansa', 'Ogum', 'Xango', 'Exu', 'Ossain',
  'Babalorixa', 'Yalorixa', 'Ifa', 'Orunmila', 'Kether', 'Chokmah', 'Binah',
  'Lilith', 'Mezuzah', 'Mantra', 'Kundalini', 'Cigano', 'Taro',
  'Preto-Velho', 'Pomba-Gira', 'Caboclo',
]);

/**
 * Sacred term matcher — Unicode lookaround to handle diacritics correctly.
 * `\b` fails on accented chars; lookaround is the canonical fix (cycle 75 lesson).
 */
export function sacredMatch(text: string, term: string): boolean {
  // NFD-normalize both — splits 'Oxalá' into 'Oxala' + combining-acute (\u0301).
  // Combining marks are \p{M} (not \p{L}), so they satisfy [^\p{L}\p{N}_]
  // as a word boundary — letting the base form match accented input.
  const nfdText = text.normalize('NFD');
  const nfdTerm = term.normalize('NFD');
  const re = new RegExp(`(^|[^\\p{L}\\p{N}_])${escapeRegex(nfdTerm)}(?=$|[^\\p{L}\\p{N}_])`, 'u');
  return re.test(nfdText);
}


function escapeRegex(s: string): string {
  return s.replace(/[\\^$.*+?()[\]{}|]/g, '\\$&');
}

export function listSacredTermsMentioned(text: string): readonly string[] {
  const out: string[] = [];
  for (const term of SACRED_TERMS) {
    if (sacredMatch(text, term)) out.push(term);
  }
  return Object.freeze(out);
}

// ════════════════════════════════════════════════════════════════════════════
// PROFILES
// ════════════════════════════════════════════════════════════════════════════

export interface AvailabilityWindow {
  readonly weekday: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0=Sun
  readonly startHourUtc: number; // 0-23
  readonly endHourUtc: number; // 1-24
}

export interface MentorProfile {
  readonly id?: MentorId;
  readonly displayName: string;
  readonly traditions: ReadonlyArray<Tradition>; // primary + secondary
  readonly domains: ReadonlyArray<Domain>;
  readonly languages: ReadonlyArray<string>; // ISO 639-1 codes: 'pt','en','es', etc.
  readonly timezoneOffsetHours: number; // -12 to +14
  readonly availability: ReadonlyArray<AvailabilityWindow>;
  readonly yearsStudying: number; // 0+
  readonly bio: string;
  readonly acceptingMentees: boolean;
}

export interface MenteeProfile {
  readonly id?: MenteeId;
  readonly displayName: string;
  readonly traditions: ReadonlyArray<Tradition>;
  readonly domains: ReadonlyArray<Domain>;
  readonly languages: ReadonlyArray<string>;
  readonly timezoneOffsetHours: number;
  readonly availability: ReadonlyArray<AvailabilityWindow>;
  readonly weeksStudying: number; // 0+
  readonly bio: string;
}

export interface MentorSummary {
  readonly id: MentorId;
  readonly displayName: string;
  readonly traditions: ReadonlyArray<Tradition>;
  readonly domains: ReadonlyArray<Domain>;
  readonly languages: ReadonlyArray<string>;
  readonly acceptingMentees: boolean;
}

export interface PairInput {
  readonly mentee: MenteeProfile;
  readonly topN?: number; // default 5
}

export interface ScoreBreakdown {
  readonly traditionAffinity: number; // 0-40
  readonly domainOverlap: number; // 0-30
  readonly timezoneOverlap: number; // 0-10
  readonly languageOverlap: number; // 0-10
  readonly availabilityOverlap: number; // 0-10
  readonly sacredCoverage: number; // 0-5 (bonus)
  readonly recencyBonus: number; // 0..3 if mentor recently active
  readonly total: number; // 0-100
}

export interface PairResult {
  readonly mentorId: MentorId;
  readonly displayName: string;
  readonly traditions: ReadonlyArray<Tradition>;
  readonly domains: ReadonlyArray<Domain>;
  readonly score: ScoreBreakdown;
  readonly reasons: ReadonlyArray<string>; // human-readable
}

export interface PairRecord {
  readonly menteeId: MenteeId;
  readonly mentorId: MentorId;
  readonly total: number;
  readonly timestamp: string; // ISO
  readonly cacheKey: string;
}

// ════════════════════════════════════════════════════════════════════════════
// INTERNAL STATE — FROZEN COLLECTIONS
// ════════════════════════════════════════════════════════════════════════════

interface MentorEntry extends MentorProfile {
  readonly id: MentorId;
  readonly createdAtIso: string;
}

const MENTOR_REGISTRY: MentorEntry[] = [];
const PAIR_AUDIT: PairRecord[] = [];

export function _resetAuditForTests(): void {
  while (MENTOR_REGISTRY.length > 0) MENTOR_REGISTRY.pop();
  while (PAIR_AUDIT.length > 0) PAIR_AUDIT.pop();
}

function nowIso(): string {
  return new Date().toISOString();
}

// ════════════════════════════════════════════════════════════════════════════
// REGISTRATION
// ════════════════════════════════════════════════════════════════════════════

export function registerMentor(profile: MentorProfile): MentorId {
  if (!profile || typeof profile !== 'object') throw new Error('registerMentor: profile required');
  if (!profile.displayName || typeof profile.displayName !== 'string') {
    throw new Error('registerMentor: displayName required');
  }
  if (profile.traditions.length === 0) {
    throw new Error('registerMentor: at least one tradition required');
  }
  if (profile.domains.length === 0) {
    throw new Error('registerMentor: at least one domain required');
  }
  // Validate traditions + domains
  for (const t of profile.traditions) tradition(t as string);
  for (const d of profile.domains) domain(d as string);

  const id: MentorId =
    profile.id ?? mentorId(`m_${(MENTOR_REGISTRY.length + 1).toString(36)}_${Date.now().toString(36)}`);
  const entry: MentorEntry = Object.freeze({
    ...profile,
    id,
    createdAtIso: nowIso(),
  });
  MENTOR_REGISTRY.push(entry);
  return id;
}

export function registerMentee(profile: MenteeProfile): MenteeId {
  if (!profile || typeof profile !== 'object') throw new Error('registerMentee: profile required');
  if (!profile.displayName || typeof profile.displayName !== 'string') {
    throw new Error('registerMentee: displayName required');
  }
  if (profile.traditions.length === 0) {
    throw new Error('registerMentee: at least one tradition required');
  }
  if (profile.domains.length === 0) {
    throw new Error('registerMentee: at least one domain required');
  }
  for (const t of profile.traditions) tradition(t as string);
  for (const d of profile.domains) domain(d as string);

  const id: MenteeId =
    profile.id ??
    menteeId(`s_${(MENTOR_REGISTRY.length + 1).toString(36)}_${Date.now().toString(36)}`);
  // Note: mentee profiles are ephemeral by design — they live inside pairMentorship() calls.
  // We return the id but do NOT keep a registry of mentees (privacy-by-default).
  return id;
}

export function listMentorsByTradition(t: Tradition): readonly MentorSummary[] {
  const trad = tradition(t as string);
  const out: MentorSummary[] = [];
  for (const m of MENTOR_REGISTRY) {
    if ((m.traditions as readonly string[]).includes(trad)) {
      out.push({
        id: m.id,
        displayName: m.displayName,
        traditions: m.traditions,
        domains: m.domains,
        languages: m.languages,
        acceptingMentees: m.acceptingMentees,
      });
    }
  }
  return Object.freeze(out);
}

export function listAllMentors(): readonly MentorSummary[] {
  const out: MentorSummary[] = [];
  for (const m of MENTOR_REGISTRY) {
    out.push({
      id: m.id,
      displayName: m.displayName,
      traditions: m.traditions,
      domains: m.domains,
      languages: m.languages,
      acceptingMentees: m.acceptingMentees,
    });
  }
  return Object.freeze(out);
}

// ════════════════════════════════════════════════════════════════════════════
// AFFINITY SCORING
// ════════════════════════════════════════════════════════════════════════════

/**
 * Distance-based tradition affinity.
 *   - Same primary tradition = 40
 *   - Same tradition found in their secondary list = 28
 *   - Affinity-2 in matrix (closely related) = 18
 *   - Affinity-1 (related) = 10
 *   - Affinity-0 / not in matrix = 0
 */
export function traditionAffinityScore(
  menteeTs: ReadonlyArray<Tradition>,
  mentorTs: ReadonlyArray<Tradition>,
): number {
  let score = 0;
  const mStr = menteeTs as readonly string[];
  const mnStr = mentorTs as readonly string[];
  if (mStr[0] && mnStr.includes(mStr[0])) score += 40;
  else if (mStr.length >= 2 && mnStr.includes(mStr[1] as string)) score += 28;
  else if (mStr[0] && mnStr.includes(mStr[0])) score += 40;

  // Cross-tradition bonus from affinity matrix
  for (const t of mStr) {
    const affinityRow = TRADITION_AFFINITY[t as TraditionName];
    if (!affinityRow) continue;
    for (const [other, weight] of affinityRow) {
      if (mnStr.includes(other)) {
        const w = weight as 0 | 1 | 2;
        const points = w === 2 ? 18 : w === 1 ? 10 : 0;
        if (points > score) score = points; // take best
      }
    }
  }
  return Math.min(score, 40);
}

/**
 * Domain overlap — Jaccard coefficient × 30.
 * |A ∩ B| / |A ∪ B| × 30 → at most 30 points.
 */
export function domainOverlapScore(
  menteeD: ReadonlyArray<Domain>,
  mentorD: ReadonlyArray<Domain>,
): number {
  const m = new Set(menteeD as readonly string[]);
  const n = new Set(mentorD as readonly string[]);
  const inter: string[] = [];
  for (const x of m) if (n.has(x)) inter.push(x);
  const union: string[] = [];
  const seen = new Set<string>();
  for (const x of m) { if (!seen.has(x)) { union.push(x); seen.add(x); } }
  for (const x of n) { if (!seen.has(x)) { union.push(x); seen.add(x); } }
  if (union.length === 0) return 0;
  const jaccard = inter.length / union.length;
  return Math.round(jaccard * 30);
}

/**
 * Timezone proximity — 0..10
 * Δ-hours close = high score; far = low.
 */
export function timezoneScore(a: number, b: number): number {
  const delta = Math.abs(a - b);
  if (delta <= 1) return 10;
  if (delta <= 2) return 8;
  if (delta <= 4) return 6;
  if (delta <= 6) return 4;
  if (delta <= 9) return 2;
  return 0;
}

/**
 * Language overlap — equal primary = 10, partial overlap = 5.
 */
export function languageScore(a: ReadonlyArray<string>, b: ReadonlyArray<string>): number {
  const as = new Set(a);
  const bs = new Set(b);
  if (as.size === 0 || bs.size === 0) return 0;
  if (as.has('pt') && bs.has('pt')) return 10; // Portuguese nexus
  let inter = 0;
  for (const x of as) if (bs.has(x)) inter++;
  if (inter > 0) return 5;
  return 0;
}

/**
 * Availability overlap — count weekday+UTC-hour intersection, cap at 10.
 */
export function availabilityScore(
  a: ReadonlyArray<AvailabilityWindow>,
  b: ReadonlyArray<AvailabilityWindow>,
): number {
  let hours = 0;
  for (const wa of a) {
    for (const wb of b) {
      if (wa.weekday !== wb.weekday) continue;
      const start = Math.max(wa.startHourUtc, wb.startHourUtc);
      const end = Math.min(wa.endHourUtc, wb.endHourUtc);
      if (end > start) hours += end - start;
    }
  }
  return Math.min(hours, 10);
}

/**
 * Sacred coverage bonus — up to 5 points if mentor bio references
 * sacred terms that mentee cares about.
 */
export function sacredCoverageScore(menteeBio: string, mentorBio: string): number {
  const mentioned = listSacredTermsMentioned(menteeBio);
  if (mentioned.length === 0) return 0;
  let matches = 0;
  for (const term of mentioned) {
    if (sacredMatch(mentorBio, term)) matches++;
  }
  // 5 points if all mentioned terms are present; scale linearly
  return Math.round((matches / mentioned.length) * 5);
}

/**
 * Recency bonus — 0..3 if mentor was created recently (within 24h of pairMentorship call).
 */
export function recencyBonus(createdAtIso: string, now: string = nowIso()): number {
  const created = Date.parse(createdAtIso);
  const t = Date.parse(now);
  if (Number.isNaN(created) || Number.isNaN(t)) return 0;
  const diffMs = t - created;
  const dayMs = 24 * 60 * 60 * 1000;
  if (diffMs < 0) return 0;
  if (diffMs < dayMs) return 3;
  if (diffMs < 7 * dayMs) return 1;
  return 0;
}

// ════════════════════════════════════════════════════════════════════════════
// PAIRING
// ════════════════════════════════════════════════════════════════════════════

export function pairMentorship(input: PairInput): readonly PairResult[] {
  if (!input || typeof input !== 'object') throw new Error('pairMentorship: input required');
  if (!input.mentee) throw new Error('pairMentorship: input.mentee required');
  const m = input.mentee;
  const topN = input.topN ?? 5;
  if (!Number.isInteger(topN) || topN < 1 || topN > 50) {
    throw new Error(`pairMentorship: topN must be 1..50, got ${topN}`);
  }

  const results: PairResult[] = [];
  const nowS = nowIso();

  for (const mentor of MENTOR_REGISTRY) {
    if (!mentor.acceptingMentees) continue;

    const tScore = traditionAffinityScore(m.traditions, mentor.traditions);
    const dScore = domainOverlapScore(m.domains, mentor.domains);
    const tzScore = timezoneScore(m.timezoneOffsetHours, mentor.timezoneOffsetHours);
    const lScore = languageScore(m.languages, mentor.languages);
    const aScore = availabilityScore(m.availability, mentor.availability);
    const sScore = sacredCoverageScore(m.bio, mentor.bio);
    const rScore = recencyBonus(mentor.createdAtIso, nowS);

    const total = Math.min(100, tScore + dScore + tzScore + lScore + aScore + sScore + rScore);

    const reasons: string[] = [];
    if (tScore >= 18) reasons.push('tradição compat\u00edvel');
    if (dScore >= 15) reasons.push('sobreposição de áreas');
    if (tzScore >= 8) reasons.push('fuso horário próximo');
    if (lScore === 10) reasons.push('mesma língua principal');
    if (lScore === 5) reasons.push('língua compartilhada');
    if (aScore >= 4) reasons.push('horários compatíveis');
    if (sScore >= 3) reasons.push('vocabulário sagrado partilhado');
    if (rScore >= 1) reasons.push('mentor ativo recentemente');
    if (reasons.length === 0) reasons.push('candidato geral');

    const breakdown: ScoreBreakdown = Object.freeze({
      traditionAffinity: tScore,
      domainOverlap: dScore,
      timezoneOverlap: tzScore,
      languageOverlap: lScore,
      availabilityOverlap: aScore,
      sacredCoverage: sScore,
      recencyBonus: rScore,
      total,
    });

    results.push(
      Object.freeze({
        mentorId: mentor.id,
        displayName: mentor.displayName,
        traditions: mentor.traditions,
        domains: mentor.domains,
        score: breakdown,
        reasons: Object.freeze(reasons),
      }) as unknown as PairResult,
    );

    // Audit log entry
    const cacheKey = sha256HexSync(canonicalJson({ mentee: m, mentorId: mentor.id }));
    const menteeIdActual: MenteeId = m.id ?? menteeId(`s_anon_${results.length.toString(36)}`);
    PAIR_AUDIT.push(
      Object.freeze({
        menteeId: menteeIdActual,
        mentorId: mentor.id,
        total,
        timestamp: nowS,
        cacheKey,
      }),
    );
  }

  // Sort descending by total then by displayName for determinism
  results.sort((a, b) => {
    if (b.score.total !== a.score.total) return b.score.total - a.score.total;
    return a.displayName.localeCompare(b.displayName);
  });
  return Object.freeze(results.slice(0, topN));
}

// ════════════════════════════════════════════════════════════════════════════
// AUDIT EXPORT
// ════════════════════════════════════════════════════════════════════════════

export function exportAudit(): readonly PairRecord[] {
  return Object.freeze([...PAIR_AUDIT]);
}

// ════════════════════════════════════════════════════════════════════════════
// CACHE KEY HASH
// ════════════════════════════════════════════════════════════════════════════

export function hashCacheKey(input: PairInput): string {
  return sha256HexSync(
    canonicalJson({
      menteeId: input.mentee.id ?? null,
      traditions: input.mentee.traditions,
      domains: input.mentee.domains,
      topN: input.topN ?? 5,
    }),
  );
}

export async function hashCacheKeyAsync(input: PairInput): Promise<string> {
  return sha256Hex(
    canonicalJson({
      menteeId: input.mentee.id ?? null,
      traditions: input.mentee.traditions,
      domains: input.mentee.domains,
      topN: input.topN ?? 5,
    }),
  );
}

// Re-exports for convenience
export { canonicalJson, sha256Hex, sha256HexSync } from './mentorship-pairing.hash.ts';
