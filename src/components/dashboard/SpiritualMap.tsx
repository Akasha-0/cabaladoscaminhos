'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Sun, Moon, Droplets, Flame, Star, Heart, Zap, Shield, Crown,
  Orbit, Link2, Info, Sparkles, Globe, Circle
} from 'lucide-react';
import { chakras } from '@/lib/data/spiritual-data';
import type { OrixaData } from '@/lib/data/spiritual-data';
import { orixas } from '@/lib/data/spiritual-data';
import { PLANETAS_DATA } from '@/lib/astrologia/planetas/dados';
import type { Planeta } from '@/lib/astrologia/tipos';

// ============================================================
// TIPOS E INTERFACES
// ============================================================

type NoTipo = 'planeta' | 'orixa' | 'chakra';

interface No {
  id: string;
  tipo: NoTipo;
  nome: string;
  x: number;
  y: number;
  cor: string;
  icone: React.ElementType;
  dados: Record<string, unknown>;
}

interface Conexao {
  id: string;
  de: string;
  para: string;
  tipo: string;
  label: string;
}

// ============================================================
// CONSTANTES DE CORES E ÍCONES
// ============================================================

const CORES_PLANETAS: Record<string, string> = {
  sol: '#FFD700',
  lua: '#C0C0C0',
  mercurio: '#90EE90',
  venus: '#FFB6C1',
  marte: '#FF6347',
  jupiter: '#DEB887',
  saturno: '#DAA520',
  urano: '#87CEEB',
  netuno: '#4169E1',
  plutão: '#8B4513',
};

const ICONES_ORIXAS: Record<string, React.ElementType> = {
  'Oxalá': Crown,
  'Iemanjá': Moon,
  'Oxum': Heart,
  'Ogum': Shield,
  'Oxóssi': Star,
  'Xangô': Flame,
  'Iansã': Zap,
  'Omolu': Shield,
  'Nanã': Moon,
  'Oxumaré': Droplets,
  'Exu': Zap,
  'Logun Ede': Star,
};

const CORES_CHAKRA: Record<number, string> = {
  1: '#DC2626',
  2: '#EA580C',
  3: '#CA8A04',
  4: '#16A34A',
  5: '#0EA5E9',
  6: '#4F46E5',
  7: '#7C3AED',
};

const ICONES_CHAKRA: Record<number, React.ElementType> = {
  1: Zap,
  2: Droplets,
  3: Flame,
  4: Heart,
  5: Globe,
  6: Orbit,
  7: Sparkles,
};

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export function SpiritualMap() {
  const [noSelecionado, setNoSelecionado] = useState<No | null>(null);
  const [vista, setVista] = useState<'completa' | 'planetas' | 'orixas' | 'chakras'>('completa');
  const [mostrarConexoes, setMostrarConexoes] = useState(true);

  const nos = useMemo(() => gerarNos(), []);
  const conexoes = useMemo(() => gerarConexoes(nos), [nos]);

  const nosFiltrados = useMemo(() => {
    if (vista === 'completa') return nos;
    return nos.filter(no => {
      if (vista === 'planetas') return no.tipo === 'planeta';
      if (vista === 'orixas') return no.tipo === 'orixa';
      if (vista === 'chakras') return no.tipo === 'chakra';
      return true;
    });
  }, [nos, vista]);

  const conexoesFiltradas = useMemo(() => {
    if (!mostrarConexoes) return [];
    const idsVisiveis = new Set(nosFiltrados.map(n => n.id));
    return conexoes.filter(c => idsVisiveis.has(c.de) && idsVisiveis.has(c.para));
  }, [conexoes, nosFiltrados, mostrarConexoes]);

  return (
    <Card className="bg-gradient-to-br from-card to-card/80 border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Link2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Mapa Espiritual Interativo</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Conexões entre planetas, orixás e chakras
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            {nosFiltrados.length} nós • {conexoesFiltradas.length} conexões
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <Tabs value={vista} onValueChange={(v) => setVista(v as typeof vista)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="completa" className="text-xs">
              <Globe className="w-3 h-3 mr-1" />
              Completo
            </TabsTrigger>
            <TabsTrigger value="planetas" className="text-xs">
              <Sun className="w-3 h-3 mr-1" />
              Planetas
            </TabsTrigger>
            <TabsTrigger value="orixas" className="text-xs">
              <Star className="w-3 h-3 mr-1" />
              Orixás
            </TabsTrigger>
            <TabsTrigger value="chakras" className="text-xs">
              <Circle className="w-3 h-3 mr-1" />
              Chakras
            </TabsTrigger>
          </TabsList>

          <TabsContent value={vista} className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Mapa Visual */}
              <div className="lg:col-span-2">
                <div className="relative bg-gradient-to-br from-muted/30 to-muted/10 rounded-lg border border-border/30 overflow-hidden"
                     style={{ height: '450px' }}>
                  <MapaVisual
                    nos={nosFiltrados}
                    conexoes={conexoesFiltradas}
                    noSelecionado={noSelecionado}
                    onSelecionar={setNoSelecionado}
                    vista={vista}
                  />
                  
                  {/* Legenda */}
                  <div className="absolute bottom-3 left-3 flex gap-3 bg-background/80 backdrop-blur-sm rounded-lg p-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <span className="text-xs text-muted-foreground">Planetas</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-amber-600" />
                      <span className="text-xs text-muted-foreground">Orixás</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-purple-500" />
                      <span className="text-xs text-muted-foreground">Chakras</span>
                    </div>
                  </div>

                  {/* Toggle Conexões */}
                  <button
                    onClick={() => setMostrarConexoes(!mostrarConexoes)}
                    className="absolute top-3 right-3 p-2 bg-background/80 backdrop-blur-sm rounded-lg border border-border/30 hover:bg-background/90 transition-colors"
                    title={mostrarConexoes ? 'Ocultar conexões' : 'Mostrar conexões'}
                  >
                    <Link2 className={`w-4 h-4 ${mostrarConexoes ? 'text-primary' : 'text-muted-foreground'}`} />
                  </button>
                </div>
              </div>

              {/* Painel de Detalhes */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Detalhes
                </h3>
                {noSelecionado ? (
                  <PainelNo no={noSelecionado} />
                ) : (
                  <div className="bg-muted/30 rounded-lg p-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      Clique em um nó para ver os detalhes
                    </p>
                  </div>
                )}

                <Separator />

                <h3 className="text-sm font-medium">Conexões Recentes</h3>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {conexoesFiltradas.slice(0, 8).map(conexao => {
                    const noDe = nos.find(n => n.id === conexao.de);
                    const noPara = nos.find(n => n.id === conexao.para);
                    return (
                      <div
                        key={conexao.id}
                        className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => {
                          setNoSelecionado(noDe || null);
                        }}
                      >
                        <div className="flex -space-x-1">
                          <div
                            className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] border border-background"
                            style={{ backgroundColor: noDe?.cor || '#666' }}
                          >
                            {noDe?.nome.charAt(0)}
                          </div>
                          <div
                            className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] border border-background"
                            style={{ backgroundColor: noPara?.cor || '#666' }}
                          >
                            {noPara?.nome.charAt(0)}
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">{conexao.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// ============================================================
// COMPONENTE: MAPA VISUAL SVG
// ============================================================

interface MapaVisualProps {
  nos: No[];
  conexoes: Conexao[];
  noSelecionado: No | null;
  onSelecionar: (no: No | null) => void;
  vista: string;
}

function MapaVisual({ nos, conexoes, noSelecionado, onSelecionar, vista }: MapaVisualProps) {
  const largura = 700;
  const altura = 450;
  const centroX = largura / 2;
  const centroY = altura / 2;

  // Layout radial baseado no tipo
  const nosComPosicao = useMemo(() => {
    const planetas = nos.filter(n => n.tipo === 'planeta');
    const orixas = nos.filter(n => n.tipo === 'orixa');
    const chakras = nos.filter(n => n.tipo === 'chakra');

    return nos.map(no => {
      let x = no.x;
      let y = no.y;

      if (no.tipo === 'planeta') {
        const idx = planetas.indexOf(no);
        const angulo = (idx / planetas.length) * 2 * Math.PI - Math.PI / 2;
        const raio = 120;
        x = centroX + Math.cos(angulo) * raio;
        y = centroY + Math.sin(angulo) * raio;
      } else if (no.tipo === 'orixa') {
        const idx = orixas.indexOf(no);
        const angulo = (idx / orixas.length) * 2 * Math.PI - Math.PI / 2;
        const raio = 180;
        x = centroX + Math.cos(angulo) * raio;
        y = centroY + Math.sin(angulo) * raio;
      } else if (no.tipo === 'chakra') {
        const idx = chakras.indexOf(no);
        const angulo = (idx / chakras.length) * 2 * Math.PI - Math.PI / 2;
        const raio = 80;
        x = centroX + Math.cos(angulo) * raio;
        y = centroY + Math.sin(angulo) * raio;
      }

      return { ...no, x, y };
    });
  }, [nos, centroX, centroY]);

  // Criar mapa de posições para conexões
  const posicoes = new Map(nosComPosicao.map(n => [n.id, { x: n.x, y: n.y, cor: n.cor }]));

  return (
    <svg
      viewBox={`0 0 ${largura} ${altura}`}
      className="w-full h-full"
      style={{ maxHeight: '450px' }}
    >
      <defs>
        {/* Gradientes */}
        {Object.entries(CORES_PLANETAS).map(([planeta, cor]) => (
          <radialGradient key={planeta} id={`grad-${planeta}`}>
            <stop offset="0%" stopColor={cor} stopOpacity="0.8" />
            <stop offset="100%" stopColor={cor} stopOpacity="0.3" />
          </radialGradient>
        ))}

        {/* Filtro de brilho */}
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Linhas de conexão */}
      {conexoes.map(conexao => {
        const de = posicoes.get(conexao.de);
        const para = posicoes.get(conexao.para);
        if (!de || !para) return null;

        return (
          <g key={conexao.id}>
            <line
              x1={de.x}
              y1={de.y}
              x2={para.x}
              y2={para.y}
              stroke={`url(#grad-line)`}
              strokeWidth={noSelecionado?.id === conexao.de || noSelecionado?.id === conexao.para ? 2 : 1}
              strokeOpacity={noSelecionado ? (noSelecionado.id === conexao.de || noSelecionado.id === conexao.para ? 0.8 : 0.2) : 0.4}
              className="transition-all duration-300"
            />
            {/* Label no meio */}
            {(vista === 'completa') && (
              <text
                x={(de.x + para.x) / 2}
                y={(de.y + para.y) / 2}
                textAnchor="middle"
                className="text-[8px] fill-muted-foreground pointer-events-none"
              >
                {conexao.label}
              </text>
            )}
          </g>
        );
      })}

      {/* Gradiente para linhas (fallback) */}
      <defs>
        <linearGradient id="grad-line" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#666" stopOpacity="0.6" />
          <stop offset="50%" stopColor="#888" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#666" stopOpacity="0.6" />
        </linearGradient>
      </defs>

      {/* Nós */}
      {nosComPosicao.map(no => {
        const Icone = no.icone;
        const isSelected = noSelecionado?.id === no.id;
        const raio = 24;

        return (
          <g
            key={no.id}
            transform={`translate(${no.x}, ${no.y})`}
            className="cursor-pointer"
            onClick={() => onSelecionar(isSelected ? null : no)}
          >
            {/* Círculo de fundo */}
            <circle
              r={raio + 4}
              fill={no.cor}
              fillOpacity={isSelected ? 0.4 : 0.15}
              className="transition-all duration-200"
            />
            {/* Anel externo */}
            <circle
              r={raio}
              fill={no.cor}
              fillOpacity={0.3}
              stroke={no.cor}
              strokeWidth={isSelected ? 3 : 1.5}
              className="transition-all duration-200"
            />
            {/* Ícone */}
            <foreignObject x={-12} y={-12} width={24} height={24}>
              <div className="w-full h-full flex items-center justify-center">
                <Icone
                  className="w-4 h-4"
                  style={{ color: no.cor }}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                />
              </div>
            </foreignObject>
            {/* Label */}
            <text
              y={raio + 14}
              textAnchor="middle"
              className="text-[9px] fill-foreground font-medium pointer-events-none"
            >
              {no.nome.length > 12 ? no.nome.slice(0, 10) + '...' : no.nome}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ============================================================
// COMPONENTE: PAINEL DE DETALHES DO NÓ
// ============================================================

interface PainelNoProps {
  no: No;
}

function PainelNo({ no }: PainelNoProps) {
  const Icone = no.icone;

  return (
    <div className="bg-gradient-to-br from-muted/30 to-muted/10 rounded-lg p-3 border border-border/30">
      <div className="flex items-center gap-2 mb-3">
        <div
          className="p-2 rounded-full"
          style={{ backgroundColor: no.cor + '20' }}
        >
          <Icone className="w-4 h-4" style={{ color: no.cor }} />
        </div>
        <div>
          <h4 className="text-sm font-semibold">{no.nome}</h4>
          <Badge variant="outline" className="text-[10px] mt-0.5 capitalize">
            {no.tipo}
          </Badge>
        </div>
      </div>

      <div className="space-y-2">
        {Object.entries(no.dados).map(([key, value]) => {
          if (value === undefined || value === null || value === '') return null;
          return (
            <div key={key} className="flex justify-between items-start text-xs">
              <span className="text-muted-foreground capitalize">{key}:</span>
              <span className="text-foreground text-right max-w-[120px]">
                {String(value)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// FUNÇÕES DE GERAÇÃO DE DADOS
// ============================================================

function gerarNos(): No[] {
  const nos: No[] = [];

  // Planetas principais
  const planetasPrincipais: Planeta[] = ['sol', 'lua', 'mercurio', 'venus', 'marte', 'jupiter', 'saturno'];
  planetasPrincipais.forEach(planeta => {
    const info = PLANETAS_DATA[planeta];
    nos.push({
      id: `planeta-${planeta}`,
      tipo: 'planeta',
      nome: info.nome,
      x: 0,
      y: 0,
      cor: CORES_PLANETAS[planeta] || '#888',
      icone: getIconePlaneta(planeta),
      dados: {
        símbolo: info.simbolo,
        elemento: info.elemento,
        qualidade: info.qualidade,
        natureza: info.natureza,
        regência: info.regencia,
      },
    });
  });

  // Orixás principais
  orixas.slice(0, 10).forEach((orixa) => {
    const Icone = ICONES_ORIXAS[orixa.nome] || Star;
    nos.push({
      id: `orixa-${orixa.nome}`,
      tipo: 'orixa',
      nome: orixa.nome,
      x: 0,
      y: 0,
      cor: getCorOrixa(orixa.cores[0]),
      icone: Icone,
      dados: {
        dia: orixa.dia,
        chakra: orixa.chakra,
        planeta: orixa.planeta,
        cores: orixa.cores.join(', '),
        saluação: orixa.saudacao,
      },
    });
  });

  // Chakras
  chakras.forEach((chakra) => {
    const Icone = ICONES_CHAKRA[chakra.numero] || Circle;
    nos.push({
      id: `chakra-${chakra.numero}`,
      tipo: 'chakra',
      nome: chakra.nome.replace(/^\d+º\s*/, ''),
      x: 0,
      y: 0,
      cor: CORES_CHAKRA[chakra.numero] || '#888',
      icone: Icone,
      dados: {
        número: chakra.numero,
        cor: chakra.cor,
        planeta: chakra.planeta,
        elemento: chakra.elemento,
        freqSolfeggio: chakra.freqSolfeggio,
        poliedro: chakra.poliedro,
      },
    });
  });

  return nos;
}

function gerarConexoes(nos: No[]): Conexao[] {
  const conexoes: Conexao[] = [];
  const seen = new Set<string>();

  nos.forEach(no => {
    if (no.tipo === 'planeta') {
      // Conectar planeta com orixás que mencionam esse planeta
      nos.filter(n => n.tipo === 'orixa').forEach(orixa => {
        const planetaDoOrixa = String(orixa.dados.planeta || '').toLowerCase();
        const nomePlaneta = no.nome.toLowerCase();
        
        if (planetaDoOrixa.includes(nomePlaneta) || nomePlaneta.includes(planetaDoOrixa)) {
          const key = [no.id, orixa.id].sort().join('-');
          if (!seen.has(key)) {
            seen.add(key);
            conexoes.push({
              id: `con-${key}`,
              de: no.id,
              para: orixa.id,
              tipo: 'planeta-orixa',
              label: 'regência',
            });
          }
        }
      });

      // Conectar planeta com chakras que mencionam esse planeta
      nos.filter(n => n.tipo === 'chakra').forEach(chakra => {
        const planetaDoChakra = String(chakra.dados.planeta || '').toLowerCase();
        const nomePlaneta = no.nome.toLowerCase();
        
        if (planetaDoChakra.includes(nomePlaneta) || nomePlaneta.includes(planetaDoChakra)) {
          const key = [no.id, chakra.id].sort().join('-');
          if (!seen.has(key)) {
            seen.add(key);
            conexoes.push({
              id: `con-${key}`,
              de: no.id,
              para: chakra.id,
              tipo: 'planeta-chakra',
              label: 'influência',
            });
          }
        }
      });
    }

    if (no.tipo === 'orixa') {
      // Conectar orixá com chakra
      nos.filter(n => n.tipo === 'chakra').forEach(chakra => {
        const chakraDoOrixa = String(no.dados.chakra || '').toLowerCase();
        const nomeChakra = chakra.nome.toLowerCase();
        
        if (chakraDoOrixa.includes(nomeChakra) || nomeChakra.includes(chakraDoOrixa)) {
          const key = [no.id, chakra.id].sort().join('-');
          if (!seen.has(key)) {
            seen.add(key);
            conexoes.push({
              id: `con-${key}`,
              de: no.id,
              para: chakra.id,
              tipo: 'orixa-chakra',
              label: 'afinação',
            });
          }
        }
      });
    }
  });

  return conexoes;
}

// ============================================================
// HELPERS
// ============================================================

function getIconePlaneta(planeta: Planeta): React.ElementType {
  switch (planeta) {
    case 'sol': return Sun;
    case 'lua': return Moon;
    case 'mercurio': return Globe;
    case 'venus': return Heart;
    case 'marte': return Flame;
    case 'jupiter': return Star;
    case 'saturno': return Circle;
    default: return Orbit;
  }
}

function getCorOrixa(cor: string): string {
  const cores: Record<string, string> = {
    branco: '#FFFFFF',
    marfim: '#FFFFF0',
    azul: '#4169E1',
    rosa: '#FF69B4',
    amarelo: '#FFD700',
    verde: '#228B22',
    vermelho: '#DC2626',
    laranja: '#FF8C00',
    roxo: '#8B5CF6',
    preto: '#1F2937',
    dourado: '#DAA520',
  };
  
  const corLower = cor.toLowerCase();
  for (const [nome, hex] of Object.entries(cores)) {
    if (corLower.includes(nome)) return hex;
  }
  return '#8B5CF6';
}