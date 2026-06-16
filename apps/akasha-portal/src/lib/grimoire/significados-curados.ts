/**
 * Significados Curados — Camada de Significado do Grimório (F-219, F-220)
 *
 * Cada Pilar retorna **números e símbolos** (vida = 11, sol = Escorpião,
 * corpo = 7, hexagrama = 51, etc.). O que o sistema entrega ao usuário
 * HOJE é o número; o que ENTREGA SIGNIFICADO é esta camada.
 *
 * Princípios (VISION.md §3 axiomas):
 * - Axioma 3: Curadoria contínua de dados/fundamentos. O Grimório é vivo.
 * - Axioma 4: Citação obrigatória. Toda afirmação cita fonte.
 * - Axioma 8: PT-BR primeiro.
 *
 * Pilar 4 (Odu) carrega `requer_terreiro: true` — respeitar R-022 §4.4
 * (ética Ifá: informação geral, mas interpretação profunda vem de
 *  babalaô/yaô com consentimento do consulente e da tradição).
 *
 * Organização (F-219, F-220 — refactor T1.x):
 * Este arquivo é a **fachada pública** do Grimório. As curadorias foram
 * extraídas para arquivos focados por Pilar:
 *   - `significados-curados-pilar-1.ts` (Cabala: 4 séries numéricas)
 *   - `significados-curados-pilar-2.ts` (Astrologia: signos + fases + tríade)
 *   - `significados-curados-pilar-3.ts` (Tântrica: 11 corpos + 3 trigêmeos + 4 temperamentos)
 *   - `significados-curados-pilar-4.ts` (Odu: 16 principais)
 *   - `significados-curados-pilar-5a.ts` (I Ching: hexagramas 1-32)
 *   - `significados-curados-pilar-5b.ts` (I Ching: hexagramas 33-64)
 *   - `significados-curados-escala-temporal.ts` (Mandato: D/S/Z/V)
 *
 * Helpers de visão agregada:
 *   - `significados-curados-helpers.ts` (visão genérica por Pilar)
 *   - `significados-especificos.ts` (F-222: dados específicos por Pilar)
 *
 * Critério editorial: cada `essencia` cabe em uma respiração (≤22 palavras
 * PT-BR). Cada `pratica` cabe em 1 linha de UI. Sem jargão esotérico sem
 * tradução; todo termo técnico é seguido de explicação em itálico.
 */

// ─── Tipos ────────────────────────────────────────────────────────────────

export type Pilar = 'cabala' | 'astrologia' | 'tantrica' | 'odu' | 'iching';

export interface SignificadoCurado {
  /** Identificador canônico: número, signo, nome Odu, número hexagrama, etc. */
  id: string | number;
  /** Pilar a que pertence. */
  pilar: Pilar;
  /** Título em PT-BR (1-3 palavras, exibido em destaque). */
  titulo: string;
  /** Significado central (≤22 palavras). O que É. */
  essencia: string;
  /** O que esse símbolo PEDE à pessoa. Direção de movimento. */
  missao: string;
  /** Risco/sombra. O que observar/cuidar. */
  sombra: string;
  /** 1 ação concreta (3-5 min), escrita em 2ª pessoa. */
  pratica: string;
  /** Como ressoa com os outros 4 Pilares (1 frase cruzada). */
  conexao: string;
  /** Fonte primária. Curadores Akasha devem poder auditar. */
  fonte: string;
  /** Apenas Pilar 4 (Odu). Veja R-022 §4.4. */
  requer_terreiro?: boolean;
}

// ─── Imports por Pilar (curadoria externa) ───────────────────────────────

import { PILAR_1_SERIES } from './significados-curados-pilar-1';
import { PILAR_2_SERIES } from './significados-curados-pilar-2';
import { PILAR_3_SERIES } from './significados-curados-pilar-3';
import { PILAR_4_SERIES } from './significados-curados-pilar-4';
import { PILAR_5_HEXAGRAMAS_1_32 } from './significados-curados-pilar-5a';
import { PILAR_5_HEXAGRAMAS_33_64 } from './significados-curados-pilar-5b';
import { ESCALA_TEMPORAL } from './significados-curados-escala-temporal';

// ─── Agregação indexada para busca ──────────────────────────────────────

const SIGNIFICADOS: SignificadoCurado[] = [
  ...PILAR_1_SERIES,
  ...PILAR_2_SERIES,
  ...PILAR_3_SERIES,
  ...PILAR_4_SERIES,
  ...PILAR_5_HEXAGRAMAS_1_32,
  ...PILAR_5_HEXAGRAMAS_33_64,
  ...ESCALA_TEMPORAL,
];

// ─── Helpers de busca ────────────────────────────────────────────────────

/** Busca significado por pilar + identificador. Retorna undefined se ausente. */
export function significadoPorPilar(
  pilar: Pilar,
  id: string | number
): SignificadoCurado | undefined {
  return SIGNIFICADOS.find((s) => s.pilar === pilar && String(s.id) === String(id));
}

/** Lista todas as entradas de um Pilar (sem séries repetidas, ex: 1-9 birthday). */
export function significadosDoPilar(pilar: Pilar): SignificadoCurado[] {
  return SIGNIFICADOS.filter((s) => s.pilar === pilar);
}

/** Estatísticas para curadores e cobertura. */
export function coberturaSignificados(): Record<Pilar, number> {
  return {
    cabala: SIGNIFICADOS.filter((s) => s.pilar === 'cabala').length,
    astrologia: SIGNIFICADOS.filter((s) => s.pilar === 'astrologia').length,
    tantrica: SIGNIFICADOS.filter((s) => s.pilar === 'tantrica').length,
    odu: SIGNIFICADOS.filter((s) => s.pilar === 'odu').length,
    iching: SIGNIFICADOS.filter((s) => s.pilar === 'iching').length,
  };
}

// ─── Re-exports para compatibilidade (F-219, F-220, F-222) ──────────────

// Visão genérica por Pilar (entrada agregada). Extraída para
// `./significados-curados-helpers.ts` (helper). Re-exportada para manter
// compatibilidade com imports existentes.
export { significadoGenericoDoPilar } from './significados-curados-helpers';

// Significados específicos por Pilar (F-222). Movido para
// `./significados-especificos.ts` (helper). Re-exportado para manter
// compatibilidade com imports existentes.
export {
  significadosEspecificos,
  type PilarDadosCabala,
  type PilarDadosAstrologia,
  type PilarDadosTantrica,
  type PilarDadosOdu,
  type PilarDadosIChing,
  type PilaresDados,
} from './significados-especificos';
