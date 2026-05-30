'use client';

import { useState } from 'react';
import { CosmicBackground } from '@/components/design-system/CosmicBackground';
import { Heading } from '@/components/design-system/Typography';
import { MysticDivider } from '@/components/shared/MysticDivider';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getChakraDay, getDayChakra } from '@/lib/correlation/chakra-day';
import { getPlanetChakra, getChakraPlanet } from '@/lib/correlation/chakra-planet';
import { getChakraFrequency } from '@/lib/correlation/chakra-frequency';
import { getAllChakraDays } from '@/lib/correlation/chakra-day';
import { getAllChakraPlanets, getAllPlanetChakras } from '@/lib/correlation/chakra-planet';
import { getAllChakraFrequencies } from '@/lib/correlation/chakra-frequency';

/**
 * Dashboard Chakra - Página de Harmonização Energética
 * 
 * Integra:
 * - Chakra-Day correlation
 * - Chakra-Planet correlation
 * - Chakra-Frequency correlation
 * - Práticas de harmonização
 * 
 * Arquiteto: MESTRE_ENGENHEIRO_SINTESE_CONSCIENCIAL
 */

type ChakraName = 
  | 'Muladhara'
  | 'Svadhisthana'
  | 'Manipura'
  | 'Anahata'
  | 'Vishuddha'
  | 'Ajna'
  | 'Sahasrara';

const CHAKRAS: { nome: ChakraName; numero: string; cor: string; elemento: string; }[] = [
  { nome: 'Muladhara', numero: '1º', cor: '#DC2626', elemento: 'Terra' },
  { nome: 'Svadhisthana', numero: '2º', cor: '#EA580C', elemento: 'Água' },
  { nome: 'Manipura', numero: '3º', cor: '#CA8A04', elemento: 'Fogo' },
  { nome: 'Anahata', numero: '4º', cor: '#16A34A', elemento: 'Ar' },
  { nome: 'Vishuddha', numero: '5º', cor: '#0EA5E9', elemento: 'Éter' },
  { nome: 'Ajna', numero: '6º', cor: '#7C3AED', elemento: 'Luz' },
  { nome: 'Sahasrara', numero: '7º', cor: '#FFFFFF', elemento: 'Divino' },
];

const DIAS = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];

const PLANETAS = ['Sol', 'Lua', 'Mercúrio', 'Vênus', 'Marte', 'Júpiter', 'Saturno'];

type TabType = 'visao' | 'dias' | 'planetas' | 'frequencias';

export default function ChakraPage() {
  const [chakraSelecionado, setChakraSelecionado] = useState<ChakraName>('Muladhara');
  const [tabAtivo, setTabAtivo] = useState<TabType>('visao');

  const chakraData = CHAKRAS.find(c => c.nome === chakraSelecionado);
  const planetaData = getChakraPlanet(chakraSelecionado);
  const frequencyData = getChakraFrequency(chakraSelecionado);

  const allDaysData = getDayChakra([0, 1, 2, 3, 4, 5, 6].indexOf(0)); // Monday
  const allPlanetsData = getChakraPlanet(chakraSelecionado);
  const allFrequenciesData = getChakraFrequency(chakraSelecionado);

  return (
    <CosmicBackground>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Heading level={1} className="text-3xl font-bold text-center mb-2">
            ✦ Dashboard dos Chakras ✦
          </Heading>
          <p className="text-center text-muted-foreground">
            Harmonização Energética — Os 7 Centros de Poder
          </p>
          <MysticDivider className="my-4" />
        </div>

        {/* Seletor de Chakras */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {CHAKRAS.map((chakra, index) => (
            <Button
              key={chakra.nome}
              variant={chakraSelecionado === chakra.nome ? 'default' : 'outline'}
              onClick={() => setChakraSelecionado(chakra.nome)}
              className={`min-w-24 h-16 flex flex-col items-center justify-center transition-all ${
                chakraSelecionado === chakra.nome
                  ? 'shadow-lg'
                  : ''
              }`}
              style={{
                backgroundColor: chakraSelecionado === chakra.nome ? chakra.cor : undefined,
                borderColor: chakra.cor
              }}
            >
              <span className="font-bold text-xs">{chakra.nome}</span>
              <span className="text-xs opacity-75">{chakra.numero}</span>
            </Button>
          ))}
        </div>

        {/* Info do Chakra Selecionado */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 text-center" style={{ borderColor: chakraData?.cor }}>
            <div 
              className="w-16 h-16 rounded-full mx-auto mb-2"
              style={{ backgroundColor: chakraData?.cor }}
            />
            <h3 className="font-bold text-sm">Cor</h3>
            <p className="text-xs text-muted-foreground">{chakraData?.cor}</p>
          </Card>

          <Card className="p-4 text-center">
            <span className="text-3xl">🌍</span>
            <h3 className="font-bold text-sm mt-2">Elemento</h3>
            <p className="text-xs text-muted-foreground">{chakraData?.elemento}</p>
          </Card>

          <Card className="p-4 text-center">
            <span className="text-3xl">🌟</span>
            <h3 className="font-bold text-sm mt-2">Planeta</h3>
            <p className="text-xs text-muted-foreground">{planetaData?.planeta || 'N/A'}</p>
          </Card>

          <Card className="p-4 text-center">
            <span className="text-3xl">🎵</span>
            <h3 className="font-bold text-sm mt-2">Frequência</h3>
            <p className="text-xs text-muted-foreground">{frequencyData?.frequencia || 'N/A'}</p>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {([
            ['visao', 'Visão Geral'],
            ['dias', 'Dias da Semana'],
            ['planetas', 'Planetas'],
            ['frequencias', 'Frequências']
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
        {tabAtivo === 'visao' && (
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">🧘 Características do Chakra</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Nome:</span>
                  <span className="font-semibold">{chakraSelecionado}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Número:</span>
                  <span className="font-semibold">{chakraData?.numero}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Elemento:</span>
                  <span className="font-semibold">{chakraData?.elemento}</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">🎵 Frequência e Som</h3>
              {frequencyData && (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Frequência:</span>
                    <span className="font-semibold">{frequencyData.frequencia}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Mantra:</span>
                    <span className="font-semibold">{frequencyData.mantra}</span>
                  </div>
                  {frequencyData.acoes && (
                    <div className="flex justify-between">
                      <span className="text-sm">Ações:</span>
                      <span className="font-semibold text-xs">{frequencyData.acoes.slice(0, 2).join(', ')}</span>
                    </div>
                  )}
                </div>
              )}
            </Card>

            <Card className="p-6 md:col-span-2">
              <h3 className="text-xl font-bold mb-4">✨ Todos os Chakras</h3>
              <div className="grid grid-cols-7 gap-2">
                {CHAKRAS.map(chakra => (
                  <div
                    key={chakra.nome}
                    className={`p-2 rounded-lg text-center cursor-pointer ${
                      chakraSelecionado === chakra.nome
                        ? 'bg-purple-900/40 border-2'
                        : 'bg-gray-800/50'
                    }`}
                    onClick={() => setChakraSelecionado(chakra.nome)}
                  >
                    <div
                      className="w-8 h-8 rounded-full mx-auto mb-1"
                      style={{ backgroundColor: chakra.cor }}
                    />
                    <p className="text-xs font-semibold">{chakra.numero}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {tabAtivo === 'dias' && (
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">📅 Chakras por Dia da Semana</h3>
            <div className="space-y-4">
              {DIAS.map((dia, index) => {
                const mappings = getDayChakra(index);
                return (
                  <div key={dia} className="p-4 bg-gray-800/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold">{dia}</span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {mappings.map((mapping, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 px-3 py-1 bg-gray-900/50 rounded-full"
                        >
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: CHAKRAS.find(c => c.nome === mapping.chakra)?.cor }}
                          />
                          <span className="text-xs">{mapping.chakra}</span>
                          <span className="text-xs opacity-60">({mapping.elemento})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {tabAtivo === 'planetas' && (
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">🌟 Planetas por Chakra</h3>
            <div className="space-y-4">
              {CHAKRAS.map(chakra => {
                const planetMapping = getChakraPlanet(chakra.nome);
                return (
                  <div key={chakra.nome} className="flex items-center gap-4 p-3 bg-gray-800/30 rounded-lg">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: chakra.cor }}
                    >
                      <span className="text-sm font-bold">{chakra.numero}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{chakra.nome}</p>
                      <p className="text-xs text-muted-foreground">{chakra.elemento}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">{planetMapping?.planeta || 'N/A'}</p>
                      <p className="text-xs opacity-60">{planetMapping?.signo || 'N/A'}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {tabAtivo === 'frequencias' && (
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">🎵 Frequências Solfeggio por Chakra</h3>
            <div className="space-y-4">
              {CHAKRAS.map(chakra => {
                const freqMapping = getChakraFrequency(chakra.nome);
                return (
                  <div key={chakra.nome} className="p-4 bg-gray-800/30 rounded-lg">
                    <div className="flex items-center gap-4 mb-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: chakra.cor }}
                      >
                        <span className="text-sm font-bold">{chakra.numero}</span>
                      </div>
                      <div>
                        <p className="font-semibold">{chakra.nome}</p>
                        <p className="text-xs text-muted-foreground">{chakra.elemento}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {freqMapping && (
                        <>
                          <div className="p-2 bg-green-900/20 rounded">
                            <p className="text-xs text-muted-foreground">Frequência</p>
                            <p className="font-bold text-sm">{freqMapping.frequencia}</p>
                          </div>
                          <div className="p-2 bg-purple-900/20 rounded">
                            <p className="text-xs text-muted-foreground">Mantra</p>
                            <p className="font-bold text-sm">{freqMapping.mantra}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>
    </CosmicBackground>
  );
}