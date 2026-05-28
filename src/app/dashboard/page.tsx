'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/components/providers/SupabaseProvider';
import { useNumerologia } from '@/lib/hooks/useNumerologia';
import { useCiclos } from '@/lib/hooks/useCiclos';
import { useOdus } from '@/lib/hooks/useOdus';
import { getInterpretacao } from '@/lib/numerologia';
import Link from 'next/link';
import { 
  Sparkles, 
  Star, 
  Moon, 
  Sun, 
  Calendar,
  Heart,
  BookOpen,
  TrendingUp,
  LogOut,
  Loader2
} from 'lucide-react';

// Default values for fallback when user metadata is incomplete
const {
  NOME_FALLBACK,
  DATA_NASCIMENTO_FALLBACK,
} = {
  NOME_FALLBACK: 'Usuário',
  DATA_NASCIMENTO_FALLBACK: '1990-01-01',
};

export default function DashboardPage() {
  const { user, isLoading: authLoading, signOut, isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Always show loading spinner during initial mount to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          <p className="text-amber-200/70 font-raleway text-sm">Carregando...</p>
        </div>
      </div>
    );
  }

  // Show loading while checking auth
  if (authLoading && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          <p className="text-amber-200/70 font-raleway text-sm">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-amber-200/70 font-raleway">Redirecionando para login...</p>
          <Link href="/login">
            <Button variant="outline" className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10">
              Ir para Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // User data
  const nome = user?.user_metadata?.full_name || user?.email?.split('@')[0] || NOME_FALLBACK;
  const dataNascimento = user?.user_metadata?.data_nascimento || DATA_NASCIMENTO_FALLBACK;
  
  const { pitagorica, loading: loadingNumerologia } = useNumerologia(nome, dataNascimento);
  const { dia, loading: loadingCiclos } = useCiclos(dataNascimento);
  const { principal: odu, loading: loadingOdus } = useOdus(dataNascimento);

  const interpretacao = pitagorica !== null ? getInterpretacao(pitagorica) : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-cinzel text-3xl text-amber-100">
              Bem-vindo, {nome}
            </h1>
            <p className="text-amber-200/60 font-raleway mt-1">
              Sua jornada espiritual está em curso
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-amber-500/30 text-amber-400">
              <Sparkles className="w-3 h-3 mr-1" />
              Conectado
            </Badge>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={signOut}
              className="text-amber-200/60 hover:text-amber-400 hover:bg-amber-500/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-slate-900/50 border-slate-800/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-raleway text-amber-200/70 flex items-center gap-2">
                <Star className="w-4 h-4" />
                Número Principal
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingNumerologia ? (
                <div className="flex justify-center">
                  <Skeleton className="h-12 w-12 rounded-full" />
                </div>
              ) : pitagorica !== null ? (
                <div className="text-center">
                  <span className="text-4xl font-bold text-amber-400">{pitagorica}</span>
                  <p className="text-xs text-amber-200/50 mt-1 font-raleway">
                    {interpretacao?.nome || 'Carregando...'}
                  </p>
                </div>
              ) : (
                <p className="text-slate-400 text-sm text-center">Sem dados</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-raleway text-amber-200/70 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Ciclo do Dia
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingCiclos ? (
                <div className="flex justify-center">
                  <Skeleton className="h-12 w-12 rounded-full" />
                </div>
              ) : dia ? (
                <div className="text-center">
                  <span className="text-4xl font-bold text-amber-400">{dia.numero}</span>
                  <p className="text-xs text-amber-200/50 mt-1 font-raleway">
                    {dia.sefirot || 'Carregando...'}
                  </p>
                </div>
              ) : (
                <p className="text-slate-400 text-sm text-center">Sem dados</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-raleway text-amber-200/70 flex items-center gap-2">
                <Moon className="w-4 h-4" />
                Odú de Nascimento
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingOdus ? (
                <div className="flex justify-center">
                  <Skeleton className="h-12 w-12 rounded-full" />
                </div>
              ) : odu ? (
                <div className="text-center">
                  <span className="text-4xl font-bold text-amber-400">{odu.numero}</span>
                  <p className="text-xs text-amber-200/50 mt-1 font-raleway">
                    {odu.nome || 'Carregando...'}
                  </p>
                </div>
              ) : (
                <p className="text-slate-400 text-sm text-center">Sem dados</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-raleway text-amber-200/70 flex items-center gap-2">
                <Sun className="w-4 h-4" />
                Orixá Regente
              </CardTitle>
            </CardHeader>
            <CardContent>
              {odu ? (
                <div className="text-center">
                  <span className="text-2xl">✨</span>
                  <p className="text-lg font-bold text-amber-400">{udu.orixaRegente || 'N/A'}</p>
                  <p className="text-xs text-amber-200/50 mt-1 font-raleway">
                    {odu.elementos || ''}
                  </p>
                </div>
              ) : (
                <p className="text-slate-400 text-sm text-center">Sem dados</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/dashboard/perfil" className="block">
            <Card className="bg-slate-900/50 border-slate-800/50 hover:border-amber-500/30 transition-colors cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-amber-500" />
                  <CardTitle className="text-amber-100 font-cinzel">Perfil Espiritual</CardTitle>
                </div>
                <CardDescription className="text-amber-200/50 font-raleway">
                  Complete seu perfil para uma análise mais completa
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
          
          <Link href="/dashboard/relatorios" className="block">
            <Card className="bg-slate-900/50 border-slate-800/50 hover:border-amber-500/30 transition-colors cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-amber-500" />
                  <CardTitle className="text-amber-100 font-cinzel">Relatórios</CardTitle>
                </div>
                <CardDescription className="text-amber-200/50 font-raleway">
                  Acompanhe seus ciclos e tendências espirituais
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
          
          <Link href="/dashboard/chat" className="block">
            <Card className="bg-slate-900/50 border-slate-800/50 hover:border-amber-500/30 transition-colors cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-amber-500" />
                  <CardTitle className="text-amber-100 font-cinzel">Diário Espiritual</CardTitle>
                </div>
                <CardDescription className="text-amber-200/50 font-raleway">
                  Consulte orientações personalizadas
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>

        {/* Inspirational Message */}
        <Card className="bg-gradient-to-r from-amber-900/20 to-orange-900/20 border-amber-500/20">
          <CardContent className="py-6">
            <div className="flex items-start gap-4">
              <div className="text-3xl">✨</div>
              <div>
                <h3 className="font-cinzel text-lg text-amber-100 mb-2">
                  Sua Jornada Espiritual
                </h3>
                <p className="text-amber-200/70 font-raleway text-sm leading-relaxed">
                  {odu?.significado || 'Continue explorando seu caminho espiritual através da integração de múltiplas tradições: Cabala, Numerologia, Astrologia e Tradições Africanas.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
