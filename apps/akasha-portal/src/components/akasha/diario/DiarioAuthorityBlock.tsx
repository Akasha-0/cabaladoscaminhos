'use client';

/**
 * DiarioAuthorityBlock — SPEC §3.4
 * Embeds AkashaAuthorityPrompt in compact mode for the diario scroll.
 * diario is read-only; onDecide is a no-op.
 */
import type { PilaresDados } from '@/lib/grimoire/significados-curados';
import type { EstadoAkasha } from '@/lib/grimoire/akasha-authority';
import { AkashaAuthorityPrompt } from '@/components/akasha/AkashaAuthorityPrompt/AkashaAuthorityPrompt';

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
}

export function DiarioAuthorityBlock({ authority, pilares }: DiarioAuthorityBlockProps) {
  function noop(_estado: EstadoAkasha, _acao: 'aja' | 'espere' | 'observe'): void {
    // diario is read-only
  }

  const sectionCard =
    'bg-[rgba(11,14,28,0.72)] backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-4';

  return (
    <section aria-label="Autoridade Akáshica" className={sectionCard}>
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-[1.15rem] font-cinzel text-[#F4F5FF]">Sua Autoridade</h2>
        <span
          className="text-[0.65rem] px-2 py-0.5 rounded-full"
          style={{
            background: '#7C5CFF1A',
            border: '1px solid #7C5CFF55',
            color: '#7C5CFF',
            letterSpacing: '0.1em',
          }}
        >
          {authority.autoridade}
        </span>
      </div>

      <AkashaAuthorityPrompt
        authority={authority}
        pilares={pilares}
        onDecide={noop}
        compact={true}
      />

      <div className="mt-4 px-1">
        <p className="text-[0.72rem] text-[#5C6691] leading-relaxed">{authority.explicacao}</p>
      </div>

      <div
        className="rounded-2xl p-4 mt-3"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <p className="text-[0.65rem] font-cinzel tracking-[0.15em] uppercase text-[#5C6691] mb-1">
          Regra de hoje
        </p>
        <p className="text-[0.85rem] text-[#A7AECF]">
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
          <p className="text-[0.6rem] text-[#2DD4BF] tracking-wide uppercase mb-0.5">Melhor janela</p>
          <p className="text-[0.8rem] text-[#A7AECF]">{authority.timing.melhor}</p>
        </div>
        <div
          className="rounded-xl p-3"
          style={{ background: 'rgba(251,87,129,0.06)', border: '1px solid rgba(251,87,129,0.2)' }}
        >
          <p className="text-[0.6rem] text-[#FB5781] tracking-wide uppercase mb-0.5">Evite</p>
          <p className="text-[0.8rem] text-[#A7AECF]">{authority.timing.pior}</p>
        </div>
      </div>

      <div
        className="rounded-2xl p-4 mt-3"
        style={{ background: 'rgba(124,92,255,0.08)', border: '1px solid rgba(124,92,255,0.2)' }}
      >
        <p className="text-[0.65rem] font-cinzel tracking-[0.15em] uppercase text-[#7C5CFF] mb-1">
          Prática do dia
        </p>
        <p className="text-[0.85rem] text-[#A7AECF]">{authority.praticaDiaria}</p>
      </div>
    </section>
  );
}
