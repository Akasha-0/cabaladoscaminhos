'use client';

import { usePrevisaoSemanal, type PrevisaoDiaria } from '@/hooks/usePrevisaoSemanal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  Sun,
  Moon,
  Flame,
  Star,
  Leaf,
  Circle,
  Droplets,
  Eye,
  MessageCircle
} from 'lucide-react';

const iconeEnergia = {
  alta: TrendingUp,
  media: Minus,
  baixa: TrendingDown
};

const corEnergia = {
  alta: 'text-green-400 bg-green-900/30 border-green-500/30',
  media: 'text-yellow-400 bg-yellow-900/30 border-yellow-500/30',
  baixa: 'text-red-400 bg-red-900/30 border-red-500/30'
};

const iconeDia = {
  domingo: Sun,
  segunda: Moon,
  terca: Flame,
  quarta: Star,
  quinta: Leaf,
  sexta: Circle,
  sabado: Droplets
};

const corDia = {
  domingo: 'from-amber-900/30 to-amber-950/50',
  segunda: 'from-purple-900/30 to-purple-950/50',
  terca: 'from-red-900/30 to-red-950/50',
  quarta: 'from-yellow-900/30 to-yellow-950/50',
  quinta: 'from-green-900/30 to-green-950/50',
  sexta: 'from-white/10 to-gray-950/50',
  sabado: 'from-blue-900/30 to-blue-950/50'
};

function getDiaKey(dia: string): string {
  const normalized = dia.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (normalized.includes('domingo')) return 'domingo';
  if (normalized.includes('segunda')) return 'segunda';
  if (normalized.includes('terça') || normalized.includes('terca')) return 'terca';
  if (normalized.includes('quarta')) return 'quarta';
  if (normalized.includes('quinta')) return 'quinta';
  if (normalized.includes('sexta')) return 'sexta';
  if (normalized.includes('sábado') || normalized.includes('sabado')) return 'sabado';
  return 'domingo';
}

interface DiaCardProps {
  previsao: PrevisaoDiaria;
  isToday?: boolean;
}

function DiaCard({ previsao, isToday }: DiaCardProps) {
  const diaKey = getDiaKey(previsao.dia);
  const IconeDia = iconeDia[diaKey as keyof typeof iconeDia] || Sun;
  const corBg = corDia[diaKey as keyof typeof corDia] || corDia.domingo;
  const EnergiaIcon = iconeEnergia[previsao.energia];
  const energiaClass = corEnergia[previsao.energia];

  return (
    <Card className={`w-80 bg-gradient-to-br ${corBg} border-border/50 hover:border-primary/50 transition-all duration-300 ${isToday ? 'ring-2 ring-primary/50 shadow-lg shadow-primary/20' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconeDia className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg font-cinzel text-primary">
              {previsao.dia}
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`text-xs ${energiaClass}`}>
              <EnergiaIcon className="w-3 h-3 mr-1" />
              {previsao.energia}
            </Badge>
            {isToday && (
              <Badge variant="default" className="text-xs">
                Hoje
              </Badge>
            )}
          </div>
        </div>
        <CardDescription className="font-raleway text-xs text-muted-foreground">
          {previsao.data}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-primary/80">
            <Sparkles className="w-4 h-4" />
            Tema do Dia
          </div>
          <p className="text-sm text-muted-foreground italic">
            {previsao.tema}
          </p>
        </div>

        <Separator className="bg-border/30" />

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-amber-400/80">
            <Eye className="w-4 h-4" />
            Orientação Espiritual
          </div>
          <p className="text-xs text-muted-foreground">
            {previsao.orientacaoEspiritual}
          </p>
        </div>

        <Separator className="bg-border/30" />

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-green-400/80">
            <MessageCircle className="w-4 h-4" />
            Conselho
          </div>
          <p className="text-xs text-muted-foreground">
            {previsao.conselho}
          </p>
        </div>

        {previsao.planetasInfluentes.length > 0 && (
          <>
            <Separator className="bg-border/30" />
            <div className="flex flex-wrap gap-1">
              {previsao.planetasInfluentes.map((planeta, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {planeta}
                </Badge>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function CardSkeleton() {
  return (
    <Card className="w-80 bg-gradient-to-br from-gray-900/30 to-gray-950/50 border-border/50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="w-5 h-5 rounded" />
            <Skeleton className="h-6 w-24" />
          </div>
          <Skeleton className="h-5 w-16 rounded" />
        </div>
        <Skeleton className="h-4 w-32 mt-1" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-1/2" />
      </CardContent>
    </Card>
  );
}

export function PrevisaoSemanal() {
  const { data, loading, error } = usePrevisaoSemanal();

  if (error) {
    return (
      <Card className="bg-destructive/10 border-destructive/50">
        <CardContent className="py-6">
          <p className="text-sm text-destructive text-center">
            Erro ao carregar previsão semanal: {error}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-cinzel text-primary">
            Previsão Semanal
          </h2>
          {data && (
            <p className="text-sm text-muted-foreground mt-1">
              {data.temaGeral}
            </p>
          )}
        </div>
        {data && (
          <Badge variant="outline" className="text-xs">
            ✦ Semana de {data.semana}
          </Badge>
        )}
      </div>

      {data?.mensagemInspiracional && (
        <Card className="bg-gradient-to-r from-primary/10 to-transparent border-primary/30">
          <CardContent className="py-3">
            <p className="text-sm text-primary italic font-medium">
              "{data.mensagemInspiracional}"
            </p>
          </CardContent>
        </Card>
      )}

      <ScrollArea className="w-full">
        <div className="flex gap-4 pb-4 min-w-max">
          {loading ? (
            <>
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </>
          ) : data?.previsoes ? (
            data.previsoes.map((previsao, index) => (
              <DiaCard
                key={`${previsao.dia}-${previsao.data}`}
                previsao={previsao}
                isToday={index === new Date().getDay()}
              />
            ))
          ) : (
            <Card className="w-96 bg-gradient-to-br from-gray-900/30 to-gray-950/50 border-border/50">
              <CardContent className="py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Nenhuma previsão disponível
                </p>
              </CardContent>
            </Card>
          )}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}