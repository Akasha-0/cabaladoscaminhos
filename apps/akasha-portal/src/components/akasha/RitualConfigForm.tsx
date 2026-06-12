'use client';

/**
 * @akasha/portal — RitualConfigForm
 * 
 * Formulário para configurar o ritual diário.
 * Permite definir horário, ativar/desativar e escolher componentes.
 */

import { useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { RitualConfig, RitualComponentes } from '@akasha/core';

interface Props {
  initialConfig?: RitualConfig;
  onSave: (config: RitualConfig) => void;
}

// Validação de horário HH:MM
function isValidTime(time: string): boolean {
  const regex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;
  return regex.test(time);
}

// Configuração padrão
const DEFAULT_CONFIG: RitualConfig = {
  horario: '06:00',
  timezone: 'America/Sao_Paulo',
  ativo: false,
  componentes: {
    codigoDoDia: true,
    praticaPrincipal: true,
    quizilas: true,
    afirmacao: true,
  },
};

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  id: string;
}

function Toggle({ checked, onChange, label, description, id }: ToggleProps) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex flex-col gap-0.5">
        <Label htmlFor={id} className="cursor-pointer text-sm font-medium text-[#F4F5FF]">
          {label}
        </Label>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`
          relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent
          transition-colors duration-200 ease-in-out
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C5CFF] focus-visible:ring-offset-2
          disabled:cursor-not-allowed disabled:opacity-50
          ${checked ? 'bg-[#7C5CFF]' : 'bg-[#26304F]'}
        `}
      >
        <span
          className={`
            pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-lg ring-0
            transition-transform duration-200 ease-in-out
            ${checked ? 'translate-x-4' : 'translate-x-0'}
          `}
        />
      </button>
    </div>
  );
}

export function RitualConfigForm({ initialConfig, onSave }: Props) {
  const config = initialConfig ?? DEFAULT_CONFIG;

  const [horario, setHorario] = useState(config.horario);
  const [horarioError, setHorarioError] = useState<string | null>(null);
  const [ativo, setAtivo] = useState(config.ativo);
  const [componentes, setComponentes] = useState<RitualComponentes>(config.componentes);

  const handleHorarioChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setHorario(value);

    if (value && !isValidTime(value)) {
      setHorarioError('Formato inválido. Use HH:MM (ex: 06:00 ou 18:30)');
    } else {
      setHorarioError(null);
    }
  }, []);

  const handleComponenteChange = useCallback((key: keyof RitualComponentes, value: boolean) => {
    setComponentes((prev: RitualComponentes) => ({ ...prev, [key]: value }));
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();

    // Validação final
    if (!isValidTime(horario)) {
      setHorarioError('Horário inválido. Use o formato HH:MM');
      return;
    }

    onSave({
      horario,
      timezone: config.timezone,
      ativo,
      componentes,
    });
  }, [horario, ativo, componentes, config.timezone, onSave]);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-base font-heading">
          Configurar Ritual Diário
        </CardTitle>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-5">
          {/* ── Horário ── */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="ritual-time" className="text-sm font-medium text-[#F4F5FF]">
                Horário do Ritual
              </Label>
              <span className="text-xs text-muted-foreground">
                {horario || '--:--'}
              </span>
            </div>
            <Input
              id="ritual-time"
              type="time"
              value={horario}
              onChange={handleHorarioChange}
              className={horarioError ? 'border-[#FB5781] focus-visible:ring-[#FB5781]/50' : ''}
              aria-invalid={!!horarioError}
              aria-describedby={horarioError ? 'time-error' : undefined}
            />
            {horarioError && (
              <p id="time-error" className="text-xs text-[#FB5781]" role="alert">
                {horarioError}
              </p>
            )}
          </div>

          {/* ── Toggle Ativar ── */}
          <div className="pt-1 border-t border-[#26304F]/50">
            <Toggle
              id="ritual-enabled"
              label="Ritual Ativo"
              description="Receba notificações e acompanhe seu ritual diário"
              checked={ativo}
              onChange={setAtivo}
            />
          </div>

          {/* ── Componentes ── */}
          <div className="space-y-3 pt-1">
            <p className="text-xs font-semibold text-[#7C5CFF] uppercase tracking-wider">
              Componentes do Ritual
            </p>

            <div className="space-y-3">
              <Toggle
                id="comp-codigo"
                label="Código do Dia"
                description="Hexagrama e Odu do dia"
                checked={componentes.codigoDoDia}
                onChange={(v) => handleComponenteChange('codigoDoDia', v)}
              />

              <Toggle
                id="comp-pratica"
                label="Prática Principal"
                description="Prática integrativa recomendada"
                checked={componentes.praticaPrincipal}
                onChange={(v) => handleComponenteChange('praticaPrincipal', v)}
              />

              <Toggle
                id="comp-quizilas"
                label="Quizilás"
                description="Preceitos e restrições do Odu"
                checked={componentes.quizilas}
                onChange={(v) => handleComponenteChange('quizilas', v)}
              />

              <Toggle
                id="comp-afirmacao"
                label="Afirmação"
                description="Afirmação do Ori para o dia"
                checked={componentes.afirmacao}
                onChange={(v) => handleComponenteChange('afirmacao', v)}
              />
            </div>
          </div>
        </CardContent>

        <div className="flex items-center justify-end gap-2 rounded-b-xl border-t bg-muted/50 p-4">
          <Button
            type="submit"
            variant="golden"
            className="min-w-[100px]"
          >
            {ativo ? 'Salvar' : 'Ativar Ritual'}
          </Button>
        </div>
      </form>
    </Card>
  );
}

export default RitualConfigForm;
