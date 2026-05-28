'use client';

import { useMemo } from 'react';
import { calculateCompatibility, type CompatibilityResult } from '@/lib/numerologia/compatibility';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface CompatibilityReportProps {
  numero1: number | string;
  numero2: number | string;
  nome1?: string;
  nome2?: string;
  expanded?: boolean;
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
      return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    case 'Alta':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
    case 'Moderada':
      return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
    case 'Baixa':
      return 'bg-red-500/20 text-red-400 border-red-500/40';
    default:
      return 'bg-gray-500/20 text-gray-400 border-gray-500/40';
  }
}

function getSimboloNumero(numero: number): string {
  const simbolos: Record<number, string> = {
    1: '☉', 2: '☽', 3: '☿', 4: '♀', 5: '♂',
    6: '☿', 7: '☽', 8: '♄', 9: '☉',
    11: '✧', 22: '⚡', 33: '♕'
  };
  return simbolos[numero] || '○';
}

function getCorNumero(numero: number): string {
  if ([11, 22, 33].includes(numero)) return '#FFD700';
  const cores = [
    '#DC2626', '#F97316', '#EAB308', '#22C55E',
    '#3B82F6', '#7C3AED', '#EC4899', '#14B8A6', '#6366F1'
  ];
  return cores[(numero - 1) % 9];
}

interface ScoreCircleProps {
  score: number;
  nivel: CompatibilityResult['nivel'];
}

function ScoreCircle({ score, nivel }: ScoreCircleProps) {
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const strokeColor = score >= 75 ? '#22C55E' : score >= 50 ? '#EAB308' : score >= 25 ? '#F97316' : '#DC2626';

  return (
    <div className="relative w-32 h-32 flex items-center justify-center">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          className="text-zinc-700"
        />
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke={strokeColor}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-3xl font-bold ${getScoreColor(score)}`}>{score}%</span>
        <Badge className={`mt-1 text-xs ${getNivelBadgeColor(nivel)}`}>{nivel}</Badge>
      </div>
    </div>
  );
}

interface SectionCardProps {
  title: string;
  icon: string;
  items: string[];
  colorClass: string;
  borderColorClass: string;
}

function SectionCard({ title, icon, items, colorClass, borderColorClass }: SectionCardProps) {
  if (items.length === 0) return null;

  return (
    <Card className={`p-4 ${borderColorClass} border`}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{icon}</span>
        <h3 className={`font-semibold ${colorClass}`}>{title}</h3>
      </div>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-2 text-sm text-zinc-300">
            <span className="text-zinc-500 mt-0.5">◆</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function CompatibilityReport({
  numero1,
  numero2,
  nome1 = 'Número 1',
  nome2 = 'Número 2',
  expanded = true
}: CompatibilityReportProps) {
  const compatibility = useMemo(
    () => calculateCompatibility(numero1, numero2),
    [numero1, numero2]
  );

  const { forcaNumero, destinoNumero, forcaDescricao, destinoDescricao } = compatibility;

  const corForca = getCorNumero(forcaNumero);
  const corDestino = getCorNumero(destinoNumero);

  return (
    <Card className="p-6 bg-zinc-900/50 border-zinc-800">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Header Section */}
        <div className="flex flex-col items-center lg:items-start gap-4">
          <ScoreCircle score={compatibility.score} nivel={compatibility.nivel} />
          
          <div className="text-center lg:text-left">
            <h2 className="text-lg font-semibold text-zinc-100">Relatório de Compatibilidade</h2>
            <p className="text-sm text-zinc-400">Análise Numerológica</p>
          </div>
        </div>

        {/* Numbers Comparison */}
        <div className="flex-1 grid grid-cols-2 gap-4">
          <Card className="p-4 bg-zinc-800/50 border-zinc-700/50">
            <div className="text-center">
              <div
                className="text-4xl font-bold mb-1"
                style={{ color: corForca }}
              >
                {getSimboloNumero(forcaNumero)} {forcaNumero}
              </div>
              <div className="text-xs text-zinc-500 mb-2">Caminho de Vida</div>
              <Separator className="my-2 bg-zinc-700" />
              <div className="text-sm text-zinc-300 font-medium">{nome1}</div>
              <div className="text-xs text-zinc-500 mt-1">{forcaDescricao.titulo}</div>
              <p className="text-xs text-zinc-400 mt-2 line-clamp-2">{forcaDescricao.descricao}</p>
            </div>
          </Card>

          <Card className="p-4 bg-zinc-800/50 border-zinc-700/50">
            <div className="text-center">
              <div
                className="text-4xl font-bold mb-1"
                style={{ color: corDestino }}
              >
                {getSimboloNumero(destinoNumero)} {destinoNumero}
              </div>
              <div className="text-xs text-zinc-500 mb-2">Destino</div>
              <Separator className="my-2 bg-zinc-700" />
              <div className="text-sm text-zinc-300 font-medium">{nome2}</div>
              <div className="text-xs text-zinc-500 mt-1">{destinoDescricao.titulo}</div>
              <p className="text-xs text-zinc-400 mt-2 line-clamp-2">{destinoDescricao.descricao}</p>
            </div>
          </Card>
        </div>
      </div>

      {expanded && (
        <>
          <Separator className="my-6 bg-zinc-700" />

          {/* Detailed Analysis Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SectionCard
              title="Pontos Fortes"
              icon="💪"
              items={compatibility.forca}
              colorClass="text-emerald-400"
              borderColorClass="border-emerald-500/20"
            />
            
            <SectionCard
              title="Harmonias"
              icon="✨"
              items={compatibility.harmonias}
              colorClass="text-blue-400"
              borderColorClass="border-blue-500/20"
            />
            
            <SectionCard
              title="Desafios"
              icon="⚡"
              items={compatibility.desafios}
              colorClass="text-orange-400"
              borderColorClass="border-orange-500/20"
            />
            
            <SectionCard
              title="Recomendações"
              icon="🎯"
              items={compatibility.recomendacoes}
              colorClass="text-purple-400"
              borderColorClass="border-purple-500/20"
            />
          </div>

          {/* Matrix Summary */}
          <div className="mt-6 p-4 bg-zinc-800/30 rounded-lg border border-zinc-700/50">
            <h3 className="text-sm font-medium text-zinc-300 mb-3">Resumo da Matriz</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
              <div className="text-center p-2 bg-zinc-800/50 rounded">
                <div className="text-xs text-zinc-500">Força</div>
                <div className="font-semibold text-zinc-200">{compatibility.matriz.forca}</div>
              </div>
              <div className="text-center p-2 bg-zinc-800/50 rounded">
                <div className="text-xs text-zinc-500">Destino</div>
                <div className="font-semibold text-zinc-200">{compatibility.matriz.destino}</div>
              </div>
              <div className="text-center p-2 bg-zinc-800/50 rounded">
                <div className="text-xs text-zinc-500">Combinação</div>
                <div className="font-semibold text-zinc-200">{compatibility.matriz.combinacao}</div>
              </div>
              <div className="text-center p-2 bg-zinc-800/50 rounded">
                <div className="text-xs text-zinc-500">Diferença</div>
                <div className="font-semibold text-zinc-200">{compatibility.matriz.diferenca}</div>
              </div>
              <div className="text-center p-2 bg-zinc-800/50 rounded">
                <div className="text-xs text-zinc-500">Harmônico</div>
                <div className={`font-semibold ${compatibility.matriz.harmonic ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {compatibility.matriz.harmonic ? '✓' : '○'}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}

export default CompatibilityReport;
