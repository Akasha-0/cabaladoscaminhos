'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { getProfileById } from '@/lib/orixa/orixa-profiles';
import { getTarotCardDoDia } from '@/lib/orixa/widget-data';
import { diasSemana } from '@/lib/data/spiritual-data';
import { 
  Coins, 
  TrendingUp, 
  Sparkles, 
  Calendar, 
  Star,
  ChevronRight,
  DollarSign,
  ShieldCheck
} from 'lucide-react';

// TYPES
// ============================================================

  userId?: string;
  userOrixa?: string;
  className?: string;
}

interface FinancialOmen {
  cardName: string;
  interpretation: string;
  luckyNumbers: number[];
  advice: string;
}

interface OrixaFinanceEnergy {
  name: string;
  namePortuguese: string;
  qualities: string[];
  financialAdvice: string;
  colors: string[];
}

interface LuckyDay {
  day: string;
  reason: string;
  quality: string;
}

// ============================================================
// CONSTANTS
// ============================================================

const FINANCE_ORIXAS = ['oxum', 'xango', 'oxossi'];

const FINANCE_INTERPRETATIONS: Record<string, {
  interpretation: string;
  advice: string;
}> = {
  'The Fool': {
    interpretation: 'Um novo ciclo financeiro comeca. Este e um momento para agir com ousadia, mas com sabedoria.',
    advice: 'Conte com uma margem de erro. Os investimentos mais arriscados podem trazer retornos inesperados.'
  },
  'The Magician': {
    interpretation: 'Recursos disponiveis estao ao seu alcance. Use sua criatividade para manifestar prosperidade.',
    advice: 'Excelente dia para iniciar novos projetos financeiros ou renegociar contratos.'
  },
  'The High Priestess': {
    interpretation: 'Confie na sua intuicao sobre questoes financeiras. Nem tudo que parece logico e a melhor escolha.',
    advice: 'Evite decisoes impulsivas. Escute seu instinto antes de negociar.'
  },
  'The Empress': {
    interpretation: 'Abundancia e fertilidade emocional refletem-se em abundancia material. Cuide do que tem.',
    advice: 'Dia favoravel para investimentos em beleza, artes ou qualquer projeto criativo.'
  },
  'The Emperor': {
    interpretation: 'Estrutura e organizacao sao suas aliadas. Controle seus gastos e organize suas financas.',
    advice: 'Bom dia para criar orcamento, planejar ou cortar despesas desnecessarias.'
  },
  'The Hierophant': {
    interpretation: 'Busque orientacao especializada em questoes financeiras. Conselhos tradicionai tem valor.',
    advice: 'Considere consultar um mentor ou assessor financeiro de confianca.'
  },
  'The Lovers': {
    interpretation: 'Decisoes em parcerias podem afetar suas financas. Avalie bem com quem divide o pao.',
    advice: 'Excelente dia para joint ventures ou investimentos em sociedade.'
  },
  'The Chariot': {
    interpretation: 'Determinacao e foco trazem resultados financeiros. Mantenha o rumo mesmo em turbulencia.',
    advice: 'Dias de alta volatilidade podem ser favoraveis para traders decididos.'
  },
  'Strength': {
    interpretation: 'Sua resiliencia financeira sera testada. Tenha coragem mas nao seja imprudente.',
    advice: 'Se enfrentar dificuldades, lembre-se que a perseveranca supera o medo.'
  },
  'The Hermit': {
    interpretation: 'Tempo de reflexão financeira. Evite investimentos arriscados e busque silincio.',
    advice: 'Excelente para revisar sua situacao financeira e planejar a longo prazo.'
  },
  'Wheel of Fortune': {
    interpretation: 'A sorte esta ao seu lado! Ciclos positivos estao em movimento.',
    advice: 'Dias perfeitos para tentar algo novo no mercado financeiro.'
  },
  'Justice': {
    interpretation: 'A verdade esta emergindo em seus assuntos financeiros. Seja honesto consigo mesmo.',
    advice: 'Chegou a hora de ajustar o que esta errado em suas contas.'
  },
  'The Hanged Man': {
    interpretation: 'Pausa necessaria para reavaliar sua estrategiapara nao se apresse.',
    advice: 'Dias propicios para meditacao sobre dinheiro, nao para acoes apressadas.'
  },
  'Death': {
    interpretation: 'Transformacoes profundas em seus habitos financeiros. Deixe morrer o que nao serve mais.',
    advice: 'Excelente dia para quitar dividas, fechar contas ou eliminar gastos.'
  },
  'Temperance': {
    interpretation: 'Moderao traz equilibrio financeiro. Evite extremos em ganhos ou perdas.',
    advice: 'Mantenha um meio termo em seus investimentos, nem agressivo nem passivo.'
  },
  'The Devil': {
    interpretation: 'Alerta com tentacoes materiais. Dividas e consumismo podem ser armadilhas.',
    advice: 'Fuja de investimentos com promessas exageradas ou oportunidades que parecem boas demais.'
  },
  'The Tower': {
    interpretation: 'Mudancas subitas podem reestruturar sua situacao financeira. Esteja preparado.',
    advice: 'Tenha reservas para emergencias. Rupturas podem trazer novas oportunidades.'
  },
  'The Star': {
    interpretation: 'Esperanca e renovacao em sua vida financeira. Sonhos de prosperidade podem se realizar.',
    advice: 'Dias ideias para criar um quadro de visao financeira ou Manifestacao de metas.'
  },
  'The Moon': {
    interpretation: 'Confusao possivel nos mercados. Ajuste seus olhos antes de agir.',
    advice: 'Nao tome decisoes importantes financeiras com presiones emocionais.'
  },
  'The Sun': {
    interpretation: 'Sucesso financeiro radiante! Sua luz esta brilhando sobre seus numeros.',
    advice: 'Dias de pura expansao. Invista em voce e em seus projetos mais brilhantes.'
  },
  'Judgement': {
    interpretation: 'Um novo capitulo financeiro se abre. Seja seu proprio juiz sobre suas escolhas.',
    advice: 'Chegou a hora de recomecar com novo proposito e responsabilidade.'
  },
  'The World': {
    interpretation: 'Completamento de ciclos financeiros. Celebre suas conquistas e prepare novos objetivos.',
    advice: 'Perfeito para fechar acordos importantes ou realizar sonha de vida.'
  },
};

const ABUNDANCE_AFFIRMATIONS = [
  'Eu abro minhas maos para receber a abundancia que o universo me oferece hoje.',
  'Minha relacao com o dinheiro e de paz, respeito e gratidao.',
  'Eu mereco prosperidade em todas as areas da minha vida.',
  'O fluxo energetico esta alinhando minhas financas com meu proposito.',
  'Eu libero toda crenca limitante sobre dinheiro e abrazo a consciencia da abundancia.',
  'Cada dia e uma nova oportunidade de criar riqueza e abundancia.',
  'Meu fluxo financeiro se expande natural e harmoniosamente.',
  'Eu sou um ima para oportunidades financeiras extraordinarias.',
  'Agradeo por toda a prosperidade que flui atraves de mim.',
  'Eu declaro que minha vida financeira esta em perfeita harmonia.',
];

const FALLBACK_AFFIRMATIONS = [
  'A abundancia e meu direito divino e eu a aceito hoje.',
  'Eu confio no processo do universo de prover minhas necessidades.',
  'Cada respiro meu esta rodeado de prosperidade e gracia.',
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

function getDayKey(date: Date): string {
  const days = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
  return days[date.getDay()];
}

function getFinancialOmen(date: Date): FinancialOmen {
  const tarotCard = getTarotCardDoDia(date);
  const interpretationData = FINANCE_INTERPRETATIONS[tarotCard.nome] || {
    interpretation: 'Uma nova oportunidade financeira se apresenta no caminho.',
    advice: 'Mantenha-se aberto para receber prosperidade de maneiras inesperadas.'
  };
  
  const seed = date.getDate() + date.getMonth();
  const luckyNumbers: number[] = [];
  const allNumbers = [2, 4, 6, 7, 8, 10, 12, 15, 20, 22, 24, 28, 30, 40, 50];
  for (let i = 0; i < 5; i++) {
    const idx = (seed * (i + 1) + i) % allNumbers.length;
    luckyNumbers.push(allNumbers[idx]);
  }
  
  return {
    cardName: tarotCard.nome,
    interpretation: interpretationData.interpretation,
    luckyNumbers: luckyNumbers.sort((a, b) => a - b),
    advice: interpretationData.advice,
  };
}

function getFinanceOrixa(orixaName?: string): OrixaFinanceEnergy {
  if (orixaName) {
    const profile = getProfileById(orixaName.toLowerCase());
    if (profile && FINANCE_ORIXAS.includes(profile.id)) {
      return {
        name: profile.name,
        namePortuguese: profile.namePortuguese,
        qualities: profile.qualities,
        financialAdvice: getFinancialAdviceByOrixa(profile.id),
        colors: profile.colors,
      };
    }
  }
  
  const defaultProfile = getProfileById('oxum');
  return {
    name: defaultProfile?.name || 'Oxum',
    namePortuguese: defaultProfile?.namePortuguese || 'Rainha das Aguas Doces',
    qualities: defaultProfile?.qualities || ['Abundancia', 'Prosperidade', 'Beleza'],
    financialAdvice: 'Este e um dia para abrir seu coracao e receber a prosperidade que Oxum oferece.',
    colors: defaultProfile?.colors || ['#FFD700', '#FF69B4'],
  };
}

function getFinancialAdviceByOrixa(orixaId: string): string {
  const adviceMap: Record<string, string> = {
    oxum: 'Oxum traz a energia da abundancia genuina. Honre suas financas como fluxo de amor proprio.',
    xango: 'Xango traz a energia da Justica. Assegure-se de que suas decisoes sejam justas com todos.',
    oxossi: 'Oxossi traz a energia da cacca a Abundancia. Va atras dos seus objetivos com determinacao.',
  };
  return adviceMap[orixaId] || 'Confie na sabedoria ancestral para guiar suas decisoes financeiras.';
}

function getLuckyDays(date: Date): LuckyDay[] {
  const dayKey = getDayKey(date);
  const luckyDays: LuckyDay[] = [];
  const dayOrder = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
  const todayIndex = dayOrder.indexOf(dayKey);
  
  for (let i = 0; i < 7; i++) {
    const checkIndex = (todayIndex + i) % 7;
    const checkDay = dayOrder[checkIndex];
    const dayData = diasSemana[checkDay];
    
    if (dayData) {
      const isLucky = dayData.planetas?.some((p: string) => 
        ['Jupiter', 'Venus', 'Sol'].some(planet => p.includes(planet))
      );
      
      if (isLucky || i === 0) {
        luckyDays.push({
          day: dayData.dia,
          reason: getReasonForLuckyDay(checkDay, dayData),
          quality: dayData.misterio?.substring(0, 50) || 'Dia neutro',
        });
      }
    }
  }
  
  return luckyDays.slice(0, 5);
}

function getReasonForLuckyDay(dayKey: string, dayData: { misterio?: string }): string {
  if (!dayData) return 'Dia neutro para financas.';
  
  const reasons: Record<string, string> = {
    segunda: 'Dia de novos inicios e reflecos sobre investimentos',
    terca: 'Dia de acao decisiva e coragem nos mercados',
    quarta: 'Dia da Justica - favoravel para negociacoes e contratos',
    quinta: 'Dia da fartura - o mais favoravel para decisoes financeiras',
    sexta: 'Dia da paz - favoravel para transactions harmonicas',
    sabado: 'Dia das Grandes Maes - energia de abundancia nutridora',
    domingo: 'Dia solar - energia de prosperidade e vitalidade',
  };
  
  return reasons[dayKey] || 'Dia neutro para financas.';
}

function getDailyAffirmation(): string {
  const dayIndex = getDayOfYear();
  const affirmations = ABUNDANCE_AFFIRMATIONS.length > 0 
    ? ABUNDANCE_AFFIRMATIONS 
    : FALLBACK_AFFIRMATIONS;
  return affirmations[dayIndex % affirmations.length];
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

function OmenCard({ omen }: { omen: FinancialOmen }) {
  return (
    <div className="bg-gradient-to-br from-amber-900/30 to-amber-800/10 rounded-lg p-4 border border-amber-500/20">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5 text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-amber-400 mb-1">
            {omen.cardName}
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            {omen.interpretation}
          </p>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-amber-500/20">
        <p className="text-xs text-slate-400 mb-2 flex items-center gap-1.5">
          <DollarSign className="w-3.5 h-3.5" />
          Numeros da sorte para investimentos
        </p>
        <div className="flex flex-wrap gap-1.5">
          {omen.luckyNumbers.map((num: number, idx: number) => (
            <span 
              key={idx}
              className="px-2 py-1 bg-amber-500/20 text-amber-300 text-xs font-mono rounded"
            >
              {num}
            </span>
          ))}
        </div>
      </div>
      
      <div className="mt-3">
        <p className="text-xs text-slate-400 italic">
          &ldquo;{omen.advice}&rdquo;
        </p>
      </div>
    </div>
  );
}

function FinanceOrixaCard({ energy }: { energy: OrixaFinanceEnergy }) {
  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-lg p-4 border border-slate-700/50">
      <div className="flex items-center gap-3 mb-3">
        <div 
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ 
            background: `linear-gradient(135deg, ${energy.colors[0]}40, ${energy.colors[1] || energy.colors[0]}40)`,
            border: `2px solid ${energy.colors[0]}50`
          }}
        >
          <Coins className="w-6 h-6" style={{ color: energy.colors[0] }} />
        </div>
        <div>
          <h4 className="text-sm font-medium text-slate-200">
            {energy.name}
          </h4>
          <p className="text-xs text-slate-400">
            {energy.namePortuguese}
          </p>
        </div>
      </div>
      
      <div className="space-y-2">
        <p className="text-xs text-slate-300 leading-relaxed">
          {energy.financialAdvice}
        </p>
        
        <div className="flex flex-wrap gap-1.5 pt-2">
          {energy.qualities.slice(0, 4).map((quality: string, idx: number) => (
            <span 
              key={idx}
              className="px-2 py-0.5 bg-slate-700/50 text-slate-300 text-xs rounded-full"
            >
              {quality}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function AffirmationSection({ affirmation, orixaName }: { affirmation: string; orixaName?: string }) {
  return (
    <div className="relative">
      <div className="text-4xl text-amber-500/20 absolute -top-1 left-0 leading-none">&ldquo;</div>
      <div className="pl-5">
        <p className="text-sm text-slate-200 leading-relaxed italic">
          {affirmation}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <Star className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs text-slate-400">
            Abundancia &bull; {orixaName || 'Oxum'}
          </span>
        </div>
      </div>
    </div>
  );
}

function LuckyDaysCalendar({ days }: { days: LuckyDay[] }) {
  return (
    <div className="space-y-2">
      {days.map((day: LuckyDay, idx: number) => (
        <div 
          key={idx}
          className="flex items-center justify-between py-2 px-3 bg-slate-800/30 rounded-lg border border-slate-700/30 hover:border-emerald-500/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <div>
              <p className="text-sm text-slate-200 font-medium">
                {day.day}
              </p>
              <p className="text-xs text-slate-400">
                {day.quality}...
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </div>
      ))}
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function SpiritualFinanceWidget({ 
  userOrixa,
  className = '' 
}: SpiritualFinanceWidgetProps) {
  const date = React.useMemo(() => new Date(), []);
  
  const omen = React.useMemo(() => getFinancialOmen(date), [date]);
  const financeOrixa = React.useMemo(() => getFinanceOrixa(userOrixa), [userOrixa]);
  const luckyDays = React.useMemo(() => getLuckyDays(date), [date]);
  const affirmation = React.useMemo(() => getDailyAffirmation(), []);
  
  const orixaProfile = React.useMemo(() => {
    return userOrixa ? getProfileById(userOrixa.toLowerCase()) : undefined;
  }, [userOrixa]);
  
  return (
    <Card className={cn('card-spiritual overflow-hidden', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500/30 to-yellow-600/30 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-amber-400" />
            </div>
            Portal Financeiro Espiritual
          </CardTitle>
          <ShieldCheck className="w-4 h-4 text-emerald-400/50" />
        </div>
        {userOrixa && (
          <p className="text-xs text-slate-500">
            Conectado com {orixaProfile?.namePortuguese || userOrixa}
          </p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-5">
        <section>
          <h3 className="text-xs font-medium text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" />
            Presagio Financeiro do Dia
          </h3>
          <OmenCard omen={omen} />
        </section>
        
        <section>
          <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Coins className="w-3.5 h-3.5" />
            Orixa e Energia Financeira
          </h3>
          <FinanceOrixaCard energy={financeOrixa} />
        </section>
        
        <section>
          <h3 className="text-xs font-medium text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Star className="w-3.5 h-3.5" />
            Afirmacao de Abundancia
          </h3>
          <AffirmationSection 
            affirmation={affirmation} 
            orixaName={orixaProfile?.name || financeOrixa.name} 
          />
        </section>
        
        <section>
          <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5" />
            Dias Favoraveis para Decisoes Financeiras
          </h3>
          <LuckyDaysCalendar days={luckyDays} />
        </section>
      </CardContent>
    </Card>
  );
}

export default SpiritualFinanceWidget;
