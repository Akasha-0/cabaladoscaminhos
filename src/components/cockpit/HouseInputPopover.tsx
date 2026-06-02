// src/components/cockpit/HouseInputPopover.tsx
// Popover for inputting carta and odu

'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { HOUSES_36 } from '@/lib/divination/house-delegation';
import { oduData, type OduInfo } from '@/lib/ifa/odu-data';
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

// 36 Cartas Ciganas data
const CARTAS_CIGANAS: CartaCiganaOption[] = [
  { numero: 1, nome: 'O Cavaleiro', significado: 'Ação, viagem, notícia rápida' },
  { numero: 2, nome: 'O Trevo', significado: 'Esperança, sorte, oportunidade' },
  { numero: 3, nome: 'A Nave', significado: 'Viagem, mudança, expansão' },
  { numero: 4, nome: 'A Casa', significado: 'Família, lar, estabilidade' },
  { numero: 5, nome: 'A Árvore', significado: 'Crescimento, saúde, natureza' },
  { numero: 6, nome: 'As Nuvens', significado: 'Dúvidas, confusão, incerteza' },
  { numero: 7, nome: 'A Serpente', significado: 'Inveja, sabedoria, transformação' },
  { numero: 8, nome: 'O Caixão', significado: 'Transformação, fim, morte simbólica' },
  { numero: 9, nome: 'O Buquê', significado: 'Surpresas, dons, beleza' },
  { numero: 10, nome: 'A Foice', significado: 'Corte, decisões, maturidade' },
  { numero: 11, nome: 'O Chicote', significado: 'Conflitos, raiva, disputas' },
  { numero: 12, nome: 'Os Pássaros', significado: 'Comunicação, notícias, palavras' },
  { numero: 13, nome: 'O Cão', significado: 'Lealdade, amizade, proteção' },
  { numero: 14, nome: 'O Burro', significado: 'Teimosia, rotina, perseverança' },
  { numero: 15, nome: 'O Coelho', significado: 'Medo, cautela, prudência' },
  { numero: 16, nome: 'A Estrela', significado: 'Esperança, inspiração, direção' },
  { numero: 17, nome: 'O Veado', significado: 'Nobreza, metas, crescimento' },
  { numero: 18, nome: 'A Cegonha', significado: 'Mudanças, transformações, novos inícios' },
  { numero: 19, nome: 'O Cachorro', significado: 'Companheirismo, fidelidade, confiança' },
  { numero: 20, nome: 'O Torreão', significado: 'Prisão, limite, estabilidade' },
  { numero: 21, nome: 'O Gato', significado: 'Independência, astúcia, autonomia' },
  { numero: 22, nome: 'O Rato', significado: 'Inimizade oculta, problemas menores' },
  { numero: 23, nome: 'A Rã', significado: 'Prosperidade, fertilidade, abundância' },
  { numero: 24, nome: 'A Borboleta', significado: 'Felicidade, leveza,transformação leve' },
  { numero: 25, nome: 'A Flor', significado: 'Amor, beleza, natureza' },
  { numero: 26, nome: 'A Espada', significado: 'Conflito, decisão, justiça' },
  { numero: 27, nome: 'A Áncora', significado: 'Estabilidade, segurança,esperança' },
  { numero: 28, nome: 'O Anjo', significado: 'Proteção divina, espiritualidade' },
  { numero: 29, nome: 'O Bouquet', significado: 'Celebração, presentes, alegrias' },
  { numero: 30, nome: 'A Lua', significado: 'Intuição, emoções, inconsciente' },
  { numero: 31, nome: 'O Sol', significado: 'Sucesso, clareza, vitalidade' },
  { numero: 32, nome: 'A Montanha', significado: 'Obstáculos, perseverança, desafios' },
  { numero: 33, nome: 'Os Maridos', significado: 'Aliança, sociedade, casamento' },
  { numero: 34, nome: 'O Corvo', significado: 'Mágoa, traição, segredo revelado' },
  { numero: 35, nome: 'As Crianças', significado: 'Inocência, novo começo, pureza' },
  { numero: 36, nome: 'A苹果 / Final', significado: 'Conclusão, fim de ciclo, renovação' },
];

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