'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Sun } from 'lucide-react';
import { InputForm, OraculoFormData } from '@/components/oraculo/InputForm';
import { MapaNatalCard } from '@/components/oraculo/MapaNatalCard';
import { AspectWheel } from '@/components/oraculo/AspectWheel';
import { MapaNatal } from '@/lib/oraculo/astrologia';

export default function AstrologiaPage() {
  const [mapa, setMapa] = useState<MapaNatal | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: OraculoFormData) => {
    setLoading(true);
    setError(null);
    setMapa(null);

    try {
      const res = await fetch('/api/oraculo/astrologia', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          data: data.dataNascimento,
          hora: data.horaNascimento || '12:00',
          local: data.localNascimento || 'desconhecido',
          latitude: data.latitude ? Number(data.latitude) : undefined,
          longitude: data.longitude ? Number(data.longitude) : undefined,
          tradição: data.tradiçãoAstrologia ?? 'ocidental-tropical',
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json?.error?.message ?? `Erro ${res.status}`);
      }
      setMapa(json.mapa);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-3xl px-4 py-6 md:px-6 md:py-10">
        {/* Breadcrumb */}
        <Link
          href="/oraculo"
          className="mb-4 inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200"
        >
          <ArrowLeft className="h-3 w-3" />
          Voltar ao Oráculo
        </Link>

        {/* Header */}
        <header className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-500/30 to-orange-500/20 ring-1 ring-amber-400/40">
            <Sun className="h-6 w-6 text-amber-300" aria-hidden />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-slate-50">
              Mapa Natal Astrológico
            </h1>
            <p className="text-xs text-slate-400">
              Zodíaco tropical ocidental · Algoritmo pure-function · Akashic IA
            </p>
          </div>
        </header>

        {/* Form OR Result */}
        {!mapa ? (
          <InputForm modo="astrologia" onSubmit={onSubmit} loading={loading} error={error} />
        ) : (
          <div className="flex flex-col gap-6">
            <MapaNatalCard mapa={mapa} />
            <AspectWheel
              ascendente={mapa.ascendente}
              planetas={mapa.planetas}
              aspectos={mapa.aspectos}
            />
            <button
              onClick={() => setMapa(null)}
              className="self-center rounded-lg border border-slate-700 bg-slate-900/50 px-4 py-2 text-xs text-slate-300 hover:bg-slate-800"
            >
              ← Calcular novamente
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
