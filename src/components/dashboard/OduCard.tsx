'use client';

import { OduInfo } from '@/lib/odus/calculos';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  Eye,
  Heart,
  Star,
  Moon,
  Sun,
  Flame,
  Shield
} from 'lucide-react';

interface OduCardProps {
  odu: OduInfo;
  variant?: 'default' | 'compact';
  showDetails?: boolean;
}

const orixaIcons: Record<string, React.ReactNode> = {
  'Oxum': <Sun className="w-4 h-4" />,
  'Oxossi': <Eye className="w-4 h-4" />,
  'Xango': <Flame className="w-4 h-4" />,
  'Iemanja': <Moon className="w-4 h-4" />,
  'Ogum': <Shield className="w-4 h-4" />,
  'Obatala': <Star className="w-4 h-4" />,
};

const elementoColors: Record<string, string> = {
  'Fogo': 'from-orange-500/20 to-red-600/20 border-orange-500/30',
  'Agua': 'from-blue-500/20 to-cyan-600/20 border-blue-500/30',
  'Terra': 'from-amber-500/20 to-yellow-600/20 border-amber-500/30',
  'Ar': 'from-gray-400/20 to-slate-500/20 border-gray-400/30',
  'Aether': 'from-purple-500/20 to-violet-600/20 border-purple-500/30',
};

function getElementoColor(elemento: string): string {
  return elementoColors[elemento] || elementoColors['Aether'];
}

export function OduCard({ odu, variant = 'default', showDetails = true }: OduCardProps) {
  const bgGradient = getElementoColor(odu.elementos);
  const orixaIcon = orixaIcons[odu.orixaRegente] || <Star className="w-4 h-4" />;

  return (
    <Card
      className={`
        relative overflow-hidden transition-all duration-300
        bg-gradient-to-br ${bgGradient}
        hover:shadow-lg hover:scale-[1.02]
        border-2
        ${variant === 'compact' ? 'w-full max-w-sm' : 'w-full'}
      `}
    >
      {/* Decorative corner elements */}
      <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full" />
      <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-primary/10 to-transparent rounded-br-full" />

      <CardContent className="relative z-10 space-y-4 p-4">
        {/* Header with number and name */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center justify-center w-12 h-12 rounded-full bg-primary/20 border-2 border-primary/40">
              <span className="text-lg font-bold text-primary">{odu.numero}</span>
            </div>
            <div>
              <h3 className="text-xl font-serif font-bold text-foreground leading-tight">
                {odu.nome}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs bg-background/50">
                  <span className="mr-1">{orixaIcon}</span>
                  {odu.orixaRegente}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {odu.elementos}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Meaning */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium uppercase tracking-wider">Significado</span>
          </div>
          <p className="text-sm text-foreground/90 leading-relaxed">
            {odu.significado}
          </p>
        </div>

        {/* Presagio */}
        <div className="space-y-2 p-3 rounded-lg bg-background/40 border border-border/20">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
              Presságio
            </span>
          </div>
          {odu.quizilas.length > 0 && (
            <ul className="space-y-1">
              {odu.quizilas.slice(0, 3).map((quizila, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-amber-500 mt-0.5">▪</span>
                  <span>{quizila}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Consejos */}
        {showDetails && (
          <div className="space-y-2 p-3 rounded-lg bg-background/40 border border-border/20">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                Conselhos
              </span>
            </div>
            {odu.preceitos.length > 0 && (
              <ul className="space-y-1">
                {odu.preceitos.slice(0, 3).map((preceito, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-emerald-500 mt-0.5">▪</span>
                    <span>{preceito}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Ebós (offerings) */}
        {showDetails && odu.ebos.length > 0 && variant !== 'compact' && (
          <div className="space-y-2 p-3 rounded-lg bg-purple-500/5 border border-purple-500/20">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                Ebós Recomendados
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {odu.ebos.slice(0, 4).map((ebo, index) => (
                <Badge key={index} variant="outline" className="text-xs bg-purple-500/10">
                  {ebo}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}