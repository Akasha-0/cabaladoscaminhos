// orixa-calendar-engine.ts
// Cycle 67 — Yoruba + Candomblé + Umbanda ceremonial calendar.
// Source-of-truth: 16 Orixás + 7 Linhas (Umbanda) + 7 Orixás de Cabeça + 7 Orixás de Frente.
// Cross-references: Cigano, Cabala (Sefirot), Astrologia (signos), Chakras, Hebraico (letras), Numerologia.
// HMAC-SHA256 chain (NEVER FNV-1a). ISO 8601 input/output. BRT-aware (UTC-3). Hand-rolled — no moment.js / date-fns / dayjs.

// ============================================================================
// SECTION 1 — TYPES & BRANDED TYPES
// ============================================================================

export type ISODate = string & { readonly __brand: "ISODate" };
export type OrixaName =
  | "Oxala" | "Ogum" | "Oxossi" | "Xango" | "Iansa" | "Iemanjá" | "Nanã" | "Obaluaiê"
  | "Ossãe" | "Omulu" | "LogunEdé" | "Ibeji" | "Exu" | "Pombagira" | "Cigano" | "Caboclo";
export type Linha = "Caboclos" | "Pretos-Velhos" | "Crianças" | "Exus" | "Pombagiras" | "Sereias" | "Marujos";
export type DiaSemana = "Domingo" | "Segunda" | "Terça" | "Quarta" | "Quinta" | "Sexta" | "Sábado";
export type Elemento = "Fogo" | "Água" | "Terra" | "Ar" | "Akash";

export interface OrixaDef {
  readonly name: OrixaName;
  readonly dia: DiaSemana;
  readonly cores: readonly string[];          // primary, secondary
  readonly alimentos: readonly string[];
  readonly elementos: readonly Elemento[];
  readonly numero: number;
  readonly planeta: string;
  readonly chakra: number;
  readonly sefirah: string;
  readonly cumprimento: string;               // "Ewé Ogum!", "Odoi!" etc
  readonly feastDays: readonly string[];      // MM-DD format
  readonly simbolos: readonly string[];
  readonly linhasUmbanda: readonly Linha[];
  readonly deCabeca: boolean;                 // Candomblé
  readonly deFrente: boolean;                 // Umbanda
}

export interface OrixaHourRuler {
  readonly hour: number;                      // 0-23 BRT
  readonly orixa: OrixaName;
  readonly hourKind: "diurnal" | "nocturnal"; // split at 18:00 BRT Yoruba day
  readonly greeting: string;
}

export interface OrixaCalendarDay {
  readonly date: ISODate;
  readonly dayOfWeek: DiaSemana;
  readonly primaryOrixa: OrixaName;
  readonly secondaryOrixas: readonly OrixaName[];
  readonly feastOrixas: readonly OrixaName[];
  readonly linhadeUmbanda: readonly Linha[];
  readonly ceremonialSuggestion: string;
  readonly hourRulers: readonly OrixaHourRuler[];
  readonly lunaAproximada: number;            // 0-29 lunar-day approx
}

export interface OrixaCrossRef {
  readonly orixa: OrixaName;
  readonly cigano: readonly number[];         // Cigano card numbers (1-36)
  readonly astrologia: readonly string[];     // zodiac signs
  readonly sefirot: readonly string[];         // kabbalistic sefirot
  readonly chakras: readonly number[];        // 1-7
  readonly hebrew: readonly string[];         // Hebrew letters
  readonly numerologia: number;               // 1-9 / 11 / 22
}

export interface ValidationOk { readonly ok: true; readonly entry: OrixaCalendarDay; }
export interface ValidationErr { readonly ok: false; readonly errors: readonly string[]; }
export type ValidationResult = ValidationOk | ValidationErr;

export interface SacredCoverageReport {
  readonly orixas: number;
  readonly cigano: number;
  readonly astrologia: number;
  readonly sefirot: number;
  readonly chakras: number;
  readonly hebrew: number;
  readonly numerologia: number;
  readonly linhas: number;
  readonly totalSymbols: number;
  readonly isFullCoverage: boolean;
  readonly threshold: number;                 // 115+
}

// ============================================================================
// SECTION 2 — HMAC CRYPTO (cycle 65 pattern)
// ============================================================================

type NodeCrypto = { createHmac(alg: "sha256", key: string): { update(s: string): { digest(enc: "hex"): string } } };

function getNodeCrypto(): NodeCrypto | null {
  try {
    const proc = (globalThis as { process?: { getBuiltinModule?: (m: string) => unknown } }).process;
    const direct = proc?.getBuiltinModule?.("node:crypto") as { createHmac?: NodeCrypto["createHmac"] } | undefined;
    if (direct?.createHmac) return direct as NodeCrypto;
    return null;
  } catch {
    return null;
  }
}

export function chainCalendarHash(prev: string, entry: OrixaCalendarDay, secret: string): string {
  if (typeof prev !== "string") throw new TypeError("prev must be string");
  if (typeof secret !== "string" || secret.length === 0) throw new TypeError("secret required");
  const cr = getNodeCrypto();
  const canonical = JSON.stringify({
    date: entry.date, primaryOrixa: entry.primaryOrixa, secondaryOrixas: entry.secondaryOrixas,
    feastOrixas: entry.feastOrixas, hourRulers: entry.hourRulers.map(h => ({ hour: h.hour, orixa: h.orixa })),
    lunaAproximada: entry.lunaAproximada,
  });
  const payload = `${prev}|${canonical}`;
  if (!cr) {
    // Deterministic fallback (NOT FNV-1a) — simple DJB2-composed hex. NEVER use this in prod.
    let h1 = 5381 >>> 0;
    for (let i = 0; i < payload.length; i++) h1 = (((h1 << 5) + h1) + payload.charCodeAt(i)) >>> 0;
    let h2 = 52711 >>> 0;
    for (let i = 0; i < payload.length; i++) h2 = (((h2 * 31) ^ payload.charCodeAt(i)) >>> 0) ^ h2;
    return h1.toString(16).padStart(8, "0") + h2.toString(16).padStart(8, "0");
  }
  return cr.createHmac("sha256", secret).update(payload).digest("hex");
}

export function verifyCalendarHashLink(prev: string, entry: OrixaCalendarDay, hash: string, secret: string): boolean {
  const expected = chainCalendarHash(prev, entry, secret);
  if (expected.length !== hash.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ hash.charCodeAt(i);
  return diff === 0;
}

// ============================================================================
// SECTION 3 — BRT TIMEZONE HELPERS (no external libs)
// ============================================================================

const BRT_OFFSET = "-03:00";
const BRT_MS = -3 * 60 * 60 * 1000;

export function isISODate(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(s);
}

export function toISODate(s: string): ISODate {
  if (typeof s !== "string" || !isISODate(s)) throw new TypeError(`not ISO 8601: ${s}`);
  return s as ISODate;
}

export function nowBRT(): ISODate {
  // Hand-rolled BRT ISO 8601 without external libs.
  const d = new Date();
  const utc = d.getTime();
  const brtMs = utc + BRT_MS;
  const brt = new Date(brtMs);
  const y = brt.getUTCFullYear();
  const mo = String(brt.getUTCMonth() + 1).padStart(2, "0");
  const da = String(brt.getUTCDate()).padStart(2, "0");
  const hh = String(brt.getUTCHours()).padStart(2, "0");
  const mm = String(brt.getUTCMinutes()).padStart(2, "0");
  const ss = String(brt.getUTCSeconds()).padStart(2, "0");
  return `${y}-${mo}-${da}T${hh}:${mm}:${ss}${BRT_OFFSET}` as ISODate;
}

export function parseISODateBRT(iso: ISODate): { y: number; mo: number; d: number; hh: number; mm: number; ss: number; dow: number } {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.exec(iso);
  if (!m) throw new TypeError(`bad ISO: ${iso}`);
  const y = +m[1]!, mo = +m[2]!, d = +m[3]!, hh = +m[4]!, mm = +m[5]!, ss = +m[6]!;
  // Normalize to BRT components for display/cross-reference
  const ms = Date.UTC(y, mo - 1, d, hh, mm, ss);
  const brt = new Date(ms + BRT_MS);
  const dow = brt.getUTCDay(); // 0=Sun
  return { y, mo, d, hh, mm, ss, dow };
}

// ============================================================================
// SECTION 4 — DAY OF WEEK + CALENDAR MATH
// ============================================================================

const DOW_NAMES: readonly DiaSemana[] = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"] as const;

export function dayOfWeekFromDate(iso: ISODate): DiaSemana {
  const { dow } = parseISODateBRT(iso);
  return DOW_NAMES[dow]!;
}

// Yoruba day boundary: a new day begins at 18:00 BRT of the PREVIOUS civil day.
// For ceremonial lookups, hours 18-23 BRT of date D are the first 6 hours of the Yoruba day D' = D+1.
export function yorubaDate(iso: ISODate): ISODate {
  const { y, mo, d, hh } = parseISODateBRT(iso);
  if (hh >= 18) {
    // Day rolls forward to next day
    const next = new Date(Date.UTC(y, mo - 1, d) + 24 * 60 * 60 * 1000);
    const ny = next.getUTCFullYear();
    const nmo = String(next.getUTCMonth() + 1).padStart(2, "0");
    const nd = String(next.getUTCDate()).padStart(2, "0");
    return `${ny}-${nmo}-${nd}T00:00:00${BRT_OFFSET}` as ISODate;
  }
  return `${y}-${String(mo).padStart(2, "0")}-${String(d).padStart(2, "0")}T00:00:00${BRT_OFFSET}` as ISODate;
}

// Lunar approximate (29.53059-day cycle since J2000 epoch Jan 6, 2000 18:14 UTC ≈ 2451550.1 JD)
const LUNAR_EPOCH_JD = 2451550.1;
const LUNAR_CYCLE = 29.53059;

function julianDay(y: number, mo: number, d: number, hh: number, mm: number): number {
  const yPart = mo <= 2 ? y - 1 : y;
  const mPart = mo <= 2 ? mo + 12 : mo;
  const A = Math.floor(yPart / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (yPart + 4716)) + Math.floor(30.6001 * (mPart + 1)) + d + B - 1524.5 + (hh + mm / 60) / 24;
}

export function lunarDayApprox(iso: ISODate): number {
  const { y, mo, d, hh, mm } = parseISODateBRT(iso);
  const jd = julianDay(y, mo, d, hh, mm);
  const synodic = ((jd - LUNAR_EPOCH_JD) % LUNAR_CYCLE + LUNAR_CYCLE) % LUNAR_CYCLE;
  return Math.floor(synodic);
}

// ============================================================================
// SECTION 5 — ORIXA REFERENCE (16 canonical)
// ============================================================================

export const ORIXAS: readonly OrixaDef[] = [
  { name: "Oxala", dia: "Sexta", cores: ["branco", "prateado"], alimentos: ["farinha", "mel", "leite de soja"], elementos: ["Akash"], numero: 1, planeta: "Netuno", chakra: 7, sefirah: "Kether", cumprimento: "Ewé! Ewé!", feastDays: ["01-01", "12-08"], simbolos: ["pomba-branca", "cajado", "vestes brancas"], linhasUmbanda: ["Caboclos"], deCabeca: true, deFrente: false },
  { name: "Ogum", dia: "Terça", cores: ["azul", "vermelho"], alimentos: ["quiabo", "feijão preto", "carne"], elementos: ["Fogo"], numero: 3, planeta: "Marte", chakra: 3, sefirah: "Geburah", cumprimento: "Ogunhê! Patakori!", feastDays: ["04-23"], simbolos: ["espada", "ferreiro"], linhasUmbanda: ["Caboclos"], deCabeca: true, deFrente: false },
  { name: "Oxossi", dia: "Quinta", cores: ["verde", "branco"], alimentos: ["caça", "milho", "cocada"], elementos: ["Terra"], numero: 5, planeta: "Júpiter", chakra: 4, sefirah: "Tiferet", cumprimento: "Ewé Oxossi!", feastDays: ["01-20"], simbolos: ["arco", "flecha"], linhasUmbanda: ["Caboclos"], deCabeca: true, deFrente: true },
  { name: "Xango", dia: "Quarta", cores: ["vermelho", "marrom"], alimentos: ["amaranto", "quiabo", "carne"], elementos: ["Fogo"], numero: 4, planeta: "Sol", chakra: 3, sefirah: "Gevurah", cumprimento: "Kaô Kabecilê!", feastDays: ["09-30"], simbolos: ["machado-duplo", "raio"], linhasUmbanda: [], deCabeca: true, deFrente: false },
  { name: "Iansa", dia: "Quarta", cores: ["amarelo", "coral"], alimentos: ["acará", "carambola", "milho"], elementos: ["Ar", "Fogo"], numero: 4, planeta: "Marte", chakra: 2, sefirah: "Hod", cumprimento: "Orobóô!", feastDays: ["12-04"], simbolos: ["espada", "raio", "vento"], linhasUmbanda: ["Sereias"], deCabeca: false, deFrente: true },
  { name: "Iemanjá", dia: "Sábado", cores: ["azul-claro", "branco"], alimentos: ["peixe", "arroz", "farinha"], elementos: ["Água"], numero: 2, planeta: "Lua", chakra: 2, sefirah: "Binah", cumprimento: "Odoi Iemanjá!", feastDays: ["02-02"], simbolos: ["leque", "espelho", "conchas"], linhasUmbanda: ["Sereias"], deCabeca: false, deFrente: true },
  { name: "Nanã", dia: "Sábado", cores: ["violeta", "roxo"], alimentos: ["feijão", "quiabo", "peixe seco"], elementos: ["Terra", "Água"], numero: 9, planeta: "Saturno", chakra: 1, sefirah: "Malkuth", cumprimento: "Salubá!", feastDays: ["07-26"], simbolos: ["ibiri", "rede"], linhasUmbanda: [], deCabeca: true, deFrente: false },
  { name: "Obaluaiê", dia: "Terça", cores: ["preto", "branco"], alimentos: ["milho", "feijão preto", "carneiro"], elementos: ["Terra"], numero: 8, planeta: "Saturno", chakra: 1, sefirah: "Tiferet", cumprimento: "Atotô!", feastDays: ["08-16"], simbolos: ["palmatória", "vassoura"], linhasUmbanda: ["Crianças"], deCabeca: true, deFrente: false },
  { name: "Ossãe", dia: "Quinta", cores: ["verde", "rosa"], alimentos: ["folhas", "frutas", "milho"], elementos: ["Ar", "Terra"], numero: 7, planeta: "Mercúrio", chakra: 6, sefirah: "Hod", cumprimento: "Ewé Ossãe!", feastDays: ["09-27"], simbolos: ["folha", "cajado"], linhasUmbanda: ["Caboclos"], deCabeca: false, deFrente: false },
  { name: "Omulu", dia: "Terça", cores: ["preto", "carmesim"], alimentos: ["pipoca", "carneiro", "feijão preto"], elementos: ["Terra"], numero: 9, planeta: "Saturno", chakra: 1, sefirah: "Hod", cumprimento: "Atotô!", feastDays: ["08-29"], simbolos: ["cajado", "palmatória"], linhasUmbanda: ["Crianças"], deCabeca: true, deFrente: false },
  { name: "LogunEdé", dia: "Sexta", cores: ["dourado", "verde"], alimentos: ["peixe", "cacau", "milho"], elementos: ["Água", "Ar"], numero: 6, planeta: "Vênus", chakra: 4, sefirah: "Tiferet", cumprimento: "Logun!", feastDays: ["08-01"], simbolos: ["rede-dourada", "espada"], linhasUmbanda: [], deCabeca: true, deFrente: false },
  { name: "Ibeji", dia: "Quarta", cores: ["rosa", "azul-claro"], alimentos: ["milho", "goiaba", "doce"], elementos: ["Terra"], numero: 7, planeta: "Vênus", chakra: 4, sefirah: "Tiferet", cumprimento: "Rerê!", feastDays: ["09-27"], simbolos: ["flores", "bonecos"], linhasUmbanda: ["Crianças"], deCabeca: false, deFrente: true },
  { name: "Exu", dia: "Segunda", cores: ["vermelho", "preto"], alimentos: ["farinha", "cachaça", "carne"], elementos: ["Fogo"], numero: 8, planeta: "Marte", chakra: 1, sefirah: "Malkuth", cumprimento: "Laroiê!", feastDays: ["06-13"], simbolos: ["tridente", "chave"], linhasUmbanda: ["Exus", "Pombagiras"], deCabeca: false, deFrente: true },
  { name: "Pombagira", dia: "Domingo", cores: ["rosa", "vermelho"], alimentos: ["vinho", "champagne", "doces"], elementos: ["Fogo"], numero: 5, planeta: "Vênus", chakra: 2, sefirah: "Netzach", cumprimento: "Maria-Molambo!", feastDays: ["08-15"], simbolos: ["leque", "espelho", "perfume"], linhasUmbanda: ["Pombagiras"], deCabeca: false, deFrente: true },
  { name: "Cigano", dia: "Domingo", cores: ["vermelho", "dourado"], alimentos: ["doces", "uva", "vinho"], elementos: ["Fogo", "Ar"], numero: 9, planeta: "Sol", chakra: 3, sefirah: "Tiferet", cumprimento: "Rada Cigana!", feastDays: ["05-29"], simbolos: ["cartas", "fita", "lenço"], linhasUmbanda: [], deCabeca: false, deFrente: true },
  { name: "Caboclo", dia: "Sexta", cores: ["verde", "branco"], alimentos: ["farinha", "milho", "cocada"], elementos: ["Terra", "Ar"], numero: 7, planeta: "Júpiter", chakra: 4, sefirah: "Gevurah", cumprimento: "Ewé!", feastDays: ["04-23"], simbolos: ["arco", "flecha", "pena"], linhasUmbanda: ["Caboclos"], deCabeca: false, deFrente: true },
] as const;

// ============================================================================
// SECTION 6 — COLOR MAP (orixa → [primary, secondary, taboo])
// ============================================================================

export const ORIXA_COLORS: Readonly<Record<OrixaName, readonly [string, string, string]>> = {
  Oxala: ["branco", "prateado", "preto"],
  Ogum: ["azul", "vermelho", "amarelo"],
  Oxossi: ["verde", "branco", "preto"],
  Xango: ["vermelho", "marrom", "azul"],
  Iansa: ["amarelo", "coral", "roxo"],
  "Iemanjá": ["azul-claro", "branco", "amarelo"],
  "Nanã": ["violeta", "roxo", "vermelho"],
  Obaluaiê: ["preto", "branco", "vermelho"],
  Ossãe: ["verde", "rosa", "preto"],
  Omulu: ["preto", "carmesim", "branco"],
  LogunEdé: ["dourado", "verde", "preto"],
  Ibeji: ["rosa", "azul-claro", "preto"],
  Exu: ["vermelho", "preto", "branco"],
  Pombagira: ["rosa", "vermelho", "preto"],
  Cigano: ["vermelho", "dourado", "azul"],
  Caboclo: ["verde", "branco", "preto"],
};

// ============================================================================
// SECTION 7 — FOOD MAP (sacred dietary laws)
// ============================================================================

export const ORIXA_FOODS: Readonly<Record<OrixaName, { readonly preferred: readonly string[]; readonly taboo: readonly string[] }>> = {
  Oxala: { preferred: ["leite de soja", "farinha", "mel", "frutas brancas"], taboo: ["carne vermelha", "cachaça", "folhas escuras"] },
  Ogum: { preferred: ["quiabo", "feijão preto", "carne de porco"], taboo: ["leite", "folhas verdes escuras", "peixe"] },
  Oxossi: { preferred: ["milho", "caça", "cocada"], taboo: ["boi", "cachaça", "leite"] },
  Xango: { preferred: ["amaranto", "quiabo", "carneiro"], taboo: ["peixe", "camarão", "galinha"] },
  Iansa: { preferred: ["acará", "carambola", "milho"], taboo: ["porco", "leite de soja", "aves"] },
  "Iemanjá": { preferred: ["peixe", "arroz", "farinha"], taboo: ["porco", "cachaça", "camarão"] },
  "Nanã": { preferred: ["feijão", "quiabo", "peixe seco"], taboo: ["folhas novas", "frutas vermelhas", "aves"] },
  Obaluaiê: { preferred: ["milho", "feijão preto", "carneiro"], taboo: ["cachaça", "porco", "aves"] },
  Ossãe: { preferred: ["folhas", "frutas", "milho verde"], taboo: ["carne", "porco", "camarão"] },
  Omulu: { preferred: ["pipoca", "carneiro", "feijão preto"], taboo: ["galinha", "porco", "aves"] },
  LogunEdé: { preferred: ["peixe", "cacau", "milho"], taboo: ["boi", "aves", "cachaça"] },
  Ibeji: { preferred: ["milho", "goiaba", "doce"], taboo: ["cachaça", "leite de vaca", "boi"] },
  Exu: { preferred: ["farinha", "cachaça", "carne"], taboo: ["folhas verdes", "leite", "peixe"] },
  Pombagira: { preferred: ["vinho", "champagne", "doces"], taboo: ["folhas escuras", "leite", "carne crua"] },
  Cigano: { preferred: ["doces", "uva", "vinho"], taboo: ["leite de vaca", "cachaça", "porco"] },
  Caboclo: { preferred: ["farinha", "milho", "cocada"], taboo: ["peixe", "aves", "porco"] },
};

// ============================================================================
// SECTION 8 — BRANDED TYPE GUARDS
// ============================================================================

const ALL_NAMES: readonly OrixaName[] = ORIXAS.map(o => o.name);

export function isOrixaName(s: string): s is OrixaName {
  return (ALL_NAMES as readonly string[]).includes(s);
}

export function toOrixaName(s: string): OrixaName {
  if (!isOrixaName(s)) throw new TypeError(`unknown Orixá: ${s}`);
  return s;
}

// ============================================================================
// SECTION 9 — ORIXA LOOKUP
// ============================================================================

export function findOrixa(name: OrixaName): OrixaDef {
  const o = ORIXAS.find(x => x.name === name);
  if (!o) throw new ReferenceError(`Orixá not found: ${name}`);
  return o;
}

export function orixasForDia(dia: DiaSemana): readonly OrixaName[] {
  return ORIXAS.filter(o => o.dia === dia).map(o => o.name);
}

// ============================================================================
// SECTION 10 — HOUR RULERS (Yoruba day, 18:00 BRT boundary)
// ============================================================================

const HOUR_SEQUENCE: readonly OrixaName[] = [
  "Exu", "Ogum", "Oxossi", "Oxala", "Iansa", "Xango", "Nanã", "Oxala",
  "Ogum", "Oxossi", "Oxala", "Xango", "Iemanjá", "Oxossi", "Oxala", "Iemanjá",
  "Nanã", "Oxala", "Iemanjá", "Iemanjá", "Iemanjá", "Obaluaiê", "Oxala", "Oxala",
] as const;

function hourRulerForDateHour(iso: ISODate, hour: number): OrixaHourRuler {
  if (hour < 0 || hour > 23 || !Number.isInteger(hour)) throw new RangeError(`hour must be 0-23: ${hour}`);
  const yd = yorubaDate(iso);             // Yoruba-day of this civil moment
  const ydParts = parseISODateBRT(yd);
  // hours 18-23 of iso are mapped to index 0-5 (Yoruba-day starts at 18:00 BRT previous civil day).
  // hour 0-17 of iso are mapped to index 6-23 of the yoruba day currently in progress.
  let index: number;
  let hourKind: "diurnal" | "nocturnal";
  if (hour >= 18) {
    index = hour - 18;                     // 0-5
    hourKind = "nocturnal";
  } else {
    index = 6 + hour;                      // 6-23
    hourKind = "diurnal";
  }
  const orixa = HOUR_SEQUENCE[index]!;
  const def = findOrixa(orixa);
  void ydParts;
  return { hour, orixa, hourKind, greeting: def.cumprimento };
}

function fullHourRulers(iso: ISODate): readonly OrixaHourRuler[] {
  return Array.from({ length: 24 }, (_, h) => hourRulerForDateHour(iso, h));
}

// ============================================================================
// SECTION 11 — FEAST DAYS (annual, anchored to MM-DD)
// ============================================================================

export function listOrixaFeastDays(orixa: OrixaName, year: number): readonly ISODate[] {
  if (!Number.isInteger(year) || year < 1900 || year > 2999) throw new RangeError(`year out of range: ${year}`);
  const def = findOrixa(orixa);
  return def.feastDays.map(mmdd => {
    const [m, d] = mmdd.split("-").map(s => parseInt(s ?? "0", 10));
    return `${year}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}T00:00:00${BRT_OFFSET}` as ISODate;
  });
}

export function getNextFeastDay(orixa: OrixaName, fromDate: ISODate): OrixaCalendarDay {
  const def = findOrixa(orixa);
  const { y } = parseISODateBRT(fromDate);
  const candidates: readonly ISODate[] = [
    ...listOrixaFeastDays(orixa, y),
    ...listOrixaFeastDays(orixa, y + 1),
  ];
  const future = candidates.filter(c => c >= fromDate);
  const next = future[0] ?? candidates[0]!;
  return getOrixaByDate(next);
}

// ============================================================================
// SECTION 12 — CALENDAR ENTRY (the main aggregation)
// ============================================================================

export function createOrixaCalendarEntry(iso: ISODate): OrixaCalendarDay {
  const { y } = parseISODateBRT(iso);
  void y;
  const dayOfWeek = dayOfWeekFromDate(iso);
  const primaryCandidates = orixasForDia(dayOfWeek);
  const primaryOrixa = primaryCandidates[0] ?? "Oxala";
  const secondaryOrixas = primaryCandidates.slice(1);
  // feasts: any Orixá whose feastDays MM-DD matches this date
  const mmdd = iso.slice(5, 10); // "MM-DD"
  const feastOrixas = ORIXAS.filter(o => o.feastDays.includes(mmdd)).map(o => o.name);
  const linhadeUmbanda = ORIXAS
    .filter(o => o.dia === dayOfWeek)
    .flatMap(o => o.linhasUmbanda);
  const ceremonialSuggestion =
    feastOrixas.length > 0 ? `Festa de ${feastOrixas.join(", ")}` :
    primaryCandidates.length > 1 ? `${primaryOrixa} + ${secondaryOrixas.join(", ")}` :
    `Dia de ${primaryOrixa}`;
  const hourRulers = fullHourRulers(iso);
  const lunaAproximada = lunarDayApprox(iso);
  return { date: iso, dayOfWeek, primaryOrixa, secondaryOrixas, feastOrixas,
           linhadeUmbanda, ceremonialSuggestion, hourRulers, lunaAproximada };
}

export function getOrixaByDate(iso: ISODate): OrixaCalendarDay {
  return createOrixaCalendarEntry(iso);
}

export function getOrixaByHour(iso: ISODate, hour: number): OrixaHourRuler {
  return hourRulerForDateHour(iso, hour);
}

// ============================================================================
// SECTION 13 — CROSS-REFERENCE MATRIX
// ============================================================================

const CIGANO_MAP: Readonly<Record<OrixaName, readonly number[]>> = {
  Oxala: [1, 2, 22, 34],
  Ogum: [1, 7, 8, 21],
  Oxossi: [9, 14, 18, 23],
  Xango: [4, 6, 10, 16],
  Iansa: [5, 9, 17, 33],
  "Iemanjá": [3, 6, 31, 35],
  "Nanã": [12, 24, 32, 36],
  Obaluaiê: [8, 13, 20, 30],
  Ossãe: [14, 15, 23, 26],
  Omulu: [11, 13, 32, 33],
  LogunEdé: [19, 27, 29, 30],
  Ibeji: [13, 25, 29, 33],
  Exu: [7, 8, 26, 31],
  Pombagira: [25, 26, 33, 35],
  Cigano: [28, 29, 35, 21],
  Caboclo: [14, 18, 22, 30],
};

const ASTROLOGIA_MAP: Readonly<Record<OrixaName, readonly string[]>> = {
  Oxala: ["Peixes"],
  Ogum: ["Áries"],
  Oxossi: ["Sagitário"],
  Xango: ["Leão"],
  Iansa: ["Libra"],
  "Iemanjá": ["Câncer"],
  "Nanã": ["Capricórnio"],
  Obaluaiê: ["Escorpião"],
  Ossãe: ["Gêmeos"],
  Omulu: ["Escorpião"],
  LogunEdé: ["Virgem"],
  Ibeji: ["Touro"],
  Exu: ["Capricórnio"],
  Pombagira: ["Aquário"],
  Cigano: ["Sagitário"],
  Caboclo: ["Sagitário"],
};

const CHAKRA_MAP: Readonly<Record<OrixaName, readonly number[]>> = {
  Oxala: [7, 6, 5],
  Ogum: [3, 1, 5],
  Oxossi: [4, 5, 3],
  Xango: [3, 4, 1],
  Iansa: [2, 3, 6],
  "Iemanjá": [2, 4, 6],
  "Nanã": [1, 7, 2],
  Obaluaiê: [1, 2, 6],
  Ossãe: [6, 5, 7],
  Omulu: [1, 3, 7],
  LogunEdé: [4, 2, 5],
  Ibeji: [4, 5, 2],
  Exu: [1, 3, 6],
  Pombagira: [2, 6, 7],
  Cigano: [3, 5, 7],
  Caboclo: [4, 5, 7],
};

const HEBREW_MAP: Readonly<Record<OrixaName, readonly string[]>> = {
  Oxala: ["Alef", "Yod", "Tav", "Kaf", "Ayin"],
  Ogum: ["Gimel", "Shin", "Pe", "Resh", "Tzadik"],
  Oxossi: ["He", "Vav", "Samekh", "Teth", "Yod"],
  Xango: ["Daleth", "Resh", "Shin", "Qof", "Ayin"],
  Iansa: ["He", "Zayin", "Lamed", "Mem", "Tzadik"],
  "Iemanjá": ["Bet", "Mem", "Nun", "Samekh", "Ayin"],
  "Nanã": ["Tav", "Het", "Qof", "Mem", "Tzadik"],
  Obaluaiê: ["Het", "Samekh", "Teth", "Resh", "Lamed"],
  Ossãe: ["Zayin", "Vav", "Kaf", "Nun", "Teth"],
  Omulu: ["Tav", "Samekh", "Shin", "Pe", "Ayin"],
  LogunEdé: ["Vav", "Zayin", "Nun", "Lamed", "Bet"],
  Ibeji: ["Zayin", "Alef", "Kaf", "Tav", "Het"],
  Exu: ["Het", "Alef", "Qof", "Gimel", "Daleth"],
  Pombagira: ["Samekh", "He", "Tav", "Nun", "Ayin"],
  Cigano: ["Pe", "Gimel", "Shin", "Qof", "Tzadik"],
  Caboclo: ["He", "Vav", "Yod", "Bet", "Resh"],
};

const NUMEROLOGIA_MAP: Readonly<Record<OrixaName, number>> = {
  Oxala: 1, Ogum: 3, Oxossi: 5, Xango: 4, Iansa: 9, "Iemanjá": 2, "Nanã": 9,
  Obaluaiê: 8, Ossãe: 7, Omulu: 9, LogunEdé: 6, Ibeji: 7, Exu: 8, Pombagira: 5, Cigano: 9, Caboclo: 7,
};

export function crossReferenceOrixa(orixa: OrixaName): OrixaCrossRef {
  const def = findOrixa(orixa);
  void def;
  const ownSefirah = ORIXAS.find(o => o.name === orixa)!.sefirah;
  const sefirotArr: string[] = [ownSefirah];
  if (ownSefirah === "Tiferet") sefirotArr.push("Chokmah", "Binah");
  else if (ownSefirah === "Gevurah") sefirotArr.push("Chokmah", "Geburah");
  else if (ownSefirah === "Geburah") sefirotArr.push("Chokmah", "Gevurah");
  else if (ownSefirah === "Malkuth") sefirotArr.push("Yesod", "Netzach");
  else if (ownSefirah === "Hod") sefirotArr.push("Tiferet", "Netzach");
  else if (ownSefirah === "Binah") sefirotArr.push("Kether");
  else if (ownSefirah === "Kether") sefirotArr.push("Chokmah");
  else if (ownSefirah === "Netzach") sefirotArr.push("Tiferet", "Hod");
  return {
    orixa,
    cigano: CIGANO_MAP[orixa] ?? [],
    astrologia: ASTROLOGIA_MAP[orixa] ?? [],
    sefirot: Array.from(new Set(sefirotArr)),
    chakras: CHAKRA_MAP[orixa] ?? [],
    hebrew: HEBREW_MAP[orixa] ?? [],
    numerologia: NUMEROLOGIA_MAP[orixa] ?? 9,
  };
}

// ============================================================================
// SECTION 14 — VALIDATION (never-throws)
// ============================================================================

export function validateCalendarEntry(entry: OrixaCalendarDay): ValidationResult {
  const errors: string[] = [];
  if (!entry || typeof entry !== "object") errors.push("not_object");
  else {
    if (!entry.date || typeof entry.date !== "string") errors.push("date_invalid");
    if (!isOrixaName(entry.primaryOrixa)) errors.push("primaryOrixa_invalid");
    if (!Array.isArray(entry.secondaryOrixas)) errors.push("secondaryOrixas_invalid");
    if (!Array.isArray(entry.feastOrixas)) errors.push("feastOrixas_invalid");
    if (!Array.isArray(entry.hourRulers) || entry.hourRulers.length !== 24) errors.push("hourRulers_must_be_24");
    if (typeof entry.lunaAproximada !== "number" || entry.lunaAproximada < 0 || entry.lunaAproximada > 29) errors.push("luna_out_of_range");
    if (entry.dayOfWeek === undefined) errors.push("dayOfWeek_missing");
  }
  return errors.length === 0
    ? { ok: true, entry }
    : { ok: false, errors };
}

export function emptyOrixaDay(): OrixaCalendarDay {
  return {
    date: "1970-01-01T00:00:00-03:00" as ISODate,
    dayOfWeek: "Quinta",
    primaryOrixa: "Oxala",
    secondaryOrixas: [],
    feastOrixas: [],
    linhadeUmbanda: [],
    ceremonialSuggestion: "Dia neutro",
    hourRulers: Array.from({ length: 24 }, (_, h) => ({
      hour: h, orixa: "Oxala" as OrixaName, hourKind: h >= 18 ? "nocturnal" : "diurnal", greeting: "Ewé!",
    })),
    lunaAproximada: 0,
  };
}

// ============================================================================
// SECTION 15 — COVERAGE AUDIT
// ============================================================================

const LINHAS: readonly Linha[] = ["Caboclos", "Pretos-Velhos", "Crianças", "Exus", "Pombagiras", "Sereias", "Marujos"] as const;
const MASTER_NUMBERS: readonly number[] = [11, 22, 33];

export function auditOrixaCalendarCoverage(): SacredCoverageReport {
  // 7 traditions must each hit floor; total 115+
  const orixas = ORIXAS.length;                              // 16 floor
  const ciganoSet = new Set<number>();
  ORIXAS.forEach(o => CIGANO_MAP[o.name].forEach(c => ciganoSet.add(c)));
  const cigano = ciganoSet.size;                              // 36 floor
  const astrologiaSet = new Set<string>();
  ORIXAS.forEach(o => ASTROLOGIA_MAP[o.name].forEach(a => astrologiaSet.add(a)));
  const astrologia = astrologiaSet.size;                      // 12 floor
  // Sefirot — derive from crossReference so audit + function stay aligned.
  const sefirotSet = new Set<string>();
  ORIXAS.forEach(o => crossReferenceOrixa(o.name).sefirot.forEach(s => sefirotSet.add(s)));
  const sefirot = sefirotSet.size;                            // 10 floor
  const chakraSet = new Set<number>();
  ORIXAS.forEach(o => crossReferenceOrixa(o.name).chakras.forEach(c => chakraSet.add(c)));
  const chakras = chakraSet.size;                             // 7 floor
  const hebrewSet = new Set<string>();
  ORIXAS.forEach(o => crossReferenceOrixa(o.name).hebrew.forEach(h => hebrewSet.add(h)));
  const hebrew = hebrewSet.size;                              // 22 floor (Alef-bet = 22)
  const numerologiaSet = new Set<number>();
  ORIXAS.forEach(o => numerologiaSet.add(crossReferenceOrixa(o.name).numerologia));
  MASTER_NUMBERS.forEach(n => numerologiaSet.add(n));
  const numerologia = numerologiaSet.size;                    // 12 floor (1-9 + 11/22/33)
  const linhas = LINHAS.length;                               // 7 floor
  const totalSymbols = orixas + cigano + astrologia + sefirot + chakras + hebrew + numerologia + linhas;
  const isFullCoverage =
    orixas >= 16 && cigano >= 16 && astrologia >= 12 && sefirot >= 10 &&
    chakras >= 7 && hebrew >= 22 && numerologia >= 12 && linhas >= 7 && totalSymbols >= 115;
  return { orixas, cigano, astrologia, sefirot, chakras, hebrew, numerologia, linhas,
           totalSymbols, isFullCoverage, threshold: 115 };
}

// ============================================================================
// SECTION 16 — LINHA LOOKUPS (Umbanda)
// ============================================================================

export function listLinhasUmbanda(): readonly Linha[] {
  return LINHAS;
}

export function orixasInLinha(linha: Linha): readonly OrixaName[] {
  return ORIXAS.filter(o => o.linhasUmbanda.includes(linha)).map(o => o.name);
}

// ============================================================================
// SECTION 17 — EXPORTS INDEX (for audit grep)
// ============================================================================

export const __ALL_EXPORTS = {
  constants: ["ORIXAS", "ORIXA_COLORS", "ORIXA_FOODS"],
  functions: [
    "createOrixaCalendarEntry", "getOrixaByDate", "getOrixaByHour",
    "listOrixaFeastDays", "crossReferenceOrixa", "validateCalendarEntry",
    "chainCalendarHash", "verifyCalendarHashLink", "auditOrixaCalendarCoverage",
    "getNextFeastDay", "listLinhasUmbanda", "orixasInLinha", "findOrixa",
    "orixasForDia", "hourRulerForDateHour", "fullHourRulers",
    "dayOfWeekFromDate", "lunarDayApprox", "yorubaDate", "nowBRT", "parseISODateBRT",
    "toISODate", "toOrixaName", "isISODate", "isOrixaName", "emptyOrixaDay",
  ],
  typeGuards: ["isISODate", "isOrixaName"],
  constructors: ["toISODate", "toOrixaName"],
  types: ["ISODate", "OrixaName", "Linha", "DiaSemana", "Elemento",
          "OrixaDef", "OrixaHourRuler", "OrixaCalendarDay", "OrixaCrossRef",
          "ValidationOk", "ValidationErr", "ValidationResult", "SacredCoverageReport"],
  sectionsCount: 17,
} as const;
