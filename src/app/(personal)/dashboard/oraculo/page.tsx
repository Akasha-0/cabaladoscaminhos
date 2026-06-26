'use client';

import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const AIOracleChat = dynamic(
  () => import('@/components/dashboard/AIOracleChat').then(m => ({ default: m.AIOracleChat })),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-slate-800/50 p-8 animate-pulse">
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-slate-800 animate-pulse" />
            <p className="text-slate-400">Carregando Oráculo...</p>
          </div>
        </div>
      </div>
    )
  }
);

export default function OraclePage() {
  const userData = {
    id: 'oracle-visitor',
    nome: 'Visitante',
    dataNascimento: '',
    numeroPessoal: 1,
    orixaRegente: 'Oxalá',
    odu: 'Alafia',
    arcanoPessoal: 1,
    sefirotDominante: ['Kether'],
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-4 text-slate-400 hover:text-white -ml-2">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Dashboard
            </Button>
          </Link>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-violet-400" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-cinzel font-bold bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Oráculo IA
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Consulta personalizada com inteligência artificial espiritual
              </p>
            </div>
          </div>
        </div>

        {/* Oracle Chat */}
        <AIOracleChat userData={userData} />
      </div>
    </DashboardLayout>
  );
}