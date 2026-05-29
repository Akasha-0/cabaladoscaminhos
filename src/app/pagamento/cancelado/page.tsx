'use client';

import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PagamentoCanceladoPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="space-y-4">
          <XCircle className="w-20 h-20 text-red-400 mx-auto" />
          <h1 className="text-3xl font-serif text-amber-400">
            Pagamento cancelado
          </h1>
          <p className="text-slate-400 text-lg">
            O pagamento foi cancelado. Nenhum valor foi cobrado.
          </p>
        </div>
        <Button
          onClick={() => window.location.href = '/pricing'}
          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold px-8 py-3"
        >
          Voltar aos Planos
        </Button>
      </div>
    </div>
  );
}
