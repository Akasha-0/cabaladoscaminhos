'use client';

/**
 * AkashaAuthorityPrompt — F-227 component
 *
 * Card COMPACTO que aparece antes de qualquer ação importante.
 * Mostra a pergunta "Qual é o seu estado AGORA?" com 3 botões
 * (Paz / Ansiedade / Neutro) e exibe a recomendação da regra
 * "Corpo 3 (paz) = aja, Corpo 4 (ansiedade) = espere".
 *
 * Integração: usado pelo `meu-dia` (F-224) e por qualquer
 * fluxo de ação importante (registrar foco do dia, criar
 * consulta de oráculo, etc).
 *
 * Pilar 4 ethics: Este componente NÃO emite afirmações sobre
 * Odu do usuário — apenas sobre o estado emocional atual.
 * O Odu aparece em textos de "contexto" (derivado do `deriveAkashaAuthority`)
 * e vem de whitelists curados (F-219 / Pilar 4 truth-base).
 */

import { useState } from 'react';
import {
  recomendarAcaoPorEstado,
  praticaAuthorityDiaria,
  type EstadoAkasha,
} from '@/lib/grimoire/akasha-authority';
import type { PilaresDados } from '@/lib/grimoire/significados-curados';

export interface AkashaAuthorityPromptProps {
  /** Authority derivada dos 5 pilares (UI strings, do useAkashaSynthesis) */
  authority: {
    estrategia: string;
    autoridade: string;
    decisaoHoje: string;
  };
  /** Pilares brutos para gerar a prática do dia (parcial — só precisa de life_path, lua_signo, corpo_predominante, odu_principal) */
  pilares: Partial<PilaresDados>;
  /** Callback quando o usuário escolhe um estado (opcional) */
  onDecide?: (estado: EstadoAkasha, acao: 'aja' | 'espere' | 'observe') => void;
  /** Compact mode = sem descrição longa (default false) */
  compact?: boolean;
}

const ESTADO_OPTIONS: Array<{
  estado: EstadoAkasha;
  label: string;
  emoji: string;
  cor: string;
}> = [
  { estado: 'paz', label: 'Paz', emoji: '☀', cor: '#34C759' },
  { estado: 'ansiedade', label: 'Ansiedade', emoji: '⚡', cor: '#FF3B30' },
  { estado: 'neutro', label: 'Neutro', emoji: '◯', cor: '#8E8E93' },
];

export function AkashaAuthorityPrompt({
  authority,
  pilares,
  onDecide,
  compact = false,
}: AkashaAuthorityPromptProps) {
  const [estado, setEstado] = useState<EstadoAkasha | null>(null);

  const rec = estado ? recomendarAcaoPorEstado(estado) : null;
  const pratica = praticaAuthorityDiaria(pilares as PilaresDados);

  function handleClick(s: EstadoAkasha) {
    setEstado(s);
    const r = recomendarAcaoPorEstado(s);
    onDecide?.(s, r.acao);
  }

  return (
    <div
      className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#1C1C1E] to-[#2C2C2E] p-5 space-y-4"
      data-testid="akasha-authority-prompt"
      aria-label="Akasha Authority — prompt de decisão"
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="text-2xl" aria-hidden>✦</span>
        <div>
          <p className="text-xs text-white/40 uppercase tracking-widest font-medium">
            Akasha Authority
          </p>
          <h3 className="text-base font-semibold text-white leading-tight">
            Qual é o seu estado AGORA?
          </h3>
        </div>
      </div>

      {/* Contexto: estratégia + autoridade derivada */}
      <p className="text-xs text-white/50 leading-relaxed italic">
        Sua autoridade base: <span className="text-white/80">{authority.autoridade}</span> —
        estratégia <span className="text-white/80">{authority.estrategia}</span>.
      </p>

      {/* 3 botões de estado */}
      <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Estado atual">
        {ESTADO_OPTIONS.map((opt) => {
          const isSelected = estado === opt.estado;
          return (
            <button
              key={opt.estado}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => handleClick(opt.estado)}
              className="rounded-xl border px-3 py-3 text-center transition-all"
              style={{
                backgroundColor: isSelected ? `${opt.cor}22` : 'rgba(255,255,255,0.04)',
                borderColor: isSelected ? opt.cor : 'rgba(255,255,255,0.1)',
                color: isSelected ? opt.cor : 'rgba(255,255,255,0.7)',
              }}
            >
              <div className="text-2xl mb-1" aria-hidden>{opt.emoji}</div>
              <div className="text-xs font-semibold uppercase tracking-wide">{opt.label}</div>
            </button>
          );
        })}
      </div>

      {/* Recomendação após escolha */}
      {rec && (
        <div
          className="rounded-xl p-3 space-y-2"
          style={{
            backgroundColor: `${rec.acao === 'aja' ? '#34C759' : rec.acao === 'espere' ? '#FF3B30' : '#8E8E93'}15`,
            border: `1px solid ${rec.acao === 'aja' ? '#34C759' : rec.acao === 'espere' ? '#FF3B30' : '#8E8E93'}33`,
          }}
          role="status"
        >
          <div className="flex items-center gap-2">
            <span className="text-xl" aria-hidden>{rec.icone}</span>
            <span
              className="text-sm font-bold uppercase tracking-wider"
              style={{
                color: rec.acao === 'aja' ? '#34C759' : rec.acao === 'espere' ? '#FF3B30' : '#8E8E93',
              }}
            >
              {rec.acao === 'aja' ? 'Aja' : rec.acao === 'espere' ? 'Espere' : 'Observe'}
            </span>
          </div>
          <p className="text-sm text-white/80 leading-relaxed">{rec.justificativa}</p>
        </div>
      )}

      {/* Prática do dia */}
      {!compact && (
        <div className="bg-white/5 rounded-xl p-3 space-y-1.5">
          <p className="text-xs text-white/50 font-medium uppercase tracking-wider">
            Prática de hoje
          </p>
          <p className="text-sm text-white/80 leading-relaxed">{pratica}</p>
        </div>
      )}

      {/* Decisão de hoje (da Authority derivada) */}
      {!compact && authority.decisaoHoje && (
        <div className="border-t border-white/8 pt-3">
          <p className="text-xs text-white/50 font-medium uppercase tracking-wider mb-1.5">
            Diretiva de hoje
          </p>
          <p className="text-sm text-white/90 leading-snug">{authority.decisaoHoje}</p>
        </div>
      )}
    </div>
  );
}

export default AkashaAuthorityPrompt;
