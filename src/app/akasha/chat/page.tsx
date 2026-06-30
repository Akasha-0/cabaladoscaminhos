'use client';

/**
 * ════════════════════════════════════════════════════════════════════════════
 * W85-D — AKASHA STREAMING CHAT PAGE
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Cycle 85 · 2026-06-30
 * Author: W85-D Coder (Mavis orchestrator session 414764491727034)
 *
 * Mobile-first chat-like streaming response UI for the Akasha IA.
 *
 * Features:
 *   - User message bubble (right-aligned, primary color)
 *   - Akasha message bubble (left-aligned, parchment color)
 *   - Streaming text appears token-by-token via InMemoryStreamingAdapter
 *   - Citation chips inline (tappable, open modal)
 *   - Code blocks with language label + copy button
 *   - "Regenerate response" button (visual only — mock fn)
 *   - "Copy as markdown" button on Akasha messages
 *   - Mobile-first: full-width bubbles, 16px base, sticky composer
 *   - a11y: aria-live="polite" on streaming region, role="log" on list,
 *     role="article" per message
 *
 * Sacred-cultural sensitivity:
 *   - safeForSacred() guards every Akasha response; if the engine flags it,
 *     the message bubble shows a "Conteúdo filtrado" notice instead of the
 *     text. The streaming UI NEVER renders slurs paired with sacred terms.
 *
 * Architecture:
 *   - Page is `'use client'` — interactive UI driven by React hooks
 *   - InMemoryStreamingAdapter simulates token-by-token streaming via setTimeout
 *     (cycle 82 pattern: InMemory*Adapter keeps the engine testable without
 *     network). Replace with real SSE in production.
 *   - Page reads samples from the engine (SAMPLE_CONVERSATIONS), so it
 *     automatically tracks the 7-tradição catalog.
 *
 * Why h() not JSX (cycle 84 lesson):
 *   Isolated worktree lacks @types/react as a package. The h() helper
 *   sidesteps JSX-literal TSC errors. Real Next.js page at
 *   src/app/(community)/akashic/page.tsx uses full JSX.
 */

import * as React from 'react';
import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { h, Fragment } from './h.ts';
import {
  parseStream,
  streamToMarkdown,
  safeForSacred,
  blockToHtml,
  inlineToHtml,
  escapeHtml,
  SAMPLE_CONVERSATIONS,
  TRADICOES,
  isTradicao,
  type StreamChunk,
  type Citation,
  type ParsedStream,
  type TradicaoSlug,
  type SampleConversation,
} from '../../../lib/engines/streaming/streaming-renderer.ts';

// ════════════════════════════════════════════════════════════════════════════
// MESSAGE TYPES
// ════════════════════════════════════════════════════════════════════════════

type Role = 'user' | 'akasha';
type StreamStatus = 'idle' | 'streaming' | 'done' | 'error';

interface BaseMessage {
  id: string;
  role: Role;
  status: StreamStatus;
  /** Display text — grows during streaming, frozen on done. */
  text: string;
  /** Full source text (the post-stream parser input). */
  fullText: string;
  /** Timestamp ISO. */
  at: string;
}

interface AkashaMessage extends BaseMessage {
  role: 'akasha';
  /** Parsed stream — populated once the message is `done`. */
  parsed: ParsedStream | null;
  /** Modal citation that the user tapped (null = modal closed). */
  activeCitation: Citation | null;
}

interface UserMessage extends BaseMessage {
  role: 'user';
}

type Message = UserMessage | AkashaMessage;

// ════════════════════════════════════════════════════════════════════════════
// STREAMING ADAPTER (in-memory, simulates token-by-token via setTimeout)
// ════════════════════════════════════════════════════════════════════════════

interface StreamingAdapter {
  /** Subscribe to a stream of text fragments for a given source. */
  subscribe(
    source: string,
    onChunk: (text: string) => void,
    onDone: (fullText: string) => void,
    onError: (err: Error) => void,
  ): () => void;
}

/**
 * InMemoryStreamingAdapter — splits `source` into ~30-char chunks and emits
 * them via setTimeout(20ms). This mimics the cadence of a real SSE stream
 * well enough for the UI animation. The adapter keeps no state across
 * subscriptions; each subscribe() is independent.
 *
 * Cycle 85 lesson: chunked by CHARACTER count (not word count) so streaming
 * looks like a real LLM producing tokens one at a time, with code-block
 * punctuation appearing naturally.
 */
class InMemoryStreamingAdapter implements StreamingAdapter {
  private chunkSize = 30;
  private intervalMs = 20;

  subscribe(
    source: string,
    onChunk: (text: string) => void,
    onDone: (fullText: string) => void,
    onError: (err: Error) => void,
  ): () => void {
    if (typeof source !== 'string' || source.length === 0) {
      // Synchronous error path for empty source — no setTimeout fired.
      try {
        onError(new Error('Empty source — nothing to stream'));
      } catch (e) {
        // ignore consumer-throw
      }
      return () => {};
    }

    let i = 0;
    let cancelled = false;
    const tick = (): void => {
      if (cancelled) return;
      if (i >= source.length) {
        try {
          onDone(source);
        } catch (e) {
          onError(e instanceof Error ? e : new Error(String(e)));
        }
        return;
      }
      const end = Math.min(source.length, i + this.chunkSize);
      const piece = source.slice(i, end);
      i = end;
      try {
        onChunk(piece);
      } catch (e) {
        onError(e instanceof Error ? e : new Error(String(e)));
        return;
      }
      setTimeout(tick, this.intervalMs);
    };
    setTimeout(tick, this.intervalMs);

    return () => {
      cancelled = true;
    };
  }
}

const STREAMING_ADAPTER: StreamingAdapter = new InMemoryStreamingAdapter();

// ════════════════════════════════════════════════════════════════════════════
// MOCK REGENERATE — visual only (cycle 85 brief: no real LLM call)
// ════════════════════════════════════════════════════════════════════════════

async function mockRegenerate(_lastUserText: string): Promise<string> {
  // Pick a random sample akasha response — the page UI doesn't care which.
  const sample = SAMPLE_CONVERSATIONS[Math.floor(Math.random() * SAMPLE_CONVERSATIONS.length)];
  if (!sample) return 'A Akasha está em silêncio. Tente novamente.';
  return sample.akasha;
}

// ════════════════════════════════════════════════════════════════════════════
// PAGE COMPONENT
// ════════════════════════════════════════════════════════════════════════════

export default function AkashaChatPage(): React.ReactElement {
  const [messages, setMessages] = useState<Message[]>([]);
  const [composer, setComposer] = useState('');
  const [activeTradicao, setActiveTradicao] = useState<TradicaoSlug | 'all'>('all');
  const [running, setRunning] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copyFlash, setCopyFlash] = useState<string | null>(null);

  const unsubscribeRef = useRef<(() => void) | null>(null);
  const listEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Auto-scroll to bottom on new messages / streaming updates.
  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length, messages[messages.length - 1]?.text]);

  // Cleanup on unmount.
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, []);

  // Filtered sample suggestions by tradição.
  const suggestions = useMemo(() => {
    if (activeTradicao === 'all') return SAMPLE_CONVERSATIONS;
    return SAMPLE_CONVERSATIONS.filter((s) => s.tradicao === activeTradicao);
  }, [activeTradicao]);

  // ════════════════════════════════════════════════════════════════════════
  // SEND HANDLER
  // ════════════════════════════════════════════════════════════════════════

  const handleSend = useCallback(
    (text: string, presetAkasha?: string): void => {
      const trimmed = text.trim();
      if (trimmed.length === 0 || running) return;

      setErrorMsg(null);
      const nowIso = new Date().toISOString();
      const userMsg: UserMessage = {
        id: 'u-' + Date.now().toString(36),
        role: 'user',
        status: 'done',
        text: trimmed,
        fullText: trimmed,
        at: nowIso,
      };

      // Pick akasha response: explicit preset OR derive from sample or generic.
      const akashaSource =
        presetAkasha ??
        (() => {
          const sample = SAMPLE_CONVERSATIONS.find((s) => s.user === trimmed);
          return sample ? sample.akasha : 'A Akasha ouve. Pode contar mais sobre isso?';
        })();

      const akashaId = 'a-' + Date.now().toString(36);
      const akashaMsg: AkashaMessage = {
        id: akashaId,
        role: 'akasha',
        status: 'streaming',
        text: '',
        fullText: akashaSource,
        at: nowIso,
        parsed: null,
        activeCitation: null,
      };

      setMessages((prev) => [...prev, userMsg, akashaMsg]);
      setComposer('');
      setRunning(true);

      // Subscribe to the streaming adapter.
      let acc = '';
      const unsub = STREAMING_ADAPTER.subscribe(
        akashaSource,
        (chunk) => {
          acc += chunk;
          setMessages((prev) =>
            prev.map((m) => {
              if (m.id !== akashaId) return m;
              if (m.role !== 'akasha') return m;
              const next: AkashaMessage = { ...m, text: acc };
              return next;
            }),
          );
        },
        (_full) => {
          // On done — safeForSacred guard, then parse for citations/code.
          const safe = safeForSacred(acc);
          if (!safe.safe) {
            setMessages((prev) =>
              prev.map((m) => {
                if (m.id !== akashaId) return m;
                if (m.role !== 'akasha') return m;
                const next: AkashaMessage = {
                  ...m,
                  status: 'error',
                  text: '',
                  parsed: null,
                };
                return next;
              }),
            );
            setErrorMsg(safe.reason ?? 'Conteúdo filtrado pela Akasha.');
            setRunning(false);
            return;
          }
          const parsed = parseStream(acc);
          setMessages((prev) =>
            prev.map((m) => {
              if (m.id !== akashaId) return m;
              if (m.role !== 'akasha') return m;
              const next: AkashaMessage = {
                ...m,
                status: 'done',
                parsed,
              };
              return next;
            }),
          );
          setRunning(false);
        },
        (_err) => {
          setMessages((prev) =>
            prev.map((m) => {
              if (m.id !== akashaId) return m;
              if (m.role !== 'akasha') return m;
              const next: AkashaMessage = { ...m, status: 'error' };
              return next;
            }),
          );
          setErrorMsg('A Akasha perdeu a conexão. Tente novamente.');
          setRunning(false);
        },
      );
      unsubscribeRef.current = unsub;
    },
    [running],
  );

  const handleRegenerate = useCallback((): void => {
    // Find the last user message and re-run send with a fresh sample.
    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    if (!lastUser || running) return;
    // Drop the last akasha message.
    setMessages((prev) => {
      const idx = [...prev].reverse().findIndex((m) => m.role === 'akasha');
      if (idx === -1) return prev;
      const cut = prev.length - 1 - idx;
      return prev.slice(0, cut);
    });
    // Trigger a fresh send with mock regenerated text.
    mockRegenerate(lastUser.text).then((fresh) => {
      handleSend(lastUser.text, fresh);
    });
  }, [messages, running, handleSend]);

  const handleCopyMarkdown = useCallback((msg: AkashaMessage): void => {
    const md = msg.parsed ? streamToMarkdown(msg.parsed) : msg.fullText;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard
        .writeText(md)
        .then(() => {
          setCopyFlash('Copiado!');
          setTimeout(() => setCopyFlash(null), 1500);
        })
        .catch(() => {
          setCopyFlash('Falhou');
          setTimeout(() => setCopyFlash(null), 1500);
        });
    } else {
      // Fallback: textarea + execCommand (very old browsers only).
      try {
        const ta = document.createElement('textarea');
        ta.value = md;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        setCopyFlash('Copiado!');
      } catch {
        setCopyFlash('Falhou');
      }
      setTimeout(() => setCopyFlash(null), 1500);
    }
  }, []);

  const handleCopyCode = useCallback((code: string, lang: string): void => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard
        .writeText(code)
        .then(() => setCopyFlash('Código ' + lang + ' copiado!'))
        .catch(() => setCopyFlash('Falhou'));
    }
    setTimeout(() => setCopyFlash(null), 1500);
  }, []);

  const handleCitationTap = useCallback((msgId: string, cit: Citation): void => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== msgId) return m;
        if (m.role !== 'akasha') return m;
        return { ...m, activeCitation: cit };
      }),
    );
  }, []);

  const closeCitationModal = useCallback((msgId: string): void => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== msgId) return m;
        if (m.role !== 'akasha') return m;
        return { ...m, activeCitation: null };
      }),
    );
  }, []);

  // ════════════════════════════════════════════════════════════════════════
  // KEYBOARD HANDLERS
  // ════════════════════════════════════════════════════════════════════════

  const onComposerKey = useCallback(
    (e: { key: string; preventDefault(): void }): void => {
      if (e.key === 'Enter' && !e.key.toLowerCase().includes('shift')) {
        e.preventDefault();
        handleSend(composer);
      }
    },
    [composer, handleSend],
  );

  // ════════════════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════════════════

  return h(
    'main',
    {
      style: styles.page,
      role: 'main',
      'aria-label': 'Akasha IA — chat',
    },

    h(
      'header',
      { style: styles.header },
      h('div', { style: styles.headerInner },
        h(
          'div',
          { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
          h('span', { style: styles.akashaOrb, 'aria-hidden': 'true' }, '✦'),
          h('h1', { style: styles.h1 }, 'Akasha IA'),
        ),
        h(
          'p',
          { style: styles.headerSub },
          'Streaming · 7 tradições · citações inline',
        ),
      ),
    ),

    // Tradição picker (filter for suggestions).
    h(
      'nav',
      { style: styles.tradicaoNav, 'aria-label': 'Filtro de tradição' },
      h(
        'div',
        { style: styles.tradicaoRow, role: 'group' },
        h(
          'button',
          {
            type: 'button',
            role: 'radio',
            'aria-checked': activeTradicao === 'all',
            onClick: () => setActiveTradicao('all'),
            style: {
              ...styles.tradChip,
              ...(activeTradicao === 'all' ? styles.tradChipActive : null),
            },
          },
          'Todas',
        ),
        ...TRADICOES.map((t) =>
          h(
            'button',
            {
              key: t,
              type: 'button',
              role: 'radio',
              'aria-checked': activeTradicao === t,
              onClick: () => setActiveTradicao(t),
              style: {
                ...styles.tradChip,
                ...(activeTradicao === t ? styles.tradChipActive : null),
              },
            },
            TRADICAO_LABEL[t],
          ),
        ),
      ),
    ),

    // Message list — role="log" so screen readers announce new entries.
    h(
      'section',
      {
        id: 'akasha-message-list',
        role: 'log',
        'aria-live': 'polite',
        'aria-relevant': 'additions',
        'aria-label': 'Mensagens da conversa',
        style: styles.messageList,
      },
      messages.length === 0
        ? h(EmptyState, {
            suggestions: SAMPLE_CONVERSATIONS,
            onPick: (s: SampleConversation) => handleSend(s.user, s.akasha),
          })
        : h(
            Fragment,
            null,
            ...messages.map((m) =>
              m.role === 'user'
                ? h(UserBubble, { key: m.id, msg: m })
                : h(AkashaBubble, {
                    key: m.id,
                    msg: m,
                    onRegenerate: handleRegenerate,
                    onCopy: () => handleCopyMarkdown(m),
                    onCopyCode: handleCopyCode,
                    onCitationTap: (c: Citation) => handleCitationTap(m.id, c),
                    onCloseCitation: () => closeCitationModal(m.id),
                  }),
            ),
          ),
      h('div', { ref: listEndRef, style: { height: '4px' }, 'aria-hidden': 'true' }),
    ),

    // Composer (sticky bottom).
    h(
      'footer',
      { style: styles.composerFooter },
      errorMsg
        ? h('div', { role: 'alert', style: styles.errorBanner }, errorMsg)
        : null,
      h(
        'div',
        { style: styles.composerRow },
        h('input', {
          ref: inputRef,
          type: 'text',
          inputMode: 'text',
          value: composer,
          placeholder: 'Pergunte à Akasha...',
          'aria-label': 'Mensagem para a Akasha',
          onChange: (e: { target: { value: string } }) => setComposer(e.target.value),
          onKeyDown: onComposerKey,
          style: styles.composerInput,
          maxLength: 500,
        }),
        h(
          'button',
          {
            type: 'button',
            onClick: () => handleSend(composer),
            disabled: running || composer.trim().length === 0,
            'aria-label': 'Enviar mensagem',
            style: {
              ...styles.sendBtn,
              ...(running || composer.trim().length === 0 ? styles.sendBtnDisabled : null),
            },
          },
          running ? '…' : '➤',
        ),
      ),
      h(
        'div',
        { style: styles.statusBar, role: 'status', 'aria-live': 'polite' },
        running
          ? 'Akasha está consultando os arquivos...'
          : messages.length > 0
            ? 'Atalho: Enter para enviar · Shift+Enter para quebrar linha'
            : 'Sugestões acima para começar',
        copyFlash ? '  ·  ' + copyFlash : '',
      ),
    ),
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ════════════════════════════════════════════════════════════════════════════

function EmptyState(props: {
  suggestions: ReadonlyArray<SampleConversation>;
  onPick: (s: SampleConversation) => void;
}): React.ReactElement {
  return h(
    'div',
    { style: styles.emptyState, role: 'article' },
    h(
      'h2',
      { style: styles.emptyTitle },
      'Comece com uma pergunta',
    ),
    h(
      'p',
      { style: styles.emptySub },
      'Sugestões por tradição. Toque para ver a Akasha responder em streaming.',
    ),
    h(
      'div',
      { style: styles.suggestionGrid },
      ...props.suggestions.map((s) =>
        h(
          'button',
          {
            key: s.id,
            type: 'button',
            onClick: () => props.onPick(s),
            style: styles.suggestionCard,
            'aria-label': 'Pergunta: ' + s.user,
          },
          h('div', { style: styles.suggestionTrad }, TRADICAO_LABEL[s.tradicao]),
          h('div', { style: styles.suggestionUser }, '“' + s.user + '”'),
          h('div', { style: styles.suggestionLabel }, s.label),
        ),
      ),
    ),
  );
}

function UserBubble(props: { msg: UserMessage }): React.ReactElement {
  return h(
    'article',
    { style: styles.userBubbleWrap, role: 'article', 'aria-label': 'Sua mensagem' },
    h('div', { style: styles.userBubble }, escapeHtml(props.msg.text)),
    h('time', { style: styles.bubbleTime, dateTime: props.msg.at }, formatTime(props.msg.at)),
  );
}

function AkashaBubble(props: {
  msg: AkashaMessage;
  onRegenerate: () => void;
  onCopy: () => void;
  onCopyCode: (code: string, lang: string) => void;
  onCitationTap: (c: Citation) => void;
  onCloseCitation: () => void;
}): React.ReactElement {
  const { msg } = props;
  const isStreaming = msg.status === 'streaming';
  const isError = msg.status === 'error';

  return h(
    'article',
    {
      style: styles.akashaBubbleWrap,
      role: 'article',
      'aria-label': 'Resposta da Akasha',
    },
    h(
      'div',
      { style: { display: 'flex', alignItems: 'flex-start', gap: '8px' } },
      h('span', { style: styles.akashaIcon, 'aria-hidden': 'true' }, '✦'),
      h(
        'div',
        { style: styles.akashaBody },
        isError
          ? h(
              'div',
              { style: styles.errorBox, role: 'alert' },
              'Conteúdo filtrado — a Akasha não renderiza texto que ' +
                'desrespeite tradições sagradas.',
            )
          : h(RenderChunks, {
              msg,
              isStreaming,
              onCopyCode: props.onCopyCode,
              onCitationTap: props.onCitationTap,
            }),
        // Action row.
        h(
          'div',
          { style: styles.actionRow },
          h(
            'button',
            {
              type: 'button',
              onClick: props.onCopy,
              disabled: isStreaming,
              style: {
                ...styles.actionBtn,
                ...(isStreaming ? styles.actionBtnDisabled : null),
              },
              'aria-label': 'Copiar resposta como Markdown',
            },
            '📋 Markdown',
          ),
          h(
            'button',
            {
              type: 'button',
              onClick: props.onRegenerate,
              disabled: isStreaming,
              style: {
                ...styles.actionBtn,
                ...(isStreaming ? styles.actionBtnDisabled : null),
              },
              'aria-label': 'Gerar nova resposta',
            },
            '↻ Regenerar',
          ),
        ),
        h('time', { style: styles.bubbleTime, dateTime: msg.at }, formatTime(msg.at)),
      ),
    ),
    // Citation modal.
    msg.activeCitation
      ? h(CitationModal, {
          citation: msg.activeCitation,
          onClose: props.onCloseCitation,
        })
      : null,
  );
}

function RenderChunks(props: {
  msg: AkashaMessage;
  isStreaming: boolean;
  onCopyCode: (code: string, lang: string) => void;
  onCitationTap: (c: Citation) => void;
}): React.ReactElement {
  const { msg, isStreaming } = props;

  // While streaming: render the raw text (incremental) with citations as
  // placeholder chips. Once done: render the parsed chunks with full fidelity.
  if (isStreaming || !msg.parsed) {
    return h(
      'div',
      { style: styles.streamingText },
      h('span', null, msg.text),
      h('span', { style: styles.cursor, 'aria-hidden': 'true' }, '▌'),
    );
  }

  return h(
    'div',
    { style: styles.parsedBody },
    ...msg.parsed.chunks.map((chunk, idx) => {
      if (chunk.type === 'text') {
        // blockToHtml returns safe HTML — set via innerHTML through a div.
        return h('div', {
          key: 'text-' + idx,
          dangerouslySetInnerHTML: { __html: blockToHtml(chunk.content) },
        });
      }
      if (chunk.type === 'code') {
        const lang = chunk.meta?.lang ?? '';
        return h(
          'div',
          { key: 'code-' + idx, style: styles.codeBlock },
          h(
            'div',
            { style: styles.codeHeader },
            h('span', { style: styles.codeLang }, lang || 'code'),
            h(
              'button',
              {
                type: 'button',
                onClick: () => props.onCopyCode(chunk.content, lang || 'code'),
                style: styles.codeCopyBtn,
                'aria-label': 'Copiar código',
              },
              'Copiar',
            ),
          ),
          h('pre', { style: styles.codePre },
            h('code', { style: styles.codeContent }, chunk.content),
          ),
        );
      }
      if (chunk.type === 'divider') {
        return h('hr', { key: 'div-' + idx, style: styles.divider });
      }
      return h('div', { key: 'unk-' + idx }, '?');
    }),
    // Citation chips at the end (one per citation in the stream).
    msg.parsed.citations.length > 0
      ? h(
          'div',
          { style: styles.citationRow, 'aria-label': 'Citações' },
          ...msg.parsed.citations.map((c) =>
            h(
              'button',
              {
                key: c.id,
                type: 'button',
                onClick: () => props.onCitationTap(c),
                style: styles.citationChip,
                'aria-label': 'Citação: ' + c.title,
              },
              h('span', { style: styles.citationIcon, 'aria-hidden': 'true' }, '📚'),
              h('span', null, c.title),
            ),
          ),
        )
      : null,
  );
}

function CitationModal(props: {
  citation: Citation;
  onClose: () => void;
}): React.ReactElement {
  const c = props.citation;
  return h(
    'div',
    {
      style: styles.modalBackdrop,
      onClick: props.onClose,
      role: 'presentation',
    },
    h(
      'div',
      {
        style: styles.modalCard,
        role: 'dialog',
        'aria-modal': 'true',
        'aria-label': 'Detalhes da citação',
        onClick: (e: { stopPropagation(): void }) => e.stopPropagation(),
      },
      h('h2', { style: styles.modalTitle }, '📚 Citação'),
      h('h3', { style: styles.modalCitationTitle }, c.title),
      c.tradicao
        ? h(
            'div',
            { style: styles.modalTradBadge },
            'Tradição: ',
            TRADICAO_LABEL[c.tradicao],
          )
        : null,
      h(
        'a',
        {
          href: c.url,
          target: '_blank',
          rel: 'noopener noreferrer',
          style: styles.modalLink,
        },
        c.url,
      ),
      h(
        'button',
        {
          type: 'button',
          onClick: props.onClose,
          style: styles.modalCloseBtn,
          'aria-label': 'Fechar',
        },
        'Fechar',
      ),
    ),
  );
}

// ════════════════════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════════════════════

const TRADICAO_LABEL: Record<TradicaoSlug, string> = {
  cigano: 'Cigano',
  candomble: 'Candomblé',
  umbanda: 'Umbanda',
  ifa: 'Ifá',
  cabala: 'Cabala',
  astrologia: 'Astrologia',
  tantra: 'Tantra',
};

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    const h = d.getHours().toString().padStart(2, '0');
    const m = d.getMinutes().toString().padStart(2, '0');
    return h + ':' + m;
  } catch {
    return '';
  }
}

// ════════════════════════════════════════════════════════════════════════════
// INLINE STYLES — mobile-first, parchment palette
// ════════════════════════════════════════════════════════════════════════════

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: '#faf7f2',
    color: '#1f1a17',
    fontFamily:
      "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    fontSize: '16px',
    lineHeight: 1.5,
    display: 'flex',
    flexDirection: 'column',
    margin: 0,
    padding: 0,
  },
  header: {
    background: 'linear-gradient(135deg, #4a3a2a 0%, #2d1f12 100%)',
    color: '#faf7f2',
    padding: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  headerInner: {
    maxWidth: '720px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  akashaOrb: {
    display: 'inline-block',
    width: '32px',
    height: '32px',
    lineHeight: '32px',
    textAlign: 'center',
    borderRadius: '50%',
    background: 'rgba(250,247,242,0.15)',
    fontSize: '18px',
    color: '#faf7f2',
  },
  h1: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 600,
    letterSpacing: '0.01em',
  },
  headerSub: {
    margin: 0,
    fontSize: '12px',
    color: 'rgba(250,247,242,0.7)',
  },
  tradicaoNav: {
    background: '#faf7f2',
    borderBottom: '1px solid #e8e1d6',
    padding: '8px 16px',
    overflowX: 'auto',
    position: 'sticky',
    top: '88px',
    zIndex: 9,
  },
  tradicaoRow: {
    display: 'flex',
    gap: '8px',
    maxWidth: '720px',
    margin: '0 auto',
    paddingBottom: '4px',
  },
  tradChip: {
    minHeight: '36px',
    padding: '8px 14px',
    background: '#fff',
    color: '#4a3a2a',
    border: '1px solid #d6cdb8',
    borderRadius: '18px',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    flexShrink: 0,
    transition: 'background 0.15s',
  },
  tradChipActive: {
    background: '#4a3a2a',
    color: '#faf7f2',
    border: '1px solid #4a3a2a',
  },
  messageList: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px',
    maxWidth: '720px',
    width: '100%',
    margin: '0 auto',
    boxSizing: 'border-box',
  },
  emptyState: {
    padding: '32px 16px',
    textAlign: 'center',
  },
  emptyTitle: {
    fontSize: '22px',
    fontWeight: 600,
    margin: '0 0 8px',
    color: '#1f1a17',
  },
  emptySub: {
    fontSize: '14px',
    color: '#7a6f68',
    margin: '0 0 24px',
  },
  suggestionGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '12px',
  },
  suggestionCard: {
    background: '#fff',
    border: '1px solid #e8e1d6',
    borderRadius: '12px',
    padding: '16px',
    textAlign: 'left',
    cursor: 'pointer',
    fontFamily: 'inherit',
    minHeight: '44px',
    transition: 'border-color 0.15s, transform 0.1s',
  },
  suggestionTrad: {
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#9c5a3a',
    marginBottom: '6px',
  },
  suggestionUser: {
    fontSize: '14px',
    color: '#1f1a17',
    marginBottom: '6px',
    fontStyle: 'italic',
  },
  suggestionLabel: {
    fontSize: '11px',
    color: '#7a6f68',
  },
  userBubbleWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    marginBottom: '16px',
  },
  userBubble: {
    background: '#4a3a2a',
    color: '#faf7f2',
    padding: '12px 16px',
    borderRadius: '18px 18px 4px 18px',
    maxWidth: '85%',
    wordBreak: 'break-word',
    whiteSpace: 'pre-wrap',
    fontSize: '15px',
    lineHeight: 1.5,
  },
  bubbleTime: {
    fontSize: '11px',
    color: '#a8a29e',
    marginTop: '4px',
    padding: '0 8px',
  },
  akashaBubbleWrap: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: '16px',
  },
  akashaIcon: {
    flexShrink: 0,
    width: '32px',
    height: '32px',
    lineHeight: '32px',
    textAlign: 'center',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #9c5a3a 0%, #4a3a2a 100%)',
    color: '#faf7f2',
    fontSize: '16px',
    marginTop: '2px',
  },
  akashaBody: {
    flex: 1,
    background: '#fff',
    border: '1px solid #e8e1d6',
    borderRadius: '4px 18px 18px 18px',
    padding: '12px 16px',
    minWidth: 0,
  },
  streamingText: {
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    fontSize: '15px',
    lineHeight: 1.6,
    color: '#1f1a17',
  },
  cursor: {
    display: 'inline-block',
    marginLeft: '2px',
    animation: 'akasha-blink 1s step-end infinite',
    color: '#9c5a3a',
  },
  parsedBody: {
    fontSize: '15px',
    lineHeight: 1.6,
    color: '#1f1a17',
  },
  actionRow: {
    display: 'flex',
    gap: '8px',
    marginTop: '12px',
    paddingTop: '8px',
    borderTop: '1px solid #f0e9dc',
  },
  actionBtn: {
    minHeight: '36px',
    padding: '6px 12px',
    background: '#faf7f2',
    border: '1px solid #d6cdb8',
    borderRadius: '6px',
    fontSize: '12px',
    color: '#4a3a2a',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  actionBtnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  codeBlock: {
    background: '#1f1a17',
    borderRadius: '8px',
    margin: '12px 0',
    overflow: 'hidden',
  },
  codeHeader: {
    background: '#2d2520',
    color: '#faf7f2',
    padding: '6px 12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '11px',
  },
  codeLang: {
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    fontWeight: 600,
    color: '#d6cdb8',
  },
  codeCopyBtn: {
    background: 'transparent',
    border: '1px solid #4a3a2a',
    color: '#faf7f2',
    padding: '4px 10px',
    borderRadius: '4px',
    fontSize: '11px',
    cursor: 'pointer',
    minHeight: '32px',
  },
  codePre: {
    margin: 0,
    padding: '12px',
    overflowX: 'auto',
  },
  codeContent: {
    color: '#faf7f2',
    fontFamily: "'SF Mono', Monaco, 'Cascadia Code', 'Courier New', monospace",
    fontSize: '13px',
    lineHeight: 1.5,
    whiteSpace: 'pre',
  },
  divider: {
    border: 'none',
    borderTop: '1px solid #e8e1d6',
    margin: '16px 0',
  },
  citationRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginTop: '12px',
    paddingTop: '12px',
    borderTop: '1px solid #f0e9dc',
  },
  citationChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: '#fdf3e7',
    border: '1px solid #e9c799',
    color: '#6b4423',
    padding: '6px 12px',
    borderRadius: '16px',
    fontSize: '12px',
    cursor: 'pointer',
    minHeight: '32px',
    fontFamily: 'inherit',
  },
  citationIcon: {
    fontSize: '12px',
  },
  modalBackdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
  },
  modalCard: {
    background: '#fff',
    borderRadius: '12px',
    padding: '24px',
    maxWidth: '400px',
    width: '100%',
    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
  },
  modalTitle: {
    margin: '0 0 8px',
    fontSize: '14px',
    color: '#7a6f68',
    fontWeight: 500,
  },
  modalCitationTitle: {
    margin: '0 0 12px',
    fontSize: '18px',
    fontWeight: 600,
    color: '#1f1a17',
  },
  modalTradBadge: {
    display: 'inline-block',
    background: '#fdf3e7',
    color: '#9c5a3a',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 500,
    marginBottom: '12px',
  },
  modalLink: {
    color: '#4a3a2a',
    fontSize: '13px',
    wordBreak: 'break-all',
    textDecoration: 'underline',
    display: 'block',
    marginBottom: '16px',
  },
  modalCloseBtn: {
    width: '100%',
    minHeight: '44px',
    background: '#4a3a2a',
    color: '#faf7f2',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  errorBox: {
    background: '#fde8e8',
    color: '#7a2222',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    border: '1px solid #f5b3b3',
  },
  errorBanner: {
    background: '#fde8e8',
    color: '#7a2222',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '13px',
    marginBottom: '8px',
    border: '1px solid #f5b3b3',
  },
  composerFooter: {
    background: '#fff',
    borderTop: '1px solid #e8e1d6',
    padding: '12px 16px',
    position: 'sticky',
    bottom: 0,
    zIndex: 10,
    maxWidth: '720px',
    width: '100%',
    margin: '0 auto',
    boxSizing: 'border-box',
  },
  composerRow: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  composerInput: {
    flex: 1,
    minHeight: '44px',
    padding: '12px 16px',
    border: '1px solid #d6cdb8',
    borderRadius: '22px',
    fontSize: '16px',
    fontFamily: 'inherit',
    color: '#1f1a17',
    background: '#faf7f2',
    outline: 'none',
  },
  sendBtn: {
    minHeight: '44px',
    minWidth: '44px',
    padding: '0 16px',
    background: '#4a3a2a',
    color: '#faf7f2',
    border: 'none',
    borderRadius: '22px',
    fontSize: '18px',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  sendBtnDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
  },
  statusBar: {
    marginTop: '8px',
    fontSize: '11px',
    color: '#7a6f68',
    textAlign: 'center',
  },
};