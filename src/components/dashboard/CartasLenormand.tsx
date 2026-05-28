'use client';

import { useState } from 'react';
import { cartasLenormand } from '@/lib/data/spiritual-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Grid3X3, 
  Search,
  AlertCircle,
  Heart,
  Briefcase,
  TrendingUp,
  Scale
} from 'lucide-react';

const AREAS_TEMATICAS = [
  { id: 'amor', label: 'Amor', icon: Heart, casas: [24, 25], cor: 'text-pink-400' },
  { id: 'financas', label: 'Finanças', icon: TrendingUp, casas: [34, 15], cor: 'text-green-400' },
  { id: 'trabalho', label: 'Trabalho', icon: Briefcase, casas: [35, 14], cor: 'text-blue-400' },
  { id: 'saude', label: 'Saúde', icon: AlertCircle, casas: [5, 8], cor: 'text-red-400' },
  { id: 'justica', label: 'Justiça', icon: Scale, casas: [21, 36], cor: 'text-yellow-400' },
];

export function CartasLenormand() {
  const [cartaSelecionada, setCartaSelecionada] = useState(cartasLenormand[0]);
  const [filtroArea, setFiltroArea] = useState<string | null>(null);

  const cartasFiltradas = filtroArea 
    ? cartasLenormand.filter(c => AREAS_TEMATICAS.find(a => a.id === filtroArea)?.casas.includes(c.numero))
    : cartasLenormand;

  return (
    <Card className="bg-gradient-to-br from-card to-card/80 border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-cinzel text-primary flex items-center gap-2">
              <Grid3X3 className="w-5 h-5" />
              Baralho Cigano
            </CardTitle>
            <CardDescription className="font-raleway">
              Mesa Real - 36 cartas de destino
            </CardDescription>
          </div>
          <Badge variant="outline" className="font-raleway">
            36 Cartas
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="grade" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="grade">Grade</TabsTrigger>
            <TabsTrigger value="tematico">Temático</TabsTrigger>
            <TabsTrigger value="detalhe">Detalhe</TabsTrigger>
          </TabsList>
          
          <TabsContent value="grade" className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Navegue pelas 36 cartas</span>
            </div>
            <ScrollArea className="h-[280px] pr-4">
              <div className="grid grid-cols-6 gap-2">
                {cartasLenormand.map((carta) => (
                  <button
                    key={carta.numero}
                    onClick={() => setCartaSelecionada(carta)}
                    className={`aspect-square rounded-lg flex flex-col items-center justify-center transition-all ${
                      cartaSelecionada.numero === carta.numero
                        ? 'bg-primary/20 border-2 border-primary'
                        : 'bg-background/50 hover:bg-background/80 border border-transparent'
                    }`}
                  >
                    <span className="text-lg font-bold text-primary">{carta.numero}</span>
                    <span className="text-[8px] text-center leading-tight mt-1 px-1">
                      {carta.nome}
                    </span>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="tematico" className="space-y-4">
            <div className="grid grid-cols-5 gap-2 mb-4">
              {AREAS_TEMATICAS.map((area) => (
                <button
                  key={area.id}
                  onClick={() => setFiltroArea(filtroArea === area.id ? null : area.id)}
                  className={`p-2 rounded-lg flex flex-col items-center gap-1 transition-all ${
                    filtroArea === area.id
                      ? 'bg-primary/20 border border-primary/50'
                      : 'bg-background/50 hover:bg-background/80 border border-transparent'
                  }`}
                >
                  <area.icon className={`w-4 h-4 ${area.cor}`} />
                  <span className="text-xs font-raleway">{area.label}</span>
                  <span className="text-[10px] text-muted-foreground">Casas {area.casas.join(', ')}</span>
                </button>
              ))}
            </div>
            <ScrollArea className="h-[220px] pr-4">
              <div className="grid grid-cols-4 gap-2">
                {cartasFiltradas.map((carta) => (
                  <button
                    key={carta.numero}
                    onClick={() => setCartaSelecionada(carta)}
                    className={`p-2 rounded-lg text-center transition-all ${
                      cartaSelecionada.numero === carta.numero
                        ? 'bg-primary/20 border border-primary'
                        : 'bg-background/50 hover:bg-background/80 border border-transparent'
                    }`}
                  >
                    <span className="text-lg font-bold text-primary">{carta.numero}</span>
                    <span className="text-xs block mt-1">{carta.nome}</span>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="detalhe">
            <ScrollArea className="h-[350px] pr-4">
              <div className="space-y-4">
                <div className="flex items-center gap-4 pb-4 border-b border-border">
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center border border-primary/30">
                    <span className="text-2xl font-cinzel text-primary">
                      {cartaSelecionada.numero}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-cinzel text-primary">
                      {cartaSelecionada.nome}
                    </h3>
                    <p className="text-sm text-muted-foreground font-raleway">
                      Casa {cartaSelecionada.numero} da Mesa
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-primary mb-1">Significado</p>
                    <p className="text-sm text-muted-foreground font-raleway">
                      {cartaSelecionada.significado}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-xs font-medium text-primary mb-1">Área de Atuação</p>
                    <p className="text-sm text-muted-foreground font-raleway">
                      {cartaSelecionada.area}
                    </p>
                  </div>
                  
                  <div className="p-3 rounded-lg bg-background/50">
                    <p className="text-xs font-medium text-primary mb-1">Como Interpretar na Mesa</p>
                    <p className="text-sm text-muted-foreground font-raleway italic">
                      &ldquo;{cartaSelecionada.interpretacao}&rdquo;
                    </p>
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
