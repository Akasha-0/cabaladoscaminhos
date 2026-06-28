'use client';

// ============================================================================
// Newsletter signup form (client component) — Wave 14, 2026-06-27
// ============================================================================
// POST /api/newsletter/subscribe com { email, traditions[], frequency }
// Em sucesso, mostra confirmação + permite ajustar preferências via PATCH.
// ============================================================================

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Tradition {
  slug: string;
  label: string;
}

interface Props {
  traditions: Tradition[];
}

type Status = 'idle' | 'submitting' | 'success' | 'error';

export function NewsletterSignupForm({ traditions }: Props) {
  const [email, setEmail] = useState('');
  const [frequency, setFrequency] = useState<'WEEKLY' | 'MONTHLY' | 'NEVER'>(
    'WEEKLY'
  );
  const [selectedTraditions, setSelectedTraditions] = useState<Set<string>>(
    new Set()
  );
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const toggleTradition = (slug: string) => {
    setSelectedTraditions((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
      }
      return next;
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage(null);
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          traditions: Array.from(selectedTraditions),
          frequency,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus('error');
        setErrorMessage(data.error ?? 'Falha ao inscrever');
        return;
      }
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Erro de rede');
    }
  };

  if (status === 'success') {
    return (
      <div className="space-y-4 text-center">
        <p className="font-serif text-2xl text-spiritual-gold">
          ✦ Inscrição confirmada
        </p>
        <p className="text-sm text-muted-foreground">
          Em breve você receberá o digest em <strong>{email}</strong>.
          Cancele a qualquer momento pelo link no rodapé do email.
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setStatus('idle');
            setEmail('');
            setSelectedTraditions(new Set());
            setFrequency('WEEKLY');
          }}
        >
          Inscrever outro email
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label
          htmlFor="newsletter-email"
          className="block text-sm font-medium text-foreground"
        >
          Email
        </label>
        <Input
          id="newsletter-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com"
          maxLength={255}
          autoComplete="email"
        />
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-foreground">
          Tradições de interesse
        </legend>
        <p className="text-xs text-muted-foreground">
          Vazio = você recebe tudo. Selecione para filtrar.
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {traditions.map((t) => {
            const checked = selectedTraditions.has(t.slug);
            return (
              <label
                key={t.slug}
                className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${
                  checked
                    ? 'border-spiritual-gold bg-spiritual-gold/10 text-foreground'
                    : 'border-border bg-background text-muted-foreground hover:border-spiritual-gold/50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleTradition(t.slug)}
                  className="accent-spiritual-gold"
                />
                {t.label}
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-foreground">
          Frequência
        </legend>
        <div className="flex gap-2">
          {(
            [
              { value: 'WEEKLY', label: 'Semanal' },
              { value: 'MONTHLY', label: 'Mensal' },
              { value: 'NEVER', label: 'Pausar' },
            ] as const
          ).map((opt) => (
            <label
              key={opt.value}
              className={`flex-1 cursor-pointer rounded-md border px-3 py-2 text-center text-sm transition-colors ${
                frequency === opt.value
                  ? 'border-spiritual-gold bg-spiritual-gold/10 text-foreground'
                  : 'border-border bg-background text-muted-foreground hover:border-spiritual-gold/50'
              }`}
            >
              <input
                type="radio"
                name="frequency"
                value={opt.value}
                checked={frequency === opt.value}
                onChange={() => setFrequency(opt.value)}
                className="sr-only"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </fieldset>

      {errorMessage && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {errorMessage}
        </p>
      )}

      <Button
        type="submit"
        variant="golden"
        disabled={status === 'submitting' || email.length === 0}
        className="w-full"
      >
        {status === 'submitting' ? 'Inscrevendo…' : 'Inscrever'}
      </Button>
    </form>
  );
}
