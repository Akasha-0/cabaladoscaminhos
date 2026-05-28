'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/components/providers/SupabaseProvider';
import {
  Heart,
  Trash2,
  Star,
  Sparkles,
  BookOpen,
  Hash,
  ExternalLink,
  Loader2,
} from 'lucide-react';

type FavoritoTipo = 'affirmation' | 'ritual' | 'tarot' | 'numerologia';

interface Favorito {
  id: string;
  tipo: FavoritoTipo;
  itemId: string;
  createdAt: string;
}

const TIPO_CONFIG: Record<FavoritoTipo, { label: string; icon: typeof Star; color: string; hrefPrefix: string }> = {
  affirmation: { label: 'Afirmações', icon: Sparkles, color: 'text-yellow-500', hrefPrefix: '/dashboard/afirmacao' },
  ritual: { label: 'Rituais', icon: BookOpen, color: 'text-purple-500', hrefPrefix: '/dashboard/ritual' },
  tarot: { label: 'Tarot', icon: Star, color: 'text-blue-500', hrefPrefix: '/dashboard/tarot' },
  numerologia: { label: 'Numerologia', icon: Hash, color: 'text-green-500', hrefPrefix: '/dashboard/numerologia' },
};

export function FavoritosPanel() {
  const { user } = useAuth();
  const [favoritos, setFavoritos] = useState<Favorito[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchFavoritos = useCallback(async () => {
    try {
      const res = await fetch('/api/favoritos');
      if (res.ok) {
        const data = await res.json();
        setFavoritos(data);
      }
    } catch (err) {
      console.error('Erro ao carregar favoritos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchFavoritos();
  }, [user, fetchFavoritos]);

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch('/api/favoritos', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setFavoritos(prev => prev.filter(f => f.id !== id));
      }
    } catch (err) {
      console.error('Erro ao deletar favorito:', err);
    } finally {
      setDeletingId(null);
    }
  }

  function navigateToContent(favorito: Favorito) {
    const config = TIPO_CONFIG[favorito.tipo];
    window.location.assign(`${config.hrefPrefix}/${favorito.itemId}`);
  }

  const groupedFavoritos = favoritos.reduce<Record<FavoritoTipo, Favorito[]>>((acc, fav) => {
    if (!acc[fav.tipo]) acc[fav.tipo] = [];
    acc[fav.tipo].push(fav);
    return acc;
  }, {} as Record<FavoritoTipo, Favorito[]>);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-muted-foreground">Faça login para ver seus favoritos</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500" />
          Meus Favoritos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {favoritos.length === 0 ? (
          <div className="text-center py-8">
            <Heart className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground">Nenhum favorito salvo ainda</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Salve itens dos módulos de tarot, rituais e mais
            </p>
          </div>
        ) : (
          Object.entries(groupedFavoritos).map(([tipo, items]) => {
            const config = TIPO_CONFIG[tipo as FavoritoTipo];
            const Icon = config.icon;
            return (
              <div key={tipo}>
                <div className="flex items-center gap-2 mb-3">
                  <Icon className={`h-4 w-4 ${config.color}`} />
                  <h3 className="font-medium">{config.label}</h3>
                  <Badge variant="secondary">{items.length}</Badge>
                </div>
                <Separator className="mb-3" />
                <div className="space-y-2">
                  {items.map(favorito => (
                    <div
                      key={favorito.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium">ID: {favorito.itemId}</p>
                        <p className="text-xs text-muted-foreground">
                          Adicionado em {new Date(favorito.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigateToContent(favorito)}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(favorito.id)}
                          disabled={deletingId === favorito.id}
                        >
                          {deletingId === favorito.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4 text-red-500" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
