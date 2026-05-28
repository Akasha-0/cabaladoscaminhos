'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { VisualizadorPlanetas } from '@/components/dashboard/VisualizadorPlanetas';
import { EfemeridesInterativas } from '@/components/dashboard/EfemeridesInterativas';
import { TransitosAtivos } from '@/components/astrologia/TransitosAtivos';
import { calcularPosicao, calcularCasas } from '@/lib/astrologia/swiss-ephemeris';

import type { PosicaoPlaneta, Planeta } from '@/lib/astrologia/tipos';

function PlanetasContent() {
  const searchParams = useSearchParams();
  const dataParam = searchParams.get('data');
  
  const [loading, setLoading] = useState(true);
  const [posicoes, setPosicoes] = useState<PosicaoPlaneta[]>([]);

  useEffect(() => {
    const data = dataParam || new Date().toISOString().split('T')[0];
    const dataObj = new Date(data);
    
    const planetas: Planeta[] = [
      'sol', 'lua', 'mercurio', 'venus', 'marte',
      'jupiter', 'saturno', 'urano', 'netuno', 'plutao',
      'node_norte', 'node_sul', 'quiron'
    ];

    const posicoesCalculadas = planetas.map((planeta) => {
      const pos = calcularPosicao(planeta, dataObj);
      
      if (dataParam && searchParams.get('hora') && searchParams.get('lat') && searchParams.get('lng')) {
        const casasResult = calcularCasas(
          dataObj,
          parseFloat(searchParams.get('lat')!),
          parseFloat(searchParams.get('lng')!)
        );
        const casaIdx = casasResult.casas.findIndex(c => {
          const casaStart = c.grauNoSigno;
          const casaEnd = casasResult.casas[(c.numero) % 12].grauNoSigno;
          return pos.longitude >= casaStart && pos.longitude < casaEnd;
        });
        pos.casa = casaIdx >= 0 ? casaIdx + 1 : 1;
      }
      
      return pos;
    });

    setPosicoes(posicoesCalculadas);
    setLoading(false);
  }, [dataParam, searchParams]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64 bg-slate-800" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48 bg-slate-800" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-slate-100">Módulo de Planetas</h1>
        <p className="text-slate-400 mt-2">
          Explore as posições planetárias, aspectos e trânsitos do seu mapa natal.
        </p>
      </div>

      <Tabs defaultValue="posicoes" className="w-full">
        <TabsList className="bg-slate-800/50 border border-slate-700/50">
          <TabsTrigger value="posicoes" className="data-[state=active]:bg-indigo-600">
            Posições Planetárias
          </TabsTrigger>
          <TabsTrigger value="efemerides" className="data-[state=active]:bg-indigo-600">
            Efemérides
          </TabsTrigger>
          <TabsTrigger value="transitos" className="data-[state=active]:bg-indigo-600">
            Trânsitos Ativos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posicoes" className="mt-6">
          <Card className="p-6 bg-slate-900/30 border-slate-700/30">
            <h2 className="font-serif text-xl text-slate-200 mb-4">
              Mapa Astral - {dataParam ? new Date(dataParam).toLocaleDateString('pt-BR') : 'Dia Atual'}
            </h2>
            <VisualizadorPlanetas posicoes={posicoes} />
          </Card>
        </TabsContent>

        <TabsContent value="efemerides" className="mt-6">
          <Card className="p-6 bg-slate-900/30 border-slate-700/30">
            <h2 className="font-serif text-xl text-slate-200 mb-4">Efemérides Interativas</h2>
            <EfemeridesInterativas />
          </Card>
        </TabsContent>

        <TabsContent value="transitos" className="mt-6">
          <Card className="p-6 bg-slate-900/30 border-slate-700/30">
            <h2 className="font-serif text-xl text-slate-200 mb-4">Trânsitos Planetários Ativos</h2>
            <p className="text-slate-400 text-sm mb-4">
              Trânsitos são movimentos planetários atuais que afetam seu mapa natal.
            </p>
            <TransitosAtivos transitos={[]} />
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="p-6 bg-slate-900/20 border-slate-700/20">
        <h3 className="font-serif text-lg text-slate-300 mb-3">Sobre os Planetas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-400">
          <div>
            <h4 className="text-slate-300 font-medium mb-2">Planetas Pessoais</h4>
            <p>
              Sol, Lua, Mercúrio, Vênus e Marte são considerados planetas pessoais porque 
              influenciam diretamente sua personalidade e experiências diárias.
            </p>
          </div>
          <div>
            <h4 className="text-slate-300 font-medium mb-2">Planetas Transitórios</h4>
            <p>
              Júpiter, Saturno, Urano, Netuno e Plutão são chamados de transitórios porque 
              passam mais tempo em cada signo e indicam tendências de longo prazo.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-12 w-64 bg-slate-800" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-48 bg-slate-800" />
        ))}
      </div>
    </div>
  );
}

export default function PlanetasPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PlanetasContent />
    </Suspense>
  );
}