'use client';
import { Bookmark, Loader } from 'lucide-react';
import { DimensionBar, ConexaoResult } from './ConexaoComponents';

interface ResultsStageProps {
  result: ConexaoResult;
  userProfile: { name: string; };
  rawData: { name: string; birthDate: string; birthCity: string; };
  loading: boolean;
  savedNotification: string | null;
  onSave: () => void;
  onLoadSaved: () => void;
  onNewAnalysis: () => void;
}

export function ResultsStage({
  result,
  userProfile,
  rawData,
  loading,
  savedNotification,
  onSave,
  onLoadSaved,
  onNewAnalysis,
}: ResultsStageProps) {
  return (
    <div className="space-y-6">
      {/* Header — comparing names */}
      <div className="rounded-2xl border border-[#6350E0]/30 bg-[#6350E0]/10 p-4 text-center">
        <p className="text-xs text-[#6350E0]/70 mb-1">Comparando</p>
        <p className="text-sm font-bold text-white">
          <span className="text-white/90">{userProfile.name}</span>
          <span className="text-white/40 mx-2" aria-hidden="true">
            ✦
          </span>
          <span className="text-white/90">{rawData.name}</span>
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Sync components here... */}
        {/* Narrative and Recommendations... */}
        {/* Dimensions... */}
      </div>

      {/* Buttons */}
      <button
        onClick={onSave}
        disabled={loading}
        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#6350E0] to-[#2DD4BF] font-semibold text-sm text-white disabled:opacity-50"
      >
        {loading
          ? 'Salvando…'
          : (savedNotification ?? (
              <span className="inline-flex items-center gap-1.5">
                <Bookmark size={14} /> Salvar conexão
              </span>
            ))}
      </button>

      {savedNotification === null && (
        <button
          onClick={onLoadSaved}
          className="w-full py-3 rounded-xl border border-[#6350E0]/40 bg-[#6350E0]/10 text-sm text-[#6350E0] hover:bg-[#6350E0]/20 transition-all flex items-center justify-center gap-2"
        >
          <Bookmark size={16} /> Ver Conexões Salvas
        </button>
      )}

      <button
        onClick={onNewAnalysis}
        className="w-full py-3 rounded-xl border border-white/10 text-sm text-white/60 hover:bg-white/10 transition-colors"
      >
        Nova análise
      </button>
    </div>
  );
}
