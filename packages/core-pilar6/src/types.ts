/**
 * Tipos canonicos do Pilar 6 — Mapa Energetico Integrado (D-YYY).
 *
 * Mantidos em sync com apps/akasha-portal/prisma/schema.prisma:
 *   - enum TipoEnergetico { iniciador, guia, iniciador_aberto, refletor }
 *   - enum EstrategiaEnergetica { esperar_convite, informar, iniciar, esperar_ciclo_lunar }
 *   - enum AutoridadeEnergetica { emocional, sacral, esplenica, cardiaca, identidade, lunar }
 *   - enum CentroEnergetico { inspiracao, mental, manifestacao, identidade,
 *                              vontade, emocoes, vitalidade, sobrevivencia, fundamentacao }
 *
 * Ver:
 *   - apps/akasha-portal/prisma/designs/D-YYY-pilar-6-mapa-energetico-traduzido.md
 *   - docs/adrs/0002-pilares-6-7-human-design-gene-keys.md
 */

// ─── Enums (mirror do schema.prisma) ────────────────────────────────────────

/**
 * 4 tipos energeticos renomeados (D-YYY §1.1, Guardrail 1 do ADR 0002).
 * Nomes universalistas, sem qualquer referencia a marcas proprietarias.
 */
export type TipoEnergetico =
  | 'iniciador'           // ex-Human Design Generator
  | 'guia'                // ex-Human Design Projector
  | 'iniciador_aberto'    // ex-Human Design Manifestor
  | 'refletor';           // ex-Human Design Reflector

/**
 * 4 estrategias baseadas em COMO o tipo interage com o mundo (D-YYY §1.2).
 */
export type EstrategiaEnergetica =
  | 'esperar_convite'         // ex-To Respond
  | 'informar'                // ex-To Inform
  | 'iniciar'                 // ex-To Initiate
  | 'esperar_ciclo_lunar';    // ex-To Wait (lunar)

/**
 * 6 autoridades internas baseadas em timing biologico (D-YYY §1.3).
 * Reusa Emocional/Esplenica/Cardiaca ja em D-041.
 */
export type AutoridadeEnergetica =
  | 'emocional'
  | 'sacral'
  | 'esplenica'
  | 'cardiaca'
  | 'identidade'
  | 'lunar';

/**
 * 9 centros energeticos baseados em I Ching + Cabala + Tantra (D-YYY §1.4).
 */
export type CentroEnergetico =
  | 'inspiracao'
  | 'mental'
  | 'manifestacao'
  | 'identidade'
  | 'vontade'
  | 'emocoes'
  | 'vitalidade'
  | 'sobrevivencia'
  | 'fundamentacao';

// ─── Input do Pilar 6 ───────────────────────────────────────────────────────

/**
 * Input minimo para o Pilar 6. Inspiracao algoritmica (D-YYY §"Inspiracao algoritmica"):
 *   - Pilar 4 (Odu)         — para detectar tipo de energia sustentada
 *   - Pilar 2 (Astrologia)  — ascendente + planeta na Casa 1
 *   - MC canonico (D-041)   — para autoridade
 *   - Pilar 5 (I Ching)     — portas ativas (1-64)
 *
 * Wave 4 entrega a SKELETON do Pilar 6 (heuristica simples baseada nos
 * campos ja disponiveis). Wave 5+ pode adicionar refinamentos
 * (ex: Venus Sequence do Pilar 7, etc).
 */
export interface Pilar6Input {
  /** Data de nascimento ISO YYYY-MM-DD (deterministico). */
  dataNascimento: string;
  /** Hora de nascimento HH:MM (opcional — se ausente, varios calculos ficam inconclusivos). */
  horaNascimento?: string | null;
  /** Pilar 4 (Odu) — principal, derivado de data. */
  oduPrincipal: string;
  /** Pilar 5 (I Ching) — hexagrama natal 1-64. */
  hexagramaNatal: number;
  /** MC canonico (D-041) — string canonica ja mapeada (emocional/esplenica/cardiaca/...). */
  mecanismoCaminante?: string | null;
  /** Astrologia: ascendente em graus 0-360 (opcional). */
  ascendenteLongitude?: number | null;
}

// ─── Resultado do Pilar 6 ───────────────────────────────────────────────────

/**
 * Pilar6Resultado e o output canonico do orquestrador.
 * Quando persistido em Pilar6Calculo (schema.prisma), cada campo
 * mapeia diretamente para uma coluna. centrosDefinidos e um array
 * do enum CentroEnergetico (Postgres native array).
 */
export interface Pilar6Resultado {
  /** Tipo energetico detectado. */
  tipo: TipoEnergetico;
  /** Estrategia derivada do tipo + centros. */
  estrategia: EstrategiaEnergetica;
  /** Autoridade inferida (null se inconclusivo). */
  autoridade: AutoridadeEnergetica | null;
  /** Subset dos 9 centros definidos (sempre >= 1 para tipo nao-refletor). */
  centrosDefinidos: CentroEnergetico[];
  /** Versao do calculo — incrementa quando algoritmo muda. */
  versaoCalculo: string;
  /** Timestamp de calculo (UTC). */
  calculadoEm: string;
}