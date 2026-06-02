'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { CosmicBackground } from '@/components/design-system/CosmicBackground';
import { Heading } from '@/components/design-system/Typography';
import { ArvoreVidaViz } from '@/components/mapa/ArvoreVidaViz';
import { CalendarioEnergetico } from '@/components/mapa/CalendarioEnergetico';
import { ChakraPanel } from '@/components/mapa/ChakraPanel';
import { CorrelacaoInsight } from '@/components/mapa/CorrelacaoInsight';
import { MapaNatalViz } from '@/components/mapa/MapaNatalViz';
import { NumerologiaCard } from '@/components/mapa/NumerologiaCard';
import { OduCardFull } from '@/components/mapa/OduCardFull';
import { TarotCard } from '@/components/mapa/TarotCard';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { MysticDivider } from '@/components/shared/MysticDivider';
import { SkeletonMapa } from '@/components/shared/SkeletonSpiritual';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { fetchMapa } from '@/lib/api/fetch-mapa';
import type { MapaAlmaCompleto } from '@/lib/engines/types/mapa-alma';

export default function MapaPage() {
  const router = useRouter();
  const [mapaData, setMapaData] = useState<MapaAlmaCompleto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load profile and Mapa data on mount
  useEffect(() => {
    const loadMapa = async () => {
      setLoading(true);
      setError(null);

      try {
        // Get profile from localStorage
        const savedProfile = localStorage.getItem('mapa_perfil');
        if (!savedProfile) {
          setLoading(false);
          return;
        }

        const profile = JSON.parse(savedProfile);

        // Fetch Mapa data via shared helper
        const data = await fetchMapa(
          profile.nomeCompleto,
          profile.dataNascimento,
          profile.hora,
          profile.cidade,
          profile.estado,
          profile.pais
        );
        setMapaData(data as MapaAlmaCompleto);
      } catch (err) {
        console.error('[DashboardMapa] Fetch error:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar Mapa da Alma');
      } finally {
        setLoading(false);
      }
    };

    loadMapa();
  }, []);

  // Loading state - show SkeletonMapa for better UX
  if (loading) {
    return (
      <CosmicBackground>
        <div className="space-y-6 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <Heading variant="mystical" size="2xl">
              ✦ Mapa da Alma
            </Heading>
            <span className="text-slate-500 text-sm font-cinzel animate-pulse">Carregando...</span>
          </div>
          <Suspense fallback={<SkeletonMapa />}>
            <SkeletonMapa />
          </Suspense>
        </div>
      </CosmicBackground>
    );
  }

  // Error state
  if (error) {
    return (
      <CosmicBackground>
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 p-4">
          <div className="text-red-400 text-center">
            <p className="text-lg font-medium mb-2">Erro ao carregar Mapa</p>
            <p className="text-sm text-slate-400">{error}</p>
          </div>
          <Button variant="golden" onClick={() => window.location.reload()} className="mt-4">
            Tentar novamente
          </Button>
        </div>
      </CosmicBackground>
    );
  }

  // Empty/Not configured state
  if (!mapaData) {
    return (
      <CosmicBackground>
        <div className="text-center py-16 px-4">
          <Heading variant="mystical" size="xl" className="mb-4">
            ✦ Mapa da Alma ✦
          </Heading>
          <MysticDivider className="max-w-sm mx-auto mb-8" />
          <p className="text-slate-400 mb-8 max-w-md mx-auto">
            Complete seu cadastro para gerar seu mapa espiritual completo. Seu mapa integrará
            numerologia, Odu, tarô, astrologia e chakras.
          </p>
          <Button variant="golden" onClick={() => router.push('/onboarding')} className="px-8">
            Completar Cadastro ✦
          </Button>
        </div>
      </CosmicBackground>
    );
  }

  // When MapaAlma is loaded - display the full dashboard
  return (
    <CosmicBackground>
      <div className="space-y-6 p-4 md:p-6">
        {/* Header with user info */}
        <div className="flex items-center justify-between">
          <Heading variant="mystical" size="2xl">
            ✦ {mapaData.perfil.nomeCompleto}
          </Heading>
          <span className="text-slate-500 text-sm font-cinzel">{mapaData.dataCalculo}</span>
        </div>

        {/* Main grid - responsive layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: Essência + Sistemas */}
          <div className="space-y-4">
            <NumerologiaCard data={mapaData.numerologia} />
            <OduCardFull odu={mapaData.odu} />
            <ChakraPanel data={mapaData.chakras} />
            <TarotCard data={mapaData.tarot} />
          </div>

          {/* Right column: Correlação + Visualizações (spans 2 columns on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <CorrelacaoInsight convergencias={mapaData.convergencias} />

            {/* Visualizações lado a lado no desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ArvoreVidaViz numerologia={mapaData.numerologia} odu={mapaData.odu} />
              <MapaNatalViz astrologia={mapaData.astrologia} />
            </div>
          </div>
        </div>

        {/* Calendário Energético - full width */}
        <CalendarioEnergetico odu={mapaData.odu} />

        {/* Footer com Orixás Dominantes */}
        {mapaData.orixasDominantes.length > 0 && (
          <Card className="bg-slate-900/50 border-slate-700/30 p-4">
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <span className="text-slate-400 text-sm font-cinzel">Orixás Dominantes:</span>
              {mapaData.orixasDominantes.map((orixa) => (
                <span
                  key={orixa}
                  className="px-4 py-1 bg-emerald-400/10 border border-emerald-400/30 rounded-full text-emerald-400 text-sm"
                >
                  ✦ {orixa}
                </span>
              ))}
            </div>
          </Card>
        )}
      </div>
    </CosmicBackground>
  );
}
