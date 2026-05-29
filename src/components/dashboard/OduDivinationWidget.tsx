'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skull } from 'lucide-react';
import { useMemo } from 'react';

const ODUS = [
  { numero: 1, nome: 'Okaran', significado: 'O começo, a dúvida, o caminho difícil', orixa: 'Exu, Omolu' },
  { numero: 2, nome: 'Ejiokô', significado: 'Duas verdades, caminhos duplos', orixa: 'Ibeji, Ogum' },
  { numero: 3, nome: 'Etaogundá', significado: 'Força, criação, separação', orixa: 'Ogum, Obaluaê' },
  { numero: 4, nome: 'Irosun', significado: 'Aviso, visão espiritual', orixa: 'Iemanjá, Oxóssi' },
  { numero: 5, nome: 'Oxé', significado: 'Ouro, doçura, mistério', orixa: 'Oxum, Logun Edé' },
  { numero: 6, nome: 'Obará', significado: 'Riqueza, sabedoria, surpresa', orixa: 'Xangô, Oxóssi' },
  { numero: 7, nome: 'Odi', significado: 'Mistério, renascimento', orixa: 'Omolu, Oxumaré' },
  { numero: 8, nome: 'EjiOníle', significado: 'Cabeça, liderança, sangue', orixa: 'Oxalá, Jagun' },
  { numero: 9, nome: 'Ossá', significado: 'Vento, transformação', orixa: 'Iansã, Iemanjá' },
  { numero: 10, nome: 'Ofun', significado: 'Mistério, cura, sopro divino', orixa: 'Oxalá, Obá' },
];

export function OduDivinationWidget() {
  const odu = useMemo(() => {
    const today = new Date();
    const seed = today.getDate() + today.getMonth() * 31;
    return ODUS[seed % ODUS.length];
  }, []);

  return (
    <Card className="card-spiritual">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Skull className="w-5 h-5 text-orange-400" />
          <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
            Odú do Dia
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-orange-500/30 to-amber-500/30 border-2 border-orange-500/50 mb-2">
            <span className="text-3xl font-bold text-amber-400">{odu.numero}</span>
          </div>
          <p className="text-xl font-bold text-orange-300">{odu.nome}</p>
        </div>
        <p className="text-sm text-slate-300 text-center">{odu.significado}</p>
        <div className="flex justify-center gap-2 flex-wrap">
          {odu.orixa.split(', ').map((o) => (
            <span key={o} className="px-2 py-1 text-xs rounded-full bg-orange-500/20 text-orange-300">
              {o}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
