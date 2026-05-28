'use client';

import { useState, useMemo } from 'react';
import { odus } from '@/lib/data/spiritual-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { SpiritualButton } from '@/components/ui/spiritual-button';
import {
  Search,
  BookOpen,
  Star,
  Flame,
  Moon,
  Sun,
  Shield,
  Droplets,
  Wind,
  Crown,
  Zap,
  Heart,
  Eye,
  Skull,
  Leaf,
  Sparkles
} from 'lucide-react';

const ORIXAS_ICONS: Record<string, React.ElementType> = {
  'Oxalá': Crown,
  'Iemanjá': Moon,
  'Oxum': Heart,
  'Ogum': Shield,
  'Oxóssi': Star,
  'Xangô': Flame,
  'Iansã': Zap,
  'Omolu': Skull,
  'Nanã': Droplets,
  'Oxumaré': Droplets,
  'Exu': Zap,
  'Obá': Crown,
  'Logun Edé': Star,
  'Ibeji': Crown,
  'Jagun': Shield,
  'Egum': Wind,
};

const ELEMENT_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  'Fogo': { bg: 'from-orange-500/20 to-red-600/20', border: 'border-orange-500/30', text: 'text-orange-400' },
  'Agua': { bg: 'from-blue-500/20 to-cyan-600/20', border: 'border-blue-500/30', text: 'text-blue-400' },
  'Terra': { bg: 'from-amber-500/20 to-yellow-600/20', border: 'border-amber-500/30', text: 'text-amber-400' },
  'Ar': { bg: 'from-gray-400/20 to-slate-500/20', border: 'border-gray-400/30', text: 'text-gray-400' },
  'Aether': { bg: 'from-purple-500/20 to-violet-600/20', border: 'border-purple-500/30', text: 'text-purple-400' },
};

interface OduDetail {
  numero: number;
  nome: string;
  significado: string;
  elementos: string;
  orixas: string[];
  quizilas: string[];
  preceitos: string;
  ebo: string;
}

function getElementColors(elemento: string) {
  const main = elemento.split(' / ')[0];
  return ELEMENT_COLORS[main] || ELEMENT_COLORS['Aether'];
}

function getOrixaIcon(orixa: string): React.ElementType {
  const normalized = orixa.split('/')[0].trim().replace('(Solar)', '').replace(' (Suficiente)', '');
  return ORIXAS_ICONS[normalized] || Sparkles;
}

function getPrayer(odu: OduDetail): string {
  const prayers: Record<number, string> = {
    1: "Ori buruku, daada! Ori inu, daada! Ori ota, daada! Okaran ni o daada! (Minha cabeça ruim, queiram! Minha cabeça interna, queiram! Minha cabeça de pedra, queiram! Okaran, condescende!)",
    2: "Ejiokô ni owo rere! A ja o, a ja o, Ejiokô! (Dualidade, que nossas mãos sejam boas! Nos unimos, nos unimos, Ejiokô!)",
    3: "Ogum a jegbe o! Eshu, odo rere wa! (Ogum, abre caminho! Eshu, que nossos caminhos sejam bons!)",
    4: "Irosun, osole o! Iemanjá, omi rere wa! (Irosun, nossa visão! Iemanjá, que nossas águas sejam puras!)",
    5: "Oxé! Oxum, oyin rere wa! (Oxé! Oxum, que nosso mel seja doce!)",
    6: "Obará! Xangô, 瓦o rere wa! (Obará! Xangô, que nosso pão seja nutritivo!)",
    7: "Odi! Omolu, ipaki o! (Odi! Omolu, abre a terra!)",
    8: "EjiOníle! Oxalá, apeace wa! (EjiOníle! Oxalá, que haja paz em nossas cabeças!)",
    9: "Ossá! Iansã, owo rere wa! (Ossá! Iansã, que nossas mãos sejam poderosas!)",
    10: "Ofun! Oxalá Suficiente, alafia wa! (Ofun! Oxalá suficiente, que haja saúde!)",
  };
  return prayers[odu.numero] || "Ori wa ni gbogbo ise! (A cabeça é o piloto de todas as ações!)";
}

interface OduCardProps {
  odu: OduDetail;
  onSelect: (odu: OduDetail) => void;
  isSelected: boolean;
}

function OduCard({ odu, onSelect, isSelected }: OduCardProps) {
  const colors = getElementColors(odu.elementos);

  return (
    <button
      onClick={() => onSelect(odu)}
      className={`
        w-full text-left p-4 rounded-xl border transition-all duration-200
        bg-gradient-to-br ${colors.bg} ${colors.border}
        hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]
        ${isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}
      `}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <span className="text-2xl font-bold text-foreground">{odu.numero}</span>
          <h3 className={`text-lg font-semibold ${colors.text}`}>{odu.nome}</h3>
        </div>
        <Badge variant="outline" className="text-xs">
          {odu.elementos.split(' / ')[0]}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground line-clamp-2">
        {odu.significado}
      </p>
      <div className="flex flex-wrap gap-1 mt-3">
        {odu.orixas.slice(0, 2).map((orixa) => {
          const Icon = getOrixaIcon(orixa);
          return (
            <Badge key={orixa} variant="secondary" className="text-xs gap-1">
              <Icon className="w-3 h-3" />
              {orixa.split('/')[0].trim()}
            </Badge>
          );
        })}
      </div>
    </button>
  );
}

interface OduDetailPanelProps {
  odu: OduDetail;
}

function OduDetailPanel({ odu }: OduDetailPanelProps) {
  const colors = getElementColors(odu.elementos);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl font-bold text-foreground">{odu.numero}</span>
          <div>
            <h2 className={`text-2xl font-bold ${colors.text}`}>{odu.nome}</h2>
            <p className="text-sm text-muted-foreground">{odu.elementos}</p>
          </div>
        </div>
        <Separator className="my-4" />
      </div>

      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          Significado
        </h3>
        <p className="text-foreground">{odu.significado}</p>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
          <Crown className="w-4 h-4" />
          Orixás Regentes
        </h3>
        <div className="flex flex-wrap gap-2">
          {odu.orixas.map((orixa) => {
            const Icon = getOrixaIcon(orixa);
            return (
              <Badge key={orixa} variant="outline" className="gap-1.5 py-1.5 px-3">
                <Icon className="w-4 h-4" />
                {orixa}
              </Badge>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
          <Eye className="w-4 h-4" />
          Preceitos e Proibições
        </h3>
        <Card className="bg-destructive/10 border-destructive/20">
          <CardContent className="pt-4">
            <p className="text-sm mb-3">
              <span className="font-medium text-destructive">Quizilas (proibições):</span>
            </p>
            <ul className="space-y-1.5 mb-4">
              {odu.quizilas.map((quizila, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-destructive">•</span>
                  {quizila}
                </li>
              ))}
            </ul>
            <p className="text-sm">
              <span className="font-medium text-primary">Preceitos:</span> {odu.preceitos}
            </p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
          <Leaf className="w-4 h-4" />
          Ebó (Oferenda)
        </h3>
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-4">
            <p className="text-sm">{odu.ebo}</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          Orikì (Oração)
        </h3>
        <Card className="bg-gradient-to-br from-spiritual-gold-muted/50 to-amber-500/10 border-spiritual-gold/30">
          <CardContent className="pt-4">
            <p className="text-sm italic text-foreground leading-relaxed">
              {getPrayer(odu)}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function IfaGuide() {
  const [busca, setBusca] = useState('');
  const [oduSelecionado, setOduSelecionado] = useState<OduDetail | null>(odus[0]);
  const [filtroOrixa, setFiltroOrixa] = useState<string | null>(null);

  const orixasUnicos = useMemo(() => {
    const orixasSet = new Set<string>();
    odus.forEach(odu => {
      odu.orixas.forEach(orixa => {
        orixasSet.add(orixa.split('/')[0].trim());
      });
    });
    return Array.from(orixasSet).sort();
  }, []);

  const odusFiltrados = useMemo(() => {
    let filtered = odus as OduDetail[];

    if (busca.trim()) {
      const term = busca.toLowerCase();
      filtered = filtered.filter(odu =>
        odu.nome.toLowerCase().includes(term) ||
        odu.significado.toLowerCase().includes(term) ||
        odu.orixas.some(o => o.toLowerCase().includes(term)) ||
        odu.ebo.toLowerCase().includes(term) ||
        odu.preceitos.toLowerCase().includes(term)
      );
    }

    if (filtroOrixa) {
      filtered = filtered.filter(odu =>
        odu.orixas.some(o => o.toLowerCase().includes(filtroOrixa.toLowerCase()))
      );
    }

    return filtered;
  }, [busca, filtroOrixa]);

  return (
    <Card className="bg-gradient-to-br from-card to-card/80 border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle>Guia de Ifá</CardTitle>
              <CardDescription>Referência completa dos 16 Odús</CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            {odus.length} Odús
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="grade" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="grade">Grade</TabsTrigger>
            <TabsTrigger value="detalhe">Detalhe</TabsTrigger>
          </TabsList>

          <TabsContent value="grade" className="space-y-4">
            <div className="flex flex-col gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por Odú, Orixá, significado..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-9"
                />
              </div>

              <ScrollArea className="h-auto">
                <div className="flex flex-wrap gap-2 pb-2">
                  <SpiritualButton
                    size="sm"
                    variant={filtroOrixa === null ? 'golden' : 'outline'}
                    onClick={() => setFiltroOrixa(null)}
                  >
                    Todos
                  </SpiritualButton>
                  {orixasUnicos.slice(0, 10).map((orixa) => {
                    const Icon = getOrixaIcon(orixa);
                    return (
                      <SpiritualButton
                        key={orixa}
                        size="sm"
                        variant={filtroOrixa === orixa ? 'golden' : 'outline'}
                        onClick={() => setFiltroOrixa(filtroOrixa === orixa ? null : orixa)}
                        data-icon="inline-start"
                      >
                        <Icon className="w-3 h-3" />
                        {orixa}
                      </SpiritualButton>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>

            <Separator />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {odusFiltrados.map((odu) => (
                <OduCard
                  key={odu.numero}
                  odu={odu}
                  onSelect={setOduSelecionado}
                  isSelected={oduSelecionado?.numero === odu.numero}
                />
              ))}
            </div>

            {odusFiltrados.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Nenhum Odú encontrado para "{busca}"</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="detalhe">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="lg:w-1/3 space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar Odú..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="pl-9 mb-3"
                  />
                </div>

                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-2">
                    {odusFiltrados.map((odu) => {
                      const colors = getElementColors(odu.elementos);
                      const Icon = getOrixaIcon(odu.orixas[0]);
                      return (
                        <button
                          key={odu.numero}
                          onClick={() => setOduSelecionado(odu)}
                          className={`
                            w-full text-left p-3 rounded-lg border transition-all
                            ${colors.bg} ${colors.border}
                            hover:scale-[1.01] active:scale-[0.99]
                            ${oduSelecionado?.numero === odu.numero
                              ? 'ring-2 ring-primary'
                              : ''}
                          `}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className={`w-5 h-5 ${colors.text}`} />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{odu.nome}</p>
                              <p className="text-xs text-muted-foreground truncate">
                                {odu.orixas[0]}
                              </p>
                            </div>
                            <span className="text-lg font-bold opacity-60">{odu.numero}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>

              <div className="lg:w-2/3">
                {oduSelecionado ? (
                  <OduDetailPanel odu={oduSelecionado} />
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>Selecione um Odú para ver os detalhes</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}