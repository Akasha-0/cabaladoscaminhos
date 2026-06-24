'use client';
import { Loader, Heart, ShieldAlert } from 'lucide-react';
import { ProfileCard } from './ConexaoComponents';
import { Stage } from '../ConexoesClient';

interface ConfirmStageProps {
  userProfile: { name: string; birthDate: string | null; birthTime: string | null; birthCity: string | null; };
  rawData: { name: string; birthDate: string; birthTime?: string; birthCity: string; };
  error: React.ReactNode | null;
  loading: boolean;
  onExecuteAnalysis: () => void;
  onSetStage: (stage: Stage) => void;
}

export function ConfirmStage({
  userProfile,
  rawData,
  error,
  loading,
  onExecuteAnalysis,
  onSetStage,
}: ConfirmStageProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#6350E0]/30 bg-[#6350E0]/10 p-4 text-center">
        <p className="text-xs text-[#6350E0]/70 mb-1">Revise os dados antes de analisar</p>
        <p className="text-sm text-white/60">Confirme que estão corretos para continuar</p>
      </div>

      <div className="space-y-3">
        <ProfileCard
          label="Seu perfil"
          name={userProfile.name}
          birthDate={userProfile.birthDate ?? ''}
          birthTime={userProfile.birthTime}
          birthCity={userProfile.birthCity ?? ''}
          editable
          onEdit={() => onSetStage('selection')}
        />

        <div className="flex justify-center">
          <div className="text-white/30 text-xl" aria-hidden="true">
            ✦
          </div>
        </div>

        <ProfileCard
          label="Pessoa analisada"
          name={rawData.name}
          birthDate={rawData.birthDate}
          birthTime={rawData.birthTime}
          birthCity={rawData.birthCity}
          editable
          onEdit={() => onSetStage('selection')}
        />
      </div>

      {error && <div className="text-sm text-[#f87171]">{error}</div>}

      {/*
        Disclaimer LGPD Art. 37 — tratamento de dados de terceiros.

        Ao adicionar uma Conexão, o usuário declara ter consentimento da
        outra pessoa para que dados de mapa astrológico/cabalístico
        sejam armazenados e processados. Akasha NÃO verifica esse
        consentimento — é responsabilidade do titular (usuário que
        adicionou) obter autorização prévia da pessoa analisada.

        Este aviso é obrigatório por design (LGPD Art. 37 + boas
        práticas de privacy by design) e fica imediatamente antes
        do botão de confirmação, garantindo leitura antes da ação.
      */}
      <div
        role="note"
        aria-label="Aviso de consentimento de terceiros"
        className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 flex gap-3 items-start"
      >
        <ShieldAlert
          size={18}
          className="text-amber-400 flex-shrink-0 mt-0.5"
          aria-hidden="true"
        />
        <p className="text-xs text-amber-200/90 leading-relaxed italic">
          Ao adicionar esta conexão, você declara ter consentimento da
          outra pessoa para compartilhar dados do mapa astrológico com
          ela. Akasha não verifica este consentimento. (LGPD Art. 37)
        </p>
      </div>

      <button
        onClick={onExecuteAnalysis}
        disabled={loading}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#6350E0] to-[#2DD4BF] font-bold text-white disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader size={18} className="animate-spin" /> Analisando…
          </>
        ) : (
          <>
            <Heart size={16} /> Confirmar e Analisar
          </>
        )}
      </button>

      <button
        onClick={() => onSetStage('selection')}
        className="w-full py-3 rounded-xl border border-white/10 text-sm text-white/60 hover:bg-white/10 transition-colors"
      >
        Voltar e editar
      </button>
    </div>
  );
}
