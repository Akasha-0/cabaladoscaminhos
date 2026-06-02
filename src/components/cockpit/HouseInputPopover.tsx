// src/components/cockpit/HouseInputPopover.tsx
// Popover for inputting carta and odu

'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { HOUSES_36 } from '@/lib/divination/house-delegation';
import { oduData, type OduInfo } from '@/lib/ifa/odu-data';
import { LENORMAND_CARDS } from '@/lib/constants/lenormand-cards';
import type { CartaCiganaOption } from '@/stores/cockpit-store';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  Check, 
  X, 
  ChevronRight,
  Sparkles,
  AlertCircle
} from 'lucide-react';

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

export function HouseInputPopover({ casaNumero, onClose, onSave }: HouseInputPopoverProps) {
  const house = HOUSES_36.find(h => h.number === casaNumero);
  
  const [cartaSearch, setCartaSearch] = useState('');
  const [oduSearch, setOduSearch] = useState('');
  const [selectedCarta, setSelectedCarta] = useState<CartaCiganaOption | null>(null);
  const [selectedOdu, setSelectedOdu] = useState<OduInfo | null>(null);
  const [focusedField, setFocusedField] = useState<'carta' | 'odu'>('carta');
  
  const cartaInputRef = useRef<HTMLInputElement>(null);
  
  // Focus carta input on mount
  useEffect(() => {
    cartaInputRef.current?.focus();
  }, []);
  
  // Filter cartas
  const filteredCartas = CARTAS_CIGANAS.filter(c => 
    c.nome.toLowerCase().includes(cartaSearch.toLowerCase()) ||
    String(c.numero).includes(cartaSearch)
  );
  
  // Filter odus
  const filteredOdus = oduData.filter(o => 
    o.nome.toLowerCase().includes(oduSearch.toLowerCase()) ||
    String(o.numero).includes(oduSearch)
  );
  
  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter' && selectedCarta && selectedOdu) {
      onSave(selectedCarta, selectedOdu);
    } else if (e.key === 'Tab' && e.shiftKey) {
      // Shift+Tab - go back to carta field
      e.preventDefault();
      setFocusedField('carta');
    } else if (e.key === 'Tab' && !e.shiftKey) {
      // Tab - advance to odu field
      e.preventDefault();
      setFocusedField('odu');
    }
  }, [onClose, onSave, selectedCarta, selectedOdu]);
  
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
      className="w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl shadow-black/50 overflow-hidden"
      onKeyDown={handleKeyDown}
    >
      {/* Header */}
      <div className="px-4 py-3 bg-slate-800/80 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-medium text-slate-200">
              Casa {String(casaNumero).padStart(2, '0')}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-700/50 text-slate-400 hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          {house?.cartaCigana} · {house?.tema}
        </p>
      </div>
      
      {/* Body */}
      <div className="p-4 space-y-4">
        {/* Carta Input */}
        <div className="space-y-2">
          <label className="text-xs text-slate-400 uppercase tracking-wider">
            Buscar Carta
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              ref={cartaInputRef}
              placeholder="Digite o nome da carta..."
              value={cartaSearch}
              onChange={(e) => setCartaSearch(e.target.value)}
              onFocus={() => setFocusedField('carta')}
              className="pl-9 bg-slate-800/50 border-slate-700/50 focus:border-orange-500/50"
            />
          </div>
          
          {/* Selected Carta */}
          {selectedCarta && (
            <div className="flex items-center gap-2 p-2 bg-orange-500/10 border border-orange-500/30 rounded-lg">
              <Check className="w-4 h-4 text-orange-500" />
              <span className="text-sm text-orange-400 font-medium">
                {String(selectedCarta.numero).padStart(2, '0')}. {selectedCarta.nome}
              </span>
              <button 
                onClick={() => setSelectedCarta(null)}
                className="ml-auto p-1 text-slate-400 hover:text-slate-200"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          
          {/* Carta Suggestions */}
          {!selectedCarta && cartaSearch && (
            <div className="max-h-40 overflow-y-auto bg-slate-800/80 border border-slate-700/50 rounded-lg">
              {filteredCartas.length === 0 ? (
                <div className="p-3 text-sm text-slate-500 text-center">
                  Nenhuma carta encontrada
                </div>
              ) : (
                filteredCartas.map(carta => (
                  <button
                    key={carta.numero}
                    onClick={() => handleCartaSelect(carta)}
                    className={cn(
                      'w-full px-3 py-2 text-left',
                      'hover:bg-slate-700/50 text-slate-300',
                      'flex items-center gap-2'
                    )}
                  >
                    <span className="text-xs text-slate-500 font-mono w-6">
                      {String(carta.numero).padStart(2, '0')}
                    </span>
                    <span className="text-sm">{carta.nome}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
        
        {/* Odu Input */}
        <div className="space-y-2">
          <label className="text-xs text-slate-400 uppercase tracking-wider">
            Selecionar Odu
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              placeholder="Digite o número ou nome do odu..."
              value={oduSearch}
              onChange={(e) => setOduSearch(e.target.value)}
              onFocus={() => setFocusedField('odu')}
              className={cn(
                'pl-9 bg-slate-800/50 border-slate-700/50',
                focusedField === 'odu' ? 'border-indigo-500/50' : ''
              )}
            />
          </div>
          
          {/* Selected Odu */}
          {selectedOdu && (
            <div className="flex items-center gap-2 p-2 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
              <Check className="w-4 h-4 text-indigo-500" />
              <div>
                <span className="text-sm text-indigo-400 font-medium">
                  Odu {selectedOdu.numero} - {selectedOdu.nome}
                </span>
                <div className="flex gap-1 mt-1">
                  {selectedOdu.orixas.map(orixa => (
                    <Badge key={orixa} variant="outline" className="text-[10px] bg-indigo-500/10 border-indigo-500/20 text-indigo-300">
                      {orixa}
                    </Badge>
                  ))}
                </div>
              </div>
              <button 
                onClick={() => setSelectedOdu(null)}
                className="ml-auto p-1 text-slate-400 hover:text-slate-200"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          
          {/* Odu Suggestions */}
          {!selectedOdu && oduSearch && (
            <div className="max-h-40 overflow-y-auto bg-slate-800/80 border border-slate-700/50 rounded-lg">
              {filteredOdus.length === 0 ? (
                <div className="p-3 text-sm text-slate-500 text-center">
                  Nenhum odu encontrado
                </div>
              ) : (
                filteredOdus.map(odu => (
                  <button
                    key={odu.numero}
                    onClick={() => handleOduSelect(odu)}
                    className={cn(
                      'w-full px-3 py-2 text-left',
                      'hover:bg-slate-700/50 text-slate-300',
                      'flex items-center gap-2'
                    )}
                  >
                    <span className="text-xs text-indigo-500 font-mono w-6">
                      {odu.numero}
                    </span>
                    <span className="text-sm">{odu.nome}</span>
                    <span className="text-xs text-slate-500 ml-auto">
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
      <div className="px-4 py-3 bg-slate-800/50 border-t border-slate-700/50">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Enter para confirmar · Esc para cancelar</span>
          {selectedCarta && selectedOdu ? (
            <Button 
              size="sm" 
              variant="golden"
              onClick={() => onSave(selectedCarta, selectedOdu)}
              className="h-7"
            >
              <Sparkles className="w-3 h-3 mr-1" />
              Preencher
            </Button>
          ) : (
            <span className="flex items-center gap-1 text-orange-500/70">
              <AlertCircle className="w-3 h-3" />
              Selecione carta e odu
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default HouseInputPopover;