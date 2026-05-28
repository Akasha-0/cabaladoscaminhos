'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FREQUENCIAS_SOLFEGGIO, FREQUENCIAS_EXTENDIDAS, getFrequenciaPorChakra, getFrequenciaPorSefirot } from '@/lib/frequencias/dados';

const CHAKRAS_INFO = [
  { numero: 1, nome: 'Raiz', cor: '#DC2626', planeta: 'Marte', dia: 'Terça' },
  { numero: 2, nome: 'Sacral', cor: '#F97316', planeta: 'Lua', dia: 'Segunda' },
  { numero: 3, nome: 'Plexo Solar', cor: '#EAB308', planeta: 'Sol', dia: 'Domingo' },
  { numero: 4, nome: 'Cardíaco', cor: '#22C55E', planeta: 'Vênus', dia: 'Sexta' },
  { numero: 5, nome: 'Laríngeo', cor: '#3B82F6', planeta: 'Mercúrio', dia: 'Quarta' },
  { numero: 6, nome: 'Frontal', cor: '#7C3AED', planeta: 'Lua', dia: 'Segunda' },
  { numero: 7, nome: 'Coronário', cor: '#FFFFFF', planeta: 'Netuno', dia: 'Segunda' },
];

interface FrequenciaCardProps {
  freq: typeof FREQUENCIAS_SOLFEGGIO[0];
  compact?: boolean;
}

function FrequenciaCard({ freq }: FrequenciaCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card
      className={`p-4 cursor-pointer transition-all hover:scale-[1.02] ${
        expanded ? 'border-indigo-500' : 'border-slate-700/50'
      }`}
      style={{ 
        backgroundColor: `${freq.cor}10`,
        borderColor: `${freq.cor}40`,
      }}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center gap-4">
        <div
          className="w-16 h-16 rounded-full flex flex-col items-center justify-center"
          style={{ backgroundColor: `${freq.cor}30`, border: `3px solid ${freq.cor}` }}
        >
          <span className="text-xs text-slate-400">{freq.hz}</span>
          <span className="text-lg font-bold" style={{ color: freq.cor }}>Hz</span>
        </div>

        <div className="flex-1">
          <h3 className="font-serif text-lg text-slate-100">{freq.nome}</h3>
          <p className="text-sm text-slate-400">
            Nota: {freq.nota} • {freq.chakra ? `${freq.chakra}º Chakra` : 'Nenhum'} {freq.sefirot ? `• ${freq.sefirot}` : ''}
          </p>
        </div>

        {freq.chakra && (
          <div className="flex flex-col items-center">
            <div
              className="w-8 h-8 rounded-full"
              style={{ backgroundColor: freq.cor }}
            />
            <span className="text-xs text-slate-400 mt-1">{freq.chakra}º</span>
          </div>
        )}
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-slate-700/30 space-y-4">
          <p className="text-sm text-slate-300">{freq.descricao}</p>

          <div>
            <h4 className="text-sm font-medium text-slate-200 mb-2">Benefícios</h4>
            <ul className="space-y-1">
              {freq.beneficios.map((b) => (
                <li key={b} className="text-sm text-slate-400 flex items-start gap-2">
                  <span style={{ color: freq.cor }}>✦</span>
                  {b}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-medium text-slate-200 mb-2">Aplicações</h4>
            <ul className="space-y-1">
              {freq.aplicacoes.map((a) => (
                <li key={a} className="text-sm text-slate-400 flex items-start gap-2">
                  <span style={{ color: freq.cor }}>→</span>
                  {a}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center gap-4 p-3 rounded-lg bg-slate-800/30">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-2xl"
              style={{ backgroundColor: `${freq.cor}20` }}
            >
              🕉️
            </div>
            <div>
              <p className="text-sm text-slate-400">Mantra</p>
              <p className="font-serif text-lg" style={{ color: freq.cor }}>{freq.mantra}</p>
            </div>
          </div>

          {freq.elemento && (
            <div className="flex gap-2">
              <span
                className="px-3 py-1 text-xs rounded-full"
                style={{ backgroundColor: `${freq.cor}20`, color: freq.cor }}
              >
                {freq.elemento}
              </span>
              {freq.sefirot && (
                <span className="px-3 py-1 text-xs rounded-full bg-indigo-900/30 text-indigo-300">
                  {freq.sefirot}
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

export function FrequenciasExplorer() {
  const [view, setView] = useState<'lista' | 'chakra' | 'sefirot'>('lista');
  const [chakraFiltro, setChakraFiltro] = useState<number | null>(null);
  const [sefirotFiltro, setSefirotFiltro] = useState<string | null>(null);

  const frequenciasFiltradas = useMemo(() => {
    if (view === 'chakra' && chakraFiltro) {
      return getFrequenciaPorChakra(chakraFiltro);
    }
    if (view === 'sefirot' && sefirotFiltro) {
      return getFrequenciaPorSefirot(sefirotFiltro);
    }
    return FREQUENCIAS_SOLFEGGIO;
  }, [view, chakraFiltro, sefirotFiltro]);

  return (
    <div className="space-y-6">
      <Card className="p-4 bg-slate-900/50 border-slate-700/50">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm text-slate-400 mb-2">Visualização</label>
            <Tabs value={view} onValueChange={(v) => setView(v as typeof view)}>
              <TabsList className="bg-slate-800/50">
                <TabsTrigger value="lista" className="data-[state=active]:bg-indigo-600 text-xs">
                  Lista Completa
                </TabsTrigger>
                <TabsTrigger value="chakra" className="data-[state=active]:bg-indigo-600 text-xs">
                  Por Chakra
                </TabsTrigger>
                <TabsTrigger value="sefirot" className="data-[state=active]:bg-indigo-600 text-xs">
                  Por Sefirot
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {view === 'chakra' && (
            <div className="flex-1">
              <label className="block text-sm text-slate-400 mb-2">Selecionar Chakra</label>
              <select
                className="w-full p-2 rounded-md bg-slate-800 border border-slate-700 text-slate-200"
                value={chakraFiltro || ''}
                onChange={(e) => setChakraFiltro(parseInt(e.target.value) || null)}
              >
                <option value="">Todos</option>
                {CHAKRAS_INFO.map((c) => (
                  <option key={c.numero} value={c.numero}>
                    {c.numero}º - {c.nome}
                  </option>
                ))}
              </select>
            </div>
          )}

          {view === 'sefirot' && (
            <div className="flex-1">
              <label className="block text-sm text-slate-400 mb-2">Selecionar Sefirot</label>
              <select
                className="w-full p-2 rounded-md bg-slate-800 border border-slate-700 text-slate-200"
                value={sefirotFiltro || ''}
                onChange={(e) => setSefirotFiltro(e.target.value || null)}
              >
                <option value="">Todos</option>
                <option value="Kether">Kether</option>
                <option value="Chokmah">Chokmah</option>
                <option value="Binah">Binah</option>
                <option value="Geburah">Geburah</option>
                <option value="Chesed">Chesed</option>
                <option value="Tiphereth">Tiphereth</option>
                <option value="Netzach">Netzach</option>
                <option value="Hod">Hod</option>
                <option value="Yesod">Yesod</option>
                <option value="Malkuth">Malkuth</option>
              </select>
            </div>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {frequenciasFiltradas.map((freq) => (
          <FrequenciaCard key={freq.id} freq={freq} />
        ))}
      </div>

      <Card className="p-6 bg-slate-900/30 border-slate-700/30">
        <h3 className="font-serif text-lg text-slate-200 mb-4">Frequências Extendidas</h3>
        <p className="text-sm text-slate-400 mb-4">
          Além das 9 frequências Solfeggio tradicionais, existem outras frequências ascensionais que podem ser usadas para desenvolvimento espiritual.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {FREQUENCIAS_EXTENDIDAS.map((freq, idx) => (
            <div
              key={idx}
              className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/30"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{ 
                    backgroundColor: `hsl(${(idx * 40) % 360}, 70%, 20%)`,
                    color: `hsl(${(idx * 40) % 360}, 70%, 60%)`
                  }}
                >
                  {freq.hz}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-200">{freq.nome}</p>
                  <p className="text-xs text-slate-400">{freq.beneficios[0]}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6 bg-slate-900/20 border-slate-700/20">
        <h3 className="font-serif text-lg text-slate-300 mb-3">Como Usar as Frequências</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-400">
          <div>
            <h4 className="text-slate-300 font-medium mb-2">Práticas de Som</h4>
            <ul className="space-y-2">
              <li>• Ouça as frequências durante meditação (fones de ouvido recomendados)</li>
              <li>• Use bowls tibetanos ou diapasões calibrados nas frequências</li>
              <li>• Pratique canto de mantras correspondentes às frequências</li>
              <li>• Estruture água com as frequências (8 copos, 24 horas)</li>
            </ul>
          </div>
          <div>
            <h4 className="text-slate-300 font-medium mb-2">Integração com Tradições</h4>
            <ul className="space-y-2">
              <li>• Combine com meditação da Árvore da Vida (Cabala)</li>
              <li>• Use junto com trabalho de chakras tradicional</li>
              <li>• Integre com Odús e orixás (frequência do dia)</li>
              <li>• Aplique em rituais de numerologia pessoal</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}