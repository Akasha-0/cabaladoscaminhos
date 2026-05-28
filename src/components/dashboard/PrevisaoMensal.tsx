'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { usePrevisaoMensal, type LunarPhase, type KeyDate, type MonthTheme } from '@/hooks/usePrevisaoMensal';
import {
  Moon,
  Sun,
  Star,
  Calendar,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Target,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const nomesMeses = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const faseIcons = {
  nova: Moon,
  crescente: Star,
  cheia: Sun,
  minguante: Moon,
} as const;

const faseCores = {
  nova: 'bg-gray-800/50 border-gray-600/30 text-gray-300',
  crescente: 'bg-slate-800/50 border-slate-500/30 text-slate-300',
  cheia: 'bg-amber-800/50 border-amber-500/30 text-amber-300',
  minguante: 'bg-indigo-800/50 border-indigo-500/30 text-indigo-300',
} as const;

const faseTextos = {
  nova: { energia: 'Recomeço e intenção', recomendacao: 'Ideal para novos projetos e intenções.' },
  crescente: { energia: 'Crescimento e acumulação', recomendacao: 'Perfeito para fortalecer metas.' },
  cheia: { energia: 'Culminação e claridade', recomendacao: 'Momento de revelações e celebrações.' },
  minguante: { energia: 'Liberação e reflexão', recomendacao: 'Hora de soltar e se preparar.' },
} as const;

const tipoBadge: Record<KeyDate['tipo'], { bg: string; text: string }> = {
  ritual: { bg: 'bg-purple-900/50', text: 'text-purple-300' },
  astrologico: { bg: 'bg-blue-900/50', text: 'text-blue-300' },
  sazonal: { bg: 'bg-green-900/50', text: 'text-green-300' },
  espiritual: { bg: 'bg-amber-900/50', text: 'text-amber-300' },
};

function LunarPhaseItem({ phase }: { phase: LunarPhase }) {
  const Icon = faseIcons[phase.fase];
  const cores = faseCores[phase.fase];
  const textos = faseTextos[phase.fase];
  const dataFormatada = new Date(phase.data).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
  });

  return (
    <div className={`flex flex-col gap-2 p-3 rounded-lg border ${cores}`}>
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4" />
        <span className="text-sm font-medium capitalize">{phase.fase}</span>
        <span className="text-xs opacity-70 ml-auto">{dataFormatada}</span>
      </div>
      <p className="text-xs opacity-80">{textos.energia}</p>
      <p className="text-xs opacity-70">{textos.recomendacao}</p>
    </div>
  );
}

function KeyDateItem({ date }: { date: KeyDate }) {
  const badgeStyle = tipoBadge[date.tipo];
  const dataFormatada = new Date(date.data).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'short',
  });

  return (
    <div className="flex flex-col gap-1 p-3 rounded-lg bg-white/5 border border-white/10">
      <div className="flex items-center gap-2">
        <Badge className={`${badgeStyle.bg} ${badgeStyle.text} text-xs`}>
          {date.tipo}
        </Badge>
        <span className="text-xs opacity-60 ml-auto">{dataFormatada}</span>
      </div>
      <h4 className="text-sm font-medium">{date.titulo}</h4>
      <p className="text-xs opacity-70">{date.descricao}</p>
    </div>
  );
}

function ThemeCard({ theme }: { theme: MonthTheme }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-amber-400" />
        <h3 className="text-sm font-semibold">{theme.titulo}</h3>
      </div>
      <div className="flex flex-wrap gap-1">
        {theme.foco.map((f, i) => (
          <Badge key={i} variant="outline" className="text-xs bg-white/5">
            <Target className="w-3 h-3 mr-1" />
            {f}
          </Badge>
        ))}
      </div>
      <div className="space-y-1">
        {theme.mensagens.map((m, i) => (
          <p key={i} className="text-xs opacity-80">"{m}"</p>
        ))}
      </div>
    </div>
  );
}

interface PrevisaoMensalProps {
  className?: string;
}

export function PrevisaoMensal({ className }: PrevisaoMensalProps) {
  const { data, temas, datasChave, fasesLua, loading, error, refetch } = usePrevisaoMensal();

  const mesAtual = data ? nomesMeses[data.mes - 1] : '';
  const anoAtual = data?.ano || new Date().getFullYear();

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center opacity-60">
            <Calendar className="w-8 h-8 mx-auto mb-2" />
            <span className="text-sm">Carregando previsão...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-gradient-to-br from-indigo-950/50 to-purple-950/50 border-indigo-500/20 ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-400" />
            <CardTitle className="text-lg">
              {mesAtual} {anoAtual}
            </CardTitle>
          </div>
          <div className="flex gap-1">
            <button
              onClick={refetch}
              className="p-1 rounded hover:bg-white/10 transition-colors"
              title="Atualizar"
            >
              <ChevronLeft className="w-4 h-4 opacity-60" />
            </button>
            <button
              onClick={refetch}
              className="p-1 rounded hover:bg-white/10 transition-colors"
              title="Próximo"
            >
              <ChevronRight className="w-4 h-4 opacity-60" />
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Theme Section */}
        {temas && (
          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <ThemeCard theme={temas} />
          </div>
        )}

        <Separator className="bg-white/10" />

        {/* Overview Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col items-center p-2 rounded-lg bg-green-900/20 border border-green-500/20">
            <TrendingUp className="w-4 h-4 text-green-400 mb-1" />
            <span className="text-xs opacity-60 mb-1">Favoráveis</span>
            <div className="flex flex-wrap justify-center gap-1">
              {data.signosFavoraveis.slice(0, 2).map((s) => (
                <Badge key={s} variant="outline" className="text-xs bg-green-900/30">
                  {s}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center p-2 rounded-lg bg-amber-900/20 border border-amber-500/20">
            <AlertTriangle className="w-4 h-4 text-amber-400 mb-1" />
            <span className="text-xs opacity-60 mb-1">Desafios</span>
            <div className="flex flex-wrap justify-center gap-1">
              {data.desafios.slice(0, 2).map((d) => (
                <Badge key={d} variant="outline" className="text-xs bg-amber-900/30">
                  {d}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center p-2 rounded-lg bg-blue-900/20 border border-blue-500/20">
            <Sparkles className="w-4 h-4 text-blue-400 mb-1" />
            <span className="text-xs opacity-60 mb-1">Oportunidades</span>
            <div className="flex flex-wrap justify-center gap-1">
              {data.oportunidades.slice(0, 2).map((o) => (
                <Badge key={o} variant="outline" className="text-xs bg-blue-900/30">
                  {o}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <Separator className="bg-white/10" />

        {/* Lunar Phases Calendar */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Moon className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-medium">Calendário Lunar</h3>
          </div>
          <ScrollArea className="w-full">
            <div className="flex gap-2 pb-2">
              {fasesLua.map((phase, i) => (
                <div key={i} className="w-36 flex-shrink-0">
                  <LunarPhaseItem phase={phase} />
                </div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>

        <Separator className="bg-white/10" />

        {/* Key Dates */}
        {datasChave.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-medium">Datas Importantes</h3>
            </div>
            <div className="space-y-2">
              {datasChave.slice(0, 4).map((date, i) => (
                <KeyDateItem key={i} date={date} />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
