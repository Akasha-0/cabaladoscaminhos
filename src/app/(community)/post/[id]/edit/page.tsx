'use client';

// ============================================================================
// POST EDIT — /post/[id]/edit
// =========================================================================
// Página de edição de um post existente. Somente o autor pode editar
// (validação server-side em PATCH /api/posts/[id]).
//
// Comportamento:
//   1. Carrega o post via GET /api/posts/[id]
//   2. Se viewer != author → toast erro + redireciona para /feed
//   3. Pré-popula form com content/type/tradition/topic
//   4. Submit chama PATCH /api/posts/[id] → router.push('/post/[id]')
//   5. Cancel volta para /post/[id]
//
// Acessibilidade:
//   - 44px touch targets (mobile-first)
//   - labels associadas, focus-visible, aria-describedby para erros
//   - autofocus no textarea
// ============================================================================

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Save, AlertCircle, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import type { ApiResponse, Post, PostType } from '@/types/community';

const TRADITION_OPTIONS = [
  { value: '', label: 'Nenhuma' },
  { value: 'cabala', label: 'Cabala' },
  { value: 'ifa', label: 'Ifá' },
  { value: 'astrologia', label: 'Astrologia' },
  { value: 'tantra', label: 'Tantra' },
  { value: 'reiki', label: 'Reiki' },
  { value: 'meditacao', label: 'Meditação' },
  { value: 'xamanismo', label: 'Xamanismo' },
  { value: 'cristianismo-mistico', label: 'Cristianismo Místico' },
  { value: 'sufismo', label: 'Sufismo' },
  { value: 'taoismo', label: 'Taoísmo' },
  { value: 'umbanda', label: 'Umbanda' },
  { value: 'candomble', label: 'Candomblé' },
];

const POST_TYPES: Array<{ value: PostType; label: string }> = [
  { value: 'TEXT', label: 'Texto' },
  { value: 'QUESTION', label: 'Pergunta' },
  { value: 'EXPERIENCE', label: 'Experiência' },
  { value: 'PRACTICE', label: 'Prática' },
  { value: 'ARTICLE', label: 'Artigo' },
  { value: 'LINK', label: 'Link' },
];

export default function PostEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const postId = params?.id ?? '';

  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);

  const [content, setContent] = useState('');
  const [type, setType] = useState<PostType>('TEXT');
  const [tradition, setTradition] = useState<string>('');
  const [topic, setTopic] = useState('');

  // Carrega o post e pré-popula o form
  useEffect(() => {
    if (!postId) return;
    let cancelled = false;
    const ac = new AbortController();

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/posts/${postId}`, {
          signal: ac.signal,
          headers: { 'Content-Type': 'application/json' },
        });
        const json = (await res.json().catch(() => null)) as ApiResponse<Post> | null;
        if (cancelled) return;
        if (!res.ok || !json?.data) {
          setError(json?.error?.message ?? `Post não encontrado (HTTP ${res.status})`);
          return;
        }
        const p = json.data;
        // Autorização client-side: viewer precisa ser o autor.
        // O servidor re-valida em PATCH, então este check é só UX.
        if (user && p.author.id !== user.id) {
          setForbidden(true);
          return;
        }
        setContent(p.content);
        setType(p.type);
        setTradition(p.tradition ?? '');
        setTopic(p.topic ?? '');
      } catch (err) {
        if (cancelled) return;
        if (err instanceof Error && err.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : 'Erro de rede');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
      ac.abort();
    };
  }, [postId, user]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!postId || saving) return;
    setError(null);

    const trimmed = content.trim();
    if (trimmed.length < 1) {
      setError('Conteúdo não pode estar vazio');
      return;
    }
    if (trimmed.length > 4000) {
      setError('Conteúdo muito longo (máx 4000 caracteres)');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: trimmed,
          type,
          tradition: tradition || null,
          topic: topic.trim() || null,
        }),
      });
      const json = (await res.json().catch(() => null)) as ApiResponse<Post> | null;
      if (!res.ok || !json?.data) {
        setError(json?.error?.message ?? `Falha ao salvar (HTTP ${res.status})`);
        return;
      }
      // Sucesso — volta para o detalhe do post
      router.push(`/post/${postId}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro de rede');
    } finally {
      setSaving(false);
    }
  }

  // ─── Loading ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <main id="main-content" tabIndex={-1} className="focus:outline-none max-w-2xl mx-auto px-4 py-6">
        <div
          className="flex items-center justify-center py-12 text-slate-400"
          aria-live="polite"
        >
          <Loader2 className="w-5 h-5 mr-2 animate-spin" aria-hidden="true" />
          Carregando post…
        </div>
      </main>
    );
  }

  // ─── Forbidden (não é o autor) ─────────────────────────────────────────
  if (forbidden) {
    return (
      <main id="main-content" tabIndex={-1} className="focus:outline-none max-w-2xl mx-auto px-4 py-6 space-y-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/post/${postId}`)}
          className="min-h-[44px] text-slate-300 hover:text-amber-300"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Voltar para o post
        </Button>
        <Card className="bg-slate-900/40 border-red-500/30">
          <CardContent className="pt-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <h1 className="text-lg font-semibold text-slate-100">
                Você não pode editar este post
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Apenas o autor original pode editar o conteúdo. Se você é o autor,
                faça login com a conta correta.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  // ─── Editor ────────────────────────────────────────────────────────────
  return (
    <main id="main-content" tabIndex={-1} className="focus:outline-none max-w-2xl mx-auto px-4 py-4 sm:py-6 space-y-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push(`/post/${postId}`)}
        className="min-h-[44px] text-slate-300 hover:text-amber-300"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5" />
        Cancelar
      </Button>

      <Card className="bg-slate-900/40 border-slate-800/50">
        <CardHeader className="pb-3">
          <h1 className="text-xl md:text-2xl font-cinzel bg-gradient-to-r from-amber-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
            Editar post
          </h1>
          <p className="text-xs text-slate-500">
            Suas alterações serão salvas e refletidas imediatamente no feed.
          </p>
        </CardHeader>
        <CardContent className="pt-0">
          <form onSubmit={handleSave} className="space-y-4" noValidate>
            {/* Type */}
            <div>
              <label
                htmlFor="post-type"
                className="block text-sm font-medium text-slate-300 mb-1.5"
              >
                Tipo
              </label>
              <select
                id="post-type"
                value={type}
                onChange={(e) => setType(e.target.value as PostType)}
                className="w-full min-h-[44px] rounded-lg bg-slate-800/60 border border-slate-700 px-3 text-sm text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60"
              >
                {POST_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Content */}
            <div>
              <label
                htmlFor="post-content"
                className="block text-sm font-medium text-slate-300 mb-1.5"
              >
                Conteúdo
              </label>
              <Textarea
                id="post-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Escreva seu post…"
                rows={8}
                autoFocus
                maxLength={4000}
                required
                aria-describedby={error ? 'post-edit-error' : 'post-edit-counter'}
                className="min-h-[120px] text-base"
              />
              <div className="flex justify-between items-center mt-1.5">
                <span
                  id="post-edit-counter"
                  className="text-xs text-slate-500"
                  aria-live="polite"
                >
                  {content.length}/4000
                </span>
              </div>
            </div>

            {/* Tradition */}
            <div>
              <label
                htmlFor="post-tradition"
                className="block text-sm font-medium text-slate-300 mb-1.5"
              >
                Tradição (opcional)
              </label>
              <select
                id="post-tradition"
                value={tradition}
                onChange={(e) => setTradition(e.target.value)}
                className="w-full min-h-[44px] rounded-lg bg-slate-800/60 border border-slate-700 px-3 text-sm text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60"
              >
                {TRADITION_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Topic */}
            <div>
              <label
                htmlFor="post-topic"
                className="block text-sm font-medium text-slate-300 mb-1.5"
              >
                <Hash className="w-3 h-3 inline mr-1" aria-hidden="true" />
                Tópico (opcional)
              </label>
              <input
                id="post-topic"
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="ex: cabala-estoica"
                maxLength={80}
                className="w-full min-h-[44px] rounded-lg bg-slate-800/60 border border-slate-700 px-3 text-sm text-slate-100 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60"
              />
            </div>

            {/* Error */}
            {error && (
              <div
                id="post-edit-error"
                role="alert"
                className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-sm text-red-300"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2">
              <Button
                type="submit"
                disabled={saving || content.trim().length === 0}
                className="min-h-[44px] bg-gradient-to-r from-amber-500 to-violet-500 text-white hover:from-amber-400 hover:to-violet-400 focus-visible:ring-amber-500/60"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" aria-hidden="true" />
                    Salvando…
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-1.5" aria-hidden="true" />
                    Salvar alterações
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push(`/post/${postId}`)}
                disabled={saving}
                className="min-h-[44px] text-slate-300 hover:text-amber-300"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}