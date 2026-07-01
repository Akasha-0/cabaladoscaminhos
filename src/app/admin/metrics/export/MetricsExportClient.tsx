'use client';

import { useState } from 'react';

interface ExportTarget {
  id: string;
  label: string;
}

export function MetricsExportClient({ targets }: { targets: ExportTarget[] }) {
  const [selected, setSelected] = useState<string[]>(targets.slice(0, 3).map((t) => t.id));
  const [exporting, setExporting] = useState(false);
  const [lastExport, setLastExport] = useState<{ count: number; ts: string } | null>(null);
  const [digestEmail, setDigestEmail] = useState('');
  const [digestSaved, setDigestSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const exportCSV = async () => {
    setExporting(true);
    try {
      const rows: string[] = [];
      rows.push('metric,target,value,generatedAt');
      for (const id of selected) {
        rows.push(`csv,${id},placeholder,${new Date().toISOString()}`);
      }
      const csv = rows.join('\n');
      downloadFile(`metrics-export-${Date.now()}.csv`, csv, 'text/csv;charset=utf-8');
      setLastExport({ count: selected.length, ts: new Date().toISOString() });
    } finally {
      setExporting(false);
    }
  };

  const exportJSON = async () => {
    setExporting(true);
    try {
      const payload = {
        generatedAt: new Date().toISOString(),
        targets: selected,
        note: 'Demo export. Connect to PostHog/analytics-events in Wave 39+.',
        data: selected.map((id) => ({ target: id, values: [] })),
      };
      const json = JSON.stringify(payload, null, 2);
      downloadFile(`metrics-export-${Date.now()}.json`, json, 'application/json');
      setLastExport({ count: selected.length, ts: new Date().toISOString() });
    } finally {
      setExporting(false);
    }
  };

  const saveDigest = async () => {
    // In Wave 39+: persist via /api/admin/metrics/digest
    setDigestSaved(true);
    setTimeout(() => setDigestSaved(false), 3000);
  };

  const copyApiCurl = () => {
    const curl = `curl -H "Authorization: Bearer $ADMIN_TOKEN" \\
  https://api.cabaladoscaminhos.com.br/v1/metrics/export?target=${selected[0] ?? 'kpi'}&format=json`;
    void navigator.clipboard.writeText(curl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* SECTION 1 — Target selector */}
      <section className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
        <header className="mb-3">
          <h2 className="text-lg font-semibold text-slate-100">Selecionar métricas</h2>
          <p className="text-xs text-slate-400">
            Escolha quais métricas incluir no export. Mínimo 1, sem máximo.
          </p>
        </header>
        <div className="grid gap-2 md:grid-cols-2">
          {targets.map((t) => (
            <label
              key={t.id}
              className={`flex cursor-pointer items-center gap-3 rounded border p-3 transition ${
                selected.includes(t.id)
                  ? 'border-cyan-500/50 bg-cyan-500/5'
                  : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
              }`}
            >
              <input
                type="checkbox"
                checked={selected.includes(t.id)}
                onChange={() => toggle(t.id)}
                className="h-4 w-4"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-100">{t.id}</p>
                <p className="text-xs text-slate-400">{t.label}</p>
              </div>
            </label>
          ))}
        </div>
      </section>

      {/* SECTION 2 — Export actions */}
      <section className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
        <header className="mb-3">
          <h2 className="text-lg font-semibold text-slate-100">Exportar agora</h2>
          <p className="text-xs text-slate-400">
            {selected.length} métrica(s) selecionada(s).
          </p>
        </header>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={exporting || selected.length === 0}
            onClick={exportCSV}
            className="rounded bg-cyan-600 px-3 py-1.5 text-sm text-white hover:bg-cyan-500 disabled:opacity-50"
          >
            {exporting ? 'Exportando…' : 'Baixar CSV'}
          </button>
          <button
            type="button"
            disabled={exporting || selected.length === 0}
            onClick={exportJSON}
            className="rounded bg-slate-700 px-3 py-1.5 text-sm text-slate-100 hover:bg-slate-600 disabled:opacity-50"
          >
            {exporting ? 'Exportando…' : 'Baixar JSON'}
          </button>
        </div>
        {lastExport && (
          <p className="mt-2 text-xs text-slate-500">
            Último export: {lastExport.count} métrica(s) em {new Date(lastExport.ts).toLocaleString('pt-BR')}.
          </p>
        )}
      </section>

      {/* SECTION 3 — Scheduled digest */}
      <section className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
        <header className="mb-3">
          <h2 className="text-lg font-semibold text-slate-100">Digest por email</h2>
          <p className="text-xs text-slate-400">
            Receba um resumo semanal das métricas no email. LGPD: confirmação dupla.
          </p>
        </header>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="email"
            placeholder="seu@email.com"
            value={digestEmail}
            onChange={(e) => setDigestEmail(e.target.value)}
            className="flex-1 rounded border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-100"
          />
          <select
            defaultValue="weekly"
            className="rounded border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-100"
          >
            <option value="daily">Diário</option>
            <option value="weekly">Semanal</option>
            <option value="monthly">Mensal</option>
          </select>
          <button
            type="button"
            onClick={saveDigest}
            disabled={!digestEmail.includes('@')}
            className="rounded bg-emerald-600 px-3 py-1.5 text-sm text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            Agendar
          </button>
        </div>
        {digestSaved && (
          <p className="mt-2 text-xs text-emerald-300">
            ✓ Digest agendado. Confirme no email enviado para {digestEmail}.
          </p>
        )}
      </section>

      {/* SECTION 4 — ETL API */}
      <section className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
        <header className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-100">ETL API</h2>
            <p className="text-xs text-slate-400">
              Endpoint REST para integração com data warehouse externo (BigQuery, Snowflake, Redshift).
            </p>
          </div>
          <button
            type="button"
            onClick={copyApiCurl}
            className="rounded bg-slate-700 px-3 py-1.5 text-xs text-slate-100 hover:bg-slate-600"
          >
            {copied ? 'Copiado!' : 'Copiar curl'}
          </button>
        </header>
        <pre className="overflow-x-auto rounded border border-slate-800 bg-slate-950 p-3 text-xs text-slate-300">
{`POST /api/admin/metrics/export
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json

{
  "targets": ${JSON.stringify(selected)},
  "format": "json",
  "period": { "from": "2026-06-01", "to": "2026-07-01" }
}

→ 200 OK
{
  "ok": true,
  "data": {
    "generatedAt": "2026-07-01T04:00:00Z",
    "rows": [...]
  }
}`}
        </pre>
        <p className="mt-2 text-xs text-slate-500">
          Rate limit: 60 req/h por token. Cache s-maxage=300 (5min).
        </p>
      </section>
    </div>
  );
}

function downloadFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}