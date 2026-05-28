'use client';

import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { PLANETAS_DATA, getForçaPlaneta, getCorForça, getLabelForça, type ForçaPlaneta } from '@/lib/astrologia/planetas/dados';
import type { PosicaoPlaneta } from '@/lib/astrologia/tipos';

interface VisualizadorPlanetasProps {
  posicoes: PosicaoPlaneta[];
}

const SIGNOS_EMOJI: Record<string, string> = {
  aries: '♈',
  touro: '♉',
  gemeos: '♊',
  cancer: '♋',
  leao: '♌',
  virgem: '♍',
  libra: '♎',
  escorpiao: '♏',
  sagitario: '♐',
  capricornio: '♑',
  aquario: '♒',
  peixes: '♓',
};

export function VisualizadorPlanetas({ posicoes }: VisualizadorPlanetasProps) {
  const planetasOrdenados = useMemo(() => {
    return posicoes
      .filter(p => !['node_norte', 'node_sul', 'quiron'].includes(p.planeta))
      .sort((a, b) => a.longitude - b.longitude);
  }, [posicoes]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {planetasOrdenados.map((posicao) => {
          const info = PLANETAS_DATA[posicao.planeta];
          const força = getForçaPlaneta(posicao.planeta, posicao.signo);
          
          return (
            <Card
              key={posicao.planeta}
              className="p-4 bg-slate-900/50 border-slate-700/50 hover:border-slate-600 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                    style={{ backgroundColor: `${info.cor}20`, border: `2px solid ${info.cor}` }}
                  >
                    {info.simbolo}
                  </div>
                  <div>
                    <h3 className="font-serif text-lg text-slate-100">{info.nome}</h3>
                    <p className="text-sm text-slate-400">{info.elemento} • {info.qualidade}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <span className="text-2xl">{SIGNOS_EMOJI[posicao.signo]}</span>
                <span className="font-serif text-xl text-slate-200">
                  {posicao.grauNoSigno.toFixed(0)}°
                </span>
                <span
                  className="ml-auto px-2 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: `${getCorForça(força)}20`,
                    color: getCorForça(força),
                  }}
                >
                  {getLabelForça(força)}
                </span>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-700/50 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500">Regência:</span>
                  <span className="ml-1 text-slate-300">{info.regencia}</span>
                </div>
                <div>
                  <span className="text-slate-500">Exaltação:</span>
                  <span className="ml-1 text-slate-300">{info.exaltação}</span>
                </div>
                <div>
                  <span className="text-slate-500">Pedra:</span>
                  <span className="ml-1 text-slate-300">{info.pedra}</span>
                </div>
                <div>
                  <span className="text-slate-500">Dia:</span>
                  <span className="ml-1 text-slate-300">{info.dia}</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="p-4 bg-slate-900/30 border-slate-700/30">
        <h4 className="font-serif text-sm text-slate-300 mb-3">Interpretação por Força</h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {(['exaltado', 'domicílio', 'neutro', 'queda', 'detrimento'] as ForçaPlaneta[]).map((força) => (
            <div key={força} className="text-center">
              <div
                className="w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center"
                style={{ backgroundColor: `${getCorForça(força)}20`, color: getCorForça(força) }}
              >
                {força === 'exaltado' ? '↑' : força === 'domicílio' ? '⌂' : força === 'queda' ? '↓' : força === 'detrimento' ? '✕' : '○'}
              </div>
              <span className="text-xs text-slate-400">{getLabelForça(força)}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

interface IndicadorPlanetaProps {
  planeta: PosicaoPlaneta;
  tamanho?: 'sm' | 'md' | 'lg';
}

export function IndicadorPlaneta({ planeta, tamanho = 'md' }: IndicadorPlanetaProps) {
  const info = PLANETAS_DATA[planeta.planeta];
  const força = getForçaPlaneta(planeta.planeta, planeta.signo);
  
  const tamanhos = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-xl',
    lg: 'w-16 h-16 text-3xl',
  };

  return (
    <div
      className={`${tamanhos[tamanho]} rounded-full flex items-center justify-center`}
      style={{ 
        backgroundColor: `${info.cor}20`, 
        border: `2px solid ${getCorForça(força)}`,
      }}
      title={`${info.nome} em ${planeta.signo} ${planeta.grauNoSigno.toFixed(0)}°`}
    >
      {info.simbolo}
    </div>
  );
}