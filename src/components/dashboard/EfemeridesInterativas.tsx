'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { calcularPosicao } from '@/lib/astrologia/swiss-ephemeris';
import { PLANETAS_DATA } from '@/lib/astrologia/planetas/dados';
import type { Planeta } from '@/lib/astrologia/tipos';

interface EfemerideEntry {
  planeta: Planeta;
  nome: string;
  simbolo: string;
  longitude: number;
  signo: string;
  grau: number;
  velocidade: number;
  cor: string;
}

export function EfemeridesInterativas() {
  const [data, setData] = useState<string>(new Date().toISOString().split('T')[0]);
  const [efemerides, setEfemerides] = useState<EfemerideEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const calcularEfemeride = () => {
    setLoading(true);
    try {
      const dataObj = new Date(data);
      const planetas: Planeta[] = ['sol', 'lua', 'mercurio', 'venus', 'marte', 'jupiter', 'saturno', 'urano', 'netuno', 'plutao'];
      
      const entries: EfemerideEntry[] = planetas.map((planeta) => {
        const posicao = calcularPosicao(planeta, dataObj);
        const info = PLANETAS_DATA[planeta];
        
        return {
          planeta,
          nome: info.nome,
          simbolo: info.simbolo,
          longitude: posicao.longitude,
          signo: posicao.signo,
          grau: posicao.grauNoSigno,
          velocidade: posicao.velocidade,
          cor: info.cor,
        };
      });

      entries.sort((a, b) => a.longitude - b.longitude);
      setEfemerides(entries);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-4 bg-slate-900/50 border-slate-700/50">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm text-slate-400 mb-2">Selecionar Data</label>
            <Input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="bg-slate-800/50 border-slate-700 text-slate-100"
            />
          </div>
          <Button
            onClick={calcularEfemeride}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {loading ? 'Calculando...' : 'Ver Efemérides'}
          </Button>
        </div>
      </Card>

      {efemerides.length > 0 && (
        <Card className="p-4 bg-slate-900/30 border-slate-700/30 overflow-x-auto">
          <h4 className="font-serif text-lg text-slate-200 mb-4">Efemérides de {new Date(data).toLocaleDateString('pt-BR')}</h4>
          
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left py-2 px-3 text-slate-400 font-normal">Planeta</th>
                <th className="text-left py-2 px-3 text-slate-400 font-normal">Símbolo</th>
                <th className="text-left py-2 px-3 text-slate-400 font-normal">Longitude</th>
                <th className="text-left py-2 px-3 text-slate-400 font-normal">Signo</th>
                <th className="text-left py-2 px-3 text-slate-400 font-normal">Grau</th>
                <th className="text-left py-2 px-3 text-slate-400 font-normal">Velocidade</th>
              </tr>
            </thead>
            <tbody>
              {efemerides.map((entry) => (
                <tr key={entry.planeta} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                  <td className="py-3 px-3 text-slate-200">{entry.nome}</td>
                  <td className="py-3 px-3">
                    <span style={{ color: entry.cor }} className="text-lg">{entry.simbolo}</span>
                  </td>
                  <td className="py-3 px-3 text-slate-300 font-mono">{entry.longitude.toFixed(4)}°</td>
                  <td className="py-3 px-3 text-slate-300 capitalize">{entry.signo}</td>
                  <td className="py-3 px-3 text-slate-300">{entry.grau.toFixed(0)}°</td>
                  <td className="py-3 px-3 text-slate-400">{entry.velocidade.toFixed(4)}°/dia</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4 bg-slate-900/30 border-slate-700/30">
          <h4 className="font-serif text-sm text-slate-300 mb-3">Movimento Retrógrado</h4>
          <p className="text-xs text-slate-500">
            Quando a velocidade é negativa, o planeta está em movimento retrógrado. 
            Isso é calculado a partir da velocidade orbital aparente da Terra.
          </p>
        </Card>
        <Card className="p-4 bg-slate-900/30 border-slate-700/30">
          <h4 className="font-serif text-sm text-slate-300 mb-3">Interpretação</h4>
          <p className="text-xs text-slate-500">
            Velocidade &gt; 1°/dia = movimento rápido (experiências aceleradas)
            <br />
            Velocidade &lt; 0.1°/dia = movimento lento (consolidação, introspecção)
          </p>
        </Card>
      </div>
    </div>
  );
}