'use client';

import { CalendarioSemanal } from '@/components/dashboard/CalendarioSemanal';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Star,
  Info
} from 'lucide-react';

export default function CalendarioPage() {
  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-cinzel text-primary tracking-wide">
              Calendário da Semana
            </h1>
            <p className="text-muted-foreground font-raleway mt-1">
              Portal de Consciência Diária • Alinhamento energético por dia
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="px-4 py-2 font-raleway text-sm">
              <Star className="w-4 h-4 mr-2" />
              Semana em Curso
            </Badge>
          </div>
        </div>

        <CalendarioSemanal />

        <Card className="bg-gradient-to-br from-card to-card/80 border-border/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg font-cinzel text-primary">
                Sobre o Calendário Espiritual
              </CardTitle>
            </div>
            <CardDescription className="font-raleway">
              Este calendário apresenta as correspondências espirituais de cada dia da semana, 
              baseadas na tradição da Cabala, Orixás e Numerologia. As recomendações são adaptadas 
              automaticamente às suas quizilas pessoais quando você completa seu perfil.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="p-4 rounded-lg bg-background/50">
                <h4 className="font-medium text-primary mb-2">✦ Como Usar</h4>
                <p className="text-muted-foreground text-xs">
                  Observe o dia atual e siga as orientações. Cada card mostra as energias favoráveis 
                  e o que evitar segundo a tradição.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-background/50">
                <h4 className="font-medium text-primary mb-2">🕯️ Rituais</h4>
                <p className="text-muted-foreground text-xs">
                  Os rituais sugeridos são baseados no número tântrico do dia. Para resultados 
                  otimizados, pratique na janela energética recomendada.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-background/50">
                <h4 className="font-medium text-primary mb-2">⚠️ Quizilas</h4>
                <p className="text-muted-foreground text-xs">
                  As quizilas listadas são gerais do Orixá regente. Complete seu perfil para receber 
                  orientações personalizadas baseadas no seu Odú de nascimento.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}