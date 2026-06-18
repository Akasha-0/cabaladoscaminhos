/**
 * synthesis-engine/derive-akasha-type.ts
 *
 * F-227: Deriva o tipo Akasha único (1 de 9) por votação ponderada
 * dos 5 pilares — Odu (×3), I Ching (×2), Kabala LP (×2), Astro (×1) —
 * com refinamento tântrico posterior.
 *
 * ROADMAP Iter. 6 — Prioridade 2: expandir deriveAkashaType() de
 * Odu+Tantra → voto nos 5 pilares.
 */
import type { SynthesizedProfile } from '@akasha/core';
import type { AstrologyMap, KabalisticMap, TantricMap, OduBirth } from '@akasha/types';
import type { AkashicHologram } from '@/lib/domain/mapa/hologram-aggregator';
import AKASHA_TYPES from './akasha-types-catalog';
import type { AkashaAuthority, AkashaTypeProfile, FrequencyLevel } from './synthesis-types';

/** Um dos 9 tipos Akasha. */
export type AkashaType =
  | 'catalisador'
  | 'receptor'
  | 'construtor'
  | 'transformador'
  | 'guardiao'
  | 'curador'
  | 'canal'
  | 'alquimista'
  | 'arquiteto';

// ─── Mapping tables ─────────────────────────────────────────────────────────

/** Odu primary → AkashaType. Weight ×3 na votação. */
const ODU_TO_TYPE: Record<string, AkashaType> = {
  oje: 'catalisador',
  ogbe: 'catalisador',
  oros: 'catalisador',
  ox: 'receptor',
  oxu: 'receptor',
  alavaye: 'receptor',
  oyeku: 'construtor',
  otura: 'construtor',
  ogunda: 'transformador',
  owonrin: 'transformador',
  okanran: 'guardiao',
  logbara: 'guardiao',
  irosun: 'curador',
  oji: 'canal',
  ate: 'canal',
  ica: 'alquimista',
  idia: 'alquimista',
};

/**
 * Nuclear trigram (Wilhelm/Baynes) → AkashaType.
 * Computed from hexagram number via lower trigram (inner nature):
 *   lowerTrigram = ((hex - 1) % 8) + 1
 * Weight ×2 na votação.
 *
 * Trigram map (Wilhelm 1976):
 *   1=Heaven(☰)→catalisador, 2=Earth(☷)→receptor,
 *   3=Thunder(☳)→construtor, 4=Water(☵)→transformador,
 *   5=Mountain(☶)→guardiao, 6=Fire(☲)→canal,
 *   7=Lake(☱)→receptor, 8=Wind(☴)→canal.
 */
const TRIGRAM_TO_TYPE: Record<number, AkashaType> = {
  1: 'catalisador', // ☰ Heaven
  2: 'receptor', // ☷ Earth
  3: 'construtor', // ☳ Thunder
  4: 'transformador', // ☵ Water
  5: 'guardiao', // ☶ Mountain
  6: 'canal', // ☲ Fire
  7: 'receptor', // ☱ Lake
  8: 'canal', // ☴ Wind
};

function ichingNuclearTrigram(hex: number): number {
  return ((hex - 1) % 8) + 1;
}

/**
 * Kabala Life Path → AkashaType. Weight ×2 na votação.
 * Groups by digit with explicit master-number overrides.
 *
 * LP 1→catalisador, 2→receptor, 3→canal, 4→guardiao,
 * 5→transformador, 6→curador, 7→canal, 8→catalisador, 9→receptor.
 * Master numbers: 11→canal, 22→construtor, 33→alquimista.
 */
const KABALA_LP_TO_TYPE: Record<number, AkashaType> = {
  // ── LP 1 ── catalisador
  1: 'catalisador',
  10: 'catalisador',
  19: 'catalisador',
  28: 'catalisador',
  37: 'catalisador',
  // ── LP 2 ── receptor
  2: 'receptor',
  20: 'receptor',
  29: 'receptor',
  38: 'receptor',
  // ── LP 3 ── canal
  3: 'canal',
  12: 'canal',
  21: 'canal',
  30: 'canal',
  39: 'canal',
  48: 'canal',
  57: 'canal',
  // ── LP 4 ── guardiao
  4: 'guardiao',
  13: 'guardiao',
  31: 'guardiao',
  40: 'guardiao',
  49: 'guardiao',
  58: 'guardiao',
  67: 'guardiao',
  // ── LP 5 ── transformador
  5: 'transformador',
  14: 'transformador',
  23: 'transformador',
  32: 'transformador',
  41: 'transformador',
  50: 'transformador',
  59: 'transformador',
  // ── LP 6 ── curador
  6: 'curador',
  15: 'curador',
  24: 'curador',
  42: 'curador',
  51: 'curador',
  60: 'curador',
  // ── LP 7 ── canal
  7: 'canal',
  16: 'canal',
  25: 'canal',
  61: 'canal',
  70: 'canal',
  // ── LP 8 ── catalisador
  8: 'catalisador',
  17: 'catalisador',
  26: 'catalisador',
  // ── LP 9 ── receptor
  9: 'receptor',
  18: 'receptor',
  27: 'receptor',
  36: 'receptor',
  45: 'receptor',
  // ── Master number 11 ── canal
  11: 'canal',
  // ── LP 22 ── construtor
  22: 'construtor',
  // ── LP 33 ── alquimista
  33: 'alquimista',
  // ── Extended LP range 44-99
  44: 'canal',
  46: 'guardiao',
  47: 'transformador',
  53: 'guardiao',
  54: 'construtor',
  55: 'transformador',
  56: 'guardiao',
  62: 'guardiao',
  63: 'canal',
  64: 'receptor',
  65: 'canal',
  66: 'guardiao',
  68: 'guardiao',
  69: 'curador',
  71: 'canal',
  72: 'receptor',
  73: 'curador',
  74: 'transformador',
  75: 'canal',
  76: 'guardiao',
  77: 'alquimista',
  78: 'receptor',
  79: 'canal',
  80: 'guardiao',
  81: 'catalisador',
  82: 'receptor',
  83: 'canal',
  84: 'guardiao',
  85: 'canal',
  86: 'transformador',
  87: 'curador',
  88: 'guardiao',
  89: 'catalisador',
  90: 'receptor',
  91: 'canal',
  92: 'guardiao',
  93: 'curador',
  94: 'transformador',
  95: 'catalisador',
  96: 'receptor',
  97: 'canal',
  98: 'guardiao',
  99: 'curador',
};

/**
 * Planeta dominante Astro → AkashaType. Weight ×1 na votação.
 */
const ASTRO_DOMINANT_PLANET_TO_TYPE: Record<string, AkashaType> = {
  sol: 'catalisador',
  sun: 'catalisador',
  lua: 'receptor',
  moon: 'receptor',
  mercurio: 'canal',
  mercury: 'canal',
  venus: 'receptor',
  marte: 'construtor',
  mars: 'construtor',
  jupiter: 'transformador',
  júpiter: 'transformador',
  saturno: 'guardiao',
  saturn: 'guardiao',
  urano: 'canal',
  uranus: 'canal',
  netuno: 'canal',
  neptune: 'canal',
  plutão: 'transformador',
  plutao: 'transformador',
  pluto: 'transformador',
};

// ─── Authority & directive tables ────────────────────────────────────────────

const AUTHORITY_PRACTICE: Record<AkashaAuthority, string> = {
  emotional:
    'Diário: pause antes de decisões importantes e pergunte — como meu peito se sente com isso?',
  sacral:
    'Diário: antes de agir, sinta resposta do seu corpo abaixo do umbigo — sim, não ou talvez.',
  splenic: 'Diário: preste atenção insights súbitos. Não duvide do seu "click" quando ele vier.',
  mental:
    'Diário: questione urgência do pensamento. Pergunte — isto é verdade ou só ruído familiar?',
};

const DIRECTIVE_BY_AREA_AND_FREQ: Record<string, Record<FrequencyLevel, string>> = {
  vitalidade: {
    shadow: 'Hoje: respeite o cansaço. Não confunda parar com fraqueza.',
    gift: 'Hoje: use sua energia para começar algo que você vem adiando.',
    siddhi: 'Hoje: sua vitalidade é referência. Compartilhe movimento, não opinião.',
  },
  conexoes: {
    shadow: 'Hoje: não busque validação. Sua presença já é suficiente.',
    gift: 'Hoje: diga algo verdadeiro a alguém que importa. Sem pressa.',
    siddhi: 'Hoje: ame sem se perder. Quem você é não precisa do outro para ser completo.',
  },
  carreira: {
    shadow: 'Hoje: não force resultados. Faça uma coisa pequena que avance o que importa.',
    gift: 'Hoje: tome uma decisão profissional que você vem adiando. O timing é agora.',
    siddhi: 'Hoje: ajude um colega avançar. Sua abundância se expande ao compartilhar.',
  },
  propósito: {
    shadow:
      'Hoje: preste atenção no que sua intuição sussurra. Não descarte o insight por ser pequeno.',
    gift: 'Hoje: siga um insight, mesmo que pareça irracional. Sua mente sabe mais que você.',
    siddhi: 'Hoje: compartilhe o que descobriu consigo mesmo. Clareza se consolida ao ser dita.',
  },
  missão: {
    shadow: 'Hoje: pergunte si mesmo — estou vivendo minha própria vida ou expectativa de outros?',
    gift: 'Hoje: tome uma ação que honre quem você realmente é. Pequenos passos são válidos.',
    siddhi: 'Hoje: inspire outros pelo que você é, não pelo que você faz. Ser é suficiente.',
  },
  transformação: {
    shadow:
      'Hoje: nomeie o padrão que você está vendo em você mesmo. Sair do invisível é o primeiro passo.',
    gift: 'Hoje: transforme uma tensão antiga em algo criativo. O que te incomodou pode virar arte.',
    siddhi:
      'Hoje: ajude alguém ver seu próprio padrão. Ensinar é forma mais alta de transformação.',
  },
};

const ONE_LINER_BY_TYPE: Record<string, string> = {
  catalisador:
    'Você é O Catalisador. Sua presença inicia o que antes era apenas possibilidade — você não espera o momento, você É o momento. Onde outros hesitam, você já acendeu o fogo. Sua lição é não queimar o que ainda precisa de calma.',
  receptor:
    'Você é O Receptor. Antes de qualquer movimento, você já sabe. Sua percepção lê o invisível — o que ninguém disse, o que ninguém quer ouvir. Sua lição é confiar na própria frequência sem buscar provas.',
  construtor:
    'Você é O Construtor. Outros têm ideias; você tem alicerces. Sua energia não é glamourosa — é paciente como água escavando pedra. Cada tijolo que você coloca hoje sustenta um edifício que ninguém mais consegue visualizar ainda. Não apresse o trabalho. Consistência é sua magia.',
  transformador:
    'Você é O Transformador. Você não evita o fogo — você é o fogo. Agregar, separar, reorganizar, atravessar — seu Odu é energia que não aceita que nada permaneça como estava. Outros confiam em você para romper o que precisa ser rompido. Sua presença não permite zoneamento falso.',
  guardiao:
    'Você é O Guardião. Outros entram no território desprotegido; você é fronteira que torna o espaço seguro para outros existirem. Sua energia não inicia, não alarga — ela sustenta e protege. Você é o que impede que sistemas vivam em caos. Outros esquecem de agradecer — mas sentem sua falta quando você se ausenta.',
  curador:
    'Você é O Curador. Sua energia encontra ferida da mente — você sabe onde dói antes da pessoa falar. Você é um espaço emocional seguro onde outros se permittedem ser vulneráveis. Sua presença não julga, não apressa, não conserta — só presencia. Essa qualidade de presença é o que permite que outros se curem por conta própria.',
  canal:
    'Você é O Canal. Sua energia é a ponte entre o visível e o invisível. Você ouve a frequência que outros não captam e traduz em palavras, imagens, gestos. Sua voz é instrumento — afine antes de tocar. Falar é tão sagrado quanto escutar.',
  alquimista:
    'Você é O Alquimista. Sua matéria-prima é a dificuldade — onde outros veem problema, você vê ingrediente. Você transforma resistência em ouro pelo simples ato de não fugir. O que te queima é o que te purifica.',
  arquiteto:
    'Você é O Arquiteto. Outros improvisam estruturas; você projeta sistemas. Você vê interconexão entre campos que parecem separados — carreira toca o corpo, o corpo toca o espírito, o espírito toca o dinheiro. Sua mente é geométrica: cada decisão reflete um padrão. Outros veem 2 + 2; você vê o sistema que contém toda matemática.',
};

// ─── Resolvers (one per pillar) ────────────────────────────────────────────

/** Odu primary → type (weight 3). Returns 'arquiteto' when no valid Odu name. */
function resolveTypeFromOdu(odu: OduBirth | null): AkashaType {
  const name = odu?.oduName?.toLowerCase().trim() ?? '';
  if (!name) return 'arquiteto';
  return ODU_TO_TYPE[name] ?? 'arquiteto';
}

/**
 * I Ching hexagram (1-64) → type (weight 2) via nuclear trigram.
 * Uses the lower trigram (inner nature) per Wilhelm/Baynes semantics.
 * Returns null when no hexagram data is available.
 */
function resolveTypeFromIChing(ichingHex: number | null | undefined): AkashaType | null {
  if (!ichingHex || ichingHex < 1 || ichingHex > 64) return null;
  const trig = ichingNuclearTrigram(ichingHex);
  return TRIGRAM_TO_TYPE[trig] ?? 'arquiteto';
}

/** Kabala Life Path → type (weight 2). Returns null when LP unavailable. */
function resolveTypeFromKabalaLP(kab: KabalisticMap | null): AkashaType | null {
  const lp = kab?.lifePath;
  if (!lp) return null;
  return KABALA_LP_TO_TYPE[lp] ?? 'arquiteto';
}

/**
 * Astro dominant planet → type (weight 1).
 * Uses `unknown` as intermediate cast to satisfy ts-no-any.
 */
function resolveTypeFromAstro(astro: AstrologyMap | null): AkashaType | null {
  if (!astro) return null;
  const dominated = (astro as unknown as { dominantPlanet?: string }).dominantPlanet;
  if (!dominated) return null;
  const key = dominated.toLowerCase().trim();
  return ASTRO_DOMINANT_PLANET_TO_TYPE[key] ?? null;
}

/** Tantra dominant body number → authority + directive refinement. */
function pickDominantBody(tantra: TantricMap | null): number | undefined {
  if (!tantra?.bodies) return undefined;
  const bodies = tantra.bodies as Record<string, { number?: number }>;
  const entries: Array<{ key: string; number: number }> = [
    { key: 'fisico', number: bodies.fisico?.number ?? 0 },
    { key: 'pranic', number: bodies.pranic?.number ?? 0 },
    { key: 'emocional', number: bodies.emocional?.number ?? 0 },
    { key: 'mental', number: bodies.mental?.number ?? 0 },
    { key: 'espiritual', number: bodies.espiritual?.number ?? 0 },
  ];
  entries.sort((a, b) => b.number - a.number);
  return entries[0]?.number;
}

function deriveAuthorityFromMaps(
  tantra: TantricMap | null,
  astro: AstrologyMap | null
): AkashaAuthority {
  const dominantBody = pickDominantBody(tantra);
  if (dominantBody !== undefined && dominantBody > 0) {
    if (dominantBody >= 7) return 'mental';
    if (dominantBody >= 4) return 'emotional';
    return 'sacral';
  }
  // astro can be null when pillars are not yet calculated (new user, missing birth data).
  // Guard before accessing dominantPlanet to prevent TypeError.
  if (!astro) return 'sacral';
  const dominated: string | undefined = (astro as unknown as { dominantPlanet?: string })
    .dominantPlanet;
  if (dominated) {
    const lower = dominated.toLowerCase();
    if (['lua', 'moon', 'sol', 'sun', 'venus', 'vênus'].includes(lower)) return 'emotional';
    if (['mercury', 'mercurio'].includes(lower)) return 'mental';
  }
  return 'sacral';
}

function refineCorePattern(basePattern: string, dominantBody?: number): string {
  if (dominantBody === undefined || dominantBody < 7) return basePattern;
  return basePattern.replace(
    '.',
    '. Seus corpos superiores amplificam essa energia — você pensa antes de agir, mas o pensamento já é movimento.'
  );
}

function pickDailyDirectiveLabel(dominantBody?: number): string {
  if (dominantBody === undefined) return 'propósito';
  if (dominantBody <= 3) return 'vitalidade';
  if (dominantBody <= 5) return 'conexões';
  if (dominantBody <= 7) return 'carreira';
  return 'missão';
}

function pickDailyDirectiveFrequency(dominantBody?: number): FrequencyLevel {
  return dominantBody !== undefined && dominantBody >= 7 ? 'siddhi' : 'gift';
}

// ─── Core voting engine ─────────────────────────────────────────────────────

interface VoteAccumEntry {
  votes: number;
  precedence: number;
}

interface PillarVote {
  type: AkashaType;
  weight: number;
  hasData: boolean;
  pillar: 'odu' | 'iching' | 'kabala' | 'astro'; // which pillar this vote came from
}

function buildVoteMap(
  oduType: AkashaType,
  ichingType: AkashaType | null,
  kabType: AkashaType | null,
  astroType: AkashaType | null,
  oduHasData: boolean,
  ichingHasData: boolean,
  kabHasData: boolean,
  astroHasData: boolean
): AkashaType {
  // Pillar precedence for tie-breaking: Odu > IChing > Kabala > Astro
  const PRECEDENCE: Record<PillarVote['pillar'], number> = {
    odu: 4,
    iching: 3,
    kabala: 2,
    astro: 1,
  };

  const pillars: PillarVote[] = [
    { type: oduType, weight: oduHasData ? 3 : 0, hasData: oduHasData, pillar: 'odu' },
    {
      type: ichingType ?? 'arquiteto',
      weight: ichingHasData ? 2 : 0,
      hasData: ichingHasData,
      pillar: 'iching',
    },
    {
      type: kabType ?? 'arquiteto',
      weight: kabHasData ? 2 : 0,
      hasData: kabHasData,
      pillar: 'kabala',
    },
    {
      type: astroType ?? 'arquiteto',
      weight: astroHasData ? 1 : 0,
      hasData: astroHasData,
      pillar: 'astro',
    },
  ];

  // Accumulate votes per type: { type: { votes, maxPillarPrecedence } }
  const acc: Record<string, VoteAccumEntry> = {};
  for (const p of pillars) {
    if (!acc[p.type]) acc[p.type] = { votes: 0, precedence: 0 };
    acc[p.type].votes += p.weight;
    if (p.hasData) {
      const prec = PRECEDENCE[p.pillar];
      if (prec > acc[p.type].precedence) acc[p.type].precedence = prec;
    }
  }

  let winner: AkashaType = 'arquiteto';
  let maxVotes = -1;
  let maxPrecedence = -1;
  for (const [t, data] of Object.entries(acc)) {
    if (data.votes > maxVotes || (data.votes === maxVotes && data.precedence > maxPrecedence)) {
      maxVotes = data.votes;
      maxPrecedence = data.precedence;
      winner = t as AkashaType;
    }
  }
  return winner;
}

/**
 * Post-voting refinement using Tantra dominant body.
 * Adjusts the voted type when strong Tantric signal suggests a different direction.
 */
function refineWithTantra(votedType: AkashaType, dominantBody: number | undefined): AkashaType {
  if (dominantBody === undefined) return votedType;

  // Body ≤ 3: person needs more structure → nudge toward Construtor/Guardiao
  if (dominantBody <= 3 && votedType === 'canal') return 'construtor';

  // Body ≥ 7: person has high spiritual development → nudge toward Curador/Alquimista
  if (dominantBody >= 7 && votedType === 'construtor') return 'curador';

  return votedType;
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Deriva o ONE Akasha Profile (1 de 9 tipos) por votação ponderada dos 5 pilares.
 *
 * Voting weights:
 *   Odu      ×3  — destino
 *   I Ching  ×2  — síntese oracular (via nuclear trigram Wilhelm/Baynes)
 *   Kabala   ×2  — identidade (via Life Path)
 *   Astro    ×1  — temperamento (via planeta dominante)
 *   Tantra  —   — refinamento pós-voto (não entra na contagem)
 */
export function deriveAkashaType(
  astro: AstrologyMap | null,
  kab: KabalisticMap | null,
  tantra: TantricMap | null,
  odu: OduBirth | null,
  holo: AkashicHologram,
  synthesizedProfile?: SynthesizedProfile
): AkashaTypeProfile {
  // Resolve each pillar's type contribution
  const oduType = resolveTypeFromOdu(odu);
  const ichingType = resolveTypeFromIChing(holo.ichingHex ?? null);
  const kabType = resolveTypeFromKabalaLP(kab);
  const astroType = resolveTypeFromAstro(astro);

  // Which pillars have real data (vs. fallback)?
  const oduHasData = !!odu?.oduName?.trim();
  const ichingHasData = holo.ichingHex !== undefined && holo.ichingHex !== null;
  const kabHasData = !!kab?.lifePath;
  const astroDom = (astro as unknown as { dominantPlanet?: string })?.dominantPlanet;
  const astroHasData = !!astroDom;

  // Build weighted vote and refine with Tantra
  const voted = buildVoteMap(
    oduType,
    ichingType,
    kabType,
    astroType,
    oduHasData,
    ichingHasData,
    kabHasData,
    astroHasData
  );
  const dominantBody = pickDominantBody(tantra);
  const finalType = refineWithTantra(voted, dominantBody);

  const baseType = AKASHA_TYPES[finalType];
  const corePattern = refineCorePattern(baseType.corePattern, dominantBody);
  const authority = deriveAuthorityFromMaps(tantra, astro);

  // ── Type Confidence from convergence ─────────────────────────────────────
  let typeConfidence: AkashaTypeProfile['typeConfidence'] = null;
  if (synthesizedProfile) {
    const dominantPrimitives = synthesizedProfile.primitivos.filter((p) => p.dominante).slice(0, 3);
    if (dominantPrimitives.length > 0) {
      const avgConvergence =
        dominantPrimitives.reduce((sum, p) => sum + p.convergencia, 0) / dominantPrimitives.length;
      if (avgConvergence >= 0.6) typeConfidence = 'alta';
      else if (avgConvergence >= 0.3) typeConfidence = 'media';
      else typeConfidence = 'baixa';
    }
  }

  // ── Enrich corePattern with tension ─────────────────────────────────────────
  let enrichedCorePattern = corePattern;
  if (
    synthesizedProfile?.tensaoPrincipal &&
    synthesizedProfile.tensaoPrincipal.primitivoA !== synthesizedProfile.tensaoPrincipal.primitivoB
  ) {
    const t = synthesizedProfile.tensaoPrincipal;
    enrichedCorePattern =
      corePattern +
      ' A tensão central do seu campo é entre ' +
      t.primitivoA +
      ' e ' +
      t.primitivoB +
      ': ' +
      t.descricao +
      '.';
  }

  const directiveLabel = pickDailyDirectiveLabel(dominantBody);
  const directiveFreq = pickDailyDirectiveFrequency(dominantBody);
  const dailyDirective =
    DIRECTIVE_BY_AREA_AND_FREQ[directiveLabel]?.[directiveFreq] ??
    DIRECTIVE_BY_AREA_AND_FREQ['propósito']['gift'];

  const oneLiner = ONE_LINER_BY_TYPE[finalType] ?? ONE_LINER_BY_TYPE['arquiteto'];

  return {
    type: baseType.type,
    typeName: baseType.typeName,
    typeIcon: baseType.typeIcon,
    corePattern: enrichedCorePattern,
    strategy: baseType.strategy,
    strategyDetail: baseType.strategyDetail,
    authority,
    authorityPractice: AUTHORITY_PRACTICE[authority],
    dailyDirective,
    oneLiner,
    dimensionOrigin: baseType.dimensionOrigin ?? null,
    growthEdge: baseType.growthEdge,
    shadowTrap: baseType.shadowTrap,
    typeConfidence,
  };
}
