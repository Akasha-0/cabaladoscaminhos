'use client';

/**
 * MyDayScreen — F-224 + Wave 10.2 refactor
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
 * Wave 10.2: usa tokens semânticos (`--ak-*`) via Tailwind utilities
 * mapeadas em globals.css. Substitui hex/rgb hardcoded por
 * classes como `bg-ak-bg-cosmic-gradient`, `text-ak-text-muted`, etc.
 */
import { Sparkles, Clock, AlertTriangle, Compass, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { AkashaAuthorityPrompt } from './AkashaAuthorityPrompt';
import { useAkashaSynthesis } from './dashboard/hooks/useAkashaSynthesis';

export interface MyDayScreenProps {
  userName: string;
  locale: string;
}

export function MyDayScreen({ userName, locale }: MyDayScreenProps) {
  const { data, loading, error } = useAkashaSynthesis({ userId: 'me' });

  if (loading) {
    return (
      <main
        className="bg-ak-bg-cosmic-gradient min-h-[calc(100vh-56px)] px-5 py-6 pb-20"
      >
        <div className="max-w-[var(--ak-container-narrow)] mx-auto flex flex-col gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl bg-white/5 h-24" />
          ))}
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="bg-ak-bg-cosmic-gradient min-h-[calc(100vh-56px)] px-5 py-8">
        <div className="max-w-[var(--ak-container-narrow)] mx-auto">
          <p className="text-ak-text-muted leading-relaxed">
            Não conseguimos carregar seu mapa agora. Volte mais tarde — seu mapa continua aqui.
          </p>
        </div>
      </main>
    );
  }

  const hoje = new Date();
  const hora = hoje.getHours();
  const saudacaoTemporal =
    hora < 6 ? 'Boa madrugada' : hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';

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
    <main className="bg-ak-bg-cosmic-gradient min-h-[calc(100vh-56px)] px-5 py-6 pb-20">
      <div className="max-w-[var(--ak-container-narrow)] mx-auto flex flex-col gap-4">
        {/* 1. Saudação personalizada */}
        <header>
          <p className="text-xs text-ak-text-subtle uppercase tracking-[0.2em] m-0">
            {dataFormatada}
          </p>
          <h1
            className="text-3xl md:text-4xl text-ak-text-primary mt-2 mb-1 leading-tight"
            style={{ fontFamily: 'var(--ak-font-cinzel)' }}
          >
            {saudacaoTemporal}, {userName}.
          </h1>
          <p className="text-base text-ak-text-muted m-0 leading-relaxed">
            {data.climate}
          </p>
        </header>

        {/* 2. Lua + energia cósmica */}
        <div className="rounded-2xl border border-ak-border-default bg-ak-surface-glass p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={14} className="text-ak-accent-tertiary" aria-hidden />
            <span className="text-xs text-ak-text-muted uppercase tracking-[0.2em] font-medium">
              Clima Energético
            </span>
          </div>
          <p className="text-sm text-ak-text-primary/85 leading-relaxed">{data.overallTheme}</p>
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
                  className="text-xs uppercase tracking-[0.2em] font-semibold"
                  style={{ color: data.ritual.cor }}
                >
                  Prática de hoje
                </span>
              </div>
              <p className="text-sm text-ak-text-primary font-medium leading-snug">{data.ritual.titulo}</p>
              <p className="text-xs text-ak-text-primary/70 mt-1.5 leading-relaxed">
                {data.ritual.instrucao}
              </p>
            </div>
          )}

          {/* Janela de Clareza — usa tokens (success) */}
          <div className="rounded-2xl bg-[var(--ak-color-success-bg)] border border-[var(--ak-color-success-border)] p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={14} className="text-[var(--ak-color-success)]" aria-hidden />
              <span className="text-xs text-[var(--ak-color-success)] uppercase tracking-[0.2em] font-semibold">
                Janela de clareza
              </span>
            </div>
            <p className="text-sm text-ak-text-primary/85 leading-relaxed">
              {temSynthesis && authority
                ? `Quando sentir paz — não urgência. ${authority.decisaoHoje}`
                : 'Quando sentir paz emocional, não urgência. Aja nesse momento.'}
            </p>
          </div>

          {/* Alerta — usa tokens (error) */}
          {data.alert && (
            <div className="rounded-2xl bg-[var(--ak-color-error-bg)] border border-[var(--ak-color-error-border)] p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={14} className="text-[var(--ak-color-error)]" aria-hidden />
                <span className="text-xs text-[var(--ak-color-error-text)] uppercase tracking-[0.2em] font-semibold">
                  Evite hoje
                </span>
              </div>
              <p className="text-sm text-ak-text-primary/85 leading-relaxed">{data.alert}</p>
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
          <div className="rounded-2xl border border-ak-border-default bg-ak-surface-1 p-4">
            <span className="text-xs text-ak-text-subtle uppercase tracking-[0.2em] font-medium block mb-2">
              Tensão ativa
            </span>
            <p className="text-sm text-ak-text-primary/80 leading-relaxed">{data.tensionPoint.theme}</p>
          </div>
        )}

        {/* 6. CTA — Ver minha Caixa */}
        <Link
          href={`/${locale}/minha-caixa`}
          className="rounded-2xl p-4 flex items-center justify-between transition-transform active:scale-[0.98] no-underline bg-gradient-to-br from-ak-accent-tertiary to-ak-accent-alert text-ak-bg-primary"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-80">Ver minha</p>
            <p className="text-lg font-bold leading-tight">Caixa Akasha</p>
          </div>
          <ChevronRight size={20} aria-hidden />
        </Link>

        {/* Footer com síntese narrativa curta */}
        {data.synthesis?.synthesisParagraph && (
          <p className="text-xs text-ak-text-subtle text-center leading-relaxed italic mt-2 px-2">
            {data.synthesis.synthesisParagraph}
          </p>
        )}
      </div>
    </main>
  );
}

export default MyDayScreen;