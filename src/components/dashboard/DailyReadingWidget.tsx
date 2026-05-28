'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Sparkles,
  Star,
  Sun,
  Moon,
  Heart,
  ChevronRight,
  RefreshCw,
  BookOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Tarot cards data
const tarotCards = [
  { numero: 0, nome: 'O Louco', arcano: 'Maior', significado: 'Novos começos, liberdade, espontaneidade, inocência', keywords: ['liberdade', 'aventura', 'espontaneidade'] },
  { numero: 1, nome: 'O Mago', arcano: 'Maior', significado: 'Manifestação, recursos, habilidade, propósito', keywords: ['manifestação', 'poder', 'ação'] },
  { numero: 2, nome: 'A Sacerdotisa', arcano: 'Maior', significado: 'Intuição, sabedoria interior, profundezas do inconsciente', keywords: ['intuição', 'mistério', 'conhecimento'] },
  { numero: 3, nome: 'A Imperadora', arcano: 'Maior', significado: 'Fertilidade, abundância, natureza, nutrição', keywords: ['abundância', 'maturidade', 'criação'] },
  { numero: 4, nome: 'O Imperador', arcano: 'Maior', significado: 'Autoridade, estrutura, controle, liderança', keywords: ['estrutura', 'liderança', 'estabilidade'] },
  { numero: 5, nome: 'O Hierofante', arcano: 'Maior', significado: 'Tradição, espiritualidade, conformidade, ética', keywords: ['tradição', 'espiritualidade', 'educação'] },
  { numero: 6, nome: 'Os Enamorados', arcano: 'Maior', significado: 'Amor, harmonia, relacionamentos, escolha', keywords: ['amor', 'união', 'decisão'] },
  { numero: 7, nome: 'O Carro', arcano: 'Maior', significado: 'Vitória, conquista, controle, vontade', keywords: ['conquista', 'vitória', 'determinação'] },
  { numero: 8, nome: 'A Força', arcano: 'Maior', significado: 'Coragem, persuasão, influência, compaixão', keywords: ['força', 'coragem', 'compaixão'] },
  { numero: 9, nome: 'O Eremita', arcano: 'Maior', significado: 'Introspecção, solitude, busca interior, autoconhecimento', keywords: ['introspecção', 'sabedoria', 'iluminação'] },
  { numero: 10, nome: 'A Roda da Fortuna', arcano: 'Maior', significado: 'Ciclos, destino, mudança, sorte', keywords: ['destino', 'sorte', 'transformação'] },
  { numero: 11, nome: 'A Justiça', arcano: 'Maior', significado: 'Justiça, verdade, lei, equidade', keywords: ['equidade', 'verdade', 'justiça'] },
  { numero: 12, nome: 'O Enforcado', arcano: 'Maior', significado: 'Pausa, sacrifício, nova perspectiva, rendição', keywords: ['sacrifício', 'renovação', 'perspectiva'] },
  { numero: 13, nome: 'A Morte', arcano: 'Maior', significado: 'Fim de ciclo, transição, transformação, renascimento', keywords: ['transformação', 'metamorfose', 'renascimento'] },
  { numero: 14, nome: 'A Temperança', arcano: 'Maior', significado: 'Equilíbrio, paciência, propósito, harmonia', keywords: ['harmonia', 'equilíbrio', 'moderação'] },
  { numero: 15, nome: 'O Diabo', arcano: 'Maior', significado: 'Escravidão, vício, ilusão, materialismo', keywords: ['ilusão', 'vício', 'libertação'] },
  { numero: 16, nome: 'A Torre', arcano: 'Maior', significado: 'Mudança repentina, catálise, revelação, upheaval', keywords: ['catálise', 'revelação', 'libertação'] },
  { numero: 17, nome: 'A Estrela', arcano: 'Maior', significado: 'Esperança, fé, propósito, serenidade', keywords: ['esperança', 'inspiração', 'paz'] },
  { numero: 18, nome: 'A Lua', arcano: 'Maior', significado: 'Ilusão, medo, ansiedade, inconsciente', keywords: ['ilusão', 'intuição', 'inconsciente'] },
  { numero: 19, nome: 'O Sol', arcano: 'Maior', significado: 'Alegria, sucesso, celebração, vitalidade', keywords: ['alegria', 'sucesso', 'vitalidade'] },
  { numero: 20, nome: 'O Julgamento', arcano: 'Maior', significado: 'Julgamento, redenção, prova, despertar', keywords: ['redenção', 'renascimento', 'julgamento'] },
  { numero: 21, nome: 'O Mundo', arcano: 'Maior', significado: 'Realização, completude, integração, viagens', keywords: ['realização', 'completude', 'integração'] },
];

const affirmations = [
  { texto: "Akó querubyn, eu sou luz. Eu sou paz. Eu sou caminho.", categoria: "Proteção Divina" },
  { texto: "Eu abraço novos começos com coragem e determinação. Minha energia lidera o caminho.", categoria: "Novo Ciclo" },
  { texto: "A harmonia flui naturalmente em minha vida. Cada conexão que faço traz luz e paz.", categoria: "Harmonia" },
  { texto: "Minha criatividade transborda. Expresso minha verdade com alegria e inspiração.", categoria: "Criatividade" },
  { texto: "A prosperidade flui naturalmente para mim. Sou um ímã para a abundância em todas as áreas da minha vida.", categoria: "Abundância" },
  { texto: "Eu sou digno de amor. Amar e ser amado é meu direito divino. Abro meu coração para o amor universal.", categoria: "Amor" },
  { texto: "A sabedoria divina me guia. Minhas decisões são claras e meu discernimento é perfeito.", categoria: "Sabedoria" },
  { texto: "Eu permito que meu corpo se cure e se renove. Cada célula ressoa com vitalidade e paz.", categoria: "Cura" },
  { texto: "Estou envolto em proteção divina. Nenhuma energia negativa pode me alcançar.", categoria: "Proteção" },
  { texto: "Sou pioneiro em minha própria história. Começo com propósito e clareza.", categoria: "Propósito" },
  { texto: "Cooperacao e paciencia sao minhas aliadas neste momento de crescimento.", categoria: "Crescimento" },
  { texto: "Minha voz e minha arte se manifestam com poder este dia.", categoria: "Expressão" },
  { texto: "Eu atrais oportunidades extraordinárias. O universo conspira a meu favor.", categoria: "Oportunidade" },
  { texto: "Minha mente é clara e focada. Thoughts align with my highest purpose.", categoria: "Clareza" },
  { texto: "Gratidao preenche meu coração. Recognizo as bênçãos em cada momento.", categoria: "Gratidão" },
  { texto: "Eu manifesto minha realidade com intenção e amor.", categoria: "Manifestação" },
  { texto: "Minha intuição é minha guia. Confio nos sinais do universo.", categoria: "Intuição" },
];

const odusData = [
  { numero: 1, nome: "Okaran", significado: "O começo, a dúvida, a insubordinação. Caminho difícil, mas de grande aprendizado.", orixa: "Exu, Omolu", elementos: "Terra/Fogo" },
  { numero: 2, nome: "Ejiokô", significado: "A dualidade, os caminhos duplos, união e disputa. Vitória após grandes lutas.", orixa: "Ibeji, Ogum", elementos: "Ar/Terra" },
  { numero: 3, nome: "Etaogundá", significado: "A revolta, a força física, a criação de ferramentas. O corte e a separação.", orixa: "Ogum, Obaluaê", elementos: "Fogo/Terra" },
  { numero: 4, nome: "Irosun", significado: "A intuição, a sabedoria, os segredos revelados. Encontro com a verdade interior.", orixa: "Orunmila", elementos: "Água" },
  { numero: 5, nome: "Oxé", significado: "A comunicação, a troca, os conflitos resolvidos. A fala como ferramenta de poder.", orixa: "Ogum, Xangô", elementos: "Fogo/Ar" },
  { numero: 6, nome: "Gundá", significado: "A preparação, o sacrifício, a busca da perfeição. O caminho do esforço consciente.", orixa: "Obatalá", elementos: "Terra/Ar" },
  { numero: 7, nome: "Ogbe", significado: "O começo absoluto, a vitória garantida. O número da sorte e do sucesso.", orixa: "Obatalá", elementos: "Terra/Água" },
  { numero: 8, nome: "Yону", significado: "O destino, o reconhecimento, a conclusão. A reunião dos opostos.", orixa: "Orunmila", elementos: "Água/Fogo" },
  { numero: 9, nome: "Odí", significado: "A transformação, a quebra de padrões, a libertação. Momento de mudança radical.", orixa: "Xangô", elementos: "Fogo" },
  { numero: 10, nome: "Iwanrin", significado: "O aprendizado, a inteligência, o conhecimento profundo. Sabedoria adquirida.", orixa: "Obatalá", elementos: "Ar/Terra" },
  { numero: 11, nome: "Eji-la-pô", significado: "A divisão, a escolha, a decisão entre dois caminhos. Dilema e resolução.", orixa: "Omolu, Obaluaê", elementos: "Terra" },
  { numero: 12, nome: "Ika", significado: "O acompanhamento, a paciência, a espera. O tempo como aliado.", orixa: "Omolu", elementos: "Água/Terra" },
  { numero: 13, nome: "Oturupon", significado: "A autoridade, o comando, a responsabilidade. Liderança e poder.", orixa: "Obatalá", elementos: "Ar/Fogo" },
  { numero: 14, nome: "Irotua", significado: "A proteção, o escudo, a defesa. Barreiras contra energias negativas.", orixa: "Oxum", elementos: "Água" },
  { numero: 15, nome: "Oporikan", significado: "A família, a comunidade, as relações próximas. Laços de sangue e escolha.", orixa: "Ibeji", elementos: "Terra/Água" },
  { numero: 16, nome: "Obara", significado: "A justiça, o equilibrio, a harmony. O pagamento de dívidas cósmicas.", orixa: "Xangô", elementos: "Fogo/Ar" },
];

// Seeded random based on date for consistent daily values
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function getDailyTarot() {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const index = Math.floor(seededRandom(seed) * tarotCards.length);
  return tarotCards[index];
}

function getDailyAffirmation() {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const index = Math.floor(seededRandom(seed + 1) * affirmations.length);
  return affirmations[index];
}

function getDailyOdu() {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const index = Math.floor(seededRandom(seed + 2) * odusData.length);
  return odusData[index];
}

interface DailyReadingWidgetProps {
  onOpenTarot?: () => void;
  onOpenAffirmation?: () => void;
  onOpenOdu?: () => void;
}

export function DailyReadingWidget({ onOpenTarot, onOpenAffirmation, onOpenOdu }: DailyReadingWidgetProps) {
  const [mounted, setMounted] = useState(false);
  const [dailyTarot, setDailyTarot] = useState<typeof tarotCards[0] | null>(null);
  const [dailyAffirmation, setDailyAffirmation] = useState<typeof affirmations[0] | null>(null);
  const [dailyOdu, setDailyOdu] = useState<typeof odusData[0] | null>(null);

  useEffect(() => {
    setMounted(true);
    setDailyTarot(getDailyTarot());
    setDailyAffirmation(getDailyAffirmation());
    setDailyOdu(getDailyOdu());
  }, []);

  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });

  return (
    <Card className="w-full bg-gradient-to-br from-violet-950/50 via-purple-950/50 to-indigo-950/50 border-violet-500/30">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Star className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg text-white">Leituras do Dia</CardTitle>
              <p className="text-xs text-violet-300 capitalize">{today}</p>
            </div>
          </div>
          <Badge variant="outline" className="bg-violet-500/20 text-violet-200 border-violet-400/30 text-xs">
            <Sparkles className="w-3 h-3 mr-1" />
            Diário Espiritual
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Tarot Card Section */}
        {!mounted ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-24 bg-violet-900/30" />
            <Skeleton className="h-20 w-full bg-violet-900/20" />
          </div>
        ) : dailyTarot && (
          <div className="group cursor-pointer" onClick={onOpenTarot}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-medium text-violet-200">Tarot do Dia</span>
              </div>
              <ChevronRight className="w-4 h-4 text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-600/10 border border-amber-500/20 hover:border-amber-500/40 transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-12 h-16 rounded-md bg-gradient-to-br from-amber-600 to-orange-700 flex items-center justify-center shadow-lg">
                  <span className="text-amber-200 font-bold text-xs">{dailyTarot.numero}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-amber-200 text-sm">{dailyTarot.nome}</h4>
                  <p className="text-xs text-amber-300/80 mt-1 line-clamp-2">{dailyTarot.significado}</p>
                  <div className="flex gap-1 mt-2">
                    {dailyTarot.keywords.slice(0, 3).map((kw, i) => (
                      <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <Separator className="bg-violet-500/20" />

        {/* Affirmation Section */}
        {!mounted ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-20 bg-violet-900/30" />
            <Skeleton className="h-16 w-full bg-violet-900/20" />
          </div>
        ) : dailyAffirmation && (
          <div className="group cursor-pointer" onClick={onOpenAffirmation}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-400" />
                <span className="text-sm font-medium text-violet-200">Afirmação do Dia</span>
              </div>
              <ChevronRight className="w-4 h-4 text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-r from-rose-500/10 to-pink-600/10 border border-rose-500/20 hover:border-rose-500/40 transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg shadow-rose-500/30">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-rose-100 italic leading-relaxed">"{dailyAffirmation.texto}"</p>
                  <Badge variant="outline" className="mt-2 bg-rose-500/20 text-rose-300 border-rose-400/30 text-[10px]">
                    {dailyAffirmation.categoria}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        )}

        <Separator className="bg-violet-500/20" />

        {/* Odu Section */}
        {!mounted ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-16 bg-violet-900/30" />
            <Skeleton className="h-20 w-full bg-violet-900/20" />
          </div>
        ) : dailyOdu && (
          <div className="group cursor-pointer" onClick={onOpenOdu}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-medium text-violet-200">Odú do Dia</span>
              </div>
              <ChevronRight className="w-4 h-4 text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-r from-cyan-500/10 to-teal-600/10 border border-cyan-500/20 hover:border-cyan-500/40 transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-12 h-16 rounded-md bg-gradient-to-br from-cyan-600 to-teal-700 flex items-center justify-center shadow-lg">
                  <span className="text-cyan-200 font-bold text-sm">{dailyOdu.numero}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-cyan-200 text-sm">{dailyOdu.nome}</h4>
                  <p className="text-xs text-cyan-300/80 mt-1 line-clamp-2">{dailyOdu.significado}</p>
                  <div className="flex gap-1 mt-2">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                      {dailyOdu.orixa}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                      {dailyOdu.elementos}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 bg-violet-500/20 border-violet-500/30 text-violet-200 hover:bg-violet-500/30 hover:text-white"
            onClick={onOpenTarot}
          >
            <BookOpen className="w-3 h-3 mr-1" />
            Tarot
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 bg-rose-500/20 border-rose-500/30 text-rose-200 hover:bg-rose-500/30 hover:text-white"
            onClick={onOpenAffirmation}
          >
            <Heart className="w-3 h-3 mr-1" />
            Afirmação
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 bg-cyan-500/20 border-cyan-500/30 text-cyan-200 hover:bg-cyan-500/30 hover:text-white"
            onClick={onOpenOdu}
          >
            <Moon className="w-3 h-3 mr-1" />
            Ifá
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}