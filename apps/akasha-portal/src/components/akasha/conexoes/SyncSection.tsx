'use client';
import { BodySync, OduSync } from './ConexaoComponents';

export function SyncSection({ bodySync, oduSync }: { bodySync: BodySync, oduSync: OduSync }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div
        role="region"
        aria-label="Síncronia Corporal"
        className="rounded-2xl border border-white/10 bg-white/5 p-4"
      >
        <h3 className="text-xs text-white/50 mb-1">Síncronia Corporal</h3>
        <p className="text-lg font-black text-[#2DD4BF]">{bodySync.score}%</p>
        <p className="text-xs text-white/60 mt-1">{bodySync.description}</p>
      </div>
      <div
        role="region"
        aria-label="Síncronia Odu"
        className="rounded-2xl border border-white/10 bg-white/5 p-4"
      >
        <h3 className="text-xs text-white/50 mb-1">Síncronia Odu</h3>
        <p className="text-lg font-black text-[#a78bfa]">{oduSync.score}%</p>
        <p className="text-xs text-white/60 mt-1">{oduSync.description}</p>
      </div>
    </div>
  );
}
