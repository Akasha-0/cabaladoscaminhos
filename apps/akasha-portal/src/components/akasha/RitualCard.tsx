'use client';

/**
 * @akasha/portal — RitualCard
 * 
 * Componente para exibir o ritual diário completo.
 * Mostra código Akasha (hexagrama/Odu), prática integrativa,
 * afirmação, oração e quizilás.
 */

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';
import type { RitualResponse, Quizila } from '@akasha/core';
import type { Wing } from '@akasha/core-iching';

interface Props {
  ritual: RitualResponse;
}

// Cores por nível espiritual
const NIVEL_COLORS: Record<RitualResponse['codigo']['nivel'], { bg: string; border: string; text: string }> = {
  shadow: { bg: 'rgba(251,87,129,0.12)', border: 'rgba(251,87,129,0.4)', text: '#FB5781' },
  gift: { bg: 'rgba(240,180,41,0.12)', border: 'rgba(240,180,41,0.4)', text: '#F0B429' },
  siddhi: { bg: 'rgba(45,212,191,0.12)', border: 'rgba(45,212,191,0.4)', text: '#2DD4BF' },
};

const NIVEL_LABELS: Record<RitualResponse['codigo']['nivel'], string> = {
  shadow: 'Sombra',
  gift: 'Dom',
  siddhi: 'Siddhi',
};

const TIPO_QUIZILA_COLORS: Record<string, string> = {
  proibicao: '#FB5781',
  restricao: '#F97316',
  orientacao: '#2DD4BF',
};

function formatDate(date: Date): string {
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function renderLinesHexagrama(lines: readonly boolean[]): React.ReactNode {
  return (
    <div className="flex flex-col-reverse gap-1 items-center" aria-label="Linhas do hexagrama">
      {lines.map((yang, i) => (
        <span
          key={i}
          className="font-mono text-sm tracking-wider"
          style={{ color: yang ? '#F4F5FF' : '#A0763A' }}
        >
          {yang ? '———' : '— — —'}
        </span>
      ))}
    </div>
  );
}

export function RitualCard({ ritual }: Props) {
  const nivelStyle = NIVEL_COLORS[ritual.codigo.nivel];
  const { hexagrama, odu, nivel } = ritual.codigo;

  return (
    <Card className="w-full max-w-md overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base font-heading">
            Ritual do Dia
          </CardTitle>
          <Badge
            variant="outline"
            style={{
              background: nivelStyle.bg,
              borderColor: nivelStyle.border,
              color: nivelStyle.text,
            }}
          >
            {NIVEL_LABELS[nivel]}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {formatDate(ritual.data)}
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* ── Código do Dia ── */}
        <section aria-labelledby="ritual-code-title">
          <h3 id="ritual-code-title" className="text-xs font-semibold text-[#7C5CFF] uppercase tracking-wider mb-2">
            Código Akáshico
          </h3>
          <div className="flex items-start gap-4 p-3 rounded-lg bg-[#0B0E1C]/80 border border-[#26304F]/50">
            {/* Hexagrama */}
            <div className="flex flex-col items-center gap-1">
              <div className="flex flex-col-reverse">
                {renderLinesHexagrama(hexagrama.lines)}
              </div>
              <span className="text-lg font-bold text-[#A0763A]">
                {hexagrama.number}
              </span>
            </div>

            {/* Informações do hexagrama */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-[#F4F5FF] truncate">
                {hexagrama.name}
              </p>
              <p className="text-xs text-[#A0763A]">
                {hexagrama.chineseName}
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {hexagrama.wings.slice(0, 2).map((wing: Wing) => (
                  <Badge key={wing.id} variant="odu" className="text-[10px] py-0">
                    {wing.name}
                  </Badge>
                ))}
              </div>
              {odu && (
                <div className="mt-2 pt-2 border-t border-[#26304F]/50">
                  <p className="text-xs text-[#F0B429]">
                    <span className="font-semibold">Odu:</span> {odu.name}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── Prática Integrativa ── */}
        {ritual.pratica && (
          <section aria-labelledby="ritual-practice-title">
            <h3 id="ritual-practice-title" className="text-xs font-semibold text-[#2DD4BF] uppercase tracking-wider mb-2">
              Prática Recomendada
            </h3>
            <div className="p-3 rounded-lg bg-[#0B0E1C]/80 border border-[#26304F]/50">
              <p className="font-semibold text-sm text-[#F4F5FF]">
                {ritual.pratica.name}
              </p>
              <p className="text-xs text-[#A7AECF] mt-1">
                {ritual.pratica.tradition} · {ritual.pratica.frequency}
              </p>
              <p className="text-xs text-[#A7AECF] mt-2 leading-relaxed">
                {ritual.pratica.howTo}
              </p>
              {ritual.pratica.warnings && ritual.pratica.warnings.length > 0 && (
                <p className="text-xs text-[#FB5781]">
                  <AlertTriangle size={12} className="inline mr-1 flex-shrink-0 text-[#FB5781]" />{ritual.pratica.warnings[0]}
                </p>
              )}
            </div>
          </section>
        )}

        {/* ── Quizilás ── */}
        {ritual.quizilas && ritual.quizilas.length > 0 && (
          <section aria-labelledby="ritual-quizilas-title">
            <h3 id="ritual-quizilas-title" className="text-xs font-semibold text-[#FB5781] uppercase tracking-wider mb-2">
              Quizilás do Odu
            </h3>
            <ul className="space-y-1.5" role="list">
              {ritual.quizilas.map((quizila: Quizila) => (
                <li
                  key={quizila.id}
                  className="flex items-start gap-2 p-2 rounded-lg bg-[#0B0E1C]/60 border border-[#26304F]/30"
                >
                  <span
                    className="mt-0.5 text-xs"
                    style={{ color: TIPO_QUIZILA_COLORS[quizila.tipo] || '#A7AECF' }}
                  >
                    {quizila.tipo === 'proibicao' ? '✕' : quizila.tipo === 'restricao' ? '○' : '→'}
                  </span>
                  <span className="text-xs text-[#A7AECF] leading-relaxed">
                    {quizila.texto}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ── Afirmação ── */}
        {ritual.afirmacao && (
          <section aria-labelledby="ritual-affirmation-title">
            <h3 id="ritual-affirmation-title" className="text-xs font-semibold text-[#7C5CFF] uppercase tracking-wider mb-2">
              Afirmação do Ori
            </h3>
            <blockquote className="p-3 rounded-lg bg-[#1E3A8A]/10 border border-[#2547D0]/30 italic text-sm text-[#F4F5FF]/90 leading-relaxed">
              &ldquo;{ritual.afirmacao}&rdquo;
            </blockquote>
          </section>
        )}

        {/* ── Oração ── */}
        {ritual.oracao && (
          <section aria-labelledby="ritual-prayer-title">
            <h3 id="ritual-prayer-title" className="text-xs font-semibold text-[#F0B429] uppercase tracking-wider mb-2">
              Oração do Dia
            </h3>
            <div className="p-3 rounded-lg bg-[#F0B429]/5 border border-[#F0B429]/20">
              <p className="text-xs text-[#A7AECF] leading-relaxed whitespace-pre-line">
                {ritual.oracao}
              </p>
            </div>
          </section>
        )}
      </CardContent>
    </Card>
  );
}

export default RitualCard;
