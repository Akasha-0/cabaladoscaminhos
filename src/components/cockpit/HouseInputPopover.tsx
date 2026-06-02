// src/components/cockpit/HouseInputPopover.tsx
// Popover for inputting carta and odu (Doc 05 §4.4)
// Tokens Ramiro v2: laranja (carta) + royal (Odu) — dual identity.
// AD-17.2: Filter out already-placed cards to enforce uniqueness.

'use client';

import { Search, Check, X, ChevronRight, Sparkles, AlertCircle } from 'lucide-react';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LENORMAND_CARDS } from '@/lib/constants/lenormand-cards';
import { HOUSES_36 } from '@/lib/divination/house-delegation';
import { oduData, type OduInfo } from '@/lib/ifa/odu-data';
import { cn } from '@/lib/utils';
import { useCockpitStore, type CartaCiganaOption } from '@/stores/cockpit-store';

interface HouseInputPopoverProps {
  casaNumero: number;
  onClose: () => void;
  onSave: (carta: CartaCiganaOption, odu: OduInfo) => void;
  anchorRef?: React.RefObject<HTMLElement>;
}

// As 36 Cartas Ciganas — derivadas da fonte canônica única (Doc 15 / Doc 16 AD-02).
// NÃO redeclarar nomes aqui: a lista canônica (lenormand-cards.ts) é a única verdade,
// garantindo que o nome escolhido no popover bata com o correlation-map e o roteador de Q&A.
const CARTAS_CIGANAS: CartaCiganaOption[] = LENORMAND_CARDS.map((carta) => ({
  numero: carta.id,
  nome: carta.name,
  significado: carta.keywords,
}));

// fallow-ignore-next-line complexity
export function HouseInputPopover({ casaNumero, onClose, onSave }: HouseInputPopoverProps) {
  const house = HOUSES_36.find((h) => h.number === casaNumero);

  // AD-17.2: Get used cards from store to filter available cards
  const placedCards = useCockpitStore((s) => s.placedCards);
  const remainingCount = 36 - placedCards.size;

  const [cartaSearch, setCartaSearch] = useState('');
  const [oduSearch, setOduSearch] = useState('');
  const [selectedCarta, setSelectedCarta] = useState<CartaCiganaOption | null>(null);
  const [selectedOdu, setSelectedOdu] = useState<OduInfo | null>(null);
  const [focusedField, setFocusedField] = useState<'carta' | 'odu'>('carta');

  const cartaInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    cartaInputRef.current?.focus();
  }, []);

  // AD-17.2: Filter out already-placed cards, but allow the currently selected one
  // (in case user is editing a house that already has a card)
  const filteredCartas = CARTAS_CIGANAS.filter(
    (c) =>
      // Card must match search
      (c.nome.toLowerCase().includes(cartaSearch.toLowerCase()) ||
        String(c.numero).includes(cartaSearch)) &&
      // AD-17.2: Card is not already placed OR it's the currently selected card
      (!placedCards.has(c.numero) || c.numero === selectedCarta?.numero)
  );

  // AD-17.2: Count available cards for display
  const availableCardCount = CARTAS_CIGANAS.filter(
    (c) => !placedCards.has(c.numero) || c.numero === selectedCarta?.numero
  ).length;

  const filteredOdus = oduData.filter(
    (o) =>
      o.nome.toLowerCase().includes(oduSearch.toLowerCase()) || String(o.numero).includes(oduSearch)
  );

  const handleKeyDown = useCallback(
// fallow-ignore-next-line complexity
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Enter' && selectedCarta && selectedOdu) {
        onSave(selectedCarta, selectedOdu);
      } else if (e.key === 'Tab' && e.shiftKey) {
        e.preventDefault();
        setFocusedField('carta');
      } else if (e.key === 'Tab' && !e.shiftKey) {
        e.preventDefault();
        setFocusedField('odu');
      }
    },
    [onClose, onSave, selectedCarta, selectedOdu]
  );

  const handleCartaSelect = (carta: CartaCiganaOption) => {
    setSelectedCarta(carta);
    setFocusedField('odu');
  };

  const handleOduSelect = (odu: OduInfo) => {
    setSelectedOdu(odu);
    if (selectedCarta) {
      onSave(selectedCarta, odu);
    }
  };

  return (
    <div
      className="w-80 bg-popover border border-border rounded-xl shadow-2xl shadow-black/50 overflow-hidden"
      onKeyDown={handleKeyDown}
    >
      {/* Header */}
      <div className="px-4 py-3 bg-card/80 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground/90 font-cinzel">
              Casa {String(casaNumero).padStart(2, '0')}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
            aria-label="Fechar popover"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground/70 mt-1">
          {house?.cartaCigana} · {house?.tema}
        </p>
        {/* AD-17.2: Show remaining cards count */}
        <div className="mt-1 flex items-center gap-1 text-xs text-primary/80">
          <span className="font-mono">{String(availableCardCount).padStart(2, '0')}</span>
          <span className="text-muted-foreground/60">cartas disponíveis</span>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-4">
        {/* Carta Input (laranja) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs text-muted-foreground uppercase tracking-wider">
              Buscar Carta
            </label>
            {/* AD-17.2: Remaining cards badge */}
            <span className="text-xs text-muted-foreground/60">
              {remainingCount} restantes
            </span>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/70" />
            <Input
              ref={cartaInputRef}
              placeholder="Digite o nome da carta..."
              value={cartaSearch}
              onChange={(e) => setCartaSearch(e.target.value)}
              onFocus={() => setFocusedField('carta')}
              className="pl-9 bg-muted/50 border-border/50 focus:border-primary/50"
            />
          </div>

          {selectedCarta && (
            <div className="flex items-center gap-2 p-2 bg-primary/10 border border-primary/30 rounded-lg">
              <Check className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium font-cinzel">
                {String(selectedCarta.numero).padStart(2, '0')}. {selectedCarta.nome}
              </span>
              <button
                onClick={() => setSelectedCarta(null)}
                className="ml-auto p-1 text-muted-foreground hover:text-foreground"
                aria-label="Remover carta"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {!selectedCarta && cartaSearch && (
            <div className="max-h-40 overflow-y-auto bg-muted/80 border border-border/50 rounded-lg">
              {filteredCartas.length === 0 ? (
                <div className="p-3 text-sm text-muted-foreground/70 text-center">
                  Nenhuma carta disponível
                </div>
              ) : (
                filteredCartas.map((carta) => (
                  <button
                    key={carta.numero}
                    onClick={() => handleCartaSelect(carta)}
                    className={cn(
                      'w-full px-3 py-2 text-left',
                      'hover:bg-muted text-foreground/80',
                      'flex items-center gap-2'
                    )}
                  >
                    <span className="text-xs text-muted-foreground/70 font-mono w-6">
                      {String(carta.numero).padStart(2, '0')}
                    </span>
                    <span className="text-sm">{carta.nome}</span>
                  </button>
                ))
              )}
            </div>
          )}

          {/* AD-17.2: Show "no cards available" when search is empty and all cards are used */}
          {!cartaSearch && placedCards.size >= 36 && (
            <div className="text-xs text-primary/70 text-center py-2">
              Todas as 36 cartas já foram colocadas
            </div>
          )}
        </div>

        {/* Odu Input (royal) */}
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground uppercase tracking-wider">
            Selecionar Odu
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/70" />
            <Input
              placeholder="Digite o número ou nome do odu..."
              value={oduSearch}
              onChange={(e) => setOduSearch(e.target.value)}
              onFocus={() => setFocusedField('odu')}
              className={cn(
                'pl-9 bg-muted/50 border-border/50',
                focusedField === 'odu' ? 'border-secondary/50' : ''
              )}
            />
          </div>

          {selectedOdu && (
            <div className="flex items-center gap-2 p-2 bg-secondary/10 border border-secondary/30 rounded-lg">
              <Check className="w-4 h-4 text-secondary" />
              <div>
                <span className="text-sm text-secondary font-medium">
                  Odu {selectedOdu.numero} - {selectedOdu.nome}
                </span>
                <div className="flex gap-1 mt-1">
                  {selectedOdu.orixas.map((orixa) => (
                    <Badge
                      key={orixa}
                      variant="outline"
                      className="text-[10px] bg-secondary/10 border-secondary/20 text-secondary/80"
                    >
                      {orixa}
                    </Badge>
                  ))}
                </div>
              </div>
              <button
                onClick={() => setSelectedOdu(null)}
                className="ml-auto p-1 text-muted-foreground hover:text-foreground"
                aria-label="Remover Odu"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {!selectedOdu && oduSearch && (
            <div className="max-h-40 overflow-y-auto bg-muted/80 border border-border/50 rounded-lg">
              {filteredOdus.length === 0 ? (
                <div className="p-3 text-sm text-muted-foreground/70 text-center">
                  Nenhum odu encontrado
                </div>
              ) : (
                filteredOdus.map((odu) => (
                  <button
                    key={odu.numero}
                    onClick={() => handleOduSelect(odu)}
                    className={cn(
                      'w-full px-3 py-2 text-left',
                      'hover:bg-muted text-foreground/80',
                      'flex items-center gap-2'
                    )}
                  >
                    <span className="text-xs text-secondary font-mono w-6">{odu.numero}</span>
                    <span className="text-sm">{odu.nome}</span>
                    <span className="text-xs text-muted-foreground/70 ml-auto">
                      {odu.orixas[0]}
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-card/50 border-t border-border/50">
        <div className="flex items-center justify-between text-xs text-muted-foreground/70">
          <span>Enter para confirmar · Esc para cancelar</span>
          {selectedCarta && selectedOdu ? (
            <Button
              size="sm"
              variant="spiritual"
              onClick={() => onSave(selectedCarta, selectedOdu)}
              className="h-7"
            >
              <Sparkles className="w-3 h-3 mr-1" />
              Preencher
            </Button>
          ) : (
            <span className="flex items-center gap-1 text-primary/70">
              <AlertCircle className="w-3 h-3" />
              Selecione carta e odu
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
