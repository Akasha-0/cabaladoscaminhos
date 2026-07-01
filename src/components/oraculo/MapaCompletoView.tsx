'use client';

// ============================================================================
// MAPA COMPLETO VIEW — Wave 29
// ============================================================================
// Render integrado do mapa completo (astrologia + numerologia + cruzamentos +
// markdown) com chamada para Akashic IA interpretação.
//
// Mobile-first stack vertical. Markdown renderizado como texto plain (não
// usamos react-markdown — adicionado direto pra manter simples e TS=0).
// ============================================================================

import { useState } from 'react';
import { Sparkles, Send, Loader2, History, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MapaCompleto, DISCLAIMER_ÉTICO } from '@/lib/oraculo/mapa-integrado';
import { MapaNatalCard } from './MapaNatalCard';
import { NumerologiaGrid } from './NumerologiaGrid';

interface MapaCompletoViewProps {
  mapa: MapaCompleto;
  /** Quando true, mostra campo de pergunta para Akashic interpretar */
  showAskAkasha?: boolean;
}

/**
 * Renderiza markdown simples sem react-markdown. Suporta:
 *   - ## / ### headings
 *   - **bold**
 *   - - lists
 *   - > blockquotes
 *   - --- hr
 *   - parágrafos
 */
function renderMarkdown(md: string): JSX.Element[] {
  const lines = md.split('\n');
  const out: JSX.Element[] = [];
  let listBuffer: string[] = [];
  let key = 0;

  const flushList = () => {
    if (listBuffer.length > 0) {
      out.push(
        <ul
          key={`ul-${key}`}
          className="my-2 ml-4 list-disc space-y-1 text-sm text-slate-200"
        >
          {listBuffer.map((item, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
          ))}
        </ul>,
      );
      listBuffer = [];
      key++;
    }
  };

  const formatInline = (text: string): string =>
    text
      .replace(/\*\*(.+?)\*\*/g, '<strong class="text-amber-200">$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>');

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    if (line.startsWith('# ')) {
      flushList();
      out.push(
        <h1 key={`h1-${key++}`} className="font-heading mt-3 text-xl font-bold text-amber-200">
          {line.slice(2)}
        </h1>,
      );
    } else if (line.startsWith('## ')) {
      flushList();
      out.push(
        <h2
          key={`h2-${key++}`}
          className="font-heading mt-6 border-b border-slate-800 pb-1 text-lg font-semibold text-amber-200"
        >
          {line.slice(3)}
        </h2>,
      );
    } else if (line.startsWith('### ')) {
      flushList();
      out.push(
        <h3
          key={`h3-${key++}`}
          className="mt-4 text-sm font-semibold uppercase tracking-wider text-slate-300"
        >
          {line.slice(4)}
        </h3>,
      );
    } else if (line.startsWith('- ')) {
      listBuffer.push(formatInline(line.slice(2)));
    } else if (line.startsWith('> ')) {
      flushList();
      out.push(
        <blockquote
          key={`bq-${key++}`}
          className="my-3 border-l-4 border-amber-500/40 bg-amber-950/20 px-4 py-2 text-sm italic text-amber-100"
          dangerouslySetInnerHTML={{ __html: formatInline(line.slice(2)) }}
        />,
      );
    } else if (line === '---') {
      flushList();
      out.push(<hr key={`hr-${key++}`} className="my-4 border-slate-800" />);
    } else if (line.trim() === '') {
      flushList();
    } else {
      flushList();
      out.push(
        <p
          key={`p-${key++}`}
          className="my-1 text-sm leading-relaxed text-slate-200"
          dangerouslySetInnerHTML={{ __html: formatInline(line) }}
        />,
      );
    }
  }
  flushList();

  return out;
}

export function MapaCompletoView({ mapa, showAskAkasha = true }: MapaCompletoViewProps) {
  const [ask, setAsk] = useState('');
  const [akashaResposta, setAkashaResposta] = useState('');
  const [akashaLoading, setAkashaLoading] = useState(false);

  const enviarPergunta = async () => {
    if (!ask.trim() || akashaLoading) return;
    setAkashaLoading(true);
    setAkashaResposta('');

    try {
      const contextText = mapa.markdown.slice(0, 3000);

      const res = await fetch('/api/akashic/chat/stream', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          message: `Baseado no meu mapa integrado abaixo, responda: ${ask}`,
          tradition: mapa.input.tradiçãoPreferida ?? null,
          deepMode: true,
          context: contextText,
        }),
      });

      if (!res.ok || !res.body) {
        throw new Error(`Erro ${res.status ?? 'rede'}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop() ?? '';
        for (const part of parts) {
          if (!part.includes('event: token')) continue;
          const dataLine = part.split('\n').find((l) => l.startsWith('data:'));
          if (!dataLine) continue;
          try {
            const obj = JSON.parse(dataLine.slice(5));
            if (obj.content) {
              setAkashaResposta((prev) => prev + obj.content);
            }
          } catch {
            // skip
          }
        }
      }
    } catch (err) {
      setAkashaResposta(
        `Erro ao consultar Akasha: ${err instanceof Error ? err.message : 'desconhecido'}`,
      );
    } finally {
      setAkashaLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Resumo curto (hero card) */}
      <section className="flex flex-col items-center gap-2 rounded-2xl border border-amber-800/40 bg-gradient-to-br from-amber-950/30 via-slate-950 to-purple-950/30 p-6 text-center">
        <span className="text-3xl" aria-hidden>
          🌀
        </span>
        <h2 className="font-heading text-2xl font-bold text-amber-100">
          {mapa.input.nomeCompleto}
        </h2>
        <p className="font-mono text-sm text-slate-300">
          {mapa.resumoCurto}
        </p>
        <p className="text-[10px] text-slate-500">
          {new Date(mapa.calculadoEm).toLocaleString('pt-BR')} ·{' '}
          {mapa.input.tradiçãoPreferida ?? 'universalista'}
        </p>
      </section>

      {/* Astrologia + Numerologia */}
      <MapaNatalCard mapa={mapa.mapaNatal} />
      <NumerologiaGrid mapa={mapa.mapaNumerológico} />

      {/* Markdown completo */}
      <details className="rounded-2xl border border-slate-800 bg-slate-950/40">
        <summary className="flex cursor-pointer items-center gap-2 p-4 text-sm font-medium text-slate-300">
          <BookOpen className="h-4 w-4" />
          Ver mapa completo (markdown) · {mapa.cruzamentos.length} cruzamentos
        </summary>
        <div className="border-t border-slate-800 p-4 md:p-6">
          {renderMarkdown(mapa.markdown)}
        </div>
      </details>

      {/* Akashic IA pergunta */}
      {showAskAkasha && (
        <section className="flex flex-col gap-3 rounded-2xl border border-purple-800/40 bg-gradient-to-br from-purple-950/30 to-slate-950/40 p-4 md:p-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-300" aria-hidden />
            <h3 className="font-heading text-base font-semibold text-slate-50">
              Perguntar à Akashic IA sobre este mapa
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Akasha interpreta com base na tradição preferida. Ela nunca prescreve — cita fontes e respeita sua tradição.
          </p>

          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={ask}
              onChange={(e) => setAsk(e.target.value)}
              placeholder="Ex: Como Mercúrio em Gêmeos influencia minha comunicação?"
              className="min-h-[44px] flex-1 rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30"
              onKeyDown={(e) => e.key === 'Enter' && enviarPergunta()}
            />
            <Button
              onClick={enviarPergunta}
              variant="golden"
              size="lg"
              disabled={akashaLoading || !ask.trim()}
              className="min-h-[44px] px-4"
            >
              {akashaLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Perguntar
                </>
              )}
            </Button>
          </div>

          {akashaResposta && (
            <div className="rounded-xl border border-purple-700/40 bg-purple-950/30 p-3 text-sm leading-relaxed text-slate-100">
              {akashaResposta}
              {akashaLoading && <span className="animate-pulse">▊</span>}
            </div>
          )}
        </section>
      )}

      {/* Disclaimer ético — sempre visível no final */}
      <section className="rounded-xl border border-amber-800/40 bg-amber-950/20 p-4">
        <div className="flex items-start gap-3">
          <History className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" aria-hidden />
          <div>
            <h4 className="mb-1 text-xs font-bold uppercase tracking-wider text-amber-300">
              Aviso ético (universalista)
            </h4>
            <p className="whitespace-pre-line text-[11px] italic leading-relaxed text-amber-100">
              {DISCLAIMER_ÉTICO}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
