'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles, User, Heart, Compass, Info, ChevronDown, ChevronUp } from 'lucide-react';

interface NumerologiaData {
  numero: number;
  tipo: string;
  interpretacao: string;
}

interface NumerologyResult {
  vida: NumerologiaData | null;
  expressao: NumerologiaData | null;
  destino: NumerologiaData | null;
}

interface HoveredNumber {
  tipo: 'vida' | 'expressao' | 'destino';
  x: number;
  y: number;
}

const NUMERO_CORES: Record<number, { primaria: string; secundaria: string; gradiente: string }> = {
  1: { primaria: '#6366F1', secundaria: '#8B5CF6', gradiente: 'from-indigo-500 to-purple-600' },
  2: { primaria: '#EC4899', secundaria: '#F472B6', gradiente: 'from-pink-500 to-rose-400' },
  3: { primaria: '#F59E0B', secundaria: '#FBBF24', gradiente: 'from-amber-400 to-yellow-300' },
  4: { primaria: '#10B981', secundaria: '#34D399', gradiente: 'from-emerald-500 to-teal-400' },
  5: { primaria: '#3B82F6', secundaria: '#60A5FA', gradiente: 'from-blue-500 to-cyan-400' },
  6: { primaria: '#8B5CF6', secundaria: '#A78BFA', gradiente: 'from-violet-500 to-purple-400' },
  7: { primaria: '#0EA5E9', secundaria: '#38BDF8', gradiente: 'from-sky-500 to-cyan-300' },
  8: { primaria: '#EF4444', secundaria: '#F87171', gradiente: 'from-red-500 to-orange-400' },
  9: { primaria: '#F97316', secundaria: '#FB923C', gradiente: 'from-orange-500 to-amber-400' },
};

function getCorNumero(numero: number): { primaria: string; secundaria: string; gradiente: string } {
  return NUMERO_CORES[numero] || NUMERO_CORES[1];
}

function getDescricaoTipo(tipo: string): { label: string; icon: React.ReactNode; descricao: string } {
  switch (tipo) {
    case 'pitagorica':
      return {
        label: 'Caminho de Vida',
        icon: <Compass className="w-4 h-4" />,
        descricao: 'Sua missão de alma nesta vida',
      };
    case 'pitagorica-nome':
      return {
        label: 'Expressão',
        icon: <User className="w-4 h-4" />,
        descricao: 'Como você se expressa ao mundo',
      };
    case 'caldeia':
      return {
        label: 'Destino',
        icon: <Sparkles className="w-4 h-4" />,
        descricao: 'Seu caminho espiritual',
      };
    default:
      return {
        label: tipo,
        icon: <Heart className="w-4 h-4" />,
        descricao: 'Número numerológico',
      };
  }
}

function NumeroCircular({
  numero,
  tipo,
  interpretacao,
  onHover,
  onLeave,
  expanded,
  onToggle,
}: {
  numero: number;
  tipo: string;
  interpretacao: string;
  onHover: (info: HoveredNumber) => void;
  onLeave: () => void;
  expanded: boolean;
  onToggle: () => void;
}) {
  const cor = getCorNumero(numero);
  const info = getDescricaoTipo(tipo);

  return (
    <div
      className="relative flex flex-col items-center"
      onMouseEnter={(e) => onHover({ tipo: tipo as 'vida' | 'expressao' | 'destino', x: e.clientX, y: e.clientY })}
      onMouseLeave={onLeave}
    >
      <div
        className={`relative w-32 h-32 rounded-full bg-gradient-to-br ${cor.gradiente} flex items-center justify-center shadow-lg hover:scale-105 transition-transform cursor-pointer group`}
        onClick={onToggle}
      >
        <div className="absolute inset-0 rounded-full bg-white/20 group-hover:bg-white/30 transition-colors" />
        <div className="flex flex-col items-center z-10">
          <span className="text-4xl font-bold text-white drop-shadow-md">{numero}</span>
          <span className="text-xs text-white/90 mt-1 font-medium">{info.label}</span>
        </div>
        <div className="absolute -bottom-6">
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-white/70" />
          ) : (
            <ChevronDown className="w-4 h-4 text-white/70" />
          )}
        </div>
      </div>

      {expanded && (
        <div
          className={`mt-8 p-4 rounded-xl bg-gradient-to-br ${cor.gradiente} backdrop-blur-sm border border-white/20 shadow-xl max-w-xs`}
        >
          <p className="text-sm text-white/90 leading-relaxed">{interpretacao}</p>
        </div>
      )}
    </div>
  );
}

function Tooltip({
  numero,
  tipo,
  interpretacao,
  position,
}: {
  numero: number;
  tipo: string;
  interpretacao: string;
  position: HoveredNumber;
}) {
  const info = getDescricaoTipo(tipo);
  const cor = getCorNumero(numero);

  return (
    <div
      className="fixed z-50 pointer-events-none"
      style={{
        left: position.x + 16,
        top: position.y - 80,
      }}
    >
      <div className={`bg-gradient-to-br ${cor.gradiente} rounded-xl p-4 shadow-2xl border border-white/20 max-w-xs`}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl font-bold text-white">{numero}</span>
          <span className="text-sm text-white/90 font-medium">{info.label}</span>
        </div>
        <p className="text-xs text-white/80 leading-relaxed">{interpretacao}</p>
      </div>
    </div>
  );
}

function GraficoNumerologico({
  resultados,
  hovered,
  onHover,
  onLeave,
  expandedTipo,
  onToggle,
}: {
  resultados: NumerologyResult;
  hovered: HoveredNumber | null;
  onHover: (info: HoveredNumber) => void;
  onLeave: () => void;
  expandedTipo: string | null;
  onToggle: (tipo: string | null) => void;
}) {
  const items = [
    { key: 'vida' as const, data: resultados.vida },
    { key: 'expressao' as const, data: resultados.expressao },
    { key: 'destino' as const, data: resultados.destino },
  ];

  return (
    <div className="flex flex-col items-center gap-8">
      {items.map((item) => {
        if (!item.data) return null;
        const { tipo } = item.data;
        return (
          <NumeroCircular
            key={item.key}
            numero={item.data.numero}
            tipo={tipo}
            interpretacao={item.data.interpretacao}
            onHover={onHover}
            onLeave={onLeave}
            expanded={expandedTipo === tipo}
            onToggle={() => onToggle(expandedTipo === tipo ? null : tipo)}
          />
        );
      })}
    </div>
  );
}

interface NumerologyChartProps {
  nome?: string;
  dataNascimento?: string;
  className?: string;
}

export function NumerologyChart({
  nome = 'Ana Silva',
  dataNascimento = '1990-01-15',
  className = '',
}: NumerologyChartProps) {
  const [resultados, setResultados] = useState<NumerologyResult>({
    vida: null,
    expressao: null,
    destino: null,
  });
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [hovered, setHovered] = useState<HoveredNumber | null>(null);
  const [expandedTipo, setExpandedTipo] = useState<string | null>(null);

  const fetchNumerologia = useCallback(async () => {
    setLoading(true);
    setErro(null);

    try {
      const [vidaRes, expressaoRes, destinoRes] = await Promise.all([
        fetch(`/api/numerologia?tipo=pitagorica&nome=${encodeURIComponent(nome)}&data=${dataNascimento}`),
        fetch(`/api/numerologia?tipo=pitagorica&nome=${encodeURIComponent(nome)}`),
        fetch(`/api/numerologia?tipo=destino&nome=${encodeURIComponent(nome)}&data=${dataNascimento}`),
      ]);

      const [vidaData, expressaoData, destinoData] = await Promise.all([
        vidaRes.json(),
        expressaoRes.json(),
        destinoRes.json(),
      ]);

      setResultados({
        vida: vidaData.success ? vidaData.data : null,
        expressao: expressaoData.success ? expressaoData.data : null,
        destino: destinoData.success ? destinoData.data : null,
      });
    } catch (err) {
      setErro('Erro ao carregar dados numerológicos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [nome, dataNascimento]);

  useEffect(() => {
    fetchNumerologia();
  }, [fetchNumerologia]);

  const handleHover = (info: HoveredNumber) => {
    setHovered(info);
  };

  const handleLeave = () => {
    setHovered(null);
  };

  const handleToggle = (tipo: string | null) => {
    setExpandedTipo(tipo);
  };

  if (loading) {
    return (
      <Card className={`bg-gradient-to-br from-indigo-950/50 to-purple-950/50 border-indigo-500/30 ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-indigo-100">
            <Sparkles className="w-5 h-5" />
            Mapa Numerológico
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-8 py-12">
            <Skeleton className="w-32 h-32 rounded-full bg-indigo-500/20" />
            <Skeleton className="w-32 h-32 rounded-full bg-indigo-500/20" />
            <Skeleton className="w-32 h-32 rounded-full bg-indigo-500/20" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (erro) {
    return (
      <Card className={`bg-gradient-to-br from-red-950/50 to-rose-950/50 border-red-500/30 ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-100">
            <Info className="w-5 h-5" />
            Mapa Numerológico
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-200 text-center py-8">{erro}</p>
          <button
            onClick={fetchNumerologia}
            className="w-full mt-4 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
          >
            Tentar novamente
          </button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={`bg-gradient-to-br from-indigo-950/50 to-purple-950/50 border-indigo-500/30 ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-indigo-100">
            <Sparkles className="w-5 h-5" />
            Mapa Numerológico
          </CardTitle>
          <p className="text-indigo-300 text-sm mt-1">
            {nome} • {new Date(dataNascimento).toLocaleDateString('pt-BR')}
          </p>
        </CardHeader>
        <CardContent>
          <GraficoNumerologico
            resultados={resultados}
            hovered={hovered}
            onHover={handleHover}
            onLeave={handleLeave}
            expandedTipo={expandedTipo}
            onToggle={handleToggle}
          />

          <div className="flex justify-center gap-4 mt-8">
            {resultados.vida && (
              <Badge
                variant="outline"
                className="bg-indigo-500/20 text-indigo-200 border-indigo-500/30"
              >
                Vida: {resultados.vida.numero}
              </Badge>
            )}
            {resultados.expressao && (
              <Badge
                variant="outline"
                className="bg-pink-500/20 text-pink-200 border-pink-500/30"
              >
                Expressão: {resultados.expressao.numero}
              </Badge>
            )}
            {resultados.destino && (
              <Badge
                variant="outline"
                className="bg-amber-500/20 text-amber-200 border-amber-500/30"
              >
                Destino: {resultados.destino.numero}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {hovered && (
        <Tooltip
          numero={hovered.tipo === 'vida' ? resultados.vida?.numero || 0 : hovered.tipo === 'expressao' ? resultados.expressao?.numero || 0 : resultados.destino?.numero || 0}
          tipo={hovered.tipo}
          interpretacao={hovered.tipo === 'vida' ? resultados.vida?.interpretacao || '' : hovered.tipo === 'expressao' ? resultados.expressao?.interpretacao || '' : resultados.destino?.interpretacao || ''}
          position={hovered}
        />
      )}
    </>
  );
}

export default NumerologyChart;