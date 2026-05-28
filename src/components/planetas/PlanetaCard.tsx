'use client';

import type { PosicaoPlaneta, Planeta } from '@/lib/astrologia/tipos';
import { PLANETAS, SIGNOS_SIMBOLOS } from '@/lib/planetas/dados';
import { getForcaPlanetaria } from '@/lib/planetas/interpretacoes';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Props {
  planeta: Planeta;
  posicao: PosicaoPlaneta;
}

export function PlanetaCard({ planeta, posicao }: Props) {
  const info = PLANETAS[planeta];
  if (!info) return null;

  const forca = getForcaPlanetaria(
    planeta,
    posicao.signo,
    info.exaltação,
    info.queda,
    info.signoRegente
  );

  const forcaCores = {
    forte: 'bg-green-500/20 border-green-500/50',
    neutro: 'bg-purple-500/20 border-purple-500/50',
    fraco: 'bg-red-500/20 border-red-500/50',
  };

  const forcaBadge = {
    forte: 'bg-green-500',
    neutro: 'bg-purple-500',
    fraco: 'bg-red-500',
  };

  const signoSimbolo = SIGNOS_SIMBOLOS[posicao.signo] || '';

  return (
    <Card className={`bg-slate-900/50 border-purple-500/20 ${forcaCores[forca]}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{info.simbolo}</span>
            <div>
              <CardTitle>{info.nome}</CardTitle>
              <p className="text-xs text-slate-400">{info.elemento} • {info.qualidade}</p>
            </div>
          </div>
          <div className="text-3xl">{signoSimbolo}</div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400">Grau no signo</span>
          <span className="text-lg font-mono">
            {posicao.grauNoSigno.toFixed(0)}°
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400">Signo</span>
          <span className="text-sm capitalize">{posicao.signo}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400">Velocidade</span>
          <span className="text-xs text-purple-300">
            {info.velocidade.replace('~', '')}
          </span>
        </div>

        <div className="pt-2 border-t border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400">Dignidade</span>
            <Badge className={`${forcaBadge[forca]} text-white text-xs`}>
              {forca === 'forte' ? 'Dignificado' : forca === 'fraco' ? 'Em queda' : 'Neutro'}
            </Badge>
          </div>
          <p className="text-xs text-slate-300">
            {info.descricaoBreve}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-700 text-xs">
          <div>
            <span className="text-slate-500">Regente:</span>
            <p className="text-slate-300">{info.signoRegente}</p>
          </div>
          <div>
            <span className="text-slate-500">Exaltação:</span>
            <p className="text-slate-300">{info.exaltação}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
