/**
 * @akasha/graphrag/seed/corpus — Wave 31.1
 *
 * Knowledge corpus canônico dos 5 Pilares + medicinas ancestrais +
 * 10 discoveries de exemplo. Curado contra:
 *   - R-022 / R-022b (fontes canônicas)
 *   - D-044 (whitelist 15 Odus — Pilar 4)
 *   - lessons N+15 (NÃO inventar correspondência esotérica)
 *   - AKASHA_CORE CORRELATION_MAP (já curado em packages/akasha-core)
 *
 * Este arquivo é a FONTE DE VERDADE do grafo seed. Mudanças devem
 * passar por code review cuidadoso — edges erradas podem propagar
 * para Cadeia Viva (UI Zelador) e minar ADR-013 universalismo.
 *
 * Onde ANCHOR_* apontam para fontes canônicas:
 * - ANCHOR_R022: R-022 "Mapa de Correlações" (curadoria de Zoe Bayat)
 * - ANCHOR_D044: D-044 "15 Odus canônicos Ifá"
 * - ANCHOR_WIKI_ICHING: Wilhelm/Baynes 1950 (I Ching)
 * - ANCHOR_YOGI_BHAJAN: 11 corpos (Pilar 3 Tantra)
 * - ANCHOR_D040: schema/ethics review
 */

import type { KgEdge, KgNode, KgRelation } from "../types";

// ─── Helpers ────────────────────────────────────────────────────────────────

const ANCHOR_R022 = "R-022 Mapa de Correlações";
const ANCHOR_D044 = "D-044 Whitelist 15 Odus";
const ANCHOR_WIKI_ICHING = "Wilhelm/Baynes 1950";
const ANCHOR_YOGI_BHAJAN = "Yogi Bhajan — 11 Corpos";
const ANCHOR_CORRELATION_MAP = "@akasha/core CORRELATION_MAP";

function normalize(name: string): string {
  return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

function node(
  label: KgNode["label"],
  name: string,
  description: string,
  metadata: Record<string, unknown> = {},
  partial: Partial<Pick<KgNode, "id" | "embedding">> = {}
): Omit<KgNode, "createdAt"> {
  return {
    id: partial.id ?? `${label}:${normalize(name)}`,
    label,
    name,
    nameNormalized: normalize(name),
    description,
    metadata,
    embedding: partial.embedding,
  };
}

function edge(
  sourceName: string,
  relation: KgRelation,
  targetName: string,
  sourceLabel: KgNode["label"],
  targetLabel: KgNode["label"],
  weight = 1.0,
  metadata: Record<string, unknown> = {}
): Omit<KgEdge, "createdAt"> {
  const sourceId = `${sourceLabel}:${normalize(sourceName)}`;
  const targetId = `${targetLabel}:${normalize(targetName)}`;
  return {
    id: `${sourceId}|${relation}|${targetId}`,
    sourceId,
    targetId,
    relation,
    weight,
    metadata,
  };
}

// ─── 5 Pilares ──────────────────────────────────────────────────────────────

export const PILARES: Array<Omit<KgNode, "createdAt">> = [
  node("pilar", "Cabala", "Pilar 1 — Numerologia Cabalística, Mispar Hechrachi, Árvore da Vida (10 Sefirot + 22 caminhos).", { anchor: ANCHOR_R022 }),
  node("pilar", "Astrologia", "Pilar 2 — Mapa astral (10 planetas + 12 signos + 12 casas). Swiss Ephemeris via sweph.", { anchor: ANCHOR_R022 }),
  node("pilar", "Tantra", "Pilar 3 — 11 corpos (Yogi Bhajan) + 5 koshas védicas + 4 temperamentos gregos.", { anchor: ANCHOR_YOGI_BHAJAN }),
  node("pilar", "Odu", "Pilar 4 — 15 Odus canônicos (Merindilogun/Ifá). Whitelist D-044. Requer consentimento + terreiro.", { anchor: ANCHOR_D044, requiresConsent: true }),
  node("pilar", "I Ching", "Pilar 5 — 64 hexagramas King Wen. Wilhelm/Baynes 1950.", { anchor: ANCHOR_WIKI_ICHING }),
];

// ─── 15 Odus canônicos (D-044) ──────────────────────────────────────────────

export const ODUS_15: Array<Omit<KgNode, "createdAt">> = [
  "Ogbe", "Obara", "Okana", "Ika", "Oche", "Ofun", "Owonrin",
  "Odi", "Irosun", "Otura", "Otupon", "Ejion", "Ika Otrupon", "Ofun Meji",
].map((name) =>
  node("odu", name, `Odu canônico: ${name}. Pilar 4 (Merindilogun/Ifá). Requer consentimento + terreiro.`, {
    anchor: ANCHOR_D044,
    requiresConsent: true,
    pilar: "Odu",
  })
);

// ─── Hexagramas selecionados (Pilar 5) — MVP subset ────────────────────────

export const HEXAGRAMAS_SEED: Array<Omit<KgNode, "createdAt">> = [
  node("hexagrama", "1", "Qian — O Criativo. Céu. Yang puro. Força criadora.", { anchor: ANCHOR_WIKI_ICHING }),
  node("hexagrama", "2", "Kun — O Receptivo. Terra. Yin puro. Devoção.", { anchor: ANCHOR_WIKI_ICHING }),
  node("hexagrama", "29", "Kan — O Abismal. Água. Perigo. Superação.", { anchor: ANCHOR_WIKI_ICHING }),
  node("hexagrama", "30", "Li — O Aderente. Fogo. Claridade. União.", { anchor: ANCHOR_WIKI_ICHING }),
  node("hexagrama", "63", "Wei Ji — Antes da Conclusão. Água sobre Fogo. Ordem em transição.", { anchor: ANCHOR_WIKI_ICHING }),
  node("hexagrama", "64", "Wei Jing — Antes do Início. Fogo sobre Água. Desordem criadora.", { anchor: ANCHOR_WIKI_ICHING }),
];

// ─── Sefirot (Pilar 1) — 10 canônicas ───────────────────────────────────────

export const SEFIROT_10: Array<Omit<KgNode, "createdAt">> = [
  "Keter", "Chokhmah", "Binah", "Chesed", "Guevurah",
  "Tiferet", "Netzach", "Hod", "Yesod", "Malkhut",
].map((name) =>
  node("sefira", name, `Sefirá: ${name}. Pilar 1 (Árvore da Vida).`, {
    anchor: ANCHOR_R022,
    pilar: "Cabala",
  })
);

// ─── Conceitos cross-pilar (curados, NÃO inventados) ───────────────────────

export const CONCEITOS_SEED: Array<Omit<KgNode, "createdAt">> = [
  node("conceito", "Vazio fértil", "Conceito cross-pilar: estado de receptividade criativa. Citado em Cabala (Binah/Chokhmah), Tantra (Apana), I Ching (Hex 2 Kun).", { anchor: ANCHOR_CORRELATION_MAP }),
  node("conceito", "Merkabah", "Conceito Cabala: carro da visão divina. Corpo de luz. Curado contra misticismo new-age sem fonte.", { anchor: ANCHOR_R022 }),
  node("conceito", "Prana", "Conceito Tantra (Pilar 3): energia vital. Apana/Vyana/Samana.", { anchor: ANCHOR_YOGI_BHAJAN }),
  node("conceito", "Axé", "Conceito Ifá/Pilar 4: força vital. Requer terreiro para interpretação ritual.", { anchor: ANCHOR_D044, requiresConsent: true }),
  node("conceito", "Sincronicidade", "Conceito Junguiano cross-pilar: coincidência significativa. Aplica-se a I Ching + Mandato.", { anchor: "Jung 1952 Sincronicidade" }),
];

// ─── Medicinas ancestrais ───────────────────────────────────────────────────

export const MEDICINAS_SEED: Array<Omit<KgNode, "createdAt">> = [
  node("medicina", "Ayurveda", "Medicina ancestral indiana. 5 elementos + 3 doshas (Vata, Pitta, Kapha).", { anchor: ANCHOR_R022 }),
  node("medicina", "Ifá", "Medicina ancestral yorubá. 15 Odus canônicos. Requer terreiro.", { anchor: ANCHOR_D044, requiresConsent: true }),
  node("medicina", "Santo Daime", "Medicina ancestral brasileira. Mestre Irineu. Linha de União.", { anchor: "Mestre Irineu — doctrine" }),
  node("medicina", "Xamanismo", "Medicina ancestral ameríndia. Tradições diversas. Requer consentimento da tradição.", { anchor: "DIVERSAS — não curado monolítico" }),
];

// ─── Discoveries de exemplo (MVP seed) ──────────────────────────────────────

export const DISCOVERIES_SEED: Array<Omit<KgNode, "createdAt">> = [
  node(
    "discovery",
    "Consulente com Odu 7 (Obará) busca firmeza em ansiedade",
    "Caso Wave 23.2 UI Cadeia Viva. Consulente com Pilar 3 Vata, Saturno Casa 10, Odu 7 Obará. Pede firmeza em momento de ansiedade profissional. Cadeia de pensamento: Vata desregulado → Saturno contração → Obará pacificação. Resolução: práticas de firmeza (Pilar 1 Tiferet) + Pilar 3 corpo 3 (Aceitação).",
    {
      anchor: "Wave 23.2 mock — discovery_riba_2003_001",
      pilar_summary: { p1: "Tiferet", p2: "Saturno Casa 10", p3: "Vata", p4: "Odu 7 Obará", p5: "Hex 29 Kan" },
    }
  ),
  node(
    "discovery",
    "Ayahuasca e personnalité — integração pós-rito",
    "Caso Wave 23.2. Integração de visão com Santo Daime + Pilar 3 Vata. Ancorage em Sincronicidade (Jung) + Hex 30 Li (Aderência).",
    { anchor: "Wave 23.2 mock — paper_riba_2003", paperId: "paper_riba_2003" }
  ),
  node(
    "discovery",
    "Saturno em Casa 10 e responsabilidade profissional",
    "Caso sobre firmeza vocacional. Cross-pilar: Pilar 2 (Saturno) + Pilar 1 (Guevurah/Disciplina) + Pilar 3 (corpo 3 Equilíbrio).",
    { pilar_summary: { p1: "Guevurah", p2: "Saturno Casa 10", p3: "Vata-Pitta" } }
  ),
  node(
    "discovery",
    "Pilar 3 Vata + Odu 7 + I Ching Hex 29",
    "Caso Wave 30.3 exemplo — Cadeia Viva mostra chain-of-thought cross-pilar.",
    { pilar_summary: { p3: "Vata", p4: "Odu 7", p5: "Hex 29 Kan" } }
  ),
  node(
    "discovery",
    "Cabala Sefirot Keter e cessação do sofrimento",
    "Caso Pilar 1 Keter (vontade primeira) + Budismo cessação (cross-tradition, ancorado em R-022).",
    { pilar_summary: { p1: "Keter" } }
  ),
  node(
    "discovery",
    "Tantra corpo 4 (Sistema Nervoso) e ansiedade",
    "Caso Pilar 3 corpo 4 (Yogi Bhajan) — ansiedade como excesso de Prana no sistema nervoso.",
    { pilar_summary: { p3: "corpo 4" } }
  ),
  node(
    "discovery",
    "I Ching Hex 63 e olim de transição",
    "Caso Pilar 5 Hex 63 (Wei Ji — antes da conclusão). Ordem em transição. Cross-ref Pilar 4 Odu 4 (Ika).",
    { pilar_summary: { p5: "Hex 63", p4: "Odu 4" } }
  ),
  node(
    "discovery",
    "Sincronicidade e Mandato do Dia",
    "Caso sobre Mandato do Dia como evento sincronístico. Ancorado em Jung + Hex 30.",
    { pilar_summary: { p5: "Hex 30" } }
  ),
  node(
    "discovery",
    "Ayurveda Vata desregulado e sono",
    "Caso Pilar 3 Ayurveda + Pilar 1 Yesod (sono, fundamento).",
    { pilar_summary: { p1: "Yesod" }, medicina: "Ayurveda" }
  ),
  node(
    "discovery",
    "Ifá Odu 7 firmeza e Obará pacificação",
    "Caso Pilar 4 puro. Odu 7 (Obará) e seu atributo de pacificação. Requer terreiro.",
    { pilar_summary: { p4: "Odu 7" }, requiresConsent: true }
  ),
];

// ─── Edges (relações entre nodes) ──────────────────────────────────────────

export const EDGES_SEED: Array<Omit<KgEdge, "createdAt">> = [
  // 5 Pilares → pilares correlatos (cross-pilar, via CORRELATION_MAP)
  edge("Cabala", "RELACIONA_COM", "I Ching", "pilar", "pilar", 0.8, { anchor: ANCHOR_CORRELATION_MAP }),
  edge("Odu", "RELACIONA_COM", "I Ching", "pilar", "pilar", 0.85, { anchor: ANCHOR_CORRELATION_MAP }),
  edge("Odu", "RELACIONA_COM", "Cabala", "pilar", "pilar", 0.7, { anchor: ANCHOR_CORRELATION_MAP }),
  edge("Tantra", "RELACIONA_COM", "Cabala", "pilar", "pilar", 0.65, { anchor: ANCHOR_CORRELATION_MAP }),
  edge("Astrologia", "RELACIONA_COM", "Tantra", "pilar", "pilar", 0.6, { anchor: ANCHOR_CORRELATION_MAP }),

  // Pilar → label group
  ...ODUS_15.map((o): Omit<KgEdge, "createdAt"> => edge(o.name, "DERIVA_DE", "Odu", "odu", "pilar", 0.95, { anchor: ANCHOR_D044 })),
  ...HEXAGRAMAS_SEED.map((h): Omit<KgEdge, "createdAt"> => edge(h.name, "DERIVA_DE", "I Ching", "hexagrama", "pilar", 0.95, { anchor: ANCHOR_WIKI_ICHING })),
  ...SEFIROT_10.map((s): Omit<KgEdge, "createdAt"> => edge(s.name, "DERIVA_DE", "Cabala", "sefira", "pilar", 0.95, { anchor: ANCHOR_R022 })),
  ...MEDICINAS_SEED.map((m): Omit<KgEdge, "createdAt"> => edge(m.name, "RELACIONA_COM", "Tantra", "medicina", "pilar", 0.5, { anchor: ANCHOR_R022 })),

  // Sefirot → vizinhos (Árvore da Vida — 22 caminhos simplificado para 4 essenciais)
  edge("Keter", "RELACIONA_COM", "Chokhmah", "sefira", "sefira", 1.0, { anchor: ANCHOR_R022 }),
  edge("Chokhmah", "RELACIONA_COM", "Binah", "sefira", "sefira", 1.0, { anchor: ANCHOR_R022 }),
  edge("Chesed", "RELACIONA_COM", "Guevurah", "sefira", "sefira", 1.0, { anchor: ANCHOR_R022 }),
  edge("Guevurah", "RELACIONA_COM", "Tiferet", "sefira", "sefira", 1.0, { anchor: ANCHOR_R022 }),
  edge("Tiferet", "RELACIONA_COM", "Yesod", "sefira", "sefira", 1.0, { anchor: ANCHOR_R022 }),
  edge("Yesod", "RELACIONA_COM", "Malkhut", "sefira", "sefira", 1.0, { anchor: ANCHOR_R022 }),

  // Odu ↔ Hexagrama (correspondências CORRELATION_MAP)
  edge("Ogbe", "RELACIONA_COM", "1", "odu", "hexagrama", 0.9, { anchor: ANCHOR_CORRELATION_MAP }),
  edge("Obara", "RELACIONA_COM", "2", "odu", "hexagrama", 0.85, { anchor: ANCHOR_CORRELATION_MAP }),
  edge("Otura", "RELACIONA_COM", "29", "odu", "hexagrama", 0.8, { anchor: ANCHOR_CORRELATION_MAP }),
  edge("Owonrin", "RELACIONA_COM", "30", "odu", "hexagrama", 0.8, { anchor: ANCHOR_CORRELATION_MAP }),
  edge("Ika Otrupon", "RELACIONA_COM", "63", "odu", "hexagrama", 0.75, { anchor: ANCHOR_CORRELATION_MAP }),
  edge("Ofun Meji", "RELACIONA_COM", "64", "odu", "hexagrama", 0.75, { anchor: ANCHOR_CORRELATION_MAP }),

  // Odu ↔ Sefira (curated subset)
  edge("Ogbe", "RELACIONA_COM", "Keter", "odu", "sefira", 0.85, { anchor: ANCHOR_CORRELATION_MAP }),
  edge("Obara", "RELACIONA_COM", "Chokhmah", "odu", "sefira", 0.85, { anchor: ANCHOR_CORRELATION_MAP }),
  edge("Owonrin", "RELACIONA_COM", "Tiferet", "odu", "sefira", 0.8, { anchor: ANCHOR_CORRELATION_MAP }),

  // Conceitos cross-pilar
  edge("Vazio fértil", "EXPLICA", "Keter", "conceito", "sefira", 0.7, { anchor: ANCHOR_R022 }),
  edge("Vazio fértil", "EXPLICA", "Binah", "conceito", "sefira", 0.7, { anchor: ANCHOR_R022 }),
  edge("Prana", "DERIVA_DE", "Tantra", "conceito", "pilar", 0.95, { anchor: ANCHOR_YOGI_BHAJAN }),
  edge("Axé", "DERIVA_DE", "Ifá", "conceito", "medicina", 0.95, { anchor: ANCHOR_D044 }),
  edge("Sincronicidade", "RELACIONA_COM", "I Ching", "conceito", "pilar", 0.6, { anchor: "Jung 1952" }),

  // Discoveries → Pilares / nodes
  edge(
    "Consulente com Odu 7 (Obará) busca firmeza em ansiedade",
    "TEM_PILAR",
    "Obara",
    "discovery",
    "odu",
    1.0,
    { anchor: "Wave 23.2 mock" }
  ),
  edge(
    "Consulente com Odu 7 (Obará) busca firmeza em ansiedade",
    "TEM_PILAR",
    "Tiferet",
    "discovery",
    "sefira",
    0.9
  ),
  edge(
    "Consulente com Odu 7 (Obará) busca firmeza em ansiedade",
    "TEM_PILAR",
    "29",
    "discovery",
    "hexagrama",
    0.8
  ),
  edge(
    "Ayahuasca e personnalité — integração pós-rito",
    "TEM_PILAR",
    "Santo Daime",
    "discovery",
    "medicina",
    0.95
  ),
  edge(
    "Ayahuasca e personnalité — integração pós-rito",
    "RELACIONA_COM",
    "Sincronicidade",
    "discovery",
    "conceito",
    0.7
  ),
  edge(
    "Saturno em Casa 10 e responsabilidade profissional",
    "TEM_PILAR",
    "Guevurah",
    "discovery",
    "sefira",
    0.85
  ),
  edge(
    "Pilar 3 Vata + Odu 7 + I Ching Hex 29",
    "TEM_PILAR",
    "Obara",
    "discovery",
    "odu",
    0.95
  ),
  edge(
    "Pilar 3 Vata + Odu 7 + I Ching Hex 29",
    "TEM_PILAR",
    "29",
    "discovery",
    "hexagrama",
    0.95
  ),
  edge(
    "Cabala Sefirot Keter e cessação do sofrimento",
    "TEM_PILAR",
    "Keter",
    "discovery",
    "sefira",
    0.95
  ),
  edge(
    "Tantra corpo 4 (Sistema Nervoso) e ansiedade",
    "RELACIONA_COM",
    "Prana",
    "discovery",
    "conceito",
    0.8
  ),
  edge(
    "I Ching Hex 63 e olim de transição",
    "TEM_PILAR",
    "63",
    "discovery",
    "hexagrama",
    0.95
  ),
  edge(
    "I Ching Hex 63 e olim de transição",
    "TEM_PILAR",
    "Ika",
    "discovery",
    "odu",
    0.7
  ),
  edge(
    "Sincronicidade e Mandato do Dia",
    "RELACIONA_COM",
    "Sincronicidade",
    "discovery",
    "conceito",
    0.95
  ),
  edge(
    "Sincronicidade e Mandato do Dia",
    "TEM_PILAR",
    "30",
    "discovery",
    "hexagrama",
    0.6
  ),
  edge(
    "Ayurveda Vata desregulado e sono",
    "TEM_PILAR",
    "Ayurveda",
    "discovery",
    "medicina",
    0.95
  ),
  edge(
    "Ayurveda Vata desregulado e sono",
    "TEM_PILAR",
    "Yesod",
    "discovery",
    "sefira",
    0.7
  ),
  edge(
    "Ifá Odu 7 firmeza e Obará pacificação",
    "TEM_PILAR",
    "Obara",
    "discovery",
    "odu",
    0.95
  ),
  edge(
    "Ifá Odu 7 firmeza e Obará pacificação",
    "DERIVA_DE",
    "Ifá",
    "discovery",
    "medicina",
    0.95
  ),
  // Cross-discovery similarity (KG-driven relatedness)
  edge(
    "Consulente com Odu 7 (Obará) busca firmeza em ansiedade",
    "RELACIONA_COM",
    "Pilar 3 Vata + Odu 7 + I Ching Hex 29",
    "discovery",
    "discovery",
    0.85
  ),
  edge(
    "Consulente com Odu 7 (Obará) busca firmeza em ansiedade",
    "RELACIONA_COM",
    "Ifá Odu 7 firmeza e Obará pacificação",
    "discovery",
    "discovery",
    0.9
  ),
  edge(
    "Pilar 3 Vata + Odu 7 + I Ching Hex 29",
    "RELACIONA_COM",
    "Ifá Odu 7 firmeza e Obará pacificação",
    "discovery",
    "discovery",
    0.95
  ),
  edge(
    "Ayahuasca e personnalité — integração pós-rito",
    "RELACIONA_COM",
    "Sincronicidade e Mandato do Dia",
    "discovery",
    "discovery",
    0.7
  ),
  edge(
    "Cabala Sefirot Keter e cessação do sofrimento",
    "RELACIONA_COM",
    "Ayurveda Vata desregulado e sono",
    "discovery",
    "discovery",
    0.6
  ),
  edge(
    "I Ching Hex 63 e olim de transição",
    "RELACIONA_COM",
    "Saturno em Casa 10 e responsabilidade profissional",
    "discovery",
    "discovery",
    0.65
  ),
];
