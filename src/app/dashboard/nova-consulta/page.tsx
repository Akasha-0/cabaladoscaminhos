'use client';

import React from 'react';
import { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  User, Star, Heart, Sparkles, Crown, Loader2, CheckCircle2, AlertCircle,
  Save, Download, Send, Eye, ChevronLeft, ChevronRight, BookOpen, Zap,
  Calendar, MapPin, Clock, Scroll, Flame,
} from 'lucide-react';
import { MesaRealGrid, type CasaSlotData } from '@/components/consulta/MesaRealGrid';
import { HOUSES_36 } from '@/lib/divination/house-delegation';
import { CARTAS_CIGANAS } from '@/lib/mesa-real/cards';
import { ODUS_16 } from '@/lib/mesa-real/oduses';
import { SYNTHESIS_PILLARS } from '@/lib/divination/final-synthesis';
import type {
  ConsultaInput, InterpretacaoCasa, SinteseFinal,
} from '@/lib/divination/house-types';
import { cn } from '@/lib/utils';

function criarConsultaVazia(): ConsultaInput {
  return {
    consultaId: `cons-${Date.now()}`,
    cliente: { nomeCompleto: '', dataNascimento: '' },
    cartasCiganas: [],
    odus: [],
    spreadTipo: 'grande_consulta',
  };
}

export default function NovaConsultaPage() {
  const [step, setStep] = useState<'cliente' | 'mesa' | 'gerar'>('cliente');
  const [consulta, setConsulta] = useState<ConsultaInput>(criarConsultaVazia);
  const [mesaValues, setMesaValues] = useState<Map<number, CasaSlotData>>(
    () => new Map(HOUSES_36.map((h) => [h.number, { casaId: h.number, cartaNumero: null, oduNumero: null }]))
  );
  const [gerando, setGerando] = useState(false);
  const [progresso, setProgresso] = useState(0);
  const [interpretacoes, setInterpretacoes] = useState<InterpretacaoCasa[]>([]);
  const [sintese, setSintese] = useState<SinteseFinal | null>(null);

  const updateCliente = (updates: Partial<ConsultaInput['cliente']>) => {
    setConsulta((prev) => ({ ...prev, cliente: { ...prev.cliente, ...updates } }));
  };

  const handleMesaChange = useCallback((casaId: number, data: Partial<CasaSlotData>) => {
    setMesaValues((prev) => {
      const next = new Map(prev);
      const current = next.get(casaId) ?? { casaId, cartaNumero: null, oduNumero: null };
      next.set(casaId, { ...current, ...data });
      return next;
    });
  }, []);

  const handleMesaClear = useCallback((casaId: number) => {
    setMesaValues((prev) => {
      const next = new Map(prev);
      next.set(casaId, { casaId, cartaNumero: null, oduNumero: null });
      return next;
    });
  }, []);

  const casasPreenchidas = useMemo(
    () => Array.from(mesaValues.values()).filter((v) => v.cartaNumero !== null || v.oduNumero !== null),
    [mesaValues]
  );

  const gerarDossie = async () => {
    setStep('gerar');
    setGerando(true);
    setProgresso(0);
    setInterpretacoes([]);
    setSintese(null);

    const casasParaInterpretar = Array.from(mesaValues.values()).filter(
      (v) => v.cartaNumero !== null
    );

    if (casasParaInterpretar.length === 0) {
      alert('Selecione pelo menos uma carta na Mesa Real');
      setGerando(false);
      setStep('mesa');
      return;
    }

    const consultaFinal: ConsultaInput = {
      ...consulta,
      cartasCiganas: casasParaInterpretar.map((v) => {
        const carta = CARTAS_CIGANAS.find((c) => c.numero === v.cartaNumero);
        return { casaId: v.casaId, nome: v.cartaNomeCustom ?? carta?.nome, invertida: false };
      }),
      odus: Array.from(mesaValues.values())
        .filter((v) => v.oduNumero !== null)
        .slice(0, 2)
        .map((v, idx) => {
          const odu = ODUS_16.find((o) => o.numero === v.oduNumero);
          return {
            nome: v.oduNomeCustom ?? odu?.nome ?? '',
            tipo: idx === 0 ? ('principal' as const) : ('complementar' as const),
          };
        }),
    };

    const results: InterpretacaoCasa[] = [];

    for (let i = 0; i < casasParaInterpretar.length; i++) {
      const slot = casasParaInterpretar[i];
      try {
        const res = await fetch('/api/consulta/interpret', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ consulta: consultaFinal, casaId: slot.casaId }),
        });
        if (res.ok) {
          const data = await res.json();
          results.push(data.interpretacao);
          setInterpretacoes([...results]);
        }
      } catch (err) {
        console.error(`Erro casa ${slot.casaId}:`, err);
      }
      setProgresso(((i + 1) / casasParaInterpretar.length) * 80);
    }

    try {
      const synthRes = await fetch('/api/consulta/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consulta: consultaFinal, interpretacoes: results }),
      });
      if (synthRes.ok) {
        const data = await synthRes.json();
        setSintese(data.sintese);
      }
    } catch (err) {
      console.error('Erro síntese:', err);
    }

    setProgresso(100);
    setGerando(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-violet-500/20 border border-amber-500/30 flex items-center justify-center">
              <Flame className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-violet-400 bg-clip-text text-transparent">
                Cabala dos Caminhos
              </h1>
              <p className="text-xs text-slate-500">Cockpit do Oraculista · Mesa Real Integrada</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="border-slate-700 hidden md:flex">
              <Save className="w-4 h-4 mr-2" /> Salvar Rascunho
            </Button>
            <Button variant="outline" className="border-slate-700 hidden md:flex">
              <BookOpen className="w-4 h-4 mr-2" /> Histórico
            </Button>
          </div>
        </header>

        <div className="flex items-center gap-2 mb-6">
          {[
            { id: 'cliente', label: '1. Consulente', icon: User },
            { id: 'mesa', label: '2. Mesa Real', icon: Scroll },
            { id: 'gerar', label: '3. Dossiê', icon: Sparkles },
          ].map((s, i) => {
            const Icon = s.icon;
            const isActive = step === s.id;
            const stepIdx = ['cliente', 'mesa', 'gerar'].indexOf(step);
            const isPast = stepIdx > i;
            return (
              <React.Fragment key={s.id}>
                <button
                  onClick={() => setStep(s.id as any)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all',
                    isActive ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                    isPast ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    'bg-slate-900/50 text-slate-500 border border-slate-800'
                  )}
                >
                  {isPast ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  <span className="hidden md:inline">{s.label}</span>
                </button>
                {i < 2 && <ChevronRight className="w-4 h-4 text-slate-700" />}
              </React.Fragment>
            );
          })}
        </div>

        {step === 'cliente' && (
          <ClienteStep
            consulta={consulta}
            updateCliente={updateCliente}
            onNext={() => setStep('mesa')}
          />
        )}
        {step === 'mesa' && (
          <MesaStep
            consulta={consulta}
            mesaValues={mesaValues}
            onMesaChange={handleMesaChange}
            onMesaClear={handleMesaClear}
            casasPreenchidasCount={casasPreenchidas.length}
            onBack={() => setStep('cliente')}
            onGerar={gerarDossie}
          />
        )}
        {step === 'gerar' && (
          <GerarStep
            interpretacoes={interpretacoes}
            sintese={sintese}
            gerando={gerando}
            progresso={progresso}
            onBack={() => setStep('mesa')}
          />
        )}
      </div>
    </div>
  );
}

function ClienteStep({
  consulta, updateCliente, onNext,
}: {
  consulta: ConsultaInput;
  updateCliente: (u: Partial<ConsultaInput['cliente']>) => void;
  onNext: () => void;
}) {
  const podeAvancar = consulta.cliente.nomeCompleto && consulta.cliente.dataNascimento;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="w-4 h-4 text-amber-400" /> Dados do Consulente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1 md:col-span-2">
                <Label className="text-xs">Nome Completo (conforme certidão) *</Label>
                <Input
                  value={consulta.cliente.nomeCompleto}
                  onChange={(e) => updateCliente({ nomeCompleto: e.target.value })}
                  placeholder="Ex: Maria das Graças Silva"
                  className="bg-slate-800/50 border-slate-700"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Data de Nascimento *
                </Label>
                <Input
                  type="date"
                  value={consulta.cliente.dataNascimento}
                  onChange={(e) => updateCliente({ dataNascimento: e.target.value })}
                  className="bg-slate-800/50 border-slate-700"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Hora de Nascimento
                </Label>
                <Input
                  type="time"
                  value={consulta.cliente.horaNascimento ?? ''}
                  onChange={(e) => updateCliente({ horaNascimento: e.target.value })}
                  className="bg-slate-800/50 border-slate-700"
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                <Label className="text-xs flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Cidade / Estado de Nascimento
                </Label>
                <Input
                  value={consulta.cliente.localNascimento ?? ''}
                  onChange={(e) => updateCliente({ localNascimento: e.target.value })}
                  placeholder="Ex: Salvador, BA"
                  className="bg-slate-800/50 border-slate-700"
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                <Label className="text-xs">Pergunta do Consulente (opcional)</Label>
                <Textarea
                  value={consulta.perguntaCliente ?? ''}
                  onChange={(e) => setConsulta((p) => ({ ...p, perguntaCliente: e.target.value }))}
                  placeholder="Sobre o que o consulente quer entender nesta leitura?"
                  className="bg-slate-800/50 border-slate-700 min-h-[80px]"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Star className="w-4 h-4 text-violet-400" /> Mapa Astral (Astrologia)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {([
                ['ascendente', 'Ascendente'], ['solSigno', 'Sol'],
                ['luaSigno', 'Lua'], ['venusSigno', 'Vênus'],
                ['marteSigno', 'Marte'], ['mercurioSigno', 'Mercúrio'],
                ['saturnoSigno', 'Saturno'], ['netunoSigno', 'Netuno'],
                ['plutaoSigno', 'Plutão'], ['jupiterSigno', 'Júpiter'],
                ['lilithSigno', 'Lilith'], ['meioDoCeuSigno', 'Meio Céu'],
              ] as const).map(([key, label]) => (
                <div key={key} className="space-y-0.5">
                  <Label className="text-[10px]">{label}</Label>
                  <Input
                    value={(consulta.cliente as any)[key] ?? ''}
                    onChange={(e) => updateCliente({ [key]: e.target.value } as any)}
                    placeholder="Signo"
                    className="bg-slate-800/50 border-slate-700 h-8 text-xs"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Heart className="w-4 h-4 text-pink-400" /> Numerologia (Cabalística + Tântrica)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {([
                ['caminhoDeVida', 'Caminho de Vida', 'num'],
                ['numeroAlma', 'Nº de Alma', 'num'],
                ['numeroExpressao', 'Nº de Expressão', 'num'],
                ['numeroMotivacao', 'Nº de Motivação', 'num'],
                ['numeroDestino', 'Nº de Destino', 'num'],
                ['numeroMissao', 'Nº de Missão', 'num'],
                ['dominioTantrico', 'Domínio Tântrico', 'text'],
                ['orixaRegente', 'Orixá Regente', 'text'],
              ] as const).map(([key, label, tipo]) => (
                <div key={key} className="space-y-0.5">
                  <Label className="text-[10px]">{label}</Label>
                  <Input
                    type={tipo === 'num' ? 'number' : 'text'}
                    value={(consulta.cliente as any)[key] ?? ''}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (tipo === 'num') {
                        updateCliente({ [key]: v ? parseInt(v, 10) : undefined } as any);
                      } else {
                        updateCliente({ [key]: v } as any);
                      }
                    }}
                    placeholder="—"
                    className="bg-slate-800/50 border-slate-700 h-8 text-xs"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            onClick={onNext}
            disabled={!podeAvancar}
            size="lg"
            className="bg-gradient-to-r from-amber-500 to-violet-500"
          >
            Próximo: Mesa Real <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <Card className="bg-amber-500/5 border-amber-500/20">
          <CardContent className="pt-4 space-y-2">
            <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Sobre este Cockpit
            </h4>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Este é o seu posto de trabalho durante o atendimento. Os dados
              preenchidos aqui alimentam o motor de IA que gera a Enciclopédia
              dos Caminhos.
            </p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="pt-4 space-y-2">
            <h4 className="text-xs font-bold text-slate-300">💡 Dica</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Quanto mais completo o mapa (astrologia + numerologia), mais
              preciso o cruzamento. Mas o sistema funciona mesmo com dados parciais.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MesaStep({
  consulta, mesaValues, onMesaChange, onMesaClear, casasPreenchidasCount, onBack, onGerar,
}: {
  consulta: ConsultaInput;
  mesaValues: Map<number, CasaSlotData>;
  onMesaChange: (casaId: number, data: Partial<CasaSlotData>) => void;
  onMesaClear: (casaId: number) => void;
  casasPreenchidasCount: number;
  onBack: () => void;
  onGerar: () => void;
}) {
  const total = 36;
  const percentual = (casasPreenchidasCount / total) * 100;

  return (
    <div className="space-y-4">
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Scroll className="w-4 h-4 text-amber-400" />
                Mesa Real · 9 × 4 (36 Casas)
              </CardTitle>
              <p className="text-xs text-slate-500 mt-1">
                Clique em cada slot para sortear a Carta Cigana e o Odu de Búzios
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-500">Preenchidas</p>
              <p className="text-lg font-bold text-amber-400">{casasPreenchidasCount}/36</p>
            </div>
          </div>
          <Progress value={percentual} className="h-1 mt-3" />
        </CardHeader>
        <CardContent>
          <MesaRealGrid
            values={mesaValues}
            onChange={onMesaChange}
            onClear={onMesaClear}
          />
          <div className="mt-6 p-4 rounded-xl bg-slate-800/30 border border-slate-700/30 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
              <User className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">
                {consulta.cliente.nomeCompleto || 'Consulente sem nome'}
              </p>
              <p className="text-xs text-slate-400">
                {consulta.cliente.dataNascimento || '—'}
                {consulta.cliente.horaNascimento ? ` às ${consulta.cliente.horaNascimento}` : ''}
                {consulta.cliente.localNascimento ? ` · ${consulta.cliente.localNascimento}` : ''}
              </p>
            </div>
            {consulta.cliente.orixaRegente && (
              <Badge variant="outline" className="border-amber-500/30 text-amber-400">
                {consulta.cliente.orixaRegente}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} className="border-slate-700">
          <ChevronLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>
        <Button
          onClick={onGerar}
          disabled={casasPreenchidasCount === 0}
          size="lg"
          className="bg-gradient-to-r from-amber-500 to-violet-500"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Gerar Dossiê Cabala dos Caminhos
          <Send className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

function GerarStep({
  interpretacoes, sintese, gerando, progresso, onBack,
}: {
  interpretacoes: InterpretacaoCasa[];
  sintese: SinteseFinal | null;
  gerando: boolean;
  progresso: number;
  onBack: () => void;
}) {
  const [casaAberta, setCasaAberta] = useState<number | null>(null);

  if (gerando) {
    return (
      <Card className="bg-slate-900/50 border-slate-800">
        <CardContent className="py-16 text-center space-y-4">
          <Loader2 className="w-12 h-12 mx-auto text-amber-400 animate-spin" />
          <h2 className="text-xl font-bold">Gerando Dossiê...</h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            A IA está interpretando cada casa da Mesa Real, cruzando com o mapa
            do consulente e gerando a Enciclopédia dos Caminhos.
          </p>
          <div className="max-w-md mx-auto">
            <Progress value={progresso} className="h-1" />
            <p className="text-xs text-slate-500 mt-2">
              {Math.round(progresso)}% · {interpretacoes.length} casas interpretadas
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-amber-500/10 to-violet-500/10 border-amber-500/30">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-violet-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
              <Crown className="w-7 h-7 text-amber-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold bg-gradient-to-r from-amber-400 to-violet-400 bg-clip-text text-transparent">
                Dossiê Cabala dos Caminhos
              </h2>
              <p className="text-sm text-slate-300 mt-1">
                {interpretacoes.length} casas interpretadas · 4 pilares sintetizados
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="border-slate-700">
                <Save className="w-4 h-4 mr-2" /> Salvar
              </Button>
              <Button className="bg-gradient-to-r from-amber-500 to-violet-500">
                <Download className="w-4 h-4 mr-2" /> PDF Premium
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="casas" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-slate-900/80 border border-slate-800">
          <TabsTrigger value="casas">
            <Eye className="w-3 h-3 mr-2" /> 36 Casas ({interpretacoes.length})
          </TabsTrigger>
          <TabsTrigger value="pilares">
            <Crown className="w-3 h-3 mr-2" /> 4 Pilares
          </TabsTrigger>
        </TabsList>

        <TabsContent value="casas" className="space-y-2 mt-4">
          {interpretacoes.map((interp) => {
            const house = HOUSES_36.find((h) => h.number === interp.casaId);
            if (!house) return null;
            const isOpen = casaAberta === interp.casaId;
            return (
              <Card
                key={interp.casaId}
                className="bg-slate-900/50 border-slate-800 cursor-pointer hover:border-amber-500/30 transition-all"
                onClick={() => setCasaAberta(isOpen ? null : interp.casaId)}
              >
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0"
                      style={{ backgroundColor: `${house.corPrimaria}20`, color: house.corPrimaria }}
                    >
                      {house.number}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-sm" style={{ color: house.corPrimaria }}>
                          {interp.cartaCigana}
                        </h3>
                        <Badge variant="outline" className="border-slate-700 text-violet-400 text-[9px]">
                          {interp.oduPrincipal}
                        </Badge>
                        <Badge variant="outline" className="border-slate-700 text-[9px]">
                          {interp.tom}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{house.tema}</p>
                      {isOpen && (
                        <div className="mt-3 space-y-3 text-xs text-slate-300">
                          <div>
                            <p className="text-amber-400 font-semibold mb-1">Significado Sagrado</p>
                            <p className="leading-relaxed">{interp.conteudo.significado}</p>
                          </div>
                          <div>
                            <p className="text-violet-400 font-semibold mb-1">Cruzamento Carta + Odu</p>
                            <p className="leading-relaxed">{interp.conteudo.cruzamentoCarta}</p>
                          </div>
                          <div>
                            <p className="text-pink-400 font-semibold mb-1">Cruzamento com Mapa</p>
                            <p className="leading-relaxed">{interp.conteudo.cruzamentoMapa}</p>
                          </div>
                          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                            <p className="text-emerald-400 font-semibold mb-1">Direção Prática</p>
                            <p className="leading-relaxed">{interp.conteudo.direcaoPratica}</p>
                          </div>
                          {interp.conteudo.alerta && (
                            <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                              <p className="text-red-400 font-semibold mb-1">⚠ Alerta</p>
                              <p className="leading-relaxed">{interp.conteudo.alerta}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="pilares" className="space-y-4 mt-4">
          {sintese ? (
            <>
              {SYNTHESIS_PILLARS.map((pilar) => {
                const pilarData =
                  pilar === 'trabalho_dinheiro' ? sintese.pilares.trabalhoDinheiro :
                  pilar === 'lar_familia' ? sintese.pilares.larFamilia :
                  pilar === 'amor_relacionamentos' ? sintese.pilares.amorRelacionamentos :
                  sintese.pilares.conselhoEspiritual;
                return (
                  <Card key={pilar} className="bg-slate-900/50 border-slate-800">
                    <CardHeader>
                      <CardTitle className="text-base">{pilarData.titulo}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <p className="text-slate-200 leading-relaxed">{pilarData.resumoExecutivo}</p>
                      <ul className="space-y-1">
                        {pilarData.pontosChave.map((p, i) => (
                          <li key={i} className="text-slate-300 flex gap-2">
                            <span className="text-amber-400">•</span>
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                        <p className="text-emerald-400 text-xs font-semibold mb-1">Orientação Prática</p>
                        <p className="text-slate-200 text-sm leading-relaxed">{pilarData.orientacaoPratica}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              {sintese.vereditoCarmico && (
                <Card className="bg-gradient-to-br from-amber-900/20 to-red-900/20 border-amber-500/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Crown className="w-4 h-4 text-amber-400" /> Veredito Cármico — Casa 36
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-base text-amber-100 italic leading-relaxed">
                      &ldquo;{sintese.vereditoCarmico}&rdquo;
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card className="bg-slate-900/50 border-slate-800">
              <CardContent className="py-8 text-center text-slate-400">
                <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">Síntese não disponível</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <div className="flex justify-start">
        <Button variant="outline" onClick={onBack} className="border-slate-700">
          <ChevronLeft className="w-4 h-4 mr-2" /> Voltar para Mesa
        </Button>
      </div>
    </div>
  );
}
