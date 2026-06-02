'use client';
import { Suspense } from 'react';
import { useState } from 'react';
import { useMapaInsights } from '@/hooks/useMapaInsights';
import { SkeletonMapa } from '@/components/shared/SkeletonSpiritual';
import { CosmicBackground } from '@/components/design-system/CosmicBackground';
import { Heading } from '@/components/design-system/Typography';
import { MysticDivider } from '@/components/shared/MysticDivider';
import { Button } from '@/components/ui/button';

const SAMPLE_INSIGHTS = [
  {
    title: 'A Jornada da Alma',
    category: 'Numerologia',
    content: 'Seu número de vida revela uma alma marcada pela busca interior. O número 7, com sua essência contemplativa, indica que você encontra verdade nos espaços silenciosos entre os pensamentos. Não force a revelação — ela virá quando você parar de procurar.',
    date: '2026-05-30',
  },
  {
    title: 'O Eixo do Destino',
    category: 'Odu',
    content: 'Oxé abre os caminhos da comunicação e da justiça. As quizilas que regem sua vida não são prisões, mas portais — cada proibição carrega a semente de sua libertação. Viva Xangô através da verdade falada e da integridade inabalável.',
    date: '2026-05-30',
  },
  {
    title: 'A Carta do Céu',
    category: 'Tarot',
    content: 'O Hierophante se apresenta como sua carta de nascimento — o guardião da sabedoria sagrada. Você é um professor nato, alguém que transmite conhecimento através da presença antes das palavras. Sua tarefa sagrada é lembrar os outros de quem eles realmente são.',
    date: '2026-05-30',
  },
];

type InsightCard = {
  title: string;
  category: string;
  content: string;
  date: string;
};

// fallow-ignore-next-line complexity
export default function InsightsPage() {
  const [view, setView] = useState<'resumido' | 'aprofundado'>('resumido');
  const { insight, loading, error, refetch } = useMapaInsights();

  const dynamicInsights: InsightCard[] = insight
    ? [
        insight.proposito
          ? {
              title: 'Propósito de Vida',
              category: 'Mapa da Alma',
              content: insight.proposito,
              date:
                insight.dataGeracao?.split('T')[0] ??
                new Date().toISOString().split('T')[0],
            }
          : null,
        ...(insight.dons ?? []).map((d) => ({
          title: d.titulo,
          category: `Don — ${d.sistema}`,
          content: d.descricao,
          date: insight.dataGeracao?.split('T')[0] ?? '',
        })),
        ...(insight.desafios ?? []).map((d) => ({
          title: d.titulo,
          category: `Desafio — ${d.sistema}`,
          content: d.descricao,
          date: insight.dataGeracao?.split('T')[0] ?? '',
        })),
        ...(insight.preceitos ?? []).map((p) => ({
          title: `Preceito: ${p.odu}`,
          category: 'Ifá',
          content: p.preceitos?.join('; ') ?? '',
          date: insight.dataGeracao?.split('T')[0] ?? '',
        })),
        insight.mensagemSemanal
          ? {
              title: 'Mensagem Semanal',
              category: 'Orientação',
              content: insight.mensagemSemanal,
              date: insight.dataGeracao?.split('T')[0] ?? '',
            }
          : null,
      ].filter(Boolean) as InsightCard[]
    : SAMPLE_INSIGHTS;

  const statsData = [
    {
      label: 'Insights Gerados',
      value: insight ? String(dynamicInsights.length) : '3',
      icon: '✦',
    },
    {
      label: 'Dons Revelados',
      value: String(insight?.dons?.length ?? 0),
      icon: '◉',
    },
    {
      label: 'Preceitos Ativos',
      value: String(insight?.preceitos?.length ?? 0),
      icon: '★',
    },
    {
      label: 'Origem dos Dados',
      value: insight ? 'AI' : 'Demo',
      icon: '◷',
    },
  ];

  if (loading) {
    return (
      <CosmicBackground>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <Heading variant="mystical" size="2xl">
                ✦ Insights Espirituais
              </Heading>
              <MysticDivider className="mt-3 max-w-sm" />
            </div>
          </div>
          <Suspense fallback={null}>
            <SkeletonMapa />
          </Suspense>
        </div>
      </CosmicBackground>
    );
  }

  if (error) {
    return (
      <CosmicBackground>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
          <div className="text-4xl">⚠</div>
          <Heading variant="mystical" size="xl">
            Erro ao Carregar Insights
          </Heading>
          <p className="text-spiritual-text-muted max-w-md">{error}</p>
          <Button variant="golden" onClick={refetch}>
            ✦ Tentar novamente
          </Button>
        </div>
      </CosmicBackground>
    );
  }

  return (
    <CosmicBackground>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Heading variant="mystical" size="2xl">
              ✦ Insights Espirituais
            </Heading>
            <MysticDivider className="mt-3 max-w-sm" />
          </div>

          {/* View toggle */}
          <div className="flex gap-2">
            <Button
              variant={view === 'resumido' ? 'golden' : 'outline'}
              size="sm"
              onClick={() => setView('resumido')}
            >
              Resumido
            </Button>
            <Button
              variant={view === 'aprofundado' ? 'golden' : 'outline'}
              size="sm"
              onClick={() => setView('aprofundado')}
            >
              Aprofundado
            </Button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {statsData.map((stat) => (
            <div key={stat.label} className="card-spiritual p-3 text-center">
              <p className="text-spiritual-gold text-lg">{stat.icon}</p>
              <p className="text-2xl font-bold text-spiritual-text-primary">
                {stat.value}
              </p>
              <p className="text-xs text-spiritual-text-muted">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Insights list */}
        <div className="space-y-4">
          {dynamicInsights.map((card, i) => (
            <div
              key={i}
              className="card-spiritual p-6 animate-fade-in-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <Heading variant="section" size="md">
                    {card.title}
                  </Heading>
                  <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-spiritual-violet/20 text-spiritual-violet border border-spiritual-violet/30">
                    {card.category}
                  </span>
                </div>
                <span className="text-xs text-spiritual-text-muted shrink-0">
                  {card.date}
                </span>
              </div>

              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-spiritual-gold to-transparent" />
                <p
                  className="pl-4 text-spiritual-text-secondary leading-relaxed"
                  style={{
                    fontFamily: 'var(--font-cormorant)',
                    fontSize: '1.1rem',
                    fontStyle: 'italic',
                  }}
                >
                  &ldquo;{card.content}&rdquo;
                </p>
              </div>

              {view === 'aprofundado' && (
                <div className="mt-4 pt-4 border-t border-slate-800">
                  <p className="text-spiritual-text-muted text-sm">
                    Este insight é baseado na correlação entre{' '}
                    {card.category.toLowerCase()} e os outros sistemas do seu
                    mapa. Para uma análise mais profunda, consulte o Mapa da
                    Alma completo.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Export button */}
        <div className="flex justify-center">
          <Button variant="golden-outline" className="gap-2">
            ✦ Exportar PDF
          </Button>
        </div>
      </div>
    </CosmicBackground>
  );
}
