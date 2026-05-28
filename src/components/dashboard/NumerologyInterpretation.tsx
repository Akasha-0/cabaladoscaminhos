'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  getInterpretacao,
  type InterpretacaoNumerologia
} from '@/lib/numerologia/calculos';

interface NumerologyInterpretationProps {
  numero: number;
  tipo?: 'pitagorica' | 'caldeia' | 'cabalistica' | 'tantrica';
  nome?: string;
  dataNascimento?: string;
  expanded?: boolean;
  onToggle?: () => void;
}

const TIPOS_LABELS: Record<string, string> = {
  pitagorica: 'Pitagórica',
  caldeia: 'Caldeia',
  cabalistica: 'Cabalística',
  tantrica: 'Tântrica',
};

const CARACTERISTICAS_BASE = [
  'Liderança',
  'Independência',
  'Criatividade',
  'Iniciativa',
  'Originalidade',
];

function getCorNumero(numero: number): string {
  if ([11, 22, 33].includes(numero)) return '#FFD700';
  const cores = [
    '#DC2626', '#F97316', '#EAB308', '#22C55E',
    '#3B82F6', '#7C3AED', '#EC4899', '#14B8A6', '#6366F1'
  ];
  return cores[(numero - 1) % 9];
}

function getCorForca(forca: string): string {
  switch (forca.toLowerCase()) {
    case 'alta': return '#22C55E';
    case 'media': return '#EAB308';
    case 'baixa': return '#DC2626';
    default: return '#6B7280';
  }
}

function getSimbolo(numero: number): string {
  const simbolos: Record<number, string> = {
    1: '☉', 2: '☽', 3: '☿', 4: '♀', 5: '♂',
    6: '☿', 7: '☽', 8: '♄', 9: '☉',
    11: '✧', 22: '⚡', 33: '♕'
  };
  return simbolos[numero] || '✦';
}

export function NumerologyInterpretation({
  numero,
  tipo = 'pitagorica',
  nome,
  dataNascimento,
  expanded = true,
  onToggle
}: NumerologyInterpretationProps) {
  const [isExpanded, setIsExpanded] = useState(expanded);

  const interpretacao = getInterpretacao(numero);
  const corPrincipal = getCorNumero(numero);
  const ehNumeroMestre = [11, 22, 33].includes(numero);

  const toggleExpanded = () => {
    if (onToggle) {
      onToggle();
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <Card className="overflow-hidden border-2" style={{ borderColor: corPrincipal + '40' }}>
      <button
        onClick={toggleExpanded}
        className="w-full p-4 flex items-center justify-between hover:bg-accent/50 transition-colors text-left"
      >
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold"
            style={{ backgroundColor: corPrincipal + '20', color: corPrincipal }}
          >
            {getSimbolo(numero)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">
                Número {numero}
              </h3>
              {ehNumeroMestre && (
                <Badge variant="default" className="bg-amber-500/20 text-amber-600 border-amber-500/30">
                  Número Mestre
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {TIPOS_LABELS[tipo]} {nome && `· ${nome}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {isExpanded ? 'Ocultar' : 'Ver mais'}
          </span>
          <svg
            className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isExpanded && (
        <div className="p-4 pt-0 space-y-4">
          <Separator />

          {/* Significado Principal */}
          <section>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Significado</h4>
            <p className="text-base leading-relaxed">
              <span className="font-semibold" style={{ color: corPrincipal }}>
                {interpretacao.nome}:
              </span>{' '}
              {interpretacao.significado}
            </p>
          </section>

          {/* Traços de Personalidade */}
                    <section>
                      <h4 className="text-sm font-medium text-muted-foreground mb-3">Traços de Personalidade</h4>
                      <div className="grid gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: corPrincipal }} />
                          <span className="text-sm">{interpretacao.forca}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-orange-500" />
                          <span className="text-sm">{interpretacao.desafio}</span>
                        </div>
                      </div>
                    </section>

          <Separator />

          {/* Sefirot Relacionado */}
          <section>
            <h4 className="text-xs font-medium text-muted-foreground mb-1">Sefirot Relacionado</h4>
            <p className="text-sm font-medium">{interpretacao.sefirotRelacionado}</p>
          </section>

          {/* Dados Adicionais */}
          {dataNascimento && (
            <div className="pt-2 border-t">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Data de Nascimento:</span>
                <span>{dataNascimento}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

interface MultiInterpretationProps {
  numerologia: {
    pitagorica: number | null;
    cabalistica: number | null;
    tantrica: number | null;
  };
  nome: string;
  dataNascimento: string;
}

export function MultiNumerologyInterpretation({
  numerologia,
  nome,
  dataNascimento
}: MultiInterpretationProps) {
  const interpretacoes: Array<{ tipo: string; numero: number; label: string }> = [];

  if (numerologia.pitagorica) {
    interpretacoes.push({
      tipo: 'pitagorica',
      numero: numerologia.pitagorica,
      label: 'Número de Vida'
    });
  }
  if (numerologia.cabalistica) {
    interpretacoes.push({
      tipo: 'cabalistica',
      numero: numerologia.cabalistica,
      label: 'Expressão'
    });
  }
  if (numerologia.tantrica) {
    interpretacoes.push({
      tipo: 'tantrica',
      numero: numerologia.tantrica,
      label: 'Data de Nascimento'
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Análise Numerológica</h3>
        <Badge variant="secondary">{nome}</Badge>
      </div>

      {interpretacoes.map((item) => (
        <NumerologyInterpretation
          key={item.tipo}
          numero={item.numero}
          tipo={item.tipo as 'pitagorica' | 'caldeia' | 'cabalistica' | 'tantrica'}
          nome={item.label}
          dataNascimento={item.tipo === 'tantrica' ? dataNascimento : undefined}
        />
      ))}
    </div>
  );
}

export default NumerologyInterpretation;