'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 p-8">
        <div className="text-6xl font-cinzel text-primary">404</div>
        <h1 className="text-2xl font-cinzel text-primary">
          Caminho Não Encontrado
        </h1>
        <p className="text-muted-foreground font-raleway max-w-md mx-auto">
          A página que você busca não existe nesta dimensão.
          Retorne ao seu caminho espiritual.
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <Link href="/">
            <Button variant="outline">
              <Home className="w-4 h-4 mr-2" />
              Início
            </Button>
          </Link>
          <Button onClick={() => window.history.back()} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
      </div>
    </div>
  );
}