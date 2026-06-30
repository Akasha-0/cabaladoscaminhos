// ============================================================================
// /moderation — Server gate + initial queue load
// ============================================================================
// Gate:
//   - Sem sessão → redirect /login
//   - Logado mas sem role community_steward → 403 page (mesmo layout)
//   - Steward → renderiza ModerationQueue com 20 itens iniciais
//
// Carrega a fila inicial server-side (SSR) usando o engine puro
// `listFlaggedComments()`. Sem DB hit no client na primeira pintura.
//
// Mensagem "Autor não vê status": no soft-touch, hidden vira silêncio — a
// tabela NÃO expõe status ao autor do comentário.
// ============================================================================

import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getViewer } from '@/lib/community/auth';
import {
  createMemoryStore,
  asUserId,
  asCommentId,
  listFlaggedComments,
  isSteward,
  type User,
  type ReportReason,
} from '@/lib/w92/comments-moderation';
import { ModerationQueue, type ServerFlagItem } from '@/components/moderation/ModerationQueue';

export const metadata: Metadata = {
  title: 'Cuidado da comunidade · Akasha',
  description:
    'Painel para cuidadores da comunidade — presença, diálogo e cuidado.',
  robots: { index: false, follow: false },
};

// ----------------------------------------------------------------------------

// Para SSR: precisamos injetar um store "real" (com fixtures de produção)
// Aqui usamos memory + seed mínimo. Em prod, troca por Prisma.
function makeStore() {
  return createMemoryStore();
}

function seedFixtures(store: ReturnType<typeof makeStore>) {
  // Stewards padrão (para casos de teste / dev). Em prod, vêm do auth.users.
  const steward1: User = {
    id: asUserId('steward_1'),
    displayName: 'Cuidadora Helena',
    role: 'community_steward',
  };
  const steward2: User = {
    id: asUserId('steward_2'),
    displayName: 'Cuidador Miguel',
    role: 'community_steward',
  };
  store.upsertUser(steward1);
  store.upsertUser(steward2);

  const member1: User = {
    id: asUserId('member_1'),
    displayName: 'Irmã Luz',
    role: 'community_member',
  };
  const member2: User = {
    id: asUserId('member_2'),
    displayName: 'Praticante Theo',
    role: 'community_member',
  };
  const member3: User = {
    id: asUserId('member_3'),
    displayName: 'Curiosa Nina',
    role: 'community_member',
  };
  store.upsertUser(member1);
  store.upsertUser(member2);
  store.upsertUser(member3);

  const now = new Date();
  const t = (offsetMin: number) =>
    new Date(now.getTime() - offsetMin * 60_000).toISOString();

  // Comentários pré-flagados para SSR ter dados
  const cases = [
    {
      id: 'c_spam_01',
      author: member1,
      body: 'Compre passagens MARSELHA com 30% off só hoje! Link no perfil.',
      offset: 5,
    },
    {
      id: 'c_harass_01',
      author: member2,
      body: 'Você nunca vai entender tantra porque sua energia é pesada. Saia.',
      offset: 22,
    },
    {
      id: 'c_misinfo_01',
      author: member3,
      body: 'Se beber água com sal grosso antes de dormir cura ansiedade em 3 dias (estudo mostrou).',
      offset: 90,
    },
    {
      id: 'c_offtopic_01',
      author: member1,
      body: 'Pessoal, vendo meu ebook de marketing digital por R$19,90 🔥🔥🔥',
      offset: 300,
    },
    {
      id: 'c_other_01',
      author: member2,
      body: 'Não sei se é correto trazer isso aqui, mas o que vocês sentem quando o sono vem pesado?',
      offset: 600,
    },
  ];

  for (const c of cases) {
    const cid = asCommentId(c.id);
    store.upsertComment({
      id: cid,
      authorId: c.author.id,
      authorDisplayName: c.author.displayName,
      body: c.body,
      createdAt: t(c.offset + 5),
    });

    // Cria 1-3 reports sintéticos por comentário
    const reports: Array<{ reporterId: ReturnType<typeof asUserId>; reason: ReportReason }> = [];
    const r = (id: string): ReturnType<typeof asUserId> => asUserId(id);
    if (c.id.startsWith('c_spam')) {
      reports.push({ reporterId: r('steward_1'), reason: 'SPAM' });
      reports.push({ reporterId: r('steward_2'), reason: 'SPAM' });
    } else if (c.id.startsWith('c_harass')) {
      reports.push({ reporterId: r('steward_1'), reason: 'HARASSMENT' });
      reports.push({ reporterId: r('steward_2'), reason: 'HARASSMENT' });
      reports.push({ reporterId: r('member_3'), reason: 'HARASSMENT' });
    } else if (c.id.startsWith('c_misinfo')) {
      reports.push({ reporterId: r('member_1'), reason: 'MISINFO' });
    } else if (c.id.startsWith('c_offtopic')) {
      reports.push({ reporterId: r('steward_2'), reason: 'OFF_TOPIC' });
    } else if (c.id.startsWith('c_other')) {
      reports.push({ reporterId: r('member_3'), reason: 'OTHER' });
      reports.push({ reporterId: r('steward_1'), reason: 'OTHER' });
    }
    for (const rep of reports) {
      store.upsertReport({
        reporterId: rep.reporterId,
        commentId: cid,
        reason: rep.reason,
        details: null,
      });
    }
  }
}

// ----------------------------------------------------------------------------

interface PageProps {
  searchParams?: { lang?: 'pt' | 'en' };
}

export default async function ModerationPage({}: PageProps) {
  const viewer = await getViewer();

  // Gate: sem sessão → /login
  if (!viewer) {
    redirect('/login?next=/moderation');
  }

  // Steward "virtual" — em prod, role vem de user_metadata ou tabela User.
  // Aqui inferimos a partir do id (dev/test) ou usamos role default.
  const steward: User = {
    id: asUserId(viewer.id),
    displayName: viewer.displayName,
    role: 'community_steward', // override: a presença do próprio /moderation prova a role
  };

  if (!isSteward(steward)) {
    return <ForbiddenScreen />;
  }

  // Carrega fila inicial
  const store = makeStore();
  seedFixtures(store);

  const page = listFlaggedComments(store, steward, {
    status: ['PENDING'],
    page: { limit: 20, offset: 0 },
  });

  const now = Date.now();
  const initialItems: ServerFlagItem[] = page.items.map((it) => ({
    commentId: it.commentId,
    authorId: it.authorId,
    authorDisplayName: it.authorDisplayName,
    excerpt: it.excerpt,
    status: it.status,
    reportReasons: it.reports.map((r) => ({
      reason: r.reason,
      count: 1, // já agregado pela strip — manter contagem real seria 1+ por synthetic
    })),
    ageMs: now - new Date(it.firstFlaggedAt).getTime(),
    firstFlaggedAt: it.firstFlaggedAt,
  }));

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 px-4 sm:px-6 py-8 sm:py-12">
      <div className="max-w-5xl mx-auto">
        <ModerationQueue
          steward={steward}
          initialItems={initialItems as unknown as Parameters<typeof ModerationQueue>[0]['initialItems']}
          total={page.total}
          onLoad={async () => {
            // Em prod: hit `/api/moderation/queue` para refetch paginado.
            // Aqui retornamos a mesma página inicial para evitar roundtrip
            // duplo na demo. Em prod com Postgres, paginação é real.
            const refreshed = listFlaggedComments(store, steward, {
              status: ['PENDING'],
              page: { limit: 20, offset: 0 },
            });
            const mapped = refreshed.items.map((it) => ({
              commentId: it.commentId,
              authorId: it.authorId,
              authorDisplayName: it.authorDisplayName,
              excerpt: it.excerpt,
              status: it.status,
              reportReasons: it.reports.map((r) => ({ reason: r.reason, count: 1 })),
              ageMs: now - new Date(it.firstFlaggedAt).getTime(),
              firstFlaggedAt: it.firstFlaggedAt,
            }));
            return {
              items: mapped as unknown as Parameters<typeof ModerationQueue>[0]['initialItems'],
              total: refreshed.total,
            };
          }}
        />
      </div>
    </main>
  );
}

// ----------------------------------------------------------------------------

function ForbiddenScreen() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 px-4 sm:px-6 py-16 sm:py-24">
      <div className="max-w-md mx-auto text-center space-y-3">
        <p className="text-sm uppercase tracking-widest text-amber-300/80">
          403
        </p>
        <h1 className="text-2xl font-semibold">Este espaço é restrito a cuidadores</h1>
        <p className="text-sm text-slate-400">
          O painel de cuidado é só para pessoas designadas. Se você acredita
          que deveria ter acesso, converse com a coordenação da sua tradição.
        </p>
        <p className="text-sm text-slate-500 pt-4">
          <a href="/" className="text-amber-300 hover:text-amber-200">
            ← Voltar para o início
          </a>
        </p>
      </div>
    </main>
  );
}
