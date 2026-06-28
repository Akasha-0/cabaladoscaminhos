// ============================================================================
// DraftEditor — editor de rascunho com auto-save (2026-06-27, Onda 14b)
// ============================================================================
// Mobile-first. Mostra indicator do estado do auto-save no rodapé.
// Estrutura:
//   - Textarea principal (conteúdo)
//   - Input título (opcional, segunda linha)
//   - Rodapé: indicator (idle/dirty/saving/saved/error) + "Salvar agora"
//
// Props:
//   - initialDraftId: id do draft existente (null se for novo)
//   - initialContent / initialTitle / initialTradition / initialTopic / initialTags
//   - onPublish: callback opcional chamado quando usuário clica em "Publicar"
//
// Por que <textarea> em vez de um rich-text editor?
//   - Zero dependências extras (atende o limite de "NÃO instalar libs")
//   - Conteúdo do rascunho vai como markdown e é renderizado pelo feed depois
//   - Performance: <textarea> é nativo e lida bem com textos longos
// ============================================================================

'use client';

import { useCallback, useMemo, useState } from 'react';
import { useAutoSave } from '@/hooks/use-auto-save';
import type { AutoSaveStatus } from '@/hooks/use-auto-save';
import { ScheduleDialog } from './ScheduleDialog';

export interface DraftEditorProps {
  initialDraftId?: string | null;
  initialTitle?: string | null;
  initialContent?: string;
  initialTradition?: string | null;
  initialTopic?: string | null;
  initialTags?: string[];
  /** Auto-save ligado por padrão. Default: true */
  autoSaveEnabled?: boolean;
  /** Chamado após o usuário clicar em "Publicar agora". */
  onPublish?: (payload: {
    title: string;
    content: string;
    tradition: string | null;
    topic: string | null;
    tags: string[];
  }) => void | Promise<void>;
  /** Chamado após agendar (programado para o futuro). */
  onScheduled?: (payload: {
    postId: string;
    scheduledFor: string;
  }) => void;
  /** Se já existe um post criado a partir deste draft, exibe o botão "Agendar". */
  publishedPostId?: string | null;
}

function statusLabel(status: AutoSaveStatus, lastSavedAt: Date | null): string {
  switch (status) {
    case 'saving':
      return 'Salvando…';
    case 'saved':
      return lastSavedAt
        ? `Salvo às ${lastSavedAt.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
          })}`
        : 'Salvo';
    case 'dirty':
      return 'Alterações não salvas';
    case 'error':
      return 'Falha ao salvar';
    default:
      return 'Tudo certo';
  }
}

function statusDotClass(status: AutoSaveStatus): string {
  switch (status) {
    case 'saving':
      return 'bg-amber-500 animate-pulse';
    case 'saved':
      return 'bg-emerald-500';
    case 'dirty':
      return 'bg-amber-400';
    case 'error':
      return 'bg-red-500';
    default:
      return 'bg-zinc-400';
  }
}

export function DraftEditor(props: DraftEditorProps) {
  const {
    initialDraftId = null,
    initialTitle = '',
    initialContent = '',
    initialTradition = null,
    initialTopic = null,
    initialTags = [],
    autoSaveEnabled = true,
    onPublish,
    onScheduled,
    publishedPostId = null,
  } = props;

  const [title, setTitle] = useState<string>(initialTitle ?? '');
  const [content, setContent] = useState<string>(initialContent ?? '');
  const [tradition, setTradition] = useState<string | null>(initialTradition);
  const [topic, setTopic] = useState<string>(initialTopic ?? '');
  const [tagsInput, setTagsInput] = useState<string>(initialTags.join(', '));
  const [scheduleOpen, setScheduleOpen] = useState(false);

  // Auto-save: usa o `content` como fonte de verdade do "dirty"
  const { status, lastSavedAt, save, error } = useAutoSave({
    draftId: initialDraftId,
    content,
    intervalMs: 5000,
    enabled: autoSaveEnabled,
  });

  const parsedTags = useMemo(
    () =>
      tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0)
        .slice(0, 15),
    [tagsInput]
  );

  const handlePublish = useCallback(async () => {
    // Antes de publicar, garante o último save
    await save();
    await onPublish?.({
      title,
      content,
      tradition,
      topic: topic.trim() || null,
      tags: parsedTags,
    });
  }, [save, onPublish, title, content, tradition, topic, parsedTags]);

  return (
    <section
      className="flex w-full flex-col gap-3 px-4 py-3 sm:px-6 sm:py-4"
      aria-label="Editor de rascunho"
    >
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Título (opcional)"
        maxLength={200}
        className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
      />

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="No que você está meditando hoje?"
        rows={10}
        maxLength={40_000}
        className="min-h-[240px] w-full resize-y rounded-md border border-zinc-300 bg-white px-3 py-2 text-base leading-relaxed text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        aria-label="Conteúdo do rascunho"
      />

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <input
          type="text"
          value={tradition ?? ''}
          onChange={(e) =>
            setTradition(e.target.value.trim() ? e.target.value.trim() : null)
          }
          placeholder="Tradição (cabala, ifá, tantra, ...)"
          maxLength={50}
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Tópico (meditação, ervas, rituais...)"
          maxLength={80}
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </div>

      <input
        type="text"
        value={tagsInput}
        onChange={(e) => setTagsInput(e.target.value)}
        placeholder="Tags separadas por vírgula"
        className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        aria-label="Tags do rascunho"
      />

      {/* Rodapé: status do auto-save + ações */}
      <div className="mt-1 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <span
            className={`inline-block h-2 w-2 rounded-full ${statusDotClass(status)}`}
            aria-hidden="true"
          />
          <span aria-live="polite">{statusLabel(status, lastSavedAt)}</span>
          {error && (
            <span className="text-red-500" title={error}>
              ({error.slice(0, 60)})
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void save()}
            disabled={status === 'saving'}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Salvar agora
          </button>
          {publishedPostId && (
            <button
              type="button"
              onClick={() => setScheduleOpen(true)}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              Agendar
            </button>
          )}
          <button
            type="button"
            onClick={() => void handlePublish()}
            disabled={!content.trim() || status === 'saving'}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Publicar
          </button>
        </div>
      </div>

      {publishedPostId && (
        <ScheduleDialog
          open={scheduleOpen}
          onOpenChange={setScheduleOpen}
          postId={publishedPostId}
          onScheduled={(scheduledFor) => {
            setScheduleOpen(false);
            onScheduled?.({ postId: publishedPostId, scheduledFor });
          }}
        />
      )}
    </section>
  );
}
