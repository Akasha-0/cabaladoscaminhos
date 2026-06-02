// fallow-ignore-file unused-file
'use client';

import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import {
  FileText,
  Sparkles,
  Star,
  TrendingUp,
  Calendar,
  Download,
  Share2,
  ChevronRight,
  ChevronDown,
  Eye,
  Heart,
  Shield,
  Zap,
} from 'lucide-react';

// ============================================================
// TYPES
// ============================================================

export interface SpiritualReportCardProps {
  userData?: {
    id?: string;
    nome?: string;
    odu?: string;
    orixaRegente?: string;
    numeroPessoal?: number;
  };
  report?: SpiritualReport;
  className?: string;
  onDownload?: () => void;
  onShare?: () => void;
}

export interface SpiritualReport {
  id: string;
  title: string;
  generatedAt: Date;
  overallScore: number;
  sections: ReportSection[];
  insights: string[];
  recommendations: string[];
}

export interface ReportSection {
  id: string;
  title: string;
  icon: string;
  score: number;
  summary: string;
  details: string[];
  recommendations?: string[];
}

interface SectionConfig {
  icon: React.ReactNode;
  color: string;
  bg: string;
  border: string;
}

// ============================================================
// CONSTANTS
// ============================================================

const SECTION_CONFIG: Record<string, SectionConfig> = {
  'numerologia': {
    icon: <TrendingUp className="w-4 h-4" />,
    color: 'text-blue-400',
    bg: 'bg-blue-500/20',
    border: 'border-l-blue-500',
  },
  'astrologia': {
    icon: <Star className="w-4 h-4" />,
    color: 'text-purple-400',
    bg: 'bg-purple-500/20',
    border: 'border-l-purple-500',
  },
  'ifa': {
    icon: <Sparkles className="w-4 h-4" />,
    color: 'text-amber-400',
    bg: 'bg-amber-500/20',
    border: 'border-l-amber-500',
  },
  'cabala': {
    icon: <Shield className="w-4 h-4" />,
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/20',
    border: 'border-l-indigo-500',
  },
  'ritual': {
    icon: <Heart className="w-4 h-4" />,
    color: 'text-pink-400',
    bg: 'bg-pink-500/20',
    border: 'border-l-pink-500',
  },
  'energia': {
    icon: <Zap className="w-4 h-4" />,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/20',
    border: 'border-l-emerald-500',
  },
};

// ============================================================
// DEFAULT REPORT DATA
// ============================================================

const DEFAULT_REPORT: SpiritualReport = {
  id: 'rpt-001',
  title: 'Relatório Espiritual Completo',
  generatedAt: new Date(),
  overallScore: 78,
  sections: [
    {
      id: '1',
      title: 'Numerologia',
      icon: 'numerologia',
      score: 85,
      summary: 'Seu número pessoal indica forte tendência ao autoconhecimento.',
      details: [
        'Número pessoal alinhado com práticas espirituais',
        'Arco pessoal favorece meditação e contemplação',
        'Influência numerológica positiva para relacionamentos',
      ],
      recommendations: [
        'Pratique diariamente cálculos de numerologia básica',
        'Medite sobre o significado do seu número de destino',
      ],
    },
    {
      id: '2',
      title: 'Astrologia',
      icon: 'astrologia',
      score: 72,
      summary: 'Posições planetárias indicam potencial para transformação.',
      details: [
        'Signo regente favorece intuição e sensibilidade',
        'Casas astrológicas indicam foco em espiritualidade',
        'Aspectos harmoniosos com Netuno favorecem espiritualidade',
      ],
      recommendations: [
        'Estude a posição da Lua em seu mapa',
        'Observe trânsitos de Júpiter para oportunidades',
      ],
    },
    {
      id: '3',
      title: 'Ifá/Odu',
      icon: 'ifa',
      score: 90,
      summary: 'Conexão profunda com a tradição Ifá e orixás.',
      details: [
        'Odu pessoal indica missão de cura e proteção',
        'Orixá regente oferece suporte especial',
        'Prática de ebós recomendada para alinhamento',
      ],
      recommendations: [
        'Mantenha disciplina com oferendas regulares',
        'Consulte o babalawo mensalmente para orientações',
      ],
    },
    {
      id: '4',
      title: 'Cabala',
      icon: 'cabala',
      score: 65,
      summary: 'Caminho das sefirot em desenvolvimento inicial.',
      details: [
        'Sefirot dominantes: Chokhmah e Binah',
        'Caminho do Meio em construção',
        'Necessidade de equilibrar rigor e compaixão',
      ],
      recommendations: [
        'Estude as 10 sefirot progressivamente',
        'Pratique visualization do árvore da vida',
      ],
    },
  ],
  insights: [
    'Seu caminho espiritual está em ascensão',
    'Conexão com ancestrais está fortalecendo',
    'Recomendada prática de silêncio diário',
    'Orixá regente demanda dedicação especial',
  ],
  recommendations: [
    'Manter rotina de meditação matinal',
    'Priorizar práticas de gratidão',
    'Evitar decisões importantes em dias de baixa energia',
    'Buscar orientação mensal de mentores espirituais',
  ],
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-400';
  if (score >= 60) return 'text-amber-400';
  return 'text-red-400';
}

function getScoreBg(score: number): string {
  if (score >= 80) return 'bg-emerald-500/20';
  if (score >= 60) return 'bg-amber-500/20';
  return 'bg-red-500/20';
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

interface SectionCardProps {
  section: ReportSection;
  isExpanded: boolean;
  onToggle: () => void;
}

function SectionCard({ section, isExpanded, onToggle }: SectionCardProps) {
  const config = SECTION_CONFIG[section.icon] || SECTION_CONFIG['numerologia'];
  const scoreColor = getScoreColor(section.score);
  const scoreBg = getScoreBg(section.score);

  return (
    <div className={cn(
      'bg-slate-700/30 rounded-lg border border-slate-600/50 overflow-hidden transition-all',
      config.border, 'border-l-4'
    )}>
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between hover:bg-slate-700/20 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={cn('p-2 rounded-lg', config.bg)}>
            <span className={config.color}>{config.icon}</span>
          </div>
          <div className="text-left">
            <h4 className="font-semibold text-white">{section.title}</h4>
            <p className="text-slate-400 text-sm">{section.summary}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className={cn('px-3 py-1 rounded-full', scoreBg)}>
            <span className={cn('font-bold text-sm', scoreColor)}>{section.score}</span>
          </div>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 border-t border-slate-600/30">
          <div className="mt-4 space-y-3">
            <div>
              <h5 className="text-slate-300 text-sm font-medium mb-2">Detalhes</h5>
              <ul className="space-y-2">
                {section.details.map((detail, index) => (
                  <li key={index} className="flex items-start gap-2 text-slate-400 text-sm">
                    <span className="text-purple-400 mt-0.5">•</span>
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
            
            {section.recommendations && section.recommendations.length > 0 && (
              <div>
                <h5 className="text-slate-300 text-sm font-medium mb-2">Recomendações</h5>
                <ul className="space-y-2">
                  {section.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2 text-slate-400 text-sm">
                      <span className="text-emerald-400 mt-0.5">✓</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface ScoreGaugeProps {
  score: number;
  size?: number;
}

function ScoreGauge({ score, size = 120 }: ScoreGaugeProps) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const colorClass = getScoreColor(score);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          className="text-slate-700"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className={colorClass}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-white">{score}</span>
        <span className="text-xs text-slate-400">Score</span>
      </div>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function SpiritualReportCard({
  userData,
  report = DEFAULT_REPORT,
  className = '',
  onDownload,
  onShare,
}: SpiritualReportCardProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [showInsights, setShowInsights] = useState(true);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const averageScore = useMemo(() => {
    if (report.sections.length === 0) return 0;
    const sum = report.sections.reduce((acc, section) => acc + section.score, 0);
    return Math.round(sum / report.sections.length);
  }, [report]);

  return (
    <div className={cn('bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden', className)}>
      {/* Header */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl">
              <FileText className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">{report.title}</h3>
              <p className="text-slate-400 text-sm flex items-center gap-2">
                <Calendar className="w-3 h-3" />
                {formatDate(report.generatedAt)}
                {userData?.nome && (
                  <>
                    <span className="text-slate-600">•</span>
                    <span>{userData.nome}</span>
                  </>
                )}
              </p>
            </div>
          </div>
          
          {/* Score Gauge */}
          <ScoreGauge score={averageScore} size={100} />
        </div>
      </div>

      {/* Sections */}
      <div className="p-4 space-y-3 max-h-96 overflow-y-auto scrollbar-thin">
        {report.sections.map(section => (
          <SectionCard
            key={section.id}
            section={section}
            isExpanded={expandedSections.has(section.id)}
            onToggle={() => toggleSection(section.id)}
          />
        ))}
      </div>

      {/* Insights */}
      <div className="p-4 border-t border-slate-700/50 bg-slate-800/30">
        <button
          onClick={() => setShowInsights(!showInsights)}
          className="w-full flex items-center justify-between mb-3"
        >
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-amber-400" />
            <span className="text-white font-medium">Insights Rápidos</span>
          </div>
          {showInsights ? (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-slate-400" />
          )}
        </button>
        
        {showInsights && (
          <div className="grid grid-cols-2 gap-2">
            {report.insights.slice(0, 4).map((insight, index) => (
              <div
                key={index}
                className="p-3 bg-slate-700/30 rounded-lg border border-slate-600/50"
              >
                <p className="text-slate-300 text-xs">{insight}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-slate-700/50 flex justify-end gap-2">
        <button
          onClick={onShare}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg transition-colors"
        >
          <Share2 className="w-4 h-4 text-slate-400" />
          <span className="text-slate-300 text-sm">Compartilhar</span>
        </button>
        <button
          onClick={onDownload}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-lg transition-colors"
        >
          <Download className="w-4 h-4 text-white" />
          <span className="text-white text-sm">Baixar PDF</span>
        </button>
      </div>
    </div>
  );
}

export default SpiritualReportCard;