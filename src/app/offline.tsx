// fallow-ignore-file unused-file
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Wifi, RefreshCw, Home, Cloud, Database } from 'lucide-react';
import Link from 'next/link';

export default function Offline() {
  const [isOnline, setIsOnline] = useState(false);
  const [cachedItems, setCachedItems] = useState<number>(0);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    
    // Check cache storage if available
    if ('caches' in window) {
      caches.keys().then(names => {
        setCachedItems(names.length);
      }).catch(() => {
        setCachedItems(0);
      });
    }
  }, []);

  const handleRetry = () => {
    if (navigator.onLine) {
      window.location.reload();
    } else {
      setIsOnline(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-mystic-gradient">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-spiritual-violet/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-spiritual-gold/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      </div>

      <div className="text-center space-y-8 p-8 max-w-lg mx-auto relative z-10 animate-fade-in-up">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-spiritual-violet/20 rounded-full blur-xl" />
            <div className="relative w-24 h-24 rounded-full bg-card border border-spiritual-gold/20 flex items-center justify-center animate-glow-pulse">
              <Wifi className="w-12 h-12 text-spiritual-gold" />
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-4xl font-cinzel text-spiritual-gold">
            Conexão Interrompida
          </h1>
          <p className="text-muted-foreground font-raleway text-lg">
            O véu entre as dimensões se fechou momentaneamente.
          </p>
        </div>

        {/* Cached Content Info */}
        <div className="bg-card/50 backdrop-blur-sm border border-spiritual-gold/10 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-lg bg-spiritual-violet/10 flex items-center justify-center">
              <Cloud className="w-5 h-5 text-spiritual-violet" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Status da Rede</p>
              <p className={`font-semibold ${isOnline ? 'text-green-500' : 'text-spiritual-gold'}`}>
                {isOnline ? 'Reconectando...' : 'Offline'}
              </p>
            </div>
          </div>

          <div className="border-t border-border/50 pt-4 space-y-3">
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-lg bg-spiritual-gold/10 flex items-center justify-center">
                <Database className="w-5 h-5 text-spiritual-gold" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Conteúdo em Cache</p>
                <p className="font-semibold text-foreground">
                  {cachedItems > 0 ? `${cachedItems} recursos disponíveis` : 'Navegue pelo conteúdo já acessado'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-spiritual-gold-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
            <p>Sua jornada espiritual continua mesmo sem conexão.</p>
            <p className="text-foreground/80 mt-1">O universo aguarda seu retorno.</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button 
            onClick={handleRetry}
            className="bg-spiritual-violet hover:bg-spiritual-violet/90 text-white gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Tentar Novamente
          </Button>
          <Link href="/">
            <Button variant="outline" className="border-spiritual-gold/30 hover:border-spiritual-gold/50 gap-2">
              <Home className="w-4 h-4" />
              Página Inicial
            </Button>
          </Link>
        </div>

        {/* Bottom Quote */}
        <p className="text-sm text-muted-foreground/60 italic font-imfell pt-4">
          &ldquo;Na escuridão, a luz sempre encontra seu caminho.&rdquo;
        </p>
      </div>
    </div>
  );
}