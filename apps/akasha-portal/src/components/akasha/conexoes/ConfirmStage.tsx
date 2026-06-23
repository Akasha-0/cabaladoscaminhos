'use client';
import { Loader, Heart } from 'lucide-react';
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
