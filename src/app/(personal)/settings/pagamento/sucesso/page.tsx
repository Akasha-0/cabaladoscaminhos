'use client';

import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PagamentoSucessoPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="space-y-4">
          <CheckCircle className="w-20 h-20 text-emerald-400 mx-auto" />
          <h1 className="text-3xl font-serif text-amber-400">
            Assinatura confirmada!
          </h1>
          <p className="text-slate-400 text-lg">
            Sua assinatura foi ativada com sucesso. Você agora tem acesso completo a todas as funcionalidades.
          </p>
        </div>
        <Button
          onClick={() => window.location.href = '/mapa'}
          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold px-8 py-3"
        >
          Ir para o Mapa
        </Button>
      </div>
    </div>
  );
}
