'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TooltipInfo } from '@/components/ui/tooltip-info';

export function CorrespondenciasVisuais() {
  const correspondencias = [
    { nome: 'Fogo', cor: 'bg-red-500', elemento: 'Fogo', planeta: 'Marte/Sol', orixa: 'Ogum/Xangô', descricao: 'Energia de ação, coragem e transformação' },
    { nome: 'Água', cor: 'bg-blue-500', elemento: 'Água', planeta: 'Lua/Netuno', orixa: 'Iemanjá/Omolu', descricao: 'Energia de emoção, intuição e purificação' },
    { nome: 'Terra', cor: 'bg-green-600', elemento: 'Terra', planeta: 'Saturno/Vênus', orixa: 'Oxum/Obá', descricao: 'Energia de estabilidade, fartura e nutrição' },
    { nome: 'Ar', cor: 'bg-yellow-400', elemento: 'Ar', planeta: 'Mercúrio/Júpiter', orixa: 'Oxalá/Ibeji', descricao: 'Energia de comunicação, pensamento e expansão' },
    { nome: 'Éter', cor: 'bg-purple-500', elemento: 'Éter', planeta: 'Urano', orixa: 'Iansã', descricao: 'Energia de transformação e despertar espiritual' },
  ];

  return (
    <Card className="bg-gradient-to-br from-card to-card/80 border-border/50">
      <CardHeader>
        <CardTitle className="font-cinzel text-primary flex items-center gap-2">
          ✦ Mapa de Correlações
          <TooltipInfo
            titulo="Sobre as Correlações"
            descricao="Este mapa mostra como os elementos, planetas e Orixás se relacionam na tradição espiritual afro-brasileira."
          />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {correspondencias.map((item) => (
            <div 
              key={item.nome}
              className={`p-4 rounded-lg ${item.cor} bg-opacity-20 border border-border/30 hover:border-opacity-60 transition-all`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${item.cor}`} />
                <h3 className="font-medium text-sm">{item.nome}</h3>
              </div>
              <div className="space-y-1 text-xs">
                <p><span className="text-muted-foreground">Planeta:</span> {item.planeta}</p>
                <p><span className="text-muted-foreground">Orixá:</span> {item.orixa}</p>
                <TooltipInfo
                  titulo={item.elemento}
                  descricao={item.descricao}
                  variante="ajuda"
                >
                  <span className="text-muted-foreground">Clique para saber mais</span>
                </TooltipInfo>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-border/30">
          <h4 className="text-sm font-medium text-primary mb-3">Cores por Dia da Semana</h4>
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Domingo: Dourado</Badge>
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Segunda: Roxo</Badge>
            <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Terça: Vermelho</Badge>
            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Quarta: Amarelo</Badge>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Quinta: Verde</Badge>
            <Badge className="bg-gray-200/20 text-gray-100 border-gray-500/30">Sexta: Branco</Badge>
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Sábado: Azul</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
