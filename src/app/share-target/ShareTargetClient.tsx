'use client';

/**
 * ShareTargetClient — UI para conteúdo compartilhado via Web Share Target API.
 * ----------------------------------------------------------------------------
 * Mostra preview do que foi compartilhado e permite:
 *   1. Criar um post (link, citação, ou reflexão) pré-preenchido
 *   2. Editar tradição/tópico antes de postar
 *   3. Cancelar e voltar ao feed
 *
 * Fluxo:
 *   - Lê query params (title/text/url)
 *   - Detecta tipo: link | quote | text
 *   - Submete via fetch para /api/posts
 *   - Redireciona para o post criado ou feed
 *
 * Offline: enfileira via sync-queue se navigator.onLine === false
 */

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Share2, Link as LinkIcon, Quote, MessageCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/providers/SupabaseProvider';
import { mutations, flushQueue, registerBackgroundSync } from '@/lib/pwa/sync-queue';
import type { PostType } from '@/lib/validators/posts';

interface ShareTargetClientProps {
  title: string;
  text: string;
  url: string;
}

type ShareType = 'link' | 'quote' | 'text';

function detectType(title: string, text: string, url: string): ShareType {
  if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
    return 'link';
  }
  // Quote: text tem aspas ou parece citação
  if (text && (text.includes('"') || text.includes('"') || text.includes('"'))) {
    return 'quote';
  }
  return 'text';
}

const TYPE_ICONS = {
  link: LinkIcon,
  quote: Quote,
  text: MessageCircle,
} as const;

const TYPE_LABELS = {
  link: 'Compartilhar link',
  quote: 'Compartilhar citação',
  text: 'Compartilhar texto',
} as const;

const TYPE_TO_POST_TYPE: Record<ShareType, PostType> = {
  link: 'LINK',
  quote: 'TEXT',
  text: 'TEXT',
};

export function ShareTargetClient({ title, text, url }: ShareTargetClientProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const type = useMemo(() => detectType(title, text, url), [title, text, url]);
  const Icon = TYPE_ICONS[type];

  // Estado do form
  const [content, setContent] = useState('');
  const [tradition, setTradition] = useState('');
  const [topic, setTopic] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  // ============================================================
  // Inicializa form com base no tipo detectado
  // ============================================================
  useEffect(() => {
    if (typeof window === 'undefined') return;
    setIsOnline(navigator.onLine);
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    // Pre-fill content baseado no tipo
    if (type === 'link' && url) {
      setContent(title ? `${title}\n\n${url}` : url);
    } else if (type === 'quote' && text) {
      setContent(text);
    } else if (type === 'text' && text) {
      setContent(text);
    } else if (url) {
      setContent(url);
    }
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, [type, title, text, url]);

  // ============================================================
  // Submit
  // ============================================================
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!content.trim()) {
        setError('Adicione um conteúdo antes de postar');
        return;
      }
      setError(null);
      setSubmitting(true);

      const payload = {
        content: content.trim(),
        type: TYPE_TO_POST_TYPE[type] as PostType,
        tradition: tradition || undefined,
        topic: topic || undefined,
        mediaUrls: type === 'link' && url ? [url] : undefined,
      };

      try {
        if (isOnline) {
          // Online: POST direto
          const res = await fetch('/api/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (!res.ok) {
            const errBody = await res.json().catch(() => ({}));
            throw new Error(errBody.error ?? `HTTP ${res.status}`);
          }
          const post = await res.json();
          const postId = post?.data?.id ?? post?.id;
          router.push(postId ? `/post/${postId}` : '/feed');
        } else {
          // Offline: enfileira
          await mutations.post({
            content: payload.content,
            tradition: payload.tradition,
            topic: payload.topic,
          });
          await registerBackgroundSync();
          router.push('/feed?shared=queued');
        }
      } catch (err) {
        // Se falhou online (ex: 5xx), tenta enfileirar como fallback
        if (!isOnline) {
          await mutations.post({
            content: payload.content,
            tradition: payload.tradition,
            topic: payload.topic,
          });
          await registerBackgroundSync();
          router.push('/feed?shared=queued');
          return;
        }
        setError(err instanceof Error ? err.message : 'Falha ao compartilhar');
      } finally {
        setSubmitting(false);
      }
    },
    [content, type, url, tradition, topic, isOnline, router]
  );

  // ============================================================
  // Render — auth gate
  // ============================================================
  if (authLoading) {
    return (
      <main id="main-content" tabIndex={-1} className="focus:outline-none min-h-[100dvh] flex items-center justify-center bg-gradient-to-b from-slate-950 to-slate-900">
        <Loader2 className="w-8 h-8 text-[var(--spiritual-gold)] animate-spin" aria-hidden="true" />
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main id="main-content" tabIndex={-1} className="focus:outline-none min-h-[100dvh] flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[var(--spiritual-gold)] to-purple-600 flex items-center justify-center">
            <Share2 className="w-8 h-8 text-black" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-br from-[var(--spiritual-gold)] to-purple-400 bg-clip-text text-transparent mb-3">
            Entre para compartilhar
          </h1>
          <p className="text-slate-300 mb-6">
            Você recebeu conteúdo de outro app. Entre na sua conta Akasha para
            criar um post com este conteúdo.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href={`/login?next=${encodeURIComponent(`/share-target?title=${encodeURIComponent(title)}&text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`)}`}
              className="min-h-[48px] inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[var(--spiritual-gold)] to-amber-500 text-black font-semibold hover:opacity-90 transition"
            >
              Entrar
            </Link>
            <Link
              href="/feed"
              className="min-h-[48px] inline-flex items-center justify-center rounded-xl border border-slate-700 text-slate-100 font-medium hover:bg-slate-800 transition"
            >
              Voltar ao feed
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="focus:outline-none min-h-[100dvh] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950"
      style={{ paddingTop: 'env(safe-area-inset-top, 0)' }}
    >
      {/* Header */}
      <header className="sticky top-0 z-10 bg-slate-950/80 backdrop-blur border-b border-slate-800">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link
            href="/feed"
            aria-label="Voltar"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center -ml-2 rounded-full hover:bg-slate-800 transition"
          >
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
          </Link>
          <h1 className="text-base font-semibold">Compartilhar para Akasha</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Preview do que foi compartilhado */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 mb-6">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
            <Icon className="w-4 h-4" aria-hidden="true" />
            <span>{TYPE_LABELS[type]}</span>
          </div>
          {title && (
            <h2 className="text-sm font-semibold text-slate-100 mb-1">{title}</h2>
          )}
          {text && text !== content && (
            <p className="text-sm text-slate-300 line-clamp-3 mb-2">{text}</p>
          )}
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-[var(--spiritual-gold)] hover:underline break-all"
            >
              <LinkIcon className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
              {url}
            </a>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-slate-200 mb-2">
              Seu post
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              maxLength={4000}
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2.5 text-base text-slate-100 placeholder:text-slate-500 focus:border-[var(--spiritual-gold)] focus:outline-none focus:ring-1 focus:ring-[var(--spiritual-gold)] resize-y"
              placeholder="Compartilhe sua reflexão..."
            />
            <p className="text-xs text-slate-500 mt-1 text-right">
              {content.length}/4000
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="tradition" className="block text-xs font-medium text-slate-300 mb-1.5">
                Tradição (opcional)
              </label>
              <select
                id="tradition"
                value={tradition}
                onChange={(e) => setTradition(e.target.value)}
                className="w-full min-h-[44px] rounded-lg bg-slate-900 border border-slate-700 px-3 text-sm text-slate-100 focus:border-[var(--spiritual-gold)] focus:outline-none"
              >
                <option value="">Selecione...</option>
                <option value="cabala">Cabala</option>
                <option value="ifa">Ifá</option>
                <option value="astrologia">Astrologia</option>
                <option value="tantra">Tantra</option>
                <option value="xamanismo">Xamanismo</option>
                <option value="umbanda">Umbanda</option>
                <option value="candomble">Candomblé</option>
                <option value="budismo">Budismo</option>
                <option value="outra">Outra</option>
              </select>
            </div>
            <div>
              <label htmlFor="topic" className="block text-xs font-medium text-slate-300 mb-1.5">
                Tópico (opcional)
              </label>
              <input
                id="topic"
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                maxLength={80}
                placeholder="ex: meditação, orixás..."
                className="w-full min-h-[44px] rounded-lg bg-slate-900 border border-slate-700 px-3 text-base text-slate-100 placeholder:text-slate-500 focus:border-[var(--spiritual-gold)] focus:outline-none"
              />
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300"
            >
              {error}
            </div>
          )}

          {!isOnline && (
            <div
              role="status"
              className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-300"
            >
              Sem conexão — o post será publicado quando você voltar online.
            </div>
          )}

          <div className="flex flex-col-reverse md:flex-row gap-3 pt-2">
            <Link
              href="/feed"
              className="min-h-[48px] flex-1 inline-flex items-center justify-center rounded-xl border border-slate-700 text-slate-100 font-medium hover:bg-slate-800 transition"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={submitting || !content.trim()}
              className="min-h-[48px] flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--spiritual-gold)] to-amber-500 text-black font-semibold hover:opacity-90 transition disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  Publicando...
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" aria-hidden="true" />
                  Publicar
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default ShareTargetClient;
