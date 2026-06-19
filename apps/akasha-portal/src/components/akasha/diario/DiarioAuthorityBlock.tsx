'use client';

import dynamic from 'next/dynamic';
import { getTranslations } from '@/lib/i18n';
import type { PilaresDados } from '@/lib/grimoire/significados-curados';

const AkashaAuthorityPrompt = dynamic(
  () => import('@/components/akasha/AkashaAuthorityPrompt/AkashaAuthorityPrompt').then((m) => m.AkashaAuthorityPrompt),
  { ssr: false }
);

export interface TensionPoint {
  theme: string;
}

export interface DiarioAuthorityBlockProps {
  authority: {
    estrategia: 'act' | 'wait' | 'observe' | 'surrender';
    autoridade: 'emocional' | 'sagrada' | 'esplénica' | 'mental';
    explicacao: string;
    regra: { condicao: string; accao: string };
    timing: { melhor: string; pior: string };
    decisaoHoje: string;
    praticaDiaria: string;
  };
  pilares: Partial<PilaresDados>;
  locale: string;
  /** DailyResponse.tensionPoint — ponto de tensão ativo do dia */
  tensionPoint?: TensionPoint;
}

export function DiarioAuthorityBlock({
  authority,
  pilares,
  locale,
  tensionPoint,
}: DiarioAuthorityBlockProps) {
  const t = getTranslations(locale);

  const sectionCard =
    'bg-[rgba(11,14,28,0.72)] backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-4';

  return (
    <section aria-label={t('diario.authority.autoridadeAkashica')} className={sectionCard}>
      {/* Tension point — top callout when present */}
      {tensionPoint ? (
        <div
          className="rounded-xl p-3 mb-4"
          style={{ background: 'rgba(240,180,41,0.06)', border: '1px solid rgba(240,180,41,0.2)' }}
          aria-label={t('diario.authority.tensaoAtiva')}
        >
          <p className="text-[0.6rem] text-[#F0B429] tracking-wide uppercase mb-0.5 font-cinzel">
            {t('diario.authority.tensaoAtiva')}
          </p>
          <p className="text-[0.82rem] text-[#B8BFCE] leading-relaxed">{tensionPoint.theme}</p>
        </div>
      ) : null}

      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-[1.15rem] font-cinzel text-[#F4F5FF]">{t('diario.authority.suaAutoridade')}</h2>
        <span
          className="text-[0.65rem] px-2 py-0.5 rounded-full"
          style={{
            background: '#7C5CFF1A',
            border: '1px solid #7C5CFF55',
            color: '#7C5CFF',
            letterSpacing: '0.1em',
          }}
        >
          {t(`diario.authority.${authority.autoridade.normalize('NFD').replace(/[\u0300-\u036f]/g, '')}`)}
        </span>
      </div>
      <AkashaAuthorityPrompt
        authority={authority}
        pilares={pilares}
        compact={true}
      />

      <div className="mt-4 px-1">
        <p className="text-[0.72rem] text-[#8A9BB8] leading-relaxed">{authority.explicacao}</p>
      </div>

      <div
        className="rounded-2xl p-4 mt-3"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <p className="text-[0.65rem] font-cinzel tracking-[0.15em] uppercase text-[#8A9BB8] mb-1">
          {t('diario.authority.regraDeHoje')}
        </p>
        <p className="text-[0.85rem] text-[#B8BFCE]">
          <span className="text-[#F0B429]">{authority.regra.condicao}</span>
          {' — '}
          {authority.regra.accao}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-3">
        <div
          className="rounded-xl p-3"
          style={{ background: 'rgba(45,212,191,0.06)', border: '1px solid rgba(45,212,191,0.2)' }}
        >
          <p className="text-[0.6rem] text-[#2DD4BF] tracking-wide uppercase mb-0.5">{t('diario.authority.melhorJanela')}</p>
          <p className="text-[0.8rem] text-[#B8BFCE]">{authority.timing.melhor}</p>
        </div>
        <div
          className="rounded-xl p-3"
          style={{ background: 'rgba(251,87,129,0.06)', border: '1px solid rgba(251,87,129,0.2)' }}
        >
          <p className="text-[0.6rem] text-[#FB5781] tracking-wide uppercase mb-0.5">{t('diario.authority.pioresJanelas')}</p>
          <p className="text-[0.8rem] text-[#B8BFCE]">{authority.timing.pior}</p>
        </div>
      </div>

      <div
        className="rounded-2xl p-4 mt-3"
        style={{ background: 'rgba(124,92,255,0.08)', border: '1px solid rgba(124,92,255,0.2)' }}
      >
        <p className="text-[0.65rem] font-cinzel tracking-[0.15em] uppercase text-[#7C5CFF] mb-1">
          {t('diario.authority.praticaDiaria')}
        </p>
        <p className="text-[0.85rem] text-[#B8BFCE]">{authority.praticaDiaria}</p>
      </div>
    </section>
  );
}
