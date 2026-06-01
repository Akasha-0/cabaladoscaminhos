'use client';

import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertTriangle, Compass, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTodayCorrelation } from '@/lib/correlation/useTodayCorrelation';
import { oduData, OduInfo } from '@/lib/ifa/odu-data';

interface DailyOrientationsProps {
  odu: string;
  caminhoDeVida: number;
  signo: string;
  className?: string;
}

/**
 * Obtém preceitos e quizilas do Odu
 */
function getOduOrientations(oduNome: string): { fazer: string[]; evitar: string[]; orixas: string[] } {
  const odu = oduData.find(
    o => o.nome.toLowerCase() === oduNome.toLowerCase()
  );
  
  if (!odu) {
    return {
      fazer: ['Manter práticas espirituais', 'Ser grato pelo dia'],
      evitar: ['Ações impulsivas', 'Negatividade'],
      orixas: ['Oxalá']
    };
  }
  
  return {
    fazer: odu.preceitos.split(';').map(p => p.trim()).filter(Boolean),
    evitar: odu.quizilas,
    orixas: odu.orixas
  };
}

/**
 * Orientações baseadas no caminho de vida
 */
function getCaminhoOrientations(caminho: number): { fazer: string[]; evitar: string[] } {
  const orientations: Record<number, { fazer: string[]; evitar: string[] }> = {
    1: {
      fazer: ['Iniciar novos projetos', 'Tomar iniciativa', 'Ser independente'],
      evitar: ['Depender demais dos outros', 'Impor sua vontade']
    },
    2: {
      fazer: ['Buscar parcerias', 'Cooperar com outros', 'Desenvolver empatia'],
      evitar: ['Isolar-se', 'Ser excessivamente dependente']
    },
    3: {
      fazer: ['Expressar sua criatividade', 'Comunicar-se abertamente', 'Celebrar a vida'],
      evitar: ['Reprimir sua expressão', 'Ser superficial']
    },
    4: {
      fazer: ['Trabalhar com constância', 'Organizar seu espaço', 'Ser disciplinado'],
      evitar: ['Procrastinar', 'Ser excessivamente rígido']
    },
    5: {
      fazer: ['Abrir-se para mudanças', 'Explorar novas ideias', 'Ser flexível'],
      evitar: ['Resistir a mudanças', 'Ficar preso na rotina']
    },
    6: {
      fazer: ['Cuidar dos relacionamentos', 'Servir à família', 'Criar harmonia'],
      evitar: ['Negligenciar o lar', 'Carregar responsabilidades em excesso']
    },
    7: {
      fazer: ['Buscar conhecimento profundo', 'Meditar', 'Refletir sobre sua vida'],
      evitar: ['Superficialidade', 'Dispersar a atenção']
    },
    8: {
      fazer: ['Assertividade nas ações', 'Organizar finanças', 'Ser-determined'],
      evitar: ['Medo de sukses', 'Abusar do poder']
    },
    9: {
      fazer: ['Servir à humanidade', 'Perdoar o passado', 'Aceitar mudanças'],
      evitar: ['Aguardar nos erros', 'Guardar ressentimentos']
    },
    11: {
      fazer: ['Confiar na intuição', 'Inspirar outros', 'Buscar a espiritualidade'],
      evitar: ['Ignorar visões', 'Duvidar de si']
    },
    22: {
      fazer: ['Manifestar grandes projetos', 'Construir com propósito', 'Liderar com visão'],
      evitar: ['Síndrome do impostor', 'Subestimar-se']
    },
    33: {
      fazer: ['Servir com amor', 'Ensinar pelo exemplo', 'Cultivar a compaixão'],
      evitar: ['Egoísmo', 'Indiferença ao próximo']
    }
  };
  
  return orientations[caminho] || orientations[1];
}

/**
 * Orientações do dia baseadas na correlação
 */
function getDayOrientations(correlation: ReturnType<typeof useTodayCorrelation>) {
  const { elemento, planeta, chakra } = correlation;
  
  return {
    fazer: [
      `Ativar o ${chakra}`,
      `Conectar-se com a energia de ${planeta}`,
      `Trabalhar aspectos de ${elemento}`
    ],
    evitar: [
      `Resistir à energia de ${elemento}`,
      `Forçar situações contrárias ao dia`,
      `Ignorar os sinais do universo`
    ]
  };
}

export function DailyOrientations({ 
  odu, 
  caminhoDeVida, 
  signo,
  className = '' 
}: DailyOrientationsProps) {
  const correlation = useTodayCorrelation();
  
  const oduOrientations = useMemo(() => getOduOrientations(odu), [odu]);
  const caminhoOrientations = useMemo(() => getCaminhoOrientations(caminhoDeVida), [caminhoDeVida]);
  const dayOrientations = useMemo(() => getDayOrientations(correlation), [correlation]);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Orixás do Dia */}
      <Card className="p-4 bg-gradient-to-br from-emerald-900/20 to-slate-900 border-emerald-500/20">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <Target className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Orixás em Foco Hoje</h4>
            <p className="text-xs text-slate-500">{correlation.orixa}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {correlation.orixas.map((orixa) => (
            <Badge 
              key={orixa}
              className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
            >
              {orixa}
            </Badge>
          ))}
        </div>
      </Card>

      {/* O que Fazer */}
      <Card className="p-4 bg-slate-900/80 border-slate-700/50">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <h4 className="text-sm font-semibold text-white uppercase tracking-wide">
            O que Fazer Hoje
          </h4>
        </div>
        
        <div className="space-y-3">
          {/* Do Odu */}
          <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
            <p className="text-xs text-emerald-400 font-medium mb-2">Baseado no seu Odu ({odu})</p>
            <ul className="space-y-1.5">
              {oduOrientations.fazer.slice(0, 2).map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Do Caminho de Vida */}
          <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
            <p className="text-xs text-amber-400 font-medium mb-2">Baseado no seu Caminho de Vida ({caminhoDeVida})</p>
            <ul className="space-y-1.5">
              {caminhoOrientations.fazer.slice(0, 2).map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Do Dia */}
          <div className="p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/20">
            <p className="text-xs text-cyan-400 font-medium mb-2">Energia do dia</p>
            <ul className="space-y-1.5">
              {dayOrientations.fazer.slice(0, 1).map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      {/* O que Evitar */}
      <Card className="p-4 bg-slate-900/80 border-slate-700/50">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <h4 className="text-sm font-semibold text-white uppercase tracking-wide">
            O que Evitar Hoje
          </h4>
        </div>
        
        <div className="space-y-3">
          {/* Do Odu */}
          <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
            <p className="text-xs text-amber-400 font-medium mb-2">Quizilas do seu Odu</p>
            <ul className="space-y-1.5">
              {oduOrientations.evitar.slice(0, 2).map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Do Caminho */}
          <div className="p-3 rounded-lg bg-orange-500/5 border border-orange-500/20">
            <p className="text-xs text-orange-400 font-medium mb-2">Caminho de Vida</p>
            <ul className="space-y-1.5">
              {caminhoOrientations.evitar.slice(0, 1).map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <AlertTriangle className="w-3.5 h-3.5 text-orange-400 mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      {/* Preceito do Dia */}
      <Card className="p-4 bg-gradient-to-br from-violet-900/20 to-slate-900 border-violet-500/20">
        <div className="flex items-center gap-2 mb-3">
          <Compass className="w-4 h-4 text-violet-400" />
          <h4 className="text-sm font-semibold text-white">Preceito do Odu para Hoje</h4>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed italic">
          &ldquo;{oduOrientations.fazer[0] || 'Manter a paz interior e a gratidão pelo dia presente.'}&rdquo;
        </p>
        <div className="flex flex-wrap gap-2 mt-3">
          {oduOrientations.orixas.map((orixa) => (
            <Badge 
              key={orixa}
              variant="outline"
              className="bg-violet-500/10 text-violet-300 border-violet-500/30 text-xs"
            >
              {orixa}
            </Badge>
          ))}
        </div>
      </Card>
    </div>
  );
}
