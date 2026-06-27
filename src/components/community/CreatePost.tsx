'use client';

// ============================================================================
// CreatePost — Caixa de composição de novo post
// ============================================================================
// Textarea + select de tipo + tradição + GRUPO (opcional, ou "feed geral").
// Validação client via Zod; submit chama o callback onCreate com input pronto.
// ============================================================================

import React, { useEffect, useState } from 'react';
import { Send, Loader2, BookOpen, Lightbulb, Star, Leaf, Hash, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { CreatePostSchema } from '@/lib/validators/posts';
import type { CreatePostInput } from '@/lib/validators/posts';
import { useGroupsList, type GroupDto } from '@/hooks/useGroups';

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

const POST_TYPES: Array<{
  value: CreatePostInput['type'];
  icon: React.ReactNode;
  label: string;
}> = [
  { value: 'TEXT', icon: <BookOpen className="w-3 h-3" />, label: 'Texto' },
  { value: 'QUESTION', icon: <Lightbulb className="w-3 h-3" />, label: 'Pergunta' },
  { value: 'EXPERIENCE', icon: <Star className="w-3 h-3" />, label: 'Experiência' },
  { value: 'PRACTICE', icon: <Leaf className="w-3 h-3" />, label: 'Prática' },
];

export interface CreatePostProps {
  /** Callback chamado após validação client OK */
  onCreate: (input: CreatePostInput) => Promise<{ ok: boolean; error?: string }>;
  /** Se informado, mostra o nome no avatar */
  userInitials?: string;
  /** Disabled durante submit */
  loading?: boolean;
  /** Filtrar grupos por tradição específica (ex: quando estamos dentro de um grupo) */
  traditionFilter?: string;
  /** Slug pré-selecionado (quando o componente aparece dentro da página de um grupo) */
  defaultGroupSlug?: string;
  /** dev user id para auth bypass em testes/sandbox */
  devUserId?: string;
  /** Quando true, oculta o dropdown de grupo (ex: já estamos num grupo fixo) */
  hideGroupSelector?: boolean;
}

export function CreatePost({
  onCreate,
  userInitials = 'VC',
  loading,
  traditionFilter,
  defaultGroupSlug,
  devUserId,
  hideGroupSelector = false,
}: CreatePostProps) {
  const [content, setContent] = useState('');
  const [type, setType] = useState<CreatePostInput['type']>('TEXT');
  const [tradition, setTradition] = useState<string>('');
  const [topic, setTopic] = useState('');
  const [groupSlug, setGroupSlug] = useState<string>(defaultGroupSlug ?? '');
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Busca grupos para o dropdown (só meus grupos + grupos públicos)
  const { groups } = useGroupsList({
    mine: true,
    devUserId,
    ...(traditionFilter ? { tradition: traditionFilter } : {}),
  });
  const publicGroups = useGroupsList({ devUserId });

  // Combina: meus grupos primeiro, depois públicos que ainda não aparecem
  const groupOptions: GroupDto[] = (() => {
    const mine = groups.filter((g) => g.isMember);
    const publics = publicGroups.groups.filter(
      (g) => g.isPublic && !mine.some((m) => m.slug === g.slug)
    );
    return [...mine, ...publics];
  })();

  // Sincroniza defaultGroupSlug quando muda
  useEffect(() => {
    if (defaultGroupSlug) setGroupSlug(defaultGroupSlug);
  }, [defaultGroupSlug]);

  const charCount = content.length;
  const charLimit = 4000;
  const isOverLimit = charCount > charLimit;
  const isEmpty = content.trim().length === 0;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isEmpty || isOverLimit) return;

    const input: CreatePostInput = {
      content: content.trim(),
      type,
      tradition: tradition || null,
      topic: topic.trim() || null,
      groupSlug: groupSlug || null,
    };

    const parsed = CreatePostSchema.safeParse(input);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      setError(first?.message ?? 'Dados inválidos');
      return;
    }

    setError(null);
    setSubmitting(true);

    const result = await onCreate(parsed.data);
    setSubmitting(false);

    if (!result.ok) {
      setError(result.error ?? 'Não foi possível publicar');
      return;
    }

    // Reset
    setContent('');
    setType('TEXT');
    setTradition('');
    setTopic('');
    setGroupSlug(defaultGroupSlug ?? '');
    setExpanded(false);
  };

  return (
    <Card
      data-testid="create-post"
      className="card-spiritual bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-sm border-slate-800/50"
    >
      <CardContent className="pt-4">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <Avatar className="w-10 h-10 border-2 border-amber-500/20 flex-shrink-0">
            <AvatarFallback className="bg-gradient-to-br from-amber-500/20 to-violet-500/20 text-amber-300 text-sm">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-3 min-w-0">
            <Textarea
              placeholder={
                groupSlug
                  ? 'Compartilhe algo com o grupo…'
                  : 'O que você quer compartilhar com a comunidade?'
              }
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onFocus={() => setExpanded(true)}
              className="min-h-[60px] bg-slate-800/30 border-slate-700/30 focus:border-amber-500/50 resize-none"
              data-testid="create-post-textarea"
              aria-label="Conteúdo do post"
            />

            {expanded && (
              <>
                <div className="flex flex-wrap items-center gap-1">
                  {POST_TYPES.map((pt) => (
                    <button
                      key={pt.value}
                      type="button"
                      onClick={() => setType(pt.value)}
                      className={cn(
                        'flex items-center gap-1 px-3 py-2 rounded-lg text-sm transition-all min-h-[44px]',
                        type === pt.value
                          ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                      )}
                      aria-pressed={type === pt.value}
                    >
                      {pt.icon}
                      {pt.label}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <label className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Hash className="w-3 h-3" />
                    <span>Tradição:</span>
                    <select
                      value={tradition}
                      onChange={(e) => setTradition(e.target.value)}
                      className="bg-slate-800/40 border border-slate-700/40 rounded-md px-2 py-0.5 text-xs text-slate-200 focus:border-amber-500/50 focus:outline-none"
                      aria-label="Tradição"
                    >
                      {TRADITION_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-slate-400 flex-1 min-w-[160px]">
                    <span>Tópico:</span>
                    <input
                      type="text"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="ex: meditação"
                      maxLength={80}
                      className="bg-slate-800/40 border border-slate-700/40 rounded-md px-2 py-0.5 text-xs text-slate-200 focus:border-amber-500/50 focus:outline-none flex-1"
                      aria-label="Tópico"
                    />
                  </label>
                </div>

                {!hideGroupSelector && (
                  <label className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Users className="w-3 h-3" />
                    <span>Postar em:</span>
                    <select
                      value={groupSlug}
                      onChange={(e) => setGroupSlug(e.target.value)}
                      className="bg-slate-800/40 border border-slate-700/40 rounded-md px-2 py-0.5 text-xs text-slate-200 focus:border-amber-500/50 focus:outline-none"
                      aria-label="Grupo"
                      data-testid="create-post-group-select"
                    >
                      <option value="">Feed geral (sem grupo)</option>
                      {groupOptions.map((g) => (
                        <option key={g.slug} value={g.slug}>
                          {g.name}
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                {error && (
                  <p className="text-xs text-red-300" role="alert">
                    {error}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      'text-xs',
                      isOverLimit ? 'text-red-300' : 'text-slate-500'
                    )}
                  >
                    {charCount}/{charLimit}
                  </span>
                  <Button
                    type="submit"
                    disabled={
                      isEmpty || isOverLimit || submitting || Boolean(loading)
                    }
                    className="bg-gradient-to-r from-amber-500 to-violet-500 hover:from-amber-600 hover:to-violet-600 text-white border-0"
                    data-testid="create-post-submit"
                  >
                    {submitting || loading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    Publicar
                  </Button>
                </div>
              </>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
