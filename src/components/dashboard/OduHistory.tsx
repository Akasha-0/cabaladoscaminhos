'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  History,
  RotateCcw,
  Calendar,
  MessageSquare,
  ChevronRight,
  Trash2,
  Sparkles
} from 'lucide-react';

export interface OduHistoryItem {
  id: string;
  odu: {
    numero: number;
    nome: string;
  };
  data: string;
  pergunta: string;
  metodo: 'aleatorio' | 'nascimento';
}

interface OduHistoryProps {
  onReconsult?: (item: OduHistoryItem) => void;
}

const MOCK_HISTORY: OduHistoryItem[] = [
  {
    id: '1',
    odu: { numero: 8, nome: 'Ogbe' },
    data: '2024-05-20T14:30:00Z',
    pergunta: 'Devo aceitar a proposta de trabalho que recebi?',
    metodo: 'aleatorio',
  },
  {
    id: '2',
    odu: { numero: 3, nome: 'Etaogundá' },
    data: '2024-05-15T09:15:00Z',
    pergunta: 'Como melhorar meus relacionamentos familiares?',
    metodo: 'aleatorio',
  },
  {
    id: '3',
    odu: { numero: 12, nome: 'Ejiologbé' },
    data: '2024-05-10T18:45:00Z',
    pergunta: 'Qual caminho espiritual devo seguir neste momento?',
    metodo: 'nascimento',
  },
];

function formatarData(dataString: string): string {
  const data = new Date(dataString);
  return data.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function OduHistory({ onReconsult }: OduHistoryProps) {
  const [history, setHistory] = useState<OduHistoryItem[]>(MOCK_HISTORY);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleReconsult = (item: OduHistoryItem) => {
    onReconsult?.(item);
  };

  const handleDelete = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  return (
    <Card className="bg-gradient-to-br from-card to-card/80 border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <History className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl font-cinzel text-primary">
                Histórico de Consultas
              </CardTitle>
              <CardDescription className="font-raleway">
                Suas consultas anteriores de Ifá
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="font-raleway">
            {history.length} consultas
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/5 mx-auto flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-primary/50" />
            </div>
            <p className="text-muted-foreground font-raleway">
              Nenhuma consulta realizada ainda
            </p>
            <p className="text-sm text-muted-foreground/70 font-raleway">
              Suas consultas de Ifá aparecerão aqui
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {history.map((item) => (
                <div
                  key={item.id}
                  className={`rounded-lg border border-border/30 bg-gradient-to-br from-primary/5 to-card p-4 transition-all ${
                    expandedId === item.id ? 'ring-2 ring-primary/30' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          variant="secondary"
                          className="font-cinzel text-sm"
                        >
                          {item.odu.numero}
                        </Badge>
                        <span className="font-cinzel text-primary font-medium">
                          {item.odu.nome}
                        </span>
                        {item.metodo === 'nascimento' && (
                          <Badge variant="outline" className="text-xs font-raleway">
                            Odu de Nascimento
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="font-raleway">
                          {formatarData(item.data)}
                        </span>
                      </div>

                      {expandedId === item.id && (
                        <div className="flex items-start gap-1.5 text-sm pt-2 border-t border-border/30">
                          <MessageSquare className="w-3.5 h-3.5 mt-0.5 text-muted-foreground/70 flex-shrink-0" />
                          <span className="font-raleway text-muted-foreground/90 italic">
                            "{item.pergunta}"
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedId(
                          expandedId === item.id ? null : item.id
                        )}
                        className="h-8 px-2"
                      >
                        <ChevronRight
                          className={`w-4 h-4 transition-transform ${
                            expandedId === item.id ? 'rotate-90' : ''
                          }`}
                        />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                        className="h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {expandedId === item.id && (
                    <div className="flex gap-2 mt-4 pt-4 border-t border-border/30">
                      <Button
                        size="sm"
                        onClick={() => handleReconsult(item)}
                        className="flex-1 font-raleway"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Re-consultar
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}