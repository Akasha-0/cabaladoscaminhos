'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { useCreditos } from '@/lib/hooks';
import {
  Sparkles,
  Lightbulb,
  Heart,
  Palette,
  Leaf,
  Zap,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import type { InsightData } from '@/lib/ai/insights/types';

interface InsightDiarioProps {
  dataNascimento: string;
  nome: string;
  odu?: string;
  numeroPessoal?: number;
}

export function InsightDiario({ dataNascimento, nome, odu, numeroPessoal }: InsightDiarioProps) {
  useCreditos(); // Inicializa credits
  const [insight, setInsight] = useState<InsightData | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    buscarInsight();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataNascimento, nome]);

  async function buscarInsight() {
    setLoading(true);
    setErro(null);
    try {
      const params = new URLSearchParams({
        data: dataNascimento,
        nome,
        ...(odu && { odu }),
        ...(numeroPessoal && { numero: numeroPessoal.toString() })
      });
      const res = await fetch(`/api/insights/diario?${params}`);
      if (!res.ok) throw new Error('Erro ao buscar insight');
      const data = await res.json();
      setInsight(data.insight);
    } catch {
      setErro('Não foi possível carregar o insight');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-amber-900/20 to-amber-950/50 border-amber-500/30">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-6 w-24" />
        </CardContent>
      </Card>
    );
  }

  if (erro || !insight) {
    return (
      <Card className="bg-gradient-to-br from-amber-900/20 to-amber-950/50 border-amber-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-cinzel text-amber-400">
            <Sparkles className="w-5 h-5" />
            Insight do Dia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState 
            variant="error"
            title="Insight não disponível"
            description={erro || 'Uma interrupção cósmica occurred. Tente novamente.'}
            action={{
              label: 'Tentar novamente',
              onClick: buscarInsight,
            }}
            icon={<AlertCircle className="w-12 h-12" />}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-amber-900/20 to-amber-950/50 border-amber-500/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <CardTitle className="font-cinzel text-amber-400">
              Insight do Dia
            </CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={buscarInsight}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <h3 className="font-cinzel text-xl text-primary">
          {insight.titulo}
        </h3>
        <p className="text-sm font-raleway text-muted-foreground">
          {insight.descricao}
        </p>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <Lightbulb className="w-4 h-4" />
              Ação
            </div>
            <p className="text-xs font-raleway text-muted-foreground">
              &ldquo;{insight.acaoRecomendada}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <Heart className="w-4 h-4" />
              Afirmação
            </div>
            <p className="text-xs font-raleway text-muted-foreground italic">
              &ldquo;{insight.afirmacao}&rdquo;
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Palette className="w-3 h-3" />
            {insight.cores.join(', ')}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Leaf className="w-3 h-3" />
            &ldquo;{insight.ervas.join(', ')}&rdquo;
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            {insight.sefirotAlinhado}
          </Badge>
        </div>

        <div className="pt-2 border-t border-amber-500/20">
          <p className="text-xs font-raleway text-amber-400/70">
            🕯️ {insight.ritus}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
