'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Calendar,
  TrendingUp,
  Target,
  Zap,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Lightbulb
} from 'lucide-react';
import { calculateYearProjection, type YearProjection as YearProjectionType, QuarterlyBreakdown, TurningPoint } from '@/lib/predictions/year';

interface YearProjectionCardProps {
  dataNascimento?: string;
}

const turningPointIcons = {
  introspeccao: { icon: Target, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  acao: { icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  transicao: { icon: Sparkles, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  culminacao: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' }
};

const monthNames = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
];

function QuarterlyCard({ breakdown }: { breakdown: QuarterlyBreakdown }) {
  const isQ1 = breakdown.trimestre === 1;
  const isQ2 = breakdown.trimestre === 2;
  const isQ3 = breakdown.trimestre === 3;
  const isQ4 = breakdown.trimestre === 4;

  return (
    <Card className={`${isQ1 ? 'border-purple-500/30' : isQ2 ? 'border-amber-500/30' : isQ3 ? 'border-blue-500/30' : 'border-emerald-500/30'}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">
            {isQ1 ? '1º' : isQ2 ? '2º' : isQ3 ? '3º' : '4º'} Trimestre
          </CardTitle>
          <div className="flex gap-1">
            {breakdown.meses.map((mes) => (
              <Badge key={mes} variant="outline" className="text-xs">
                {monthNames[mes - 1]}
              </Badge>
            ))}
          </div>
        </div>
        <CardDescription className="font-medium text-foreground">
          {breakdown.tema}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {breakdown.oportunidades.length > 0 && (
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-emerald-500 font-medium">
              <TrendingUp className="h-3 w-3" />
              Oportunidades
            </div>
            <ul className="text-xs text-muted-foreground space-y-0.5">
              {breakdown.oportunidades.slice(0, 2).map((opp, i) => (
                <li key={i} className="flex items-start gap-1">
                  <ChevronRight className="h-3 w-3 mt-0.5 shrink-0" />
                  {opp}
                </li>
              ))}
            </ul>
          </div>
        )}
        {breakdown.desafios.length > 0 && (
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-amber-500 font-medium">
              <AlertTriangle className="h-3 w-3" />
              Desafios
            </div>
            <ul className="text-xs text-muted-foreground space-y-0.5">
              {breakdown.desafios.slice(0, 2).map((desafio, i) => (
                <li key={i} className="flex items-start gap-1">
                  <ChevronRight className="h-3 w-3 mt-0.5 shrink-0" />
                  {desafio}
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="pt-1 border-t">
          <div className="flex items-start gap-1.5 text-xs">
            <Lightbulb className="h-3 w-3 mt-0.5 shrink-0 text-yellow-500" />
            <span className="text-muted-foreground">{breakdown.conselho}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TurningPointItem({ point, index }: { point: TurningPoint; index: number }) {
  const { icon: Icon, color, bg } = turningPointIcons[point.tipo];

  return (
    <div className="relative pl-6 pb-6 last:pb-0">
      {index < 11 && (
        <div className="absolute left-[11px] top-6 bottom-0 w-px bg-border" />
      )}
      <div className={`absolute left-0 top-0 w-6 h-6 rounded-full ${bg} flex items-center justify-center`}>
        <Icon className={`h-3.5 w-3.5 ${color}`} />
      </div>
      <div className="ml-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium text-muted-foreground">
            {monthNames[point.mes - 1]}
          </span>
          <Badge variant="outline" className={`text-xs ${color}`}>
            {point.tipo.charAt(0).toUpperCase() + point.tipo.slice(1)}
          </Badge>
        </div>
        <p className="text-sm font-medium">{point.titulo}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{point.descricao}</p>
        <div className="mt-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Energia</span>
            <Progress value={point.energia} className="h-1.5 flex-1" />
            <span className="text-xs font-medium">{point.energia}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function YearProjectionCard({ dataNascimento }: YearProjectionCardProps) {
  const [projection, setProjection] = useState<YearProjectionType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!dataNascimento) {
      setLoading(false);
      return;
    }

    const yearData = calculateYearProjection(dataNascimento);
    setProjection(yearData);
    setLoading(false);
  }, [dataNascimento]);

  if (!dataNascimento) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Projeção Anual
          </CardTitle>
          <CardDescription>
            Adicione sua data de nascimento para ver sua projeção do ano
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!projection) return null;

  return (
    <div className="space-y-6">
      <Card className={`border-2 border-${projection.tema.cor}/30`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Projeção {projection.anoCalendario}
              </CardTitle>
              <CardDescription>
                Ano Pessoal {projection.numeroAnoPessoal} — {projection.sefirotAno}
              </CardDescription>
            </div>
            <Badge
              variant="outline"
              className="text-lg px-3 py-1"
              style={{ borderColor: projection.tema.cor, color: projection.tema.cor }}
            >
              {projection.tema.numero}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg mb-1">{projection.tema.titulo}</h3>
            <p className="text-sm text-muted-foreground mb-3">{projection.tema.descricao}</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {projection.tema.areasVida.map((area, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {area}
                </Badge>
              ))}
            </div>
            <div className="p-3 bg-card rounded-lg border">
              <p className="text-sm italic text-muted-foreground">"{projection.tema.oraculo}"</p>
            </div>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-sm">{projection.resumo}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projection.quarterlyBreakdown.map((quarter) => (
          <QuarterlyCard key={quarter.trimestre} breakdown={quarter} />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Linha do Tempo — Pontos de Virada</CardTitle>
          <CardDescription>
            Momentos significativos ao longo do ano
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border">
            {projection.turningPoints.map((point, index) => (
              <TurningPointItem key={point.mes} point={point} index={index} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
