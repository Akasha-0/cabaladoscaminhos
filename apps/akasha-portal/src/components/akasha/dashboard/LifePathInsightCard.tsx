'use client';

/**
 * LifePathInsightCard — Ciclo 520
 *
 * Cartão compacto do Número de Vida (Caminho de Vida Cabalístico).
 * Mostra archetype Akasha + mandato + nível atual + prática da semana.
 * Segue o modelo shadow/gift/siddhi (DEC-004).
 *
 * Diferente do AkashaSignificadoCard: é compacto para o dashboard,
 * não duplica a experiência completa da página /significado.
 */

import { useState } from 'react';
import Link from 'next/link';
import { interpretarVida } from '@akasha/core';
import type { VidaInterpretation, AreaInterpretation } from '@akasha/types';

type Nivel = 'shadow' | 'gift' | 'siddhi';

const NIVEL_CONFIG: Record<Nivel, { label: string; cor: string; emoji: string }> = {
  shadow: { label: 'Sombra', cor: '#FF2D55', emoji: '🌑' },
  gift:   { label: 'Dom',    cor: '#34C759', emoji: '✦'  },
  siddhi: { label: 'Realização', cor: '#AF52DE', emoji: '✴' },
};

interface Props {
  lifePath: number;
  /** Frequência dominante do perfil Akasha — usado como default para o nível */
  defaultNivel?: 'shadow' | 'gift' | 'siddhi';
}

export function LifePathInsightCard({ lifePath, defaultNivel = 'gift' }: Props) {
  const [nivel, setNivel] = useState<Nivel>(defaultNivel);

  const vida: VidaInterpretation = interpretarVida(lifePath);
  const interp: AreaInterpretation = vida.levels[nivel] ?? vida.levels.gift;
  const nivelCfg = NIVEL_CONFIG[nivel];

  return (
    <div
      className="rounded-2xl border border-[#7c5cff]/25 bg-gradient-to-br from-[#7c5cff]/6 to-transparent overflow-hidden"
      style={{ borderLeftWidth: 3, borderLeftColor: '#7c5cff' }}
    >
      {/* Header: archetype + life path number */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs text-[#7c5cff]/80 uppercase tracking-widest font-medium mb-0.5">Caminho de Vida</p>
            <h2 className="text-base font-bold text-white leading-tight">
              {vida.arquetipoAkasha}
            </h2>
            <p className="text-xs text-white/50 mt-0.5 italic">
              {vida.mandato}
            </p>
          </div>
          {/* Life path number badge */}
          <div
            className="shrink-0 w-12 h-12 rounded-xl flex flex-col items-center justify-center"
            style={{ background: `${nivelCfg.cor}22`, border: `1px solid ${nivelCfg.cor}44` }}
          >
            <span className="text-lg font-bold" style={{ color: nivelCfg.cor }}>{lifePath}</span>
            <span className="text-[9px] text-white/40 uppercase tracking-wider">número</span>
          </div>
        </div>
      </div>

      {/* Level selector */}
      <div className="px-4 pb-3">
        <div className="flex gap-1.5">
          {(['shadow', 'gift', 'siddhi'] as Nivel[]).map((n) => (
            <button
              key={n}
              onClick={() => setNivel(n)}
              className="flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-all"
              style={{
                background: nivel === n ? `${NIVEL_CONFIG[n].cor}22` : 'rgba(255,255,255,0.04)',
                color: nivel === n ? NIVEL_CONFIG[n].cor : '#706686',
                borderBottom: nivel === n ? `2px solid ${NIVEL_CONFIG[n].cor}` : '2px solid transparent',
              }}
            >
              {NIVEL_CONFIG[n].emoji} {NIVEL_CONFIG[n].label}
            </button>
          ))}
        </div>
      </div>

      {/* Interpretation text — compact */}
      <div className="px-4 pb-3 space-y-2">
        <p className="text-xs text-white/70 leading-relaxed line-clamp-3">
          {interp.significado}
        </p>

        {/* Practical action */}
        {interp.acaoPratica && (
          <div
            className="rounded-lg p-2.5"
            style={{ background: 'rgba(0,0,0,0.2)', borderLeft: `2px solid ${nivelCfg.cor}55` }}
          >
            <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1 font-semibold">
              Prática desta semana
            </p>
            {interp.acaoPratica.amplificar.slice(0, 1).map((item, i) => (
              <p key={i} className="text-xs text-white/70 leading-relaxed">
                → {item}
              </p>
            ))}
            {interp.acaoPratica.evitar.slice(0, 1).map((item, i) => (
              <p key={i} className="text-xs text-white/50 leading-relaxed mt-0.5">
                ✕ {item}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Learn more link */}
      <div className="px-4 pb-4">
        <Link
          href="/mapa/significado"
          className="inline-flex items-center gap-1.5 text-xs font-medium transition-colors"
          style={{ color: '#7c5cff' }}
        >
          <span>Conheça seu número em profundidade</span>
          <span>→</span>
        </Link>
      </div>
    </div>
  );
}
