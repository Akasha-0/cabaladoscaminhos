'use client';

import { useState, useCallback } from 'react';
import { odusData, calcularOduNascimento, OduInfo } from '@/lib/odus/calculos';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle,
  Flame,
  RotateCcw,
  Star,
  Moon,
  Sun,
  Eye
} from 'lucide-react';

interface OduResult {
  principal: OduInfo | null;
  secundario: OduInfo | null;
}

interface ConsejoItem {
  icono: React.ReactNode;
  texto: string;
  tipo: 'presagio' | 'consejo';
}

function sortearOdu(): OduInfo {
  const numeros = Object.keys(odusData).map(Number);
  const numeroSorteado = numeros[Math.floor(Math.random() * numeros.length)];
  return odusData[numeroSorteado];
}

export function IfaConsultation() {
  const [resultado, setResultado] = useState<OduResult>({ principal: null, secundario: null });
  const [sorteando, setSorteando] = useState(false);
  const [animacionFase, setAnimacionFase] = useState<'idle' | 'sorteando' | 'resultado'>('idle');

  const handleSortear = useCallback(() => {
    setSorteando(true);
    setAnimacionFase('sorteando');

    // Animación de sortEO
    let cuentaAtras = 3;
    const intervalo = setInterval(() => {
      cuentaAtras--;
      if (cuentaAtras <= 0) {
        clearInterval(intervalo);
        const principal = sortearOdu();
        const secundario = Math.random() > 0.7 ? sortearOdu() : null;
        setResultado({ principal, secundario });
        setSorteando(false);
        setAnimacionFase('resultado');
      }
    }, 800);
  }, []);

  const handleReset = useCallback(() => {
    setResultado({ principal: null, secundario: null });
    setAnimacionFase('idle');
  }, []);

  const renderOduCard = (odu: OduInfo, esPrincipal: boolean) => (
    <div className="space-y-4 p-4 rounded-lg bg-gradient-to-br from-primary/5 to-card border border-border/30">
      <div className="flex items-center gap-4 pb-4 border-b border-border/50">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
          esPrincipal
            ? 'bg-primary/20 border-2 border-primary/50'
            : 'bg-secondary/20 border border-secondary/50'
        }`}>
          <span className={`text-3xl font-cinzel ${
            esPrincipal ? 'text-primary' : 'text-secondary'
          }`}>
            {odu.numero}
          </span>
        </div>
        <div>
          <h3 className={`text-xl font-cinzel ${
            esPrincipal ? 'text-primary' : 'text-secondary'
          }`}>
            {odu.nome}
          </h3>
          <p className="text-sm text-muted-foreground font-raleway">
            {esPrincipal ? 'Odu Principal' : 'Odu Secundário'}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
          <div>
            <p className="text-xs font-medium text-primary mb-1">Significado</p>
            <p className="text-sm text-muted-foreground font-raleway">
              {odu.significado}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Moon className="w-4 h-4 text-blue-400 mt-1 flex-shrink-0" />
          <div>
            <p className="text-xs font-medium text-blue-400 mb-1">Elementos</p>
            <p className="text-sm text-muted-foreground font-raleway">
              {odu.elementos}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Sun className="w-4 h-4 text-yellow-500 mt-1 flex-shrink-0" />
          <div>
            <p className="text-xs font-medium text-yellow-500 mb-1">Orixa Regente</p>
            <p className="text-sm text-muted-foreground font-raleway">
              {odu.orixaRegente}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-destructive mt-1 flex-shrink-0" />
          <div>
            <p className="text-xs font-medium text-destructive mb-1">Quizilas (Evitar)</p>
            <p className="text-sm text-muted-foreground font-raleway">
              {odu.quizilas.join(' • ')}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
          <div>
            <p className="text-xs font-medium text-green-500 mb-1">Preceitos</p>
            <p className="text-sm text-muted-foreground font-raleway">
              {odu.preceitos}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Flame className="w-4 h-4 text-orange-500 mt-1 flex-shrink-0" />
          <div>
            <p className="text-xs font-medium text-orange-500 mb-1">Ebó Recomendado</p>
            <p className="text-sm text-muted-foreground font-raleway">
              {odu.ebos}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPresagiosYConsejos = (odu: OduInfo): ConsejoItem[] => {
    return [
      {
        icono: <Eye className="w-4 h-4" />,
        texto: `${odu.nome} indica que momentos de transformação estão próximos. Mantenha-se alerta aos sinais do universo.`,
        tipo: 'presagio'
      },
      {
        icono: <Star className="w-4 h-4" />,
        texto: `Siga rigorosamente os preceitos de ${odu.orixaRegente} para atrair proteção e prosperidade espiritual.`,
        tipo: 'consejo'
      },
      {
        icono: <AlertTriangle className="w-4 h-4" />,
        texto: `Evite as quizilas: ${odu.quizilas.slice(0, 2).join(' e ')}. A transgressão pode atrair energias desfavoráveis.`,
        tipo: 'consejo'
      },
      {
        icono: <Sparkles className="w-4 h-4" />,
        texto: `A energia de ${odu.elementos} está presente. Elementos de ${odu.orixaRegente} devem ser harmonizados em seu ambiente.`,
        tipo: 'presagio'
      }
    ];
  };

  return (
    <Card className="bg-gradient-to-br from-card to-card/80 border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-cinzel text-primary flex items-center gap-2">
              <Moon className="w-5 h-5" />
              Consulta de Ifá
            </CardTitle>
            <CardDescription className="font-raleway">
              Sorteie seu Odu e receba orientação ancestral
            </CardDescription>
          </div>
          {animacionFase === 'resultado' && resultado.principal && (
            <Badge variant="outline" className="font-raleway">
              Odu {resultado.principal.numero}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {animacionFase === 'idle' && (
          <div className="text-center py-12 space-y-4">
            <div className="w-24 h-24 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <Moon className="w-12 h-12 text-primary/60" />
            </div>
            <div>
              <h3 className="text-lg font-cinzel text-primary mb-2">
                Abrindo os Caminhos de Ifá
              </h3>
              <p className="text-sm text-muted-foreground font-raleway max-w-md mx-auto">
                A tradição de Ifá revela através dos Odus as mensagens dos Orixas para sua jornada espiritual.
                Clique abaixo para sortear seu Odu e receber preságios e conselhos ancestrais.
              </p>
            </div>
            <Button
              onClick={handleSortear}
              className="mt-6 font-cinzel"
              size="lg"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Sortear Odu
            </Button>
          </div>
        )}

        {sorteando && (
          <div className="text-center py-12 space-y-4">
            <div className="w-24 h-24 mx-auto rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
              <Sparkles className="w-12 h-12 text-primary animate-spin" />
            </div>
            <div>
              <h3 className="text-lg font-cinzel text-primary">
                Os Orixas estão respondendo...
              </h3>
              <p className="text-sm text-muted-foreground font-raleway mt-2">
                Consultando a sabedoria ancestral
              </p>
            </div>
          </div>
        )}

        {animacionFase === 'resultado' && resultado.principal && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Badge variant="default" className="font-cinzel">
                Resultado da Consulta
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Nova Consulta
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {renderOduCard(resultado.principal, true)}
              {resultado.secundario && (
                renderOduCard(resultado.secundario, false)
              )}
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-cinzel text-primary flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Preságios e Conselhos
              </h4>
              <ScrollArea className="h-[200px] pr-4">
                <div className="space-y-3">
                  {renderPresagiosYConsejos(resultado.principal).map((item, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${
                        item.tipo === 'presagio'
                          ? 'bg-primary/5 border-primary/20'
                          : 'bg-secondary/5 border-secondary/20'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 ${
                          item.tipo === 'presagio'
                            ? 'text-primary'
                            : 'text-secondary'
                        }`}>
                          {item.icono}
                        </div>
                        <p className="text-sm font-raleway text-muted-foreground">
                          {item.texto}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}