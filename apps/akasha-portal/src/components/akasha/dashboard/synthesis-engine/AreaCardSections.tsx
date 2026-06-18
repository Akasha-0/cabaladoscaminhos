'use client';
/**
 * AreaCardSections — Expanded content sections for AkashaLifeAreasDashboard AreaCard
 * Extracted from AkashaLifeAreasDashboard (RitualBadge + SexualidadeSection)
 */
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { SexualidadeUI } from '../hooks/useAkashaSynthesis';

// ─── RitualBadge ─────────────────────────────────────────────────────────────

function RitualBadge({ ritual }: {
  ritual: { title: string; instruction: string; duration: string; element: string; color: string }
}) {
  return (
    <div
      className="rounded-xl p-3 flex items-start gap-3"
      style={{ backgroundColor: `${ritual.color}18` }}
    >
      <div
        className="w-2 h-2 rounded-full mt-1.5 shrink-0"
        style={{ backgroundColor: ritual.color }}
      />
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold" style={{ color: ritual.color }}>{ritual.title}</span>
          <span className="text-xs text-white/40">{ritual.duration}</span>
        </div>
        <p className="text-xs text-white/60 mt-0.5 leading-relaxed">{ritual.instruction}</p>
      </div>
    </div>
  );
}

// ─── SexualidadeSection ──────────────────────────────────────────────────────

function SexualidadeSection({ sexualidade }: { sexualidade: SexualidadeUI }) {
  const [showDetails, setShowDetails] = useState(false);
  return (
    <div className="border-t border-[#FF2D55]/20 pt-2 mt-2">
      <button
        onClick={() => setShowDetails(v => !v)}
        className="flex items-center gap-2 w-full"
      >
        <span className="text-xs font-semibold text-[#FF2D55]/90 uppercase tracking-wider">Sexualidade</span>
        <ChevronDown size={14} className="text-white/30" style={{ transform: showDetails ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
      </button>
      {showDetails && (
        <div className="mt-2 space-y-2">
          {sexualidade.description && (
            <p className="text-xs text-white/60 leading-relaxed">{sexualidade.description}</p>
          )}
          {sexualidade.desirePattern && (
            <div className="bg-[#FF2D55]/08 rounded-lg p-2">
              <p className="text-xs text-[#FF2D55]/80 font-medium">Padrão de Desejo</p>
              <p className="text-xs text-white/50 mt-0.5">{sexualidade.desirePattern}</p>
            </div>
          )}
          {sexualidade.turnOn.length > 0 && (
            <div>
              <p className="text-xs text-[#34C759]/80 font-medium mb-1">LIGA</p>
              <div className="flex flex-wrap gap-1">
                {sexualidade.turnOn.map((t, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-[#34C759]/15 text-[#34C759]/80">{t}</span>
                ))}
              </div>
            </div>
          )}
          {sexualidade.turnOff.length > 0 && (
            <div>
              <p className="text-xs text-[#FF2D55]/80 font-medium mb-1">DESLIGA</p>
              <div className="flex flex-wrap gap-1">
                {sexualidade.turnOff.map((t, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-[#FF2D55]/15 text-[#FF2D55]/80">{t}</span>
                ))}
              </div>
            </div>
          )}
          {sexualidade.hiddenDesires.length > 0 && (
            <div>
              <p className="text-xs text-[#FFD60A]/80 font-medium mb-1">Desejos Ocultos</p>
              {sexualidade.hiddenDesires.map((d, i) => (
                <div key={i} className="text-xs text-white/50 mb-1">
                  <span className="text-white/70">{d.desire}</span>
                  <span className="text-white/30"> → medo: {d.fear}</span>
                </div>
              ))}
            </div>
          )}
          {sexualidade.transformationKey && (
            <div className="bg-[#AF52DE]/08 rounded-lg p-2">
              <p className="text-xs text-[#AF52DE]/80 font-medium">Chave de Transformação</p>
              <p className="text-xs text-white/50 mt-0.5">{sexualidade.transformationKey}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export { RitualBadge, SexualidadeSection };
