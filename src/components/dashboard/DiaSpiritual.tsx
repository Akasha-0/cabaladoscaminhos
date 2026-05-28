'use client';

import { getCorrespondenciasDia, type OrixaData } from '@/lib/data/spiritual-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Moon, 
  Sun, 
  Star, 
  Flame, 
  Heart,
  Sparkles,
  Zap
} from 'lucide-react';

interface DiaSpiritualProps {
  orixa?: OrixaData;
}

export function DiaSpiritual({}: DiaSpiritualProps) {
  const { dia, orixas, faseLua } = getCorrespondenciasDia();
  
  const getIconForPlaneta = (planeta: string) => {
    switch (planeta.toLowerCase()) {
      case 'lua': return <Moon className="w-4 h-4" />;
      case 'sol': return <Sun className="w-4 h-4" />;
      case 'marte': return <Flame className="w-4 h-4" />;
      case 'mercúrio': return <Sparkles className="w-4 h-4" />;
      case 'júpiter': return <Star className="w-4 h-4" />;
      case 'vênus': return <Heart className="w-4 h-4" />;
      case 'saturno': return <Zap className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header do Dia */}
      <Card className="bg-gradient-to-br from-card to-card/80 border-border/50">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-cinzel text-primary">
                {dia.dia}
              </CardTitle>
              <CardDescription className="font-raleway text-muted-foreground">
                Portal de Consciência
              </CardDescription>
            </div>
            <Badge variant="outline" className="px-3 py-1 font-raleway">
              {dia.arcano}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm font-raleway text-muted-foreground leading-relaxed">
            {dia.misterio}
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="flex flex-col items-center p-3 rounded-lg bg-background/50">
              <span className="text-xs text-muted-foreground mb-1">Chakras</span>
              <div className="flex flex-wrap gap-1 justify-center">
                {dia.chakras.map((chakra, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {chakra}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="flex flex-col items-center p-3 rounded-lg bg-background/50">
              <span className="text-xs text-muted-foreground mb-1">Planetas</span>
              <div className="flex gap-1">
                {dia.planetas.map((planeta, i) => (
                  <span key={i} title={planeta}>
                    {getIconForPlaneta(planeta)}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="flex flex-col items-center p-3 rounded-lg bg-background/50">
              <span className="text-xs text-muted-foreground mb-1">Sephirot</span>
              <div className="flex flex-wrap gap-1 justify-center">
                {dia.sephirot.map((sep, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {sep}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="flex flex-col items-center p-3 rounded-lg bg-background/50">
              <span className="text-xs text-muted-foreground mb-1">Lua</span>
              <span className="text-sm font-medium">{dia.faseLua}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orixás do Dia */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {orixas.slice(0, 3).map((orixa, index) => (
          <Card key={index} className="bg-gradient-to-br from-card/90 to-card/50 border-border/50 hover:border-primary/30 transition-colors">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-cinzel text-primary">
                  {orixa.nome}
                </CardTitle>
                <span className="text-xs text-muted-foreground">{orixa.saudacao}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {orixa.cores.map((cor, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {cor}
                  </Badge>
                ))}
              </div>
              
              <div className="text-xs space-y-1">
                <p><span className="text-muted-foreground">Chakra:</span> {orixa.chakra}</p>
                <p><span className="text-muted-foreground">Planeta:</span> {orixa.planeta}</p>
              </div>
              
              <Separator className="bg-border/30" />
              
              <div className="space-y-1">
                <p className="text-xs font-medium text-primary">Ervas Sagradas:</p>
                <p className="text-xs text-muted-foreground">{orixa.ervas.slice(0, 3).join(', ')}...</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-xs font-medium text-destructive">Quizilas (Evitar):</p>
                <p className="text-xs text-muted-foreground">{orixa.quizilas.slice(0, 2).join(', ')}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Fase da Lua */}
      {faseLua && (
        <Card className="bg-gradient-to-br from-indigo-950/50 to-card border-indigo-500/20">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Moon className="w-5 h-5 text-indigo-400" />
              <CardTitle className="text-lg font-cinzel text-indigo-300">
                {faseLua.fase}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm font-raleway text-muted-foreground">
              <span className="font-medium text-foreground">Estado:</span> {faseLua.estado}
            </p>
            <p className="text-sm font-raleway text-muted-foreground">
              <span className="font-medium text-foreground">Janela:</span> {faseLua.janela}
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <Badge variant="outline" className="border-indigo-500/30 text-indigo-300">
                Orixás: {faseLua.orixas}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground pt-2">
              <span className="font-medium">Ritual:</span> {faseLua.ritual}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
