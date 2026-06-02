// fallow-ignore-file unused-file
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WidgetStatGrid, WidgetTagList, WidgetProgress } from './SpiritualWidgetSystem';
import { Skull, Sparkles, Eye, Heart } from 'lucide-react';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';

// ============================================================
// TYPES
// ============================================================

interface OduData {
  numero: number;
  nome: string;
  significado: string;
  orixa: string[];
  quizilas: string[];
  preceitos: string[];
  elemento: string;
  ebó: string;
}

// ============================================================
// CONSTANTS
// ============================================================

const ODUS_DATA: Record<number, OduData> = {
  1: {
    numero: 1,
    nome: 'Okaran',
    significado: 'O começo, a dúvida, o caminho difícil mas de grande aprendizado',
    orixa: ['Exu', 'Omolu'],
    quizilas: ['Carne de porco', 'Cachaça em excesso', 'Andar na rua ao meio-dia'],
    preceitos: ['Cultivar a paciência', 'Não agir por impulso', 'Cuidar de Exu e ancestrais'],
    elemento: 'Terra',
    ebó: 'Despachos em encruzilhadas, moedas, pipoca e panos escuros',
  },
  2: {
    numero: 2,
    nome: 'Ejiokô',
    significado: 'A dualidade, os caminhos duplos, união e disputa. Vitória após grandes lutas',
    orixa: ['Ibeji', 'Ogum'],
    quizilas: ['Comer ovos', 'Rã', 'Mentir ou trair confiança'],
    preceitos: ['Manter a alegria interna', 'Cuidar da criança interior', 'Buscar sociedades justas'],
    elemento: 'Ar',
    ebó: 'Doces, frutas para Ibeji, comidas leves em praças',
  },
  3: {
    numero: 3,
    nome: 'Etaogundá',
    significado: 'A revolta, a força física, a criação de ferramentas. O corte e a separação',
    orixa: ['Ogum', 'Obaluaê'],
    quizilas: ['Usar facas sem necessidade', 'Carne de galo', 'Violência verbal'],
    preceitos: ['Evitar brigas', 'Manter foco no trabalho', 'Não demandar contra outros'],
    elemento: 'Fogo',
    ebó: 'Inhames assados, paliteiros de Ogum, limpeza com folhas de mariô',
  },
  4: {
    numero: 4,
    nome: 'Irosun',
    significado: 'O aviso, o sangue que corre nas veias, a visão espiritual. Olhar para o futuro',
    orixa: ['Iemanjá', 'Oxóssi'],
    quizilas: ['Olhar para buracos vazios', 'Usar roupas muito vermelhas em crises', 'Mentira'],
    preceitos: ['Desenvolver a intuição', 'Não ignorar avisos e sonhos', 'Cuidar da saúde'],
    elemento: 'Fogo',
    ebó: 'Alimentos brancos, canjica na beira-mar, banhos de folhas frias',
  },
  5: {
    numero: 5,
    nome: 'Oxé',
    significado: 'O ouro, a doçura, a feitiçaria, a vaidade e a lágrima',
    orixa: ['Oxum', 'Logun Edé'],
    quizilas: ['Comer ovos', 'Comidas muito salgadas', 'Chorar miséria'],
    preceitos: ['Cuidar da autoestima', 'Usar perfumes', 'Manter higiene espiritual'],
    elemento: 'Água',
    ebó: 'Banhos de mel, caldas de frutas, girassóis e moedas douradas em águas doces',
  },
  6: {
    numero: 6,
    nome: 'Obará',
    significado: 'A riqueza, a fartura, a sabedoria e a surpresa. O rei que se veste de mendigo',
    orixa: ['Xangô', 'Oxóssi'],
    quizilas: ['Inveja', 'Contar planos antes de realizar', 'Comer abóbora'],
    preceitos: ['Ser generoso', 'Estudar', 'Manter cabeça erguida', 'Praticar gratidão'],
    elemento: 'Ar',
    ebó: 'Seis tipos de frutas, amalá para Xangô, dar comida à terra',
  },
  7: {
    numero: 7,
    nome: 'Odi',
    significado: 'A teimosia, o renascimento, as coisas ocultas, o poço profundo',
    orixa: ['Omolu', 'Oxumaré'],
    quizilas: ['Dormir no escuro absoluto com medo', 'Comer carne de caça', 'Persistir no erro'],
    preceitos: ['Praticar o desapego', 'Aceitar mudanças', 'Não cavar o próprio buraco'],
    elemento: 'Terra',
    ebó: 'Pipoca para Omolu, banhos de lama ou argila, defumações pesadas',
  },
  8: {
    nome: 'EjiOníle',
    significado: 'A cabeça, a liderança, o topo do mundo, o sangue branco',
    numero: 8,
    orixa: ['Oxalá'],
    quizilas: ['Usar roupas pretas', 'Comer carne vermelha em dias de preceito'],
    preceitos: ['Cuidar muito bem do Ori', 'Buscar a paz', 'Evitar orgulho e arrogância'],
    elemento: 'Ar',
    ebó: 'Canjica branca, algodão, banhos de boldo, velas brancas',
  },
  9: {
    numero: 9,
    nome: 'Ossá',
    significado: 'O vento, as transformações rápidas, o reino das Iyami',
    orixa: ['Iansã', 'Iemanjá'],
    quizilas: ['Espalhar fofocas', 'Ventanias na praia', 'Usar roupas rasgadas'],
    preceitos: ['Respeitar o poder feminino', 'Controlar a impulsividade', 'Fluir com mudanças'],
    elemento: 'Ar',
    ebó: 'Sacudimentos com folhas de fumo, acarajé para Iansã no vento',
  },
  10: {
    numero: 10,
    nome: 'Ofun',
    significado: 'O mistério, a velhice, a cura, o sopro divino. O Odú mais velho',
    orixa: ['Oxalá', 'Obá'],
    quizilas: ['Usar roupas pretas', 'Comer comida amanhecida', 'Faltar respeito aos mais velhos'],
    preceitos: ['Vestir-se de branco', 'Manter silêncio e quietude', 'Estudar espiritualidade'],
    elemento: 'Ar',
    ebó: 'Tudo pede rezas mansas, frutas brancas, banhos de leite de cabra',
  },
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getOduDoDia(): OduData {
  const today = new Date();
  const seed = today.getDate() + today.getMonth() * 31;
  return ODUS_DATA[(seed % 10) + 1] || ODUS_DATA[1];
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function OduDivinationWidget() {
  const odu = useMemo(() => getOduDoDia(), []);
  const today = new Date();
  const dateStr = today.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <Card className="card-spiritual bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-sm border-slate-800/50 overflow-hidden">
      <CardHeader className="pb-3 border-b border-slate-800/50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
              <Skull className="w-4 h-4 text-orange-400" />
            </div>
            <span className="text-base font-semibold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
              Odú do Dia
            </span>
          </CardTitle>
          <span className="text-xs text-slate-400">{dateStr}</span>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Main Odu Display */}
        <div className="p-5 rounded-xl bg-gradient-to-br from-orange-500/15 to-amber-500/10 border border-orange-500/30 text-center relative overflow-hidden">
          {/* Background glow */}
          <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(circle at 50% 0%, rgba(251,146,60,0.4), transparent 70%)' }} />
          
          <div className="relative z-10">
            {/* Odu number circle */}
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-orange-500/30 to-amber-500/20 border-2 border-orange-500/40 shadow-[0_0_30px_rgba(251,146,60,0.3)] mb-3">
              <span className="text-4xl font-bold text-amber-400">{odu.numero}</span>
            </div>
            
            {/* Odu name */}
            <h3 className="text-2xl font-bold text-white mb-2">{odu.nome}</h3>
            
            {/* Meaning */}
            <p className="text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
              {odu.significado}
            </p>
          </div>
        </div>

        {/* Orixás */}
        <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/30">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-slate-400">Orixás Regentes</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {odu.orixa.map((o, i) => (
              <span key={i} className="px-3 py-1.5 rounded-full bg-amber-500/15 text-amber-400 text-sm font-medium border border-amber-500/20">
                {o}
              </span>
            ))}
          </div>
        </div>

        {/* Quizilas e Preceitos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Quizilas (Evitar) */}
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-red-400 text-lg">✗</span>
              <span className="text-xs text-red-400 font-medium">Quizilas (Evitar)</span>
            </div>
            <ul className="space-y-1.5">
              {odu.quizilas.map((q, i) => (
                <li key={i} className="text-xs text-red-400/80 flex items-start gap-2">
                  <span className="text-red-400/60 mt-0.5">•</span>
                  {q}
                </li>
              ))}
            </ul>
          </div>

          {/* Preceitos (Fazer) */}
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-emerald-400 text-lg">✓</span>
              <span className="text-xs text-emerald-400 font-medium">Preceitos</span>
            </div>
            <ul className="space-y-1.5">
              {odu.preceitos.map((p, i) => (
                <li key={i} className="text-xs text-emerald-400/80 flex items-start gap-2">
                  <span className="text-emerald-400/60 mt-0.5">•</span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Ebó recommendation */}
        <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-4 h-4 text-violet-400" />
            <span className="text-xs text-violet-400 font-medium">Ebó Recomendado</span>
          </div>
          <p className="text-xs text-violet-300/80 leading-relaxed">
            {odu.ebó}
          </p>
        </div>

        {/* Progress */}
        <WidgetProgress label="Alinhamento espiritual" value={75} max={100} color="amber" />
      </CardContent>
    </Card>
  );
}

export default OduDivinationWidget;