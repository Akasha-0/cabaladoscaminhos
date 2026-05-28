'use client';

import { chakras } from '@/lib/data/spiritual-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Zap,
  Droplets,
  Flame,
  Heart,
  Wind,
  Eye,
  Crown
} from 'lucide-react';

const ICONES_CHAKRA: Record<number, React.ElementType> = {
  1: Zap,
  2: Droplets,
  3: Flame,
  4: Heart,
  5: Wind,
  6: Eye,
  7: Crown
};

const CORES_CHAKRA: Record<number, string> = {
  1: 'bg-red-500/20 border-red-500/50',
  2: 'bg-orange-500/20 border-orange-500/50',
  3: 'bg-yellow-500/20 border-yellow-500/50',
  4: 'bg-green-500/20 border-green-500/50',
  5: 'bg-blue-400/20 border-blue-400/50',
  6: 'bg-indigo-500/20 border-indigo-500/50',
  7: 'bg-violet-500/20 border-violet-500/50'
};

export function ChakrasExplorer() {
  return (
    <Card className="bg-gradient-to-br from-card to-card/80 border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-cinzel text-primary flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Chakras
            </CardTitle>
            <CardDescription className="font-raleway">
              7 centros de energia e suas frequências
            </CardDescription>
          </div>
          <Badge variant="outline" className="font-raleway">
            7 Chakras
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {chakras.map((chakra, index) => {
              const Icone = ICONES_CHAKRA[chakra.numero] || Zap;
              const corClasse = CORES_CHAKRA[chakra.numero] || CORES_CHAKRA[1];
              
              return (
                <div key={chakra.numero} className="relative">
                  {index > 0 && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                      <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-border"></div>
                    </div>
                  )}
                  
                  <div className={`p-4 rounded-lg border ${corClasse} bg-card/50`}>
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-background/80`}>
                        <Icone className="w-6 h-6 text-primary" />
                      </div>
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-cinzel text-primary">
                            {chakra.nome}
                          </h3>
                          <Badge variant="outline" className="font-mono text-xs">
                            {chakra.freqSolfeggio}
                          </Badge>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary" className="text-xs">
                            Cor: {chakra.cor}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {chakra.planeta}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {chakra.elemento}
                          </Badge>
                        </div>
                        
                        <Separator className="bg-border/30" />
                        
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <p className="text-muted-foreground">Mantram</p>
                            <p className="font-mono text-primary">{chakra.mantram}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Poliedro</p>
                            <p className="font-raleway">{chakra.poliedro}</p>
                          </div>
                        </div>
                        
                        <div className="text-xs">
                          <p className="text-muted-foreground mb-1">Nome Divino</p>
                          <p className="font-hebrew text-primary/80">{chakra.nomeDivino}</p>
                        </div>
                        
                        <p className="text-xs text-muted-foreground font-raleway leading-relaxed pt-2 border-t border-border/30">
                          {chakra.funcao}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
