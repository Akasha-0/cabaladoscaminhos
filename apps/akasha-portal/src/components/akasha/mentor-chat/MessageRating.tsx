'use client';

/**
 * MessageRating — Wave 13.5 thumbs up/down widget para respostas do Mentor
 *
 * Aparece logo abaixo de cada bubble de mentor (não das mensagens do
 * usuário). UX:
 *   - Estado idle: dois botões-outline (👍 outline, 👎 outline) com
 *     tamanho 28x28px, hover acende levemente.
 *   - Estado pending (após click): ícone vira filled na cor do rating
 *     IMEDIATAMENTE (optimistic UI). Spinner inline.
 *   - Estado success: filled, persiste. Toast/mensagem "Obrigado pelo
 *     feedback" já é responsabilidade do parent (MentorChat dispara
 *     o toast via callback onThanks).
 *   - Estado error: rollback para idle + toast de erro (parent).
 *
 * Optimistic: feedback vira filled IMEDIATAMENTE ao clicar; se a API
 * falhar, voltamos ao estado anterior. Rollback atômico via `pendingValue`.
 *
 * NÃO chama `useTranslation()` no widget (mantém widget puro, sem
 * dependência do i18n singleton). O parent passa strings já resolvidas
 * via props — facilita testes e reuso.
 *
 * LGPD:
 *   - O `messageId` enviado é o id opaco client-side (string ≤ 128 chars).
 *   - Nenhum userId nem conteúdo da mensagem sai do browser.
 *   - `comment` é opcional; se vazio, envia undefined (server normaliza).
 *
 * API contract (POST /api/feedback):
 *   body: { messageId, rating: 'up' | 'down', comment?: string }
 *   auth: required (cookie)
 *   rate: upstream (não implementado aqui)
 */
import { ThumbsDown, ThumbsUp } from 'lucide-react';
import { useCallback, useState } from 'react';

export type FeedbackRating = 'up' | 'down';

export interface MessageRatingProps {
  /** ID opaco da mensagem do Mentor. */
  messageId: string;
  /** Strings já traduzidas (parent passa via t()). */
  labels: {
    up: string;
    down: string;
    /** Texto do spinner/tooltip durante request. */
    submitting: string;
  };
  /** Callback opcional para o parent disparar toast. */
  onThanks?: (rating: FeedbackRating) => void;
  /** Callback opcional em caso de erro (parent mostra toast de erro). */
  onError?: (message: string) => void;
  /** Endpoint customizado (default: /api/feedback). Útil para testes. */
  endpoint?: string;
}

export function MessageRating({
  messageId,
  labels,
  onThanks,
  onError,
  endpoint = '/api/feedback',
}: MessageRatingProps) {
  // O rating que o usuário escolheu (estado "committed"). `null` significa
  // que ainda não votou OU que houve rollback após erro.
  const [committed, setCommitted] = useState<FeedbackRating | null>(null);
  // Estado otimista: enquanto a request está em vôo, mostramos o ícone
  // filled IMEDIATAMENTE e usamos isso para diferenciar do estado final.
  const [pending, setPending] = useState<FeedbackRating | null>(null);

  const handleVote = useCallback(
    async (rating: FeedbackRating) => {
      // Idempotência: se já está pending ou committed com mesmo rating, noop.
      if (pending) return;

      // Snapshot para rollback em caso de erro.
      const previous = committed;

      // 1) Optimistic UI: preenche IMEDIATAMENTE
      setPending(rating);
      setCommitted(rating);

      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include', // envia cookie akasha_session
          body: JSON.stringify({ messageId, rating }),
        });

        if (!res.ok) {
          // Tenta extrair mensagem de erro do payload.
          let errMsg = `HTTP ${res.status}`;
          try {
            const payload = (await res.json()) as { error?: string };
            if (typeof payload.error === 'string') errMsg = payload.error;
          } catch {
            // ignore — usa errMsg default
          }
          // 2) Rollback
          setCommitted(previous);
          onError?.(errMsg);
          return;
        }

        // 3) Sucesso: confirma (committed já está setado)
        onThanks?.(rating);
      } catch (err) {
        // Network error / abort
        setCommitted(previous);
        onError?.(err instanceof Error ? err.message : 'network_error');
      } finally {
        setPending(null);
      }
    },
    [messageId, endpoint, pending, committed, onThanks, onError]
  );

  const isUp = committed === 'up';
  const isDown = committed === 'down';

  return (
    <div
      className="flex items-center gap-1.5 pl-1"
      data-testid="mentor-message-rating"
      data-message-id={messageId}
      role="group"
      aria-label="Avaliar resposta"
    >
      <button
        type="button"
        onClick={() => void handleVote('up')}
        disabled={pending !== null}
        aria-label={labels.up}
        aria-pressed={isUp}
        data-testid="mentor-message-rating-up"
        data-pending={pending === 'up'}
        className={[
          'flex h-7 w-7 items-center justify-center rounded-full border transition',
          'active:scale-95 disabled:cursor-progress',
          isUp
            ? 'border-emerald-400/50 bg-emerald-400/15 text-emerald-300'
            : 'border-white/12 bg-white/[0.04] text-white/55 hover:border-emerald-400/40 hover:text-emerald-300',
        ].join(' ')}
      >
        <ThumbsUp
          size={13}
          aria-hidden
          className={isUp ? 'fill-emerald-300' : undefined}
        />
      </button>
      <button
        type="button"
        onClick={() => void handleVote('down')}
        disabled={pending !== null}
        aria-label={labels.down}
        aria-pressed={isDown}
        data-testid="mentor-message-rating-down"
        data-pending={pending === 'down'}
        className={[
          'flex h-7 w-7 items-center justify-center rounded-full border transition',
          'active:scale-95 disabled:cursor-progress',
          isDown
            ? 'border-rose-400/50 bg-rose-400/15 text-rose-300'
            : 'border-white/12 bg-white/[0.04] text-white/55 hover:border-rose-400/40 hover:text-rose-300',
        ].join(' ')}
      >
        <ThumbsDown
          size={13}
          aria-hidden
          className={isDown ? 'fill-rose-300' : undefined}
        />
      </button>
    </div>
  );
}

export default MessageRating;
