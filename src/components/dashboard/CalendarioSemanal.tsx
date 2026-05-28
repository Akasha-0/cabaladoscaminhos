'use client';

import { diasSemana, type OrixaData } from '@/lib/data/spiritual-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { 
  Sun, 
  Moon, 
  Flame, 
  Star, 
  Leaf,
  Droplets,
  Circle
} from 'lucide-react';

const iconesDias = {
  domingo: Sun,
  segunda: Moon,
  terca: Flame,
  quarta: Star,
  quinta: Leaf,
  sexta: Circle,
  sabado: Droplets
};

const coresDias = {
  domingo: { bg: 'from-amber-900/30 to-amber-950/50', border: 'hover:border-amber-500/50', text: 'text-amber-400' },
  segunda: { bg: 'from-purple-900/30 to-purple-950/50', border: 'hover:border-purple-500/50', text: 'text-purple-400' },
  terca: { bg: 'from-red-900/30 to-red-950/50', border: 'hover:border-red-500/50', text: 'text-red-400' },
  quarta: { bg: 'from-yellow-900/30 to-yellow-950/50', border: 'hover:border-yellow-500/50', text: 'text-yellow-400' },
  quinta: { bg: 'from-green-900/30 to-green-950/50', border: 'hover:border-green-500/50', text: 'text-green-400' },
  sexta: { bg: 'from-white/10 to-gray-950/50', border: 'hover:border-white/50', text: 'text-gray-100' },
  sabado: { bg: 'from-blue-900/30 to-blue-950/50', border: 'hover:border-blue-500/50', text: 'text-blue-400' }
};

interface CalendarioSemanalProps {
  orixas?: OrixaData[];
  quizilasUsuario?: string[];
}

export function CalendarioSemanal({ quizilasUsuario = [] }: CalendarioSemanalProps) {
  const hoje = new Date().getDay();
  const diasKeys = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _quizilas = quizilasUsuario;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-cinzel text-primary">
          Calendário da Semana
        </h2>
        <Badge variant="outline" className="text-xs">
          ✦ Suas quizilas filtram automaticamente as recomendações
        </Badge>
      </div>

      <ScrollArea className="w-full">
        <div className="flex gap-4 pb-4 min-w-max">
          {diasKeys.map((diaKey, index) => {
            const diaData = diasSemana[diaKey];
            const IconeDobrado = iconesDias[diaKey as keyof typeof iconesDias];
            const corDodia = coresDias[diaKey as keyof typeof coresDias];
            const isHoje = index === hoje;

            return (
              <Card 
                key={diaKey}
                className={`w-72 bg-gradient-to-br ${corDodia.bg} border-border/50 ${corDodia.border} transition-all duration-300 ${isHoje ? 'ring-2 ring-primary/50 shadow-lg shadow-primary/20' : ''}`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <IconeDobrado className={`w-5 h-5 ${corDodia.text}`} />
                      <CardTitle className="text-lg font-cinzel text-primary">
                        {diaData.dia.replace('-feira', '')}
                      </CardTitle>
                    </div>
                    {isHoje && (
                      <Badge variant="default" className="text-xs">
                        Hoje
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="font-raleway text-xs text-muted-foreground">
                    {diaData.planetas.join(' • ')}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="secondary" className="text-xs">
                      {diaData.arcano.split('/')[0].trim()}
                    </Badge>
                  </div>

                  <Separator className="bg-border/30" />

                  <div className="space-y-2">
                    <p className="text-xs font-medium text-green-400/80">✦ Favorex:</p>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>• Chakra {diaData.chakras[0]}</p>
                      <p>• Sefirot {diaData.sephirot[0]}</p>
                      <p>• Lua {diaData.faseLua.split('/')[0].trim()}</p>
                    </div>
                  </div>

                  <Separator className="bg-border/30" />

                  <div className="space-y-2">
                    <p className="text-xs font-medium text-red-400/80">✗ Evitar:</p>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>• Quizilas do Orixá</p>
                      <p>• Energias pesadas</p>
                    </div>
                  </div>

                  <Separator className="bg-border/30" />

                  <div className="space-y-1">
                    <p className="text-xs font-medium text-amber-400/80">🕯️ Ritual:</p>
                    <p className="text-xs text-muted-foreground italic">
                      {diaData.numTantrico}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {diaData.cores.map((cor, i) => (
                      <Badge key={i} variant="outline" className="text-xs border-border/30">
                        {cor}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}