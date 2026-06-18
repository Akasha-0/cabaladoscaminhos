'use client';

/**
 * AkashaAuthorityPrompt — F-227 component (enhanced)
 *
 * Card visual premium que aparece antes de qualquer ação importante.
 * Mostra a pergunta "Qual é o seu estado AGORA?" com 3 botões
 * (Paz / Ansiedade / Neutro) e exibe a recomendação da regra
 * "Corpo 3 (paz) = aja, Corpo 4 (ansiedade) = espere".
 *
 * Melhorias UI/UX:
 * - Glow effects nos botões selecionados
 * - Gradientes vibrantes nos cards de estado
 * - Micro-animações de entrada (framer-motion)
 * - Hierarquia visual clara com cores semânticas
 * - Badge de estratégia com ícone visual
 * - Transições suaves em todos os elementos
 */
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, MinusCircle, Sparkles, Zap, Clock } from 'lucide-react';
import { useState } from 'react';
import {
  recomendarAcaoPorEstado,
  praticaAuthorityDiaria,
  type EstadoAkasha,
} from '@/lib/grimoire/akasha-authority';
import type { PilaresDados } from '@/lib/grimoire/significados-curados';

export interface AkashaAuthorityPromptProps {
  authority: {
    estrategia: string;
    autoridade: string;
    decisaoHoje: string;
  };
  pilares: Partial<PilaresDados>;
  onDecide?: (estado: EstadoAkasha, acao: 'aja' | 'espere' | 'observe') => void;
  compact?: boolean;
}

const ESTADO_OPTIONS: Array<{
  estado: EstadoAkasha;
  label: string;
  icon: typeof CheckCircle2;
  emoji: string;
  cor: string;
  corGlow: string;
  gradiente: string;
}> = [
  {
    estado: 'paz',
    label: 'Paz',
    icon: CheckCircle2,
    emoji: '☀',
    cor: '#34D399',
    corGlow: 'rgba(52, 211, 153, 0.4)',
    gradiente: 'from-emerald-500/20 to-teal-500/10',
  },
  {
    estado: 'ansiedade',
    label: 'Ansiedade',
    icon: XCircle,
    emoji: '⚡',
    cor: '#F87171',
    corGlow: 'rgba(248, 113, 113, 0.4)',
    gradiente: 'from-red-500/20 to-orange-500/10',
  },
  {
    estado: 'neutro',
    label: 'Neutro',
    icon: MinusCircle,
    emoji: '◯',
    cor: '#94A3B8',
    corGlow: 'rgba(148, 163, 184, 0.3)',
    gradiente: 'from-slate-500/20 to-zinc-500/10',
  },
];

// Badge de estratégia visual
function StrategyBadge({ strategy }: { strategy: string }) {
  const config = {
    act: { icon: Zap, label: 'Aja', cor: '#34D399', bg: 'bg-emerald-500/15' },
    wait: { icon: Clock, label: 'Espere', cor: '#F87171', bg: 'bg-red-500/15' },
    observe: { icon: Sparkles, label: 'Observe', cor: '#A78BFA', bg: 'bg-violet-500/15' },
    surrender: { icon: CheckCircle2, label: 'Confie', cor: '#60A5FA', bg: 'bg-blue-500/15' },
  } as const;

  const c = config[strategy as keyof typeof config] ?? config.observe;
  const Icon = c.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${c.bg}`}
      style={{ color: c.cor, borderColor: `${c.cor}40`, border: '1px solid' }}
    >
      <Icon size={10} />
      {c.label}
    </span>
  );
}

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

  const selectedOption = ESTADO_OPTIONS.find((o) => o.estado === estado);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="relative rounded-3xl overflow-hidden"
      data-testid="akasha-authority-prompt"
      aria-label="Akasha Authority — prompt de decisão"
    >
      {/* Background glow effect when a state is selected */}
      <AnimatePresence>
        {selectedOption && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at 50% 0%, ${selectedOption.corGlow} 0%, transparent 70%)`,
            }}
          />
        )}
      </AnimatePresence>

      {/* Main card */}
      <div
        className="relative rounded-3xl border backdrop-blur-xl p-6 space-y-5"
        style={{
          background: 'linear-gradient(145deg, rgba(28,28,30,0.95) 0%, rgba(20,20,22,0.98) 100%)',
          borderColor: selectedOption ? `${selectedOption.cor}30` : 'rgba(255,255,255,0.08)',
          boxShadow: selectedOption
            ? `0 0 40px -10px ${selectedOption.corGlow}, 0 20px 40px -20px rgba(0,0,0,0.5)`
            : '0 20px 40px -20px rgba(0,0,0,0.4)',
        }}
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="flex items-start gap-3"
        >
          {/* Animated star icon */}
          <div className="relative">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
              style={{
                background:
                  'linear-gradient(135deg, rgba(124,92,255,0.3) 0%, rgba(167,139,250,0.2) 100%)',
                border: '1px solid rgba(124,92,255,0.4)',
                boxShadow: '0 0 20px rgba(124,92,255,0.2)',
              }}
            >
              ✦
            </div>
            <div
              className="absolute -inset-1 rounded-xl animate-pulse opacity-30"
              style={{ background: 'rgba(124,92,255,0.15)', filter: 'blur(8px)' }}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-semibold">
                Akasha Authority
              </p>
              <StrategyBadge strategy={authority.estrategia} />
            </div>
            <h3 className="text-lg font-bold text-white leading-tight">
              Como você se sente agora?
            </h3>
            <p className="text-xs text-white/40 mt-1">
              Autoridade <span className="text-white/60 font-medium">{authority.autoridade}</span>
            </p>
          </div>
        </motion.div>

        {/* 3 state buttons */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.3 }}
          className="grid grid-cols-3 gap-3"
          role="radiogroup"
          aria-label="Estado atual"
        >
          {ESTADO_OPTIONS.map((opt, i) => {
            const isSelected = estado === opt.estado;
            const Icon = opt.icon;

            return (
              <motion.button
                key={opt.estado}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => handleClick(opt.estado)}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.05, duration: 0.3 }}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className={`
                  relative rounded-2xl p-4 text-center transition-all duration-300 overflow-hidden
                  ${isSelected ? 'ring-2' : 'hover:ring-1'}
                `}
                style={{
                  background: isSelected
                    ? `linear-gradient(145deg, ${opt.cor}15 0%, ${opt.cor}08 100%)`
                    : 'rgba(255,255,255,0.03)',
                  borderColor: isSelected ? opt.cor : 'rgba(255,255,255,0.08)',
                  border: '1px solid',
                  ringColor: opt.cor,
                  boxShadow: isSelected
                    ? `0 0 30px -8px ${opt.corGlow}, inset 0 1px 0 rgba(255,255,255,0.05)`
                    : 'inset 0 1px 0 rgba(255,255,255,0.03)',
                }}
              >
                {/* Glow backdrop when selected */}
                {isSelected && (
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{
                      background: `radial-gradient(ellipse at 50% 0%, ${opt.corGlow} 0%, transparent 70%)`,
                    }}
                  />
                )}

                <div className="relative z-10">
                  <div
                    className="w-12 h-12 rounded-xl mx-auto mb-2 flex items-center justify-center transition-all duration-300"
                    style={{
                      background: isSelected
                        ? `linear-gradient(135deg, ${opt.cor}30 0%, ${opt.cor}15 100%)`
                        : 'rgba(255,255,255,0.05)',
                      border: isSelected
                        ? `1px solid ${opt.cor}50`
                        : '1px solid rgba(255,255,255,0.06)',
                      boxShadow: isSelected ? `0 0 20px -5px ${opt.corGlow}` : 'none',
                    }}
                  >
                    {isSelected ? (
                      <Icon size={22} style={{ color: opt.cor }} />
                    ) : (
                      <span className="text-2xl">{opt.emoji}</span>
                    )}
                  </div>
                  <div
                    className="text-xs font-bold uppercase tracking-wider transition-colors duration-300"
                    style={{ color: isSelected ? opt.cor : 'rgba(255,255,255,0.5)' }}
                  >
                    {opt.label}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Recommendation after selection */}
        <AnimatePresence mode="wait">
          {rec && (
            <motion.div
              key={estado}
              initial={{ opacity: 0, height: 0, scale: 0.95 }}
              animate={{ opacity: 1, height: 'auto', scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.95 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div
                className="rounded-2xl p-4 space-y-3"
                style={{
                  background: `linear-gradient(145deg, ${rec.acao === 'aja' ? 'rgba(52,211,153,0.12)' : rec.acao === 'espere' ? 'rgba(248,113,113,0.12)' : 'rgba(148,163,184,0.12)'} 0%, transparent 100%)`,
                  border: `1px solid ${rec.acao === 'aja' ? 'rgba(52,211,153,0.25)' : rec.acao === 'espere' ? 'rgba(248,113,113,0.25)' : 'rgba(148,163,184,0.2)'}`,
                }}
                role="status"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      background:
                        rec.acao === 'aja'
                          ? 'linear-gradient(135deg, rgba(52,211,153,0.3) 0%, rgba(52,211,153,0.1) 100%)'
                          : rec.acao === 'espere'
                            ? 'linear-gradient(135deg, rgba(248,113,113,0.3) 0%, rgba(248,113,113,0.1) 100%)'
                            : 'linear-gradient(135deg, rgba(148,163,184,0.3) 0%, rgba(148,163,184,0.1) 100%)',
                      border:
                        rec.acao === 'aja'
                          ? '1px solid rgba(52,211,153,0.4)'
                          : rec.acao === 'espere'
                            ? '1px solid rgba(248,113,113,0.4)'
                            : '1px solid rgba(148,163,184,0.3)',
                    }}
                  >
                    <span className="text-xl">{rec.icone}</span>
                  </div>
                  <div>
                    <span
                      className="text-sm font-black uppercase tracking-[0.15em]"
                      style={{
                        color:
                          rec.acao === 'aja'
                            ? '#34D399'
                            : rec.acao === 'espere'
                              ? '#F87171'
                              : '#94A3B8',
                      }}
                    >
                      {rec.acao === 'aja'
                        ? 'Aja Agora'
                        : rec.acao === 'espere'
                          ? 'Aguarde'
                          : 'Observe'}
                    </span>
                    <p className="text-xs text-white/50 mt-0.5">
                      {rec.acao === 'aja'
                        ? 'Momento de agir — confiança total'
                        : rec.acao === 'espere'
                          ? 'Não force — espere o reconhecimento'
                          : 'Analise antes de agir'}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-white/75 leading-relaxed pl-[52px]">
                  {rec.justificativa}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Daily practice */}
        {!compact && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className="bg-white/[0.03] rounded-2xl p-4 space-y-2"
            style={{ border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-[10px]"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(124,92,255,0.4) 0%, rgba(167,139,250,0.2) 100%)',
                  border: '1px solid rgba(124,92,255,0.5)',
                }}
              >
                ✦
              </div>
              <p className="text-[10px] text-white/30 uppercase tracking-[0.15em] font-bold">
                Prática de Hoje
              </p>
            </div>
            <p className="text-sm text-white/70 leading-relaxed pl-7">{pratica}</p>
          </motion.div>
        )}

        {/* Today's directive */}
        {!compact && authority.decisaoHoje && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.3 }}
            className="pt-3 space-y-2"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="flex items-center gap-2">
              <Sparkles size={10} className="text-[#A78BFA]" />
              <p className="text-[10px] text-white/30 uppercase tracking-[0.15em] font-bold">
                Diretiva de Hoje
              </p>
            </div>
            <p className="text-sm text-white/80 leading-snug pl-4 font-medium">
              {authority.decisaoHoje}
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export default AkashaAuthorityPrompt;
