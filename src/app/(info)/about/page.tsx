// ============================================================================
// ABOUT — Página institucional /manifesto
// ============================================================================
// Skeleton criado como parte do ciclo i18n W12. Esta página ainda não existia
// no projeto (verificado via readdir). Conteúdo é o texto-base do manifesto
// do Akasha + estrutura i18n completa (useT). Outros parágrafos podem ser
// adicionados depois sem reescrever este esqueleto.
// ============================================================================

import type { Metadata } from 'next';
import { Sparkles } from 'lucide-react';
import { AboutClient } from './AboutClient';

export const metadata: Metadata = {
  title: 'Sobre o Akasha | Cabala dos Caminhos',
  description:
    'Sistema pessoal do praticante para jogos de oráculo guiados pelas mãos de axé — leitura cruzada de Numerologia, Astrologia, Tantra e Odu.',
};

export default function AboutPage() {
  return (
    <main className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <header className="text-center space-y-3 pt-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-violet-500 shadow-lg shadow-amber-500/20">
            <Sparkles className="w-7 h-7 text-white" aria-hidden="true" />
          </div>
          <h1 className="text-3xl md:text-4xl font-cinzel bg-gradient-to-r from-amber-300 via-violet-300 to-pink-300 bg-clip-text text-transparent">
            Akasha
          </h1>
          <p className="text-slate-400 text-sm font-raleway">
            Cabala dos Caminhos — sistema pessoal do praticante
          </p>
        </header>

        <AboutClient />
      </div>
    </main>
  );
}
