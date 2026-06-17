/**
 * @akasha/core — Mapeamentos: tipos partilhados
 *
 * Contrato de dados entre os 5 motores de tradição e o sintetizador akáshico.
 * Cada tabela de mapeamento (iching, cabala, odu, astrologia, tantra) obedece
 * a este contrato.
 *
 * Regras (constituição §5.2):
 * - Cada contribuição deve ter fonte justificativa
 * - Nunca inventar correspondência sem registar o raciocínio
 * - Tipos são constantes/imutáveis — mapeamentos são dados, não código
 */

// ─── Primitivos do Sistema Akáshico ────────────────────────────────────────────
/**
 * Conjunto fixo de ~12 primitivos que descrevem eixos de consciência.
 * Cada primitivo tem um polo de luz (forma integrada) e um polo de sombra.
 * Só se adiciona novo primitivo com justificativa em DECISIONS.md.
 */
export const PRIMITIVOS = [
  'Transformacao',
  'Expansao',
  'Ordem',
  'Expressao',
  'Amor',
  'Poder',
  'Sabedoria',
  'Movimento',
  'Servico',
  'Materializacao',
  'Intuicao',
  'Conexao',
] as const;

export type Primitivo = (typeof PRIMITIVOS)[number];

// ─── Polaridade ────────────────────────────────────────────────────────────────
export type Polaridade = 'luz' | 'sombra' | 'ambas';

/**
 * Uma contribuição individual de uma tradição para um primitivo.
 * É o átomo da síntese — todas as tradições contribuem contribuições
 * like estas; o sintetizador agrega.
 */
export interface PrimitiveContribution {
  primitivo: Primitivo;
  /** Intensidade 0–10 — força da contribuição. */
  intensidade: number;
  /** Se afecta o polo luz, sombra, ou ambos. */
  polaridade: Polaridade;
  /**
   * Justificativa da fonte tradicional.
   * Ex: "Wilhelm/Baynes 1976, hexagrama 1 — Três Linhas Yang = céu/Criação,
   *      correspondência com Qian (创造力, força criativa)"
   */
  fonte: string;
}

// ─── Tradição source ───────────────────────────────────────────────────────────
export type Tradicao = 'iching' | 'cabala' | 'astrologia' | 'tantra' | 'odu';

// ─── Domínios de vida (agregação de primitivos) ──────────────────────────────
/**
 * Domínio de vida = agrupamento de primitivos para output de área.
 * Usado pelo sintetizador para agregar contribuições em dimensões.
 */
export type Dominio =
  | 'identidade'
  | 'talentos'
  | 'desafios'
  | 'missao'
  | 'evolucao'
  | 'relacoes'
  | 'prosperidade'
  | 'espiritualidade';

// ─── Matriz de pesos tradição × domínio ────────────────────────────────────────
/**
 * Cada tradição pesa diferente em cada domínio.
 * Tuning fino — ajusta aqui, não no sintetizador.
 *
 * ranges 0.0–1.0. Soma por domínio não precisa ser 1.0
 * (o sintetizador normaliza por converging sources).
 */
export const PESOS_TRADICAO_DOMINIO: Record<Tradicao, Record<Dominio, number>> = {
  iching: {
    identidade: 0.6,
    talentos: 0.5,
    desafios: 0.7,
    missao: 0.8,
    evolucao: 0.9,
    relacoes: 0.6,
    prosperidade: 0.5,
    espiritualidade: 0.9,
  },
  cabala: {
    identidade: 0.9,
    talentos: 0.8,
    desafios: 0.6,
    missao: 0.9,
    evolucao: 0.6,
    relacoes: 0.5,
    prosperidade: 0.7,
    espiritualidade: 0.8,
  },
  astrologia: {
    identidade: 0.7,
    talentos: 0.7,
    desafios: 0.7,
    missao: 0.6,
    evolucao: 0.5,
    relacoes: 0.8,
    prosperidade: 0.5,
    espiritualidade: 0.6,
  },
  tantra: {
    identidade: 0.5,
    talentos: 0.6,
    desafios: 0.9,
    missao: 0.5,
    evolucao: 0.7,
    relacoes: 0.6,
    prosperidade: 0.4,
    espiritualidade: 0.8,
  },
  odu: {
    identidade: 0.7,
    talentos: 0.7,
    desafios: 0.8,
    missao: 0.9,
    evolucao: 0.7,
    relacoes: 0.7,
    prosperidade: 0.8,
    espiritualidade: 0.9,
  },
};
// ─── Procedência (tradição × símbolo × intensidade) ─────────────────────────────
/**
 * Entrada de procedência — rastro de origem de uma afirmação interpretativa.
 * Satisfaz o princípio constitucional §5: toda afirmação carrega
 * (tradição, símbolo, intensidade) que a originou.
 *
 * O símbolo é a etiqueta limpa da fonte (e.g. "Ogbe", "Hexagrama 26",
 * "Sol em Leão", "Life Path 7"). A fonte completa fica em PrimitiveContribution.fonte.
 */
export interface ProcedenciaEntry {
  tradicao: Tradicao;
  /** Símbolo limpo dentro da tradição — e.g. "Ogbe", "Hexagrama 26", "Life Path 7" */
  simbolo: string;
  /** Intensidade 0–10 da contribuição original */
  intensidade: number;
  primitivo: Primitivo;
  polaridade: Polaridade;
  /** Primeiros 120 chars da fonte original — suficiente para identificar, não para justificar */
  fonteResumo: string;
}
// ─── Tunable weights API ─────────────────────────────────────────────────────────
/**
 * Runtime override for PESOS_TRADICAO_DOMINIO.
 * Allows tuning the synthesis weights without source-code changes.
 *
 * Use cases:
 *  - Admin calibration via environment variable on startup
 *  - Future: per-user weight profiles stored in DB
 *
 * @example
 * // Override all weights (e.g. from env var on startup)
 * setTradicaoWeights({
 *   iching:    { identidade: 0.8, talentos: 0.6, desafios: 0.7, missao: 0.9, evolucao: 0.9, relacoes: 0.6, prosperidade: 0.5, espiritualidade: 0.9 },
 *   cabala:    { identidade: 0.9, talentos: 0.8, desafios: 0.6, missao: 0.9, evolucao: 0.6, relacoes: 0.5, prosperidade: 0.7, espiritualidade: 0.8 },
 *   astrologia:{ identidade: 0.7, talentos: 0.7, desafios: 0.7, missao: 0.6, evolucao: 0.5, relacoes: 0.8, prosperidade: 0.5, espiritualidade: 0.6 },
 *   tantra:    { identidade: 0.5, talentos: 0.6, desafios: 0.9, missao: 0.5, evolucao: 0.7, relacoes: 0.6, prosperidade: 0.4, espiritualidade: 0.8 },
 *   odu:       { identidade: 0.7, talentos: 0.7, desafios: 0.8, missao: 0.9, evolucao: 0.7, relacoes: 0.7, prosperidade: 0.8, espiritualidade: 0.9 },
 * });
 */

/** Module-level override — null means use PESOS_TRADICAO_DOMINIO directly. */
let _weightsOverride: Record<Tradicao, Record<Dominio, number>> | null = null;

const ALL_TRADICOES: Tradicao[] = ['iching', 'cabala', 'astrologia', 'tantra', 'odu'];
const ALL_DOMINIOS: Dominio[] = ['identidade', 'talentos', 'desafios', 'missao', 'evolucao', 'relacoes', 'prosperidade', 'espiritualidade'];

function isValidWeights(w: unknown): w is Record<Tradicao, Record<Dominio, number>> {
  if (!w || typeof w !== 'object') return false;
  for (const trad of ALL_TRADICOES) {
    const tradRow = (w as Record<string, unknown>)[trad];
    if (!tradRow || typeof tradRow !== 'object') return false;
    for (const dom of ALL_DOMINIOS) {
      const val = (tradRow as Record<string, unknown>)[dom];
      if (typeof val !== 'number' || val < 0 || val > 2) return false;
    }
  }
  return true;
}

/**
 * Returns the currently active weight matrix.
 * Returns the override if one is set; otherwise returns PESOS_TRADICAO_DOMINIO.
 */
export function getTradicaoWeights(): Record<Tradicao, Record<Dominio, number>> {
  return _weightsOverride ?? PESOS_TRADICAO_DOMINIO;
}

/**
 * Overrides the tradicao × dominio weight matrix at runtime.
 * The override persists for the lifetime of the process.
 * Returns true if the override was applied; false if the input was invalid
 * (in which case the existing matrix is unchanged).
 *
 * Note: overrides are not persisted to disk/database. They last for the
 * process lifetime only. For production tuning, set the env var
 * AKASHA_TRADICAO_WEIGHTS on startup or implement DB-backed weight storage.
 */
export function setTradicaoWeights(
  weights: unknown,
): boolean {
  if (!isValidWeights(weights)) {
    console.warn('[mapeamentos] setTradicaoWeights: invalid weights — must be Record<Tradicao, Record<Dominio, number>> with values in 0–2 range. Override NOT applied.');
    return false;
  }
  _weightsOverride = weights as Record<Tradicao, Record<Dominio, number>>;
  console.info('[mapeamentos] Tradicao weights overridden at runtime.');
  return true;
}
