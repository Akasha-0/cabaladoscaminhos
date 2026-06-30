/**
 * ════════════════════════════════════════════════════════════════════════════
 * W82-A — CRUZAMENTO POR CASA · TYPES
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Branded primitive types + DTOs for the Mesa Real cross-house engine.
 *
 * The cruzamento engine accepts a MesaRealState (36 cards) plus a
 * MapaConsulente (the consulente's 4 natal maps: Astrologia, Numerologia,
 * Odu de Nascimento, Mapa Cigano). Output is an array of 36 CruzamentoCasa
 * records — one per mesa casa — each carrying 1-4 contributions and a
 * surgical 2-3 sentence synthesis that cites at least one symbol from
 * each contributing map.
 *
 * Branded types ensure CasaId cannot be confused with arbitrary numbers.
 */

// ════════════════════════════════════════════════════════════════════════════
// BRANDED PRIMITIVES
// ════════════════════════════════════════════════════════════════════════════

/** Mesa Real casa identifier, 1..36 inclusive. */
export type CasaId = number & { readonly __brand: 'CasaId' };

/** Cigano card identifier, 1..36 inclusive (Petite Lenormand / Cigano deck). */
export type CartaCiganaId = number & { readonly __brand: 'CartaCiganaId' };

/** Consulente (querent) opaque identifier. */
export type ConsulenteId = string & { readonly __brand: 'ConsulenteId' };

/** Odu de Nascimento key, one of the 16 odus. */
export type OduKey = string & { readonly __brand: 'OduKey' };

/** Orixá name (regente or atenção). */
export type OrixaKey = string & { readonly __brand: 'OrixaKey' };

// ════════════════════════════════════════════════════════════════════════════
// TRADIÇÕES
// ════════════════════════════════════════════════════════════════════════════

/**
 * Seven-tradition catalog. The cruzamento engine emits these as the
 * `fontes` for each casa, indicating which natal maps contributed to
 * the synthesis for that house.
 */
export type Tradicao =
  | 'cigano'
  | 'orixas'
  | 'astrologia'
  | 'cabala'
  | 'numerologia'
  | 'tantra'
  | 'tarot';

// ════════════════════════════════════════════════════════════════════════════
// MESA REAL STATE — INPUT
// ════════════════════════════════════════════════════════════════════════════

/** Position of the carta within the casa: 'cima' (upright) or 'baixo' (reversed). */
export type PosicaoCarta = 'cima' | 'baixo';

export interface MesaCard {
  casa: CasaId;
  cartaCiganaId: CartaCiganaId;
  posicao: PosicaoCarta;
}

export interface MesaRealState {
  consulenteId: ConsulenteId;
  cartas: ReadonlyArray<MesaCard>;
}

// ════════════════════════════════════════════════════════════════════════════
// MAPAS DO CONSULENTE — INPUT
// ════════════════════════════════════════════════════════════════════════════

/**
 * Snapshot of the consulente's astrological chart.
 * - `sol`/`lua`/`asc`/`mc`: zodiac signs
 * - `casas`: 1..12 house cusps (signs)
 */
export interface MapaAstrologia {
  sol: string;
  lua: string;
  asc: string;
  mc: string;
  /** Map of Casa 1..12 → zodiac sign on cusp. */
  casas: Readonly<Record<number, string>>;
}

/**
 * Numerology snapshot (Pythagorean + Cabalística).
 * - `numeroDestino`: 1..33 (master numbers 11/22/33 preserved)
 * - `anoPessoal`: 1..9 (reduced to single digit)
 * - `diaNatalicio`: 1..31
 */
export interface MapaNumerologia {
  numeroDestino: number;
  anoPessoal: number;
  diaNatalicio: number;
}

/**
 * Odu de Nascimento snapshot.
 * - `odu`: one of 16 odus (e.g. 'Ejiogbe', 'Oyeku', etc.)
 * - `orixaRegente`: official patron
 * - `orixaAtencao`: kinetic / asking-passage patron
 */
export interface MapaOdu {
  odu: OduKey;
  orixaRegente: OrixaKey;
  orixaAtencao: OrixaKey;
}

/**
 * Mapa Cigano snapshot (Cigano Ramiro lineage).
 * - `cartaNascimento`: card drawn at birth / life theme
 * - `regencia`: planetary regency for the birth card
 */
export interface MapaCigano {
  cartaNascimento: CartaCiganaId;
  regencia: string;
}

/** Composite of all four natal maps for the consulente. */
export interface MapaConsulente {
  astrologia: MapaAstrologia;
  numerologia: MapaNumerologia;
  odu: MapaOdu;
  cigano: MapaCigano;
}

// ════════════════════════════════════════════════════════════════════════════
// CRUZAMENTO OUTPUT
// ════════════════════════════════════════════════════════════════════════════

/**
 * One contribution from one tradicao to a given mesa casa.
 * `ref` is a stable citation key (e.g. 'casa-8', 'odu-Ejiogbe').
 */
export interface Contribuicao {
  tradicao: Tradicao;
  texto: string;
  ref: string;
}

/**
 * One unified cruzamento record for a single mesa casa.
 * - `tema`: PT-BR thematic label (e.g. "Sexualidade e Transformação")
 * - `contribuicoes`: 1-4 entries (subset of {astrologia, numerologia, odu, cigano})
 * - `sintese`: 2-3 sentence synthesis citing specific symbols from each map
 * - `fontes`: subset of Tradicao indicating which maps contributed
 */
export interface CruzamentoCasa {
  casa: CasaId;
  tema: string;
  contribuicoes: ReadonlyArray<Contribuicao>;
  sintese: string;
  fontes: ReadonlyArray<Tradicao>;
}