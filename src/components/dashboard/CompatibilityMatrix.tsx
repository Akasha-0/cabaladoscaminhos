'use client';
import { useMemo } from 'react';

import { calculateCompatibility, type CompatibilityResult } from '@/lib/numerologia/compatibility';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface CompatibilityMatrixProps {
  numero1: number | string;
  numero2: number | string;
  nome1?: string;
  nome2?: string;
}

function getScoreColor(score: number): string {
  if (score >= 75) return 'text-emerald-500';
  if (score >= 50) return 'text-amber-500';
  if (score >= 25) return 'text-orange-500';
  return 'text-red-500';
}

function getScoreBgColor(score: number): string {
  if (score >= 75) return 'bg-emerald-500/10 border-emerald-500/30';
  if (score >= 50) return 'bg-amber-500/10 border-amber-500/30';
  if (score >= 25) return 'bg-orange-500/10 border-orange-500/30';
  return 'bg-red-500/10 border-red-500/30';
}

function getNivelBadgeColor(nivel: CompatibilityResult['nivel']): string {
  switch (nivel) {
    case 'Muito Alta':
      return 'bg-emerald-500/20 text-emerald-600 border-emerald-500/40';
    case 'Alta':
      return 'bg-amber-500/20 text-amber-600 border-amber-500/40';
    case 'Moderada':
      return 'bg-orange-500/20 text-orange-600 border-orange-500/40';
    case 'Baixa':
      return 'bg-red-500/20 text-red-600 border-red-500/40';
  }
}

function getSimboloNumero(numero: number): string {
  const simbolos: Record<number, string> = {
    1: '☉', 2: '☽', 3: '☿', 4: '♀', 5: '♂',
    6: '♃', 7: '♄', 8: '♅', 9: '♆', 11: '⚡', 22: '⚙', 33: '✧'
  };
  return simbolos[numero] || '○';
}

function MatrixCell({ value, label, highlight = false }: { value: number | string; label: string; highlight?: boolean }) {
  return (
    <div className={`flex flex-col items-center justify-center p-3 rounded-lg ${highlight ? 'bg-purple-500/20 border border-purple-500/40' : 'bg-slate-800/50'}`}>
      <span className="text-2xl font-bold text-purple-400">{value}</span>
      <span className="text-xs text-slate-400 mt-1">{label}</span>
    </div>
  );
}

export function CompatibilityMatrix({
  numero1,
  numero2,
  nome1 = 'Número 1',
  nome2 = 'Número 2'
}: CompatibilityMatrixProps) {
  const result = useMemo(() => calculateCompatibility(numero1, numero2), [numero1, numero2]);

  const { score, nivel, forcaNumero, destinoNumero, forca, desafios, harmonias, recomendacoes, matriz } = result;

  return (
    <div className="space-y-6">
      {/* Score Section */}
      <Card className={`p-6 border-2 ${getScoreBgColor(score)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`text-6xl font-bold ${getScoreColor(score)}`}>
              {score}
            </div>
            <div>
              <div className="text-sm text-slate-400 mb-1">Compatibilidade</div>
              <Badge className={`text-lg px-4 py-1 ${getNivelBadgeColor(nivel)}`}>
                {nivel}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-4xl">{getSimboloNumero(forcaNumero)}</span>
            <span className="text-slate-500 text-2xl">×</span>
            <span className="text-4xl">{getSimboloNumero(destinoNumero)}</span>
          </div>
        </div>
      </Card>

      {/* Matrix Grid */}
      <Card className="p-6 bg-slate-900/50 border-slate-700">
        <h3 className="text-lg font-semibold text-purple-400 mb-4">Matriz de Compatibilidade</h3>
        <div className="grid grid-cols-3 gap-3">
          <MatrixCell value={matriz.forca} label="Força (Caminho de Vida)" highlight />
          <MatrixCell value={matriz.destino} label="Destino" highlight />
          <MatrixCell value={matriz.combinacao} label="Combinação" />
        </div>
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-slate-400">Diferença: <span className="text-purple-400 font-semibold">{matriz.diferenca}</span></span>
          {matriz.harmonic ? (
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40">
              ✦ Harmônico
            </Badge>
          ) : (
            <Badge className="bg-slate-700 text-slate-400 border-slate-600">
              − Não Harmônico
            </Badge>
          )}
        </div>
      </Card>

      {/* Strengths & Challenges */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Strengths */}
        <Card className="p-5 bg-emerald-950/30 border-emerald-500/20">
          <h3 className="text-lg font-semibold text-emerald-400 mb-3 flex items-center gap-2">
            <span>↑</span> Pontos Fortes
          </h3>
          {forca.length > 0 ? (
            <ul className="space-y-2">
              {forca.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-emerald-500 mt-0.5">•</span>
                  <span className="text-slate-300">{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500 text-sm italic">Nenhum ponto forte identificado</p>
          )}
        </Card>

        {/* Challenges */}
        <Card className="p-5 bg-orange-950/30 border-orange-500/20">
          <h3 className="text-lg font-semibold text-orange-400 mb-3 flex items-center gap-2">
            <span>↓</span> Desafios
          </h3>
          {desafios.length > 0 ? (
            <ul className="space-y-2">
              {desafios.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-orange-500 mt-0.5">•</span>
                  <span className="text-slate-300">{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500 text-sm italic">Nenhum desafio significativo</p>
          )}
        </Card>
      </div>

      {/* Harmonies */}
      {harmonias.length > 0 && (
        <Card className="p-5 bg-purple-950/30 border-purple-500/20">
          <h3 className="text-lg font-semibold text-purple-400 mb-3">Harmonias</h3>
          <ul className="space-y-2">
            {harmonias.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="text-purple-400 mt-0.5">✦</span>
                <span className="text-slate-300">{item}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Recommendations */}
      <Card className="p-5 bg-blue-950/30 border-blue-500/20">
        <h3 className="text-lg font-semibold text-blue-400 mb-3">Recomendações</h3>
        <ul className="space-y-2">
          {recomendacoes.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <span className="text-blue-400 mt-0.5">→</span>
              <span className="text-slate-300">{item}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Number Descriptions */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-4 bg-slate-800/50 border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{getSimboloNumero(forcaNumero)}</span>
            <div>
              <span className="text-sm text-slate-400">Caminho de Vida</span>
              <div className="text-xl font-semibold text-purple-400">{forcaNumero}</div>
            </div>
          </div>
          <p className="text-sm text-slate-400">{result.forcaDescricao.significado}</p>
        </Card>
        <Card className="p-4 bg-slate-800/50 border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{getSimboloNumero(destinoNumero)}</span>
            <div>
              <span className="text-sm text-slate-400">Destino</span>
              <div className="text-xl font-semibold text-purple-400">{destinoNumero}</div>
            </div>
          </div>
          <p className="text-sm text-slate-400">{result.destinoDescricao.significado}</p>
        </Card>
      </div>
    </div>
  );
}

export default CompatibilityMatrix;