'use client';

import type { ConexaoResult } from '../ConexoesClient';

interface Props {
  result: ConexaoResult;
}

export function ConexaoScores({ result }: Props) {
  return (
    <>
      {/* Scores */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl border border-[#f87171]/30 bg-[#f87171]/5 p-5 text-center">
          <p className="text-xs text-white/50 mb-1">Conexão Amorosa</p>
          <p className="text-4xl font-black text-[#f87171]">{result.romantic}%</p>
          <p className="text-xs text-white/50 mt-1 italic">
            Afetividade, intimidade e vulnerabilidade compartilhadas
          </p>
          <p
            className={`text-xs font-semibold mt-1 ${
              result.romantic >= 71
                ? 'text-[#34d399]'
                : result.romantic >= 41
                  ? 'text-[#fbbf24]'
                  : 'text-[#f87171]'
            }`}
          >
            {result.romantic >= 71
              ? '71–100: Forte'
              : result.romantic >= 41
                ? '41–70: Oscilante'
                : '0–40: Desafio'}
          </p>
        </div>

        <div className="rounded-2xl border border-[#fbbf24]/30 bg-[#fbbf24]/5 p-5 text-center">
          <p className="text-xs text-white/50 mb-1">Conexão Parceria</p>
          <p className="text-4xl font-black text-[#fbbf24]">{result.partnership}%</p>
          <p className="text-xs text-white/50 mt-1 italic">
            Propósito, visão e ação conjunta no mundo
          </p>
          <p
            className={`text-xs font-semibold mt-1 ${
              result.partnership >= 71
                ? 'text-[#34d399]'
                : result.partnership >= 41
                  ? 'text-[#fbbf24]'
                  : 'text-[#f87171]'
            }`}
          >
            {result.partnership >= 71
              ? '71–100: Forte'
              : result.partnership >= 41
                ? '41–70: Oscilante'
                : '0–40: Desafio'}
          </p>
        </div>
      </div>

      {/* Score scale legend */}
      <div className="flex flex-wrap justify-center gap-4 text-xs text-white/40">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-[#f87171]" />
          0–40: Desafio
        </span>
        <span className="text-white/20" aria-hidden="true">
          •
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-[#fbbf24]" />
          41–70: Oscilante
        </span>
        <span className="text-white/20" aria-hidden="true">
          •
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-[#34d399]" />
          71–100: Forte
        </span>
      </div>
    </>
  );
}
