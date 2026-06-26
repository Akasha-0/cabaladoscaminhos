'use client';

// ============================================================
// MESA REAL PAGE - Cabala Dos Caminhos
// Cockpit Oracular - Interactive 9x4 Grid
// ============================================================

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { WidgetStat } from '@/components/dashboard/SpiritualWidgetSystem';
import { useToast } from '@/hooks/useToast';
import { MesaRealGrid, CasaModal } from '@/components/mesa-real';
import { Sparkles, RotateCcw, FileText, User, Loader2, Info, Star, CheckCircle2 } from 'lucide-react';

// ============================================================
// TYPES
// ============================================================

interface MatrixData {
  [casa: number]: { carta?: number; odu?: number };
}

interface ClientInfo {
  id: string;
  fullName: string;
  birthDate: string;
  astrologyMap?: Record<string, unknown>;
  kabalisticMap?: Record<string, unknown>;
  tantricMap?: Record<string, unknown>;
}

interface GenerateResult {
  success: boolean;
  reportId?: string;
  readingId?: string;
  content?: string;
  markdown?: string;
  error?: string;
}

// ============================================================
// API HELPERS
// ============================================================

async function fetchClient(clientId: string): Promise<ClientInfo | null> {
  const res = await fetch(`/api/mesa-real/clients?clientId=${clientId}`);
  const data = await res.json();
  return data.client || null;
}

async function fetchOrCreateReading(
  clientId: string,
  userId: string,
  matrixData: MatrixData
): Promise<{ readingId: string }> {
  const res = await fetch('/api/mesa-real/readings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientId, userId, matrixData }),
  });
  const data = await res.json();
  return data.reading || null;
}

async function generateDossier(
  clientId: string,
  readingId: string,
  matrixData: MatrixData
): Promise<GenerateResult> {
  const res = await fetch('/api/mesa-real/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientId, readingId, matrixData }),
  });
  return res.json();
}

// ============================================================
// MAIN COMPONENT (with Suspense for useSearchParams)
// ============================================================

function MesaRealPageContent() {
  const searchParams = useSearchParams();
  const clientId = searchParams.get('clientId');
  const { toast } = useToast();

  // State
  const [client, setClient] = useState<ClientInfo | null>(null);
  const [matrixData, setMatrixData] = useState<MatrixData>({});
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCasa, setSelectedCasa] = useState<number | null>(null);
  const [readingId, setReadingId] = useState<string | null>(null);

  // Load client data
  useEffect(() => {
    if (clientId) {
      loadClient(clientId);
    } else {
      setLoading(false);
    }
  }, [clientId]);

  const loadClient = async (id: string) => {
    setLoading(true);
    try {
      const clientData = await fetchClient(id);
      setClient(clientData);
    } catch (err) {
      toast({
        title: 'Erro',
        description: 'Falha ao carregar dados do cliente',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCasaClick = (casaNumero: number) => {
    setSelectedCasa(casaNumero);
    setModalOpen(true);
  };

  const handleSaveCasa = (casaNumero: number, data: { carta: number; odu?: number }) => {
    setMatrixData((prev) => ({
      ...prev,
      [casaNumero]: { carta: data.carta, odu: data.odu },
    }));
  };

  const handleClearCasa = (casaNumero: number) => {
    setMatrixData((prev) => {
      const newData = { ...prev };
      delete newData[casaNumero];
      return newData;
    });
  };

  const filledCount = Object.keys(matrixData).length;
  const fillPercentage = Math.round((filledCount / 36) * 100);

  const handleGenerateDossier = async () => {
    if (!clientId || filledCount === 0) return;

    setGenerating(true);
    try {
      // Create reading
      const reading = await fetchOrCreateReading(clientId, 'system', matrixData);
      if (reading) {
        setReadingId(reading.readingId);
      }

      // Generate dossier
      const result = await generateDossier(
        clientId,
        readingId || reading?.readingId || '',
        matrixData
      );

      if (result.success) {
        setReport(result.markdown || result.content || null);
        toast({ title: 'Dossiê gerado com sucesso!' });
      } else {
        toast({
          title: 'Erro',
          description: result.error || 'Falha ao gerar dossiê',
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: 'Erro',
        description: 'Falha ao gerar dossiê',
        variant: 'destructive',
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleResetGrid = () => {
    if (confirm('Limpar toda a tiragem?')) {
      setMatrixData({});
      setReport(null);
      setReadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto flex justify-center items-center min-h-[400px]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
            <p className="text-slate-400">Carregando Mesa Real...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!clientId) {
    return (
      <div className="min-h-screen p-4 md:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <Card className="card-spiritual bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-sm border-slate-800/50">
            <CardHeader className="pb-3 border-b border-slate-800/50">
              <CardTitle className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500/10 to-violet-500/10 border border-amber-500/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                </div>
                <span className="text-xl font-cinzel bg-gradient-to-r from-amber-400 to-violet-400 bg-clip-text text-transparent">
                  Mesa Real
                </span>
              </CardTitle>
              <CardDescription className="text-slate-400">
                Selecione um consulente para iniciar a tiragem
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <Button
                onClick={() => (window.location.href = '/dashboard/clientes')}
                className="bg-gradient-to-r from-amber-500 to-violet-500 hover:from-amber-600 hover:to-violet-600 text-white border-0"
              >
                <User className="w-4 h-4 mr-2" />
                Ir para Consulentes
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-cinzel bg-gradient-to-r from-amber-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
              Mesa Real
            </h1>
            {client && (
              <p className="text-slate-400 mt-1">
                Consulente: <strong className="text-amber-300">{client.fullName}</strong>
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              onClick={handleResetGrid}
              className="border-slate-700 bg-slate-800/50 hover:bg-slate-700/50"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Limpar Tiragem
            </Button>
            <Button
              onClick={handleGenerateDossier}
              disabled={generating || filledCount === 0}
              className="bg-gradient-to-r from-amber-500 to-violet-500 hover:from-amber-600 hover:to-violet-600 text-white border-0"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Gerar Dossiê
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <WidgetStat
            label="Casas Preenchidas"
            value={`${filledCount}/36`}
            icon={<CheckCircle2 className="w-4 h-4" />}
            color="emerald"
          />
          <WidgetStat
            label="Progresso"
            value={`${fillPercentage}%`}
            icon={<Sparkles className="w-4 h-4" />}
            color="amber"
          />
          <WidgetStat
            label="Cartas"
            value={filledCount}
            icon={<Star className="w-4 h-4" />}
            color="violet"
          />
          <WidgetStat
            label="Status"
            value={filledCount === 36 ? 'Completa' : 'Em jogo'}
            icon={<Info className="w-4 h-4" />}
            color="cyan"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Grid Section */}
          <div className="lg:col-span-2">
            <Card className="card-spiritual bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-sm border-slate-800/50">
              <CardHeader className="pb-3 border-b border-slate-800/50">
                <CardTitle className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500/10 to-violet-500/10 border border-amber-500/20 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                  </div>
                  <span className="text-base font-semibold bg-gradient-to-r from-amber-400 to-violet-400 bg-clip-text text-transparent">
                    Tiragem — 36 Casas
                  </span>
                </CardTitle>
                <CardDescription className="text-slate-400">
                  {filledCount} de 36 casas preenchidas ({fillPercentage}%)
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <MesaRealGrid
                  matrixData={matrixData}
                  onCasaClick={handleCasaClick}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="card-spiritual bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-sm border-slate-800/50">
              <CardHeader className="pb-3 border-b border-slate-800/50">
                <CardTitle className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500/10 to-amber-500/10 border border-cyan-500/20 flex items-center justify-center">
                    <Info className="w-4 h-4 text-cyan-400" />
                  </div>
                  <span className="text-base font-semibold bg-gradient-to-r from-cyan-400 to-amber-400 bg-clip-text text-transparent">
                    Como Usar
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 text-sm text-slate-300 space-y-3">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center text-xs font-bold">1</span>
                  <span>Selecione o consulente no menu lateral</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center text-xs font-bold">2</span>
                  <span>Clique nas casas para adicionar Carta e Odú</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center text-xs font-bold">3</span>
                  <span>Preencha quantas casas desejar</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center text-xs font-bold">4</span>
                  <span>Clique em <strong className="text-amber-300">"Gerar Dossiê"</strong> para análise completa</span>
                </div>
              </CardContent>
            </Card>

            {client && (
              <Card className="card-spiritual bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-sm border-slate-800/50">
                <CardHeader className="pb-3 border-b border-slate-800/50">
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-pink-500/10 to-violet-500/10 border border-pink-500/20 flex items-center justify-center">
                      <User className="w-4 h-4 text-pink-400" />
                    </div>
                    <span className="text-base font-semibold bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent">
                      Dados do Consulente
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 text-sm space-y-3">
                  <div>
                    <p className="text-xs text-slate-500">Nome</p>
                    <p className="text-slate-200">{client.fullName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Nascimento</p>
                    <p className="text-slate-200">{new Date(client.birthDate).toLocaleDateString('pt-BR')}</p>
                  </div>
                  {client.astrologyMap && (
                    <div>
                      <p className="text-xs text-slate-500">Numerologia</p>
                      <p className="text-slate-200">
                        {Object.keys(client.astrologyMap).length > 0 ? 'Calculada' : 'Aguardando cálculo'}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Report Display */}
        {report && (
          <Card className="card-spiritual bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-sm border-slate-800/50">
            <CardHeader className="pb-3 border-b border-slate-800/50">
              <CardTitle className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500/10 to-amber-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-base font-semibold bg-gradient-to-r from-emerald-400 to-amber-400 bg-clip-text text-transparent">
                  Dossiê Gerado
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div
                className="prose prose-sm prose-invert max-w-none text-slate-300"
                dangerouslySetInnerHTML={{ __html: report.replace(/\n/g, '<br>') }}
              />
            </CardContent>
          </Card>
        )}

        {/* Casa Edit Modal */}
        <CasaModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          casaNumero={selectedCasa}
          matrixData={matrixData}
          onSave={handleSaveCasa}
          onClear={handleClearCasa}
        />
      </div>
    </div>
  );
}

// ============================================================
// WRAPPED COMPONENT
// ============================================================

export default function MesaRealPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto flex justify-center items-center min-h-[400px]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
            <p className="text-slate-400">Carregando Mesa Real...</p>
          </div>
        </div>
      </div>
    }>
      <MesaRealPageContent />
    </Suspense>
  );
}