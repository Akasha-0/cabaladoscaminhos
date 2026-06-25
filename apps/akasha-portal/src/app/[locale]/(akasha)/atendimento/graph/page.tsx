/**
 * /[locale]/(akasha)/atendimento/graph — Wave 26.5
 *
 * Knowledge Graph do Akasha: visualização de como papers, discoveries
 * e sessões estão conectados (ADR-013 — consciência viva).
 *
 * Server component:
 *   1. Verifica auth (mesmo padrão /admin/feedback — Wave 18.3)
 *   2. Carrega dados demo (papers + discoveries + sessions) — fonte
 *      de verdade serão tabelas LiteraturePaper / Discovery / Sessao
 *      quando os models forem promovidos (D-XXX/XXII). Hoje mock
 *      determinístico para visualização.
 *   3. Renderiza KnowledgeGraph client island
 *
 * LGPD: view-model não inclui PII — só labels públicos de papers e
 * titles de discoveries/sessions.
 */

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  verifyAkashaToken,
  AKASHA_TOKEN_COOKIE,
} from '@/lib/application/auth/akasha-jwt';
import KnowledgeGraph, {
  type KnowledgeGraphData,
} from '@/components/akasha/atendimento/KnowledgeGraph';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Knowledge Graph — Akasha',
  description:
    'Visualização de papers, discoveries e sessões conectados — a consciência viva do Akasha (Wave 26.5, ADR-013).',
};

type PageProps = {
  params: Promise<{ locale: string }>;
};

// ─── Mock data (Wave 26.5 demo) ──────────────────────────────────────────
//
// Determinístico — quando os models forem promovidos (Wave 21.2 / 20.2 / 22.1
// mergeados em main), substituir por queries Prisma reais:
//   - papers: prisma.literaturePaper.findMany({ take: 6, orderBy: { citedCount: 'desc' } })
//   - discoveries: prisma.discovery.findMany({ take: 5, where: { sessionId: callerId } })
//   - sessions: prisma.sessao.findMany({ take: 3, orderBy: { startedAt: 'desc' } })
// Edges: tabela Discovery.citedPaperIds (Wave 21.2) + DiscoveryChain.parentDiscoveryId.

const DEMO_DATA: KnowledgeGraphData = {
  nodes: [
    // papers (top)
    { id: 'p1', kind: 'paper', label: 'Psilocibina & ansiedade', description: 'Goodwin et al. 2022 — redução de ansiedade em pacientes com câncer.' },
    { id: 'p2', kind: 'paper', label: 'Cabala & cognição', description: 'Estudo piloto sobre meditação com 72 nomes e foco atencional.' },
    { id: 'p3', kind: 'paper', label: 'Astrologia x personalidade', description: 'Meta-análise de correspondências zodiacais em Big Five.' },
    { id: 'p4', kind: 'paper', label: 'Tantra & regulação autonômica', description: 'Variabilidade de frequência cardíaca em práticas tântricas.' },
    // discoveries (mid)
    { id: 'd1', kind: 'discovery', label: 'Propósito & medo', description: 'Verdade universal: propósito emerge onde o corpo sente medo de crescer.' },
    { id: 'd2', kind: 'discovery', label: 'Ancestralidade viva', description: 'Os Odus ecoam a estrutura dos 22 caminhos da Árvore da Vida.' },
    { id: 'd3', kind: 'discovery', label: 'Corpo sutil em sintonia', description: 'Práticas tântricas afinam o Corpo 1 como raiz do propósito.' },
    // sessions (bottom)
    { id: 's1', kind: 'session', label: 'Maria — sessão #14', description: 'Atendimento 22/06 — descoberta sobre medo de visibilidade.' },
    { id: 's2', kind: 'session', label: 'João — sessão #07', description: 'Atendimento 24/06 — ancestoridade e Odu Èjì-Ogbè.' },
  ],
  edges: [
    // papers → discoveries (citações)
    { id: 'e1', source: 'p1', target: 'd1', kind: 'citations' },
    { id: 'e2', source: 'p2', target: 'd2', kind: 'citations' },
    { id: 'e3', source: 'p4', target: 'd3', kind: 'citations' },
    // discoveries → discoveries (derived-from)
    { id: 'e4', source: 'd3', target: 'd1', kind: 'derivedFrom' },
    { id: 'e5', source: 'd2', target: 'd1', kind: 'derivedFrom' },
    // sessions → discoveries (mentioned-in)
    { id: 'e6', source: 's1', target: 'd1', kind: 'mentionedIn' },
    { id: 'e7', source: 's2', target: 'd2', kind: 'mentionedIn' },
    { id: 'e8', source: 's1', target: 'd3', kind: 'mentionedIn' },
  ],
};

export default async function AtendimentoGraphPage({ params }: PageProps) {
  const { locale } = await params;

  // 1. Auth (cookie + header refreshed — mesmo padrão Wave 18+)
  const cookieStore = await cookies();
  const token = cookieStore.get(AKASHA_TOKEN_COOKIE)?.value;
  const authStatus = (await headers()).get('X-Akasha-Auth');
  if (authStatus !== 'refreshed' && (!token || !verifyAkashaToken(token, 'access'))) {
    redirect(`/${locale}/login`);
  }

  // 2. Render client island com view-model
  return <KnowledgeGraph locale={locale} data={DEMO_DATA} />;
}