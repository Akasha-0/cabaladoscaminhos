// ============================================================
// CONSULT CONTEXT — RAG fechado para o motor de Q&A (Doc 12 §5/§6)
// ============================================================
// Monta o contexto da resposta do Oráculo ancorado EXCLUSIVAMENTE em:
//  (1) o dossiê já gerado, (2) os quatro mapas natais,
//  (3) a carta+Odu das casas roteadas.
// Nunca conhecimento aberto.

import { routeQuestion, type RoutingResult } from '@/lib/ai/theme-router';
import { buildHousePayload, type ClientMaps, type HousePayload } from '@/lib/ai/dossier/oracle-prompt-builder';
import { CORRELATION_MAP } from '@/lib/ai/correlation-map';
import type { MatrixData } from '@/types';

// ============================================================
// SYSTEM PROMPT — persona de consulta (Doc 12 §6)
// ============================================================

export function buildConsultSystemPrompt(): string {
  return `Você é o Oráculo da Cabala dos Caminhos, no espírito do Cigano Ramiro.
O consulente já recebeu um dossiê. Agora ele faz uma pergunta.

REGRAS:
1. Responda SEMPRE na 2ª pessoa (você, seu, sua), tom místico-tecnológico e protetor.
2. Ancore-se EXCLUSIVAMENTE no contexto fornecido (dossiê + mapas + casas roteadas).
   Se a pergunta não puder ser respondida pelo que foi tirado, diga isso com honestidade
   e convide a uma nova tiragem — nunca invente carta, Odu ou aspecto que não está no contexto.
3. Estruture a resposta: (a) o que os mapas natais dizem sobre o tema (Terreno),
   (b) o que as casas tiradas revelam do momento (Evento),
   (c) a direção/conselho do Odu (Direção). Pode ser mais conciso que o dossiê.
4. Feche com uma linha-síntese em itálico.
5. NUNCA dê determinações médicas, jurídicas ou financeiras categóricas. Fale em
   tendências, energias e direções — o livre-arbítrio é do consulente.
6. Coerência absoluta com o dossiê: nunca contradiga o que já foi dito.`;
}

// ============================================================
// CONTEXTO DA CONSULTA
// ============================================================

export interface ConsultContext {
  routing: RoutingResult;
  /** Casas roteadas que FORAM tiradas na leitura (com carta/Odu + aspectos delegados). */
  drawnHouses: HousePayload[];
  /** Casas roteadas que NÃO foram tiradas — entram só como contexto natal. */
  natalOnlyHouses: number[];
  /** Trecho do dossiê relevante às casas roteadas (Markdown), se houver. */
  dossierExcerpt: string;
}

/** Extrai do dossiê salvo (ReportContent.houses) apenas as casas roteadas. */
function excerptDossier(
  reportHouses: Record<string, { interpretation?: string; houseName?: string }> | undefined,
  houses: number[]
): string {
  if (!reportHouses) return '';
  const parts: string[] = [];
  for (const h of houses) {
    const entry = reportHouses[String(h)];
    if (entry?.interpretation) {
      parts.push(`## Casa ${h}${entry.houseName ? ` — ${entry.houseName}` : ''}\n${entry.interpretation}`);
    }
  }
  return parts.join('\n\n');
}

/**
 * Monta o contexto RAG-fechado de uma pergunta sobre uma leitura.
 *
 * @param question   pergunta aberta do consulente
 * @param client     mapas natais cacheados do Client
 * @param matrixData tiragem da leitura (casas preenchidas)
 * @param reportHouses (opcional) ReportContent.houses do dossiê já gerado
 */
export function buildConsultContext(
  question: string,
  client: ClientMaps,
  matrixData: MatrixData,
  reportHouses?: Record<string, { interpretation?: string; houseName?: string }>
): ConsultContext {
  const filledHouses = Object.keys(matrixData)
    .map((k) => parseInt(k, 10))
    .filter((n) => CORRELATION_MAP[n] !== undefined);

  const routing = routeQuestion(question, filledHouses);

  const drawnHouses: HousePayload[] = [];
  const natalOnlyHouses: number[] = [];
  for (const h of routing.houses) {
    if (!CORRELATION_MAP[h]) continue;
    const entry = matrixData[String(h)];
    if (entry) {
      drawnHouses.push(buildHousePayload(h, entry, client));
    } else {
      natalOnlyHouses.push(h);
    }
  }

  return {
    routing,
    drawnHouses,
    natalOnlyHouses,
    dossierExcerpt: excerptDossier(reportHouses, routing.houses),
  };
}

/** Serializa o contexto em um payload de usuário para o LLM. */
export function buildConsultUserPayload(question: string, context: ConsultContext): object {
  return {
    pergunta: question,
    temas_roteados: context.routing.themes,
    casas_consultadas: context.routing.houses,
    aspectos_natais_relevantes: context.routing.natalAspects,
    casas_tiradas: context.drawnHouses,
    casas_apenas_natais: context.natalOnlyHouses,
    trecho_do_dossie: context.dossierExcerpt || '(dossiê não disponível para estas casas)',
    instrucao:
      'Responda à pergunta usando SOMENTE este contexto. Não invente nada fora dele.',
  };
}
