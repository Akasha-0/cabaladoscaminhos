'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AstrologyResults } from '@/lib/engines/types/mapa-alma';
import type { Planeta } from '@/lib/astrologia/tipos';

interface MapaNatalVizProps {
  astrologia: AstrologyResults;
  className?: string;
}

const ZODIAC_SIGNS = [
  { symbol: '♈', name: 'Áries' },
  { symbol: '♉', name: 'Touro' },
  { symbol: '♊', name: 'Gêmeos' },
  { symbol: '♋', name: 'Câncer' },
  { symbol: '♌', name: 'Leão' },
  { symbol: '♍', name: 'Virgem' },
  { symbol: '♎', name: 'Libra' },
  { symbol: '♏', name: 'Escorpião' },
  { symbol: '♐', name: 'Sagitário' },
  { symbol: '♑', name: 'Capricórnio' },
  { symbol: '♒', name: 'Aquário' },
  { symbol: '♓', name: 'Peixes' },
];

const PLANET_COLORS: Record<string, string> = {
  Sol: '#C9A227',
  Lua: '#94A3B8',
  Mercúrio: '#22C55E',
  Vênus: '#EC4899',
  Marte: '#EF4444',
  Júpiter: '#3B82F6',
  Saturno: '#8B5CF6',
  Urano: '#06B6D4',
  Netuno: '#6366F1',
  Plutão: '#6B1A2A',
};

const ASPECT_COLORS: Record<string, string> = {
  'conjunção': '#FFD700',
  'trígono': '#22C55E',
  'quadratura': '#EF4444',
  'oposição': '#EC4899',
  'sextil': '#38BDF8',
};

const PLANET_INTERPRETATIONS: Record<string, Record<string, string>> = {
  Sol: {
    aries: 'Liderança assertiva, pioneirismo e energia vital.',
    touro: 'Determinação persistente, sensualidade e valor próprio.',
    gemeos: 'Comunicação expressiva, curiosidade intelectual.',
    cancer: 'Nutrição emocional, proteção e intimidade familiar.',
    leao: 'Criatividade dramática, autoexpressão generosa.',
    virgem: 'Análise precisa, serviço prático e perfeição.',
    libra: 'Harmonia social, Diplomacia e Partnerships.',
    escorpiao: 'Transformação profunda, intensidade emocional.',
    sagitario: 'Expansão filosófica, otimismo aventureiro.',
    capricornio: 'Ambição estruturada, disciplina e成就感.',
    aquario: 'Inovação única, humanitarismo e originalidade.',
    peixes: 'Intuição espiritual, compaixão e慈爱.',
  },
  Lua: {
    aries: 'Respostas emocionais rápidas, necessidades de autonomia.',
    touro: 'Necessidade de segurança material e prazer sensorial.',
    gemeos: 'Mente curiosa, necessidade de comunicação emocional.',
    cancer: 'Intuição profunda, conexão com lar e família.',
    leao: 'Necessidade de reconhecimento e expressão criativa.',
    virgem: 'Necessidade de ordem emocional e serviço prático.',
    libra: 'Harmonia emocional através de relacionamentos.',
    escorpiao: 'Transformação emocional e conexões intensas.',
    sagitario: 'Busca por expansão emocional e verdades.',
    capricornio: 'Necessidade de limites emocionais e estrutura.',
    aquario: 'Necessidade de liberdade emocional e comunidade.',
    peixes: 'Conexão espiritual profunda e sensibilidade.',
  },
  Mercúrio: {
    aries: 'Comunicação direta e assertiva.',
    touro: 'Comunicação prática e valores materiais.',
    gemeos: 'Versatilidade mental e curiosidade versátil.',
    cancer: 'Comunicação emocional e intuitiva.',
    leao: 'Expressão dramática e criativa.',
    virgem: 'Análise crítica e atenção aos detalhes.',
    libra: 'Diplomacia e equilíbrio na comunicação.',
    escorpiao: 'Investigação profunda e penetrante.',
    sagitario: 'Filosofia e expansão mental.',
    capricornio: 'Comunicação estruturada e ambiciosa.',
    aquario: 'Ideias inovadoras e revolucionárias.',
    peixes: 'Intuição e comunicação espiritual.',
  },
  Vênus: {
    aries: 'Atração apaixonada e direta.',
    touro: 'Amor sensual e estável.',
    gemeos: 'Amor comunicativo e versátil.',
    cancer: 'Amor emocional e protetor.',
    leao: 'Amor dramático e romântico.',
    virgem: 'Amor prático eservice-oriented.',
    libra: 'Amor harmonioso e партнерство oriented.',
    escorpiao: 'Amor intenso e transformador.',
    sagitario: 'Amor aventureiro e livre.',
    capricornio: 'Amor tradicional e comprometido.',
    aquario: 'Amor único e друзья-oriented.',
    peixes: 'Amor espiritual e sacrificial.',
  },
  Marte: {
    aries: 'Ação direta e pioneira.',
    touro: 'Ação persistente e Determinação.',
    gemeos: 'Ação versátil e mental.',
    cancer: 'Ação protetora e emocional.',
    leao: 'Ação criativa e dominante.',
    virgem: 'Ação prática e estratégica.',
    libra: 'Ação diplomática e Partnerships-oriented.',
    escorpiao: 'Ação transformadora e intensa.',
    sagitario: 'Ação aventureira e filosófica.',
    capricornio: 'Ação ambiciosa e disciplinada.',
    aquario: 'Ação inovadora e coletiva.',
    peixes: 'Ação espiritual e inspiracional.',
  },
  Júpiter: {
    aries: 'Expansãoconfiante e liderança.',
    touro: 'Expansão material e prosperidade.',
    gemeos: 'Expansão intelectual e comunicação.',
    cancer: 'Expansão emocional e familiar.',
    leao: 'Expansão criativa e expressão.',
    virgem: 'Expansão através de serviço e análise.',
    libra: 'Expansão através de Partnerships e justiça.',
    escorpiao: 'Expansão através de transformação.',
    sagitario: 'Expansão filosófica e aventura.',
    capricornio: 'Expansão através de estrutura e ambition.',
    aquario: 'Expansão através de inovação e humanidade.',
    peixes: 'Expansão espiritual e intuição.',
  },
  Saturno: {
    aries: 'Estrutura através de iniciativa pessoal.',
    touro: 'Restrições em valores e segurança.',
    gemeos: 'Estrutura em comunicação e aprendizado.',
    cancer: 'Restrições em lar e emoções.',
    leao: 'Estrutura em criatividade e autoexpressão.',
    virgem: 'Estrutura através de perfeição e serviço.',
    libra: 'Estrutura em relacionamentos e equilíbrio.',
    escorpiao: 'Transformação através de ограничения.',
    sagitario: 'Estrutura em filosofia e expansão.',
    capricornio: 'Ambição estruturada e disciplina máxima.',
    aquario: 'Estrutura através de inovação e coletividade.',
    peixes: 'Estrutura espiritual e limites.',
  },
  Urano: {
    aries: 'Inovação radical e liberdade individual.',
    touro: 'Revolução em valores e economia.',
    gemeos: 'Inovação em comunicação e tecnologia.',
    cancer: 'Mudanças súbitas em lar e família.',
    leao: 'Criatividade única e非传统.',
    virgem: 'Genialidade analítica e originalidade.',
    libra: 'Revolução em Partnerships e justiça.',
    escorpiao: 'Transformação através de insight.',
    sagitario: 'Mudança filosófica e expansão rápida.',
    capricornio: 'Inovação estrutural e ambiciosa.',
    aquario: 'Humanitarismo único e originalidade.',
    peixes: 'Inspiração espiritual eIntuição.',
  },
  Netuno: {
    aries: 'Sonho e imaginação em ação pioneira.',
    touro: 'Inspiração em valores e的艺术.',
    gemeos: 'Intuição em comunicação e mídia.',
    cancer: 'Conexão espiritual com lar e memória.',
    leao: 'Criatividade espiritual e inspiração.',
    virgem: 'Intuição crítica e discernimento.',
    libra: 'Idealismo em relacionamentos e arte.',
    escorpiao: 'Transformação espiritual profunda.',
    sagitario: 'Filosofia espiritual e expansão.',
    capricornio: 'Sonho estruturado e ambition.',
    aquario: 'Inspiração humanitária e universelle.',
    peixes: 'Intuição espiritual máxima e compaixão.',
  },
  Plutão: {
    aries: 'Poder pessoal e transformação ativa.',
    touro: 'Transformação de valores e recursos.',
    gemeos: 'Poder da comunicação e真相.',
    cancer: 'Transformação emocional e ancestral.',
    leao: 'Poder criativo e regeneração.',
    virgem: 'Transformação através de purificação.',
    libra: 'Transformação em Partnerships e justiça.',
    escorpiao: 'Poder transformador máximo.',
    sagitario: 'Expansão através de metamorfose.',
    capricornio: 'Poder estruturado e controle.',
    aquario: 'Transformação coletiva e revolution.',
    peixes: 'Poder espiritual e renovação.',
  },
};

type PosicaoPlaneta = {
  planeta: Planeta;
  longitude: number;
  latitude: number;
  velocidade: number;
  signo: string;
  casa: number;
  grauNoSigno: number;
};

type Aspecto = {
  planeta1: string;
  planeta2: string;
  tipo: string;
  orb: number;
  aplicativo: boolean;
};

function getZodiacIndex(signo: string | undefined): number {
  if (!signo) return 0;
  const signMap: Record<string, number> = {
     'aries': 0, 'touro': 1, 'gemeos': 2, 'cancer': 3,
     'leao': 4, 'virgem': 5, 'libra': 6, 'escorpiao': 7,
     'sagitario': 8, 'capricornio': 9, 'aquario': 10, 'peixes': 11,
   };
   return signMap[signo.toLowerCase()] ?? 0;
}

function getPlanetAngle(posicao: PosicaoPlaneta): number {
  const signIndex = getZodiacIndex(posicao.signo);
  const degreeInSign = posicao.grauNoSigno;
  const totalDegrees = signIndex * 30 + degreeInSign;
  return totalDegrees - 90;
}

function getPlanetPosition(posicao: PosicaoPlaneta, radius: number): { x: number; y: number } {
  const angle = getPlanetAngle(posicao) * (Math.PI / 180);
  return {
    x: 200 + radius * Math.cos(angle),
    y: 200 + radius * Math.sin(angle),
  };
}
function getAscendantAngle(ascendente: string | undefined): number {
  const signIndex = getZodiacIndex(ascendente);
   return signIndex * 30 - 90;
}

function formatPlanetName(planeta: string): string {
  const nameMap: Record<string, string> = {
    sol: 'Sol', lua: 'Lua', mercurio: 'Mercúrio',
    venus: 'Vênus', marte: 'Marte', jupiter: 'Júpiter',
    saturno: 'Saturno', urano: 'Urano', netuno: 'Netuno',
    plutao: 'Plutão',
  };
  return nameMap[planeta] || planeta.charAt(0).toUpperCase() + planeta.slice(1);
}

function formatSignName(signo: string): string {
  const signMap: Record<string, string> = {
    'aries': 'Áries', 'touro': 'Touro', 'gemeos': 'Gêmeos',
    'cancer': 'Câncer', 'leao': 'Leão', 'virgem': 'Virgem',
    'libra': 'Libra', 'escorpiao': 'Escorpião', 'sagitario': 'Sagitário',
    'capricornio': 'Capricórnio', 'aquario': 'Aquário', 'peixes': 'Peixes',
  };
  return signMap[signo.toLowerCase()] || signo;
}

interface AspectLine {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
}

export function MapaNatalViz({ astrologia, className = '' }: MapaNatalVizProps) {
  const [selectedPlanet, setSelectedPlanet] = useState<{
    name: string;
    sign: string;
    position: { x: number; y: number };
    interpretation: string;
  } | null>(null);

  const planets: PosicaoPlaneta[] = [
    astrologia.sol,
    astrologia.lua,
    astrologia.mercurio,
    astrologia.venus,
    astrologia.marte,
    astrologia.jupiter,
    astrologia.saturno,
    astrologia.urano,
    astrologia.netuno,
    astrologia.plutao,
  ].filter(Boolean) as PosicaoPlaneta[];

  const ascAngle = getAscendantAngle(astrologia.ascendente);
  const ascX = 200 + 140 * Math.cos(ascAngle * (Math.PI / 180));
  const ascY = 200 + 140 * Math.sin(ascAngle * (Math.PI / 180));

  const aspectLines: AspectLine[] = astrologia.aspectos
    .filter((a: Aspecto) => ['conjunção', 'trígono', 'quadratura', 'oposição', 'sextil'].includes(a.tipo))
    .map((aspecto: Aspecto, index: number) => {
      const p1 = planets.find((p: PosicaoPlaneta) => p.planeta.toLowerCase() === aspecto.planeta1.toLowerCase());
      const p2 = planets.find((p: PosicaoPlaneta) => p.planeta.toLowerCase() === aspecto.planeta2.toLowerCase());
      
      if (!p1 || !p2) return null;
      
      const pos1 = getPlanetPosition(p1, 100);
      const pos2 = getPlanetPosition(p2, 100);
      
      return {
        id: `aspect-${index}`,
        x1: pos1.x,
        y1: pos1.y,
        x2: pos2.x,
        y2: pos2.y,
        color: ASPECT_COLORS[aspecto.tipo] || '#888',
      };
    })
    .filter(Boolean) as AspectLine[];

  const handlePlanetClick = (posicao: PosicaoPlaneta) => {
    const pos = getPlanetPosition(posicao, 100);
    const planetName = formatPlanetName(posicao.planeta);
    const signName = formatSignName(posicao.signo);
    const interpretation = PLANET_INTERPRETATIONS[planetName]?.[posicao.signo.toLowerCase()] 
      || `Planet in ${signName} - interpretation available in full chart.`;

    setSelectedPlanet({
      name: planetName,
      sign: signName,
      position: pos,
      interpretation,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent, posicao: PosicaoPlaneta) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handlePlanetClick(posicao);
    }
  };

  const getPlanetColor = (planeta: string): string => {
    const nameMap: Record<string, string> = {
      sol: 'Sol', lua: 'Lua', mercurio: 'Mercúrio',
      venus: 'Vênus', marte: 'Marte', jupiter: 'Júpiter',
      saturno: 'Saturno', urano: 'Urano', netuno: 'Netuno',
      plutao: 'Plutão',
    };
    return PLANET_COLORS[nameMap[planeta]] || '#888';
  };

  return (
    <Card className={`card-spiritual ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-amber-400">
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M12 2v4M12 18v4M2 12h4M18 12h4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          ✦ MAPA NATAL
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <svg
            viewBox="0 0 400 400"
            className="w-full h-auto"
            role="img"
            aria-label="Mapa Natal Astrológico com signos, planetas e aspectos"
          >
            <defs>
              <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="var(--color-nebula)" stopOpacity="0.3" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Center glow */}
            <circle cx="200" cy="200" r="60" fill="url(#centerGlow)" />

            {/* Outer ring - Zodiac wheel */}
            <circle cx="200" cy="200" r="190" fill="none" stroke="var(--color-nebula)" strokeWidth="1.5" opacity="0.6" />

            {/* Zodiac signs (12) */}
            {ZODIAC_SIGNS.map((sign, i) => {
              const angle = (i * 30 - 90) * (Math.PI / 180);
              const x = 200 + 175 * Math.cos(angle);
              const y = 200 + 175 * Math.sin(angle);
              return (
                <g key={sign.symbol}>
                  <text
                    x={x}
                    y={y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="18"
                    fill="var(--color-text-secondary)"
                    fontWeight="300"
                  >
                    {sign.symbol}
                  </text>
                </g>
              );
            })}

            {/* Degree markers (every 10 degrees) */}
            {[...Array(36)].map((_, i) => {
              const angle = (i * 10 - 90) * (Math.PI / 180);
              const x1 = 200 + 155 * Math.cos(angle);
              const y1 = 200 + 155 * Math.sin(angle);
              const x2 = 200 + 165 * Math.cos(angle);
              const y2 = 200 + 165 * Math.sin(angle);
              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="var(--color-text-muted)"
                  strokeWidth="1"
                  opacity="0.5"
                />
              );
            })}

            {/* Inner houses (12 divisions) */}
            <circle cx="200" cy="200" r="145" fill="none" stroke="var(--color-nebula)" strokeWidth="1" opacity="0.4" />
            <circle cx="200" cy="200" r="100" fill="none" stroke="var(--color-nebula)" strokeWidth="0.5" opacity="0.3" />

            {/* House cusps */}
            {astrologia.casas?.map((casa, i) => {
              const signIndex = getZodiacIndex(casa.signo);
              const cuspAngle = (signIndex * 30 + casa.grauNoSigno - 90) * (Math.PI / 180);
              const x = 200 + 145 * Math.cos(cuspAngle);
              const y = 200 + 145 * Math.sin(cuspAngle);
              return (
                <g key={i}>
                  <circle cx={x} cy={y} r="2" fill="var(--color-text-muted)" opacity="0.6" />
                </g>
              );
            })}

            {/* Aspect lines */}
            {aspectLines.map((line) => (
              <line
                key={line.id}
                x1={line.x1}
                y1={line.y1}
                x2={line.x2}
                y2={line.y2}
                stroke={line.color}
                strokeWidth="1"
                strokeDasharray="4,4"
                opacity="0.5"
              />
            ))}

            {/* Ascendant line */}
            <line
              x1="200"
              y1="200"
              x2={ascX}
              y2={ascY}
              stroke="#C9A227"
              strokeWidth="2"
              opacity="0.8"
            />

            {/* Ascendant marker */}
            <circle
              cx={ascX}
              cy={ascY}
              r="6"
              fill="#C9A227"
              filter="url(#glow)"
            />
            <text
              x={ascX}
              y={ascY - 12}
              textAnchor="middle"
              fontSize="8"
              fill="#C9A227"
              fontWeight="bold"
            >
              ASC
            </text>

            {/* Planets */}
            {planets.map((planet) => {
              const { x, y } = getPlanetPosition(planet, 100);
              const color = getPlanetColor(planet.planeta);
              const isSelected = selectedPlanet?.name === formatPlanetName(planet.planeta);

              return (
                <g
                  key={planet.planeta}
                  style={{ cursor: 'pointer' }}
                  role="button"
                  tabIndex={0}
                  aria-label={`${formatPlanetName(planet.planeta)} em ${formatSignName(planet.signo)}`}
                  onClick={() => handlePlanetClick(planet)}
                  onKeyDown={(e) => handleKeyDown(e, planet)}
                >
                  <circle
                    cx={x}
                    cy={y}
                    r={isSelected ? 14 : 10}
                    fill={color}
                    opacity={isSelected ? 1 : 0.85}
                    filter={isSelected ? 'url(#glow)' : undefined}
                  />
                  <text
                    x={x}
                    y={y + 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={isSelected ? 9 : 7}
                    fill="white"
                    fontWeight="bold"
                  >
                    {formatPlanetName(planet.planeta)[0]}
                  </text>
                </g>
              );
            })}

            {/* MC (Medium Coeli) */}
            <circle cx="200" cy="55" r="5" fill="#A855F7" filter="url(#glow)" />
            <text x="215" y="55" fontSize="7" fill="#A855F7" fontWeight="bold">MC</text>

            {/* Planet popup */}
            {selectedPlanet && (
              <g>
                <rect
                  x={Math.min(Math.max(selectedPlanet.position.x - 60, 10), 280)}
                  y={Math.max(selectedPlanet.position.y - 80, 10)}
                  width="120"
                  height="70"
                  rx="8"
                  fill="rgba(15, 23, 42, 0.95)"
                  stroke="var(--color-gold)"
                  strokeWidth="1"
                />
                <text
                  x={Math.min(Math.max(selectedPlanet.position.x, 70), 310)}
                  y={Math.max(selectedPlanet.position.y - 62, 25)}
                  textAnchor="middle"
                  fontSize="11"
                  fill="var(--color-gold)"
                  fontWeight="bold"
                >
                  {selectedPlanet.name}
                </text>
                <text
                  x={Math.min(Math.max(selectedPlanet.position.x, 70), 310)}
                  y={Math.max(selectedPlanet.position.y - 48, 40)}
                  textAnchor="middle"
                  fontSize="9"
                  fill="var(--color-text-secondary)"
                >
                  {selectedPlanet.sign}
                </text>
                <text
                  x={Math.min(Math.max(selectedPlanet.position.x, 70), 310)}
                  y={Math.max(selectedPlanet.position.y - 32, 55)}
                  textAnchor="middle"
                  fontSize="7"
                  fill="var(--color-text-muted)"
                >
                  {selectedPlanet.interpretation.substring(0, 50)}...
                </text>
              </g>
            )}
          </svg>
        </div>

        {/* Planet legend */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
          {planets.map((planet) => {
            const color = getPlanetColor(planet.planeta);
            const name = formatPlanetName(planet.planeta);
            const sign = formatSignName(planet.signo);
            return (
              <div
                key={planet.planeta}
                className="flex items-center gap-2 px-2 py-1.5 bg-slate-800/50 rounded border border-slate-700/30"
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs text-slate-300">
                  {name} <span className="text-slate-500">em</span> {sign}
                </span>
              </div>
            );
          })}
        </div>

        {/* Main positions */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="text-center p-2 bg-slate-800/50 rounded-lg border border-slate-700/30">
            <div className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">Ascendente</div>
            <div className="text-sm font-semibold text-amber-400">{formatSignName(astrologia.ascendente)}</div>
          </div>
          <div className="text-center p-2 bg-slate-800/50 rounded-lg border border-slate-700/30">
            <div className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">Sol</div>
            <div className="text-sm font-semibold text-yellow-400">{formatSignName(astrologia.sol.signo)}</div>
          </div>
          <div className="text-center p-2 bg-slate-800/50 rounded-lg border border-slate-700/30">
            <div className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">Lua</div>
            <div className="text-sm font-semibold text-slate-300">{formatSignName(astrologia.lua.signo)}</div>
          </div>
        </div>

        {/* Aspect legend */}
        {astrologia.aspectos && astrologia.aspectos.length > 0 && (
          <div className="mt-4">
            <div className="text-[10px] text-slate-400 uppercase tracking-wide mb-2">
              Aspectos Principais
            </div>
            <div className="flex flex-wrap gap-2">
              {astrologia.aspectos.slice(0, 6).map((aspecto: Aspecto, i: number) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-slate-800/50 rounded border border-slate-700/30 text-[10px] text-slate-300"
                >
                  <span style={{ color: ASPECT_COLORS[aspecto.tipo] || '#888' }}>
                    {aspecto.tipo === 'conjunção' ? '☌' : aspecto.tipo === 'trígono' ? '△' : aspecto.tipo === 'quadratura' ? '□' : aspecto.tipo === 'oposição' ? '☍' : '⚹'}
                  </span>
                  {' '}{formatPlanetName(aspecto.planeta1)} {'/'} {formatPlanetName(aspecto.planeta2)}
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}