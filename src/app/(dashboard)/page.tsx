'use client';

import React, { memo, useMemo, useCallback, useState } from 'react';

import { DiaSpiritual } from '@/components/dashboard/DiaSpiritual';
import { OdusExplorer } from '@/components/dashboard/OdusExplorer';
import { CartasLenormand } from '@/components/dashboard/CartasLenormand';
import { OrixasExplorer } from '@/components/dashboard/OrixasExplorer';
import { ChakrasExplorer } from '@/components/dashboard/ChakrasExplorer';
import { MapaNatalCard } from '@/components/astrologia/MapaNatalCard';
import { TransitosAtivos } from '@/components/astrologia/TransitosAtivos';
import { useMapaNatal } from '@/hooks/useMapaNatal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { getCorrespondenciasDia, fasesLua } from '@/lib/data/spiritual-data';
import { useNumerologia, useCiclos } from '@/lib/hooks';
import { InsightDiario } from '@/components/dashboard/InsightDiario';
import { CorrespondenciasVisuais } from '@/components/dashboard/CorrespondenciasVisuais';
import { 
  Moon, 
  Sun, 
  Star, 
  Zap,
  AlertCircle
} from 'lucide-react';

const DADOS_EXEMPLO = {
  nomeCompleto: 'Maria da Luz',
  dataNascimento: '1990-06-15'
};

// Memoized heavy components with display names
const MemoizedOdusExplorer = memo(OdusExplorer);
MemoizedOdusExplorer.displayName = 'MemoizedOdusExplorer';

const MemoizedCartasLenormand = memo(CartasLenormand);
MemoizedCartasLenormand.displayName = 'MemoizedCartasLenormand';

const MemoizedOrixasExplorer = memo(OrixasExplorer);
MemoizedOrixasExplorer.displayName = 'MemoizedOrixasExplorer';

const MemoizedChakrasExplorer = memo(ChakrasExplorer);
MemoizedChakrasExplorer.displayName = 'MemoizedChakrasExplorer';

const MemoizedMapaNatalCard = memo(MapaNatalCard);
MemoizedMapaNatalCard.displayName = 'MemoizedMapaNatalCard';

const MemoizedTransitosAtivos = memo(TransitosAtivos);
MemoizedTransitosAtivos.displayName = 'MemoizedTransitosAtivos';

const MemoizedDiaSpiritual = memo(DiaSpiritual);
MemoizedDiaSpiritual.displayName = 'MemoizedDiaSpiritual';

const MemoizedInsightDiario = memo(InsightDiario);
MemoizedInsightDiario.displayName = 'MemoizedInsightDiario';

const MemoizedCorrespondenciasVisuais = memo(CorrespondenciasVisuais);
MemoizedCorrespondenciasVisuais.displayName = 'MemoizedCorrespondenciasVisuais';

// Type for fasesLua entries
type FaseLua = typeof fasesLua[number];

// Memoized Lunar Phase Item Component
const LunarPhaseItem = memo(({ fase }: { fase: FaseLua }) => (
  <div 
    className="p-4 rounded-lg bg-gradient-to-br from-background/80 to-background/40 border border-border/50 hover:border-primary/30 transition-colors"
  >
    <div className="flex items-center gap-2 mb-3">
      <Moon className="w-5 h-5 text-primary" />
      <h3 className="font-cinzel text-primary text-sm">
        {fase.fase}
      </h3>
    </div>
    
    <div className="space-y-2 text-xs">
      <div>
        <p className="text-muted-foreground mb-1">Estado Psíquico</p>
        <p className="font-raleway text-foreground/80">{fase.estado}</p>
      </div>
      <div>
        <p className="text-muted-foreground mb-1">Janela Ideal</p>
        <p className="font-raleway text-foreground/80">{fase.janela}</p>
      </div>
      <div>
        <p className="text-muted-foreground mb-1">Ritual</p>
        <p className="font-raleway text-foreground/80">{fase.ritual}</p>
      </div>
      <div>
        <p className="text-muted-foreground mb-1">Orixás</p>
        <p className="font-raleway text-foreground/80">{fase.orixas}</p>
      </div>
    </div>
  </div>
));
LunarPhaseItem.displayName = 'LunarPhaseItem';

// Memoized Cycle Display Component  
const CycleDisplay = memo(({
  label,
  numero,
  sefirot,
  icon: Icon,
  colorClass,
  loading
}: {
  label: string;
  numero: number | null | undefined;
  sefirot: string | undefined;
  icon: typeof Sun;
  colorClass: string;
  loading: boolean;
}) => (
  <div className={`text-center p-4 rounded-lg bg-${colorClass}-900/10 border border-${colorClass}-500/20`}>
    <div className="flex items-center justify-center gap-2 mb-2">
      <Icon className={`w-4 h-4 text-${colorClass}-400`} />
      <span className={`text-xs text-${colorClass}-400/70`}>{label}</span>
    </div>
    {loading ? (
      <Skeleton className="h-8 w-12 mx-auto" />
    ) : (
      <>
        <div className={`text-2xl font-cinzel text-${colorClass}-400`}>{numero ?? '-'}</div>
        <div className={`text-xs text-${colorClass}-400/50 mt-1`}>{sefirot ?? '---'}</div>
      </>
    )}
  </div>
));
CycleDisplay.displayName = 'CycleDisplay';

function DashboardPage() {
  // State for tab selection with useCallback
  const [activeTab, setActiveTab] = useState('explorers');
  
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
  }, []);

  // Memoized expensive calculation for daily correspondences
  const diaInfo = useMemo(() => {
    return getCorrespondenciasDia();
  }, []);

  // Memoized example data to prevent object recreation
  const dadosExemplo = useMemo(() => DADOS_EXEMPLO, []);

  // Data hooks
  const { 
    pitagorica, 
    cabalistica, 
    tantrica, 
    loading: loadingNumerologia, 
    error: errorNumerologia 
  } = useNumerologia(dadosExemplo.nomeCompleto, dadosExemplo.dataNascimento);
  
  const { 
    ano, 
    mes, 
    dia: diaPessoal, 
    loading: loadingCiclos, 
    error: errorCiclos 
  } = useCiclos(dadosExemplo.dataNascimento);
  
  const { transitos } = useMapaNatal();

  // Memoized lunar phases
  const fasesMemoizadas = useMemo(() => fasesLua, []);

  // Memoized header badges
  const headerBadges = useMemo(() => (
    <>
      <Badge variant="outline" className="px-4 py-2 font-raleway text-sm">
        <Moon className="w-4 h-4 mr-2" />
        {diaInfo.dia.dia}
      </Badge>
      <Badge variant="outline" className="px-4 py-2 font-raleway text-sm">
        <Star className="w-4 h-4 mr-2" />
        {diaInfo.faseLua?.fase ?? '-'}
      </Badge>
    </>
  ), [diaInfo.dia.dia, diaInfo.faseLua?.fase]);

  // Memoized current date
  const currentDate = useMemo(() => new Date().toLocaleDateString('pt-BR'), []);

  // Dynamic loading status for aria-live region
  const loadingStatus = useMemo(() => {
    if (loadingNumerologia) return 'Carregando informações numerológicas...';
    if (loadingCiclos) return 'Carregando ciclos temporais...';
    return `Dados carregados. Número Pitagórico: ${pitagorica ?? 'não disponível'}`;
  }, [loadingNumerologia, loadingCiclos, pitagorica]);

  return (
    <>
      {/* Skip to main content link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
      >
        Pular para o conteúdo principal
      </a>
      
      {/* Live region for dynamic content announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only" role="status">
        {loadingStatus}
      </div>
      
      <div className="min-h-screen p-6 lg:p-8">
        <div id="main-content" role="main" aria-label="Painel Espiritual - Espaço de autoconhecimento e alinhamento cósmico" className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4" aria-label="Cabeçalho do Painel">
            <div>
              <h1 className="text-3xl font-cinzel text-primary tracking-wide">
                Painel Espiritual
              </h1>
              <p className="text-muted-foreground font-raleway mt-1">
                Bem-vindo ao seu espaço de autoconhecimento e alinhamento cósmico
              </p>
            </div>
            <div className="flex items-center gap-3" aria-label="Informações do dia">
              {headerBadges}
            </div>
          </header>

          {/* Cards de Resumo Numerológico */}
          <section role="region" aria-label="Resumo Numerológico" className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-amber-900/20 to-amber-950/50 border-amber-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-raleway text-amber-400/70">Número Pitagórico</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingNumerologia ? (
                  <Skeleton className="h-10 w-16" />
                ) : errorNumerologia ? (
                  <div className="flex items-center gap-1 text-destructive text-sm" role="alert">
                    <AlertCircle className="w-4 h-4" />
                    Erro
                  </div>
                ) : (
                  <div className="text-3xl font-cinzel text-amber-400" aria-label={`Número Pitagórico: ${pitagorica ?? 'não disponível'}`}>
                    {pitagorica ?? '-'}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-900/20 to-purple-950/50 border-purple-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-raleway text-purple-400/70">Número Cabalístico</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingNumerologia ? (
                  <Skeleton className="h-10 w-16" />
                ) : (
                  <div className="text-3xl font-cinzel text-purple-400" aria-label={`Número Cabalístico: ${cabalistica ?? 'não disponível'}`}>
                    {cabalistica ?? '-'}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-pink-900/20 to-pink-950/50 border-pink-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-raleway text-pink-400/70">Número Tântrico</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingNumerologia ? (
                  <Skeleton className="h-10 w-16" />
                ) : (
                  <div className="text-3xl font-cinzel text-pink-400" aria-label={`Número Tântrico: ${tantrica ?? 'não disponível'}`}>
                    {tantrica ?? '-'}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-900/20 to-blue-950/50 border-blue-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-raleway text-blue-400/70">Ano Pessoal</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingCiclos ? (
                  <Skeleton className="h-10 w-16" />
                ) : errorCiclos ? (
                  <div className="flex items-center gap-1 text-destructive text-sm" role="alert">
                    <AlertCircle className="w-4 h-4" />
                    Erro
                  </div>
                ) : (
                  <div className="text-3xl font-cinzel text-blue-400" aria-label={`Ano Pessoal: ${ano?.numero ?? 'não disponível'}`}>
                    {ano?.numero ?? '-'}
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Ciclos Temporais */}
          <Card role="region" aria-label="Ciclos Temporais" className="bg-gradient-to-br from-card to-card/80 border-border/50">
            <CardHeader>
              <CardTitle className="text-lg font-cinzel text-primary flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Seus Ciclos Temporais
              </CardTitle>
              <CardDescription className="font-raleway">
                Energia para o momento presente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg bg-amber-900/10 border border-amber-500/20">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span className="text-xs text-amber-400/70">Ano</span>
                  </div>
                  {loadingCiclos ? (
                    <Skeleton className="h-8 w-12 mx-auto" />
                  ) : (
                    <>
                      <div className="text-2xl font-cinzel text-amber-400" aria-label={`Ano: ${ano?.numero ?? 'não disponível'}`}>{ano?.numero ?? '-'}</div>
                      <div className="text-xs text-amber-400/50 mt-1">{ano?.sefirot ?? '---'}</div>
                    </>
                  )}
                </div>
                <div className="text-center p-4 rounded-lg bg-blue-900/10 border border-blue-500/20">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Moon className="w-4 h-4 text-blue-400" />
                    <span className="text-xs text-blue-400/70">Mês</span>
                  </div>
                  {loadingCiclos ? (
                    <Skeleton className="h-8 w-12 mx-auto" />
                  ) : (
                    <>
                      <div className="text-2xl font-cinzel text-blue-400" aria-label="{`Mês: ${mes?.numero ?? 'não disponível'}`}">{mes?.numero ?? '-'}</div>
                      <div className="text-xs text-blue-400/50 mt-1">{mes?.sefirot ?? '---'}</div>
                    </>
                  )}
                </div>
                <div className="text-center p-4 rounded-lg bg-purple-900/10 border border-purple-500/20">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Star className="w-4 h-4 text-purple-400" />
                    <span className="text-xs text-purple-400/70">Dia</span>
                  </div>
                  {loadingCiclos ? (
                    <Skeleton className="h-8 w-12 mx-auto" />
                  ) : (
                    <>
                      <div className="text-2xl font-cinzel text-purple-400" aria-label={`Dia: ${diaPessoal?.numero ?? 'não disponível'}`}>{diaPessoal?.numero ?? '-'}</div>
                      <div className="text-xs text-purple-400/50 mt-1">{diaPessoal?.sefirot ?? '---'}</div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Astrologia Cards */}
          <section role="region" aria-label="Informações Astrológicas" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MemoizedMapaNatalCard />
            <MemoizedTransitosAtivos transitos={transitos} />
          </section>

          {/* Dia Spiritual Card */}
          <section role="region" aria-label="Espiritualidade do Dia">
            <MemoizedDiaSpiritual />
          </section>

          {/* Insights do Dia */}
          <section role="region" aria-label="Insights Diários">
            <MemoizedInsightDiario 
              dataNascimento="1990-06-15"
              nome="Maria da Luz"
              odu="Okaran"
              numeroPessoal={7}
            />
          </section>

          {/* Mapa de Correlações */}
          <section role="region" aria-label="Mapa de Correlações Cósmicas">
            <MemoizedCorrespondenciasVisuais />
          </section>

          {/* Main Content Tabs */}
          <nav role="navigation" aria-label="Navegação de exploradores">
            <Tabs 
              defaultValue="explorers" 
              className="w-full"
              onValueChange={handleTabChange}
              aria-label="Exploradores espirituais"
            >
              <TabsList className="grid w-full grid-cols-4 mb-6" role="tablist">
                <TabsTrigger value="explorers" className="font-raleway text-xs sm:text-sm" role="tab" aria-selected={activeTab === 'explorers'}>
                  <Star className="w-4 h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Exploradores</span>
                  <span className="sm:hidden">Exp.</span>
                </TabsTrigger>
                <TabsTrigger value="orus" className="font-raleway text-xs sm:text-sm" role="tab" aria-selected={activeTab === 'orus'}>
                  <Sun className="w-4 h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Orixás</span>
                  <span className="sm:hidden">Ori.</span>
                </TabsTrigger>
                <TabsTrigger value="chakras" className="font-raleway text-xs sm:text-sm" role="tab" aria-selected={activeTab === 'chakras'}>
                  <Zap className="w-4 h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Chakras</span>
                  <span className="sm:hidden">Chak.</span>
                </TabsTrigger>
                <TabsTrigger value="lua" className="font-raleway text-xs sm:text-sm" role="tab" aria-selected={activeTab === 'lua'}>
                  <Moon className="w-4 h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Fases da Lua</span>
                  <span className="sm:hidden">Lua</span>
                </TabsTrigger>
              </TabsList>

              {/* Explorers Tab */}
              <TabsContent value="explorers" className="space-y-6" role="tabpanel" aria-label="Exploradores">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <MemoizedOdusExplorer />
                  <MemoizedCartasLenormand />
                </div>
              </TabsContent>

              {/* Orixás Tab */}
              <TabsContent value="orus" role="tabpanel" aria-label="Orixás">
                <MemoizedOrixasExplorer />
              </TabsContent>

              {/* Chakras Tab */}
              <TabsContent value="chakras" role="tabpanel" aria-label="Chakras">
                <MemoizedChakrasExplorer />
              </TabsContent>

              {/* Lua Tab */}
              <TabsContent value="lua" role="tabpanel" aria-label="Fases da Lua">
                <Card className="bg-gradient-to-br from-card to-card/80 border-border/50">
                  <CardHeader>
                    <CardTitle className="text-xl font-cinzel text-primary flex items-center gap-2">
                      <Moon className="w-5 h-5" />
                      Alquimia Lunar
                    </CardTitle>
                    <CardDescription className="font-raleway">
                      janelas de operação mágica e estados psíquicos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {fasesMemoizadas.map((fase) => (
                        <LunarPhaseItem key={fase.fase} fase={fase} />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </nav>

          {/* Footer Info */}
          <footer className="text-center py-6" role="contentinfo" aria-label="Informações do rodapé">
            <p className="text-xs text-muted-foreground font-raleway">
              Cabala dos Caminhos - Sistema de autoconhecimento e alinhamento cósmico
            </p>
            <p className="text-xs text-muted-foreground/50 font-raleway mt-1">
              Última atualização: {currentDate}
            </p>
          </footer>
        </div>
      </div>
    </>
  );
}

export default DashboardPage;
