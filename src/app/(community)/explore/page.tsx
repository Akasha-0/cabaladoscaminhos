'use client';

// ============================================================================
// EXPLORAR — /explore
// ============================================================================
// Mostra tradições em destaque, artigos trending, pessoas pra seguir,
// grupos pra entrar. Página de descoberta.
// ============================================================================

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Search, TrendingUp, Users, BookOpen, Sparkles, Hash,
  UserPlus, ArrowRight, Loader2, Star, Filter, Flame,
  Brain, Heart, Leaf, Moon, Sun,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================
// DATA
// ============================================================

const TRADITIONS = [
  {
    slug: 'cabala',
    name: 'Cabala',
    emoji: '✡️',
    description: 'Tradição mística judaica. Árvore da Vida, 10 Sefirot, 22 caminhos.',
    members: 412,
    posts: 1204,
    color: 'from-violet-500/20 to-purple-500/20 border-violet-500/30',
    textColor: 'text-violet-300',
  },
  {
    slug: 'ifa',
    name: 'Ifá e Orixás',
    emoji: '🪶',
    description: 'Sistema iorubá. 16 Odu, orixás, preceitos cerimoniais.',
    members: 387,
    posts: 982,
    color: 'from-amber-500/20 to-orange-500/20 border-amber-500/30',
    textColor: 'text-amber-300',
  },
  {
    slug: 'xamanismo',
    name: 'Xamanismo',
    emoji: '🌿',
    description: 'Tradições indígenas, plantas sagradas, ayahuasca, sananga.',
    members: 245,
    posts: 678,
    color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30',
    textColor: 'text-emerald-300',
  },
  {
    slug: 'tantra',
    name: 'Tantra',
    emoji: '🕉️',
    description: 'Tradição hindu. Kundalini, chakras, deidades, meditação tântrica.',
    members: 198,
    posts: 432,
    color: 'from-pink-500/20 to-rose-500/20 border-pink-500/30',
    textColor: 'text-pink-300',
  },
  {
    slug: 'reiki',
    name: 'Reiki',
    emoji: '🙏',
    description: 'Canalização de energia universal. Níveis, símbolos, cura.',
    members: 312,
    posts: 567,
    color: 'from-cyan-500/20 to-sky-500/20 border-cyan-500/30',
    textColor: 'text-cyan-300',
  },
  {
    slug: 'ayurveda',
    name: 'Ayurveda',
    emoji: '🌺',
    description: 'Medicina tradicional indiana. Doshas, ervas, alimentação.',
    members: 156,
    posts: 289,
    color: 'from-yellow-500/20 to-amber-500/20 border-yellow-500/30',
    textColor: 'text-yellow-300',
  },
  {
    slug: 'meditacao',
    name: 'Meditação',
    emoji: '🧘',
    description: 'Vipassana, mindfulness, zazen, técnicas contemplativas.',
    members: 523,
    posts: 1456,
    color: 'from-slate-500/20 to-slate-500/20 border-slate-500/30',
    textColor: 'text-slate-300',
  },
  {
    slug: 'astrologia',
    name: 'Astrologia',
    emoji: '⭐',
    description: 'Trânsitos, signos, mapa natal, sinastria, evolução.',
    members: 689,
    posts: 2103,
    color: 'from-indigo-500/20 to-blue-500/20 border-indigo-500/30',
    textColor: 'text-indigo-300',
  },
];

const SUGGESTED_PEOPLE = [
  {
    handle: 'ruy-ogum',
    displayName: 'Ruy de Ogum',
    bio: 'Estudioso de Ifá, 12 anos de caminhada. Compartilho o que aprendo.',
    tag: 'Caminho 11 · Ogum',
    color: 'amber',
  },
  {
    handle: 'caio-oxossi',
    displayName: 'Caio de Oxossi',
    bio: 'Curandeiro em formação. Explorando as medicinas da floresta.',
    tag: 'Caminho 3 · Oxóssi',
    color: 'emerald',
  },
  {
    handle: 'bia-kether',
    displayName: 'Bia Kether',
    bio: 'Kabbalista praticante. Traduzindo a Árvore da Vida pro dia a dia.',
    tag: 'Caminho 22 · Oxalá',
    color: 'violet',
  },
  {
    handle: 'leo-ary',
    displayName: 'Leo Ary',
    bio: 'Astrólogo, tarólogo. Cartas e estrelas, juntos.',
    tag: 'Caminho 5 · Iansã',
    color: 'pink',
  },
];

const TRENDING_ARTICLES = [
  {
    title: 'Efeitos do Reiki em ansiedade: revisão sistemática de 2024',
    type: 'SCIENTIFIC_PAPER',
    evidence: 'META_ANALYSIS',
    tradition: 'reiki',
    author: 'Journal of Complementary Medicine',
    reads: 1820,
  },
  {
    title: 'Ayahuasca e neuroplasticidade: o que 47 papers dizem',
    type: 'SCIENTIFIC_PAPER',
    evidence: 'META_ANALYSIS',
    tradition: 'xamanismo',
    author: 'Nature Neuroscience Review',
    reads: 1342,
  },
  {
    title: 'Meditação Vipassana altera estrutura cerebral em 8 semanas',
    type: 'SCIENTIFIC_PAPER',
    evidence: 'PEER_REVIEWED',
    tradition: 'meditacao',
    author: 'Harvard Neuroscience',
    reads: 987,
  },
  {
    title: 'Como Cabalistas meditavam no século XVI',
    type: 'ESSAY',
    evidence: 'ANECDOTAL',
    tradition: 'cabala',
    author: 'Bia Kether',
    reads: 654,
  },
];

const TRENDING_TOPICS = [
  { name: 'psilocibina', posts: 47 },
  { name: 'correlação signos-odús', posts: 32 },
  { name: 'meditação pra ansiedade', posts: 28 },
  { name: 'kundalini', posts: 24 },
  { name: 'ayurveda e alimentação', posts: 19 },
  { name: 'medo e espiritualidade', posts: 18 },
];

// ============================================================
// HELPERS
// ============================================================

const EVIDENCE_LABELS: Record<string, { label: string; color: string }> = {
  ANECDOTAL: { label: 'Anecdótico', color: 'text-slate-400 border-slate-500/30' },
  OBSERVATIONAL: { label: 'Observacional', color: 'text-cyan-300 border-cyan-500/30' },
  PEER_REVIEWED: { label: 'Revisado por pares', color: 'text-emerald-300 border-emerald-500/30' },
  META_ANALYSIS: { label: 'Meta-análise', color: 'text-amber-300 border-amber-500/30' },
};

// ============================================================
// MAIN
// ============================================================

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'tudo' | 'tradições' | 'pessoas' | 'artigos' | 'tópicos'>('tudo');

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-cinzel bg-gradient-to-r from-amber-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
            ✦ Explorar
          </h1>
          <p className="text-slate-400 text-sm font-raleway mt-1">
            Descubra tradições, pessoas, artigos e tópicos em destaque na comunidade
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            placeholder="Buscar tradições, pessoas, artigos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 bg-slate-800/50 border-slate-700/50 focus:border-amber-500/50"
          />
        </div>

        {/* Category tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {(['tudo', 'tradições', 'pessoas', 'artigos', 'tópicos'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                'px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap',
                activeCategory === cat
                  ? 'bg-gradient-to-r from-amber-500/20 to-violet-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-slate-800/50 text-slate-400 border border-slate-700/30 hover:text-slate-200'
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Tradições */}
        {(activeCategory === 'tudo' || activeCategory === 'tradições') && (
          <section>
            <SectionHeader icon={<Flame className="w-4 h-4" />} title="Tradições" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {TRADITIONS.map((t) => (
                <Link key={t.slug} href={`/groups/${t.slug}`}>
                  <Card className={cn(
                    'h-full bg-gradient-to-br border backdrop-blur-sm hover:scale-[1.02] transition-all cursor-pointer',
                    t.color
                  )}>
                    <CardContent className="pt-4 pb-4">
                      <div className="text-4xl mb-2">{t.emoji}</div>
                      <h3 className={cn('font-cinzel font-semibold mb-1', t.textColor)}>
                        {t.name}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                        {t.description}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {t.members}
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          {t.posts}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Pessoas pra seguir */}
        {(activeCategory === 'tudo' || activeCategory === 'pessoas') && (
          <section>
            <SectionHeader icon={<UserPlus className="w-4 h-4" />} title="Pessoas que você talvez conheça" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SUGGESTED_PEOPLE.map((p) => (
                <Card key={p.handle} className="card-spiritual bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-sm border-slate-800/50">
                  <CardContent className="pt-4 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500/20 to-violet-500/20 flex items-center justify-center text-amber-300 font-semibold">
                      {p.displayName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-100 truncate">{p.displayName}</p>
                      <p className="text-xs text-amber-400/80">{p.tag}</p>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1">{p.bio}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 flex-shrink-0"
                    >
                      <UserPlus className="w-3 h-3" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Artigos trending */}
        {(activeCategory === 'tudo' || activeCategory === 'artigos') && (
          <section>
            <SectionHeader icon={<BookOpen className="w-4 h-4" />} title="Artigos em destaque" />
            <div className="space-y-3">
              {TRENDING_ARTICLES.map((article, i) => {
                const evidence = EVIDENCE_LABELS[article.evidence];
                return (
                  <Card key={i} className="card-spiritual bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-sm border-slate-800/50 hover:border-amber-500/30 transition-all">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <Badge variant="outline" className={cn('text-xs', evidence.color)}>
                              {evidence.label}
                            </Badge>
                            <Badge variant="outline" className="text-xs border-slate-700 text-slate-400">
                              {article.tradition}
                            </Badge>
                          </div>
                          <h3 className="font-semibold text-slate-100 hover:text-amber-300 transition-colors cursor-pointer">
                            {article.title}
                          </h3>
                          <p className="text-xs text-slate-500 mt-1">
                            {article.author} · {article.reads.toLocaleString()} leituras
                          </p>
                        </div>
                        <Button variant="ghost" size="sm" className="text-slate-500 flex-shrink-0">
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {/* Tópicos trending */}
        {(activeCategory === 'tudo' || activeCategory === 'tópicos') && (
          <section>
            <SectionHeader icon={<Hash className="w-4 h-4" />} title="Tópicos em alta" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {TRENDING_TOPICS.map((t) => (
                <Link
                  key={t.name}
                  href={`/explore?topic=${encodeURIComponent(t.name)}`}
                  className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/50 hover:border-amber-500/30 hover:bg-slate-800/50 transition-all"
                >
                  <p className="text-sm text-slate-200 font-medium">#{t.name}</p>
                  <p className="text-xs text-slate-500 mt-1">{t.posts} posts</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-amber-400">{icon}</span>
      <h2 className="text-lg font-semibold text-slate-200">{title}</h2>
    </div>
  );
}
