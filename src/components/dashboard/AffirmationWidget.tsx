'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Share2, Heart, Copy, Check, RefreshCw, Quote } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getProfileById } from '@/lib/orixa/orixa-profiles';

// ============================================================
// TYPES
// ============================================================

interface AffirmationWidgetProps {
  userData?: {
    orixaRegente?: string;
    odu?: string;
    nome?: string;
  };
  className?: string;
}

interface OrixaAffirmation {
  id: string;
  texto: string;
  fonte: string;
}

// ============================================================
// CONSTANTS
// ============================================================

const ORIXA_AFFIRMATIONS: Record<string, OrixaAffirmation[]> = {
  // Oxalá
  'oxala': [
    { id: 'ox1', texto: 'Eu sou luz, paz e harmonia. A branca luz de Oxalá me envolve e me guia pelo caminho da verdade.', fonte: 'Oxalá' },
    { id: 'ox2', texto: 'Com as mãos de Oxalá, eu construo pontes de amor entre todos os seres.', fonte: 'Oxalá' },
    { id: 'ox3', texto: 'Minha alma é pura como a luz do amanhecer. Oxalá abençoa cada passo meu.', fonte: 'Oxalá' },
    { id: 'ox4', texto: 'Eu carrego em mim a sabedoria do Criador. Paz flui através de mim em todos os momentos.', fonte: 'Oxalá' },
  ],
  // Oxum
  'oxum': [
    { id: 'oxum1', texto: 'Eu sou digno de amor, beleza e prosperidade. Como Oxum, minha essência irradia charme e abundancia.', fonte: 'Oxum' },
    { id: 'oxum2', texto: 'As águas doces de Oxum purificam meu ser e trazem abundância para minha vida.', fonte: 'Oxum' },
    { id: 'oxum3', texto: 'Meu coração é fértil como a terra regada pelas águas de Oxum. Belas flores brotam em mim.', fonte: 'Oxum' },
    { id: 'oxum4', texto: 'Eu honro minha beleza interior e exterior. Cada reflexo no espelho mostra a luz de Oxum.', fonte: 'Oxum' },
  ],
  // Iansã
  'iansa': [
    { id: 'ian1', texto: 'Eu sou forte, corajoso e livre. O vento de Iansã varre tudo que me prende ao medo.', fonte: 'Iansã' },
    { id: 'ian2', texto: 'Com a espada de Iansã, corto todos os obstáculos que impedem meu crescimento.', fonte: 'Iansã' },
    { id: 'ian3', texto: 'Minha energia é poderosa e criativa. Eu transformo desafios em oportunidades.', fonte: 'Iansã' },
    { id: 'ian4', texto: 'Eu danço com as tempestades, pois dentro de mim habita a força de Iansã.', fonte: 'Iansã' },
  ],
  // Xangô
  'xango': [
    { id: 'xan1', texto: 'Eu falo com sabedoria e justiça. Minhas palavras carregam o poder de Xangô.', fonte: 'Xangô' },
    { id: 'xan2', texto: 'A справедливость de Xangô me guia em todas as minhas decisões.', fonte: 'Xangô' },
    { id: 'xan3', texto: 'Eu sou firme como o raio de Xangô, preciso em minhas ações e palavras.', fonte: 'Xangô' },
    { id: 'xan4', texto: 'O fogo de Xangô queima tudo que não serve, purificando meu caminho.', fonte: 'Xangô' },
  ],
  // Ogum
  'ogum': [
    { id: 'ogu1', texto: 'Eu abro caminhos com a energia de Ogum. Cada obstáculo é apenas um novo território a conquistar.', fonte: 'Ogum' },
    { id: 'ogu2', texto: 'Minha espada corta todas as dificuldades. Com Ogum, sou invencível.', fonte: 'Ogum' },
    { id: 'ogu3', texto: 'Eu sou pioneiro, desbravador de novos horizontes. Ogum me dá força para trilhar novos caminhos.', fonte: 'Ogum' },
    { id: 'ogu4', texto: 'Com as ferramentas de Ogum, eu construo meu destino com habilidade e propósito.', fonte: 'Ogum' },
  ],
  // Oxóssi
  'oxossi': [
    { id: 'oxo1', texto: 'Eu caço com sabedoria a abundância que o universo oferece. Oxóssi me guia até os tesouros ocultos.', fonte: 'Oxóssi' },
    { id: 'oxo2', texto: 'Minha стрела sempre encontra seu alvo. Eu atiro alto e sempre acerto.', fonte: 'Oxóssi' },
    { id: 'oxo3', texto: 'A floresta da vida revela seus segredos para mim. Com Oxóssi, tenho visão clara.', fonte: 'Oxóssi' },
    { id: 'oxo4', texto: 'Eu busco conhecimento com a mesma paixão que Oxóssi busca a caça. Sabedoria é minha presa mais valiosa.', fonte: 'Oxóssi' },
  ],
  // Yemanjá
  'yemaja': [
    { id: 'yem1', texto: 'Eu sou abraçado pela energia maternal de Yemanjá. Seu manto de paz me protege sempre.', fonte: 'Yemanjá' },
    { id: 'yem2', texto: 'Como as ondas do mar, eu fluo com grace. Yemanjá acalma todas as tempestades em mim.', fonte: 'Yemanjá' },
    { id: 'yem3', texto: 'Minha intuição é profunda como o oceano. Yemanjá me conecta com a sabedoria das águas.', fonte: 'Yemanjá' },
    { id: 'yem4', texto: 'Eu sou filho/amigo de Yemanjá, amado e cuidado por ela em cada momento.', fonte: 'Yemanjá' },
  ],
  // Omolu
  'omolu': [
    { id: 'omo1', texto: 'Eu transceso meus medos com a coragem de Omolu. A morte é apenas renascimento.', fonte: 'Omolu' },
    { id: 'omo2', texto: 'Omolu me cura de todas as feridas. Sua energia restabelece minha saúde e vitalidade.', fonte: 'Omolu' },
    { id: 'omo3', texto: 'Eu não temo as sombras, pois sei que Omolu transforma tudo em luz.', fonte: 'Omolu' },
    { id: 'omo4', texto: 'O sacrifício de Omolu me ensina a dar sem esperar retorno. Generosidade flui em mim.', fonte: 'Omolu' },
  ],
  // Nanã
  'nana': [
    { id: 'nan1', texto: 'Eu honro meus ancestrais como Nanã me ensina. A sabedoria dos antigos vive em mim.', fonte: 'Nanã' },
    { id: 'nan2', texto: 'A lama de Nanã é fértil. Em mim, ela faz brotar compréhension e maturidade.', fonte: 'Nanã' },
    { id: 'nan3', texto: 'Eu abraço a velhice com dignidade, pois cada dia traz mais sabedoria.', fonte: 'Nanã' },
    { id: 'nan4', texto: 'Nanã limpa minha alma de tudo que não presta. Sou purificado por suas águas.', fonte: 'Nanã' },
  ],
  // Iemanjá (alternative for yemanjá)
  'iemanja': [
    { id: 'yem1', texto: 'Eu sou abraçado pela energia maternal de Iemanjá. Seu manto de paz me protege sempre.', fonte: 'Iemanjá' },
    { id: 'yem2', texto: 'Como as ondas do mar, eu fluo com grace. Iemanjá acalma todas as tempestades em mim.', fonte: 'Iemanjá' },
    { id: 'yem3', texto: 'Minha intuição é profunda como o oceano. Iemanjá me conecta com a sabedoria das águas.', fonte: 'Iemanjá' },
    { id: 'yem4', texto: 'Eu sou filho/amigo de Iemanjá, amado e cuidado por ela em cada momento.', fonte: 'Iemanjá' },
  ],
  // Oya
  'oya': [
    { id: 'oya1', texto: 'Eu sou tão rápido quanto o vento de Oya. Nada me surpreende, tudo eu transformo.', fonte: 'Oya' },
    { id: 'oya2', texto: 'Oya abre os portais entre os mundos. Eu me conecto com a espiritualidade profunda.', fonte: 'Oya' },
    { id: 'oya3', texto: 'Minha mente é clara como o raio de Oya. Penso com velocidadе e precisão.', fonte: 'Oya' },
    { id: 'oya4', texto: 'Oya me dá a coragem de enfrentar os mortos (os medos). Voo livre como o vento.', fonte: 'Oya' },
  ],
  // Logunedê
  'loguned': [
    { id: 'log1', texto: 'Eu harmonizo a doçura de Oxum com a força de Xangô. Equilíbrio é meu dom.', fonte: 'Logunedê' },
    { id: 'log2', texto: 'Como Logunedê, eu danço entre dois mundos, buscando a harmonia em todas as coisas.', fonte: 'Logunedê' },
    { id: 'log3', texto: 'Eu honro tanto meu pai quanto minha mãe cósmica. A dualidade se unifica em mim.', fonte: 'Logunedê' },
    { id: 'log4', texto: 'Meu caminho é suave como Oxum e poderoso como Xangô. Escolho sabiamente quando usar cada qualidade.', fonte: 'Logunedê' },
  ],
  // Eshu
  'eshu': [
    { id: 'esh1', texto: 'Eshu me ensina que a vida é movimento. Eu abraço a mudança com curiosidade.', fonte: 'Eshu' },
    { id: 'esh2', texto: 'Eu sou ágil como Eshu, adaptando-me a qualquer situação com sabedoria e humor.', fonte: 'Eshu' },
    { id: 'esh3', texto: 'Os caminhos de Eshu me ensinam que cada escolha cria novos rumos. Escolho com consciência.', fonte: 'Eshu' },
    { id: 'esh4', texto: 'O Trickster de Eshu desperta minha criatividade. Eu encontro soluções onde outros veem problemas.', fonte: 'Eshu' },
  ],
  // Obatalá
  'obatala': [
    { id: 'oba1', texto: 'Eu sou puro de coração como Obatalá pede. Minha mente está clara e meu espírito está limpo.', fonte: 'Obatalá' },
    { id: 'oba2', texto: 'A luz branca de Obatalá ilumina meu caminho. Eu vejo a verdade em todas as coisas.', fonte: 'Obatalá' },
    { id: 'oba3', texto: 'Eu crio com a sabedoria de Obatalá. Cada palavra e ação minha é uma obra de arte.', fonte: 'Obatalá' },
    { id: 'oba4', texto: 'O criador me abençoou com discernimento. Eu sei o que é certo em cada momento.', fonte: 'Obatalá' },
  ],
};

const FALLBACK_AFFIRMATIONS: OrixaAffirmation[] = [
  { id: 'fall1', texto: 'Eu sou luz, amor e paz. O universo conspira a meu favor em cada momento.', fonte: 'Caminho Interior' },
  { id: 'fall2', texto: 'Cada respiração é uma nova chance de recomeçar. Eu aproveito este momento presente.', fonte: 'Caminho Interior' },
  { id: 'fall3', texto: 'Minha energia atrai abundância, saúde e felicidade. Sou merecedor de todas as bênçãos.', fonte: 'Caminho Interior' },
  { id: 'fall4', texto: 'O sagrado habita em mim e em todos os seres. Honro a divindade em cada encontro.', fonte: 'Caminho Interior' },
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

function getOrixaKey(orixaName?: string): string {
  if (!orixaName) return 'fallback';
  const normalized = orixaName.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
  
  // Map common variations
  const variations: Record<string, string> = {
    'oxala': 'oxala',
    'oxum': 'oxum',
    'iansa': 'iansa',
    'oyá': 'oya',
    'xangô': 'xango',
    'xango': 'xango',
    'ogum': 'ogum',
    'oxossi': 'oxossi',
    'yemanjá': 'yemaja',
    'yemaja': 'yemaja',
    'iemanjá': 'iemanja',
    'omolu': 'omolu',
    'obaluaê': 'omolu',
    'nana': 'nana',
    'logunedê': 'loguned',
    'eshu': 'eshu',
    'elegua': 'eshu',
    'obatalá': 'obatala',
  };
  
  return variations[normalized] || 'fallback';
}

function getAffirmationOfDay(orixaKey: string): OrixaAffirmation {
  const affirmations = orixaKey === 'fallback' 
    ? FALLBACK_AFFIRMATIONS 
    : ORIXA_AFFIRMATIONS[orixaKey] || FALLBACK_AFFIRMATIONS;
  
  const dayOfYear = getDayOfYear();
  const index = dayOfYear % affirmations.length;
  
  return affirmations[index];
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

function ShareButton({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false);

  const handleShare = async () => {
    const shareText = `${text}\n\n✨ Compartilhado de Cabala Dos Caminhos`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Afirmação do Dia',
          text: shareText,
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-slate-700/50 hover:bg-slate-600/50 rounded-full transition-colors"
    >
      {copied ? (
        <>
          <Check className="w-3 h-3 text-emerald-400" />
          <span className="text-emerald-400">Copiado!</span>
        </>
      ) : (
        <>
          <Share2 className="w-3 h-3" />
          <span>Compartilhar</span>
        </>
      )}
    </button>
  );
}

function AffirmationCard({ affirmation, orixaProfile }: { 
  affirmation: OrixaAffirmation;
  orixaProfile?: ReturnType<typeof getProfileById>;
}) {
  return (
    <div className="relative">
      {/* Decorative quote mark */}
      <Quote className="absolute -top-2 -left-1 w-8 h-8 text-purple-500/20" />
      
      <div className="relative z-10">
        <p className="text-lg text-slate-200 leading-relaxed italic mb-4 pl-4">
          &ldquo;{affirmation.texto}&rdquo;
        </p>
        
        <div className="flex items-center justify-between pl-4">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-pink-400" />
            <span className="text-sm text-slate-400">
              {affirmation.fonte}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {orixaProfile && (
              <span 
                className="text-xs px-2 py-1 rounded-full"
                style={{ 
                  backgroundColor: `${orixaProfile.colors[0]}20`,
                  color: orixaProfile.colors[0]
                }}
              >
                {orixaProfile.namePortuguese}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function RefreshButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-slate-700/50 hover:bg-slate-600/50 rounded-full transition-colors"
    >
      <RefreshCw className="w-3 h-3" />
      <span>Nova afirmação</span>
    </button>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function AffirmationWidget({ userData, className = '' }: AffirmationWidgetProps) {
  const [refreshKey, setRefreshKey] = React.useState(0);
  const [soundEnabled, setSoundEnabled] = React.useState(true);

  const orixaKey = getOrixaKey(userData?.orixaRegente);
  const orixaProfile = userData?.orixaRegente ? getProfileById(userData.orixaRegente) : undefined;

  // Get daily affirmation
  const affirmation = React.useMemo(() => {
    return getAffirmationOfDay(orixaKey);
  }, [orixaKey, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <Card className={cn('bg-gradient-to-br from-purple-900/30 via-slate-800/50 to-indigo-900/30 border-purple-500/20', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-purple-300">
            <Sparkles className="w-5 h-5" />
            Afirmação do Dia
          </CardTitle>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={cn(
                'p-1.5 rounded-full transition-colors',
                soundEnabled 
                  ? 'bg-purple-500/20 text-purple-400' 
                  : 'bg-slate-700/50 text-slate-500'
              )}
              title={soundEnabled ? 'Som ativado' : 'Som desativado'}
            >
              <Heart className={cn('w-4 h-4', soundEnabled && 'fill-purple-400')} />
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <AffirmationCard affirmation={affirmation} orixaProfile={orixaProfile} />
        
        <div className="flex items-center justify-between pt-2">
          <RefreshButton onClick={handleRefresh} />
          <ShareButton text={affirmation.texto} />
        </div>
      </CardContent>
    </Card>
  );
}

export default AffirmationWidget;