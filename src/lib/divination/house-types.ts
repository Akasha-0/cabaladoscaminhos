// fallow-ignore-next-line unused-type
// src/lib/divination/house-types.ts
// Tipos canônicos das 36 casas da Mesa Real (Doc 06 §2).
// Forma consumida pela UI do Cockpit e por testes em tests/cockpit/.

// ============================================================================
// HouseDefinition — projeção leve + campos visuais para o Cockpit
// ============================================================================

/**
 * Definição de uma casa da Mesa Real.
 *
 * - `number`         — 1..36, posição na matriz 9×4.
 * - `cartaCigana`    — nome da carta cigana *delegada* a essa casa.
 * - `keyword`        — palavra-chave curta (p/ tooltip, badges).
 * - `bloco`          — bloco temático ('A'..'I') — agrupa casas vizinhas na matriz.
 * - `tema`           — tema de vida (curto, p/ header de popover).
 * - `significado`    — significado estendido (parágrafo).
 * - `astrologia`     — chaves de referência astrológica (simbólicas, p/ display).
 * - `numerologia`    — chaves numerológicas (simbólicas, p/ display).
 * - `corPrimaria`    — cor primária do card (hex).
 * - `corSecundaria`  — cor secundária (gradient/hover).
 * - `icone`          — nome do ícone lucide-react associado.
 *
 * A versão rica de extração (com dot-paths para mapas natais) vive em
 * `src/lib/ai/correlation-map.ts` (`CorrelationEntry`). Esta é a
 * projeção completa que a UI do Cockpit precisa.
 */
export interface HouseDefinition {
  /** 1..36, posição na matriz 9×4. */
  number: number;
  /** Nome da carta cigana delegada (ex.: "O Cavaleiro"). */
  cartaCigana: string;
  /** Palavra-chave curta (ex.: "ação", "família"). */
  keyword: string;
  /** Bloco temático: 'A'..'I' (9 colunas × 4 linhas; aqui usamos colunas). */
  bloco: string;
  /** Tema de vida associado à casa (p/ tooltip/header do popover). */
  tema: string;
  /** Significado estendido (parágrafo curto). */
  significado: string;
  /** Chaves/referências astrológicas simbólicas (p/ badges). */
  astrologia: string[];
  /** Chaves/referências numerológicas (p/ badges). */
  numerologia: string[];
  /** Cor primária do card (hex). */
  corPrimaria: string;
  /** Cor secundária (gradient/hover). */
  corSecundaria: string;
  /** Nome do ícone lucide-react. */
  icone: string;
}

// ============================================================================
// CasaState — estado mutável de uma casa no store do Cockpit
// ============================================================================

/**
 * Estado de preenchimento de uma casa no Cockpit.
 * Separado de `HouseDefinition` (imutável) para que o store possa
 * carregar dados de CartaCigana + Odu sem mexer na definição canônica.
 *
 * Importante: este tipo é usado por `src/stores/cockpit-store.ts`.
 */
export type CasaState =
  | { status: 'empty' }
  | {
      status: 'filled';
      cartaNumero: number;
      cartaNome: string;
      oduNumero: number;
      oduNome: string;
    };
