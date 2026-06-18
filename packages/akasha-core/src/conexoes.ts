// @akasha/types canonical engine-output types (not the akasha-core pillar types)
import type { KabalisticMap, TantricMap, OduBirth, AstrologyMap } from '@akasha/types';

// ─── Authority types ─────────────────────────────────────────────────────────

export type EstrategiaAkasha = 'act' | 'wait' | 'observe' | 'surrender';
export type AutoridadeAkasha = 'emocional' | 'sagrada' | 'esplénica' | 'mental';

export interface AkashaAuthorityInput {
  estrategia: EstrategiaAkasha;
  autoridade: AutoridadeAkasha;
}

export interface ConexaoMap {
  name: string;
  birthDate: string; // 'YYYY-MM-DD'
  kabalisticMap: KabalisticMap;
  astrologyMap: AstrologyMap;
  tantricMap: TantricMap;
  oduBirth: OduBirth;
  authority: AkashaAuthorityInput;
}

// ─── Output types ───────────────────────────────────────────────────────────

export type DominantConnectionType = 'romantic' | 'partnership' | 'both' | 'challenging';
export type AuthorityMatch = 'aligned' | 'complementary' | 'conflict';

export interface ConnectionDimension {
  dimension: 'Emocional' | 'Sexual' | 'Espiritual' | 'Material' | 'Mental';
  score: number; // 0-100
  description: string;
  tip: string;
}

export interface OduSyncResult {
  score: number;
  sharedOdu: boolean;
  complementaryOdu: boolean;
  description: string;
}

export interface BodySyncResult {
  score: number;
  description: string;
}

export interface NarrativeBlock {
  topic: 'romantic' | 'odu' | 'authority';
  label: string;
  text: string;
}

export interface ConexaoResult {
  romantic: number; // 0-100
  partnership: number; // 0-100
  dominantType: DominantConnectionType;
  authorityMatch: AuthorityMatch;
  dimensions: ConnectionDimension[];
  oduSync: OduSyncResult;
  bodySync: BodySyncResult;
  narrative: NarrativeBlock[];
  recommendations: string[];
}

// ─── Element mapping for astrology ───────────────────────────────────────────

const FIRE_SIGNS = ['Aries', 'Leão', 'Sagitário', 'Aries', 'Leo', 'Sagittarius'];
const WATER_SIGNS = ['Câncer', 'Escorpião', 'Peixes', 'Cancer', 'Scorpio', 'Pisces'];
const EARTH_SIGNS = ['Touro', 'Virgem', 'Capricórnio', 'Taurus', 'Virgo', 'Capricorn'];
const AIR_SIGNS = ['Gêmeos', 'Libra', 'Aquário', 'Gemini', 'Libra', 'Aquarius'];

function getElement(sign: string): 'fire' | 'water' | 'earth' | 'air' | 'unknown' {
  const lower = sign.toLowerCase();
  if (FIRE_SIGNS.some((s) => lower.includes(s.toLowerCase()))) return 'fire';
  if (WATER_SIGNS.some((s) => lower.includes(s.toLowerCase()))) return 'water';
  if (EARTH_SIGNS.some((s) => lower.includes(s.toLowerCase()))) return 'earth';
  if (AIR_SIGNS.some((s) => lower.includes(s.toLowerCase()))) return 'air';
  return 'unknown';
}

// ─── Odu complementary pairs (from Akasha tradition) ──────────────────────────
// High resonance: same odu or odu from same family
const ODU_FAMILIES: Record<string, string[]> = {
  '1': ['Ogbe', 'Eji'],
  '3': ['Ogunda', 'Eyo'],
  '4': ['Ogbe-Eyo'],
  '8': ['Eji-Ogbe'],
};

const ODU_COMPLEMENTARY: [string, string][] = [
  ['Ogbe', 'Ogunda'],
  ['Eji', 'Ogunda'],
  ['Ogbe', 'Eyo'],
  ['Eji', 'Eyo'],
  ['Ogunda', 'Eji'],
  ['Eyo', 'Eji'],
  ['Ogbe-Eyo', 'Ogunda-Eyo'],
  ['Eji-Ogbe', 'Ogunda-Eyo'],
];

// ─── Life Path complement pairs (Kabbalah) ──────────────────────────────────
const LIFE_PATH_COMPLEMENTS: [number, number][] = [
  [1, 9],
  [2, 8],
  [3, 7],
  [4, 6],
  [5, 10],
  [9, 1],
  [8, 2],
  [7, 3],
  [6, 4],
];

const LIFE_PATH_RESONANCE: [number, number][] = [
  [1, 1],
  [2, 2],
  [3, 3],
  [4, 4],
  [5, 5],
  [6, 6],
  [7, 7],
  [8, 8],
  [9, 9],
  [11, 11],
  [22, 22],
  [33, 33],
];

// ─── Authority scoring ────────────────────────────────────────────────────────

function scoreAuthority(
  a: AkashaAuthorityInput,
  b: AkashaAuthorityInput
): { score: number; match: AuthorityMatch } {
  // Same autoridade = aligned
  if (a.autoridade === b.autoridade) {
    return { score: 90, match: 'aligned' };
  }

  // Complementary pairs
  const complementary: [AutoridadeAkasha, AutoridadeAkasha][] = [
    ['emocional', 'sagrada'],
    ['sagrada', 'emocional'],
    ['esplénica', 'mental'],
    ['mental', 'esplénica'],
  ];

  const isComplementary = complementary.some(
    ([x, y]) =>
      (a.autoridade === x && b.autoridade === y) || (a.autoridade === y && b.autoridade === x)
  );

  if (isComplementary) {
    return { score: 72, match: 'complementary' };
  }

  // Conflict pairs
  const conflict: [AutoridadeAkasha, AutoridadeAkasha][] = [
    ['emocional', 'mental'],
    ['mental', 'emocional'],
  ];

  const isConflict = conflict.some(
    ([x, y]) =>
      (a.autoridade === x && b.autoridade === y) || (a.autoridade === y && b.autoridade === x)
  );

  if (isConflict) {
    return { score: 35, match: 'conflict' };
  }

  return { score: 55, match: 'complementary' };
}

// ─── Astrology helpers: extract flat fields from AstrologyMap ────────────────

/** Extracts the Moon sign from an AstrologyMap's planets array. */
function getLuaSigno(map: AstrologyMap): string {
  const lua = map.planets?.find((p) => p.planet.toLowerCase() === 'lua');
  return lua?.sign ?? '—';
}

/** Extracts the sign on the House 8 cusp from an AstrologyMap's houses array. */
function getCasaOitoSigno(map: AstrologyMap): string {
  const casa8 = map.houses?.find((h) => h.house === 8);
  return casa8?.sign ?? '';
}

/** Derives the predominant tantric body number (1-4) from a TantricMap.
 *  1 = fisico (karma dominant), 2 = emocional (soul dominant),
 *  3 = mental, 4 = espiritual. Falls back to 2 (emocional). */
function getCorpoPredominante(map: TantricMap): number {
  if (!map.karma && !map.soul) return 2;
  if (!map.karma) return 2;
  if (!map.soul) return 1;
  // Higher of karma vs soul body numbers determines predominant
  const kBody = map.karmaBody ?? map.karma;
  const sBody = map.soulBody ?? map.soul;
  return kBody >= sBody ? 1 : 2;
}

// ─── Lua scoring (emotional needs) ───────────────────────────────────────────

function scoreLua(a: AstrologyMap, b: AstrologyMap): number {
  const elemA = getElement(getLuaSigno(a));
  const elemB = getElement(getLuaSigno(b));

  if (elemA === 'unknown' || elemB === 'unknown') return 50;

  // Water + Fire = deep emotional tension but chemistry
  if ((elemA === 'water' && elemB === 'fire') || (elemA === 'fire' && elemB === 'water')) return 65;
  // Earth + Air = mental harmony
  if ((elemA === 'earth' && elemB === 'air') || (elemA === 'air' && elemB === 'earth')) return 70;
  // Same element = emotional resonance
  if (elemA === elemB) return 88;
  // Water + Earth = good nurturing
  if ((elemA === 'water' && elemB === 'earth') || (elemA === 'earth' && elemB === 'water'))
    return 72;
  // Fire + Air = intellectual/spiritual connection
  if ((elemA === 'fire' && elemB === 'air') || (elemA === 'air' && elemB === 'fire')) return 75;

  return 50;
}

// ─── Casa 8 scoring (intimacy + transformation) ──────────────────────────────

function scoreCasaOito(a: AstrologyMap, b: AstrologyMap): number {
  const sA = getCasaOitoSigno(a);
  const sB = getCasaOitoSigno(b);

  if (!sA || !sB) return 50;

  // Same sign = deep shared intimacy theme
  if (sA === sB) return 92;

  const elemA = getElement(sA);
  const elemB = getElement(sB);

  // Trine (120°): same element → deep transformation resonance
  if (elemA === elemB) return 85;

  // Square (90°): opposing elements → tension but intense
  if (
    (elemA === 'fire' && elemB === 'earth') ||
    (elemA === 'earth' && elemB === 'fire') ||
    (elemA === 'water' && elemB === 'air') ||
    (elemA === 'air' && elemB === 'water')
  ) {
    return 55;
  }

  // Sextile (60°): complementary → good transformation support
  if (
    (elemA === 'fire' && elemB === 'air') ||
    (elemA === 'air' && elemB === 'fire') ||
    (elemA === 'earth' && elemB === 'water') ||
    (elemA === 'water' && elemB === 'earth')
  ) {
    return 68;
  }

  return 60;
}

// ─── Odu scoring ─────────────────────────────────────────────────────────────

function scoreOdu(a: OduBirth, b: OduBirth): OduSyncResult {
  const oduA = a.oduName ?? '—';
  const oduB = b.oduName ?? '—';

  // Same Odu = spiritual twin recognition
  if (oduA === oduB) {
    return {
      score: 95,
      sharedOdu: true,
      complementaryOdu: false,
      description: `Ambos têm ${oduA} — ressonância espiritual profunda. Vocês compartilham a mesma essência sagrada — propósito e trajetória unificados.`,
    };
  }

  // Complementary Odu (from traditional Akasha pairs)
  const isComp = ODU_COMPLEMENTARY.some(
    ([x, y]) => (oduA === x && oduB === y) || (oduA === y && oduB === x)
  );

  if (isComp) {
    return {
      score: 80,
      sharedOdu: false,
      complementaryOdu: true,
      description: `${oduA} × ${oduB} — combinação complementar. Suas forças cobrem as fraquezas um do outro.`,
    };
  }

  // Same family
  const familyA = Object.entries(ODU_FAMILIES).find(([, odus]) => odus.includes(oduA));
  const familyB = Object.entries(ODU_FAMILIES).find(([, odus]) => odus.includes(oduB));

  if (familyA && familyB && familyA[0] === familyB[0]) {
    return {
      score: 70,
      sharedOdu: false,
      complementaryOdu: false,
      description: `${oduA} e ${oduB} vêm da mesma família — há uma conexão ancestral entre vocês.`,
    };
  }

  return {
    score: 45,
    sharedOdu: false,
    complementaryOdu: false,
    description: `${oduA} × ${oduB} — caminhos independentes. A relação pede mais trabalho de integração mútua.`,
  };
}

// ─── Tantra Body scoring ─────────────────────────────────────────────────────

function scoreTantra(a: TantricMap, b: TantricMap): BodySyncResult {
  const corpoA = getCorpoPredominante(a);
  const corpoB = getCorpoPredominante(b);

  // Same body = same energy signature
  if (corpoA === corpoB) {
    return {
      score: 75,
      description: `Ambos têm Corpo ${corpoA} — energia similar. Confortável, mas pode faltar tensão criativa.`,
    };
  }

  // Body pairs that create dynamic tension (fire-water, air-earth)
  const tensionPairs: [number, number][] = [
    [1, 4],
    [4, 1], // fogo × água
    [2, 3],
    [3, 2], // terra × ar
    [1, 2],
    [2, 1], // fogo × terra
    [3, 4],
    [4, 3], // ar × água
  ];

  const harmonyPairs: [number, number][] = [
    [1, 3],
    [3, 1], // fogo × ar
    [2, 4],
    [4, 2], // água × terra
    [1, 1],
    [2, 2], // same
    [3, 3],
    [4, 4],
  ];

  const isTension = tensionPairs.some(([x, y]) => corpoA === x && corpoB === y);
  const isHarmony = harmonyPairs.some(([x, y]) => corpoA === x && corpoB === y);

  if (isTension) {
    return {
      score: 55,
      description: `Corpo ${corpoA} × Corpo ${corpoB} — tensão criativa. Atração por diferença. Requer atenção consciente.`,
    };
  }

  if (isHarmony) {
    return {
      score: 78,
      description: `Corpo ${corpoA} × Corpo ${corpoB} — harmonia energética natural. Boa fluidez na relação.`,
    };
  }

  return {
    score: 65,
    description: `Corpo ${corpoA} × Corpo ${corpoB} — dinâmica interessante.Explorem as diferenças.`,
  };
}

// ─── Kabbalah Life Path scoring ───────────────────────────────────────────────

function scoreLifePath(a: number, b: number): number {
  // Resonant (same)
  if (LIFE_PATH_RESONANCE.some(([x, y]) => a === x && b === y)) return 82;

  // Complementary (add to 10)
  if (LIFE_PATH_COMPLEMENTS.some(([x, y]) => a === x && b === y)) return 78;

  // Master numbers
  const aMaster = a > 9 ? a : a;
  const bMaster = b > 9 ? b : b;

  if (
    (aMaster === 11 || aMaster === 22 || aMaster === 33) &&
    (bMaster === 11 || bMaster === 22 || bMaster === 33)
  ) {
    return 88; // Two master numbers together
  }

  // Same parity (odd-odd, even-even) = similar life direction
  if (a % 2 === b % 2) return 65;

  return 45;
}

// ─── Dimension scoring ────────────────────────────────────────────────────────

function scoreDimensions(
  a: ConexaoMap,
  b: ConexaoMap,
  oduSync: OduSyncResult,
  bodySync: BodySyncResult
): ConnectionDimension[] {
  const luaScore = scoreLua(a.astrologyMap, b.astrologyMap);
  const casa8Score = scoreCasaOito(a.astrologyMap, b.astrologyMap);
  const lpScore = scoreLifePath(a.kabalisticMap.lifePath ?? 0, b.kabalisticMap.lifePath ?? 0);
  const authResult = scoreAuthority(a.authority, b.authority);

  return [
    {
      dimension: 'Emocional',
      score: Math.round(luaScore * 0.5 + authResult.score * 0.3 + casa8Score * 0.2),
      description:
        getLuaSigno(a.astrologyMap) && getLuaSigno(b.astrologyMap)
          ? `Lua em ${getLuaSigno(a.astrologyMap)} encontra Lua em ${getLuaSigno(b.astrologyMap)}. ${luaScore > 75 ? 'Ressonância emocional forte.' : luaScore > 55 ? 'Conexão emocional presente mas com nuances.' : 'Necesitam traduzir necessidades emocionais um para o outro.'}`
          : 'Lua não disponível para comparação.',
      tip:
        luaScore > 75
          ? 'Confiem na conexão emocional que sentem.'
          : luaScore > 55
            ? 'Dê espaço às emoções para se expressarem antes de agir.'
            : 'Façam check-ins emocionais regulares.',
    },
    {
      dimension: 'Sexual',
      score: Math.round(casa8Score * 0.6 + bodySync.score * 0.4),
      description: bodySync.description,
      tip:
        casa8Score > 80
          ? 'A Casa 8 indica uma conexão de intimidade transformadora.'
          : casa8Score > 60
            ? 'Intimidade profunda possível com presença e presença.'
            : 'Construam confiança antes de mergulhar na intimidade.',
    },
    {
      dimension: 'Espiritual',
      score: Math.round(oduSync.score * 0.7 + lpScore * 0.3),
      description: oduSync.description,
      tip:
        oduSync.score > 80
          ? 'A conexão espiritual é o ponto forte desta relação.'
          : 'O caminho espiritual pode ser um terreno de crescimento conjunto.',
    },
    {
      dimension: 'Material',
      score: Math.round(lpScore * 0.6 + authResult.score * 0.4),
      description: `Caminho de Vida ${a.kabalisticMap.lifePath ?? '—'} × ${b.kabalisticMap.lifePath ?? '—'}. ${lpScore > 75 ? 'Abordagem similar ao mundo material.' : 'Perspectivas diferentes sobre recursos e estabilidade.'}`,
      tip:
        lpScore > 75
          ? 'Alinham-se naturalmente em questões práticas.'
          : 'Negociem expectativas materiais com clareza.',
    },
    {
      dimension: 'Mental',
      score: Math.round(
        authResult.score * 0.5 +
          lpScore * 0.3 +
          (100 - Math.abs((a.kabalisticMap.lifePath ?? 0) - (b.kabalisticMap.lifePath ?? 0)) * 5)
      ),
      description: `Estratégia ${a.authority.estrategia} × ${b.authority.estrategia}. ${authResult.match === 'aligned' ? 'Tomada de decisão em sintonia.' : authResult.match === 'complementary' ? 'Um complementa o estilo do outro.' : 'Conflito de estilo. Ajustem a comunicação.'}`,
      tip:
        authResult.match !== 'conflict'
          ? 'A comunicação flui bem quando honram as diferenças de estilo.'
          : 'Estabeleçam acordos claros sobre como tomar decisões juntos.',
    },
  ];
}

// ─── Narrative generation ─────────────────────────────────────────────────────
function buildNarrative(
  a: ConexaoMap,
  b: ConexaoMap,
  result: Partial<ConexaoResult>
): NarrativeBlock[] {
  const oduA = a.oduBirth.oduName ?? '—';
  const oduB = b.oduBirth.oduName ?? '—';
  const authMatch = result.authorityMatch ?? 'complementary';

  const romanticStrength =
    result.romantic && result.romantic > 75
      ? 'forte conexão romântica'
      : result.romantic && result.romantic > 55
        ? 'conexão afetiva presente'
        : 'relação que pede atenção e diálogo sobre as necessidades emocionais';

  const partnershipStrength =
    result.partnership && result.partnership > 75
      ? 'parceria de alto impacto'
      : result.partnership && result.partnership > 55
        ? 'bom potencial de colaboração'
        : 'parceria com áreas de desenvolvimento';

  if (result.dominantType === 'romantic' || result.dominantType === 'both') {
    const oduDynamic =
      result.oduSync?.score && result.oduSync.score > 75
        ? 'uma ressonância espiritual profunda'
        : 'uma dinâmica interessante de complementação';

    const authorityLabel =
      authMatch === 'aligned'
        ? 'Alinhamento de Decisão'
        : authMatch === 'complementary'
          ? 'Complementaridade de Decisão'
          : 'Atenção à Decisão';

    const authorityText =
      authMatch === 'aligned'
        ? `${a.name} e ${b.name} possuem autoridade de decisão alinhada — tomam decisões de forma similar. Aproveitem o alinhamento natural para decisões importantes.`
        : authMatch === 'complementary'
          ? `${a.name} e ${b.name} possuem autoridade de decisão complementar — um traz o que o outro precisa em decisões. Usem essa互补idade a favor da relação.`
          : `${a.name} e ${b.name} possuem estilos de decisão diferentes — comuniquem-se claramente sobre expectativas antes de decisões importantes.`;

    return [
      {
        topic: 'romantic',
        label: 'Conexão Amorosa',
        text: `${a.name} e ${b.name} possuem uma ${romanticStrength}. Permitam que a intimidade evolua naturalmente, sem pressa.`,
      },
      {
        topic: 'odu',
        label: 'Sincronia Espiritual',
        text: `Odu ${oduA} com Odu ${oduB} traz ${oduDynamic}. Usem rituais compartilhados para fortalecer o vínculo espiritual do casal.`,
      },
      {
        topic: 'authority',
        label: authorityLabel,
        text: authorityText,
      },
    ];
  }

  const authorityText =
    authMatch === 'aligned'
      ? `${a.name} e ${b.name} possuem autoridade de decisão alinhada — tomam decisões de forma similar. Aproveitem o alinhamento natural.`
      : `${a.name} e ${b.name} possuem estilos de decisão diferentes — comuniquem-se claramente sobre expectativas.`;

  return [
    {
      topic: 'romantic',
      label: 'Parceria e Conexão',
      text: `${a.name} e ${b.name} possuem um ${partnershipStrength}. A conexão espiritual (${result.oduSync?.description ?? ''}) é um alicerce forte. Construam juntos sobre essa base.`,
    },
    {
      topic: 'odu',
      label: 'Ressonância Espiritual',
      text: `A dinâmica espiritual entre ${oduA} e ${oduB} sustenta a relação. Respeitem os ritmos individuais de cada um no caminho espiritual.`,
    },
    {
      topic: 'authority',
      label: authMatch === 'aligned' ? 'Alinhamento de Decisão' : 'Adaptação de Decisão',
      text: authorityText,
    },
  ];
}
// Partial type for functions that only need specific fields
type PartialConexaoResult = Pick<
  ConexaoResult,
  'romantic' | 'partnership' | 'authorityMatch' | 'oduSync' | 'dimensions' | 'dominantType'
>;

function generateRecommendations(result: PartialConexaoResult): string[] {
  const recs: string[] = [];

  if (result.romantic > 75) {
    recs.push(
      'A conexão emocional é forte: marquem tempo de qualidade regularmente para nutrir o vínculo.'
    );
  }
  if (result.romantic < 55) {
    recs.push(
      'Construam uma linguagem emocional própria: perguntem um ao outro "como você se sente agora?" antes de assumir.'
    );
  }
  if (result.authorityMatch === 'conflict') {
    recs.push(
      'Autoridades diferentes: antes de decisões importantes, façam uma pausa de 24h para cada um processar sozinho antes de discutir juntos.'
    );
  }
  if (result.authorityMatch === 'complementary') {
    recs.push(
      'Autoridades complementares: aproveitem a diversidade — um traz estruturação, outro traz intuição.'
    );
  }

  const emotionalDim = result.dimensions.find((d) => d.dimension === 'Emocional');
  if (emotionalDim && emotionalDim.score < 60) {
    recs.push(
      'Conexão emocional em desenvolvimento: check-ins semanais de 10 minutos podem acelerar a intimidade emocional.'
    );
  }

  const spiritualDim = result.dimensions.find((d) => d.dimension === 'Espiritual');
  if (spiritualDim && spiritualDim.score > 80) {
    recs.push(
      'Ressonância espiritual rara: considerem práticas compartilhadas (meditação, ritual ou conversas profundas).'
    );
  }

  if (result.oduSync.sharedOdu) {
    recs.push(
      'Vocês compartilham o mesmo Odu: esse é um indicativo de missão ou propósito compartilhado.'
    );
  }

  if (recs.length === 0) {
    recs.push(
      'Continuem investindo na comunicação honesta e na presença mútua. Cada relação tem seu ritmo.'
    );
  }

  return recs;
}

// ─── Main comparison function ────────────────────────────────────────────────

/**
 * Compara dois mapas Akasha e retorna a análise completa de conexão.
 */
export function compareAkashaMaps(mapA: ConexaoMap, mapB: ConexaoMap): ConexaoResult {
  const authResult = scoreAuthority(mapA.authority, mapB.authority);
  const oduSync = scoreOdu(mapA.oduBirth, mapB.oduBirth);
  const bodySync = scoreTantra(mapA.tantricMap, mapB.tantricMap);
  const dimensions = scoreDimensions(mapA, mapB, oduSync, bodySync);

  // Romantic score: Lua 30%, Casa 8 25%, Odu 20%, Authority 15%, Body 10%
  const romantic = Math.round(
    scoreLua(mapA.astrologyMap, mapB.astrologyMap) * 0.3 +
      scoreCasaOito(mapA.astrologyMap, mapB.astrologyMap) * 0.25 +
      oduSync.score * 0.2 +
      authResult.score * 0.15 +
      bodySync.score * 0.1
  );

  // Partnership score: Authority 30%, LifePath 25%, Body 20%, Odu 15%, Lua 10%
  const partnership = Math.round(
    authResult.score * 0.3 +
      scoreLifePath(mapA.kabalisticMap.lifePath ?? 0, mapB.kabalisticMap.lifePath ?? 0) * 0.25 +
      bodySync.score * 0.2 +
      oduSync.score * 0.15 +
      scoreLua(mapA.astrologyMap, mapB.astrologyMap) * 0.1
  );

  const dominantType: DominantConnectionType =
    romantic > 75 && partnership > 75
      ? 'both'
      : romantic > partnership + 15
        ? 'romantic'
        : partnership > romantic + 15
          ? 'partnership'
          : 'challenging';

  const recommendations = generateRecommendations({
    romantic,
    partnership,
    authorityMatch: authResult.match,
    oduSync,
    dimensions,
    dominantType,
  });

  const narrative = buildNarrative(mapA, mapB, {
    romantic,
    partnership,
    authorityMatch: authResult.match,
    oduSync,
    dominantType,
  });

  return {
    romantic,
    partnership,
    dominantType,
    authorityMatch: authResult.match,
    dimensions,
    oduSync,
    bodySync,
    narrative,
    recommendations,
  };
}
