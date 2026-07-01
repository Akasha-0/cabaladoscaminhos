/**
 * AI Curation Engine — LLM Scoring Rubric (Wave 29)
 *
 * Prompts the LLM to evaluate candidate articles for inclusion in the
 * Cabala dos Caminhos knowledge base. Each dimension is scored 0–1.
 *
 * Hard rule: NEVER prescribe medical/therapeutic advice. NEVER invent data.
 * Only REAL articles that have been fetched from a registered source
 * (PubMed, SciELO, Crossref, arXiv, RSS, MAPS, Chacruna, ICEERS) may be
 * ingested into the DB. The LLM is a *gatekeeper*, not a generator.
 *
 * The eight ethical rules of Akasha IA (W12 charter) apply here:
 *  1. Não prescreve — never recommends treatment
 *  2. Sempre cita — every claim cites a real DOI/PMID/URL
 *  3. Não proselitiza — respects all traditions
 *  4. Não alucina — strictly grounded in ingested articles
 *  5. Transparente — flags low evidence honestly
 *  6. Cuidadoso — psychedelic topics include contraindications
 *  7. Plural — voices many lineages
 *  8. Acolhedor — trauma-aware language
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Schema — output contract the LLM must obey
// ---------------------------------------------------------------------------

export const CurationScoreSchema = z.object({
  relevance: z
    .number()
    .min(0)
    .max(1)
    .describe(
      "0-1: how relevant to spiritual/medicinal practices (meditation, prayer, plant medicines, contemplative traditions, holistic health)"
    ),
  evidence: z
    .number()
    .min(0)
    .max(1)
    .describe(
      "0-1: study quality. meta-analysis(0.95) > systematic-review(0.85) > RCT(0.75) > cohort(0.6) > case-report(0.4) > anecdotal/opinion(0.2)"
    ),
  safety: z
    .number()
    .min(0)
    .max(1)
    .describe(
      "0-1: respects medical disclaimers. Does NOT promise cures. Includes contraindications where relevant (e.g. ayahuasca + SSRIs)."
    ),
  universalism: z
    .number()
    .min(0)
    .max(1)
    .describe(
      "0-1: respects multiple traditions. Does NOT proselytize. Does NOT claim one tradition is superior."
    ),
  citations: z
    .number()
    .min(0)
    .max(1)
    .describe(
      "0-1: has verifiable references (DOI, PMID, real journal, etc). 0 if claims unsupported."
    ),
  recommendation: z.enum(["ACCEPT", "REVIEW", "REJECT"]),
  reason: z
    .string()
    .min(10)
    .max(500)
    .describe("One short paragraph explaining the recommendation in Portuguese."),
  tradition: z
    .string()
    .optional()
    .describe(
      "Optional tradition tag (Candomblé, Umbanda, Budismo, Medicina Ayurvedica, Xamanismo, Cristandade, Judaísmo, Islamismo, Tantra, etc.) — empty if not clearly tagged."
    ),
});

export type CurationScore = z.infer<typeof CurationScoreSchema>;

// ---------------------------------------------------------------------------
// System prompt — the curator's persona
// ---------------------------------------------------------------------------

export const CURATION_SYSTEM_PROMPT = `Você é um curador científico especializado em espiritualidade, medicinas tradicionais e saúde integrativa.

Sua função é AVALIAR artigos científicos (já escritos e publicados) para inclusão em uma base de conhecimento sobre Cabala dos Caminhos — uma plataforma que cruza cartas ciganas, astrologia, numerologia cabalística, numerologia tântrica e Odu de Ifá.

Você NÃO inventa artigos. Você NÃO escreve conteúdo novo. Você APENAS pontua artigos reais que já foram coletados de fontes oficiais (PubMed, SciELO, Crossref, arXiv, MAPS, Chacruna, ICEERS).

REGRAS ÉTICAS (não-negociáveis):
1. NUNCA prescreva tratamento. Você é curador, não médico.
2. SEMPRE exija citações verificáveis (DOI, PMID, journal real).
3. NUNCA proselitize. Respeite TODAS as tradições.
4. Marque evidência baixa como baixa (não infle).
5. Em temas psicodélicos (psilocibina, ayahuasca, ibogaína): exija que contraindicações sejam mencionadas.
6. Em medicinas tradicionais: respeite o contexto cultural e a origem. Não extraia saber sem reconhecer a fonte.
7. Em temas sensíveis (saúde mental, traumas, abuso): use linguagem cuidadosa e acolhedora.
8. Se o artigo promete cura, faz propaganda de substância, ou contém afirmações extraordinárias sem evidência: REJECT.

Para cada artigo, retorne JSON estrito com os campos:
- relevance (0-1): relevância para práticas espirituais/medicinais
- evidence (0-1): qualidade metodológica do estudo
- safety (0-1): respeito a disclaimers médicos e segurança
- universalism (0-1): respeito a múltiplas tradições, sem proselitismo
- citations (0-1): presença de referências verificáveis
- recommendation: "ACCEPT" | "REVIEW" | "REJECT"
  - ACCEPT: scores todos >= 0.7
  - REVIEW: algum score entre 0.4 e 0.7 (precisa curador humano)
  - REJECT: algum score < 0.4 ou violação ética clara
- reason: justificativa curta em português
- tradition (opcional): tag de tradição (Candomblé, Umbanda, Budismo, Xamanismo, Tantra, etc.)`;

// ---------------------------------------------------------------------------
// Per-article scoring prompt
// ---------------------------------------------------------------------------

export interface CurationPromptInput {
  title: string;
  authors?: string;
  abstract?: string;
  source: string; // e.g. "pubmed", "scielo", "maps"
  url: string; // canonical URL
  publishedDate?: string; // ISO date
  doi?: string;
  pmid?: string;
}

export function buildCurationUserPrompt(article: CurationPromptInput): string {
  return `Avalie este artigo para a base Cabala dos Caminhos.

FONTE: ${article.source}
TÍTULO: ${article.title}
AUTORES: ${article.authors ?? "—"}
PUBLICADO EM: ${article.publishedDate ?? "—"}
DOI: ${article.doi ?? "—"}
PMID: ${article.pmid ?? "—"}
URL: ${article.url}

RESUMO/ABSTRACT:
${article.abstract ?? "(sem resumo disponível)"}

Responda SOMENTE com JSON válido, sem markdown, sem comentários, no schema especificado.`;
}

// ---------------------------------------------------------------------------
// Score aggregation
// ---------------------------------------------------------------------------

/** Default weights for the aggregate score. Evidence and safety are weighted higher. */
export const SCORE_WEIGHTS = {
  relevance: 0.2,
  evidence: 0.25,
  safety: 0.25,
  universalism: 0.1,
  citations: 0.2,
} as const;

export function aggregateScore(score: CurationScore): number {
  return (
    score.relevance * SCORE_WEIGHTS.relevance +
    score.evidence * SCORE_WEIGHTS.evidence +
    score.safety * SCORE_WEIGHTS.safety +
    score.universalism * SCORE_WEIGHTS.universalism +
    score.citations * SCORE_WEIGHTS.citations
  );
}

/** Acceptance threshold. Below this → REVIEW or REJECT. */
export const ACCEPT_THRESHOLD = 0.7;
export const REVIEW_THRESHOLD = 0.4;

// ---------------------------------------------------------------------------
// Safe JSON parse — LLM can return malformed JSON
// ---------------------------------------------------------------------------

export function safeParseScore(raw: string): CurationScore | null {
  // Strip code fences if present
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    const parsed = JSON.parse(cleaned);
    const result = CurationScoreSchema.safeParse(parsed);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}