'use client';

/**
 * @akasha/portal — Dashboard Deterministic Synthesis
 * Extracted from Dashboard.tsx (lines 518–736)
 * Contains: PerfilGeral card, Authority card, DimFoco card, link to full analysis
 */
import { Sparkles, Info, ChevronUp, ChevronDown } from 'lucide-react';
import type { CaixaSintese, DimensaoSintese } from '@/lib/grimoire/synthesis/synthesizer';
import {
  ESTRATEGIA_BG,
  ESTRATEGIA_BORDER,
  ESTRATEGIA_COLOR,
  ESTRATEGIA_LABEL,
  renderNarrative,
} from './dashboard-text';
import { AREA_ICONE, AREA_LABEL } from '@/lib/grimoire/traducao-areas';
import { MeuCiclo } from './MeuCiclo';
import type { CycleSnapshotUI } from './hooks/useAkashaSynthesis';

interface DashboardDeterministicSynthesisProps {
  detSintese: CaixaSintese | null;
  dimFoco: DimensaoSintese | null;
  dimFocoExpanded: boolean;
  onDimFocoExpand: (v: boolean) => void;
  locale: string;
  cycle?: CycleSnapshotUI;
}

export function DashboardDeterministicSynthesis({
  detSintese,
  dimFoco,
  dimFocoExpanded,
  onDimFocoExpand,
  locale,
  cycle,
}: DashboardDeterministicSynthesisProps) {
  if (!detSintese) return null;

  return (
    <>
      {/* 1. Deterministic General Synthesis Card */}
      {detSintese.perfilGeral && (
        <div className="rounded-2xl border border-white/10 bg-[#0B0E1C]/60 p-5 space-y-3">
          <div className="flex items-center gap-1.5 border-b border-white/5 pb-2">
            <Sparkles size={14} className="text-[#9D86FF]" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Perfil de Hoje
            </h3>
          </div>
          <div className="relative" style={{ maxHeight: '4.5em', overflow: 'hidden' }}>
            <div className="space-y-1">{renderNarrative(detSintese.perfilGeral)}</div>
            <div
              aria-hidden
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '2em',
                background: 'linear-gradient(to bottom, transparent, #0B0E1C)',
                pointerEvents: 'none',
              }}
            />
          </div>
        </div>
      )}

      {/* 2. Akasha Authority Card */}
      {detSintese.autoridade && (
        <div
          id="daily-authority"
          className="rounded-2xl border p-5 space-y-4 transition-all duration-500"
          style={{
            backgroundColor:
              ESTRATEGIA_BG[detSintese.autoridade.estrategia] || 'rgba(255,255,255,0.02)',
            borderColor:
              ESTRATEGIA_BORDER[detSintese.autoridade.estrategia] ||
              'rgba(255,255,255,0.1)',
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Info size={16} className="text-white/80" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Diretriz de Decisão (Autoridade)
              </h3>
            </div>
            <span
              className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
              style={{
                backgroundColor: `${ESTRATEGIA_COLOR[detSintese.autoridade.estrategia]}22`,
                color: ESTRATEGIA_COLOR[detSintese.autoridade.estrategia],
              }}
            >
              {ESTRATEGIA_LABEL[detSintese.autoridade.estrategia] ||
                detSintese.autoridade.estrategia}
            </span>
          </div>

          <h3 className="text-lg font-bold font-cinzel text-white leading-tight">
            {detSintese.autoridade.decisaoHoje}
          </h3>

          <p className="text-sm text-[#C4C9E2] leading-relaxed">
            {detSintese.autoridade.explicacao}
          </p>

          <div className="bg-black/25 rounded-xl p-3.5 space-y-2.5">
            <p
              className="text-[11px] uppercase tracking-wider font-mono font-semibold"
              style={{ color: ESTRATEGIA_COLOR[detSintese.autoridade.estrategia] }}
            >
              Regra Prática de Alinhamento
            </p>
            <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1.5 items-start">
              <span className="text-[10px] text-white/70 uppercase tracking-wider font-mono mt-px">
                Antes de agir:
              </span>
              <p className="text-xs text-white/85 leading-relaxed">
                {detSintese.autoridade.regra.condicao}
              </p>
              <span className="text-[10px] text-[#7C5CFF] uppercase tracking-wider font-mono mt-px">
                Faça isto:
              </span>
              <p className="text-xs text-[#9D86FF] leading-relaxed font-medium">
                {detSintese.autoridade.regra.accao}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs pt-1 border-t border-white/5">
            <div className="space-y-2">
              <p className="text-[11px] text-[#2DD4BF] uppercase tracking-wider font-mono font-semibold">
                Melhor Timing — janelas de decisão
              </p>
              <p className="text-white/85 leading-relaxed">
                {detSintese.autoridade.timing.melhor}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-[11px] text-[#E04879] uppercase tracking-wider font-mono font-semibold">
                Evitar Decidir
              </p>
              <p className="text-sm text-[#C4C9E2] mt-0.5 leading-relaxed">
                {detSintese.autoridade.timing.pior}
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-white/5 text-[11px] text-[#A7AECF]/90 flex items-center justify-between">
            <span>
              Autoridade:{' '}
              <strong
                className="text-white capitalize"
                title="Sua energia de comando hoje — como você exerce autoridade"
              >
                {detSintese.autoridade.autoridade}
              </strong>
            </span>
            <span>
              Área Foco:{' '}
              <strong className="text-white capitalize">
                {AREA_ICONE[detSintese.autoridade.areaFoco] || '◈'}{' '}
                {AREA_LABEL[detSintese.autoridade.areaFoco] ||
                  detSintese.autoridade.areaFoco}
              </strong>
            </span>
          </div>
        </div>
      )}

      {/* 3. Daily Specific Area of Focus Card */}
      {dimFoco && (
        <div className="rounded-2xl border-2 border-[#F0B429]/60 bg-[#0B0E1C]/60 p-5 space-y-4 shadow-[0_0_20px_rgba(240,180,41,0.08)]">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#7C5CFF]/10 border border-[#7C5CFF]/30 flex items-center justify-center text-[#9D86FF] text-xl font-bold">
                <Sparkles size={20} className="text-[#9D86FF]" />
              </div>
              <div>
                <p className="text-[10px] text-[#F0B429] font-bold uppercase tracking-wider font-mono">
                  Foco Prioritário de Hoje
                </p>
                <p className="text-base font-bold font-cinzel text-white leading-none mt-1">
                  {dimFoco.titulo}
                </p>
                <p className="text-[10px] text-[#A7AECF]/50 mt-0.5">
                  A energia de hoje favorece fortemente esta dimensão — aproveite o momento
                </p>
              </div>
            </div>
            <span className="shrink-0 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#F0B429] text-[#06070F] shadow-[0_0_8px_rgba(240,180,41,0.4)]">
              Foco
            </span>
          </div>

          <div
            id="foco-prioritario-content"
            aria-live="polite"
            className="relative"
            style={{ maxHeight: dimFocoExpanded ? 'none' : '4.5em', overflow: 'hidden' }}
          >
            <div className="space-y-1">{renderNarrative(dimFoco.synthes ?? '')}</div>
            {!dimFocoExpanded && (
              <div
                aria-hidden
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '2em',
                  background: 'linear-gradient(to bottom, transparent, #0B0E1C)',
                  pointerEvents: 'none',
                }}
              />
            )}
          </div>
          <button
            onClick={() => onDimFocoExpand(!dimFocoExpanded)}
            aria-expanded={dimFocoExpanded}
            aria-controls="foco-prioritario-content"
            className="text-xs text-[#7C5CFF]/90 hover:text-[#7C5CFF] transition-colors px-3 py-2 min-h-11 rounded-lg"
          >
            {dimFocoExpanded ? (
              <>
                <ChevronUp size={12} className="inline" /> Mostrar menos
              </>
            ) : (
              <>
                <ChevronDown size={12} className="inline" /> Ler mais sobre {dimFoco.titulo}
              </>
            )}
          </button>

          {dimFoco.praktika && (
            <div className="bg-[#2DD4BF]/5 border border-[#2DD4BF]/15 rounded-xl p-3.5 space-y-1">
              <p className="text-[11px] text-[#2DD4BF] uppercase tracking-wider font-mono font-semibold">
                Prática do Dia
              </p>
              <p className="text-xs text-white/90 leading-relaxed">{dimFoco.praktika}</p>
            </div>
          )}

          {dimFoco.alerta && (
            <div className="bg-[#FB5781]/5 border border-[#FB5781]/15 rounded-xl p-3.5 space-y-1">
              <p className="text-[11px] text-[#FB5781] uppercase tracking-wider font-mono font-semibold">
                O que Evitar
              </p>
              <p className="text-sm text-[#C4C9E2] leading-relaxed">{dimFoco.alerta}</p>
            </div>
          )}
        </div>
      )}

      <a
        href={`/${locale}/akasha`}
        className="block text-center text-[11px] text-[#7C5CFF]/60 hover:text-[#7C5CFF] transition-colors py-3 min-h-11 border-t border-white/5"
      >
        Ver análise completa do seu mandato →
      </a>

      {/* §P4: Meu Ciclo */}
      {cycle && <MeuCiclo cycle={cycle} />}
    </>
  );
}
