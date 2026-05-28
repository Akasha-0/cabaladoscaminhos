'use client';

import { useState } from 'react';
import { FORMAS_SAGRADAS, PROPORCOES_SAGRADAS } from '@/lib/geometria/dados';
import { FormaCard } from './FormaCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export function GeometriaPage() {
  const [filtro, setFiltro] = useState<string | null>(null);
  
  const formasFiltradas = filtro 
    ? FORMAS_SAGRADAS.filter(f => 
        f.asociacoes.sefirot === filtro || 
        f.asociacoes.chakra === filtro ||
        f.asociacoes.elemento === filtro
      )
    : FORMAS_SAGRADAS;
  
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-purple-300 mb-2">
          ✦ Geometria Sagrada ✦
        </h1>
        <p className="text-slate-400">
          Formas geométricas sagradas e suas conexões espirituais
        </p>
      </div>
      
      <Card className="bg-slate-900/50 border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>📐</span> Proporções Sagradas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {PROPORCOES_SAGRADAS.map(p => (
              <div key={p.simbolo} className="text-center p-4 bg-purple-950/30 rounded-lg">
                <div className="text-3xl font-bold text-purple-400">{p.simbolo}</div>
                <div className="text-sm text-slate-300">{p.nome}</div>
                <div className="text-xs text-slate-500">{p.valor.toFixed(6)}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <div className="flex flex-wrap gap-2 justify-center">
        <button 
          onClick={() => setFiltro(null)}
          className={`px-4 py-2 rounded-full text-sm ${
            filtro === null 
              ? 'bg-purple-600 text-white' 
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          Todas
        </button>
        <button 
          onClick={() => setFiltro('sefirot')}
          className={`px-4 py-2 rounded-full text-sm ${
            filtro === 'sefirot' 
              ? 'bg-purple-600 text-white' 
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          Sefirots
        </button>
        <button 
          onClick={() => setFiltro('chakra')}
          className={`px-4 py-2 rounded-full text-sm ${
            filtro === 'chakra' 
              ? 'bg-purple-600 text-white' 
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          Chakras
        </button>
        <button 
          onClick={() => setFiltro('elemento')}
          className={`px-4 py-2 rounded-full text-sm ${
            filtro === 'elemento' 
              ? 'bg-purple-600 text-white' 
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          Elementos
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {formasFiltradas.map(forma => (
          <FormaCard key={forma.id} forma={forma} />
        ))}
      </div>
    </div>
  );
}