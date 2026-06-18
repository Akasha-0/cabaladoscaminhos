/**
 * cross-engine.ts — Motor de cruzamento dos 4 pilares
 *
 * Detecta pontos de tensão e sincronicidade cruzando:
 *   1. Astrologia (mapa natal + trânsitos)
 *   2. Kabala (sephiroth + caminhos)
 *   3. Tantra (corpos sutis / koshas)
 *   4. Odus do Ifá
 *
 * REGRA CRÍTICA: apenas correlações verificáveis das tradições.
 */
import { getOduByName, type OduData, type OduElement } from '@/lib/domain/odu-data';

// ─── Tipos de entrada ────────────────────────────────────────────────────────

interface AstrologyMapInput {
  dominantElement?: string;
  moonSign?: string;
  sunSign?: string;
  risingSign?: string;
  overallEnergy?: number;
  majorAspects?: Array<{ energy?: string; interpretation?: string; recommendation?: string }>;
  moonPhase?: { phase?: string; name?: string };
  luckyColor?: string;
}

interface KabalisticMapInput {
  sephira?: string;
  path?: string;
  lifePathNumber?: number;
  dominantLetter?: string;
}

interface TantricMapInput {
  activeBodies?: number[]; // Corpos ativos: 1-11 (1=Alma, 9=Sutil, etc.)
  dominantBody?: number;
  activeChakras?: number[]; // Chakras ativos: 1-7
  dominantChakra?: number;
}

interface OduBirthInput {
  name?: string;
  id?: string;
  elementalForce?: string;
  element?: string;
}

// ─── Tipos de saída ──────────────────────────────────────────────────────────

export interface TensionPoint {
  pillar: 'astrology' | 'kabala' | 'tantra' | 'odus';
  theme: string;
  intensity: number; // 0-100
  affectedBody?: number; // corpo tântrico (1-11)
  affectedElement?: string;
}

export interface SyncPoint {
  theme: string;
  color: '#2DD4BF' | '#7C5CFF' | '#F0B429';
}

export interface DailyRitual {
  titulo: string;
  instrucao: string;
  cor: string;
  elemento: string;
  herbs?: string[];
}

export interface CrossAnalysis {
  tensionPoint: TensionPoint;
  syncPoint: SyncPoint;
  dailyRitual: DailyRitual;
  dailyAlert: string;
  climate: string;
}

// ─── Helpers internos ────────────────────────────────────────────────────────

/** Signos de Água (astrologia ocidental). */
const WATER_SIGNS = new Set(['cancer', 'escorpio', 'peixes', 'câncer', 'escorpião']);

/** Signos de Fogo. */
const FIRE_SIGNS = new Set(['aries', 'leao', 'sagitario', 'áries', 'leão', 'sagitário']);

/** Signos de Terra. */
const EARTH_SIGNS = new Set(['touro', 'virgem', 'capricornio', 'capricórnio']);

/** Signos de Ar. */
const AIR_SIGNS = new Set(['gemeos', 'libra', 'aquario', 'gêmeos', 'aquário']);

function getSignElement(sign?: string): OduElement | null {
  if (!sign) return null;
  const s = sign.toLowerCase();
  if (WATER_SIGNS.has(s)) return 'water';
  if (FIRE_SIGNS.has(s)) return 'fire';
  if (EARTH_SIGNS.has(s)) return 'earth';
  if (AIR_SIGNS.has(s)) return 'air';
  return null;
}

const ELEMENT_COLORS: Record<OduElement, string> = {
  fire: '#FB5781',
  water: '#2DD4BF',
  earth: '#F0B429',
  air: '#7C5CFF',
};

const ELEMENT_NAMES: Record<OduElement, string> = {
  fire: 'Fogo',
  water: 'Água',
  earth: 'Terra',
  air: 'Ar',
};

const ELEMENT_HERBS: Record<OduElement, string[]> = {
  fire: ['alecrim', 'canela', 'cravo'],
  water: ['arruda', 'manjericão', 'erva-doce', 'camomila'],
  earth: ['hortelã', 'patchouli', 'vetiver'],
  air: ['lavanda', 'eucalipto', 'erva-cidreira'],
};

/** Nomes canônicos dos corpos tântricos (1-11). */
const TANTRIC_BODY_NAMES: Record<number, string> = {
  1: 'Alma (Atma)',
  2: 'Prânico (Prana)',
  3: 'Negativo (Pranayama)',
  4: 'Neutro (Shuniya)',
  5: 'Físico (Sthula)',
  6: 'Arcline (Halo)',
  7: 'Aura (Magnetic Field)',
  8: 'Radiante (Prabhupati)',
  9: 'Sutil (Sukshma)',
  10: 'Divino (Dasvah Dvar)',
  11: 'Comando (Ajna)',
};

// ─── Motor principal ─────────────────────────────────────────────────────────

export function crossAnalyze(
  astrologyMap: unknown,
  kabalisticMap: unknown,
  tantricMap: unknown,
  oduBirth: unknown,
  date: Date = new Date()
): CrossAnalysis {
  const astro = (astrologyMap ?? {}) as AstrologyMapInput;
  const kab = (kabalisticMap ?? {}) as KabalisticMapInput;
  const tantra = (tantricMap ?? {}) as TantricMapInput;
  const oduIn = (oduBirth ?? {}) as OduBirthInput;

  // Resolver Odu de nascimento
  const oduName = oduIn.name ?? oduIn.id ?? '';
  const odu: OduData | undefined = getOduByName(oduName) ?? undefined;

  const oduElement: OduElement =
    odu?.element ??
    (oduIn.element as OduElement | undefined) ??
    (oduIn.elementalForce as OduElement | undefined) ??
    'earth';

  const moonSignElement = getSignElement(astro.moonSign);
  const sunSignElement = getSignElement(astro.sunSign);

  // ── Detectar Tensão ─────────────────────────────────────────────────────

  const tensionPoint = detectTension(astro, kab, tantra, oduElement, moonSignElement);

  // ── Detectar Sincronicidade ──────────────────────────────────────────────

  const syncPoint = detectSync(astro, odu, oduElement, moonSignElement, sunSignElement, kab);

  // ── Construir Ritual ─────────────────────────────────────────────────────

  const dailyRitual = buildRitual(tensionPoint, odu, oduElement, astro, date);

  // ── Construir Alerta ─────────────────────────────────────────────────────

  const dailyAlert = buildAlert(tensionPoint, astro);

  // ── Construir Clima ──────────────────────────────────────────────────────

  const climate = buildClimate(astro, odu, oduElement, moonSignElement, tensionPoint);

  return { tensionPoint, syncPoint, dailyRitual, dailyAlert, climate };
}

// ─── Detecção de tensão ───────────────────────────────────────────────────────

function detectTension(
  astro: AstrologyMapInput,
  _kab: KabalisticMapInput,
  tantra: TantricMapInput,
  oduElement: OduElement,
  moonSignElement: OduElement | null
): TensionPoint {
  // Regra 1: Elemento dominante da astrologia é Água
  // → verificar se corpos tântricos 1 (Alma) e 9 (Sutil) estão ativos
  const astroDominant = (astro.dominantElement ?? '').toLowerCase() as OduElement | '';
  if (astroDominant === 'water') {
    const activeBodies = tantra.activeBodies ?? [];
    const hasAlma = activeBodies.includes(1);
    const hasSutil = activeBodies.includes(9);
    if (!hasAlma || !hasSutil) {
      const missingBody = !hasAlma ? 1 : 9;
      return {
        pillar: 'tantra',
        theme: 'Desconexão dos corpos sutis da Água',
        intensity: 72,
        affectedBody: missingBody,
        affectedElement: 'water',
      };
    }
  }

  // Regra 2: Odu de Fogo + trânsito lunar em signo de Água → tensão nos Odus
  if (oduElement === 'fire' && moonSignElement === 'water') {
    return {
      pillar: 'odus',
      theme: 'Tensão Fogo-Água: Odu solar confronta trânsito lunar',
      intensity: 68,
      affectedElement: 'fire',
    };
  }

  // Regra 3: Aspectos desafiadores astrológicos
  const desafiadores = (astro.majorAspects ?? []).filter((a) => a.energy === 'desafiador');
  if (desafiadores.length >= 2) {
    return {
      pillar: 'astrology',
      theme: desafiadores[0]?.interpretation ?? 'Múltiplos aspectos desafiadores ativos',
      intensity: Math.min(50 + desafiadores.length * 10, 90),
    };
  }

  // Regra 4: Chakra dominante ausente dos ativos (desalinhamento tântrico geral)
  const dominantChakra = tantra.dominantChakra;
  const activeChakras = tantra.activeChakras ?? [];
  if (dominantChakra && !activeChakras.includes(dominantChakra)) {
    return {
      pillar: 'tantra',
      theme: `Chakra ${dominantChakra} dominante em desequilíbrio`,
      intensity: 55,
    };
  }

  // Padrão: baixa tensão, pilar kabala
  const overallEnergy = astro.overallEnergy ?? 60;
  return {
    pillar: 'kabala',
    theme: 'Integração dos caminhos da árvore da vida',
    intensity: Math.max(20, 100 - overallEnergy),
  };
}

// ─── Detecção de sincronicidade ───────────────────────────────────────────────

function detectSync(
  astro: AstrologyMapInput,
  odu: OduData | undefined,
  oduElement: OduElement,
  moonSignElement: OduElement | null,
  sunSignElement: OduElement | null,
  _kab: KabalisticMapInput
): SyncPoint {
  // Odu e Lua em harmonia de elemento
  if (odu && moonSignElement === oduElement) {
    return {
      theme: `Harmonia entre ${odu.name} (${ELEMENT_NAMES[oduElement]}) e Lua em ${ELEMENT_NAMES[moonSignElement]}`,
      color: '#2DD4BF',
    };
  }

  // Sol e Lua em harmonia
  if (sunSignElement && moonSignElement && sunSignElement === moonSignElement) {
    return {
      theme: `Campo solar e lunar em ressonância de ${ELEMENT_NAMES[sunSignElement]}`,
      color: '#F0B429',
    };
  }

  // Campo favorável geral
  const harmoniosos = (astro.majorAspects ?? []).filter((a) => a.energy === 'harmonioso');
  if (harmoniosos.length > 0) {
    return {
      theme: harmoniosos[0]?.interpretation ?? 'Aspectos harmoniosos favorecem o dia',
      color: '#7C5CFF',
    };
  }

  return {
    theme: 'Campo em equilíbrio — utilize para ancoragem interna',
    color: '#7C5CFF',
  };
}

// ─── Construção de ritual ─────────────────────────────────────────────────────

function buildRitual(
  tension: TensionPoint,
  odu: OduData | undefined,
  oduElement: OduElement,
  astro: AstrologyMapInput,
  _date: Date
): DailyRitual {
  const tensionElement = (tension.affectedElement as OduElement | undefined) ?? oduElement;
  const herbs = ELEMENT_HERBS[tensionElement] ?? ELEMENT_HERBS.earth;
  const cor = astro.luckyColor ?? ELEMENT_COLORS[tensionElement];
  const elemento = ELEMENT_NAMES[tensionElement];

  // Ritual baseado no pilar em tensão
  if (tension.pillar === 'tantra' && tension.affectedBody) {
    const bodyName = TANTRIC_BODY_NAMES[tension.affectedBody] ?? `Corpo ${tension.affectedBody}`;
    return {
      titulo: `Ativação do ${bodyName}`,
      instrucao:
        `Sente-se em meditação por 11 minutos. Visualize o ${bodyName} brilhando em ${cor}. ` +
        `Respire profundamente, retendo o ar por 4 tempos e soltando em 8. ` +
        `Use ervas de ${elemento.toLowerCase()} (${herbs.slice(0, 2).join(' ou ')}) no ambiente.`,
      cor,
      elemento,
      herbs,
    };
  }

  if (tension.pillar === 'odus' && odu) {
    const quizila = odu.quizilas[0] ?? 'evitar conflitos';
    const preceit = odu.preceitos[0] ?? 'manter equilíbrio';
    return {
      titulo: `Equilíbrio de ${odu.name}: Banho de ${elemento}`,
      instrucao:
        `Prepare um banho com ${herbs.join(', ')}. ` +
        `Enquanto a água corre, recite: "${preceit}". ` +
        `Lembre-se da quizilá do dia: ${quizila}. ` +
        `Use roupas de cor ${cor} após o banho.`,
      cor,
      elemento,
      herbs,
    };
  }

  if (tension.pillar === 'astrology') {
    return {
      titulo: 'Ancoragem Terrestre — Meditação de Raiz',
      instrucao:
        `Os trânsitos do dia pedem equilíbrio. Descalce-se sobre o chão natural por 10 minutos. ` +
        `Respire lentamente, visualizando raízes descendo de seus pés até o centro da Terra. ` +
        `Cor do dia: ${cor}. Elemento: ${elemento}. ` +
        `Ervas sugeridas: ${herbs.join(', ')}.`,
      cor,
      elemento,
      herbs,
    };
  }

  // Padrão (kabala ou campo neutro)
  return {
    titulo: 'Harmonização Cabalística — Silêncio Sagrado',
    instrucao:
      `Reserve 7 minutos de silêncio absoluto. Foque na intenção de integrar os caminhos da árvore da vida. ` +
      `Medite com a cor ${cor} à sua frente (vela, tecido ou visualização). ` +
      `Elemento de suporte: ${elemento}. Ervas: ${herbs.join(', ')}.`,
    cor,
    elemento,
    herbs,
  };
}

// ─── Construção de alerta ─────────────────────────────────────────────────────

function buildAlert(tension: TensionPoint, astro: AstrologyMapInput): string {
  const desafiadores = (astro.majorAspects ?? []).filter((a) => a.energy === 'desafiador');

  if (tension.pillar === 'tantra' && tension.affectedBody) {
    const bodyName = TANTRIC_BODY_NAMES[tension.affectedBody] ?? `Corpo ${tension.affectedBody}`;
    return (
      `Atenção ao ${bodyName} — em desequilíbrio hoje. Evite ambientes de alta estimulação sensorial e ` +
      `prefira ambientes silenciosos. Intensidade: ${tension.intensity}/100.`
    );
  }

  if (tension.pillar === 'odus') {
    return (
      `O cruzamento entre seu Odu de nascimento e o trânsito lunar cria tensão de ${tension.theme}. ` +
      `Evite reações impulsivas e busque equilíbrio entre intuição e razão nas próximas 24h.`
    );
  }

  if (desafiadores.length > 0) {
    const rec = desafiadores[0]?.recommendation;
    return (
      rec ??
      `Campo desafiador detectado (intensidade ${tension.intensity}/100). ` +
        `Mantenha-se centrado e evite decisões importantes nas próximas horas.`
    );
  }

  return (
    `Campo em equilíbrio moderado. Atenção ao tema: ${tension.theme}. ` +
    `Intensidade: ${tension.intensity}/100.`
  );
}

// ─── Construção de clima ──────────────────────────────────────────────────────

function buildClimate(
  astro: AstrologyMapInput,
  odu: OduData | undefined,
  oduElement: OduElement,
  moonSignElement: OduElement | null,
  tension: TensionPoint
): string {
  const moonName = astro.moonPhase?.name ?? 'Lua';
  const moonSignDesc = moonSignElement ? `em campo de ${ELEMENT_NAMES[moonSignElement]}` : '';
  const oduDesc = odu ? `${odu.name} (${ELEMENT_NAMES[oduElement]})` : ELEMENT_NAMES[oduElement];

  let climate = `${moonName}${moonSignDesc ? ' ' + moonSignDesc : ''} — campo em ressonância com ${oduDesc}.`;

  if (tension.intensity > 65) {
    climate += ` O campo apresenta tensão elevada (${tension.intensity}/100) no pilar de ${tension.pillar === 'astrology' ? 'Astrologia' : tension.pillar === 'tantra' ? 'Tantra' : tension.pillar === 'odus' ? 'Odus' : 'Kabala'}.`;
  } else if (tension.intensity > 40) {
    climate += ` Tensão moderada. Tema central: ${tension.theme}.`;
  } else {
    climate += ` Campo favorável. Utilize para ancoragem e integração.`;
  }

  return climate;
}
