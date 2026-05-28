'use client';

import { useState, useMemo } from 'react';
import { calcularPosicao } from '@/lib/astrologia/swiss-ephemeris';
import type { Planeta, Signo } from '@/lib/astrologia/tipos';
import { PLANETAS, PLANETAS_LISTA, SIGNOS_SIMBOLOS } from '@/lib/planetas/dados';
import { PlanetaCard } from './PlanetaCard';
import { EfemeridesCalendario } from './EfemeridesCalendario';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const TODOS_SIGNOS: Signo[] = [
  'aries', 'touro', 'gemeos', 'cancer', 'leao', 'virgem',
  'libra', 'escorpio', 'sagitario', 'capricornio', 'aquario', 'peixes'
];

export function PlanetasPage() {
  const [filtroPlaneta, setFiltroPlaneta] = useState<string>('todos');
  const [filtroSigno, setFiltroSigno] = useState<string>('todos');
  const [dataSelecionada] = useState(new Date());

  const handleFiltroPlanetaChange = (value: string | null) => {
    if (value !== null) setFiltroPlaneta(value);
  };

  const handleFiltroSignoChange = (value: string | null) => {
    if (value !== null) setFiltroSigno(value);
  };

  const posicoes = useMemo(() => {
    return PLANETAS_LISTA.map((p) => calcularPosicao(p as Planeta, dataSelecionada));
  }, [dataSelecionada]);

  const planetasFiltrados = useMemo(() => {
    return posicoes.filter((p) => {
      if (filtroPlaneta !== 'todos' && p.planeta !== filtroPlaneta) return false;
      if (filtroSigno !== 'todos' && p.signo !== filtroSigno) return false;
      return true;
    });
  }, [posicoes, filtroPlaneta, filtroSigno]);

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Módulo de Planetas
          </h1>
          <p className="text-slate-400 mt-1">
            Posições atuais dos planetas e efemérides interativas
          </p>
        </div>
        <div className="text-sm text-slate-500">
          {dataSelecionada.toLocaleDateString('pt-BR')}
        </div>
      </div>

      <EfemeridesCalendario />

      <Card className="bg-slate-900/50 border-purple-500/20">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Posições Planetárias</CardTitle>
            <div className="flex flex-wrap gap-4">
              <div className="flex flex-col gap-1">
                <Label className="text-xs text-[#c084fc]">Filtrar por planeta</Label>
                <Select value={filtroPlaneta} onValueChange={handleFiltroPlanetaChange}>
                  <SelectTrigger className="w-[160px] bg-slate-800 border-purple-500/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    {PLANETAS_LISTA.map((p) => (
                      <SelectItem key={p} value={p}>
                        {PLANETAS[p]?.simbolo} {PLANETAS[p]?.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs text-[#c084fc]">Filtrar por signo</Label>
                <Select value={filtroSigno} onValueChange={handleFiltroSignoChange}>
                  <SelectTrigger className="w-[160px] bg-slate-800 border-purple-500/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    {TODOS_SIGNOS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {SIGNOS_SIMBOLOS[s]} {s.charAt(0).toUpperCase() + s.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {planetasFiltrados.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              Nenhum planeta encontrado com os filtros selecionados.
            </div>
          ) : (
            <>
              <div className="mb-4 text-sm text-slate-400">
                Mostrando {planetasFiltrados.length} de {posicoes.length} planetas
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {planetasFiltrados.map((p) => (
                  <PlanetaCard key={p.planeta} planeta={p.planeta} posicao={p} />
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="bg-slate-900/50 border-purple-500/20">
        <CardHeader>
          <CardTitle>Distribuição por Elemento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Fogo', 'Terra', 'Ar', 'Água'].map((elemento) => {
              const PlanetasElemento = posicoes.filter(
                (p) => PLANETAS[p.planeta]?.elemento === elemento
              );
              return (
                <div key={elemento} className="text-center p-4 bg-purple-950/30 rounded">
                  <div className="text-2xl mb-2">
                    {elemento === 'Fogo' ? '🔥' : elemento === 'Terra' ? '🌍' : elemento === 'Ar' ? '💨' : '💧'}
                  </div>
                  <div className="text-lg font-medium">{elemento}</div>
                  <div className="text-sm text-slate-400">{PlanetasElemento.length} planetas</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900/50 border-purple-500/20">
        <CardHeader>
          <CardTitle>Timeline dos Planetas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {planetasFiltrados.map((p) => {
              const info = PLANETAS[p.planeta];
              const SignoSimbolo = SIGNOS_SIMBOLOS[p.signo];
              const progresso = (p.grauNoSigno / 30) * 100;
              
              return (
                <div key={p.planeta} className="flex items-center gap-4 p-3 bg-slate-800/50 rounded">
                  <div className="w-24 flex items-center gap-2">
                    <span className="text-xl">{info?.simbolo}</span>
                    <span className="text-sm">{info?.nome}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{SignoSimbolo}</span>
                      <span className="text-sm text-slate-300 capitalize">{p.signo}</span>
                      <span className="text-xs text-purple-400">{p.grauNoSigno.toFixed(0)}°</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full transition-all"
                        style={{ width: `${progresso}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}