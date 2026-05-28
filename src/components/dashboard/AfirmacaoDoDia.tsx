'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, Share2, Check, Sparkles, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AfirmacaoDoDiaProps {
  nome?: string;
  numeroPessoal?: number;
}

interface Afirmacao {
  id: string;
  texto: string;
  categoria: string;
  data: string;
}

const AFIRMACOES = [
  { texto: "Akó querubyn, eu sou luz. Eu sou paz. Eu sou caminho.", categoria: "Proteção Divina" },
  { texto: "Eu abraço novos começos com coragem e determinação. Minha energia lidera o caminho.", categoria: "Novo Ciclo" },
  { texto: "A harmonia flui naturalmente em minha vida. Cada conexão que faço traz luz e paz.", categoria: "Harmonia" },
  { texto: "Minha criatividade transborda. Expresso minha verdade com alegria e inspiração.", categoria: "Criatividade" },
  { texto: "A prosperidade flui naturalmente para mim. Sou um ímã para a abundância em todas as áreas da minha vida.", categoria: "Abundância" },
  { texto: "Eu sou digno de amor. Amar e ser amado é meu direito divino. Abro meu coração para o amor universal.", categoria: "Amor" },
  { texto: "A sabedoria divina me guia. Minhas decisões são claras e meu discernimento é perfeito.", categoria: "Sabedoria" },
  { texto: "Eu permito que meu corpo se cure e se renove. Cada célula ressoa com vitalidade e paz.", categoria: "Cura" },
  { texto: "Estou envolto em proteção divina. Nenhuma energia negativa pode me alcançar.", categoria: "Proteção" },
  { texto: "Sou pioneiro em minha própria história. Começo com propósito e clareza.", categoria: "Propósito" },
  { texto: "Cooperacao e paciencia sao minhas aliadas neste momento de crescimento.", categoria: "Crescimento" },
  { texto: "Minha voz e minha arte se manifestam com poder este dia.", categoria: "Expressão" },
  { texto: "Eu atrais oportunidades extraordinárias. O universo conspira a meu favor.", categoria: "Oportunidade" },
  { texto: "Minha mente é clara e focada. Thoughts align with my highest purpose.", categoria: "Clareza" },
  { texto: "Gratidao preenche meu coração. Recognizo as bênçãos em cada momento.", categoria: "Gratidão" },
  { texto: "Eu manifesto minha realidade com intenção e amor.", categoria: "Manifestação" },
  { texto: "Minha intuição é minha guia. Confio nos sinais do universo.", categoria: "Intuição" },
  { texto: "Cada día es una oportunidad para crear la mejor versión de mí mismo.", categoria: "Renovación" },
  { texto: "Soy merecedor de todo lo bueno que la vida tiene para ofrecerme.", categoria: "Meritocrácia" },
  { texto: "Mi energía positiva afecta a todos los que me rodean de manera beneficiosa.", categoria: "Influência" },
];

function getAfirmacaoDoDia(): Afirmacao {
  const hoje = new Date();
  const diaDoAno = Math.floor(
    (hoje.getTime() - new Date(hoje.getFullYear(), 0, 0).getTime()) / 86400000
  );
  const index = diaDoAno % AFIRMACOES.length;
  const item = AFIRMACOES[index];
  
  return {
    id: `afirmacao_${hoje.toISOString().split('T')[0]}`,
    texto: item.texto,
    categoria: item.categoria,
    data: hoje.toISOString().split('T')[0],
  };
}

export function AfirmacaoDoDia({ nome, numeroPessoal }: AfirmacaoDoDiaProps) {
  const [afirmacao, setAfirmacao] = useState<Afirmacao | null>(null);
  const [isFavorito, setIsFavorito] = useState(false);
  const [favoritoId, setFavoritoId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const af = getAfirmacaoDoDia();
    setAfirmacao(af);

    // Check if already favorited
    const checkFavorito = async () => {
      try {
        const res = await fetch('/api/favoritos');
        if (res.ok) {
          const favoritos = await res.json();
          const existing = favoritos.find(
            (f: { tipo: string; itemId: string }) => f.tipo === 'affirmation' && f.itemId === af.id
          );
          if (existing) {
            setIsFavorito(true);
            setFavoritoId(existing.id);
          }
        }
      } catch {
        // Silently fail
      }
    };
    checkFavorito();
  }, []);

  const toggleFavorito = async () => {
    if (!afirmacao) return;

    try {
      if (isFavorito && favoritoId) {
        const res = await fetch('/api/favoritos', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: favoritoId }),
        });
        if (res.ok) {
          setIsFavorito(false);
          setFavoritoId(null);
        }
      } else {
        const res = await fetch('/api/favoritos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tipo: 'affirmation', itemId: afirmacao.id }),
        });
        if (res.ok) {
          const data = await res.json();
          setIsFavorito(true);
          setFavoritoId(data.id);
        }
      }
    } catch {
      // Silently fail
    }
  };

  const compartilhar = async () => {
    if (!afirmacao) return;

    const texto = `${afirmacao.texto}\n\n— Afirmação do Dia${nome ? ` para ${nome}` : ''}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Afirmação do Dia',
          text: texto,
        });
      } catch {
        // User cancelled or error
      }
    } else {
      await navigator.clipboard.writeText(texto);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!mounted) {
    return (
      <Card className="bg-gradient-to-br from-violet-900/20 to-violet-950/50 border-violet-500/30">
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div
      className={cn(
        "transition-all duration-700 ease-out",
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}
    >
      <Card className="bg-gradient-to-br from-violet-900/20 to-violet-950/50 border-violet-500/30 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-transparent to-violet-500/5 animate-pulse" />
        
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 font-serif text-lg">
              <Sparkles className="h-5 w-5 text-violet-400" />
              Afirmação do Dia
            </CardTitle>
            {afirmacao && (
              <Badge variant="outline" className="border-violet-500/50 text-violet-300 text-xs">
                {afirmacao.categoria}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="relative space-y-4">
          {afirmacao ? (
            <>
              <blockquote className="relative">
                <span className="absolute -left-2 -top-2 text-4xl text-violet-400/30 font-serif">
                  &ldquo;
                </span>
                <p className="font-serif text-lg md:text-xl text-violet-100 italic leading-relaxed pl-4 pr-4">
                  {afirmacao.texto}
                </p>
                <span className="absolute -right-2 bottom-0 text-4xl text-violet-400/30 font-serif">
                  &rdquo;
                </span>
              </blockquote>

              <div className="flex items-center justify-between pt-2 border-t border-violet-500/20">
                <span className="text-xs text-violet-400/60">
                  {new Date().toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })}
                </span>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleFavorito}
                    className={cn(
                      "h-8 px-2 transition-all duration-300",
                      isFavorito
                        ? "text-pink-400 hover:text-pink-300"
                        : "text-violet-400/60 hover:text-pink-400"
                    )}
                    title={isFavorito ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                  >
                    <Heart
                      className={cn(
                        "h-4 w-4 transition-transform duration-300",
                        isFavorito ? "fill-current scale-110" : ""
                      )}
                    />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={compartilhar}
                    className="h-8 px-2 text-violet-400/60 hover:text-violet-300"
                    title="Compartilhar"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-400" />
                    ) : (
                      <Share2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}