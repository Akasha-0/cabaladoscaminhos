'use client';
/**
 * OneProfileCard — F-227: ONE Akasha Profile Card
 *
 * Extracted from AkashaLifeAreasDashboard.tsx (lines 425–538).
 * Self-contained: no shared state, no area-config dependencies.
 */
import { ArrowRight, AlertTriangle } from 'lucide-react';
import type { AkashaTypeProfileUI } from './hooks/useAkashaSynthesis';

const AUTHORITY_LABELS: Record<string, string> = {
  emotional: 'Autoridade Emocional',
  sacral: 'Autoridade Sacral',
  splenic: 'Autoridade Esplênica',
  mental: 'Autoridade Mental',
};

export function OneProfileCard({
  profile,
  narrativaCentral,
}: {
  profile: AkashaTypeProfileUI;
  narrativaCentral?: string | null;
}) {
  const iconMap: Record<string, string> = {
    catalisador: '#FF6B35',
    receptor: '#0A84FF',
    construtor: '#30D158',
    transformador: '#BF5AF2',
    guardiao: '#64D2FF',
    curador: '#FF375F',
    canal: '#FFD60A',
    alquimista: '#AC8E68',
    arquiteto: '#8E8E93',
  };
  const accentColor = iconMap[profile.type] ?? '#FF9500';

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#1C1C1E] to-[#2C2C2E] overflow-hidden">
      {/* Header: type + icon */}
      <div
        className="px-5 pt-5 pb-4"
        style={{ background: `linear-gradient(135deg, ${accentColor}22 0%, transparent 60%)` }}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{profile.typeIcon}</span>
            <div>
              <p className="text-xs text-white/40 uppercase tracking-widest font-medium">
                Seu Tipo Akasha
              </p>
              <h2 className="text-xl font-bold text-white leading-tight">{profile.typeName}</h2>
              <p className="text-sm text-white/60 mt-0.5 italic">
                &ldquo;{profile.corePattern}&rdquo;
              </p>
              {/* Confidence badge */}
              {profile.typeConfidence && (
                <div
                  className={`inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                    profile.typeConfidence === 'alta'
                      ? 'bg-[#30D158]/15 border-[#30D158]/30 text-[#30D158]'
                      : profile.typeConfidence === 'media'
                        ? 'bg-[#FFD60A]/15 border-[#FFD60A]/30 text-[#FFD60A]'
                        : 'bg-[#FF375F]/15 border-[#FF375F]/30 text-[#FF375F]'
                  }`}
                >
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-current" />
                  {profile.typeConfidence === 'alta'
                    ? 'Alta convergência — perfil bem definido'
                    : profile.typeConfidence === 'media'
                      ? 'Convergência média — perfil em formação'
                      : 'Baixa convergência — mais dados fortalecem o perfil'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* One-liner — a frase que o usuário lembra o dia todo */}
        <div className="mt-4 bg-black/20 rounded-xl p-4">
          <p className="text-base text-white font-semibold leading-snug">{profile.oneLiner}</p>
        </div>
      </div>

      {/* Strategy + Authority */}
      <div className="px-5 py-4 border-t border-white/8 grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-white/40 uppercase tracking-wider mb-1.5">Estratégia</p>
          <p className="text-sm font-semibold text-white">{profile.strategy}</p>
          <p className="text-xs text-white/50 mt-1 leading-relaxed">{profile.strategyDetail}</p>
        </div>
        <div>
          <p className="text-xs text-white/40 uppercase tracking-wider mb-1.5">
            {AUTHORITY_LABELS[profile.authority] ?? 'Autoridade'}
          </p>
          <p className="text-sm text-white/80 leading-relaxed italic">
            &ldquo;{profile.authorityPractice}&rdquo;
          </p>
        </div>
      </div>

      {/* Daily Directive */}
      <div className="mx-5 mb-4 bg-[#FF9500]/10 border border-[#FF9500]/20 rounded-xl px-4 py-3">
        <p className="text-xs text-[#FF9500]/80 uppercase tracking-wider font-semibold mb-1">
          Diretiva de Hoje
        </p>
        <p className="text-sm text-white font-medium leading-snug">{profile.dailyDirective}</p>
      </div>

      {/* Growth + Shadow */}
      <div className="px-5 pb-5 grid grid-cols-1 gap-2">
        <div className="flex items-start gap-2">
          <ArrowRight size={14} className="text-[#30D158] mt-0.5 shrink-0" />
          <p className="text-xs text-white/60">
            <span className="text-[#30D158] font-medium">Crescimento: </span>
            {profile.growthEdge}
          </p>
        </div>
        <div className="flex items-start gap-2">
          <AlertTriangle size={14} className="text-[#FF375F] mt-0.5 shrink-0" />
          <p className="text-xs text-white/60">
            <span className="text-[#FF375F] font-medium">Armadilha: </span>
            {profile.shadowTrap}
          </p>
        </div>
      </div>
      {/* F-232: Narrativa Central Akáshica — síntese dos 3 primitivos dominantes */}
      {narrativaCentral && (
        <div className="mx-5 mb-4 bg-gradient-to-r from-[#7C5CFF]/10 to-[#2DD4BF]/10 border border-[#7C5CFF]/20 rounded-xl px-4 py-3">
          <p className="text-xs text-[#7C5CFF]/80 uppercase tracking-wider font-semibold mb-1">
            Síntese Akáshica
          </p>
          <p className="text-sm text-white/80 leading-relaxed italic">
            &ldquo;{narrativaCentral}&rdquo;
          </p>
        </div>
      )}
    </div>
  );
}
