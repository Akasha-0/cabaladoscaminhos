'use client';

// ============================================================================
// FeedbackForm — formulário client-side (Wave 33)
// ============================================================================
// POST /api/feedback com 3/dia rate limit. Exibe mensagens de erro/sucesso
// com aria-live. Reset após sucesso. Acessibilidade: labels associadas,
// focus trap submit, indicadores de erro inline.
//
// NÃO inclui upload de screenshot neste PR (placeholder visual; upload
// virá em wave futura via /api/upload + presigned URL).
// ============================================================================

import { useState } from 'react';

type FeedbackType = 'BUG' | 'FEATURE' | 'CONTENT' | 'USABILITY' | 'COMMUNITY' | 'OTHER';

const TYPES: Array<{ value: FeedbackType; label: string; description: string; emoji: string }> = [
  { value: 'BUG', label: 'Bug', description: 'Algo não funcionou como esperado.', emoji: '🐛' },
  { value: 'FEATURE', label: 'Ideia', description: 'Sugiro uma funcionalidade nova.', emoji: '💡' },
  { value: 'CONTENT', label: 'Conteúdo', description: 'Tema, ritual, explicação ou artigo.', emoji: '📜' },
  { value: 'USABILITY', label: 'Usabilidade', description: 'Confuso, difícil de achar, layout.', emoji: '🎨' },
  { value: 'COMMUNITY', label: 'Comunidade', description: 'Moderação, regras, convivência.', emoji: '🤝' },
  { value: 'OTHER', label: 'Outro', description: 'Algo que não se encaixa acima.', emoji: '✨' },
];

export function FeedbackForm() {
  const [type, setType] = useState<FeedbackType>('BUG');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ id: string; remaining: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (message.trim().length < 10) {
      setError('Mensagem muito curta — conte mais (mínimo 10 caracteres).');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          category: category.trim() || null,
          rating,
          message: message.trim(),
          metadata: { source: 'feedback_page' },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 429) {
          setError(data.message ?? 'Limite diário atingido. Tente amanhã.');
        } else {
          setError(data.message ?? 'Erro ao enviar. Tente novamente.');
        }
        return;
      }
      setSuccess({ id: data.id, remaining: data.remaining ?? 0 });
      setMessage('');
      setCategory('');
      setRating(null);
    } catch {
      setError('Erro de conexão. Verifique sua internet e tente novamente.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
      aria-describedby={error ? 'feedback-error' : success ? 'feedback-success' : undefined}
      noValidate
    >
      {/* Type */}
      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-foreground">
          Tipo de feedback
        </legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3" role="radiogroup">
          {TYPES.map((t) => (
            <label
              key={t.value}
              className={`flex cursor-pointer flex-col gap-1 rounded-lg border p-3 text-sm transition-colors ${
                type === t.value
                  ? 'border-spiritual-gold bg-spiritual-gold/10'
                  : 'border-border hover:border-spiritual-gold/50'
              }`}
            >
              <input
                type="radio"
                name="feedback-type"
                value={t.value}
                checked={type === t.value}
                onChange={() => setType(t.value)}
                className="sr-only"
              />
              <span className="text-lg" aria-hidden="true">{t.emoji}</span>
              <span className="font-medium text-foreground">{t.label}</span>
              <span className="text-xs text-muted-foreground">{t.description}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Category (free text) */}
      <div>
        <label htmlFor="feedback-category" className="mb-1 block text-sm font-semibold text-foreground">
          Categoria (opcional)
        </label>
        <input
          id="feedback-category"
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="ex: notificações, grupos, posts…"
          maxLength={64}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-spiritual-gold focus:outline-none focus:ring-2 focus:ring-spiritual-gold/30"
        />
      </div>

      {/* Message */}
      <div>
        <label htmlFor="feedback-message" className="mb-1 block text-sm font-semibold text-foreground">
          Sua mensagem <span className="text-red-500" aria-hidden="true">*</span>
          <span className="ml-2 text-xs font-normal text-muted-foreground">
            ({message.length}/4000)
          </span>
        </label>
        <textarea
          id="feedback-message"
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Descreva o que aconteceu, o que esperava, e o que aconteceu de fato. Quanto mais detalhes, melhor."
          rows={6}
          maxLength={4000}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-spiritual-gold focus:outline-none focus:ring-2 focus:ring-spiritual-gold/30"
        />
      </div>

      {/* Rating (1-5) */}
      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-foreground">
          Como você avaliaria a experiência hoje? (opcional)
        </legend>
        <div className="flex gap-2" role="radiogroup">
          {[1, 2, 3, 4, 5].map((n) => (
            <label
              key={n}
              className={`flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border text-lg transition-colors ${
                rating === n
                  ? 'border-spiritual-gold bg-spiritual-gold text-background'
                  : 'border-border hover:border-spiritual-gold/50'
              }`}
              aria-label={`${n} estrelas`}
            >
              <input
                type="radio"
                name="feedback-rating"
                value={n}
                checked={rating === n}
                onChange={() => setRating(n)}
                className="sr-only"
              />
              {n <= 2 ? '😞' : n === 3 ? '😐' : n === 4 ? '🙂' : '🤩'}
            </label>
          ))}
        </div>
      </fieldset>

      {/* Status messages */}
      {error && (
        <div
          id="feedback-error"
          role="alert"
          className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300"
        >
          {error}
        </div>
      )}
      {success && (
        <div
          id="feedback-success"
          role="status"
          className="rounded-md border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-700 dark:text-green-300"
        >
          <strong>Mensagem recebida!</strong> Id de referência: <code className="font-mono text-xs">{success.id}</code>.
          Você ainda pode enviar mais {success.remaining} hoje.
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-spiritual-gold px-6 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-spiritual-gold/40"
      >
        {submitting ? 'Enviando…' : 'Enviar feedback'}
      </button>
    </form>
  );
}
