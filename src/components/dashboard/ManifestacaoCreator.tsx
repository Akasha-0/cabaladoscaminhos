'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Sparkles,
  Heart,
  Target,
  TrendingUp,
  Shield,
  Flame,
  Star,
  Moon,
  Sun,
  Zap,
  Save,
  Trash2,
  Plus,
  Check,
  Eye,
  Calendar,
  Clock,
  Bookmark,
  Share2,
  ChevronRight,
  Lightbulb,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type IntentionType =
  | 'amor'
  | 'abundancia'
  | 'saude'
  | 'protecao'
  | 'sabedoria'
  | 'prosperidade'
  | 'harmonia'
  | 'proposito'
  | 'cura'
  | 'manifestacao';

interface Manifestacao {
  id: string;
  tipo: IntentionType;
  intencao: string;
  afirmacao: string;
  createdAt: string;
  visualizada: boolean;
  vezesRepetida: number;
}

interface ManifestacaoStats {
  total: number;
  ativa: number;
  repetidaTotal: number;
  porTipo: Record<IntentionType, number>;
}

const TIPO_CONFIG: Record<
  IntentionType,
  {
    label: string;
    icon: typeof Heart;
    cor: string;
    corBg: string;
    descricao: string;
  }
> = {
  amor: {
    label: 'Amor',
    icon: Heart,
    cor: 'text-rose-500',
    corBg: 'bg-rose-500/10',
    descricao: 'Amor próprio, amor romântico, conexões profundas',
  },
  abundancia: {
    label: 'Abundância',
    icon: TrendingUp,
    cor: 'text-emerald-500',
    corBg: 'bg-emerald-500/10',
    descricao: 'Prosperidade financeira, oportunidades, riqueza',
  },
  saude: {
    label: 'Saúde',
    icon: Shield,
    cor: 'text-cyan-500',
    corBg: 'bg-cyan-500/10',
    descricao: 'Bem-estar físico, mental e espiritual',
  },
  protecao: {
    label: 'Proteção',
    icon: Flame,
    cor: 'text-amber-500',
    corBg: 'bg-amber-500/10',
    descricao: 'Escudo divino, segurança, barreiras energéticas',
  },
  sabedoria: {
    label: 'Sabedoria',
    icon: Star,
    cor: 'text-violet-500',
    corBg: 'bg-violet-500/10',
    descricao: 'Conhecimento, discernimento, clareza mental',
  },
  prosperidade: {
    label: 'Prosperidade',
    icon: Zap,
    cor: 'text-yellow-500',
    corBg: 'bg-yellow-500/10',
    descricao: 'Crescimento em todas as áreas da vida',
  },
  harmonia: {
    label: 'Harmonia',
    icon: Moon,
    cor: 'text-blue-400',
    corBg: 'bg-blue-400/10',
    descricao: 'Paz interior, equilíbrio, serenidade',
  },
  proposito: {
    label: 'Propósito',
    icon: Sun,
    cor: 'text-orange-500',
    corBg: 'bg-orange-500/10',
    descricao: 'Missão de vida, direção, significado',
  },
  cura: {
    label: 'Cura',
    icon: Target,
    cor: 'text-green-500',
    corBg: 'bg-green-500/10',
    descricao: 'Liberação de traumas, renovação, perdão',
  },
  manifestacao: {
    label: 'Manifestação',
    icon: Sparkles,
    cor: 'text-purple-500',
    corBg: 'bg-purple-500/10',
    descricao: 'Criar realidade, visualizar, atraír',
  },
};

const AFIRMACOES_MODELO: Record<IntentionType, string[]> = {
  amor: [
    'Eu sou digno de amor verdadeiro e me permito receber',
    'O amor flui naturalmente para mim em todas as direções',
    'Eu abro meu coração para conexões autênticas e profundas',
  ],
  abundancia: [
    'A abundância é meu direito divino e eu a aceito agora',
    'Sou um ímã para prosperidade e oportunidades',
    'Dinheiro e recursos fluem para mim com facilidade',
  ],
  saude: [
    'Meu corpo está em harmonia perfeita e irradia vitalidade',
    'Cada célula do meu ser vibra com saúde e bem-estar',
    'Eu nutro meu corpo com amor e consciência',
  ],
  protecao: [
    'Estou envolto em luz divina que me protege de todo mal',
    'Nenhuma energia negativa pode atravessar meu escudo',
    'Sou abençoado com segurança e proteção em todos os momentos',
  ],
  sabedoria: [
    'A sabedoria do universo flui através de mim',
    'Minhas decisões são guiadas pela intuição verdadeira',
    'Eu tenho clareza mental e discernimento perfeito',
  ],
  prosperidade: [
    'Prosperidade se manifesta em todas as áreas da minha vida',
    'Eu atraio riqueza e oportunidades ilimitadas',
    'Minha mente está aberta para receber bênçãos infinitas',
  ],
  harmonia: [
    'Paz e equilíbrio habitam em meu ser',
    'Aceito a vida como ela se apresenta com serenidade',
    'Harmonia interior reflete em todo o meu ambiente',
  ],
  proposito: [
    'Eu conheço meu propósito e o executo com paixão',
    'Minha missão de vida se revela a cada dia',
    'Sou guiado pela força divina para cumprir meu destino',
  ],
  cura: [
    'Eu me libero de todo peso do passado com amor',
    'Cura completa flui através de cada parte do meu ser',
    'Perdão e renovação são meus aliados neste momento',
  ],
  manifestacao: [
    'Eu crio minha realidade com intenção e poder',
    'Meus pensamentos se manifestam no mundo físico',
    'O universo conspira para realizar meus desejos',
  ],
};

function generateId(): string {
  return `manifestacao_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function loadManifestacoes(): Manifestacao[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('manifestacoes');
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

function saveManifestacoes(manifestacoes: Manifestacao[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('manifestacoes', JSON.stringify(manifestacoes));
}

function getStats(): ManifestacaoStats {
  const manifestacoes = loadManifestacoes();
  const porTipo: Record<IntentionType, number> = {
    amor: 0,
    abundancia: 0,
    saude: 0,
    protecao: 0,
    sabedoria: 0,
    prosperidade: 0,
    harmonia: 0,
    proposito: 0,
    cura: 0,
    manifestacao: 0,
  };

  manifestacoes.forEach((m) => {
    porTipo[m.tipo]++;
  });

  return {
    total: manifestacoes.length,
    ativa: manifestacoes.filter((m) => !m.visualizada).length,
    repetidaTotal: manifestacoes.reduce((acc, m) => acc + m.vezesRepetida, 0),
    porTipo,
  };
}

function gerarAfirmacaoPersonalizada(intencao: string, tipo: IntentionType): string {
  const modelos = AFIRMACOES_MODELO[tipo];
  const modeloBase = modelos[Math.floor(Math.random() * modelos.length)];

  if (intencao.length > 10) {
    return `"${intencao}" é minha verdade agora. ${modeloBase.split('.').slice(1).join('.')}`.trim();
  }
  return modeloBase;
}

export function ManifestacaoCreator() {
  const [tipoSelecionado, setTipoSelecionado] = useState<IntentionType | null>(null);
  const [intencao, setIntencao] = useState('');
  const [afirmacaoGerada, setAfirmacaoGerada] = useState('');
  const [afirmacaoEditada, setAfirmacaoEditada] = useState('');
  const [manifestacoes, setManifestacoes] = useState<Manifestacao[]>([]);
  const [manifestacaoAtiva, setManifestacaoAtiva] = useState<Manifestacao | null>(null);
  const [stats, setStats] = useState<ManifestacaoStats | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [tab, setTab] = useState<'criar' | 'historico'>('criar');

  const carregarDados = useCallback(() => {
    const loaded = loadManifestacoes();
    setManifestacoes(loaded);
    const ativa = loaded.find((m) => !m.visualizada) || null;
    setManifestacaoAtiva(ativa);
    setStats(getStats());
  }, []);

  useState(() => {
    carregarDados();
  });

  const selecionarTipo = (tipo: IntentionType) => {
    setTipoSelecionado(tipo);
    setMostrarForm(true);
  };

  const gerarAfirmacao = () => {
    if (!tipoSelecionado || !intencao) return;
    const gerada = gerarAfirmacaoPersonalizada(intencao, tipoSelecionado);
    setAfirmacaoGerada(gerada);
    setAfirmacaoEditada(gerada);
  };

  const salvarManifestacao = () => {
    if (!tipoSelecionado || !intencao || !afirmacaoEditada) return;

    const nova: Manifestacao = {
      id: generateId(),
      tipo: tipoSelecionado,
      intencao,
      afirmacao: afirmacaoEditada,
      createdAt: new Date().toISOString(),
      visualizada: false,
      vezesRepetida: 0,
    };

    const atualizadas = [nova, ...manifestacoes];
    saveManifestacoes(atualizadas);
    setManifestacoes(atualizadas);
    setManifestacaoAtiva(nova);
    setStats(getStats());

    setTipoSelecionado(null);
    setIntencao('');
    setAfirmacaoGerada('');
    setAfirmacaoEditada('');
    setMostrarForm(false);
    setTab('historico');
  };

  const marcarVisualizada = (id: string) => {
    const atualizadas = manifestacoes.map((m) =>
      m.id === id ? { ...m, visualizada: true } : m
    );
    saveManifestacoes(atualizadas);
    setManifestacoes(atualizadas);
    if (manifestacaoAtiva?.id === id) {
      setManifestacaoAtiva({ ...manifestacaoAtiva, visualizada: true });
    }
  };

  const incrementarRepeticao = (id: string) => {
    const atualizadas = manifestacoes.map((m) =>
      m.id === id ? { ...m, vezesRepetida: m.vezesRepetida + 1 } : m
    );
    saveManifestacoes(atualizadas);
    setManifestacoes(atualizadas);
    setStats(getStats());
  };

  const excluirManifestacao = (id: string) => {
    const atualizadas = manifestacoes.filter((m) => m.id !== id);
    saveManifestacoes(atualizadas);
    setManifestacoes(atualizadas);
    if (manifestacaoAtiva?.id === id) {
      setManifestacaoAtiva(atualizadas[0] || null);
    }
    setStats(getStats());
  };

  return (
    <div className="space-y-4">
      <Card className="border-purple-500/20 bg-gradient-to-br from-purple-950/50 to-indigo-950/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-400" />
              <CardTitle className="text-purple-100">Criador de Manifestações</CardTitle>
            </div>
            {stats && (
              <div className="flex gap-2">
                <Badge variant="outline" className="border-purple-500/30 text-purple-300">
                  {stats.total} manifestações
                </Badge>
                {stats.ativa > 0 && (
                  <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                    {stats.ativa} ativa{stats.ativa > 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {manifestacaoAtiva && (
            <div className="rounded-lg border border-purple-500/30 bg-purple-500/5 p-4">
              <div className="flex items-center justify-between mb-2">
                <Badge className={cn('text-xs', TIPO_CONFIG[manifestacaoAtiva.tipo].corBg, TIPO_CONFIG[manifestacaoAtiva.tipo].cor)}>
                  {TIPO_CONFIG[manifestacaoAtiva.tipo].label}
                </Badge>
                <span className="text-xs text-purple-300/60">{formatDate(manifestacaoAtiva.createdAt)}</span>
              </div>
              <p className="font-medium text-purple-100 mb-2">&ldquo;{manifestacaoAtiva.intencao}&rdquo;</p>
              <p className="text-sm text-purple-200/80 italic mb-3">&ldquo;{manifestacaoAtiva.afirmacao}&rdquo;</p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => marcarVisualizada(manifestacaoAtiva.id)}
                  className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
                >
                  <Check className="h-3 w-3 mr-1" />
                  Confirmar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => incrementarRepeticao(manifestacaoAtiva.id)}
                  className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
                >
                  <Clock className="h-3 w-3 mr-1" />
                  Repetir ({manifestacaoAtiva.vezesRepetida})
                </Button>
              </div>
            </div>
          )}

          <Tabs value={tab} onValueChange={(v) => setTab(v as 'criar' | 'historico')}>
            <TabsList className="bg-purple-950/50">
              <TabsTrigger value="criar" className="data-[state=active]:bg-purple-500/20">
                <Plus className="h-4 w-4 mr-1" />
                Criar
              </TabsTrigger>
              <TabsTrigger value="historico" className="data-[state=active]:bg-purple-500/20">
                <Bookmark className="h-4 w-4 mr-1" />
                Histórico
              </TabsTrigger>
            </TabsList>

            <TabsContent value="criar" className="space-y-4 mt-4">
              {!mostrarForm ? (
                <div className="space-y-3">
                  <Label className="text-purple-200/80">Selecione o tipo de intenção</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {(Object.keys(TIPO_CONFIG) as IntentionType[]).map((tipo) => {
                      const config = TIPO_CONFIG[tipo];
                      const Icon = config.icon;
                      return (
                        <button
                          key={tipo}
                          onClick={() => selecionarTipo(tipo)}
                          className={cn(
                            'flex flex-col items-center gap-1 p-3 rounded-lg border transition-all',
                            'hover:border-purple-500/50 hover:bg-purple-500/10',
                            'border-purple-500/20 bg-purple-950/30'
                          )}
                        >
                          <Icon className={cn('h-5 w-5', config.cor)} />
                          <span className="text-xs text-purple-200">{config.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    {tipoSelecionado && (
                      <Badge className={cn(TIPO_CONFIG[tipoSelecionado].corBg, TIPO_CONFIG[tipoSelecionado].cor)}>
                        {(() => {
                          const Icon = TIPO_CONFIG[tipoSelecionado].icon;
                          return <Icon className="h-3 w-3 mr-1" />;
                        })()}
                        {TIPO_CONFIG[tipoSelecionado].label}
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="intencao" className="text-purple-200/80">
                      Sua intenção
                    </Label>
                    <Textarea
                      id="intencao"
                      value={intencao}
                      onChange={(e) => setIntencao(e.target.value)}
                      placeholder="Escreva sua intenção com clareza e intenção..."
                      className="bg-purple-950/50 border-purple-500/30 text-purple-100 placeholder:text-purple-300/40"
                      rows={3}
                    />
                  </div>

                  {!afirmacaoGerada ? (
                    <Button
                      onClick={gerarAfirmacao}
                      disabled={!intencao}
                      className="w-full bg-purple-600 hover:bg-purple-500"
                    >
                      <Lightbulb className="h-4 w-4 mr-2" />
                      Gerar Afirmação
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-purple-200/80">Afirmação gerada</Label>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={gerarAfirmacao}
                          className="text-purple-400 hover:text-purple-300"
                        >
                          <Sparkles className="h-3 w-3 mr-1" />
                          Regenerar
                        </Button>
                      </div>
                      <Textarea
                        value={afirmacaoEditada}
                        onChange={(e) => setAfirmacaoEditada(e.target.value)}
                        className="bg-purple-950/50 border-purple-500/30 text-purple-100"
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={salvarManifestacao}
                          disabled={!afirmacaoEditada}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-500"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Salvar
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setMostrarForm(false);
                            setTipoSelecionado(null);
                            setIntencao('');
                            setAfirmacaoGerada('');
                            setAfirmacaoEditada('');
                          }}
                          className="border-purple-500/30 text-purple-300"
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="historico" className="space-y-3 mt-4">
              {manifestacoes.length === 0 ? (
                <div className="text-center py-8 text-purple-300/60">
                  <Bookmark className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma manifestação criada ainda</p>
                </div>
              ) : (
                manifestacoes.map((m) => {
                  const config = TIPO_CONFIG[m.tipo];
                  const Icon = config.icon;
                  return (
                    <div
                      key={m.id}
                      className={cn(
                        'rounded-lg border p-3 space-y-2',
                        m.visualizada
                          ? 'border-purple-500/10 bg-purple-950/20'
                          : 'border-purple-500/30 bg-purple-500/5'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className={cn('h-4 w-4', config.cor)} />
                          <Badge className={cn('text-xs', config.corBg, config.cor)}>
                            {config.label}
                          </Badge>
                          {m.visualizada && (
                            <Check className="h-3 w-3 text-emerald-400" />
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-purple-300/60">
                            {m.vezesRepetida}x
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => excluirManifestacao(m.id)}
                            className="h-6 w-6 p-0 text-purple-400/60 hover:text-rose-400"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm font-medium text-purple-200">&ldquo;{m.intencao}&rdquo;</p>
                      <p className="text-xs text-purple-300/70 italic">&ldquo;{m.afirmacao}&rdquo;</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-purple-300/50">{formatDate(m.createdAt)}</span>
                        <div className="flex gap-1">
                          {!m.visualizada && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => marcarVisualizada(m.id)}
                              className="h-6 text-xs border-purple-500/20 text-purple-300"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Confirmar
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => incrementarRepeticao(m.id)}
                            className="h-6 text-xs border-purple-500/20 text-purple-300"
                          >
                            <Clock className="h-3 w-3 mr-1" />
                            Repetir
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </TabsContent>
          </Tabs>

          {stats && stats.total > 0 && (
            <>
              <Separator className="bg-purple-500/20" />
              <div className="space-y-2">
                <Label className="text-purple-200/80">Distribuição por tipo</Label>
                <div className="flex flex-wrap gap-1">
                  {(Object.keys(TIPO_CONFIG) as IntentionType[]).map((tipo) => {
                    const config = TIPO_CONFIG[tipo];
                    const count = stats.porTipo[tipo];
                    if (count === 0) return null;
                    return (
                      <Badge
                        key={tipo}
                        className={cn('text-xs', config.corBg, config.cor)}
                      >
                        {config.label}: {count}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ManifestacaoCreator;