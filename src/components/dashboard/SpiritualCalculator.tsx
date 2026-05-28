'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  calcularPitagorica,
  calcularCaldeia,
  calcularCabalistica,
  calcularTantrica,
  calcularPitagoricaData,
  getInterpretacao,
  type InterpretacaoNumerologia
} from '@/lib/numerologia/calculos';
import { getSymbol } from '@/lib/astrologia/symbols';
import { OduInfo, calcularOduPrimario, calcularOduSecundario } from '@/lib/odus/calculos';
import {
  Calculator,
  Sparkles,
  Moon,
  Sun,
  Star,
  Zap,
  Globe,
  Heart,
  Target,
  TrendingUp,
  GitBranch,
  Lightbulb
} from 'lucide-react';

interface SpiritualCalculatorProps {
  className?: string;
}

interface NumerologyResult {
  pitagorica: number;
  caldeia: number;
  cabalistica: number;
  tantrica: number;
  data: number;
  interpretacao: InterpretacaoNumerologia | null;
}

interface CorrelationInsight {
  type: 'harmony' | 'tension' | 'opportunity';
  title: string;
  description: string;
  icon: React.ReactNode;
}

const ZODIAC_CORRELATIONS: Record<number, { sign: string; element: string; quality: string }> = {
  1: { sign: 'aries', element: 'Fogo', quality: 'Cardinal' },
  2: { sign: 'taurus', element: 'Terra', quality: 'Fixo' },
  3: { sign: 'gemini', element: 'Ar', quality: 'Mutável' },
  4: { sign: 'cancer', element: 'Água', quality: 'Cardinal' },
  5: { sign: 'leo', element: 'Fogo', quality: 'Fixo' },
  6: { sign: 'virgo', element: 'Terra', quality: 'Mutável' },
  7: { sign: 'libra', element: 'Ar', quality: 'Cardinal' },
  8: { sign: 'scorpio', element: 'Água', quality: 'Fixo' },
  9: { sign: 'sagittarius', element: 'Fogo', quality: 'Mutável' },
  11: { sign: 'aquarius', element: 'Ar', quality: 'Fixo' },
  22: { sign: 'pisces', element: 'Água', quality: 'Mutável' },
};

const ODU_ELEMENT_MAP: Record<string, string> = {
  'Ogbe': 'Ar', 'Mei': 'Fogo', 'Eyiuka': 'Terra', 'Turupu': 'Água',
  'Ressu': 'Ar', 'Rokolu': 'Fogo', 'Okanran': 'Terra', 'Ogunda': 'Água',
  'Osa': 'Fogo', 'Ika': 'Terra', 'Otura': 'Água', 'Obara': 'Ar',
  'OkanranMei': 'Fogo', 'OgundaTurupu': 'Terra', 'OsaIka': 'Água',
  'Owuare': 'Ar', 'Ejila': 'Fogo', 'Ate': 'Terra', 'Akara': 'Água',
  'AteTurupu': 'Fogo', 'IkaMei': 'Terra', 'OgbeOgunda': 'Água',
  'Ose': 'Ar', 'OwuareMei': 'Fogo', 'OgbeOsa': 'Terra', 'OkanranOsa': 'Água',
  'OgbeRessu': 'Ar', 'OkanranRessu': 'Fogo', 'OsaMei': 'Terra', 'OgundaMei': 'Água',
  'OgbeOgunda': 'Ar', 'MeiOgunda': 'Fogo', 'IkaOkanran': 'Terra', 'OturaOgbe': 'Água',
  'RessuMei': 'Ar', 'OgundaTurupu': 'Fogo', 'OsaIka': 'Terra', 'AkaraOgbe': 'Água',
  'OgbeOgunda': 'Ar', 'OkanranMei': 'Fogo', 'IkaOgunda': 'Terra', 'OturaOsa': 'Água',
  'OseOgbe': 'Ar', 'OwuareOkanran': 'Fogo', 'OgbeOsa': 'Terra', 'MeiOsa': 'Água',
  'OgbeOgunda': 'Ar', 'RessuOgunda': 'Fogo', 'OgundaIka': 'Terra', 'IkaOtura': 'Água',
  'OseMei': 'Ar', 'OwuareRessu': 'Fogo', 'OgbeOgunda': 'Terra', 'OsaOgunda': 'Água',
};

const ELEMENT_COLORS: Record<string, string> = {
  'Fogo': 'from-orange-500/20 to-red-600/20 border-orange-500/30 text-orange-400',
  'Água': 'from-blue-500/20 to-cyan-600/20 border-blue-500/30 text-blue-400',
  'Terra': 'from-amber-500/20 to-yellow-600/20 border-amber-500/30 text-amber-400',
  'Ar': 'from-gray-400/20 to-slate-500/20 border-gray-400/30 text-gray-300',
};

const ODU_CORRELATIONS: Record<number, { odu: string; orixa: string; elemento: string }> = {
  1: { odu: 'Ogbe', orixa: 'Obatalá', elemento: 'Ar' },
  2: { odu: 'Mei', orixa: 'Oxum', elemento: 'Fogo' },
  3: { odu: 'Eyiuka', orixa: 'Oxossi', elemento: 'Terra' },
  4: { odu: 'Turupu', orixa: 'Iemanjá', elemento: 'Água' },
  5: { odu: 'Ressu', orixa: 'Ogum', elemento: 'Ar' },
  6: { odu: 'Rokolu', orixa: 'Obatalá', elemento: 'Fogo' },
  7: { odu: 'Okanran', orixa: 'Oxossi', elemento: 'Terra' },
  8: { odu: 'Ogunda', orixa: 'Ogum', elemento: 'Água' },
  9: { odu: 'Osa', orixa: 'Shangô', elemento: 'Fogo' },
};

export function SpiritualCalculator({ className = '' }: SpiritualCalculatorProps) {
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [activeTab, setActiveTab] = useState('numerology');

  const numerologyResult = useMemo<NumerologyResult | null>(() => {
    if (!name && !birthDate) return null;

    const pitagorica = name ? calcularPitagorica(name) : 0;
    const caldeia = name ? calcularCaldeia(name) : 0;
    const cabalistica = name ? calcularCabalistica(name) : 0;
    const tantrica = name ? calcularTantrica(name) : 0;
    const dataNum = birthDate ? calcularPitagoricaData(birthDate) : 0;
    const interpretacao = pitagorica ? getInterpretacao(pitagorica) : null;

    return {
      pitagorica,
      caldeia,
      cabalistica,
      tantrica,
      data: dataNum,
      interpretacao
    };
  }, [name, birthDate]);

  const oduResult = useMemo<{ primario: OduInfo | null; secundario: OduInfo | null }>(() => {
    if (!birthDate) return { primario: null, secundario: null };
    return {
      primario: calcularOduPrimario(birthDate),
      secundario: calcularOduSecundario(birthDate)
    };
  }, [birthDate]);

  const correlations = useMemo<CorrelationInsight[]>(() => {
    if (!numerologyResult?.interpretacao) return [];

    const insights: CorrelationInsight[] = [];
    const mainNum = numerologyResult.pitagorica;
    const odu = oduResult.primario;

    // Numerology-Astrology correlation
    if (ZODIAC_CORRELATIONS[mainNum]) {
      const astro = ZODIAC_CORRELATIONS[mainNum];
      insights.push({
        type: 'harmony',
        title: `Número ${mainNum} + ${astro.sign.charAt(0).toUpperCase() + astro.sign.slice(1)}`,
        description: `A energia do número ${mainNum} ressoa com o signo de ${astro.sign}. O elemento ${astro.element.toLowerCase()} amplifica suas tendências natais.`,
        icon: <Star className="w-4 h-4" />
      });
    }

    // Numerology-Ifá correlation
    if (odu && ODU_CORRELATIONS[mainNum % 9 === 0 ? 9 : mainNum % 9]) {
      const ifaCorr = ODU_CORRELATIONS[mainNum % 9 === 0 ? 9 : mainNum % 9];
      const numElem = mainNum <= 4 ? ['Fogo', 'Terra', 'Ar', 'Água'][mainNum - 1] : ['Fogo', 'Terra', 'Água', 'Ar'][(mainNum - 5) % 4];

      if (ifaCorr.elemento === numElem) {
        insights.push({
          type: 'harmony',
          title: `Tríplice Elemento: ${numElem}`,
          description: `Número, signo e ${odu.nome} compartilham a energia de ${numElem.toLowerCase()}. Este é um alinhamento espiritual poderoso.`,
          icon: <Zap className="w-4 h-4" />
        });
      } else {
        insights.push({
          type: 'opportunity',
          title: `${numElem} + ${ifaCorr.elemento}`,
          description: `A tensão entre ${numElem.toLowerCase()} e ${ifaCorr.elemento.toLowerCase()} cria um campo de aprendizado espiritual. Use esta energia para evolução.`,
          icon: <Lightbulb className="w-4 h-4" />
        });
      }
    }

    // Master numbers correlation
    if (mainNum === 11 || mainNum === 22 || mainNum === 33) {
      insights.push({
        type: 'harmony',
        title: `Número Mestre: ${mainNum}`,
        description: `Como portador de um número mestre, você tem acesso a conhecimentos espirituais avançados que transcendem os sistemas tradicionais.`,
        icon: <Globe className="w-4 h-4" />
      });
    }

    // Data numerology correlation
    if (numerologyResult.data && numerologyResult.data !== mainNum) {
      insights.push({
        type: 'opportunity',
        title: `Caminho de Vida ${numerologyResult.data}`,
        description: `Seu caminho de vida vibra em ${numerologyResult.data}. Esta energia complementa seu número de expressão ${mainNum}, criando uma jornada de desenvolvimento.`,
        icon: <TrendingUp className="w-4 h-4" />
      });
    }

    return insights;
  }, [numerologyResult, oduResult]);

  const getCorrelationColor = (type: CorrelationInsight['type']) => {
    switch (type) {
      case 'harmony': return 'bg-green-500/20 border-green-500/30';
      case 'tension': return 'bg-red-500/20 border-red-500/30';
      case 'opportunity': return 'bg-amber-500/20 border-amber-500/30';
    }
  };

  const getCorrelationIcon = (type: CorrelationInsight['type']) => {
    switch (type) {
      case 'harmony': return '✨';
      case 'tension': return '⚡';
      case 'opportunity': return '🌟';
    }
  };

  const getElementColor = (element: string) => {
    return ELEMENT_COLORS[element] || ELEMENT_COLORS['Ar'];
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20">
              <Calculator className="w-5 h-5 text-purple-400" />
            </div>
            <CardTitle className="text-lg">Calculadora Espiritual</CardTitle>
          </div>
          <Badge variant="outline" className="bg-gradient-to-r from-purple-500/10 to-pink-500/10">
            Numerologia + Astrologia + Ifá
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Input Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Nome Completo
            </label>
            <Input
              placeholder="Digite seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-white/5 border-white/10"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Data de Nascimento
            </label>
            <Input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="bg-white/5 border-white/10"
            />
          </div>
        </div>

        {/* Results Section */}
        {(name || birthDate) && numerologyResult && (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="numerology" className="gap-2">
                <Sparkles className="w-4 h-4" />
                Numerologia
              </TabsTrigger>
              <TabsTrigger value="astrology" className="gap-2">
                <Moon className="w-4 h-4" />
                Astrologia
              </TabsTrigger>
              <TabsTrigger value="ifa" className="gap-2">
                <GitBranch className="w-4 h-4" />
                Ifá
              </TabsTrigger>
            </TabsList>

            <TabsContent value="numerology" className="space-y-4 pt-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {name && (
                  <>
                    <div className="p-4 rounded-lg bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20 text-center">
                      <div className="text-3xl font-bold text-violet-400">{numerologyResult.pitagorica}</div>
                      <div className="text-xs text-muted-foreground mt-1">Pitagórica</div>
                    </div>
                    <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 text-center">
                      <div className="text-3xl font-bold text-blue-400">{numerologyResult.caldeia}</div>
                      <div className="text-xs text-muted-foreground mt-1">Caldeia</div>
                    </div>
                    <div className="p-4 rounded-lg bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border border-amber-500/20 text-center">
                      <div className="text-3xl font-bold text-amber-400">{numerologyResult.cabalistica}</div>
                      <div className="text-xs text-muted-foreground mt-1">Cabalística</div>
                    </div>
                    <div className="p-4 rounded-lg bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 text-center">
                      <div className="text-3xl font-bold text-emerald-400">{numerologyResult.tantrica}</div>
                      <div className="text-xs text-muted-foreground mt-1">Tântrica</div>
                    </div>
                  </>
                )}
                {birthDate && (
                  <div className="col-span-2 md:col-span-4 p-4 rounded-lg bg-gradient-to-br from-pink-500/10 to-rose-500/10 border border-pink-500/20 text-center">
                    <div className="text-3xl font-bold text-pink-400">{numerologyResult.data}</div>
                    <div className="text-xs text-muted-foreground mt-1">Caminho de Vida (data)</div>
                  </div>
                )}
              </div>

              {numerologyResult.interpretacao && (
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Interpretação
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {numerologyResult.interpretacao.descricao}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {numerologyResult.interpretacao.temas.map((tema, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {tema}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="astrology" className="space-y-4 pt-4">
              {numerologyResult?.pitagorica && ZODIAC_CORRELATIONS[numerologyResult.pitagorica] ? (
                <>
                  <div className="flex items-center gap-6 p-4 rounded-lg bg-white/5 border border-white/10">
                    <div
                      className="w-20 h-20 text-6xl"
                      dangerouslySetInnerHTML={{ __html: getSymbol('zodiac', ZODIAC_CORRELATIONS[numerologyResult.pitagorica].sign) }}
                    />
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold capitalize">
                        {ZODIAC_CORRELATIONS[numerologyResult.pitagorica].sign}
                      </h3>
                      <div className="flex gap-2">
                        <Badge variant="outline">
                          {ZODIAC_CORRELATIONS[numerologyResult.pitagorica].element}
                        </Badge>
                        <Badge variant="outline">
                          {ZODIAC_CORRELATIONS[numerologyResult.pitagorica].quality}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {['sun', 'moon', 'mercury', 'venus', 'mars'].map((planet) => (
                      <div key={planet} className="p-3 rounded-lg bg-white/5 border border-white/10 flex items-center gap-3">
                        <div
                          className="w-10 h-10"
                          dangerouslySetInnerHTML={{ __html: getSymbol('planet', planet) }}
                        />
                        <span className="text-sm capitalize">{planet}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Star className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Informe o nome para ver correlações astrológicas</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="ifa" className="space-y-4 pt-4">
              {oduResult.primario ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={`p-4 rounded-lg bg-white/5 border ${getElementColor(oduResult.primario.elementos)}`}>
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="outline" className="text-lg px-3 py-1">
                          {oduResult.primario.numero}
                        </Badge>
                        <span className="text-2xl font-bold">{oduResult.primario.nome}</span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Orixá:</span>
                          <span className="font-medium">{oduResult.primario.orixaRegente}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Elemento:</span>
                          <span className="font-medium">{oduResult.primario.elementos}</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-3">
                        {oduResult.primario.significado}
                      </p>
                    </div>

                    {oduResult.secundario && (
                      <div className={`p-4 rounded-lg bg-white/5 border ${getElementColor(oduResult.secundario.elementos)}`}>
                        <div className="flex items-center justify-between mb-3">
                          <Badge variant="outline" className="text-lg px-3 py-1">
                            {oduResult.secundario.numero}
                          </Badge>
                          <span className="text-xl font-bold">{oduResult.secundario.nome}</span>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Orixá:</span>
                            <span className="font-medium">{oduResult.secundario.orixaRegente}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Elemento:</span>
                            <span className="font-medium">{oduResult.secundario.elementos}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <GitBranch className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Informe a data de nascimento para consultar Ifá</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}

        {/* Correlations Section */}
        {correlations.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Correlações Espirituais
              </h4>
              <div className="grid gap-3">
                {correlations.map((corr, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-lg border ${getCorrelationColor(corr.type)}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-lg">{getCorrelationIcon(corr.type)}</span>
                      <div className="flex-1">
                        <h5 className="font-medium text-sm">{corr.title}</h5>
                        <p className="text-xs text-muted-foreground mt-1">{corr.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Empty State */}
        {!name && !birthDate && (
          <div className="text-center py-12">
            <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 mb-4">
              <Sparkles className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="font-medium mb-2">Calculadora Espiritual Unificada</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Insira seu nome e data de nascimento para revelar as conexões entre numerologia,
              astrologia e Ifá. Descubra como suas energias se harmonizam.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default SpiritualCalculator;