'use client';

import { useState } from 'react';
import { odus } from '@/lib/data/spiritual-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  BookOpen, 
  AlertTriangle, 
  CheckCircle, 
  Sparkles,
  Heart,
  Flame
} from 'lucide-react';

export function OdusExplorer() {
  const [oduSelecionado, setOduSelecionado] = useState(odus[0]);

  return (
    <Card className="bg-gradient-to-br from-card to-card/80 border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-cinzel text-primary flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Odús do Merindilogun
            </CardTitle>
            <CardDescription className="font-raleway">
              16 caminhos de destino e suas orientações
            </CardDescription>
          </div>
          <Badge variant="outline" className="font-raleway">
            16 Odús
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="lista" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="lista">Lista</TabsTrigger>
            <TabsTrigger value="detalhe">Detalhe</TabsTrigger>
          </TabsList>
          
          <TabsContent value="lista" className="space-y-2">
            <ScrollArea className="h-[300px] pr-4">
              <div className="grid grid-cols-4 gap-2">
                {odus.map((odu) => (
                  <button
                    key={odu.numero}
                    onClick={() => setOduSelecionado(odu)}
                    className={`p-3 rounded-lg text-center transition-all ${
                      oduSelecionado.numero === odu.numero
                        ? 'bg-primary/20 border border-primary/50'
                        : 'bg-background/50 hover:bg-background/80 border border-transparent'
                    }`}
                  >
                    <div className="text-2xl font-cinzel text-primary mb-1">
                      {odu.numero}
                    </div>
                    <div className="text-xs font-raleway truncate">
                      {odu.nome}
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="detalhe">
            <ScrollArea className="h-[350px] pr-4">
              <div className="space-y-4">
                <div className="flex items-center gap-4 pb-4 border-b border-border">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-3xl font-cinzel text-primary">
                      {oduSelecionado.numero}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-cinzel text-primary">
                      {oduSelecionado.nome}
                    </h3>
                    <p className="text-sm text-muted-foreground font-raleway">
                      {oduSelecionado.elementos}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-primary mb-1">Significado</p>
                      <p className="text-sm text-muted-foreground font-raleway">
                        {oduSelecionado.significado}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-destructive mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-destructive mb-1">Quizilas (Evitar)</p>
                      <p className="text-sm text-muted-foreground font-raleway">
                        {oduSelecionado.quizilas.join(' • ')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-green-500 mb-1">Preceitos</p>
                      <p className="text-sm text-muted-foreground font-raleway">
                        {oduSelecionado.preceitos}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <Flame className="w-4 h-4 text-orange-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-orange-500 mb-1">Ebó / Ritual</p>
                      <p className="text-sm text-muted-foreground font-raleway">
                        {oduSelecionado.ebo}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <Heart className="w-4 h-4 text-purple-400 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-purple-400 mb-1">Orixás Regentes</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {oduSelecionado.orixas.map((orixa, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {orixa}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
