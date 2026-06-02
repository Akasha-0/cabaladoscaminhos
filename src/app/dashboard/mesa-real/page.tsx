'use client';

// ============================================================
// MESA REAL PAGE - Cabala Dos Caminhos
// Cockpit Oracular - Interactive 9x4 Grid
// ============================================================

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/useToast';
import { MesaRealGrid, CasaModal } from '@/components/mesa-real';

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

// fallow-ignore-next-line complexity
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

// fallow-ignore-next-line complexity
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
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center items-center min-h-[400px]">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!clientId) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Mesa Real</CardTitle>
            <CardDescription>
              Selecione um consulente para iniciar a tiragem
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => (window.location.href = '/dashboard/clientes')}>
              Ir para Consulentes
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Mesa Real</h1>
          {client && (
            <p className="text-muted-foreground">
              Consulente: <strong>{client.fullName}</strong>
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleResetGrid}>
            Limpar Tiragem
          </Button>
          <Button
            onClick={handleGenerateDossier}
            disabled={generating || filledCount === 0}
          >
            {generating ? 'Gerando...' : 'Gerar Dossiê'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Grid Section */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Tiragem - 36 Casas</CardTitle>
              <CardDescription>
                {filledCount} de 36 casas preenchidas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MesaRealGrid
                matrixData={matrixData}
                onCasaClick={handleCasaClick}
              />
            </CardContent>
          </Card>
        </div>

        {/* Stats/Instructions Section */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Como Usar</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p>1. Selecione o consulente nomenu</p>
              <p>2. Clique nas casas para adicionar Carta e Odú</p>
              <p>3. Preencha quantas casas desejar</p>
              <p>4. Clique em "Gerar Dossiê" para análise</p>
            </CardContent>
          </Card>

          {client && (
            <Card>
              <CardHeader>
                <CardTitle>Dados do Consulente</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p>
                  <strong>Nascimento:</strong>{' '}
                  {new Date(client.birthDate).toLocaleDateString('pt-BR')}
                </p>
                {client.astrologyMap && (
                  <p>
                    <strong>Numerologia:</strong>{' '}
                    {Object.keys(client.astrologyMap).length > 0
                      ? 'Calculada'
                      : 'Aguardando cálculo'}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Report Display */}
      {report && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Dossiê Gerado</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="prose prose-sm max-w-none"
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
  );
}

// ============================================================
// WRAPPED COMPONENT
// ============================================================

export default function MesaRealPage() {
  return (
    <Suspense fallback={<div className="container py-8">Carregando...</div>}>
      <MesaRealPageContent />
    </Suspense>
  );
}
