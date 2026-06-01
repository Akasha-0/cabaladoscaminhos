'use client';

// ============================================================
// CASA EDIT MODAL - Cabala Dos Caminhos
// Uses existing mesa-real-data
// ============================================================

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
  CASAS_MESA_REAL, 
  CARTAS_CIGANAS, 
  ODUS_IFA, 
  getCasaPorNumero,
  getCartaPorNumero,
  getOduPorNumero,
} from '@/lib/lenormand/mesa-real-data';

interface CasaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  casaNumero: number | null;
  matrixData: Record<number, { carta?: number; odu?: number }>;
  onSave: (casaNumero: number, data: { carta: number; odu?: number }) => void;
  onClear?: (casaNumero: number) => void;
}

// ============================================================
// MODAL COMPONENT
// ============================================================

export function CasaModal({
  open,
  onOpenChange,
  casaNumero,
  matrixData,
  onSave,
  onClear,
}: CasaModalProps) {
  const [carta, setCarta] = useState<number | null>(null);
  const [odu, setOdu] = useState<number | null>(null);

  // Get casa data
  const casaData = casaNumero ? getCasaPorNumero(casaNumero) : null;

  // Load current data when modal opens
  useEffect(() => {
    if (open && casaNumero) {
      const current = matrixData[casaNumero];
      setCarta(current?.carta || null);
      setOdu(current?.odu || null);
    }
  }, [open, casaNumero, matrixData]);

  const onSubmit = () => {
    if (casaNumero && carta) {
      onSave(casaNumero, { carta, odu: odu || undefined });
      onOpenChange(false);
    }
  };

  const onClearCasa = () => {
    if (casaNumero && onClear) {
      onClear(casaNumero);
      setCarta(null);
      setOdu(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {casaData
              ? `Casa ${casaNumero}: ${casaData.name}`
              : `Casa ${casaNumero}`}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Casa Info */}
          {casaData && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                {casaData.meaning}
              </p>
              <p className="text-xs mt-2 text-muted-foreground">
                Planeta: {casaData.associatedPlanet} | Elemento: {casaData.element}
              </p>
            </div>
          )}

          {/* Carta Select */}
          <div className="space-y-2">
            <Label htmlFor="carta">Carta Cigana *</Label>
            <Select
              value={carta?.toString() || ''}
              onValueChange={(v) => setCarta(parseInt(v, 10))}
            >
              <SelectTrigger id="carta">
                <SelectValue placeholder="Selecione a carta (1-36)" />
              </SelectTrigger>
              <SelectContent>
                {CARTAS_CIGANAS.map((c) => (
                  <SelectItem key={c.number} value={c.number.toString()}>
                    {c.number} - {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Odu Select */}
          <div className="space-y-2">
            <Label htmlFor="odu">Odú</Label>
            <Select
              value={odu?.toString() || ''}
              onValueChange={(v) => setOdu(parseInt(v, 10))}
            >
              <SelectTrigger id="odu">
                <SelectValue placeholder="Selecione o odú (opcional)" />
              </SelectTrigger>
              <SelectContent>
                {ODUS_IFA.map((o) => (
                  <SelectItem key={o.numero} value={o.numero.toString()}>
                    {o.numero} - {o.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Odú é opcional. Se não for tirado, deixe em branco.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClearCasa}
            disabled={!casaNumero}
          >
            Limpar
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={onSubmit} disabled={!carta}>
              Salvar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CasaModal;
