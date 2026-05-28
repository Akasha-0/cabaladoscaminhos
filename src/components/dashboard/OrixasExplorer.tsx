'use client';

import { useState } from 'react';
import { orixas } from '@/lib/data/spiritual-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Sun, 
  Moon as MoonIcon,
  Droplets,
  Flame,
  Star,
  Heart,
  Zap,
  Shield,
  Crown
} from 'lucide-react';

const ICONES_ORIXAS: Record<string, React.ElementType> = {
  'Oxalá': Crown,
  'Iemanjá': MoonIcon,
  'Oxum': Heart,
  'Ogum': Shield,
  'Oxóssi': Star,
  'Xangô': Flame,
  'Iansã': Zap,
  'Omolu': Shield,
  'Nanã': MoonIcon,
  'Oxumaré': Droplets,
  'Exu': Zap
};

export function OrixasExplorer() {
  const [orixaSelecionado, setOrixaSelecionado] = useState(orixas[0]);

  return (
    <Card className="bg-gradient-to-br from-card to-card/80 border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-cinzel text-primary flex items-center gap-2">
              <Sun className="w-5 h-5" />
              Orixás
            </CardTitle>
            <CardDescription className="font-raleway">
              Orixás, homes e suas correspondências
            </CardDescription>
          </div>
          <Badge variant="outline" className="font-raleway">
            {orixas.length} Orixás
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="grade" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="grade">Grade</TabsTrigger>
            <TabsTrigger value="detalhe">Detalhe</TabsTrigger>
          </TabsList>
          
          <TabsContent value="grade">
            <ScrollArea className="h-[280px] pr-4">
              <div className="grid grid-cols-4 gap-3">
                {orixas.map((orixa) => {
                  const Icone = ICONES_ORIXAS[orixa.nome.split('/')[0]] || Star;
                  return (
                    <button
                      key={orixa.nome}
                      onClick={() => setOrixaSelecionado(orixa)}
                      className={`p-3 rounded-lg text-center transition-all ${
                        orixaSelecionado.nome === orixa.nome
                          ? 'bg-primary/20 border border-primary/50'
                          : 'bg-background/50 hover:bg-background/80 border border-transparent'
                      }`}
                    >
                      <Icone className="w-6 h-6 mx-auto mb-2 text-primary" />
                      <div className="text-sm font-cinzel text-primary truncate">
                        {orixa.nome.split('/')[0]}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {orixa.dia}
                      </div>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="detalhe">
            <ScrollArea className="h-[350px] pr-4">
              <div className="space-y-4">
                <div className="flex items-center gap-4 pb-4 border-b border-border">
                  {(() => {
                    const Icone = ICONES_ORIXAS[orixaSelecionado.nome.split('/')[0]] || Star;
                    return (
                      <>
                        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                          <Icone className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-xl font-cinzel text-primary">
                            {orixaSelecionado.nome}
                          </h3>
                          <p className="text-sm text-muted-foreground font-raleway">
                            {orixaSelecionado.saudacao}
                          </p>
                        </div>
                      </>
                    );
                  })()}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-primary">Dia Sagrado</p>
                    <Badge variant="outline" className="w-full justify-center">
                      {orixaSelecionado.dia}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-primary">Planeta</p>
                    <Badge variant="outline" className="w-full justify-center">
                      {orixaSelecionado.planeta}
                    </Badge>
                  </div>
                </div>
                
                <Separator className="bg-border/30" />
                
                <div className="space-y-2">
                  <p className="text-xs font-medium text-primary">Cores Sagradas</p>
                  <div className="flex flex-wrap gap-2">
                    {orixaSelecionado.cores.map((cor, i) => (
                      <Badge key={i} variant="secondary">
                        {cor}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-xs font-medium text-primary">Chakra Regente</p>
                  <p className="text-sm text-muted-foreground">
                    {orixaSelecionado.chakra}
                  </p>
                </div>
                
                <Separator className="bg-border/30" />
                
                <div className="space-y-2">
                  <p className="text-xs font-medium text-green-500">Ervas Sagradas</p>
                  <p className="text-sm text-muted-foreground font-raleway">
                    {orixaSelecionado.ervas.join(' • ')}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-xs font-medium text-destructive">Quizilas (Evitar)</p>
                  <p className="text-sm text-muted-foreground font-raleway">
                    {orixaSelecionado.quizilas.join(' • ')}
                  </p>
                </div>
                
                <Separator className="bg-border/30" />
                
                <div className="space-y-2">
                  <p className="text-xs font-medium text-primary">Mistério e Atuação</p>
                  <p className="text-sm text-muted-foreground font-raleway leading-relaxed">
                    {orixaSelecionado.misterio}
                  </p>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
