'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import {
  Skull,
  AlertTriangle,
  Heart,
  Flame,
  Sparkles,
} from 'lucide-react';

// ============================================================
// TYPES
// ============================================================

export interface OduCardProps {
  odu: {
    nome: string;
    numero: number;
    orixas: string[];
    quizilas: string[];
    preceitos: string;
    ebó?: string;
  };
  className?: string;
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

interface OrixaBadgeProps {
  name: string;
}

function OrixaBadge({ name }: OrixaBadgeProps) {
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">
      <Sparkles className="w-3 h-3 mr-1.5" />
      {name}
    </span>
  );
}

interface QuizilaItemProps {
  text: string;
}

function QuizilaItem({ text }: QuizilaItemProps) {
  return (
    <li className="flex items-start gap-2 p-2 rounded-lg bg-red-950/40 border border-red-800/50">
      <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
      <span className="text-red-200 text-sm">{text}</span>
    </li>
  );
}

interface PreceitoItemProps {
  text: string;
}

function PreceitoItem({ text }: PreceitoItemProps) {
  return (
    <div className="flex items-start gap-2 p-2 rounded-lg bg-emerald-950/40 border border-emerald-800/50">
      <Heart className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
      <span className="text-emerald-200 text-sm">{text}</span>
    </div>
  );
}

interface EbóSectionProps {
  ebó: string;
}

function EbóSection({ ebó }: EbóSectionProps) {
  return (
    <div className="flex items-start gap-2 p-3 rounded-lg bg-purple-950/40 border border-purple-800/50">
      <Flame className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
      <div>
        <span className="text-purple-300 text-xs font-semibold uppercase tracking-wide">Ebó</span>
        <p className="text-purple-200 text-sm mt-0.5">{ebó}</p>
      </div>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function OduCard({ odu, className = '' }: OduCardProps) {
  const { nome, numero, orixas, quizilas, preceitos, ebó } = odu;

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-slate-700/50',
        'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900',
        'shadow-xl shadow-black/50',
        className
      )}
    >
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-amber-500/5 pointer-events-none" />

      {/* Header */}
      <div className="relative p-6 border-b border-slate-700/50">
        <div className="flex items-center gap-4">
          {/* Odu Icon */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30">
            <Skull className="w-8 h-8 text-amber-400" />
          </div>

          {/* Odu Name & Number */}
          <div>
            <h2 className="text-2xl font-bold text-amber-400">{nome}</h2>
            <p className="text-slate-400 text-sm">
              Odú #{numero.toString().padStart(2, '0')}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-5">
        {/* Orixás */}
        {orixas.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Orixás Associados
            </h3>
            <div className="flex flex-wrap gap-2">
              {orixas.map((orixa) => (
                <OrixaBadge key={orixa} name={orixa} />
              ))}
            </div>
          </div>
        )}

        {/* Quizilas - Warning Section */}
        {quizilas.length > 0 && (
          <div>
            <h3 className="flex items-center gap-2 text-xs font-semibold text-red-400 uppercase tracking-wider mb-3">
              <AlertTriangle className="w-3.5 h-3.5" />
              Quizilas
            </h3>
            <ul className="space-y-2">
              {quizilas.map((quizila, index) => (
                <QuizilaItem key={index} text={quizila} />
              ))}
            </ul>
          </div>
        )}

        {/* Preceitos - Positive Section */}
        <div>
          <h3 className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-3">
            <Heart className="w-3.5 h-3.5" />
            Preceitos
          </h3>
          <PreceitoItem text={preceitos} />
        </div>

        {/* Ebó - Optional Section */}
        {ebó && <EbóSection ebó={ebó} />}
      </div>
    </div>
  );
}

export default OduCard;
