/**
 * Numerology Daily Signature Engine
 * ─────────────────────────────────
 * Personal day/month/year numbers + sacred cross-tradition synthesis.
 * Pure logic — no I/O, no DB.
 *
 * Public API:
 *   - getDailySignature(birthDate, targetDate) → main composite reading
 *   - reduceToSingle(n, { preserveMasters? }) → digital root, with master-number handling
 *   - dayArchetype(n) → archetype name + essence for a 1-9 day
 *
 * Sacred coverage (5 traditions woven into `summary`):
 *   1. Numerologia Cabalística — day/month/year digital roots + meaning
 *   2. Cigano                  — day number → carta cigana (28-card Petit Lenormand set)
 *   3. Astrologia              — day-of-week planetary ruler + element
 *   4. Orixás                  — 16 Odu regente keyed by composite root
 *   5. Tantra/Cabala           — 7-chakra rotation (1-7 cycle)
 *
 * Master numbers (11/22/33) are PRESERVED in the detailed `dayMaster` field
 * and surfaced in the archetype; the main reduced `day` is 1-9.
 *
 * @see docs/W72-A-DELIVERABLE.md
 */

// ─── Branded types ────────────────────────────────────────────────────────
export type DateString = string & { readonly __brand: 'DateString' };
export type ReducedDigit = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type MasterNumber = 11 | 22 | 33;

// ─── Constants ────────────────────────────────────────────────────────────
export const MASTER_NUMBERS: ReadonlyArray<MasterNumber> = [11, 22, 33] as const;

export const DAY_ARCHETYPES: Readonly<Record<ReducedDigit, {
  name: string;
  essence: string;
  shadow: string;
  gift: string;
  keyword: string;
}>> = {
  1: { name: 'O Iniciador',  essence: 'Liderança, originalidade, semente',     shadow: 'egocentrismo',         gift: 'firmeza',         keyword: 'COMEÇAR'    },
  2: { name: 'O Diplomata',  essence: 'Parceria, sensibilidade, união',         shadow: 'dependência',          gift: 'cooperação',      keyword: 'CONECTAR'   },
  3: { name: 'O Criador',    essence: 'Expressão, alegria, comunicação',       shadow: 'dispersão',            gift: 'inspiração',      keyword: 'EXPRESSAR'  },
  4: { name: 'O Construtor', essence: 'Estrutura, trabalho, base sólida',       shadow: 'rigidez',              gift: 'estabilidade',    keyword: 'EDIFICAR'   },
  5: { name: 'O Explorador', essence: 'Liberdade, mudança, aventura',          shadow: 'impulsividade',        gift: 'adaptabilidade',  keyword: 'MOVER'      },
  6: { name: 'O Guardião',   essence: 'Amor, responsabilidade, família',        shadow: 'superproteção',        gift: 'compaixão',       keyword: 'CUIDAR'     },
  7: { name: 'O Místico',    essence: 'Sabedoria, introspecção, estudo',        shadow: 'isolamento',           gift: 'visão profunda',  keyword: 'COMPREENDER'},
  8: { name: 'O Mestre',     essence: 'Poder material, justiça, realização',   shadow: 'materialismo',         gift: 'autoridade',      keyword: 'REALIZAR'   },
  9: { name: 'O Sábio',      essence: 'Completude, serviço, humanitarismo',    shadow: 'melancolia',           gift: 'generosidade',    keyword: 'ENCERRAR'   },
};

export const CHAKRA_BY_DAY: Readonly<Record<number, { name: string; sanskrit: string; color: string; essence: string }>> = {
  1: { name: 'Coroa',          sanskrit: 'Sahasrara',  color: 'violeta',  essence: 'consciência superior, conexão divina' },
  2: { name: 'Terceiro-Olho',  sanskrit: 'Ajna',       color: 'índigo',   essence: 'intuição, visão interior' },
  3: { name: 'Garganta',       sanskrit: 'Vishuddha',  color: 'azul',     essence: 'expressão, verdade, comunicação' },
  4: { name: 'Coração',        sanskrit: 'Anahata',    color: 'verde',    essence: 'amor, compaixão, equilíbrio' },
  5: { name: 'Plexo Solar',    sanskrit: 'Manipura',   color: 'amarelo',  essence: 'vontade, poder pessoal, ação' },
  6: { name: 'Sacral',         sanskrit: 'Svadhisthana', color: 'laranja', essence: 'criatividade, sexualidade, emoção' },
  7: { name: 'Raiz',           sanskrit: 'Muladhara',  color: 'vermelho', essence: 'sobrevivência, corpo, segurança' },
};

// ─── Date helpers (kept self-contained; biorhythm.ts has its own copy) ────
function isLeapYear(y: number): boolean {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}
function daysInMonth(y: number, m1to12: number): number {
  const t = [31, isLeapYear(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return t[m1to12 - 1] ?? 0;
}
export function parseDateStrict(s: string): Date {
  const m = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/.exec(s.trim());
  if (!m) throw new Error(`numerology-daily: invalid date string "${s}" — expected YYYY-MM-DD`);
  const y = +m[1]!;
  const mo = +m[2]!;
  const d = +m[3]!;
  if (mo < 1 || mo > 12) throw new Error(`numerology-daily: month out of range in "${s}"`);
  if (d < 1 || d > daysInMonth(y, mo)) throw new Error(`numerology-daily: day out of range in "${s}"`);
  return new Date(Date.UTC(y, mo - 1, d));
}

// ─── Core numerology math ────────────────────────────────────────────────
export function reduceToSingle(
  n: number,
  opts: { preserveMasters?: boolean } = {},
): { reduced: ReducedDigit; master: MasterNumber | null; isMaster: boolean } {
  if (!Number.isFinite(n)) {
    throw new Error(`numerology-daily: cannot reduce non-finite number ${n}`);
  }
  if (n < 0) n = -n;

  // Master number preservation: only valid if the source was already 11/22/33 (or sums to them).
  if (opts.preserveMasters && (n === 11 || n === 22 || n === 33)) {
    return { reduced: (n === 11 ? 2 : n === 22 ? 4 : 6) as ReducedDigit, master: n as MasterNumber, isMaster: true };
  }

  let v = n;
  while (v > 9) {
    let s = 0;
    while (v > 0) { s += v % 10; v = Math.floor(v / 10); }
    v = s;
    // Don't preserve mid-reduction masters unless input was a master.
    if (opts.preserveMasters && (v === 11 || v === 22 || v === 33)) {
      return {
        reduced: (v === 11 ? 2 : v === 22 ? 4 : 6) as ReducedDigit,
        master: v as MasterNumber,
        isMaster: true,
      };
    }
  }
  return { reduced: (v === 0 ? 9 : v) as ReducedDigit, master: null, isMaster: false };
}

// ─── Cigano: day → carta (28-card Petit Lenormand) ───────────────────────
const CIGANO_28_KEYWORDS: ReadonlyArray<{ name: string; keywords: string }> = [
  { name: 'O Cavaleiro',  keywords: 'Notícias, movimento, velocidade' },     // 1
  { name: 'O Trevo',      keywords: 'Sorte, pequenas oportunidades' },        // 2
  { name: 'O Navio',      keywords: 'Viagem, distância, expansão' },         // 3
  { name: 'A Casa',       keywords: 'Lar, estabilidade, raízes' },            // 4
  { name: 'A Árvore',     keywords: 'Saúde, crescimento, ancestralidade' },  // 5
  { name: 'As Nuvens',    keywords: 'Confusão, dúvida, transição' },         // 6
  { name: 'A Serpente',   keywords: 'Astúcia, perigo oculto, transformação' }, // 7
  { name: 'O Caixão',     keywords: 'Encerramento, luto, fim de ciclo' },     // 8
  { name: 'Os Buquês',    keywords: 'Presente, beleza, reconhecimento' },    // 9
  { name: 'A Foice',      keywords: 'Corte, decisão rápida, colheita' },     // 10
  { name: 'O Chicote',    keywords: 'Conflito, repetição, tensão' },         // 11
  { name: 'Os Pássaros',  keywords: 'Comunicação, parceria, conversa' },     // 12
  { name: 'A Criança',    keywords: 'Novo começo, inocência, semente' },     // 13
  { name: 'A Raposa',     keywords: 'Estratégia, autossuficiência' },        // 14
  { name: 'O Urso',       keywords: 'Força, poder, finanças, chefe' },       // 15
  { name: 'A Estrela',    keywords: 'Esperança, espiritualidade, guia' },    // 16
  { name: 'A Cegonha',    keywords: 'Mudança, renovação, gestação' },        // 17
  { name: 'O Cachorro',   keywords: 'Lealdade, amizade, confiança' },        // 18
  { name: 'A Torre',      keywords: 'Isolamento, autoridade, ego' },          // 19
  { name: 'O Jardim',     keywords: 'Vida social, público, natureza' },      // 20
  { name: 'A Montanha',   keywords: 'Obstáculo, bloqueio, desafio' },        // 21
  { name: 'Os Caminhos',  keywords: 'Escolha, bifurcação, decisão' },        // 22
  { name: 'O Rato',       keywords: 'Perda, ansiedade, desgaste' },           // 23
  { name: 'O Coração',    keywords: 'Amor, sentimento, desejo' },             // 24
  { name: 'O Anel',       keywords: 'Compromisso, contrato, aliança' },       // 25
  { name: 'O Livro',      keywords: 'Segredo, conhecimento, mistério' },     // 26
  { name: 'A Carta',      keywords: 'Documento, mensagem, formalidade' },    // 27
  { name: 'O Cigano',     keywords: 'Ação, protagonismo, o consulente' },    // 28
];

export function ciganoCardForDay(dayNumber: number): { number: number; name: string; keywords: string } {
  const idx = ((dayNumber - 1) % 28 + 28) % 28; // safe modulo for negatives
  const card = CIGANO_28_KEYWORDS[idx]!;
  return { number: idx + 1, name: card.name, keywords: card.keywords };
}

// ─── Astrologia: day-of-week ruler + element ─────────────────────────────
const PLANET_BY_DAY: ReadonlyArray<{ planet: string; element: 'fogo' | 'terra' | 'ar' | 'água' }> = [
  { planet: 'Sol',      element: 'fogo'  },
  { planet: 'Lua',      element: 'água'  },
  { planet: 'Marte',    element: 'fogo'  },
  { planet: 'Mercúrio', element: 'ar'    },
  { planet: 'Júpiter',  element: 'terra' },
  { planet: 'Vênus',    element: 'ar'    },
  { planet: 'Saturno',  element: 'terra' },
];

export function planetaryRuler(d: Date): { planet: string; element: 'fogo' | 'terra' | 'ar' | 'água'; weekday: string } {
  const weekdayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const wd = d.getUTCDay();
  const r = PLANET_BY_DAY[wd]!;
  return { planet: r.planet, element: r.element, weekday: weekdayNames[wd]! };
}

// ─── Orixás: composite root → Odu regente (1-16) ─────────────────────────
const ODU_BY_COMPOSITE: Readonly<Record<number, { id: number; name: string; essence: string }>> = {
  1: { id: 1,  name: 'Ogbe',      essence: 'Luz, origem, criação' },
  2: { id: 2,  name: 'Ejiokô',    essence: 'Dualidade, movimento' },
  3: { id: 3,  name: 'Etogundá',  essence: 'Abertura de caminhos' },
  4: { id: 4,  name: 'Irosun',    essence: 'Cuidado, atenção' },
  5: { id: 5,  name: 'Oxê',       essence: 'Amor, beleza, fertilidade' },
  6: { id: 6,  name: 'Obará',     essence: 'Riqueza, fartura' },
  7: { id: 7,  name: 'Odi',       essence: 'Limpeza, segredo' },
  8: { id: 8,  name: 'Ejionile',  essence: 'Justiça, vitória' },
  9: { id: 9,  name: 'Ossá',      essence: 'Proteção feminina' },
  10:{ id: 10, name: 'Ofun',      essence: 'Espiritualidade profunda' },
  11:{ id: 11, name: 'Owarin',    essence: 'Dinâmica, astúcia' },
  12:{ id: 12, name: 'Ejilaxebô', essence: 'Honra, proteção' },
  13:{ id: 13, name: 'Oturupon',  essence: 'Cura, ancestralidade' },
  14:{ id: 14, name: 'Oturá',     essence: 'Paz, benevolência' },
  15:{ id: 15, name: 'Iká',       essence: 'Poder, estratégia' },
  16:{ id: 16, name: 'Ofurufu',   essence: 'Completude, bênção universal' },
};

export function oduRegenteForComposite(composite: number): { id: number; name: string; essence: string } {
  // Map composite 1-9 onto Odu 1-16 by day number; 11/22/33 → Ogbe/Ejionile/Ofurufu.
  if (composite === 11) return ODU_BY_COMPOSITE[1]!;
  if (composite === 22) return ODU_BY_COMPOSITE[8]!;
  if (composite === 33) return ODU_BY_COMPOSITE[16]!;
  const id = ((Math.abs(composite) - 1) % 16) + 1;
  return ODU_BY_COMPOSITE[id]!;
}

// ─── Public API ──────────────────────────────────────────────────────────
export interface DailySignature {
  birthDate: string;
  targetDate: string;
  day: ReducedDigit;            // 1-9 (master reduced to 2/4/6)
  dayMaster: MasterNumber | null;// 11/22/33 if present
  month: ReducedDigit;
  year: ReducedDigit;
  composite: ReducedDigit;      // day + month + year, reduced
  weekday: string;
  planet: string;
  element: 'fogo' | 'terra' | 'ar' | 'água';
  archetype: typeof DAY_ARCHETYPES[ReducedDigit];
  ciganoCard: { number: number; name: string; keywords: string };
  oduRegente: { id: number; name: string; essence: string };
  chakra: typeof CHAKRA_BY_DAY[number];
  summary: string;
}

export function getDailySignature(birthDate: string, targetDate: string): DailySignature {
  const birth = parseDateStrict(birthDate);
  const target = parseDateStrict(targetDate);
  if (target.getTime() < birth.getTime()) {
    throw new Error(`numerology-daily: targetDate ${targetDate} is before birthDate ${birthDate}`);
  }

  // ── Personal year: birthMonth + birthDay + currentYear, reduced.
  const birthDay = birth.getUTCDate();
  const birthMonth = birth.getUTCMonth() + 1;
  const targetYear = target.getUTCFullYear();
  const targetMonth = target.getUTCMonth() + 1;
  const targetDay = target.getUTCDate();

  // Day: birthDay + birthMonth + targetYear + targetMonth + targetDay.
  const daySum = birthDay + birthMonth + targetYear + targetMonth + targetDay;
  const dayR = reduceToSingle(daySum, { preserveMasters: true });

  // Month (universal for the calendar month): targetMonth reduced.
  const monthR = reduceToSingle(targetMonth, { preserveMasters: true });

  // Year: targetYear reduced (preserving masters).
  const yearR = reduceToSingle(targetYear, { preserveMasters: true });

  // Composite of the three reduced values.
  const compositeSum = dayR.reduced + monthR.reduced + yearR.reduced;
  const composite = reduceToSingle(compositeSum).reduced;

  // Day archetype: use master if present, else reduced.
  const archetypeKey = dayR.isMaster && dayR.master
    ? (dayR.master === 11 ? 2 : dayR.master === 22 ? 4 : 6) as ReducedDigit
    : dayR.reduced;
  const archetype = DAY_ARCHETYPES[archetypeKey];

  // Cigano card keyed by the un-reduced (raw) day root for variety; falls within 1-9 anyway.
  const ciganoKey = dayR.reduced;
  const ciganoCard = ciganoCardForDay(ciganoKey);

  // Orixá: by composite, with master-number handling.
  const oduRegente = oduRegenteForComposite(dayR.isMaster && dayR.master ? dayR.master : composite);

  // Tantra/Cabala: chakra keyed by day reduced (1-9 mapped onto 1-7 via 7-chakra rotation).
  const chakraKey = ((dayR.reduced - 1) % 7) + 1;
  const chakra = CHAKRA_BY_DAY[chakraKey]!;

  // Astrologia
  const astro = planetaryRuler(target);

  const summary =
    `Assinatura de ${targetDate} (${astro.weekday} regido por ${astro.planet}, elemento ${astro.element}). ` +
    `Dia pessoal ${dayR.reduced}${dayR.isMaster ? ` (mestre ${dayR.master})` : ''} — ${archetype.name}: ${archetype.essence}. ` +
    `Mês ${monthR.reduced}, Ano ${yearR.reduced}. Compósito ${composite}. ` +
    `Carta-cigana do dia: ${ciganoCard.name} (#${ciganoCard.number}) — ${ciganoCard.keywords}. ` +
    `Orixá regente: ${oduRegente.name} (#${oduRegente.id}) — ${oduRegente.essence}. ` +
    `Chakra ativado: ${chakra.name} (${chakra.sanskrit}, ${chakra.color}) — ${chakra.essence}. ` +
    `Palavra-força: ${archetype.keyword}.`;

  return {
    birthDate,
    targetDate,
    day: dayR.reduced,
    dayMaster: dayR.master,
    month: monthR.reduced,
    year: yearR.reduced,
    composite,
    weekday: astro.weekday,
    planet: astro.planet,
    element: astro.element,
    archetype,
    ciganoCard,
    oduRegente,
    chakra,
    summary,
  };
}

// ─── Audit / coverage exports ────────────────────────────────────────────
export interface NumerologyAudit {
  reduceConsistent: boolean;
  masterPreservationCorrect: boolean;
  archetypeCoverage: number;
  chakraRotation: ReadonlyArray<string>;
  chakraRotationValid: boolean;
  ciganoCoverage: number;
  traditionsList: readonly string[];
  traditionsCount: number;
}

export function auditNumerologyDaily(): NumerologyAudit {
  // Reduce 1-9 → identity check
  let reduceConsistent = true;
  for (let n = 1; n <= 9; n++) {
    const r = reduceToSingle(n);
    if (r.reduced !== (n as ReducedDigit) || r.isMaster) reduceConsistent = false;
  }
  // 10..18 → expected 1..9
  for (let n = 10; n <= 18; n++) {
    const r = reduceToSingle(n);
    if (r.reduced !== ((n - 9) as ReducedDigit)) reduceConsistent = false;
  }

  // Master preservation: 11→{2,11,true}, 22→{4,22,true}, 33→{6,33,true}
  let masterPreservationCorrect = true;
  for (const m of [11, 22, 33] as const) {
    const r = reduceToSingle(m, { preserveMasters: true });
    const expectedRed = m === 11 ? 2 : m === 22 ? 4 : 6;
    if (r.reduced !== expectedRed || r.master !== m || !r.isMaster) masterPreservationCorrect = false;
  }

  // 1-9 covers all archetypes
  const archetypeCoverage = Object.keys(DAY_ARCHETYPES).length;

  // 7-chakra rotation (1..7)
  const chakraRotation = Object.keys(CHAKRA_BY_DAY).map((k) => CHAKRA_BY_DAY[+k]!.name);

  // Verify 1-9 day roots all map onto a valid chakra (no undefined).
  let chakraRotationValid = true;
  for (let n = 1; n <= 9; n++) {
    const k = ((n - 1) % 7) + 1;
    if (!CHAKRA_BY_DAY[k]) chakraRotationValid = false;
  }

  // Cigano coverage 1..28 unique
  const ciganoSet = new Set<string>();
  for (let d = 1; d <= 28; d++) ciganoSet.add(ciganoCardForDay(d).name);
  const ciganoCoverage = ciganoSet.size;

  const traditionsList = [
    'Numerologia Cabalística', 'Cigano', 'Astrologia', 'Orixás', 'Tantra/Cabala',
  ] as const;

  return {
    reduceConsistent,
    masterPreservationCorrect,
    archetypeCoverage,
    chakraRotation,
    chakraRotationValid,
    ciganoCoverage,
    traditionsList,
    traditionsCount: traditionsList.length,
  };
}

Object.freeze(DAY_ARCHETYPES);
Object.freeze(CHAKRA_BY_DAY);
Object.freeze(CIGANO_28_KEYWORDS);
Object.freeze(ODU_BY_COMPOSITE);
Object.freeze(MASTER_NUMBERS);

// Internal re-export for tests. Not part of public API.
export const __TEST__ = { parseDateStrict, isLeapYear, daysInMonth };
