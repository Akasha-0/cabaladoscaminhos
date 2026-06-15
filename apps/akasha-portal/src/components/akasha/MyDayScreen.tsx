'use client';

/**
 * MyDayScreen — F-224
 *
 * ONE SCREEN mobile: a tela de "Meu Dia" sem navegação entre mapas.
 * Mostra em sequência:
 *  1. Saudação personalizada (nome + posição lunar/astral atual)
 *  2. Clima energético do dia (1 frase)
 *  3. Janela de clareza (horário favorável hoje)
 *  4. Alerta (o que evitar)
 *  5. Akasha Authority prompt (F-227) — "Qual é o seu estado AGORA?"
 *  6. Prática do dia (1 ação)
 *  7. Botão "Ver minha Caixa" → /minha-caixa
 *
 * Inspiração: Co-Star daily + AstroSage daily guidance.
 * Foco: ZERO navegação. Tudo visível no scroll.
 */

import Link from 'next/link';
import { useAkashaSynthesis } from './dashboard/hooks/useAkashaSynthesis';
import { AkashaAuthorityPrompt } from './AkashaAuthorityPrompt';
import { Sparkles, Clock, AlertTriangle, Compass, ChevronRight } from 'lucide-react';

export interface MyDayScreenProps {
  userName: string;
  locale: string;
}

export function MyDayScreen({ userName, locale }: MyDayScreenProps) {
  const { data, loading, error } = useAkashaSynthesis({ userId: 'me' });

  if (loading) {
    return (
      <main
        style={{
          background: 'linear-gradient(180deg, #0B0E1C 0%, #1A1F3A 100%)',
          minHeight: 'calc(100vh - 56px)',
          padding: '24px 20px 80px',
        }}
      >
        <div style={{ maxWidth: 480, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-2xl bg-white/5"
              style={{ height: 96 }}
            />
          ))}
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main
        style={{
          background: 'linear-gradient(180deg, #0B0E1C 0%, #1A1F3A 100%)',
          minHeight: 'calc(100vh - 56px)',
          padding: '32px 20px',
        }}
      >
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
            Não conseguimos carregar seu mapa agora. Volte mais tarde — seu mapa continua aqui.
          </p>
        </div>
      </main>
    );
  }

  const hoje = new Date();
  const hora = hoje.getHours();
  const saudacaoTemporal =
    hora < 6 ? 'Boa madrugada' :
    hora < 12 ? 'Bom dia' :
    hora < 18 ? 'Boa tarde' :
    'Boa noite';

  const dataFormatada = hoje.toLocaleDateString(locale === 'pt-BR' ? 'pt-BR' : 'en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const authority = data.synthesis?.oneProfile
    ? {
        estrategia: data.synthesis.oneProfile.strategy,
        autoridade: data.synthesis.oneProfile.authority,
        decisaoHoje: data.synthesis.oneProfile.dailyDirective,
      }
    : null;

  const temSynthesis = !!data.synthesis;

  return (
    <main
      style={{
        background: 'linear-gradient(180deg, #0B0E1C 0%, #1A1F3A 100%)',
        minHeight: 'calc(100vh - 56px)',
        padding: '24px 20px 80px',
      }}
    >
      <div style={{ maxWidth: 480, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* 1. Saudação personalizada */}
        <header>
          <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.2em', textTransform: 'uppercase', margin: 0 }}>
            {dataFormatada}
          </p>
          <h1
            style={{
              fontFamily: 'var(--font-cinzel, serif)',
              color: '#FFFFFF',
              fontSize: '2rem',
              margin: '8px 0 4px',
              lineHeight: 1.1,
            }}
          >
            {saudacaoTemporal}, {userName}.
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', margin: 0, lineHeight: 1.5 }}>
            {data.climate}
          </p>
        </header>

        {/* 2. Lua + energia cósmica */}
        <div
          className="rounded-2xl border border-white/10 p-4"
          style={{ background: 'rgba(255,255,255,0.04)' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={14} className="text-[#FF9500]" aria-hidden />
            <span className="text-xs text-white/60 uppercase tracking-widest font-medium">Hoje no céu</span>
          </div>
          <p className="text-sm text-white/85 leading-relaxed">{data.overallTheme}</p>
          {data.moonPhase && (
            <p className="text-xs text-white/50 mt-2 leading-relaxed italic">Lua: {data.moonPhase}</p>
          )}
        </div>

        {/* 3. Prática + Janela de Clareza + Alerta (3-up) */}
        <div className="grid grid-cols-1 gap-3">
          {/* Prática do dia */}
          {data.ritual && (
            <div
              className="rounded-2xl p-4"
              style={{
                background: `linear-gradient(135deg, ${data.ritual.cor}22 0%, ${data.ritual.cor}08 100%)`,
                border: `1px solid ${data.ritual.cor}44`,
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Compass size={14} style={{ color: data.ritual.cor }} aria-hidden />
                <span
                  className="text-xs uppercase tracking-widest font-semibold"
                  style={{ color: data.ritual.cor }}
                >
                  Prática de hoje
                </span>
              </div>
              <p className="text-sm text-white font-medium leading-snug">{data.ritual.titulo}</p>
              <p className="text-xs text-white/70 mt-1.5 leading-relaxed">{data.ritual.instrucao}</p>
            </div>
          )}

          {/* Janela de Clareza */}
          <div
            className="rounded-2xl p-4"
            style={{
              background: 'rgba(52,199,89,0.08)',
              border: '1px solid rgba(52,199,89,0.25)',
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Clock size={14} className="text-[#34C759]" aria-hidden />
              <span className="text-xs text-[#34C759] uppercase tracking-widest font-semibold">Janela de clareza</span>
            </div>
            <p className="text-sm text-white/85 leading-relaxed">
              {temSynthesis && authority
                ? `Quando sentir paz — não urgência. ${authority.decisaoHoje}`
                : 'Quando sentir paz emocional, não urgência. Aja nesse momento.'}
            </p>
          </div>

          {/* Alerta */}
          {data.alert && (
            <div
              className="rounded-2xl p-4"
              style={{
                background: 'rgba(255,59,48,0.08)',
                border: '1px solid rgba(255,59,48,0.25)',
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={14} className="text-[#FF3B30]" aria-hidden />
                <span className="text-xs text-[#FF3B30] uppercase tracking-widest font-semibold">Evite hoje</span>
              </div>
              <p className="text-sm text-white/85 leading-relaxed">{data.alert}</p>
            </div>
          )}
        </div>

        {/* 4. Akasha Authority Prompt (F-227) — APENAS se temos dados dos 5 pilares */}
        {temSynthesis && authority && data.synthesis?.oneProfile && (
          <AkashaAuthorityPrompt
            authority={authority}
            pilares={{ cabala: { life_path: data.synthesis.lifePath } as any }}
          />
        )}

        {/* 5. Tensão do dia (se houver) */}
        {data.tensionPoint && (
          <div
            className="rounded-2xl border border-white/10 p-4"
            style={{ background: 'rgba(255,255,255,0.03)' }}
          >
            <span className="text-xs text-white/50 uppercase tracking-widest font-medium block mb-2">
              Tensão ativa
            </span>
            <p className="text-sm text-white/80 leading-relaxed">
              {data.tensionPoint.pillar} · {data.tensionPoint.theme}
            </p>
          </div>
        )}

        {/* 6. CTA — Ver minha Caixa */}
        <Link
          href={`/${locale}/minha-caixa`}
          className="rounded-2xl p-4 flex items-center justify-between transition-transform active:scale-[0.98]"
          style={{
            background: 'linear-gradient(135deg, #FF9500 0%, #FF3B30 100%)',
            textDecoration: 'none',
            color: '#0B0E1C',
          }}
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest opacity-80">Ver minha</p>
            <p className="text-lg font-bold leading-tight">Caixa Akasha</p>
          </div>
          <ChevronRight size={20} aria-hidden />
        </Link>

        {/* Footer com síntese narrativa curta */}
        {data.synthesis?.synthesisParagraph && (
          <p
            className="text-xs text-white/40 text-center leading-relaxed italic"
            style={{ marginTop: 8, padding: '0 8px' }}
          >
            {data.synthesis.synthesisParagraph}
          </p>
        )}
      </div>
    </main>
  );
}

export default MyDayScreen;
