'use client';

// ============================================================================
// LIBRARY — /library
// ============================================================================
// Biblioteca coletiva de artigos. Filtros: tradição, tipo, nível de evidência.
// ============================================================================

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search, BookOpen, Filter, ExternalLink, Bookmark, Eye, Quote,
  Brain, FlaskConical, FileText, Video, Mic, BookText, TrendingUp, Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================
// DATA
// ============================================================

const ARTICLES = [
  {
    id: 'a1',
    title: 'Efeitos do Reiki em ansiedade: revisão sistemática 2024',
    summary: 'Revisão de 23 estudos randomizados controlados mostra redução significativa em escalas de ansiedade (HAM-A) em pacientes que receberam Reiki verdadeiro vs sham.',
    type: 'SCIENTIFIC_PAPER',
    evidence: 'META_ANALYSIS',
    tradition: 'reiki',
    topics: ['ansiedade', 'energética'],
    authors: 'Díaz-Rodríguez et al.',
    year: 2024,
    reads: 1820,
    doi: '10.1234/jcm.2024.001',
  },
  {
    id: 'a2',
    title: 'Ayahuasca e neuroplasticidade: o que 47 papers dizem',
    summary: 'Meta-análise de estudos com fMRI e PET-scan mostra aumento de conexões neurais em Default Mode Network e córtex pré-frontal após sessões com ayahuasca.',
    type: 'SCIENTIFIC_PAPER',
    evidence: 'META_ANALYSIS',
    tradition: 'xamanismo',
    topics: ['neurociência', 'psilocibina', 'depressão'],
    authors: 'Palhano-Fontes et al.',
    year: 2023,
    reads: 1342,
    doi: '10.1038/s41598-023-12345',
  },
  {
    id: 'a3',
    title: 'Meditação Vipassana altera estrutura cerebral em 8 semanas',
    summary: 'Estudo longitudinal mostra aumento de massa cinzenta em ínsula e córtex pré-frontal, e redução de amígdala em praticantes de Vipassana.',
    type: 'SCIENTIFIC_PAPER',
    evidence: 'PEER_REVIEWED',
    tradition: 'meditacao',
    topics: ['neurociência', 'vipassana'],
    authors: 'Harvard Neuroscience Lab',
    year: 2022,
    reads: 987,
  },
  {
    id: 'a4',
    title: 'Cabala: introdução à Árvore da Vida',
    summary: 'Um guia acessível às 10 Sefirot, seus atributos divinos, e como elas se relacionam com a jornada humana de despertar.',
    type: 'ESSAY',
    evidence: 'ANECDOTAL',
    tradition: 'cabala',
    topics: ['sefirot', 'iniciantes'],
    authors: 'Bia Kether',
    year: 2024,
    reads: 654,
  },
  {
    id: 'a5',
    title: 'Como Cabalistas meditavam no século XVI',
    summary: 'Análise histórica das práticas meditativas do Arizal (Isaac Luria) e seus discípulos, com comparação a práticas contemporâneas.',
    type: 'ESSAY',
    evidence: 'ANECDOTAL',
    tradition: 'cabala',
    topics: ['história', 'meditação'],
    authors: 'Bia Kether',
    year: 2024,
    reads: 421,
  },
  {
    id: 'a6',
    title: 'O que a ciência sabe sobre psilocibina e depressão resistente',
    summary: 'Revisão dos estudos clínicos de Johns Hopkins, Imperial College e Compass Pathways sobre psilocibina para depressão que não responde a tratamento convencional.',
    type: 'MAGAZINE_ARTICLE',
    evidence: 'PEER_REVIEWED',
    tradition: 'xamanismo',
    topics: ['psilocibina', 'depressão'],
    authors: 'The New Atlantis',
    year: 2024,
    reads: 2103,
  },
  {
    id: 'a7',
    title: 'Odu Iwori: preceitos cerimoniais e correspondências astrológicas',
    summary: 'Mapeamento dos 16 Odu do Ifá com signos, planetas e elementos, baseado em estudo de babalorixás e astrólogos.',
    type: 'ARTICLE',
    evidence: 'ANECDOTAL',
    tradition: 'ifa',
    topics: ['odu', 'astrologia'],
    authors: 'Ruy de Ogum',
    year: 2024,
    reads: 387,
  },
  {
    id: 'a8',
    title: 'Podcast: Ayurveda e alimentação na prática diária',
    summary: 'Episódio especial com a Dra. Anjali Sharma sobre como ajustar a dieta segundo seu dosha predominante.',
    type: 'PODCAST',
    evidence: 'OBSERVATIONAL',
    tradition: 'ayurveda',
    topics: ['alimentação', 'doshas'],
    authors: 'Caminhos da Saúde',
    year: 2024,
    reads: 234,
  },
];

// ============================================================
// FILTERS
// ============================================================

const TYPE_LABELS: Record<string, { label: string; icon: any }> = {
  SCIENTIFIC_PAPER: { label: 'Paper', icon: FlaskConical },
  MAGAZINE_ARTICLE: { label: 'Artigo', icon: FileText },
  BOOK: { label: 'Livro', icon: BookText },
  VIDEO: { label: 'Vídeo', icon: Video },
  PODCAST: { label: 'Podcast', icon: Mic },
  ESSAY: { label: 'Ensaio', icon: Quote },
};

const EVIDENCE_LABELS: Record<string, { label: string; color: string }> = {
  ANECDOTAL: { label: 'Anecdótico', color: 'text-slate-400 border-slate-500/30 bg-slate-500/5' },
  OBSERVATIONAL: { label: 'Observacional', color: 'text-cyan-300 border-cyan-500/30 bg-cyan-500/5' },
  PEER_REVIEWED: { label: 'Revisado por pares', color: 'text-emerald-300 border-emerald-500/30 bg-emerald-500/5' },
  META_ANALYSIS: { label: 'Meta-análise', color: 'text-amber-300 border-amber-500/30 bg-amber-500/5' },
};

const TRADITIONS = ['todas', 'cabala', 'ifa', 'xamanismo', 'tantra', 'reiki', 'ayurveda', 'meditacao'];
const TYPES = ['todos', 'SCIENTIFIC_PAPER', 'MAGAZINE_ARTICLE', 'BOOK', 'PODCAST', 'ESSAY'];
const EVIDENCES = ['todas', 'ANECDOTAL', 'OBSERVATIONAL', 'PEER_REVIEWED', 'META_ANALYSIS'];

// ============================================================
// MAIN
// ============================================================

export default function LibraryPage() {
  const [search, setSearch] = useState('');
  const [tradition, setTradition] = useState('todas');
  const [type, setType] = useState('todos');
  const [evidence, setEvidence] = useState('todas');
  const [sort, setSort] = useState<'recent' | 'popular'>('recent');

  const filtered = ARTICLES.filter((a) => {
    if (search && !a.title.toLowerCase().includes(search.toLowerCase()) && !a.summary.toLowerCase().includes(search.toLowerCase())) return false;
    if (tradition !== 'todas' && a.tradition !== tradition) return false;
    if (type !== 'todos' && a.type !== type) return false;
    if (evidence !== 'todas' && a.evidence !== evidence) return false;
    return true;
  }).sort((a, b) => {
    if (sort === 'popular') return b.reads - a.reads;
    return b.year - a.year;
  });

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-cinzel bg-gradient-to-r from-amber-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
            📚 Biblioteca
          </h1>
          <p className="text-slate-400 text-sm font-raleway mt-1">
            Artigos, papers e ensaios curados pela comunidade — classificados por nível de evidência
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            placeholder="Buscar artigos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11 bg-slate-800/50 border-slate-700/50 focus:border-amber-500/50"
          />
        </div>

        {/* Filters */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <span className="text-xs text-slate-500 flex-shrink-0">Tradição:</span>
            {TRADITIONS.map((t) => (
              <FilterChip key={t} label={t} active={tradition === t} onClick={() => setTradition(t)} />
            ))}
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <span className="text-xs text-slate-500 flex-shrink-0">Tipo:</span>
            {TYPES.map((t) => (
              <FilterChip
                key={t}
                label={t === 'todos' ? 'todos' : TYPE_LABELS[t]?.label || t}
                active={type === t}
                onClick={() => setType(t)}
              />
            ))}
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <span className="text-xs text-slate-500 flex-shrink-0">Evidência:</span>
            {EVIDENCES.map((e) => (
              <FilterChip
                key={e}
                label={e === 'todas' ? 'todas' : EVIDENCE_LABELS[e]?.label || e}
                active={evidence === e}
                onClick={() => setEvidence(e)}
              />
            ))}
          </div>
        </div>

        {/* Sort + count */}
        <div className="flex items-center justify-between text-sm">
          <p className="text-slate-500">
            {filtered.length} {filtered.length === 1 ? 'artigo' : 'artigos'}
          </p>
          <div className="flex items-center gap-1 bg-slate-800/50 rounded-lg p-0.5 border border-slate-700/30">
            <button
              onClick={() => setSort('recent')}
              className={cn(
                'px-3 py-1 rounded-md text-xs transition-all',
                sort === 'recent' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400'
              )}
            >
              Recente
            </button>
            <button
              onClick={() => setSort('popular')}
              className={cn(
                'px-3 py-1 rounded-md text-xs transition-all',
                sort === 'popular' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400'
              )}
            >
              Popular
            </button>
          </div>
        </div>

        {/* Articles list */}
        <div className="space-y-3">
          {filtered.map((article) => {
            const TypeInfo = TYPE_LABELS[article.type];
            const EvidenceInfo = EVIDENCE_LABELS[article.evidence];
            const TypeIcon = TypeInfo?.icon || FileText;
            return (
              <Card
                key={article.id}
                className="card-spiritual bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-sm border-slate-800/50 hover:border-amber-500/30 transition-all"
              >
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                      <TypeIcon className="w-5 h-5 text-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Badge variant="outline" className={cn('text-xs', EvidenceInfo.color)}>
                          {EvidenceInfo.label}
                        </Badge>
                        <Badge variant="outline" className="text-xs border-slate-700 text-slate-400">
                          {article.tradition}
                        </Badge>
                        {article.topics.slice(0, 2).map((t) => (
                          <span key={t} className="text-xs text-slate-500">
                            #{t}
                          </span>
                        ))}
                      </div>
                      <h3 className="font-semibold text-slate-100 hover:text-amber-300 transition-colors cursor-pointer">
                        {article.title}
                      </h3>
                      <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                        {article.summary}
                      </p>
                      <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
                        <span>{article.authors} · {article.year}</span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {article.reads.toLocaleString()}
                        </span>
                        {article.doi && (
                          <a
                            href={`https://doi.org/${article.doi}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300"
                          >
                            <ExternalLink className="w-3 h-3" />
                            DOI
                          </a>
                        )}
                      </div>
                    </div>
                    <button className="p-2 rounded-lg text-slate-500 hover:text-amber-300 hover:bg-amber-500/10 transition-all flex-shrink-0">
                      <Bookmark className="w-4 h-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <BookOpen className="w-12 h-12 mx-auto text-slate-600 mb-3" />
            <p className="text-slate-400">Nenhum artigo encontrado com esses filtros</p>
            <Button
              variant="outline"
              onClick={() => {
                setSearch('');
                setTradition('todas');
                setType('todos');
                setEvidence('todas');
              }}
              className="mt-4 border-slate-700"
            >
              Limpar filtros
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap border',
        active
          ? 'bg-gradient-to-r from-amber-500/20 to-violet-500/20 text-amber-300 border-amber-500/30'
          : 'bg-slate-800/50 text-slate-400 border-slate-700/30 hover:text-slate-200'
      )}
    >
      {label}
    </button>
  );
}
