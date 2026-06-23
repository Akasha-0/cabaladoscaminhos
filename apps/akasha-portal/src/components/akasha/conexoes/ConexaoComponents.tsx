export interface NarrativeBlock {
  topic: string;
  label: string;
  text: string;
}

export interface ConexaoResult {
  romantic: number;
  partnership: number;
  dominantType: 'romantic' | 'partnership' | 'both' | 'challenging';
  authorityMatch: 'aligned' | 'complementary' | 'conflict';
  dimensions: ConnectionDimension[];
  oduSync: OduSync;
  bodySync: BodySync;
  narrative: NarrativeBlock[];
  recommendations: string[];
}

export interface OduSync {
  score: number;
  sharedOdu: boolean;
  complementaryOdu: boolean;
  description: string;
}

export interface BodySync {
  score: number;
  description: string;
}


export interface ConnectionDimension {
  dimension: string;
  score: number;
  description: string;
  tip: string;
}

export interface ProfileCardProps {
  label: string;
  name: string;
  birthDate: string;
  birthTime?: string | null;
  birthCity: string;
  editable?: boolean;
  onEdit?: () => void;
}

import { Edit3 } from 'lucide-react';

export function DimensionBar({ dimension }: { dimension: ConnectionDimension }) {
  const color = dimension.score >= 75 ? '#34d399' : dimension.score >= 50 ? '#fbbf24' : '#f87171';
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-white/80">{dimension.dimension}</span>
        <span className="font-bold" style={{ color }}>
          {dimension.score}%
        </span>
      </div>
      <div className="h-2 rounded-full bg-white/10">
        <div
          className="h-2 rounded-full transition-all duration-700"
          style={{ width: `${dimension.score}%`, backgroundColor: color }}
        />
      </div>
      <p className="text-xs text-white/50">{dimension.description}</p>
    </div>
  );
}

export function ProfileCard({
  label,
  name,
  birthDate,
  birthTime,
  birthCity,
  editable,
  onEdit,
}: ProfileCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2 relative">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-bold text-white/80 uppercase tracking-wider">{label}</span>
        {editable && onEdit && (
          <button
            onClick={onEdit}
            className="text-xs text-[#6350E0] hover:text-[#9d7fff] flex items-center gap-1 transition-colors"
          >
            <Edit3 size={11} /> Editar
          </button>
        )}
      </div>
      <p className="font-bold text-white text-sm">{name}</p>
      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-white/50">
        {birthDate && <span>{birthDate}</span>}
        {birthTime && <span>{birthTime}</span>}
        {birthCity && <span>{birthCity}</span>}
      </div>
    </div>
  );
}
