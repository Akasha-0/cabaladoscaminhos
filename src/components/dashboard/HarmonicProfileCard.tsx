'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Star, Crown, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SIGNOS_DATA } from '@/lib/astrology/v2/astrology-v2-data';
import { oduData } from '@/lib/ifa/odu-data';

interface HarmonicProfileCardProps {
  caminhoDeVida: number;
  signo: string;
  signoElemento: string;
  odu: string;
  className?: string;
}

/**
 * Verifica se é número mestre
 */
function isNumeroMestre(num: number): boolean {
  return [11, 22, 33].includes(num);
}

/**
 * Obtém significado do número cabalístico
 */
function getCaminhoSignificado(num: number): { titulo: string; descricao: string } {
  const significados: Record<number, { titulo: string; descricao: string }> = {
    1: {
      titulo: 'Liderança & Iniciativa',
      descricao: 'Você nasce para iniciar caminhos. Sua energia traz novos começos e Independentidade.'
    },
    2: {
      titulo: 'Parceria & Intuição',
      descricao: 'Sua força está nas conexões. Trabalhar em conjunto amplify your power.'
    },
    3: {
      titulo: 'Criatividade & Expressão',
      descricao: 'Você irradia criatividade. Comunicação e arte são seus caminhos de alma.'
    },
    4: {
      titulo: 'Estrutura & Disciplina',
      descricao: 'Base sólida é seu dom. Trabalho constante constrói sua réalisation.'
    },
    5: {
      titulo: 'Liberdade & Mudança',
      descricao: 'Versatilidade define você. Mudanças trazem crescimento e experiências.'
    },
    6: {
      titulo: 'Harmonia & Amor',
      descricao: 'Seu propósito é criar equilíbrio. Família e responsabilidade são suas missões.'
    },
    7: {
      titulo: 'Sabedoria & Interiorização',
      descricao: 'Conhecimento profundo é seu caminho. Meditação e estudos revelam verdades.'
    },
    8: {
      titulo: 'Poder & Abundância',
      descricao: 'Capacidade de manifestar recursos. Assertividade traz realizações materiais.'
    },
    9: {
      titulo: 'Humanidade & Compaixão',
      descricao: 'Servir a humanidade é seu chamado. Liberação de padrões abre seu caminho.'
    },
    11: {
      titulo: 'Iluminação & Intuição Elevada',
      descricao: 'Vibração de mestre espiritual. Intuição poderosa e missão de inspirar outros.'
    },
    22: {
      titulo: 'Mestria & Manifestação',
      descricao: 'Capacidade de realizar o impossível. Transformar visão em realidade concreta.'
    },
    33: {
      titulo: 'Serviço Sacrificial & Amor Divino',
      descricao: 'Missão de amor incondicional. Ensinar pelo exemplo, guiar com compaixão.'
    },
  };
  return significados[num] || significados[1];
}

/**
 * Obtém dados do signo
 */
function getSignoData(signo: string) {
  const signoLower = signo.toLowerCase();
  return SIGNOS_DATA[signoLower] || SIGNOS_DATA['aries'];
}

/**
 * Obtém dados do Odu
 */
function getOduData(oduNome: string) {
  return oduData.find(o => o.nome.toLowerCase() === oduNome.toLowerCase());
}

/**
 * Componente Pill - mostra valor com ícone
 */
function PillarPill({ 
  icon, 
  label, 
  value, 
  detail,
  color,
  onClick 
}: { 
  icon: React.ReactNode;
  label: string;
  value: string | number;
  detail: string;
  color: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center p-4 rounded-2xl transition-all duration-300',
        'bg-gradient-to-br from-slate-900/90 to-slate-950/90',
        'border border-slate-800/50 hover:border-slate-700/80',
        'hover:scale-[1.02] active:scale-[0.98]',
        onClick && 'cursor-pointer'
      )}
    >
      <div 
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
        style={{ 
          backgroundColor: `${color}15`,
          border: `1px solid ${color}30`,
        }}
      >
        <div style={{ color }}>{icon}</div>
      </div>
      <span className="text-xs text-slate-500 uppercase tracking-wide mb-1">{label}</span>
      <span className="text-2xl font-bold mb-1" style={{ color }}>{value}</span>
      <span className="text-xs text-slate-400 text-center">{detail}</span>
    </button>
  );
}

/**
 * Modal de detalhes expandidos
 */
function DetailsModal({ 
  isOpen, 
  onClose, 
  children, 
  title 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  children: React.ReactNode;
  title: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <Card className="relative z-10 w-full max-w-md bg-slate-900 border-slate-700/50 p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        {children}
      </Card>
    </div>
  );
}

// fallow-ignore-next-line complexity
export function HarmonicProfileCard({ 
  caminhoDeVida, 
  signo, 
  signoElemento,
  odu,
  className = '' 
}: HarmonicProfileCardProps) {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  
  const signoData = getSignoData(signo);
  const oduInfo = getOduData(odu);
  const caminhoSignificado = getCaminhoSignificado(caminhoDeVida);
  const ehNumeroMestre = isNumeroMestre(caminhoDeVida);

  return (
    <>
      <Card className={cn(
        'p-6 bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800/50',
        className
      )}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-violet-500/20 border border-amber-500/30 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Seu Mapa Pessoal</h2>
            <p className="text-xs text-slate-500">3 pilares do seu autoconhecimento</p>
          </div>
        </div>

        {/* 3 Pilares */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {/* Pilar 1: Caminho de Vida */}
          <PillarPill
            icon={<Star className="w-5 h-5" />}
            label="Caminho de Vida"
            value={caminhoDeVida}
            detail={ehNumeroMestre ? 'Número Mestre' : 'Cabalístico'}
            color="#F59E0B"
            onClick={() => setActiveModal('caminho')}
          />

          {/* Pilar 2: Signo */}
          <PillarPill
            icon={<span className="text-lg">{signoData.simbolo}</span>}
            label="Signo"
            value={signoData.nome}
            detail={signoData.elemento}
            color={signoData.cor}
            onClick={() => setActiveModal('signo')}
          />

          {/* Pilar 3: Odu */}
          <PillarPill
            icon={<Crown className="w-5 h-5" />}
            label="Odu"
            value={odu}
            detail="Ifá"
            color="#22C55E"
            onClick={() => setActiveModal('odu')}
          />
        </div>

        {/* Correlações Brief */}
        <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/30">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-slate-300">Como eles se conectam</span>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            {signoData.elemento === 'Fogo' && caminhoDeVida <= 3 && (
              <>A energia de {signoData.nome} amplifica sua força interior. O {caminhoDeVida} traz clareza para sua missão de alma.</>
            )}
            {signoData.elemento === 'Água' && (
              <>A profundidade emocional de {signoData.nome} se alinha com sua busca espiritual. Intuição e sensibilidade são seus guias.</>
            )}
            {signoData.elemento === 'Terra' && (
              <>A estabilidade de {signoData.nome} sustenta seu caminho. Aterra-se para crescer com sabedoria.</>
            )}
            {signoData.elemento === 'Ar' && (
              <>A mente curiosa de {signoData.nome} busca conhecimento. Seu caminho pede comunicação e liberdade.</>
            )}
            {(signoData.elemento !== 'Fogo' && caminhoDeVida <= 3) && (
              <>Busque harmonizar sua energia interna com as forças externas para avançar em seu caminho.</>
            )}
          </p>
        </div>
      </Card>

      {/* Modal: Caminho de Vida */}
      <DetailsModal 
        isOpen={activeModal === 'caminho'} 
        onClose={() => setActiveModal(null)}
        title={`Caminho de Vida ${caminhoDeVida}`}
      >
        <div className="space-y-4">
          <div className="text-center p-6 rounded-xl bg-gradient-to-br from-amber-500/10 to-slate-900 border border-amber-500/20">
            <span className={cn(
              "text-5xl font-bold",
              ehNumeroMestre ? "text-amber-400" : "text-amber-500"
            )}>
              {caminhoDeVida}
            </span>
            {ehNumeroMestre && (
              <Badge className="mt-2 bg-amber-500/20 text-amber-400 border-amber-500/30">
                Número Mestre
              </Badge>
            )}
          </div>
          
          <div>
            <h4 className="text-sm text-slate-400 uppercase tracking-wide mb-1">Título</h4>
            <p className="text-lg font-semibold text-white">{caminhoSignificado.titulo}</p>
          </div>
          
          <div>
            <h4 className="text-sm text-slate-400 uppercase tracking-wide mb-1">O que isso significa</h4>
            <p className="text-slate-300 leading-relaxed">{caminhoSignificado.descricao}</p>
          </div>
          
          <div className="pt-4 border-t border-slate-700/50">
            <p className="text-sm text-slate-500 italic">
              O caminho de vida é calculado pela soma da data de nascimento reduzida a um único dígito.
              Números mestres (11, 22, 33) indicam missão espiritual elevada.
            </p>
          </div>
        </div>
      </DetailsModal>

      {/* Modal: Signo */}
      <DetailsModal 
        isOpen={activeModal === 'signo'} 
        onClose={() => setActiveModal(null)}
        title={signoData.nome}
      >
        <div className="space-y-4">
          <div className="text-center p-6 rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900 border border-slate-700/50">
            <span className="text-6xl" style={{ color: signoData.cor }}>{signoData.simbolo}</span>
            <p className="text-2xl font-bold mt-2" style={{ color: signoData.cor }}>{signoData.nome}</p>
            <p className="text-sm text-slate-400">{signoData.跨度}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-slate-800/50">
              <p className="text-xs text-slate-500 uppercase">Elemento</p>
              <p className="text-white font-medium">{signoData.elemento}</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-800/50">
              <p className="text-xs text-slate-500 uppercase">Qualidade</p>
              <p className="text-white font-medium">{signoData.qualidade}</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-800/50">
              <p className="text-xs text-slate-500 uppercase">Planeta</p>
              <p className="text-white font-medium">{signoData.regente}</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-800/50">
              <p className="text-xs text-slate-500 uppercase">Cor</p>
              <p className="text-white font-medium">{signoData.cor}</p>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm text-slate-400 uppercase tracking-wide mb-1">Palavras-chave</h4>
            <p className="text-slate-300">{signoData.戾}</p>
          </div>
        </div>
      </DetailsModal>

      {/* Modal: Odu */}
      <DetailsModal 
        isOpen={activeModal === 'odu'} 
        onClose={() => setActiveModal(null)}
        title={oduInfo?.nome || odu}
      >
        <div className="space-y-4">
          <div className="text-center p-6 rounded-xl bg-gradient-to-br from-emerald-500/10 to-slate-900 border border-emerald-500/20">
            <p className="text-4xl font-bold text-emerald-400">{oduInfo?.numero || '?'}</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{oduInfo?.nome || odu}</p>
          </div>
          
          {oduInfo && (
            <>
              <div>
                <h4 className="text-sm text-slate-400 uppercase tracking-wide mb-1">Significado</h4>
                <p className="text-slate-300 leading-relaxed">{oduInfo.significado}</p>
              </div>
              
              <div>
                <h4 className="text-sm text-slate-400 uppercase tracking-wide mb-1">Elementos</h4>
                <p className="text-slate-300">{oduInfo.elementos}</p>
              </div>
              
              <div>
                <h4 className="text-sm text-slate-400 uppercase tracking-wide mb-1">Orixás</h4>
                <div className="flex flex-wrap gap-2">
                  {oduInfo.orixas.map((orixa) => (
                    <Badge key={orixa} className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                      {orixa}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm text-amber-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                  Quizilas (Evitar)
                </h4>
                <ul className="text-sm text-slate-400 space-y-1">
                  {oduInfo.quizilas.map((q, i) => (
                    <li key={i}>• {q}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="text-sm text-emerald-400 uppercase tracking-wide mb-1">Preceitos</h4>
                <p className="text-sm text-slate-300">{oduInfo.preceitos}</p>
              </div>
            </>
          )}
        </div>
      </DetailsModal>
    </>
  );
}
