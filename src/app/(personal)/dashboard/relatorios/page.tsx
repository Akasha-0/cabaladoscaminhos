'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { SkeletonCard, SkeletonText, SkeletonLine } from '@/components/shared/SkeletonSpiritual';
import { ErrorState } from '@/components/shared/ErrorState';
import type { MapaAlmaCompleto, Convergence, BirthProfile } from '@/lib/engines/types/mapa-alma';

interface ReportCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

function ReportCard({ title, children, className = '' }: ReportCardProps) {
  return (
    <Card className={`p-6 bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-sm border-slate-800/50 ${className}`}>
      <h3 className="text-base font-semibold bg-gradient-to-r from-amber-400 to-violet-400 bg-clip-text text-transparent mb-4">{title}</h3>
      {children}
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <SkeletonCard lines={3} />
        <SkeletonCard lines={3} />
        <SkeletonCard lines={3} />
      </div>
      <SkeletonCard lines={4} />
      <SkeletonCard lines={3} />
    </div>
  );
}

export default function RelatoriosPage() {
  const [mapaData, setMapaData] = useState<MapaAlmaCompleto | null>(null);
  const [profile, setProfile] = useState<BirthProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Try 'profile' key first, fall back to 'mapa_perfil'
        let savedProfile = localStorage.getItem('profile');
        if (!savedProfile) {
          savedProfile = localStorage.getItem('mapa_perfil');
        }

        if (!savedProfile) {
          setLoading(false);
          return;
        }

        const profileData = JSON.parse(savedProfile);
        setProfile(profileData);

        // Fetch Mapa data from API
        const response = await fetch('/api/mapa', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nomeCompleto: profileData.nomeCompleto,
            dataNascimento: profileData.dataNascimento,
            hora: profileData.hora,
            cidade: profileData.cidade,
            estado: profileData.estado,
            pais: profileData.pais,
          }),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || `HTTP ${response.status}`);
        }

        const data = await response.json();
        setMapaData(data as MapaAlmaCompleto);
      } catch (err) {
        console.error('[Relatorios] Fetch error:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar relatórios');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-cinzel bg-gradient-to-r from-amber-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
            ✦ Relatórios Espirituais
          </h1>
          <p className="text-slate-400 text-sm font-raleway mt-1">
            Acompanhe sua jornada espiritual com relatórios personalizados.
          </p>
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-cinzel bg-gradient-to-r from-amber-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
            ✦ Relatórios Espirituais
          </h1>
          <p className="text-slate-400 text-sm font-raleway mt-1">
            Acompanhe sua jornada espiritual com relatórios personalizados.
          </p>
        </div>
        <ErrorState
          title="Erro ao carregar relatórios"
          message={error}
          onRetry={() => window.location.reload()}
          variant="critical"
        />
      </div>
    );
  }

  // No profile or data available
  if (!profile || !mapaData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-cinzel bg-gradient-to-r from-amber-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
            ✦ Relatórios Espirituais
          </h1>
          <p className="text-slate-400 text-sm font-raleway mt-1">
            Acompanhe sua jornada espiritual com relatórios personalizados.
          </p>
        </div>
        <div className="text-center py-16">
          <p className="text-slate-400 mb-4">
            Complete seu cadastro para visualizar seus relatórios espirituais.
          </p>
          <Button
            variant="golden"
            onClick={() => window.location.href = '/onboarding'}
          >
            Completar Cadastro
          </Button>
        </div>
      </div>
    );
  }

  const { numerologia, odu, chakras, convergencias, orixasDominantes } = mapaData;

  // Get current cycle info from numerologia
  const cicloAtual = numerologia.cicloAtual || 1;
  const anoPessoal = numerologia.anoPessoal || 1;

  // Get dominant/convergent themes
  const forcasConvergentes = convergencias.filter(c => c.forca === 'forte');
  const orixas = orixasDominantes.length > 0 ? orixasDominantes : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-cinzel bg-gradient-to-r from-amber-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
          ✦ Relatórios Espirituais
        </h1>
        <p className="text-slate-400 text-sm font-raleway mt-1">
          Olá, {profile.nomeCompleto.split(' ')[0]}. Seus relatórios são baseados em seu Mapa da Alma.
        </p>
      </div>

      <Tabs defaultValue="semanal" className="w-full">
        <TabsList className="bg-slate-800/50 border border-slate-700/50">
          <TabsTrigger value="semanal">Semanal</TabsTrigger>
          <TabsTrigger value="mensal">Mensal</TabsTrigger>
          <TabsTrigger value="anual">Anual</TabsTrigger>
        </TabsList>

        {/* SEMANAL TAB */}
        <TabsContent value="semanal" className="mt-6">
          <div className="space-y-4">
            <ReportCard title="Ciclo de Vida Atual">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Ciclo:</span>
                  <span className="text-2xl font-bold text-primary">{cicloAtual}</span>
                </div>
                <SkeletonLine width="100%" height="8px" className="rounded-full" />
                <p className="text-sm text-slate-400">
                  Você está no ciclo de vida número {cicloAtual}. Este ciclo traz influências 
                  específicas para sua jornada espiritual atual.
                </p>
              </div>
            </ReportCard>

            <ReportCard title="Orixás do Dia">
              <div className="flex flex-wrap gap-2">
                {orixas.length > 0 ? (
                  orixas.map((orixa, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-amber-900/20 text-amber-400 rounded-full text-sm border border-amber-700/30"
                    >
                      {orixa}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-500 text-sm">Não disponível</span>
                )}
              </div>
            </ReportCard>

            <ReportCard title="Estado dos Chakras">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Equilíbrio Geral:</span>
                  <span className="text-lg font-medium text-primary">
                    {Math.round((chakras.equilibrio || 0) * 100)}%
                  </span>
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {chakras.chakras.slice(0, 7).map((chakra, index) => (
                    <div key={index} className="text-center">
                      <div
                        className="w-full h-16 rounded-t-lg"
                        style={{
                          backgroundColor: chakra.cor ? `${chakra.cor}40` : '#6366f1',
                          borderTop: chakra.cor ? `2px solid ${chakra.cor}` : '2px solid #6366f1'
                        }}
                        title={chakra.nome}
                      />
                      <span className="text-xs text-slate-500 block mt-1 truncate">
                        {chakra.nome?.slice(0, 4)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-2">
                  <span>Chakra Dominante: {chakras.dominante || 'N/A'}</span>
                  <span>Bloqueado: {chakras.bloqueado || 'Nenhum'}</span>
                </div>
              </div>
            </ReportCard>

            {forcasConvergentes.length > 0 && (
              <ReportCard title="Forças Espirituais da Semana">
                <div className="space-y-3">
                  {forcasConvergentes.slice(0, 3).map((conv, index) => (
                    <div key={index} className="border-l-2 border-primary pl-3">
                      <p className="text-slate-200 font-medium">{conv.energia}</p>
                      <p className="text-sm text-slate-400">{conv.descricao}</p>
                    </div>
                  ))}
                </div>
              </ReportCard>
            )}
          </div>
        </TabsContent>

        {/* MENSAL TAB */}
        <TabsContent value="mensal" className="mt-6">
          <div className="space-y-4">
            <ReportCard title="Ano Pessoal">
              <div className="text-center py-4">
                <span className="text-5xl font-bold text-primary">{anoPessoal}</span>
                <p className="text-slate-400 mt-2">Ano Pessoal Atual</p>
              </div>
            </ReportCard>

            <ReportCard title="Números de Vida">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-slate-800/30 rounded-lg">
                  <span className="text-2xl font-bold text-primary">{numerologia.vida}</span>
                  <p className="text-xs text-slate-500 mt-1">Vida</p>
                </div>
                <div className="text-center p-3 bg-slate-800/30 rounded-lg">
                  <span className="text-2xl font-bold text-amber-400">{numerologia.expressao}</span>
                  <p className="text-xs text-slate-500 mt-1">Expressão</p>
                </div>
                <div className="text-center p-3 bg-slate-800/30 rounded-lg">
                  <span className="text-2xl font-bold text-emerald-400">{numerologia.motivacao}</span>
                  <p className="text-xs text-slate-500 mt-1">Motivação</p>
                </div>
                <div className="text-center p-3 bg-slate-800/30 rounded-lg">
                  <span className="text-2xl font-bold text-violet-400">{numerologia.destino}</span>
                  <p className="text-xs text-slate-500 mt-1">Destino</p>
                </div>
              </div>
            </ReportCard>

            <ReportCard title="Método Numerológico">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Abordagem:</span>
                <span className="px-3 py-1 bg-slate-800/50 rounded-full text-sm capitalize">
                  {numerologia.metodoUsado || 'Pitagórica'}
                </span>
              </div>
            </ReportCard>

            {convergencias.length > 0 && (
              <ReportCard title="Convergências Mensais">
                <div className="space-y-4">
                  {convergencias.map((conv, index) => (
                    <div key={index} className="border border-slate-700/30 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-200 font-medium">{conv.energia}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          conv.forca === 'forte' ? 'bg-green-900/30 text-green-400' :
                          conv.forca === 'medio' ? 'bg-yellow-900/30 text-yellow-400' :
                          'bg-slate-700/30 text-slate-400'
                        }`}>
                          {conv.forca}
                        </span>
                      </div>
                      <p className="text-sm text-slate-400">{conv.descricao}</p>
                      <div className="flex gap-1 mt-2">
                        {conv.sistemas.map((sistema, i) => (
                          <span key={i} className="text-xs text-slate-500">{sistema}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ReportCard>
            )}
          </div>
        </TabsContent>

        {/* ANUAL TAB */}
        <TabsContent value="anual" className="mt-6">
          <div className="space-y-4">
            <ReportCard title="Panorama Anual">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="text-slate-300 font-medium">Seu Mapa Espiritual</h4>
                  <p className="text-sm text-slate-400">
                    Com base em {profile.dataNascimento}, seu mapa anual integra múltiplos 
                    sistemas espirituais para oferecer uma visão completa de sua jornada.
                  </p>
                  <div className="space-y-2 mt-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <span className="text-sm text-slate-300">Numerologia</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-violet-400" />
                      <span className="text-sm text-slate-300">Odu (Ifá)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-sm text-slate-300">Chakras</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-400" />
                      <span className="text-sm text-slate-300">Tarô</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="text-slate-300 font-medium">Oriixás Regentes</h4>
                  {orixas.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {orixas.map((orixa, index) => (
                        <span
                          key={index}
                          className="px-3 py-2 bg-amber-900/20 text-amber-400 rounded-lg text-sm border border-amber-700/30"
                        >
                          {orixa}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">Não disponível</p>
                  )}
                </div>
              </div>
            </ReportCard>

            <ReportCard title="Equilíbrio Energético">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Estado Geral:</span>
                  <span className={`px-3 py-1 rounded-full text-sm capitalize ${
                    chakras.equilibrio > 0.7 ? 'bg-green-900/30 text-green-400' :
                    chakras.equilibrio > 0.4 ? 'bg-yellow-900/30 text-yellow-400' :
                    'bg-red-900/30 text-red-400'
                  }`}>
                    {chakras.equilibrio > 0.7 ? 'Equilibrado' :
                     chakras.equilibrio > 0.4 ? 'Moderado' : 'Em Ajuste'}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Intensidade Energética</span>
                    <span className="text-slate-300">{Math.round(chakras.equilibrio * 100)}%</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-violet-600 to-amber-500 rounded-full transition-all"
                      style={{ width: `${chakras.equilibrio * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </ReportCard>

            <ReportCard title="Análise por Sistema">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-800/30 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">Chakra Dominante</p>
                  <p className="text-slate-200 font-medium">{chakras.dominante || 'N/A'}</p>
                </div>
                <div className="p-3 bg-slate-800/30 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">Chakra em Ajuste</p>
                  <p className="text-slate-200 font-medium">{chakras.bloqueado || 'Nenhum'}</p>
                </div>
              </div>
            </ReportCard>

            {mapaData.deepCorrelations && (
              <ReportCard title="Correlações Profundas">
                <div className="space-y-3">
                  {mapaData.deepCorrelations.correlations.slice(0, 3).map((corr, index) => (
                    <div key={index} className="border-l-2 border-violet-500 pl-3">
                      <p className="text-slate-200 text-sm">{corr.shared_energy}</p>
                      <p className="text-xs text-slate-500 mt-1">Correlação: {Math.round(corr.correlation * 100)}%</p>
                      <p className="text-xs text-slate-400 mt-2">{corr.explanation}</p>
                    </div>
                  ))}
                </div>
              </ReportCard>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Card className="p-6 bg-slate-900/20 border-slate-700/20">
        <h3 className="font-serif text-lg text-slate-300 mb-3">Sobre os Relatórios</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-400">
          <div className="space-y-2">
            <h4 className="text-slate-300 font-medium">Relatório Semanal</h4>
            <p>
              Foco nos ciclos atuais, orixás e forças espirituais que influenciam 
              sua semana. Ideal para práticas diárias e decisões de curto prazo.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-slate-300 font-medium">Relatório Mensal</h4>
            <p>
              análise numerológica detalhada com seus números de vida, ano pessoal 
              e convergências entre sistemas. Perfeito para planejamento mensal.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-slate-300 font-medium">Relatório Anual</h4>
            <p>
              Visão holística de sua jornada espiritual, integrando todos os 
              sistemas: numerologia, Odu, chakras, tarô e correlações profundas.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-slate-300 font-medium">Dados Atualizados</h4>
            <p>
              Todos os relatórios são gerados em tempo real a partir do seu 
              Mapa da Alma completo. Última atualização: {mapaData.dataCalculo ? 
              new Date(mapaData.dataCalculo).toLocaleDateString('pt-BR') : 'N/A'}.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
