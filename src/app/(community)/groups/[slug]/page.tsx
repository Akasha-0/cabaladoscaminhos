'use client';

// ============================================================================
// GROUP PAGE — /groups/[slug]
// ============================================================================
// Página de um grupo por tradição. Header com nome/descrição, botão de
// entrar/sair, feed de posts do grupo, membros em destaque.
// ============================================================================

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Users, BookOpen, Hash, ArrowLeft, Check, Plus, MessageCircle,
  Sparkles, Star, Loader2, Lock, Globe,
} from 'lucide-react';

// ============================================================
// MOCK DATA
// ============================================================

const GROUPS_DATA: Record<string, {
  name: string;
  emoji: string;
  description: string;
  longDescription: string;
  members: number;
  posts: number;
  isMember: boolean;
  color: string;
  rules: string[];
  pinnedArticles: Array<{ title: string; type: string }>;
  activeMembers: Array<{ handle: string; name: string; tag: string; color: string }>;
}> = {
  cabala: {
    name: 'Cabala',
    emoji: '✡️',
    description: 'Tradição mística judaica — Árvore da Vida, 10 Sefirot, 22 caminhos.',
    longDescription: 'Grupo dedicado ao estudo e prática da Cabala. Aqui discutimos a Árvore da Vida, as 10 Sefirot, os 22 caminhos entre elas, as meditações cabalísticas e como a sabedoria mística judaica pode ser vivida no cotidiano moderno. Universalista, respeitoso, aberto a todas as formas de estudo.',
    members: 412,
    posts: 1204,
    isMember: false,
    color: 'from-violet-500/20 to-purple-500/20 border-violet-500/30',
    rules: [
      'Respeito às diferentes correntes dentro da Cabala (Luria, Cordovero, Golden Dawn, etc)',
      'Compartilhe fontes — não invente correspondências sem base',
      'Cuidado com promessas absolutas — Cabala é estudo, não magia instantânea',
    ],
    pinnedArticles: [
      { title: 'Introdução à Árvore da Vida (atualizado 2024)', type: 'ESSAY' },
      { title: 'Kether: a primeira Sefirot explicada', type: 'ARTICLE' },
    ],
    activeMembers: [
      { handle: 'bia-kether', name: 'Bia Kether', tag: 'Caminho 22', color: 'violet' },
      { handle: 'gabriel-chokmah', name: 'Gabriel Chokmah', tag: 'Caminho 1', color: 'amber' },
      { handle: 'sarah-binah', name: 'Sarah Binah', tag: 'Caminho 3', color: 'cyan' },
    ],
  },
  ifa: {
    name: 'Ifá e Orixás',
    emoji: '🪶',
    description: 'Sistema iorubá — 16 Odu, orixás, preceitos cerimoniais.',
    longDescription: 'Comunidade de estudo do Ifá e dos Orixás. Compartilhamos o conhecimento dos 16 Odu, dos orixás regentes, dos preceitos e ebós. Respeitamos profundamente a tradição iorubá e seus babalorixás. Não é espaço para charlatanismo ou promessas de cura instantânea.',
    members: 387,
    posts: 982,
    isMember: true,
    color: 'from-amber-500/20 to-orange-500/20 border-amber-500/30',
    rules: [
      'Respeito aos babalorixás e yalorixás — não substitua o terreiro',
      'Não compartilhe ebós de forma superficial — consulte a tradição',
      'Honre os orixás — não use a tradição pra lucro fácil',
    ],
    pinnedArticles: [
      { title: 'Os 16 Odu e suas correspondências astrológicas', type: 'ARTICLE' },
      { title: 'Como saudar cada orixá', type: 'PRACTICE' },
    ],
    activeMembers: [
      { handle: 'ruy-ogum', name: 'Ruy de Ogum', tag: 'Caminho 11', color: 'amber' },
      { handle: 'caio-oxossi', name: 'Caio de Oxossi', tag: 'Caminho 3', color: 'emerald' },
      { handle: 'marina-iemanja', name: 'Marina de Iemanjá', tag: 'Caminho 7', color: 'cyan' },
    ],
  },
};

// ============================================================
// MAIN
// ============================================================

export default function GroupPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const group = GROUPS_DATA[slug] || GROUPS_DATA.cabala;
  const [isMember, setIsMember] = useState(group.isMember);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'membros' | 'biblioteca' | 'regras'>('posts');

  const handleJoin = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setIsMember((m) => !m);
    setLoading(false);
  };

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-400">Grupo não encontrado</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className={cn('relative h-48 md:h-64 bg-gradient-to-br border-b', group.color)}>
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at top right, rgba(251, 191, 36, 0.3), transparent 60%)',
        }} />
        <div className="relative max-w-5xl mx-auto px-4 h-full flex items-end pb-6">
          <Link href="/explore" className="text-slate-400 hover:text-amber-300 text-sm flex items-center gap-1 mb-4">
            <ArrowLeft className="w-3 h-3" />
            Explorar
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-8 md:-mt-12 relative z-10">
        {/* Group identity */}
        <Card className="card-spiritual bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-sm border-slate-800/50">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-start gap-4">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-amber-500/20 to-violet-500/20 border-2 border-slate-800/50 flex items-center justify-center text-5xl">
                {group.emoji}
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-cinzel text-slate-100">
                      {group.name}
                    </h1>
                    <p className="text-sm text-slate-400 mt-1 max-w-2xl">
                      {group.description}
                    </p>
                  </div>
                  <Button
                    onClick={handleJoin}
                    disabled={loading}
                    className={cn(
                      isMember
                        ? 'border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300'
                        : 'bg-gradient-to-r from-amber-500 to-violet-500 hover:from-amber-600 hover:to-violet-600 text-white border-0'
                    )}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : isMember ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Membro
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Entrar
                      </>
                    )}
                  </Button>
                </div>

                <div className="flex items-center gap-4 mt-3 text-sm text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    {group.members} membros
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MessageCircle className="w-4 h-4" />
                    {group.posts} posts
                  </span>
                  <Badge variant="outline" className="text-xs border-slate-700 text-slate-500">
                    <Globe className="w-3 h-3 mr-1" />
                    público
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'posts')}>
          <TabsList className="bg-slate-800/50 border border-slate-700/50 mt-6">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="membros">Membros</TabsTrigger>
            <TabsTrigger value="biblioteca">Biblioteca</TabsTrigger>
            <TabsTrigger value="regras">Regras</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
              <div className="space-y-3">
                <p className="text-center text-slate-500 py-12">
                  Posts do grupo {group.name} aparecerão aqui
                </p>
              </div>
              <Sidebar group={group} />
            </div>
          </TabsContent>

          <TabsContent value="membros" className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {group.activeMembers.map((m) => (
                <Card key={m.handle} className="card-spiritual bg-slate-900/50 border-slate-800/50">
                  <CardContent className="pt-4 flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-amber-500/20 text-amber-300">
                        {m.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-100 truncate">{m.name}</p>
                      <p className="text-xs text-amber-400/80">{m.tag}</p>
                    </div>
                    <Button size="sm" variant="ghost" className="text-slate-400">
                      <Plus className="w-3 h-3" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="biblioteca" className="mt-6">
            <div className="space-y-3">
              {group.pinnedArticles.map((a, i) => (
                <Card key={i} className="card-spiritual bg-slate-900/50 border-slate-800/50 hover:border-amber-500/30 transition-all">
                  <CardContent className="pt-4 flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-amber-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-100 font-medium">{a.title}</p>
                      <p className="text-xs text-slate-500">{a.type}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="regras" className="mt-6">
            <Card className="card-spiritual bg-slate-900/50 border-slate-800/50">
              <CardHeader className="pb-3 border-b border-slate-800/50">
                <CardTitle className="text-base text-slate-100">Regras da comunidade</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3 text-sm">
                <p className="text-slate-400 mb-3">{group.longDescription}</p>
                <ol className="space-y-2 list-decimal list-inside text-slate-300">
                  {group.rules.map((rule, i) => (
                    <li key={i} className="leading-relaxed">{rule}</li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function Sidebar({ group }: { group: typeof GROUPS_DATA.cabala }) {
  return (
    <div className="space-y-3">
      <Card className="card-spiritual bg-slate-900/50 border-slate-800/50">
        <CardHeader className="pb-3 border-b border-slate-800/50">
          <CardTitle className="text-sm text-amber-300 flex items-center gap-2">
            <Sparkles className="w-3 h-3" />
            Sobre o grupo
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-3 text-xs text-slate-400 leading-relaxed">
          {group.longDescription}
        </CardContent>
      </Card>

      <Card className="card-spiritual bg-slate-900/50 border-slate-800/50">
        <CardHeader className="pb-3 border-b border-slate-800/50">
          <CardTitle className="text-sm text-amber-300 flex items-center gap-2">
            <Hash className="w-3 h-3" />
            Artigos fixados
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-3 space-y-2">
          {group.pinnedArticles.map((a, i) => (
            <Link
              key={i}
              href="#"
              className="block text-xs text-slate-300 hover:text-amber-300 transition-colors"
            >
              • {a.title}
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
