/**
 * PromptBuilder — Motor de Cruzamento de Dados da Mesa Real
 * =========================================================
 *
 * Recebe um `Client` (com seus mapas já calculados) e uma `MatrixData`
 * (as casas preenchidas pelo terapeuta) e produz o payload final que
 * será enviado para o LLM.
 *
 * O PromptBuilder NUNCA envia dados genéricos — para cada casa, ele
 * consulta o `CORRELATION_MAP` e injeta APENAS os campos mapeados para
 * aquela casa.
 *
 * @see docs/06_ai-engine-spec.md §3.2
 *
 * Estrutura do payload gerado:
 *  {
 *    consulente: { nome, data_nascimento, cidade_nascimento },
 *    instrucao_geral: <system prompt>,
 *    casas: [
 *      { casa_numero, casa_nome, casa_tema,
 *        dados_natais_consultante: { astrologia, numerologia_cabalistica,
 *                                    numerologia_tantrica, odu_natal },
 *        tiragem_do_dia: { carta, odu, ... }
 *      }
 *    ],
 *    instrucao_sintese_final: "..."
 *  }
 */

import { getCorrelation } from './correlation-map';
import { getLenormandCardById, LENORMAND_CARDS } from '@/lib/constants/lenormand-cards';
import { getOduById, ODUS } from '@/lib/constants/odus';
import type {
  AstrologyMap,
  KabalisticMap,
  MatrixData,
  OduBirth,
  TantricMap,
} from '@/types';

// ============================================================================
// SYSTEM PROMPT
// ============================================================================

/**
 * System prompt — comportamento global do LLM. Define tom, estrutura
 * obrigatória e idioma. Segue rigorosamente o Doc 06 §3.2.
 */
export function buildSystemPrompt(): string {
  return `Você é o Oráculo da "Cabala dos Caminhos", um sistema integrativo de leitura profunda.

Sua missão é analisar cada casa da Mesa Real cruzando os dados do mapa natal do consulente com a tiragem do dia.

REGRAS OBRIGATÓRIAS:
1. Dirija-se SEMPRE ao consulente na segunda pessoa (você, seu, sua).
2. Para cada casa, siga RIGOROSAMENTE a estrutura de 3 parágrafos:
   - §1 O TERRENO: Como o consulente naturalmente vive esta área da vida, baseado nos dados natais.
   - §2 O EVENTO: O que a carta tirada revela sobre o momento atual nesta área.
   - §3 A DIREÇÃO: O conselho do Odu para agir/navegar esta energia.
3. Seja direto, preciso e profundo. NUNCA seja genérico.
4. Termine cada casa com uma linha de síntese em itálico:
   *Palavra-chave: frase de 10 a 15 palavras*
5. Para a Síntese Final, integre os padrões que se repetem nas casas em 4 capítulos:
   - O Caminho do Trabalho e Dinheiro
   - O Caminho do Lar e Família
   - O Caminho do Amor e Relacionamentos
   - O Grande Conselho Espiritual
   Cada capítulo com 2-3 parágrafos. Feche com um VEREDITO FINAL de 1 parágrafo.

FORMATO DE RESPOSTA: Markdown puro. Use ## para os títulos de casa e # para o título principal.
IDIOMA: Português brasileiro, técnico e profundo.`;
}

// ============================================================================
// EXTRATOR DE DADOS DOS MAPAS
// ============================================================================

/**
 * Extrai do mapa (astrologia, cabalá, tântrica) os valores apontados
 * pelas chaves com notação de ponto (ex: "planets.mars.house").
 * Aceita `unknown`/`null`/`undefined` retornando `{}`.
 */
function extractFromMap(
  map: Record<string, unknown> | null | undefined,
  keys: ReadonlyArray<string>
): Record<string, unknown> {
  if (!map || typeof map !== 'object') return {};
  const out: Record<string, unknown> = {};
  for (const key of keys) {
    const value = key.split('.').reduce<unknown>((acc, k) => {
      if (acc && typeof acc === 'object') {
        return (acc as Record<string, unknown>)[k];
      }
      return undefined;
    }, map);
    if (value !== undefined) out[key] = value;
  }
  return out;
}

// ============================================================================
// PAYLOAD DE UMA CASA
// ============================================================================

export interface HousePayload {
  casa_numero: number;
  casa_nome: string;
  casa_tema: string;
  dados_natais_consultante: {
    astrologia: {
      aspectos_relevantes: ReadonlyArray<string>;
      valores: Record<string, unknown>;
    };
    numerologia_cabalistica: {
      aspectos: ReadonlyArray<string>;
      valores: Record<string, unknown>;
    };
    numerologia_tantrica: {
      aspectos: ReadonlyArray<string>;
      valores: Record<string, unknown>;
    };
    odu_natal: OduBirth | null;
  };
  tiragem_do_dia: {
    carta_numero: number;
    carta_nome: string;
    carta_palavras_chave: string;
    odu_numero: number;
    odu_nome: string;
    odu_essencia: string;
    odu_orixas: ReadonlyArray<string>;
  };
  instrucao: string;
}

/**
 * Constrói o payload de uma casa. Lança se a casa for inválida.
 */
export function buildHousePayload(
  house: number,
  matrixEntry: MatrixData[string]
): HousePayload {
  const correlation = getCorrelation(house);

  const carta = getLenormandCardById(matrixEntry.carta);
  const odu = getOduById(matrixEntry.odu);

  if (!carta) {
    throw new Error(
      `Carta inválida ${matrixEntry.carta} na casa ${house}`
    );
  }
  if (!odu) {
    throw new Error(`Odu inválido ${matrixEntry.odu} na casa ${house}`);
  }

  return {
    casa_numero: house,
    casa_nome: correlation.houseName,
    casa_tema: correlation.houseTheme,
    dados_natais_consultante: {
      astrologia: {
        aspectos_relevantes: correlation.astrology.primaryPlanets,
        valores: {}, // preenchido pelo buildFullPayload com dados do client
      },
      numerologia_cabalistica: {
        aspectos: correlation.kabalah.aspects,
        valores: {},
      },
      numerologia_tantrica: {
        aspectos: correlation.tantric.aspects,
        valores: {},
      },
      odu_natal: null, // preenchido pelo buildFullPayload
    },
    tiragem_do_dia: {
      carta_numero: carta.id,
      carta_nome: carta.name,
      carta_palavras_chave: carta.keywords,
      odu_numero: odu.id,
      odu_nome: odu.name,
      odu_essencia: odu.essence,
      odu_orixas: odu.orixas,
    },
    instrucao: `Analise a Casa ${house} (${correlation.houseName}) seguindo os 3 parágrafos obrigatórios.`,
  };
}

// ============================================================================
// PAYLOAD COMPLETO
// ============================================================================

export interface FullDossierPayload {
  consulente: {
    nome: string;
    data_nascimento: string;
    cidade_nascimento: string;
  };
  instrucao_geral: string;
  casas: HousePayload[];
  instrucao_sintese_final: string;
}

export interface BuildFullPayloadInput {
  client: {
    fullName: string;
    birthDate: Date | string;
    birthCity: string;
    birthState?: string;
    birthCountry?: string;
    astrologyMap?: AstrologyMap | null;
    kabalisticMap?: KabalisticMap | null;
    tantricMap?: TantricMap | null;
    oduBirth?: OduBirth | null;
  };
  matrixData: MatrixData;
}

/**
 * Constrói o payload completo a ser enviado para o LLM.
 * Itera sobre cada casa preenchida, injeta os dados natais
 * mapeados para aquela casa e adiciona a instrução de síntese.
 */
export function buildFullPayload(input: BuildFullPayloadInput): FullDossierPayload {
  const { client, matrixData } = input;
  const astroMap = (client.astrologyMap ?? null) as unknown as Record<string, unknown> | null;
  const kabMap = (client.kabalisticMap ?? null) as unknown as Record<string, unknown> | null;
  const tanMap = (client.tantricMap ?? null) as unknown as Record<string, unknown> | null;

  const casaEntries = Object.entries(matrixData).sort(
    ([a], [b]) => Number(a) - Number(b)
  );

  const houses: HousePayload[] = casaEntries.map(([houseStr, entry]) => {
    const house = Number(houseStr);
    const payload = buildHousePayload(house, entry);
    const correlation = getCorrelation(house);

    payload.dados_natais_consultante.astrologia.valores = extractFromMap(
      astroMap,
      correlation.astrology.extractionKeys
    );
    payload.dados_natais_consultante.numerologia_cabalistica.valores = extractFromMap(
      kabMap,
      correlation.kabalah.extractionKeys
    );
    payload.dados_natais_consultante.numerologia_tantrica.valores = extractFromMap(
      tanMap,
      correlation.tantric.extractionKeys
    );
    payload.dados_natais_consultante.odu_natal = client.oduBirth ?? null;

    return payload;
  });

  const local =
    [client.birthCity, client.birthState, client.birthCountry]
      .filter(Boolean)
      .join(', ') || client.birthCity;

  return {
    consulente: {
      nome: client.fullName,
      data_nascimento:
        client.birthDate instanceof Date
          ? client.birthDate.toISOString().slice(0, 10)
          : String(client.birthDate),
      cidade_nascimento: local,
    },
    instrucao_geral: buildSystemPrompt(),
    casas: houses,
    instrucao_sintese_final: `Após analisar todas as ${houses.length} casas acima, gere uma SÍNTESE FINAL com 4 capítulos:
1. **O Caminho do Trabalho e Dinheiro** (casas relacionadas a trabalho, finanças, carreira)
2. **O Caminho do Lar e Família** (casas relacionadas a moradia, família, raízes)
3. **O Caminho do Amor e Relacionamentos** (casas relacionadas a amor, contratos, parcerias)
4. **O Grande Conselho Espiritual** (casas relacionadas a espiritualidade, karma, propósito)
Cada capítulo: 2 a 3 parágrafos. Feche com um VEREDITO FINAL de 1 parágrafo com a direção mais urgente.`,
  };
}

// ============================================================================
// HELPERS DE APRESENTAÇÃO
// ============================================================================

/**
 * Formata o payload como string JSON para enviar como `userContent`
 * ao LLM (em vez de objeto,LLMs preferem string JSON).
 */
export function payloadToUserContent(payload: FullDossierPayload): string {
  return JSON.stringify(payload, null, 2);
}

/**
 * Reexporta utilitários úteis para o caller.
 */
export { LENORMAND_CARDS, ODUS };
export { getLenormandCardById, getOduById } from '@/lib/constants/lenormand-cards';
// Re-export from prompt-builder/index.ts
export { buildDossiePrompt, validateHouseInput } from './prompt-builder/index';
export type { HouseInput, CartaCigana, Odu, MapaFixo } from './prompt-builder/index';
