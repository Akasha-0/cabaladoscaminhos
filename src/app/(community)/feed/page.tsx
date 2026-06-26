'use client';

// ============================================================================
// COMMUNITY FEED — Timeline principal da comunidade Akasha
// ============================================================================
// Posts das pessoas que você segue, dos grupos que participa, artigos
// recomendados pela IA. Cada item mostra autor, conteúdo, ações.
// ============================================================================

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Heart, MessageCircle, Share2, Bookmark, MoreHorizontal,
  Sparkles, Users, BookOpen, Hash, Send, Loader2,
  TrendingUp, Filter, Lightbulb, Leaf, Moon, Star, Flame,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================
// TYPES
// ============================================================

interface Author {
  id: string;
  handle: string;
  displayName: string;
  avatarUrl?: string;
  spiritualTag?: string; // ex: "Caminho de Vida 7 · Escorpião"
  orixa?: string;
}

interface Post {
  id: string;
  author: Author;
  content: string;
  type: 'TEXT' | 'LINK' | 'ARTICLE' | 'QUESTION' | 'EXPERIENCE' | 'PRACTICE';
  tradition?: string;
  topic?: string;
  groupName?: string;
  groupSlug?: string;
  mediaUrls?: string[];
  references?: Array<{ title: string; url?: string; doi?: string; year?: number }>;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  liked?: boolean;
  bookmarked?: boolean;
  createdAt: string;
}

interface FeedItem {
  post: Post;
  reason: 'followed_user_post' | 'group_post' | 'trending' | 'article_recommendation' | 'staff_pick';
}

// ============================================================
// MOCK DATA (substituir por API real)
// ============================================================

const MOCK_POSTS: Post[] = [
  {
    id: '1',
    author: {
      id: 'u1',
      handle: 'marina-caminhos',
      displayName: 'Marina dos Caminhos',
      spiritualTag: 'Caminho 7 · Escorpião',
      orixa: 'Iemanjá',
    },
    content: 'Acabei de terminar uma cerimônia com ayahuasca e o que mais me marcou foi a sensação de dissolução do ego. Vocês já passaram por isso? Queria entender melhor o que a neurociência diz sobre esse estado. Li um paper do Robin Carhart-Harris sobre entropia cerebral que faz muito sentido com o que vivi.',
    type: 'EXPERIENCE',
    tradition: 'xamanismo',
    topic: 'psilocibina',
    references: [
      { title: 'Entropic Brain Hypothesis', url: 'https://doi.org/10.1007/s00213-014-3716-z', doi: '10.1007/s00213-014-3716-z', year: 2014 },
    ],
    likesCount: 47,
    commentsCount: 12,
    sharesCount: 5,
    createdAt: '2h',
  },
  {
    id: '2',
    author: {
      id: 'u2',
      handle: 'ruy-ogum',
      displayName: 'Ruy de Ogum',
      spiritualTag: 'Caminho 11 · Leão',
      orixa: 'Ogum',
    },
    content: 'Para quem chegou agora: o grupo de Ifá tá crescendo e tem muito conteúdo novo. Esse mês postamos 3 artigos sobre o Odu Iwori e suas correspondências com a cabala. Vale a pena conferir na biblioteca!',
    type: 'TEXT',
    tradition: 'ifa',
    groupName: 'Ifá e Orixás',
    groupSlug: 'ifa',
    likesCount: 23,
    commentsCount: 4,
    sharesCount: 8,
    createdAt: '5h',
  },
  {
    id: '3',
    author: {
      id: 'u3',
      handle: 'bia-kether',
      displayName: 'Bia Kether',
      spiritualTag: 'Caminho 22 · Aquário',
      orixa: 'Oxalá',
    },
    content: 'Compartilhando: artigo novo na biblioteca sobre os efeitos do Reiki em pacientes com ansiedade. Estudo randomizado controlado com 120 participantes, redução significativa nos níveis de cortisol. Link nos comentários.',
    type: 'ARTICLE',
    tradition: 'reiki',
    topic: 'ansiedade',
    references: [
      { title: 'Effects of Reiki on Anxiety: RCT', url: 'https://pubmed.ncbi.nlm.nih.gov/...', year: 2023 },
    ],
    likesCount: 89,
    commentsCount: 21,
    sharesCount: 34,
    createdAt: '1d',
  },
  {
    id: '4',
    author: {
      id: 'u4',
      handle: 'caio-oxossi',
      displayName: 'Caio de Oxossi',
      spiritualTag: 'Caminho 3 · Sagitário',
      orixa: 'Oxóssi',
    },
    content: 'Pergunta pra comunidade: como vocês lidam com a dúvida entre seguir uma intuição forte e a razão? Hoje de manhã tive um impulso muito claro de cancelar uma reunião e ir caminhar na natureza. Cancelei. A reunião foi adiada de qualquer jeito. Como vocês cultivam essa escuta?',
    type: 'QUESTION',
    topic: 'intuicao',
    likesCount: 34,
    commentsCount: 28,
    sharesCount: 2,
    createdAt: '1d',
  },
];

// ============================================================
// HELPERS
// ============================================================

const TRADITION_COLORS: Record<string, string> = {
  cabala: 'from-violet-500/20 to-purple-500/20 text-violet-300 border-violet-500/30',
  ifa: 'from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-500/30',
  xamanismo: 'from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/30',
  tantra: 'from-pink-500/20 to-rose-500/20 text-pink-300 border-pink-500/30',
  reiki: 'from-cyan-500/20 to-sky-500/20 text-cyan-300 border-cyan-500/30',
  ayurveda: 'from-yellow-500/20 to-amber-500/20 text-yellow-300 border-yellow-500/30',
};

const TRADITION_LABELS: Record<string, string> = {
  cabala: 'Cabala',
  ifa: 'Ifá',
  xamanismo: 'Xamanismo',
  tantra: 'Tantra',
  reiki: 'Reiki',
  ayurveda: 'Ayurveda',
};

const POST_TYPE_ICONS = {
  TEXT: <MessageCircle className="w-3 h-3" />,
  LINK: <Share2 className="w-3 h-3" />,
  ARTICLE: <BookOpen className="w-3 h-3" />,
  QUESTION: <Lightbulb className="w-3 h-3" />,
  EXPERIENCE: <Star className="w-3 h-3" />,
  PRACTICE: <Leaf className="w-3 h-3" />,
};

// ============================================================
// POST CARD
// ============================================================

interface PostCardProps {
  post: Post;
  onLike?: (id: string) => void;
  onComment?: (id: string) => void;
  onShare?: (id: string) => void;
  onBookmark?: (id: string) => void;
}

function PostCard({ post, onLike, onComment, onShare, onBookmark }: PostCardProps) {
  const initials = post.author.displayName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <Card className="card-spiritual bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-sm border-slate-800/50 hover:border-slate-700/70 transition-all">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <Link href={`/u/${post.author.handle}`} className="flex items-center gap-3 group">
            <Avatar className="w-11 h-11 border-2 border-amber-500/20 group-hover:border-amber-500/50 transition-colors">
              <AvatarImage src={post.author.avatarUrl} />
              <AvatarFallback className="bg-gradient-to-br from-amber-500/20 to-violet-500/20 text-amber-300 text-sm">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-slate-100 group-hover:text-amber-300 transition-colors">
                {post.author.displayName}
              </p>
              <p className="text-xs text-slate-500">@{post.author.handle} · {post.createdAt}</p>
              {post.author.spiritualTag && (
                <p className="text-xs text-amber-400/80 mt-0.5">{post.author.spiritualTag}</p>
              )}
            </div>
          </Link>

          <div className="flex items-center gap-2">
            {post.tradition && (
              <Badge
                variant="outline"
                className={cn(
                  'text-xs bg-gradient-to-br border',
                  TRADITION_COLORS[post.tradition] || 'from-slate-500/20 to-slate-500/20 text-slate-300 border-slate-500/30'
                )}
              >
                {TRADITION_LABELS[post.tradition] || post.tradition}
              </Badge>
            )}
            <button className="p-1 text-slate-500 hover:text-slate-300 transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Post content */}
        <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">{post.content}</p>

        {/* Group context */}
        {post.groupName && (
          <Link
            href={`/groups/${post.groupSlug}`}
            className="inline-flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 transition-colors"
          >
            <Users className="w-3 h-3" />
            postado em <span className="font-medium">{post.groupName}</span>
          </Link>
        )}

        {/* References (scientific) */}
        {post.references && post.references.length > 0 && (
          <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-1.5">
            <p className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
              <BookOpen className="w-3 h-3" />
              Referências científicas
            </p>
            {post.references.map((ref, i) => (
              <a
                key={i}
                href={ref.url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-xs text-slate-400 hover:text-emerald-300 transition-colors"
              >
                • {ref.title}
                {ref.year && <span className="text-slate-600"> ({ref.year})</span>}
                {ref.doi && <span className="text-slate-600"> · DOI: {ref.doi}</span>}
              </a>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800/50">
          <div className="flex items-center gap-1">
            <ActionButton
              icon={<Heart className={cn('w-4 h-4', post.liked && 'fill-red-400 text-red-400')} />}
              count={post.likesCount}
              active={post.liked}
              onClick={() => onLike?.(post.id)}
              label="Curtir"
              activeColor="text-red-400"
            />
            <ActionButton
              icon={<MessageCircle className="w-4 h-4" />}
              count={post.commentsCount}
              onClick={() => onComment?.(post.id)}
              label="Comentar"
            />
            <ActionButton
              icon={<Share2 className="w-4 h-4" />}
              count={post.sharesCount}
              onClick={() => onShare?.(post.id)}
              label="Compartilhar"
            />
          </div>
          <button
            onClick={() => onBookmark?.(post.id)}
            className={cn(
              'p-2 rounded-lg transition-all',
              post.bookmarked
                ? 'text-amber-400 bg-amber-500/10'
                : 'text-slate-500 hover:text-amber-400 hover:bg-amber-500/5'
            )}
            aria-label="Salvar"
          >
            <Bookmark className={cn('w-4 h-4', post.bookmarked && 'fill-amber-400')} />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

function ActionButton({
  icon, count, active, onClick, label, activeColor = 'text-amber-400',
}: {
  icon: React.ReactNode;
  count: number;
  active?: boolean;
  onClick?: () => void;
  label: string;
  activeColor?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all',
        active ? activeColor : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
      )}
      aria-label={label}
    >
      {icon}
      <span className="text-xs font-medium">{count}</span>
    </button>
  );
}

// ============================================================
// COMPOSE BOX
// ============================================================

function ComposeBox({ onPost }: { onPost: (content: string) => void }) {
  const [content, setContent] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));
    onPost(content);
    setContent('');
    setSubmitting(false);
    setExpanded(false);
  };

  return (
    <Card className="card-spiritual bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-sm border-slate-800/50">
      <CardContent className="pt-4">
        <div className="flex gap-3">
          <Avatar className="w-10 h-10 border-2 border-amber-500/20">
            <AvatarFallback className="bg-gradient-to-br from-amber-500/20 to-violet-500/20 text-amber-300 text-sm">
              VC
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-3">
            <Textarea
              placeholder="O que você quer compartilhar com a comunidade?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onFocus={() => setExpanded(true)}
              className="min-h-[60px] bg-slate-800/30 border-slate-700/30 focus:border-amber-500/50 resize-none"
            />
            {expanded && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <PostTypeChip icon={<BookOpen className="w-3 h-3" />} label="Artigo" />
                  <PostTypeChip icon={<Lightbulb className="w-3 h-3" />} label="Pergunta" />
                  <PostTypeChip icon={<Star className="w-3 h-3" />} label="Experiência" />
                  <PostTypeChip icon={<Leaf className="w-3 h-3" />} label="Prática" />
                </div>
                <Button
                  onClick={handleSubmit}
                  disabled={!content.trim() || submitting}
                  className="bg-gradient-to-r from-amber-500 to-violet-500 hover:from-amber-600 hover:to-violet-600 text-white border-0"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Publicar
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PostTypeChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-all">
      {icon}
      {label}
    </button>
  );
}

// ============================================================
// SIDEBAR
// =========================================================================
// 1. Sugestões de pessoas pra seguir
// 2. Tradições em destaque
// 3. Artigos recomendados pela IA

function Sidebar() {
  return (
    <div className="space-y-4">
      {/* Tradições */}
      <Card className="card-spiritual bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-sm border-slate-800/50">
        <CardHeader className="pb-3 border-b border-slate-800/50">
          <h3 className="text-sm font-semibold bg-gradient-to-r from-amber-400 to-violet-400 bg-clip-text text-transparent flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            Tradições em destaque
          </h3>
        </CardHeader>
        <CardContent className="pt-3 space-y-2">
          {['cabala', 'ifa', 'xamanismo', 'tantra', 'reiki'].map((t) => (
            <Link
              key={t}
              href={`/groups/${t}`}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/50 transition-all group"
            >
              <span className="text-sm text-slate-300 group-hover:text-amber-300 transition-colors">
                {TRADITION_LABELS[t] || t}
              </span>
              <Badge variant="outline" className="text-xs border-slate-700 text-slate-500">
                {(Math.floor(Math.random() * 900) + 100)}+ membros
              </Badge>
            </Link>
          ))}
        </CardContent>
      </Card>

      {/* Artigos IA */}
      <Card className="card-spiritual bg-gradient-to-br from-violet-900/30 to-slate-900/90 border-violet-500/20">
        <CardHeader className="pb-3">
          <h3 className="text-sm font-semibold bg-gradient-to-r from-violet-300 to-pink-300 bg-clip-text text-transparent flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-400" />
            Sugestões da Akasha IA
          </h3>
          <p className="text-xs text-slate-500 mt-1">Baseado no seu mapa espiritual</p>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          <SuggestionItem
            title="Como Escorpião pode usar a meditação Vipassana"
            reason="seu signo lunar"
          />
          <SuggestionItem
            title="Estudo: Reiki em pacientes oncológicos (2023)"
            reason="tradição que você segue"
          />
          <SuggestionItem
            title="Ayahuasca e neuroplasticidade — revisão de 47 papers"
            reason="tópico que você curtiu"
          />
        </CardContent>
      </Card>

      {/* CTA perfil */}
      <Card className="card-spiritual bg-gradient-to-br from-amber-500/10 to-violet-500/10 border-amber-500/20">
        <CardContent className="pt-4 text-center space-y-2">
          <Sparkles className="w-8 h-8 mx-auto text-amber-400" />
          <p className="text-sm text-slate-200">Complete seu mapa espiritual</p>
          <p className="text-xs text-slate-400">
            Quanto mais dados você compartilhar, mais personalizadas são as sugestões da IA
          </p>
          <Button variant="outline" className="w-full mt-2 border-amber-500/30 text-amber-300 hover:bg-amber-500/10">
            Ver meu perfil espiritual
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function SuggestionItem({ title, reason }: { title: string; reason: string }) {
  return (
    <Link
      href="/library"
      className="block p-2.5 rounded-lg bg-slate-800/30 hover:bg-slate-800/60 transition-all group"
    >
      <p className="text-sm text-slate-200 group-hover:text-amber-300 transition-colors line-clamp-2">
        {title}
      </p>
      <p className="text-xs text-slate-500 mt-1">Por causa de: {reason}</p>
    </Link>
  );
}

// ============================================================
// MAIN FEED PAGE
// ============================================================

export default function CommunityFeedPage() {
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [filter, setFilter] = useState<'all' | 'seguindo' | 'grupos' | 'tendencias'>('all');
  const [loading, setLoading] = useState(false);

  // Hooks de ação (mock)
  const handleLike = (id: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, liked: !p.liked, likesCount: p.liked ? p.likesCount - 1 : p.likesCount + 1 }
          : p
      )
    );
  };

  const handleNewPost = (content: string) => {
    const newPost: Post = {
      id: `new-${Date.now()}`,
      author: {
        id: 'me',
        handle: 'voce',
        displayName: 'Você',
        spiritualTag: 'Mapa em construção',
      },
      content,
      type: 'TEXT',
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
      createdAt: 'agora',
    };
    setPosts((prev) => [newPost, ...prev]);
  };

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* Main feed column */}
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-cinzel bg-gradient-to-r from-amber-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
                  🌌 Akasha — Comunidade Viva
                </h1>
                <p className="text-sm text-slate-400 font-raleway mt-1">
                  Compartilhe, aprenda e evolua junto
                </p>
              </div>
            </div>

            {/* Filter tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              <FilterChip
                icon={<Sparkles className="w-3 h-3" />}
                label="Tudo"
                active={filter === 'all'}
                onClick={() => setFilter('all')}
              />
              <FilterChip
                icon={<Users className="w-3 h-3" />}
                label="Seguindo"
                active={filter === 'seguindo'}
                onClick={() => setFilter('seguindo')}
              />
              <FilterChip
                icon={<Hash className="w-3 h-3" />}
                label="Meus grupos"
                active={filter === 'grupos'}
                onClick={() => setFilter('grupos')}
              />
              <FilterChip
                icon={<TrendingUp className="w-3 h-3" />}
                label="Tendências"
                active={filter === 'tendencias'}
                onClick={() => setFilter('tendencias')}
              />
            </div>

            {/* Compose */}
            <ComposeBox onPost={handleNewPost} />

            {/* Posts */}
            {loading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="h-48 rounded-2xl bg-slate-800/30 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onLike={handleLike}
                    onComment={(id) => console.log('comment', id)}
                    onShare={(id) => console.log('share', id)}
                    onBookmark={(id) => console.log('bookmark', id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block">
            <Sidebar />
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterChip({
  icon, label, active, onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap',
        active
          ? 'bg-gradient-to-r from-amber-500/20 to-violet-500/20 text-amber-300 border border-amber-500/30'
          : 'bg-slate-800/50 text-slate-400 border border-slate-700/30 hover:text-slate-200 hover:border-slate-600/50'
      )}
    >
      {icon}
      {label}
    </button>
  );
}
