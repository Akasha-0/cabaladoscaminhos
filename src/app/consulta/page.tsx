'use client';

import React from 'react';
import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Sparkles,
  Loader2,
  ChevronRight,
  ChevronLeft,
  User,
  Scroll,
  Eye,
  Heart,
  Briefcase,
  Home,
  Crown,
  BookOpen,
  Save,
  Download,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Star,
  Zap,
} from 'lucide-react';
import { HOUSES_36, getHousesByPillar } from '@/lib/divination/house-delegation';
import {
  PILLAR_DESCRIPTIONS,
  PILLAR_TITLES,
  SYNTHESIS_PILLARS,
} from '@/lib/divination/final-synthesis';
import type {
  CasaState,
  ConsultaInput,
  InterpretacaoCasa,
  SinteseFinal,
} from '@/lib/divination/house-types';
import { cn } from '@/lib/utils';

// ============================================================
// TIPOS LOCAIS
// ============================================================

interface ConsultaState {
  step: 'cliente' | 'mapa' | 'cartas' | 'odus' | 'interpretacao' | 'sintese';
  consulta: ConsultaInput | null;
  interpretacoes: Map<number, InterpretacaoCasa>;
  casaStates: Map<number, CasaState>;
  sintese: SinteseFinal | null;
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function ConsultaPage() {
  const [state, setState] = useState<ConsultaState>({
    step: 'cliente',
    consulta: null,
    interpretacoes: new Map(),
    casaStates: new Map(),
    sintese: null,
  });

  const updateConsulta = (updates: Partial<ConsultaInput>) => {
    setState((prev) => ({
      ...prev,
      consulta: prev.consulta
        ? { ...prev.consulta, ...updates }
        : null,
    }));
  };

  const setStep = (step: ConsultaState['step']) => {
    setState((prev) => ({ ...prev, step }));
  };

  const initializeConsulta = () => {
    setState((prev) => ({
      ...prev,
      consulta: prev.consulta ?? {
        consultaId: `consulta-${Date.now()}`,
        cliente: {
          nomeCompleto: '',
          dataNascimento: '',
        },
        cartasCiganas: [],
        odus: [],
        spreadTipo: 'grande_consulta',
      },
    }));
    setStep('mapa');
  };

  if (!state.consulta) {
    return <WelcomeScreen onStart={initializeConsulta} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
        {/* Header */}
        <HeaderConsulta step={state.step} consulta={state.consulta} />

        {/* Tabs */}
        <Tabs
          value={state.step}
          onValueChange={(v) => setStep(v as ConsultaState['step'])}
          className="mt-6"
        >
          <TabsList className="grid w-full grid-cols-6 bg-slate-900/80 border border-slate-800">
            <TabsTrigger value="cliente" className="text-xs md:text-sm">
              <User className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
              <span className="hidden md:inline">Cliente</span>
            </TabsTrigger>
            <TabsTrigger value="mapa" className="text-xs md:text-sm">
              <Star className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
              <span className="hidden md:inline">Mapa</span>
            </TabsTrigger>
            <TabsTrigger value="cartas" className="text-xs md:text-sm">
              <Scroll className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
              <span className="hidden md:inline">Cartas</span>
            </TabsTrigger>
            <TabsTrigger value="odus" className="text-xs md:text-sm">
              <Zap className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
              <span className="hidden md:inline">Búzios</span>
            </TabsTrigger>
            <TabsTrigger value="interpretacao" className="text-xs md:text-sm">
              <Eye className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
              <span className="hidden md:inline">Leitura</span>
            </TabsTrigger>
            <TabsTrigger value="sintese" className="text-xs md:text-sm">
              <Crown className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
              <span className="hidden md:inline">Síntese</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cliente" className="mt-6">
            <ClienteTab
              consulta={state.consulta}
              onChange={updateConsulta}
              onNext={() => setStep('mapa')}
            />
          </TabsContent>

          <TabsContent value="mapa" className="mt-6">
            <MapaTab
              consulta={state.consulta}
              onChange={updateConsulta}
              onNext={() => setStep('cartas')}
              onBack={() => setStep('cliente')}
            />
          </TabsContent>

          <TabsContent value="cartas" className="mt-6">
            <CartasTab
              consulta={state.consulta}
              onChange={updateConsulta}
              onNext={() => setStep('odus')}
              onBack={() => setStep('mapa')}
            />
          </TabsContent>

          <TabsContent value="odus" className="mt-6">
            <OdusTab
              consulta={state.consulta}
              onChange={updateConsulta}
              onNext={() => setStep('interpretacao')}
              onBack={() => setStep('cartas')}
            />
          </TabsContent>

          <TabsContent value="interpretacao" className="mt-6">
            <InterpretacaoTab
              state={state}
              setState={setState}
              onNext={() => setStep('sintese')}
              onBack={() => setStep('odus')}
            />
          </TabsContent>

          <TabsContent value="sintese" className="mt-6">
            <SinteseTab
              state={state}
              setState={setState}
              onBack={() => setStep('interpretacao')}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ============================================================
// TELA INICIAL
// ============================================================

function WelcomeScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 p-4">
      <div className="max-w-3xl text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-amber-500/20 to-violet-500/20 border border-amber-500/30 flex items-center justify-center">
          <Sparkles className="w-10 h-10 text-amber-400" />
        </div>

        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-amber-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
          Cabala dos Caminhos
        </h1>
        <p className="text-lg md:text-xl text-slate-400 mb-2">
          O Oráculo Pessoal · A Enciclopédia do Destino
        </p>
        <p className="text-sm text-slate-500 mb-10 max-w-xl mx-auto">
          Sistema profissional de interpretação que cruza Baralho Cigano, Búzios,
          Astrologia, Numerologia Cabalística e Numerologia Tântrica em uma
          leitura estruturada de 36 casas.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {[
            { icon: Scroll, label: '36 Casas', color: 'text-amber-400' },
            { icon: Zap, label: 'Búzios', color: 'text-violet-400' },
            { icon: Star, label: 'Astrologia', color: 'text-pink-400' },
            { icon: Crown, label: '4 Pilares', color: 'text-emerald-400' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="p-4 rounded-xl bg-slate-900/50 border border-slate-800"
              >
                <Icon className={cn('w-6 h-6 mx-auto mb-2', item.color)} />
                <p className="text-xs text-slate-400">{item.label}</p>
              </div>
            );
          })}
        </div>

        <Button
          onClick={onStart}
          size="lg"
          className="bg-gradient-to-r from-amber-500 to-violet-500 hover:from-amber-400 hover:to-violet-400 text-slate-950 font-semibold px-8 py-6 text-base"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          Iniciar Nova Consulta
          <ChevronRight className="w-5 h-5 ml-2" />
        </Button>

        <p className="text-xs text-slate-600 mt-6">
          Apenas para uso profissional · Gabriel Oraculista
        </p>
      </div>
    </div>
  );
}

// ============================================================
// HEADER
// ============================================================

function HeaderConsulta({ step, consulta }: { step: string; consulta: ConsultaInput }) {
  const stepLabels: Record<string, string> = {
    cliente: 'Dados do Cliente',
    mapa: 'Mapa Fixo',
    cartas: 'Cartas Ciganas',
    odus: 'Búzios',
    interpretacao: 'Leitura das 36 Casas',
    sintese: 'Síntese dos 4 Pilares',
  };

  return (
    <header>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-violet-500/20 border border-amber-500/30 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-amber-400 to-violet-400 bg-clip-text text-transparent">
            {stepLabels[step] ?? 'Consulta'}
          </h1>
          <p className="text-xs text-slate-500">
            {consulta.cliente.nomeCompleto || 'Sem nome'} · ID: {consulta.consultaId.slice(-8)}
          </p>
        </div>
      </div>
    </header>
  );
}

// ============================================================
// ABA: CLIENTE
// ============================================================

function ClienteTab({
  consulta,
  onChange,
  onNext,
}: {
  consulta: ConsultaInput;
  onChange: (u: Partial<ConsultaInput>) => void;
  onNext: () => void;
}) {
  return (
    <Card className="bg-slate-900/50 border-slate-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5 text-amber-400" />
          Identificação do Consulente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome Completo *</Label>
            <Input
              id="nome"
              value={consulta.cliente.nomeCompleto}
              onChange={(e) =>
                onChange({
                  cliente: { ...consulta.cliente, nomeCompleto: e.target.value },
                })
              }
              placeholder="Nome completo do consulente"
              className="bg-slate-800/50 border-slate-700"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="data">Data de Nascimento *</Label>
            <Input
              id="data"
              type="date"
              value={consulta.cliente.dataNascimento}
              onChange={(e) =>
                onChange({
                  cliente: { ...consulta.cliente, dataNascimento: e.target.value },
                })
              }
              className="bg-slate-800/50 border-slate-700"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hora">Hora de Nascimento</Label>
            <Input
              id="hora"
              type="time"
              value={consulta.cliente.horaNascimento ?? ''}
              onChange={(e) =>
                onChange({
                  cliente: { ...consulta.cliente, horaNascimento: e.target.value },
                })
              }
              className="bg-slate-800/50 border-slate-700"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="local">Local de Nascimento</Label>
            <Input
              id="local"
              value={consulta.cliente.localNascimento ?? ''}
              onChange={(e) =>
                onChange({
                  cliente: { ...consulta.cliente, localNascimento: e.target.value },
                })
              }
              placeholder="Cidade, Estado"
              className="bg-slate-800/50 border-slate-700"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="pergunta">Pergunta do Cliente (opcional)</Label>
            <Textarea
              id="pergunta"
              value={consulta.perguntaCliente ?? ''}
              onChange={(e) => onChange({ perguntaCliente: e.target.value })}
              placeholder="O que o consulente quer saber nesta consulta?"
              className="bg-slate-800/50 border-slate-700 min-h-[100px]"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button
            onClick={onNext}
            disabled={!consulta.cliente.nomeCompleto || !consulta.cliente.dataNascimento}
            className="bg-gradient-to-r from-amber-500 to-violet-500"
          >
            Próximo: Mapa Fixo
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================
// ABA: MAPA FIXO (Astrologia + Numerologia + Orixá)
// ============================================================

function MapaTab({
  consulta,
  onChange,
  onNext,
  onBack,
}: {
  consulta: ConsultaInput;
  onChange: (u: Partial<ConsultaInput>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const updateCliente = (updates: Partial<ConsultaInput['cliente']>) => {
    onChange({ cliente: { ...consulta.cliente, ...updates } });
  };

  return (
    <div className="space-y-4">
      {/* Astrologia */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-violet-400" />
            Astrologia — Mapa Astral
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {([
              ['ascendente', 'Ascendente'],
              ['solSigno', 'Sol'],
              ['luaSigno', 'Lua'],
              ['venusSigno', 'Vênus'],
              ['marteSigno', 'Marte'],
              ['mercurioSigno', 'Mercúrio'],
              ['jupiterSigno', 'Júpiter'],
              ['saturnoSigno', 'Saturno'],
              ['uranoSigno', 'Urano'],
              ['netunoSigno', 'Netuno'],
              ['plutaoSigno', 'Plutão'],
              ['lilithSigno', 'Lilith'],
              ['noduloNorteSigno', 'Nodo Norte'],
              ['meioDoCeuSigno', 'Meio do Céu'],
            ] as const).map(([key, label]) => (
              <div key={key} className="space-y-1">
                <Label className="text-xs">{label}</Label>
                <Input
                  value={(consulta.cliente as any)[key] ?? ''}
                  onChange={(e) => updateCliente({ [key]: e.target.value } as any)}
                  placeholder="Ex: Áries"
                  className="bg-slate-800/50 border-slate-700 h-9 text-sm"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Numerologia Cabalística */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-pink-400" />
            Numerologia Cabalística
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {([
              ['caminhoDeVida', 'Caminho de Vida'],
              ['numeroAlma', 'Nº de Alma'],
              ['numeroPersonalidade', 'Nº de Personalidade'],
              ['numeroExpressao', 'Nº de Expressão'],
              ['numeroMotivacao', 'Nº de Motivação'],
              ['numeroDestino', 'Nº de Destino'],
              ['numeroMissao', 'Nº de Missão'],
              ['desafiosCarmicos', 'Desafios Cármicos'],
              ['donsDivinos', 'Dons Divinos'],
            ] as const).map(([key, label]) => (
              <div key={key} className="space-y-1">
                <Label className="text-xs">{label}</Label>
                <Input
                  type={key.includes('desafios') || key.includes('dons') ? 'text' : 'number'}
                  value={(consulta.cliente as any)[key] ?? ''}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (key === 'desafiosCarmicos' || key === 'donsDivinos') {
                      updateCliente({ [key]: v.split(',').map((n) => parseInt(n.trim(), 10)).filter((n) => !isNaN(n)) } as any);
                    } else {
                      updateCliente({ [key]: v ? parseInt(v, 10) : undefined } as any);
                    }
                  }}
                  placeholder={key.includes('desafios') || key.includes('dons') ? 'Ex: 7, 14' : '0-33'}
                  className="bg-slate-800/50 border-slate-700 h-9 text-sm"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Numerologia Tântrica + Orixá */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-emerald-400" />
            Numerologia Tântrica & Orixá
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Domínio Tântrico (Chakra Dominante)</Label>
              <Input
                value={consulta.cliente.dominioTantrico ?? ''}
                onChange={(e) => updateCliente({ dominioTantrico: e.target.value })}
                placeholder="Ex: Chakra Cardíaco"
                className="bg-slate-800/50 border-slate-700 h-9 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Número de Karma Tântrico</Label>
              <Input
                type="number"
                value={consulta.cliente.numeroKarmaTantrico ?? ''}
                onChange={(e) =>
                  updateCliente({ numeroKarmaTantrico: e.target.value ? parseInt(e.target.value, 10) : undefined })
                }
                className="bg-slate-800/50 border-slate-700 h-9 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Veredito Tântrico</Label>
              <Input
                value={consulta.cliente.vereditoTantrico ?? ''}
                onChange={(e) => updateCliente({ vereditoTantrico: e.target.value })}
                placeholder="Ex: Superação vitoriosa"
                className="bg-slate-800/50 border-slate-700 h-9 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Orixá Regente</Label>
              <Input
                value={consulta.cliente.orixaRegente ?? ''}
                onChange={(e) => updateCliente({ orixaRegente: e.target.value })}
                placeholder="Ex: Oxum"
                className="bg-slate-800/50 border-slate-700 h-9 text-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack} className="border-slate-700">
          <ChevronLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>
        <Button onClick={onNext} className="bg-gradient-to-r from-amber-500 to-violet-500">
          Próximo: Cartas Ciganas <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

// ============================================================
// ABA: CARTAS CIGANAS
// ============================================================

function CartasTab({
  consulta,
  onChange,
  onNext,
  onBack,
}: {
  consulta: ConsultaInput;
  onChange: (u: Partial<ConsultaInput>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [casaSelecionada, setCasaSelecionada] = useState<number>(1);

  const adicionarCarta = (casaId: number, nome: string) => {
    const outrasCartas = consulta.cartasCiganas.filter((c) => c.casaId !== casaId);
    onChange({
      cartasCiganas: [...outrasCartas, { casaId, nome, invertida: false }],
    });
  };

  const removerCarta = (casaId: number) => {
    onChange({
      cartasCiganas: consulta.cartasCiganas.filter((c) => c.casaId !== casaId),
    });
  };

  return (
    <Card className="bg-slate-900/50 border-slate-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scroll className="w-5 h-5 text-amber-400" />
          Sorteio das Cartas Ciganas
        </CardTitle>
        <p className="text-xs text-slate-500 mt-1">
          Lance as cartas e anote qual caiu em cada posição. Você pode pular casas
          usando o botão "Pular".
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-9 gap-2">
          {HOUSES_36.map((house) => {
            const temCarta = consulta.cartasCiganas.find((c) => c.casaId === house.number);
            return (
              <button
                key={house.number}
                onClick={() => setCasaSelecionada(house.number)}
                className={cn(
                  'p-2 rounded-lg text-center transition-all',
                  casaSelecionada === house.number
                    ? 'bg-amber-500/20 border-2 border-amber-500'
                    : temCarta
                    ? 'bg-emerald-500/10 border border-emerald-500/30'
                    : 'bg-slate-800/30 border border-slate-700/30 hover:border-slate-600'
                )}
                style={
                  casaSelecionada === house.number
                    ? undefined
                    : { borderColor: temCarta ? undefined : `${house.corPrimaria}30` }
                }
              >
                <div className="text-xs text-slate-500">Casa {house.number}</div>
                <div className="text-[10px] truncate" style={{ color: house.corPrimaria }}>
                  {house.cartaCigana}
                </div>
                {temCarta && <CheckCircle2 className="w-3 h-3 mx-auto mt-1 text-emerald-400" />}
              </button>
            );
          })}
        </div>

        <Card className="bg-slate-800/30 border-slate-700/30">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold text-white">
                  Casa {casaSelecionada} — {HOUSES_36[casaSelecionada - 1].cartaCigana}
                </h3>
                <p className="text-xs text-slate-400">
                  {HOUSES_36[casaSelecionada - 1].tema}
                </p>
              </div>
              {consulta.cartasCiganas.find((c) => c.casaId === casaSelecionada) && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => removerCarta(casaSelecionada)}
                  className="border-red-500/30 text-red-400"
                >
                  Remover
                </Button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={() => adicionarCarta(casaSelecionada, HOUSES_36[casaSelecionada - 1].cartaCigana)}
                className="bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
              >
                + Sortear Esta Carta
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-slate-700"
                onClick={() => {
                  const nome = prompt('Nome da carta sorteada:');
                  if (nome) adicionarCarta(casaSelecionada, nome);
                }}
              >
                Personalizar Nome
              </Button>
            </div>

            <div className="mt-3 text-xs text-slate-500">
              {consulta.cartasCiganas.length} de 36 cartas sorteadas
            </div>
            <Progress
              value={(consulta.cartasCiganas.length / 36) * 100}
              className="mt-1 h-1"
            />
          </CardContent>
        </Card>

        <div className="flex justify-between pt-2">
          <Button variant="outline" onClick={onBack} className="border-slate-700">
            <ChevronLeft className="w-4 h-4 mr-2" /> Voltar
          </Button>
          <Button
            onClick={onNext}
            disabled={consulta.cartasCiganas.length === 0}
            className="bg-gradient-to-r from-amber-500 to-violet-500"
          >
            Próximo: Búzios <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================
// ABA: BÚZIOS (ODUS)
// ============================================================

function OdusTab({
  consulta,
  onChange,
  onNext,
  onBack,
}: {
  consulta: ConsultaInput;
  onChange: (u: Partial<ConsultaInput>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const adicionarOdu = (nome: string, tipo: 'principal' | 'complementar') => {
    const outros = consulta.odus.filter((o) => o.tipo !== tipo);
    onChange({ odus: [...outros, { nome, tipo }] });
  };

  return (
    <Card className="bg-slate-900/50 border-slate-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-violet-400" />
          Sorteio dos Búzios (Odus)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Odu Principal */}
          <Card className="bg-slate-800/30 border-violet-500/30">
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-violet-400" />
                <h3 className="font-semibold">Odu Principal</h3>
              </div>
              <Input
                value={consulta.odus.find((o) => o.tipo === 'principal')?.nome ?? ''}
                onChange={(e) => adicionarOdu(e.target.value, 'principal')}
                placeholder="Ex: Ogbe, Oyeku, Ejiogbe..."
                className="bg-slate-900/50 border-slate-700"
              />
              <Textarea
                placeholder="Refrão / Ifá de boca (opcional)"
                className="bg-slate-900/50 border-slate-700 min-h-[80px]"
                value={consulta.odus.find((o) => o.tipo === 'principal')?.refrao ?? ''}
                onChange={(e) => {
                  const outros = consulta.odus.filter((o) => o.tipo !== 'principal');
                  onChange({ odus: [...outros, { nome: consulta.odus.find((o) => o.tipo === 'principal')?.nome ?? '', tipo: 'principal', refrao: e.target.value }] });
                }}
              />
            </CardContent>
          </Card>

          {/* Odu Complementar */}
          <Card className="bg-slate-800/30 border-pink-500/30">
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-pink-400" />
                <h3 className="font-semibold">Odu Complementar</h3>
              </div>
              <Input
                value={consulta.odus.find((o) => o.tipo === 'complementar')?.nome ?? ''}
                onChange={(e) => adicionarOdu(e.target.value, 'complementar')}
                placeholder="Ex: Iroso, Otura..."
                className="bg-slate-900/50 border-slate-700"
              />
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onBack} className="border-slate-700">
            <ChevronLeft className="w-4 h-4 mr-2" /> Voltar
          </Button>
          <Button
            onClick={onNext}
            disabled={!consulta.odus.find((o) => o.tipo === 'principal')}
            className="bg-gradient-to-r from-amber-500 to-violet-500"
          >
            Gerar Leitura das 36 Casas <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================
// ABA: INTERPRETAÇÃO (36 CASAS)
// ============================================================

function InterpretacaoTab({
  state,
  setState,
  onNext,
  onBack,
}: {
  state: ConsultaState;
  setState: React.Dispatch<React.SetStateAction<ConsultaState>>;
  onNext: () => void;
  onBack: () => void;
}) {
  const { consulta } = state;
  const [gerando, setGerando] = useState(false);
  const [progresso, setProgresso] = useState(0);
  const [casaAtual, setCasaAtual] = useState<number | null>(null);

  const interpretarCasa = useCallback(
    async (casaId: number) => {
      if (!consulta) return;
      setCasaAtual(casaId);
      setState((prev) => {
        const newStates = new Map(prev.casaStates);
        newStates.set(casaId, {
          casaId,
          status: 'gerando',
        });
        return { ...prev, casaStates: newStates };
      });

      try {
        const res = await fetch('/api/consulta/interpret', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ consulta, casaId }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || 'Erro ao interpretar');
        }

        const data = await res.json();
        setState((prev) => {
          const newStates = new Map(prev.casaStates);
          newStates.set(casaId, {
            casaId,
            status: 'pronta',
            interpretacao: data.interpretacao,
            geradoEm: new Date().toISOString(),
          });
          const newInterpretacoes = new Map(prev.interpretacoes);
          newInterpretacoes.set(casaId, data.interpretacao);
          return {
            ...prev,
            casaStates: newStates,
            interpretacoes: newInterpretacoes,
          };
        });
      } catch (err) {
        setState((prev) => {
          const newStates = new Map(prev.casaStates);
          newStates.set(casaId, {
            casaId,
            status: 'erro',
            erro: err instanceof Error ? err.message : 'Erro',
          });
          return { ...prev, casaStates: newStates };
        });
      }
    },
    [consulta, setState]
  );

  const interpretarTodas = async () => {
    if (!consulta) return;
    setGerando(true);
    setProgresso(0);

    const casasParaInterpretar = consulta.cartasCiganas.map((c) => c.casaId);

    for (let i = 0; i < casasParaInterpretar.length; i++) {
      await interpretarCasa(casasParaInterpretar[i]);
      setProgresso(((i + 1) / casasParaInterpretar.length) * 100);
    }

    setGerando(false);
    setCasaAtual(null);
  };

  return (
    <div className="space-y-4">
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-amber-400" />
              Leitura das {consulta?.cartasCiganas.length ?? 0} Casas
            </CardTitle>
            <Button
              onClick={interpretarTodas}
              disabled={gerando || (consulta?.cartasCiganas.length ?? 0) === 0}
              className="bg-gradient-to-r from-amber-500 to-violet-500"
            >
              {gerando ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Gerando...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" /> Interpretar Todas
                </>
              )}
            </Button>
          </div>
          {gerando && (
            <div className="mt-3">
              <Progress value={progresso} className="h-1" />
              <p className="text-xs text-slate-500 mt-1">
                Interpretando casa {casaAtual}...
              </p>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {HOUSES_36.map((house) => {
              const temCarta = consulta?.cartasCiganas.find((c) => c.casaId === house.number);
              if (!temCarta) return null;
              const casaState = state.casaStates.get(house.number);
              const interpretacao = state.interpretacoes.get(house.number);

              return (
                <CasaCard
                  key={house.number}
                  house={house}
                  state={casaState}
                  interpretacao={interpretacao}
                  onInterpretar={() => interpretarCasa(house.number)}
                />
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} className="border-slate-700">
          <ChevronLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>
        <Button
          onClick={onNext}
          disabled={state.interpretacoes.size === 0}
          className="bg-gradient-to-r from-amber-500 to-violet-500"
        >
          Gerar Síntese Final <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

// ============================================================
// CARD DE CASA
// ============================================================

function CasaCard({
  house,
  state,
  interpretacao,
  onInterpretar,
}: {
  house: typeof HOUSES_36[0];
  state?: CasaState;
  interpretacao?: InterpretacaoCasa;
  onInterpretar: () => void;
}) {
  const [expandido, setExpandido] = useState(false);

  return (
    <Card
      className={cn(
        'border transition-all cursor-pointer',
        interpretacao
          ? 'border-emerald-500/30 bg-emerald-500/5'
          : state?.status === 'gerando'
          ? 'border-amber-500/30 bg-amber-500/5'
          : state?.status === 'erro'
          ? 'border-red-500/30 bg-red-500/5'
          : 'border-slate-700 bg-slate-900/50'
      )}
      onClick={() => interpretacao && setExpandido(!expandido)}
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="text-[10px] text-slate-500">Casa {house.number}</div>
            <div
              className="text-xs font-semibold"
              style={{ color: house.corPrimaria }}
            >
              {house.cartaCigana}
            </div>
          </div>
          {state?.status === 'gerando' && <Loader2 className="w-3 h-3 animate-spin text-amber-400" />}
          {state?.status === 'pronta' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
          {state?.status === 'erro' && <AlertCircle className="w-3 h-3 text-red-400" />}
          {state?.status === 'pendente' && (
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onInterpretar();
              }}
              className="h-6 px-2 text-[10px] text-amber-400"
            >
              Gerar
            </Button>
          )}
        </div>

        {interpretacao && expandido && (
          <div className="mt-3 space-y-2 text-xs">
            <p className="text-slate-300 leading-relaxed">
              <strong className="text-amber-400">Significado:</strong>{' '}
              {interpretacao.conteudo.significado}
            </p>
            <p className="text-slate-300 leading-relaxed">
              <strong className="text-violet-400">Cruzamento:</strong>{' '}
              {interpretacao.conteudo.cruzamentoCarta}
            </p>
            <p className="text-slate-300 leading-relaxed">
              <strong className="text-pink-400">Mapa:</strong>{' '}
              {interpretacao.conteudo.cruzamentoMapa}
            </p>
            <p className="text-slate-300 leading-relaxed">
              <strong className="text-emerald-400">Direção:</strong>{' '}
              {interpretacao.conteudo.direcaoPratica}
            </p>
            {interpretacao.conteudo.alerta && (
              <p className="text-red-300 leading-relaxed">
                <strong className="text-red-400">⚠ Alerta:</strong>{' '}
                {interpretacao.conteudo.alerta}
              </p>
            )}
          </div>
        )}

        {interpretacao && (
          <Badge variant="outline" className="mt-2 text-[10px] border-slate-700">
            {interpretacao.tom}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================
// ABA: SÍNTESE FINAL
// ============================================================

function SinteseTab({
  state,
  setState,
  onBack,
}: {
  state: ConsultaState;
  setState: React.Dispatch<React.SetStateAction<ConsultaState>>;
  onBack: () => void;
}) {
  const { consulta, interpretacoes, sintese } = state;
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const gerarSintese = async () => {
    if (!consulta) return;
    setGerando(true);
    setErro(null);

    try {
      const res = await fetch('/api/consulta/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consulta,
          interpretacoes: Array.from(interpretacoes.values()),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Erro ao sintetizar');
      }

      const data = await res.json();
      setState((prev) => ({ ...prev, sintese: data.sintese }));
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro');
    } finally {
      setGerando(false);
    }
  };

  if (!sintese) {
    return (
      <Card className="bg-slate-900/50 border-slate-800">
        <CardContent className="py-12 text-center">
          <Crown className="w-12 h-12 mx-auto mb-4 text-amber-400" />
          <h2 className="text-xl font-bold mb-2">Síntese dos 4 Pilares</h2>
          <p className="text-sm text-slate-400 mb-6 max-w-md mx-auto">
            Vamos consolidar as {interpretacoes.size} leituras das casas em um
            parecer único dividido em 4 grandes pilares da vida.
          </p>
          <Button
            onClick={gerarSintese}
            disabled={gerando || interpretacoes.size === 0}
            size="lg"
            className="bg-gradient-to-r from-amber-500 to-violet-500"
          >
            {gerando ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Sintetizando...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" /> Gerar Síntese Final
              </>
            )}
          </Button>
          {erro && <p className="text-red-400 text-sm mt-3">{erro}</p>}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {SYNTHESIS_PILLARS.map((pilar) => {
        const pilarData =
          pilar === 'trabalho_dinheiro'
            ? sintese.pilares.trabalhoDinheiro
            : pilar === 'lar_familia'
            ? sintese.pilares.larFamilia
            : pilar === 'amor_relacionamentos'
            ? sintese.pilares.amorRelacionamentos
            : sintese.pilares.conselhoEspiritual;

        const icones = {
          trabalho_dinheiro: Briefcase,
          lar_familia: Home,
          amor_relacionamentos: Heart,
          conselho_espiritual: Crown,
        };
        const Icon = icones[pilar];

        return (
          <Card
            key={pilar}
            className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 border-slate-800"
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-violet-500/20 border border-amber-500/30 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold bg-gradient-to-r from-amber-400 to-violet-400 bg-clip-text text-transparent">
                    {pilarData.titulo}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {PILLAR_DESCRIPTIONS[pilar]}
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-200 leading-relaxed">
                {pilarData.resumoExecutivo}
              </p>

              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-amber-400 uppercase">
                  Pontos-Chave
                </h4>
                <ul className="space-y-1">
                  {pilarData.pontosChave.map((p, i) => (
                    <li key={i} className="text-sm text-slate-300 flex gap-2">
                      <span className="text-amber-400">•</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/30">
                <h4 className="text-xs font-semibold text-emerald-400 uppercase mb-1">
                  Orientação Prática
                </h4>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {pilarData.orientacaoPratica}
                </p>
              </div>

              <div className="flex flex-wrap gap-1">
                {pilarData.casasUsadas.map((casa) => (
                  <Badge key={casa} variant="outline" className="text-[10px] border-slate-700">
                    Casa {casa}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {sintese.vereditoCarmico && (
        <Card className="bg-gradient-to-br from-amber-900/20 to-red-900/20 border-amber-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-400" />
              Veredito Cármico Final — Casa 36
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base text-amber-100 leading-relaxed italic">
              &ldquo;{sintese.vereditoCarmico}&rdquo;
            </p>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} className="border-slate-700">
          <ChevronLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" className="border-slate-700">
            <Download className="w-4 h-4 mr-2" /> Exportar PDF
          </Button>
          <Button className="bg-gradient-to-r from-amber-500 to-violet-500">
            <Save className="w-4 h-4 mr-2" /> Salvar Consulta
          </Button>
        </div>
      </div>
    </div>
  );
}
