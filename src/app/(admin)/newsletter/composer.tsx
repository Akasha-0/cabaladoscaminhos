'use client';

// ============================================================================
// Newsletter composer (client component) — Wave 14, 2026-06-27
// ============================================================================
// POST /api/admin/newsletter/send com header x-admin-secret
// Opções: (1) compor manualmente com subject+markdown, OU (2) auto-compose
// do digest semanal a partir de composeDigest.
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

type Mode = 'auto' | 'manual';

interface SendResponse {
  ok: boolean;
  newsletterId?: string;
  subject?: string;
  mode?: 'live' | 'stub';
  recipientCount?: number;
  delivered?: number;
  failed?: number;
  error?: string;
}

export function NewsletterComposer({ traditions }: Props) {
  const [mode, setMode] = useState<Mode>('auto');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [secret, setSecret] = useState('');
  const [selectedTraditions, setSelectedTraditions] = useState<Set<string>>(
    new Set()
  );
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SendResponse | null>(null);

  const toggleTradition = (slug: string) => {
    setSelectedTraditions((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);
    try {
      const body: Record<string, unknown> = {
        traditions: Array.from(selectedTraditions),
      };
      if (mode === 'auto') {
        body.composeWeekly = true;
      } else {
        body.subject = subject;
        body.contentMarkdown = content;
      }

      const res = await fetch('/api/admin/newsletter/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': secret,
        },
        body: JSON.stringify(body),
      });
      const data: SendResponse = await res.json();
      setResult({ ...data, ok: res.ok && (data.ok ?? false) });
    } catch (err) {
      setResult({
        ok: false,
        error: err instanceof Error ? err.message : 'Erro de rede',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label
          htmlFor="composer-secret"
          className="block text-sm font-medium text-foreground"
        >
          Admin secret (x-admin-secret)
        </label>
        <Input
          id="composer-secret"
          type="password"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          placeholder="ADMIN_NEWSLETTER_SECRET"
          autoComplete="off"
        />
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-foreground">Modo</legend>
        <div className="flex gap-2">
          {(
            [
              { value: 'auto', label: 'Auto (composeDigest)' },
              { value: 'manual', label: 'Manual' },
            ] as const
          ).map((opt) => (
            <label
              key={opt.value}
              className={`flex-1 cursor-pointer rounded-md border px-3 py-2 text-center text-sm transition-colors ${
                mode === opt.value
                  ? 'border-spiritual-gold bg-spiritual-gold/10'
                  : 'border-border bg-background text-muted-foreground hover:border-spiritual-gold/50'
              }`}
            >
              <input
                type="radio"
                name="mode"
                value={opt.value}
                checked={mode === opt.value}
                onChange={() => setMode(opt.value)}
                className="sr-only"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </fieldset>

      {mode === 'manual' && (
        <>
          <div className="space-y-2">
            <label
              htmlFor="composer-subject"
              className="block text-sm font-medium text-foreground"
            >
              Assunto
            </label>
            <Input
              id="composer-subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={200}
              placeholder="🌙 Digest Semanal — 27 de junho de 2026"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="composer-content"
              className="block text-sm font-medium text-foreground"
            >
              Conteúdo (markdown)
            </label>
            <textarea
              id="composer-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={12}
              maxLength={50_000}
              className="w-full rounded-lg border border-input bg-transparent px-3 py-2 font-mono text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              placeholder={'# Digest Semanal\n\n> Olá, caminhante!\n\n## 💬 Posts\n...'}
            />
          </div>
        </>
      )}

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-foreground">
          Filtro de tradições (vazio = todos)
        </legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {traditions.map((t) => {
            const checked = selectedTraditions.has(t.slug);
            return (
              <label
                key={t.slug}
                className={`flex cursor-pointer items-center gap-2 rounded-md border px-2 py-1.5 text-xs transition-colors ${
                  checked
                    ? 'border-spiritual-gold bg-spiritual-gold/10'
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

      <Button
        type="submit"
        variant="golden"
        disabled={
          submitting ||
          secret.length === 0 ||
          (mode === 'manual' && (subject.length === 0 || content.length === 0))
        }
        className="w-full"
      >
        {submitting ? 'Enviando…' : 'Enviar digest agora'}
      </Button>

      {result && (
        <div
          className={`rounded-md p-3 text-sm ${
            result.ok
              ? 'bg-spiritual-gold/10 text-foreground'
              : 'bg-destructive/10 text-destructive'
          }`}
        >
          {result.ok ? (
            <>
              <p>
                <strong>Enviado.</strong> Modo: {result.mode} · Destinatários:{' '}
                {result.recipientCount} · Entregues: {result.delivered} ·
                Falhas: {result.failed}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                ID: {result.newsletterId} — Assunto: {result.subject}
              </p>
            </>
          ) : (
            <p>Erro: {result.error ?? 'desconhecido'}</p>
          )}
        </div>
      )}
    </form>
  );
}
