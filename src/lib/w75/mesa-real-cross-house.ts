/**
 * ════════════════════════════════════════════════════════════════════════════
 * W75-A — MESA REAL CROSS-HOUSE ENGINE
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Cycle 75 · 2026-06-30
 * Author: W75-A Coder (Mavis orchestrator session 414690567004426)
 *
 * Mesa Real is the primary product surface — a 36-house Cigano reading layout
 * where each house is associated with a Cigano (Lenormand) card and a topic.
 * When a user asks "what does this house say about X?" the engine CROSSES:
 *
 *   1. The Cigano card's surface meaning (1-line read)
 *   2. The western astrology Casa that matches the topic
 *      (sexualidade → Casa 8, trabalho → Casa 10, etc.)
 *   3. Lilith — sign / house / aspects — for the shadow/desire layer
 *   4. Numerologia Cabalística — LifePath / Expression / SoulUrge / PersonalYear
 *   5. + weaving of Orixás, Cabala, Tantra, Tarot, Runas (one per house at minimum)
 *
 * The output is a UNIFIED reading that holds the surface intact and DEEPENS it.
 *
 * Public API (cycle 75 contract):
 *   crossHouseInterpret(input) → CrossHouseOutput
 *   listMesaRealHouses()       → readonly array of 12 houses (1..12)
 *   exportAudit()              → flat list of all interpretations, frozen entries
 *   hashCacheKey(input)        → SHA-256 cache key (cycle 67 canonical-JSON pattern)
 *
 * Durable lessons applied (cycle 60-74):
 *   - Worktree-isolated tsconfig + node-stubs.d.ts as a script file (cycle 60, 73)
 *   - `.ts` extension imports + allowImportingTsExtensions (cycle 62)
 *   - lib: ["ES2022", "DOM"] in worktree tsconfig (cycle 73)
 *   - Branded types in Map<MesaRealHouse, ...> (cycle 73)
 *   - Result narrowing positive if (r.ok) (cycle 73)
 *   - Sacred token regex with \b boundaries (cycle 68/69)
 *   - Object.freeze on insert (cycle 68)
 *   - HMAC canonical JSON for cache (cycle 67)
 *   - Master number preservation 11/22/33 (cycle 72)
 *   - Self-running test harness (cycle 68+)
 */

// ════════════════════════════════════════════════════════════════════════════
// TYPES — Branded primitives + DTOs
// ════════════════════════════════════════════════════════════════════════════

export type MesaRealHouseNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export type MesaRealHouse = number & { readonly __brand: 'MesaRealHouse' };

/** 36 houses exist in a full Mesa Real; cycle 75 ships the first 12 (slice A). */
export type MesaRealTopic =
  | 'sexualidade'
  | 'trabalho'
  | 'familia'
  | 'espiritualidade'
  | 'saude'
  | 'financas'
  | 'relacionamentos'
  | 'comunicacao'
  | 'criatividade'
  | 'viagens'
  | 'amizades'
  | 'autoconhecimento';

export type SacredTradition =
  | 'Cigano'
  | 'Astrologia'
  | 'Numerologia Cabalística'
  | 'Orixás'
  | 'Cabala & Tantra'
  | 'Tarot'
  | 'Runas';

export interface Aspect {
  body: string;
  type: 'conjunção' | 'oposição' | 'trígono' | 'quadratura' | 'sextil';
  orb: number;
}

export interface NatalHouseReading {
  casa: number;
  sign: string;
  planetsInside: readonly string[];
  summary: string;
}

export interface LilithInput {
  sign: string;
  house: number;
  aspects: readonly Aspect[];
}

export interface NumerologyAspects {
  lifePath: number;
  expression: number;
  soulUrge: number;
  personalYear: number;
}

export interface AkashicSession {
  date: string;
  houseNumber: number;
  insight: string;
}

export interface AkashicContext {
  previousSessions: readonly AkashicSession[];
}

export interface CrossHouseInput {
  mesaRealHouseNumber: MesaRealHouseNumber;
  topic: MesaRealTopic;
  westernNatalChart: {
    casa1?: NatalHouseReading;
    casa2?: NatalHouseReading;
    casa3?: NatalHouseReading;
    casa4?: NatalHouseReading;
    casa5?: NatalHouseReading;
    casa6?: NatalHouseReading;
    casa7?: NatalHouseReading;
    casa8?: NatalHouseReading;
    casa9?: NatalHouseReading;
    casa10?: NatalHouseReading;
    casa11?: NatalHouseReading;
    casa12?: NatalHouseReading;
  };
  lilith: LilithInput;
  numerologyAspects: NumerologyAspects;
  akashicContext?: AkashicContext;
}

export interface CrossHouseOutput {
  mesaRealHouseNumber: MesaRealHouseNumber;
  topic: MesaRealTopic;
  surface: string;
  depthAstrologia: string;
  depthLilith: string;
  depthNumerologia: string;
  bonusWeaves: ReadonlyArray<{ tradition: SacredTradition; line: string }>;
  unifiedReading: string;
  confidence: 'low' | 'medium' | 'high';
  dataGaps: readonly string[];
  traditionsUsed: readonly SacredTradition[];
  meta: {
    cacheKey: string;
    generatedAt: string;
    brand: 'W75-A';
  };
}

// ════════════════════════════════════════════════════════════════════════════
// BRANDED FACTORIES
// ════════════════════════════════════════════════════════════════════════════

export function mrh(n: number): MesaRealHouse {
  if (!Number.isInteger(n) || n < 1 || n > 12) {
    throw new Error(`MesaRealHouse out of range: ${n} (expected 1..12)`);
  }
  return n as MesaRealHouse;
}

export function topic(t: string): MesaRealTopic {
  const allowed: readonly MesaRealTopic[] = [
    'sexualidade',
    'trabalho',
    'familia',
    'espiritualidade',
    'saude',
    'financas',
    'relacionamentos',
    'comunicacao',
    'criatividade',
    'viagens',
    'amizades',
    'autoconhecimento',
  ];
  if (!allowed.includes(t as MesaRealTopic)) {
    throw new Error(`Unknown MesaRealTopic: ${t}`);
  }
  return t as MesaRealTopic;
}

// ════════════════════════════════════════════════════════════════════════════
// SIDE-EFFECT-FREE PRIMITIVES
// ════════════════════════════════════════════════════════════════════════════

export function reduceWithMasters(n: number): number {
  if (!Number.isFinite(n) || n < 0) {
    throw new Error(`reduceWithMasters: non-finite or negative input: ${n}`);
  }
  let v = Math.floor(n);
  // Reduce while above single-digit AND not a master.
  // Cycle 72 lesson: master numbers MUST be preserved at every step.
  while (v > 9 && v !== 11 && v !== 22 && v !== 33) {
    let sum = 0;
    while (v > 0) {
      sum += v % 10;
      v = Math.floor(v / 10);
    }
    v = sum;
  }
  // If still not a master, normalize to 1..9.
  if (v === 11 || v === 22 || v === 33) return v;
  return v % 9 === 0 ? 9 : v % 9;
}

export function sacredMatch(haystack: string, needle: string): boolean {
  if (!needle) return false;
  // Cycle 68/69 lesson: ASCII \b treats non-ASCII letters (ã, ç, â) as
  // non-word chars, so `\bOgum\b` matches "Ogumância". Use Unicode word chars
  // via [^\p{L}\p{N}_] with the u flag instead.
  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(^|[^\\p{L}\\p{N}_])${escaped}(?=$|[^\\p{L}\\p{N}_])`, 'iu');
  return re.test(haystack);
}

export async function sha256Hex(s: string): Promise<string> {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(s));
  const bytes = new Uint8Array(buf);
  let out = '';
  for (let i = 0; i < bytes.length; i++) {
    out += (bytes[i] ?? 0).toString(16).padStart(2, '0');
  }
  return out;
}

export function sha256HexSync(s: string): string {
  const K = new Uint32Array([
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1,
    0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
    0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
    0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
    0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
    0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
    0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
    0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
    0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ]);

  const utf8: number[] = [];
  for (let i = 0; i < s.length; i++) {
    let c = s.charCodeAt(i);
    if (c < 0x80) utf8.push(c);
    else if (c < 0x800) {
      utf8.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f));
    } else if (c < 0xd800 || c >= 0xe000) {
      utf8.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
    } else {
      i++;
      const c2 = s.charCodeAt(i);
      c = 0x10000 + (((c & 0x3ff) << 10) | (c2 & 0x3ff));
      utf8.push(
        0xf0 | (c >> 18),
        0x80 | ((c >> 12) & 0x3f),
        0x80 | ((c >> 6) & 0x3f),
        0x80 | (c & 0x3f),
      );
    }
  }

  const bytes = utf8;
  const bitLen = bytes.length * 8;
  bytes.push(0x80);
  while (bytes.length % 64 !== 56) bytes.push(0);

  const hi = Math.floor(bitLen / 0x100000000);
  const lo = bitLen >>> 0;
  bytes.push((hi >>> 24) & 0xff, (hi >>> 16) & 0xff, (hi >>> 8) & 0xff, hi & 0xff);
  bytes.push((lo >>> 24) & 0xff, (lo >>> 16) & 0xff, (lo >>> 8) & 0xff, lo & 0xff);

  const H = new Uint32Array([
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c,
    0x1f83d9ab, 0x5be0cd19,
  ]);
  const W = new Uint32Array(64);

  for (let chunk = 0; chunk < bytes.length; chunk += 64) {
    for (let i = 0; i < 16; i++) {
      const o = chunk + i * 4;
      W[i] = (((bytes[o] ?? 0) << 24) |
        ((bytes[o + 1] ?? 0) << 16) |
        ((bytes[o + 2] ?? 0) << 8) |
        (bytes[o + 3] ?? 0)) >>> 0;
    }
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(W[i - 15]!, 7) ^ rotr(W[i - 15]!, 18) ^ (W[i - 15]! >>> 3);
      const s1 = rotr(W[i - 2]!, 17) ^ rotr(W[i - 2]!, 19) ^ (W[i - 2]! >>> 10);
      W[i] = (W[i - 16]! + s0 + W[i - 7]! + s1) >>> 0;
    }

    let [a, b, c, d, e, f, g, h] = [
      H[0]!, H[1]!, H[2]!, H[3]!, H[4]!, H[5]!, H[6]!, H[7]!,
    ];

    for (let i = 0; i < 64; i++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + (K[i] ?? 0) + (W[i] ?? 0)) >>> 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const mj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + mj) >>> 0;
      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    H[0] = (H[0]! + a) >>> 0;
    H[1] = (H[1]! + b) >>> 0;
    H[2] = (H[2]! + c) >>> 0;
    H[3] = (H[3]! + d) >>> 0;
    H[4] = (H[4]! + e) >>> 0;
    H[5] = (H[5]! + f) >>> 0;
    H[6] = (H[6]! + g) >>> 0;
    H[7] = (H[7]! + h) >>> 0;
  }

  let out = '';
  for (let i = 0; i < 8; i++) {
    out += (H[i] ?? 0).toString(16).padStart(8, '0');
  }
  return out;
}

function rotr(x: number, n: number): number {
  return ((x >>> n) | (x << (32 - n))) >>> 0;
}

export function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return '[' + value.map(canonicalJson).join(',') + ']';
  }
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  return (
    '{' +
    keys.map((k) => JSON.stringify(k) + ':' + canonicalJson(obj[k])).join(',') +
    '}'
  );
}

export async function hmacSha256(secret: string, msg: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(msg));
  const bytes = new Uint8Array(sig);
  let out = '';
  for (let i = 0; i < bytes.length; i++) {
    out += (bytes[i] ?? 0).toString(16).padStart(2, '0');
  }
  return out;
}

// ════════════════════════════════════════════════════════════════════════════
// MESA REAL HOUSE DATA — 12 houses (slice A of 36)
// ════════════════════════════════════════════════════════════════════════════

interface HouseSeed {
  number: MesaRealHouseNumber;
  ciganoCard: string;
  ciganoSurface: string;
  topic: MesaRealTopic;
  astrologiaCasa: number;
  bonus: ReadonlyArray<{ tradition: SacredTradition; seed: string }>;
}

const HOUSES_DATA: ReadonlyArray<HouseSeed> = Object.freeze([
  Object.freeze({
    number: 1 as MesaRealHouseNumber,
    ciganoCard: 'Cavaleiro',
    ciganoSurface:
      'Notícias, movimento, alguém chega. O Cigano Cavaleiro abre a Casa 1 da Mesa Real — recado, visita, deslocamento.',
    topic: 'comunicacao' as MesaRealTopic,
    astrologiaCasa: 3,
    bonus: Object.freeze([
      Object.freeze({
        tradition: 'Orixás' as SacredTradition,
        seed: 'Ogum corta caminhos e abre caminhos; o Cavaleiro é quem traz a mensagem.',
      }),
      Object.freeze({
        tradition: 'Runas' as SacredTradition,
        seed: 'Runa Ehwaz (cavalo) — parceria de movimento, viagem em progresso.',
      }),
    ]),
  }),
  Object.freeze({
    number: 2 as MesaRealHouseNumber,
    ciganoCard: 'Trevo',
    ciganoSurface:
      'Sorte pequena, oportunidade rápida. A Casa 2 da Mesa Real fala de chances que aparecem de relance.',
    topic: 'financas' as MesaRealTopic,
    astrologiaCasa: 2,
    bonus: Object.freeze([
      Object.freeze({
        tradition: 'Numerologia Cabalística' as SacredTradition,
        seed: 'LifePath 2 ou 11 (mestre) favorece a sorte rápida; o Trevo lembra o 2 binário.',
      }),
      Object.freeze({
        tradition: 'Cabala & Tantra' as SacredTradition,
        seed: 'Sephirah Chokhmah binária e o sopro da sorte; Trevo = centelha.',
      }),
    ]),
  }),
  Object.freeze({
    number: 3 as MesaRealHouseNumber,
    ciganoCard: 'Navio',
    ciganoSurface:
      'Viagem longa, estrangeiro, comércio, distância. A Casa 3 da Mesa Real aponta o horizonte e o que vem de fora.',
    topic: 'viagens' as MesaRealTopic,
    astrologiaCasa: 9,
    bonus: Object.freeze([
      Object.freeze({
        tradition: 'Cabala & Tantra' as SacredTradition,
        seed: 'Sephirah Yesod (lua, navegação onírica) rege o Navio e os caminhos de água.',
      }),
    ]),
  }),
  Object.freeze({
    number: 4 as MesaRealHouseNumber,
    ciganoCard: 'Casa',
    ciganoSurface:
      'Lar, família, estrutura, propriedade. A Casa 4 da Mesa Real fala de base, raízes e onde o consulente descansa.',
    topic: 'familia' as MesaRealTopic,
    astrologiaCasa: 4,
    bonus: Object.freeze([
      Object.freeze({
        tradition: 'Orixás' as SacredTradition,
        seed: 'Oxum cuida do lar e da família; a Casa é onde Oxum banha o chão.',
      }),
    ]),
  }),
  Object.freeze({
    number: 5 as MesaRealHouseNumber,
    ciganoCard: 'Árvore',
    ciganoSurface:
      'Saúde, vitalidade, raízes profundas, crescimento lento e firme. A Casa 5 da Mesa Real fala do corpo e da saúde.',
    topic: 'saude' as MesaRealTopic,
    astrologiaCasa: 6,
    bonus: Object.freeze([
      Object.freeze({
        tradition: 'Tarot' as SacredTradition,
        seed: 'A Imperatriz (III) e a Força (XI) regem a Árvore — corpo que floresce.',
      }),
    ]),
  }),
  Object.freeze({
    number: 6 as MesaRealHouseNumber,
    ciganoCard: 'Nuvens',
    ciganoSurface:
      'Confusão mental, dúvida, pouca clareza. A Casa 6 da Mesa Real mostra onde a mente embaralha.',
    topic: 'autoconhecimento' as MesaRealTopic,
    astrologiaCasa: 12,
    bonus: Object.freeze([
      Object.freeze({
        tradition: 'Runas' as SacredTradition,
        seed: 'Runa Perth (mistério, segredo) e Isa (gelo, pausa) — até a névoa dissipar.',
      }),
    ]),
  }),
  Object.freeze({
    number: 7 as MesaRealHouseNumber,
    ciganoCard: 'Cobra',
    ciganoSurface:
      'Ciúme, traição, sedução, inimigo oculto. A Casa 7 da Mesa Real fala do que se arrasta e do que morde.',
    topic: 'relacionamentos' as MesaRealTopic,
    astrologiaCasa: 7,
    bonus: Object.freeze([
      Object.freeze({
        tradition: 'Orixás' as SacredTradition,
        seed: 'Oxumarê rege a Cobra — o caminho sinuoso, o veneno e a cura.',
      }),
      Object.freeze({
        tradition: 'Cabala & Tantra' as SacredTradition,
        seed: 'Sephirah Netzach (Vênus, desejo) e o canal serpentino de Kundalini.',
      }),
    ]),
  }),
  Object.freeze({
    number: 8 as MesaRealHouseNumber,
    ciganoCard: 'Caixão',
    ciganoSurface:
      'Fim, encerramento, luto, transformação radical. O Cigano Caixão domina a Casa 8 da Mesa Real — o que precisa morrer para renascer.',
    topic: 'sexualidade' as MesaRealTopic,
    astrologiaCasa: 8,
    bonus: Object.freeze([
      Object.freeze({
        tradition: 'Cabala & Tantra' as SacredTradition,
        seed: 'Sephirah Binah (entendimento, morte) + Tantra — o Caixão é a transmutação.',
      }),
      Object.freeze({
        tradition: 'Tarot' as SacredTradition,
        seed: 'Arcano XIII — A Morte — completa a lição do Caixão.',
      }),
    ]),
  }),
  Object.freeze({
    number: 9 as MesaRealHouseNumber,
    ciganoCard: 'Buquê',
    ciganoSurface:
      'Presente, gentileza, reconhecimento, beleza. A Casa 9 da Mesa Real é onde o consulente recebe afeto e dá.',
    topic: 'amizades' as MesaRealTopic,
    astrologiaCasa: 11,
    bonus: Object.freeze([
      Object.freeze({
        tradition: 'Tarot' as SacredTradition,
        seed: 'A Estrela (XVII) — generosidade, dádiva, comunidade.',
      }),
    ]),
  }),
  Object.freeze({
    number: 10 as MesaRealHouseNumber,
    ciganoCard: 'Foice',
    ciganoSurface:
      'Corte, decisão, ruptura, escolha. A Casa 10 da Mesa Real mostra onde o consulente precisa cortar para crescer.',
    topic: 'trabalho' as MesaRealTopic,
    astrologiaCasa: 10,
    bonus: Object.freeze([
      Object.freeze({
        tradition: 'Orixás' as SacredTradition,
        seed: 'Iansã corta com o vento e o raio; a Foice é o Exu da decisão.',
      }),
      Object.freeze({
        tradition: 'Numerologia Cabalística' as SacredTradition,
        seed: 'Expressão em 10/1 ou 22/4 — vocação exige corte do supérfluo.',
      }),
    ]),
  }),
  Object.freeze({
    number: 11 as MesaRealHouseNumber,
    ciganoCard: 'Chicote',
    ciganoSurface:
      'Conflito, repetição, crítica, dor que ensina. A Casa 11 da Mesa Real mostra o ciclo que precisa ser quebrado.',
    topic: 'criatividade' as MesaRealTopic,
    astrologiaCasa: 5,
    bonus: Object.freeze([
      Object.freeze({
        tradition: 'Runas' as SacredTradition,
        seed: 'Runa Nauthiz (necessidade, lição) e Kenaz (tocha criativa).',
      }),
    ]),
  }),
  Object.freeze({
    number: 12 as MesaRealHouseNumber,
    ciganoCard: 'Pássaros',
    ciganoSurface:
      'Conversa, fofoca, parceria, comunicação oscilante. A Casa 12 da Mesa Real fala do que entra e sai pela boca.',
    topic: 'espiritualidade' as MesaRealTopic,
    astrologiaCasa: 9,
    bonus: Object.freeze([
      Object.freeze({
        tradition: 'Cabala & Tantra' as SacredTradition,
        seed: 'Sephirah Chokhmah (sabedoria) — Pássaros carregam mensagens entre mundos.',
      }),
      Object.freeze({
        tradition: 'Tarot' as SacredTradition,
        seed: 'Arcano I — O Mago — palavra que cria; Pássaros = palavra que voa.',
      }),
    ]),
  }),
]);

// ════════════════════════════════════════════════════════════════════════════
// ENGINE STATE
// ════════════════════════════════════════════════════════════════════════════

const HOUSES_BY_NUMBER: ReadonlyMap<MesaRealHouse, HouseSeed> = (() => {
  const m = new Map<MesaRealHouse, HouseSeed>();
  for (const h of HOUSES_DATA) {
    m.set(mrh(h.number), h);
  }
  return m;
})();

const AUDIT_LOG: CrossHouseOutput[] = [];

// ════════════════════════════════════════════════════════════════════════════
// PUBLIC API — listMesaRealHouses
// ════════════════════════════════════════════════════════════════════════════

export interface MesaRealHouseSummary {
  number: number;
  topic: MesaRealTopic;
  ciganoSurface: string;
  astrologiaCasa: number;
  ciganoCard: string;
  bonusTraditions: readonly SacredTradition[];
}

export function listMesaRealHouses(): ReadonlyArray<MesaRealHouseSummary> {
  return HOUSES_DATA.map((h) =>
    Object.freeze({
      number: h.number,
      topic: h.topic,
      ciganoSurface: h.ciganoSurface,
      astrologiaCasa: h.astrologiaCasa,
      ciganoCard: h.ciganoCard,
      bonusTraditions: h.bonus.map((b) => b.tradition),
    }),
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PUBLIC API — crossHouseInterpret
// ════════════════════════════════════════════════════════════════════════════

function renderAstrologiaCasa(
  casaNumber: number,
  chart: CrossHouseInput['westernNatalChart'],
): string {
  const key = `casa${casaNumber}` as
    | 'casa1' | 'casa2' | 'casa3' | 'casa4' | 'casa5' | 'casa6'
    | 'casa7' | 'casa8' | 'casa9' | 'casa10' | 'casa11' | 'casa12';
  const reading = chart[key];
  if (!reading) {
    return `Casa ${casaNumber} do mapa astral não foi fornecida — profundidade astrológica parcial.`;
  }
  const planets = reading.planetsInside.length
    ? ` com ${reading.planetsInside.join(', ')} dentro`
    : ' sem planetas dentro';
  return `Casa ${casaNumber} (${reading.sign})${planets}: ${reading.summary}`;
}

function renderLilith(lilith: LilithInput, topicName: MesaRealTopic): string {
  const aspectLines = lilith.aspects.length
    ? lilith.aspects
        .map((a) => `${a.type} com ${a.body} (orbe ${a.orb}°)`)
        .join('; ')
    : 'sem aspectos relevantes registrados';
  return `Lilith em ${lilith.sign} na Casa ${lilith.house} — ${aspectLines}. Em ${topicName}, ela pede que o consulente confronte o que foi reprimido.`;
}

function renderNumerologia(n: NumerologyAspects, topicName: MesaRealTopic): string {
  const lp = reduceWithMasters(n.lifePath);
  const ex = reduceWithMasters(n.expression);
  const su = reduceWithMasters(n.soulUrge);
  const py = reduceWithMasters(n.personalYear);
  return (
    `Numerologia Cabalística para ${topicName}: ` +
    `LifePath ${lp} (entrada ${n.lifePath}), Expressão ${ex}, ` +
    `Alma ${su}, Ano Pessoal ${py}. ` +
    `Master numbers preservados em todos os passos.`
  );
}

function composeUnified(
  house: HouseSeed,
  astrologia: string,
  lilith: string,
  numerologia: string,
  bonus: ReadonlyArray<{ tradition: SacredTradition; seed: string }>,
  gaps: readonly string[],
): string {
  const ciganaLesson = house.ciganoSurface.split('—')[1]?.trim() ?? house.ciganoSurface;
  const astroLesson = astrologia.replace(/^Casa \d+.*?: /, '');
  const lilithLesson = lilith.split('—')[1]?.trim() ?? lilith;
  const numLesson = numerologia.replace(/^Numerologia Cabalística para .+?: /, '');
  const bonusTxt = bonus.length
    ? ' Puxando ainda ' + bonus.map((b) => `${b.tradition} (${b.seed})`).join('; ') + '.'
    : '';
  const gapTxt = gaps.length
    ? ` Leitura parcial: faltam ${gaps.join(', ')}.`
    : '';
  return (
    `A Casa ${house.number} da Mesa Real (${house.ciganoCard}) abre o tema ${house.topic} com a lição cigana: ${ciganaLesson} ` +
    `A camada astrológica aprofunda: ${astroLesson} ` +
    `Lilith soma sombra: ${lilithLesson} ` +
    `A numerologia ancora: ${numLesson}` +
    bonusTxt +
    gapTxt
  );
}

function detectGaps(input: CrossHouseInput): string[] {
  const gaps: string[] = [];
  const chart = input.westernNatalChart;
  if (Object.keys(chart).length === 0) gaps.push('mapa astral ocidental');
  if (!input.lilith.aspects || input.lilith.aspects.length === 0) {
    gaps.push('aspectos de Lilith');
  }
  if (!input.akashicContext || input.akashicContext.previousSessions.length === 0) {
    gaps.push('sessões akáshicas prévias');
  }
  return gaps;
}

function confidenceFromGaps(gaps: readonly string[]): 'low' | 'medium' | 'high' {
  if (gaps.length === 0) return 'high';
  if (gaps.length <= 1) return 'medium';
  return 'low';
}

export function hashCacheKey(input: CrossHouseInput): string {
  const strip = {
    mesaRealHouseNumber: input.mesaRealHouseNumber,
    topic: input.topic,
    westernNatalChart: input.westernNatalChart,
    lilith: input.lilith,
    numerologyAspects: input.numerologyAspects,
    akashicContext: input.akashicContext ?? null,
  };
  const canonical = canonicalJson(strip);
  return 'w75a:' + sha256HexSync(canonical).slice(0, 32);
}

export function crossHouseInterpret(input: CrossHouseInput): CrossHouseOutput {
  const houseKey = mrh(input.mesaRealHouseNumber);
  const house = HOUSES_BY_NUMBER.get(houseKey);
  if (!house) {
    throw new Error(`Mesa Real house ${input.mesaRealHouseNumber} not found in slice A`);
  }

  const topicMismatch = house.topic !== input.topic;
  const effectiveTopic = topicMismatch ? house.topic : input.topic;

  const astrologia = renderAstrologiaCasa(house.astrologiaCasa, input.westernNatalChart);
  const lilith = renderLilith(input.lilith, effectiveTopic);
  const numerologia = renderNumerologia(input.numerologyAspects, effectiveTopic);
  const gaps = detectGaps(input);
  if (topicMismatch) {
    gaps.unshift(
      `topic solicitado (${input.topic}) ≠ topic da casa (${house.topic}); usando o da casa`,
    );
  }
  const bonus = house.bonus;
  const unified = composeUnified(house, astrologia, lilith, numerologia, bonus, gaps);

  const traditionsUsed: SacredTradition[] = [
    'Cigano',
    'Astrologia',
    'Numerologia Cabalística',
  ];
  for (const b of bonus) {
    if (!traditionsUsed.includes(b.tradition)) traditionsUsed.push(b.tradition);
  }

  const confidence = confidenceFromGaps(gaps);

  const output: CrossHouseOutput = Object.freeze({
    mesaRealHouseNumber: house.number,
    topic: effectiveTopic,
    surface: house.ciganoSurface,
    depthAstrologia: astrologia,
    depthLilith: lilith,
    depthNumerologia: numerologia,
    bonusWeaves: Object.freeze(
      bonus.map((b) => Object.freeze({ tradition: b.tradition, line: b.seed })),
    ),
    unifiedReading: unified,
    confidence,
    dataGaps: Object.freeze(gaps),
    traditionsUsed: Object.freeze(traditionsUsed),
    meta: Object.freeze({
      cacheKey: hashCacheKey(input),
      generatedAt: new Date(0).toISOString(),
      brand: 'W75-A' as const,
    }),
  });

  AUDIT_LOG.push(output);
  return output;
}

// ════════════════════════════════════════════════════════════════════════════
// PUBLIC API — exportAudit
// ════════════════════════════════════════════════════════════════════════════

export function exportAudit(): ReadonlyArray<CrossHouseOutput> {
  return Object.freeze(AUDIT_LOG.slice());
}

export function _resetAuditForTests(): void {
  AUDIT_LOG.length = 0;
}

// ════════════════════════════════════════════════════════════════════════════
// VERSION
// ════════════════════════════════════════════════════════════════════════════

export const W75_A_VERSION = '1.0.0' as const;
export const W75_A_CYCLE = 75 as const;
export const W75_A_HOUSES_SHIPPED = 12 as const;
export const W75_A_TRADITIONS_WOVEN = 7 as const;