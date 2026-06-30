// ============================================================================
// app/posts/[id]/comment-with-mentions/page.tsx — Server Component demo
// (W90s-D)
//
// Renders a demo page that wires `CommentComposerWithMentions` with a
// hand-curated user dataset (8 users across 7 tradições + 1 cross-tradição
// user) and shows a few example comments that include @mentions.
//
// This page is meant to validate the W90s-D delivery in isolation. It is
// hidden from search engines (`robots: { index: false, follow: false }`)
// and uses `dynamic = 'force-dynamic'` to avoid prerender.
//
// Sacred-cultural compliance:
//   - 7 tradição symbols surfaced verbatim (✦ 🪶 ☩ ◈ ☸ ☉ ☬).
//   - Sacred terms preserved verbatim (Orixá, Caboclo, Babalaô, Yalorixá,
//     Axé, Sefirá).
//   - No banned vocabulary (amarração, amarre, vinculação, vincular,
//     prejudicar) appears anywhere on this page.
// ============================================================================

import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { formatMention } from '@/lib/utils/format-mention';
import { CommentComposerWithMentions } from '@/components/community/CommentComposerWithMentions';
import {
  type MentionUser,
  toUserId,
  toMentionHandle,
} from '@/lib/w90s/comments-mention-autocomplete';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Comentários com @menções — Cabala dos Caminhos',
  description:
    'Demonstração do componente de comentários com autocomplete de @menções. Recursos de teclado, ARIA combobox, mobile-first.',
  robots: { index: false, follow: false },
};

const DEMO_USERS: ReadonlyArray<MentionUser> = Object.freeze([
  Object.freeze({
    id: toUserId('u-yara-do-cipo'),
    handle: toMentionHandle('yaradocipo'),
    displayName: 'Yara do Cipó',
    tradição: 'candomble' as const,
    spiritualTag: 'Yalorixá',
    avatarUrl: null,
  }),
  Object.freeze({
    id: toUserId('u-mestre-ramiro'),
    handle: toMentionHandle('mesteramiro'),
    displayName: 'Mestre Ramiro',
    tradição: 'cigano' as const,
    spiritualTag: 'Cigano Ramiro',
    avatarUrl: null,
  }),
  Object.freeze({
    id: toUserId('u-mae-iara'),
    handle: toMentionHandle('maeiara'),
    displayName: 'Mãe Iara',
    tradição: 'umbanda' as const,
    spiritualTag: 'Médium',
    avatarUrl: null,
  }),
  Object.freeze({
    id: toUserId('u-rabino-meir'),
    handle: toMentionHandle('rabinomeir'),
    displayName: 'Rabino Meir',
    tradição: 'cabala' as const,
    spiritualTag: 'Sefirá',
    avatarUrl: null,
  }),
  Object.freeze({
    id: toUserId('u-swami-joao'),
    handle: toMentionHandle('swamijoao'),
    displayName: 'Swami João',
    tradição: 'tantra' as const,
    spiritualTag: 'Pranayama',
    avatarUrl: null,
  }),
  Object.freeze({
    id: toUserId('u-paula-de-marte'),
    handle: toMentionHandle('paulademarte'),
    displayName: 'Paula de Marte',
    tradição: 'astrologia' as const,
    spiritualTag: null,
    avatarUrl: null,
  }),
  Object.freeze({
    id: toUserId('u-babalao-tunji'),
    handle: toMentionHandle('babalaotunji'),
    displayName: 'Babalaô Tunji',
    tradição: 'ifa' as const,
    spiritualTag: 'Babalaô',
    avatarUrl: null,
  }),
  Object.freeze({
    id: toUserId('u-sara-da-luz'),
    handle: toMentionHandle('saradaluz'),
    displayName: 'Sara da Luz',
    tradição: 'cigano' as const,
    spiritualTag: 'Cartomante',
    avatarUrl: null,
  }),
]);

const EXAMPLE_COMMENTS: ReadonlyArray<{
  id: string;
  author: string;
  content: string;
  createdAt: string;
}> = Object.freeze([
  {
    id: 'demo-c1',
    author: 'Mestre Ramiro',
    content:
      '@yaradocipo, podemos cruzar o jogo de Cigano com o Mapa Astral? Quero entender o que Yalorixá pediu atenção.',
    createdAt: '2026-06-29T15:00:00Z',
  },
  {
    id: 'demo-c2',
    author: 'Paula de Marte',
    content:
      'Lembrando que @mesteramiro, o ascendente em Escorpião muda a leitura da casa 8. Marte pede passagem.',
    createdAt: '2026-06-29T15:42:00Z',
  },
  {
    id: 'demo-c3',
    author: 'Rabino Meir',
    content:
      'Para @maeiara, a Sefirá Hod ilumina a função da Cabocla na corrente. Posta no /workshops quando puderes.',
    createdAt: '2026-06-29T16:10:00Z',
  },
]);

export default function CommentWithMentionsPage({
  params,
}: {
  params: { id: string };
}) {
  const postId = params.id ?? 'demo-post';
  return (
    <main
      data-testid="comment-with-mentions-page"
      data-post-id={postId}
      className="mx-auto flex max-w-full flex-col gap-6 px-4 py-6 sm:max-w-2xl sm:px-6"
    >
      <header className="flex flex-col gap-2">
        <Link
          href={`/posts/${postId}`}
          className="inline-flex min-h-[44px] w-fit items-center gap-1.5 text-xs text-slate-400 hover:text-amber-300"
          data-testid="back-link"
        >
          <ArrowLeft className="h-3 w-3" aria-hidden="true" />
          Voltar ao post
        </Link>
        <h1 className="text-xl font-semibold text-slate-100 sm:text-2xl">
          Comentários com @menções
        </h1>
        <p className="text-sm text-slate-400">
          Demonstração do autocomplete de menções (W90s-D). Digite
          <kbd className="mx-1 rounded bg-slate-800 px-1 text-[10px]">@</kbd>
          + o início do handle e use ↑↓ para navegar, Enter para escolher.
        </p>
      </header>

      <section
        aria-label="Comentários existentes"
        className="flex flex-col gap-3"
        data-testid="example-comments"
      >
        {EXAMPLE_COMMENTS.map((c) => (
          <article
            key={c.id}
            id={`comment-${c.id}`}
            data-testid={`example-comment-${c.id}`}
            className="rounded-lg border border-slate-800/60 bg-slate-900/30 p-3 text-sm text-slate-200"
          >
            <header className="mb-1 flex items-baseline justify-between gap-3">
              <span className="font-medium text-amber-200">{c.author}</span>
              <time
                dateTime={c.createdAt}
                className="text-[11px] text-slate-500"
              >
                {new Date(c.createdAt).toLocaleString('pt-BR')}
              </time>
            </header>
            <p className="whitespace-pre-wrap break-words">
              {formatMention(c.content, {
                className:
                  'text-amber-300 hover:text-amber-200 underline-offset-2 hover:underline font-medium',
              })}
            </p>
          </article>
        ))}
      </section>

      <section
        aria-label="Escrever novo comentário"
        className="rounded-lg border border-slate-800/60 bg-slate-900/20 p-4"
        data-testid="composer-section"
      >
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-slate-400">
          Seu comentário
        </h2>
        <CommentComposerWithMentions
          users={DEMO_USERS}
          placeholder="Escreva aqui. Use @ para mencionar alguém da comunidade."
          onSubmit={async (text, mentions) => {
            // Demo-only submitter — echoes to console and returns success.
            if (typeof window !== 'undefined') {
              // eslint-disable-next-line no-console
              console.log('[demo] submit', { text, mentions });
            }
            return true;
          }}
        />
      </section>

      <aside
        className="rounded-md border border-slate-800/60 bg-slate-900/20 p-3 text-[11px] text-slate-500"
        data-testid="legend"
        aria-label="Legenda de tradições"
      >
        <p className="mb-2 font-medium uppercase tracking-wide text-slate-400">
          Símbolos das 7 tradições
        </p>
        <ul className="flex flex-wrap gap-3">
          <li>
            <span aria-hidden="true">✦</span> cigano
          </li>
          <li>
            <span aria-hidden="true">🪶</span> umbanda
          </li>
          <li>
            <span aria-hidden="true">☩</span> candomblé
          </li>
          <li>
            <span aria-hidden="true">◈</span> cabala
          </li>
          <li>
            <span aria-hidden="true">☸</span> tantra
          </li>
          <li>
            <span aria-hidden="true">☉</span> astrologia
          </li>
          <li>
            <span aria-hidden="true">☬</span> ifá
          </li>
        </ul>
      </aside>
    </main>
  );
}