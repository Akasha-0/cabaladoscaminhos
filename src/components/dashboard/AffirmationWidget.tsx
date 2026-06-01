'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Share2, Heart, Copy, Check, RefreshCw, Quote } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================
// TYPES
// ============================================================

interface AffirmationWidgetProps {
  userData?: {
    orixaRegente?: string;
    nome?: string;
  };
  className?: string;
}

// ============================================================
// CONSTANTS
// ============================================================

const DAILY_AFFIRMATIONS = [
  'Eu declaro que hoje é um dia de alinhamento espiritual e paz interior.',
  'Eu sou luz, amor e harmonia. O universo conspira a meu favor.',
  'Cada respiração é uma nova chance de recomeçar com gratidão.',
  'Minha energia atrai abundância, saúde e felicidade.',
  'O sagrado habita em mim. Eu honro a divindade em cada momento.',
  'Eu sou merecedor de todas as bênçãos que o universo oferece.',
  'Com mente clara e coração aberto, eu crio meu destino.',
  'A sabedoria dos meus ancestrais guia meus passos.',
];

const ORIXAS_AFFIRMATIONS: Record<string, string[]> = {
  'Oxalá': ['Eu sou luz, paz e harmonia. A branca luz me envolve.', 'Minha alma é pura como a luz do amanhecer.', 'Paz flui através de mim em todos os momentos.'],
  'Oxum': ['Eu sou digno de amor e prosperidade.', 'As águas doces purificam meu ser e trazem abundância.', 'Meu coração é fértil como a terra regada.'],
  'Iansã': ['Eu sou forte e corajoso. O vento varre tudo que me prende.', 'Minha energia é poderosa e transformadora.', 'Eu danço com as tempestades com força interior.'],
  'Xangô': ['Eu falo com sabedoria e justiça.', 'O fogo de Xangô purifica meu caminho.', 'Sou firme como o raio em minhas ações.'],
  'Ogum': ['Eu abro caminhos com força e habilidade.', 'Cada obstáculo é um novo território a conquistar.', 'Com Ogum, sou invencível em minha jornada.'],
  'Oxóssi': ['Eu caço a abundância com sabedoria.', 'A floresta da vida revela seus segredos para mim.', 'Conhecimento é minha presa mais valiosa.'],
  'Iemanjá': ['Sou abraçado pela energia maternal de Iemanjá.', 'Como as ondas do mar, fluo com graça.', 'Minha intuição é profunda como o oceano.'],
  'Omolu': ['Eu transcedo meus medos com coragem.', 'Omolu me cura de todas as feridas.', 'A transformação acontece em mim a cada dia.'],
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getDailyAffirmation(orixaName?: string): string {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);

  // Get orixa-specific or fallback
  let affirmations: string[];
  if (orixaName && ORIXAS_AFFIRMATIONS[orixaName]) {
    affirmations = ORIXAS_AFFIRMATIONS[orixaName];
  } else {
    affirmations = DAILY_AFFIRMATIONS;
  }

  return affirmations[dayOfYear % affirmations.length];
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function AffirmationWidget({ userData, className = '' }: AffirmationWidgetProps) {
  const [copied, setCopied] = React.useState(false);
  const affirmation = React.useMemo(() => getDailyAffirmation(userData?.orixaRegente), [userData?.orixaRegente]);
  const today = new Date();
  const dateStr = today.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(affirmation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard not available
    }
  };

  return (
    <Card className={cn(
      'card-spiritual bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-sm border-slate-800/50 overflow-hidden',
      className
    )}>
      <CardHeader className="pb-3 border-b border-slate-800/50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-pink-500/10 to-violet-500/10 border border-pink-500/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-pink-400" />
            </div>
            <span className="text-base font-semibold bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent">
              Afirmação Diária
            </span>
          </CardTitle>
          <span className="text-xs text-slate-400">{dateStr}</span>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Main affirmation card */}
        <div className="relative p-5 rounded-xl bg-gradient-to-br from-pink-500/10 to-violet-500/10 border border-pink-500/20 overflow-hidden">
          {/* Decorative quote */}
          <div className="absolute top-2 left-2 text-4xl text-pink-500/20 font-serif">&ldquo;</div>

          <div className="relative z-10">
            <p className="text-lg text-slate-200 leading-relaxed italic pl-6">
              {affirmation}
            </p>

            {/* Source */}
            <div className="flex items-center gap-2 mt-4 pl-6">
              <Heart className="w-4 h-4 text-pink-400" />
              <span className="text-sm text-pink-400/80">
                {userData?.orixaRegente || 'Caminho Interior'}
              </span>
              {userData?.nome && (
                <span className="text-slate-500">— {userData.nome}</span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/50 text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all border border-slate-700/30"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-emerald-400">Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span className="text-sm">Copiar</span>
              </>
            )}
          </button>

          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/50 text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all border border-slate-700/30">
            <Share2 className="w-4 h-4" />
            <span className="text-sm">Compartilhar</span>
          </button>
        </div>

        {/* Tips */}
        <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-700/30">
          <p className="text-xs text-slate-400 text-center">
            <span className="text-amber-400">💡</span> Repita esta afirmação 3 vezes ao amanhecer para máximo efeito
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default AffirmationWidget;
