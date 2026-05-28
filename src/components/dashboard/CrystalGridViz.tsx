'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { generateCrystalGrid, Intencao, Cristal } from '@/lib/geometria-sagrada/crystal-grid';

type IntencaoType = Intencao;

const INTENCOES: IntencaoType[] = ['cura', 'proteção', 'amor', 'prosperidade'];

const CRYSTAL_COLORS: Record<string, string> = {
  'quartzo-rosa': '#FFB6C1',
  'esmeralda': '#50C878',
  'pedra-de-lua': '#E6E6FA',
  'crisocola': '#2E8B57',
  'jade': '#00A86B',
  'amazonita': '#7FFFD4',
  'obsidiana': '#1C1C1C',
  'turmalina-negra': '#2F2F2F',
  'labradorita': '#6A5ACD',
  'hematita': '#8B8B8B',
  'shungite': '#36454F',
  'pirita': '#DAA520',
  'rodocrosita': '#BC8F8F',
  'malaia': '#FFE4E1',
  'rosa-do-deserto': '#F4A460',
  'kunzita': '#D8BFD8',
  'morganita': '#FF69B4',
  'citrino': '#FFD700',
  'olho-de-tigre': '#B8860B',
  'turmalina-verde': '#00FF7F',
  'agata-fortuna': '#DEB887',
};

interface AnimatedCrystal extends Cristal {
  animationDelay: number;
  animationProgress: number;
}

export function CrystalGridViz() {
  const [intencao, setIntencao] = useState<IntencaoType>('cura');
  const [animationKey, setAnimationKey] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const grid = useMemo(() => generateCrystalGrid(intencao), [intencao]);

  const animatedCristais = useMemo<AnimatedCrystal[]>(() => {
    return grid.cristais.map((cristal, index) => ({
      ...cristal,
      animationDelay: index * 150,
      animationProgress: 0,
    }));
  }, [grid, animationKey]);

  const animateCrystal = (x: number, y: number) => {
    const element = document.querySelector(`[data-crystal-x="${x}"][data-crystal-y="${y}"]`);
    if (element) {
      element.classList.add('crystal-appear');
    }
  };

  useEffect(() => {
    if (!mounted) return;

    setAnimationKey(prev => prev + 1);

    animatedCristais.forEach((cristal) => {
      const timer = setTimeout(() => {
        animateCrystal(cristal.posicao.x, cristal.posicao.y);
      }, cristal.animationDelay);
      return () => clearTimeout(timer);
    });
  }, [intencao, mounted]);

  const handleIntencaoChange = (value: string | null) => {
    if (value) {
      setIntencao(value as IntencaoType);
    }
  };

  const getChakraColor = (chakra: number): string => {
    const colors = ['#FF0000', '#FF8C00', '#FFFF00', '#00FF00', '#00CED1', '#0000FF', '#8B00FF'];
    return colors[chakra - 1] || colors[3];
  };

  const renderShapeIndicator = (forma: string) => {
    const fill = 'none';
    const stroke = 'currentColor';
    const strokeWidth = 2;
    const size = 140;
    const center = size / 2;
    const scale = 0.45;

    switch (forma) {
      case 'Hexágono':
        const hexPoints = Array.from({ length: 6 }, (_, i) => {
          const angle = (i * 60 - 30) * (Math.PI / 180);
          return `${center + 50 * Math.cos(angle)},${center + 50 * Math.sin(angle)}`;
        }).join(' ');
        return <polygon points={hexPoints} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />;
      case 'Pentágono':
        const pentPoints = Array.from({ length: 5 }, (_, i) => {
          const angle = (i * 72 - 90) * (Math.PI / 180);
          return `${center + 50 * Math.cos(angle)},${center + 50 * Math.sin(angle)}`;
        }).join(' ');
        return <polygon points={pentPoints} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />;
      case 'Círculo':
        return <circle cx={center} cy={center} r={50} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />;
      case 'Triângulo':
        const triPoints = Array.from({ length: 3 }, (_, i) => {
          const angle = (i * 120 - 90) * (Math.PI / 180);
          return `${center + 50 * Math.cos(angle)},${center + 50 * Math.sin(angle)}`;
        }).join(' ');
        return <polygon points={triPoints} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />;
      default:
        return <circle cx={center} cy={center} r={50} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-purple-900/20 bg-gradient-to-br from-purple-950/40 to-slate-950">
        <CardHeader>
          <CardTitle className="text-2xl bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">
            Grid de Cristais
          </CardTitle>
          <p className="text-sm text-slate-400">
            visualization de arranjo cristalino conforme intenção espiritual
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Label htmlFor="intencao">Intenção</Label>
            <Select value={intencao} onValueChange={handleIntencaoChange}>
              <SelectTrigger id="intencao" className="w-[200px] bg-slate-900/50 border-purple-500/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cura">Cura</SelectItem>
                <SelectItem value="proteção">Proteção</SelectItem>
                <SelectItem value="amor">Amor</SelectItem>
                <SelectItem value="prosperidade">Prosperidade</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-slate-950/50 border-slate-700/30">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-purple-300">{grid.formaGeometrica}</CardTitle>
                  <svg viewBox="0 0 140 140" className="w-10 h-10 text-purple-400/60">
                    {renderShapeIndicator(grid.formaGeometrica)}
                  </svg>
                </div>
                <p className="text-xs text-slate-500">{grid.descricao}</p>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <div className="relative w-[300px] h-[300px]">
                    <svg
                      viewBox="-250 -250 500 500"
                      className="w-full h-full"
                      style={{ filter: 'drop-shadow(0 0 20px rgba(147, 51, 234, 0.3))' }}
                    >
                      <defs>
                        <radialGradient id="crystalGlow" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="rgba(147, 51, 234, 0.4)" />
                          <stop offset="100%" stopColor="rgba(147, 51, 234, 0)" />
                        </radialGradient>
                        <filter id="glow">
                          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                          <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                          </feMerge>
                        </filter>
                      </defs>

                      {grid.cristais.map((cristal, index) => {
                        const scaledX = cristal.posicao.x * 2;
                        const scaledY = cristal.posicao.y * 2;
                        const delay = index * 150;
                        const size = 35;

                        return (
                          <g
                            key={`${cristal.tipo}-${index}-${animationKey}`}
                            data-crystal-x={cristal.posicao.x}
                            data-crystal-y={cristal.posicao.y}
                            transform={`translate(${scaledX}, ${scaledY})`}
                            style={{
                              opacity: 0,
                              animation: `delay-${delay}ms`,
                            }}
                            className="crystal-group"
                          >
                            <circle
                              r={size + 10}
                              fill="url(#crystalGlow)"
                              className="crystal-glow"
                            />
                            <path
                              d={`M 0 ${-size} L ${size * 0.6} ${-size * 0.3} L ${size * 0.6} ${size * 0.3} L 0 ${size} L ${-size * 0.6} ${size * 0.3} L ${-size * 0.6} ${-size * 0.3} Z`}
                              fill={CRYSTAL_COLORS[cristal.tipo] || '#9CA3AF'}
                              stroke={getChakraColor(cristal.chakra)}
                              strokeWidth={2}
                              filter="url(#glow)"
                              className="crystal-shape"
                            />
                            <text
                              y={size + 15}
                              textAnchor="middle"
                              className="text-[8px] fill-slate-300 font-medium pointer-events-none select-none"
                            >
                              {cristal.nome.split(' ')[0]}
                            </text>
                          </g>
                        );
                      })}
                    </svg>

                    <style jsx>{`
                      .crystal-group {
                        animation: crystalAppear 0.6s ease-out forwards;
                      }
                      @keyframes crystalAppear {
                        0% {
                          opacity: 0;
                          transform: translate(var(--tx, 0), var(--ty, 0)) scale(0);
                        }
                        50% {
                          opacity: 1;
                          transform: translate(var(--tx, 0), var(--ty, 0)) scale(1.2);
                        }
                        100% {
                          opacity: 1;
                          transform: translate(var(--tx, 0), var(--ty, 0)) scale(1);
                        }
                      }
                      .crystal-shape {
                        transition: transform 0.3s ease;
                      }
                      .crystal-group:hover .crystal-shape {
                        transform: scale(1.1);
                      }
                      .crystal-glow {
                        animation: pulseGlow 2s ease-in-out infinite;
                      }
                      @keyframes pulseGlow {
                        0%, 100% { opacity: 0.5; }
                        50% { opacity: 0.8; }
                      }
                    `}</style>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-950/50 border-slate-700/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-purple-300">Cristais do Grid</CardTitle>
                <p className="text-xs text-slate-500">
                  {grid.cristais.length} cristais • Intention: {intencao}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[240px] overflow-y-auto pr-2">
                  {grid.cristais.map((cristal, index) => (
                    <div
                      key={`${cristal.tipo}-${index}`}
                      className="flex items-start gap-3 p-2 rounded-lg bg-slate-900/40 border border-slate-800/50 hover:border-purple-500/30 transition-colors"
                    >
                      <div
                        className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0"
                        style={{
                          backgroundColor: CRYSTAL_COLORS[cristal.tipo] || '#9CA3AF',
                          boxShadow: `0 0 10px ${CRYSTAL_COLORS[cristal.tipo] || '#9CA3AF'}40`,
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-200 text-sm">{cristal.nome}</span>
                          <span
                            className="text-xs px-1.5 py-0.5 rounded"
                            style={{
                              backgroundColor: `${getChakraColor(cristal.chakra)}20`,
                              color: getChakraColor(cristal.chakra),
                            }}
                          >
                            Ch.{cristal.chakra}
                          </span>
                        </div>
                        <p 
                          className="text-xs text-slate-400 mt-0.5 leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: cristal.significado }}
                        />
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-purple-400/80">
                            {cristal.sefirot}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-center gap-2">
            <Button
              onClick={() => {
                setAnimationKey(prev => prev + 1);
                animatedCristais.forEach((cristal) => {
                  const timer = setTimeout(() => {
                    animateCrystal(cristal.posicao.x, cristal.posicao.y);
                  }, cristal.animationDelay);
                  return () => clearTimeout(timer);
                });
              }}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reiniciar Animação
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default CrystalGridViz;
