'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

export default function MapaPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    setTimeout(() => {
      setData({
        numeroVida: 7,
        signo: 'Áries',
        ascendente: 'Touro',
        orixa: 'Oxalá',
        sefirot: ['Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah'],
      });
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-12 h-12 mx-auto text-amber-400 animate-pulse mb-4" />
          <p className="text-amber-400">Gerando seu Mapa da Alma...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-amber-400 mb-4">✦ Mapa da Alma ✦</h1>
          <p className="text-slate-400">Seu perfil espiritual completo</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="card-spiritual">
            <CardHeader>
              <CardTitle className="text-cyan-400">Número de Vida</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-5xl font-bold text-amber-400">{data.numeroVida}</p>
            </CardContent>
          </Card>

          <Card className="card-spiritual">
            <CardHeader>
              <CardTitle className="text-violet-400">Signo Solar</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-2xl font-bold text-amber-400">{data.signo}</p>
            </CardContent>
          </Card>

          <Card className="card-spiritual">
            <CardHeader>
              <CardTitle className="text-orange-400">Orixá Regente</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-2xl font-bold text-amber-400">{data.orixa}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="card-spiritual">
          <CardHeader>
            <CardTitle className="text-indigo-400">Sefirot Dominantes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {data.sefirot.map((s: string) => (
                <span key={s} className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300">
                  {s}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
