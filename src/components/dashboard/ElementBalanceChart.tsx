'use client';

import { useMemo } from 'react';
import type { MapaNatal, PosicaoPlaneta } from '@/lib/astrologia/tipos';
import { PLANETAS_DATA } from '@/lib/astrologia/planetas/dados';
import { Flame, Wind, Droplets, Mountain, TrendingUp, TrendingDown, Minus, Lightbulb } from 'lucide-react';

interface ElementBalanceChartProps {
  mapaNatal?: MapaNatal;
  posicoes?: PosicaoPlaneta[];
  className?: string;
}

interface ElementCount {
  elemento: string;
  count: number;
  percentage: number;
  planets: string[];
}

const ELEMENTOS_CORES: Record<string, { cor: string; gradiente: string; icone: React.ReactNode }> = {
  Fogo: { cor: '#E74C3C', gradiente: 'linear-gradient(135deg, #E74C3C 0%, #C0392B 100%)', icone: <Flame size={20} /> },
  Terra: { cor: '#27AE60', gradiente: 'linear-gradient(135deg, #27AE60 0%, #1E8449 100%)', icone: <Mountain size={20} /> },
  Ar: { cor: '#3498DB', gradiente: 'linear-gradient(135deg, #3498DB 0%, #2980B9 100%)', icone: <Wind size={20} /> },
  Água: { cor: '#9B59B6', gradiente: 'linear-gradient(135deg, #9B59B6 0%, #8E44AD 100%)', icone: <Droplets size={20} /> },
};

const ELEMENT_KEYS = ['Fogo', 'Terra', 'Ar', 'Água'];

function calculateElementBalance(posicoes?: PosicaoPlaneta[]): ElementCount[] {
  const elementCounts: Record<string, { count: number; planets: string[] }> = {
    Fogo: { count: 0, planets: [] },
    Terra: { count: 0, planets: [] },
    Ar: { count: 0, planets: [] },
    Água: { count: 0, planets: [] },
  };

  if (!posicoes || posicoes.length === 0) {
    const defaultPlanets = ['sol', 'lua', 'mercurio', 'venus', 'marte', 'jupiter', 'saturno', 'urano', 'netuno', 'plutao'];
    defaultPlanets.forEach((planeta) => {
      const data = PLANETAS_DATA[planeta as keyof typeof PLANETAS_DATA];
      if (data) {
        const elemento = data.elemento as keyof typeof elementCounts;
        if (elementCounts[elemento]) {
          elementCounts[elemento].count++;
          elementCounts[elemento].planets.push(data.nome);
        }
      }
    });
  } else {
    posicoes.forEach((posicao) => {
      const data = PLANETAS_DATA[posicao.planeta as keyof typeof PLANETAS_DATA];
      if (data) {
        const elemento = data.elemento as keyof typeof elementCounts;
        if (elementCounts[elemento]) {
          elementCounts[elemento].count++;
          elementCounts[elemento].planets.push(data.nome);
        }
      }
    });
  }

  const total = Object.values(elementCounts).reduce((sum, e) => sum + e.count, 0);

  return ELEMENT_KEYS.map((elemento) => ({
    elemento,
    count: elementCounts[elemento].count,
    percentage: total > 0 ? (elementCounts[elemento].count / total) * 100 : 0,
    planets: elementCounts[elemento].planets,
  }));
}

function generateRecommendations(elementCounts: ElementCount[]): string[] {
  const recommendations: string[] = [];
  const avgPercentage = 100 / 4;

  const dominant = elementCounts.filter((e) => e.percentage > avgPercentage + 10);
  const deficient = elementCounts.filter((e) => e.percentage < avgPercentage - 10);

  if (dominant.length > 0) {
    dominant.forEach((e) => {
      switch (e.elemento) {
        case 'Fogo':
          recommendations.push('Sua energia de Fogo está em destaque. Canalize essa paixão em projetos criativos e evite impulsividade.');
          break;
        case 'Terra':
          recommendations.push('Sua conexão com a Terra é forte. Use essa estabilidade para construir foundations sólidas em seus projetos.');
          break;
        case 'Ar':
          recommendations.push('Seu elemento Ar domina. Foque em comunicação e aprendizado, mas cuidado com a indecisão.');
          break;
        case 'Água':
          recommendations.push('Sua energia de Água é proeminente. Cultive aintuição e compaixão, mas estabelea limites emocionais.');
          break;
      }
    });
  }

  if (deficient.length > 0) {
    deficient.forEach((e) => {
      switch (e.elemento) {
        case 'Fogo':
          recommendations.push('Considere incorporar mais atividades de Fogo: exercicio físico intenso, competição amigável ou hobbies criativos.');
          break;
        case 'Terra':
          recommendations.push('Para equilibrar a Terra: passe tempo na natureza, pratique jardinagem ou meditação grounding.');
          break;
        case 'Ar':
          recommendations.push('Desenvolva o elemento Ar: leia mais, aprenda idiomas, participe de discussions e expand suas perspectivas.');
          break;
        case 'Água':
          recommendations.push('Cultive a energia de Água: praticas artísticas, tempo perto do mar ou rios, e expresse suas emoções criativamente.');
          break;
      }
    });
  }

  if (dominant.length === 0 && deficient.length === 0) {
    recommendations.push('Seus elementos estão bem equilibrados. Continue cultivando essa harmonia em sua vida.');
    recommendations.push('Aalance múltiplas áreas: creativity (Fogo), practicality (Terra), intellect (Ar) e emotion (Água).');
  }

  return recommendations.slice(0, 4);
}

function ElementBar({
  element,
  maxCount,
  index,
}: {
  element: ElementCount;
  maxCount: number;
  index: number;
}) {
  const barHeight = maxCount > 0 ? (element.count / maxCount) * 100 : 0;
  const colorData = ELEMENTOS_CORES[element.elemento];

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="w-16 rounded-t-lg flex items-end justify-center pb-2 transition-all duration-500"
        style={{
          height: '160px',
          background: colorData.gradiente,
          minHeight: `${Math.max(barHeight, 10)}%`,
        }}
      >
        <span className="text-white font-bold text-sm drop-shadow-md">
          {element.count}
        </span>
      </div>
      <div className="text-center">
        <div className="flex items-center justify-center gap-1 text-gray-600 dark:text-gray-300">
          {colorData.icone}
          <span className="text-xs font-medium">{element.elemento}</span>
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {element.percentage.toFixed(0)}%
        </span>
      </div>
    </div>
  );
}

function RatioIndicator({
  elementCounts,
}: {
  elementCounts: ElementCount[];
}) {
  const avgPercentage = 100 / 4;
  const maxDeviation = Math.max(...elementCounts.map((e) => Math.abs(e.percentage - avgPercentage)));

  const getTrendIcon = (percentage: number) => {
    const deviation = percentage - avgPercentage;
    if (deviation > 10) return <TrendingUp size={14} className="text-green-500" />;
    if (deviation < -10) return <TrendingDown size={14} className="text-red-500" />;
    return <Minus size={14} className="text-gray-400" />;
  };

  return (
    <div className="grid grid-cols-4 gap-2 mt-4">
      {elementCounts.map((element) => (
        <div
          key={element.elemento}
          className="flex items-center justify-center gap-1 bg-gray-50 dark:bg-gray-800 rounded px-2 py-1"
        >
          <span className="text-xs text-gray-600 dark:text-gray-300">{element.elemento}</span>
          {getTrendIcon(element.percentage)}
        </div>
      ))}
    </div>
  );
}

function RecommendationsList({
  recommendations,
}: {
  recommendations: string[];
}) {
  return (
    <div className="space-y-3 mt-4">
      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
        <Lightbulb size={18} className="text-yellow-500" />
        <span className="font-semibold text-sm">Recomendações</span>
      </div>
      <ul className="space-y-2">
        {recommendations.map((rec, index) => (
          <li
            key={index}
            className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-300"
          >
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5 flex-shrink-0" />
            <span>{rec}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ElementBalanceChart({
  mapaNatal,
  posicoes,
  className = '',
}: ElementBalanceChartProps) {
  const elementCounts = useMemo(() => {
    const positions = posicoes || (mapaNatal?.planeta ? Object.values(mapaNatal.planeta) : undefined);
    return calculateElementBalance(positions);
  }, [mapaNatal, posicoes]);

  const recommendations = useMemo(
    () => generateRecommendations(elementCounts),
    [elementCounts]
  );

  const maxCount = useMemo(
    () => Math.max(...elementCounts.map((e) => e.count)),
    [elementCounts]
  );

  return (
    <div className={`bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-lg">
          <Flame size={20} className="text-orange-500" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm">
            Balanço dos Elementos
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Distribuição astrológica
          </p>
        </div>
      </div>

      <div className="flex justify-between items-end gap-2 px-2">
        {elementCounts.map((element, index) => (
          <ElementBar
            key={element.elemento}
            element={element}
            maxCount={maxCount}
            index={index}
          />
        ))}
      </div>

      <RatioIndicator elementCounts={elementCounts} />

      <RecommendationsList recommendations={recommendations} />

      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Total: {elementCounts.reduce((sum, e) => sum + e.count, 0)} planetas</span>
          <span>Média: 25% cada</span>
        </div>
      </div>
    </div>
  );
}

export default ElementBalanceChart;
