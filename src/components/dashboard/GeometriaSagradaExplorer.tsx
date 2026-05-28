'use client';

import { useState, memo, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FORMAS_SAGRADAS } from '@/lib/geometria-sagrada/dados';

const COMPONENTES_SVG: Record<string, string> = {
  'flower-of-life': `
    <svg viewBox="0 0 100 100" class="w-full h-full">
      <defs>
        <pattern id="flower" patternUnits="userSpaceOnUse" width="100" height="100">
          <circle cx="50" cy="50" r="15" fill="none" stroke="currentColor" stroke-width="1" opacity="0.3"/>
          <circle cx="50" cy="35" r="15" fill="none" stroke="currentColor" stroke-width="1" opacity="0.4"/>
          <circle cx="63" cy="43" r="15" fill="none" stroke="currentColor" stroke-width="1" opacity="0.4"/>
          <circle cx="63" cy="58" r="15" fill="none" stroke="currentColor" stroke-width="1" opacity="0.5"/>
          <circle cx="50" cy="65" r="15" fill="none" stroke="currentColor" stroke-width="1" opacity="0.5"/>
          <circle cx="37" cy="58" r="15" fill="none" stroke="currentColor" stroke-width="1" opacity="0.5"/>
          <circle cx="37" cy="43" r="15" fill="none" stroke="currentColor" stroke-width="1" opacity="0.4"/>
        </pattern>
      </defs>
      <rect width="100" height="100" fill="url(#flower)"/>
    </svg>
  `,
  'seed-of-life': `
    <svg viewBox="0 0 100 100" class="w-full h-full">
      <circle cx="50" cy="50" r="15" fill="none" stroke="currentColor" stroke-width="1"/>
      <circle cx="50" cy="35" r="15" fill="none" stroke="currentColor" stroke-width="1"/>
      <circle cx="63" cy="43" r="15" fill="none" stroke="currentColor" stroke-width="1"/>
      <circle cx="63" cy="58" r="15" fill="none" stroke="currentColor" stroke-width="1"/>
      <circle cx="50" cy="65" r="15" fill="none" stroke="currentColor" stroke-width="1"/>
      <circle cx="37" cy="58" r="15" fill="none" stroke="currentColor" stroke-width="1"/>
      <circle cx="37" cy="43" r="15" fill="none" stroke="currentColor" stroke-width="1"/>
    </svg>
  `,
  'tree-of-life-sacred': `
    <svg viewBox="0 0 100 120" class="w-full h-full">
      <line x1="50" y1="10" x2="30" y2="30" stroke="currentColor" stroke-width="1"/>
      <line x1="50" y1="10" x2="70" y2="30" stroke="currentColor" stroke-width="1"/>
      <line x1="30" y1="30" x2="70" y2="30" stroke="currentColor" stroke-width="1"/>
      <line x1="30" y1="30" x2="20" y2="50" stroke="currentColor" stroke-width="1"/>
      <line x1="70" y1="30" x2="80" y2="50" stroke="currentColor" stroke-width="1"/>
      <line x1="20" y1="50" x2="50" y2="60" stroke="currentColor" stroke-width="1"/>
      <line x1="80" y1="50" x2="50" y2="60" stroke="currentColor" stroke-width="1"/>
      <line x1="50" y1="60" x2="30" y2="80" stroke="currentColor" stroke-width="1"/>
      <line x1="50" y1="60" x2="70" y2="80" stroke="currentColor" stroke-width="1"/>
      <line x1="30" y1="80" x2="50" y2="95" stroke="currentColor" stroke-width="1"/>
      <line x1="70" y1="80" x2="50" y2="95" stroke="currentColor" stroke-width="1"/>
      <line x1="50" y1="95" x2="50" y2="110" stroke="currentColor" stroke-width="1"/>
      <circle cx="50" cy="10" r="3" fill="currentColor"/>
      <circle cx="30" cy="30" r="3" fill="currentColor"/>
      <circle cx="70" cy="30" r="3" fill="currentColor"/>
      <circle cx="20" cy="50" r="3" fill="currentColor"/>
      <circle cx="80" cy="50" r="3" fill="currentColor"/>
      <circle cx="50" cy="60" r="3" fill="currentColor"/>
      <circle cx="30" cy="80" r="3" fill="currentColor"/>
      <circle cx="70" cy="80" r="3" fill="currentColor"/>
      <circle cx="50" cy="95" r="3" fill="currentColor"/>
      <circle cx="50" cy="110" r="3" fill="currentColor"/>
    </svg>
  `,
  'merkaba': `
    <svg viewBox="0 0 100 100" class="w-full h-full">
      <polygon points="50,20 80,70 20,70" fill="none" stroke="currentColor" stroke-width="1"/>
      <polygon points="50,80 20,30 80,30" fill="none" stroke="currentColor" stroke-width="1"/>
    </svg>
  `,
  'metatrons-cube': `
    <svg viewBox="0 0 100 100" class="w-full h-full">
      <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" stroke-width="0.5"/>
      <line x1="50" y1="10" x2="50" y2="90" stroke="currentColor" stroke-width="0.5"/>
      <line x1="10" y1="50" x2="90" y2="50" stroke="currentColor" stroke-width="0.5"/>
      <line x1="20" y1="20" x2="80" y2="80" stroke="currentColor" stroke-width="0.5"/>
      <line x1="80" y1="20" x2="20" y2="80" stroke="currentColor" stroke-width="0.5"/>
      <polygon points="50,15 85,72.5 15,72.5" fill="none" stroke="currentColor" stroke-width="0.5"/>
      <polygon points="15,27.5 85,27.5 50,85" fill="none" stroke="currentColor" stroke-width="0.5"/>
    </svg>
  `,
  'hexagram': `
    <svg viewBox="0 0 100 100" class="w-full h-full">
      <polygon points="50,15 85,75 15,75" fill="none" stroke="currentColor" stroke-width="2"/>
      <polygon points="50,85 15,25 85,25" fill="none" stroke="currentColor" stroke-width="2"/>
      <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" stroke-width="1"/>
    </svg>
  `,
  'pentagram': `
    <svg viewBox="0 0 100 100" class="w-full h-full">
      <polygon points="50,10 61,40 95,40 68,60 79,90 50,72 21,90 32,60 5,40 39,40" fill="none" stroke="currentColor" stroke-width="2"/>
      <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" stroke-width="1"/>
    </svg>
  `,
  'vesica-piscis': `
    <svg viewBox="0 0 100 100" class="w-full h-full">
      <ellipse cx="50" cy="50" rx="25" ry="50" fill="none" stroke="currentColor" stroke-width="1"/>
      <ellipse cx="50" cy="50" rx="25" ry="50" fill="none" stroke="currentColor" stroke-width="1" transform="rotate(90 50 50)"/>
    </svg>
  `,
  'solids-platonic': `
    <svg viewBox="0 0 100 100" class="w-full h-full">
      <text x="10" y="20" class="text-xs" fill="currentColor">△ Tetraedro</text>
      <text x="10" y="40" class="text-xs" fill="currentColor">□ Cubo</text>
      <text x="10" y="60" class="text-xs" fill="currentColor">◇ Octaedro</text>
      <text x="10" y="80" class="text-xs" fill="currentColor">⬠ Dodecaedro</text>
      <text x="10" y="95" class="text-xs" fill="currentColor">⬡ Icosaedro</text>
    </svg>
  `,
};

interface FormaCardProps {
  forma: typeof FORMAS_SAGRADAS[0];
  expanded?: boolean;
  onClick?: () => void;
}

const FormaCard = memo(function FormaCard({ forma, expanded = false, onClick }: FormaCardProps) {
  const svgContent = COMPONENTES_SVG[forma.id] || '';

  return (
    <Card
      className={`p-4 bg-slate-900/50 border-slate-700/50 cursor-pointer transition-all hover:border-indigo-500/50 ${
        expanded ? 'col-span-1 md:col-span-2 lg:col-span-3' : ''
      }`}
      onClick={onClick}
    >
      <div className={`flex ${expanded ? 'flex-row gap-6' : 'flex-col'}`}>
        <div
          className={`${expanded ? 'w-48 h-48' : 'w-full h-32'} flex-shrink-0`}
          style={{ color: forma.cor }}
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
        <div className="flex-1">
          <h3 className="font-serif text-xl text-slate-100">{forma.nome}</h3>
          <p className="text-sm text-slate-400 italic">{forma.nomeIngles}</p>
          <p className={`text-sm text-slate-400 mt-2 ${expanded ? '' : 'line-clamp-2'}`}>
            {forma.descricao}
          </p>
        </div>
      </div>

      {expanded && (
        <div className="mt-4 space-y-4">
          <div>
            <h4 className="text-sm font-medium text-slate-300 mb-2">Simbolismo</h4>
            <p className="text-sm text-slate-400">{forma.simbolismo}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-slate-300 mb-2">Sefirots Associados</h4>
              <div className="flex flex-wrap gap-1">
                {forma.sefirots.map((sef) => (
                  <span
                    key={sef}
                    className="px-2 py-1 text-xs rounded-full bg-indigo-900/30 text-indigo-300"
                  >
                    {sef}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-slate-300 mb-2">Chakras</h4>
              <div className="flex flex-wrap gap-1">
                {forma.chakras.map((chakra) => (
                  <span
                    key={chakra}
                    className="px-2 py-1 text-xs rounded-full bg-purple-900/30 text-purple-300"
                  >
                    {chakra}º
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-slate-300 mb-2">Frequências Recomendadas</h4>
            <div className="flex flex-wrap gap-2">
              {forma.frequencias.map((freq) => (
                <span
                  key={freq}
                  className="px-3 py-1 text-sm rounded-full bg-amber-900/30 text-amber-300"
                >
                  {freq}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-slate-300 mb-2">Benefícios</h4>
            <ul className="space-y-1">
              {forma.beneficios.map((b) => (
                <li key={b} className="text-sm text-slate-400 flex items-start gap-2">
                  <span className="text-green-400">✦</span>
                  {b}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-medium text-slate-300 mb-2">Práticas Recomendadas</h4>
            <ul className="space-y-1">
              {forma.praticas.map((p) => (
                <li key={p} className="text-sm text-slate-400 flex items-start gap-2">
                  <span className="text-indigo-400">→</span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </Card>
  );
});

export function GeometriaSagradaExplorer() {
  const [selectedForma, setSelectedForma] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<'all' | 'sefirot' | 'chakra'>('all');
  const [sefirotFiltro, setSefirotFiltro] = useState<string | null>(null);
  const [chakraFiltro, setChakraFiltro] = useState<number | null>(null);

  const handleCardClick = useCallback((formaId: string) => {
    setSelectedForma(prev => prev === formaId ? null : formaId);
  }, []);

  const formasFiltradas = FORMAS_SAGRADAS.filter((forma) => {
    if (filtro === 'all') return true;
    if (filtro === 'sefirot' && sefirotFiltro) {
      return forma.sefirots.includes(sefirotFiltro);
    }
    if (filtro === 'chakra' && chakraFiltro) {
      return forma.chakras.includes(chakraFiltro);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <Card className="p-4 bg-slate-900/50 border-slate-700/50">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm text-slate-400 mb-2">Filtrar por</label>
            <Tabs value={filtro} onValueChange={(v) => setFiltro(v as typeof filtro)}>
              <TabsList className="bg-slate-800/50">
                <TabsTrigger value="all" className="data-[state=active]:bg-indigo-600 text-xs">
                  Todos
                </TabsTrigger>
                <TabsTrigger value="sefirot" className="data-[state=active]:bg-indigo-600 text-xs">
                  Sefirot
                </TabsTrigger>
                <TabsTrigger value="chakra" className="data-[state=active]:bg-indigo-600 text-xs">
                  Chakra
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {filtro === 'sefirot' && (
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
                <option value="Chesed">Chesed</option>
                <option value="Geburah">Geburah</option>
                <option value="Tiphereth">Tiphereth</option>
                <option value="Netzach">Netzach</option>
                <option value="Hod">Hod</option>
                <option value="Yesod">Yesod</option>
                <option value="Malkuth">Malkuth</option>
              </select>
            </div>
          )}

          {filtro === 'chakra' && (
            <div className="flex-1">
              <label className="block text-sm text-slate-400 mb-2">Selecionar Chakra</label>
              <select
                className="w-full p-2 rounded-md bg-slate-800 border border-slate-700 text-slate-200"
                value={chakraFiltro || ''}
                onChange={(e) => setChakraFiltro(parseInt(e.target.value) || null)}
              >
                <option value="">Todos</option>
                <option value="1">1º - Raiz (Vermelho)</option>
                <option value="2">2º - Sacral (Laranja)</option>
                <option value="3">3º - Plexo Solar (Amarelo)</option>
                <option value="4">4º - Cardíaco (Verde)</option>
                <option value="5">5º - Laríngeo (Azul)</option>
                <option value="6">6º - Frontal (Índigo)</option>
                <option value="7">7º - Coronário (Violeta)</option>
              </select>
            </div>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {formasFiltradas.map((forma) => (
          <FormaCard
            key={forma.id}
            forma={forma}
            expanded={selectedForma === forma.id}
            onClick={() => handleCardClick(forma.id)}
          />
        ))}
      </div>

      <Card className="p-4 bg-slate-900/50 border-slate-700/50">
        <h3 className="text-lg font-serif text-slate-100 mb-2">Sobre a Geometria Sagrada</h3>
        <p className="text-sm text-slate-400 leading-relaxed">
          A Geometria Sagrada é o estudo das formas e proporções matemáticas encontradas na natureza 
          e no universo. Na tradição cabalística, estas formas representam os canais através dos 
          quais a energia divina flui para a criação. Cada forma carrega frequências vibratórias 
          específicas que podem ser utilizadas para harmonização e evolução espiritual.
        </p>
      </Card>
    </div>
  );
}