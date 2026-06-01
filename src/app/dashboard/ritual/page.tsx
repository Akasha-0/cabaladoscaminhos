'use client';

import { useState } from 'react';
import { CosmicBackground } from '@/components/design-system/CosmicBackground';
import { Heading } from '@/components/design-system/Typography';
import { MysticDivider } from '@/components/shared/MysticDivider';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { generateRitualPlan, getWeeklyRitualSchedule, type RitualPlan } from '@/lib/correlation/ritual-planner';
import { ORIXÁ_HERB_MAPPINGS } from '@/lib/correlation/orixa-herb';
import { PLANET_HERB_MAPPINGS } from '@/lib/correlation/planet-herb';

/**
 * Dashboard Ritual - Página de Planejamento de Rituais
 * 
 * Integra:
 * - Ritual planner (generateRitualPlan, getWeeklyRitualSchedule)
 * - Orixá-Herb (Fitoenergética)
 * - Planet-Herb (Harmonização Planetária)
 * - Dia da semana
 * - Luna phases
 * 
 * Arquiteto: MESTRE_ENGENHEIRO_SINTESE_CONSCIENCIAL
 */

const DIAS_SEMANA = [
  { nome: 'Segunda-feira', index: 0, planeta: 'Lua', elemento: 'Água', orixa: 'Iemanjá' },
  { nome: 'Terça-feira', index: 1, planeta: 'Marte', elemento: 'Fogo', orixa: 'Ogum' },
  { nome: 'Quarta-feira', index: 2, planeta: 'Mercúrio', elemento: 'Ar', orixa: 'Oxum' },
  { nome: 'Quinta-feira', index: 3, planeta: 'Júpiter', elemento: 'Fogo/Água', orixa: 'Oxóssi' },
  { nome: 'Sexta-feira', index: 4, planeta: 'Vênus', elemento: 'Terra', orixa: 'Oxum' },
  { nome: 'Sábado', index: 5, planeta: 'Saturno', elemento: 'Terra/Ar', orixa: 'Nanã' },
  { nome: 'Domingo', index: 6, planeta: 'Sol', elemento: 'Fogo', orixa: 'Oxalá' },
];

const TIPOS_SINTOMAS = [
  'ansiedade',
  'fadiga',
  'medo',
  'tristeza',
  'raiva',
  'confusao',
  'isolamento',
  'bloqueio'
];

type TabType = 'hoje' | 'semana' | 'plantas' | 'eruas';

export default function RitualPage() {
  const [tabAtivo, setTabAtivo] = useState<TabType>('hoje');
  const [ritual, setRitual] = useState<RitualPlan | null>(null);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const gerarRitual = async () => {
    setLoading(true);
    try {
      const plan = generateRitualPlan(new Date().toISOString(), symptoms.length > 0 ? symptoms : undefined);
      setRitual(plan);
    } catch (error) {
      console.error('Erro ao gerar ritual:', error);
    }
    setLoading(false);
  };

  const todaySchedule = getWeeklyRitualSchedule();
  const todayInfo = DIAS_SEMANA[new Date().getDay()];

  return (
    <CosmicBackground>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Heading as="h1" className="text-3xl font-bold text-center mb-2">
            ✦ Dashboard de Rituais ✦
          </Heading>
          <p className="text-center text-muted-foreground">
            Planejamento Ritual — Orixás, Planetas e Ervas
          </p>
          <MysticDivider className="my-4" />
        </div>

        {/* Info do Dia Atual */}
        <Card className="p-6 mb-8 bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border-purple-500/20">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
              <h3 className="text-2xl font-bold">{todayInfo.nome}</h3>
              <p className="text-muted-foreground">Dia de hoje</p>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <span className="text-2xl">🌍</span>
                <p className="text-xs">Elemento</p>
                <p className="font-semibold">{todayInfo.elemento}</p>
              </div>
              <div>
                <span className="text-2xl">🌟</span>
                <p className="text-xs">Planeta</p>
                <p className="font-semibold">{todayInfo.planeta}</p>
              </div>
              <div>
                <span className="text-2xl">🕯️</span>
                <p className="text-xs">Orixá</p>
                <p className="font-semibold">{todayInfo.orixa}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {([
            ['hoje', 'Ritual de Hoje'],
            ['semana', 'Agenda Semanal'],
            ['plantas', 'Plantas Energéticas'],
            ['eruas', 'Ervas por Orixá']
          ] as [TabType, string][]).map(([tab, label]) => (
            <Button
              key={tab}
              variant={tabAtivo === tab ? 'default' : 'outline'}
              onClick={() => setTabAtivo(tab)}
              size="sm"
            >
              {label}
            </Button>
          ))}
        </div>

        {/* Conteúdo das Tabs */}
        {tabAtivo === 'hoje' && (
          <div className="space-y-6">
            {/* Seletor de Sintomas */}
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">🎯 Personalizar Ritual</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Selecione sintomas ou estados que deseja harmonizar:
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {TIPOS_SINTOMAS.map(sintoma => (
                  <Button
                    key={sintoma}
                    variant={symptoms.includes(sintoma) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setSymptoms(prev =>
                        prev.includes(sintoma)
                          ? prev.filter(s => s !== sintoma)
                          : [...prev, sintoma]
                      );
                    }}
                  >
                    {sintoma}
                  </Button>
                ))}
              </div>
              <Button onClick={gerarRitual} disabled={loading} className="w-full">
                {loading ? 'Gerando...' : '✨ Gerar Ritual Personalizado'}
              </Button>
            </Card>

            {/* Ritual Gerado */}
            {ritual && (
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4">🕯️ Ritual de Hoje</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-800/30 rounded-lg">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">🕯️</span>
                      <div className="flex-1">
                        <h4 className="font-bold">{ritual.name}</h4>
                        <p className="text-sm text-muted-foreground">Fase Lunar: {ritual.lunarPhase}</p>
                        <p className="text-sm text-muted-foreground">Dia: {ritual.dayOfWeek}</p>
                        {ritual.affirmations.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {ritual.affirmations.map((affirmation, j) => (
                              <span key={j} className="px-2 py-0.5 bg-green-900/50 rounded-full text-xs">
                                {affirmation}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}

        {tabAtivo === 'semana' && (
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">📅 Agenda Semanal de Rituais</h3>
            <div className="space-y-4">
              {todaySchedule.map((day, i) => {
                const dayInfo = DIAS_SEMANA[i];
                return (
                  <div key={i} className="p-4 bg-gray-800/30 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold">{dayInfo.nome}</h4>
                      <div className="flex gap-2">
                        <span className="px-2 py-0.5 bg-purple-900/50 rounded text-xs">
                          {dayInfo.planeta}
                        </span>
                        <span className="px-2 py-0.5 bg-blue-900/50 rounded text-xs">
                          {dayInfo.orixa}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {day.name || 'Dia de harmonia e proteção'}
                    </p>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {tabAtivo === 'plantas' && (
          <div className="grid md:grid-cols-2 gap-4">
            {PLANET_HERB_MAPPINGS.map(planeta => (
              <Card key={planeta.planeta} className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">
                    {planeta.planeta === 'Sol' ? '☀️' :
                     planeta.planeta === 'Lua' ? '🌙' :
                     planeta.planeta === 'Mercúrio' ? '☿️' :
                     planeta.planeta === 'Vênus' ? '♀️' :
                     planeta.planeta === 'Marte' ? '♂️' :
                     planeta.planeta === 'Júpiter' ? '♃' :
                     planeta.planeta === 'Saturno' ? '♄' : '🌟'}
                  </span>
                  <div>
                    <h4 className="font-bold">{planeta.planeta}</h4>
                    <p className="text-xs text-muted-foreground">{planeta.dia_semana}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {planeta.ervas_principais.map((erva, i) => (
                    <span key={i} className="px-2 py-0.5 bg-green-900/50 rounded text-xs">
                      {erva}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {planeta.praticas_planetarias[0] || 'Prática recomendada'}
                </p>
              </Card>
            ))}
          </div>
        )}

        {tabAtivo === 'eruas' && (
          <div className="grid md:grid-cols-2 gap-4">
            {ORIXÁ_HERB_MAPPINGS.slice(0, 8).map(orixa => (
              <Card key={orixa.orixa} className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">🕯️</span>
                  <div>
                    <h4 className="font-bold">{orixa.orixa}</h4>
                    <p className="text-xs text-muted-foreground">{orixa.energia_primaria}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {orixa.erivas_principais.slice(0, 4).map((erva, i) => (
                    <span key={i} className="px-2 py-0.5 bg-green-900/50 rounded text-xs">
                      {erva}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {orixa.praticas_fitoenergeticas[0] || 'Prática fitoenergética'}
                </p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </CosmicBackground>
  );
}