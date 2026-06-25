/**
 * discoveries/adapter.ts — Wave 23.2
 *
 * Adapter que converte uma `DiscoveryChain` do DB (Wave 20.2 schema) +
 * `LiteratureCitation` (Wave 21.1) + retrieval Wave 20.2 em um
 * `ThoughtChainViewModel` consumível pela UI.
 *
 * Estratégia Wave 23.2:
 *   - Quando Wave 20.2 / 21.1 / 21.2 estiverem mergeados no main, este
 *     adapter faz a query real via `prisma.discoveryChain.findUnique`
 *     + joins.
 *   - ATÉ LÁ (estado atual — schemas ainda em migration separada), o
 *     adapter devolve um mock determinístico derivado do `discoveryId`.
 *     Isso mantém a UI útil para dev/Zelador preview, sem quebrar
 *     typecheck (não importamos modelos Prisma inexistentes).
 *
 * A flag de detecção é uma constante — não dinâmica — para evitar
 * cost de runtime check em cada request.
 */

import type {
  ThoughtChainPaper,
  ThoughtChainRelatedDiscovery,
  ThoughtChainViewModel,
} from '@/components/akasha/discoveries/shared';

// ─── Toggle de implementação ────────────────────────────────────────────────
//
// `false` = usar MOCK_FALLBACK abaixo (Wave 23.2 atual, sem schema
//           DiscoveryChain/LiteratureCitation mergeado no main).
// `true`  = usar Prisma real (depois que Wave 20.2/21.1/21.2 mergearem).
//
// Quando virar `true`, basta:
//   1. Implementar `loadFromDatabase()` abaixo (queries reais).
//   2. Trocar a constante `USE_REAL_DB` para `true`.
//   3. Adicionar tests de integração com mock Prisma.
//
// Por enquanto: MOCK determinístico — sempre devolve dados plausíveis
// pro mesmo discoveryId, pra UI não quebrar em dev/preview.

const USE_REAL_DB = false;

// ─── MOCK determinístico (Wave 23.2 — atual) ────────────────────────────────

/**
 * Hash determinístico de string → número 0..1. Usado pra mock estável
 * baseado em discoveryId (mesmo id sempre devolve mesmo model).
 */
function stableHash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 0xffffffff;
}

/**
 * Pick determinístico baseado no id + slot.
 * Retorna elemento do array baseado em hash(id + slot).
 */
function pickFromId<T>(id: string, slot: number, items: T[]): T {
  const h = stableHash(`${id}:${slot}`);
  const idx = Math.floor(h * items.length) % items.length;
  return items[idx]!;
}

const MOCK_PAPERS: ThoughtChainPaper[] = [
  {
    id: 'paper_riba_2003',
    title: 'Ayahuasca pharmacology and personality profiles',
    authors: ['Riba J.', 'Rodriguez-Fornells A.', 'et al'],
    year: 2003,
    journal: 'J. Psychopharmacology',
    doi: '10.1177/0269881103170500',
    abstractEn:
      'Ayahuasca is a South American hallucinogenic brew traditionally used for divinative and religious purposes. The present study investigated the acute and subacute psychological effects of ayahuasca in a double-blind, placebo-controlled study.',
    abstractPtBr: null,
    fullTextUrl: 'https://pubmed.ncbi.nlm.nih.gov/12618548/',
  },
  {
    id: 'paper_selby_2014',
    title: 'I Ching and synchronicity in clinical practice',
    authors: ['Selby J.'],
    year: 2014,
    journal: 'J. Humanistic Psychology',
    doi: null,
    abstractEn:
      'The I Ching offers a pattern language for non-causal events. This paper explores how clinicians can use the hexagrams as a mirror for what is emerging in the therapeutic field.',
    abstractPtBr: null,
    fullTextUrl: 'https://example.com/selby-2014',
  },
  {
    id: 'paper_cahn_2010',
    title: 'Meditation and brainwave coherence',
    authors: ['Cahn B.R.', 'Delorme A.', 'Polich J.'],
    year: 2010,
    journal: 'Consciousness and Cognition',
    doi: '10.1016/j.concog.2010.01.007',
    abstractEn:
      'Brainwave coherence during meditation is associated with attentional stability and self-referential processing.',
    abstractPtBr: null,
    fullTextUrl: 'https://doi.org/10.1016/j.concog.2010.01.007',
  },
  {
    id: 'paper_dunbar_2020',
    title: 'Shared narratives and group ritual',
    authors: ['Dunbar R.'],
    year: 2020,
    journal: 'Religion, Brain & Behavior',
    doi: '10.1080/2153599X.2020.1748992',
    abstractEn:
      'Synchronous rituals amplify endorphin signaling and create durable group identity. We argue narrative coherence is the substrate.',
    abstractPtBr: null,
    fullTextUrl: 'https://doi.org/10.1080/2153599X.2020.1748992',
  },
];

const MOCK_PILARES = ['cabala', 'astrologia', 'tantra', 'odu', 'iching', 'literature'] as const;

const MOCK_TRANSITS = [
  'Sol em Escorpião',
  'Hexagrama 50',
  'Nodo Norte em Áries',
  'Lua em Peixes',
  'Mercúrio retrógrado',
];

const MOCK_REASONING = [
  'Os 5 pilares convergem em "direção > destino". Nodo Norte ativa medo, hexagrama 50 fala de oferecer. Tantra corpo 1 ancora no presente, Cabala 11 ilumina, Odu Owarin confirma que a travessia já começou.',
  'Cabala 22 + I Ching 29 + Odu Ogbe apontam para "construir antes de fruir". Astrologia: trígono Sol-Lua dá estabilidade emocional; Tantra corpo 9 (radiante) ilumina o caminho mesmo na dúvida.',
  'Cabala caminho 13 (Transformação) cruza com Odu Obara (consciência) e I Ching hex 35 (Progresso). Trânsito Sol-Plutão ativa intensidade. Cliente precisa atravessar, não esperar clareza.',
  'Os pilares apontam para "união de opostos" — Cabala Tiferet, Astrologia Sol-Luna opposition, Tantra Shiva-Shakti, Odu Irosun (dualidade fértil), I Ching hex 61 (Verdade Interior).',
];

const MOCK_HEADLINES = [
  'Direção > destino',
  'Atravessar, não esperar',
  'União dos opostos',
  'Construir antes de fruir',
];

const MOCK_VERDADES = [
  'Propósito é direção, não destino — vá onde o corpo sente medo.',
  'A travessia já começou. Cada passo inseguro é o passo certo.',
  'Onde os opostos se abraçam, a verdade nasce.',
  'Construir é o fruto — não a espera do fruto.',
];

const MOCK_RELATED: ThoughtChainRelatedDiscovery[] = [
  {
    id: 'disc_rel_001',
    verdadeUniversal: 'Iluminador — direção pelo medo.',
    akashaType: 'O Iluminador',
    feedback: 'up',
    createdAt: '2026-06-20T09:00:00Z',
  },
  {
    id: 'disc_rel_002',
    verdadeUniversal: 'Propósito emerge na travessia, não no plano.',
    akashaType: 'O Arquiteto',
    feedback: 'neutral',
    createdAt: '2026-06-22T11:00:00Z',
  },
  {
    id: 'disc_rel_003',
    verdadeUniversal: 'Sombra é o portal, não o muro.',
    akashaType: 'O Curador',
    feedback: 'up',
    createdAt: '2026-06-23T15:00:00Z',
  },
];

function buildMockViewModel(discoveryId: string): ThoughtChainViewModel {
  const paperCount = 1 + Math.floor(stableHash(`${discoveryId}:pcount`) * 3); // 1-3 papers
  const papers: ThoughtChainPaper[] = [];
  for (let i = 0; i < paperCount; i++) {
    papers.push(pickFromId(discoveryId, i, MOCK_PAPERS));
  }

  const pilaresCount = 3 + Math.floor(stableHash(`${discoveryId}:pc`) * 4); // 3-6 pilares
  const pilares = MOCK_PILARES.slice(0, Math.min(pilaresCount, MOCK_PILARES.length));

  const transits = [
    pickFromId(discoveryId, 0, MOCK_TRANSITS),
    pickFromId(discoveryId, 1, MOCK_TRANSITS),
  ];

  return {
    discoveryId,
    verdadeUniversal: pickFromId(discoveryId, 99, MOCK_VERDADES),
    headline: pickFromId(discoveryId, 88, MOCK_HEADLINES),
    inputs: {
      pilares: [...pilares],
      transits,
      relatedChainIds: ['disc_rel_001', 'disc_rel_002'],
      historicoCliente: ['ansioso recorrente', 'tende a Cabala'],
    },
    reasoning: pickFromId(discoveryId, 7, MOCK_REASONING),
    papers,
    relatedDiscoveries: MOCK_RELATED,
    confidence: 0.7 + stableHash(`${discoveryId}:conf`) * 0.25, // 0.7..0.95
    createdAt: new Date().toISOString(),
    locale: 'pt-BR',
  };
}

// ─── Public API ─────────────────────────────────────────────────────────────

export async function loadDiscoveryViewModel(
  discoveryId: string,
  locale: string
): Promise<ThoughtChainViewModel | null> {
  if (!USE_REAL_DB) {
    // Wave 23.2 atual: mock determinístico. Substituir por loadFromDatabase
    // quando Wave 20.2/21.1/21.2 mergearem.
    const model = buildMockViewModel(discoveryId);
    return { ...model, locale };
  }

  // ─── TODO Wave 20.2+ — implementar quando schemas mergearem ───
  // Pseudocódigo (NÃO executar até USE_REAL_DB = true):
  //
  // const row = await prisma.discoveryChain.findUnique({
  //   where: { id: discoveryId },
  //   include: {
  //     citations: { include: { paper: true } },
  //   },
  // });
  // if (!row) return null;
  //
  // const synthesis = row.synthesis as unknown as Discovery;
  // const related = await retrieveRelatedDiscoveries(prisma, row.userId, { limit: 5 });
  //
  // return {
  //   discoveryId: row.id,
  //   verdadeUniversal: synthesis.verdadeUniversal,
  //   headline: synthesis.headline,
  //   inputs: {
  //     pilares: synthesis.chainOfThought.inputs.pilares,
  //     transits: synthesis.chainOfThought.inputs.transits ?? [],
  //     relatedChainIds: synthesis.chainOfThought.relatedDiscoveries,
  //     historicoCliente: synthesis.chainOfThought.inputs.historicoCliente,
  //   },
  //   reasoning: synthesis.chainOfThought.reasoning,
  //   papers: row.citations.map((c) => paperToViewModel(c.paper)),
  //   relatedDiscoveries: related.map((r) => ({
  //     id: r.id,
  //     verdadeUniversal: r.verdadeUniversal,
  //     akashaType: r.akashaType,
  //     feedback: r.feedback,
  //     createdAt: r.createdAt.toISOString(),
  //   })),
  //   confidence: synthesis.chainOfThought.confidence,
  //   createdAt: row.createdAt.toISOString(),
  //   locale,
  // };
  //
  // eslint-disable-next-line @typescript-eslint/no-unreachable-code
  return null;
}