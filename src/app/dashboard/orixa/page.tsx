'use client';

import { useState } from 'react';
import { CosmicBackground } from '@/components/design-system/CosmicBackground';
import { Heading } from '@/components/design-system/Typography';
import { MysticDivider } from '@/components/shared/MysticDivider';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ORIXÁ_HERB_MAPPINGS,
  getOrixaHerbMapping,
  getOrixaMainHerbs,
  getHerbOrixas,
  type OrixaName,
  type HerbCategory
} from '@/lib/correlation/orixa-herb';
import { getOrixaChakra, getAllOrixaChakras } from '@/lib/correlation/orixa-chakra';

/**
 * Dashboard Orixá - Página de Força Ancestral e Fitoenergética
 * 
 * Integra:
 * - Orixá-Herb (Fitoenergética) correlation
 * - Orixá-Chakra correlation
 * - Práticas rituais
 * 
 * Arquiteto: MESTRE_ENGENHEIRO_SINTESE_CONSCIENCIAL
 */

const ORIXÁS_PRINCIPAIS: OrixaName[] = [
  'Oxalá', 'Iemanjá', 'Oxum', 'Ogum', 'Xangô',
  'Iansã', 'Oxóssi', 'Omolu', 'Nanã'
];

const CATEGORIAS_HERBS: { id: HerbCategory; label: string; cor: string }[] = [
  { id: 'purificacao', label: 'Purificação', cor: '#4FD1C5' },
  { id: 'harmonizacao', label: 'Harmonização', cor: '#9F7AEA' },
  { id: 'expansao', label: 'Expansão', cor: '#F6AD55' },
  { id: 'protecao', label: 'Proteção', cor: '#FC8181' },
  { id: 'cura', label: 'Cura', cor: '#68D391' },
  { id: 'ancestral', label: 'Ancestral', cor: '#63B3ED' },
  { id: 'sagrada', label: 'Sagrada', cor: '#FFFFF0' },
];

type TabType = 'visao' | 'ervas' | 'praticas' | 'correlacoes';

export default function OrixaPage() {
  const [orixaSelecionado, setOrixaSelecionado] = useState<OrixaName>('Oxalá');
  const [tabAtivo, setTabAtivo] = useState<TabType>('visao');
  const [categoriaFiltro, setCategoriaFiltro] = useState<HerbCategory | 'todas'>('todas');

  const orixaData = getOrixaHerbMapping(orixaSelecionado);
  const chakraData = getOrixaChakra(orixaSelecionado);

  const ervasFiltradas = categoriaFiltro === 'todas'
    ? orixaData?.ervas || []
    : orixaData?.ervas.filter(e => e.categoria === categoriaFiltro) || [];
  return (
    <CosmicBackground>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Heading level={1} className="text-3xl font-bold text-center mb-2">
            ✦ Dashboard dos Orixás ✦
          </Heading>
          <p className="text-center text-muted-foreground">
            Força Ancestral e Fitoenergética — Correlação Sagrada
          </p>
          <MysticDivider className="my-4" />
        </div>

        {/* Seletor de Orixás */}
        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2 mb-8">
          {ORIXÁS_PRINCIPAIS.map(orixa => (
            <Button
              key={orixa}
              variant={orixaSelecionado === orixa ? 'default' : 'outline'}
              onClick={() => setOrixaSelecionado(orixa)}
              className={`h-14 text-xs font-bold transition-all ${
                orixaSelecionado === orixa
                  ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/50'
                  : ''
              }`}
            >
              {orixa}
            </Button>
          ))}
        </div>

        {/* Info do Orixá Selecionado */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border-purple-500/20">
            <h3 className="text-lg font-bold mb-2 text-purple-300">🔮 Descrição</h3>
            <p className="text-sm text-muted-foreground">
              {orixaData?.orixa_descricao || 'Carregando...'}
            </p>
            <div className="mt-4">
              <span className="text-xs text-purple-400">Energia Primária:</span>
              <p className="text-sm font-semibold text-purple-200">
                {orixaData?.energia_primaria || 'N/A'}
              </p>
            </div>
            <div className="mt-4">
              <span className="text-xs text-purple-400">Regência:</span>
              <p className="text-sm text-purple-200">
                {orixaData?.regencia || 'N/A'}
              </p>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border-blue-500/20">
            <h3 className="text-lg font-bold mb-2 text-blue-300">🧘 Chakra</h3>
            {chakraData ? (
              <>
                <p className="text-sm font-semibold text-blue-200">
                  {chakraData.chakra_primario}
                </p>
                {chakraData.chakra_secundario && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Secundário: {chakraData.chakra_secundario}
                  </p>
                )}
                <p className="text-xs text-blue-300 mt-2">
                  {chakraData.elemento} • {chakraData.frequencia}
                </p>
                <div className="flex gap-1 mt-3 flex-wrap">
                  {chakraData.cores.map((cor, i) => (
                    <div
                      key={i}
                      className="w-6 h-6 rounded-full border border-white/20"
                      style={{ backgroundColor: cor }}
                      title={cor}
                    />
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Carregando...</p>
            )}
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {([
            ['visao', 'Visão Geral'],
            ['ervas', 'Ervas'],
            ['praticas', 'Práticas'],
            ['correlacoes', 'Correlações']
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
              <h3 className="text-xl font-bold mb-4">🌿 Ervas Principais</h3>
              <div className="flex flex-wrap gap-2">
                {orixaData?.ervas_principais.map((erva, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-green-900/50 rounded-full text-sm"
                  >
                    {erva}
                  </span>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">⚠️ Ervas Contraindicadas</h3>
              <div className="flex flex-wrap gap-2">
                {orixaData?.ervas_contraindicadas.map((erva, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-red-900/50 rounded-full text-sm text-red-200"
                  >
                    {erva}
                  </span>
                ))}
              </div>
            </Card>

            <Card className="p-6 md:col-span-2">
              <h3 className="text-xl font-bold mb-4">✨ Combinações Rituais</h3>
              <div className="space-y-3">
                {orixaData?.combinacoes_rituais.map((combinacao, i) => (
                  <div
                    key={i}
                    className="p-3 bg-purple-900/20 rounded-lg text-sm"
                  >
                    {combinacao}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {tabAtivo === 'ervas' && (
          <div>
            {/* Filtro de Categoria */}
            <div className="flex flex-wrap gap-2 mb-6">
              <Button
                variant={categoriaFiltro === 'todas' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCategoriaFiltro('todas')}
              >
                Todas
              </Button>
              {CATEGORIAS_HERBS.map(cat => (
                <Button
                  key={cat.id}
                  variant={categoriaFiltro === cat.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCategoriaFiltro(cat.id)}
                  style={{
                    borderColor: cat.cor,
                    color: categoriaFiltro === cat.id ? undefined : cat.cor
                  }}
                >
                  {cat.label}
                </Button>
              ))}
            </div>

            {/* Lista de Ervas */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ervasFiltradas.map((erva, i) => (
                <Card key={i} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-bold">{erva.nome}</h4>
                    <span
                      className="px-2 py-0.5 rounded-full text-xs"
                      style={{ 
                        backgroundColor: CATEGORIAS_HERBS.find(c => c.id === ervasFiltradas[i]?.categoria)?.cor || '#666'
                      }}
                    >
                      {erva.categoria}
                    </span>
                  </div>
                  {erva.nome_cientifico && (
                    <p className="text-xs text-muted-foreground italic mb-2">
                      {erva.nome_cientifico}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mb-2">
                    ⏱️ {erva.tempo_preparo}
                  </p>
                  <p className="text-sm">{erva.significado_ritual}</p>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {erva.aplicacao.map((app, j) => (
                      <span key={j} className="px-2 py-0.5 bg-gray-800 rounded text-xs">
                        {app}
                      </span>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {tabAtivo === 'praticas' && (
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">🕯️ Práticas Fitoenergéticas</h3>
            <div className="space-y-4">
              {orixaData?.praticas_fitoenergeticas.map((pratica, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-2xl">✨</span>
                  <p className="text-sm">{pratica}</p>
                </div>
              ))}
            </div>

            <MysticDivider className="my-6" />

            <h3 className="text-xl font-bold mb-4">🔄 Regência Energética</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-900/20 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Elemento</p>
                <p className="font-semibold">{chakraData?.elemento || 'N/A'}</p>
              </div>
              <div className="p-4 bg-purple-900/20 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Regência</p>
                <p className="font-semibold">{orixaData?.regencia || 'N/A'}</p>
              </div>
            </div>
          </Card>
        )}

        {tabAtivo === 'correlacoes' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">🧘 Chakra Correlacionado</h3>
              {chakraData && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Chakra Primário:</span>
                    <span className="font-bold">{chakraData.chakra_primario}</span>
                  </div>
                  {chakraData.chakra_secundario && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Chakra Secundário:</span>
                      <span className="font-bold">{chakraData.chakra_secundario}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Elemento:</span>
                    <span className="font-bold">{chakraData.elemento}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Frequência:</span>
                    <span className="font-bold">{chakraData.frequencia}</span>
                  </div>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {chakraData.cores.map((cor, i) => (
                      <div
                        key={i}
                        className="px-3 py-1 rounded-full text-xs"
                        style={{ backgroundColor: cor }}
                      >
                        {cor}
                      </div>
                    ))}
                  </div>
                  {chakraData.mantras && (
                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <p className="text-xs text-muted-foreground mb-1">Mantras:</p>
                      <p className="text-sm">{chakraData.mantras.join(', ')}</p>
                    </div>
                  )}
                </div>
              )}
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">🔗 Todos os Orixás e Chakras</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {getAllOrixaChakras().map((mapping, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-lg ${
                      mapping.orixa === orixaSelecionado
                        ? 'bg-purple-900/40 border border-purple-500/50'
                        : 'bg-gray-800/50'
                    }`}
                  >
                    <p className="font-semibold text-sm">{mapping.orixa}</p>
                    <p className="text-xs text-muted-foreground">
                      {mapping.chakra_primario}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </CosmicBackground>
  );
}