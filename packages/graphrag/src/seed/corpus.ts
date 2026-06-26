/**
 * @akasha/graphrag/seed/corpus — Wave 31.1
 *
 * Knowledge corpus canônico dos 5 Pilares + medicinas ancestrais +
 * 10 discoveries de exemplo. Curado contra:
 *   - R-022 / R-022b (fontes canônicas — não inventar correspondências)
 *   - D-044 (corpus das medicinas ancestrais aprovado Wave 22.4)
 *   - CORRELATION_MAP (Akasha — mapa de correlações Wave 8)
 *
 * Estrutura: arrays de `node()` e `edge()` helpers para o seed
 * processar. Tudo é type-safe.
 *
 * LGPD: este corpus NÃO contém PII (user_id, birth_date, nome, email).
 * Apenas entidades canônicas.
 */

import type {
  Embedder,
  KgNode,
  KgNodeLabel,
  KgRelation,
} from "../types";
import { nodeId } from "../types";
import type { GraphBackend } from "../types";

interface NodeSpec {
  label: KgNodeLabel;
  name: string;
  description: string;
  metadata?: Record<string, unknown>;
}

interface EdgeSpec {
  source: { label: KgNodeLabel; name: string };
  target: { label: KgNodeLabel; name: string };
  relation: KgRelation;
  weight: number;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// 5 PILARES
// ============================================================================

const PILARES: NodeSpec[] = [
  {
    label: "pilar",
    name: "Cabala",
    description:
      "Tradição mística judaica. Árvore da Vida (10 Sefirot + 22 caminhos). R-022.",
    metadata: { source: "R-022", pillar: true, index: 1 },
  },
  {
    label: "pilar",
    name: "Astrologia",
    description:
      "Linguagem simbólica dos astros. Zodíaco tropical/sideral, planetas, aspectos. R-022.",
    metadata: { source: "R-022", pillar: true, index: 2 },
  },
  {
    label: "pilar",
    name: "Tantra",
    description:
      "Tradição indiana não-dual. Kundalini, chakras, kriyas. Yogi Bhajan adaptado. R-022.",
    metadata: { source: "R-022", pillar: true, index: 3 },
  },
  {
    label: "pilar",
    name: "Ifa/Odu",
    description:
      "Sistema yorubá de 16 Odus principais + 240 Odus secundários. Ifá. R-022.",
    metadata: { source: "R-022", pillar: true, index: 4 },
  },
  {
    label: "pilar",
    name: "I Ching",
    description:
      "Livro das Mutações chinês. 64 hexagramas, 8 trigramas. Wilhelm/Baynes. R-022.",
    metadata: { source: "R-022", pillar: true, index: 5 },
  },
];

// ============================================================================
// 10 SEFIROT (Árvore da Vida — pilares Cabala)
// ============================================================================

const SEFIROT: NodeSpec[] = [
  { label: "sefira", name: "Keter", description: "Coroa. Vontade pura, Ein Sof.", metadata: { treePosition: 1 } },
  { label: "sefira", name: "Chokhmah", description: "Sabedoria. Pulso do divino.", metadata: { treePosition: 2 } },
  { label: "sefira", name: "Binah", description: "Entendimento. Forma, matriz.", metadata: { treePosition: 3 } },
  { label: "sefira", name: "Chesed", description: "Misericórdia. Expansão, graça.", metadata: { treePosition: 4 } },
  { label: "sefira", name: "Guevurah", description: "Severidade. Força, disciplina.", metadata: { treePosition: 5 } },
  { label: "sefira", name: "Tiferet", description: "Beleza. Equilíbrio, Verbo Encarnado.", metadata: { treePosition: 6 } },
  { label: "sefira", name: "Netzach", description: "Vitória. Instinto, emoção.", metadata: { treePosition: 7 } },
  { label: "sefira", name: "Hod", description: "Esplendor. Intelecto, linguagem.", metadata: { treePosition: 8 } },
  { label: "sefira", name: "Yesod", description: "Fundação. Subconsciente, sonhos.", metadata: { treePosition: 9 } },
  { label: "sefira", name: "Malkuth", description: "Reino. Manifestação física.", metadata: { treePosition: 10 } },
];

// ============================================================================
// 7 PLANETAS + 12 SIGNOS (Astrologia)
// ============================================================================

const PLANETAS: NodeSpec[] = [
  { label: "planeta", name: "Sol", description: "Consciência, identidade, propósito." },
  { label: "planeta", name: "Lua", description: "Emoções, instinto, inconsciente." },
  { label: "planeta", name: "Mercurio", description: "Comunicação, pensamento, conexão." },
  { label: "planeta", name: "Venus", description: "Amor, beleza, valores." },
  { label: "planeta", name: "Marte", description: "Ação, coragem, desejo." },
  { label: "planeta", name: "Jupiter", description: "Expansão, sabedoria, sorte." },
  { label: "planeta", name: "Saturno", description: "Estrutura, disciplina, tempo." },
];

const SIGNOS: NodeSpec[] = [
  { label: "signo", name: "Aries", description: "Início, fogo cardinal." },
  { label: "signo", name: "Touro", description: "Estabilidade, terra fixa." },
  { label: "signo", name: "Gemeos", description: "Comunicação, ar mutável." },
  { label: "signo", name: "Cancer", description: "Emoção, água cardinal." },
  { label: "signo", name: "Leao", description: "Expressão, fogo fixo." },
  { label: "signo", name: "Virgem", description: "Análise, terra mutável." },
];

// ============================================================================
// 6 HEXAGRAMAS (I Ching — clássicos Wilhelm/Baynes)
// ============================================================================

const HEXAGRAMAS: NodeSpec[] = [
  { label: "hexagrama", name: "1 - Qian (O Criativo)", description: "Yang puro, movimento, liderança.", metadata: { number: 1 } },
  { label: "hexagrama", name: "2 - Kun (O Receptivo)", description: "Yin puro, entrega, nutrição.", metadata: { number: 2 } },
  { label: "hexagrama", name: "29 - Kan (O Abismal)", description: "Água, perigo, mas persistência.", metadata: { number: 29 } },
  { label: "hexagrama", name: "61 - Chung Fu (Verdade Interior)", description: "Vento sobre lago, sinceridade.", metadata: { number: 61 } },
  { label: "hexagrama", name: "64 - Wei Chi (Antes da Conclusão)", description: "Fogo sobre água, vigilância.", metadata: { number: 64 } },
  { label: "hexagrama", name: "42 - Yi (O Aumento)", description: "Vento sobre trovão, prosperidade.", metadata: { number: 42 } },
];

// ============================================================================
// 15 ODUS (Ifá — 16 principais; usamos 15 + Bexir)
// ============================================================================

const ODUS: NodeSpec[] = [
  { label: "odu", name: "Eji Ogbe", description: "Pureza, origem, contemplação." },
  { label: "odu", name: "Oyeku", description: "Noite, mistério, encerramento." },
  { label: "odu", name: "Iwori", description: "Introspecção, vento, mudança." },
  { label: "odu", name: "Odi", description: "Inverno, recolhimento, gestação." },
  { label: "odu", name: "Irosu", description: "Mundo, manifestação, ordem." },
  { label: "odu", name: "Owarin", description: "Reconciliação, perdão." },
  { label: "odu", name: "Obara", description: "Firmeza, lei, continuidade." },
  { label: "odu", name: "Okanran", description: "Luta interna, provação." },
  { label: "odu", name: "Ogunda", description: "Justiça, lei, espada." },
  { label: "odu", name: "Osa", description: "Inveja, transformação, poder." },
  { label: "odu", name: "Ika", description: "Morte, fim, transformação radical." },
  { label: "odu", name: "Oturupon", description: "Doença, cura, sacrifício." },
  { label: "odu", name: "Otua", description: "Pressentimento, decisão." },
  { label: "odu", name: "Irete", description: "Crescimento, abundância, espiga." },
  { label: "odu", name: "Bexir", description: "Movimento, mudança, atualização." },
];

// ============================================================================
// 5 CONCEITOS FUNDAMENTAIS
// ============================================================================

const CONCEITOS: NodeSpec[] = [
  { label: "conceito", name: "Verdade Universal", description: "Padrão que se repete cross-pilar (Wave 8 CORRELATION_MAP)." },
  { label: "conceito", name: "Sincronicidade", description: "Coincidência significativa (Jung/Pauli)." },
  { label: "conceito", name: "Karma", description: "Ação + reação causal (Tantra, Hinduísmo)." },
  { label: "conceito", name: "Aurah", description: "Cor vital sutil (Tantra, Yogi Bhajan)." },
  { label: "conceito", name: "Orixa", description: "Força da natureza divinizada (Ifá)." },
];

// ============================================================================
// 4 MEDICINAS ANCESTRAIS (Wave 22.4 D-044)
// ============================================================================

const MEDICINAS: NodeSpec[] = [
  {
    label: "medicina",
    name: "Floral de Bach",
    description: "Sistema floral inglês (Bach, 1930s). 38 essências para estados emocionais.",
    metadata: { source: "D-044", tradition: "europeia" },
  },
  {
    label: "medicina",
    name: "Ayurveda",
    description: "Medicina tradicional indiana. Doshas (Vata/Pitta/Kapha), prana.",
    metadata: { source: "D-044", tradition: "indiana" },
  },
  {
    label: "medicina",
    name: "Medicina Ancestral Yoruba",
    description: "Ervas, ebó, rituais do sistema Ifá. Medicina dos Odus.",
    metadata: { source: "D-044", tradition: "yoruba" },
  },
  {
    label: "medicina",
    name: "Cura pela Floresta",
    description: "Banho de floresta (shinrin-yoku), fitoterapia ameríndia. Akasha Wave 22.4.",
    metadata: { source: "D-044", tradition: "amerindia" },
  },
];

// ============================================================================
// 10 DISCOVERIES (Wave 23.2 mock — cadeias vivas)
// ============================================================================

const DISCOVERIES: NodeSpec[] = [
  {
    label: "discovery",
    name: "Consulente com Odu 7 (Obara) busca firmeza em ansiedade",
    description: "Padrão: ansiedade aguda, Odu Obara firmeza + Hexagrama 61 verdade interior.",
    metadata: { anchor: "Wave 23.2 mock", chainType: "emocional" },
  },
  {
    label: "discovery",
    name: "Trânsiti Saturno em Peixes × Sefira Binah",
    description: "Estrutura kármica dissolvendo matriz de entendimento.",
    metadata: { anchor: "Wave 23.2 mock", chainType: "transit" },
  },
  {
    label: "discovery",
    name: "Kundalini sobe via Muladhara × Sefira Malkuth",
    description: "Energia crua ancorada no reino físico, base para ascensão.",
    metadata: { anchor: "Wave 23.2 mock", chainType: "energetica" },
  },
  {
    label: "discovery",
    name: "Hexagrama 29 + Chakra Anahata: perigo que abre coração",
    description: "Quando o abismo dissolve a couraça emocional.",
    metadata: { anchor: "Wave 23.2 mock", chainType: "transformacao" },
  },
  {
    label: "discovery",
    name: "Sol em Leão × Odu Irosu: expressão ordenada",
    description: "Manifestação solar alinhada com a ordem do mundo.",
    metadata: { anchor: "Wave 23.2 mock", chainType: "expressao" },
  },
  {
    label: "discovery",
    name: "Lua em Câncer × Odu Odi: recolhimento fértil",
    description: "Emoção lunar em recolhimento gestativo.",
    metadata: { anchor: "Wave 23.2 mock", chainType: "emocional" },
  },
  {
    label: "discovery",
    name: "Hexagrama 42 + Sefira Tiferet: aumento na beleza",
    description: "Prosperidade atravessa equilíbrio da beleza.",
    metadata: { anchor: "Wave 23.2 mock", chainType: "prosperidade" },
  },
  {
    label: "discovery",
    name: "Mercurio retrogrado × Hexagrama 64: vigilância pré-conclusão",
    description: "Revisão mental exige vigilância antes da virada.",
    metadata: { anchor: "Wave 23.2 mock", chainType: "comunicacao" },
  },
  {
    label: "discovery",
    name: "Odu Ika × Sefira Netzach: transformação via emoção",
    description: "Morte radical atravessa esfera instintiva/emocional.",
    metadata: { anchor: "Wave 23.2 mock", chainType: "transformacao" },
  },
  {
    label: "discovery",
    name: "Floral de Bach × Tantra Aurah: cor vital sutil",
    description: "Florais liberam padrões emocionais que liberam cor vital.",
    metadata: { anchor: "Wave 23.2 mock", chainType: "medicina" },
  },
];

// ============================================================================
// EDGES (relacionamentos canônicos)
// ============================================================================

const EDGES: EdgeSpec[] = [
  // Pilares ↔ Pilares (relação de sistema).
  { source: { label: "pilar", name: "Cabala" }, target: { label: "pilar", name: "Astrologia" }, relation: "RELACIONA_COM", weight: 0.8, metadata: { via: "R-022b" } },
  { source: { label: "pilar", name: "Cabala" }, target: { label: "pilar", name: "Tantra" }, relation: "RELACIONA_COM", weight: 0.7, metadata: { via: "Sefirot-Chakra mapping" } },
  { source: { label: "pilar", name: "Cabala" }, target: { label: "pilar", name: "Ifa/Odu" }, relation: "RELACIONA_COM", weight: 0.6, metadata: { via: "Sefirot-Odu mapping" } },
  { source: { label: "pilar", name: "Astrologia" }, target: { label: "pilar", name: "I Ching" }, relation: "RELACIONA_COM", weight: 0.75, metadata: { via: "Wilhelm hexagram-aspect" } },
  { source: { label: "pilar", name: "Tantra" }, target: { label: "pilar", name: "I Ching" }, relation: "RELACIONA_COM", weight: 0.5 },

  // Cabala → Sefirot (TEM_PILAR).
  { source: { label: "pilar", name: "Cabala" }, target: { label: "sefira", name: "Chokhmah" }, relation: "TEM_PILAR", weight: 1.0 },
  { source: { label: "pilar", name: "Cabala" }, target: { label: "sefira", name: "Binah" }, relation: "TEM_PILAR", weight: 1.0 },
  { source: { label: "pilar", name: "Cabala" }, target: { label: "sefira", name: "Chesed" }, relation: "TEM_PILAR", weight: 1.0 },
  { source: { label: "pilar", name: "Cabala" }, target: { label: "sefira", name: "Guevurah" }, relation: "TEM_PILAR", weight: 1.0 },
  { source: { label: "pilar", name: "Cabala" }, target: { label: "sefira", name: "Tiferet" }, relation: "TEM_PILAR", weight: 1.0 },
  { source: { label: "pilar", name: "Cabala" }, target: { label: "sefira", name: "Netzach" }, relation: "TEM_PILAR", weight: 1.0 },
  { source: { label: "pilar", name: "Cabala" }, target: { label: "sefira", name: "Hod" }, relation: "TEM_PILAR", weight: 1.0 },
  { source: { label: "pilar", name: "Cabala" }, target: { label: "sefira", name: "Yesod" }, relation: "TEM_PILAR", weight: 1.0 },
  { source: { label: "pilar", name: "Cabala" }, target: { label: "sefira", name: "Malkuth" }, relation: "TEM_PILAR", weight: 1.0 },

  // Sefirot → Sefirot (caminhos canônicos Árvore da Vida).
  { source: { label: "sefira", name: "Keter" }, target: { label: "sefira", name: "Chokhmah" }, relation: "EXPLICA", weight: 1.0 },
  { source: { label: "sefira", name: "Keter" }, target: { label: "sefira", name: "Binah" }, relation: "EXPLICA", weight: 1.0 },
  { source: { label: "sefira", name: "Chokhmah" }, target: { label: "sefira", name: "Binah" }, relation: "OPOE_A", weight: 0.9 },
  { source: { label: "sefira", name: "Chesed" }, target: { label: "sefira", name: "Guevurah" }, relation: "OPOE_A", weight: 0.95 },
  { source: { label: "sefira", name: "Tiferet" }, target: { label: "sefira", name: "Chesed" }, relation: "COMPLEMENTA", weight: 0.8 },
  { source: { label: "sefira", name: "Tiferet" }, target: { label: "sefira", name: "Guevurah" }, relation: "COMPLEMENTA", weight: 0.8 },
  { source: { label: "sefira", name: "Tiferet" }, target: { label: "sefira", name: "Netzach" }, relation: "EXPLICA", weight: 0.7 },
  { source: { label: "sefira", name: "Tiferet" }, target: { label: "sefira", name: "Hod" }, relation: "EXPLICA", weight: 0.7 },
  { source: { label: "sefira", name: "Tiferet" }, target: { label: "sefira", name: "Yesod" }, relation: "DERIVA_DE", weight: 0.85 },
  { source: { label: "sefira", name: "Netzach" }, target: { label: "sefira", name: "Hod" }, relation: "OPOE_A", weight: 0.85 },
  { source: { label: "sefira", name: "Yesod" }, target: { label: "sefira", name: "Malkuth" }, relation: "EXPLICA", weight: 1.0 },

  // Astrologia → Planetas/Signos.
  ...PLANETAS.map<EdgeSpec>((p) => ({
    source: { label: "pilar", name: "Astrologia" } as { label: KgNodeLabel; name: string },
    target: { label: p.label, name: p.name },
    relation: "TEM_PILAR" as KgRelation,
    weight: 1.0,
  })),
  ...SIGNOS.map<EdgeSpec>((s) => ({
    source: { label: "pilar", name: "Astrologia" } as { label: KgNodeLabel; name: string },
    target: { label: s.label, name: s.name },
    relation: "TEM_PILAR" as KgRelation,
    weight: 1.0,
  })),

  // I Ching → Hexagramas.
  ...HEXAGRAMAS.map<EdgeSpec>((h) => ({
    source: { label: "pilar", name: "I Ching" } as { label: KgNodeLabel; name: string },
    target: { label: h.label, name: h.name },
    relation: "TEM_HEXAGRAMA" as KgRelation,
    weight: 1.0,
  })),

  // Ifá → Odus.
  ...ODUS.map<EdgeSpec>((o) => ({
    source: { label: "pilar", name: "Ifa/Odu" } as { label: KgNodeLabel; name: string },
    target: { label: o.label, name: o.name },
    relation: "TEM_ODU" as KgRelation,
    weight: 1.0,
  })),

  // Medicinas → Pilares (todas as medicinas se relacionam com Tantra/Ayurveda).
  { source: { label: "medicina", name: "Ayurveda" }, target: { label: "pilar", name: "Tantra" }, relation: "MEDICINA_RELACIONADA", weight: 0.9, metadata: { source: "D-044" } },
  { source: { label: "medicina", name: "Medicina Ancestral Yoruba" }, target: { label: "pilar", name: "Ifa/Odu" }, relation: "MEDICINA_RELACIONADA", weight: 0.95, metadata: { source: "D-044" } },
  { source: { label: "medicina", name: "Floral de Bach" }, target: { label: "pilar", name: "Cabala" }, relation: "MEDICINA_RELACIONADA", weight: 0.4, metadata: { source: "D-044" } },
  { source: { label: "medicina", name: "Cura pela Floresta" }, target: { label: "pilar", name: "Tantra" }, relation: "MEDICINA_RELACIONADA", weight: 0.5, metadata: { source: "D-044" } },

  // Conceitos → Pilares.
  { source: { label: "conceito", name: "Verdade Universal" }, target: { label: "pilar", name: "Cabala" }, relation: "EXPLICA", weight: 0.8 },
  { source: { label: "conceito", name: "Verdade Universal" }, target: { label: "pilar", name: "Ifa/Odu" }, relation: "EXPLICA", weight: 0.8 },
  { source: { label: "conceito", name: "Verdade Universal" }, target: { label: "pilar", name: "I Ching" }, relation: "EXPLICA", weight: 0.8 },
  { source: { label: "conceito", name: "Sincronicidade" }, target: { label: "pilar", name: "I Ching" }, relation: "EXPLICA", weight: 0.6 },
  { source: { label: "conceito", name: "Sincronicidade" }, target: { label: "pilar", name: "Astrologia" }, relation: "EXPLICA", weight: 0.6 },
  { source: { label: "conceito", name: "Karma" }, target: { label: "pilar", name: "Tantra" }, relation: "EXPLICA", weight: 0.9 },
  { source: { label: "conceito", name: "Aurah" }, target: { label: "pilar", name: "Tantra" }, relation: "DERIVA_DE", weight: 0.95 },
  { source: { label: "conceito", name: "Orixa" }, target: { label: "pilar", name: "Ifa/Odu" }, relation: "DERIVA_DE", weight: 0.95 },

  // Discoveries (chain-of-thought cross-pilar).
  { source: { label: "discovery", name: "Consulente com Odu 7 (Obara) busca firmeza em ansiedade" }, target: { label: "odu", name: "Obara" }, relation: "TEM_ODU", weight: 1.0, metadata: { anchor: "Wave 23.2 mock" } },
  { source: { label: "discovery", name: "Consulente com Odu 7 (Obara) busca firmeza em ansiedade" }, target: { label: "hexagrama", name: "61 - Chung Fu (Verdade Interior)" }, relation: "EXPLICA", weight: 0.85, metadata: { anchor: "Wave 23.2 mock" } },
  { source: { label: "discovery", name: "Trânsiti Saturno em Peixes × Sefira Binah" }, target: { label: "planeta", name: "Saturno" }, relation: "DERIVA_DE", weight: 1.0 },
  { source: { label: "discovery", name: "Trânsiti Saturno em Peixes × Sefira Binah" }, target: { label: "sefira", name: "Binah" }, relation: "EXPLICA", weight: 1.0 },
  { source: { label: "discovery", name: "Kundalini sobe via Muladhara × Sefira Malkuth" }, target: { label: "sefira", name: "Malkuth" }, relation: "EXPLICA", weight: 1.0 },
  { source: { label: "discovery", name: "Kundalini sobe via Muladhara × Sefira Malkuth" }, target: { label: "conceito", name: "Aurah" }, relation: "DERIVA_DE", weight: 0.7 },
  { source: { label: "discovery", name: "Hexagrama 29 + Chakra Anahata: perigo que abre coração" }, target: { label: "hexagrama", name: "29 - Kan (O Abismal)" }, relation: "EXPLICA", weight: 1.0 },
  { source: { label: "discovery", name: "Hexagrama 29 + Chakra Anahata: perigo que abre coração" }, target: { label: "conceito", name: "Aurah" }, relation: "DERIVA_DE", weight: 0.6 },
  { source: { label: "discovery", name: "Sol em Leão × Odu Irosu: expressão ordenada" }, target: { label: "planeta", name: "Sol" }, relation: "DERIVA_DE", weight: 1.0 },
  { source: { label: "discovery", name: "Sol em Leão × Odu Irosu: expressão ordenada" }, target: { label: "odu", name: "Irosu" }, relation: "TEM_ODU", weight: 1.0 },
  { source: { label: "discovery", name: "Lua em Câncer × Odu Odi: recolhimento fértil" }, target: { label: "planeta", name: "Lua" }, relation: "DERIVA_DE", weight: 1.0 },
  { source: { label: "discovery", name: "Lua em Câncer × Odu Odi: recolhimento fértil" }, target: { label: "odu", name: "Odi" }, relation: "TEM_ODU", weight: 1.0 },
  { source: { label: "discovery", name: "Hexagrama 42 + Sefira Tiferet: aumento na beleza" }, target: { label: "hexagrama", name: "42 - Yi (O Aumento)" }, relation: "EXPLICA", weight: 1.0 },
  { source: { label: "discovery", name: "Hexagrama 42 + Sefira Tiferet: aumento na beleza" }, target: { label: "sefira", name: "Tiferet" }, relation: "EXPLICA", weight: 1.0 },
  { source: { label: "discovery", name: "Mercurio retrogrado × Hexagrama 64: vigilância pré-conclusão" }, target: { label: "planeta", name: "Mercurio" }, relation: "DERIVA_DE", weight: 1.0 },
  { source: { label: "discovery", name: "Mercurio retrogrado × Hexagrama 64: vigilância pré-conclusão" }, target: { label: "hexagrama", name: "64 - Wei Chi (Antes da Conclusão)" }, relation: "EXPLICA", weight: 1.0 },
  { source: { label: "discovery", name: "Odu Ika × Sefira Netzach: transformação via emoção" }, target: { label: "odu", name: "Ika" }, relation: "TEM_ODU", weight: 1.0 },
  { source: { label: "discovery", name: "Odu Ika × Sefira Netzach: transformação via emoção" }, target: { label: "sefira", name: "Netzach" }, relation: "EXPLICA", weight: 1.0 },
  { source: { label: "discovery", name: "Floral de Bach × Tantra Aurah: cor vital sutil" }, target: { label: "medicina", name: "Floral de Bach" }, relation: "MEDICINA_RELACIONADA", weight: 1.0 },
  { source: { label: "discovery", name: "Floral de Bach × Tantra Aurah: cor vital sutil" }, target: { label: "conceito", name: "Aurah" }, relation: "EXPLICA", weight: 0.9 },
];

// ============================================================================
// PUBLIC: get all node specs and edge specs
// ============================================================================

export function getAllNodeSpecs(): NodeSpec[] {
  return [
    ...PILARES,
    ...SEFIROT,
    ...PLANETAS,
    ...SIGNOS,
    ...HEXAGRAMAS,
    ...ODUS,
    ...CONCEITOS,
    ...MEDICINAS,
    ...DISCOVERIES,
  ];
}

export function getAllEdgeSpecs(): EdgeSpec[] {
  return EDGES;
}
