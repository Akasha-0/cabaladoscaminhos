'use client';

// ============================================================================
// BatchInviteForm — Form de geração em lote de convites beta (Wave 32)
// ============================================================================// Submete via fetch para /api/admin/beta/invites (POST batch).
// LGPD: emails ficam apenas no payload da request — não persistimos em
// localStorage nem em logs client-side.
// ============================================================================

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

interface BatchResult {
  email: string;
  ok: boolean;
  reason?: string;
  plaintextToken?: string;
}

export function BatchInviteForm() {
  const router = useRouter();
  const [emails, setEmails] = useState('');
  const [wave, setWave] = useState<1 | 2 | 3>(1);
  const [dryRun, setDryRun] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<BatchResult[]>([]);
  const [pending, startTransition] = useTransition();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResults([]);

    const list = emails
      .split(/[\s,;]+/)
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    if (list.length === 0) {
      setError('Insira ao menos um email.');
      return;
    }
    if (list.length > 50) {
      setError('Máximo 50 emails por batch.');
      return;
    }

    startTransition(async () => {
      try {
        const resp = await fetch('/api/admin/beta/invites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ emails: list, wave, dryRun }),
        });
        if (!resp.ok) {
          const j = (await resp.json().catch(() => ({}))) as { error?: string };
          setError(j.error ?? `HTTP ${resp.status}`);
          return;
        }
        const data = (await resp.json()) as {
          requested: number;
          succeeded: number;
          failed: number;
          results: BatchResult[];
        };
        setResults(data.results);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro de rede');
      }
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3" aria-label="Gerar convites beta">
      <label className="block text-xs text-slate-400">
        Emails (separados por vírgula, espaço ou quebra de linha) — máx 50
        <textarea
          value={emails}
          onChange={(e) => setEmails(e.target.value)}
          rows={3}
          required
          placeholder="ana@example.com&#10;bruno@example.com"
          className="mt-1 w-full bg-slate-800 text-slate-100 rounded-md px-3 py-2 text-sm font-mono"
        />
      </label>

      <div className="flex flex-wrap items-center gap-4">
        <label className="text-xs text-slate-400">
          Onda
          <select
            value={wave}
            onChange={(e) => setWave(parseInt(e.target.value, 10) as 1 | 2 | 3)}
            className="ml-2 bg-slate-800 text-slate-100 rounded-md px-2 py-1 text-sm"
          >
            <option value={1}>Wave 1 · Fundadores</option>
            <option value={2}>Wave 2 · Comunidade</option>
            <option value={3}>Wave 3 · Abertura</option>
          </select>
        </label>

        <label className="flex items-center gap-2 text-xs text-slate-300">
          <input
            type="checkbox"
            checked={dryRun}
            onChange={(e) => setDryRun(e.target.checked)}
            className="rounded"
          />
          Dry-run (não envia email)
        </label>

        <button
          type="submit"
          disabled={pending}
          className="ml-auto px-4 py-1.5 rounded-md bg-amber-500 text-slate-950 text-sm font-medium hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {pending ? 'Gerando…' : 'Gerar convites'}
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-md border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-200"
        >
          {error}
        </div>
      )}

      {results.length > 0 && (
        <div className="rounded-md border border-slate-700 bg-slate-950/60 p-3">
          <div className="text-xs text-slate-400 mb-2">
            {results.filter((r) => r.ok).length}/{results.length} criados
          </div>
          <ul className="space-y-1 max-h-40 overflow-y-auto text-xs font-mono">
            {results.map((r) => (
              <li
                key={r.email}
                className={r.ok ? 'text-emerald-300' : 'text-rose-300'}
              >
                {r.ok ? '✓' : '✗'} {r.email}
                {r.reason ? ` — ${r.reason}` : ''}
              </li>
            ))}
          </ul>
        </div>
      )}
    </form>
  );
}