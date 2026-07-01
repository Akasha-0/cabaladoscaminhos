'use client';

import { useEffect, useState, useCallback } from 'react';

interface FeatureAdoption {
  featureId: string;
  dau: number;
  mau: number;
  dauMauRatio: number;
  timeToFirstUseMin: number;
  retentionD7: number;
  powerUserCount: number;
  traditionBreakdown: Array<{ tradition: string; users: number; percent: number }>;
  platformBreakdown: { mobile: number; desktop: number };
  adoptionTrend: Array<{ week: string; newUsers: number }>;
}

export function FeatureAdoptionClient({
  features,
}: {
  features: Array<{ id: string; label: string }>;
}) {
  const [selectedId, setSelectedId] = useState(features[0]?.id ?? '');
  const [data, setData] = useState<FeatureAdoption | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/features/${id}/adoption`, { cache: 'no-store' });
      if (!res.ok) {
        setError(`Erro ${res.status}`);
        return;
      }
      const json = (await res.json()) as { ok: boolean; data: FeatureAdoption };
      setData(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedId) void fetchData(selectedId);
  }, [selectedId, fetchData]);

  return (
    <div className="space-y-6">
      {/* SECTION 1 — Feature selector */}
      <section className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
        <div className="flex flex-wrap gap-2">
          {features.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setSelectedId(f.id)}
              className={`rounded-full px-3 py-1.5 text-xs transition ${
                selectedId === f.id
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </section>

      {loading && <p className="text-sm text-slate-400">Carregando…</p>}
      {error && <p className="text-sm text-rose-300">⚠️ {error}</p>}
      {data && (
        <>
          {/* SECTION 2 — Summary stats */}
          <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat label="DAU" value={data.dau} accent="text-cyan-300" />
            <Stat label="MAU" value={data.mau} accent="text-blue-300" />
            <Stat
              label="DAU/MAU ratio"
              value={`${(data.dauMauRatio * 100).toFixed(1)}%`}
              accent="text-emerald-300"
            />
            <Stat label="Power users" value={data.powerUserCount} accent="text-amber-300" />
            <Stat
              label="Time to first use"
              value={`${data.timeToFirstUseMin}m`}
              accent="text-purple-300"
            />
            <Stat
              label="D7 retention"
              value={`${(data.retentionD7 * 100).toFixed(1)}%`}
              accent="text-pink-300"
            />
          </section>

          {/* SECTION 3 — Adoption trend */}
          <section className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
            <header className="mb-3">
              <h2 className="text-lg font-semibold text-slate-100">Adoption trend (8 semanas)</h2>
              <p className="text-xs text-slate-400">Novos usuários da feature por semana.</p>
            </header>
            <AdoptionLine data={data.adoptionTrend} />
          </section>

          {/* SECTION 4 — Tradição + Platform */}
          <section className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
              <h3 className="mb-2 text-sm font-semibold text-slate-200">Distribuição por tradição</h3>
              <div className="space-y-1">
                {data.traditionBreakdown.map((t) => (
                  <div key={t.tradition} className="flex items-center gap-2 text-xs text-slate-300">
                    <span className="w-32 truncate text-slate-400">{t.tradition}</span>
                    <div className="h-2 flex-1 rounded bg-slate-800">
                      <div className="h-full rounded bg-emerald-500" style={{ width: `${t.percent}%` }} />
                    </div>
                    <span className="w-20 text-right font-mono">{t.percent}% · {t.users}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
              <h3 className="mb-2 text-sm font-semibold text-slate-200">Plataforma</h3>
              <PlatformDonut mobile={data.platformBreakdown.mobile} desktop={data.platformBreakdown.desktop} />
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number | string; accent: string }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${accent}`}>{value}</p>
    </div>
  );
}

function AdoptionLine({ data }: { data: FeatureAdoption['adoptionTrend'] }) {
  const max = Math.max(...data.map((d) => d.newUsers), 1);
  const width = 600;
  const height = 160;
  const padding = 30;
  const points = data.map((d, i) => {
    const x = padding + i * ((width - padding * 2) / Math.max(1, data.length - 1));
    const y = height - padding - (d.newUsers / max) * (height - padding * 2);
    return `${x},${y}`;
  });
  return (
    <div className="overflow-x-auto">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="w-full">
        {[0, 0.25, 0.5, 0.75, 1].map((g) => (
          <line
            key={g}
            x1={padding}
            y1={height - padding - g * (height - padding * 2)}
            x2={width - padding}
            y2={height - padding - g * (height - padding * 2)}
            stroke="#1e293b"
            strokeDasharray="2,4"
          />
        ))}
        <polyline points={points.join(' ')} fill="none" stroke="#06b6d4" strokeWidth="2" />
        {data.map((d, i) => {
          const x = padding + i * ((width - padding * 2) / Math.max(1, data.length - 1));
          const y = height - padding - (d.newUsers / max) * (height - padding * 2);
          return (
            <g key={d.week}>
              <circle cx={x} cy={y} r="4" fill="#06b6d4" />
              <text x={x} y={height - 8} fontSize="9" fill="#64748b" textAnchor="middle">
                {d.week.slice(5)}
              </text>
              <title>{d.week}: {d.newUsers} novos</title>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function PlatformDonut({ mobile, desktop }: { mobile: number; desktop: number }) {
  const total = mobile + desktop || 1;
  const mobilePct = mobile / total;
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const mobileDash = circumference * mobilePct;
  return (
    <div className="flex items-center gap-4">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="#1e293b" strokeWidth="14" />
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke="#06b6d4"
          strokeWidth="14"
          strokeDasharray={`${mobileDash} ${circumference - mobileDash}`}
          transform="rotate(-90 70 70)"
        />
        <text x="70" y="76" textAnchor="middle" fill="#f1f5f9" fontSize="20" fontWeight="700">
          {(mobilePct * 100).toFixed(0)}%
        </text>
      </svg>
      <div className="space-y-1 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-cyan-500" />
          <span>Mobile: {mobile.toLocaleString('pt-BR')}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-slate-700" />
          <span>Desktop: {desktop.toLocaleString('pt-BR')}</span>
        </div>
      </div>
    </div>
  );
}