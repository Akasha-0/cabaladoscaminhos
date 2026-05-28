'use client';

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

export default function DashboardPage() {
  const { dia } = getCorrespondenciasDia();
  const { pitagorica, cabalistica, tantrica, loading: loadingNumerologia, error: errorNumerologia } = useNumerologia(
    DADOS_EXEMPLO.nomeCompleto,
    DADOS_EXEMPLO.dataNascimento
  );
  const { ano, mes, dia: diaPessoal, loading: loadingCiclos, error: errorCiclos } = useCiclos(DADOS_EXEMPLO.dataNascimento);
  const { transitos } = useMapaNatal();

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-cinzel text-primary tracking-wide">
              Painel Espiritual
            </h1>
            <p className="text-muted-foreground font-raleway mt-1">
              Bem-vindo ao seu espaço de autoconhecimento e alinhamento cósmico
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="px-4 py-2 font-raleway text-sm">
              <Moon className="w-4 h-4 mr-2" />
              {dia.dia}
            </Badge>
            <Badge variant="outline" className="px-4 py-2 font-raleway text-sm">
              <Star className="w-4 h-4 mr-2" />
              {dia.faseLua}
            </Badge>
          </div>
        </div>

        {/* Cards de Resumo Numerológico */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-amber-900/20 to-amber-950/50 border-amber-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-raleway text-amber-400/70">Número Pitagórico</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingNumerologia ? (
                <Skeleton className="h-10 w-16" />
              ) : errorNumerologia ? (
                <div className="flex items-center gap-1 text-destructive text-sm">
                  <AlertCircle className="w-4 h-4" />
                  Erro
                </div>
              ) : (
                <div className="text-3xl font-cinzel text-amber-400">
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
                <div className="text-3xl font-cinzel text-purple-400">
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
                <div className="text-3xl font-cinzel text-pink-400">
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
                <div className="flex items-center gap-1 text-destructive text-sm">
                  <AlertCircle className="w-4 h-4" />
                  Erro
                </div>
              ) : (
                <div className="text-3xl font-cinzel text-blue-400">
                  {ano?.numero ?? '-'}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Ciclos Temporais */}
        <Card className="bg-gradient-to-br from-card to-card/80 border-border/50">
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
                    <div className="text-2xl font-cinzel text-amber-400">{ano?.numero ?? '-'}</div>
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
                    <div className="text-2xl font-cinzel text-blue-400">{mes?.numero ?? '-'}</div>
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
                    <div className="text-2xl font-cinzel text-purple-400">{diaPessoal?.numero ?? '-'}</div>
                    <div className="text-xs text-purple-400/50 mt-1">{diaPessoal?.sefirot ?? '---'}</div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Astrologia Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MapaNatalCard />
          <TransitosAtivos transitos={transitos} />
        </div>

        {/* Dia Spiritual Card */}
        <DiaSpiritual />

        {/* Insights do Dia */}
        <InsightDiario 
          dataNascimento="1990-06-15"
          nome="Maria da Luz"
          odu="Okaran"
          numeroPessoal={7}
        />

        {/* Mapa de Correlações */}
        <CorrespondenciasVisuais />

        {/* Main Content Tabs */}
        <Tabs defaultValue="explorers" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="explorers" className="font-raleway text-xs sm:text-sm">
              <Star className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Exploradores</span>
              <span className="sm:hidden">Exp.</span>
            </TabsTrigger>
            <TabsTrigger value="orus" className="font-raleway text-xs sm:text-sm">
              <Sun className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Orixás</span>
              <span className="sm:hidden">Ori.</span>
            </TabsTrigger>
            <TabsTrigger value="chakras" className="font-raleway text-xs sm:text-sm">
              <Zap className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Chakras</span>
              <span className="sm:hidden">Chak.</span>
            </TabsTrigger>
            <TabsTrigger value="lua" className="font-raleway text-xs sm:text-sm">
              <Moon className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Fases da Lua</span>
              <span className="sm:hidden">Lua</span>
            </TabsTrigger>
          </TabsList>

          {/* Explorers Tab */}
          <TabsContent value="explorers" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <OdusExplorer />
              <CartasLenormand />
            </div>
          </TabsContent>

          {/* Orixás Tab */}
          <TabsContent value="orus">
            <OrixasExplorer />
          </TabsContent>

          {/* Chakras Tab */}
          <TabsContent value="chakras">
            <ChakrasExplorer />
          </TabsContent>

          {/* Lua Tab */}
          <TabsContent value="lua">
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
                  {fasesLua.map((fase) => (
                    <div 
                      key={fase.fase}
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
                          <p className="text-muted-foreground mb-1">Orixás</p>
                          <p className="font-raleway text-foreground/80">{fase.orixas}</p>
                        </div>
                        <div className="pt-2 border-t border-border/30">
                          <p className="text-muted-foreground mb-1">Ritual</p>
                          <p className="font-raleway text-foreground/80">{fase.ritual}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer Info */}
        <div className="text-center py-6">
          <p className="text-xs text-muted-foreground font-raleway">
            ✦ Transforme caos em ordem, inconsciência em consciência ✦
          </p>
        </div>
      </div>
    </div>
  );
}