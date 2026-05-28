'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { calcularPosicao } from '@/lib/astrologia/swiss-ephemeris';
import type { Planeta } from '@/lib/astrologia/tipos';
import { PLANETAS, PLANETAS_LISTA, SIGNOS_SIMBOLOS } from '@/lib/planetas/dados';

export function EfemeridesCalendario() {
  const [dataAtual, setDataAtual] = useState(new Date());

  const anteriores = () => {
    const nova = new Date(dataAtual);
    nova.setMonth(nova.getMonth() - 1);
    setDataAtual(nova);
  };

  const proximas = () => {
    const nova = new Date(dataAtual);
    nova.setMonth(nova.getMonth() + 1);
    setDataAtual(nova);
  };

  const formatarData = (d: Date) => {
    return d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  const posicoes = useMemo(() => {
    return PLANETAS_LISTA.map((p) => calcularPosicao(p as Planeta, dataAtual));
  }, [dataAtual]);

  return (
    <Card className="bg-slate-900/50 border-purple-500/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Efemérides</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={anteriores}>←</Button>
            <span className="text-sm text-purple-300 py-2">{formatarData(dataAtual)}</span>
            <Button variant="outline" size="sm" onClick={proximas}>→</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {posicoes.map((p) => (
            <div key={p.planeta} className="text-center p-2 bg-purple-950/30 rounded">
              <div className="text-lg">{PLANETAS[p.planeta]?.simbolo || p.planeta}</div>
              <div className="text-sm text-slate-300">{PLANETAS[p.planeta]?.nome || p.planeta}</div>
              <div className="text-xl">{SIGNOS_SIMBOLOS[p.signo as keyof typeof SIGNOS_SIMBOLOS]}</div>
              <div className="text-xs text-purple-400">
                {p.grauNoSigno.toFixed(0)}°
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
