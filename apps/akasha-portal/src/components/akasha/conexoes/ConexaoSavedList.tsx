'use client';

import { useState } from 'react';
import { Heart, X } from 'lucide-react';
import type { SavedConnection } from '../ConexoesClient';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const DOMINANT_LABELS: Record<string, string> = {
  romantic: 'Amorosa',
  partnership: 'Parceria',
  both: 'Ambos',
  challenging: 'Desafiadora',
};

const AUTHORITY_LABELS: Record<string, string> = {
  aligned: 'Alinhada',
  complementary: 'Complementar',
  conflict: 'Em Conflito',
};

interface Props {
  savedConnections: SavedConnection[];
  deletingId: string | null;
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
  onBack: () => void;
}

export function ConexaoSavedList({
  savedConnections,
  deletingId,
  onDelete,
  onSelect,
  onBack,
}: Props) {
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const pendingConnection = pendingDeleteId
    ? savedConnections.find((c) => c.id === pendingDeleteId)
    : null;

  function handleDeleteClick(id: string) {
    setPendingDeleteId(id);
    setDeleteError(null);
  }

  function handleConfirmDelete() {
    if (!pendingDeleteId) return;
    setDeleteError(null);
    onDelete(pendingDeleteId);
    setPendingDeleteId(null);
  }

  function handleDialogClose() {
    setPendingDeleteId(null);
    setDeleteError(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white/80">Conexões Salvas</h2>
        <button
          onClick={onBack}
          className="text-sm text-[#6350E0] hover:underline"
        >
          + Nova análise
        </button>
      </div>

      {/* Dominant type legend */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-3">
        <p className="text-xs text-white/70 mb-2 uppercase tracking-wider">
          Tipo dominante: significado
        </p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-white/80">
          <span>
            <span className="text-[#f87171]">Amorosa</span> —afetividade em primeiro plano
          </span>
          <span>
            <span className="text-[#fbbf24]">Parceria</span> —propósito compartilhado
          </span>
          <span>
            <span className="text-[#c084fc]">Desafiadora</span> —contraste como motor
          </span>
          <span>
            <span className="text-[#6350E0]">Ambos</span> —equilíbrio entre ambos
          </span>
        </div>
      </div>

      {savedConnections.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
          <Heart size={32} className="text-white/20 mx-auto mb-3" />
          <p className="text-sm text-white/50">Nenhuma conexão salva ainda.</p>
          <p className="text-xs text-white/60 mt-1">Faça uma análise e ela aparecerá aqui.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {savedConnections.map((conn) => (
            <div
              key={conn.id}
              className="relative rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2"
            >
              <button
                onClick={() => handleDeleteClick(conn.id)}
                disabled={deletingId === conn.id}
                className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-white/10 text-white/30 hover:text-white/60 transition-colors disabled:opacity-50"
                aria-label={`Remover conexão com ${conn.otherName}`}
              >
                {deletingId === conn.id ? (
                  <div
                    aria-label="Removendo…"
                    className="w-4 h-4 border border-white/30 border-t-white/60 rounded-full animate-spin"
                  />
                ) : (
                  <X size={14} aria-hidden="true" />
                )}
              </button>

              <div className="flex items-center justify-between">
                <p
                  title={conn.otherName}
                  className="font-bold text-white truncate max-w-[60%]"
                >
                  {conn.otherName}
                </p>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    conn.dominantType === 'romantic'
                      ? 'bg-[#f87171]/20 text-[#f87171]'
                      : conn.dominantType === 'partnership'
                        ? 'bg-[#fbbf24]/20 text-[#fbbf24]'
                        : conn.dominantType === 'challenging'
                          ? 'bg-[#c084fc]/20 text-[#c084fc]'
                          : 'bg-[#6350E0]/20 text-[#6350E0]'
                  }`}
                >
                  {DOMINANT_LABELS[conn.dominantType]}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-[#f87171]/5 border border-[#f87171]/20 p-2 text-center">
                  <p className="text-xs text-white/40">Amorosa</p>
                  <p className="text-lg font-black text-[#f87171]">{conn.romanticScore}%</p>
                </div>
                <div className="rounded-xl bg-[#fbbf24]/5 border border-[#fbbf24]/20 p-2 text-center">
                  <p className="text-xs text-white/40">Parceria</p>
                  <p className="text-lg font-black text-[#fbbf24]">{conn.partnershipScore}%</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-white/30">
                <span>{AUTHORITY_LABELS[conn.authorityMatch]}</span>
                <span>{new Date(conn.createdAt).toLocaleDateString('pt-BR')}</span>
              </div>

              <button
                onClick={() => onSelect(conn.id)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#6350E0] to-[#2DD4BF] font-bold text-white text-sm flex items-center justify-center gap-2 mt-1"
              >
                <Heart size={14} />
                Ver análise completa
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={onBack}
        className="w-full py-3 rounded-xl border border-white/10 text-sm text-white/60 hover:bg-white/10 transition-colors"
      >
        Voltar
      </button>

      {/* Delete confirmation dialog */}
      <Dialog open={pendingDeleteId !== null} onOpenChange={(open) => !open && handleDialogClose()}>
        <DialogContent
          className="bg-[#0B0E1C] border border-white/10 rounded-2xl"
          showCloseButton={false}
        >
          <DialogHeader>
            <DialogTitle className="text-white font-bold text-base">
              Remover conexão?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-white/70">
            A análise com{' '}
            <span className="text-white font-semibold">
              {pendingConnection?.otherName ?? ''}
            </span>{' '}
            será removida permanentemente. Esta ação não pode ser desfeita.
          </p>
          {deleteError && (
            <p className="text-sm text-[#f87171]" role="alert">
              {deleteError}
            </p>
          )}
          <div className="flex gap-3 pt-2">
            <Button
              variant="ghost"
              onClick={handleDialogClose}
              className="flex-1 text-white/70 hover:text-white hover:bg-white/10"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmDelete}
              className="flex-1 bg-[#f87171] hover:bg-[#f87171]/80 text-white font-semibold"
            >
              Remover
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
