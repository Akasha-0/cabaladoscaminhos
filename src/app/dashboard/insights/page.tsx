'use client';
import { useState } from 'react';
import { Heading } from '@/components/design-system/Typography';
import { MysticDivider } from '@/components/shared/MysticDivider';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
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

export default function InsightsPage() {
  const [view, setView] = useState<'resumido' | 'aprofundado'>('resumido');

  return (
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
        {[
          { label: 'Insights Gerados', value: '3', icon: '✦' },
          { label: 'Sistemas Correlacionados', value: '5', icon: '◉' },
          { label: 'Convergências Fortes', value: '1', icon: '★' },
          { label: 'Próxima Atualização', value: '7d', icon: '◷' },
        ].map(stat => (
          <div key={stat.label} className="card-spiritual p-3 text-center">
            <p className="text-spiritual-gold text-lg">{stat.icon}</p>
            <p className="text-2xl font-bold text-spiritual-text-primary">{stat.value}</p>
            <p className="text-xs text-spiritual-text-muted">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Insights list */}
      <div className="space-y-4">
        {SAMPLE_INSIGHTS.map((insight, i) => (
          <div
            key={i}
            className="card-spiritual p-6 animate-fade-in-up"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <Heading variant="section" size="md">
                  {insight.title}
                </Heading>
                <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-spiritual-violet/20 text-spiritual-violet border border-spiritual-violet/30">
                  {insight.category}
                </span>
              </div>
              <span className="text-xs text-spiritual-text-muted shrink-0">
                {insight.date}
              </span>
            </div>

            <div className="relative">
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-spiritual-gold to-transparent" />
              <p className="pl-4 text-spiritual-text-secondary leading-relaxed"
                 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.1rem', fontStyle: 'italic' }}>
                &ldquo;{insight.content}&rdquo;
              </p>
            </div>

            {view === 'aprofundado' && (
              <div className="mt-4 pt-4 border-t border-slate-800">
                <p className="text-spiritual-text-muted text-sm">
                  Este insight é baseado na correlação entre {insight.category.toLowerCase()} e os outros sistemas do seu mapa.
                  Para uma análise mais profunda, consulte o Mapa da Alma completo.
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
  );
}